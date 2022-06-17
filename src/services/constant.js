import Saitama from '../assets/images/token_icons/Saitama.png';
import Eth from '../assets/images/token_icons/ETH-Token.svg';
import Gen from '../assets/images/token_icons/TRON.svg';
import { obj2list } from './utils/global';

export const rootName = "";
export const HOME_ROUTE = process.env.REACT_APP_HOME_ROUTE;
export const API_HOST = process.env.REACT_APP_API_URL;
export const CAPTCHA_KEY = process.env.REACT_APP_GOOGLE_CAPTCHA_KEY;
export const BSC_SCAN = process.env.REACT_APP_BSC_SCAN;
export const NETWORK_CHAIN_NAME = process.env.REACT_APP_NETWORK_CHAIN_NAME;
export const NETWORK_RPC_URL = process.env.REACT_APP_NETWORK_RPC_URL;
export const NETWORK_LINK = process.env.REACT_APP_NETWORK_LINK;
export const NETWORK_VERSION = process.env.REACT_APP_NETWORK_VERSION;
export const NETWORK_CHAIN_ID = process.env.REACT_APP_NETWORK_CHAIN_ID;
export const NETWORK_NATIVE_CURRENCY_NAME = process.env.REACT_APP_NETWORK_NATIVE_CURRENCY_NAME;
export const NETWORK_NATIVE_CURRENCY_SYMBOL = process.env.REACT_APP_NETWORK_NATIVE_CURRENCY_SYMBOL;
export const NETWORK_NATIVE_CURRENCY_DECIMALS = process.env.REACT_APP_NETWORK_NATIVE_CURRENCY_DECIMALS;
export const globalResErrMsg =
  "Woops something went wrong, Please try again.";
export const SUCCESS_200 = 200;
export const BAD_REQUEST = 400;
export const UNAUTHORISED = 401;
export const AUTH_TOKEN_KEY = "api-access-token";
export const PASSPORT_FRONT = 0;
export const PASSPORT_BACK = 4;
export const LICENSE_FRONT = 2;
export const LICENSE_BACK = 3;
export const NATIONAL_ID = 1;
export const KYC_SUBMITTED = 0;
export const KYC_APPROVED = 1;
export const KYC_DECLINED = 2;
export const KYC_RE_SUBMITTED = 3;
export const LIQUIDITY_PROVIDER_FEE = 0.2;
export const DOCS_LINK = 'https://docs.anchorswap.finance';
export const TWITTER_LINK = 'https://twitter.com/AnchorSwap';
export const TELEGRAM_LINK = 'https://t.me/joinchat/KP-_HKro73ViZTZk';
export const AUDIT_LINK = 'https://docs.anchorswap.finance/audit/';

export const MINIMUM_LIQUIDITY = 10 ** 3;

export const ABI = {
  FACTORY: require('../assets/ABI/factory.ABI.json'),
  ROUTER: require('../assets/ABI/router.ABI.json'),
  PAIR: require('../assets/ABI/pair.ABI.json'),
  TOKEN: require('../assets/ABI/tokenContract.ABI.json'),
  SAITAMA: require('../assets/ABI/Saitama.json'),
  STAKING: require('../assets/ABI/SaitamaStaking.json'),
  SMA_FARM: require('../assets/ABI/farmABI.json'),
}

export const ADDRESS = {
  NATIVE: 'NATIVE',
  ZERO: '0x' + '0'.repeat(40),
  WETH: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  SAITAMA: '0x352E956eB0247792842ABD234d3f7425BBf544c2',
  SMA_STAKING: '0x6DF6a2D4ce73Fc937625Db2E5fb5762F248B30F3',
  SMA_FARM: '',
  PAIR: '',
  ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  FACTORY: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
}

export const MISC = {
  TYPE_DELAY: 350,
}

export const VAL = {
  MAX_256: '0x'+'f'.repeat(64),
}

export const TKN = {
  BNB: 'BNB',
}

export const STR = {
  SEL_TKN: 'Select a token',
  BAL_NOT_ENOUGH: 'Insufficient balance of ',
  ALW_NOT_ENOUGH: 'Insufficient allowance of ',
}

console.log('process env:', process.env);

export const isMetamakConnected = async () => {
  const { ethereum } = window;
  const result = Boolean(ethereum && ethereum.isMetaMask);
  try {
    if (result) {
      const chain = await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CHAIN_ID }],
      });
      return true;
    } else {
      window.alert(`Install Metamask extension first!`);
      window.open('https://metamask.io/', '_blank');
      return false;
    }
  } catch (error) {
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

        return true;;

      } catch (error) {
        return false;
      }
    }
    if (error?.code === 4001) {
      return false;
    }
    throw error;
  }

}

export const addCommas = (nStr) => {
  nStr += '';
  let x = nStr.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? '.' + x[1] : '';
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}

export const T_TYPE = {
  A: 1,
  B: 2,
  AB: 0,
}

export const WALLET_TYPE = {
  M_MASK: 'Metamask',
  B_NANCE: 'BinanceChain',
  W_CONNECT: 'Walletconnect',
  isMMask: w => w === WALLET_TYPE.M_MASK,
  isBinance: w => w === WALLET_TYPE.B_NANCE,
  isWalletConnect: w => w === WALLET_TYPE.W_CONNECT,
}

export const TOKENS = {
  ETH: {
    name: 'ether token',
    dec: 18,
    sym: 'ETH',
    icon: Eth,
    bal: '',
    isAdded: !0,
    isDeleted: !1,
    addr: 'NATIVE',
  },
  WETH: {
    name: 'wrapped ether token',
    dec: 18,
    sym: 'WETH',
    icon: Eth,
    bal: '',
    isAdded: !0,
    isDeleted: !1,
    addr: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
  },
  TUR: {
    name: 'tur token',
    dec: 18,
    sym: 'TUR',
    icon: Gen,
    bal: '',
    isAdded: !0,
    isDeleted: !1,
    addr: '0xEe8F3Df788B0357d35D66F9023626f99f29a8351',
  },
  STEEP: {
    name: 'steep labs token',
    dec: 18,
    sym: 'STEEP',
    icon: Gen,
    bal: '',
    isAdded: !0,
    isDeleted: !1,
    addr: '0x8605c0c5E361dd897A5526558C48E7ff0D51353c',
  },
  SAITAMA: {
    name: 'saitama token',
    dec: 18,
    sym: 'SAITAMA',
    icon: Saitama,
    bal: '',
    isAdded: !0,
    isDeleted: !1,
    addr: '0x352E956eB0247792842ABD234d3f7425BBf544c2',
  }
}

export const TOKEN_LIST = obj2list(TOKENS)

class ErrObj {
  id = -1;
  msg = '';
  loc = '';
  dat = null;
  static ctr = 0;
  static create(m) {
      let inst = new ErrObj();
      inst.id = ErrObj.ctr;
      inst.msg = m;
      ++ErrObj.ctr;
      return inst;
  }
}

export const ERR = {
  LOW_BAL: ErrObj.create('Balance low for '),
  SEL_TOKEN: ErrObj.create('Please select token!'),
  PAIR_NOT_EXIST: ErrObj.create('Pair doesn\'t exist!'),
  XCESV_IP_AMT: ErrObj.create('Excessive input amount!'),
  INSUF_OP_AMT: ErrObj.create('Insufficient output amount!'),
  SAME_TOKENS: ErrObj.create('Please select dissimilar tokens!'),
  TOKEN_ADDR_NDEF: ErrObj.create('one or both of the token address/s invalid!') 

}

