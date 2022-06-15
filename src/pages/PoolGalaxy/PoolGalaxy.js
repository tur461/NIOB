import React, { useEffect, useState } from "react";
import Button from "@restart/ui/esm/Button";
import {
  Container,
  Col,
  Row,
  Form,
  InputGroup,
  FormControl,
  Tabs,
  Tab,
} from "react-bootstrap";
import Searchicon from "../../assets/images/search.png";
import PoolIcon from "../../assets/images/Pool-Header-Logo.svg";
import "./PoolGalaxy.scss";
import { useDispatch, useSelector } from "react-redux";
import { addTransaction, startLoading, stopLoading } from "../../redux/actions";
import { FarmService } from "../../services/FarmService";
import { ContractServices } from "../../services/ContractServices";
import { ExchangeService } from "../../services/ExchangeService";
import { toast } from "../../components/Toast/Toast";
import BigNumber from "bignumber.js";
import GetLPToken from "../../components/GetLPToken/GetLPToken";
import WithDrawLPToken from "../../components/GetLPToken/WithDrawLPToken";
import TransactionalModal from "../../components/TransactionalModal/TransactionalModal";
import ReturnInvest from "../../components/ReturnInvest/ReturnInvest"
import { ANCHOR_BUSD_LP } from "../../assets/tokens";
import PoolInactive from "./PoolInactive";
import PoolActive from "./PoolActive";

