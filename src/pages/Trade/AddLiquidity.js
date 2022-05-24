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
import { ContractServices } from "../../services/ContractServices";
import { toast } from "../../components/Toast/Toast";
import { ExchangeService } from "../../services/ExchangeService";
import {
  addTransaction,
  checkUserLpTokens,
  startLoading,
  stopLoading,
} from "../../redux/actions";
import { BigNumber } from "bignumber.js";
import SupplyModal from "../../components/SupplyModal/SupplyModal";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import { T_TYPE, VAL } from "../../constant";
import useLiquid from "../../redux/volatiles/liquid";
import { isBnb, isDefined, rDefined, rEq, tgl, toDec, toFull, tStamp, zero } from "../../services/utils";
import useCommonTrade from "../../hooks/CommonTrade";
import useCommon from "../../redux/volatiles/common";

const AddLiquidity = (props) => {
  const common = useCommon(s => s);
  const liquid = useLiquid(s => s);
  const cTrade = useCommonTrade({})

  useEffect(_ => {
    console.log('state change detected');
    console.log('token1 approved:', common.token1Approved, 'token2 approved:', common.token2Approved);
}, [
    common.token1Approved,
    common.token2Approved,
])
  
  const P = useSelector(s => s.persist);
  const tokenList = useSelector(s => s.persist.tokenList);
  const walletType = useSelector(s => s.persist.walletType);
  const priAccount = useSelector(s => s.persist.isUserConnected);
  
  const isConnected = priAccount && priAccount.length === 42;

  const [show1, setShow1] = useState(!1);
  const handleClose1 = () => setShow1(!1);
  const handleShow1 = () => setShow1(!0);
  const [settingShow, setsettingShow] = useState(!1);
  const [showRecent, setShowRecent] = useState(!1);
  const [search, setSearch] = useState("");

  const settingClose = () => setsettingShow(!1);
  const supplyModalClose = () => common.setShowSupplyModal(!1);
  const recentTransactionsClose = () => setShowRecent(!1);
  const settinghandleShow = () => setsettingShow(!0);

  const dispatch = useDispatch();

  useEffect(() => {
    common.setFilteredTokenList(tokenList.filter((token) => token.name.toLowerCase().includes(search.toLowerCase())));
    init();
  }, [search, tokenList]);

  const init = async () => {
    if (isConnected) {
      const balance1 = await ContractServices.getBNBBalance(priAccount);
      common.setTokenBalance(balance1, T_TYPE.A);
      const { lptoken } = props;
      if (lptoken) {
        common.setCurrentPair(lptoken.pair);
        common.setLpTokenBalance(lptoken.balance);
        common.setSharePoolValue(lptoken.poolShare);
        let i = lptoken.token0Obj ? 0 : lptoken.token1Obj ? 1 : -1;
        if(i>=0) {
          common.setTokenValue(lptoken[`token${i}Obj`], i+1);
          common.setTokenDeposit(lptoken[`token${i}Deposit`], i+1);
          common.setTokenCurrency(lptoken[`token${i}Obj`].symbol, i+1);
          common.setTokenBalance(
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

  const checkAddLiquidity = async () => {
    console.log('common:', common);
    if (!isConnected) handleShow1();
    else {
      let addr, e=null;
      if (walletType === "Metamask") addr = await ContractServices.isMetamaskInstalled('');
      if (walletType === "BinanceChain") addr = await ContractServices.isBinanceChainInstalled();
      if (!rEq(priAccount, addr)) e = 'Mismatch wallet addr!';
      else if (!isDefined(common.token1.address)) e = 'Select 1st token!';
      else if (!isDefined(common.token2.address)) e = 'Select 2nd token!';
      else if (common.token1Value <= 0) e = 'Enter 1st token value!';
      else if (common.token2Value <= 0) e = 'Enter 2nd token value!';
      else if (!isDefined(common.token1Approved)) e = '1st Token approval is pending!';
      else if (!isDefined(common.token2Approved)) e = '2nd Token approval is pending!';
      else if (common.token1Balance < common.token1Value) e = `Wallet have insufficient ${common.token1.symbol} balance!`;
      else if (common.token2Balance < common.token2Value) e = `Wallet have insufficient ${common.token2.symbol} balance!`;
      if(e) return toast.error(e);
      common.setShowSupplyModal(!0);
    }
  };

  const addLiquidity = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (isDefined(acc) && !rEq(acc, priAccount))
      return toast.error("Wallet address doesn`t match!");
    
    if (common.isLiqConfirmed)
      return toast.info("Transaction is processing!");
    
    let valueOfExact = 0, otherTokenzAddr, 
        tkn1 = common.token1, 
        tkn2 = common.token2, 
        addr = [tkn1.address, tkn2.address];

    if (rEq(tkn1.address, tkn2.address)) return toast.info("select dissimilar tokens!");
      
    common.setLiqConfirmed(!0);
    
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
          common.setTxHash(result);
          common.showTransactionModal(!0);
          common.setShowSupplyModal(!1);

          const data = {
            message: `Add ${tkn1.symbol} and ${tkn2.symbol}`,
            tx: result,
          };
          dispatch(addTransaction(data));
          dispatch(checkUserLpTokens(!1));
        }
        common.setLiqConfirmed(!1);
      } catch (err) {
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        common.setLiqConfirmed(!1);
      } finally {
        dispatch(stopLoading());
      }
    } else {
      let amountADesired = common.token1Value;
      let amountBDesired = common.token2Value;
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
          common.setTxHash(result);
          common.showTransactionModal(!0);
          common.setShowSupplyModal(!1);

          const data = {
            message: `Add ${tkn1.symbol} and ${tkn2.symbol}`,
            tx: result,
          };
          dispatch(addTransaction(data));
          dispatch(checkUserLpTokens(!1));
        }
        common.setLiqConfirmed(!1);
      } catch (err) {
        console.log(err);
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        common.setLiqConfirmed(!1);
      } finally {
        dispatch(stopLoading());
      }
    }
  };

  const calculateFraction = tt => {
      return rDefined(common.token1Value, common.token2Value) ? 
        !zero(liquid[`token${tt}Value`]) ? 
          Number((liquid[`token${tgl(tt)}Value`] / liquid[`token${tgl(tt)}Value`]).toFixed(5)) 
          : 0 
        : 0;
  };

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
                alt="icon 8"
                src={TimerIcon}
                className="timerImg"
                onClick={() => setShowRecent(!0)}
              />
              <img 
                alt="icon 9" 
                src={SettingIcon} 
                onClick={() => settinghandleShow(!0)}
              />
            </div>
          </div>
          {common.isFirstLP && (
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
                className="mb-0"
                placeholder="0.0"
                inputLabel="Input"
                max={common.isMax}
                value={common.token1Currency}
                coinImage={common.token1?.icon}
                tokenValue={common.token1Value}
                label={`Balance: ${common.token1Balance}`}
                onMax={() => cTrade.handleMaxBalance(T_TYPE.A)}
                onClick={() => cTrade.onHandleOpenModal(T_TYPE.A)}
                onChange={(e) => cTrade.handleTokenValue(e.target.value, T_TYPE.A)}
              />
            }
            <div className="convert_plus">
              <img 
                alt='icon 10' 
                src={Plusicon} 
                style={{ width: 22 }}
              />
            </div>
            {
              <SelectCoin
                max={!1}
                className="mb-0"
                placeholder="0.0"
                inputLabel="Input"
                value={common.token2Currency}
                coinImage={common.token2?.icon}
                tokenValue={common.token2Value}
                label={`Balance: ${common.token2Balance}`}
                onClick={() => cTrade.onHandleOpenModal(T_TYPE.B)}
                onChange={(e) => cTrade.handleTokenValue(e.target.value, T_TYPE.B)}
              />
            }
            {common.poolShareShown && (
              <Col className="poolSec">
                <h6>PRICES AND POOL SHARE</h6>
                <div className="poolDiv">
                  <span>
                    {calculateFraction(T_TYPE.A)} per
                    <br />
                    <small>
                      {" "}
                      {common.token2Currency} per {common.token1Currency}
                    </small>
                  </span>
                  <span>
                    {calculateFraction(T_TYPE.B)} per
                    <br />
                    <small>
                      {" "}
                      {common.token1Currency} per {common.token2Currency}
                    </small>
                  </span>
                  <span>
                    {common.sharePoolValue}% <br />
                    <small>Share of Pool</small>
                  </span>
                </div>
              </Col>
            )}
            {common.currentPair && (
              <Col className="lp-class">
                <h4>LP Tokens in your Wallet</h4>
                <ul className="LptokensList">
                  <li>
                    <span>
                      <img
                        alt="icon 1"
                        className="sc-fWPcDo bUpjCL"
                        src={common.token1?.icon}
                      />
                      <img
                        alt="icon 2"
                        className="sc-fWPcDo bUpjCL"
                        src={common.token2?.icon}
                      />
                      &nbsp;&nbsp;
                      {`${common.token1Currency}/${common.token2Currency}`}:
                    </span>{" "}
                    <span>{common.lpTokenBalance?.toFixed(5)}</span>
                  </li>
                  <li>
                    {common.token1.symbol}: <span>{common.token1Deposit}</span>
                  </li>
                  <li>
                    {" "}
                    {common.token2.symbol}: <span>{common.token2Deposit}</span>
                  </li>
                </ul>
              </Col>
            )}
          </div>
          <Col className="swapBtn_col">
            {!common.token1Approved ? cTrade.getApprovalButton(T_TYPE.A) : <></>}
            {!common.token2Approved ? cTrade.getApprovalButton(T_TYPE.B) : <></>}

            <ButtonPrimary
              disabled={common.disabled}
              className="swapBtn dismissBtn"
              title={common.btnText || 'Supply'}
              onClick={() => checkAddLiquidity()}
            />
          </Col>
        </CardCustom>
      </Container>
      <ModalCurrency
        show={common.show}
        searchByName={setSearch}
        handleClose={cTrade.handleClose}
        tokenType={common.tokenType}
        tokenList={common.filteredTokenList}
        currencyName={common.selectedCurrency}
        searchToken={cTrade.handleSearchToken}
        handleOrder={common.FilteredTokenList}
        selectCurrency={cTrade.onHandleSelectCurrency}
      />
      <ConnectWallet
        show={show1}
        handleShow={handleShow1}
        handleClose={handleClose1}
      />
      <SettingModal
        show={settingShow}
        handleClose={settingClose}
        handleShow={settinghandleShow}
      />
      <SupplyModal
        slippage={P.slippage}
        tokenOne={common.token1}
        tokenTwo={common.token2}
        addLiquidity={addLiquidity}
        show={common.showSupplyModal}
        handleClose={supplyModalClose}
        token1Value={common.token1Value}
        token2Value={common.token2Value}
        calculateFraction={calculateFraction}
        token2Currency={common.token2Currency}
        sharePoolValue={common.sharePoolValue}
        token1Currency={common.token1Currency}
        liquidityConfirmation={common.isLiqConfirmed}
      />
      <RecentTransactions
        show={showRecent}
        handleClose={recentTransactionsClose}
      />
    </>
  );
};

export default AddLiquidity;