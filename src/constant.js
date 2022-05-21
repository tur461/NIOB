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

