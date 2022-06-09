import React, { useEffect, useState } from "react";
import { Carousel, Row, Col, Image } from "react-bootstrap";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Web3 from "web3";
import { Link } from "react-router-dom";
import { rootName } from "../../constant";
import Button from "../../components/Button/Button";
import FarmCard from "../../components/FarmCard/FarmCard";
import NIOB from "../../assets/images/token_icons/NIOB.svg";
import BUSD from "../../assets/images/token_icons/BUSD-Token.svg";
import ANCHOR from "../../assets/images/token_icons/ANCHOR-Token.svg";
import BTCB from "../../assets/images/token_icons/BTCB-Token.svg";
import { ContractServices } from "../../services/ContractServices";
import { ExchangeService } from "../../services/ExchangeService";
import { FarmService } from "../../services/FarmService";
import { ReferralsServices } from "../../services/ReferralsServices";
import Statement from "../../assets/Pdfs/Statement.pdf";
import {
  MAIN_CONTRACT_LIST,
  BURN_ADDRESS,
  ANCHOR_BUSD_LP,
  WETH,
  TOKEN_LIST,
  BNB_BUSD_LP,
} from "../../assets/tokens";
import { addCommas } from "../../constant";
import {
  addTransaction,
  startLoading,
  stopLoading,
  saveFotterValues,
} from "../../redux/actions";
import { BigNumber } from "bignumber.js";
import Loader from "react-loader-spinner";
import { TwitterTimelineEmbed } from "react-twitter-embed";
import Default from "../../assets/images/token_icons/default.svg";
import { savereffralAddress } from "../../redux/actions";

import "./Home.scss";
import { toast } from "../../components/Toast/Toast";

import UpdateDsk from "../../assets/images/PRDT-Trading-Banner.jpg";
// import UpdateMob from "../../assets/images/update_Mob.jpg";

