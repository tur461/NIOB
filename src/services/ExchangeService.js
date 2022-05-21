// import Web3 from "web3"
import { MAIN_CONTRACT_LIST, WETH, BURN_ADDRESS, DEFLATIONNARY_TOKENS, TOKEN_LIST, pancakeFactory } from "../assets/tokens"
import { toast } from "../components/Toast/Toast";
import { ContractServices } from "./ContractServices";
import { BigNumber } from "bignumber.js"

const allPairs = async () => {
  try {
    const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.factory.address, MAIN_CONTRACT_LIST.factory.abi);
    return await contract.methods.allPairs().call();
  } catch (error) {
    return error;
  }
}

const getPair = async (token1, token2) => {
  try {
    const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.factory.address, MAIN_CONTRACT_LIST.factory.abi);
    return await contract.methods.getPair(token1, token2).call();
  } catch (error) {
    return error;
  }
};

const getPairFromPancakeFactory = async (token1, token2) => {
  try {
    const contract = await ContractServices.callContract(pancakeFactory, MAIN_CONTRACT_LIST.factory.abi);
    return await contract.methods.getPair(token1, token2).call();
  } catch (error) {
    return error;
  }
};

const getTokenZero = async (currentPairAddress) => {
  try {
    const contract = await ContractServices.callContract(currentPairAddress, MAIN_CONTRACT_LIST.pair.abi);
    return await contract.methods.token0().call();
  } catch (error) {
    return error;
  }
};

const getTokenOne = async (currentPairAddress) => {
  try {
    const contract = await ContractServices.callContract(currentPairAddress, MAIN_CONTRACT_LIST.pair.abi);
    return await contract.methods.token1().call();
  } catch (error) {
    return error;
  }
};

const getAmountsOut = async (amountIn, pair) => {
  try {

    const decimals1 = await ContractServices.getDecimals(pair[0]);
    const addAmountIn = amountIn * 10 ** decimals1;

    let calAmount = BigNumber(addAmountIn).toFixed();
    calAmount.toString();
    let contract;
    if ((pair[0].toLowerCase() === TOKEN_LIST[1].address.toLowerCase()) || (pair[1].toLowerCase() === TOKEN_LIST[1].address.toLowerCase())) {
      contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
    } else if (
      ((pair[0].toLowerCase() === TOKEN_LIST[0].address.toLowerCase()) || (pair[0].toLowerCase() === TOKEN_LIST[2].address.toLowerCase())
      ) && ((pair[1].toLowerCase() === TOKEN_LIST[0].address.toLowerCase()) || (pair[1].toLowerCase() === TOKEN_LIST[2].address.toLowerCase())
      )) {
      contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
    }
    else {
      contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.panCakeRouter.address, MAIN_CONTRACT_LIST.router.abi);
    }

    const result = await contract.methods.getAmountsOut(calAmount, pair).call();

    let pushArray = [];
    for (let i = 0; i < result.length; i++) {
      const decimals = await ContractServices.getDecimals(pair[i]);
      const path = Number(result[i]) / 10 ** decimals
      pushArray.push(path);
    }
    return pushArray;
  } catch (error) {
    return error;
  }
}

const getAmountsIn = async (amountOut, pair) => {
  try {
    const decimals1 = await ContractServices.getDecimals(pair[0]);
    const addAmountOut = amountOut * 10 ** decimals1;

    let calAmount = BigNumber(addAmountOut).toFixed();
    calAmount.toString();
    let contract;
    if ((pair[0].toLowerCase() === TOKEN_LIST[1].address.toLowerCase()) || (pair[1].toLowerCase() === TOKEN_LIST[1].address.toLowerCase())) {
      contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
    } else if (
      ((pair[0].toLowerCase() === TOKEN_LIST[0].address.toLowerCase()) || (pair[0].toLowerCase() === TOKEN_LIST[2].address.toLowerCase())
      ) && ((pair[1].toLowerCase() === TOKEN_LIST[0].address.toLowerCase()) || (pair[1].toLowerCase() === TOKEN_LIST[2].address.toLowerCase())
      )) {
      contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
    } else {
      contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.panCakeRouter.address, MAIN_CONTRACT_LIST.router.abi);
    }
    const result = await contract.methods.getAmountsIn(calAmount, pair).call();
    let pushArray = [];
    for (let i = 0; i < result.length; i++) {
      const decimals = await ContractServices.getDecimals(pair[i]);
      const path = Number(result[i]) / 10 ** decimals
      pushArray.push(path);
    }
    return pushArray;
  } catch (error) {
    return error;
  }
}

