import "./Trade.scss";
import { MISC, T_TYPE } from "../../services/constant";
import React, { useEffect, useRef } from "react";
import { isEth } from "../../services/utils/trading";
import useLiquidity from "../../hooks/liquidity";
import { Container, Col } from "react-bootstrap";
import Loader from "../../components/Loader";
import useCommonTrade from "../../hooks/CommonTrade";
import useCommon from "../../redux/volatiles/common";
import Plusicon from "../../assets/images/plus_yellow.png";
import ButtonPrimary from "../../components/Button/Button";
import CardCustom from "../../components/cardCustom/CardCustom";
import SelectCoin from "../../components/selectCoin/SelectCoin";
import ButtonBack from "../../components/buttonBack/ButtonBack";
import SettingIcon from "../../assets/images/Settings-Icon.svg";
import TimerIcon from "../../assets/images/ionic-ios-timer.svg";
import { useSelector } from "react-redux";
import SupplyModal from "../../components/SupplyModal/SupplyModal";
import ConnectWallet from "../../components/ConnectWallet/ConnectWallet";
import SettingModal from "../../components/Modal/SettingModal/SettingModal";
import ModalCurrency from "../../components/Modal/ModalCurrency/ModalCurrency";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import log from "../../services/logging/logger";
import { fixBy, iContains, toDec } from "../../services/utils/global";
import { getEthBalance } from "../../services/contracts/Common";
import TokenContract from "../../services/contracts/TokenContract";
import useRetained from "../../redux/retained";

