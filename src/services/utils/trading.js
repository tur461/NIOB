import { T_TYPE } from "../../constant";
import { rEq } from "./global";

export const isIP_A = ipt => rEq(ipt, T_TYPE.A);

export const isIP_B = ipt => rEq(ipt, T_TYPE.B);

export const togIP = ipt => rEq(ipt, T_TYPE.A) ? T_TYPE.B : T_TYPE.A;
