import React from "react";
import useCommon from "../redux/volatiles/common"
import { toast } from "../components/Toast/Toast";
import { useDispatch, useSelector } from "react-redux";
import ButtonPrimary from "../components/Button/Button";
import { ExchangeService } from "../services/ExchangeService";
import { ContractServices } from "../services/ContractServices";
import { MAIN_CONTRACT_LIST} from "../assets/tokens";
import { ADDRESS, LIQUIDITY_PROVIDER_FEE, MINIMUM_LIQUIDITY, STR, T_TYPE, VAL } from "../services/constant";
import { addTransaction, searchTokenByNameOrAddress, startLoading, stopLoading } from "../redux/actions";
import { hasVal, isAddr, isDefined, isNonZero, rDefined, rEq, tgl, toBgFix, toDec, toFull, zero } from "../services/utils/global";
import { isIP_A, isIP_B, togIP, isEth, try2weth } from "../services/utils/trading";

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
        try {
            await _onHandleSelectCurrency(token, selected);
        } catch(e) {
            console.log('BIG ERROR:', e);
        }
    }

    const _onHandleSelectCurrency = async (token, selected) => {
        if (!P.isConnected) return toast.error("Connect wallet first!");
        common.setSearch('');
        handleClose();
        dsp(startLoading())
        let tknOther = common[`token${togIP(selected)}`], addr = [], bal = 0;
        const symbol = token.sym;
        addr.push(try2weth(token.addr));
        tknOther.addr && addr.push(try2weth(tknOther.addr));
        if(addr.length === 1) return dsp(stopLoading())
        if(rEq(...addr)) {
            console.log('tokens cant be same!');
            dsp(stopLoading())
            return toast.error('please select dissimilar tokens!');
        }
        if(selected === T_TYPE.B) { let t = addr[1]; addr[1] = addr[0]; addr[0] = t; }
        if (rDefined(...addr)) {
            let cPair = ADDRESS.ZERO;
            console.log('3 getPair', addr);
            cPair = await ExchangeService.getPair(...addr);
            console.log('3:', addr);
            if(!isAddr(cPair)) {
                dsp(stopLoading());
                return toast.error('pair not available!!');
            }
            TC.setTo(addr[0]);
            bal = await TC.balanceOf(P.priAccount);
            common.setTokenCurrency(symbol, selected);
            common.setToken(token, selected);
            common.setTokenBalance(bal, selected);
            common.setFilteredTokenList(P.tokenList);
            common.setModalCurrency(!common.modalCurrency);
            console.log('3:', cPair);
            common.setHasPriceImpact(!0);

            if (isNonZero(cPair)) {
                common.setCurrentPair(cPair);
                TC.setTo(addr[0]);
                const dec1 = await TC.decimals();
                TC.setTo(addr[1]);
                const dec2 = await TC.decimals();
                console.log('reserves');
                const reserves = await ExchangeService.getReserves(cPair);
                console.log('4:', reserves);
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
        let addrForPriceImpact = [], res=[], tAddr;
        
        let tPair = [addr[tt-1], addr[togIP(tt)-1]]
        let pairAddr = await ExchangeService.getPair(...tPair);
        if (pairAddr || (tAddr = await normalizePair(...tPair))) {
            res = await ExchangeService[`getAmounts${isIP_A(tt) ? 'Out' : 'In'}`](amt, addr);
            addrForPriceImpact = pairAddr ? addr.map(a => a) : tAddr.map(p => p);
            !pairAddr && common.setHasPriceImpact(!0);
        } else if(!tAddr) throw new Error('pair not available');
        let finalAmount = '';
        if (res.length) {
            common.setExact(tt);
            finalAmount = Number(res[isIP_A(tt) ? res.length - 1 : 0].toFixed(8));
            const ratio = Number(amt) / finalAmount;
            common.setSharePoolValue(ratio.toFixed(10));
            let out = toBgFix(toFull(finalAmount, common[`token${togIP(tt)}`].dec));
            common.setMinReceived(Number(out) - (Number(out) * P.slippage / 100));
            calculatePriceImpact(amt, addrForPriceImpact);
        }
        return {addr: [...addrForPriceImpact], amt2: finalAmount};
        
    }

    const liquidityHelper = async (amount, tkn) => {
        let tAddr = try2weth(tkn.addr);
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
        console.log('has balance:', amount, addr)
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
            addr = [try2weth(common.token1.addr), try2weth(common.token2.addr)]; 
        
        const bal = await checkBalance(tkn.addr);
        if (amount > bal) {
            common.setDisabled(!0);
            common.setBtnText(`Insufficient ${tkn.sym} balance`);
            common.setFetching(!1);
            return;
        }
        common.setBtnText('');
        common.setDisabled(!1);
        let d = {}, apvd = await checkForAllowance(amount, tt);

        if (apvd && rDefined(tkn.addr, common[`token${i}`].addr)) {
            if(isSwap) {
                try {
                    d = await swapHelper(amount, [...addr], tt);
                    addr = d.addr;
                    amt.push(d.amt2);
                } catch(e) {
                    common.setDisabled(!0);
                    common.setBtnText(e.message);
                    common.setFetching(!1);
                    return toast.error(e.message);
                }
            } else {
                let a = await liquidityHelper(amount, tkn);
                amt.push(a);
                apvd = await checkForAllowance(a, togIP(tt));
            }
        }
        console.log('d:', d, amt, tkn2);
        
        if(isIP_B(tt) && await hasBalance(amt[1], tkn2.addr)) {
            common.setDisabled(!0);
            common.setTokenValue(amt[1], 1);
            common.setBtnText(`Insufficient ${tkn2.sym} balance`);
            common.setFetching(!1);
            return;
        }
        common.setTokenValue(amt[1], togIP(tt));
        if(isIP_B(tt)) { let t = amt[1]; amt[1] = amt[0]; amt[0] = t; }
        if (rDefined(...addr)) {
            let cPair = await ExchangeService.getPair(...addr);
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
        let addr = try2weth(tkn.addr);
        try {
            dsp(startLoading());
            TC.setTo(addr);
            const r = await TC.approve(MAIN_CONTRACT_LIST.router.address, VAL.MAX_256);
            if (rEq(4001, r.code)) toast.error("User denied transaction signature.");
            else {
                common.setTokenApproved(!0, tt);
                let data = {message: `Approve`, tx: r.transactionHash};
                data.message = `Approve ${tkn.sym}`;
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
        let addr = try2weth(common.token1.addr);
        TC.setTo(addr);
        handleInput(await TC.balanceOf(P.priAccount), tt, !1);
        common.setIsMax(!1);
    }

    const getApprovalButton = tt => {
        console.log('getting approval button for tt:', tt);
        return !common[`token${tt}Approved`] ? (
            <div className="col button_unlockWallet">
                <ButtonPrimary
                className="swapBtn"
                title={`Approve ${common[`token${tt}`].sym}`}
                disabled={common.isApprovalConfirmed}
                onClick={() => handleTokenApproval(tt)}
                />
            </div>
        ) : null;
    }
    
    const checkForAllowance = async (amount, tt) => {
        if(!P.isConnected) return !!toast.error("Connect wallet first!");
        let tkn = common[`token${tt}`];
        let addr = try2weth(tkn.addr);
        TC.setTo(addr);
        console.log('checking allowance');
        let allowance = await TC.allowanceOf(P.priAccount, MAIN_CONTRACT_LIST.router.address);
        allowance = toDec(allowance, tkn.dec);
        console.log('allowance:', amount, allowance);
        if (amount > allowance) {
            common.setTokenApproved(!1, tt);
            return !1;
        }
        common.setDisabled(!0);
        common.setTokenApproved(!0, tt);
        return !0;
    };

    const checkBalance = async addr => {
        if (isEth(addr)) return await ContractServices.getETHBalance(P.priAccount);
        else {
            TC.setTo(addr)
            return await TC.balanceOf(P.priAccount);
        } 
    }

    const handleBalance = async _ => {
        let ex = common.exact;
        const addr = try2weth(common[`token${tgl(ex)}`].addr);
        common.setTokenBalance(await checkBalance(addr), ex);
    }

    async function calculateLiquidityPercentage(reserve, amount0, amount1) {
        const r0 = toDec(reserve._reserve0, common.token1.dec);
        const r1 = toDec(reserve._reserve1, common.token2.dec);
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

    const normalizePair = async pair => {
        if(
            (rEq(pair[0], ADDRESS.WETH) && rEq(pair[1], ADDRESS.SAITAMA)) ||
            (rEq(pair[1], ADDRESS.WETH) && rEq(pair[0], ADDRESS.SAITAMA))
        ) return pair;
        let p1 = await ExchangeService.getPair(pair[0], ADDRESS.WETH);
        let p2 = await ExchangeService.getPair(pair[1], ADDRESS.WETH);
        if (isAddr(p1) && isAddr(p2)) return [pair[0], ADDRESS.WETH, pair[1]];
        
        p1 = await ExchangeService.getPair(pair[0], ADDRESS.SAITAMA);
        p2 = await ExchangeService.getPair(pair[1], ADDRESS.SAITAMA);
        if (isAddr(p1) && isAddr(p2)) return [pair[0], ADDRESS.SAITAMA, pair[1]];
        return null;
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
        normalizePair,
    }

    return cTrade;

}

export default useCommonTrade;