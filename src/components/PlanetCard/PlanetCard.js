import "./PlanetCard.scss";
import { toast } from "../Toast/Toast";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { addCommas } from "../../constant";
import useCFarm from "../../hooks/CommonFarm";
import React, { useEffect, useRef, useState } from "react";
import usePlanet from "../../redux/volatiles/planet";
import DownArrow from "../../assets/images/down-arrow.png";
import RightArrow from "../../assets/images/right-arrow.png";

const PlanetCard = (props) => {
  const {
    farm: { poolInfo, pid },
    harvestOnClick,
    status,
  } = props;

  // if(!poolInfo) window.location.reload(!1);
 
  const [classToggle, setClassToggle] = useState(!1);

  const cFarm = useCFarm(props);
  const planet = usePlanet(s => s);
  const P = useSelector(s => s.persist);
  const ref = useRef(!0);

  
  
  useEffect(_ => {
    if(ref.current) {
      (async _ => { 
        await cFarm.getAnchorDollarValue(); 
        cFarm.init(); 
      })()
      ref.current = !1;
    }
  }, [P.isConnected]);

  return (
    <>
      <Button
        className={`planet_bar`}
        onClick={() => setClassToggle(!classToggle)}
      >
        <div className="cions">
          <span className="coin_imgs uppr">
            <img src={cFarm.handleIcon(planet.lpTokenDetails?.symbol0) ? cFarm.handleIcon(planet.lpTokenDetails?.symbol0) : ""} />
          </span>
          <span className="coin_imgs dwn">
            <img src={cFarm.handleIcon(planet.lpTokenDetails?.symbol1) ? cFarm.handleIcon(planet.lpTokenDetails?.symbol1) : ""} />
          </span>
          <span className="coin_title">{planet.lpTokenDetails?.lpTokenName}</span>
        </div>
        {poolInfo?.depositFeeBP && Number(poolInfo?.depositFeeBP) === 0 && (
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
              <p>{addCommas(planet.apr) === "NaN" || NaN ? 0 : addCommas(planet.apr)}%</p>
            </div>
          )}
          <div className="lqdty">
            <span>Liquidity</span>
            <p>${addCommas(Number(planet.liquidity.toFixed(2))) === "NaN" || NaN ? 0 : addCommas(Number(planet.liquidity.toFixed(2)))}</p>
          </div>
          <div className="erndniob">
            <span>Earned Niob</span>
            <p>{addCommas(planet.stakeAmounts.rewards) === "NaN" || NaN ? 0 : addCommas(planet.stakeAmounts.rewards)}</p>
            <p>$ {cFarm.earnedNiobValue(planet.dollarValue, planet.stakeAmounts.rewards) === "NaN" || NaN ? 0 : cFarm.earnedNiobValue(planet.dollarValue, planet.stakeAmounts.rewards)}</p>
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
            {P.isConnected ? (
              <>
                {planet.showIncrease ? (
                  <div className="cardFarm_increase">
                    <button
                      type="button"
                      onClick={() => cFarm.beforeStake("withdraw")}
                    >
                      <span>-</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cFarm.beforeStake("deposit")}
                    >
                      <span>+</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {planet.showApproveButton ? (
                      <Button
                        className="funds_btn"
                        onClick={() => cFarm.handleTokenApproval()}
                      >
                        Enable Farm
                      </Button>
                    ) : (
                      <Button
                        className="funds_btn"
                        onClick={() => cFarm.beforeStake("deposit")}
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
              <p>{planet.balance} LP</p>
              <span>LP Worth - </span>
              <span>${addCommas(Number(planet.worth.toFixed(2)))}</span>
            </div>
            <span className="forwd_arrow">
              <img src={RightArrow} alt={"right-arrow"} />
            </span>
          </div>
          <div className="funds">
            {/* <Button disabled={!planet.showApproveButton} onClick={() => cFarm.handleTokenApproval()} className="funds_btn">Enable Farm</Button> */}
            <div className="count_funds">
              <span>{planet.lpTokenDetails?.lpTokenName} STAKED</span>
              {planet.showIncrease ? (
                <p> {addCommas(planet.stakeAmounts.amount)}</p>
              ) : (
                <p>0</p>
              )}
              <span>${cFarm.earnedDollarValue(planet.stakeAmounts.amount, planet.worth) === "NaN" || NaN ? 0 : cFarm.earnedDollarValue(planet.stakeAmounts.amount, planet.worth)}</span>
            </div>{" "}
            <span className="forwd_arrow">
              <img src={RightArrow} alt={"right-arrow"} />
            </span>
          </div>
          <div className="funds">
            <Button
              onClick={() => {
                planet.setShowHarvest(!1);
                harvestOnClick(pid, planet.lpTokenDetails?.lpTokenName);
              }}
              disabled={!planet.showHarvest}
              className="funds_btn"
            >
              Harvest
            </Button>
            <div className="count_funds">
              <span>Earned</span>
              <p>{addCommas(planet.stakeAmounts.rewards) === "NaN" || NaN ? 0 : addCommas(planet.stakeAmounts.rewards)} NIOB</p>
              <span>
                ${cFarm.earnedDollarValue(planet.dollarValue, planet.stakeAmounts.rewards) === "NaN" || NaN ? 0 : cFarm.earnedDollarValue(planet.dollarValue, planet.stakeAmounts.rewards)}
              </span>
            </div>
          </div>
          <div className="funds">
            <div className="count_funds">
              <span>Deposit Fee : {poolInfo?.depositFeeBP ? (Number(poolInfo.depositFeeBP) / 10000) * 100 : 0}%</span>
              <span className="d-block">
                Harvest Interval: {poolInfo?.harvestInterval ? Number(((poolInfo.harvestInterval) / 3600).toFixed(2)) : 0} Hour(s)
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanetCard;
