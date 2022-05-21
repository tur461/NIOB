import React from "react";
import { Col, Row, Modal, Button } from "react-bootstrap";
import "./SupplyModal.scss";
import { useSelector } from "react-redux";

const SupplyModal = ({
  show,
  handleClose,
  addLiquidity,
  liquidityConfirmation,
  tokenOne,
  tokenTwo,
  slippagePercentage,
  tokenOneCurrency,
  tokenOneValue,
  tokenTwoCurrency,
  tokenTwoValue,
  calculateFraction,
  sharePoolValue,
}) => {
  const isUserConnected = useSelector((state) => state.persist.isUserConnected);

  return (
    <Modal
      centered
      scrollable={true}
      className="connect_wallet supply_mode"
      show={show}
      onHide={handleClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>You are creating a pool</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col className="baseToken_style">
            <ul>
              <li className="d_flx">
                <h2>
                  {tokenOne.symbol}/{tokenTwo.symbol}
                </h2>
                <img src={tokenOne.icon} alt="icon" />
                <img src={tokenTwo.icon} alt="icon" />
              </li>
              <li>
                <p className="estimate">
                  Output is estimated. If the price changes by more than{" "}
                  {slippagePercentage}% your transaction will revert.
                </p>
              </li>
              <li>
                <div className="pool_list">
                  <ul>
                    <li>
                      {tokenOneCurrency} Deposit: <span> {tokenOneValue}</span>
                    </li>
                    <li>
                      {tokenTwoCurrency} Deposit:<span> {tokenTwoValue}</span>
                    </li>
                    <li>
                      Rates{" "}
                      <p>
                        {1}&nbsp;{tokenOneCurrency} = {calculateFraction("TK1")}
                        &nbsp;{tokenTwoCurrency} <br />
                        {1}&nbsp;{tokenTwoCurrency} = {calculateFraction("TK2")}
                        &nbsp;{tokenOneCurrency}
                      </p>
                    </li>
                    <li>
                      Share of Pool: <span>{sharePoolValue}% </span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="mb-0 mt-4">
              <Col className="btnCol">
                <Button
                  className="approveBtn"
                  disabled={liquidityConfirmation}
                  onClick={() => addLiquidity()}
                >
                  {isUserConnected ? "Create Pool & Supply" : "Unlock Wallet"}
                </Button>
              </Col>
              </li>
            </ul>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default SupplyModal;
