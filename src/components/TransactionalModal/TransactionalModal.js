import React from "react";
import { Col, Row, Modal, Button } from "react-bootstrap";
import "./TransactionalModal.scss";
import { useSelector } from "react-redux";
import { BSC_SCAN } from "../../constant";
import checkicon from "../../assets/images/check_icon.svg";

const TransactionalModal = ({ show, handleClose, txHash }) => {
  const recentTransactions = useSelector(
    (state) => state.persist.recentTransactions
  );

  return (
    <Modal
      centered
      scrollable={true}
      className="connect_wallet"
      show={show}
      onHide={handleClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Transaction Submitted</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col className="baseToken_style">
            <img src={checkicon} alt="icon" width="85" className="icon_color" />
            <a
              href={`${BSC_SCAN}tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              View on BscScan
            </a>
            <div className="no_record">
              <button type="button" className="btn buttonStyle full" onClick={handleClose}>Close</button>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default TransactionalModal;
