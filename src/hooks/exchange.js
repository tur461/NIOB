import {Trade, Percent, TokenAmount} from '@uniswap/sdk';
import { ERR, MISC, T_TYPE } from "../services/constant";
import { BigNumber } from "bignumber.js";
import useCommonTrade from "./CommonTrade";
import useSwap from "../redux/volatiles/swap";
import { toast } from "../components/Toast/Toast";
import useCommon from "../redux/volatiles/common";
import { useDispatch, useSelector } from "react-redux";
import { addTransaction, startLoading, stopLoading } from "../redux/actions";
import { parseTxErr, toBgFix, toDec, toFlr, toFull, tStamp, xpand } from "../services/utils/global";
import { isIP_A, isWeth, togIP, try2weth } from "../services/utils/trading";
import RouterContract from "../services/contracts/Router";
import log from "../services/logging/logger";
import l_t from "../services/logging/l_t";

const useXchange = (props) => {
    const dsp = useDispatch();
    const swap = useSwap(s => s);
    const common = useCommon(s => s);
    const cTrade = useCommonTrade({});
    const P = useSelector(s => s.persist);

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
        const amountInMax = cTrade.getValueAfterSlippage(amtIn, tList[0].dec, !1);
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
        log.i('_swapEthForExactTokens');
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
        const amt = await cTrade.getAmount(vList, aList, exactIn);
        log.i('got amount:', amt);
        dsp(startLoading());
        try{
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
            log.e(typeof e, e);
            return l_t.e(parseTxErr(e));
        } finally {
            dsp(stopLoading());
        }
        common.showTransactionModal(!0);
        common.setShowSupplyModal(!1);
        // use swap-confirmed
        common.setLiqConfirmed(!1);
    }
    
    const Xchange = {
        performSwap,
    }
    return Xchange;
}

export default useXchange;