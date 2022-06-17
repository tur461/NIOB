import React from "react";
import useCommon from "../redux/volatiles/common"
import { useDispatch, useSelector } from "react-redux";
import ButtonPrimary from "../components/Button/Button";
import { ExchangeService } from "../services/ExchangeService";
import { ContractServices } from "../services/ContractServices";
import { ADDRESS, ERR, LIQUIDITY_PROVIDER_FEE, MINIMUM_LIQUIDITY, MISC, STR, T_TYPE, VAL } from "../services/constant";
import { addTransaction, searchTokenByNameOrAddress, startLoading, stopLoading } from "../redux/actions";
import { hasVal, isAddr, isDefined, isNonZero, rDefined, rEq, tgl, toBgFix, toDec, toFull, typingGuard, zero } from "../services/utils/global";
import { isIP_A, isIP_B, togIP, isEth, try2weth, isWeth } from "../services/utils/trading";
import log from "../services/logging/logger";
import l_t from "../services/logging/l_t";
import toast from "../services/logging/toast";

let timeOut = null;

const useCommonTrade = props => {
    const dsp = useDispatch();
    const common = useCommon(s => s);
    const P = useSelector(s => s.persist);

    const TC = ContractServices.TokenContract;


    const handleShow1 = () => common.setShow1(!0);
    const handleClose1 = () => common.setShow1(!1);
    const settingClose = () => common.setSettingShow(!1);
    const handleCloseRecent = () => common.setShowRecent(!1);
    const settingHandleShow = () => common.setSettingShow(!0);
    
    const _getIdx = tt => tt - 1 ? 1 : 0;
    const _getToken = tt => common[`token${tt}`];
    const _balanceNotEnough = async (addr, amt) => amt > await getBalance(addr);
    const _vals = (a, tt) => ({v1: isIP_A(tt) ? a : '', v2: isIP_A(tt) ? a : ''});
    
    const _tryGetPair = async pair => {
        const pr = await ExchangeService.getPair(...pair);
        log.i('pair:', pair, 'pr:', pr);
        const exists = isAddr(pr);
        if(exists) common.setCurrentPair(pr);
        else l_t.e(ERR.PAIR_NOT_EXIST.msg);
        common.setPair(exists ? pr : ADDRESS.ZERO);
        common.setPairNotExist(!exists);
        return !exists;
    }

    const selectToken = async (token, selected, isSwap) => {
        if (!P.isConnected) return toast.e("Connect wallet first!");
        common.setSearch('');
        handleClose();
        dsp(startLoading())
        log.i('token 1 addr:', _getToken(T_TYPE.A).addr, try2weth(_getToken(T_TYPE.A).addr))
        let bal = 0, 
            addr = _getIdx(selected) ? [
                try2weth(_getToken(T_TYPE.A).addr),
                try2weth(token.addr),
            ] : [
                try2weth(token.addr),
                try2weth(_getToken(T_TYPE.B).addr),
            ]
        if(rDefined(...addr)) common.setAddrPair(addr);
        
        const symbol = token.sym;
        TC.setTo(addr[0]);
        bal = await TC.balanceOf(P.priAccount);
        common.setTokenCurrency(symbol, selected);
        common.setToken(token, selected);
        common.setTokenBalance(bal, selected);
        common.setFilteredTokenList(P.tokenList);
        common.setModalCurrency(!common.modalCurrency);
        if(addr.length > 1 && rDefined(...addr) && rEq(...addr)) {
            common.setIsErr(!0)
            common.setErrText(ERR.SAME_TOKENS.msg)
            dsp(stopLoading())
            return l_t.e(ERR.SAME_TOKENS.msg);
        }
        if(selected === T_TYPE.B) { let t = addr[1]; addr[1] = addr[0]; addr[0] = t; }
        if (addr.length > 1 && rDefined(...addr)) {
            let pairNotExist = await _tryGetPair(addr);
            if(isSwap && pairNotExist) {
                common.setIsErr(!0)
                common.setErrText(ERR.PAIR_NOT_EXIST.msg)
                dsp(stopLoading());
                return l_t.e(ERR.PAIR_NOT_EXIST.msg);
            }
            common.setHasPriceImpact(!0);

            if (isSwap) {
                TC.setTo(addr[0]);
                const dec1 = await TC.decimals();
                TC.setTo(addr[1]);
                const dec2 = await TC.decimals();
                const reserves = await ExchangeService.getReserves(common.pair);
                TC.setTo(common.pair);
                const lpTokenBalance = await TC.balanceOf(P.priAccount);
                calcLiqPercentForSelCurrency(reserves, dec1, dec2, lpTokenBalance, common.pair);
                common.setIsFirstLP(!1);
                common.showPoolShare(!0);
                common.setLpTokenBalance(lpTokenBalance);
            } else {
                common.setCurrentPair('');
                common.setIsFirstLP(!0);
                common.showPoolShare(!0);
                common.setLpTokenBalance(0);
            }
        }
        dsp(stopLoading())
    };

    const openSelectTokenModal = async tt => {
        log.i('dropdown:', tt);
        if (!P.isConnected) {
        return toast.e("Connect wallet first!");
        }
        common.setShow(!0);
        let i = tt-1 ? 2 : 1;
        common.setModalCurrency(!0);
        common.setTokenType(tt);
        common.setFilteredTokenList(P.tokenList);
        common.setSelectedCurrency(common[`token${i}Currency`]);
    };

    const hasBalance = async (amount, addr) => {
        log.i('has balance:', amount, addr)
        TC.setTo(addr);
        let b = await TC.balanceOf(P.priAccount);
        return b >= amount;
    }

    function _genCriteriaOk(ip) {
        let r = !0;
        if(!hasVal(ip)) r = !1;
        else if(!rDefined(common.addrPair)) {
            r = !1;
            l_t.e(ERR.TOKEN_ADDR_NDEF.msg);
        }
        else if(rEq(common.token2Currency, STR.SEL_TKN)) {
            r = !1;
            l_t.e(ERR.SEL_TOKEN.msg);
        }
        common.setIsErr(!r);
        return r;
    }

    async function _swapCriteriaOk(ip, aList, cList) {
        let r = !0, t='';
        if(await _balanceNotEnough(aList[0], ip)) {
            r = !1;
            t = ERR.LOW_BAL.msg + cList[0];
        }
        else if(common.pairNotExist) {
            r = !1;
            t = ERR.PAIR_NOT_EXIST.msg;
        } 
        else if(
            (!isEth(aList[0]) && !isWeth(aList[0])) && 
            !(await isAllowanceEnough(ip, T_TYPE.A))
        ){
            log.e('need of approval for token 1');
            common.setTokenApproved(!1, T_TYPE.A);
        }
        !r && l_t.e(t);
        common.setIsErr(!r);
        !r && common.setErrText(t);
        return r;
    }

    async function _liquidityCriteriaOk(ip, aList, cList, tt) {
        let r = !0, t='';
        if(await _balanceNotEnough(aList[_getIdx(tt)], ip)) {
            r = !1;
            t = ERR.LOW_BAL.msg + cList[_getIdx(tt)];
        }
        else if(
            common.pairNotExist && 
            !hasVal(common.token1Value) && 
            !hasVal(common.token1Value)
        ) r = !1;
        else if(
            (!isEth(aList[_getIdx(tt)]) && !isWeth(aList[_getIdx(tt)])) && 
            !(await isAllowanceEnough(ip, tt))
            ){
            log.e('need of approval for token ' + tt);
            common.setTokenApproved(!1, tt);
        }
        !r && l_t.e(t);
        common.setIsErr(!r);
        !r && common.setErrText(t)
        return r;
    }

    function handleInput(ip, tt, iss) {
        clearTimeout(timeOut);
        timeOut = setTimeout(async _ => {
            if(_genCriteriaOk(ip)) {
                await (iss ? handleIP_swap(ip, tt) : handleIP_liquidity(ip, tt));
                common.setFetching(!1);
            } else if(iss && !hasVal(ip)) common.setTokenValue(ip, togIP(tt));
        }, MISC.TYPE_DELAY);
        common.setTokenValue(ip, tt);
    }

    async function handleIP_swap(ip, tt) {
        common.setFetching(!0);
        let addrList = common.addrPair, 
            cList = [common.token1Currency, common.token2Currency];
        
        if(!(await _swapCriteriaOk(ip, addrList, cList))) return;

        common.setExact(tt);
        log.i('pair', addrList);
        const res = await ExchangeService[`getAmounts${isIP_A(tt) ? 'Out' : 'In'}`](ip, addrList);
        common.setHasPriceImpact(!0);
        
        let finalAmount = '';
        if (res.length) {
            finalAmount = Number(res[isIP_A(tt) ? res.length - 1 : 0].toFixed(8));
            const ratio = Number(ip) / finalAmount;
            common.setSharePoolValue(ratio.toFixed(10));
            let out = toBgFix(toFull(finalAmount, _getToken(togIP(tt)).dec));
            common.setMinReceived(Number(out) - (Number(out) * P.slippage / 100));
            calculatePriceImpact(ip, addrList);
        }
        common.setTokenValue(finalAmount, togIP(tt));
    }

    async function handleIP_liquidity(ip, tt) {
        let addrList = common.addrPair,
            cList = [common.token1Currency, common.token2Currency];
        if(!(await _liquidityCriteriaOk(ip, addrList, cList, tt))) return;

        if(common.pairNotExist) return;

        const token = await ExchangeService.getTokens(common.pair);
        const reserves = await ExchangeService.getReserves(common.pair);
        TC.setTo(token[0]);
        let dec = [];
        dec.push(await TC.decimals());
        TC.setTo(token[1]);
        dec.push(await TC.decimals());
        
        const i = rEq(addrList[_getIdx(tt)], token[0]) ? [1,0] : [0,1];
        const amt2 = (toDec(ip * reserves[i[0]], dec[i[0]]) / toDec(reserves[i[1]], dec[i[1]])).toFixed(5);
        common.setTokenValue(amt2, togIP(tt));
    }

    const handleTokenApproval = async tt => {
        const acc = await ContractServices.getDefaultAccount();
        if (isDefined(acc) && !rEq(acc, P.priAccount)) 
            return !!toast.e("Wallet address doesn`t match!");
        if (common.isApprovalConfirmed)
            return !!toast.info("Token approval is processing");
        
        let tkn = common[`token${tt}`];
        let addr = try2weth(tkn.addr);
        log.i('token:', addr);
        try {
            dsp(startLoading());
            TC.setTo(addr);
            const r = await TC.approve(ADDRESS.ROUTER, VAL.MAX_256, P.priAccount);
            log.s('approved:', r);
            if (rEq(4001, r.code)) toast.e("User denied transaction signature.");
            else {
                common.setTokenApproved(!0, tt);
                let data = {message: `Approve`, tx: r.transactionHash};
                data.message = `Approve ${tkn.sym}`;
                dsp(addTransaction(data));
            }
        } catch (err) {
            log.i(err);
            toast.e("Transaction Reverted!");
        } finally {
            dsp(stopLoading());
        }
    };

    const handleMaxBalance = async tt => {
        if (!P.isConnected) return toast.e('Connect wallet first!');
        let addr = try2weth(common.token1.addr);
        TC.setTo(addr);
        handleInput(await TC.balanceOf(P.priAccount), tt, !1);
        common.setIsMax(!1);
    }

    const getApprovalButton = tt => {
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
    
    const isAllowanceEnough = async (amount, tt) => {
        log.i('checking allowance:', amount, tt);
        if(!P.isConnected) return !!toast.e("Connect wallet first!");
        let tkn = common[`token${tt}`];
        let addr = try2weth(tkn.addr);
        TC.setTo(addr);
        log.i('checking allowance');
        let allowance = await TC.allowanceOf(P.priAccount, ADDRESS.ROUTER);
        allowance = toDec(allowance, tkn.dec);
        log.i('allowance:', amount, allowance, amount <= allowance);
        return amount <= allowance;
    };

    const getBalance = async addr => {
        let bal = 0;
        if (isEth(addr) || isWeth(addr)) 
            bal = await ContractServices.getETHBalance(P.priAccount);
        else {
            TC.setTo(addr)
            bal = await TC.balanceOf(P.priAccount);
        } 
        
        log.i('getting balance:', addr, bal);
        return bal;
    }

    const handleBalance = async _ => {
        let ex = common.exact;
        const addr = try2weth(common[`token${tgl(ex)}`].addr);
        common.setTokenBalance(await getBalance(addr), ex);
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

    const searchToken = async d => {
        try {
            common.setFilteredTokenList(await dsp(searchTokenByNameOrAddress(d)));
        } catch (e) {
            toast.e("Something went wrong!");
        }
    }

    const handleClose = _ => common.setShow(!1);

    const cTrade = {
        getBalance,
        handleClose,
        selectToken,
        handleShow1,
        handleInput,
        searchToken,
        settingClose,
        handleClose1,
        normalizePair,
        handleBalance,
        handleMaxBalance,
        handleCloseRecent,
        isAllowanceEnough,
        settingHandleShow,
        getApprovalButton,
        handleTokenApproval,
        openSelectTokenModal,
        calculatePriceImpact,
    }

    return cTrade;

}

export default useCommonTrade;
