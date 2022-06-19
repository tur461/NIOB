import { Web_3, _call } from "./Common";
import { toDec } from "../utils/global";
import { ABI, ADDRESS } from "../constant";

const PairContract = (_ => {
    let inst = null;
    
    return {
        setTo: a => inst = new (Web_3()).eth.Contract(ABI.PAIR, a),
        create: a => new (Web_3()).eth.Contract(ABI.PAIR, a),
        getReserves: _ => _call(inst, 'getReserves'),
        getTokens: _ => Promise.all([_call(inst, 'token0'), _call(inst, 'token1')]),
    }
})();

export default PairContract;