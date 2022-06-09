import { useDispatch, useSelector } from "react-redux";
import { ANCHOR_BUSD_LP, BNB_BUSD_LP, MAIN_CONTRACT_LIST, TOKEN_LIST, WETH } from "../assets/tokens";
import { toast } from "../components/Toast/Toast";
import { addCommas, VAL } from "../constant";
import { addTransaction, startLoading, stopLoading } from "../redux/actions";
import usePlanet from "../redux/volatiles/planet";
import { ContractServices } from "../services/ContractServices";
import { ExchangeService } from "../services/ExchangeService";
import { FarmService } from "../services/FarmService";
import { isAddr, isDefined, rEq, toDec, toFull } from "../services/utils";
import { BigNumber } from "bignumber.js";

const useCFarm = (props) => {
    const dsp = useDispatch();
    const planet = usePlanet(s => s);
    const P = useSelector(s => s.persist);
    const {
        farm: { poolInfo, userInfo, pid },
    } = props;

    const init = async () => {
    if (poolInfo) {
        const { lpToken } = poolInfo;
        if (lpToken) {
        const liquidity = await handleLiquidity(lpToken);
        const tokenStaked = await ExchangeService.getTokenStaked(lpToken);
        const totalSupplyTemp = await ContractServices.getTotalSupply(lpToken);
        const lpTokenDetailsTemp = await FarmService.getLpTokenDetails(lpToken);
        
        planet.setWorth(liquidity / tokenStaked);
        planet.setLiquidity(liquidity);
        planet.setTotalSupply(totalSupplyTemp);
        planet.setLpTokenDetails(lpTokenDetailsTemp);

        const a = await calculateAPR(
            Number(poolInfo?.allocPoint),
            lpToken,
            liquidity
        );
        lpTokenDetailsTemp.apr = a;
        planet.setApr(a);

        if (P.isConnected) {
            const allowance = await ContractServices.allowanceToken(
            lpToken,
            MAIN_CONTRACT_LIST.farm.address,
            P.priAccount
            );
            let check = !0;
            if (
            BigNumber(allowance).isGreaterThanOrEqualTo(BigNumber(2 * 255 - 1))
            ) {
            planet.setShowApproveButton(!1);
            check = !1;
            }

            let balance = await ContractServices.getTokenBalance(
            poolInfo?.lpToken,
            P.priAccount
            );
            if (balance > 0.00001) {
            balance -= 0.00001;
            }
            planet.setBalance(balance);
            const amount = userInfo.amount / 10 ** lpTokenDetailsTemp.decimals
            const rewards = Number(
            Number(
                (await FarmService.pendingPanther(pid, P.priAccount)) /
                10 ** 18
            ).toFixed(5)
            );
            if (!check && amount > 0) {
                planet.setShowIncrease(!0);
            }
            planet.setStakeAmounts({ amount, rewards });

            //nextHarvest
            const canHarvest = await FarmService.canHarvest(pid, P.priAccount);
            if (
            !check &&
            rewards > 0 &&
            Number(userInfo.canHarvest) > 0 &&
            canHarvest
            ) {
                planet.setShowHarvest(!0);
            }
        }
        }
    }
    };

     //call web3 approval function
    const handleTokenApproval = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (isDefined(acc) && rEq(acc, P.priAccount)) return toast.error("Wallet address doesn`t match!");
    if (planet.approvalConfirmation) return toast.info("Token approval is processing");
    let value = VAL.MAX_256;
    try {
        dsp(startLoading());
        planet.setApprovalConfirmation(!0);
        const r = await ContractServices.approveToken(
        value,
        P.priAccount,
        poolInfo?.lpToken,
        MAIN_CONTRACT_LIST.farm.address,
        );
        if (r) {
        dsp(addTransaction({
            message: `Approve LP Token`,
            tx: r.transactionHash,
        }));
        planet.setApprovalConfirmation(!1);
        init();
        }
    } catch (e) {
        toast.error("Approval Transaction Reverted!");
    } finally {
        dsp(stopLoading())
        planet.setApprovalConfirmation(!1);
    }
    };

    const beforeStake = async (t) => {
    if (P.isConnected) {
        let bal = rEq(t, 'deposit') ? planet.balance : planet.stakeAmounts.amount;
        props.stakeHandle({ pid, poolInfo, lpTokenDetails: planet.lpTokenDetails, balance: bal }, t);
    } else toast.error("Connect wallet first!");
    };

    const getTokensInfo = async pair => {
    let d = {
        tkn: await ExchangeService.getTokens(pair),
        resrv: await ExchangeService.getReserves(pair),
    };
    return {
        ...d,
        dec: await ContractServices.getPairDecimals(...d.tkn),
    };
    }

    const getPrice = async (pair, rec) => {
    let d = {tInfo: await getTokensInfo(pair), price: -1};
    let x = toFull(d.tInfo.resrv[0], d.tInfo.dec[0]) / toFull(d.tInfo.resrv[1], d.tInfo.dec[1]),
        y = toFull(d.tInfo.resrv[1], d.tInfo.dec[1]) / toFull(d.tInfo.resrv[0], d.tInfo.dec[0]);
    d.price = rEq(d.tInfo.tkn[0], TOKEN_LIST[2].address) ? x: rEq(d.tInfo.tkn[1], TOKEN_LIST[2].address) ? y : rec ? -2 : -1;
    return d;
    }

    const getPossiblePrice = async (pair, rec) => {
    let d = await getPrice(pair, rec);
    if(d.price >= 0) return rec ? d : d.price;
    else if(d.price === -2) throw new Error('[unbound recursion] problem with pair or token please check!');
    //replace with BNB-USD pair
    try {d = await getPossiblePrice(BNB_BUSD_LP, !0);}
    catch(e) {console.log(e, toast.error(e.message))}
    return rEq(d.tInfo.tkn[0], WETH) || rEq(d.tInfo.tkn[1], WETH) ? d.price : -1;
    };

    const calculateAPR = async (aPoint, lpTkn, lpw) => {
    let lq = await handleLiquidity(lpTkn),
        aPrice = await getPossiblePrice(ANCHOR_BUSD_LP),
        apBlock = Number(await FarmService.pantherPerBlock()),
        taPoint = Number(await FarmService.totalAllocationPoint());
    lq && planet.setROI({
        lpWorth: lpw,
        liquidity: lq,
        allocPoint: aPoint,
        anchorPrice: aPrice,
        anchorPerBlock: apBlock,
        totalAllocPoint: taPoint,
    });
    return lq ? ((
        (aPoint / taPoint) * toDec(apBlock, 18) * 28800 * 365 * 100 * aPrice
        ) / lq).toFixed(2) : 0
    };

    const handleLiquidity = async (pair) => {
    if (isAddr(pair)) {
        const tkn = await ExchangeService.getTokens(pair);
        const resrv = await ExchangeService.getReserves(pair);
        const dec = await ContractServices.getDecimals(...tkn);
        let price = [
        await getDollarAPR(tkn[0]),
        await getDollarAPR(tkn[1])
        ]
        const totalSupply = await ExchangeService.getTotalSupply(pair);
        const tokenStaked = await ExchangeService.getTokenStaked(pair);
        return ((toDec(resrv[0], dec[0]) * price[0] +
            toDec(resrv[1], dec[1]) * price[1]) /
            totalSupply) *
        tokenStaked;
    }
    return 0;
    };

    const handleIcon = (sym) => {
    const o = isDefined(sym) ? TOKEN_LIST.find(d => rEq(d.symbol, sym)) : null;
    return isDefined(o) && o.icon;
    }

    const getAnchorDollarValue = async () => {

        if (poolInfo?.lpToken != undefined) {
            try {
            let reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
            let val = reserves[1] / reserves[0];
            val = val || 0;
            planet.setAnchorDollarValue(val.toFixed(3));
            return (val.toFixed(3));

            } catch (error) {
            console.log(error)
            }
        }
    };

    const getDollarAPR = async (address) => {
    try {

        if (address.toLowerCase() === TOKEN_LIST[1].address.toLowerCase()) {
        const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
        let val = reserves[1] / reserves[0];
        val = val || 0;
        planet.setAnchorDollarValue(val.toFixed(3));
        return (val.toFixed(3));
        } else if (address.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
        return 1;
        }
        else if (address.toLowerCase() != TOKEN_LIST[2].address.toLowerCase()) {

        const pair = await ExchangeService.getPairFromPancakeFactory(address, TOKEN_LIST[2].address);
        const reserves = await ExchangeService.getReserves(pair);
        let val = reserves[1] / reserves[0];
        val = val || 0;
        planet.setAnchorDollarValue(val.toFixed(3));
        return (val.toFixed(3));
        }

    } catch (error) {
        console.log(error)
    }
    }

    const earnedNiobValue = (_, rewards) => addCommas(Number(0.01 * rewards).toFixed(9));

    const earnedDollarValue = (valOf$, rewards) => addCommas(Number(valOf$ * rewards).toFixed(9));
    
    const cFarm = {
        init,
        handleIcon,
        beforeStake,
        getDollarAPR,
        earnedNiobValue,
        earnedDollarValue,
        handleTokenApproval,
        getAnchorDollarValue,
    }
    
    return cFarm;
}

export default useCFarm;