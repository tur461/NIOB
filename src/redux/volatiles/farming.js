import create from 'zustand';

const useFarming = create((set, get) => ({
    someState: 'initial value',

    setSomeState: val => {
        set(s => ({...s, someState: val}));
    },
}))

export default useFarming;