const getReserves = async (pairAddress) => {
  try {
    const contract = await ContractServices.callContract(pairAddress, MAIN_CONTRACT_LIST.pair.abi);
    return await contract.methods.getReserves().call();
  } catch (error) {
    return error;
  }
}

const getTotalSupply = async (pairAddress) => {
  try {
    const contract = await ContractServices.callContract(pairAddress, MAIN_CONTRACT_LIST.pair.abi);
    const decimals = await contract.methods.decimals().call();
    let result = await contract.methods.totalSupply().call();
    result = (Number(result) / 10 ** decimals).toFixed(5);
    return Number(result);

  } catch (error) {
    return error;
  }
}

const getTokenStaked = async (pairAddress) => {
  try {
    const contract = await ContractServices.callTokenContract(pairAddress);
    const decimals = await contract.methods.decimals().call();

    let result = await contract.methods.balanceOf(MAIN_CONTRACT_LIST.farm.address).call();
    result = (Number(result) / 10 ** decimals).toFixed(5);
    return Number(result);
  } catch (error) {
    console.log("Error:", error);
    return error;
  }
};

const getBurnedToken = async () => {
  try {
    const contract = await ContractServices.callTokenContract(MAIN_CONTRACT_LIST.anchorNew.address);
    if (contract) {
      const decimals = await contract.methods.decimals().call();

      let result = await contract.methods.balanceOf(BURN_ADDRESS).call();
      result = (Number(result) / 10 ** decimals).toFixed(2);
      return Number(result);
    }
    return 0;

  } catch (error) {
    console.log("Error:", error);
    return error;
  }
};

const addLiquidity = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline,
        value
      } = data;
      const web3 = await ContractServices.callWeb3();
      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();

      const gas = await contract.methods.addLiquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline
      ).estimateGas({ from: to });
      value = await web3.utils.toHex(value);

      contract.methods.addLiquidity(
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline
      ).send({ from: to, gasPrice, gas, value })
        .on('transactionHash', (hash) => {
          resolve(hash);
        })
        .on('receipt', (receipt) => {
          toast.success('Liquidity added successfully.');
        })
        .on('error', (error, receipt) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}
const addLiquidityETH = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        token,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        to,
        deadline,
        value
      } = data;
      const web3 = await ContractServices.callWeb3();
      value = await web3.utils.toHex(value);

      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();
      // value = await web3.utils.toHex(value);

      const gas = await contract.methods.addLiquidityETH(
        token,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        to,
        deadline
      ).estimateGas({ from: to, value });

      contract.methods.addLiquidityETH(
        token,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        to,
        deadline
      ).send({ from: to, gasPrice, gas, value })
        .on('transactionHash', (hash) => {
          resolve(hash);
        })
        .on('receipt', (receipt) => {
          toast.success('Liquidity added successfully.');
        })
        .on('error', (error, receipt) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}
