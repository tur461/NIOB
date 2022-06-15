import "./Home.scss";
import Web3 from "web3";
import { Link } from "react-router-dom";
import { BigNumber } from "bignumber.js";
import { rootName } from "../../services/constant";
import React, { useEffect, useState } from "react";
import Button from "../../components/Button/Button";
import { toast } from "../../components/Toast/Toast";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { FarmService } from "../../services/FarmService";
import FarmCard from "../../components/FarmCard/FarmCard";
import { Carousel, Row, Col, Image } from "react-bootstrap";
import { ExchangeService } from "../../services/ExchangeService";
import Saitama from "../../assets/images/token_icons/Saitama.png";
import BUSD from "../../assets/images/token_icons/BUSD-Token.svg";
import BTCB from "../../assets/images/token_icons/BTCB-Token.svg";
import { isAddr, rEq, toFull } from "../../services/utils/global";
import { ContractServices } from "../../services/ContractServices";
import ANCHOR from "../../assets/images/token_icons/ANCHOR-Token.svg";
import {
  MAIN_CONTRACT_LIST,
  ANCHOR_BUSD_LP,
  WETH,
  TOKEN_LIST,
  BNB_BUSD_LP,
} from "../../assets/tokens";
import {
  stopLoading,
  saveFotterValues,
} from "../../redux/actions";


