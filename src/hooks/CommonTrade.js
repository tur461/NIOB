import React from "react";
import useCommon from "../redux/volatiles/common"
import { useDispatch, useSelector } from "react-redux";
import ButtonPrimary from "../components/Button/Button";
import { ExchangeService } from "../services/ExchangeService";
import { ADDRESS, ERR, MISC, STR, THRESHOLD, TOKENS, T_TYPE, VAL, TOKEN_LIST, NETWORK } from "../services/constant";
import { addTransaction, searchTokenByNameOrAddress, startLoading, stopLoading } from "../redux/actions";
import { formatOk, formatRaw, hasPoint, hasVal, iContains, isAddr, isDefined, rDefined, rEq, swap, toBgFix, toDec, toFull, tStamp, xpand, zero } from "../services/utils/global";
import { isIP_A, isIP_B, togIP, isEth, try2weth, isWeth } from "../services/utils/trading";
import log from "../services/logging/logger";
import l_t from "../services/logging/l_t";
import toast from "../services/logging/toast";
import TokenContract from "../services/contracts/TokenContract";
import FactoryContract from "../services/contracts/Factory";
import { getEthBalance, Web_3 } from "../services/contracts/Common";
import RouterContract from "../services/contracts/Router";
import PairContract from "../services/contracts/PairContract";
import useRetained from "../redux/retained";
import UK_TKN_IMG from '../assets/images/token_icons/unknown-token.png';

let timeOut = null;

