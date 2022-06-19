import React from "react";
import useCommon from "../redux/volatiles/common"
import { useDispatch, useSelector } from "react-redux";
import ButtonPrimary from "../components/Button/Button";
import { ExchangeService } from "../services/ExchangeService";
import { ADDRESS, ERR, MISC, STR, THRESHOLD, TOKENS, T_TYPE, VAL } from "../services/constant";
import { addTransaction, searchTokenByNameOrAddress, startLoading, stopLoading } from "../redux/actions";
import { hasVal, isAddr, isDefined, rDefined, rEq, toBgFix, toDec, toFull, tStamp, xpand, zero } from "../services/utils/global";
import { isIP_A, isIP_B, togIP, isEth, try2weth, isWeth } from "../services/utils/trading";
import log from "../services/logging/logger";
import l_t from "../services/logging/l_t";
import toast from "../services/logging/toast";
import TokenContract from "../services/contracts/TokenContract";
import FactoryContract from "../services/contracts/Factory";
import { getEthBalance } from "../services/contracts/Common";
import RouterContract from "../services/contracts/Router";
import PairContract from "../services/contracts/PairContract";

let timeOut = null;

const useCommonTrade = _ => {
    const dsp = useDispatch();
    const common = useCommon(s => s);
    const P = useSelector(s => s.persist);

    const PC = PairContract;
    const TC = TokenContract;


    const handleShow1 = () => common.setShow1(!0);
    const handleClose1 = () => common.setShow1(!1);
    const settingClose = () => common.setSettingShow(!1);
    const handleCloseRecent = () => common.setShowRecent(!1);
    const settingHandleShow = () => common.setSettingShow(!0);


    const getDeadline = _ => tStamp(common.deadline * 60);

    const getTokens = _ => [common.token1, common.token2];

    const getEthToken = _ => {
        let pr = common.addrPair;
        return isWeth(pr[0]) ? {tkn: common.token1, i: 0} : 
                isWeth(pr[0]) ? {tkn: common.token2, i: 1} : null;
    }

    const getOtherToken = _ => {
        let pr = common.addrPair;
        return !isWeth(pr[0]) ? 
        {tkn: common.token1, i: 0} : 
        {tkn: common.token2, i: 1};
    }

    const getValueList = _ => [common.token1Value, common.token2Value];

    const getValueAfterSlippage = (v, d, isMin) => {
        log.i('after slippage;', v, d);
        v = parseFloat(toDec(v, d));
        log.i('parsed:', v);
        return xpand(toFull(`${v + ((v * (isMin ? -1 : 1)) * (parseFloat(common.slippage) / 100))}`, d));
    }

    const getAmount = async (vL, aL, isIn) => {
        const al = await RouterContract[`getAmounts${isIn ? 'Out' : 'In'}`]([vL[isIn ? 0 : 1], aL]);
        return al[isIn ? al.length-1 : 0];
    }
    
    const _getIdx = tt => tt - 1 ? 1 : 0;
    const _getToken = tt => common[`token${tt}`];
    const _areTokensBoth = addr =>!isWeth(addr[0]) && !isWeth(addr[1]);
    const _balanceNotEnough = async (addr, amt) => amt > await getBalance(addr);
    
    const _checkIfPairExists = async pair => {
        const pr = await FactoryContract.getPair(pair);
        const exists = isAddr(pr);
        if(exists) {
            common.setPair(pr);
            common.setPath(pr);
        }
        else l_t.e(ERR.PAIR_NOT_EXIST.msg);
        common.setPairExist(exists);
        return exists;
    }


    async function _tryGetPossiblePath(addr) {
        let prAddr=['',''], weth = TOKENS.WETH.addr, sma = TOKENS.SAITAMA.addr;
        prAddr= [await FactoryContract.getPair([addr[0], weth]), await FactoryContract.getPair([addr[1], weth])];
        if(isAddr(prAddr[0]) && isAddr(prAddr[1])) return [addr[0], weth, addr[1]] 
        prAddr= [await FactoryContract.getPair([addr[0], sma]), await FactoryContract.getPair([addr[1], sma])];
        if(isAddr(prAddr[0]) && isAddr(prAddr[1])) return [addr[0], sma, addr[1]]
        return null; 
    }

    const selectToken = async (token, selected, isSwap) => {
        common.setSearch('');
        handleClose();
        dsp(startLoading())
        let addr = _getIdx(selected) ? [
                try2weth(_getToken(T_TYPE.A).addr),
                try2weth(token.addr),
            ] : [
                try2weth(token.addr),
                try2weth(_getToken(T_TYPE.B).addr),
            ], singleToken=!1;
        if(isAddr(addr[0]) && isAddr(addr[1])) common.setAddrPair(addr);
        else if(isAddr(addr[0]) || isAddr(addr[1])) singleToken = !0;
        else return l_t.e(ERR.TOKEN_ADDR_NDEF.msg);

        if(!singleToken && rEq(...addr)) {
            common.setIsErr(!0)
            common.setErrText(ERR.SAME_TOKENS.msg)
            dsp(stopLoading())
            return l_t.e(ERR.SAME_TOKENS.msg);
        }

        TC.setTo(addr[_getIdx(selected)]);
        common.setToken(token, selected);
        common.setTokenBalance(await TC.balanceOf([P.priAccount]), selected);
        common.setFilteredTokenList(P.tokenList);
        common.setTokenCurrency(token.sym, selected);
        common.setModalCurrency(!common.modalCurrency);
        if(singleToken) {
            common.setIsFirstLP(!0);
            common.showPoolShare(!0);
            common.setLpTokenBalance(0);
            return dsp(stopLoading());
        }
        if(selected === T_TYPE.B) { let t = addr[1]; addr[1] = addr[0]; addr[0] = t; }
        let pairExist = await _checkIfPairExists(addr);
        if(_areTokensBoth(addr)) {
            const p = _tryGetPossiblePath(addr);
            common.setPath(pairExist ? p || null : null);
        }
        if (isSwap && pairExist) {
            const dec = await TC.getPairDec(addr);
            PC.setTo(common.pair)
            const reserves = await PC.getReserves();
            TC.setTo(common.pair);
            const lpTokenBalance = await TC.balanceOf([P.priAccount]);
            calcLiqPercentForSelCurrency(reserves, dec[0], dec[1], lpTokenBalance, common.pair);
            common.setIsFirstLP(!1);
            common.showPoolShare(!0);
            common.setHasPriceImpact(!0);
            common.setLpTokenBalance(lpTokenBalance);
        } else {
            common.setIsFirstLP(!0);
            common.showPoolShare(!0);
            common.setLpTokenBalance(0);
        }
        dsp(stopLoading())
    }

    const openSelectTokenModal = async tt => {
        common.setShow(!0);
        let i = tt-1 ? 2 : 1;
        common.setModalCurrency(!0);
        common.setTokenType(tt);
        common.setFilteredTokenList(P.tokenList);
        common.setSelectedCurrency(common[`token${i}Currency`]);
    }

    const hasBalance = async (amount, addr) => {
        log.i('has balance:', amount, addr)
        TC.setTo(addr);
        let b = await TC.balanceOf([P.priAccount]);
        return b >= amount;
    }

    function _genCriteriaOk(ip) {
        let r = !0, t='';
        if(!rDefined(common.addrPair)) {
            r = !1;
            t = ERR.TOKEN_ADDR_NDEF.msg;
        }
        else if(rEq(common.token2Currency, STR.SEL_TKN)) {
            r = !1;
            t = ERR.SEL_TOKEN.msg;
        }
        
        !r && l_t.e(t);
        common.setErrText(t);
        common.setIsErr(!r);
        return r;
    }

    async function _swapCriteriaOk(ip, aList, cList, tt) {
        let r = !0, t='';
        if(isIP_A(tt) && await _balanceNotEnough(aList[0], ip)) {
            r = !1;
            t = ERR.LOW_BAL.msg + cList[0];
        }
        else if(!common.path) {
            r = !1;
            t = ERR.PATH_NOT_EXIST.msg;
        } 
        else if(!common.pairExist) {
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
            !common.pairExist && 
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
            }
        }, MISC.TYPE_DELAY);
        common.setTokenValue(ip, tt);
    }

    async function handleIP_swap(ip, tt) {
        if(!hasVal(ip)) return common.setTokenValue(ip, togIP(tt));
        let addrList = common.addrPair, 
            cList = [common.token1Currency, common.token2Currency];
        
        if(!(await _swapCriteriaOk(ip, addrList, cList, tt))) return;
        common.setFetching(!0);
        common.setExact(tt);
        log.i('pair', addrList);
        ip = xpand(toFull(ip, _getToken(tt).dec));
        const res = await RouterContract[`getAmounts${isIP_A(tt) ? 'Out' : 'In'}`]([ip, addrList]);
        common.setHasPriceImpact(!0);
        log.i('amounts:', res);
        let finalAmount = '';
        if (res.length) {
            finalAmount = toDec(res[isIP_A(tt) ? res.length - 1 : 0], _getToken(togIP(tt)).dec).toFixed(8);
            log.i('final amount:', finalAmount);
            const ratio = Number(ip) / finalAmount;
            common.setSharePoolValue(ratio.toFixed(10));
            let out = toBgFix(toFull(finalAmount, _getToken(togIP(tt)).dec));
            common.setMinReceived(Number(out) - (Number(out) * P.slippage / 100));
            calculatePriceImpact(ip, addrList);
        }

        if(isIP_B(tt) && await _balanceNotEnough(addrList[0], finalAmount)) {
            ip = ERR.LOW_BAL.msg + cList[0];
            l_t.e(ip);
            common.setIsErr(!0);
            common.setErrText(ip);
        }
        
        common.setTokenValue(finalAmount, togIP(tt));
    }

    async function handleIP_liquidity(ip, tt) {
        if(!hasVal(ip)) return common.pairExist && common.setTokenValue(ip, togIP(tt));
        let addrList = common.addrPair,
            cList = [common.token1Currency, common.token2Currency];
        if(!(await _liquidityCriteriaOk(ip, addrList, cList, tt))) return;

        if(!common.pairExist) return;
        common.setFetching(!0);
        PC.setTo(common.pair)
        const tokens = await PC.getTokens();
        const reserves = await PC.getReserves();
        const dec = await TC.getPairDec(tokens);
        
        const i = rEq(addrList[_getIdx(tt)], tokens[0]) ? [1,0] : [0,1];
        const amt2 = (toDec(ip * reserves[i[0]], dec[i[0]]) / toDec(reserves[i[1]], dec[i[1]])).toFixed(5);
        
        if(await _balanceNotEnough(addrList[_getIdx(togIP(tt))], amt2)) {
            ip = ERR.LOW_BAL.msg + cList[_getIdx(togIP(tt))];
            l_t.e(ip);
            common.setIsErr(!0);
            common.setErrText(ip);
        }
        common.setTokenValue(amt2, togIP(tt));
    }

    const handleTokenApproval = async tt => {
        if (common.isApprovalConfirmed)
            return !!toast.info("Token approval is processing");
        
        let tkn = common[`token${tt}`];
        let addr = try2weth(tkn.addr);
        try {
            dsp(startLoading());
            TC.setTo(addr);
            const r = await TC.approve({from: P.priAccount}, [ADDRESS.ROUTER, VAL.MAX_256,]);
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
    }

    const handleMaxBalance = async tt => {
        if (!P.isConnected) return toast.e('Connect wallet first!');
        let addr = try2weth(common.token1.addr);
        TC.setTo(addr);
        handleInput(await TC.balanceOf([P.priAccount]), tt, !1);
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
        if(!P.isConnected) return !!toast.e("Connect wallet first!");
        let tkn = common[`token${tt}`];
        let addr = try2weth(tkn.addr);
        TC.setTo(addr);
        let allowance = await TC.allowanceOf([P.priAccount, ADDRESS.ROUTER]);
        allowance = toDec(allowance, tkn.dec);
        log.i('allowance:', amount, allowance, amount <= allowance);
        return amount <= allowance;
    }

    const getBalance = async addr => {
        let bal = 0;
        if (isEth(addr) || isWeth(addr)) 
            bal = await getEthBalance(P.priAccount);
        else {
            TC.setTo(addr)
            bal = await TC.balanceOf([P.priAccount]);
        } 
        
        log.i('getting balance:', addr, bal);
        return bal;
    }

    const handleBalance = async _ => {
        let ex = common.exact;
        const addr = try2weth(common[`token${togIP(ex)}`].addr);
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
            Math.sqrt(amount0 * amount1) - THRESHOLD.MINIMUM_LIQUIDITY :
            Math.min((amount0 * _totalSupply) / r0,(amount1 * _totalSupply) / r1);
            
        liquidity = ((liquidity / (_totalSupply + liquidity)) * 100).toFixed(2);
        return zero(_totalSupply) ? 100 : liquidity;
    }

    const calcLiqPercentForSelCurrency = async (reserve, dec1, dec2, lpBalance, cPair) => {
        const r0 = toDec(reserve._reserve0, dec1);
        const r1 = toDec(reserve._reserve1, dec2);
        TC.setTo(cPair);
        let _totalSupply = await TC.totalSupply();
        let ratio = lpBalance / _totalSupply;
        const t0 = (ratio * r0).toFixed(5);
        const t1 = (ratio * r1).toFixed(5);
        common.setTokenDeposit(t0, T_TYPE.A);
        common.setTokenDeposit(t1, T_TYPE.B);
    }

    const normalizePair = async pair => {
        if(
            (rEq(pair[0], ADDRESS.WETH) && rEq(pair[1], ADDRESS.SAITAMA)) ||
            (rEq(pair[1], ADDRESS.WETH) && rEq(pair[0], ADDRESS.SAITAMA))
        ) return pair;
        let p1 = await FactoryContract.getPair([pair[0], ADDRESS.WETH]);
        let p2 = await FactoryContract.getPair([pair[1], ADDRESS.WETH]);
        if (isAddr(p1) && isAddr(p2)) return [pair[0], ADDRESS.WETH, pair[1]];
        
        p1 = await FactoryContract.getPair([pair[0], ADDRESS.SAITAMA]);
        p2 = await FactoryContract.getPair([pair[1], ADDRESS.SAITAMA]);
        if (isAddr(p1) && isAddr(p2)) return [pair[0], ADDRESS.SAITAMA, pair[1]];
        return null;
    }

    const calculatePriceImpact = async (amt, addrForPriceImpact) => {
        let pImp, calPriceImpact;
        const cPair = await FactoryContract.getPair(addrForPriceImpact);
        PC.setTo(cPair);
        const reserve = await PC.getReserves();
        const t = await PC.getTokens();
        const dec = await TC.getPairDec(t);
        if (rEq(t[0], addrForPriceImpact[0])) {
            const res = Number(reserve[0]) / (10 ** dec[0]);

            calPriceImpact = (amt / res) * 100;
            pImp = (calPriceImpact - (calPriceImpact * THRESHOLD.LIQUIDITY_PROVIDER_FEE) / 100);
            if (common.hasPriceImpact) Number(pImp * 2);
            common.setPriceImpact(pImp.toFixed(5));
        }
        if (rEq(t[1], addrForPriceImpact[1])) {
            const res = Number(reserve[1]) / (10 ** dec[1]);

            calPriceImpact = (amt / res) * 100;
            pImp = (calPriceImpact - (calPriceImpact * THRESHOLD.LIQUIDITY_PROVIDER_FEE) / 100);
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
        getTokens,
        getAmount,
        getBalance,
        handleClose,
        selectToken,
        handleShow1,
        getEthToken,
        handleInput,
        searchToken,
        getDeadline,
        getValueList,
        settingClose,
        handleClose1,
        getOtherToken,
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
        getValueAfterSlippage,
    }

    return cTrade;

}

export default useCommonTrade;