const AddLiquidity = (props) => {
  const common = useCommon(s => s);
  const retainer = useRetained(s => s);
  const cTrade = useCommonTrade({});
  const liquidity = useLiquidity({});
  const P = useSelector(s => s.persist);
  
  const TC = TokenContract;
  const ref = useRef(!0);
  useEffect(_ => {
    if(ref.current) {
      log.i('[AddLiquidity] a hard reload happened');
      // common.reset();
      (
        async _ => common.setTokenBalance(
            toDec(
                await getEthBalance(P.priAccount), MISC.DEF_DEC
            ), 
            T_TYPE.A
        )
      )();
      init();
      ref.current = !1;
    } // else log.i('[AddLiquidity] a soft reload happened');
  })

  const init = async () => {
    const { lptoken } = props;
    if (lptoken) {
      let i = lptoken.token0Obj ? 0 : lptoken.token0Obj ? 1 : -1;
      try {
        let bal = 0;
        if(isEth(lptoken[`token${i}Obj`].addr))
          bal = await getEthBalance(P.priAccount);
        else {
          TC.setTo(lptoken[`token${i}Obj`].addr);
          bal = await TC.balanceOf(P.priAccount);
        }
        common.setTokenBalance(bal, T_TYPE.A);
      } catch(e) {
        log.e('Reason:', e.reason);
      }
      common.setCurrentPair(lptoken.pair);
      common.setLpTokenBalance(lptoken.balance);
      common.setSharePoolValue(lptoken.poolShare);
      if(i>=0) {
        common.setTokenValue(lptoken[`token${i}Obj`], i+1);
        common.setTokenDeposit(lptoken[`token${i}Deposit`], i+1);
        common.setTokenCurrency(lptoken[`token${i}Obj`].symbol, i+1);
      }
    }
  };

  return (
    <>
      <Container fluid className="swapScreen comnSection">
        <CardCustom>
        <div className="settingSec">
            <h4>Exchange</h4>
            <div className="settingIcon">
              <img src={TimerIcon} onClick={() => cTrade.setShowRecent(!0)} className="timerImg" alt="icon 01"/>
              <img src={SettingIcon} onClick={() => cTrade.settingHandleShow(!0)} alt="icon 02"/>
            </div>
          </div>
          
          {common.isFirstLP && (
            <div className="firstPro_Note d-none">
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
                disabled={common.isFetching}
                value={common.token1Currency}
                coinImage={common.token1?.icon}
                tokenValue={common.token1Value}
                showMaxBtn={common.showMaxBtn1}
                onClick={() => cTrade.openSelectTokenModal(T_TYPE.A)}
                label={common.showBal1 ? `Balance: ${fixBy(common.token1.bal)}` : ''}
                onMax={_ => !common.setShowMaxBtn1(!1) && cTrade.handleInput(common.token1.bal, T_TYPE.A)}
                onChange={e => !common.setShowMaxBtn1(!0) && cTrade.handleInput(e.target.value, T_TYPE.A)}
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
                className="mb-0"
                placeholder="0.0"
                inputLabel="Input"
                disabled={common.isFetching}
                showMaxBtn={common.showMaxBtn2}
                value={common.token2Currency}
                coinImage={common.token2?.icon}
                tokenValue={common.token2Value}
                onClick={() => cTrade.openSelectTokenModal(T_TYPE.B)}
                label={common.showBal2 ? `Balance: ${fixBy(common.token2.bal)}` : ''}
                onMax={_ => !common.setShowMaxBtn2(!1) && cTrade.handleInput(common.token2.bal, T_TYPE.B)}
                onChange={e => !common.setShowMaxBtn2(!0) && cTrade.handleInput(e.target.value, T_TYPE.B)}
              />
            }
            {
              common.isFetching ? <Loader stroke='white' text='Fetching prices..'/> :
              (
                common.poolShareShown ? (
                  <Col className="poolSec">
                    <h6>PRICES AND POOL SHARE</h6>
                    <div className="poolDiv">
                      <span>
                        {liquidity.calculateFraction(T_TYPE.A)} per
                        <br />
                        <small>
                          {" "}
                          {common.token2Currency} per {common.token1Currency}
                        </small>
                      </span>
                      <span>
                        {liquidity.calculateFraction(T_TYPE.B)} per
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
                ) :
                !common.pairExist ? (
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
                ) : <></>
              )
            }
            
          </div>
          <Col className="swapBtn_col">
            {
              common.isErr ?
              <div className="error-box">
                {common.errText}
              </div> : 
              (
                <div className="btn-wrapper">
                    <div className="approve-section">
                      {!common.token1Approved ? cTrade.getApprovalButton(T_TYPE.A) : <></>}
                      {!common.token2Approved ? cTrade.getApprovalButton(T_TYPE.B) : <></>}
                    </div>
      
                    <ButtonPrimary
                      className="swapBtn dismissBtn"
                      disabled={common.isErr || common.isFetching}
                      title={common.isFetching ? 'please wait...' : 'Add Liquidity'}
                      onClick={_ => { _.preventDefault(); liquidity.addLiquidity(); }}
                    />
                    {
                      common.isTxErr ?
                      <div className='tx-error-box'>
                        Transaction Error: <span>{common.txErr}</span>
                      </div> : <></>
                    }
                </div>
              )
            }
          </Col>
        </CardCustom>
      </Container>
      <ModalCurrency
        show={common.show}
        searchByName={common.setSearch}
        handleClose={cTrade.handleClose}
        searchValue={common.searchValue}
        tokenType={common.tokenType}
        tokenList={retainer.tokenList}
        currencyName={common.selectedCurrency}
        searchToken={cTrade.handleSearchToken}
        handleOrder={retainer.tokenList}
        selectCurrency={cTrade.selectToken}
      />
      <ConnectWallet
        show={common.show1}
        handleShow={cTrade.handleShow1}
        handleClose={cTrade.handleClose1}
      />
      <SettingModal
        slippageSet={common.setSlippage}
        deadLineSet={common.setDeadline}
        show={common.settingShow}
        handleClose={cTrade.settingClose}
        handleShow={cTrade.settingHandleShow}
      />
      <SupplyModal
        slippage={P.slippage}
        tokenOne={common.token1}
        tokenTwo={common.token2}
        addLiquidity={liquidity.addLiquidity}
        show={common.showSupplyModal}
        handleClose={common.setShowSupplyModal}
        token1Value={common.token1Value}
        token2Value={common.token2Value}
        calculateFraction={liquidity.calculateFraction}
        token2Currency={common.token2Currency}
        sharePoolValue={common.sharePoolValue}
        token1Currency={common.token1Currency}
        liquidityConfirmation={common.isLiqConfirmed}
      />
      <RecentTransactions
        show={common.showRecent}
        handleClose={cTrade.handleCloseRecent}
      />
    </>
  );
};

export default AddLiquidity;