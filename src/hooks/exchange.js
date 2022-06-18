import React from "react";
import { ADDRESS, ERR, TOKENS, T_TYPE } from "../services/constant";
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
import { isAddr, isDefined, isNonZero, rEq, toBgFix, toDec, toFlr, toFull, tStamp } from "../services/utils/global";
import { isEth, isIP_A, isWeth, togIP } from "../services/utils/trading";
import log from "../services/logging/logger";


const useXchange = (props) => {
    const dsp = useDispatch();
    const swap = useSwap(s => s);
    const common = useCommon(s => s);
    const cTrade = useCommonTrade({});
    const P = useSelector(s => s.persist);

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

    const handleSwap = async () => {
        swap.closeSwapModal();

        let dl = tStamp(P.deadline * 60);

        let addr = common.addrPair;

        let [a1, isEthIP_1, v1]= [addr[0], isWeth(addr[0]), common.token1Value];
        let [a2, isEthIP_2, v2]= [addr[1], isWeth(addr[1]), common.token2Value];
        let value = isEthIP_1 ? v1 : isEthIP_2 ? v2 : 0; 
        value = value > 0 ? BigNumber(value * 10 ** 18).toFixed() : 0;
        if (isEthIP_1) {
            dsp(startLoading());
            const data = _getEthSwapDataForTK1(dl, value);
            data['path'] = common.path;
            try {
                const result = isIP_A(common.exact) ?
                await ExchangeService.swapExactETHForTokens(data, cTrade.handleBalance) :
                await ExchangeService.swapETHForExactTokens(data);
                if (result) {
                common.setTxHash(result);
                common.showTransactionModal(!0);
                common.setShowSupplyModal(!1);
                const data = {
                    message: `Swap ${common.token1.sym} and ${common.token2.sym}`,
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
        } else if (isEthIP_2) {
            dsp(startLoading());
            const data = _getEthSwapDataForTK2(dl, value);
            data['path'] = common.path;
            try {
                if(!data['path']) throw new Error(ERR.PATH_NOT_EXIST.msg);
                const result = isIP_A(common.exact) ?
                await ExchangeService.swapExactTokensForETH(data, a1, a2) :
                await ExchangeService.swapTokensForExactETH(data, a1, a2);
                dsp(stopLoading());
                if (result) {
                common.setTxHash(result);
                common.showTransactionModal(!0);
                common.setShowSupplyModal(!1);
                const data = {
                    message: `Swap ${common.token1.sym} and ${common.token2.sym}`,
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
            let data = await _getSwapAmountInData(dl, value);
            data['path'] = common.path;
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