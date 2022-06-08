import create from 'zustand';
import { ADDRESS } from '../../constant';

const useFarming = create((set, get) => ({
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
        set(s => ({...s, farms: [...s.farms, {...v}]}));
    },
    setInactiveFarms: v => {
        set(s => ({...s, inactiveFarms: [...s.inactiveFarms, {...v}]}));
    },
    setStakingOnly: v => {
        set(s => ({...s, stakingOnly: [...s.stackingOnly, {...v}]}));
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
}))

export default useFarming;