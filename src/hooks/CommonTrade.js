import React from "react";
import useCommon from "../redux/volatiles/common"
import { toast } from "../components/Toast/Toast";
import { useDispatch, useSelector } from "react-redux";
import ButtonPrimary from "../components/Button/Button";
import { ExchangeService } from "../services/ExchangeService";
import { ContractServices } from "../services/ContractServices";
import { MAIN_CONTRACT_LIST, USD, WETH } from "../assets/tokens";
import { ADDRESS, LIQUIDITY_PROVIDER_FEE, MINIMUM_LIQUIDITY, STR, T_TYPE, VAL } from "../constant";
import { addTransaction, searchTokenByNameOrAddress, startLoading, stopLoading } from "../redux/actions";
import { hasVal, isBnb, isDefined, isNonZero, rDefined, rEq, tgl, toBgFix, toDec, toFull, zero } from "../services/utils/global";
import { isIP_A, isIP_B, togIP } from "../services/utils/trading";

const useCommonTrade = (props) => {
    const dsp = useDispatch();
    const common = useCommon(s => s);
    const P = useSelector(s => s.persist);

    const TC = ContractServices.TokenContract;


    const handleShow1 = () => common.setShow1(!0);
    const handleClose1 = () => common.setShow1(!1);
    const settingClose = () => common.setSettingShow(!1);
    const handleCloseRecent = () => common.setShowRecent(!1);
    const settingHandleShow = () => common.setSettingShow(!0);

    const onHandleOpenModal = (tt) => {
        console.log('dropdown:', tt);
        if (!P.isConnected) {
        return toast.error("Connect wallet first!");
        }
        common.setShow(!0);
        let i = tt-1 ? 2 : 1;
        common.setModalCurrency(!0);
        common.setTokenType(tt);
        common.setFilteredTokenList(P.tokenList);
        common.setSelectedCurrency(common[`token${i}Currency`]);
    };

    const onHandleSelectCurrency = async (token, selected) => {
        if (!P.isConnected) {
            return toast.error("Connect wallet first!");
        }
        common.setSearch('');
        handleClose();
        
        let i = selected-1 ? 1 : 2, addr = [], bal = 0;
        const { address, symbol } = token;
        console.log('[select  currency] token:', token);
        addr.push(address);
        dsp(startLoading())
        if (isBnb(address)) bal = await ContractServices.getBNBBalance(P.priAccount);
        else {
            TC.setTo(address);
            bal = await TC.balanceOf(P.priAccount);
        }
        common.setTokenCurrency(symbol, selected);
        common.setToken(token, selected);
        common.setTokenBalance(bal, selected);
        common.setFilteredTokenList(P.tokenList);
        common.setModalCurrency(!common.modalCurrency);

        addr.push(common[`token${i}`].address);
        if(rEq(...addr)) {
            console.log('tokens cant be same!');
            dsp(stopLoading())
            return toast.error('please select dissimilar tokens!');
        }
        if(selected === T_TYPE.B) { let t = addr[1]; addr[1] = addr[0]; addr[0] = t; }
        
        if (rDefined(...addr)) {
            let cPair = ADDRESS.ZERO;
            if (isBnb(addr[0])) {
                addr[0] = WETH; //WETH
                cPair = await ExchangeService.getPair(...addr);
                common.setHasPriceImpact(!1);
            } else if (isBnb(addr[1])) {
                addr[1] = WETH; //WETH
                cPair = await ExchangeService.getPair(...addr);
                common.setHasPriceImpact(!1);
            } else {
                cPair = await ExchangeService.getPair(...addr);
                common.setHasPriceImpact(!0);
            }

            if (isNonZero(cPair)) {
                common.setCurrentPair(cPair);
                TC.setTo(addr[0]);
                const dec1 = await TC.decimals();
                TC.setTo(addr[1]);
                const dec2 = await TC.decimals();
                const reserves = await ExchangeService.getReserves(cPair);
                TC.setTo(cPair);
                const lpTokenBalance = await TC.balanceOf(P.priAccount);
                calcLiqPercentForSelCurrency(reserves, dec1, dec2, lpTokenBalance, cPair);
                common.setIsFirstLP(!1);
                common.showPoolShare(!0);
                common.setLpTokenBalance(lpTokenBalance);
            } else {
                common.setCurrentPair('');
                common.setIsFirstLP(!0);
                common.showPoolShare(!0);
                common.setLpTokenBalance(0);
                console.log('pair doesnt exist:', cPair);
                toast.error('pair doesn\'t exist!');
            }
        }
        dsp(stopLoading())
    };

    const swapHelper = async (amt, addr, tt) => {
        let addrForPriceImpact = [], res=[], tPair = [addr[tt-1], addr[togIP(tt)-1]], tAddr;
        
        if (isBnb(addr[0])) addr[0] = WETH;
        if (isBnb(addr[1])) addr[1] = WETH;

        let pairAddr = await ExchangeService.getPair(...tPair);
        if (pairAddr || (tAddr = await checkPairWithBNBOrUSDT(...tPair))) {
            res = await ExchangeService[`getAmounts${isIP_A() ? 'Out' : 'In'}`](amt, addr);
            addrForPriceImpact = pairAddr ? addr.map(a => a) : tAddr.map(p => p);
            !pairAddr && common.setHasPriceImpact(!0);
        }
        let finalAmount = '';
        if (res.length) {
            common.setExact(tt);
            finalAmount = Number(res[isIP_A() ? res.length - 1 : 0].toFixed(8));
            const ratio = Number(amt) / finalAmount;
            common.setSharePoolValue(ratio.toFixed(10));
            let out = toBgFix(toFull(finalAmount, common[`token${togIP(tt)}`].decimals));
            common.setMinReceived(Number(out) - (Number(out) * P.slippage / 100));
            calculatePriceImpact(amt, addrForPriceImpact);
        }
        return {addr: [...addrForPriceImpact], amt2: finalAmount};
        
    }

    const liquidityHelper = async (amount, tkn) => {
        let tAddr = tkn.address;
        if (isBnb(tkn.address)) tAddr = WETH;
        let p = common.currentPair;
        let amt2 = '';
        if (p) {
            const tk0 = await ExchangeService.getTokenZero(p);
            const tk1 = await ExchangeService.getTokenOne(p);
            const reserves = await ExchangeService.getReserves(p);
            TC.setTo(tk0);
            let dec = [];
            dec.push(await TC.decimals());
            TC.setTo(tk1);
            dec.push(await TC.decimals());
            
            if (rDefined(tk0, reserves)) {
                let i = rEq(tAddr, tk0) ? [1,0] : [0,1];
                amt2 = (toDec(amount * reserves[i[0]], dec[i[0]]) / toDec(reserves[i[1]], dec[i[1]])).toFixed(5); 
            } else return toast.error('pair doesn\'t exist');
        }
        return amt2;
    }

    const hasBalance = async (amount, addr) => {
        TC.setTo(addr);
        let b = await TC.balanceOf(P.priAccount);
        return b >= amount;
    }

    const handleInput = async (amount, tt, isSwap) => {
        console.log('handling token value:', amount, tt, common[`token${togIP(tt)}Currency`]);
        common.setFetching(!0);
        if(!hasVal(amount)) {
            common.setBtnText('');
            common.setFetching(!1);
            return common.setTokenValue(amount, T_TYPE.AB);
        }
        if (rEq(common[`token${togIP(tt)}Currency`], STR.SEL_TKN)) {
            common.setTokenValue(amount, tt);
            common.setTokenValue('', togIP(tt));
            common.setFetching(!1);
            return common.setBtnText(STR.SEL_TKN);
        }
        common.setTokenValue(amount, tt);
        let amt = [amount],
            i = togIP(tt),
            tkn = common[`token${tt}`],
            tkn2 = common[`token${togIP(tt)}`],
            // check token 1 allowance in both cases (swap and addLiquidity)
            apvd = await checkForAllowance(amount, tt), 
            addr = [common.token1.address, common.token2.address]; 
        
        const bal = await checkBalance(tkn.address);
        if (amount > bal) {
            common.setDisabled(!0);
            common.setBtnText(`Insufficient ${tkn.symbol} balance`);
            common.setFetching(!1);
            return;
        }
        common.setBtnText('');
        common.setDisabled(!1);
        let d = {};
        if (apvd && rDefined(tkn.address, common[`token${i}`].address)) {
            if(isSwap) {
                d = await swapHelper(amount, [...addr], tt);
                addr = d.addr;
                amt.push(d.amt2);
            } else {
                let a = await liquidityHelper(amount, tkn);
                amt.push(a);
                apvd = await checkForAllowance(a, togIP(tt));
            }
        }
        console.log('d:', d);
        
        if(isIP_B(tt) && await hasBalance(amt[1], tkn2.address)) {
            common.setDisabled(!0);
            common.setTokenValue(amt[1], 1);
            common.setBtnText(`Insufficient ${tkn2.symbol} balance`);
            common.setFetching(!1);
            return;
        }
        common.setTokenValue(amt[1], togIP(tt));
        if(isIP_B(tt)) { let t = amt[1]; amt[1] = amt[0]; amt[0] = t; }
        if (rDefined(...addr)) {
            let cPair;
            if (isBnb(addr[0])) {
                addr[0] = WETH;
                cPair = await ExchangeService.getPair(...addr);
            } else if (isBnb(addr[1])) {
                addr[1] = WETH; //WETH
                cPair = await ExchangeService.getPair(...addr);
            } else cPair = await ExchangeService.getPair(...addr);
            if (isNonZero(cPair)) {
                const reserves = await ExchangeService.getReserves(cPair);
                const ratio = await calculateLiquidityPercentage(reserves, ...amt);
                TC.setTo(cPair);
                common.setDisabled(!1);
                common.setIsFirstLP(!1);
                common.setCurrentPair(cPair);
                common.setSharePoolValue(ratio);
                common.setLpTokenBalance(await TC.balanceOf(P.priAccount));
            } else {
                common.setDisabled(!0);
                common.setIsFirstLP(!0);
                common.setCurrentPair('');
                common.setLpTokenBalance(0);
            }
            common.showPoolShare(!0);
        }
        common.setFetching(!1);
    };

    const handleTokenApproval = async (tt) => {
        const acc = await ContractServices.getDefaultAccount();
        if (isDefined(acc) && !rEq(acc, P.priAccount)) 
            return !!toast.error("Wallet address doesn`t match!");
        if (common.isApprovalConfirmed)
            return !!toast.info("Token approval is processing");
        
        let tkn = common[`token${tt}`];
        try {
            dsp(startLoading());
            TC.setTo(tkn.address);
            const r = await TC.approve(MAIN_CONTRACT_LIST.router.address, VAL.MAX_256);
            if (rEq(4001, r.code)) toast.error("User denied transaction signature.");
            else {
                common.setTokenApproved(!0, tt);
                let data = {message: `Approve`, tx: r.transactionHash};
                data.message = `Approve ${tkn.symbol}`;
                dsp(addTransaction(data));
            }
        } catch (err) {
            console.log(err);
            toast.error("Transaction Reverted!");
        } finally {
            dsp(stopLoading());
        }
    };

    const handleMaxBalance = async tt => {
        if (!P.isConnected) return toast.error('Connect wallet first!');
        let addr = common.token1.address;
            // .002 BNB is reserved for saving gas fee 
        if (isBnb(addr)) handleInput(await ContractServices.getBNBBalance(P.priAccount) - 0.1, tt, !1);
        // __ amount of particular token must be reserved for saving -needs to be fixed
        else {
            TC.setTo(addr);
            handleInput(await TC.balanceOf(P.priAccount), tt, !1);
        }
        common.setIsMax(!1);
    }

    const getApprovalButton = tt => {
        console.log('getting approval button for tt:', tt);
        return !common[`token${tt}Approved`] ? (
            <div className="col button_unlockWallet">
                <ButtonPrimary
                className="swapBtn"
                title={`Approve ${common[`token${tt}`].symbol}`}
                disabled={common.isApprovalConfirmed}
                onClick={() => handleTokenApproval(tt)}
                />
            </div>
        ) : null;
    }
    
    const checkForAllowance = async (amount, tt) => {
        if(!P.isConnected) return !!toast.error("Connect wallet first!");
        let tkn = common[`token${tt}`];
        if (!isBnb(tkn.address)) {
            TC.setTo(tkn.address);
            console.log('checking allowance');
            let allowance = await TC.allowanceOf(MAIN_CONTRACT_LIST.router.address);
            console.log('allowance:', allowance);
            allowance = toDec(allowance, tkn.decimals);
            if (amount > allowance) {
                common.setTokenApproved(!1, tt);
                return !1;
            }
        }
        common.setDisabled(!0);
        common.setTokenApproved(!0, tt);
        return !0;
    };

    const checkBalance = async addr => {
        if (isBnb(addr)) return await ContractServices.getBNBBalance(P.priAccount);
        else {
            TC.setTo(addr)
            return await TC.balanceOf(P.priAccount);
        } 
    }

    const handleBalance = async _ => {
        let ex = common.exact;
        const addr = common[`token${tgl(ex)}`].address;
        common.setTokenBalance(await checkBalance(addr), ex);
    }

    async function calculateLiquidityPercentage(reserve, amount0, amount1) {
        const r0 = toDec(reserve._reserve0, common.token1.decimals);
        const r1 = toDec(reserve._reserve1, common.token2.decimals);
        TC.setTo(common.currentPair);
        let _totalSupply = await TC.totalSupply();
        let ratio = common.lpTokenBalance / _totalSupply;
        const t0 = (ratio * r0).toFixed(5);
        const t1 = (ratio * r1).toFixed(5);
        common.setTokenDeposit(t0, T_TYPE.A);
        common.setTokenDeposit(t1, T_TYPE.B);
        
        let liquidity = zero(_totalSupply) ? 
            Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY :
            Math.min((amount0 * _totalSupply) / r0,(amount1 * _totalSupply) / r1);
            
        liquidity = ((liquidity / (_totalSupply + liquidity)) * 100).toFixed(2);
        return zero(_totalSupply) ? 100 : liquidity;
    };

    const calcLiqPercentForSelCurrency = async (reserve, dec1, dec2, lpBalance, cPair) => {
        const r0 = toDec(reserve._reserve0, dec1);
        const r1 = toDec(reserve._reserve1, dec2);
        TC.setTo(cPair);
        let _totalSupply = await TC.totalSupply(cPair);
        let ratio = lpBalance / _totalSupply;
        const t0 = (ratio * r0).toFixed(5);
        const t1 = (ratio * r1).toFixed(5);
        common.setTokenDeposit(t0, T_TYPE.A);
        common.setTokenDeposit(t1, T_TYPE.B);
    };

    const checkPairWithBNBOrUSDT = async tkn => {
        let p1 = await ExchangeService.getPair(tkn[0], WETH);
        let p2 = await ExchangeService.getPair(tkn[1], WETH);
        if (isNonZero(p1) && isNonZero(p2)) {
            return [tkn[0], WETH, tkn[1]];
        }
        p1 = await ExchangeService.getPair(tkn[0], USD);
        p2 = await ExchangeService.getPair(tkn[1], USD);
        if (isNonZero(p1) && isNonZero(p2)) return [tkn[0], USD, tkn[1]];
        return !1;
    }
    const calculatePriceImpact = async (amt, addrForPriceImpact) => {
        let pImp, calPriceImpact;

        const cPair = await ExchangeService.getPair(...addrForPriceImpact);
        const reserve = await ExchangeService.getReserves(cPair);
        const t0 = await ExchangeService.getTokenZero(cPair);
        const t1 = await ExchangeService.getTokenOne(cPair);
        TC.setTo(t0);
        const dec0 = await TC.decimals();
        TC.setTo(t1);
        const dec1 = await TC.decimals();
        if (rEq(t0, addrForPriceImpact[0])) {
            const res = Number(reserve[0]) / (10 ** dec0);

            calPriceImpact = (amt / res) * 100;
            pImp = (calPriceImpact - (calPriceImpact * LIQUIDITY_PROVIDER_FEE) / 100);
            if (common.hasPriceImpact) Number(pImp * 2);
            common.setPriceImpact(pImp.toFixed(5));
        }
        if (rEq(t1, addrForPriceImpact[1])) {
            const res = Number(reserve[1]) / (10 ** dec1);

            calPriceImpact = (amt / res) * 100;
            pImp = (calPriceImpact - (calPriceImpact * LIQUIDITY_PROVIDER_FEE) / 100);
            if (common.hasPriceImpact) pImp = Number(pImp * 2);
            common.setPriceImpact(pImp.toFixed(5));
        }
    }

    const handleSearchToken = async d => {
        try {
            common.setFilteredTokenList(dsp(searchTokenByNameOrAddress(d)));
        } catch (e) {
            toast.error("Something went wrong!");
        }
    }

    const handleClose = _ => common.setShow(!1);

    const cTrade = {
        handleClose,
        handleInput,
        handleShow1,
        checkBalance,
        settingClose,
        handleClose1,
        handleBalance,
        handleMaxBalance,
        handleSearchToken,
        handleCloseRecent,
        onHandleOpenModal,
        checkForAllowance,
        settingHandleShow,
        getApprovalButton,
        handleTokenApproval,
        calculatePriceImpact,
        onHandleSelectCurrency,
        checkPairWithBNBOrUSDT,
    }

    return cTrade;

}

export default useCommonTrade;