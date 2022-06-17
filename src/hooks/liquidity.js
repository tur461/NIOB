import { BigNumber } from "bignumber.js";
import useCommonTrade from "./CommonTrade";
import { toast } from "../components/Toast/Toast";
import useCommon from "../redux/volatiles/common";
import { useDispatch, useSelector } from "react-redux";
import { ExchangeService } from "../services/ExchangeService";
import { ContractServices } from "../services/ContractServices";
import { isAddr, isDefined,rDefined, rEq, toFull, tStamp, zero } from "../services/utils/global";
import { isEth, isWeth, togIP } from "../services/utils/trading";
import { addTransaction, checkUserLpTokens, startLoading, stopLoading } from "../redux/actions";
import { WALLET_TYPE } from "../services/constant";
import log from "../services/logging/logger";


const useLiquidity = (props) => {
    const dsp = useDispatch();
    const common = useCommon(s => s);
    const cTrade = useCommonTrade({});
    const P = useSelector(s => s.persist);

    const checkAddLiquidity = async () => {
        console.log('common:', common);
        if (!P.isConnected) cTrade.handleShow1();
        else {
            // let addr, e=null;
            // if (WALLET_TYPE.isMMask(P.walletType)) addr = await ContractServices.tryGetAccount('');
            // if (WALLET_TYPE.isBinance(P.walletType)) addr = await ContractServices.isBinanceChainInstalled();
            // if (!rEq(P.priAccount, addr)) e = 'Mismatch wallet addr!';
            // if (!isAddr(common.token1.addr)) e = 'Select 1st token!';
            // if (!isAddr(common.token2.addr)) e = 'Select 2nd token!';
            // if (common.token1Value <= 0) e = 'Enter 1st token value!';
            // if (common.token2Value <= 0) e = 'Enter 2nd token value!';
            // if (common.token1Approved) e = '1st Token approval is pending!';
            // if (common.token2Approved) e = '2nd Token approval is pending!';
            // if (common.token1Balance < common.token1Value) e = `Wallet have insufficient ${common.token1.sym} balance!`;
            // if (common.token2Balance < common.token2Value) e = `Wallet have insufficient ${common.token2.sym} balance!`;
            // if(e) return toast.error(e);
            common.setShowSupplyModal(!0);
        }
    };
    
    const addLiquidity = async _ => {
        dsp(startLoading());
        let ethValue = 0, otherTokenzAddr, 
            tkn1 = common.token1, 
            tkn2 = common.token2, 
            addrList = common.addrPair;

        common.setLiqConfirmed(!0);
        
        let i = isEth(addrList[0]) || isWeth(addrList[0]) ? 1 : 
                isEth(addrList[1]) || isWeth(addrList[1]) ? 2 : 0;
        if (i) {
            ethValue = common[`token${i}Value`];
            otherTokenzAddr = i-1 ? addrList[0] : addrList[1];
        }
        
        ethValue *= ethValue ? 10 ** 18 : 1;
        let dec = [tkn1.dec, tkn2.dec];
        
        if (i) {
            ethValue = ethValue.toString();
            let amountETHMin = common.pairNotExist ? ethValue : BigNumber(Math.floor(Number(ethValue) - (Number(ethValue) * P.slippage) / 100)).toFixed();
            let tknAmtDzd = common[`token${togIP(i)}Value`];
            tknAmtDzd = BigNumber(toFull(tknAmtDzd, dec[togIP(i)-1])).toFixed();
            let tknMinAmt = common.pairNotExist ? tknAmtDzd : BigNumber(Math.floor((toFull((tknAmtDzd - (tknAmtDzd * P.slippage) / 100), dec[togIP(i)-1])))).toFixed();

            const data = {
                otherTokenzAddr,
                amountTokenDesired: tknAmtDzd,
                amountTokenMin: tknMinAmt,
                amountETHMin,
                to: P.priAccount,
                deadline: tStamp(P.deadline * 60),
                ethValue,
            };
            log.i('data:', data, dec, addrList, ethValue);
            try {
            
                const result = await ExchangeService.addLiquidityETH(data);

                if (result) {
                    common.setTxHash(result);
                    common.showTransactionModal(!0);
                    common.setShowSupplyModal(!1);

                    const data = {
                    message: `Add ${tkn1.sym} and ${tkn2.sym}`,
                    tx: result,
                    };
                    dsp(addTransaction(data));
                    dsp(checkUserLpTokens(!1));
                }
                common.setLiqConfirmed(!1);
            } catch (err) {
                const message = await ContractServices.web3ErrorHandle(err);
                toast.error(message);
                common.setLiqConfirmed(!1);
            } finally {
                dsp(stopLoading());
            }
            dsp(stopLoading());
        } else {
            let amountADesired = common.token1Value;
            let amountBDesired = common.token2Value;
            let amountAMin = Math.floor(amountADesired - (amountADesired * P.slippage) / 100);
            let amountBMin = Math.floor(amountBDesired - (amountBDesired * P.slippage) / 100);

            amountAMin = BigNumber(toFull(amountAMin, dec[0])).toFixed();
            amountBMin = BigNumber(toFull(amountBMin, dec[0])).toFixed();
            amountADesired = BigNumber(toFull(amountADesired, dec[0])).toFixed();
            amountBDesired = BigNumber(toFull(amountBDesired, dec[1])).toFixed();

            const data = {
            tokenA: addrList[0],
            tokenB: addrList[1],
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to: P.priAccount,
            deadline: tStamp(P.deadline * 60),
            ethValue,
            };
            try {
            dsp(startLoading());
            const result = await ExchangeService.addLiquidity(data);
            if (result) {
                common.setTxHash(result);
                common.showTransactionModal(!0);
                common.setShowSupplyModal(!1);

                const data = {
                message: `Add ${tkn1.sym} and ${tkn2.sym}`,
                tx: result,
                };
                dsp(addTransaction(data));
                dsp(checkUserLpTokens(!1));
            }
            common.setLiqConfirmed(!1);
            } catch (err) {
            console.log(err);
            const message = await ContractServices.web3ErrorHandle(err);
            toast.error(message);
            common.setLiqConfirmed(!1);
            } finally {
            dsp(stopLoading());
            }
            dsp(stopLoading());
        }
        dsp(stopLoading());
    };

    const calculateFraction = tt => {
        const tv = [common.token1Value, common.token2Value];
        return rDefined(...tv) ? 
        !zero(tv[tt-1]) ? 
            Number((tv[togIP(tt)-1] / tv[tt-1]).toFixed(5)) 
            : 0 
        : 0;
    };
    
    const Liquidity = {
        addLiquidity,
        checkAddLiquidity,
        calculateFraction,
    }

    return Liquidity;
}

export default useLiquidity;