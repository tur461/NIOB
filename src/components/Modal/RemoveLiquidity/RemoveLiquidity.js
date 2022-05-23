import React, { useEffect, useState } from "react";
import { Col, Row, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import DownArrow from "../../../assets/images/down-arrow.png";
import NiobIcon from "../../../assets/images/NIOB-Token-Icon.svg";
import BnbIcon from "../../../assets/images/token_icons/WBNB-Token-Icon.svg";
import { MAIN_CONTRACT_LIST, TOKEN_LIST, WETH } from "../../../assets/tokens";
import { addTransaction, searchTokenByNameOrAddress, startLoading, stopLoading, saveUserLpTokens } from "../../../redux/actions";
import { ContractServices } from "../../../services/ContractServices";
import { ExchangeService } from "../../../services/ExchangeService";
import Button from "../../Button/Button";
import { toast } from "../../Toast/Toast";
import "./RemoveLiquidity.scss";
import { BigNumber } from "bignumber.js";
import RangeSlider from '../../../pages/Trade/RangeSlider';
import ModalCurrency from "../ModalCurrency/ModalCurrency";
import TransactionalModal from "../../TransactionalModal/TransactionalModal";
import Plusicon from "../../../assets/images/plus_ico.png";
import iconDropDown from "../../../assets/images/down-arrow.png";
import SelectCoin from "../../selectCoin/SelectCoin";


const RemoveLiquidity = (props) => {
  const dispatch = useDispatch();

  const isUserConnected = useSelector(state => state.persist.isUserConnected);
  const tokenList = useSelector(state => state.persist.tokenList);
  const deadline = useSelector(state => state.persist.deadline);
  const slippage = useSelector(state => state.persist.slippage);
  const userLpTokens = useSelector(state => state.persist.userLpTokens);

  const [modalCurrency, setModalCurrency] = useState(false);
  const [tokenOne, setTokenOne] = useState(TOKEN_LIST[0]);
  const [tokenTwo, setTokenTwo] = useState({});
  const [tokenOneValue, setTokenOneValue] = useState(0);
  const [tokenTwoValue, setTokenTwoValue] = useState(0);
  const [sharePoolValue, setSharePoolValue] = useState(100);
  const [tokenOneCurrency, setCurrencyNameForTokenOne] = useState(TOKEN_LIST[0].symbol);
  const [tokenTwoCurrency, setCurrencyNameForTokenTwo] = useState('Select a currency');
  const [tokenOneBalance, setTokenOneBalance] = useState(0);
  const [tokenTwoBalance, setTokenTwoBalance] = useState(0);
  const [tokenOneDeposit, setTokenOneDeposit] = useState(0);
  const [tokenTwoDeposit, setTokenTwoDeposit] = useState(0);

  const [liquidity, setLiquidity] = useState(0);
  const [liquidityTemp, setLiquidityTemp] = useState(0);
  const [tokenType, setTokenType] = useState('TK1');
  const [showSupplyModal, setShowSupplyModal] = useState(false);

  const [search, setSearch] = useState("");
  const [filteredTokenList, setFilteredTokenList] = useState([]);
  const [liquidityConfirmation, setLiquidityConfirmation] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState('');

  const [currentPairAddress, setCurrentPairAddress] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [txHash, setTxHash] = useState('');

  const [screenType, setScreenType] = useState(true);//detailed/simple
  const [rangeValue, setRangeValue] = useState(0);
  const [approve, setApprove] = useState(false);
  const [error, setError] = useState('Enter an amount');
  const [signedData, setSignedData] = useState(null);
  const [dl, setDl] = useState(0);
  const [receiveBNB, setReceiveBNB] = useState(true);
  const [checkBNB, setCheckBNB] = useState(false);
  const [checkSignature, setCheckSignature] = useState(true);

  const [approvalConfirmation, setApprovalConfirmation] = useState(false);

  const [symbolsArr] = useState(["e", "E", "+", "-"]);

  console.log('#'.repeat(40));
  console.log('RemoveLiquidity component');
  console.log('#'.repeat(40));

  useEffect(() => {
    setFilteredTokenList(tokenList.filter((token) => token.name.toLowerCase().includes(search.toLowerCase())));
    init();
  }, [search, tokenList, props.show]);

  const init = async () => {
    if (isUserConnected) {
      const oneBalance = await ContractServices.getBNBBalance(isUserConnected);
      setTokenOneBalance(oneBalance);

      const { lptoken } = props;
      if (lptoken) {
        setCurrentPairAddress(lptoken.pair);
        setLiquidity(lptoken.balance);
        setSharePoolValue(lptoken.poolShare);
        if (lptoken.token0Obj) {
          setTokenOne(lptoken.token0Obj);
          setCurrencyNameForTokenOne(lptoken.token0Obj.symbol);
          setTokenOneDeposit(lptoken.token0Deposit);
          let tokenBal = 0;
          if (lptoken.token0Obj.address === 'BNB') {
            tokenBal = oneBalance;
            setCheckBNB(true);
          } else {
            tokenBal = await ContractServices.getTokenBalance(lptoken.token0Obj.address, isUserConnected);
          }
          setTokenOneBalance(tokenBal);
        }
        if (lptoken.token1Obj) {
          setTokenTwo(lptoken.token1Obj);
          setCurrencyNameForTokenTwo(lptoken.token1Obj.symbol);
          setTokenTwoDeposit(lptoken.token1Deposit);
          let tokenBal = 0;
          if (lptoken.token1Obj.address === 'BNB') {
            tokenBal = oneBalance;
            setCheckBNB(true);
          } else {
            tokenBal = await ContractServices.getTokenBalance(lptoken.token1Obj.address, isUserConnected);
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
  }

  const onHandleOpenModal = (tokenType) => {
    console.log('dropdown:', tokenType);
    if (!isUserConnected) {
      return toast.error('Connect wallet first!');
    }
    setSelectedCurrency(tokenType === 'TK1' ? tokenTwoCurrency : tokenOneCurrency);
    setModalCurrency({
      modalCurrency: true,
    });
    setTokenType(tokenType);
  }
  const onHandleSelectCurrency = async (token, selecting) => {
    const { address, symbol } = token;
    if (!isUserConnected) {
      return toast.error('Connect wallet first!');
    }
    let a1, a2, oneBalance = 0, twoBalance = 0;
    if (selecting === 'TK1') {
      a1 = address;
      if (address === 'BNB') {
        oneBalance = await ContractServices.getBNBBalance(isUserConnected);
      } else {
        oneBalance = await ContractServices.getTokenBalance(address, isUserConnected);
      }
      setTokenOne(token);
      setCurrencyNameForTokenOne(symbol);
      setTokenOneBalance(oneBalance);
      if (tokenTwo.address) {
        a2 = tokenTwo.address;
      }
    }
    if (selecting === 'TK2') {
      a2 = address;
      if (address === 'BNB') {
        twoBalance = await ContractServices.getBNBBalance(isUserConnected);
      } else {
        twoBalance = await ContractServices.getTokenBalance(address, isUserConnected);
      }
      setTokenTwo(token);
      setCurrencyNameForTokenTwo(symbol);
      setTokenTwoBalance(twoBalance);
      if (tokenOne.address) {
        a1 = tokenOne.address;
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
        setLiquidity(lpTokenBalance);
        setLiquidityTemp(0);

        const totalSupply = await ContractServices.getTotalSupply(currentPairAddress);
        const ratio = lpTokenBalance / totalSupply;

        const reserves = await ExchangeService.getReserves(currentPairAddress);

        //lp deposit
        let token0Deposit = (ratio * (reserves['_reserve0'] / 10 ** tokenOne.decimals));
        let token1Deposit = (ratio * (reserves['_reserve1'] / 10 ** tokenTwo.decimals));

        setTokenOneDeposit(token0Deposit);
        setTokenTwoDeposit(token1Deposit);
      } else {
        setCurrentPairAddress('');
        setLiquidity(0);
        setLiquidityTemp(0);
        setTokenOneValue(0);
        setTokenTwoValue(0);
      }
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
  const handleLiquidityChange = (value, totalValue, type) => {
    console.log('arguments:', value, totalValue, type);
    if (value > 0) {
      if (value >= totalValue) {
        value = totalValue;
      }
      const percentage = Number(((value / totalValue) * 100).toFixed(2));
      handleChange(percentage, type, value);
    }
  };

  const handleChange2 = value => {
    if (value > 0) {
      setRangeValue(value);

      // console.log('value, tokenOneDeposit, tokenTwoDeposit', value, tokenOneDeposit, tokenTwoDeposit);

      const liquidityTemp = ((value / 100) * liquidity);
      setLiquidityTemp(liquidityTemp);

      const tokenOneValue = ((value / 100) * tokenOneDeposit);
      setTokenOneValue(tokenOneValue);

      const tokenTwoValue = ((value / 100) * tokenTwoDeposit);
      setTokenTwoValue(tokenTwoValue);

      //enable approve button
      setApprove(true);
      setError('Remove');
    } else {
      setApprove(false);
    }
  };

  const handleChange = (value, type, oldValue) => {
    if (value > 0) {
      setRangeValue(value);
      if (type === 'pair') {
        setLiquidityTemp(oldValue);
        const tokenTwoValue = ((value / 100) * tokenTwoDeposit);
        setTokenTwoValue(tokenTwoValue);
        const tokenOneValue = ((value / 100) * tokenOneDeposit);
        setTokenOneValue(tokenOneValue);
      }
      if (type === 'TK1') {
        const liquidityTemp = ((value / 100) * liquidity);
        setLiquidityTemp(liquidityTemp);
        const tokenTwoValue = ((value / 100) * tokenTwoDeposit);
        setTokenTwoValue(tokenTwoValue);
        setTokenOneValue(oldValue);
      }
      if (type === 'TK2') {
        const liquidityTemp = ((value / 100) * liquidity);
        setLiquidityTemp(liquidityTemp);
        const tokenOneValue = ((value / 100) * tokenOneDeposit);
        setTokenOneValue(tokenOneValue);
        setTokenTwoValue(oldValue);
      }

      //enable approve button
      setApprove(true);
      setError('Remove');
    } else {
      setApprove(false);
    }
  };
  //sign signature
  const approveTransaction = async () => {
    setApprove(false);
    let value = Math.floor(liquidityTemp * (10 ** 18));
    value = BigNumber(value).toFixed();

    if (rangeValue === 100) {//fixing for 100%
      value = await ContractServices.getLiquidity100Value(currentPairAddress, isUserConnected);
    }

    let dl = Math.floor((new Date()).getTime() / 1000);
    dl = dl + (deadline * 60);
    setDl(dl);

    const data = {
      owner: isUserConnected,
      spender: MAIN_CONTRACT_LIST.router.address,
      value,
      deadline: dl
    }
    try {
      const res = await ExchangeService.signRemoveTransaction(data, currentPairAddress);
      if (res.message) {
        if (res.message.indexOf('eth_signTypedData_v4') > -1) {
          setCheckSignature(false);
          setError('Remove');
          await handleTokenApproval();
          return;
        }
        if (res.message.indexOf('User denied') > -1) {
          setApprove(false);
          return toast.error('User denied for approval.');
        }
        return toast.error(res.message);
      }
      setSignedData(res);
      setError(null);
    } catch (err) {
      setApprove(true);
      setError(err.message);
    }
  };
  const confirmRemoveLiquidity = () => {
    if (!error) {
      setShowSupplyModal(true);
    }
  }
  //for non signature remove liquidity
  const handleTokenApproval = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }
    if (approvalConfirmation) {
      return toast.info('Token approval is processing');
    }
    // const value = (2*256 - 1).toString();
    const value = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const { lptoken } = props;
    if (lptoken) {
      try {
        dispatch(startLoading());
        let allowance = await ContractServices.allowanceToken(lptoken.pair, MAIN_CONTRACT_LIST.router.address, isUserConnected);
        allowance = Number(allowance);
        if (!(allowance > 0)) {
          const r = await ContractServices.approveToken(isUserConnected, value, MAIN_CONTRACT_LIST.router.address, lptoken.pair);
          if (r.message.indexOf('Rejected') > -1) {
            toast.error("User denied transaction signature.");
            setError('Remove');
            setApprove(true);
          } else if (r.code == 4001) {
            toast.error("User denied transaction signature.");
            setError('Remove');
          } else {
            setApprovalConfirmation(true);
            let data = {
              message: `Approve ${lptoken.symbol}`,
              tx: r.transactionHash
            };
            dispatch(addTransaction(data));
            setApprovalConfirmation(false);
            setError(null);
          }
        } else {
          setApprove(false);
          setError(null);
        }
        dispatch(stopLoading());
      } catch (err) {
        setApprovalConfirmation(false);
        dispatch(stopLoading());
        toast.error('Transaction Reverted!');
        setError('Error');
        setApprove(true);
      }
    }
  }
  const handleLpTokens = async () => {
    const result = userLpTokens.filter(lpToken => lpToken.pair !== props.lptoken.pair);
    dispatch(saveUserLpTokens(result));
  }
  const removeLiquidity = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }
    if (liquidityConfirmation) {
      return toast.info('Transaction is processing!');
    }
    setLiquidityConfirmation(true);
    dispatch(startLoading());

    let value = 0, checkBNB = false, token;

    if (tokenOne.address === 'BNB') {
      checkBNB = true;
      value = tokenOneValue;
      token = tokenTwo.address;
    }
    if (tokenTwo.address === 'BNB') {
      checkBNB = true;
      value = tokenTwoValue;
      token = tokenOne.address;
    }
    if (value > 0) {
      value = Math.floor(value * 10 ** 18);
      value = BigNumber(value).toFixed();
    }
    if (checkBNB) {
      let amountETHMin = BigNumber(Math.floor(Number(value) - (Number(value) * slippage / 100))).toFixed();

      let amountTokenMin = '';
      if (tokenOne.address === 'BNB') {
        let a = tokenTwoValue - (tokenTwoValue * slippage) / 100;
        a = a * 10 ** tokenTwo.decimals;
        amountTokenMin = BigNumber(Math.floor(a)).toFixed();
      }
      if (tokenTwo.address === 'BNB') {
        let a = (tokenOneValue - (tokenOneValue * slippage) / 100);
        a = a * 10 ** tokenOne.decimals;
        amountTokenMin = BigNumber(Math.floor(a)).toFixed();
      }

      let liquidity = Math.floor(liquidityTemp * (10 ** 18));
      liquidity = BigNumber(liquidity).toFixed();

      if (rangeValue === 100) { //fixing for 100%
        liquidity = await ContractServices.getLiquidity100Value(currentPairAddress, isUserConnected);
      }

      let r, s, v;
      if (signedData) {
        r = signedData.r;
        s = signedData.s;
        v = signedData.v;
      }

      const data = {
        token,
        liquidity,
        amountTokenMin,
        amountETHMin,
        to: isUserConnected,
        deadline: dl,
        value,
        approveMax: false,
        r,
        s,
        v,
        checkSignature
      };
      try {
        const result = await ExchangeService.removeLiquidityETHWithPermit(data);
        // console.log(result, 'remove liquidity transaction');
        dispatch(stopLoading());

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);
          setShowSupplyModal(false);
          if (rangeValue === 100) handleLpTokens();
          const data = {
            message: `Remove ${tokenOne.symbol} and ${tokenTwo.symbol}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
        setLiquidityConfirmation(false);
      } catch (err) {
        console.log(err);
        dispatch(stopLoading());
        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
        setLiquidityConfirmation(false);
      }
    } else {
      let amountADesired = tokenOneValue;
      let amountBDesired = tokenTwoValue;

      let amountAMin = amountADesired - (amountADesired * slippage / 100);
      let amountBMin = amountBDesired - (amountBDesired * slippage / 100);

      amountADesired = BigNumber(Math.floor(amountADesired * 10 ** tokenOne.decimals)).toFixed();
      amountBDesired = BigNumber(Math.floor(amountBDesired * 10 ** tokenTwo.decimals)).toFixed();
      amountAMin = BigNumber(Math.floor(amountAMin * 10 ** tokenOne.decimals)).toFixed();
      amountBMin = BigNumber(Math.floor(amountBMin * 10 ** tokenTwo.decimals)).toFixed();

      let liquidity = Math.floor(liquidityTemp * (10 ** 18));
      liquidity = BigNumber(liquidity).toFixed();

      if (rangeValue === 100) {//fixing for 100%
        liquidity = await ContractServices.getLiquidity100Value(currentPairAddress, isUserConnected);
      }

      let r, s, v;
      if (signedData) {
        r = signedData.r;
        s = signedData.s;
        v = signedData.v;
      }

      const data = {
        tokenA: tokenOne.address,
        tokenB: tokenTwo.address,
        liquidity,
        amountAMin,
        amountBMin,
        to: isUserConnected,
        deadline: dl,
        value,
        approveMax: false,
        r,
        s,
        v,
        checkSignature
      };

      try {
        const result = await ExchangeService.removeLiquidityWithPermit(data);
        // console.log(result, 'remove liquidity transaction');

        dispatch(stopLoading());
        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);
          setShowSupplyModal(false);
          if (rangeValue === 100) handleLpTokens();
          const data = {
            message: `Remove ${tokenOne.symbol} and ${tokenTwo.symbol}`,
            tx: result
          };
          dispatch(addTransaction(data));
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
  }

  const calculateFractionRow = (tokenType) => {
    let r = 0;
    let symbol1 = tokenOne.symbol, symbol2 = tokenTwo.symbol;
    if (symbol1 === 'BNB') {
      if (receiveBNB) {
        symbol1 = 'BNB';
      } else {
        symbol1 = 'WBNB';
      }
    }
    if (symbol2 === 'BNB') {
      if (receiveBNB) {
        symbol2 = 'BNB';
      } else {
        symbol2 = 'WBNB';
      }
    }
    if (tokenType === 'TK1') {
      if (tokenOneDeposit === 0) return 0;
      r = (tokenTwoDeposit / tokenOneDeposit);
      r = Number(r.toFixed(5));

      return <>1 {symbol1} = {r} {symbol2}</>
    }
    if (tokenType === 'TK2') {
      if (tokenTwoDeposit === 0) return 0;
      r = (tokenOneDeposit / tokenTwoDeposit);
      r = Number(r.toFixed(5));
      return <>1 {symbol2} = {r} {symbol1}</>
    }
  }

  useEffect(() => {

  }, [tokenTwoValue])


  return (
    <Modal
      scrollable={true}
      className="selectCurrency_modal removeLiq_Modal"
      show={props.show}
      onHide={props.handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Remove Liquidity</Modal.Title>
      </Modal.Header>
      <div className="tokenName">
        <hr />
      </div>
      <Modal.Body>
        <Col className="removeAmnt comnBrdr">
          <h6 className="d-flex">
            Amount <span className="ms-auto" onClick={() => setScreenType(!screenType)}>{screenType ? 'Detailed' : 'Simple'}</span>
          </h6>

          {screenType ?
            <>
              <div class="slidecontainer">
                {/* <input type="range" className="slider" /> */}
                <RangeSlider rangeValue={rangeValue} handleChange={handleChange2} />
              </div>

              <div className="amountSelect">
                <button type="button" onClick={() => handleChange2(25)}>25%</button>
                <button type="button" className="mx-1" onClick={() => handleChange2(50)}>50%</button>
                <button type="button" className="me-1" onClick={() => handleChange2(75)}>75%</button>
                <button type="button" onClick={() => handleChange2(100)}>Max</button>
              </div>
            </>
            :
            <h2>
              {rangeValue} %
            </h2>}
        </Col>

        {screenType ?
          <>
            <Col className="text-center downArrow">
              <img src={DownArrow} alt="down_icon" />
            </Col>


            <Col className="receiveAmnt comnBrdr">
              <ul className="text-start">
                <li>{tokenOneValue.toFixed(5)}</li>
                <li>{tokenTwoValue.toFixed(5)}</li>
              </ul>
              <ul className="text-end leftSide">
                <li>
                  {/* <img src={NiobIcon} alt="coin_icon" /> */}
                  {tokenOne.symbol}
                </li>
                <li>
                  {/* <img src={BnbIcon} alt="coin_icon" /> */}
                  {tokenTwo.symbol}
                </li>
                {checkBNB && <h6 className="text-end"><span onClick={() => setReceiveBNB(!receiveBNB)}>{receiveBNB ? 'Receive WBNB' : 'Receive BNB'}</span></h6>}
              </ul>
            </Col>
          </>
          :
          <>
            {currentPairAddress && <Col className={`selectCoin_style ${props.className}`}>
              <Row className="mx-0">
                <Col className="selectCoin_left_style">
                  <label>Input</label>
                  <input
                    type="number"
                    onKeyDown={(evt) => { symbolsArr.includes(evt.key) && evt.preventDefault() }}
                    onChange={(e) => handleLiquidityChange(Number(e.target.value), liquidity, 'pair')} min={0}
                    placeholder="0.0"
                    value={liquidityTemp}
                    min={0}
                    minLength={1}
                    maxLength={79}
                    autoCorrect="off"
                    autoComplete="off"
                  />
                </Col>
                <Col className="selectCoin_right_style">
                  <label>Balance: {liquidity}</label>
                  <Col className="select_buttonStyle">
                    <button onClick={props.onClick}>
                      {props.max && <strong onClick={props.onMax}>MAX</strong>}

                      <div> {props.coinImage && <img src={props.coinImage} className="coin_Img" />}
                        <strong style={{ fontSize: props.selectTokenText ? "" : "" }}>
                          {props.value}
                        </strong></div>
                      <img className="selectDropDownStyle" src={tokenOne.icon} />
                      <img className="selectDropDownStyle" src={tokenTwo.icon} />
                      <span className="currencyName_textStyle">{tokenOne.symbol}:{tokenTwo.symbol}</span>

                    </button>
                  </Col>
                </Col>
              </Row>
            </Col>
            }


            <Col className="text-center downArrow">
              <img src={DownArrow} alt="down_icon" />
            </Col>

            {<SelectCoin
              label={`Balance: ${tokenOneBalance}`}
              coinImage={tokenOne?.icon}
              value={tokenOneCurrency}
              onClick={() => onHandleOpenModal('TK1')}
              inputLabel="Output"
              className="mb-0"
              placeholder="0.0"
              onChange={(e) => handleLiquidityChange(Number(e.target.value), tokenOneDeposit, 'TK1')}
              max={false}
              defaultValue={tokenOneValue}
            />}

            <Col className="text-center downArrow">
              <img src={Plusicon} alt="down_icon" />
            </Col>

            {<SelectCoin
              label={`Balance: ${tokenTwoBalance}`}
              coinImage={tokenTwo?.icon}
              value={tokenTwoCurrency}
              onClick={() => onHandleOpenModal('TK2')}
              inputLabel="Output"
              className="mb-0"
              placeholder="0.0"
              onChange={(e) => handleLiquidityChange(Number(e.target.value), tokenTwoDeposit, 'TK2')}
              max={false}
              defaultValue={tokenTwoValue}
            />}
          </>
        }

        <Col className="totalPrice">
          <ul className="text-start">
            <li>Price:</li>
          </ul>
          <ul className="text-end">
            <li>1 NIOB = 0.00035815 BNB</li>
            <li>1 BNB = 3870.84 NIOB</li>
          </ul>
        </Col>
        <Col className="btnCol">
          <Button className="approveBtn" title="Approve" onClick={() => approveTransaction()} disabled={!approve} />
          <Button className="approveBtn" title={error ? error : 'Remove'} onClick={() => confirmRemoveLiquidity()} disabled={error} />
        </Col>

        <ModalCurrency
          show={modalCurrency}
          tokenList={filteredTokenList}
          handleClose={() => setModalCurrency(!modalCurrency)}
          selectCurrency={onHandleSelectCurrency}
          searchToken={handleSearchToken}
          searchByName={setSearch}
          tokenType={tokenType}
          currencyName={selectedCurrency}
        />
        <ModalCurrency
          show={modalCurrency}
          tokenList={filteredTokenList}
          handleClose={() => setModalCurrency(!modalCurrency)}
          selectCurrency={onHandleSelectCurrency}
          searchToken={handleSearchToken}
          searchByName={setSearch}
          tokenType={tokenType}
          currencyName={selectedCurrency}
        />

        {/* Approve confirm Modal Start */}
        <Modal centered scrollable={true} className="connect_wallet" show={showSupplyModal} onHide={() => setShowSupplyModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>You will receive</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col className="baseToken_style">
                <ul>
                  <li>
                    <div className="row">
                      <h2>{tokenOneValue.toFixed(5)}</h2>
                      <span>
                        <img src={tokenOne.icon} alt="icon" />
                        <h2>{tokenOne.symbol}</h2>
                      </span>
                    </div>
                    <div className="row">
                      <h2 className="plus">+</h2>
                    </div>
                    <div className="row">
                      <h2>{tokenTwoValue.toFixed(5)}</h2>
                      <span>
                        <img src={tokenTwo.icon} alt="icon" />
                        <h2>{tokenTwo.symbol}</h2>
                      </span>
                    </div>
                    <p>Output is estimated. If the price changes by more than {slippage}% your transaction will revert.</p>
                  </li>
                  <li>
                    <li>{tokenOneCurrency} Deposit: <span> {tokenOneValue}</span></li>
                    <li>{tokenTwoCurrency} Deposit:<span>{tokenTwoValue}</span> </li>
                    <li>Price
                      <p>{1}&nbsp;{tokenOneCurrency} = {calculateFractionRow('TK1')} <br />
                        {1}&nbsp;{tokenTwoCurrency} = {calculateFractionRow('TK2')}</p></li>
                  </li>
                  
                    <Button title={isUserConnected ? 'Confirm' : 'Unlock Wallet'}
                      className="remove_liq_btn"
                      disabled={liquidityConfirmation} onClick={() => removeLiquidity()}
                    />
                  
                </ul>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
        {/* Approve confirm Modal End */}

        {showTransactionModal && <TransactionalModal closeTransactionModal={closeTransactionModal} txHash={txHash} />}

        {currentPairAddress &&
          <Col className="totalPrice">
            <ul className="text-start">
              <li> <h4>LP TOKENS IN YOUR WALLET</h4> </li>
            </ul>
            <ul className="text-end">
              <li><p><img src={tokenOne.icon} alt="icon" /> <img src={tokenTwo.icon} alt="icon" /> {tokenOne.symbol}/{tokenTwo?.symbol}</p> <span>{liquidity}</span></li>
              <li><p>{tokenOne.symbol}: </p><span>{tokenOneDeposit.toFixed(5)} </span></li>
              <li><p>{tokenTwo?.symbol}:</p> <span>{tokenTwoDeposit.toFixed(5)}</span></li>
            </ul>
          </Col>}

      </Modal.Body>
    </Modal>
  );
};

export default RemoveLiquidity;
