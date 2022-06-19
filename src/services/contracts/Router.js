import { ABI, ADDRESS } from "../constant";
import { toDec } from "../utils/global";
import { Web_3, _call, _send } from "./Common";

const RouterContract = (_ => {
    let abi = ABI.ROUTER, inst = new (Web_3()).eth.Contract(abi, ADDRESS.ROUTER);
    
    const gas = (m, p, from) => inst.methods[m](...p).estimateGas({from});
    return {
        create: a => new (Web_3()).eth.Contract(ABI.ROUTER, a),
        getAmountsIn: p =>  _call(inst, 'getAmountsIn', p),
        getAmountsOut: p => _call(inst, 'getAmountsOut', p),



        addLiquidity: (xtra, p) => {
            return _send(abi, inst, 'addLiquidity', xtra, p);
        },

        addLiquidityEth: (xtra, p) => {
            return _send(abi, inst, 'addLiquidityETH', xtra, p);
        },
        
        removeLiquidityWithPermit: (xtra, p) => {
            return _send(abi, inst, 'removeLiquidityWithPermit', xtra, p);
        },
        removeLiquidityETHWithPermit: (xtra, p) => {
            return _send(abi, inst, 'removeLiquidityETHWithPermit', xtra, p);
        },

        // exact first token - non-exact 2nd eth
        swapExactTokensForETH: (xtra, p) => {
            return _send(abi, inst, 'swapExactTokensForETH', xtra, p);
        },
        // non-exact first token - exact 2nd eth
        swapTokensForExactETH: (xtra, p) => {
            return _send(abi, inst, 'swapTokensForExactETH', xtra, p);
        },
        swapExactETHForTokens: (xtra, p) => {
            return _send(abi, inst, 'swapExactETHForTokens', xtra, p);
        },
        // non-exact first eth - exact 2nd token
        swapETHForExactTokens: (xtra, p) => {
            return _send(abi, inst, 'swapETHForExactTokens', xtra, p);
        },
        // exact first token - non-exact 2nd token
        swapExactTokensForTokens: (xtra, p) => {
            return _send(abi, inst, 'swapExactTokensForTokens', xtra, p);
        },
        // non-exact first token - exact 2nd token
        swapTokensForExactTokens: (xtra, p) => {
            return _send(abi, inst, 'swapTokensForExactTokens', xtra, p);
        },

        swapExactTokensForTokensSupportingFeeOnTransferTokens: (xtra, p) => {

        },
        
        swapExactTokensForTokensSupportingFeeOnTransferTokens: (xtra, p) => {

        },

        
    }
})();

export default RouterContract;