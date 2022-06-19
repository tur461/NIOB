// // import Web3 from "web3"
// import { WETH, DEFLATIONNARY_TOKENS } from "../assets/tokens"
// import { toast } from "../components/Toast/Toast";
// import { ContractServices } from "./ContractServices";
// import { BigNumber } from "bignumber.js";
// import { toDec, toFull } from "./utils/global";
// import log from "./logging/logger";

// const _getAmounts = async (amount, pair, isIn) => {
//   let contract = RouterContract();
//   TokenContract.setTo(pair[0]);
//   console.log('is in', isIn)
//   let dec = await TokenContract.decimals(),
//       decAmountIn = BigNumber(toFull(amount, dec)).toFixed(),
//       res = await (
//         isIn ? 
//         contract.methods.getAmountsIn(decAmountIn, pair) : 
//         contract.methods.getAmountsOut(decAmountIn, pair)
//       ).call();
  
//   let amounts = [];
//   for (
//     let i = 0; 
//     i < res.length; 
//     TokenContract.setTo(pair[i]), amounts.push(toDec(res[i++], await TokenContract.decimals()))
//   );
//   return amounts;
// }

// const getAmountsOut = (amountIn, pair) => _getAmounts(amountIn, pair, !1);

// const getAmountsIn = (amountOut, pair) => _getAmounts(amountOut, pair, !0);

// const getTotalSupply = async (pairAddr) => {
//     const con = PairContract(pairAddr);
//     return Number(toDec(
//       await con.methods.totalSupply().call(), 
//       await con.methods.decimals().call()
//     ).toFixed(5));
// }

// // ----------------------------------LIQUIDITY-----------------------------

// const addLiquidity = async data => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         tokenA,
//         tokenB,
//         amountADesired,
//         amountBDesired,
//         amountAMin,
//         amountBMin,
//         to,
//         deadline,
//         value
//       } = data;
//       const web3 = ContractServices.Web_3();
//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();

//       const gas = await contract.methods.addLiquidity(
//         tokenA,
//         tokenB,
//         amountADesired,
//         amountBDesired,
//         amountAMin,
//         amountBMin,
//         to,
//         deadline
//       ).estimateGas({ from: to });
//       value = await web3.utils.toHex(value);

//       contract.methods.addLiquidity(
//         tokenA,
//         tokenB,
//         amountADesired,
//         amountBDesired,
//         amountAMin,
//         amountBMin,
//         to,
//         deadline
//       ).send({ from: to, gasPrice, gas, value })
//         .on('transactionHash', (hash) => {
//           resolve(hash);
//         })
//         .on('receipt', (receipt) => {
//           toast.success('Liquidity added successfully.');
//         })
//         .on('error', (error, receipt) => {
//           reject(error);
//         });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }
// const addLiquidityETH = async (data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         otherTokenzAddr,
//         amountTokenDesired,
//         amountTokenMin,
//         amountETHMin,
//         to,
//         deadline,
//         ethValue
//       } = data;
//       const web3 = ContractServices.Web_3();
//       ethValue = await web3.utils.toHex(ethValue);

//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();
//       // ethValue = await web3.utils.toHex(ethValue);

//       const gas = await contract.methods.addLiquidityETH(
//         otherTokenzAddr,
//         amountTokenDesired,
//         amountTokenMin,
//         amountETHMin,
//         to,
//         deadline
//       ).estimateGas({ from: to, ethValue });

//       contract.methods.addLiquidityETH(
//         otherTokenzAddr,
//         amountTokenDesired,
//         amountTokenMin,
//         amountETHMin,
//         to,
//         deadline
//       ).send({ from: to, gasPrice, gas, ethValue })
//         .on('transactionHash', (hash) => {
//           resolve(hash);
//         })
//         .on('receipt', (receipt) => {
//           toast.success('Liquidity added successfully.');
//         })
//         .on('error', (error, receipt) => {
//           reject(error);
//         });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }
// const removeLiquidityWithPermit = async (data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         tokenA,
//         tokenB,
//         liquidity,
//         amountAMin,
//         amountBMin,
//         to,
//         deadline,
//         value,
//         approveMax,
//         v, r, s, checkSignature
//       } = data;
//       const web3 = ContractServices.Web_3();
//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();

//       if (checkSignature) {

//         const gas = await contract.methods.removeLiquidityWithPermit(
//           tokenA,
//           tokenB,
//           liquidity,
//           amountAMin,
//           amountBMin,
//           to,
//           deadline,
//           approveMax,
//           v, r, s
//         ).estimateGas({ from: to });
//         value = await web3.utils.toHex(value);

