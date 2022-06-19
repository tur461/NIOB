import { ABI, ADDRESS } from "../constant";
import { toDec } from "../utils/global";
import { Web_3, _call, _send } from "./Common";

const FactoryContract = (_ => {
    let inst = new (Web_3()).eth.Contract(ABI.FACTORY, ADDRESS.FACTORY), p=[];
    
    const gas = (m, p, from) => inst.methods[m](...p).estimateGas({from});
    return {
        create: a => new (Web_3()).eth.Contract(ABI.ROUTER, a),
        allPairs: _ => _call(inst, 'allPairs'),
        getPair: p => _call(inst, 'getPair', p),
        
    }
})();

export default FactoryContract;