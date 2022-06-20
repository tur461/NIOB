import l_t from "../services/logging/l_t";
import useCommonTrade from "./CommonTrade";
import { MISC} from "../services/constant";
import log from "../services/logging/logger";
import useCommon from "../redux/volatiles/common";
import { useDispatch, useSelector } from "react-redux";
import { isWeth, togIP } from "../services/utils/trading";
import RouterContract from "../services/contracts/Router";
import {parseTxErr, rDefined, toDec, toFull, tStamp, xpand, zero } from "../services/utils/global";
import { addTransaction, checkUserLpTokens, startLoading, stopLoading } from "../redux/actions";

const useLiquidity = _ => {
    const dsp = useDispatch();
    const common = useCommon(s => s);
    const cTrade = useCommonTrade({});
    const P = useSelector(s => s.persist);

    const checkAddLiquidity = async () => {
        if (!P.isConnected) cTrade.handleShow1();
        else common.setShowSupplyModal(!0);
    };
    
    async function _addLiquidityEthWithToken(valList, ethToken, otherToken) {
        const tkn = otherToken.tkn;
        const ethVal = toFull(valList[ethToken.i], MISC.DEF_DEC);
        const amtTokenDzd = toFull(valList[otherToken.i], tkn.dec);
        const amtTokenMin = !common.pairExist ? amtTokenDzd : cTrade.getValueAfterSlippage(amtTokenDzd, tkn.dec, !0);

        let p = [
            tkn.addr,
            xpand(amtTokenDzd),
            xpand(amtTokenMin),
            xpand(ethVal),
            P.priAccount,
            cTrade.getDeadline(),
        ]
        const tx = await RouterContract.addLiquidityEth({
            from: P.priAccount,
            value: ethVal,
        }, p);
        log.i('tx:', tx);
        l_t.s('Success add liquidity by eth with token');
        return tx.transactionHash;
    }

    async function _addLiquidityTokenWithToken(valList, tokens) {
        log.i('val list:', valList, tokens);
        const amtDzdList = valList.map((v, i) => xpand(toFull(v, tokens[i].dec)));
        const amtMinList = common.pairExist ? amtDzdList.map((v, i) => cTrade.getValueAfterSlippage(v, tokens[i].dec, !0)) : [...amtDzdList];
        let p = [
            tokens[0].addr,
            tokens[1].addr,
            amtDzdList[0],
            amtDzdList[1],
            amtMinList[0],
            amtMinList[1],
            P.priAccount,
            cTrade.getDeadline(),
        ]
        const tx = await RouterContract.addLiquidity({
            from: P.priAccount
        }, p);
        log.i('tx:', tx);
        l_t.s('Success add liquidity by token with token');
        return tx.transactionHash;
    }

    const addLiquidity = async _ => {
        dsp(startLoading());
        let hash = null, valList = cTrade.getValueList();

        common.setLiqConfirmed(!0);
        dsp(startLoading());
        let ethToken = cTrade.getEthToken();
        log.i('ethToken:', ethToken);
        
        try {
            if(ethToken) {
                const oTkn = cTrade.getOtherToken();
                hash = await _addLiquidityEthWithToken(valList, ethToken, oTkn);
                dsp(addTransaction({tx: hash, message: `Add ETH and ${oTkn.tkn.sym}`}));
            } else {
                const tkns = cTrade.getTokens();
                hash = await _addLiquidityTokenWithToken(valList, tkns)
                dsp(addTransaction({tx: hash, message: `Add ${tkns[0].sym} and ${tkns[1].sym}`}));
            }
        } catch(e) {
            e = parseTxErr(e);
            l_t.e(e);
            common.setIsTxErr(!0);
            return common.setTxErr(e);
        } finally {
            dsp(stopLoading());
            common.setShowSupplyModal(!1);
        }
        // dsp(checkUserLpTokens(!1));
        common.setIsTxErr(!1);
        common.setTxHash(hash);
        common.setLiqConfirmed(!1);
        common.showTransactionModal(!0);
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