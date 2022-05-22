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
import { TOKEN_TYPE } from "../../constant";
import useLiquid from "../../redux/volatiles/liquid";

const AddLiquidity = (props) => {
  const liquid = useLiquid(s => s);
  
  const deadline = useSelector(s => s.persist.deadline);
  const tokenList = useSelector(s => s.persist.tokenList);
  const walletType = useSelector(s => s.persist.walletType);
  const slippage = useSelector(s => s.persist.slippagePercentage);
  const isUserConnected = useSelector(s => s.persist.isUserConnected);

  const [show, setShow] = useState(!1);
  const handleClose = () => setShow(!1);
  const [show1, setShow1] = useState(!1);
  const handleClose1 = () => setShow1(!1);
  const handleShow1 = () => setShow1(!0);
  const [settingShow, setsettingShow] = useState(!1);
  const [showRecent, setShowRecent] = useState(!1);
  const [search, setSearch] = useState("");

  const settingClose = () => setsettingShow(!1);
  const supplyModalClose = () => setShowSupplyModal(!1);
  const recentTransactionsClose = () => setShowRecent(!1);
  const settinghandleShow = () => setsettingShow(!0);
  const [max, setMax] = useState(!0);

  const dispatch = useDispatch();
  const dpt = dispatch;
  const MINIMUM_LIQUIDITY = 10 ** 3;

  useEffect(() => {
    liquid.FilteredTokenList(tokenList.filter((token) => token.name.toLowerCase().includes(search.toLowerCase())));
 liquid.   init();
  }, [search, tokenList]);

  const init = async () => {
    if (isUserConnected) {
      const oneBalance = await ContractServices.getBNBBalance(isUserConnected);
      liquid.setTokenBalance(oneBalance, T_TYPE.A);

      const { lptoken } = props;
      if (lptoken) {
        liquid.setCurrentPair(lptoken.pair);
        liquid.LpTokenBalance(lptoken.balance);
        liquid.SharePoolValue(lptoken.poolShare);
        if (lptoken.token0Obj) {
          liquid.setTokenValue(lptoken.token0Obj, T_TYPE.A);
          liquid.setTokenCurrency(lptoken.token0Obj.symbol, T_TYPE.A);
          liquid.setTokenDeposit(lptoken.token0Deposit, T_TYPE.A);
          let tokenBal = 0;
          if (lptoken.token0Obj.address === "BNB") {
            tokenBal = oneBalance;
          } else {
            tokenBal = await ContractServices.getTokenBalance(
              lptoken.token0Obj.address,
              isUserConnected
            );
          }
          liquid.setTokenBalance(tokenBal, T_TYPE.A);
        }
        if (lptoken.token1Obj) {
          liquid.setToken(lptoken.token1Obj, T_TYPE.B);
          liquid.setTokenCurrency(lptoken.token1Obj.symbol, T_TYPE.B);
          liquid.setTokenDeposit(lptoken.liquid.token1Deposit, T_TYPE.B);
          let tokenBal = 0;
          if (lptoken.token1Obj.address === "BNB") {
            tokenBal = oneBalance;
          } else {
            tokenBal = await ContractServices.getTokenBalance(
              lptoken.token1Obj.address,
              isUserConnected
            );
          }
          liquid.setTokenBalance(tokenBal, T_TYPE.B);
        }
      }
    }
  };

  const closeTransactionModal = () => {
    liquid.showTransactionModal(!1);
    props.backBtn();
    window.location.reload();
  };

  const onHandleOpenModal = (tokenType) => {
    console.log('dropdown:', tokenType);
    if (!isUserConnected) {
      return toast.error("Connect wallet first!");
    }
    setShow(!0);
    liquid.FilteredTokenList(tokenList);
    liquid.setSelectedCurrency(
      tokenType === T_TYPE.A ? liquid.token2Currency : liquid.token1Currency
    );
    liquid.setModalCurrency(!0);
    liquid.setTokenType(tokenType);
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
    if (selecting === T_TYPE.A) {
      handleClose();
      a1 = address;
      if (address === "BNB") {
        oneBalance = await ContractServices.getBNBBalance(isUserConnected);
        liquid.setTokenApproved(!0, T_TYPE.A);
      } else {
        liquid.setTokenApproved(!1, T_TYPE.A);
        oneBalance = await ContractServices.getTokenBalance(
          address,
          isUserConnected
        );
      }
      liquid.setToken(token, T_TYPE.A);
      liquid.setTokenCurrency(symbol);
      liquid.setTokenBalance(oneBalance, T_TYPE.A);
      if (liquid.token2.address) {
        a2 = liquid.token2.address;
      }
      if (liquid.token1Value > 0) {
        const r = await getAllowance(liquid.token1Value, T_TYPE.A);
      }
    }
    if (selecting === T_TYPE.B) {
      handleClose();
      a2 = address;
      if (address === "BNB") {
        liquid.setTokenApproved(!0, T_TYPE.B);
        twoBalance = await ContractServices.getBNBBalance(isUserConnected);
      } else {
        liquid.setTokenApproved(!1, T_TYPE.B);
        twoBalance = await ContractServices.getTokenBalance(
          address,
          isUserConnected
        );
      }
      liquid.setToken(token, T_TYPE.B);
      liquid.setTokenCurrency(symbol);
      liquid.setTokenBalance(twoBalance, T_TYPE.B);
      if (liquid.token1.address) {
        a1 = liquid.token1.address;
      }
      if (liquid.token2Value > 0) {
        const r = await getAllowance(liquid.token2Value, T_TYPE.B);
      }
    }
    liquid.setModalCurrency(!modalCurrency);
    liquid.FilteredTokenList(liquid.tokenList);
    setSearch("");

    if (a1 && a2) {
      let currentPair;
      if (a1 === "BNB") {
        a1 = WETH; //WETH
        currentPair = await ExchangeService.getPair(a1, a2);
      } else if (a2 === "BNB") {
        a2 = WETH; //WETH
        currentPair = await ExchangeService.getPair(a1, a2);
      } else {
        currentPair = await ExchangeService.getPair(a1, a2);
      }

      if (currentPair !== "0x0000000000000000000000000000000000000000") {
        liquid.setCurrentPair(currentPair);
        const lpTokenBalance = await ContractServices.getTokenBalance(
          currentPair,
          isUserConnected
        );
        const d1 = await ContractServices.getDecimals(a1);
        const d2 = await ContractServices.getDecimals(a2);
        const reserves = await ExchangeService.getReserves(currentPair);
        calculateLiquidityPercentageWithSelectCurrency(reserves, d1, d2, liquid.lpTokenBalance, currentPair);
        liquid.LpTokenBalance(liquid.lpTokenBalance);
        liquid.setIsFirstLP(!1);
        liquid.showPoolShare(!0);
        // xxxxxxxxx
        // const reserves = await ExchangeService.getReserves(currentPair);
        // calculateLiquidityPercentage(reserves, amt1, amt2);
        // console.log('qqqqq', currentPair);
        // const reserves = await ExchangeService.getReserves(currentPair);
        // console.log('aaaaa', reserves);
        // await calculateLiquidityPercentage(reserves, 0.1, 0.02);
        // console.log('wwww', result);
      } else {
        liquid.setCurrentPair("");
        liquid.setIsFirstLP(!0);
        liquid.showPoolShare(!0);
        liquid.LpTokenBalance(0);
      }
    }
  };

  const getAllowance = async (amount, tokenType) => {
    if (tokenType === T_TYPE.A) {
      if (isUserConnected && liquid.token1.address !== "BNB") {
        let allowance = await ContractServices.allowanceToken(
          liquid.token1.address,
          MAIN_CONTRACT_LIST.router.address,
          isUserConnected
        );
        allowance = Number(allowance) / 10 ** Number(liquid.token1.decimals);
        // console.log(allowance, 'token 1')
        if (amount > allowance) {
          liquid.setTokenApprovalNeeded(!0, T_TYPE.A);
        } else {
          liquid.setTokenApproved(!0, T_TYPE.A);
        }
      } else {
        liquid.setTokenApproved(!0, T_TYPE.A);
      }
    }
    if (tokenType === T_TYPE.B) {
      if (isUserConnected && liquid.token2.address !== "BNB") {
        let allowance = await ContractServices.allowanceToken(
          liquid.token2.address,
          MAIN_CONTRACT_LIST.router.address,
          isUserConnected
        );
        allowance = Number(allowance) / 10 ** Number(liquid.token2.decimals);
        // console.log(allowance, 'token 2')
        if (amount > allowance) {
          liquid.setTokenApprovalNeeded(!0, T_TYPE.B);
        } else {
          liquid.setTokenApproved(!0, T_TYPE.B);
        }
      } else {
        liquid.setTokenApproved(!0, T_TYPE.B);
      }
    }
    return !0;
  };

  const handleTokenValue = async (amount, tokenType) => {
    console.log('handling token value:', amount, tokenType);
    let amt1, amt2;
    if (tokenType === T_TYPE.A) {
      liquid.setTokenValue(amount, T_TYPE.A);
      amt1 = amount;
      const r = await getAllowance(amount, tokenType);
      if (r && liquid.token1.address && liquid.token2.address && amount > 0) {
        let tokenAddress = liquid.token1.address;
        if (liquid.token1.address === "BNB") {
          tokenAddress = WETH;
        }

        if (currentPair) {
          const tk0 = await ExchangeService.getTokenZero(currentPair);
          const tk1 = await ExchangeService.getToken1(currentPair);
          const reserves = await ExchangeService.getReserves(
            currentPair
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
            liquid.setTokenValue(a, T_TYPE.B);
            amt2 = a;
            if (!token2Approval) {
              const r = await getAllowance(a, T_TYPE.B);
              getApprovalButton(T_TYPE.B);
            }
          }
        }
      }
    }
    if (tokenType === T_TYPE.B) {
      liquid.setTokenValue(amount, T_TYPE.B);
      amt2 = amount;
      const r = await getAllowance(amount, tokenType);
      if (r && liquid.token1.address && liquid.token2.address && amount > 0) {
        let tokenAddress = liquid.token2.address;
        if (liquid.token2.address === "BNB") {
          tokenAddress = WETH;
        }
        if (currentPair) {
          const tk0 = await ExchangeService.getTokenZero(currentPair);
          const tk1 = await ExchangeService.getToken1(currentPair);
          const reserves = await ExchangeService.getReserves(
            currentPair
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
            liquid.setTokenValue(a, T_TYPE.A);
            amt1 = a;
            if (!token1Approval) {
              const r = await getAllowance(a, T_TYPE.A);
              getApprovalButton(T_TYPE.A);
            }
          }
        }
      }
    }
    if (liquid.token1.address && liquid.token2.address) {
      let a1 = liquid.token1.address,
        a2 = liquid.token2.address;

      let currentPair;
      if (a1 === "BNB") {
        a1 = WETH; //WETH
        currentPair = await ExchangeService.getPair(a1, a2);
      } else if (a2 === "BNB") {
        a2 = WETH; //WETH
        currentPair = await ExchangeService.getPair(a1, a2);
      } else {
        currentPair = await ExchangeService.getPair(a1, a2);
      }
      if (currentPair !== "0x0000000000000000000000000000000000000000") {
        liquid.setCurrentPair(currentPair);
        const liquid.lpTokenBalance = await ContractServices.getTokenBalance(
          currentPair,
          isUserConnected
        );
        liquid.LpTokenBalance(liquid.lpTokenBalance);

        const reserves = await ExchangeService.getReserves(currentPair);
        const ratio = await calculateLiquidityPercentage(reserves, amt1, amt2);
        // console.log(reserves, ratio, '---------------------------ratio');
      .SharePoolValue(ratio);

        liquid.setIsFirstLP(!1);
        liquid.showPoolShare(!0);
      } else {
        liquid.setCurrentPair("");
        liquid.setIsFirstLP(!0);
        liquid.showPoolShare(!0);
        liquid.LpTokenBalance(0);
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
    if (tokenType === T_TYPE.A) {
      tokenAddress = liquid.token1.address;
    }
    if (tokenType === T_TYPE.B) {
      tokenAddress = liquid.token2.address;
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
        setApprovalConfirmation(!0);
        let data = {
          message: `Approve`,
          tx: r.transactionHash,
        };
        if (tokenType === T_TYPE.A) {
          liquid.setTokenApproved(!0, T_TYPE.A);
          liquid.setTokenApprovalNeeded(!1, T_TYPE.A);

          data.message = `Approve ${liquid.token1.symbol}`;
        }
        if (tokenType === T_TYPE.B) {
          liquid.setTokenApproved(!0, T_TYPE.B);
          liquid.setTokenApprovalNeeded(!1, T_TYPE.B);
          data.message = `Approve ${liquid.token2.symbol}`;
        }
        dispatch(addTransaction(data));
        setApprovalConfirmation(!1);
      }
      dispatch(stopLoading());
    } catch (err) {
      setApprovalConfirmation(!1);
      dispatch(stopLoading());
      console.log(err);
      toast.error("Transaction Reverted!");
    }
  };

  const handleSearchToken = async (data) => {
    try {
      const res = await dispatch(searchTokenByNameOrAddress(data));
      liquid.FilteredTokenList(res);
    } liquid.catch (error) {
      toast.error("Something went wrong!");
    }
  }
  const getApprovalButton = (tokenType) => {
    if (token1Approval && tokenType === T_TYPE.A) {
      return (
        <div className="col button_unlockWallet">
          <ButtonPrimary
            className="swapBtn"
            title={`Approve ${liquid.token1.symbol}`}
            disabled={approvalConfirmation}
            onClick={() => handleTokenApproval(tokenType)}
          />
        </div>
      );
    }
    if (token2Approval && tokenType === T_TYPE.B) {
      return (
        <div className="col button_unlockWallet">
          <ButtonPrimary
            className="swapBtn"
            title={`Approve ${liquid.token2.symbol}`}
            disabled={approvalConfirmation}
            onClick={() => handleTokenApproval(tokenType)}
          />
        </div>
      );
    }
    //dead code
    return null;
  };
  const calculateLiquidityPercentageWithSelectCurrency = async (reserve, d1, d2, lpBalance, currentPair) => {
    const _reserve0 = Number(reserve["_reserve0"]) / 10 ** d1;
    const _reserve1 = Number(reserve["_reserve1"]) / 10 ** d2;

    let _totalSupply = await ContractServices.getTotalSupply(
      currentPair
    );

    let ratio = lpBalance / _totalSupply;
    const t0 = (ratio * _reserve0).toFixed(5);
    liquid.setTokenDeposit(t0);
    const t1 = (ratio * _reserve1).toFixed(5);
    liquid.setTokenDeposit(t1);
  };
  const calculateLiquidityPercentage = async (reserve, amount0, amount1) => {
    const _reserve0 = Number(reserve["_reserve0"]) / 10 ** liquid.token1.decimals;
    const _reserve1 = Number(reserve["_reserve1"]) / 10 ** liquid.token2.decimals;

    let liquidity = 0;
    let _totalSupply = await ContractServices.getTotalSupply(
      currentPair
    );

    let ratio = liquid.lpTokenBalance / _totalSupply;
    const t0 = (ratio * _reserve0).toFixed(5);
    liquid.setTokenDeposit(t0);
    const t1 = (ratio * _reserve1).toFixed(5);
    liquid.setTokenDeposit(t1);


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
      if (!liquid.token1.address) {
        return toast.error("Select first token!");
      }
      if (!liquid.token2.address) {
        return toast.error("Select second token!");
      }
      if (liquid.token1Value <= 0) {
        return toast.error("Enter first token value!");
      }
      if (liquid.token2Value <= 0) {
        return toast.error("Enter second token value!");
      }
      if (!token1Approved) {
        return toast.error("First Token approval is pending!");
      }
      if (!token2Approved) {
        return toast.error("Second Token approval is pending!");
      }
      console.log(
        token1Balance < liquid.token1Value,
        token1Balance,
        liquid.token1Value
      );
      if (token1Balance < liquid.token1Value) {
        return toast.error(
          `Wallet have insufficient ${liquid.token1.symbol} balance!`
        );
      }
      if (liquid.token2Balance < liquid.token2Value) {
        return toast.error(
          `Wallet have insufficient ${liquid.token2.symbol} balance!`
        );
      }
      setShowSupplyModal(!0);
    }
  };

  const addLiquidity = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error("Wallet address doesn`t match!");
    }
    if (liquid.isLiqConfirmed) {
      return toast.info("Transaction is processing!");
    }
    liquid.setLiqConfirmed(!0);
    let value = 0,
      checkBNB = !1,
      token;

    let dl = Math.floor(new Date().getTime() / 1000);
    dl = dl + deadline * 60;

    if (liquid.token1.address === "BNB") {
      checkBNB = !0;
      value = liquid.token1Value;
      token = liquid.token2.address;
    }
    if (liquid.token2.address === "BNB") {
      checkBNB = !0;
      value = liquid.token2Value;
      token = liquid.token1.address;
    }
    if (value > 0) {
      value = value * 10 ** 18;
    }
    if (checkBNB) {
      let amountETHMin = BigNumber(
        Math.floor(Number(value) - (Number(value) * slippage) / 100)
      ).toFixed();
      let amountTokenMin = "";
      let amountTokenDesired = 0;
      if (liquid.token1.address === "BNB") {
        amountTokenDesired = liquid.token2Value;
        amountTokenMin = BigNumber(
          Math.floor(
            (amountTokenDesired -
              (amountTokenDesired * slippage) / 100) *
            10 ** liquid.token2.decimals
          )
        ).toFixed();
        amountTokenDesired = BigNumber(
          amountTokenDesired * 10 ** liquid.token2.decimals
        ).toFixed();
      }
      if (liquid.token2.address === "BNB") {
        amountTokenDesired = liquid.token1Value;
        amountTokenMin = BigNumber(
          Math.floor(
            (amountTokenDesired -
              (amountTokenDesired * slippage) / 100) *
            10 ** liquid.token1.decimals
          )
        ).toFixed();
        amountTokenDesired = BigNumber(
          amountTokenDesired * 10 ** liquid.token1.decimals
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
          liquid.showTransactionModal(!0);
          setShowSupplyModal(!1);

          const data = {
            message: `Add ${liquid.token1.symbol} and ${liquid.token2.symbol}`,
            tx: result,
          };
          dispatch(addTransaction(data));
          dispatch(checkUserLpTokens(!1));
        }
        liquid.setLiqConfirmed(!1);
      } catch (err) {
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        liquid.setLiqConfirmed(!1);
      }
    } else {
      let amountADesired = liquid.token1Value;
      let amountBDesired = liquid.token2Value;

      let amountAMin = Math.floor(
        amountADesired - (amountADesired * slippage) / 100
      );
      let amountBMin = Math.floor(
        amountBDesired - (amountBDesired * slippage) / 100
      );

      amountADesired = BigNumber(
        amountADesired * 10 ** liquid.token1.decimals
      ).toFixed();
      amountBDesired = BigNumber(
        amountBDesired * 10 ** liquid.token2.decimals
      ).toFixed();
      amountAMin = BigNumber(amountAMin * 10 ** liquid.token1.decimals).toFixed();
      amountBMin = BigNumber(amountBMin * 10 ** liquid.token1.decimals).toFixed();

      let dl = Math.floor(new Date().getTime() / 1000);
      dl = dl + deadline * 60;

      const data = {
        tokenA: liquid.token1.address,
        tokenB: liquid.token2.address,
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
          liquid.showTransactionModal(!0);
          setShowSupplyModal(!1);

          const data = {
            message: `Add ${liquid.token1.symbol} and ${liquid.token2.symbol}`,
            tx: result,
          };
          dispatch(addTransaction(data));
          dispatch(checkUserLpTokens(!1));
        }
        liquid.setLiqConfirmed(!1);
      } catch (err) {
        console.log(err);
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        liquid.setLiqConfirmed(!1);
      }
    }
  };
  const calculateFraction = (tokenType) => {
    let r = 0;
    if (liquid.token1Value && liquid.token2Value) {
      if (tokenType === T_TYPE.A) {
        if (liquid.token1Value === 0) return 0;
        r = liquid.token2Value / liquid.token1Value;
      }
      if (tokenType === T_TYPE.B) {
        if (liquid.token2Value === 0) return 0;
        r = liquid.token1Value / liquid.token2Value;
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
    if (liquid.token1.address === 'BNB') {
      // .002 BNB is reserved for saving gas fee 
      const bnbBalance = await ContractServices.getBNBBalance(isUserConnected) - 0.1;
      handleTokenValue(bnbBalance, amountIn);
      setMax(!1);
    } else {
      // __ amount of particular token must be reserved for saving -needs to be fixed 
      const tokenBalance = await ContractServices.getTokenBalance(liquid.token1.address, isUserConnected);
      handleTokenValue(tokenBalance, amountIn);
      setMax(!1);
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
                onClick={() => setShowRecent(!0)}
                className="timerImg"
              />
              <img src={SettingIcon} onClick={() => settinghandleShow(!0)} />
            </div>
          </div>
          {isFirstLP && (
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
                label={`Balance: ${token1Balance}`}
                coinImage={liquid.token1?.icon}
                value={liquid.token1Currency}
                onClick={() => onHandleOpenModal(T_TYPE.A)}
                inputLabel="Input"
                className="mb-0"
                placeholder="0.0"
                onChange={(e) => handleTokenValue(e.target.value, T_TYPE.A)}
                defaultValue={liquid.token1Value}
                max={max}
                onMax={() => handleMaxBalance('TK1')}
              />
            }
            <div className="convert_plus">
              <img src={Plusicon} style={{ width: 22 }} />
            </div>
            {
              <SelectCoin
                label={`Balance: ${liquid.token2Balance}`}
                coinImage={liquid.token2?.icon}
                value={liquid.token2Currency}
                onClick={() => onHandleOpenModal(T_TYPE.B)}
                inputLabel="Input"
                className="mb-0"
                placeholder="0.0"
                onChange={(e) => handleTokenValue(e.target.value, T_TYPE.B)}
                defaultValue={liquid.token2Value}
                max={!1}
              />
            }
            {liquid.poolShareShown && (
              <Col className="poolSec">
                <h6>PRICES AND POOL SHARE</h6>
                <div className="poolDiv">
                  <span>
                    {calculateFraction(T_TYPE.A)} per
                    <br />
                    <small>
                      {" "}
                      {liquid.token2Currency} per {liquid.token1Currency}
                    </small>
                  </span>
                  <span>
                    {calculateFraction(T_TYPE.B)} per
                    <br />
                    <small>
                      {" "}
                      {liquid.token1Currency} per {liquid.token2Currency}
                    </small>
                  </span>
                  <span>
                    {liquid.sharePoolValue}% <br />
                    <small>Share of Pool</small>
                  </span>
                </div>
              </Col>
            )}
            {liquid.currentPair && (
              <Col className="lp-class">
                <h4>LP Tokens in your Wallet</h4>
                <ul className="LptokensList">
                  <li>
                    <span>
                      <img
                        className="sc-fWPcDo bUpjCL"
                        alt="icon 1"
                        src={liquid.token1?.icon}
                      />
                      <img
                        className="sc-fWPcDo bUpjCL"
                        alt="icon 2"
                        src={liquid.token2?.icon}
                      />
                      &nbsp;&nbsp;
                      {`${liquid.token1Currency}/${liquid.token2Currency}`}:
                    </span>{" "}
                    <span>{liquid.lpTokenBalance?.toFixed(5)}</span>
                  </li>
                  <li>
                    {liquid.token1.symbol}: <span>{liquid.token1Deposit}</span>
                  </li>
                  <li>
                    {" "}
                    {liquid.token2.symbol}: <span>{liquid.token2Deposit}</span>
                  </li>
                </ul>
              </Col>
            )}
          </div>
          <Col className="swapBtn_col">
            {getApprovalButton(T_TYPE.A)}
            {getApprovalButton(T_TYPE.B)}

            <ButtonPrimary
              className="swapBtn dismissBtn"
              title={isUserConnected ? "Supply" : "Unlock Wallet"}
              // onClick={() => handleShow1(!0)}
              onClick={() => checkAddLiquidity()}
            />
          </Col>
        </CardCustom>
      </Container>
      <ModalCurrency
        show={show}
        handleClose={handleClose}
        tokenList={liquid.filteredTokenList}
        searchToken={handleSearchToken}
        searchByName={setSearch}
        selectCurrency={onHandleSelectCurrency}
        tokenType={liquid.tokenType}
        currencyName={liquid.selectedCurrency}
        handleOrder={liquid.FilteredTokenListliquid.}
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
        show={liquid.showSupplyModal}
        handleClose={supplyModalClose}
        addLiquidity={addLiquidity}
        liquidityConfirmation={liquid.isLiqConfirmed}
        liquid.token1Currency={liquid.token1Currency}
        liquid.token1Value={liquid.token1Value}
        liquid.token2Currency={liquid.token2Currency}
        liquid.token2Value={liquid.token2Value}
        calculateFraction={calculateFraction}
        liquid.sharePoolValue={liquid.sharePoolValue}
        token1={token1}
        token2={token2}
        slippage={slippage}
      />
      <RecentTransactions
        show={showRecent}
        handleClose={recentTransactionsClose}
      />
    </>
  );
};

export default AddLiquidity;
