import create from 'zustand';
import { T_TYPE } from "../../constant";



const useSwap = create((set, get) => ({

    exact: T_TYPE.A,

    hasPriceImpact: !1,
    
    minReceived: 0,

    openSwapModal: !1,

    priceImpact: 0,
    
    
    setSwapModel: s => {
        set(s => ({...s, openSwapModal: s}));
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