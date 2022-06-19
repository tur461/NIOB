import { ABI } from "../constant";
import { Web_3, _call, _send } from "./Common";
import { toDec } from "../utils/global";

const TokenContract = (_ => {
    let _inst = {};
    let inst = null,p=[];
    
    const gas = (m, p, from) => inst.methods[m](...p).estimateGas({from});
    const getInstance = a => a in _inst ? _inst[a] : (_inst[a] = new (Web_3()).eth.Contract(ABI.TOKEN, a));
    return {
        setTo: a => inst = getInstance(a),
        get inst() { return inst},
        _get: a => getInstance(a),
        hasInst: _ => !!inst,
        name: _ => _call(inst, 'name'),
        symbol: _ => _call(inst, 'symbol'),
        decimals: _ => _call(inst, 'decimals'),
        allowanceOf: p => _call(inst, 'allowance', p),
        getPairDec: pr => Promise.all([
            _call(TokenContract._get(pr[0]), 'decimals'), 
            _call(TokenContract._get(pr[1]), 'decimals')
        ]),
        balanceOf: async p => toDec(
            await _call(inst, 'balanceOf', p), 
            await _call(inst, 'decimals')
        ),
        totalSupply: async _ => toDec(
            await _call(inst, 'totalSupply'), 
            await _call(inst, 'decimals')
        ),
        approve: async (xtra, p) => {
            return _send(null, inst, 'approve', xtra, p);
        },
    }
})();

export default TokenContract;