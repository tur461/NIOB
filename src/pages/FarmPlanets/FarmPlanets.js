import "./FarmPlanets.scss";
import React, { useEffect } from "react";
import useFarmer from "../../hooks/farming";
import Button from "@restart/ui/esm/Button";
import { Tabs, Tab } from "react-bootstrap";
import useCommon from "../../redux/volatiles/common";
import { useDispatch, useSelector } from "react-redux";
import useFarming from "../../redux/volatiles/farming";
import Searchicon from "../../assets/images/search.png";
import { FarmService } from "../../services/FarmService";
import NIOB from "../../assets/images/token_icons/NIOB.svg";
import { startLoading, stopLoading } from "../../redux/actions";
import GetLPToken from "../../components/GetLPToken/GetLPToken";
import FarmIcon from "../../assets/images/Farm-Header-Logo.svg";
import PlanetCard from "../../components/PlanetCard/PlanetCard";
import BUSD from "../../assets/images/token_icons/BUSD-Token.svg";
import { ReferralsServices } from "../../services/ReferralsServices";
import WithDrawLPToken from "../../components/GetLPToken/WithDrawLPToken";
import { Container, Col, Row, Form, InputGroup, FormControl } from "react-bootstrap";
import TransactionalModal from "../../components/TransactionalModal/TransactionalModal";
import { isAddr, isZero, zero } from "../../services/utils/global";
import { toast } from "../../components/Toast/Toast";
import Active from "./Active";
import Inactive from "./Inactive";

const FarmPlanets = (props) => {
  const { tab } = props.match.params;
  
  const dsp = useDispatch();
  const common = useCommon(s => s);
  const farming = useFarming(s => s);
  const P = useSelector(s => s.persist);
  const Farmer = useFarmer({init, history: props.history});
  
  useEffect(() => {
    init();
    return () => {
      farming.setFarms([]);
      farming.setInactiveFarms([]);
    };
  }, [P.isConnected]);

  async function init() {
    if(!P.isConnected) return toast.error('please connect wallet!');
    try {
      dsp(startLoading());
      let ref = await ReferralsServices.getReferrer(P.priAccount);
      farming.setReferrer(isZero(ref) && isAddr(P.referralAddress) ? P.referralAddress : ref);
      const pL = Number(await FarmService.poolLength());
      farming.setPoolLength(pL);
      for (let i = 0; i < pL; ++i) {
        const poolInfo = await FarmService.poolInfo(i, '1');
        console.log('farm planets, poolinfo:', poolInfo);
        const userInfo = await FarmService.userInfo(i, P.priAccount);
        if (poolInfo) {
          let p = { poolInfo, userInfo, pid: i };
          if (zero(Number(poolInfo.allocPoint))) farming.setInactiveFarms(p);
          else {
            Number(userInfo.amount) > 0 &&
            farming.setStakingOnly(p)
            farming.setFarms(p);
          }
        }
      }
    } catch(e) {
      console.log(e);
    } finally {dsp(stopLoading())}
  };

  return (
    <div className="container_wrap farmpln frm_plnet_disply">
      <div className="upper_text">
        <Container>
          <Row>
            <Col xl={6} className="pl-0">
              <div className="farm_title">
                <div className="farm_icon">
                  <img src={FarmIcon} />
                </div>
                <div className="desc">
                  <h1 className="title_hd">Farm Planets</h1>
                  <p>
                    There is so much to explore! NIOB Swap offers multiple
                    farming opportunities to you. Get amazing rewards by staking
                    your LP tokens in return for additional NIOB Tokens.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <div className="farm_srchbar">
        <Container>
          <div className="contain_area">
            <Form className="srchbar_area">
              <div className="serch_field">
                <Form.Label>Search</Form.Label>
                <InputGroup>
                  <FormControl id="search" placeholder="Niob" />
                  <Button className="search_btn">
                    <img src={Searchicon} />
                  </Button>
                </InputGroup>
              </div>
              <div className="staked_only">
                <Form.Check
                  type="checkbox"
                  id="stakecheck"
                  label="Staked only"
                  checked={farming.checked}
                  onChange={Farmer.handleChange}
                />
                <Button className="btn harvest_btn">Harvest all</Button>
              </div>
            </Form>
            <div className="frm_plnet_list">
              <div className="farm_tabs">
                <Tabs
                  activeKey={tab}
                  id="frmplanet_tab"
                  variant="pills"
                  onSelect={Farmer.handleTab}
                >
                  <Tab eventKey="active" title="Active">
                    <Active 
                      activeFarms={farming.checked ? farming.stakingOnly : farming.farms}
                      harvest={Farmer.harvest} 
                      cIndex={farming.currentIndex} 
                      changeHandler={farming.handleIndex}
                      stakeHandler={Farmer.stakeHandle}
                      roiModalHandler={Farmer.handleRoiModal}
                    />
                  </Tab>

                  <Tab eventKey="inactive" title="Inactive">
                  <Inactive 
                      inactiveFarms={farming.inactiveFarms}
                      harvest={Farmer.harvest} 
                      cIndex={farming.currentIndex} 
                      changeHandler={farming.handleIndex}
                      stakeHandler={Farmer.stakeHandle}
                      roiModalHandler={Farmer.handleRoiModal}
                    />
                  </Tab>
                </Tabs>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <GetLPToken
        stakeValue={farming.stakeValue}
        stakeData={farming.stakeData}
        stakeConfirmation={farming.stakeConfirmation}
        handleStakeValue={Farmer.handleStakeValue}
        depositWithdraw={Farmer.depositWithdraw}
        setMaxValue={Farmer.setMaxValue}
        show={farming.showStake}
        closeStakeModal={Farmer.handleClose}
      />
      <WithDrawLPToken
        stakeValue={farming.stakeValue}
        stakeData={farming.stakeData}
        stakeConfirmation={farming.stakeConfirmation}
        handleStakeValue={Farmer.handleStakeValue}
        depositWithdraw={Farmer.depositWithdraw}
        setMaxValue={Farmer.setMaxValue}
        show={farming.showStakeWithdraw}
        closeStakeModal={Farmer.handleWithdrawClose}
        isNiobWithdrawabe={false}
      />
      <TransactionalModal
        show={farming.showTransactionModal}
        handleClose={Farmer.closeTransactionModal}
        txHash={common.txHash}
      />
    </div>
  );
};

export default FarmPlanets;