const removeLiquidityWithPermit = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        tokenA,
        tokenB,
        liquidity,
        amountAMin,
        amountBMin,
        to,
        deadline,
        value,
        approveMax,
        v, r, s, checkSignature
      } = data;
      const web3 = await ContractServices.callWeb3();
      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();

      if (checkSignature) {

        const gas = await contract.methods.removeLiquidityWithPermit(
          tokenA,
          tokenB,
          liquidity,
          amountAMin,
          amountBMin,
          to,
          deadline,
          approveMax,
          v, r, s
        ).estimateGas({ from: to });
        value = await web3.utils.toHex(value);

        contract.methods.removeLiquidityWithPermit(
          tokenA,
          tokenB,
          liquidity,
          amountAMin,
          amountBMin,
          to,
          deadline,
          approveMax,
          v, r, s
        ).send({ from: to, gasPrice, gas, value })
          .on('transactionHash', (hash) => {
            resolve(hash);
          })
          .on('receipt', (receipt) => {
            console.log(receipt, 'in service add liquidity')
            toast.success('Liquidity removed successfully.');
          })
          .on('error', (error, receipt) => {
            reject(error);
          });
      } else {
        const gas = await contract.methods.removeLiquidity(
          tokenA,
          tokenB,
          liquidity,
          amountAMin,
          amountBMin,
          to,
          deadline
        ).estimateGas({ from: to });
        value = await web3.utils.toHex(value);

        contract.methods.removeLiquidity(
          tokenA,
          tokenB,
          liquidity,
          amountAMin,
          amountBMin,
          to,
          deadline
        ).send({ from: to, gasPrice, gas, value })
          .on('transactionHash', (hash) => {
            resolve(hash);
          })
          .on('receipt', (receipt) => {
            console.log(receipt, 'in service add liquidity')
            toast.success('Liquidity removed successfully.');
          })
          .on('error', (error, receipt) => {
            reject(error);
          });
      }
    } catch (error) {
      reject(error);
    }
  });
}
const removeLiquidityETHWithPermit = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        token,
        liquidity,
        amountTokenMin,
        amountETHMin,
        to,
        deadline,
        value,
        approveMax, v, r, s, checkSignature
      } = data;
      value = '0';

      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();

      if (checkSignature) {

        // for Anchor Tokens
        const supportingCheck = DEFLATIONNARY_TOKENS.find(ele => ele.toLowerCase() === token.toLowerCase());

        if (supportingCheck) {
          const gas = await contract.methods.removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
            token,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline,
            approveMax,
            v, r, s
          ).estimateGas({ from: to, value });

          contract.methods.removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
            token,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline,
            approveMax,
            v, r, s
          ).send({ from: to, gasPrice, gas, value })
            .on('transactionHash', (hash) => {
              resolve(hash);
            })
            .on('receipt', (receipt) => {
              console.log(receipt, 'in service add liquidity')
              toast.success('Liquidity removed successfully.');
            })
            .on('error', (error, receipt) => {
              reject(error);
            });
        } else {
          const gas = await contract.methods.removeLiquidityETHWithPermit(
            token,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline,
            approveMax,
            v, r, s
          ).estimateGas({ from: to, value });

          contract.methods.removeLiquidityETHWithPermit(
            token,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline,
            approveMax,
            v, r, s
          ).send({ from: to, gasPrice, gas, value })
            .on('transactionHash', (hash) => {
              resolve(hash);
            })
            .on('receipt', (receipt) => {
              console.log(receipt, 'in service add liquidity')
              toast.success('Liquidity removed successfully.');
            })
            .on('error', (error, receipt) => {
              reject(error);
            });
        }
      } else {//without permit
        // for Anchor Tokens
        const supportingCheck = DEFLATIONNARY_TOKENS.find(ele => ele.toLowerCase() === token.toLowerCase());

        if (supportingCheck) {
          const gas = await contract.methods.removeLiquidityETHSupportingFeeOnTransferTokens(
            token,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline
          ).estimateGas({ from: to, value });

          contract.methods.removeLiquidityETHSupportingFeeOnTransferTokens(
            token,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline
          ).send({ from: to, gasPrice, gas, value })
            .on('transactionHash', (hash) => {
              resolve(hash);
            })
            .on('receipt', (receipt) => {
              console.log(receipt, 'in service add liquidity')
              toast.success('Liquidity removed successfully.');
            })
            .on('error', (error, receipt) => {
              reject(error);
            });
        } else {
          const gas = await contract.methods.removeLiquidityETH(
            token,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline
          ).estimateGas({ from: to, value });

          contract.methods.removeLiquidityETH(
            token,
            liquidity,
            amountTokenMin,
            amountETHMin,
            to,
            deadline
          ).send({ from: to, gasPrice, gas, value })
            .on('transactionHash', (hash) => {
              resolve(hash);
            })
            .on('receipt', (receipt) => {
              console.log(receipt, 'in service add liquidity')
              toast.success('Liquidity removed successfully.');
            })
            .on('error', (error, receipt) => {
              reject(error);
            });
        }
      }
    } catch (error) {
      console.log('remove liquidity issue', '------------', error)
      reject(error);
    }
  });
}
const swapExactTokensForTokens = async (data, a1, a2) => {
  return new Promise(async (resolve, reject) => {

    let {
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
      value
    } = data;

    const web3 = await ContractServices.callWeb3();
    const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
    const gasPrice = await ContractServices.calculateGasPrice();
    const checkDeflationnaryTokens = DEFLATIONNARY_TOKENS.find(element => element.toLowerCase() === a1.toLowerCase());

    if (checkDeflationnaryTokens) {
      try {
        const gas = await contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          amountIn,
          amountOutMin,
          path,
          to,
          deadline
        ).estimateGas({ from: to });

        value = await web3.utils.toHex(value);

        contract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          amountIn,
          amountOutMin,
          path,
          to,
          deadline
        ).send({ from: to, gasPrice, gas, value })
          .on('transactionHash', (hash) => {
            resolve(hash);
          })
          .on('receipt', (receipt) => {
            console.log(receipt, 'in service add liquidity')
            toast.success('Swap transaction executed successfully');
          })
          .on('error', (error, receipt) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }

    } else {
      try {
        const gas = await contract.methods.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          to,
          deadline
        ).estimateGas({ from: to });

        value = await web3.utils.toHex(value);

        contract.methods.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          to,
          deadline
        ).send({ from: to, gasPrice, gas, value })
          .on('transactionHash', (hash) => {
            resolve(hash);
          })
          .on('receipt', (receipt) => {
            console.log(receipt, 'in service add liquidity')
            toast.success('Swap transaction executed successfully');
          })
          .on('error', (error, receipt) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    }
  });
}

