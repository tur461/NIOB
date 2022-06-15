import { ADDRESS, T_TYPE } from "../constant";
import { rEq } from "./global";

const isEth = addr => rEq(addr, ADDRESS.NATIVE);

const try2weth = addr => rEq(addr, ADDRESS.NATIVE) ? ADDRESS.WETH : addr;

const isIP_A = ipt => rEq(ipt, T_TYPE.A);

const isIP_B = ipt => rEq(ipt, T_TYPE.B);

const togIP = ipt => rEq(ipt, T_TYPE.A) ? T_TYPE.B : T_TYPE.A;


export {
    isEth,
    togIP,
    isIP_A,
    isIP_B,
    try2weth,
}