const Home = () => {
  const dispatch = useDispatch();
  const isUserConnected = useSelector((state) => state.persist.isUserConnected);
  const [potDetails, setPotDetails] = useState({
    prizeArray: [0, 0, 0],
    miniPrice: 0,
    pot: 0,
    decimals: 0,
  });
  const { ref } = useParams();
  const referralAddress = useSelector((state) => state.persist.referralAddress);
  const [rewards, seRewards] = useState(0);
  const [niobPerBlock, setNiobPerBlock] = useState(0);
  const [transferTaxRate, setTransferTaxRate] = useState(0);
  const [burnedToken, setBurnedToken] = useState(0);
  const [walletShow, setWalletShow] = useState(false);
  const [poolLength, setPoolLength] = useState(0);
  const [farms, setFarms] = useState([]);
  const [inactiveFarms, setInactiveFarms] = useState([]);
  const [stakingOnly, setStakingOnly] = useState([]);
  const [stakeData, setStakeData] = useState(null);
  const [stakeValue, setStakeValue] = useState(0);
  const [referrer, setReferrer] = useState(
    "0x0000000000000000000000000000000000000000"
  );
  const [totalAmount, setAmount] = useState(0);
  const [totalRewards, setRewards] = useState(0);
  const [marketCap, setMarketCap] = useState(0.0);
  const [anchorTotalSupply, setAnchorTotalSupply] = useState(0);
  const [niobBusdValue, setNiobBusdValue] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);
  const [totalLockedRewards, setTotalLockedRewards] = useState(0);
  const [anchorBnbWorth, setAnchorBnbWorth] = useState(0);
  const [anchorBusdWorth, setAnchorBusdWorth] = useState(0);
  const [tokenIds, setTokenIds] = useState();
  const [allowance, setAllowance] = useState(false);
  const [disable, setDisabledBUtton] = useState(false);
  const [IButton, setIButton] = useState(false);
  const [ticketWindow, openTicketWindow] = useState(false);
  const [ticketValue, setvalue] = useState(1);
  const [buyButton, setBuyButton] = useState(false);
  const [loader, setLoader] = useState(false);
  const [currentTicketsArray, setCurrentArray] = useState([]);
  const [showHarvest, setShowHarvest] = useState(false);
  const [harvest, setHarvestAll] = useState([]);
  const [stakeConfirmation, setStakeConfimation] = useState(0);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [farmAndStakeLoader, setFarmAndStakeLoader] = useState(false);
  const [liquidity, setLiquidity] = useState(0);
  const [niobApr, setNiobApr] = useState(0);

  const [topFarms, setTopFarms] = useState([]);
  const [topFarmApy, setTopFarmApy] = useState("");

  useEffect(async () => {
    init();
    if (ref) {
      const checkAddress = await Web3.utils.isAddress(ref.toLowerCase());
      if (!checkAddress) {
        toast.error("Address does not exist!");
        return;
      }
      if (isUserConnected) {
        let re = await ReferralsServices.getReferrer(isUserConnected);
        if (re != "0x0000000000000000000000000000000000000000") {
          toast.error(`This user has already referral`);
          return;
        }
        dispatch(savereffralAddress(ref.toLowerCase()));
        return;
      }
      toast.success(`Please connect with wallet!`);
    }
  }, [isUserConnected]);

  const init = async () => {
    const res = await ContractServices.isMetamaskInstalled();

    if (isUserConnected && res) {
      getMarketCap();
      getBurnedToken();
      getNiobPerBlock();
      try {
        dispatch(startLoading());
        let ref = await ReferralsServices.getReferrer(isUserConnected);
        if (ref === "0x0000000000000000000000000000000000000000") {
          if (
            referralAddress &&
            referralAddress !== "0x0000000000000000000000000000000000000000"
          ) {
            ref = referralAddress;
          }
          setReferrer(ref);
        }
        dispatch(stopLoading());
        const pL = Number(await FarmService.poolLength());
        setPoolLength(pL);
        // let farmsTemp = [];
        let totalRewards = 0;
        let totalLockedRewards = 0;
        let totalLiquidity = 0;
        let options = [];
        const res = await ContractServices.getTokenBalance(
          TOKEN_LIST[1].address,
          isUserConnected
        );
        setAmount(res);
        // setFarmAndStakeLoader(true);
        let allAPRs = [];
        for (let i = 0; i < pL; i++) {
          const res = await FarmService.totalPoolInfo(i);
          const userInfo = await FarmService.userInfo(i, isUserConnected);
          const { poolInfo, latest } = res;

          if (poolInfo.lpToken != undefined) {
            const allowance = await ContractServices.allowanceToken(
              poolInfo.lpToken,
              MAIN_CONTRACT_LIST.farm.address,
              isUserConnected
            );
            let check = true;
            if (
              BigNumber(allowance).isGreaterThanOrEqualTo(
                BigNumber(2 * 255 - 1)
              )
            ) {
              // setShowApproveButton(false);
              check = false;
            }
            const reserve = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
            const tokenZero = await ExchangeService.getTokenZero(
              ANCHOR_BUSD_LP
            );
            const tokenOne = await ExchangeService.getTokenOne(ANCHOR_BUSD_LP);
            const anchorPerBlock = Number(await FarmService.pantherPerBlock());
            const price = await getPriceInUsd(tokenZero, tokenOne, reserve);

            totalLockedRewards +=
              (latest - poolInfo.lastRewardBlock) *
              price *
              (anchorPerBlock / 10 ** 18);
            setTotalLockedRewards(totalLockedRewards);

            const farmPoolInfo = await FarmService.farmAndPoolInfo(i);
            const { farm, pool } = farmPoolInfo;
            if (farm) {
              let res = await handleTotalLiquidity(farm.lpToken);

              const lpTokenDetailsTemp = await FarmService.getLpTokenDetails(
                poolInfo.lpToken
              );
              let apr = await calculateAPR(farm.allocPoint, res);
              setTopFarms((topFarms) => [
                ...topFarms,
                {
                  symbol0: lpTokenDetailsTemp.symbol0,
                  symbol1: lpTokenDetailsTemp.symbol1,
                  newLiquidity: res,
                  newApr: apr,
                },
              ]);
              allAPRs.push(apr);
              totalLiquidity += Number(res);
            }
            if (pool) {
              const poolInfoForNiob = await FarmService.poolInfo(i, "2");
              // console.log("poolInfoForNiob", poolInfoForNiob);
              let res = await handleTotalLiquidityForPool(pool.lpToken);
              const tokenAmount = await ExchangeService.getTokenStaked(
                pool.lpToken
              );
              let price = 0;
              if (
                pool.lpToken.toLowerCase() ===
                TOKEN_LIST[2].address.toLowerCase()
              ) {
                price = 1;
              } else {
                const tokenPairUSDT = await ExchangeService.getPair(
                  pool.lpToken,
                  TOKEN_LIST[2].address
                );
                price = await calPrice(tokenPairUSDT);
              }
              //const niobId = await FarmService.niobId();
              //console.log('this is apr',poolInfo,  niobId);
              if (poolInfoForNiob.allocPoint === "30") {
                let apr = await calculateAPR(poolInfoForNiob.allocPoint, res);
                setNiobApr(apr);
              }
              const liq = tokenAmount * price;
              totalLiquidity += Number(liq);
              setLiquidity(totalLiquidity);
            }

            if (i === pL - 1) {
              const totalSupply = await getTotalSupply();
              const niobValue = await getNiobDollarValue();
              const obj = {
                tvl: totalLiquidity,
                totalSupply: totalSupply,
                niobValue: niobValue,
              };
              dispatch(saveFotterValues(obj));
            }
            const rewards = Number(
              Number(
                (await FarmService.pendingPanther(i, isUserConnected)) /
                10 ** 18
              ).toFixed(3)
            );
            totalRewards += rewards;
            setRewards(totalRewards);

            const nextHarvestUntil = await FarmService.canHarvest(
              i,
              isUserConnected
            );
            if (
              !check &&
              rewards > 0 &&
              Number(userInfo.nextHarvestUntil) > 0 &&
              nextHarvestUntil
            ) {
              setShowHarvest(true);
              options.push({ pid: i, lpToken: poolInfo.lpToken });
            }
          }
          // if (i + 1 == pL) {
          //     setFarmAndStakeLoader(false);
          // }
        }
        setTopFarmApy(Math.max.apply(Math, allAPRs));
        setHarvestAll(options);
      } catch (err) {
        console.log(err);
        setFarmAndStakeLoader(false);
        dispatch(stopLoading());
      }
    }
  };
  const calculateAPR = async (allocPoint, liquidity) => {
    const anchorPrice = await calPrice(ANCHOR_BUSD_LP);
    const totalAllcationPoint = Number(
      await FarmService.totalAllocationPoint()
    );
    const anchorPerBlock = Number(await FarmService.pantherPerBlock());
    //need to calculate usd price.
    // console.log("liquidity: ", liquidity);
    if (liquidity != 0) {
      const apr =
        ((allocPoint / totalAllcationPoint) *
          ((anchorPerBlock / 10 ** 18) * 28800 * 365 * 100 * anchorPrice)) /
        liquidity;

      return apr.toFixed(2);
    }

    return 0;
  };
  const getMarketCap = async () => {
    const dollarValue = await getNiobDollarValue();
    const totalSupply = await getTotalSupply();
    setMarketCap(dollarValue * totalSupply);
  };
  const getNiobDollarValue = async () => {
    const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
    setNiobBusdValue(reserves[1] / reserves[0]);
    return reserves[1] / reserves[0];
  };
  const getTotalSupply = async () => {
    const res = await ExchangeService.getTotalSupply(
      MAIN_CONTRACT_LIST.anchorNew.address
    );
    const anchorTotalSupply = res;
    const txAmount = (0.05 * anchorTotalSupply) / 100;
    setTotalMinted(anchorTotalSupply);
    setAnchorTotalSupply(txAmount);
    return res;
  };
  const getBurnedToken = async () => {
    try {
      const response = await ExchangeService.getBurnedToken();
      setBurnedToken(response);
    } catch (error) {
      console.log(error);
    }
  };
  const getNiobPerBlock = async () => {
    try {
      const niobPerBlock = Number(await FarmService.pantherPerBlock());
      setNiobPerBlock(niobPerBlock / 10 ** 18);
    } catch (error) {
      console.log(error);
    }
  };
  const getPriceInUsd = async (tokenZero, tokenOne, reserve) => {
    let price;

    const decimalZero = await ContractServices.getDecimals(tokenZero);
    const decimalOne = await ContractServices.getDecimals(tokenOne);

    if (tokenZero.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
      price = (reserve[0] * decimalOne) / (reserve[1] * decimalZero);
    }

    if (tokenOne.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
      price = (reserve[1] * decimalZero) / (reserve[0] * decimalOne);
    }

    return price;
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

  const getDollarAPR = async (address) => {
    try {

      if (address.toLowerCase() === TOKEN_LIST[1].address.toLowerCase()) {
        const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
        let val = reserves[1] / reserves[0];
        val = val || 0;
        //setAnchorDollarValue(val.toFixed(3));
        return (val.toFixed(3));
      } else if (address.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
        return 1;
      }
      else if (address.toLowerCase() != TOKEN_LIST[2].address.toLowerCase()) {

        const pair = await ExchangeService.getPairFromPancakeFactory(address, TOKEN_LIST[2].address);
        const reserves = await ExchangeService.getReserves(pair);
        let val = reserves[1] / reserves[0];
        val = val || 0;
        // setAnchorDollarValue(val.toFixed(3));
        return (val.toFixed(3));
      }

    } catch (error) {
      console.log(error)
    }
  }

  const handleTotalLiquidity = async (pairAddress) => {
    if (pairAddress != "0x0000000000000000000000000000000000000000") {
      // console.log(pairAddress);
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
      // const decimalPair = await ContractServices.getDecimals(pairAddress);


      let priceA = await getDollarAPR(tokenZero);
      let priceB = await getDollarAPR(tokenOne);



      // let priceA = 0;
      // let priceB = 0;

      // if (tokenZero.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
      //   priceA = 1;
      // } else if (tokenZero.toLowerCase() == WETH.toLowerCase()) {
      //   priceA = await calPrice(BNB_BUSD_LP);
      // }

      // if (tokenOne.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
      //   priceB = 1;
      // } else if (tokenOne.toLowerCase() == WETH.toLowerCase()) {
      //   priceB = await calPrice(BNB_BUSD_LP);
      // }

      // if (priceA == 0) {
      //   if (tokenZeroPairUSDT != "0x0000000000000000000000000000000000000000") {
      //     priceA = await calPrice(tokenZeroPairUSDT);
      //   } else if (
      //     tokenZeroPairBNB != "0x0000000000000000000000000000000000000000"
      //   ) {
      //     priceA = await calPrice(tokenZeroPairBNB);
      //   } else {
      //     priceA = 0;
      //   }
      // }

      // if (priceB == 0) {
      //   if (tokenOnePairUSDT != "0x0000000000000000000000000000000000000000") {
      //     priceB = await calPrice(tokenOnePairUSDT);
      //   } else if (
      //     tokenOnePairBNB != "0x0000000000000000000000000000000000000000"
      //   ) {
      //     priceB = await calPrice(tokenOnePairBNB);
      //   } else {
      //     priceB = 0;
      //   }
      // }

      const totalSupply = await ExchangeService.getTotalSupply(pairAddress);
      const tokenStaked = await ExchangeService.getTokenStaked(pairAddress);

      const liquidity =
        (((reserve[0] / 10 ** decimalZero) * priceA +
          (reserve[1] / 10 ** decimalOne) * priceB) /
          totalSupply) *
        tokenStaked;

      return liquidity;
    }
    return 0;
  };
  const options = {
    indicators: false,
  };
  const handleTotalLiquidityForPool = async (tokenAddress) => {
    if (tokenAddress != "0x0000000000000000000000000000000000000000") {
      const reserve = await ExchangeService.getTokenStaked(tokenAddress);
      const tokenPairUSDT = await ExchangeService.getPair(
        tokenAddress,
        TOKEN_LIST[2].address
      );
      const tokenPairBNB = await ExchangeService.getPair(tokenAddress, WETH);

      let priceA = 0;

      if (tokenAddress.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
        priceA = 1;
      } else if (tokenAddress.toLowerCase() == WETH.toLowerCase()) {
        priceA = await calPrice(BNB_BUSD_LP);
      }

      if (priceA == 0) {
        if (tokenPairUSDT != "0x0000000000000000000000000000000000000000") {
          priceA = await calPrice(tokenPairUSDT);
        } else if (
          tokenPairBNB != "0x0000000000000000000000000000000000000000"
        ) {
          priceA = await calPrice(tokenPairBNB);
          priceA = 0;
        }
      }

      const liquidity = reserve * priceA;

      return Number(liquidity).toFixed(2);
    }
    return 0;
  };
  const handleIcon = (symbol) => {
    if (symbol != undefined) {
      const tokenObj = TOKEN_LIST.find(
        (d) => d.symbol.toLowerCase() === symbol.toLowerCase()
      );
      return tokenObj != undefined ? tokenObj.icon : Default;
    }
  };

  const history = useHistory();
  return (
    <div className="container_wrap">
      <div className="container container_inside homePage">
        <Carousel fade {...options}>
          <Carousel.Item>
            <Carousel.Caption>
              <h3>Welcome to SAITA Swap</h3>
              <p>
                Decentralized Exchange and Automatic Liquidity Acquisition Yield
                Farm running currently on Binance Smart Chain.
              </p>
              <p>
                If you are new to SAITA please also visit our Tutorial Section in
                our official docs. We’ll teach you step by step you to use SAITA
                Swap and it’s assets.
              </p>
              <Link className="captionFooter d-flex justify-content-between align-items-center">
                <span>SAITA Tutorial</span>
                <span>
                  <Image
                    src={require("../../assets/images/Link-Icon.svg").default}
                    alt="icon"
                  />
                </span>
              </Link>
            </Carousel.Caption>
            <Image
              className="bgImage"
              alt="image"
              src={
                require("../../assets/images/dashboard-header-bg.jpg").default
              }
            />
          </Carousel.Item>
          <Carousel.Item>
            <Carousel.Caption>
              <h3>First slide label</h3>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
              <Link className="captionFooter d-flex justify-content-between align-items-center">
                <span>SAITA Tutorial</span>{" "}
                <span>
                  <Image
                    src={require("../../assets/images/Link-Icon.svg").default}
                    alt="icon"
                  />
                </span>
              </Link>
            </Carousel.Caption>
            <Image
              className="bgImage"
              alt="image"
              src={
                require("../../assets/images/dashboard-header-bg.jpg").default
              }
            />
          </Carousel.Item>
          <Carousel.Item>
            <Carousel.Caption>
              <h3>First slide label</h3>
              <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
              <Link className="captionFooter d-flex justify-content-between align-items-center">
                <span>SAITA Tutorial</span>{" "}
                <span>
                  <Image
                    src={require("../../assets/images/Link-Icon.svg").default}
                    alt="icon"
                  />
                </span>
              </Link>
            </Carousel.Caption>
            <Image
              className="bgImage"
              alt="image"
              src={
                require("../../assets/images/dashboard-header-bg.jpg").default
              }
            />
          </Carousel.Item>
        </Carousel>
        <Row className="startEngine">
          <Col xl={4} lg={12}>
            <div className="comnBlk">
              <Image
                className="headerImg"
                src={require("../../assets/images/swap-icon.svg").default}
              />
              <h3>Start your engine </h3>
              <p>Start your journey or improve your wallet portfolio:</p>
              <h3>SAITA Price: $0.50</h3>
              <Link className="captionFooter d-flex justify-content-between align-items-center">
                <span>Buy SAITA Token </span> <span className="arrowIcon" />
              </Link>
            </div>
          </Col>
          <Col xl={4} lg={12}>
            <div className="comnBlk">
              <Image
                className="headerImg"
                src={require("../../assets/images/farm-icon.svg").default}
              />
              <h3>Farm Planets</h3>
              <p>Stake LP tokens in Farms and earn up to:</p>
              <h3>1,000 % APY</h3>
              <Link className="captionFooter d-flex justify-content-between align-items-center" to="farmplanets/active">
                <span>Start farming</span> <span className="arrowIcon" />
              </Link>
            </div>
          </Col>
          <Col xl={4} lg={12}>
            <div className="comnBlk">
              <Image
                className="headerImg"
                src={require("../../assets/images/reflink-icon.svg").default}
              />
              <h3>Decentralized Ref Link </h3>
              <p>Enjoy Referral Rewards from:</p>
              <h3>Farms, Pools Swaps</h3>
              <Link className="captionFooter d-flex justify-content-between align-items-center" to="/referral">
                <span>Start inviting friends</span>{" "}
                <span className="arrowIcon" />
              </Link>
            </div>
          </Col>
        </Row>
        <Row className="announcements">
          <Col xl={6} lg={12} >
            <div className="comnBlk">
              <div className="headSec">
                <div className="d-flex justify-content-between align-items-center">
                  <h3>News & Announcements</h3>
                  <ul className="d-flex justify-content-between align-items-center mb-0 socialLinks">
                    <li>
                      <a>
                        <Image
                          src={
                            require("../../assets/images/twitter-icon.svg")
                              .default
                          }
                        />
                      </a>
                    </li>
                    <li>
                      <a>
                        <Image
                          src={
                            require("../../assets/images/telegram-icon.svg")
                              .default
                          }
                        />
                      </a>
                    </li>
                  </ul>
                </div>

                <h5>Tweets by @SaitaSwap</h5>
              </div>
              <div className="NiobSwap">
                <h5>
                  SaitaSwap<span>@SaitaSwap</span>
                </h5>
                <p>
                  This may probably be the most important and life-changing
                  Tweet you’ve ever read in your whole life. We proudly present
                  the most intuitive, secure and sexiest CryptoSwap on the World
                  Wide Web. Welcome to the feature. Welcome to SaitaSwap.</p>

                <p>This may probably be the most important and life-changing Tweet you’ve ever read in your whole life. We proudly present the most intuitive, secure and sexiest CryptoSwap on the World Wide Web. Welcome to the feature. Welcome to SaitaSwap. We proudly present the most intuitive, secure and sexiest CryptoSwap on the World
                  Wide Web. Welcome to the feature. Welcome to SaitaSwap.</p>
                



             
              <div className="niobImg tweet_Img">
                <Image className="tweet_img"
                  src={
                    require("../../assets/images/Niob-Header-Logo.svg")
                      .default
                  }
                />
              </div>
            </div>
          </div>
        </Col>
        <Col xl={6} lg={12}>
          <div className="comnBlk mb-4">
            <h3>SAITA Stats</h3>
            <ul className="pl-0 niobStats">
              <li>
                <label>Market Cap</label>
                <span>$100,000,001</span>
              </li>
              <li>
                <label>Total Minted</label>
                <span>38,913,839</span>
              </li>
              <li>
                <label>Total Burned</label>
                <span>2,587,911 </span>
              </li>
              <li>
                <label>Total Locked Rewards</label>
                <span>12,438,199 </span>
              </li>
              <li>
                <label> Circulating Supply </label>
                <span>23,891,243</span>
              </li>
              <li>
                <label>Max Tx Amoung </label>
                <span>58,373 </span>
              </li>
              <li>
                <label>New ANCHOR/Block Transfer Tax</label>
                <span> 75 3,0%</span>
              </li>
              <li>
                <label>Transfer Tax</label>
                <span>3,0%</span>
              </li>
            </ul>
          </div>
          <div className="comnBlk">
            <h3>Total Value Locked (TVL)</h3>
            <div className="totl_value">
              <h3>$20,000,000.00</h3>
              <p className="mb-0">Across all Farms and Pools</p>
            </div>
          </div>
        </Col>
      </Row>
      <Row className="all_farms">
        <Col md={12}>
          <div className="farm_title">
            <h3>Top Farm Planets</h3>
            <Button title="All Farms" onClick={() => { history.push(`${rootName}/farmplanets/active`) }} />
          </div>
        </Col>
        <Col xl={4} lg={12}>
          <FarmCard title="SAITA" title1="BUSD" icon1={NIOB} icon2={BUSD} liquidity="$81,400.000"
            apy="987.40 %" />
        </Col>
        <Col xl={4} lg={12}>
          <FarmCard title="SAITA" title1="BTCB" icon1={NIOB} icon2={BTCB} liquidity="$98,500.000" apy="1,187.40 %"
          />
        </Col>
        <Col xl={4} lg={12}>
          <FarmCard title="SAITA" title1="ANCHOR" icon1={NIOB} icon2={ANCHOR} liquidity="$108,450.000"
            apy="435.90 %" />
        </Col>
      </Row>
    </div>
    </div >
  );
};

export default Home;
