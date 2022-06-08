import create from 'zustand';
import { STR, T_TYPE } from "../../constant";
import { TOKEN_LIST } from "../../assets/tokens";
import defaultImg from '../../assets/images/token_icons/default.svg'



const useCommon = create((set, get) => ({
    btnText: '',
    
    currentPair: '',

    disabled: !0,
    
    exact: T_TYPE.A,

    isFetching: !1,
    filteredTokenList: [],
    
    hasPriceImpact: !1,
    
    isMax: !0, 
    isFirstLP: !1,
    isLiqConfirmed: !1,
    isApprovalConfirmed: !1,
    
    lpTokenBalance: 0,
    
    minReceived: 0,
    modalCurrency: !1,
    
    priceImpact: 0,
    poolShareShown: !1,
    
    show: !1,
    show1: !1,
    search: '',
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
    token1: TOKEN_LIST[0],
    token2Icon: defaultImg,
    token2Currency: STR.SEL_TKN,
    token1Icon: TOKEN_LIST[0].icon,
    token1Currency: TOKEN_LIST[0].symbol,

    setShow: show => {
        set(s => ({...s, show}));
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
    setDisabled: disabled => {
        set(s => ({...s, disabled}));
    },
    setFetching: isFetching => {
        set(s => ({...s, isFetching}));
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
}))

export default useCommon;