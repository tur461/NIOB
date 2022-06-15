import { ADDRESS } from "../constant";
import { BigNumber } from "bignumber.js"

export const zero = v => !!!v;


export const isDefined = x => !!x;

export const tgl = v => v-1 ? 1 : 2;

export const toFlr = v => Math.floor(v);

export const toBgFix = v => BigNumber(v).toFixed();

export const isZero = addr => addr === ADDRESS.ZERO;

export const contains = (s, c) => s.indexOf(c) > -1;

export const isNonZero = addr => addr !== ADDRESS.ZERO;

export const toDec = (v, dec) => Number(v) / 10 ** Number(dec);

export const toFull = (v, dec) => Number(v) * 10 ** Number(dec);

export const tStamp = (a=0) => Math.floor(new Date().getTime() / 1000) + a;

export const iContains = (s, c) => s.toLowerCase().indexOf(c.toLowerCase()) > -1;

export const hasVal = v => typeof v == 'string' && !v.length ? !1 : parseFloat(v) === 0 ? !1 : !0;

export const obj2list = o => {
    let t = [];
    Object.keys(o).forEach(_ => t.push(o[_]));
    return [...t];
};

export const rDefined = function() {
    for(let a=arguments, i=0, l=a.length; i<l;)
        if(!isDefined(a[i++])) return !1;
    return !0; 
}

export const rEq = (x, y) => {
    return typeof x === 'string' ? 
    x.toLowerCase() === y.toLowerCase() :
    typeof x === 'number' ?
            x === y :
            typeof x === 'object' ?
                JSON.stringify(x) === JSON.stringify(y) : !1;
}

export function isAddr(addr) {
    if(
        addr &&
        addr.length && 
        addr.length === 42 && 
        addr.substring(0,2) === '0x' && 
        addr !== ADDRESS.ZERO
    ) return !0;
    return !1;
}

export const LS = {
    has: k => k in localStorage,
    getNum: k => Number(LS.get(k)),
    get: k => localStorage.getItem(k),
    add: (k, v) => localStorage.setItem(k, v),
    dec: k => localStorage.setItem(k, LS.getNum(k) - 1),
    inc: k => localStorage.setItem(k, LS.getNum(k) + 1),
}