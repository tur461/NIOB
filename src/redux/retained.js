import create from 'zustand';
import {persist} from 'zustand/middleware';

const useRetained = create(persist((set, get) => ({
    errs: [],
    addErr: (err, loc, dat) => set(s => ({...s, errs: [...s.errs, {...err, loc, dat: dat || null}]})),    
    noErr: _ => get().errs.length === 0,   
    remErr: id => {
        const errs = get().errs, i = errs.find(err => err.id === id);
        set(s => ({...s, errs: errs.splice(i, 1)}));
    },
    resetErrs: _ => set(s => ({...s, err: []})),  
})));

export default useRetained;