const swapTokensForExactTokens = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
        value
      } = data;

      const web3 = await ContractServices.callWeb3();
      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();
      const gas = await contract.methods.swapTokensForExactTokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline
      ).estimateGas({ from: to });
      value = await web3.utils.toHex(value);
      contract.methods.swapTokensForExactTokens(
        amountIn,
        amountOutMin,
        path,
        to,
        deadline
      ).send({ from: to, gasPrice, gas, value })
        .on('transactionHash', (hash) => {
          resolve(hash);
        })
        .on('receipt', (receipt) => {
          console.log(receipt, 'in service add liquidity')
          toast.success('Swap transaction executed successfully');
        })
        .on('error', (error, receipt) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

const swapExactETHForTokens = async (data, handleBalance) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        amountOutMin,
        path,
        to,
        deadline,
        value
      } = data;
      const web3 = await ContractServices.callWeb3();
      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();
      const gas = await contract.methods.swapExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline
      ).estimateGas({ from: to, value });

      value = await web3.utils.toHex(value);
      contract.methods.swapExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline
      ).send({ from: to, gasPrice, gas, value })
        .on('transactionHash', (hash) => {
          resolve(hash);
        })
        .on('receipt', (receipt) => {
          handleBalance();
          toast.success('Swap transaction executed successfully');
        })
        .on('error', (error, receipt) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

const swapETHForExactTokens = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        amountOutMin,
        path,
        to,
        deadline,
        value
      } = data;
      const web3 = await ContractServices.callWeb3();
      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();
      value = await web3.utils.toHex(value);
      console.log("Checking here:", data);
      const gas = await contract.methods.swapETHForExactTokens(
        amountOutMin,
        path,
        to,
        deadline
      ).estimateGas({ from: to, value });
      contract.methods.swapETHForExactTokens(
        amountOutMin,
        path,
        to,
        deadline
      ).send({ from: to, gasPrice, gas, value })
        .on('transactionHash', (hash) => {
          resolve(hash);
        })
        .on('receipt', (receipt) => {
          console.log(receipt, 'in service add liquidity')
          toast.success('Swap transaction executed successfully');
        })
        .on('error', (error, receipt) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}
