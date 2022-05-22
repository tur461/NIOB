import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Col, Tabs, Tab } from 'react-bootstrap'
import ConnectWallet from "../../components/ConnectWallet/ConnectWallet";
import CardCustom from "../../components/cardCustom/CardCustom";
import ButtonPrimary from "../../components/Button/Button";
import SelectCoin from "../../components/selectCoin/SelectCoin";
import SwapModal from "../../components/SwapModal/SwapModal";
import ArrowDown from "../../assets/images/Arrow-Down-Icon.svg";
import SettingIcon from "../../assets/images/Settings-Icon.svg";
import NIOBIcon from "../../assets/images/NIOB-Token-Icon.svg";
import BNBIcon from "../../assets/images/token_icons/WBNB-Token-Icon.svg";
import SwitchIcon from "../../assets/images/Switch-Icon.svg";
import ModalCurrency from "../../components/Modal/ModalCurrency/ModalCurrency";
import "./Trade.scss";
import SettingModal from "../../components/Modal/SettingModal/SettingModal";
import { MAIN_CONTRACT_LIST, TOKEN_LIST, WETH, LIQUIDITY_PROVIDER_FEE, USD } from '../../assets/tokens'
import defaultImg from '../../assets/images/token_icons/default.svg'
import { ContractServices } from "../../services/ContractServices"
import { toast } from '../../components/Toast/Toast';
import { ExchangeService } from "../../services/ExchangeService"
import { BigNumber } from "bignumber.js"
import { searchTokenByNameOrAddress, addTransaction, startLoading, stopLoading } from "../../redux/actions"
import Button from '../../components/Button/Button'
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import TransactionalModal from "../../components/TransactionalModal/TransactionalModal";
import iconTimer from '../../assets/images/ionic-ios-timer.svg'

