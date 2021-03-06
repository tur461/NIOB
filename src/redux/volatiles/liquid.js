import create from 'zustand';

const useLiquid = create((set, get) => ({
    someState: 'initial value',

    setSomeState: val => {
        set(s => ({...s, someState: val}));
    },
}))

export default useLiquid;