const Home = () => {
  const dispatch = useDispatch();
  const P = useSelector((state) => state.persist);
  const [potDetails, setPotDetails] = useState({
    prizeArray: [0, 0, 0],
    miniPrice: 0,
    pot: 0,
    decimals: 0,
  });
  const { ref } = useParams();
  const [saitamaPerBlock, setSaitamaPerBlock] = useState(0);
  const [burnedToken, setBurnedToken] = useState(0);
  const [poolLength, setPoolLength] = useState(0);

  const [totalAmount, setAmount] = useState(0);
  const [totalRewards, setRewards] = useState(0);
  const [marketCap, setMarketCap] = useState(0.0);
  const [anchorTotalSupply, setAnchorTotalSupply] = useState(0);
  const [saitamaBusdValue, setSaitamaBusdValue] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);
  const [totalLockedRewards, setTotalLockedRewards] = useState(0);
  const [showHarvest, setShowHarvest] = useState(!1);
  const [harvest, setHarvestAll] = useState([]);
  const [farmAndStakeLoader, setFarmAndStakeLoader] = useState(!1);
  const [liquidity, setLiquidity] = useState(0);
  const [saitamaApr, setSaitamaApr] = useState(0);

  const [topFarms, setTopFarms] = useState([]);
  const [topFarmApy, setTopFarmApy] = useState("");

  let TC = ContractServices.TokenContract;;

  useEffect(_ => {
    (async () => {
      init();
      if (ref && !Web3.utils.isAddress(ref)) 
        return toast.error("Address does not exist!");
    })()
  }, []);

  const init = async () => {
    const res = await ContractServices.tryGetAccount();
    if (P.isConnected && res) {
      getMarketCap();
      getBurnedToken();
      getSaitamaPerBlock();
      try {
        const pL = Number(await FarmService.poolLength());
        setPoolLength(pL);
        // let farmsTemp = [];
        let totalLockedRewards = 0;
        let totalRewards = 0;
        let totalLiquidity = 0;
        let options = [];
        TC.setTo(TOKEN_LIST[1].address)
        const res = await TC.balanceOf(P.priAccount);
        setAmount(res);
        let allAPRs = [];
        for (let i = 0; i < pL; i++) {
          const res = await FarmService.totalPoolInfo(i);
          const userInfo = await FarmService.userInfo(i, P.priAccount);
          const { poolInfo, latest } = res;

          if (poolInfo.lpToken != undefined) {
            TC.setTo(poolInfo.lpToken);
            const allowance = await TC.allowanceOf(MAIN_CONTRACT_LIST.farm.address);
            let check = BigNumber(allowance).isGreaterThanOrEqualTo(BigNumber(2 * 255 - 1)) ? !1 : !0;
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
              const poolInfoForSaitama = await FarmService.poolInfo(i, "2");
              // console.log("poolInfoForSaitama", poolInfoForSaitama);
              let res = await handleTotalLiquidityForPool(pool.lpToken);
              const tokenAmount = await ExchangeService.getTokenStaked(
                pool.lpToken
              );
              let price = rEq(pool.lpTokenaddress, TOKEN_LIST[2].address) ? 1 
              : await getPrice(await ExchangeService.getPair(pool.lpToken, TOKEN_LIST[2].address))
              if (poolInfoForSaitama.allocPoint === "30") setSaitamaApr(await calculateAPR(poolInfoForSaitama.allocPoint, res));
              const liq = tokenAmount * price;
              totalLiquidity += Number(liq);
              setLiquidity(totalLiquidity);
            }

            if (i === pL - 1) {
              const totalSupply = await getTotalSupply();
              const saitamaValue = await getSaitamaDollarValue();
              const obj = {
                tvl: totalLiquidity,
                totalSupply: totalSupply,
                saitamaValue: saitamaValue,
              };
              dispatch(saveFotterValues(obj));
            }
            const rewards = Number(
              Number(
                (await FarmService.pendingPanther(i, P.priAccount)) /
                10 ** 18
              ).toFixed(3)
            );
            totalRewards += rewards;
            setRewards(totalRewards);

            const nextHarvestUntil = await FarmService.canHarvest(
              i,
              P.priAccount
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
        }
        setTopFarmApy(Math.max.apply(Math, allAPRs));
        setHarvestAll(options);
      } catch (err) {
        console.log(err);
        setFarmAndStakeLoader(!1);
        dispatch(stopLoading());
      }
    }
  };
  const calculateAPR = async (allocPoint, liquidity) => {
    const anchorPrice = await getPrice(ANCHOR_BUSD_LP);
    const totalAllcationPoint = Number(
      await FarmService.totalAllocationPoint()
    );
    const anchorPerBlock = Number(await FarmService.pantherPerBlock());
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
    const dollarValue = await getSaitamaDollarValue();
    const totalSupply = await getTotalSupply();
    setMarketCap(dollarValue * totalSupply);
  };
  const getSaitamaDollarValue = async () => {
    const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
    setSaitamaBusdValue(reserves[1] / reserves[0]);
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
  const getSaitamaPerBlock = async () => {
    try {
      const saitamaPerBlock = Number(await FarmService.pantherPerBlock());
      setSaitamaPerBlock(saitamaPerBlock / 10 ** 18);
    } catch (error) {
      console.log(error);
    }
  };
  const getPriceInUsd = async (tokenZero, tokenOne, reserve) => {
    TC.setTo(tokenZero);
    const decimalZero = await TC.decimals();
    TC.setTo(tokenOne);
    const decimalOne = await TC.decimals();
    let price;
    if (rEq(tokenZero, TOKEN_LIST[2].address)) price = (reserve[0] * decimalOne) / (reserve[1] * decimalZero);
    if (rEq(tokenOne, TOKEN_LIST[2].address)) price = (reserve[1] * decimalZero) / (reserve[0] * decimalOne);
    return price;
  };
  const getPrice = async (pairAddress) => {
    if (!isAddr(pairAddress)) return 0;
    const tkn = await ExchangeService.getTokens(pairAddress);
    const reserve = await ExchangeService.getReserves(pairAddress);
    const dec = await ExchangeService.getDecimalPair(tkn);
    
    if (rEq(tkn[0], TOKEN_LIST[2].address)) return toFull(reserve[0], dec[0]) / toFull(reserve[1], dec[1]);
    if (rEq(tkn[1], TOKEN_LIST[2].address)) return toFull(reserve[1], dec[1]) / toFull(reserve[0], dec[0]);
    let priceBNBToUSD = await getPrice(BNB_BUSD_LP); //replace with BNB-USD pair
    if (rEq(tkn[0], WETH)) return toFull(priceBNBToUSD * reserve[0], dec[0]) / toFull(reserve[1], dec[1]);
    if (rEq(tkn[1], WETH)) return toFull(priceBNBToUSD * reserve[1], dec[1]) / toFull(reserve[0], dec[0]);
  };

  const getDollarAPR = async (address) => {
    try {

      if (rEq(address, TOKEN_LIST[1].address)) {
        const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
        let val = reserves[1] / reserves[0];
        val = val || 0;
        return (val.toFixed(3));
      } 
      else if (rEq(address, TOKEN_LIST[2].address))return 1;
      else if (!rEq(address, TOKEN_LIST[2].address)) {
        const pair = await ExchangeService.getPairFromPancakeFactory(address, TOKEN_LIST[2].address);
        const reserves = await ExchangeService.getReserves(pair);
        let val = reserves[1] / reserves[0];
        val = val || 0;
        return (val.toFixed(3));
      }

    } catch (error) {
      console.log(error)
    }
  }

  const handleTotalLiquidity = async pairAddress => {
    if (isAddr(pairAddress)) {
      const tkn = await ExchangeService.getTokens(pairAddress)
      const reserve = await ExchangeService.getReserves(pairAddress);
      const dec = await ExchangeService.getDecimalPair(tkn);
      let priceA = await getDollarAPR(tkn[0]);
      let priceB = await getDollarAPR(tkn[1]);
      const totalSupply = await ExchangeService.getTotalSupply(pairAddress);
      const tokenStaked = await ExchangeService.getTokenStaked(pairAddress);
      const liquidity =
        (((reserve[0] / 10 ** dec[0]) * priceA +
          (reserve[1] / 10 ** dec[1]) * priceB) /
          totalSupply) *
        tokenStaked;
      return liquidity;
    }
    return 0;
  };
  const options = {
    indicators: !1,
  };
  const handleTotalLiquidityForPool = async (tokenAddress) => {
    if (isAddr(tokenAddress)) {
      const reserve = await ExchangeService.getTokenStaked(tokenAddress);
      const tokenPairUSDT = await ExchangeService.getPair(
        tokenAddress,
        TOKEN_LIST[2].address
      );
      const tokenPairBNB = await ExchangeService.getPair(tokenAddress, WETH);
      let priceA = 0;
      if (rEq(tokenAddress, TOKEN_LIST[2].address)) priceA = 1;
      else if (rEq(tokenAddress, WETH)) priceA = await getPrice(BNB_BUSD_LP);

      if (priceA == 0) {
        if (isAddr(tokenPairUSDT)) priceA = await getPrice(tokenPairUSDT);
        else if (isAddr(tokenPairBNB)) {
          //priceA = await getPrice(tokenPairBNB);
          priceA = 0;
        }
      }
      const liquidity = reserve * priceA;
      return Number(liquidity).toFixed(2);
    }
    return 0;
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
              <div className="SaitamaSwap">
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
                



             
              <div className="saitamaImg tweet_Img">
                <Image className="tweet_img"
                  src={
                    require("../../assets/images/Saitama-Header-Logo.svg")
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
            <ul className="pl-0 saitamaStats">
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
          <FarmCard title="SAITAMA" title1="BUSD" icon1={Saitama} icon2={BUSD} liquidity="$81,400.000"
            apy="987.40 %" />
        </Col>
        <Col xl={4} lg={12}>
          <FarmCard title="SAITAMA" title1="BTCB" icon1={Saitama} icon2={BTCB} liquidity="$98,500.000" apy="1,187.40 %"
          />
        </Col>
        <Col xl={4} lg={12}>
          <FarmCard title="SAITAMA" title1="ANCHOR" icon1={Saitama} icon2={ANCHOR} liquidity="$108,450.000"
            apy="435.90 %" />
        </Col>
      </Row>
    </div>
    </div >
  );
};

export default Home;
