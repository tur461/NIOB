import create from 'zustand';
import { ADDRESS } from '../../services/constant';
import { clone } from '../../services/utils/global';

const initialState = {
    checked: !1,
    currentIndex: -1,
    
    farms: [],
    
    inactiveFarms: [],
    
    lpDetails: null,
    
    poolLength: 0,
    
    roiModalData: null,
    referrer: ADDRESS.ZERO,
    
    showAPY: !1,
    showStake: !1,
    stakeValue: 0,
    stakeData: null,
    selectedPairId: '',
    stakingOnly: [],
    stakeConfirmation: 0,
    showStakeWithdraw: !1,
    showTransactionModal: !1,
}

const useFarming = create((set, get) => ({
    ...clone(initialState),
    setSomeState: val => {
        set(s => ({...s, someState: val}));
    },
    setChecked: ch => {
        set(s => ({...s, checked: ch}));
    },
    setCurrentIndex: i => {
        set(s => ({...s, currentIndex: i}));
    },
    setShowStake: sh => {
        set(s => ({...s, showStake: sh}));
    },
    setShowStakeWithdraw: sh => {
        set(s => ({...s, showStakeWithdraw: sh}));
    },
    setShowAPY: sh => {
        set(s => ({...s, showAPY: sh}));
    },
    setRoiModalData: d => {
        set(s => ({...s, roiModalData: d}));
    },
    setPoolLength: l => {
        set(s => ({...s, poolLength: l}));
    },
    setFarms: v => {
        let a = [...get().farms]; a.push(v);
        set(s => ({...s, farms: [...a]}));
    },
    setInactiveFarms: v => {
        let a = [...get().inactiveFarms]; a.push(v);
        set(s => ({...s, inactiveFarms: [...a]}));
    },
    setStakingOnly: v => {
        let a = [...get().stakingOnly]; a.push(v);
        set(s => ({...s, stakingOnly: [...a]}));
    },

    setStakeData: d => {
        set(s => ({...s, stakeData: d}));
    },

    setStakeValue: v => {
        set(s => ({...s, stakeValue: v}));
    },

    setReferrer: ref => {
        set(s => ({...s, referrer: ref}));
    },

    setLpTokenDetails: det => {
        set(s => ({...s, lpDetails: det}));
    },

    setSelectedPairId: id => {
        set(s => ({...s, selectedPairId: id}));
    },
    setStakeConfirmation: cnf => {
        set(s => ({...s, stakeConfirmation: cnf}));
    },
    setShowTransactionModal: sh => {
        set(s => ({...s, showTransactionModal: sh}));
    },
    reset: _ => set(s => ({...clone(initialState)})),
}))

export default useFarming;