const getPairNonces = async (pair, address) => {
  try {
    const contract = await ContractServices.callContract(pair, MAIN_CONTRACT_LIST.pair.abi);
    return contract.methods.nonces(address).call();
  } catch (err) {
    return err;
  }
}

const signRemoveTransaction = async (d, pair) => {
  try {
    const { owner, spender, deadline, value } = d;
    const web3 = await ContractServices.callWeb3();

    let chainId = await web3.currentProvider.chainId;
    chainId = await web3.utils.hexToNumber(chainId);

    const nonce = await getPairNonces(pair, owner);

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ]
    const domain = {
      name: 'NiobSwap LPs',
      version: '1',
      value,
      chainId,
      verifyingContract: pair,
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ]
    const message = {
      owner,
      spender,
      value,
      nonce: web3.utils.toHex(nonce),
      deadline,
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    });

    //old function
    // const res = await web3.currentProvider.send('eth_signTypedData_v4', [owner, data]);
    // console.log(data, res, 'before---------------')

    const from = owner;
    const params = [from, data];
    const method = 'eth_signTypedData_v4';

    const res = await web3.currentProvider.request({
      method,
      params,
      from,
    });
    try {
      return await splitSignature(res);
    } catch (err) {
      console.log('split signature error', err);
      return err;
    }
  } catch (err) {
    return err;
  }
}

///////////////////////////////
function isHexable(value) {
  return !!(value.toHexString);
}
function addSlice(array) {
  if (array.slice) { return array; }

  array.slice = function () {
    const args = Array.prototype.slice.call(arguments);
    return addSlice(Array.prototype.slice.apply(array, args));
  }
  return array;
}
function isBytesLike(value) {
  return ((isHexString(value) && !(value.length % 2)) || isBytes(value));
}
function isBytes(value) {
  if (value == null) { return false; }

  if (typeof (value) === "string") { return false; }
  if (value.length == null) { return false; }

  for (let i = 0; i < value.length; i++) {
    const v = value[i];
    if (typeof (v) !== "number" || v < 0 || v >= 256 || (v % 1)) {
      return false;
    }
  }
  return true;
}
function arrayify(value, options) {
  if (!options) { options = {}; }

  if (typeof (value) === "number") {
    // throw new Error(value, "invalid arrayify value");

    const result = [];
    while (value) {
      result.unshift(value & 0xff);
      value = parseInt(String(value / 256));
    }
    if (result.length === 0) { result.push(0); }

    return addSlice(result);
  }

  if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
    value = "0x" + value;
  }

  if (isHexable(value)) { value = value.toHexString(); }

  if (isHexString(value)) {
    let hex = (value).substring(2);
    if (hex.length % 2) {
      if (options.hexPad === "left") {
        hex = "0x0" + hex.substring(2);
      } else if (options.hexPad === "right") {
        hex += "0";
      } else {
        throw new Error("hex data is odd-length", "value", value);
      }
    }

    const result = [];
    for (let i = 0; i < hex.length; i += 2) {
      result.push(parseInt(hex.substring(i, i + 2), 16));
    }

    return addSlice(result);
  }

  if (isBytes(value)) {
    return addSlice(value);
  }

  return new Error("invalid arrayify value", "value", value);
}

function zeroPad(value, length) {
  value = arrayify(value);

  if (value.length > length) {
    throw new Error("value out of range", "value", arguments[0]);
  }

  const result = [length];
  result.set(value, length - value.length);
  return addSlice(result);
}


function isHexString(value, length) {
  if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false
  }
  if (length && value.length !== 2 + 2 * length) { return false; }
  return true;
}

const HexCharacters = "0123456789abcdef";

