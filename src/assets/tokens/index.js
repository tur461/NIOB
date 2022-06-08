import ANCHOR from "../images/token_icons/ANCHOR-Token.svg";
import BTC from "../images/token_icons/BTCB-Token.svg";
import BNB from "../images/token_icons/WBNB-Token-Icon.svg";
import ETH from "../images/token_icons/ETH-Token.svg";
import BUSD from "../images/token_icons/BUSD-Token.svg";
import ADA from "../images/token_icons/ADA.svg";
import defaultImg from "../images/token_icons/default.svg";
import USDT from "../images/token_icons/USDT.svg";
import POLKADOT from "../images/token_icons/POLKADOT.svg";
import TRON from "../images/token_icons/TRON.svg";
import CAKE from "../images/token_icons/CAKE.svg";
import NIOB from "../images/token_icons/NIOB.svg"

import routerABI from "../ABI/router.ABI.json";
import factoryABI from "../ABI/factory.ABI.json";
import pairABI from "../ABI/pair.ABI.json";
import farmABI from "../ABI/farmABI.json";
import anchorABI from "../ABI/anchor.ABI.json";
import referralsABI from "../ABI/referrals.ABI.json";

// export const NIOB1 = "0x035781918b7221293B6938c9c0037cDf1dB183dE"
// export const NIOB2 = "0xADdcE6c9Dd30a6b252eAB252a11aBe518381132C"
// export const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
// export const DEFLATIONNARY_TOKENS = ["0x4aac18De824eC1b553dbf342829834E4FF3F7a9F", "0x5ac5e6Af46Ef285B3536833E65D245c49b608d9b"];
// export const LIQUIDITY_PROVIDER_FEE = 0.2;

export const NIOB1 = "0x035781918b7221293B6938c9c0037cDf1dB183dE"
export const NIOB2 = "0xADdcE6c9Dd30a6b252eAB252a11aBe518381132C"
export const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD"; // on bsc testnet 
export const DEFLATIONNARY_TOKENS = ["0x4aac18De824eC1b553dbf342829834E4FF3F7a9F", "0x5C4EF57E46c1E7724FCe37cb3B7a4451b7457856"];
export const LIQUIDITY_PROVIDER_FEE = 0.2;

// ******** BSC_MAIN_NET LP's, WETH and USD **********
// export const ANCHOR_BUSD_LP = "0xca8cb77efac26f901042196f766bac4ee5077df0";
// export const BNB_BUSD_LP = "0xe2466652a46e47fa278be0a2ad8dce7c8445be41";
// export const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
// export const USD = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
// export const pancakeFactory = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";

// ******** BSC_TEST_NET LP's, WETH and USD **********
export const ANCHOR_BUSD_LP = "0x5c93fa885d2D4Ee88032a28882638f40519Fb83d";
export const BNB_BUSD_LP = "0x1cd0db040D556280f95679cE2796aaE698475616";
export const WETH = "0x31BBA4f3f2Ec07Db6CFB2D959C72CcAB2bFD0e8A";
export const USD = "0x2Dd65fFe5F1B2D8a745b7194cCa59B451C5986D2";
export const pancakeFactory = "0x6725F303b657a9451d8BA641348b6761A6CC7a17";

// urls
export const DOCS = "https://docs.niob.finance";

// ******** BSC_MAIN_NET Token List **********
// export const TOKEN_LIST = [
//   {
//     icon: BNB,
//     name: "BNB",
//     address: "BNB",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "BNB",
//   },
//   {
//     icon: NIOB,
//     name: "NIOB",
//     address: "0x5ac5e6Af46Ef285B3536833E65D245c49b608d9b",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "NIOB",
//   },
//   {
//     icon: BUSD,
//     name: "BUSD",
//     address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "BUSD",
//   },
//   {
//     icon: ANCHOR,
//     name: "ANCHOR",
//     address: "0x4aac18De824eC1b553dbf342829834E4FF3F7a9F",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "ANCHOR",
//   },
//   {
//     icon: BNB,
//     name: "WBNB",
//     address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "WBNB",
//   },
//   {
//     icon: BTC,
//     name: "BTCB",
//     address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "BTCB",
//   },
//   {
//     icon: ETH,
//     name: "B-ETH",
//     address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "ETH",
//   },
//   {
//     icon: CAKE,
//     name: "CAKE",
//     address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "CAKE",
//   },
//   {
//     icon: POLKADOT,
//     name: "DOT",
//     address: "0x7083609fce4d1d8dc0c979aab8c869ea2c873402",
//     isAdd: false,
//     isDel: false,
//     decimals: 18,
//     symbol: "DOT",
//   },
  //   {
  //   icon: USDT,
  //   name: "USDT",
  //   address: "0x8C9dDC575c2Ef0Ff46d279Ab674FF9c8e531aa1b",
  //   isAdd: false,
  //   isDel: false,
  //   decimals: 18,
  //   symbol: "USDT",
  // },
// ];

// ********* BSC_MAIN_NET Contract Address **********
// export const MAIN_CONTRACT_LIST = {
//   router: {
//     address: "0x87674bBDed56d8749E49B00413a621831a0Fb266",
//     blockNumber: 6810080,
//     abi: routerABI,
//   },
//   panCakeRouter: {
//     address: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
//     blockNumber: 6810080,
//     abi: routerABI,
//   },
//   factory: {
//     address: "0xe0636f192a88De6F1c9ed1a6A0F265C9775c8596",
//     blockNumber: 6809737,
//     abi: factoryABI,
//   },
//   pair: {
//     address: "",
//     blockNumber: 0,
//     abi: pairABI,
//   },
//   farm: {
//     address: "0xD18B23ad6c8ACc4AD32AAd6a5dF750ce28C8C772",
//     blockNumber: 10004492,
//     abi: farmABI,
//   },
//   anchorNew: {
//     address: "0x5ac5e6Af46Ef285B3536833E65D245c49b608d9b",
//     blockNumber: 10350461,
//     abi: anchorABI,
//   },
//   referrals: {
//     address: "0xe25e719d59574E5eA1F681e49da5207bc56916fB",
//     blockNumber: 10004593,
//     abi: referralsABI,
//   },
// };

