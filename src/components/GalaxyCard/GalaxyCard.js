import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import "../PlanetCard/PlanetCard.scss";
// import RightArrow from "../../assets/images/right-arrow.png";
import DownArrow from "../../assets/images/down-arrow.png";
import Schdule from "../../assets/images/schdule.png";
import ButtonPrimary from "../Button/Button";
import "./GalaxyCard.scss";
import { useDispatch, useSelector } from "react-redux";
import { FarmService } from "../../services/FarmService";
import { ExchangeService } from "../../services/ExchangeService";
import { ContractServices } from "../../services/ContractServices";
import { MAIN_CONTRACT_LIST, TOKEN_LIST, WETH, ANCHOR_BUSD_LP, BNB_BUSD_LP } from "../../assets/tokens";
import { BigNumber } from "bignumber.js"
import { toast } from "../Toast/Toast";
import { addTransaction, startLoading, stopLoading } from "../../redux/actions";
import { addCommas } from "../../constant";
import ConnectWallet from "../ConnectWallet/ConnectWallet";

const GalaxyCard = (props) => {
  const isUserConnected = useSelector(state => state.persist.isUserConnected);
  const [classToggle, setClassToggle] = useState(false);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [show1, setShow1] = useState(false);
  const handleClose1 = () => setShow1(false);
  const handleShow1 = () => setShow1(true);

  const dispatch = useDispatch();
  const { farm: { poolInfo, userInfo, pid, niobId, isLocked, dollarVal }, index, currentIndex, handleChange,
    harvestOnClick, stakeHandle, handleRoiModal, status } = props;

  const [lpTokenDetails, setLpTokenDetails] = useState(null);
  const [showIncrease, setShowIncrease] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [tokenStaked, setTokenStaked] = useState(0);
  const [liquidity, setLiquidity] = useState(0);
  const [showApproveButton, setShowApproveButton] = useState(true);
  const [approvalConfirmation, setApprovalConfirmation] = useState(false);
  const [showHarvest, setShowHarvest] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stakeAmounts, setStakeAmounts] = useState({ amount: 0, rewards: 0 });
  const [pantherAddress, setPantherAddress] = useState('');
  const [apr, setApr] = useState(0);
  const [roi, setROI] = useState({ allocPoint: 0, totalAllcationPoint: 0, anchorPerBlock: 0, anchorPrice: 0, liquidity: 0, lpWorth: 0 });
  const [dollarValue, setAnchorDollarValue] = useState(0.01);
  const [stakedDollarValue, setStakedDollarValue] = useState(0);

  useEffect(() => {
    init();
    getPantherAddress();
    getAnchorDollarValue();
  }, [isUserConnected]);
  const getPantherAddress = async () => {
    const res = await FarmService.poolInfoo();
    setPantherAddress(res);
  }
  const getAnchorDollarValue = async () => {
    if (poolInfo.lpToken != undefined) {
      try {

        if (poolInfo.lpToken.toLowerCase() === TOKEN_LIST[1].address.toLowerCase()) {
          const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
          let val = reserves[1] / reserves[0];
          val = val || 0;
          setAnchorDollarValue(val.toFixed(3));
          return (val.toFixed(3));
        }
        else if (poolInfo.lpToken.toLowerCase() != TOKEN_LIST[2].address.toLowerCase()) {

          const pair = await ExchangeService.getPairFromPancakeFactory(poolInfo.lpToken, TOKEN_LIST[2].address);
          const reserves = await ExchangeService.getReserves(pair);
          let val = reserves[1] / reserves[0];
          val = val || 0;
          setAnchorDollarValue(val.toFixed(3));
          return (val.toFixed(3));
        }

      } catch (error) {
        console.log(error)
      }
    }

  }

  const getDollarAPR = async (address) => {
    if (poolInfo.lpToken != undefined) {
      try {

        if (address.toLowerCase() === TOKEN_LIST[1].address.toLowerCase()) {
          const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
          let val = reserves[1] / reserves[0];
          val = val || 0;
          setAnchorDollarValue(val.toFixed(3));
          return (val.toFixed(3));
        }
        else if (address.toLowerCase() != TOKEN_LIST[2].address.toLowerCase()) {

          const pair = await ExchangeService.getPairFromPancakeFactory(address, TOKEN_LIST[2].address);
          const reserves = await ExchangeService.getReserves(pair);
          let val = reserves[1] / reserves[0];
          val = val || 0;
          setAnchorDollarValue(val.toFixed(3));
          return (val.toFixed(3));
        }

      } catch (error) {
        console.log(error)
      }
    }

  }

  const init = async () => {
    if (poolInfo) {
      const { lpToken } = poolInfo;
      if (lpToken) {
        const totalSupplyTemp = await ContractServices.getTotalSupply(lpToken);
        setTotalSupply(totalSupplyTemp);
        const tokenAmount = await ExchangeService.getTokenStaked(lpToken);
        setTokenStaked(tokenAmount);
        let price = 0;
        if (lpToken.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
          price = 1
        } else {
          const tokenPairUSDT = await ExchangeService.getPair(lpToken, TOKEN_LIST[2].address);
          price = await calPrice(tokenPairUSDT);
        }
        let liq;
        if (poolInfo.lpToken.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
          liq = (tokenAmount * 1);
        } else {
          const dv = await getAnchorDollarValue();
          liq = (tokenAmount * dv);
        }
        setLiquidity(liq);
        const lpTokenDetailsTemp = await FarmService.getPoolTokenDetails(lpToken);
        const a = await calculateAPR(Number(poolInfo.allocPoint), lpToken, liquidity);
        // console.log('=====', pid, poolInfo.allocPoint, lpToken, liquidity);



        if (pid == niobId) {
          const a = await calculateAPR(Number(poolInfo.allocPoint), lpToken, liquidity);
          setApr(a * 10.5537)
        } else {
          setApr(a);
        }



        // setApr(a);
        lpTokenDetailsTemp.apr = a;
        setLpTokenDetails(lpTokenDetailsTemp);
        if (isUserConnected) {
          const allowance = await ContractServices.allowanceToken(lpToken, MAIN_CONTRACT_LIST.farm.address, isUserConnected);
          let check = true;
          if (BigNumber(allowance).isGreaterThanOrEqualTo(BigNumber(2 * 255 - 1))) {
            setShowApproveButton(false);
            check = false;
          }

          let balance = await ContractServices.getTokenBalance(lpToken, isUserConnected);
          if (balance > 0.00001) {
            balance -= 0.00001;
          }
          setBalance(balance);

          const amount = Number((Number(userInfo.amount) / 10 ** Number(lpTokenDetailsTemp.decimals)).toFixed(5));
          const price = await handleStakeDollarValue(amount, lpToken);
          const rewards = Number((Number(await FarmService.pendingPanther(pid, isUserConnected) / 10 ** 18).toFixed(5)));
          if (!check && amount > 0) {
            setShowIncrease(true);
          }
          setStakeAmounts({ amount, rewards });

          setStakedDollarValue(price);


          //nextHarvest
          const nextHarvestUntil = await FarmService.canHarvest(pid, isUserConnected);
          if (!check && rewards > 0 && Number(userInfo.nextHarvestUntil) > 0 && nextHarvestUntil) {
            setShowHarvest(true);
          }
        }
      }
    }
  };

  const handleTokenApproval = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }
    if (approvalConfirmation) {
      return toast.info('Token approval is processing');
    }
    // (2*256 - 1);
    const value = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    try {
      dispatch(startLoading());
      setApprovalConfirmation(true);
      const r = await ContractServices.approveToken(isUserConnected, value, MAIN_CONTRACT_LIST.farm.address, poolInfo.lpToken);
      if (r) {
        let data = {
          message: `Approve LP Token`,
          tx: r.transactionHash
        };
        dispatch(addTransaction(data));
        setApprovalConfirmation(false);
        init();
      }
      dispatch(stopLoading());
    } catch (err) {
      setApprovalConfirmation(false);
      dispatch(stopLoading());
      toast.error('Approval Transaction Reverted!');
    }
  }

  const beforeStake = async (type, isLocked) => {
    if (isUserConnected) {
      let bal = 0;
      if (type === 'deposit') {
        bal = balance;
      }
      if (type === 'withdraw') {
        bal = stakeAmounts.amount;
      }
      stakeHandle({ pid, poolInfo, lpTokenDetails, balance: bal, niobId, isLocked }, type);
    } else {
      return toast.error('Connect wallet first!');
    }
  }

  const calPrice = async (pairAddress) => {
    let price = 0;

    if (pairAddress == "0x0000000000000000000000000000000000000000") {
      return 0;
    }

    const tokenZero = await ExchangeService.getTokenZero(pairAddress);
    const tokenOne = await ExchangeService.getTokenOne(pairAddress);
    const reserve = await ExchangeService.getReserves(pairAddress);
    const decimalZero = await ContractServices.getDecimals(tokenZero);
    const decimalOne = await ContractServices.getDecimals(tokenOne);

    if (tokenZero.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
      return price = ((reserve[0] * (10 ** decimalOne)) / (reserve[1] * (10 ** decimalZero)));
    }

    if (tokenOne.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
      return price = ((reserve[1] * (10 ** decimalZero)) / (reserve[0] * (10 ** decimalOne)));
    }

    let priceBNBToUSD = await calPrice(BNB_BUSD_LP);
    if (tokenZero.toLowerCase() === WETH.toLowerCase()) {
      price = ((reserve[0] * (10 ** decimalOne)) / (reserve[1] * (10 ** decimalZero)));
      return (price * priceBNBToUSD);
    }

    if (tokenOne.toLowerCase() === WETH.toLowerCase()) {
      price = ((reserve[1] * (10 ** decimalZero)) / (reserve[0] * (10 ** decimalOne)));
      return (price * priceBNBToUSD);
    }
  }

  const calculateAPR = async (allocPoint, lpToken, lpWorth) => {

    const anchorPrice = await calPrice(ANCHOR_BUSD_LP);
    const totalAllcationPoint = Number(await FarmService.totalAllocationPoint());
    const anchorPerBlock = Number(await FarmService.pantherPerBlock());
    //need to calculate usd price.
    const liquidity = await handleLiquidity(lpToken);
    console.log("ANCHOR PRICE:", anchorPrice);
    console.log("liquidityliquidity:", liquidity);
    if (liquidity != 0) {
      const apr = ((allocPoint / totalAllcationPoint) * ((anchorPerBlock / 10 ** 18) * 28800 * 365 * 100 * anchorPrice)) / liquidity;
      setROI({ allocPoint, totalAllcationPoint, anchorPerBlock, anchorPrice, liquidity, lpWorth });

      return apr;
    }

    return 0;
  }
  const handleLiquidity = async (tokenAddress) => {

    if (tokenAddress != "0x0000000000000000000000000000000000000000") {

      const reserve = await ExchangeService.getTokenStaked(tokenAddress);
      const tokenPairUSDT = await ExchangeService.getPair(tokenAddress, TOKEN_LIST[2].address);
      const tokenPairBNB = await ExchangeService.getPair(tokenAddress, WETH);

      let priceA = 0;

      if (tokenAddress.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
        priceA = 1;
      } else if (tokenAddress.toLowerCase() == WETH.toLowerCase()) {
        priceA = await getDollarAPR(tokenAddress);
      }

      if (priceA == 0) {
        if (tokenPairUSDT != "0x0000000000000000000000000000000000000000") {
          priceA = await getDollarAPR(tokenAddress);
        } else if (tokenPairBNB != "0x0000000000000000000000000000000000000000") {
          priceA = await getDollarAPR(tokenAddress);
          priceA = 0;
        }
      }

      const liquidity = (reserve * priceA);

      return Number(liquidity).toFixed(2);
    }
    return 0;
  }
  const handleIcon = (lpTokenName) => {
    if (lpTokenName != undefined) {
      const tokenObj = TOKEN_LIST.find(
        (d) => d.symbol.toLowerCase() === lpTokenName.toLowerCase()
      );
      return tokenObj?.icon;
    }

  }
  const earnedDollarValue = (dollarValue, rewards) => {

    let fixedAfterDecimal = Number((dollarValue * rewards)).toFixed(6);
    let res = addCommas(fixedAfterDecimal);
    return res;
  }

  const handleStakeDollarValue = async (stakedAmount, lpToken) => {
    const pairAddress = await ExchangeService.getPair(lpToken, TOKEN_LIST[2].address);
    let price;
    if (lpToken.toLowerCase() === TOKEN_LIST[2].address) {
      price = 1;
    } else {
      price = await calPrice(pairAddress);
    }
    const dollarPrice = stakedAmount * price;
    return dollarPrice;
  }

  return (
    <>
      <Button
        className={`planet_bar glaxy_bar`}
        onClick={() => setClassToggle(!classToggle)}
      >
        <div className="cions">
          <span className="coin_imgs uppr">
            <img src={handleIcon(lpTokenDetails?.lpTokenName) ? handleIcon(lpTokenDetails?.lpTokenName) : null} />
          </span>
          <span className="coin_title glxy_token"><span className="title_nm">Token</span>{lpTokenDetails?.lpTokenName} {isLocked ? "(Lock)" : ""}</span>
        </div>

        <div className="coin_detail">
          <div className="d-flex align-items-center">
            <div className="prcentx">{poolInfo?.displayAllocPoint ? poolInfo?.displayAllocPoint : poolInfo?.allocPoint}X</div>
            <img className="QrIcon" src={Schdule} onClick={() => handleRoiModal(roi, lpTokenDetails, pid)} />
            <div className="apr">
              <span>APR</span>
              <p>{addCommas(apr.toFixed(2))}%</p>
            </div>
          </div>
          <div className="lqdty">
            <span>Liquidity</span>
            <p>${addCommas(liquidity.toFixed(2))}</p>
          </div>
          <div className="erndniob">
            <span>Earned NIOB</span>
            <p>{stakeAmounts.rewards !== NaN ? addCommas(stakeAmounts.rewards) : "0.00"}</p>
            <p>$ {stakeAmounts.rewards !== NaN ? earnedDollarValue(dollarVal, stakeAmounts.rewards) : "0.00"}</p>
          </div>
        </div>
        <div className="dtl_btn">
          <p>
            Details{" "}
            <span>
              <img src={DownArrow} />
            </span>
          </p>
        </div>
      </Button>
      <div className={classToggle ? "planet_strip" : "d-none"}>
        <div className="stakedValue">
          <div className="d-flex comnDiv">
            <div className="stkd_title">
              <h6>Total Staked:</h6>
              <h6>Stake:</h6>
              <h6>Deposit Fee:</h6>
            </div>
            <div className="boldTxt">
              <h6>{addCommas(tokenStaked.toFixed(2))}</h6>
              <h6>{lpTokenDetails?.lpTokenName}</h6>
              <h6>{poolInfo.depositFeeBP ? (Number(poolInfo.depositFeeBP) / 10000) * 100 : 0}%</h6>
            </div>
          </div>
          <div className="d-flex comnDiv">
            <div className="stkd_title">
              <h6>Staked Dollar Value:</h6>
              <h6>Earned Value:</h6>
              <h6>Harvest Interval:</h6>
            </div>
            <div className="boldTxt">
              <h6>${stakedDollarValue ? addCommas(stakedDollarValue.toFixed(9)) : 0}</h6>
              <h6>$ {stakeAmounts.rewards !== NaN ? earnedDollarValue(dollarVal, stakeAmounts.rewards) : "0.00"}</h6>
              <h6>{poolInfo.harvestInterval ? Number(((poolInfo.harvestInterval) / 3600).toFixed(2)) : 0} Hour(s)</h6>
            </div>
          </div>
          <div className="vwdoc_btn">
            <div className="linksTxt">
              <a href="#">View on BscScan</a>
              <a href="#">View Project Site</a>
            </div>
            <div className="available_funds">
              <div className="funds">
                {isUserConnected ? (
                  <>
                    {showIncrease ? (
                      <div className="cardFarm_increase">
                        <button
                          type="button"
                          onClick={() => beforeStake("withdraw", isLocked)}
                        >
                          <span>-</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => beforeStake("deposit", isLocked)}
                        >
                          <span>+</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {showApproveButton ? (
                          <Button
                            className="funds_btn"
                            onClick={() => handleTokenApproval()}
                          >
                            Enable Pool
                          </Button>
                        ) : (
                          <Button
                            className="funds_btn"
                            onClick={() => beforeStake("deposit")}
                          >
                            Stake
                          </Button>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      className="unlockWallet_Btn"
                      onClick={() => handleShow1()}
                    >
                      Unlock Wallet
                    </Button>
                  </>
                )}
                <ButtonPrimary className="unlockWallet_Btn"
                  onClick={() => {
                    setShowHarvest(false);
                    harvestOnClick(pid, lpTokenDetails?.lpTokenName);
                  }} title="Harvest"
                  disabled={!showHarvest} />

              </div>
            </div>

            {/* <ButtonPrimary className="unlockWallet_Btn" onClick={()=> handleShow(true)} title="Unlock Wallet" /> */}
          </div>
        </div>
      </div>
      <ConnectWallet show={show1} handleShow={handleShow1} handleClose={handleClose1} />

    </>
  );
};

export default GalaxyCard;


