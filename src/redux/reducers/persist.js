import { TOKEN_LIST, WALLET_TYPE } from "../../services/constant";
import { rEq } from "../../services/utils/global";
import { actionTypes } from "../actions/PersistActions";
console.log('TOKEN_LIST', TOKEN_LIST);

const initialState = {
  walletType: WALLET_TYPE.M_MASK,
  priAccount: '',
  isConnected: '',
  isUserConnected: '',
  tokenList: TOKEN_LIST,
  slippage: 7.5,
  deadline: 20,
  userInfo: "",
  loggedIn: false,
  userLpTokens: [],
  recentTransactions: [],
  referralAddress: "",
  updateUserLpTokens: false,
  hasAccess: false,
  footerValues: ""
};

const persist = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.USER_CONNECTED:
      return {
        ...state,
        priAccount: action.payload.account,
        isConnected: action.payload.account && action.payload.account.length === 42,
        isUserConnected: action.payload.account,
        walletType: action.payload.walletType,
      };
    case actionTypes.TOKEN_LIST_ADD:
      initialState.tokenList.push(action.payload);
      return {
        ...state,
        tokenList: initialState.tokenList,
      };
    case actionTypes.TOKEN_LIST_DEL:
      initialState.tokenList.splice(initialState.tokenList.findIndex(tkn => rEq(tkn.addr, action.payload.address)), 1);
      return {
        ...state,
        tokenList: initialState.tokenList,
      };
    case actionTypes.SAVE_SLIPPAGE_PERCENTAGE:
      return {
        ...state,
        slippage: action.payload,
      };
    case actionTypes.SAVE_DEADLINE:
      return {
        ...state,
        deadline: action.payload,
      };
    case actionTypes.LOGIN_USER_SUCCESS:
      return {
        ...state,
        userInfo: action.payload,
        loggedIn: true,
      };
    case actionTypes.SAVE_USER_LP_TOKENS:
      return {
        ...state,
        userLpTokens: action.payload,
      };
    case actionTypes.SAVE_USER_RECENT_TRANSACTIONS:
      return {
        ...state,
        recentTransactions: action.payload.recentTransactions,
      };
    case actionTypes.LOGOUT:
      return initialState;
    case actionTypes.CHECK_USER_LPTOKENS:
      return {
        ...state,
        updateUserLpTokens: action.payload
      };
    case actionTypes.LOGIN_CONFIRMATION_SREEN:
      return {
        ...state,
        hasAccess: true
      };
    case actionTypes.LOGOUT_CONFIRMATION_SREEN:
      return {
        ...state,
        hasAccess: true
      };
    case actionTypes.SAVE_FOOTER_DATA:
      return {
        ...state,
        footerValues: action.payload,
      };
    default:
      return state;
  }
};

export default persist;
