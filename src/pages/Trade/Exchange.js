import "./Trade.scss";
import { T_TYPE } from "../../constant";
import { BigNumber } from "bignumber.js"
import {WETH} from '../../assets/tokens'
import { Container, Col } from 'react-bootstrap'
import React, { useState, useEffect } from "react";
import { toast } from '../../components/Toast/Toast';
import useCommonTrade from "../../hooks/CommonTrade";
import useCommon from "../../redux/volatiles/common";
import { useDispatch, useSelector } from "react-redux";
import ButtonPrimary from "../../components/Button/Button";
import SwapModal from "../../components/SwapModal/SwapModal";
import SelectCoin from "../../components/selectCoin/SelectCoin";
import iconTimer from '../../assets/images/ionic-ios-timer.svg'
import CardCustom from "../../components/cardCustom/CardCustom";
import ArrowDown from "../../assets/images/Arrow-Down-Icon.svg";
import SettingIcon from "../../assets/images/Settings-Icon.svg";
import { ExchangeService } from "../../services/ExchangeService"
import { ContractServices } from "../../services/ContractServices"
import ConnectWallet from "../../components/ConnectWallet/ConnectWallet";
import SettingModal from "../../components/Modal/SettingModal/SettingModal";
import ModalCurrency from "../../components/Modal/ModalCurrency/ModalCurrency";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import TransactionalModal from "../../components/TransactionalModal/TransactionalModal";
import { addTransaction, startLoading, stopLoading } from "../../redux/actions"
import { isBnb, isDefined, isNonZero, rEq, tgl, toBgFix, toDec, toFlr, tStamp } from "../../services/utils";

