import React, {useState} from "react";
import {Container, Tab, Tabs, Col, Row} from "react-bootstrap";

import Exchange from "./Exchange";
import Liquidity from "././Liquidity";
import {rootName} from '../../constant'
import "./Trade.scss";
import AddLiquidity from "./AddLiquidity";
import ImportPool from "./ImportPool";
import { useSelector } from "react-redux";
import { toast } from "../../components/Toast/Toast";

const Trade = (props) => {
  const { match: { params }, history } = props;
  const { tab, fillter } = params;
  const [colLiquidity, setColLiquidity] = useState(1);
  const isUserConnected = useSelector(state => state.persist.isUserConnected);
  const [lptoken, setLptoken] = useState(null);

  const handleTab = (data) => {
    if (data === "Bridge") {
      const tab = window.open('https://www.binance.org/en/bridge?utm_source=Niob', '_blank');
      tab.focus();
    }
    else history.push(`${rootName}/trade/${data}`)
  }


  const handleComponent = (value) => {
    if (!isUserConnected) {
      return toast.error('Connect wallet first!');
    }
    setColLiquidity(value)
  }
  const handleAddLiquidity = (lp) => {
    if (!isUserConnected) {
      return toast.error('Connect wallet first!');
    }
    setLptoken(lp);
    history.push(`${rootName}/trade/liquidity/addLiquidity`)
  }
  const handleRemove = (lp) => {
    // console.log('hitt');
    // console.log('this is lp ==>>', lp);
    if (!isUserConnected) {
      return toast.error('Connect wallet first!');
    }
    setLptoken(lp);
  }
  const [ key, setKey ] = useState('deutsch');
  return (
    <div className="container_wrap trade">
      <Container fluid className="swapScreen comnSection">
        <Container className="smallContainer">
          <h2 className="text-center swap_title">Make a Swap</h2>
          <Row>
            
            <Col md={12}>
              <div className="comnBlk">
                <Tabs activeKey={tab} defaultActiveKey="swap" id="uncontrolled-tab-example" className="mb-3" onSelect={handleTab}>
                  <Tab eventKey="exchange" title="Swap">
                    <Exchange />
                  </Tab>
                  <Tab eventKey="liquidity" title="Liquidity">
                    {fillter === "addLiquidity" ? <AddLiquidity lptoken={lptoken} /> : fillter === "importPool" ? <ImportPool lptoken={lptoken} /> : <Liquidity handleAddLiquidity={handleAddLiquidity} handleRemove={handleRemove} lptoken={lptoken} />}
                  </Tab>
                  <Tab eventKey="Bridge" title="Bridge">Bridge</Tab>
                </Tabs>
              </div>
            </Col>
          </Row>
        </Container>
      </Container>
    </div>
  );
};

export default Trade;
