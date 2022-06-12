import { BigNumber } from "bignumber.js";
import useCommonTrade from "./CommonTrade";
import { toast } from "../components/Toast/Toast";
import useCommon from "../redux/volatiles/common";
import { useDispatch, useSelector } from "react-redux";
import { ExchangeService } from "../services/ExchangeService";
import { ContractServices } from "../services/ContractServices";
import { isBnb, isDefined,rDefined, rEq, tgl, toFull, tStamp, zero } from "../services/utils";
import { addTransaction, checkUserLpTokens, startLoading, stopLoading } from "../redux/actions";


const useLiquidity = (props) => {
    const dsp = useDispatch();
    const common = useCommon(s => s);
    const cTrade = useCommonTrade({});
    const P = useSelector(s => s.persist);

    const checkAddLiquidity = async () => {
        console.log('common:', common);
        if (!P.isConnected) cTrade.handleShow1();
        else {
            let addr, e=null;
            if (P.walletType === "Metamask") addr = await ContractServices.tryGetAccount('');
            if (P.walletType === "BinanceChain") addr = await ContractServices.isBinanceChainInstalled();
            if (!rEq(P.priAccount, addr)) e = 'Mismatch wallet addr!';
            else if (!isDefined(common.token1.address)) e = 'Select 1st token!';
            else if (!isDefined(common.token2.address)) e = 'Select 2nd token!';
            else if (common.token1Value <= 0) e = 'Enter 1st token value!';
            else if (common.token2Value <= 0) e = 'Enter 2nd token value!';
            else if (!isDefined(common.token1Approved)) e = '1st Token approval is pending!';
            else if (!isDefined(common.token2Approved)) e = '2nd Token approval is pending!';
            else if (common.token1Balance < common.token1Value) e = `Wallet have insufficient ${common.token1.symbol} balance!`;
            else if (common.token2Balance < common.token2Value) e = `Wallet have insufficient ${common.token2.symbol} balance!`;
            if(e) return toast.error(e);
            common.setShowSupplyModal(!0);
        }
    };
    
    const addLiquidity = async () => {
        const acc = await ContractServices.getDefaultAccount();
        if (isDefined(acc) && !rEq(acc, P.priAccount))
            return toast.error("Wallet address doesn`t match!");
        
        if (common.isLiqConfirmed)
            return toast.info("Transaction is processing!");
        
        let valueOfExact = 0, otherTokenzAddr, 
            tkn1 = common.token1, 
            tkn2 = common.token2, 
            addr = [tkn1.address, tkn2.address];

        if (rEq(tkn1.address, tkn2.address)) return toast.info("select dissimilar tokens!");
            
        common.setLiqConfirmed(!0);
        
        let i = isBnb(addr[0]) ? 1 : isBnb(addr[1]) ? 2 : 0;
        if (i) {
            valueOfExact = common[`token${i}Value`];
            otherTokenzAddr = i-1 ? addr[0] : addr[1];
        }
        
        valueOfExact *= valueOfExact ? 10 ** 18 : 1;
        let dec = [tkn1.decimals, tkn2.decimals];
        
        if (i) {
            valueOfExact = valueOfExact.toString();
            let amountETHMin = BigNumber(Math.floor(Number(valueOfExact) - (Number(valueOfExact) * P.slippage) / 100)).toFixed();
            let tknAmtDzd = common[`token${tgl(i)}Value`];
            let tknMinAmt = BigNumber(Math.floor((toFull((tknAmtDzd - (tknAmtDzd * P.slippage) / 100), dec[tgl(i)-1])))).toFixed();
            tknAmtDzd = BigNumber(toFull(tknAmtDzd, dec[tgl(i)-1])).toFixed();

            const data = {
            otherTokenzAddr,
            amountTokenDesired: tknAmtDzd,
            amountTokenMin: tknMinAmt,
            amountETHMin,
            to: P.priAccount,
            deadline: tStamp(P.deadline * 60),
            valueOfExact,
            };
            try {
            dsp(startLoading());
            const result = await ExchangeService.addLiquidityETH(data);

            if (result) {
                common.setTxHash(result);
                common.showTransactionModal(!0);
                common.setShowSupplyModal(!1);

                const data = {
                message: `Add ${tkn1.symbol} and ${tkn2.symbol}`,
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
            tokenA: addr[0],
            tokenB: addr[1],
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to: P.priAccount,
            deadline: tStamp(P.deadline * 60),
            valueOfExact,
            };
            try {
            dsp(startLoading());
            const result = await ExchangeService.addLiquidity(data);
            if (result) {
                common.setTxHash(result);
                common.showTransactionModal(!0);
                common.setShowSupplyModal(!1);

                const data = {
                message: `Add ${tkn1.symbol} and ${tkn2.symbol}`,
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
        }
    };

    const calculateFraction = tt => {
        const tv = [common.token1Value, common.token2Value];
        return rDefined(...tv) ? 
        !zero(tv[tt-1]) ? 
            Number((tv[tgl(tt)-1] / tv[tt-1]).toFixed(5)) 
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