//         contract.methods.removeLiquidityWithPermit(
//           tokenA,
//           tokenB,
//           liquidity,
//           amountAMin,
//           amountBMin,
//           to,
//           deadline,
//           approveMax,
//           v, r, s
//         ).send({ from: to, gasPrice, gas, value })
//           .on('transactionHash', (hash) => {
//             resolve(hash);
//           })
//           .on('receipt', (receipt) => {
//             console.log(receipt, 'in service add liquidity')
//             toast.success('Liquidity removed successfully.');
//           })
//           .on('error', (error, receipt) => {
//             reject(error);
//           });
//       } else {
//         const gas = await contract.methods.removeLiquidity(
//           tokenA,
//           tokenB,
//           liquidity,
//           amountAMin,
//           amountBMin,
//           to,
//           deadline
//         ).estimateGas({ from: to });
//         value = await web3.utils.toHex(value);

//         contract.methods.removeLiquidity(
//           tokenA,
//           tokenB,
//           liquidity,
//           amountAMin,
//           amountBMin,
//           to,
//           deadline
//         ).send({ from: to, gasPrice, gas, value })
//           .on('transactionHash', (hash) => {
//             resolve(hash);
//           })
//           .on('receipt', (receipt) => {
//             console.log(receipt, 'in service add liquidity')
//             toast.success('Liquidity removed successfully.');
//           })
//           .on('error', (error, receipt) => {
//             reject(error);
//           });
//       }
//     } catch (error) {
//       reject(error);
//     }
//   });
// }
// const removeLiquidityETHWithPermit = async (data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         token,
//         liquidity,
//         amountTokenMin,
//         amountETHMin,
//         to,
//         deadline,
//         value,
//         approveMax, v, r, s, checkSignature
//       } = data;
//       value = '0';

//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();

//       if (checkSignature) {

//         // for Anchor Tokens
//         const supportingCheck = DEFLATIONNARY_TOKENS.find(ele => ele.toLowerCase() === token.toLowerCase());

//         if (supportingCheck) {
//           const gas = await contract.methods.removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
//             token,
//             liquidity,
//             amountTokenMin,
//             amountETHMin,
//             to,
//             deadline,
//             approveMax,
//             v, r, s
//           ).estimateGas({ from: to, value });

//           contract.methods.removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
//             token,
//             liquidity,
//             amountTokenMin,
//             amountETHMin,
//             to,
//             deadline,
//             approveMax,
//             v, r, s
//           ).send({ from: to, gasPrice, gas, value })
//             .on('transactionHash', (hash) => {
//               resolve(hash);
//             })
//             .on('receipt', (receipt) => {
//               console.log(receipt, 'in service add liquidity')
//               toast.success('Liquidity removed successfully.');
//             })
//             .on('error', (error, receipt) => {
//               reject(error);
//             });
//         } else {
//           const gas = await contract.methods.removeLiquidityETHWithPermit(
//             token,
//             liquidity,
//             amountTokenMin,
//             amountETHMin,
//             to,
//             deadline,
//             approveMax,
//             v, r, s
//           ).estimateGas({ from: to, value });

//           contract.methods.removeLiquidityETHWithPermit(
//             token,
//             liquidity,
//             amountTokenMin,
//             amountETHMin,
//             to,
//             deadline,
//             approveMax,
//             v, r, s
//           ).send({ from: to, gasPrice, gas, value })
//             .on('transactionHash', (hash) => {
//               resolve(hash);
//             })
//             .on('receipt', (receipt) => {
//               console.log(receipt, 'in service add liquidity')
//               toast.success('Liquidity removed successfully.');
//             })
//             .on('error', (error, receipt) => {
//               reject(error);
//             });
//         }
//       } else {//without permit
//         // for Anchor Tokens
//         const supportingCheck = DEFLATIONNARY_TOKENS.find(ele => ele.toLowerCase() === token.toLowerCase());

//         if (supportingCheck) {
//           const gas = await contract.methods.removeLiquidityETHSupportingFeeOnTransferTokens(
//             token,
//             liquidity,
//             amountTokenMin,
//             amountETHMin,
//             to,
//             deadline
//           ).estimateGas({ from: to, value });

//           contract.methods.removeLiquidityETHSupportingFeeOnTransferTokens(
//             token,
//             liquidity,
//             amountTokenMin,
//             amountETHMin,
//             to,
//             deadline
//           ).send({ from: to, gasPrice, gas, value })
//             .on('transactionHash', (hash) => {
//               resolve(hash);
//             })
//             .on('receipt', (receipt) => {
//               console.log(receipt, 'in service add liquidity')
//               toast.success('Liquidity removed successfully.');
//             })
//             .on('error', (error, receipt) => {
//               reject(error);
//             });
//         } else {
//           const gas = await contract.methods.removeLiquidityETH(
//             token,
//             liquidity,
//             amountTokenMin,
//             amountETHMin,
//             to,
//             deadline
//           ).estimateGas({ from: to, value });