const Exchange = (props) => {
  const dispatch = useDispatch();
  const common = useCommon(s => s);
  const cTrade = useCommonTrade({});
  const P = useSelector(state => state.persist);

  const [show1, setShow1] = useState(!1);
  const handleClose1 = () => setShow1(!1);
  const handleShow1 = () => setShow1(!0);
  const [settingShow, setsettingShow] = useState(!1);
  const settingClose = () => setsettingShow(!1);
  const settinghandleShow = () => setsettingShow(!0);


  const [showTransactionModal, setShowTransactionModal] = useState(!1);
  const [walletShow, setWalletShow] = useState(!1);

  const [showRecent, setShowRecent] = useState(!1);
  const [openSwapModal, setSwapModal] = useState(!1);
  const [minimumReceived, setMinReceived] = useState(0);

  useEffect(() => {
    common.setFilteredTokenList(
      P.tokenList.filter(
        tkn => tkn.name.toLowerCase().includes(
          common.search.toLowerCase()
        )
      )
    );
    init();
  }, [common.search, P.tokenList]);

  useEffect(() => {
    if (common.token1Value) {
      cTrade.handleTokenValue(common.token1Value, T_TYPE.A, !0);
    }
  }, [
    common.token2, 
    common.token2Icon,
    common.token2Balance, 
    common.token2Currency, 
  ]);


  const init = async () => {
    if (P.isConnected)
      common.setTokenBalance(await ContractServices.getBNBBalance(P.priAccount), T_TYPE.A);
  };

  const handleCloseRecent = () => setShowRecent(!1);
  

  const handleSwap = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (isDefined(acc) && !rEq(acc, P.priAccount))  return toast.error('Wallet address doesn`t match!');
    setSwapModal(!1);

    let dl = tStamp(P.deadline * 60);

    let addr = [common.token1.address, common.token2.address];

    let [a1, v1, bnb1]= isBnb(addr[0]) ? [WETH, !0, common.token1Value] : [addr[0], !1, 0];
    let [a2, v2, bnb2]= isBnb(addr[1]) ? [WETH, !0, common.token2Value] : [addr[1], !1, 0];
    let value = bnb1 ? v1 : bnb2 ? v2 : 0; 
    value = value > 0 ? BigNumber(value * 10 ** 18).toFixed() : 0;
    console.log('a1, a2, value', a1, a2, value);
    if (bnb1) {
      dispatch(startLoading());
      const data = await handleBNBSwapForTK1(dl, value);
      try {
        const result = common.exact === T_TYPE.A ?

          await ExchangeService.swapExactETHForTokens(data, cTrade.handleBalance) :

          await ExchangeService.swapETHForExactTokens(data);

        dispatch(stopLoading());
        if (result) {
          common.setTxHash(result);
          setShowTransactionModal(!0);
          common.setShowSupplyModal(!1);


          const data = {
            message: `Swap ${common.token1.symbol} and ${common.token2.symbol}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
        common.setLiqConfirmed(!1);

      } catch (err) {
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        common.setLiqConfirmed(!1);
      }
    } else if (bnb2) {
      dispatch(startLoading());
      const data = await handleBNBSwapForTK2(dl, value);
      try {
        const result = common.exact === T_TYPE.A ?

          await ExchangeService.swapExactTokensForETH(data, a1, a2) :

          await ExchangeService.swapTokensForExactETH(data, a1, a2);

        dispatch(stopLoading());

        if (result) {
          common.setTxHash(result);
          setShowTransactionModal(!0);
          common.setShowSupplyModal(!1);
          const data = {
            message: `Swap ${common.token1.symbol} and ${common.token2.symbol}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
        common.setLiqConfirmed(!1);

      } catch (err) {
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        common.setLiqConfirmed(!1);
      }
    } else {
      dispatch(startLoading());
      let pair;
      const cPair = await ExchangeService.getPair(a1, a2);

      if (isNonZero(cPair)) {
        pair = [a1, a2];
      } else {
        const pairs = await cTrade.checkPairWithBNBOrUSDT(a1, a2);
        if (pairs) {
          pair = pairs;
        }
      }
      let data = await handleSwapAmountIn(dl, value);
      data.path = pair;
      try {
        const result = common.exact === T_TYPE.A ?

          await ExchangeService.swapExactTokensForTokens(data, a1, a2) :

          await ExchangeService.swapTokensForExactTokens(data, a1, a2);

        dispatch(stopLoading());

        if (result) {
          common.setTxHash(result);
          setShowTransactionModal(!0);
          common.setShowSupplyModal(!1);

          const data = {
            message: `Swap ${common.token1.symbol} and ${common.token2.symbol}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
        common.setLiqConfirmed(!1);

      } catch (err) {
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        common.setLiqConfirmed(!1);
      }
    }
  }

  const handleSwapAmountIn = async (dl, v) => {
    let i = common.exact, x = [
      toDec(common[`token${i}Value`], common[`token${i}`].decimals),
      toDec(common[`token${tgl(i)}Value`], common[`token${tgl(i)}`].decimals),
    ], d = {
      value: v,
      path: [],
      deadline: dl,
      to: P.priAccount,
      amountIn: toBgFix(x[i-1]).toString(),
      amountOutMin: toBgFix(x[tgl(i)-1] + (x[tgl(i)-1] * P.slippage / 100)).toString(),
    };
    console.log('[swap] handle amountIn:', v, i, d);
    return {...d}; 
  }

  const handleBNBSwapForTK1 = async (dl, v) => {
    let tv = common[`token${tgl(common.exact)}Value`]
    let dec = common[`token${tgl(common.exact)}`].decimals;
    let x = toBgFix(toFlr(toDec(tv, dec)));
    let d = {
      value: v,
      deadline: dl,
      to: P.priAccount,
      path: [WETH, common.token2.address],
      amountOutMin: toBgFix(toFlr(Number(x) - (Number(x) * P.slippage / 100))).toString(),
    };
    console.log('[swap] handle bnb for tk1:', v, common.exact, d);
    return {...d};
  }

  const handleBNBSwapForTK2 = async (dl, v) => {
    let i = common.exact, 
        d = {
          value: v,  
          deadline: dl,
          to: P.priAccount,
          path: [common.token1.address, WETH],
        };
    
    let x = toDec(common[`token${i}Value`],  common[`token${i}`].decimals); 
    let y = toDec(common[`token${tgl(i)}Value`], common[`token${tgl(i)}`].decimals);
    
    if (!(i-1)) {
      d['amountIn'] = toBgFix(toFlr(x));
      d['amountOutMin'] = toBgFix(toFlr(y - (y * P.slippage / 100)));
    }

    if (i-1) {
      d['amountOut'] = toBgFix(toFlr(y));
      d['amountInMax'] = toBgFix(toFlr(x + (x * P.slippage / 100)));
    }
    console.log('[swap] handle bnb for tk2:', v, i, d);
    return {...d};
  }

  const handleSwitchCurrencies = () => {
    common.setExact(tgl(common.exact));
    common.setToken(common.token1, T_TYPE.B);
    common.setToken(common.token2, T_TYPE.A);
    common.setTokenIcon(common.token1Icon, T_TYPE.B);
    common.setTokenIcon(common.token2Icon, T_TYPE.A);
    common.setTokenValue(common.token1Value, T_TYPE.B);
    common.setTokenValue(common.token2Value, T_TYPE.A);
    common.setTokenBalance(common.token1Balance, T_TYPE.B);
    common.setTokenBalance(common.token2Balance, T_TYPE.A);
    common.setTokenCurrency(common.token1Currency, T_TYPE.B);
    common.setTokenCurrency(common.token2Currency, T_TYPE.A);
  }
  
  const closeTransactionModal = () => {
    setShowTransactionModal(!1);
  }

  const liquidityProviderFee = () => {
    const value = common.exact === T_TYPE.A ? common.token1Value : common.token2Value;
    const tknCurrency = common.exact === T_TYPE.A ? common.token1Currency : common.token2Currency;
    let lpf = (value * 2) / 1000;
    lpf = BigNumber(lpf).toFixed();
    const calLpf = lpf + ' ' + tknCurrency
    return calLpf;
  }
  return (
    <>
      <Container fluid className="swapScreen comnSection">
        <CardCustom>
          <div className="settingSec">
            <h4>Exchange</h4>
            <div className="settingIcon">
              <img src={iconTimer} onClick={() => setShowRecent(!0)} className="timerImg" />
              <img src={SettingIcon} onClick={() => settinghandleShow(!0)} />
            </div>
          </div>
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
            onChange={e => cTrade.handleTokenValue(e.target.value, T_TYPE.A, !0)}
          />
          <div 
            className="convert_plus" 
            onClick={handleSwitchCurrencies}
          > <img src={ArrowDown} alt='icon 10'/> </div>
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
            onChange={e => cTrade.handleTokenValue(e.target.value, T_TYPE.B, !0)}
          />
          {P.slippage &&
            <Col className="priceSec_col">
              <div>
                {
                  (
                    !common.disabled && P.priAccount
                  ) && <h5>Price</h5>
                }
                <h5>Slippage Tolerance</h5>
              </div>
              <div className="text-end">
                <h5>
                  {
                    (
                      !common.disabled && P.priAccount
                    ) && <>{common.sharePoolValue}  {common.token1Currency} per {common.token2Currency}</>
                  }
                </h5>
                <h5>{`${P.slippage}%`}</h5>
              </div>
            </Col>}
          {!common.token1Approved ? cTrade.getApprovalButton(T_TYPE.A) : <></>}
          {!common.token2Approved ? cTrade.getApprovalButton(T_TYPE.B) : <></>}
          <Col className="swapBtn_col">
            {
              (
                common.disabled && !P.priAccount
              ) && <ButtonPrimary className="swapBtn" onClick={() => setWalletShow(!0)} title={'Unlock Wallet'} />
            }
            {
              (
                common.disabled && P.priAccount
              ) && <ButtonPrimary disabled={common.disabled} className="swapBtn" title={common.btnText} />
            }
            {
              (
                !common.disabled && P.priAccount
              ) && <ButtonPrimary className="swapBtn" onClick={() => setSwapModal(!openSwapModal)} title={common.btnText || 'Swap'} />
            }
          </Col>
        </CardCustom>
        {(!common.disabled && P.priAccount) &&
          <div className="card_style card_style_bottom">
            <ul>
              <li>Minimum received:<span>{common.minReceived / 10 ** 18}</span></li>
              <li>Price impact:<span>{common.priceImpact}%</span></li>
              <li>Liquidity provider fee:<span>{liquidityProviderFee()}</span></li>
            </ul>
          </div>}
      </Container>
      <ModalCurrency
        show={common.modalCurrency}
        tokenType={common.tokenType}
        searchByName={common.setSearch}
        handleShow={common.setModalCurrency}
        tokenList={common.filteredTokenList}
        handleClose={common.setModalCurrency}
        searchToken={cTrade.handleSearchToken}
        currencyName={common.selectedCurrency}
        handleOrder={common.setFilteredTokenList}
        selectCurrency={cTrade.onHandleSelectCurrency}
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
        show={openSwapModal}
        handleSwap={handleSwap}
        priceImpact={common.priceImpact}
        token1Value={common.token1Value}
        tokenTwoValue={common.token2Value}
        tokenOneIcon={common.token1?.icon}
        tokenTwoIcon={common.token2?.icon}
        sharePoolValue={common.sharePoolValue}
        tokenOneCurrency={common.token1Currency}
        tokenTwoCurrency={common.token2Currency}
        liquidityProviderFee={liquidityProviderFee()}
        closeModal={() => setSwapModal(!openSwapModal)}
      />}
      <RecentTransactions
        show={showRecent}
        handleClose={handleCloseRecent}
      />
      <TransactionalModal 
        txHash={common.txHash} 
        show={showTransactionModal} 
        handleClose={closeTransactionModal} 
      />
    </>

  );
};

export default Exchange;
