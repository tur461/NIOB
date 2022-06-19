import create from 'zustand';
import { ADDRESS, MISC, STR, TOKENS, T_TYPE } from "../../services/constant";
import { TOKEN_LIST } from "../../assets/tokens";
import defaultImg from '../../assets/images/token_icons/default.svg'
import { clone } from '../../services/utils/global';

const initialState = {
    addrPair: [],
    
    btnText: '',
    
    currentPair: '',
    createPairNeeded: !1,

    disabled: !0,
    deadline: MISC.DEF_DEADLINE,
    
    errText: '',
    exact: T_TYPE.A,

    isFetching: !1,
    filteredTokenList: [],
    
    hasPriceImpact: !1,
    
    isErr: !1,
    isMax: !0, 
    isFirstLP: !1,
    isLiqConfirmed: !1,
    isApprovalConfirmed: !1,
    
    lpTokenBalance: 0,
    
    minReceived: 0,
    modalCurrency: !1,
    
    path: null,
    pair: ADDRESS.ZERO,
    priceImpact: 0,
    pairExist: !0,
    poolShareShown: !1,
    
    show: !1,
    show1: !1,
    search: '',
    slippage: MISC.DEF_SLIPPAGE,
    showRecent: !1,
    settingShow: !1,
    showSupplyModal: !1,
    sharePoolValue: '100',
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
    token1Approved: !0,
    token2Approved: !0,
    tokenType: T_TYPE.A,
    token1: TOKENS.ETH,
    token2Icon: defaultImg,
    token2Currency: STR.SEL_TKN,
    token1Icon: TOKENS.ETH.icon,
    token1Currency: TOKENS.ETH.sym,
}

const useCommon = create((set, get) => ({
    ...clone(initialState),
    setErrText: errText => {
        set(s => ({...s, errText}));
    },
    setIsErr: isErr => {
        set(s => ({...s, isErr}));
    },
    setPath: path => {
        set(s => ({...s, path}));
    },
    setShow: show => {
        set(s => ({...s, show}));
    },
    setPairExist: pairExist => {
        set(s => ({...s, pairExist}));
    },
    setAddrPair: addrPair => {
        set(s => ({...s, addrPair: [...addrPair]}));
    },
    setBtnText: btnText => {
        set(s => ({...s, btnText}));
    },
    setPriceImpact: priceImpact => {
        set(s => ({...s, priceImpact}));
    },
    setHasPriceImpact: hasPriceImpact => {
        set(s => ({...s, hasPriceImpact}));
    },
    setShowRecent: show => {
        set(s => ({...s, showRecent: show}));
    },
    setSlippage: slippage => {
        set(s => ({...s, slippage}));
    },
    setDeadline: deadline => {
        set(s => ({...s, deadline}));
    },
    setDisabled: disabled => {
        set(s => ({...s, disabled}));
    },
    setFetching: isFetching => {
        set(s => ({...s, isFetching}));
    },
    setCreatePairNeeded: createPairNeeded => {
        set(s => ({...s, createPairNeeded}));
    },
    setSearch: search => {
        set(s => ({...s, search}));
    },
    setExact: tt => {
        set(s => ({...s, exact: tt}));
    },
    setIsMax: isMax => {
        set(s => ({...s, isMax}));
    },
    setPair: pair => {
        set(s => ({...s, pair}));
    },
    setMinReceived: mr => {
        set(s => ({...s, minReceived: mr}));
    },
    setToken: (x, t) => {
        if(t === T_TYPE.AB)
        set(s => ({...s, token1: x, token2: x}))
        else 
        set(s => ({...s, [`token${t}`]: x}));
    },
    setTokenIcon: (v, t) => {
        if(t === T_TYPE.AB)
        set(s => ({...s, token1Icon: v, token2Icon: v}))
        else 
        set(s => ({...s, [`token${t}Icon`]: v}));
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
    setShow1: show => {
        set(s => ({...s, show1: show}));
    },
    setSettingShow: show => {
        set(s => ({...s, settingShow: show}));
    },
    showTransactionModal: transactionModalShown => {
        set(s => ({...s, transactionModalShown}));
    },
    reset: _ => set(s => ({...clone(initialState)})),
}))

export default useCommon;