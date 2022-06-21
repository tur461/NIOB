import create from 'zustand';
import {persist} from 'zustand/middleware';
import { TOKENS, TOKEN_LIST } from '../services/constant';
import { rEq } from '../services/utils/global';

const useRetained = create(persist((set, get) => ({
    errs: [],
    tokenList: TOKEN_LIST,
    tokenListBackup: TOKEN_LIST,
    setTokenDisabled: addr => {
        let tList = get().tokenListBackup;
        for(let i=0; i<tList.length; ++i) 
            if(rEq(tList[i].addr, addr)) {
                tList[i].isDisabled = !0;
                break;
            } else tList[i].isDisabled = !1;
        set(s => ({...s, tokenList: tList}));
    },
    setTokenList: l => set(s => ({...s, tokenList: [...l]})),
    add2TokenListBackup: o => set(s => ({...s, tokenListBackup: [...get().tokenListBackup, o]})),
    addErr: (err, loc, dat) => set(s => ({...s, errs: [...s.errs, {...err, loc, dat: dat || null}]})),    
    noErr: _ => get().errs.length === 0,   
    remErr: id => {
        const errs = get().errs, i = errs.find(err => err.id === id);
        set(s => ({...s, errs: errs.splice(i, 1)}));
    },
    resetErrs: _ => set(s => ({...s, err: []})),  
})));

export default useRetained;