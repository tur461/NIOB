import "./Trade.scss";
import { T_TYPE } from "../../services/constant";
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
import { iContains } from "../../services/utils/global";
import { getEthBalance } from "../../services/contracts/Common";
import TokenContract from "../../services/contracts/TokenContract";

const AddLiquidity = (props) => {
  const common = useCommon(s => s);
  const cTrade = useCommonTrade({});
  const liquidity = useLiquidity({});
  const P = useSelector(s => s.persist);

  const TC = TokenContract;
  const ref = useRef(!0);
  useEffect(_ => {
    if(ref.current) {
      log.i('[AddLiquidity] a hard reload happened');
      common.reset();
      ref.current = !1;
    } // else log.i('[AddLiquidity] a soft reload happened');
  })
  
  useEffect(() => {
    common.setFilteredTokenList(P.tokenList.filter(token => iContains(token.name, common.search)));
    init();
  }, [common.search, P.tokenList]);

  const init = async () => {
    if (P.isConnected) {
      const { lptoken } = props;
      let bal = '0';
      if (lptoken) {
        let i = lptoken.token0Obj ? 0 : lptoken.token0Obj ? 1 : -1;
        try {
          if(isEth(lptoken[`token${i}Obj`].addr))
            bal = await getEthBalance(P.priAccount);
          else {
            TC.setTo(lptoken[`token${i}Obj`].addr);
            bal = await TC.balanceOf(P.priAccount);
          }
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
      common.setTokenBalance(bal, T_TYPE.A);
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
                disabled={common.isFetching}
                value={common.token1Currency}
                coinImage={common.token1?.icon}
                tokenValue={common.token1Value}
                label={`Balance: ${common.token1Balance}`}
                onMax={() => cTrade.handleMaxBalance(T_TYPE.A)}
                onClick={() => cTrade.openSelectTokenModal(T_TYPE.A)}
                onChange={(e) => cTrade.handleInput(e.target.value, T_TYPE.A)}
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
                disabled={common.isFetching}
                className="mb-0"
                placeholder="0.0"
                inputLabel="Input"
                value={common.token2Currency}
                coinImage={common.token2?.icon}
                tokenValue={common.token2Value}
                label={`Balance: ${common.token2Balance}`}
                onClick={() => cTrade.openSelectTokenModal(T_TYPE.B)}
                onChange={(e) => cTrade.handleInput(e.target.value, T_TYPE.B)}
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
                common.pairNotExist ? (
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
                      disabled={common.isErr}
                      className="swapBtn dismissBtn"
                      title='Add Liquidity'
                      onClick={() => liquidity.checkAddLiquidity()}
                    />
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
        tokenType={common.tokenType}
        tokenList={common.filteredTokenList}
        currencyName={common.selectedCurrency}
        searchToken={cTrade.handleSearchToken}
        handleOrder={common.FilteredTokenList}
        selectCurrency={cTrade.selectToken}
      />
      <ConnectWallet
        show={common.show1}
        handleShow={cTrade.handleShow1}
        handleClose={cTrade.handleClose1}
      />
      <SettingModal
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