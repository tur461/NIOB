import create from 'zustand';
import { actionTypes } from "../actions";
import { TOKEN_LIST } from "../../assets/tokens";
import { T_TYPE } from "../../constant";


const useLiquid = create((set, get) => ({
  
  currentPair: '',
  
  filteredTokenList: [],
  
  isFirstLP: !1,
  isLiqConfirmed: !1,
  isApprovalConfirmed: !1,
  
  lpTokenBalance: 0,
  
  modalCurrency: !1,
  
  poolShareShown: !1,
  
  showSupplyModal: !1,
  sharePoolValue: 100,
  selectedCurrency: '',
  transactionModalShown: !1,
  
  txHash: '',
  token2: {},
  token1Value: '',
  token2Value: '',
  token1Balance: 0,
  token2Balance: 0,
  token1Deposit: 0,
  token2Deposit: 0,
  token1Approved: !1,
  token2Approved: !1,
  tokenType: T_TYPE.A,
  token1: TOKEN_LIST[0],
  token1ApprovalNeeded: !1,
  token2ApprovalNeeded: !1,
  token2Currency: 'Select a token',
  token1Currency: TOKEN_LIST[0].symbol,

  setToken: (x, t) => {
    if(t === T_TYPE.AB)
      set(s => ({...s, token1: x, token2: x}))
    else 
      set(s => ({...s, [`token${t}`]: x}));
  },
  setTokenValue: (v, t) => {
    if(t === T_TYPE.AB)
      set(s => ({...s, token1Value: v, token2Value: v}))
    else 
      set(s => ({...s, [`token${t}Value`]: v}));
  },
  setTokenCurrency: (c, t) => {
    if(t === T_TYPE.AB)
      set(s => ({...s, token1Currency: c, token2Currency: c}))
    else 
      set(s => ({...s, [`token${t}Currency`]: c}));
  },
  setTokenDeposit: (d, t) => {
    set(s => ({...s, [`token${t}Deposit`]: d}));
  },
  showPoolShare: poolShareShown => {
    set(s => ({...s, poolShareShown}));
  },
  setTokenType: tokenType => {
    set(s => ({...s, tokenType}));
  },
  setCurrentPair: currentPair => {
    set(s => ({...s, currentPair}));
  },
  setTokenBalance: (b, t) => {
    set(s => ({...s, [`token${t}Balance`]: b}));
  },
  setTokenApprovalNeeded: (a, t) => {
    set(s => ({...s, [`token${t}Approval`]: a}));
  },
  setLiqConfirmed: isLiqConfirmed => {
    set(s => ({...s, isLiqConfirmed}));
  },
  setTokenApproved: (a, t) => {
    set(s => ({...s, [`token${t}Approved`]: a}));
  },
  setIsFirstLP: isFirstLP => {
    set(s => ({...s, isFirstLP}));
  },
  setLpTokenBalance: lpTokenBalance => {
    set(s => ({...s, lpTokenBalance}));
  },
  setSharePoolValue: sharePoolValue => {
    set(s => ({...s, sharePoolValue}));
  },
  setFilteredTokenList: l => {
    set(s => ({...s, filteredTokenList: [...l]}));
  },
  setSelectedCurrency: selectedCurrency => {
    set(s => ({...s, selectedCurrency}));
  },
  setModalCurrency: modalCurrency => {
    set(s => ({...s, modalCurrency}));
  },
  setApprovalConfirmed: isApprovalConfirmed => {
    set(s => ({...s, isApprovalConfirmed}));
  },
  setShowSupplyModal: showSupplyModal => {
    set(s => ({...s, showSupplyModal}));
  },
  setTxHash: txHash => {
    set(s => ({...s, txHash}));
  },
  showTransactionModal: transactionModalShown => {
    set(s => ({...s, transactionModalShown}));
  },
}))

export default useLiquid;