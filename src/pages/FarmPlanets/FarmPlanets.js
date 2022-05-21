import Button from "@restart/ui/esm/Button";
import React, { useEffect, useState } from "react";
import {
  Container,
  Col,
  Row,
  Form,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import {
  addTransaction,
  searchTokenByNameOrAddress,
  startLoading,
  stopLoading,
} from "../../redux/actions";
import { ReferralsServices } from "../../services/ReferralsServices";
import { FarmService } from "../../services/FarmService";
import { toast } from "../../components/Toast/Toast";
import { ContractServices } from "../../services/ContractServices";
import BigNumber from "bignumber.js";
import GetLPToken from "../../components/GetLPToken/GetLPToken";

import { Tabs, Tab } from "react-bootstrap";
import { rootName } from "../../constant";
import Searchicon from "../../assets/images/search.png";
import FarmIcon from "../../assets/images/Farm-Header-Logo.svg";
import "./FarmPlanets.scss";
import PlanetCard from "../../components/PlanetCard/PlanetCard";
import NIOB from "../../assets/images/token_icons/NIOB.svg";
import BUSD from "../../assets/images/token_icons/BUSD-Token.svg";
import ANCHOR from "../../assets/images/token_icons/ANCHOR-Token.svg";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import WithDrawLPToken from "../../components/GetLPToken/WithDrawLPToken";
import TransactionalModal from "../../components/TransactionalModal/TransactionalModal";
import TransactionModal from "../../components/TransactionModal/TransactionModal";

const FarmPlanets = (props) => {
  const {
    match: { params },
    history,
  } = props;
  const { tab } = params;
  const handleTab = (data) => {
    history.push(`${rootName}/farmplanets/${data}`);
  };

  const handleClose = () => {
    setStakeValue(null);
    setShowStake(false);
  };
  const handleWithdrawClose = () => {
    setStakeValue(null);
    setShowStakeWithdraw(false);
  };

  const dispatch = useDispatch();
  const isUserConnected = useSelector((state) => state.persist.isUserConnected);
  const referralAddress = useSelector((state) => state.persist.referralAddress);

  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showStake, setShowStake] = useState(false);
  const [showStakeWithdraw, setShowStakeWithdraw] = useState(false);
  const [showAPY, setShowAPY] = useState(false);
  const [roiModalData, setRoiModalData] = useState(null);

  const [poolLength, setPoolLength] = useState(0);
  const [farms, setFarms] = useState([]);
  const [inactiveFarms, setInactiveFarms] = useState([]);
  const [stakingOnly, setStakingOnly] = useState([]);
  const [stakeData, setStakeData] = useState(null);
  const [stakeValue, setStakeValue] = useState(0);
  const [referrer, setReferrer] = useState(
    "0x0000000000000000000000000000000000000000"
  );

  const [stakeConfirmation, setStakeConfimation] = useState(0);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [lpDetails, setLpTokenDetails] = useState(null);
  const [selectedPairId, setSelectedPairId] = useState();

  //staking only
  const handleChange = () => setChecked(!checked);

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setFarms([]);
    setInactiveFarms([]);
    setStakingOnly([]);
    init();
    window.location.reload();
  };

  const cloaseRoiModal = () => {
    setShowAPY(false);
  };
  const handleRoiModal = (data, lpDetails) => {
    setRoiModalData(data);
    setLpTokenDetails(lpDetails);
    setShowAPY(true);
  };

  const handleIndex = (index) => {
    if (currentIndex === index) {
      setCurrentIndex(-1);
    } else {
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    init();
    return () => {
      setFarms([]);
      setInactiveFarms([]);
    };
  }, [isUserConnected]);

  const init = async () => {
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
      const pL = Number(await FarmService.poolLength());
      setPoolLength(pL);
      dispatch(stopLoading());
      for (let i = 0; i < pL; i++) {
        const poolInfo = await FarmService.poolInfo(i, "1");
        const userInfo = await FarmService.userInfo(i, isUserConnected);
        // console.log(userInfo, '------i------', i);
        if (poolInfo) {
          if (Number(poolInfo.allocPoint) === 0) {
            setInactiveFarms((inactiveFarms) => [
              ...inactiveFarms,
              { poolInfo, userInfo, pid: i },
            ]);
          } else {
            if (Number(userInfo.amount) > 0) {
              // console.log('index', i);
              setStakingOnly((stakingOnly) => [...stakingOnly, { poolInfo, userInfo, pid: i }]);
            }
            setFarms((farms) => [...farms, { poolInfo, userInfo, pid: i }]);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const closeStakeModal = () => {
    setShowStakeWithdraw(false);
    setShowStake(false);
    setStakeData(null);
    setStakeValue(0);
  };

  const stakeHandle = (data, type) => {
    // setSelectedPairId is used for getting the id of the farm that user clicked (and staked) to
    // change the values of only single farm --will be implemented in future
    setSelectedPairId(data.pid);
    if (type === "withdraw") {
      setStakeData(data);
      setShowStakeWithdraw(true);
    }
    if (type === "deposit") {
      setStakeData(data);
      setShowStake(true);
    }
  };

  const handleStakeValue = (e) => {
    const value = e.target.value;
    setStakeValue(value);
  };
  const setMaxValue = () => setStakeValue(stakeData.balance);

  const harvest = async (pid, lpTokenName) => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error("Wallet address doesn`t match!");
    }

    if (stakeConfirmation) {
      return toast.info("Transaction is processing!");
    }
    setStakeConfimation(true);
    const data = {
      pid: pid.toString(),
      amount: 0,
      referrer: referrer,
      from: isUserConnected,
    };
    try {
      dispatch(startLoading());
      const result = await FarmService.deposit(data);
      dispatch(stopLoading());
      setStakeConfimation(false);

      if (result) {
        setTxHash(result);
        setShowTransactionModal(true);

        const data = {
          message: `Harvest ${lpTokenName}`,
          tx: result,
        };
        dispatch(addTransaction(data));
      }
    } catch (err) {
      console.log(err, "lp harvest");
      dispatch(stopLoading());
      setStakeConfimation(false);

      const message = await ContractServices.web3ErrorHandle(err);
      toast.error(message);
    }
  };

  // // this function will be used to change the values of single farm that user clicked and staked
  // const refreshChangedItem = async () => {
  //   try {
  //     dispatch(startLoading());
  //     let ref = await ReferralsServices.getReferrer(isUserConnected);
  //     if (ref === '0x0000000000000000000000000000000000000000') {
  //       if (referralAddress && referralAddress !== '0x0000000000000000000000000000000000000000') {
  //         ref = referralAddress;
  //       }
  //       setReferrer(ref);
  //     }
  //     const pL = Number(await FarmService.poolLength());
  //     setPoolLength(pL);
  //     // let farmsTemp = [];
  //     dispatch(stopLoading());
  //     for (let i = 0; i < pL; i++) {
  //       const poolInfo = await FarmService.poolInfo(i, '1');
  //       const userInfo = await FarmService.userInfo(i, isUserConnected);
  //       // console.log(userInfo, '------i------', i);
  //       if (poolInfo) {
  //         if (Number(poolInfo.allocPoint) === 0) {
  //           setInactiveFarms(inactiveFarms => [...inactiveFarms, { poolInfo, userInfo, pid: i }]);
  //         } else {
  //           if (Number(userInfo.amount) > 0) {
  //             console.log('index', i);
  //           }
  //           // setStakingOnly(stakingOnly => stakingOnly.pid === selectedPairId ?  { poolInfo, userInfo, pid: i }: stakingOnly);
  //           // setFarms(farms => [...farms, { poolInfo, userInfo, pid: i }]);
  //           let newArr = [...farms]; // copying the old farms
  //           newArr[selectedPairId] = { poolInfo, userInfo, pid: selectedPairId };
  //           setFarms(newArr);
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  const depositWithdraw = async (type) => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error("Wallet address doesn`t match!");
    }
    const value = Number(stakeValue);
    if (isNaN(value)) {
      return toast.error("Enter vaild amount!");
    }
    if (value <= 0) {
      return toast.error("Enter amount greater than zero!");
    }
    if (value > stakeData.balance) {
      return toast.error("Value is greater than max value!");
    }
    if (!stakeData) {
      return toast.info("Reload page try again!");
    }
    if (stakeConfirmation) {
      return toast.info("Transaction is processing!");
    }
    setStakeConfimation(true);
    if (type === "deposit") {
      const amount = BigNumber(
        value * 10 ** stakeData.lpTokenDetails.decimals
      ).toFixed();

      const data = {
        pid: stakeData.pid.toString(),
        amount,
        referrer: referrer,
        from: isUserConnected,
      };
      // console.log('sending this deposit data' ,data);
      try {
        closeStakeModal();
        dispatch(startLoading());
        const result = await FarmService.deposit(data);
        setStakeConfimation(false);
        dispatch(stopLoading());

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);

          const data = {
            message: `Deposit ${stakeData.lpTokenDetails.lpTokenName}`,
            tx: result,
          };
          dispatch(addTransaction(data));
        }
      } catch (err) {
        console.log(err, "lp deposit");
        dispatch(stopLoading());
        setStakeConfimation(false);

        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
      }
    }
    if (type === "withdraw") {
      const amount = BigNumber(
        value * 10 ** stakeData.lpTokenDetails.decimals
      ).toFixed();
      const data = {
        pid: stakeData.pid.toString(),
        amount,
        from: isUserConnected,
      };
      // console.log('sending this withdraw data' , data);
      try {
        closeStakeModal();
        dispatch(startLoading());
        const result = await FarmService.withdraw(data);
        dispatch(stopLoading());
        setStakeConfimation(false);

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);

          const data = {
            message: `Withdraw ${stakeData.lpTokenDetails.lpTokenName}`,
            tx: result,
          };
          dispatch(addTransaction(data));
        }
      } catch (err) {
        console.log(err, "lp withdraw");
        dispatch(stopLoading());
        setStakeConfimation(false);

        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
      }
    }
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
                    farming oppurtunities to you. Get amazing rewards by staking
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
                  checked={checked}
                  onChange={handleChange}
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
                  onSelect={handleTab}
                >
                  <Tab eventKey="active" title="Active">
                    <div className="planet_list active">
                      <Row>
                        <Col xl={12}>
                          {checked && (
                          <div className="planet_list_view">
                              {stakingOnly.map((farm, index) => (
                                <PlanetCard
                                  key={index}
                                  index={index}
                                  harvestOnClick={harvest}
                                  currentIndex={currentIndex}
                                  handleChange={() => handleIndex(index)}
                                  stakeHandle={stakeHandle}
                                  handleRoiModal={handleRoiModal}
                                  status={true}
                                  farm={farm}
                                  icon1={NIOB}
                                  icon2={BUSD}
                                  title={`NIOB`}
                                  title1={`BUSD`}
                                />
                              ))}
                            </div>
                          )}

                          {!checked && <div className="planet_list_view">
                              {farms.map((farm, index) => (
                                <PlanetCard
                                  key={index}
                                  index={index}
                                  harvestOnClick={harvest}
                                  currentIndex={currentIndex}
                                  handleChange={() => handleIndex(index)}
                                  stakeHandle={stakeHandle}
                                  handleRoiModal={handleRoiModal}
                                  status={true}
                                  farm={farm}
                                  icon1={NIOB}
                                  icon2={BUSD}
                                  title={`NIOB`}
                                  title1={`BUSD`}
                                />
                              ))}
                            </div> 
                          }
                        </Col>
                      </Row>
                    </div>
                  </Tab>

                  <Tab eventKey="inactive" title="Inactive">
                    <div className="planet_list active">
                      <Row>
                        <Col xl={12}>
                          <div className="planet_list_view">
                            {inactiveFarms.map((farm, index) => (
                              <PlanetCard
                                key={index}
                                index={index}
                                harvestOnClick={harvest}
                                currentIndex={currentIndex}
                                handleChange={() => handleIndex(index)}
                                stakeHandle={stakeHandle}
                                handleRoiModal={handleRoiModal}
                                status={true}
                                farm={farm}
                                icon1={NIOB}
                                icon2={BUSD}
                                title={`NIOB`}
                                title1={`BUSD`}
                              />
                            ))}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <GetLPToken
        stakeValue={stakeValue}
        stakeData={stakeData}
        stakeConfirmation={stakeConfirmation}
        handleStakeValue={handleStakeValue}
        depositWithdraw={depositWithdraw}
        setMaxValue={setMaxValue}
        show={showStake}
        closeStakeModal={handleClose}
      />
      <WithDrawLPToken
        stakeValue={stakeValue}
        stakeData={stakeData}
        stakeConfirmation={stakeConfirmation}
        handleStakeValue={handleStakeValue}
        depositWithdraw={depositWithdraw}
        setMaxValue={setMaxValue}
        show={showStakeWithdraw}
        closeStakeModal={handleWithdrawClose}
        isNiobWithdrawabe={false}
      />
      <TransactionalModal
        show={showTransactionModal}
        handleClose={closeTransactionModal}
        txHash={txHash}
      />
    </div>
  );
};

export default FarmPlanets;
