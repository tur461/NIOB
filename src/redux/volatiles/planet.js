import create from 'zustand';
import { clone } from '../../services/utils/global';

const initialState = {
    apr: 0,
    approvalConfirmation: !1,
    balance: 0,
    dollarValue: 0.01,
    liquidity: 0,
    lpTokenDetails: {},
    roi: {
        allocPoint: 0,
        totalAllocPoint: 0,
        anchorPerBlock: 0,
        anchorPrice: 0,
        liquidity: 0,
        lpWorth: 0,
    },
    showHarvest: !1,
    showIncrease: !1,
    stakeAmounts: { amount: 0, rewards: 0 },
    showApproveButton: !0,
    totalSupply: 0,
    worth: 0,
}

const usePlanet = create((set, get) => ({
    ...clone(initialState),
    
    setROI: v => {
        set(s => ({...s, roi: {...v}}));
    },
    setApr: v => {
        set(s => ({...s, apr: v}));
    },
    setWorth: v => {
        set(s => ({...s, worth: v}));
    },
    setBalance: v => {
        set(s => ({...s, balance: v}));
    },
    setLiquidity: v => {
        set(s => ({...s, liquidity: v}));
    },
    setTotalSupply: v => {
        set(s => ({...s, totalSupply: v}));
    },
    setShowIncrease: v => {
        set(s => ({...s, showIncrease: v}));
    },
    setStakeAmounts: v => {
        set(s => ({...s, stakeAmounts: {...v}}));
    },
    setLpTokenDetails: v => {
        set(s => ({...s, lpTokenDetails: v}));
    },
    
    setShowHarvest: v => {
        set(s => ({...s, showHarvest: v}));
    },
    setShowApproveButton: v => {
        set(s => ({...s, showApproveButton: v}));
    },
    setApprovalConfirmation: v => {
        set(s => ({...s, approvalConfirmation: v}));
    },
    setAnchorDollarValue: v => {
        set(s => ({...s, dollarValue: v}));
    },
    reset: _ => set(s => ({...clone(initialState)})),
    
}))

export default usePlanet;