import create from 'zustand';
import { T_TYPE } from "../../services/constant";



const useSwap = create((set, get) => ({

    exact: T_TYPE.A,

    hasPriceImpact: !1,
    
    minReceived: 0,

    isSwapModalOpen: !1,

    priceImpact: 0,
    
    
    openSwapModal: _ => {
        set(s => ({...s, isSwapModalOpen: !0}));
    },
    closeSwapModal: _ => {
        set(s => ({...s, isSwapModalOpen: !1}));
    },
    setPriceImpact: priceImpact => {
        set(s => ({...s, priceImpact}));
    },
    setHasPriceImpact: hasPriceImpact => {
        set(s => ({...s, hasPriceImpact}));
    },
    setExact: tt => {
        set(s => ({...s, exact: tt}));
    },
    setMinReceived: mr => {
        set(s => ({...s, minReceived: mr}));
    },
}))

export default useSwap;