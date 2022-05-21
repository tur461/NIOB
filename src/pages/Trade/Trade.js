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
            <Col md={6} lg={4}>
              <div className="comnBlk lang-blk">

                <Tabs activeKey={key} defaultActiveKey="english" id="tab-example" className="  lang-tab"
                  onSelect={(k) => setKey(k)}>
                  <Tab eventKey="english" title="English" className="lang-content">
                    <h2>Important Information</h2>
                    <p>Never execute a swap if the offered value for the target currency does not correspond to the market price! If there is not enough liquidity available on NIOB Swap for the desired pair (for example BNB to DOT), the price cannot be met.
                      <br /><br />   <strong> After entering both tokens you will see the summary of the exchange in the swap window.</strong>
                      <br /><br />    If the exchange gets still confirmed, the lost amount cannot be refunded! <br /><br />
                      <strong>  USER IS SOLELY RESPONSIBLE FOR ANY LOSSES CAUSED BY LOW LIQUIDITY!</strong> 
                    </p>
                  </Tab>
                  <Tab eventKey="deutsch" title="Deutsch" className="lang-content">

                    <h2>Wichtige Information</h2>
                    <p>Niemals einen Swap durchführen wenn der angebotene Wert für die Zielwährung nicht dem Marktpreis entspricht! Sollte für das gewünschte Paar (zum Beispiel BNB zu DOT) nicht genügend Liquidität auf der Exchange zur Verfügung stehen, kann der Preis nicht eingehalten werden. 
                      <br /><br />   <strong> Nach der Eingabe beider Token seht ihr die Zusammenfassung des Exchange im Swap Fenster.</strong>
                      <br /><br />  <strong> Der Nutzer ist allein verantwortlich für Verluste, die durch geringe Liquidität entstehen! </strong> <br /><br />
                    </p>

                  </Tab>
                </Tabs>
              </div>
            </Col>
            <Col md={6}>
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
