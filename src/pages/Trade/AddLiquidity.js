import React, { useEffect, useState } from "react";
import { Container, Col } from "react-bootstrap";
import ConnectWallet from "../../components/ConnectWallet/ConnectWallet";
import CardCustom from "../../components/cardCustom/CardCustom";
import ButtonPrimary from "../../components/Button/Button";
import SelectCoin from "../../components/selectCoin/SelectCoin";
import Plusicon from "../../assets/images/plus_yellow.png";
import ModalCurrency from "../../components/Modal/ModalCurrency/ModalCurrency";
import ButtonBack from "../../components/buttonBack/ButtonBack";
import "./Trade.scss";
import SettingModal from "../../components/Modal/SettingModal/SettingModal";
import SettingIcon from "../../assets/images/Settings-Icon.svg";
import TimerIcon from "../../assets/images/ionic-ios-timer.svg";
import { useSelector, useDispatch } from "react-redux";
import { MAIN_CONTRACT_LIST, TOKEN_LIST, WETH } from "../../assets/tokens";
import { ContractServices } from "../../services/ContractServices";
import { toast } from "../../components/Toast/Toast";
import { ExchangeService } from "../../services/ExchangeService";
import {
  addTransaction,
  checkUserLpTokens,
  searchTokenByNameOrAddress,
  startLoading,
  stopLoading,
} from "../../redux/actions";
import { BigNumber } from "bignumber.js";
import SupplyModal from "../../components/SupplyModal/SupplyModal";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";

