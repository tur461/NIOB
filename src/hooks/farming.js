import { rootName } from "../constant";
import { BigNumber } from "bignumber.js";
import { toast } from "../components/Toast/Toast";
import useCommon from "../redux/volatiles/common";
import useFarming from "../redux/volatiles/farming";
import { FarmService } from "../services/FarmService";
import { useDispatch, useSelector } from "react-redux";
import { ContractServices } from "../services/ContractServices";
import { addTransaction, startLoading, stopLoading } from "../redux/actions";
import { isDefined, rEq, toBgFix, toDec, toFull } from "../services/utils";


const useFarmer = (props) => {
    const dsp = useDispatch();
    const common = useCommon(s => s);
    const farming = useFarming(s => s);
    const P = useSelector(s => s.persist);

    const handleClose = _ => {
        farming.setStakeValue(null);
        farming.setShowStake(!1);
    };
    const handleWithdrawClose = _ => {
        farming.setStakeValue(null);
        farming.setShowStakeWithdraw(!1);
    };
    const closeRoiModal = _ => farming.setShowAPY(!1);

    const handleChange = _ => farming.setChecked(!farming.checked);

    const handleTab = d => props.history.push(`${rootName}/farmplanets/${d}`);

    const setMaxValue = _ => farming.setStakeValue(farming.stakeData.balance);
    
    const handleStakeValue = ({target}) => farming.setStakeValue(target.value);

    const handleIndex = i => farming.setCurrentIndex(rEq(farming.currentIndex, i) ? -1 : i);

    const closeTransactionModal = _ => {
        farming.setFarms([]);
        farming.setStakingOnly([]);
        farming.setInactiveFarms([]);
        farming.setShowTransactionModal(!1);
        props.init();
        window.location.reload();
    };
    
    const handleRoiModal = (data, lpDetails) => {
        farming.setShowAPY(!0);
        farming.setRoiModalData(data);
        farming.setLpTokenDetails(lpDetails);
    };

    const closeStakeModal = () => {
        farming.setShowStake(!1);
        farming.setStakeValue(0);
        farming.setStakeData(null);
        farming.setShowStakeWithdraw(!1);
    };

    const stakeHandle = (d, t) => {
        farming.setStakeData(d);
        farming.setSelectedPairId(d.pid);
        rEq(t, 'deposit') && farming.setShowStake(!0);
        rEq(t, 'withdraw') && farming.setShowStakeWithdraw(!0);
    };

    const harvest = async (pid, lpTokenName) => {
        const acc = await ContractServices.getDefaultAccount();
        if (isDefined(acc) && rEq(acc, P.priAccount)) return toast.error('Wallet address doesn\'t match!');
        if (farming.stakeConfirmation) return toast.info('Transaction is processing!');
        console.log('harvesting..')
        try {
            dsp(startLoading());
            farming.setStakeConfirmation(!0);
            const tx = await FarmService.deposit({
                amount: 0,
                pid: `${pid}`,
                from: P.priAccount,
                referrer: farming.referrer,
            });
            if (tx) {
                common.setTxHash(tx);
                farming.setShowTransactionModal(!0);
                dsp(addTransaction({tx, message: `Harvest ${lpTokenName}`}));
            }
        } catch (e) {
            console.log('lp harvest err:', e);
            const m = await ContractServices.web3ErrorHandle(e);
            toast.error(m);
        } finally {
            dsp(stopLoading());
            farming.setStakeConfirmation(!1);
        }
    };

    const depositWithdraw = async (t) => {
        const acc = await ContractServices.getDefaultAccount();
        if (isDefined(acc) && rEq(acc, P.priAccount)) return toast.error('Wallet address doesn\'t match!');
        const v = Number(farming.stakeValue);
        if (isNaN(v)) return toast.error('Enter valid amount!');
        if (v <= 0) return toast.error('Enter amount greater than zero!');
        if (v > farming.stakeData.balance) return toast.error('Value is greater than max value!');
        if (!farming.stakeData) return toast.info('Reload page try again!');
        if (farming.stakeConfirmation) return toast.info('Transaction is processing!');
        try {
            closeStakeModal();
            dsp(startLoading());
            farming.setStakeConfirmation(!0);
            const tx = await FarmService[t]({
                from: P.priAccount,
                referrer: farming.referrer,
                pid: `${farming.stakeData.pid}`,
                amount: toBgFix(toFull(v, farming.stakeData.lpTokenDetails.decimals)),
            });

            if (tx) {
                common.setTxHash(tx);
                farming.setShowTransactionModal(!0);
                dsp(addTransaction({ tx, message: `${t} ${farming.stakeData.lpTokenDetails.lpTokenName}`}));
            }
        } catch (e) {
            console.log(`lp ${t} err:`, e);
            toast.error(await ContractServices.web3ErrorHandle(e));
        } finally {
            dsp(stopLoading());
            farming.setStakeConfirmation(!1);
        }
    };

    const Farmer = {
        harvest,
        handleTab,
        stakeHandle,
        handleIndex,
        setMaxValue,
        handleClose,
        handleChange,
        closeRoiModal,
        handleRoiModal,
        depositWithdraw,
        handleStakeValue,
        handleWithdrawClose,
        closeTransactionModal,
    }
    return Farmer;
} 

export default useFarmer;