//           contract.methods.removeLiquidityETH(
//             token,
//             liquidity,
//             amountTokenMin,
//             amountETHMin,
//             to,
//             deadline
//           ).send({ from: to, gasPrice, gas, value })
//             .on('transactionHash', (hash) => {
//               resolve(hash);
//             })
//             .on('receipt', (receipt) => {
//               console.log(receipt, 'in service add liquidity')
//               toast.success('Liquidity removed successfully.');
//             })
//             .on('error', (error, receipt) => {
//               reject(error);
//             });
//         }
//       }
//     } catch (error) {
//       console.log('remove liquidity issue', '------------', error)
//       reject(error);
//     }
//   });
// }

// // -------------------------------------------------------------------------
// // ----------------------------------SWAPPING-------------------------------
// const swapExactTokensForTokens = async (data, a1, a2) => {
//   return new Promise(async (resolve, reject) => {

//     let {
//       amountIn,
//       amountOutMin,
//       path,
//       to,
//       deadline,
//       value
//     } = data;

//     const web3 = ContractServices.Web_3();
//     const contract = RouterContract();
//     const gasPrice = await ContractServices.getGasPrice();
//     const checkDeflationnaryTokens = DEFLATIONNARY_TOKENS.find(element => element.toLowerCase() === a1.toLowerCase());

//     if (checkDeflationnaryTokens) {
//       try {
//         const gas = await contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
//           amountIn,
//           amountOutMin,
//           path,
//           to,
//           deadline
//         ).estimateGas({ from: to });

//         value = await web3.utils.toHex(value);

//         contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
//           amountIn,
//           amountOutMin,
//           path,
//           to,
//           deadline
//         ).send({ from: to, gasPrice, gas, value })
//           .on('transactionHash', (hash) => {
//             resolve(hash);
//           })
//           .on('receipt', (receipt) => {
//             console.log(receipt, 'in service add liquidity')
//             toast.success('Swap transaction executed successfully');
//           })
//           .on('error', (error, receipt) => {
//             reject(error);
//           });
//       } catch (error) {
//         reject(error);
//       }

//     } else {
//       try {
//         const gas = await contract.methods.swapExactTokensForTokens(
//           amountIn,
//           amountOutMin,
//           path,
//           to,
//           deadline
//         ).estimateGas({ from: to });

//         value = await web3.utils.toHex(value);

//         contract.methods.swapExactTokensForTokens(
//           amountIn,
//           amountOutMin,
//           path,
//           to,
//           deadline
//         ).send({ from: to, gasPrice, gas, value })
//           .on('transactionHash', (hash) => {
//             resolve(hash);
//           })
//           .on('receipt', (receipt) => {
//             console.log(receipt, 'in service add liquidity')
//             toast.success('Swap transaction executed successfully');
//           })
//           .on('error', (error, receipt) => {
//             reject(error);
//           });
//       } catch (error) {
//         reject(error);
//       }
//     }
//   });
// }

// const swapTokensForExactTokens = async (data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         amountIn,
//         amountOutMin,
//         path,
//         to,
//         deadline,
//         value
//       } = data;

//       const web3 = ContractServices.Web_3();
//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();
//       const gas = await contract.methods.swapTokensForExactTokens(
//         amountIn,
//         amountOutMin,
//         path,
//         to,
//         deadline
//       ).estimateGas({ from: to });
//       value = await web3.utils.toHex(value);
//       contract.methods.swapTokensForExactTokens(
//         amountIn,
//         amountOutMin,
//         path,
//         to,
//         deadline
//       ).send({ from: to, gasPrice, gas, value })
//         .on('transactionHash', (hash) => {
//           resolve(hash);
//         })
//         .on('receipt', (receipt) => {
//           console.log(receipt, 'in service add liquidity')
//           toast.success('Swap transaction executed successfully');
//         })
//         .on('error', (error, receipt) => {
//           reject(error);
//         });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// const swapExactETHForTokens = async (data, handleBalance) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         amountOutMin,
//         path,
//         to,
//         deadline,
//         value
//       } = data;
//       log.i('swapExactETHForTokens:', data);
//       const web3 = ContractServices.Web_3();
//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();
//       const gas = await contract.methods.swapExactETHForTokens(
//         amountOutMin,
//         path,
//         to,
//         deadline
//       ).estimateGas({ from: to, value });

