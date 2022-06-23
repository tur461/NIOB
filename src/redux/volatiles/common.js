import {Percent} from '@uniswap/sdk';
import create from 'zustand';
import { ADDRESS, MISC, STR, TOKENS, T_TYPE } from "../../services/constant";
import { TOKEN_LIST } from "../../assets/tokens";
import defaultImg from '../../assets/images/token_icons/default.svg'
import { clone } from '../../services/utils/global';

const initialState = {
    addrPair: [],
    
    btnText: '',
    
    cPair: null,
    createPairNeeded: !1,

    decPair: [],
    disabled: !0,
    dataFetched: !1,
    deadline: MISC.DEF_DEADLINE,
    
    errText: '',
    exact: T_TYPE.A,

    isFetching: !1,
    
    hasPriceImpact: !1,
    
    isIn: !0,
    isErr: !1,
    isMax: !0, 
    isTxErr: !1,
    isFirstLP: !1,
    insufLiq1: !1,
    insufLiq2: !1,
    isLiqConfirmed: !1,
    isApprovalConfirmed: !1,
    
    lpFee: 0.0,
    lpTokenBalance: 0,
    
    maxSpent: 0.0,
    minReceived: 0.0,
    modalCurrency: !1,
    
    path: null,
    pair: ADDRESS.ZERO,
    priceImpact: 0,
    pairExist: !0,
    poolShareShown: !1,

    reserves: [],

    show: !1,
    show1: !1,
    search: '',
    showBal1: !0,
    showBal2: !1,
    showMaxBtn1: !0,
    showSwapInfo: !1,
    showMaxBtn2: !1,
    showRecent: !1,
    settingShow: !1,
    searchValue: '',
    showSupplyModal: !1,
    sharePoolValue: '100',
    selectedCurrency: '',
    transactionModalShown: !1,
    slippage: MISC.DEF_SLIPPAGE,
    
    txHash: '',
    txErr: '',
    tokens: [],
    token2: null,
    trade: null,
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

    setIsIn: isIn => set(s => ({...s, isIn})),
    setPair: pair => set(s => ({...s, pair})),
    setPath: path => set(s => ({...s, path})),
    setShow: show => set(s => ({...s, show})),
    setLPFee: lpFee => set(s => ({...s, lpFee})),
    setIsErr: isErr => set(s => ({...s, isErr})),
    setTrade: trade => set(s => ({...s, trade})),
    setTxErr: txErr => set(s => ({...s, txErr})),
    setCPair: cPair => set(s => ({...s, cPair})),
    setIsMax: isMax => set(s => ({...s, isMax})),
    setExact: tt => set(s => ({...s, exact: tt})),
    setSearch: search => set(s => ({...s, search})),
    setTxHash: txHash => set(s => ({...s, txHash})),
    reset: _ => set(s => ({...clone(initialState)})),
    setShow1: show => set(s => ({...s, show1: show})),
    setDecPair: decPair => set(s => ({...s, decPair})),
    setErrText: errText => set(s => ({...s, errText})),
    setIsTxErr: isTxErr => set(s => ({...s, isTxErr})),
    setBtnText: btnText => set(s => ({...s, btnText})),
    setTokens: tz => set(s => ({...s, tokens: [...tz]})),
    setShowBal1: showBal1 => set(s => ({...s, showBal1})),
    setReserves: reserves => set(s => ({...s, reserves})),
    setShowBal2: showBal2 => set(s => ({...s, showBal2})),
    setSlippage: slippage => set(s => ({...s, slippage})),
    setDeadline: deadline => set(s => ({...s, deadline})),
    setDisabled: disabled => set(s => ({...s, disabled})),
    setMaxSpent: maxSpent => set(s => ({...s, maxSpent})),
    setInsufLiq1: insufLiq1 => set(s => ({...s, insufLiq1})),
    setInsufLiq2: insufLiq2 => set(s => ({...s, insufLiq2})),
    setTokenType: tokenType => set(s => ({...s, tokenType})),
    setPairExist: pairExist => set(s => ({...s, pairExist})),
    setIsFirstLP: isFirstLP => set(s => ({...s, isFirstLP})),
    setFetching: isFetching => set(s => ({...s, isFetching})),
    setShowRecent: show => set(s => ({...s, showRecent: show})),
    setSettingShow: show => set(s => ({...s, settingShow: show})),
    setMinReceived: minReceived => set(s => ({...s, minReceived})),
    setSearchValue: searchValue => set(s => ({...s, searchValue})),
    setPriceImpact: priceImpact => set(s => ({...s, priceImpact})),
    setShowMaxBtn1: showMaxBtn1 => set(s => ({...s, showMaxBtn1})),
    setShowMaxBtn2: showMaxBtn2 => set(s => ({...s, showMaxBtn2})),
    setDataFetched: dataFetched => set(s => ({...s, dataFetched})),
    setShowSwapInfo: showSwapInfo => set(s => ({...s, showSwapInfo})),
    showPoolShare: poolShareShown => set(s => ({...s, poolShareShown})),
    setAddrPair: addrPair => set(s => ({...s, addrPair: [...addrPair]})),
    setModalCurrency: modalCurrency => set(s => ({...s, modalCurrency})),
    setLiqConfirmed: isLiqConfirmed => set(s => ({...s, isLiqConfirmed})),
    setTokenDeposit: (d, t) => set(s => ({...s, [`token${t}Deposit`]: d})),
    setHasPriceImpact: hasPriceImpact => set(s => ({...s, hasPriceImpact})),
    setLpTokenBalance: lpTokenBalance => set(s => ({...s, lpTokenBalance})),
    setSharePoolValue: sharePoolValue => set(s => ({...s, sharePoolValue})),
    setTokenApproved: (a, t) => set(s => ({...s, [`token${t}Approved`]: a})),
    setShowSupplyModal: showSupplyModal => set(s => ({...s, showSupplyModal})),
    setCreatePairNeeded: createPairNeeded => set(s => ({...s, createPairNeeded})),
    setSelectedCurrency: selectedCurrency => set(s => ({...s, selectedCurrency})),
    setTokenApprovalNeeded: (a, t) => set(s => ({...s, [`token${t}Approval`]: a})),
    setApprovalConfirmed: isApprovalConfirmed => set(s => ({...s, isApprovalConfirmed})),
    showTransactionModal: transactionModalShown => set(s => ({...s, transactionModalShown})),
    setDec: (dec, t) => {
        let tkn = get()[`token${t}`];
        tkn.dec = dec;
        set(s => ({...s, [`token${t}`]: {...tkn}}));
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
    setTokenBalance: (b, t) => {
        let tkn = get()[`token${t}`];
        tkn.bal = b;
        set(s => ({...s, [`token${t}`]: {...tkn}}));
        set(s => ({...s, [`token${t}Balance`]: b}));
    },
}))

export default useCommon;