function hexlify(value, options) {
  if (!options) { options = {}; }

  if (typeof (value) === "number") {
    // logger.checkSafeUint53(value, "invalid hexlify value");

    let hex = "";
    while (value) {
      hex = HexCharacters[value & 0xf] + hex;
      value = Math.floor(value / 16);
    }

    if (hex.length) {
      if (hex.length % 2) { hex = "0" + hex; }
      return "0x" + hex;
    }

    return "0x00";
  }

  if (typeof (value) === "bigint") {
    value = value.toString(16);
    if (value.length % 2) { return ("0x0" + value); }
    return "0x" + value;
  }

  if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
    value = "0x" + value;
  }

  if (isHexable(value)) { return value.toHexString(); }

  if (isHexString(value)) {
    if ((value).length % 2) {
      if (options.hexPad === "left") {
        value = "0x0" + (value.toString()).substring(2);
      } else if (options.hexPad === "right") {
        value += "0";
      } else {
        throw new Error("hex data is odd-length", "value", value);
      }
    }
    return (value.toString()).toLowerCase();
  }

  if (isBytes(value)) {
    let result = "0x";
    for (let i = 0; i < value.length; i++) {
      let v = value[i];
      result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
    }
    return result;
  }

  return new Error("invalid hexlify value", "value", value);
}

function hexZeroPad(value, length) {
  if (typeof (value) !== "string") {
    value = hexlify(value);
  } else if (!isHexString(value)) {
    throw new Error("invalid hex string", "value", value);
  }

  if (value.length > 2 * length + 2) {
    throw new Error("value out of range", "value", arguments[1]);
  }

  while (value.length < 2 * length + 2) {
    value = "0x0" + value.substring(2);
  }
  return value;
}

const splitSignature = async (signature) => {
  const result = {
    r: "0x",
    s: "0x",
    _vs: "0x",
    recoveryParam: 0,
    v: 0
  };

  if (isBytesLike(signature)) {
    const bytes = arrayify(signature);
    if (bytes.length !== 65) {
      throw new Error("invalid signature string; must be 65 bytes", "signature", signature);
    }

    // Get the r, s and v
    result.r = hexlify(bytes.slice(0, 32));
    result.s = hexlify(bytes.slice(32, 64));
    result.v = bytes[64];

    // Allow a recid to be used as the v
    if (result.v < 27) {
      if (result.v === 0 || result.v === 1) {
        result.v += 27;
      } else {
        throw new Error("signature invalid v byte", "signature", signature);
      }
    }

    // Compute recoveryParam from v
    result.recoveryParam = 1 - (result.v % 2);

    // Compute _vs from recoveryParam and s
    if (result.recoveryParam) { bytes[32] |= 0x80; }
    result._vs = hexlify(bytes.slice(32, 64))

  } else {
    result.r = signature.r;
    result.s = signature.s;
    result.v = signature.v;
    result.recoveryParam = signature.recoveryParam;
    result._vs = signature._vs;

    // If the _vs is available, use it to populate missing s, v and recoveryParam
    // and verify non-missing s, v and recoveryParam
    if (result._vs != null) {
      const vs = zeroPad(arrayify(result._vs), 32);
      result._vs = hexlify(vs);

      // Set or check the recid
      const recoveryParam = ((vs[0] >= 128) ? 1 : 0);
      if (result.recoveryParam == null) {
        result.recoveryParam = recoveryParam;
      } else if (result.recoveryParam !== recoveryParam) {
        throw new Error("signature recoveryParam mismatch _vs", "signature", signature);
      }

      // Set or check the s
      vs[0] &= 0x7f;
      const s = hexlify(vs);
      if (result.s == null) {
        result.s = s;
      } else if (result.s !== s) {
        throw new Error("signature v mismatch _vs", "signature", signature);
      }
    }

    // Use recid and v to populate each other
    if (result.recoveryParam == null) {
      if (result.v == null) {
        throw new Error("signature missing v and recoveryParam", "signature", signature);
      } else if (result.v === 0 || result.v === 1) {
        result.recoveryParam = result.v;
      } else {
        result.recoveryParam = 1 - (result.v % 2);
      }
    } else {
      if (result.v == null) {
        result.v = 27 + result.recoveryParam;
      } else if (result.recoveryParam !== (1 - (result.v % 2))) {
        throw new Error("signature recoveryParam mismatch v", "signature", signature);
      }
    }

    if (result.r == null || !isHexString(result.r)) {
      throw new Error("signature missing or invalid r", "signature", signature);
    } else {
      result.r = hexZeroPad(result.r, 32);
    }

    if (result.s == null || !isHexString(result.s)) {
      throw new Error("signature missing or invalid s", "signature", signature);
    } else {
      result.s = hexZeroPad(result.s, 32);
    }

    const vs = arrayify(result.s);
    if (vs[0] >= 128) {
      throw new Error("signature s out of range", "signature", signature);
    }
    if (result.recoveryParam) { vs[0] |= 0x80; }
    const _vs = hexlify(vs);

    if (result._vs) {
      if (!isHexString(result._vs)) {
        throw new Error("signature invalid _vs", "signature", signature);
      }
      result._vs = hexZeroPad(result._vs, 32);
    }

    // Set or check the _vs
    if (result._vs == null) {
      result._vs = _vs;
    } else if (result._vs !== _vs) {
      throw new Error("signature _vs mismatch v and s", "signature", signature);
    }
  }
  return result;
}

