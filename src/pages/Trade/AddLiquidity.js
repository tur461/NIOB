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
import { T_TYPE, VAL } from "../../constant";
import useLiquid from "../../redux/volatiles/liquid";
import { hasVal, isBnb, isDefined, isNonZero, rDefined, rEq, tgl, toDec, toFull, tStamp, zero } from "../../services/utils";

const AddLiquidity = (props) => {
  const liquid = useLiquid(s => s);
  
  const P = useSelector(s => s.persist);
  const tokenList = useSelector(s => s.persist.tokenList);
  const walletType = useSelector(s => s.persist.walletType);
  const priAccount = useSelector(s => s.persist.isUserConnected);
  
  const isConnected = priAccount && priAccount.length === 42;

  const [show, setShow] = useState(!1);
  const handleClose = () => setShow(!1);
  const [show1, setShow1] = useState(!1);
  const handleClose1 = () => setShow1(!1);
  const handleShow1 = () => setShow1(!0);
  const [settingShow, setsettingShow] = useState(!1);
  const [showRecent, setShowRecent] = useState(!1);
  const [search, setSearch] = useState("");

  const settingClose = () => setsettingShow(!1);
  const supplyModalClose = () => liquid.setShowSupplyModal(!1);
  const recentTransactionsClose = () => setShowRecent(!1);
  const settinghandleShow = () => setsettingShow(!0);

  const dispatch = useDispatch();
  const MINIMUM_LIQUIDITY = 10 ** 3;

  useEffect(() => {
    liquid.setFilteredTokenList(tokenList.filter((token) => token.name.toLowerCase().includes(search.toLowerCase())));
    init();
  }, [search, tokenList]);

  const init = async () => {
    if (isConnected) {
      const balance1 = await ContractServices.getBNBBalance(priAccount);
      liquid.setTokenBalance(balance1, T_TYPE.A);
      const { lptoken } = props;
      if (lptoken) {
        liquid.setCurrentPair(lptoken.pair);
        liquid.setLpTokenBalance(lptoken.balance);
        liquid.setSharePoolValue(lptoken.poolShare);
        let i = lptoken.token0Obj ? 0 : lptoken.token1Obj ? 1 : -1;
        if(i>=0) {
          liquid.setTokenValue(lptoken[`token${i}Obj`], i+1);
          liquid.setTokenDeposit(lptoken[`token${i}Deposit`], i+1);
          liquid.setTokenCurrency(lptoken[`token${i}Obj`].symbol, i+1);
          liquid.setTokenBalance(
            isBnb(lptoken[`token${i}Obj`].address) ?
            balance1 : 
            await ContractServices.getTokenBalance(lptoken[`token${i}Obj`].address, priAccount), 
            i+1
          );
        }
        console.log('init done with i: ' + i);
      }
    }
  };

  const closeTransactionModal = () => {
    liquid.showTransactionModal(!1);
    props.backBtn();
    window.location.reload();
  };

  const onHandleOpenModal = (tt) => {
    console.log('dropdown:', tt);
    if (!isConnected) {
      return toast.error("Connect wallet first!");
    }
    setShow(!0);
    let i = tt-1 ? 2 : 1;
    liquid.setModalCurrency(!0);
    liquid.setTokenType(tt);
    liquid.setFilteredTokenList(tokenList);
    liquid.setSelectedCurrency(liquid[`token${i}Currency`]);
  };
  const onHandleSelectCurrency = async (token, selected) => {
    if (!isConnected) {
      return toast.error("Connect wallet first!");
    }
    setSearch('');
    handleClose();
    
    let i = selected-1 ? 1 : 2, addr = [], bal = 0;
    const { address, symbol } = token;
    
    addr.push(address);
    if (isBnb(address)) {
      bal = await ContractServices.getBNBBalance(priAccount);
      liquid.setTokenApproved(!0, selected);
    } else {
      liquid.setTokenApproved(!1, selected);
      bal = await ContractServices.getTokenBalance(address, priAccount);
    }
    liquid.setTokenCurrency(symbol);
    liquid.setToken(token, selected);
    liquid.setTokenBalance(bal, selected);
    liquid.setFilteredTokenList(tokenList);
    liquid.setModalCurrency(!liquid.modalCurrency);

    addr.push(liquid[`token${i}`].address);
    if(rEq(...addr)) {
      console.log('tokens cant be same!');
      return toast.error('please select dissimilar tokens!');
    }
    if(selected === T_TYPE.B) { let t = addr[1]; addr[1] = addr[0]; addr[0] = t; }
    if (liquid[`token${selected}Value`] > 0) await hasAllowance(liquid[`token${selected}Value`], selected);
    if (rDefined(...addr)) {
      let cPair;
      if (isBnb(addr[0])) {
        addr[0] = WETH; //WETH
        cPair = await ExchangeService.getPair(...addr);
      } else if (isBnb(addr[1])) {
        addr[1] = WETH; //WETH
        cPair = await ExchangeService.getPair(...addr);
      } else cPair = await ExchangeService.getPair(...addr);
      console.log('1', addr, selected, cPair);

      if (isNonZero(cPair)) {
        liquid.setCurrentPair(cPair);
        const dec1 = await ContractServices.getDecimals(addr[0]);
        const dec2 = await ContractServices.getDecimals(addr[1]);
        const reserves = await ExchangeService.getReserves(cPair);
        const lpTokenBalance = await ContractServices.getTokenBalance(cPair, priAccount);
        calculateLiquidityPercentageWithSelectCurrency(reserves, dec1, dec2, lpTokenBalance, cPair);
        liquid.setIsFirstLP(!1);
        liquid.showPoolShare(!0);
        liquid.setLpTokenBalance(lpTokenBalance);
      } else {
        liquid.setCurrentPair('');
        liquid.setIsFirstLP(!0);
        liquid.showPoolShare(!0);
        liquid.setLpTokenBalance(0);
        console.log('pair doesnt exist:', cPair);
        toast.error('pair doesn\'t exist!');
      }
    }
  };

  const hasAllowance = async (amount, tt) => {
    if(!isConnected) return !!toast.error("Connect wallet first!");
    let tkn = liquid[`token${tt}`];
    if (!isBnb(tkn.address)) {
      let allowance = await ContractServices.allowanceToken(tkn.address, MAIN_CONTRACT_LIST.router.address, priAccount);
      allowance = toDec(allowance, tkn.decimals);
      if (amount > allowance) {
        liquid.setTokenApprovalNeeded(!0, tt);
        return !1;
      }
    }
    liquid.setTokenApproved(!0, tt);
    return !0;
  };

  const handleTokenValue = async (amount, tt) => {
    // console.log('handling token value:', amount, tt);
    if(!hasVal(amount)) return liquid.setTokenValue(amount, T_TYPE.AB);
    liquid.setTokenValue(amount, tt);
    let amt=[amount],
        i = tt-1 ? 1 : 2,
        tkn = liquid[`token${tt}`],
        r = await hasAllowance(amount, tt); 

    if (amount > 0 && rDefined(r, tkn.address, liquid[`token${i}`].address)) {
      let tAddr = tkn.address;
      if (isBnb(tkn.address)) tAddr = WETH;
      let p = liquid.currentPair;
      if (p) {
        const tk0 = await ExchangeService.getTokenZero(p);
        const tk1 = await ExchangeService.getTokenOne(p);
        const reserves = await ExchangeService.getReserves(p);
        const token0Decimal = await ContractServices.getDecimals(tk0);
        const token1Decimal = await ContractServices.getDecimals(tk1);

        if (rDefined(tk0, reserves)) {
          let a = rEq(tAddr, tk0) ? 
          (
              amount *
              (reserves[1] /
                10 ** token1Decimal /
                (reserves[0] / 10 ** token0Decimal))
          ).toFixed(5) : 
          (
            amount *
            (reserves[0] /
              10 ** token0Decimal /
              (reserves[1] / 10 ** token1Decimal))
          ).toFixed(5);
          
          if (!liquid[`token${i}ApprovalNeeded`]) {
            await hasAllowance(a, i);
            getApprovalButton(i);
          }
          amt.push(a);
          liquid.setTokenValue(a, i);
        }
      }
    }

    if(tt === T_TYPE.B) { let t = amt[1]; amt[1] = amt[0]; amt[0] = t; }

    let addr = [liquid.token1.address, liquid.token2.address];
    if (rDefined(...addr)) {
      let cPair;
      if (isBnb(addr[0])) {
        addr[0] = WETH;
        cPair = await ExchangeService.getPair(...addr);
      } else if (isBnb(addr[1])) {
        addr[1] = WETH; //WETH
        cPair = await ExchangeService.getPair(...addr);
      } else cPair = await ExchangeService.getPair(...addr);
      if (isNonZero(cPair)) {
        const reserves = await ExchangeService.getReserves(cPair);
        const ratio = await calculateLiquidityPercentage(reserves, ...amt);
        liquid.setIsFirstLP(!1);
        liquid.showPoolShare(!0);
        liquid.setCurrentPair(cPair);
        liquid.setSharePoolValue(ratio);
        liquid.setLpTokenBalance(await ContractServices.getTokenBalance(cPair, priAccount));
      } else {
        liquid.setIsFirstLP(!0);
        liquid.showPoolShare(!0);
        liquid.setCurrentPair('');
        liquid.setLpTokenBalance(0);
      }
    }
  };
  //call web3 approval function
  const handleTokenApproval = async (tt) => {
    const acc = await ContractServices.getDefaultAccount();
    if (isDefined(acc) && !rEq(acc, priAccount)) 
      return !!toast.error("Wallet address doesn`t match!");
    if (liquid.isApprovalConfirmed)
      return !!toast.info("Token approval is processing");
  
    let tkn = liquid[`token${tt}`];
    try {
      dispatch(startLoading());
      const r = await ContractServices.approveToken(
        priAccount,
        VAL.MAX_256,
        MAIN_CONTRACT_LIST.router.address,
        tkn.address
      );
      if (rEq(4001, r.code)) toast.error("User denied transaction signature.");
      else {
        liquid.setApprovalConfirmed(!0);
        let data = {message: `Approve`, tx: r.transactionHash};
        liquid.setTokenApproved(!0, tt);
        liquid.setTokenApprovalNeeded(!1, tt);
        data.message = `Approve ${tkn.symbol}`;
        dispatch(addTransaction(data));
        liquid.setApprovalConfirmed(!1);
      }
    } catch (err) {
      console.log(err);
      liquid.setApprovalConfirmed(!1);
      toast.error("Transaction Reverted!");
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleSearchToken = async d => {
    try {
      liquid.setFilteredTokenList(dispatch(searchTokenByNameOrAddress(d)));
    } catch (e) {
      toast.error("Something went wrong!");
    }
  }
  const getApprovalButton = tt => liquid[`token${tt}ApprovalNeeded`] ? (
        <div className="col button_unlockWallet">
          <ButtonPrimary
            className="swapBtn"
            title={`Approve ${liquid[`token${tt}`].symbol}`}
            disabled={liquid.isApprovalConfirmed}
            onClick={() => handleTokenApproval(tt)}
          />
        </div>
  ) : null;
  
  const calculateLiquidityPercentageWithSelectCurrency = async (reserve, dec1, dec2, lpBalance, cPair) => {
    const r0 = toDec(reserve._reserve0, dec1);
    const r1 = toDec(reserve._reserve1, dec2);
    let _totalSupply = await ContractServices.getTotalSupply(cPair);
    let ratio = lpBalance / _totalSupply;
    const t0 = (ratio * r0).toFixed(5);
    const t1 = (ratio * r1).toFixed(5);
    liquid.setTokenDeposit(t0, T_TYPE.A);
    liquid.setTokenDeposit(t1, T_TYPE.B);
  };
  const calculateLiquidityPercentage = async (reserve, amount0, amount1) => {
    const r0 = toDec(reserve._reserve0, liquid.token1.decimals);
    const r1 = toDec(reserve._reserve1, liquid.token2.decimals);

    let _totalSupply = await ContractServices.getTotalSupply(liquid.currentPair);
    let ratio = liquid.lpTokenBalance / _totalSupply;
    const t0 = (ratio * r0).toFixed(5);
    const t1 = (ratio * r1).toFixed(5);
    liquid.setTokenDeposit(t0, T_TYPE.A);
    liquid.setTokenDeposit(t1, T_TYPE.B);
    
    let liquidity = zero(_totalSupply) ? 
      Math.sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY :
      Math.min((amount0 * _totalSupply) / r0,(amount1 * _totalSupply) / r1);
      
    liquidity = ((liquidity / (_totalSupply + liquidity)) * 100).toFixed(2);
    return zero(_totalSupply) ? 100 : liquidity;
  };

  const checkAddLiquidity = async () => {
    if (!isConnected) handleShow1();
    else {
      let addr, e=null;
      if (walletType === "Metamask") addr = await ContractServices.isMetamaskInstalled('');
      if (walletType === "BinanceChain") addr = await ContractServices.isBinanceChainInstalled();
      if (rEq(priAccount, addr)) e = 'Mismatch wallet addr!';
      else if (!isDefined(liquid.token1.address)) e = 'Select 1st token!';
      else if (!isDefined(liquid.token2.address)) e = 'Select 2nd token!';
      else if (liquid.token1Value <= 0) e = 'Enter 1st token value!';
      else if (liquid.token2Value <= 0) e = 'Enter 2nd token value!';
      else if (!isDefined(liquid.token1Approved)) e = '1st Token approval is pending!';
      else if (!isDefined(liquid.token2Approved)) e = '2nd Token approval is pending!';
      else if (liquid.token1Balance < liquid.token1Value) e = `Wallet have insufficient ${liquid.token1.symbol} balance!`;
      else if (liquid.token2Balance < liquid.token2Value) e = `Wallet have insufficient ${liquid.token2.symbol} balance!`;
      if(e) return toast.error(e);
      liquid.setShowSupplyModal(!0);
    }
  };

  const addLiquidity = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (isDefined(acc) && rEq(acc, priAccount))
      return toast.error("Wallet address doesn`t match!");
    
    if (liquid.isLiqConfirmed)
      return toast.info("Transaction is processing!");
    
    let valueOfExact = 0, otherTokenzAddr, 
        tkn1 = liquid.token1, 
        tkn2 = liquid.token2, 
        addr = [tkn1.address, tkn2.address];

    if (rEq(tkn1.address, tkn2.address)) return toast.info("select dissimilar tokens!");
      
    liquid.setLiqConfirmed(!0);
    
    let i = isBnb(addr[0]) ? 1 : isBnb(addr[1]) ? 2 : 0;
    if (i) {
      valueOfExact = liquid[`token${i}Value`];
      otherTokenzAddr = i-1 ? addr[0] : addr[1];
    }
    
    valueOfExact *= valueOfExact ? 10 ** 18 : 1;
    let dec = [tkn1.decimals, tkn2.decimals];
    
    if (i) {
      valueOfExact = valueOfExact.toString();
      let amountETHMin = BigNumber(Math.floor(Number(valueOfExact) - (Number(valueOfExact) * P.slippage) / 100)).toFixed();
      let tknAmtDzd = liquid[`token${tgl(i)}Value`];
      let tknMinAmt = BigNumber(Math.floor((toFull((tknAmtDzd - (tknAmtDzd * P.slippage) / 100), dec[tgl(i)-1])))).toFixed();
      tknAmtDzd = BigNumber(toFull(tknAmtDzd, dec[tgl(i)-1])).toFixed();

      const data = {
        otherTokenzAddr,
        amountTokenDesired: tknAmtDzd,
        amountTokenMin: tknMinAmt,
        amountETHMin,
        to: priAccount,
        deadline: tStamp(P.deadline * 60),
        valueOfExact,
      };
      try {
        dispatch(startLoading());
        const result = await ExchangeService.addLiquidityETH(data);

        if (result) {
          liquid.setTxHash(result);
          liquid.showTransactionModal(!0);
          liquid.setShowSupplyModal(!1);

          const data = {
            message: `Add ${tkn1.symbol} and ${tkn2.symbol}`,
            tx: result,
          };
          dispatch(addTransaction(data));
          dispatch(checkUserLpTokens(!1));
        }
        liquid.setLiqConfirmed(!1);
      } catch (err) {
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        liquid.setLiqConfirmed(!1);
      } finally {
        dispatch(stopLoading());
      }
    } else {
      let amountADesired = liquid.token1Value;
      let amountBDesired = liquid.token2Value;
      let amountAMin = Math.floor(amountADesired - (amountADesired * P.slippage) / 100);
      let amountBMin = Math.floor(amountBDesired - (amountBDesired * P.slippage) / 100);

      amountAMin = BigNumber(toFull(amountAMin, dec[0])).toFixed();
      amountBMin = BigNumber(toFull(amountBMin, dec[0])).toFixed();
      amountADesired = BigNumber(toFull(amountADesired, dec[0])).toFixed();
      amountBDesired = BigNumber(toFull(amountBDesired, dec[1])).toFixed();

      const data = {
        tokenA: addr[0],
        tokenB: addr[1],
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to: priAccount,
        deadline: tStamp(P.deadline * 60),
        valueOfExact,
      };
      try {
        dispatch(startLoading());
        const result = await ExchangeService.addLiquidity(data);
        if (result) {
          liquid.setTxHash(result);
          liquid.showTransactionModal(!0);
          liquid.setShowSupplyModal(!1);

          const data = {
            message: `Add ${tkn1.symbol} and ${tkn2.symbol}`,
            tx: result,
          };
          dispatch(addTransaction(data));
          dispatch(checkUserLpTokens(!1));
        }
        liquid.setLiqConfirmed(!1);
      } catch (err) {
        console.log(err);
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        liquid.setLiqConfirmed(!1);
      } finally {
        dispatch(stopLoading());
      }
    }
  };
  const calculateFraction = tt => {
      return rDefined(liquid.token1Value, liquid.token2Value) ? 
        !zero(liquid[`token${tt}Value`]) ? 
          Number((liquid[`token${tgl(tt)}Value`] / liquid[`token${tgl(tt)}Value`]).toFixed(5)) 
          : 0 
        : 0;
  };

  const handleMaxBalance = async tt => {
    if (!isConnected) return toast.error('Connect wallet first!');
    let addr = liquid.token1.address;
     // .002 BNB is reserved for saving gas fee 
    if (isBnb(addr)) handleTokenValue(await ContractServices.getBNBBalance(priAccount) - 0.1, tt);
    // __ amount of particular token must be reserved for saving -needs to be fixed
    else handleTokenValue(await ContractServices.getTokenBalance(addr, priAccount), tt);
    liquid.setIsMax(!1);
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
          {liquid.isFirstLP && (
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
                label={`Balance: ${liquid.token1Balance}`}
                coinImage={liquid.token1?.icon}
                value={liquid.token1Currency}
                onClick={() => onHandleOpenModal(T_TYPE.A)}
                inputLabel="Input"
                className="mb-0"
                placeholder="0.0"
                onChange={(e) => handleTokenValue(e.target.value, T_TYPE.A)}
                defaultValue={liquid.token1Value}
                max={liquid.isMax}
                onMax={() => handleMaxBalance(T_TYPE.A)}
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
              title={priAccount ? "Supply" : "Unlock Wallet"}
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
        handleOrder={liquid.FilteredTokenList}
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
        token1Currency={liquid.token1Currency}
        token1Value={liquid.token1Value}
        token2Currency={liquid.token2Currency}
        token2Value={liquid.token2Value}
        calculateFraction={calculateFraction}
        sharePoolValue={liquid.sharePoolValue}
        tokenOne={liquid.token1}
        tokenTwo={liquid.token2}
        slippage={P.slippage}
      />
      <RecentTransactions
        show={showRecent}
        handleClose={recentTransactionsClose}
      />
    </>
  );
};

export default AddLiquidity;