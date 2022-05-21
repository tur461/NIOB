import React, { useEffect, useState } from "react";
import ButtonCustom from "../Button/Button";
import { Button } from "react-bootstrap";
import "./PlanetCard.scss";
import RightArrow from "../../assets/images/right-arrow.png";
import DownArrow from "../../assets/images/down-arrow.png";
import { useDispatch, useSelector } from "react-redux";
import { ExchangeService } from "../../services/ExchangeService";
import {
  MAIN_CONTRACT_LIST,
  WETH,
  ANCHOR_BUSD_LP,
  TOKEN_LIST,
  BNB_BUSD_LP,
} from "../../assets/tokens";
import { ContractServices } from "../../services/ContractServices";
import { FarmService } from "../../services/FarmService";
import { BigNumber } from "bignumber.js";
import { toast } from "../Toast/Toast";
import { addTransaction, startLoading, stopLoading } from "../../redux/actions";
import { addCommas } from "../../constant";
import NIOB from "../../assets/images/token_icons/NIOB.svg";

const PlanetCard = (props) => {
  const [classToggle, setClassToggle] = useState(false);

  const dispatch = useDispatch();
  const isUserConnected = useSelector((state) => state.persist.isUserConnected);
  const {
    farm: { poolInfo, userInfo, pid },
    index,
    currentIndex,
    handleChange,
    harvestOnClick,
    stakeHandle,
    handleRoiModal,
    status,
  } = props;

  const [lpTokenDetails, setLpTokenDetails] = useState(null);
  const [showIncrease, setShowIncrease] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [liquidity, setLiquidity] = useState(0);
  const [worth, setWorth] = useState(0);
  const [showApproveButton, setShowApproveButton] = useState(true);
  const [approvalConfirmation, setApprovalConfirmation] = useState(false);
  const [showHarvest, setShowHarvest] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stakeAmounts, setStakeAmounts] = useState({ amount: 0, rewards: 0 });
  const [apr, setApr] = useState(0);
  const [roi, setROI] = useState({
    allocPoint: 0,
    totalAllcationPoint: 0,
    anchorPerBlock: 0,
    anchorPrice: 0,
    liquidity: 0,
    lpWorth: 0,
  });
  const [dollarValue, setAnchorDollarValue] = useState(0.01);

  const getAnchorDollarValue = async () => {

    if (poolInfo.lpToken != undefined) {
      try {
        let reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
        // const token0 = await ExchangeService.getTokenZero(poolInfo.lpToken);
        // const token1 = await ExchangeService.getTokenOne(poolInfo.lpToken);

        // if ((token0.toLowerCase() === TOKEN_LIST[1].address.toLowerCase()) || (token1.toLowerCase() === TOKEN_LIST[1].address.toLowerCase())) {
        //   reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
        // } else {

        //   //const pair = await ExchangeService.getPairFromPancakeFactory(poolInfo.lpToken);
        //   reserves = await ExchangeService.getReserves(poolInfo.lpToken);
        // }

        let val = reserves[1] / reserves[0];
        val = val || 0;
        setAnchorDollarValue(val.toFixed(3));
        return (val.toFixed(3));

      } catch (error) {
        console.log(error)
      }
    }
  };

  const getDollarAPR = async (address) => {
    try {

      if (address.toLowerCase() === TOKEN_LIST[1].address.toLowerCase()) {
        const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
        let val = reserves[1] / reserves[0];
        val = val || 0;
        setAnchorDollarValue(val.toFixed(3));
        return (val.toFixed(3));
      } else if (address.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
        return 1;
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

  const init = async () => {
    if (poolInfo) {
      // console.log("Pool Info:", poolInfo);
      const { lpToken } = poolInfo;
      if (lpToken) {
        const totalSupplyTemp = await ContractServices.getTotalSupply(lpToken);
        setTotalSupply(totalSupplyTemp);
        const liquidity = await handleLiquidity(lpToken);
        setLiquidity(liquidity);
        const tokenStaked = await ExchangeService.getTokenStaked(lpToken);
        const lpWorth = liquidity / tokenStaked;
        setWorth(lpWorth);
        const lpTokenDetailsTemp = await FarmService.getLpTokenDetails(lpToken);
        setLpTokenDetails(lpTokenDetailsTemp);

        const a = await calculateAPR(
          Number(poolInfo.allocPoint),
          lpToken,
          liquidity
        );
        lpTokenDetailsTemp.apr = a;
        setApr(a);

        if (isUserConnected) {
          const allowance = await ContractServices.allowanceToken(
            lpToken,
            MAIN_CONTRACT_LIST.farm.address,
            isUserConnected
          );
          let check = true;
          if (
            BigNumber(allowance).isGreaterThanOrEqualTo(BigNumber(2 * 255 - 1))
          ) {
            setShowApproveButton(false);
            check = false;
          }

          let balance = await ContractServices.getTokenBalance(
            poolInfo.lpToken,
            isUserConnected
          );
          if (balance > 0.00001) {
            balance -= 0.00001;
          }
          setBalance(balance);
          const amount = userInfo.amount / 10 ** lpTokenDetailsTemp.decimals
          // const amount = Number(
          //   (
          //     Number(userInfo.amount) /
          //     10 ** Number(lpTokenDetailsTemp.decimals)
          //   )
          // ).toFixed(18)

          const rewards = Number(
            Number(
              (await FarmService.pendingPanther(pid, isUserConnected)) /
              10 ** 18
            ).toFixed(5)
          );
          if (!check && amount > 0) {
            setShowIncrease(true);
          }
          setStakeAmounts({ amount, rewards });

          //nextHarvest
          const nextHarvestUntil = await FarmService.canHarvest(
            pid,
            isUserConnected
          );
          if (
            !check &&
            rewards > 0 &&
            Number(userInfo.nextHarvestUntil) > 0 &&
            nextHarvestUntil
          ) {
            setShowHarvest(true);
          }
        }
      }
    }
  };
  //call web3 approval function
  const handleTokenApproval = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error("Wallet address doesn`t match!");
    }
    if (approvalConfirmation) {
      return toast.info("Token approval is processing");
    }
    // (2*256 - 1);
    const value =
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

    try {
      dispatch(startLoading());
      setApprovalConfirmation(true);
      const r = await ContractServices.approveToken(
        isUserConnected,
        value,
        MAIN_CONTRACT_LIST.farm.address,
        poolInfo.lpToken
      );
      if (r) {
        let data = {
          message: `Approve LP Token`,
          tx: r.transactionHash,
        };
        dispatch(addTransaction(data));
        setApprovalConfirmation(false);
        init();
      }
      dispatch(stopLoading());
    } catch (err) {
      setApprovalConfirmation(false);
      dispatch(stopLoading());
      toast.error("Approval Transaction Reverted!");
    }
  };

  const beforeStake = async (type) => {
    if (isUserConnected) {
      let bal = 0;
      if (type === "deposit") {
        bal = balance;
      }
      if (type === "withdraw") {
        bal = stakeAmounts.amount;
      }
      stakeHandle({ pid, poolInfo, lpTokenDetails, balance: bal }, type);
    } else {
      return toast.error("Connect wallet first!");
    }
  };

  const calPrice = async (pairAddress) => {
    let price = 0;

    if (pairAddress == "0x0000000000000000000000000000000000000000") {
      return 0;
    }

    // console.log("pairAddresspairAddress", pairAddress);
    const tokenZero = await ExchangeService.getTokenZero(pairAddress);
    const tokenOne = await ExchangeService.getTokenOne(pairAddress);
    const reserve = await ExchangeService.getReserves(pairAddress);
    const decimalZero = await ContractServices.getDecimals(tokenZero);
    const decimalOne = await ContractServices.getDecimals(tokenOne);

    // console.log(tokenZero, TOKEN_LIST[2].address);

    if (tokenZero.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
      return (price =
        (reserve[0] * 10 ** decimalOne) / (reserve[1] * 10 ** decimalZero));
    }

    if (tokenOne.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
      return (price =
        (reserve[1] * 10 ** decimalZero) / (reserve[0] * 10 ** decimalOne));
    }

    let priceBNBToUSD = await calPrice(BNB_BUSD_LP); //replace with BNB-USD pair
    if (tokenZero.toLowerCase() === WETH.toLowerCase()) {
      price =
        (reserve[0] * 10 ** decimalOne) / (reserve[1] * 10 ** decimalZero);
      return price * priceBNBToUSD;
    }

    if (tokenOne.toLowerCase() === WETH.toLowerCase()) {
      price =
        (reserve[1] * 10 ** decimalZero) / (reserve[0] * 10 ** decimalOne);
      return price * priceBNBToUSD;
    }
  };

  const calculateAPR = async (allocPoint, lpToken, lpWorth) => {
    const anchorPrice = await calPrice(ANCHOR_BUSD_LP);
    const totalAllcationPoint = Number(
      await FarmService.totalAllocationPoint()
    );
    const anchorPerBlock = Number(await FarmService.pantherPerBlock());
    //need to calculate usd price.
    const liquidity = await handleLiquidity(lpToken);
    // console.log("liquidity: ", liquidity);
    if (liquidity != 0) {
      const apr =
        ((allocPoint / totalAllcationPoint) *
          ((anchorPerBlock / 10 ** 18) * 28800 * 365 * 100 * anchorPrice)) /
        liquidity;
      setROI({
        allocPoint,
        totalAllcationPoint,
        anchorPerBlock,
        anchorPrice,
        liquidity,
        lpWorth,
      });

      return apr.toFixed(2);
    }

    return 0;
  };
  const handleLiquidity = async (pairAddress) => {
    if (pairAddress != "0x0000000000000000000000000000000000000000") {
      const tokenZero = await ExchangeService.getTokenZero(pairAddress);
      const tokenOne = await ExchangeService.getTokenOne(pairAddress);
      const reserve = await ExchangeService.getReserves(pairAddress);

      const tokenZeroPairUSDT = await ExchangeService.getPair(
        tokenZero,
        TOKEN_LIST[2].address
      );
      const tokenOnePairUSDT = await ExchangeService.getPair(
        tokenOne,
        TOKEN_LIST[2].address
      );

      const tokenZeroPairBNB = await ExchangeService.getPair(tokenZero, WETH);
      const tokenOnePairBNB = await ExchangeService.getPair(tokenOne, WETH);

      const decimalZero = await ContractServices.getDecimals(tokenZero);
      const decimalOne = await ContractServices.getDecimals(tokenOne);

      let priceA = await getDollarAPR(tokenZero);
      let priceB = await getDollarAPR(tokenOne);



      // if (tokenZero.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
      //   priceA = 1;
      // } else if (tokenZero.toLowerCase() == WETH.toLowerCase()) {
      //   //  priceA = await calPrice(BNB_BUSD_LP);
      //   priceA = await getDollarAPR(tokenZero);
      // }

      // if (tokenOne.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
      //   priceB = 1;
      // } else if (tokenOne.toLowerCase() == WETH.toLowerCase()) {
      //   //priceB = await calPrice(BNB_BUSD_LP);
      //   priceB = await getDollarAPR(tokenOne);
      // }

      // if (priceA == 0) {
      //   if (tokenZeroPairUSDT != "0x0000000000000000000000000000000000000000") {
      //     // priceA = await calPrice(tokenZeroPairUSDT);
      //     priceB = await getDollarAPR(tokenOne);
      //   } else if (
      //     tokenZeroPairBNB != "0x0000000000000000000000000000000000000000"
      //   ) {
      //     //  priceA = await calPrice(tokenZeroPairBNB);
      //     priceA = await getDollarAPR(tokenZero);
      //   } else {
      //     priceA = 0;
      //   }
      // }

      // if (priceB == 0) {
      //   if (tokenOnePairUSDT != "0x0000000000000000000000000000000000000000") {
      //     priceB = await getDollarAPR(tokenOne);
      //   } else if (
      //     tokenOnePairBNB != "0x0000000000000000000000000000000000000000"
      //   ) {
      //     priceB = await getDollarAPR(tokenOne);
      //   } else {
      //     priceB = 0;
      //   }
      // }

      const totalSupply = await ExchangeService.getTotalSupply(pairAddress);
      const tokenStaked = await ExchangeService.getTokenStaked(pairAddress);
      console.log("PriceA:", priceA);
      console.log("PriceB:", priceB);
      console.log("reserve:", reserve);
      const liquidity =
        (((reserve[0] / 10 ** decimalZero) * priceA +
          (reserve[1] / 10 ** decimalOne) * priceB) /
          totalSupply) *
        tokenStaked;

      return liquidity;
    }
    return 0;
  };
  const handleIcon = (symbol) => {
    if (symbol != undefined) {
      const tokenObj = TOKEN_LIST.find(
        (d) => d.symbol.toLowerCase() === symbol.toLowerCase()
      );
      return tokenObj != undefined && tokenObj.icon;
    }

  }

  const handleDefaultIcon = (symbol) => {
    if (symbol != undefined) {
      const tokenObj = TOKEN_LIST.find(
        (d) => d.symbol.toLowerCase() === symbol.toLowerCase()
      );
      let index = tokenObj != undefined && tokenObj.icon.lastIndexOf("/") + 1;
      let filename = tokenObj != undefined && tokenObj.icon.substr(index);
      return filename == "default.60b90c93.svg" ? "farm-coin" : "";
    }
  };
  const earnedNiobValue = (dollarValue, rewards) => {

    console.log("DOllar value:", dollarValue);
    let fixedAfterDecimal = Number(0.01 * rewards).toFixed(9);
    let res = addCommas(fixedAfterDecimal);
    return res;
  };

  const earnedDollarValue = (dollarValue, rewards) => {

    let fixedAfterDecimal = Number(dollarValue * rewards).toFixed(9);
    let res = addCommas(fixedAfterDecimal);
    return res;
  };
  useEffect(async () => {
    await getAnchorDollarValue();
    init();
    // console.log('userInfo.amount', userInfo.amount);
  }, [isUserConnected]);

  return (
    <>
      <Button
        className={`planet_bar`}
        onClick={() => setClassToggle(!classToggle)}
      >
        <div className="cions">
          <span className="coin_imgs uppr">
            <img src={handleIcon(lpTokenDetails?.symbol0) ? handleIcon(lpTokenDetails?.symbol0) : ""} />
          </span>
          <span className="coin_imgs dwn">
            <img src={handleIcon(lpTokenDetails?.symbol1) ? handleIcon(lpTokenDetails?.symbol1) : ""} />
          </span>
          <span className="coin_title">{lpTokenDetails?.lpTokenName}</span>
        </div>
        {poolInfo.depositFeeBP && Number(poolInfo.depositFeeBP) === 0 && (
          <div className="info_about_card_feeinfo">
            {" "}
            <img src={props.fee_icon} alt="" /> No Fee
          </div>
        )}
        <div className="prcentx">{poolInfo?.allocPoint}X</div>
        <div className="coin_detail">
          {status && (
            <div className="apr">
              <span>APR</span>
              {/* <span className="token-icon" onClick={() => handleRoiModal(roi, lpTokenDetails)}> */}
              {/* <svg viewBox="0 0 25 24" color="text" width="20px" xmlns="http://www.w3.org/2000/svg" className="sc-bdfBwQ dhaIlc"><path d="M19.2 3H5.19995C4.09995 3 3.19995 3.9 3.19995 5V19C3.19995 20.1 4.09995 21 5.19995 21H19.2C20.3 21 21.2 20.1 21.2 19V5C21.2 3.9 20.3 3 19.2 3ZM19.2 19H5.19995V5H19.2V19Z" fill="#1FC7D4"></path><path d="M11.45 7.72021H6.44995V9.22022H11.45V7.72021Z" fill="#1FC7D4"></path><path d="M18.2 15.75H13.2V17.25H18.2V15.75Z" fill="#1FC7D4"></path><path d="M18.2 13.25H13.2V14.75H18.2V13.25Z" fill="#1FC7D4"></path><path d="M8.19995 18H9.69995V16H11.7V14.5H9.69995V12.5H8.19995V14.5H6.19995V16H8.19995V18Z" fill="#1FC7D4"></path><path d="M14.29 10.95L15.7 9.54L17.11 10.95L18.17 9.89L16.76 8.47L18.17 7.06L17.11 6L15.7 7.41L14.29 6L13.23 7.06L14.64 8.47L13.23 9.89L14.29 10.95Z" fill="#1FC7D4"></path></svg></span> */}
              <p>{addCommas(apr) === "NaN" || NaN ? 0 : addCommas(apr)}%</p>
            </div>
          )}
          <div className="lqdty">
            <span>Liquidity</span>
            <p>${addCommas(Number(liquidity.toFixed(2))) === "NaN" || NaN ? 0 : addCommas(Number(liquidity.toFixed(2)))}</p>
          </div>
          <div className="erndniob">
            <span>Earned Niob</span>
            <p>{addCommas(stakeAmounts.rewards) === "NaN" || NaN ? 0 : addCommas(stakeAmounts.rewards)}</p>
            <p>$ {earnedNiobValue(dollarValue, stakeAmounts.rewards) === "NaN" || NaN ? 0 : earnedNiobValue(dollarValue, stakeAmounts.rewards)}</p>
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
        <div className="available_funds">
          <div className="funds">
            {isUserConnected ? (
              <>
                {showIncrease ? (
                  <div className="cardFarm_increase">
                    <button
                      type="button"
                      onClick={() => beforeStake("withdraw")}
                    >
                      <span>-</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => beforeStake("deposit")}
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
                        Enable Farm
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
                  onClick={() => toast.error("Connect to wallet first!")}
                  className="funds_btn"
                >
                  Unlock Wallet
                </Button>
              </>
            )}
            <div className="count_funds">
              <span>Available LP</span>
              <p>{balance} LP</p>
              <span>LP Worth - </span>
              <span>${addCommas(Number(worth.toFixed(2)))}</span>
            </div>
            <span className="forwd_arrow">
              <img src={RightArrow} alt={"right-arrow"} />
            </span>
          </div>
          <div className="funds">
            {/* <Button disabled={!showApproveButton} onClick={() => handleTokenApproval()} className="funds_btn">Enable Farm</Button> */}
            <div className="count_funds">
              <span>{lpTokenDetails?.lpTokenName} STAKED</span>
              {showIncrease ? (
                <p> {addCommas(stakeAmounts.amount)}</p>
              ) : (
                <p>0</p>
              )}
              <span>${earnedDollarValue(stakeAmounts.amount, worth) === "NaN" || NaN ? 0 : earnedDollarValue(stakeAmounts.amount, worth)}</span>
            </div>{" "}
            <span className="forwd_arrow">
              <img src={RightArrow} alt={"right-arrow"} />
            </span>
          </div>
          <div className="funds">
            <Button
              onClick={() => {
                setShowHarvest(false);
                harvestOnClick(pid, lpTokenDetails?.lpTokenName);
              }}
              disabled={!showHarvest}
              className="funds_btn"
            >
              Harvest
            </Button>
            <div className="count_funds">
              <span>Earned</span>
              <p>{addCommas(stakeAmounts.rewards) === "NaN" || NaN ? 0 : addCommas(stakeAmounts.rewards)} NIOB</p>
              <span>
                ${earnedDollarValue(dollarValue, stakeAmounts.rewards) === "NaN" || NaN ? 0 : earnedDollarValue(dollarValue, stakeAmounts.rewards)}
              </span>
            </div>
          </div>
          <div className="funds">
            <div className="count_funds">
              <span>Deposit Fee : {poolInfo.depositFeeBP ? (Number(poolInfo.depositFeeBP) / 10000) * 100 : 0}%</span>
              <span className="d-block">
                Harvest Interval: {poolInfo.harvestInterval ? Number(((poolInfo.harvestInterval) / 3600).toFixed(2)) : 0} Hour(s)
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanetCard;
