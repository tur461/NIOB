import Web3 from "web3";
import TOKEN_ABI from "../assets/ABI/tokenContract.ABI.json";
import { toast } from "../components/Toast/Toast";
import { NETWORK_CHAIN_ID, NETWORK_CHAIN_NAME, NETWORK_LINK, NETWORK_NATIVE_CURRENCY_DECIMALS, NETWORK_NATIVE_CURRENCY_NAME, NETWORK_NATIVE_CURRENCY_SYMBOL, NETWORK_RPC_URL } from '../constant'
import WalletConnectProvider from '@walletconnect/web3-provider'

let web3Object;
let contractOjbect;
let currentContractAddress;
let tokenContractObject;
let currentTokenAddress;
let walletTypeObject = 'Metamask';
let walletConnectProvider;

//only for lp tokens
const convertToDecimals = async (value) => {
  const decimals = 18;
  return Number(value) / 10 ** decimals;
}

const isMetamaskInstalled = async (type) => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum, web3 } = window;
  const result = Boolean(ethereum && ethereum.isMetaMask);
  walletTypeObject = 'Metamask';
  if (result) {
    //metamask
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  } else if (ethereum) {
    //trust wallet
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  } else if (web3) {
    //trustwallet
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
  } else {
    if (type) {
      toast.error(`Install ${type} extension first!`);
    }
    
    return false;
  }

}



const isBinanceChainInstalled = async () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { BinanceChain } = window;
  if (BinanceChain) {
    walletTypeObject = 'BinanceChain';
    try {
      const accounts = await BinanceChain.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  } else {
    toast.error("Install BinanceChain extension first!");
    return false;
  }
}

const walletWindowListener = async () => {
  const { BinanceChain, ethereum } = window;
  if (walletTypeObject === 'Metamask') {
    const result = Boolean(ethereum && ethereum.isMetaMask);
    if (result) {
      if (ethereum.chainId !== NETWORK_CHAIN_ID) {
        try {
          const chain = await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CHAIN_ID }],
          });
        } catch (error) {
          console.log('metamask error', error);
          if (error?.code === 4902) {
            try {
              const addChain = await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: NETWORK_CHAIN_ID,
                  chainName: NETWORK_CHAIN_NAME,
                  nativeCurrency: {
                    name: NETWORK_NATIVE_CURRENCY_NAME,
                    symbol: NETWORK_NATIVE_CURRENCY_SYMBOL,
                    decimals: Number(NETWORK_NATIVE_CURRENCY_DECIMALS)
                  },
                  rpcUrls: [NETWORK_RPC_URL],
                  blockExplorerUrls: [NETWORK_LINK]
                }],
              });
              window.location.reload();
            } catch (error) { }
          }
        }

      }

      ethereum.on('chainChanged', async (chainId) => {
        if (chainId !== NETWORK_CHAIN_ID) {
          // toast.error('Select Binance Smart Chain Mainnet Network in wallet!')
          try {
            const chain = await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: NETWORK_CHAIN_ID }],
            });
          } catch (error) {
            console.log('metamask error', error);
            if (error?.code === 4902) {
              try {
                const addChain = await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: await window.ethereum.chainId,
                    chainName: NETWORK_CHAIN_NAME,
                    nativeCurrency: {
                      name: NETWORK_NATIVE_CURRENCY_NAME,
                      symbol: NETWORK_NATIVE_CURRENCY_SYMBOL,
                      decimals: Number(NETWORK_NATIVE_CURRENCY_DECIMALS)
                    },
                    rpcUrls: [NETWORK_RPC_URL],
                    blockExplorerUrls: [NETWORK_LINK]
                  }],
                });
              } catch (error) { }
            }
          }
        }
      });
    }

  }
  if (walletTypeObject === 'BinanceChain') {
    if (BinanceChain) {
      BinanceChain.on('chainChanged', async (chainId) => {
        if (chainId !== NETWORK_CHAIN_ID) {
          // toast.error('Select Binance Smart Chain Mainnet Network in wallet!')
          try {
            const chain = await BinanceChain.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: NETWORK_CHAIN_ID }],
            });
          } catch (error) {
            console.log('binance error', error)
          }
        }
      });
    }
  }
}

const callWeb3 = async () => {
  if (web3Object) {
    return (web3Object);
  }
  const { ethereum, web3, BinanceChain } = window;
  if (walletTypeObject === 'Metamask') {
    if (ethereum && ethereum.isMetaMask) {
      web3Object = new Web3(ethereum);
      return (web3Object);
    } else if (ethereum) {
      web3Object = new Web3(ethereum);
      return (web3Object);
    } else if (web3) {
      web3Object = new Web3(web3.currentProvider);
      return (web3Object);
    } else {
      toast.error("You have to install Wallet!");
    }
  } else {
    if (BinanceChain) {
      web3Object = new Web3(BinanceChain);
      return (web3Object);
    } else {
      toast.error("You have to install Wallet!");
    }
  }
};

const callContract = async (contractAddress, contractABI) => {
  if (
    contractOjbect && currentContractAddress &&
    currentContractAddress.toLowerCase() === contractAddress.toLowerCase()
  ) {
    return contractOjbect;
  }
  const web3Object = await callWeb3();
  currentContractAddress = contractAddress;
  contractOjbect = new web3Object.eth.Contract(contractABI, contractAddress);
  return contractOjbect;
};
const callTokenContract = async (tokenAddress) => {
  if (
    tokenContractObject && currentContractAddress &&
    currentTokenAddress.toLowerCase() === tokenAddress.toLowerCase()
  ) {
    return tokenContractObject;
  }
  const web3Object = await callWeb3();
  currentTokenAddress = tokenAddress;
  tokenContractObject = new web3Object.eth.Contract(
    TOKEN_ABI,
    currentTokenAddress
  );
  return tokenContractObject;
};

