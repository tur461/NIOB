
import Gen from '../assets/images/token_icons/TRON.svg';
import Eth from '../assets/images/token_icons/ETH-Token.svg';
import Saitama from '../assets/images/token_icons/Saitama.png';
import { obj2list } from './utils/global';


const HTTP_CODE = {
  OK: 200,
  BAD_REQ: 400,
  UNAUTH: 401,
  INT_SERVER: 501,
} 

const LINKS = {
  DOCS: 'https://docs.saitamaswap.finance',
  TWITTER: 'https://twitter.com/AnchorSwap',
  AUDIT: 'https://docs.saitamaswap.finance/audit/',
  TELEGRAM: 'https://t.me/joinchat/KP-_HKro73ViZTZk',
}

const THRESHOLD = {
  MIN_LIQUIDITY: 10 ** 3,
  LIQUIDITY_PROVIDER_FEE: 0.2,

}

const ABI = {
  FACTORY: require('../assets/ABI/factory.ABI.json'),
  ROUTER: require('../assets/ABI/router.ABI.json'),
  PAIR: require('../assets/ABI/pair.ABI.json'),
  TOKEN: require('../assets/ABI/tokenContract.ABI.json'),
  SAITAMA: require('../assets/ABI/Saitama.json'),
  STAKING: require('../assets/ABI/SaitamaStaking.json'),
  SMA_FARM: require('../assets/ABI/farmABI.json'),
}

const ADDRESS = {
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

const MISC = {
  DEF_DEC: 18,
  TYPE_DELAY: 350,
  DEF_DEADLINE: 20,
  DEF_SLIPPAGE: 0.5,
}

const VAL = {
  MAX_256: '0x'+'f'.repeat(64),
}

const STR = {
  SEL_TKN: 'Select a token',
  BAL_NOT_ENOUGH: 'Insufficient balance of ',
  ALW_NOT_ENOUGH: 'Insufficient allowance of ',
}

const addCommas = (nStr) => {
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

const T_TYPE = {
  A: 1,
  B: 2,
  AB: 0,
}

const WALLET_TYPE = {
  M_MASK: 'Metamask',
  B_NANCE: 'BinanceChain',
  W_CONNECT: 'Walletconnect',
  isMMask: w => w === WALLET_TYPE.M_MASK,
  isBinance: w => w === WALLET_TYPE.B_NANCE,
  isWalletConnect: w => w === WALLET_TYPE.W_CONNECT,
}

const NETWORK = {
  VERSION: '0.1',
  CHAIN_ID: '0x4', // 4 for rinkeby
  NATIVE_CURR_SYMBOL: 'ETH',
  NATIVE_CURR_NAME: 'Ether',
  NATIVE_CURR_DEC: MISC.DEF_DEC,
  CHAIN_NAME: 'Rinkeby Test Network',
  LINK: 'https://rinkeby.etherscan.io/',
  RPC_URL: 'https://rinkeby.infura.io/v3/',
}

const TOKENS = {
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

let t = [];
Object.keys(TOKENS).forEach(k => t.push(TOKENS[k]));
const TOKEN_LIST = t;

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

const ERR = {
  LOW_BAL: ErrObj.create('Balance low for '),
  SEL_TOKEN: ErrObj.create('Please select token!'),
  PAIR_NOT_EXIST: ErrObj.create('Pair doesn\'t exist!'),
  XCESV_IP_AMT: ErrObj.create('Excessive input amount!'),
  INSUF_OP_AMT: ErrObj.create('Insufficient output amount!'),
  PATH_NOT_EXIST: ErrObj.create('No path exist in the pair!'),
  INSTALL_WALLET: ErrObj.create('You have to install Wallet!'),
  SAME_TOKENS: ErrObj.create('Please select dissimilar tokens!'),
  TOKEN_ADDR_NDEF: ErrObj.create('one or both of the token address/s invalid!') 

}

const TX_ERR = {
  DEF: 'Unknown Transaction Error!',
  USR_TX_DENIAL: 'User denied transaction:Transaction Rejected!',
}

export {
  ABI,
  ERR,
  VAL,
  STR,
  MISC,
  LINKS,
  T_TYPE,
  TOKENS,
  TX_ERR,
  NETWORK,
  ADDRESS,
  addCommas,
  HTTP_CODE,
  THRESHOLD,
  TOKEN_LIST,
  WALLET_TYPE,
}