const useCommonTrade = _ => {
    const dsp = useDispatch();
    const common = useCommon(s => s);
    const retainer = useRetained(s => s);
    const P = useSelector(s => s.persist);
    const wU = (Web_3()).utils;

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
                isWeth(pr[1]) ? {tkn: common.token2, i: 1} : null;
    }

    const getOtherToken = _ => {
        let pr = common.addrPair;
        return !isWeth(pr[0]) ? 
        {tkn: common.token1, i: 0} : 
        {tkn: common.token2, i: 1};
    }

    const getValueList = _ => [common.token1Value, common.token2Value];

    const getValueAfterSlippage = (v, d, isMin) => {
        v = parseFloat(formatOk(v, d));
        v = `${v + ((v * (isMin ? -1 : 1)) * (parseFloat(common.slippage) / 100))}`;
        return formatRaw(v, d);
    }

    const getAmount = async (vL, aL, isIn) => {
        log.i('getAmount:', vL, aL, isIn);
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
        }
        else l_t.e(ERR.PAIR_NOT_EXIST.msg);
        common.setPairExist(exists);
        return {exists, pr};
    }

    const _getLPFee = ip => ((ip * THRESHOLD.LIQUIDITY_PROVIDER_FEE) / 100).toFixed(8);

    const computePriceImpact = async (dec, amtIn, amtOut, isIn) => {
        const pr = common.pair;
        const aList = common.addrPair;
        PC.setTo(pr);
        amtIn = hasPoint(amtIn) ? amtIn : formatOk(amtIn, dec[1]);
        let R = (await PC.getReserves()).map((r, i) => formatOk(r, dec[i]));
        let pI = amtIn / (R[0] + Number(amtIn));
        pI = (pI * 100).toFixed(4);
        log.i('PI:', pI, R, amtIn);
        const b = [amtIn >= R[0], amtOut >= R[1]];
        common.setPriceImpact(pI);
        common.setHasPriceImpact(pI >= THRESHOLD.HIGH_PRICE_IMPACT);
        return !0;
    }

    const selectToken = async (token, selected) => {
        common.setSearch('');
        handleClose();
        dsp(startLoading());
        common.setFetching(!0);
        log.i('selected:', selected, 'tkn:', _getToken(selected), token);
        let addr = _getIdx(selected) ? [
                try2weth(_getToken(T_TYPE.A)?.addr),
                try2weth(token.addr),
            ] : [
                try2weth(token.addr),
                try2weth(_getToken(T_TYPE.B)?.addr),
            ], singleToken=!1;
        if(isAddr(addr[0]) && isAddr(addr[1])) {
            common.setAddrPair(addr);
        }
        else if(isAddr(addr[0]) || isAddr(addr[1])) singleToken = !0;
        else {
            dsp(stopLoading());
            common.setFetching(!1);
            return l_t.e(ERR.TOKEN_ADDR_NDEF.msg);
        }

        if(!singleToken && rEq(...addr)) {
            common.setIsErr(!0)
            common.setErrText(ERR.SAME_TOKENS.msg)
            dsp(stopLoading())
            common.setFetching(!1);
            return l_t.e(ERR.SAME_TOKENS.msg);
        }

        TC.setTo(addr[_getIdx(selected)]);
        token.addr = addr[_getIdx(selected)];
        token.dec = await TC.decimals();
        token.bal = await TC.balanceOf([P.priAccount]);
        common.setToken(token, selected);
        common[`setShowBal${selected}`](!0);
        common[`setShowMaxBtn${selected}`](!0);
        common.setTokenCurrency(token.sym, selected);
        common.setModalCurrency(!common.modalCurrency);

        if(singleToken) {
            common.setIsFirstLP(!0);
            common.showPoolShare(!0);
            common.setLpTokenBalance(0);
            common.setFetching(!1);
            return dsp(stopLoading());
        }
        //if(selected === T_TYPE.B) { let t = addr[1]; addr[1] = addr[0]; addr[0] = t; }
        let pairExist = await _checkIfPairExists(addr);

        if(pairExist.exists) {
            TC.setTo(pairExist.pr);
            PC.setTo(pairExist.pr);
            const lptBal = await TC.balanceOf([P.priAccount]);
            const rsv = await PC.getReserves();
            const dec = await TC.getPairDec(addr)
            log.i('reserves:', rsv, dec, lptBal, pairExist);
            common.setDecPair(dec);
            common.setIsFirstLP(!1);
            common.showPoolShare(!0);
            common.setLpTokenBalance(lptBal);
            common.setReserves(rsv.map((r, i) => formatOk(r, dec[i])));
        } else {
            common.setIsFirstLP(!0);
            common.showPoolShare(!0);
            common.setLpTokenBalance(0);
        }
        const path = await normalizePair(addr);
        log.i('path:', path);
        common.setPathExist(!!path);
        path && common.setPath(path)
        
        dsp(stopLoading());
        common.setFetching(!1);
    }

    const openSelectTokenModal = async tt => {
        common.setShow(!0);
        let i = tt-1 ? 2 : 1;
        common.setModalCurrency(!0);
        common.setTokenType(tt);
        retainer.setTokenList(retainer.tokenListBackup);
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
        log.i('pathExist, pairExist', common.pathExist, common.pairExist)
        let r = !0, t='';
        if(isIP_A(tt) && await _balanceNotEnough(aList[0], ip)) {
            r = !1;
            t = ERR.LOW_BAL.msg + cList[0];
        }
        else if(!common.pathExist) {
            r = !1;
            t = ERR.PATH_NOT_EXIST.msg;
        } 
        else if(
            (!isEth(aList[0]) && !isWeth(aList[0])) && 
            !(await isAllowanceEnough(ip, T_TYPE.A))
        ){
            log.e('need of approval for token 1');
            common.setTokenApproved(!1, T_TYPE.A);
        } else if(
            (isIP_A(tt) && ip >= common.reserves[0]) ||
            (isIP_B(tt) && ip >= common.reserves[1])
        ) {
            r = !1;
            t = ERR.INSUF_LIQ.msg + _getToken(tt).sym;
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
                // put fetch chain data function here!
                common.setFetching(!1);
            }
        }, MISC.TYPE_DELAY);
        common.setTokenValue(ip, tt);
    }

    async function handleIP_swap(ip, tt) {
        if(!hasVal(ip)) return common.setTokenValue(ip, togIP(tt));
        log.i('addr pair:', common.addrPair, ip, common.reserves);
        let addrList = common.addrPair, 
            cList = [common.token1Currency, common.token2Currency];
        common.setFetching(!0);
        if(!(await _swapCriteriaOk(parseFloat(ip), addrList, cList, tt))) return common.setFetching(!1);;
        common.setShowSwapInfo(!1);
        const t1 = _getToken(tt);
        const t2 = _getToken(togIP(tt));
        const dec = [
            isIP_A(tt) ? t1.dec : t2.dec,
            isIP_B(tt) ? t2.dec : t1.dec,
        ];
        const ipF = formatOk(ip, dec[0]);
        ip = formatRaw(ip, _getToken(tt).dec);
        
        log.i('pair', addrList, ip);
        const res = await RouterContract[`getAmounts${isIP_A(tt) ? 'Out' : 'In'}`]([ip, addrList]);
        let finalAmount = formatOk(res[isIP_A(tt) ? res.length - 1 : 0], dec[1]).toFixed(8);
        const ratio = ipF / finalAmount;

        if(isIP_B(tt) && await _balanceNotEnough(addrList[0], finalAmount)) {
            ip = ERR.LOW_BAL.msg + cList[0];
            l_t.e(ip);
            common.setIsErr(!0);
            common.setErrText(ip);
        }
        
        const done = await computePriceImpact(
            dec, 
            isIP_A(tt) ? ip : finalAmount, 
            isIP_A(tt) ? finalAmount : ip, 
            isIP_A(tt)
        ); 
        
        common.setIsIn(isIP_A(tt));
        common.setTokenValue(finalAmount, togIP(tt));
        common.setLPFee(_getLPFee(ipF));
        common.setSharePoolValue(ratio.toFixed(10));
        common.setMaxSpent(xpand(isIP_A(tt) ? ipF : toDec(getValueAfterSlippage(finalAmount, dec[0],!1), dec[0])));
        common.setMinReceived(xpand(isIP_A(tt) ? formatOk(getValueAfterSlippage(finalAmount,dec[0],!0), dec[1]) : formatOk(ip, dec[1])));
        common.setShowSwapInfo(!0);
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

        if(await _balanceNotEnough(addrList[_getIdx(togIP(tt))], toFull(amt2, dec[_getIdx(togIP(tt))]))) {
            log.i('bal not enough');
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
        allowance = formatOk(allowance, tkn.dec);
        log.i('allowance:', amount, allowance, amount <= allowance);
        return amount <= allowance;
    }

    const getBalance = async addr => {
        let bal = 0;
        if (isEth(addr) || isWeth(addr))
            bal = formatOk(await getEthBalance(P.priAccount), MISC.DEF_DEC);
        else {
            TC.setTo(addr);
            bal = formatOk(await TC.balanceOf([P.priAccount]), await TC.decimals());
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

    const normalizePair = async addr => {
        if(
            (rEq(addr[0], ADDRESS.WETH) && rEq(addr[1], ADDRESS.SAITAMA)) ||
            (rEq(addr[1], ADDRESS.WETH) && rEq(addr[0], ADDRESS.SAITAMA))
        ) return isAddr(await FactoryContract.getPair([addr[0], ADDRESS.SAITAMA])) ? addr : null;
    
        let p1 = await FactoryContract.getPair([addr[0], ADDRESS.WETH]);
        let p2 = await FactoryContract.getPair([addr[1], ADDRESS.WETH]);
        if (isAddr(p1) && isAddr(p2)) return [addr[0], ADDRESS.WETH, addr[1]];
        
        p1 = await FactoryContract.getPair([addr[0], ADDRESS.SAITAMA]);
        p2 = await FactoryContract.getPair([addr[1], ADDRESS.SAITAMA]);
        if (isAddr(p1) && isAddr(p2)) return [addr[0], ADDRESS.SAITAMA, addr[1]];
        return null;
    }

    const _searchTokenByNameOrAddress = async q => {
        const TC = TokenContract;
        try {
            let tList = retainer.tokenListBackup;
            if(!q.length) return tList;
            q = try2weth(q);
            if (isAddr(q)) {
                const f = tList.filter(tkn => rEq(tkn.addr, q));
                if (f.length > 0) return f;
                TC.setTo(q);
                const dec = await TC.decimals();
                const name = await TC.name();
                const sym = await TC.symbol();
                const bal = xpand(toFull(await TC.balanceOf([P.priAccount]), dec));
                const obj = {
                    icon: UK_TKN_IMG,
                    name,
                    addr: q,
                    bal,
                    isAdded: !0,
                    isDeleted: !1,
                    dec,
                    sym,
                };
                retainer.add2TokenListBackup(obj);
                tList.unshift(obj);
                return tList;
            }
            return tList.filter(tkn => iContains(tkn.name, q));
        } catch (er) {
            log.i("Error: ", er);
            return er;
        }
    };

    const searchToken = async v => {
        common.setSearchValue(v);
        try {
            log.i('q:', v);
            v = await _searchTokenByNameOrAddress(v);
            log.i('result:', v);
            retainer.setTokenList(v);
        } catch (er) {
            log.e('search err:', er);
            toast.e("token search failed!");
        }
    }

    const handleSwitchCurrencies = _ => {
        if(rEq(common.token2Currency, STR.SEL_TKN))
            return l_t.e(ERR.SEL_TOKEN.msg);
        common.setExact(togIP(common.exact));
        common.setToken(common.token1, T_TYPE.B);
        common.setToken(common.token2, T_TYPE.A);
        common.setTokenIcon(common.token1Icon, T_TYPE.B);
        common.setTokenIcon(common.token2Icon, T_TYPE.A);
        common.setTokenValue(common.token1Value, T_TYPE.B);
        common.setTokenValue(common.token2Value, T_TYPE.A);
        common.setTokenBalance(common.token1Balance, T_TYPE.B);
        common.setTokenBalance(common.token2Balance, T_TYPE.A);
        common.setTokenCurrency(common.token1Currency, T_TYPE.B);
        common.setTokenCurrency(common.token2Currency, T_TYPE.A);
        let dec = swap(common.decPair)
        let addr = swap(common.addrPair);
        let reserves = swap(common.reserves);
        common.setDecPair(dec);        
        common.setAddrPair(addr);        
        common.setReserves(reserves);        
        
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
        getValueAfterSlippage,
        handleSwitchCurrencies,
    }

    return cTrade;

}

export default useCommonTrade;
