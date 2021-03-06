import { BigNumber } from "bignumber.js"
import { ADDRESS, MISC, TX_ERR } from "../constant";
import log from "../logging/logger";

const zero = v => !!!v;

const obj2list = o => {
    let t = [];
    Object.keys(o).forEach(_ => t.push(o[_]));
    return [...t];
};

const isDefined = x => !!x;

const toFlr = v => Math.floor(v);

const toBgFix = v => BigNumber(v).toFixed();

const contains = (s, c) => s.indexOf(c) > -1;

const clone = o => JSON.parse(JSON.stringify(o));

const toDec = (v, dec) => Number(v) / 10 ** Number(dec);

const toFull = (v, dec) => Number(v) * 10 ** Number(dec);

const tStamp = (a=0) => Math.floor(Date.now() / 1000) + a;

const xpand  = v => v.toLocaleString('fullwide', {useGrouping: !1});

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

const _remPoint = v => {
    v = `${v}`;
    const i = indexOf(v, '.');
    if(contains(v, '.')) return v.substring(0, i);
    return v;
}

const remPoint = p => {
    return p instanceof Array ? p.map(v => {
    if(v instanceof String) _remPoint(v)
    return v;
}) : p instanceof Object ? Object.keys(p).reduce((a, b) => {
    if(p[b] instanceof String) a[b] = _remPoint(p[b])
    else a[b] = p[b];
    return a;
}, {}) : p instanceof String ? _remPoint(p) : p;
}

const hasPoint = s => {
    s = `${s}`;
    return s.indexOf('.') >= 0;
}

const fixBy = (s, n=3) => {
    s = s+''
    s = s.substring(0, indexOf(s, '.')+n+1)
    return s.length > indexOf(s, '.') + n+1 ? s.substring(0, 5) + '..' : s;
}

const parseTxErr = e => {
    const errs = Object.keys(TX_ERR);
    for(let i=0,j=[]; i<errs.length; ++i) {
        j = TX_ERR[errs[i]].split(':');
        if(iContains(
            rEq(typeof e, 'object') ? 
            (e.message || e.reason) : 
            rEq(typeof e,'string') ? 
            e : '', 
            j[0])
        ) return j[1];
    }
    return TX_ERR.DEF;
}

const formatRaw = (v, d) => {
    v = toFull(v, d);
    v = xpand(v);
    v = _remPoint(v);
    return v;
}
const formatOk = (v, d) => {
    if(hasPoint(v)) return v;
    v = toDec(v, d);
    return Number(v);
}

const swap = v => {
    v = [...v];
    const t = v[0]; v[0] = v[1]; v[1] = t;
    return [...v];
}

export {
    LS,
    rEq,
    zero,
    swap,
    clone,
    toFlr,
    fixBy,
    toDec,
    isAddr,
    toFull,
    tStamp,
    xpand,
    hasVal,
    toBgFix,
    obj2list,
    hasPoint,
    remPoint,
    rDefined,
    formatOk,
    contains,
    isDefined,
    iContains,
    formatRaw,
    parseTxErr,
    typingGuard,
}