// ******** BSC_TEST_NET Token List **********
export const TOKEN_LIST = [
  {
    icon: BNB,
    name: "BNB",
    address: "BNB",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "BNB",
  },
  {
    icon: NIOB,
    name: "NIOB",
    address: "0x5C4EF57E46c1E7724FCe37cb3B7a4451b7457856",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "NB",
  },
  {
    icon: BUSD,
    name: "BUSD",
    address: "0x781F761139BB3B776DB8fD73DA5524E8eE458a97",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "BUSD",
  },
  {
    icon: ETH,
    name: "ETH",
    address: "0xe76833b8880B33adeC6d996B753E461A251bFd4e",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "ETH",
  },
  {
    icon: ADA,
    name: "Cardano",
    address: "0x8c033367885a452254b0FD4B8B4BBb0552D9Cd63",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "ADA",
  },
  {
    icon: ADA,
    name: "Tunb",
    address: "0xE87087aFc01c2b6e92DCAee6B5Ca8ecC1baBaa22",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "TUNB",
  },
  {
    icon: defaultImg,
    name: "Matic Token",
    address: "0x589Ffc4669b1126364c472dd7E954C404F6649b0",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "MATIC",
  },
  {
    icon: defaultImg,
    name: "MDex",
    address: "0xc0ABFCD5a3090728939E74A036F9c82b4B261796",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "MDX",
  },
];



// ********* BSC_TestNet Contract Address **********
export const MAIN_CONTRACT_LIST = {
  router: {
    address: "0x7489714061Fdf3B194D7151174817a3b2A1a918d",
    blockNumber: 6810080,
    abi: routerABI,
  },
  factory: {
    address: "0x33c86EBefA8910Aa85Fa09AC09714Caee54a7AA6",
    blockNumber: 6809737,
    abi: factoryABI,
  },
  pair: {
    address: "",
    blockNumber: 0,
    abi: pairABI,
  },
  farm: {
    address: "0xD6813A8809aD40e6d7Bd1540D454b126F10CBcEA",
    blockNumber: 10004492,
    abi: farmABI,
  },
  anchorNew: {
    address: "0xe121335A886FA620671D0d2a946139Fa5B265AB0",
    blockNumber: 10350461,
    abi: anchorABI,
  },
  referrals: {
    address: "0xF28b3D49Fd5d0B3DF81B9d3E559092CAeF512f9A",
    blockNumber: 10004593,
    abi: referralsABI,
  },
};






  // ******* Extra tokens just for icons *********
  // {
  //   icon: defaultImg,
  //   name: "Dai Token",
  //   address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  //   isAdd: false,
  //   isDel: false,
  //   decimals: 18,
  //   symbol: "DAI",
  // },
  // {
  //   icon: BTC,
  //   name: "BTCB Token",
  //   address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
  //   isAdd: false,
  //   isDel: false,
  //   decimals: 18,
  //   symbol: "BTCB",
  // },
  // {
  //   icon: USDT,
  //   name: "Tether USD",
  //   address: "0x55d398326f99059fF775485246999027B3197955",
  //   isAdd: false,
  //   isDel: false,
  //   decimals: 18,
  //   symbol: "USDT",
  // },
  // {
  //   icon: POLKADOT,
  //   name: "Polkadot Token",
  //   address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
  //   isAdd: false,
  //   isDel: false,
  //   decimals: 18,
  //   symbol: "DOT",
  // },
  // {
  //   icon: TRON,
  //   name: "TRON",
  //   address: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
  //   isAdd: false,
  //   isDel: false,
  //   decimals: 18,
  //   symbol: "TRX",
  // },
  // {
  //   icon: CAKE,
  //   name: "PancakeSwap Token",
  //   address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
  //   isAdd: false,
  //   isDel: false,
  //   decimals: 18,
  //   symbol: "Cake",
  // },
  // {
  //   icon: BNB,
  //   name: "Wrapped BNB",
  //   address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  //   isAdd: false,
  //   isDel: false,
  //   decimals: 18,
  //   symbol: "WBNB",
  // }

  // poolIndex = 0
  const poolInfoFormat = {
    0: "0x3EdC72ff334881b9d2f7797aae2Aa6d2F7d512B5",
    1: "10",
    2: "15165006",
    3: "14511378848726",
    4: "40",
    5: "0",
    accNiobPerShare: "14511378848726",
    allocPoint: "10",
    depositFeeBP: "40",
    harvestInterval: "0",
    lastRewardBlock: "15165006",
    lpToken: "0x3EdC72ff334881b9d2f7797aae2Aa6d2F7d512B5",
  };


  const LPTokens = [
    {
      poolIndex: 0,
      poolType: 2,
      addr: '0x3EdC72ff334881b9d2f7797aae2Aa6d2F7d512B5' 
    },
    {
      poolIndex: 1,
      poolType: 2,
      addr: '0xE87087aFc01c2b6e92DCAee6B5Ca8ecC1baBaa22' 
    },
    {
      poolIndex: 2,
      poolType: 1,
      addr: '0x20073dA3D2969d54b23BDCcFdb3aB8ae6bBd3a9B' 
    },
    {
      poolIndex: 3,
      poolType: 1,
      addr: '0xdF97c08538470f62acAd7658600F2A481c58ec48' 
    },
  ]