import React from "react";
import { T_TYPE } from "../constant";
import { WETH } from "../assets/tokens";
import { BigNumber } from "bignumber.js";
import useCommonTrade from "./CommonTrade";
import useSwap from "../redux/volatiles/swap";
import { toast } from "../components/Toast/Toast";
import useCommon from "../redux/volatiles/common";
import { useDispatch, useSelector } from "react-redux";
import { ExchangeService } from "../services/ExchangeService";
import { ContractServices } from "../services/ContractServices";
import { addTransaction, startLoading, stopLoading } from "../redux/actions";
import { isBnb, isDefined, isNonZero, rEq, tgl, toBgFix, toDec, toFlr, tStamp } from "../services/utils";


const useXchange = (props) => {
    const dsp = useDispatch();
    const swap = useSwap(s => s);
    const common = useCommon(s => s);
    const cTrade = useCommonTrade({});
    const P = useSelector(s => s.persist);

    const handleSwap = async () => {
        const acc = await ContractServices.getDefaultAccount();
        if (isDefined(acc) && !rEq(acc, P.priAccount))  return toast.error('Wallet address doesn`t match!');
        swap.closeSwapModal();

        let dl = tStamp(P.deadline * 60);

        let addr = [common.token1.address, common.token2.address];

        let [a1, v1, bnb1]= isBnb(addr[0]) ? [WETH, !0, common.token1Value] : [addr[0], !1, 0];
        let [a2, v2, bnb2]= isBnb(addr[1]) ? [WETH, !0, common.token2Value] : [addr[1], !1, 0];
        let value = bnb1 ? v1 : bnb2 ? v2 : 0; 
        value = value > 0 ? BigNumber(value * 10 ** 18).toFixed() : 0;
        console.log('a1, a2, value', a1, a2, value);
        if (bnb1) {
            dsp(startLoading());
            const data = await handleBNBSwapForTK1(dl, value);
            try {
                const result = common.exact === T_TYPE.A ?
                await ExchangeService.swapExactETHForTokens(data, cTrade.handleBalance) :
                await ExchangeService.swapETHForExactTokens(data);
                if (result) {
                common.setTxHash(result);
                common.showTransactionModal(!0);
                common.setShowSupplyModal(!1);
                const data = {
                    message: `Swap ${common.token1.symbol} and ${common.token2.symbol}`,
                    tx: result
                };
                dsp(addTransaction(data));
                }
            } catch (err) {
                const message = await ContractServices.web3ErrorHandle(err);
                toast.error(message);
            } finally {
                dsp(stopLoading());
                common.setLiqConfirmed(!1);
            }
        } else if (bnb2) {
            dsp(startLoading());
            const data = await handleBNBSwapForTK2(dl, value);
            try {
                const result = common.exact === T_TYPE.A ?

                await ExchangeService.swapExactTokensForETH(data, a1, a2) :

                await ExchangeService.swapTokensForExactETH(data, a1, a2);

                dsp(stopLoading());

                if (result) {
                common.setTxHash(result);
                common.showTransactionModal(!0);
                common.setShowSupplyModal(!1);
                const data = {
                    message: `Swap ${common.token1.symbol} and ${common.token2.symbol}`,
                    tx: result
                };
                dsp(addTransaction(data));
                }
                common.setLiqConfirmed(!1);

            } catch (err) {
                dsp(stopLoading());
                const message = await ContractServices.web3ErrorHandle(err);
                toast.error(message);
                common.setLiqConfirmed(!1);
            }
        } else {
            dsp(startLoading());
            let pair;
            const cPair = await ExchangeService.getPair(a1, a2);

            if (isNonZero(cPair)) {
                pair = [a1, a2];
            } else {
                const pairs = await cTrade.checkPairWithBNBOrUSDT(a1, a2);
                if (pairs) {
                pair = pairs;
                }
            }
            let data = await handleSwapAmountIn(dl, value);
            data.path = pair;
            try {
                const result = common.exact === T_TYPE.A ?

                await ExchangeService.swapExactTokensForTokens(data, a1, a2) :

                await ExchangeService.swapTokensForExactTokens(data, a1, a2);

                dsp(stopLoading());

                if (result) {
                common.setTxHash(result);
                common.showTransactionModal(!0);
                common.setShowSupplyModal(!1);

                const data = {
                    message: `Swap ${common.token1.symbol} and ${common.token2.symbol}`,
                    tx: result
                };
                dsp(addTransaction(data));
                }
                common.setLiqConfirmed(!1);

            } catch (err) {
                dsp(stopLoading());
                const message = await ContractServices.web3ErrorHandle(err);
                toast.error(message);
                common.setLiqConfirmed(!1);
            }
        }
    }

    const handleSwapAmountIn = async (dl, v) => {
        let i = common.exact, x = [
        toDec(common[`token${i}Value`], common[`token${i}`].decimals),
        toDec(common[`token${tgl(i)}Value`], common[`token${tgl(i)}`].decimals),
        ], d = {
        value: v,
        path: [],
        deadline: dl,
        to: P.priAccount,
        amountIn: toBgFix(x[i-1]).toString(),
        amountOutMin: toBgFix(x[tgl(i)-1] + (x[tgl(i)-1] * P.slippage / 100)).toString(),
        };
        console.log('[swap] handle amountIn:', v, i, d);
        return {...d}; 
    }

    const handleBNBSwapForTK1 = async (dl, v) => {
        let tv = common[`token${tgl(common.exact)}Value`]
        let dec = common[`token${tgl(common.exact)}`].decimals;
        let x = toBgFix(toFlr(toDec(tv, dec)));
        let d = {
        value: v,
        deadline: dl,
        to: P.priAccount,
        path: [WETH, common.token2.address],
        amountOutMin: toBgFix(toFlr(Number(x) - (Number(x) * P.slippage / 100))).toString(),
        };
        console.log('[swap] handle bnb for tk1:', v, common.exact, d);
        return {...d};
    }

    const handleBNBSwapForTK2 = async (dl, v) => {
        let i = common.exact, 
            d = {
            value: v,  
            deadline: dl,
            to: P.priAccount,
            path: [common.token1.address, WETH],
            };
        
        let x = toDec(common[`token${i}Value`],  common[`token${i}`].decimals); 
        let y = toDec(common[`token${tgl(i)}Value`], common[`token${tgl(i)}`].decimals);
        
        if (!(i-1)) {
        d['amountIn'] = toBgFix(toFlr(x));
        d['amountOutMin'] = toBgFix(toFlr(y - (y * P.slippage / 100)));
        }

        if (i-1) {
        d['amountOut'] = toBgFix(toFlr(y));
        d['amountInMax'] = toBgFix(toFlr(x + (x * P.slippage / 100)));
        }
        console.log('[swap] handle bnb for tk2:', v, i, d);
        return {...d};
    }

    const handleSwitchCurrencies = () => {
        common.setExact(tgl(common.exact));
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
    
    const closeTransactionModal = () => {
        common.showTransactionModal(!1);
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
        handleSwap,
        liquidityProviderFee,
        handleSwitchCurrencies,
    }
    return Xchange;
}

export default useXchange;