const swapTokensForExactETH = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        amountOut,
        amountInMax,
        path,
        to,
        deadline,
        value
      } = data;
      const web3 = await ContractServices.callWeb3();
      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();
      value = await web3.utils.toHex(value);

      const gas = await contract.methods.swapTokensForExactETH(
        amountOut,
        amountInMax,
        path,
        to,
        deadline,
      ).estimateGas({ from: to });
      contract.methods.swapTokensForExactETH(
        amountOut,
        amountInMax,
        path,
        to,
        deadline,
      ).send({ from: to, gasPrice, gas })
        .on('transactionHash', (hash) => {
          resolve(hash);
        })
        .on('receipt', (receipt) => {
          console.log(receipt, 'in service add liquidity')
          toast.success('Liquidity added successfully.');
        })
        .on('error', (error, receipt) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
}

const swapExactTokensForETH = async (data, a1, a2) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
        value
      } = data;
      const web3 = await ContractServices.callWeb3();
      const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.router.address, MAIN_CONTRACT_LIST.router.abi);
      const gasPrice = await ContractServices.calculateGasPrice();
      value = await web3.utils.toHex(value);

      const checkDeflationnaryToken = DEFLATIONNARY_TOKENS.find(element => element.toLowerCase() == a1.toLowerCase());

      if ((checkDeflationnaryToken) && (a2.toLowerCase() === WETH.toLowerCase())) {
        try {
          const gas = await contract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline,
          ).estimateGas({ from: to });

          contract.methods.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline,
          ).send({ from: to, gasPrice, gas })
            .on('transactionHash', (hash) => {
              resolve(hash);
            })
            .on('receipt', (receipt) => {
              console.log(receipt, 'in service add liquidity');
              toast.success('Liquidity added successfully.');
            })
            .on('error', (error, receipt) => {
              reject(error);
            });
        } catch (error) {
          reject(error);
        }

      } else {
        // console.log("HEREEEEEE ELSE:", data);
        try {
          const gas = await contract.methods.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline,
          ).estimateGas({ from: to });


          contract.methods.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline,
          ).send({ from: to, gasPrice, gas })
            .on('transactionHash', (hash) => {
              resolve(hash);
            })
            .on('receipt', (receipt) => {
              console.log(receipt, 'in service add liquidity');
              toast.success('Liquidity added successfully.');
            })
            .on('error', (error, receipt) => {
              reject(error);
            });
        } catch (error) {
          reject(error);
        }

      }
    } catch (error) {
      reject(error);
    }
  });
}
//exporting functions
export const ExchangeService = {
  getPair,
  getAmountsOut,
  getReserves,
  addLiquidity,
  addLiquidityETH,
  removeLiquidityWithPermit,
  removeLiquidityETHWithPermit,
  allPairs,
  swapExactTokensForTokens,
  swapTokensForExactTokens,
  swapExactETHForTokens,
  swapETHForExactTokens,
  signRemoveTransaction,
  swapTokensForExactETH,
  swapExactTokensForETH,
  getTokenZero,
  getTokenOne,
  getTotalSupply,
  getTokenStaked,
  getBurnedToken,
  getAmountsIn,
  getPairFromPancakeFactory
}