const Exchange = (props) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [show1, setShow1] = useState(false);
  const handleClose1 = () => setShow1(false);
  const handleShow1 = () => setShow1(true);
  const [settingShow, setsettingShow] = useState(false);
  const settingClose = () => setsettingShow(false);
  const settinghandleShow = () => setsettingShow(true);
  const [classToggle, setClassToggle] = useState(false);




  const dispatch = useDispatch();

  const isUserConnected = useSelector(state => state.persist.isUserConnected);
  const tokenList = useSelector(state => state.persist.tokenList);
  const deadline = useSelector(state => state.persist.deadline);
  const slippagePercentage = useSelector(state => state.persist.slippagePercentage);

  const [modalCurrency, setModalCurrency] = useState(false);
  const [tokenOne, setTokenOne] = useState(TOKEN_LIST[0]);
  const [tokenTwo, setTokenTwo] = useState({});
  const [tokenOneValue, setTokenOneValue] = useState();
  const [tokenTwoValue, setTokenTwoValue] = useState();
  const [sharePoolValue, setSharePoolValue] = useState(100);
  const [tokenOneCurrency, setCurrencyNameForTokenOne] = useState(TOKEN_LIST[0].symbol);
  const [tokenTwoCurrency, setCurrencyNameForTokenTwo] = useState('Select a token');
  const [tokenOneBalance, setTokenOneBalance] = useState(0);
  const [tokenTwoBalance, setTokenTwoBalance] = useState(0);
  const [tokenOneApproval, setTokenOneApproval] = useState(false);
  const [tokenTwoApproval, setTokenTwoApproval] = useState(false);

  const [tokenOneApproved, setTokenOneApproved] = useState(false);
  const [tokenTwoApproved, setTokenTwoApproved] = useState(false);

  const [lpTokenBalance, setLpTokenBalance] = useState(0);
  const [tokenType, setTokenType] = useState('TK1');
  const [showSupplyModal, setShowSupplyModal] = useState(false);

  const [search, setSearch] = useState("");
  const [filteredTokenList, setFilteredTokenList] = useState([]);
  const [liquidityConfirmation, setLiquidityConfirmation] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState('');

  const [currentPairAddress, setCurrentPairAddress] = useState('');
  const [firstProvider, setFirstProvider] = useState(false);
  const [showPoolShare, setShowPoolShare] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [walletShow, setWalletShow] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [isDisabled, setDisabled] = useState(true);
  const [btnText, setBtnText] = useState('Enter an amount');
  const [approvalConfirmation, setApprovalConfirmation] = useState(false);
  const [openSwapModal, setSwapModal] = useState(false);
  const [priceImpact, setPriceImpact] = useState('');
  const [minimumReceived, setMinReceived] = useState(0);
  const [existingPair, setPairAddress] = useState([]);
  const [tokenOneIcon, setTokenOneIcon] = useState(TOKEN_LIST[0].icon);
  const [tokenTwoIcon, setTokenTwoIcon] = useState(defaultImg);
  const [max, setMax] = useState(true);

  useEffect(() => {
    setFilteredTokenList(tokenList.filter((token) => token.name.toLowerCase().includes(search.toLowerCase())));
    init();
  }, [search, tokenList]);

  useEffect(() => {
    if (tokenOneValue) {
      handleTokenValue(tokenOneValue, 'TK1');
    }
  }, [tokenTwo, tokenTwoCurrency, tokenTwoBalance, tokenTwoIcon]);


  const init = async () => {
    if (isUserConnected) {
      const oneBalance = await ContractServices.getBNBBalance(isUserConnected);
      setTokenOneBalance(oneBalance);
    }
  };

  const onHandleOpenModal = (tokenType) => {
    if (!isUserConnected) {
      return toast.error('Connect wallet first!');
    }
    setFilteredTokenList(tokenList);
    setSelectedCurrency(tokenType === 'TK1' ? tokenTwoCurrency : tokenOneCurrency);
    setModalCurrency({
      modalCurrency: true,
    });
    setTokenType(tokenType);
  }
  const onHandleSelectCurrency = async (token, selecting) => {
    const { address, symbol, icon } = token;
    if (!isUserConnected) {
      return toast.error('Connect wallet first!');
    }
    let a1, a2, oneBalance = 0, twoBalance = 0;
    if (selecting === 'TK1') {
      a1 = address;
      if (address === 'BNB') {
        oneBalance = await ContractServices.getBNBBalance(isUserConnected);
        setTokenOneApproved(true);
      } else {
        setTokenOneApproved(false);
        oneBalance = await ContractServices.getTokenBalance(address, isUserConnected);
      }
      setTokenOne(token);
      setCurrencyNameForTokenOne(symbol);
      setTokenOneBalance(oneBalance);
      setTokenOneIcon(icon);
      setTokenOneValue(0.00);
      setTokenTwoValue(0.00);
      setMax(true);
      if (tokenTwo.address) {
        a2 = tokenTwo.address;
      }
      if (tokenOneValue > 0) {
        const r = await getAllowance(tokenOneValue, 'TK1');
      }
    }
    if (selecting === 'TK2') {
      a2 = address;
      if (address === 'BNB') {
        setTokenTwoApproved(true);
        twoBalance = await ContractServices.getBNBBalance(isUserConnected);
      } else {
        setTokenTwoApproved(false);
        twoBalance = await ContractServices.getTokenBalance(address, isUserConnected);
      }
      setTokenTwo(token);
      setCurrencyNameForTokenTwo(symbol);
      setTokenTwoBalance(twoBalance);
      setTokenTwoIcon(icon);
      setTokenOneValue(0.00);
      setTokenTwoValue(0.00);
      if (tokenOne.address) {
        a1 = tokenOne.address;
      }
      if (tokenTwoValue > 0) {
        const r = await getAllowance(tokenTwoValue, 'TK2');
      }
    }
    setModalCurrency(!modalCurrency);
    setSearch('');
    setFilteredTokenList(tokenList);

    if (a1 && a2) {
      let currentPairAddress;
      if (a1 === 'BNB') {
        a1 = WETH;//WETH
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      } else if (a2 === 'BNB') {
        a2 = WETH;//WETH
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      } else {
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      }

      if (currentPairAddress !== '0x0000000000000000000000000000000000000000') {
        setCurrentPairAddress(currentPairAddress);
        const lpTokenBalance = await ContractServices.getTokenBalance(currentPairAddress, isUserConnected);
        setLpTokenBalance(lpTokenBalance);
        setFirstProvider(false);
        setShowPoolShare(true);
        setBtnText('Enter an amount');
        setDisabled(true);
      } else {
        setCurrentPairAddress('');
        setFirstProvider(true);
        setShowPoolShare(true);
        setLpTokenBalance(0);
        setDisabled(true);
        setBtnText('Insufficient liquidity for this trade.');
      }
    }
  }

  const getAllowance = async (amount, tokenType) => {
    if (tokenType === 'TK1') {
      if (isUserConnected && tokenOne.address !== 'BNB') {
        let allowance = await ContractServices.allowanceToken(tokenOne.address, MAIN_CONTRACT_LIST.router.address, isUserConnected);
        allowance = Number(allowance) / 10 ** Number(tokenOne.decimals);
        //  console.log(allowance, 'token 1')
        if (amount > allowance) {
          setTokenOneApproval(true);
        } else {
          setTokenOneApproved(true);
        }

      } else {
        setTokenOneApproved(true);
      }
    }
    if (tokenType === 'TK2') {
      if (isUserConnected && tokenTwo.address !== 'BNB') {
        let allowance = await ContractServices.allowanceToken(tokenTwo.address, MAIN_CONTRACT_LIST.router.address, isUserConnected);
        allowance = Number(allowance) / 10 ** Number(tokenTwo.decimals);
        // console.log(allowance, 'token 2')
        if (amount > allowance) {
          setTokenTwoApproval(true);
        } else {
          setTokenTwoApproved(true);
        }
      } else {
        setTokenTwoApproved(true);
      }
    }
    return true;
  }
  const handleMaxBalance = async (amountIn) => {
    if (!isUserConnected) {
      return toast.error('Connect wallet first!');
    }
    if (tokenOne.address === 'BNB') {
      // .002 BNB is reserved for saving gas fee 
      const bnbBalance = await ContractServices.getBNBBalance(isUserConnected) - 0.1;
      handleTokenValue(bnbBalance, amountIn);
      setMax(false);
    } else {
      // __ amount of particular token must be reserved for saving -needs to be fixed 
      const tokenBalance = await ContractServices.getTokenBalance(tokenOne.address, isUserConnected);
      handleTokenValue(tokenBalance, amountIn);
      setMax(false);
    }
  }

  const checkPairWithBNBOrUSDT = async (token1, token2) => {
    const pair1 = await ExchangeService.getPair(token1, WETH);
    const pair2 = await ExchangeService.getPair(token2, WETH);
    if (pair1 !== '0x0000000000000000000000000000000000000000' && pair2 !== '0x0000000000000000000000000000000000000000') {
      return [token1, WETH, token2];
    }
    const pairOne = await ExchangeService.getPair(token1, USD);
    const pairTwo = await ExchangeService.getPair(token2, USD);
    if (pairOne !== '0x0000000000000000000000000000000000000000' && pairTwo !== '0x0000000000000000000000000000000000000000') {
      return [token1, USD, token2];
    }
    return false;
  }

  const isInputOk = ip => typeof ip == 'string' && !ip.length ? !1 : ip === 0 ? !1 : !0;

  const handleTokenValue = async (amount, tokenType) => {
    console.log('handling token value:', amount, tokenType);
    if(tokenType === 'TK1') setTokenOneValue(amount);
    if(tokenType === 'TK2') setTokenTwoValue(amount);
    if(!isInputOk(amount)) {
      console.log('amount not ok!');
      if(tokenType === 'TK1') setTokenTwoValue('');
      if(tokenType === 'TK2') setTokenOneValue('');
      return;
    }
    try {
      if (!isUserConnected) {
        return;
      }
      const acc = await ContractServices.getDefaultAccount();
      if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
        return toast.error('Wallet address doesn`t match!');
      }
      let add1ForPriceImpact, add2ForPriceImpact;
      if (tokenType === 'TK1') {
        if (tokenTwoCurrency === 'Select a token') {
          setBtnText('Select token');
          return;
        }
        const balance = await checkTokenORCurrencyBalance(tokenOne.address);
        if (amount > balance) {
          setDisabled(true);
          setBtnText(`Insufficient ${tokenOne.symbol} balance`);
          return;
        }
        setDisabled(false);
        const r = await getAllowance(amount, tokenType);
        if (r && tokenOne.address && tokenTwo.address && amount > 0) {
          let tokenTwoAddress = tokenTwo.address;
          let tokenOneAddress = tokenOne.address;

          if (tokenTwo.address === 'BNB') {
            tokenTwoAddress = WETH;
          }
          if (tokenOne.address === 'BNB') {
            tokenOneAddress = WETH;

          }
          let result;
          let isPriceImpact = false;
          const checkPair = await ExchangeService.getPair(tokenOneAddress, tokenTwoAddress);
          if (checkPair !== '0x0000000000000000000000000000000000000000') {
            result = await ExchangeService.getAmountsOut(amount, [tokenOneAddress, tokenTwoAddress]);
            add1ForPriceImpact = tokenOneAddress;
            add2ForPriceImpact = tokenTwoAddress;
          } else {
            const pair = await checkPairWithBNBOrUSDT(tokenOneAddress, tokenTwoAddress);
            if (pair) {
              result = await ExchangeService.getAmountsOut(amount, pair);
              add1ForPriceImpact = pair[0];
              add2ForPriceImpact = pair[1];
              isPriceImpact = true;
            }
          }
          if (result.length > 0) {
            const a = Number(result[result.length - 1].toFixed(5));
            const ratio = Number(amount) / Number(a);
            setSharePoolValue(ratio.toFixed(10));
            setTokenTwoValue(a);
            setAmountIn("TK1");
            let amountOut = BigNumber(a * 10 ** tokenTwo.decimals).toFixed();
            const minimumReceived = Number(amountOut) - (Number(amountOut) * slippagePercentage / 100);
            setMinReceived(minimumReceived);
            calculatePriceImpact(tokenType, amount, add1ForPriceImpact, add2ForPriceImpact, isPriceImpact);
          }
        }
      }
      if (tokenType === 'TK2') {
        if (tokenOneCurrency === 'Select a token') {
          setBtnText('Select token');
          return;
        }
        const balance = await checkTokenORCurrencyBalance(tokenTwo.address);
        if (amount > balance) {
          setDisabled(true);
          setBtnText(`Insufficient ${tokenTwo.symbol} balance`);
          return;
        }
        setDisabled(false);
        const r = await getAllowance(amount, tokenType);
        if (r && tokenOne.address && tokenTwo.address && amount > 0) {
          let tokenTwoAddress = tokenTwo.address;
          let tokenOneAddress = tokenOne.address;

          if (tokenTwo.address === 'BNB') {
            tokenTwoAddress = WETH;
          }
          if (tokenOne.address === 'BNB') {
            tokenOneAddress = WETH;
          }
          let result;
          let isPriceImpact = false;
          const checkPair = await ExchangeService.getPair(tokenTwoAddress, tokenOneAddress);
          if (checkPair !== '0x0000000000000000000000000000000000000000') {
            result = await ExchangeService.getAmountsIn(amount, [tokenTwoAddress, tokenOneAddress]);
            add1ForPriceImpact = tokenOneAddress;
            add2ForPriceImpact = tokenTwoAddress;
            
          } else {
            const pair = await checkPairWithBNBOrUSDT(tokenTwoAddress, tokenOneAddress);
            if (pair) {
              result = await ExchangeService.getAmountsIn(amount, pair);
              add1ForPriceImpact = pair[0];
              add2ForPriceImpact = pair[1];
              isPriceImpact = true;
            }
          }
          console.log('add1ForPriceImpact', add1ForPriceImpact);
          console.log('add2ForPriceImpact', add2ForPriceImpact);
          if (result.length > 0) {
            const a = Number(result[result.length - 1].toFixed(5));
            setTokenOneValue(a);
            const ratio = Number(amount) / Number(a);
            setSharePoolValue(ratio.toFixed(10))
            setAmountIn("TK2");
            let amountOut = BigNumber(a * 10 ** tokenTwo.decimals).toFixed();
            const minimumReceived = Number(amountOut) - (Number(amountOut) * slippagePercentage / 100);
            setMinReceived(minimumReceived);
            await calculatePriceImpact(tokenType, a, add2ForPriceImpact, add1ForPriceImpact, isPriceImpact);
          }
        }
      }
      console.log('tokenOne and tokenTwo:', tokenOne, tokenTwo);
      if (tokenOne.address && tokenTwo.address) {
        let a1 = add1ForPriceImpact, a2 = add2ForPriceImpact;
        let currentPairAddress;
        if (a1 === 'BNB') {
          a1 = WETH;//WETH
          currentPairAddress = await ExchangeService.getPair(a1, a2);
        } else if (a2 === 'BNB') {
          a2 = WETH;//WETH
          currentPairAddress = await ExchangeService.getPair(a1, a2);

        } else {
          currentPairAddress = await ExchangeService.getPair(a1, a2);
        }
        if (currentPairAddress !== '0x0000000000000000000000000000000000000000') {
          setCurrentPairAddress(currentPairAddress);
          console.log('a1 and a2', a1, a2);
          console.log('token balance, cpa, isuser', currentPairAddress, isUserConnected);
          const lpTokenBalance = await ContractServices.getTokenBalance(currentPairAddress, isUserConnected);
          setLpTokenBalance(lpTokenBalance);
          //const reserves = await ExchangeService.getReserves(currentPairAddress);
          //setSharePoolValue(ratio.toFixed(2));
          setFirstProvider(false);
          setShowPoolShare(true);
          setDisabled(false);
        } else {
          setCurrentPairAddress('');
          setFirstProvider(true);
          setShowPoolShare(true);
          setLpTokenBalance(0);
          setDisabled(true);
        }
      }

    } catch (e) {
      console.log(e);
      toast.error("Something went wrong!");
    }
  }

  const calculatePriceImpact = async (tokenType, amount, a1, a2, isPriceImpact) => {
    let calPriceImpact;
    let priceImpact;

    const currentPairAddress = await ExchangeService.getPair(a1, a2);
    const reserve = await ExchangeService.getReserves(currentPairAddress);
    const tokenZero = await ExchangeService.getTokenZero(currentPairAddress);
    const tokenOne = await ExchangeService.getTokenOne(currentPairAddress);
    const decimalZero = await ContractServices.getDecimals(tokenZero);
    const decimalOne = await ContractServices.getDecimals(tokenOne);
    if (tokenZero.toLowerCase() === a1.toLowerCase()) {
      const res = Number(reserve[0]) / (10 ** decimalZero);

      calPriceImpact = (amount / res) * 100;
      priceImpact = (calPriceImpact - (calPriceImpact * LIQUIDITY_PROVIDER_FEE) / 100);
      if (isPriceImpact) {
        Number(priceImpact * 2);
      }
      setPriceImpact(priceImpact.toFixed(5));
    }
    if (tokenOne.toLowerCase() === a1.toLowerCase()) {
      const res = Number(reserve[1]) / (10 ** decimalOne);

      calPriceImpact = (amount / res) * 100;
      priceImpact = (calPriceImpact - (calPriceImpact * LIQUIDITY_PROVIDER_FEE) / 100);
      if (isPriceImpact) {
        Number(priceImpact * 2);
      }
      setPriceImpact(priceImpact.toFixed(5));
    }
  }

  const handleSearchToken = async (data) => {
    try {
      const res = await dispatch(searchTokenByNameOrAddress(data));
      setFilteredTokenList(res);
    } catch (error) {
      toast.error("Something went wrong!");
    }
  }
  const handleCloseSettings = () => setShowSettings(false);
  const handleCloseRecent = () => setShowRecent(false);
  const handleBalance = async () => {
    const address = amountIn === 'TK1' ? tokenTwo.address : tokenOne.address;

    let balance;

    if (address === 'BNB') {
      balance = await ContractServices.getBNBBalance(isUserConnected);
    } else {
      balance = await ContractServices.getTokenBalance(address, isUserConnected);
    }
    if (amountIn === 'TK1') {
      setTokenTwoBalance(balance);
    }
    if (amountIn === 'TK2') {
      setTokenOneBalance(balance);
    }
  }
  const handleSwap = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }
    setSwapModal(false);
    let value = 0, checkBNBforTK1 = false, checkBNBforTK2 = false;

    let dl = Math.floor((new Date()).getTime() / 1000);
    dl = dl + (deadline * 60);

    let a1 = tokenOne.address, a2 = tokenTwo.address;

    if (tokenOne.address === 'BNB') {
      a1 = WETH;
      checkBNBforTK1 = true;
      value = tokenOneValue;
    }
    if (tokenTwo.address === 'BNB') {
      a2 = WETH;
      checkBNBforTK2 = true;
      value = tokenTwoValue;
    }
    if (value > 0) {
      value = BigNumber(value * 10 ** 18).toFixed();
    }
    if (checkBNBforTK1) {
      dispatch(startLoading());
      const data = await handleBNBSwapForTK1(dl, value);
      try {
        const result = amountIn === 'TK1' ?

          await ExchangeService.swapExactETHForTokens(data, handleBalance) :

          await ExchangeService.swapETHForExactTokens(data);

        dispatch(stopLoading());
        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);
          setShowSupplyModal(false);


          const data = {
            message: `Swap ${tokenOne.symbol} and ${tokenTwo.symbol}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
        setLiquidityConfirmation(false);

      } catch (err) {
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        setLiquidityConfirmation(false);
      }
    } else if (checkBNBforTK2) {
      dispatch(startLoading());
      const data = await handleBNBSwapForTK2(value);
      try {
        const result = amountIn === 'TK1' ?

          await ExchangeService.swapExactTokensForETH(data, a1, a2) :

          await ExchangeService.swapTokensForExactETH(data, a1, a2);

        dispatch(stopLoading());

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);
          setShowSupplyModal(false);
          const data = {
            message: `Swap ${tokenOne.symbol} and ${tokenTwo.symbol}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
        setLiquidityConfirmation(false);

      } catch (err) {
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        setLiquidityConfirmation(false);
      }
    } else {
      dispatch(startLoading());
      let pair;
      const checkPair = await ExchangeService.getPair(a1, a2);

      if (checkPair !== '0x0000000000000000000000000000000000000000') {
        pair = [a1, a2];
      } else {
        const pairs = await checkPairWithBNBOrUSDT(a1, a2);
        if (pairs) {
          pair = pairs;
        }
      }
      let data = await handleSwapAmoutnIn(value);
      data.path = pair;
      try {
        const result = amountIn === 'TK1' ?

          await ExchangeService.swapExactTokensForTokens(data, a1, a2) :

          await ExchangeService.swapTokensForExactTokens(data, a1, a2);

        dispatch(stopLoading());

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);
          setShowSupplyModal(false);

          const data = {
            message: `Swap ${tokenOne.symbol} and ${tokenTwo.symbol}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
        setLiquidityConfirmation(false);

      } catch (err) {
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        setLiquidityConfirmation(false);
      }
    }
  }

  const handleSwapAmoutnIn = async (value) => {
    let amountAMin;
    let amountBMin;

    if (amountIn == "TK1") {
      let amountADesired = tokenOneValue * 10 ** tokenOne.decimals;
      let amountBDesired = tokenTwoValue * 10 ** tokenTwo.decimals;

      amountAMin = BigNumber(amountADesired).toFixed();
      amountBMin = BigNumber(amountBDesired - (amountBDesired * slippagePercentage / 100)).toFixed();
    }

    if (amountIn == "TK2") {
      let amountADesired = tokenOneValue * 10 ** tokenOne.decimals;
      let amountBDesired = tokenTwoValue * 10 ** tokenTwo.decimals;

      amountAMin = BigNumber(amountADesired).toFixed();
      amountBMin = BigNumber(amountBDesired + (amountBDesired * slippagePercentage / 100)).toFixed();
    }

    let dl = Math.floor((new Date()).getTime() / 1000);
    dl = dl + (deadline * 60);

    return {
      amountIn: amountAMin.toString(),
      amountOutMin: amountBMin.toString(),
      path: [tokenOne.address, tokenTwo.address],
      to: isUserConnected,
      deadline: dl,
      value: value.toString()
    };
  }
  const handleBNBSwapForTK1 = async (dl, value) => {
    let amountOutMin;
    if (amountIn === "TK1") {
      let amountOut = BigNumber(Math.floor(tokenTwoValue * 10 ** tokenTwo.decimals)).toFixed();

      amountOutMin = BigNumber(Math.floor(Number(amountOut) - (Number(amountOut) * slippagePercentage / 100))).toFixed();
      amountOutMin = amountOutMin.toString();
    }

    if (amountIn === "TK2") {
      let amountOut = BigNumber(Math.floor(tokenOneValue * 10 ** tokenOne.decimals)).toFixed();
      amountOutMin = BigNumber(Math.floor(amountOut)).toFixed();
      amountOutMin = amountOutMin.toString();
    }


    return {
      amountOutMin: amountOutMin.toString(),
      path: [WETH, tokenTwo.address],
      to: isUserConnected,
      deadline: dl,
      value
    };
  }

  const handleBNBSwapForTK2 = async (value) => {
    let dl = Math.floor((new Date()).getTime() / 1000);
    dl = dl + (deadline * 60);

    if (amountIn === "TK1") {
      let amountOut = tokenTwoValue * 10 ** tokenOne.decimals;
      let amountIn = BigNumber(Math.floor(tokenOneValue * 10 ** tokenOne.decimals)).toFixed();
      let amountOutMin = BigNumber(Math.floor(amountOut - (amountOut * slippagePercentage / 100))).toFixed();
      // const amount = Math.floor(value);
      return {
        amountIn,
        amountOutMin,
        path: [tokenOne.address, WETH],
        to: isUserConnected,
        deadline: dl,
        value
      };
    }

    if (amountIn === "TK2") {
      let amountIn = tokenTwoValue * 10 ** tokenTwo.decimals;
      let amountOut = BigNumber(Math.floor(tokenOneValue * 10 ** tokenOne.decimals)).toFixed();
      let amountInMax = BigNumber(Math.floor(amountIn + (amountIn * slippagePercentage / 100))).toFixed();
      // const amount = Math.floor(value);
      return {
        amountOut: amountOut.toString(),
        amountInMax: amountInMax.toString(),
        path: [tokenOne.address, WETH],
        to: isUserConnected,
        deadline: dl,
        value
      };
    }
  }
  const handleSwitchCurrencies = () => {
    setTokenOneValue(tokenTwoValue);
    setTokenTwoValue(tokenOneValue);
    setCurrencyNameForTokenOne(tokenTwoCurrency);
    setCurrencyNameForTokenTwo(tokenOneCurrency);
    setTokenOneBalance(tokenTwoBalance);
    setTokenTwoBalance(tokenOneBalance);
    setTokenOneIcon(tokenTwoIcon);
    setTokenTwoIcon(tokenOneIcon);
    setTokenOne(tokenTwo);
    setTokenTwo(tokenOne);
    amountIn == 'TK1' ? setAmountIn('TK2') : setAmountIn('TK1');
  }
  //call web3 approval function
  const handleTokenApproval = async (tokenType) => {
    if (approvalConfirmation) {
      return toast.info('Token approval is processing');
    }
    // const value = (2*256 - 1).toString();
    const value = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    let tokenAddress = 'BNB';
    if (tokenType === 'TK1') {
      tokenAddress = tokenOne.address;
    }
    if (tokenType === 'TK2') {
      tokenAddress = tokenTwo.address;
    }
    try {
      dispatch(startLoading());
      const r = await ContractServices.approveToken(isUserConnected, value, MAIN_CONTRACT_LIST.router.address, tokenAddress);
      if (r.code === 4001) {
        toast.error("User denied transaction signature.");
      } else {
        setApprovalConfirmation(true);
        let data = {
          message: `Approve`,
          tx: r.transactionHash
        };
        if (tokenType === 'TK1') {
          setTokenOneApproved(true);
          setTokenOneApproval(false);

          data.message = `Approve ${tokenOne.symbol}`;
        }
        if (tokenType === 'TK2') {
          setTokenTwoApproved(true);
          setTokenTwoApproval(false);
          data.message = `Approve ${tokenTwo.symbol}`;
        }
        dispatch(addTransaction(data));
        setApprovalConfirmation(false);

      }
      dispatch(stopLoading());
    } catch (err) {
      setApprovalConfirmation(false);
      dispatch(stopLoading());
      console.log(err);
      toast.error('Transaction Reverted!');
    }
  }
  const handleApprovalButton = (tokenType) => {
    if (tokenOneApproval && tokenType === 'TK1') {
      return (
        <Col className="swapBtn_col">
          <ButtonPrimary
            className="swapBtn"
            title={`Approve ${tokenOne.symbol}`}
            onClick={() => handleTokenApproval(tokenType)} disabled={approvalConfirmation}
          /></Col>);
    }
    if (tokenTwoApproval && tokenType === 'TK2') {
      return (<Col className="swapBtn_col">
        <ButtonPrimary
          className="swapBtn"
          title={`Approve ${tokenTwo.symbol}`}
          onClick={() => handleTokenApproval(tokenType)} disabled={approvalConfirmation}
        /></Col>);
    }
    //dead code
    return null;
  }
  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    //props.backBtn();
    //window.location.reload();
  }
  const checkTokenORCurrencyBalance = async (address) => {
    if (address === 'BNB') {
      return await ContractServices.getBNBBalance(isUserConnected);
    } else {
      return await ContractServices.getTokenBalance(address, isUserConnected);
    }
  }
  const liquidityProviderFee = () => {
    const value = amountIn === 'TK1' ? tokenOneValue : tokenTwoValue;
    const tokenCurrency = amountIn === 'TK1' ? tokenOneCurrency : tokenTwoCurrency;
    let lpf = (value * 2) / 1000;
    lpf = BigNumber(lpf).toFixed();
    const calLpf = lpf + ' ' + tokenCurrency
    return calLpf;
  }
  return (
    <>
      <Container fluid className="swapScreen comnSection">
        <CardCustom>
          <div className="settingSec">
            <h4>Exchange</h4>
            <div className="settingIcon">
              <img src={iconTimer} onClick={() => setShowRecent(true)} className="timerImg" />
              <img src={SettingIcon} onClick={() => settinghandleShow(true)} />
            </div>
          </div>
          <SelectCoin
            label={`Balance: ${tokenOneBalance}`}
            coinImage={tokenOne?.icon}
            value={tokenOneCurrency}
            onClick={() => onHandleOpenModal('TK1')}
            inputLabel="Input"
            className="mb-0"
            placeholder="0.0"
            onChange={(e) => handleTokenValue(e.target.value, 'TK1')}
            max={max}
            onMax={() => handleMaxBalance('TK1')}
            defaultValue={tokenOneValue}
          />
          <div className="convert_plus" onClick={handleSwitchCurrencies}>
            <img src={ArrowDown} />
          </div>
          <SelectCoin
            label={`Balance: ${tokenTwoBalance}`}
            coinImage={tokenTwo?.icon}
            value={tokenTwoCurrency}
            onClick={() => onHandleOpenModal("TK2")}
            inputLabel="Input"
            className="mb-0"
            placeholder="0.0"
            onChange={(e) => handleTokenValue(e.target.value, 'TK2')}
            max={false}
            defaultValue={tokenTwoValue}
          />
          {slippagePercentage &&
            <Col className="priceSec_col">
              <div>
                {(!isDisabled && isUserConnected) && <h5>Price</h5>}
                <h5>Slippage Tolerance</h5>
              </div>
              <div className="text-end">
                <h5>
                  {(!isDisabled && isUserConnected) && <>{sharePoolValue}  {tokenOneCurrency} per {tokenTwoCurrency}</>}
                  {/* <img
                    src={SwitchIcon}
                    alt="swap_icon"
                    className="ms-2"
                  /> */}
                </h5>
                <h5>{`${slippagePercentage}%`}</h5>
              </div>
            </Col>}
          {handleApprovalButton('TK1')}
          {handleApprovalButton('TK2')}
          {/* <Col className="swapBtn_col">
            <ButtonPrimary
              className="swapBtn"
              title="Approve"
              onClick={() => handleShow1(true)}
            />
            <ButtonPrimary
              className="swapBtn dismissBtn"
              title="Dismiss"
              onClick={() => handleShow1(true)}
            />
          </Col> */}
          <Col className="swapBtn_col">
            {(isDisabled && !isUserConnected) &&
              <ButtonPrimary className="swapBtn" onClick={() => setWalletShow(true)} title={'Unlock Wallet'} />}
            {/* ******* delete below button while enabling swap ******* */}
            {/* {<ButtonPrimary disabled className="swapBtn" title={'Swap'} />} */}
            {/* ******* uncomment both of the below buttons while enabling swap ******* */}
            {(isDisabled && isUserConnected) && <ButtonPrimary disabled className="swapBtn" title={btnText} />}
            {(!isDisabled && isUserConnected) && <ButtonPrimary className="swapBtn" onClick={() => setSwapModal(!openSwapModal)} title={'Swap'} />}
          </Col>
        </CardCustom>
        {(!isDisabled && isUserConnected) &&
          <div className="card_style card_style_bottom">
            <ul>
              <li>Minimum received:<sapn>{minimumReceived / 10 ** 18}</sapn></li>
              <li>Price impact:<sapn>{priceImpact}%</sapn></li>
              <li>Liquidity provider fee:<sapn>{liquidityProviderFee()}</sapn></li>
            </ul>
          </div>}
      </Container>
      <ModalCurrency
        show={modalCurrency}
        handleShow={setModalCurrency}
        handleClose={setModalCurrency}
        tokenList={filteredTokenList}
        selectCurrency={onHandleSelectCurrency}
        searchToken={handleSearchToken}
        searchByName={setSearch}
        tokenType={tokenType}
        handleOrder={setFilteredTokenList}
        currencyName={selectedCurrency}
      />
      <ConnectWallet
        show={walletShow}
        handleShow={handleShow1}
        handleClose={handleClose1}
      />
      <SettingModal
        show={settingShow}
        handleShow={settinghandleShow}
        handleClose={settingClose}
      />
      {openSwapModal && <SwapModal
        handleSwap={handleSwap}
        closeModal={() => setSwapModal(!openSwapModal)}
        tokenOneCurrency={tokenOneCurrency}
        tokenTwoCurrency={tokenTwoCurrency}
        tokenOneValue={tokenOneValue}
        tokenTwoValue={tokenTwoValue}
        tokenOneIcon={tokenOne?.icon}
        tokenTwoIcon={tokenTwo?.icon}
        sharePoolValue={sharePoolValue}
        priceImpact={priceImpact}
        liquidityProviderFee={liquidityProviderFee()}
        show={openSwapModal}
      />}
      <RecentTransactions
        show={showRecent}
        handleClose={handleCloseRecent}
      />
      <TransactionalModal show={showTransactionModal} handleClose={closeTransactionModal} txHash={txHash} />
    </>

  );
};

export default Exchange;
