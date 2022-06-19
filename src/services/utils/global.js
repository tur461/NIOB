import { ADDRESS, MISC } from "../constant";
import { BigNumber } from "bignumber.js"

const zero = v => !!!v;

const obj2list = o => {
    let t = [];
    Object.keys(o).forEach(_ => t.push(o[_]));
    return [...t];
};

const isDefined = x => !!x;

const tgl = v => v-1 ? 1 : 2;

const toFlr = v => Math.floor(v);

const toBgFix = v => BigNumber(v).toFixed();

const isZero = addr => addr === ADDRESS.ZERO;

const contains = (s, c) => s.indexOf(c) > -1;

const isNonZero = addr => addr !== ADDRESS.ZERO;

const clone = o => JSON.parse(JSON.stringify(o));

const toDec = (v, dec) => Number(v) / 10 ** Number(dec);

const toFull = (v, dec) => Number(v) * 10 ** Number(dec);

const xpand  = v => v.toLocaleString('fullwide', {useGrouping: !1});

const tStamp = (a=0) => Math.floor(Date.now() / 1000) + a;

const iContains = (s, c) => s.toLowerCase().indexOf(c.toLowerCase()) > -1;

const hasVal = v => typeof v == 'string' && !v.length ? !1 : parseFloat(v) === 0 ? !1 : !0;

const rDefined = function() {
    for(let a=arguments, i=0, l=a.length; i<l;)
        if(!isDefined(a[i++])) return !1;
    return !0; 
}

const rEq = (x, y) => {
    return typeof x === 'string' ? 
    x.toLowerCase() === y.toLowerCase() :
    typeof x === 'number' ?
            x === y :
            typeof x === 'object' ?
                JSON.stringify(x) === JSON.stringify(y) : !1;
}

function isAddr(addr) {
    if(
        addr &&
        addr.length && 
        addr.length === 42 && 
        addr.substring(0,2) === '0x' && 
        addr !== ADDRESS.ZERO
    ) return !0;
    return !1;
}

const LS = {
    has: k => k in localStorage,
    getNum: k => Number(LS.get(k)),
    get: k => localStorage.getItem(k),
    add: (k, v) => localStorage.setItem(k, v),
    dec: k => localStorage.setItem(k, LS.getNum(k) - 1),
    inc: k => localStorage.setItem(k, LS.getNum(k) + 1),
}
const k = 'timeOut';
const typingGuard = (cbk, p) => {
    LS.has(k) && clearTimeout(LS.get(k));
    LS.add(k, setTimeout(_ => cbk(...p), MISC.TYPE_DELAY));
}

const indexOf = (s, q) => s.indexOf(q);

const validateTxParams = p => p.map(v => {

    if(v instanceof String) {
        const i = indexOf(v, '.');
        if(contains(v, '.')) return v.substring(0, i);
        return v;
    }
});

export {
    LS,
    rEq,
    zero,
    clone,
    toFlr,
    toDec,
    isAddr,
    toFull,
    tStamp,
    xpand,
    hasVal,
    isZero,
    toBgFix,
    obj2list,
    rDefined,
    contains,
    isDefined,
    iContains,
    isNonZero,
    typingGuard,
    validateTxParams,
}