const calculateGasPrice = async () => {
  const web3 = await callWeb3();
  return await web3.eth.getGasPrice();
}

const getDefaultAccount = async () => {
  const web3 = await callWeb3();
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

const approveToken = async (address, value, mainContractAddress, tokenAddress) => {
  try {
    const gasPrice = await calculateGasPrice();
    const contract = await callTokenContract(tokenAddress);
    //calculate estimate gas limit
    const gas = await contract.methods.approve(mainContractAddress, value).estimateGas({ from: address });

    return await contract.methods
      .approve(mainContractAddress, value)
      .send({ from: address, gasPrice, gas });
  } catch (error) {
    return error;
  }
};

const allowanceToken = async (tokenAddress, mainContractAddress, address) => {
  try {
    const contract = await callTokenContract(tokenAddress);
    return await contract.methods
      .allowance(address, mainContractAddress).call();
  } catch (error) {
    return error;
  }
}

const getTokenBalance = async (tokenAddress, address) => {
  try {
    const contract = await callTokenContract(tokenAddress);
    const decimals = await contract.methods.decimals().call();

    let result = await contract.methods.balanceOf(address).call();
    result = ((Number(result) / 10 ** decimals)).toFixed(5);
    return Number(result);
  } catch (error) {
    console.log("Error:", error);
    return error;
  }
};
const getTokenBalanceFull = async (tokenAddress, address) => {
  try {
    const contract = await callTokenContract(tokenAddress);
    const decimals = await contract.methods.decimals().call();

    let result = await contract.methods.balanceOf(address).call();
    result = result / 10 ** decimals;

    return result;
  } catch (error) {
    console.log("Error:", error);
    return error;
  }
};

const getDecimals = async (tokenAddress) => {
  try {
    const contract = await callTokenContract(tokenAddress);
    return await contract.methods.decimals().call();
  } catch (error) {
    return error;
  }
};

const getTokenName = async (tokenAddress) => {
  try {
    const contract = await callTokenContract(tokenAddress);
    return await contract.methods.name().call();
  } catch (error) {
    return error;
  }
}

const getTokenSymbol = async (tokenAddress) => {
  try {
    const contract = await callTokenContract(tokenAddress);
    return await contract.methods.symbol().call();
  } catch (error) {
    return error;
  }
}

const getBNBBalance = async (address) => {
  try {
    const web3 = await callWeb3();
    let result = await web3.eth.getBalance(address);
    result = (Number(result) / 10 ** 18).toFixed(5);
    return Number(result);
  } catch (error) {
    return error;
  }
}

const setWalletType = async (walletType) => {
  walletTypeObject = walletType;
}

const getTotalSupply = async (tokenAddress) => {
  try {
    const contract = await callTokenContract(tokenAddress);
    let result = await contract.methods.totalSupply().call();
    const decimals = await contract.methods.decimals().call();
    result = Number(result) / (10 ** Number(decimals));
    return result;
  } catch (error) {
    return error;
  }
}

const web3ErrorHandle = async (err) => {
  let message = 'Transaction Reverted!';
  if (err.message.indexOf('Rejected') > -1) {
    message = 'User denied the transaction!';
  } else if (err.message && err.message.indexOf('User denied') > -1) {
    message = 'User denied the transaction!';
  } else if (err.message && err.message.indexOf('INSUFFICIENT_B') > -1) {
    message = 'Insufficient value of second token!';
  } else if (err.message && err.message.indexOf('INSUFFICIENT_A') > -1) {
    message = 'Insufficient value of first token!';
  } else {
    console.log(err, err.message);
  }
  return message;
}

const getLiquidity100Value = async (tokenAddress, address) => {
  try {
    const contract = await callTokenContract(tokenAddress);

    return await contract.methods.balanceOf(address).call();
  } catch (error) {
    console.log("Error:", error);
    return error;
  }
};

const callWeb3ForWalletConnect = async (provider) => {
  const provide = new WalletConnectProvider({
    //infuraId: "8570afa4d18b4c5d9cb3a629b08de069",
    rpc: {
      97: 'https://data-seed-prebsc-2-s3.binance.org:8545/',
      56: "https://bsc-dataseed.binance.org/",
    },
    chainId: 97,
    network: "binance",
    qrcode: true,
    qrcodeModalOptions: {
      mobileLinks: [
        "rainbow",
        "metamask",
        "argent",
        "trust",
        "imtoken",
        "pillar",
      ],
      desktopLinks: [
        "encrypted ink",
      ]
    }
  });
  const results = await provide.enable();
  walletConnectProvider = provide;
  web3Object = new Web3(provide);

  // return instance;
}


//exporting functions
export const ContractServices = {
  isMetamaskInstalled,
  isBinanceChainInstalled,
  callWeb3,
  callContract,
  calculateGasPrice,
  approveToken,
  getTokenBalance,
  getTokenBalanceFull,
  getDecimals,
  getTokenName,
  getTokenSymbol,
  getBNBBalance,
  setWalletType,
  allowanceToken,
  getTotalSupply,
  convertToDecimals,
  web3ErrorHandle,
  getDefaultAccount,
  callTokenContract,
  walletWindowListener,
  walletTypeObject,
  getLiquidity100Value,
  callWeb3ForWalletConnect
}
