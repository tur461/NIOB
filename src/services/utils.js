import { ADDRESS } from "../constant";

export const hasVal = v => v.length && parseFloat(v) > 0;

export const zero = v => !!!v;

export const isDefined = x => !!x;

export const isBnb = x => x === 'BNB';

export const tgl = v => v-1 ? 2 : 1;

export const isNonZero = addr => addr !== ADDRESS.ZERO;

export const toDec = (v, dec) => Number(v) / 10 ** Number(dec);

export const toFull = (v, dec) => Number(v) * 10 ** Number(dec);

export const tStamp = (a=0) => Math.floor(new Date().getTime() / 1000) + a;

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