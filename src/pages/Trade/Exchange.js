import "./Trade.scss";
import { MISC, T_TYPE } from "../../services/constant";
import { Container, Col } from 'react-bootstrap'
import React, { useState, useEffect, useRef } from "react";
import useCommonTrade from "../../hooks/CommonTrade";
import useCommon from "../../redux/volatiles/common";
import { useSelector } from "react-redux";
import ButtonPrimary from "../../components/Button/Button";
import SwapModal from "../../components/SwapModal/SwapModal";
import SelectCoin from "../../components/selectCoin/SelectCoin";
import iconTimer from '../../assets/images/ionic-ios-timer.svg'
import CardCustom from "../../components/cardCustom/CardCustom";
import ArrowDown from "../../assets/images/Arrow-Down-Icon.svg";
import SettingIcon from "../../assets/images/Settings-Icon.svg";
import { ContractServices } from "../../services/ContractServices"
import ConnectWallet from "../../components/ConnectWallet/ConnectWallet";
import SettingModal from "../../components/Modal/SettingModal/SettingModal";
import ModalCurrency from "../../components/Modal/ModalCurrency/ModalCurrency";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import TransactionalModal from "../../components/TransactionalModal/TransactionalModal";
import useSwap from "../../redux/volatiles/swap";
import useXchange from "../../hooks/exchange";
import Loader from "../../components/Loader";
import { fixBy, iContains, toDec, xpand } from "../../services/utils/global";
import { getEthBalance } from "../../services/contracts/Common";
import useRetained from "../../redux/retained";

