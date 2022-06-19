import { ERR, T_TYPE } from "../services/constant";
import { BigNumber } from "bignumber.js";
import useCommonTrade from "./CommonTrade";
import useSwap from "../redux/volatiles/swap";
import { toast } from "../components/Toast/Toast";
import useCommon from "../redux/volatiles/common";
import { useDispatch, useSelector } from "react-redux";
import { addTransaction, startLoading, stopLoading } from "../redux/actions";
import { toBgFix, toDec, toFlr, toFull, tStamp, xpand } from "../services/utils/global";
import { isIP_A, isWeth, togIP, try2weth } from "../services/utils/trading";
import RouterContract from "../services/contracts/Router";
import log from "../services/logging/logger";

const useXchange = (props) => {
    const dsp = useDispatch();
    const swap = useSwap(s => s);
    const common = useCommon(s => s);
    const cTrade = useCommonTrade({});
    const P = useSelector(s => s.persist);

    const _getDeadline = _ => tStamp(common.deadline * 60);

    const _getEthSwapDataForTK1 = (dl, v) => {
        let tv = common[`token${togIP(common.exact)}Value`]
        return {
            value: v,
            deadline: dl,
            to: P.priAccount,
            amountOutMin: toFlr(Number(tv) - (Number(tv) * P.slippage / 100)),
        };
    }

    const _getEthSwapDataForTK2 = (dl, v) => {
        let i = common.exact,
            x = i-1 ? toDec(common[`token${togIP(i)}Value`], common[`token${togIP(i)}`].dec) :
                toDec(common[`token${i}Value`],  common[`token${i}`].dec)
        return {
            value: v,  
            deadline: dl,
            to: P.priAccount,
            amountIn: toBgFix(toFlr(x)),
            amountOutMin: toBgFix(toFlr(x - (x * P.slippage / 100))),
        };
    }

    // 2nd is eth
    async function _swapExactTokensForEth (vList, tList, amtOut) {
        log.s('_swapExactTokensForEth');
        const ethVal = vList[1];
        const amountIn = vList[0];
        const amountOutMin = cTrade.getValueAfterSlippage(amtOut, tList[1].dec, !0);
        const path = tList.map(t => try2weth(t.addr));
        const to = P.priAccount;
        const deadline = cTrade.getDeadline();

        const tx = await RouterContract.swapExactTokensForETH({from: to, value: ethVal}, [
            amountIn,
            amountOutMin,
            path,
            to,
            deadline,
        ]);
        return tx.transactionHash;
    }

    // 2nd is eth
    async function _swapTokensForExactEth (vList, tList, amtIn) {
        log.s('_swapTokensForExactEth');
        const ethVal = vList[1];
        const amountOut = vList[1];
        const amountInMax = cTrade.getValueAfterSlippage(amtIn, tList[0].dec, !0);
        const path = tList.map(t => try2weth(t.addr));
        const to = P.priAccount;
        const deadline = cTrade.getDeadline();

        const tx = await RouterContract.swapTokensForExactETH({from: to, value: ethVal}, [
            amountOut,
            amountInMax,
            path,
            to,
            deadline,
        ]);
        return tx.transactionHash;
    }

    // 1st is eth
    async function _swapExactEthForTokens (vList, tList, amtOut) {
        log.s('_swapExactEthForTokens');
        const ethVal = vList[0];
        const amountOutMin = cTrade.getValueAfterSlippage(amtOut, tList[1].dec, !0);
        const path = tList.map(t => try2weth(t.addr));
        const to = P.priAccount;
        const deadline = cTrade.getDeadline();

        const tx = await RouterContract.swapExactETHForTokens({from: to, value: ethVal}, [
            amountOutMin,
            path,
            to,
            deadline,
        ]);
        return tx.transactionHash;
    }
    
    // 1st is eth
    async function _swapEthForExactTokens (vList, tList, amtIn) {
        log.s('_swapEthForExactTokens');
        const ethVal = amtIn;
        const amountOut = vList[1];
        const path = tList.map(t => try2weth(t.addr));
        const to = P.priAccount;
        const deadline = cTrade.getDeadline();

        const tx = await RouterContract.swapETHForExactTokens({from: to, value: ethVal}, [
            amountOut,
            path,
            to,
            deadline,
        ]);
        return tx.transactionHash;
    }
    
    // both r tokens
    async function _swapExactTokensForTokens (vList, tList, amtOut) {
        log.s('_swapExactTokensForTokens');
        const amountIn = vList[0];
        const amountOutMin = cTrade.getValueAfterSlippage(amtOut, tList[1].dec, !0);
        const path = tList.map(t => t.addr);
        const to = P.priAccount;
        const deadline = cTrade.getDeadline();
        const tx = await RouterContract.swapExactTokensForTokens({from: to}, [
                amountIn,
                amountOutMin,
                path,
                to,
                deadline,
        ]);
        return tx.transactionHash;
    }

    // both r tokens
    async function _swapTokensForExactTokens (vList, tList, amtIn) {
        log.s('_swapTokensForExactTokens');
        const amountOut = vList[1];
        const amountInMax = cTrade.getValueAfterSlippage(amtIn, tList[0].dec, !1);
        const path = tList.map(t => t.addr);
        const to = P.priAccount;
        const deadline = cTrade.getDeadline();
        const tx = await RouterContract.swapTokensForExactTokens({from: to}, [
                amountOut,
                amountInMax,
                path,
                to,
                deadline,
        ]);
        return tx.transactionHash;
    }

    const performSwap = async () => {
        swap.closeSwapModal();
        let tx = null;
        const exactIn = isIP_A(common.exact) ? !0 : !1;
        const aList = common.addrPair;
        const tList = cTrade.getTokens();
        const vList = cTrade.getValueList().map((v, i) => xpand(toFull(v, tList[i].dec)));
        const ethToken = cTrade.getEthToken();
        dsp(startLoading());
        try{
            let amt = await cTrade.getAmount(vList, aList, exactIn);
            const prm =[vList, tList, amt];   
            if(ethToken) { // either of the tokens is eth!
                if(ethToken.i) { // second token is eth! --> swap tokens for eth
                    log.i('2nd token is eth');
                    tx = await (exactIn ? _swapExactTokensForEth(...prm) : _swapTokensForExactEth(...prm));
    
                } else { // first token is eth! ---> swap eth for tokens
                    log.i('1st token is eth');
                    tx = await (exactIn ? _swapExactEthForTokens(...prm) : _swapEthForExactTokens(...prm));
                    
                }
            } else { // both are erc20 tokens! ---> swap tokens for tokens
                log.i('no token is eth');
                tx = await (exactIn ? _swapExactTokensForTokens(...prm) : _swapTokensForExactTokens(...prm));
            }
            dsp(addTransaction({
                tx, 
                message: `Swap ${ethToken ? 'Eth' : tList[0].sym} and ${tList[1].sym}`
            }));
            common.setTxHash(tx);
        } catch(e) {
            log.e(e.reason);
            log.e(e.message);
            log.e(e);
        } finally {
            dsp(stopLoading());
        }
        common.showTransactionModal(!0);
        common.setShowSupplyModal(!1);
        // use swap-confirmed
        common.setLiqConfirmed(!1);
    }

    const _getSwapAmountInData = (dl, v) => {
        let i = common.exact, 
            x = [
                toDec(common[`token${i}Value`], common[`token${i}`].dec),
                toDec(common[`token${togIP(i)}Value`], common[`token${togIP(i)}`].dec)
            ]; 
        return {
            value: v,
            deadline: dl,
            to: P.priAccount,
            amountIn: toBgFix(x[i-1]).toString(),
            amountOutMin: toBgFix(x[togIP(i)-1] + (x[togIP(i)-1] * P.slippage / 100)).toString(),
        }; 
    }

    const handleSwitchCurrencies = () => {
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
    }
    
    const liquidityProviderFee = () => {
        const value = common.exact === T_TYPE.A ? common.token1Value : common.token2Value;
        const tknCurrency = common.exact === T_TYPE.A ? common.token1Currency : common.token2Currency;
        let lpf = (value * 2) / 1000;
        lpf = BigNumber(lpf).toFixed();
        const calLpf = lpf + ' ' + tknCurrency
        return calLpf;
    }


    const Xchange = {
        performSwap,
        liquidityProviderFee,
        handleSwitchCurrencies,
    }
    return Xchange;
}

export default useXchange;