function PoolGalaxy(props) {
  const {
    match: { params },
    history,
  } = props;
  const { tab } = params;
  const P = useSelector(s => s.persist);
  // const handleTab = (data) => {
  //   history.push(`${rootName}/farmplanets/${data}`);
  // };

  const handleClose = () => { setStakeValue(null); setShowStake(false) };
  const handleWithdrawClose = () => { setStakeValue(null); setShowStakeWithdraw(false) };

  const dispatch = useDispatch();

  const [checked, setChecked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showStake, setShowStake] = useState(false);
  const [showStakeWithdraw, setShowStakeWithdraw] = useState(false);
  const [showAPY, setShowAPY] = useState(false);
  const [roiModalData, setRoiModalData] = useState(null);

  const [poolLength, setPoolLength] = useState(0);
  const [farms , setFarms] = useState([]);
  const [inactiveFarms, setInactiveFarms] = useState([]);
  const [stakingOnly, setStakingOnly] = useState([]);
  const [stakeData, setStakeData] = useState(null);
  const [stakeValue, setStakeValue] = useState(0);
  const [referrer, setReferrer] = useState('0x0000000000000000000000000000000000000000');

  const [stakeConfirmation, setStakeConfimation] = useState(0);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [lpDetails, setLpTokenDetails] = useState(null);
  const [niobStats, setNiobStats] = useState(null);


  //staking only
  const handleChange = () => setChecked(!checked);

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setFarms([]);
    setInactiveFarms([]);
    setStakingOnly([]);
    init();
    window.location.reload();
  }

  const cloaseRoiModal = () => {
    setShowAPY(false);
  }
  const handleRoiModal = (data, lpDetails, niobId) => {
    setNiobStats(niobId);
    setRoiModalData(data);
    setLpTokenDetails(lpDetails);
    setShowAPY(true);
  }

  const handleIndex = (index) => {
    if (currentIndex === index) {
      setCurrentIndex(-1);
    } else {
      setCurrentIndex(index);
    }
  };


  const getValue = async (address) => {
    if (address != undefined) {
      try {
        const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
        let val = reserves[1] / reserves[0];
        val = val || 0;
        return (val.toFixed(3));

      } catch (error) {
        console.log(error)
      }
    }

  }


  //this will re-arrange locked pool to desired position
  const getSortedPools = (array, from, to) => {
    if (to === from) return array;

    let target = array[from];
    let increment = to < from ? -1 : 1;

    for (let k = from; k != to; k += increment) {
      array[k] = array[k + increment];
    }
    array[to] = target;
    return array;
  }

  useEffect(() => {
    init();
    return () => {
      setFarms([]);
      setInactiveFarms([]);
    }
  }, [P.isConnected]);

  const init = async () => {
    try {
      dispatch(startLoading());
      const pL = Number(await FarmService.poolLength());
      // console.log('qq', pL);
      setPoolLength(pL);
      // let farmsTemp = [];
      dispatch(stopLoading());
      for (let i = 0; i < pL; i++) {

        const poolInfo = await FarmService.poolInfo(i, '2');
        const niobId = await FarmService.niobId();
        const userInfo = await FarmService.userInfo(i, P.priAccount);
        const dollarVal = await getValue(poolInfo.lpToken);
        if (poolInfo) {
          if (Number(poolInfo.allocPoint) === 0) {
            setInactiveFarms(inactiveFarms => [...inactiveFarms, { poolInfo, userInfo, pid: i, isLocked: niobId == i ? true : false, dollarVal }]);
          } else {
            if (Number(userInfo.amount) > 0) {
              // stakingOnlyArrayToSort.push({ poolInfo, userInfo, pid: i, niobId })
              setStakingOnly(stakingOnly => [...stakingOnly, { poolInfo, userInfo, pid: i, isLocked: false, dollarVal }]);
            }
            // activePoolsToSort.push({ poolInfo, userInfo, pid: i, niobId })
            setFarms(farms => [...farms, { poolInfo, userInfo, pid: i, niobId, isLocked: false, dollarVal }]);
          }
        }
      }
      // these are the inactive pools

    } catch (err) {
      console.log(err)
    }
  };
  const closeStakeModal = () => {
    setShowStakeWithdraw(false);
    setShowStake(false);
    setStakeData(null);
    setStakeValue(0);
  }
  const handleROIModal = () => {
    setShowStakeWithdraw(false);
    setShowStake(false);
    setStakeData(null);
    setStakeValue(0);
  }
  const stakeHandle = (data, type) => {
    if (type === 'withdraw') {
      setStakeData(data);
      setShowStakeWithdraw(true);
    }
    if (type === 'deposit') {
      setStakeData(data);
      setShowStake(true);
    }
  }

  const handleStakeValue = e => {
    const value = e.target.value;
    setStakeValue(value);
  }
  const setMaxValue = () => setStakeValue(stakeData.balance);

  const harvest = async (pid, lpTokenName) => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== P.priAccount.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }

    if (stakeConfirmation) {
      return toast.info('Transaction is processing!');
    }
    setStakeConfimation(true);
    const data = {
      pid: pid.toString(),
      amount: 0,
      referrer: referrer,
      from: P.isConnected
    }
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
          tx: result
        };
        dispatch(addTransaction(data));
      }
    } catch (err) {
      console.log(err, 'lp harvest');
      dispatch(stopLoading());
      setStakeConfimation(false);

      const message = await ContractServices.web3ErrorHandle(err);
      toast.error(message);
    }
  }

  const depositWithdraw = async (type, isLocked) => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== P.isConnected.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }
    const value = Number(stakeValue);
    if (isNaN(value)) {
      return toast.error('Enter vaild amount!');
    }
    if (value <= 0) {
      return toast.error('Enter amount greater than zero!');
    }
    if (value > stakeData.balance) {
      return toast.error('Value is greater than max value!');
    }
    if (!stakeData) {
      return toast.info('Reload page try again!');
    }
    if (stakeConfirmation) {
      return toast.info('Transaction is processing!');
    }
    setStakeConfimation(true);
    if (type === 'deposit') {
      const amount = BigNumber(value * 10 ** stakeData.lpTokenDetails.decimals).toFixed();
      // const deposit = '10000';

      const data = {
        pid: stakeData.pid.toString(),
        amount,
        referrer: referrer,
        from: P.isConnected,
      }
      // console.log(data, 'before deposit----------farm--------------');
      try {
        closeStakeModal();
        dispatch(startLoading());
        const result = await FarmService.deposit(data);
        dispatch(stopLoading());
        setStakeConfimation(false);

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);

          const data = {
            message: `Deposit ${stakeData.lpTokenDetails.lpTokenName}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
      } catch (err) {
        console.log(err, 'lp deposit');
        dispatch(stopLoading());
        setStakeConfimation(false);

        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
      }
    }
    if (type === 'withdraw') {
      const amount = BigNumber(value * 10 ** stakeData.lpTokenDetails.decimals).toFixed();

      const data = {
        pid: stakeData.pid.toString(),
        amount,
        from: P.isConnected
      }
      // console.log(data, 'before withdraw----------farm--------------');
      try {
        closeStakeModal();
        dispatch(startLoading());
        let result;
        if (isLocked) {
          console.log('zzz', data);
          result = await FarmService.withdrawNiob(data);
        } else {
          result = await FarmService.withdraw(data);
        }
        dispatch(stopLoading());
        setStakeConfimation(false);

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);

          const data = {
            message: `Withdraw ${stakeData.lpTokenDetails.lpTokenName}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
      } catch (err) {
        console.log(err, 'lp withdraw');
        dispatch(stopLoading());
        setStakeConfimation(false);

        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);

      }
    }
  }
  
  return (
    <div className="container_wrap farmpln poolGalaxy_cont">
      <div className="upper_text">
        <Container>
          <Row>
            <Col xl={6} className="pl-0">
              <div className="farm_title">
                <div className="farm_icon">
                  <img src={PoolIcon} />
                </div>
                <div className="desc">
                  <h1 className="title_hd">Pool Galaxy</h1>
                  <p>
                    Stake NIOB to earn new tokens. You can unstake at any time!
                    Rewards are calculated per block.
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
                //   onSelect={handleTab}
                >

                  <Tab eventKey="active" title="Active">
                    <PoolActive 
                      checked={checked}
                      activeFarms={checked ? stakingOnly : farms}
                      harvest={harvest} 
                      cIndex={currentIndex} 
                      changeHandler={handleIndex}
                      stakeHandler={stakeHandle}
                      roiModalHandler={handleRoiModal}
                    />
                  </Tab>

                  <Tab eventKey="inactive" title="Inactive">
                    <PoolInactive 
                      inactiveFarms={inactiveFarms} 
                      harvest={harvest} 
                      cIndex={currentIndex} 
                      changeHandler={handleIndex}
                      stakeHandler={stakeHandle}
                      roiModalHandler={handleRoiModal}
                    />
                  </Tab>

                </Tabs>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <GetLPToken stakeValue={stakeValue} stakeData={stakeData} stakeConfirmation={stakeConfirmation} handleStakeValue={handleStakeValue} depositWithdraw={depositWithdraw} setMaxValue={setMaxValue} show={showStake} closeStakeModal={handleClose} />
      <WithDrawLPToken stakeValue={stakeValue} stakeData={stakeData} stakeConfirmation={stakeConfirmation} handleStakeValue={handleStakeValue} depositWithdraw={depositWithdraw} setMaxValue={setMaxValue} show={showStakeWithdraw} closeStakeModal={handleWithdrawClose} address={P.isConnected} isNiobWithdrawabe={true} />
      <TransactionalModal show={showTransactionModal} handleClose={closeTransactionModal} txHash={txHash} />
      {showAPY && <ReturnInvest
        show={showAPY}
        niobId={niobStats}
        roiModalData={roiModalData}
        lpDetails={lpDetails}
        handleClose={cloaseRoiModal}
      />}
    </div>
  );
}

export default PoolGalaxy;