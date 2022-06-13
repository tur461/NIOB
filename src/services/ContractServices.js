import { 
  WALLET_TYPE, 
  NETWORK_LINK, 
  NETWORK_RPC_URL, 
  NETWORK_CHAIN_NAME, 
  NETWORK_NATIVE_CURRENCY_NAME, 
  NETWORK_NATIVE_CURRENCY_SYMBOL, 
  NETWORK_NATIVE_CURRENCY_DECIMALS, 
} from '../constant'
import Web3 from "web3";
import { contains, toDec } from "./utils/global";
import { toast } from "../components/Toast/Toast";
import TOKEN_ABI from "../assets/ABI/tokenContract.ABI.json";
import WalletConnectProvider from '@walletconnect/web3-provider'

const NETWORK_CHAIN_ID = '0x61'; // 97

let defaultWalletType = WALLET_TYPE.M_MASK;

const Web_3 = (_ => {
  let _web3 = null;
  return _ => {
    if (_web3) return _web3;
    const { ethereum, web3, BinanceChain } = window;
    _web3 = WALLET_TYPE.isMMask(defaultWalletType) ? (ethereum && ethereum.isMetaMask ? new Web3(ethereum) :
    ethereum ?  new Web3(ethereum) : web3 ? new Web3(web3.currentProvider) : null ) :
    BinanceChain ? new Web3(BinanceChain) : null;
    return _web3 ? _web3 : toast.error("You have to install Wallet!");
  }
})()

const getContract = (_ => {
  return (a, abi) => {
    let w = Web_3();
    return new w.eth.Contract(abi, a);
  }
})();

const getGasPrice = _ => Web_3().eth.getGasPrice();
const getDefaultAccount = async _ => (await Web_3().eth.getAccounts())[0];

const TokenContract = (_ => {
  let _inst = {};
  let inst = null,p=[];
  
  const gas = (m, p) => inst.methods[m](...p).estimateGas();
  const getInstance = a => a in _inst ? _inst[a] : (_inst[a] = new (Web_3()).eth.Contract(TOKEN_ABI, a));
  return {
    setTo: a => inst = getInstance(a),
    get inst() { return inst},
    hasInst: _ => !!inst,
    name: _ => inst.methods['name']().call(),
    symbol: _ => inst.methods['symbol']().call(),
    decimals: _ => inst.methods['decimals']().call(),
    allowanceOf: addr => inst.methods['allowance'](addr).call(),
    balanceOf: async addr => toDec(
      await inst.methods['balanceOf'](addr).call(), 
      await inst.methods['decimals']().call()
    ),
    totalSupply: async _ => toDec(
      await inst.methods['totalSupply']().call(), 
      await inst.methods['decimals']().call()
    ),
    approve: async (spender, amount) => {
      p = [spender, amount]; return inst.methods['approve'](...p).send({gasPrice: await gas('approve', p)});
    },
  }
})();

const setWalletType = w => defaultWalletType = w;
// const getLiquidity100Value = async (tAddr, addr) => TokenContract.setTo(tAddr).methods.balanceOf(addr).call();
const getPairDecimals = (a0, a1) => {
  TokenContract.setTo(a0);
  let dec0 = TokenContract.decimals();
  TokenContract.setTo(a1);
  let dec1 = TokenContract.decimals();
  return Promise.all([dec0, dec1]);
}



const getBNBBalance = async addr => {
    const web3 = Web_3();
    let r = await web3.eth.getBalance(addr);
    r = (Number(r) / 10 ** 18).toFixed(5);
    return Number(r);
}

const web3ErrorHandle = async (err) => {
  let msg = 
  contains(err.message, 'Rejected') ?  'User denied the transaction!' :
  contains(err.message, 'User denied') ? 'User denied the transaction!' :
  contains(err.message, 'INSUFFICIENT_A') ? 'Insufficient value of first token!' :
  contains(err.message, 'INSUFFICIENT_B') ? 'Insufficient value of second token!' :
  'Transaction Reverted!';
  console.log(err, err.message);
  return msg;
}

const tryGetAccount = async type => {
  let { ethereum, web3, r } = window;
  try { 
    r = ethereum && ethereum.isMetaMask ? (await ethereum.request({ method: 'eth_requestAccounts' }))[0] 
  : web3 ? (await web3.eth.getAccounts())[0] 
  : type ? toast.error(`Install ${type} extension first!`) ? null : null : null;
  } catch(e) {r=null}
  return r;
}



const isBinanceChainInstalled = async () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { BinanceChain } = window;
  if (BinanceChain) {
    defaultWalletType = WALLET_TYPE.B_NANCE;
    try {
      const accounts = await BinanceChain.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (err) {
      toast.error(err.message);
      return !1;
    }
  } else {
    toast.error("Install BinanceChain extension first!");
    return !1;
  }
}

const walletWindowListener = async () => {
  const { BinanceChain, ethereum } = window;
  if (WALLET_TYPE.isMMask(defaultWalletType)) {
    const result = Boolean(ethereum && ethereum.isMetaMask);
    if (result) {
      if (ethereum.chainId !== NETWORK_CHAIN_ID)
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CHAIN_ID }],
          });
        } catch (er) {
          console.log('metamask error', er);
          if (er?.code === 4902)
            try {
              await ethereum.request({
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
            } catch (e) { }

      }

      ethereum.on('chainChanged', async (chainId) => {
        if (chainId !== NETWORK_CHAIN_ID)
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: NETWORK_CHAIN_ID }],
            });
          } catch (er) {
            console.log('metamask error', er);
            if (er?.code === 4902)
              try {
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainName: NETWORK_CHAIN_NAME,
                    chainId: await window.ethereum.chainId,
                    nativeCurrency: {
                      name: NETWORK_NATIVE_CURRENCY_NAME,
                      symbol: NETWORK_NATIVE_CURRENCY_SYMBOL,
                      decimals: Number(NETWORK_NATIVE_CURRENCY_DECIMALS)
                    },
                    rpcUrls: [NETWORK_RPC_URL],
                    blockExplorerUrls: [NETWORK_LINK]
                  }],
                });
              } catch (e) {}
            }
      });
    }

  }
  if (WALLET_TYPE.isBinance(defaultWalletType)) {
    if (BinanceChain) {
      BinanceChain.on('chainChanged', async chainId => {
        if (chainId !== NETWORK_CHAIN_ID)
          try {
            await BinanceChain.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: NETWORK_CHAIN_ID }],
            });
          } catch (error) {
            console.log('binance error', error)
          }
      });
    }
  }
}


const callWeb3ForWalletConnect = async (provider) => {
  const provide = new WalletConnectProvider({
    //infuraId: "8570afa4d18b4c5d9cb3a629b08de069",
    rpc: {
      97: 'https://data-seed-prebsc-2-s3.binance.org:8545/',
      56: "https://bsc-dataseed.binance.org/",
    },
    chainId: 97,
    network: "binance",
    qrcode: !0,
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
  // walletConnectProvider = provide;
  // web3Object = new Web3(provide);

  // return instance;
}


//exporting functions
export const ContractServices = {
  Web_3,
  getContract,
  getGasPrice,
  TokenContract,
  getBNBBalance,
  tryGetAccount,
  setWalletType,
  getPairDecimals,
  web3ErrorHandle,
  defaultWalletType,
  getDefaultAccount,
  walletWindowListener,
  isBinanceChainInstalled,
  callWeb3ForWalletConnect
}