const Exchange = (props) => {
  const swap = useSwap(s => s);
  const common = useCommon(s => s);
  const retainer = useRetained(s => s);
  const cTrade = useCommonTrade({});
  const Xchange = useXchange({});
  const P = useSelector(state => state.persist);

  const [walletShow, setWalletShow] = useState(!1);

  const ref = useRef(!0);
  useEffect(_ => {
    if(ref.current) {
      (async _ =>
          common.setTokenBalance(
            toDec(
              await getEthBalance(P.priAccount), MISC.DEF_DEC
            ), 
            T_TYPE.A
          )
      )();
      ref.current = !1;
    }
  });
  useEffect(() => {
    if (common.token1Value) {
      cTrade.handleInput(common.token1Value, T_TYPE.A, !0);
    }
  }, [
    common.token2, 
    common.token2Icon,
    common.token2Balance, 
    common.token2Currency, 
  ]);


  
  return (
    <>
      <Container fluid className="swapScreen comnSection">
        <CardCustom>
          <div className="settingSec">
            <h4>Exchange</h4>
            <div className="settingIcon">
              <img src={iconTimer} onClick={() => cTrade.setShowRecent(!0)} className="timerImg" alt="icon 01"/>
              <img src={SettingIcon} onClick={() => cTrade.settingHandleShow(!0)} alt="icon 02"/>
            </div>
          </div>
          <SelectCoin
            className="mb-0"
            placeholder="0.0"
            inputLabel="Input"
            value={common.token1Currency}
            coinImage={common.token1?.icon}
            tokenValue={common.token1Value}
            showMaxBtn={common.showMaxBtn1}
            disabled={common.isFetching && common.exact-1}
            onClick={() => cTrade.openSelectTokenModal(T_TYPE.A)}
            label={common.showBal1 ? `Balance: ${fixBy(common.token1.bal)}` : ''}
            onMax={_ => !common.setShowMaxBtn1(!1) && cTrade.handleInput(common.token1.bal, T_TYPE.A, !0)}
            onChange={e => !common.setShowMaxBtn1(!0) && cTrade.handleInput(e.target.value, T_TYPE.A, !0)}
          />
          <div 
            className="convert_plus" 
            onClick={Xchange.handleSwitchCurrencies}
          > <img src={ArrowDown} alt='icon 10'/> </div>
          <SelectCoin
            className="mb-0"
            placeholder="0.0"
            inputLabel="Input"
            value={common.token2Currency}
            showMaxBtn={common.showMaxBtn2}
            coinImage={common.token2?.icon}
            tokenValue={common.token2Value}
            disabled={common.isFetching && !(common.exact-1)}
            onClick={() => cTrade.openSelectTokenModal(T_TYPE.B)}
            label={common.showBal2 ? `Balance: ${fixBy(common.token2.bal)}` : ''}
            onMax={_ => !common.setShowMaxBtn2(!1) && cTrade.handleInput(common.token2.bal, T_TYPE.B, !0)}
            onChange={e => !common.setShowMaxBtn2(!0) && cTrade.handleInput(e.target.value, T_TYPE.B, !0)}
          />
          {P.slippage ?
            common.isFetching ? <Loader stroke='white' text='Fetching prices..'/> :
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
            </Col> : <></>}
          <div className="approve-section">
            {!common.token1Approved ? cTrade.getApprovalButton(T_TYPE.A) : <></>}
            {!common.token2Approved ? cTrade.getApprovalButton(T_TYPE.B) : <></>}
          </div>
          <Col className="swapBtn_col">
            
            {
              common.isErr ?
              <div className="error-box">
                {common.errText}
              </div> :
              <ButtonPrimary 
                className="swapBtn" 
                disabled={common.isErr || common.isFetching} 
                title={common.isFetching ? 'please wait...' : 'Swap'} 
                onClick={_ => Xchange.performSwap()}
              />
            }
          </Col>
        </CardCustom>
        {
          !common.isFetching && !common.isErr ?
            <div className="details-section">
              <ul>
                <li>Minimum received:<span>{common.minReceived / 10 ** 18}</span></li>
                <li>Price impact:<span>{common.priceImpact}%</span></li>
                <li>Liquidity provider fee:<span>{Xchange.liquidityProviderFee()}</span></li>
              </ul>
            </div> : !common.isErr ? <Loader stroke='white' text='please wait..'/> : <></>
          }
      </Container>
      <ModalCurrency
        show={common.show}
        searchValue={common.searchValue}
        handleClose={cTrade.handleClose}
        tokenType={common.tokenType}
        searchByName={common.setSearch}
        tokenList={retainer.tokenList}
        searchToken={cTrade.searchToken}
        currencyName={common.selectedCurrency}
        handleOrder={retainer.tokenList}
        selectCurrency={cTrade.selectToken}
      />
      <ConnectWallet
        show={walletShow}
        handleShow={cTrade.handleShow1}
        handleClose={cTrade.handleClose1}
      />
      <SettingModal
        slippageSet={common.setSlippage}
        deadLineSet={common.setDeadline}
        show={common.settingShow}
        handleShow={cTrade.settingHandleShow}
        handleClose={cTrade.settingClose}
      />
      {
        swap.isSwapModalOpen ?
        <SwapModal
          show={swap.isSwapModalOpen}
          handleSwap={Xchange.handleSwap}
          priceImpact={common.priceImpact}
          tokenOneValue={common.token1Value}
          tokenTwoValue={common.token2Value}
          tokenOneIcon={common.token1?.icon}
          tokenTwoIcon={common.token2?.icon}
          sharePoolValue={common.sharePoolValue}
          tokenOneCurrency={common.token1Currency}
          tokenTwoCurrency={common.token2Currency}
          liquidityProviderFee={Xchange.liquidityProviderFee()}
          closeModal={() => swap.closeSwapModal()}
        /> : <></>
      }
      <RecentTransactions
        show={common.showRecent}
        handleClose={_ => common.setShowRecent(!1)}
      />
      <TransactionalModal 
        txHash={common.txHash} 
        show={common.transactionModalShown} 
        handleClose={_ => common.showTransactionModal(!1)} 
      />
    </>

  );
};

export default Exchange;
