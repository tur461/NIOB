import "./Trade.scss";
import { T_TYPE } from "../../constant";
import { Container, Col } from 'react-bootstrap'
import React, { useState, useEffect } from "react";
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

const Exchange = (props) => {
  const swap = useSwap(s => s);
  const common = useCommon(s => s);
  const cTrade = useCommonTrade({});
  const Xchange = useXchange({});
  const P = useSelector(state => state.persist);

  const [walletShow, setWalletShow] = useState(!1);

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
      cTrade.handleInput(common.token1Value, T_TYPE.A, !0);
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
            max={common.isMax}
            value={common.token1Currency}
            coinImage={common.token1?.icon}
            tokenValue={common.token1Value}
            disabled={common.isFetching && common.exact-1}
            label={`Balance: ${common.token1Balance}`}
            onMax={() => cTrade.handleMaxBalance(T_TYPE.A)}
            onClick={() => cTrade.onHandleOpenModal(T_TYPE.A)}
            onChange={e => cTrade.handleInput(e.target.value, T_TYPE.A, !0)}
          />
          <div 
            className="convert_plus" 
            onClick={Xchange.handleSwitchCurrencies}
          > <img src={ArrowDown} alt='icon 10'/> </div>
          <SelectCoin
            max={!1}
            className="mb-0"
            placeholder="0.0"
            inputLabel="Input"
            value={common.token2Currency}
            coinImage={common.token2?.icon}
            tokenValue={common.token2Value}
            disabled={common.isFetching && !(common.exact-1)}
            label={`Balance: ${common.token2Balance}`}
            onClick={() => cTrade.onHandleOpenModal(T_TYPE.B)}
            onChange={e => cTrade.handleInput(e.target.value, T_TYPE.B, !0)}
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
              ) && <ButtonPrimary disabled={common.disabled} className="swapBtn" title={common.btnText || 'Swap'} />
            }
            {
              (
                !common.disabled && P.priAccount
              ) && <ButtonPrimary className="swapBtn" onClick={() => swap.openSwapModal()} title={common.btnText || 'Swap'} />
            }
          </Col>
        </CardCustom>
        {(!common.disabled && P.priAccount) &&
          <div className="card_style card_style_bottom">
            <ul>
              <li>Minimum received:<span>{common.minReceived / 10 ** 18}</span></li>
              <li>Price impact:<span>{common.priceImpact}%</span></li>
              <li>Liquidity provider fee:<span>{Xchange.liquidityProviderFee()}</span></li>
            </ul>
          </div>}
      </Container>
      <ModalCurrency
        show={common.show}
        handleClose={cTrade.handleClose}
        tokenType={common.tokenType}
        searchByName={common.setSearch}
        tokenList={common.filteredTokenList}
        searchToken={cTrade.handleSearchToken}
        currencyName={common.selectedCurrency}
        handleOrder={common.setFilteredTokenList}
        selectCurrency={cTrade.onHandleSelectCurrency}
      />
      <ConnectWallet
        show={walletShow}
        handleShow={cTrade.handleShow1}
        handleClose={cTrade.handleClose1}
      />
      <SettingModal
        show={common.settingShow}
        handleShow={cTrade.settingHandleShow}
        handleClose={cTrade.settingClose}
      />
      {swap.isSwapModalOpen && <SwapModal
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
      />}
      <RecentTransactions
        show={common.showRecent}
        handleClose={cTrade.handleCloseRecent}
      />
      <TransactionalModal 
        txHash={common.txHash} 
        show={common.transactionModalShown} 
        handleClose={common.showTransactionModal} 
      />
    </>

  );
};

export default Exchange;
