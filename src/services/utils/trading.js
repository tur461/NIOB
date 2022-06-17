import { ADDRESS, TOKENS, T_TYPE } from "../constant";
import log from "../logging/logger";
import { rEq } from "./global";

log.i('ALL TOKENS:', TOKENS);

const isEth = addr => rEq(addr, ADDRESS.NATIVE);

const isWeth = addr => rEq(addr, TOKENS.WETH.addr);

const try2weth = addr => rEq(addr, ADDRESS.NATIVE) ? TOKENS.WETH.addr : addr;

const isIP_A = ipt => rEq(ipt, T_TYPE.A);

const isIP_B = ipt => rEq(ipt, T_TYPE.B);

const togIP = ipt => rEq(ipt, T_TYPE.A) ? T_TYPE.B : T_TYPE.A;


export {
    isEth,
    togIP,
    isIP_A,
    isIP_B,
    isWeth,
    try2weth,
}