const AddLiquidity = (props) => {
  const tokenList = useSelector((state) => state.persist.tokenList);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [show1, setShow1] = useState(false);
  const handleClose1 = () => setShow1(false);
  const handleShow1 = () => setShow1(true);
  const [settingShow, setsettingShow] = useState(false);
  const settingClose = () => setsettingShow(false);
  const [showRecent, setShowRecent] = useState(false);
  const supplyModalClose = () => setShowSupplyModal(false);
  const recentTransactionsClose = () => setShowRecent(false);
  const settinghandleShow = () => setsettingShow(true);
  const [search, setSearch] = useState("");
  const [max, setMax] = useState(true);

  const dispatch = useDispatch();

  const MINIMUM_LIQUIDITY = 10 ** 3;

  const isUserConnected = useSelector((state) => state.persist.isUserConnected);
  const walletType = useSelector((state) => state.persist.walletType);
  const deadline = useSelector((state) => state.persist.deadline);
  const slippagePercentage = useSelector(
    (state) => state.persist.slippagePercentage
  );

  const [modalCurrency, setModalCurrency] = useState(false);
  const [tokenOne, setTokenOne] = useState(TOKEN_LIST[0]);
  const [tokenTwo, setTokenTwo] = useState({});
  const [tokenOneValue, setTokenOneValue] = useState('');
  const [tokenTwoValue, setTokenTwoValue] = useState('');
  const [sharePoolValue, setSharePoolValue] = useState(100);
  const [tokenOneCurrency, setCurrencyNameForTokenOne] = useState(
    TOKEN_LIST[0].symbol
  );
  const [tokenTwoCurrency, setCurrencyNameForTokenTwo] =
    useState("Select a token");
  const [tokenOneBalance, setTokenOneBalance] = useState(0);
  const [tokenTwoBalance, setTokenTwoBalance] = useState(0);
  const [tokenOneDeposit, setTokenOneDeposit] = useState(0);
  const [tokenTwoDeposit, setTokenTwoDeposit] = useState(0);
  const [tokenOneApproval, setTokenOneApproval] = useState(false);
  const [tokenTwoApproval, setTokenTwoApproval] = useState(false);

  const [tokenOneApproved, setTokenOneApproved] = useState(false);
  const [tokenTwoApproved, setTokenTwoApproved] = useState(false);

  const [lpTokenBalance, setLpTokenBalance] = useState(0);
  const [tokenType, setTokenType] = useState("TK1");
  const [showSupplyModal, setShowSupplyModal] = useState(false);

  const [filteredTokenList, setFilteredTokenList] = useState([]);
  const [approvalConfirmation, setApprovalConfirmation] = useState(false);
  const [liquidityConfirmation, setLiquidityConfirmation] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState("");

  const [currentPairAddress, setCurrentPairAddress] = useState("");
  const [firstProvider, setFirstProvider] = useState(false);
  const [showPoolShare, setShowPoolShare] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    setFilteredTokenList(tokenList.filter((token) => token.name.toLowerCase().includes(search.toLowerCase())));
    init();
  }, [search, tokenList]);

  const init = async () => {
    if (isUserConnected) {
      const oneBalance = await ContractServices.getBNBBalance(isUserConnected);
      setTokenOneBalance(oneBalance);

      const { lptoken } = props;
      if (lptoken) {
        setCurrentPairAddress(lptoken.pair);
        setLpTokenBalance(lptoken.balance);
        setSharePoolValue(lptoken.poolShare);
        if (lptoken.token0Obj) {
          setTokenOne(lptoken.token0Obj);
          setCurrencyNameForTokenOne(lptoken.token0Obj.symbol);
          setTokenOneDeposit(lptoken.token0Deposit);
          let tokenBal = 0;
          if (lptoken.token0Obj.address === "BNB") {
            tokenBal = oneBalance;
          } else {
            tokenBal = await ContractServices.getTokenBalance(
              lptoken.token0Obj.address,
              isUserConnected
            );
          }
          setTokenOneBalance(tokenBal);
        }
        if (lptoken.token1Obj) {
          setTokenTwo(lptoken.token1Obj);
          setCurrencyNameForTokenTwo(lptoken.token1Obj.symbol);
          setTokenTwoDeposit(lptoken.token1Deposit);
          let tokenBal = 0;
          if (lptoken.token1Obj.address === "BNB") {
            tokenBal = oneBalance;
          } else {
            tokenBal = await ContractServices.getTokenBalance(
              lptoken.token1Obj.address,
              isUserConnected
            );
          }
          setTokenTwoBalance(tokenBal);
        }
      }
    }
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    props.backBtn();
    window.location.reload();
  };

  const onHandleOpenModal = (tokenType) => {
    console.log('dropdown:', tokenType);
    if (!isUserConnected) {
      return toast.error("Connect wallet first!");
    }
    setShow(true);
    setFilteredTokenList(tokenList);
    setSelectedCurrency(
      tokenType === "TK1" ? tokenTwoCurrency : tokenOneCurrency
    );
    setModalCurrency({
      modalCurrency: true,
    });
    setTokenType(tokenType);
  };
  const onHandleSelectCurrency = async (token, selecting) => {
    console.log('select currency:', token, selecting);
    const { address, symbol } = token;
    if (!isUserConnected) {
      return toast.error("Connect wallet first!");
    }
    let a1,
      a2,
      oneBalance = 0,
      twoBalance = 0;
    if (selecting === "TK1") {
      handleClose();
      a1 = address;
      if (address === "BNB") {
        oneBalance = await ContractServices.getBNBBalance(isUserConnected);
        setTokenOneApproved(true);
      } else {
        setTokenOneApproved(false);
        oneBalance = await ContractServices.getTokenBalance(
          address,
          isUserConnected
        );
      }
      setTokenOne(token);
      setCurrencyNameForTokenOne(symbol);
      setTokenOneBalance(oneBalance);
      if (tokenTwo.address) {
        a2 = tokenTwo.address;
      }
      if (tokenOneValue > 0) {
        const r = await getAllowance(tokenOneValue, "TK1");
      }
    }
    if (selecting === "TK2") {
      handleClose();
      a2 = address;
      if (address === "BNB") {
        setTokenTwoApproved(true);
        twoBalance = await ContractServices.getBNBBalance(isUserConnected);
      } else {
        setTokenTwoApproved(false);
        twoBalance = await ContractServices.getTokenBalance(
          address,
          isUserConnected
        );
      }
      setTokenTwo(token);
      setCurrencyNameForTokenTwo(symbol);
      setTokenTwoBalance(twoBalance);
      if (tokenOne.address) {
        a1 = tokenOne.address;
      }
      if (tokenTwoValue > 0) {
        const r = await getAllowance(tokenTwoValue, "TK2");
      }
    }
    setModalCurrency(!modalCurrency);
    setSearch("");
    setFilteredTokenList(tokenList);

    if (a1 && a2) {
      let currentPairAddress;
      if (a1 === "BNB") {
        a1 = WETH; //WETH
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      } else if (a2 === "BNB") {
        a2 = WETH; //WETH
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      } else {
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      }

      if (currentPairAddress !== "0x0000000000000000000000000000000000000000") {
        setCurrentPairAddress(currentPairAddress);
        const lpTokenBalance = await ContractServices.getTokenBalance(
          currentPairAddress,
          isUserConnected
        );
        const d1 = await ContractServices.getDecimals(a1);
        const d2 = await ContractServices.getDecimals(a2);
        const reserves = await ExchangeService.getReserves(currentPairAddress);
        calculateLiquidityPercentageWithSelectCurrency(reserves, d1, d2, lpTokenBalance, currentPairAddress);
        setLpTokenBalance(lpTokenBalance);
        setFirstProvider(false);
        setShowPoolShare(true);
        // xxxxxxxxx
        // const reserves = await ExchangeService.getReserves(currentPairAddress);
        // calculateLiquidityPercentage(reserves, amt1, amt2);
        // console.log('qqqqq', currentPairAddress);
        // const reserves = await ExchangeService.getReserves(currentPairAddress);
        // console.log('aaaaa', reserves);
        // await calculateLiquidityPercentage(reserves, 0.1, 0.02);
        // console.log('wwww', result);
      } else {
        setCurrentPairAddress("");
        setFirstProvider(true);
        setShowPoolShare(true);
        setLpTokenBalance(0);
      }
    }
  };

  const getAllowance = async (amount, tokenType) => {
    if (tokenType === "TK1") {
      if (isUserConnected && tokenOne.address !== "BNB") {
        let allowance = await ContractServices.allowanceToken(
          tokenOne.address,
          MAIN_CONTRACT_LIST.router.address,
          isUserConnected
        );
        allowance = Number(allowance) / 10 ** Number(tokenOne.decimals);
        // console.log(allowance, 'token 1')
        if (amount > allowance) {
          setTokenOneApproval(true);
        } else {
          setTokenOneApproved(true);
        }
      } else {
        setTokenOneApproved(true);
      }
    }
    if (tokenType === "TK2") {
      if (isUserConnected && tokenTwo.address !== "BNB") {
        let allowance = await ContractServices.allowanceToken(
          tokenTwo.address,
          MAIN_CONTRACT_LIST.router.address,
          isUserConnected
        );
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
  };

  const handleTokenValue = async (amount, tokenType) => {
    console.log('handling token value:', amount, tokenType);
    let amt1, amt2;
    if (tokenType === "TK1") {
      setTokenOneValue(amount);
      amt1 = amount;
      const r = await getAllowance(amount, tokenType);
      if (r && tokenOne.address && tokenTwo.address && amount > 0) {
        let tokenAddress = tokenOne.address;
        if (tokenOne.address === "BNB") {
          tokenAddress = WETH;
        }

        if (currentPairAddress) {
          const tk0 = await ExchangeService.getTokenZero(currentPairAddress);
          const tk1 = await ExchangeService.getTokenOne(currentPairAddress);
          const reserves = await ExchangeService.getReserves(
            currentPairAddress
          );
          console.log('tko and tk1:', tk0, tk1);
          const token0Decimal = await ContractServices.getDecimals(tk0);
          const token1Decimal = await ContractServices.getDecimals(tk1);

          if (tk0 && reserves) {
            let a;
            if (tokenAddress.toLowerCase() === tk0.toLowerCase()) {
              a = (
                amount *
                (reserves[1] /
                  10 ** token1Decimal /
                  (reserves[0] / 10 ** token0Decimal))
              ).toFixed(5);
            } else {
              a = (
                amount *
                (reserves[0] /
                  10 ** token0Decimal /
                  (reserves[1] / 10 ** token1Decimal))
              ).toFixed(5);
            }
            setTokenTwoValue(a);
            amt2 = a;
            if (!tokenTwoApproval) {
              const r = await getAllowance(a, "TK2");
              handleApprovalButton("TK2");
            }
          }
        }
      }
    }
    if (tokenType === "TK2") {
      setTokenTwoValue(amount);
      amt2 = amount;
      const r = await getAllowance(amount, tokenType);
      if (r && tokenOne.address && tokenTwo.address && amount > 0) {
        let tokenAddress = tokenTwo.address;
        if (tokenTwo.address === "BNB") {
          tokenAddress = WETH;
        }
        if (currentPairAddress) {
          const tk0 = await ExchangeService.getTokenZero(currentPairAddress);
          const tk1 = await ExchangeService.getTokenOne(currentPairAddress);
          const reserves = await ExchangeService.getReserves(
            currentPairAddress
          );
          const token0Decimal = await ContractServices.getDecimals(tk0);
          const token1Decimal = await ContractServices.getDecimals(tk1);

          if (tk0 && reserves) {
            let a;
            if (tokenAddress.toLowerCase() === tk0.toLowerCase()) {
              a = (
                amount *
                (reserves[1] /
                  10 ** token1Decimal /
                  (reserves[0] / 10 ** token0Decimal))
              ).toFixed(5);
            } else {
              a = (
                amount *
                (reserves[0] /
                  10 ** token0Decimal /
                  (reserves[1] / 10 ** token1Decimal))
              ).toFixed(5);
            }
            setTokenOneValue(a);
            amt1 = a;
            if (!tokenOneApproval) {
              const r = await getAllowance(a, "TK1");
              handleApprovalButton("TK1");
            }
          }
        }
      }
    }
    if (tokenOne.address && tokenTwo.address) {
      let a1 = tokenOne.address,
        a2 = tokenTwo.address;

      let currentPairAddress;
      if (a1 === "BNB") {
        a1 = WETH; //WETH
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      } else if (a2 === "BNB") {
        a2 = WETH; //WETH
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      } else {
        currentPairAddress = await ExchangeService.getPair(a1, a2);
      }
      if (currentPairAddress !== "0x0000000000000000000000000000000000000000") {
        setCurrentPairAddress(currentPairAddress);
        const lpTokenBalance = await ContractServices.getTokenBalance(
          currentPairAddress,
          isUserConnected
        );
        setLpTokenBalance(lpTokenBalance);

        const reserves = await ExchangeService.getReserves(currentPairAddress);
        const ratio = await calculateLiquidityPercentage(reserves, amt1, amt2);
        // console.log(reserves, ratio, '---------------------------ratio');
        setSharePoolValue(ratio);

        setFirstProvider(false);
        setShowPoolShare(true);
      } else {
        setCurrentPairAddress("");
        setFirstProvider(true);
        setShowPoolShare(true);
        setLpTokenBalance(0);
      }
    }
  };
  //call web3 approval function
  const handleTokenApproval = async (tokenType) => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error("Wallet address doesn`t match!");
    }
    if (approvalConfirmation) {
      return toast.info("Token approval is processing");
    }
    // const value = (2*256 - 1).toString();
    const value =
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    let tokenAddress = "BNB";
    if (tokenType === "TK1") {
      tokenAddress = tokenOne.address;
    }
    if (tokenType === "TK2") {
      tokenAddress = tokenTwo.address;
    }
    try {
      dispatch(startLoading());
      const r = await ContractServices.approveToken(
        isUserConnected,
        value,
        MAIN_CONTRACT_LIST.router.address,
        tokenAddress
      );
      if (r.code == 4001) {
        toast.error("User denied transaction signature.");
      } else {
        setApprovalConfirmation(true);
        let data = {
          message: `Approve`,
          tx: r.transactionHash,
        };
        if (tokenType === "TK1") {
          setTokenOneApproved(true);
          setTokenOneApproval(false);

          data.message = `Approve ${tokenOne.symbol}`;
        }
        if (tokenType === "TK2") {
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
      toast.error("Transaction Reverted!");
    }
  };

  const handleSearchToken = async (data) => {
    try {
      const res = await dispatch(searchTokenByNameOrAddress(data));
      setFilteredTokenList(res);
    } catch (error) {
      toast.error("Something went wrong!");
    }
  }
  const handleApprovalButton = (tokenType) => {
    if (tokenOneApproval && tokenType === "TK1") {
      return (
        <div className="col button_unlockWallet">
          <ButtonPrimary
            className="swapBtn"
            title={`Approve ${tokenOne.symbol}`}
            disabled={approvalConfirmation}
            onClick={() => handleTokenApproval(tokenType)}
          />
        </div>
      );
    }
    if (tokenTwoApproval && tokenType === "TK2") {
      return (
        <div className="col button_unlockWallet">
          <ButtonPrimary
            className="swapBtn"
            title={`Approve ${tokenTwo.symbol}`}
            disabled={approvalConfirmation}
            onClick={() => handleTokenApproval(tokenType)}
          />
        </div>
      );
    }
    //dead code
    return null;
  };
  const calculateLiquidityPercentageWithSelectCurrency = async (reserve, d1, d2, lpBalance, currentPairAddress) => {
    const _reserve0 = Number(reserve["_reserve0"]) / 10 ** d1;
    const _reserve1 = Number(reserve["_reserve1"]) / 10 ** d2;

    let _totalSupply = await ContractServices.getTotalSupply(
      currentPairAddress
    );

    let ratio = lpBalance / _totalSupply;
    const t0 = (ratio * _reserve0).toFixed(5);
    setTokenOneDeposit(t0);
    const t1 = (ratio * _reserve1).toFixed(5);
    setTokenTwoDeposit(t1);
  };
  const calculateLiquidityPercentage = async (reserve, amount0, amount1) => {
    const _reserve0 = Number(reserve["_reserve0"]) / 10 ** tokenOne.decimals;
    const _reserve1 = Number(reserve["_reserve1"]) / 10 ** tokenTwo.decimals;

    let liquidity = 0;
    let _totalSupply = await ContractServices.getTotalSupply(
      currentPairAddress
    );

    let ratio = lpTokenBalance / _totalSupply;
    const t0 = (ratio * _reserve0).toFixed(5);
    setTokenOneDeposit(t0);
    const t1 = (ratio * _reserve1).toFixed(5);
    setTokenTwoDeposit(t1);


    if (_totalSupply === 0) {
      liquidity = Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;
      return 100;
    } else {
      liquidity = Math.min(
        (amount0 * _totalSupply) / _reserve0,
        (amount1 * _totalSupply) / _reserve1
      );
    }

    liquidity = ((liquidity / (_totalSupply + liquidity)) * 100).toFixed(2);
    return liquidity;
  };
  const checkAddLiquidity = async () => {
    if (!isUserConnected) {
      handleShow1();
    } else {
      let address;
      if (walletType === "Metamask") {
        address = await ContractServices.isMetamaskInstalled("");
      }
      if (walletType === "BinanceChain") {
        address = await ContractServices.isBinanceChainInstalled();
      }

      if (isUserConnected.toLowerCase() !== address.toLowerCase()) {
        return toast.error("Mismatch wallet address!");
      }
      if (!tokenOne.address) {
        return toast.error("Select first token!");
      }
      if (!tokenTwo.address) {
        return toast.error("Select second token!");
      }
      if (tokenOneValue <= 0) {
        return toast.error("Enter first token value!");
      }
      if (tokenTwoValue <= 0) {
        return toast.error("Enter second token value!");
      }
      if (!tokenOneApproved) {
        return toast.error("First Token approval is pending!");
      }
      if (!tokenTwoApproved) {
        return toast.error("Second Token approval is pending!");
      }
      console.log(
        tokenOneBalance < tokenOneValue,
        tokenOneBalance,
        tokenOneValue
      );
      if (tokenOneBalance < tokenOneValue) {
        return toast.error(
          `Wallet have insufficient ${tokenOne.symbol} balance!`
        );
      }
      if (tokenTwoBalance < tokenTwoValue) {
        return toast.error(
          `Wallet have insufficient ${tokenTwo.symbol} balance!`
        );
      }
      setShowSupplyModal(true);
    }
  };

  const addLiquidity = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error("Wallet address doesn`t match!");
    }
    if (liquidityConfirmation) {
      return toast.info("Transaction is processing!");
    }
    setLiquidityConfirmation(true);
    let value = 0,
      checkBNB = false,
      token;

    let dl = Math.floor(new Date().getTime() / 1000);
    dl = dl + deadline * 60;

    if (tokenOne.address === "BNB") {
      checkBNB = true;
      value = tokenOneValue;
      token = tokenTwo.address;
    }
    if (tokenTwo.address === "BNB") {
      checkBNB = true;
      value = tokenTwoValue;
      token = tokenOne.address;
    }
    if (value > 0) {
      value = value * 10 ** 18;
    }
    if (checkBNB) {
      let amountETHMin = BigNumber(
        Math.floor(Number(value) - (Number(value) * slippagePercentage) / 100)
      ).toFixed();
      let amountTokenMin = "";
      let amountTokenDesired = 0;
      if (tokenOne.address === "BNB") {
        amountTokenDesired = tokenTwoValue;
        amountTokenMin = BigNumber(
          Math.floor(
            (amountTokenDesired -
              (amountTokenDesired * slippagePercentage) / 100) *
            10 ** tokenTwo.decimals
          )
        ).toFixed();
        amountTokenDesired = BigNumber(
          amountTokenDesired * 10 ** tokenTwo.decimals
        ).toFixed();
      }
      if (tokenTwo.address === "BNB") {
        amountTokenDesired = tokenOneValue;
        amountTokenMin = BigNumber(
          Math.floor(
            (amountTokenDesired -
              (amountTokenDesired * slippagePercentage) / 100) *
            10 ** tokenOne.decimals
          )
        ).toFixed();
        amountTokenDesired = BigNumber(
          amountTokenDesired * 10 ** tokenOne.decimals
        ).toFixed();
      }
      value = value.toString();

      const data = {
        token,
        amountTokenDesired,
        amountTokenMin,
        amountETHMin,
        to: isUserConnected,
        deadline: dl,
        value,
      };
      try {
        dispatch(startLoading());
        const result = await ExchangeService.addLiquidityETH(data);
        // console.log(result, "add liquidity transaction");
        dispatch(stopLoading());

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);
          setShowSupplyModal(false);

          const data = {
            message: `Add ${tokenOne.symbol} and ${tokenTwo.symbol}`,
            tx: result,
          };
          dispatch(addTransaction(data));
          dispatch(checkUserLpTokens(false));
        }
        setLiquidityConfirmation(false);
      } catch (err) {
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        setLiquidityConfirmation(false);
      }
    } else {
      let amountADesired = tokenOneValue;
      let amountBDesired = tokenTwoValue;

      let amountAMin = Math.floor(
        amountADesired - (amountADesired * slippagePercentage) / 100
      );
      let amountBMin = Math.floor(
        amountBDesired - (amountBDesired * slippagePercentage) / 100
      );

      amountADesired = BigNumber(
        amountADesired * 10 ** tokenOne.decimals
      ).toFixed();
      amountBDesired = BigNumber(
        amountBDesired * 10 ** tokenTwo.decimals
      ).toFixed();
      amountAMin = BigNumber(amountAMin * 10 ** tokenOne.decimals).toFixed();
      amountBMin = BigNumber(amountBMin * 10 ** tokenOne.decimals).toFixed();

      let dl = Math.floor(new Date().getTime() / 1000);
      dl = dl + deadline * 60;

      const data = {
        tokenA: tokenOne.address,
        tokenB: tokenTwo.address,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to: isUserConnected,
        deadline: dl,
        value,
      };
      try {
        dispatch(startLoading());
        const result = await ExchangeService.addLiquidity(data);
        // console.log(result, "add liquidity transaction");

        dispatch(stopLoading());
        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);
          setShowSupplyModal(false);

          const data = {
            message: `Add ${tokenOne.symbol} and ${tokenTwo.symbol}`,
            tx: result,
          };
          dispatch(addTransaction(data));
          dispatch(checkUserLpTokens(false));
        }
        setLiquidityConfirmation(false);
      } catch (err) {
        console.log(err);
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        setLiquidityConfirmation(false);
      }
    }
  };
  const calculateFraction = (tokenType) => {
    let r = 0;
    if (tokenOneValue && tokenTwoValue) {
      if (tokenType === "TK1") {
        if (tokenOneValue === 0) return 0;
        r = tokenTwoValue / tokenOneValue;
      }
      if (tokenType === "TK2") {
        if (tokenTwoValue === 0) return 0;
        r = tokenOneValue / tokenTwoValue;
      }
      return Number(r.toFixed(5));
    } else {
      return 0;
    }
  };

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
  return (
    <>
      <Container fluid className="swapScreen comnSection">
        <CardCustom>
          <div className="settingSec">
            <div className="in_title">
              <ButtonBack />
              <h4 className="ps-5">Add Liquidity</h4>
            </div>
            <div className="settingIcon">
              <img
                src={TimerIcon}
                onClick={() => setShowRecent(true)}
                className="timerImg"
              />
              <img src={SettingIcon} onClick={() => settinghandleShow(true)} />
            </div>
          </div>
          {firstProvider && (
            <div className="firstPro_Note">
              <p>You are the first liquidity provider.</p>
              <p>
                The ratio of tokens you add will set the price of this pool.
              </p>
              <p>Once you are happy with the rate click supply to review.</p>
            </div>
          )}
          <div className="liquidtySec">
            {
              <SelectCoin
                label={`Balance: ${tokenOneBalance}`}
                coinImage={tokenOne?.icon}
                value={tokenOneCurrency}
                onClick={() => onHandleOpenModal("TK1")}
                inputLabel="Input"
                className="mb-0"
                placeholder="0.0"
                onChange={(e) => handleTokenValue(e.target.value, "TK1")}
                defaultValue={tokenOneValue}
                max={max}
                onMax={() => handleMaxBalance('TK1')}
              />
            }
            <div className="convert_plus">
              <img src={Plusicon} style={{ width: 22 }} />
            </div>
            {
              <SelectCoin
                label={`Balance: ${tokenTwoBalance}`}
                coinImage={tokenTwo?.icon}
                value={tokenTwoCurrency}
                onClick={() => onHandleOpenModal("TK2")}
                inputLabel="Input"
                className="mb-0"
                placeholder="0.0"
                onChange={(e) => handleTokenValue(e.target.value, "TK2")}
                defaultValue={tokenTwoValue}
                max={false}
              />
            }
            {showPoolShare && (
              <Col className="poolSec">
                <h6>PRICES AND POOL SHARE</h6>
                <div className="poolDiv">
                  <span>
                    {calculateFraction("TK1")} per
                    <br />
                    <small>
                      {" "}
                      {tokenTwoCurrency} per {tokenOneCurrency}
                    </small>
                  </span>
                  <span>
                    {calculateFraction("TK2")} per
                    <br />
                    <small>
                      {" "}
                      {tokenOneCurrency} per {tokenTwoCurrency}
                    </small>
                  </span>
                  <span>
                    {sharePoolValue}% <br />
                    <small>Share of Pool</small>
                  </span>
                </div>
              </Col>
            )}
            {currentPairAddress && (
              <Col className="lp-class">
                <h4>LP Tokens in your Wallet</h4>
                <ul className="LptokensList">
                  <li>
                    <span>
                      <img
                        className="sc-fWPcDo bUpjCL"
                        alt="icon 1"
                        src={tokenOne?.icon}
                      />
                      <img
                        className="sc-fWPcDo bUpjCL"
                        alt="icon 2"
                        src={tokenTwo?.icon}
                      />
                      &nbsp;&nbsp;
                      {`${tokenOneCurrency}/${tokenTwoCurrency}`}:
                    </span>{" "}
                    <span>{lpTokenBalance?.toFixed(5)}</span>
                  </li>
                  <li>
                    {tokenOne.symbol}: <span>{tokenOneDeposit}</span>
                  </li>
                  <li>
                    {" "}
                    {tokenTwo.symbol}: <span>{tokenTwoDeposit}</span>
                  </li>
                </ul>
              </Col>
            )}
          </div>
          <Col className="swapBtn_col">
            {handleApprovalButton("TK1")}
            {handleApprovalButton("TK2")}

            <ButtonPrimary
              className="swapBtn dismissBtn"
              title={isUserConnected ? "Supply" : "Unlock Wallet"}
              // onClick={() => handleShow1(true)}
              onClick={() => checkAddLiquidity()}
            />
          </Col>
        </CardCustom>
      </Container>
      <ModalCurrency
        show={show}
        handleClose={handleClose}
        tokenList={filteredTokenList}
        searchToken={handleSearchToken}
        searchByName={setSearch}
        selectCurrency={onHandleSelectCurrency}
        tokenType={tokenType}
        currencyName={selectedCurrency}
        handleOrder={setFilteredTokenList}
      />
      <ConnectWallet
        show={show1}
        handleShow={handleShow1}
        handleClose={handleClose1}
      />
      <SettingModal
        show={settingShow}
        handleShow={settinghandleShow}
        handleClose={settingClose}
      />
      <SupplyModal
        show={showSupplyModal}
        handleClose={supplyModalClose}
        addLiquidity={addLiquidity}
        liquidityConfirmation={liquidityConfirmation}
        tokenOneCurrency={tokenOneCurrency}
        tokenOneValue={tokenOneValue}
        tokenTwoCurrency={tokenTwoCurrency}
        tokenTwoValue={tokenTwoValue}
        calculateFraction={calculateFraction}
        sharePoolValue={sharePoolValue}
        tokenOne={tokenOne}
        tokenTwo={tokenTwo}
        slippagePercentage={slippagePercentage}
      />
      <RecentTransactions
        show={showRecent}
        handleClose={recentTransactionsClose}
      />
    </>
  );
};

export default AddLiquidity;