//       value = await web3.utils.toHex(value);
//       contract.methods.swapExactETHForTokens(
//         amountOutMin,
//         path,
//         to,
//         deadline
//       ).send({ from: to, gasPrice, value })
//         .on('transactionHash', (hash) => {
//           resolve(hash);
//         })
//         .on('receipt', _ => {
//           handleBalance();
//           toast.success('Swap transaction executed successfully');
//         })
//         .on('error', (err, _) => {
//           reject(err);
//         });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// const swapETHForExactTokens = async (data) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         amountOutMin,
//         path,
//         to,
//         deadline,
//         value
//       } = data;
//       log.i('swapETHForExactTokens:', data);
//       const web3 = ContractServices.Web_3();
//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();
//       value = await web3.utils.toHex(value);
//       console.log("Checking here:", data);
//       const gas = await contract.methods.swapETHForExactTokens(
//         amountOutMin,
//         path,
//         to,
//         deadline
//       ).estimateGas({ from: to, value });
//       contract.methods.swapETHForExactTokens(
//         amountOutMin,
//         path,
//         to,
//         deadline
//       ).send({ from: to, gasPrice, value })
//         .on('transactionHash', (hash) => {
//           resolve(hash);
//         })
//         .on('receipt', (receipt) => {
//           console.log(receipt, 'in service add liquidity')
//           toast.success('Swap transaction executed successfully');
//         })
//         .on('error', (error, receipt) => {
//           reject(error);
//         });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// const swapTokensForExactETH = async data => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         amountOut,
//         amountInMax,
//         path,
//         to,
//         deadline,
//         value
//       } = data;
//       const web3 = ContractServices.Web_3();
//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();
//       value = await web3.utils.toHex(value);

//       const gas = await contract.methods.swapTokensForExactETH(
//         amountOut,
//         amountInMax,
//         path,
//         to,
//         deadline,
//       ).estimateGas({ from: to });
//       contract.methods.swapTokensForExactETH(
//         amountOut,
//         amountInMax,
//         path,
//         to,
//         deadline,
//       ).send({ from: to, gasPrice, gas })
//         .on('transactionHash', (hash) => {
//           resolve(hash);
//         })
//         .on('receipt', (receipt) => {
//           console.log(receipt, 'in service add liquidity')
//           toast.success('Liquidity added successfully.');
//         })
//         .on('error', (error, receipt) => {
//           reject(error);
//         });
//     } catch (error) {
//       reject(error);
//     }
//   });
// }

// const swapExactTokensForETH = async (data, a1, a2) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let {
//         amountIn,
//         amountOutMin,
//         path,
//         to,
//         deadline,
//         value
//       } = data;
//       const web3 = ContractServices.Web_3();
//       const contract = RouterContract();
//       const gasPrice = await ContractServices.getGasPrice();
//       value = await web3.utils.toHex(value);

//       const checkDeflationnaryToken = DEFLATIONNARY_TOKENS.find(element => element.toLowerCase() == a1.toLowerCase());

//       if ((checkDeflationnaryToken) && (a2.toLowerCase() === WETH.toLowerCase())) {
//         try {
//           const gas = await contract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
//             amountIn,
//             amountOutMin,
//             path,
//             to,
//             deadline,
//           ).estimateGas({ from: to });

//           contract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
//             amountIn,
//             amountOutMin,
//             path,
//             to,
//             deadline,
//           ).send({ from: to, gasPrice, gas })
//             .on('transactionHash', (hash) => {
//               resolve(hash);
//             })
//             .on('receipt', (receipt) => {
//               console.log(receipt, 'in service add liquidity');
//               toast.success('Liquidity added successfully.');
//             })
//             .on('error', (error, receipt) => {
//               reject(error);
//             });
//         } catch (error) {
//           reject(error);
//         }

//       } else {
//         // console.log("HEREEEEEE ELSE:", data);
//         try {
//           const gas = await contract.methods.swapExactTokensForETH(
//             amountIn,
//             amountOutMin,
//             path,
//             to,
//             deadline,
//           ).estimateGas({ from: to });


//           contract.methods.swapExactTokensForETH(
//             amountIn,
//             amountOutMin,
//             path,
//             to,
//             deadline,
//           ).send({ from: to, gasPrice, gas })
//             .on('transactionHash', (hash) => {
//               resolve(hash);
//             })
//             .on('receipt', (receipt) => {
//               console.log(receipt, 'in service add liquidity');
//               toast.success('Liquidity added successfully.');
//             })
//             .on('error', (error, receipt) => {
//               reject(error);
//             });
//         } catch (error) {
//           reject(error);
//         }

//       }
//     } catch (error) {
//       reject(error);
//     }
//   });
// }
// // -------------------------------------------------------------------------

// const getDecimalPair = tkn => tkn.map(async t => { TokenContract.setTo(t); return await TokenContract.decimals();})

// export const ExchangeService = {
//   getAmountsIn,
//   addLiquidity,
//   getAmountsOut,
//   getDecimalPair,
//   getTotalSupply,
//   addLiquidityETH,
//   swapExactETHForTokens,
//   swapETHForExactTokens,
//   swapTokensForExactETH,
//   swapExactTokensForETH,
//   swapExactTokensForTokens,
//   swapTokensForExactTokens,
//   removeLiquidityWithPermit,
//   removeLiquidityETHWithPermit,
// }
