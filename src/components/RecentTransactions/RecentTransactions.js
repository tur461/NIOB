import React from "react";
import { Col, Row, Modal } from "react-bootstrap";
import Button from "../Button/Button";
import "./RecentTransactions.scss";
import { useSelector } from "react-redux";
import { BSC_SCAN } from "../../constant";

const RecentTransactions = ({ show, handleClose }) => {
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
        <Modal.Title>Recent Transactions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col className="baseToken_style recent_trans">
            <ul>
              <li>
                {recentTransactions.length > 0 ? (
                  <ul>
                    {recentTransactions.map((t, index) => (
                      <li key={index}>
                        <div className="tran_list_view">
                          <a
                            target="_blank"
                            rel="noreferrer noopener"
                            href={`${BSC_SCAN}tx/${t.tx}`}
                            className="success"
                          >
                            {t.message}
                            <svg
                              viewBox="0 0 24 24"
                              color="primary"
                              width="20px"
                              xmlns="http://www.w3.org/2000/svg"
                              className="sc-bdfBwQ glXgPM"
                            >
                              <path d="M18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H11C11.55 5 12 4.55 12 4C12 3.45 11.55 3 11 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13C21 12.45 20.55 12 20 12C19.45 12 19 12.45 19 13V18C19 18.55 18.55 19 18 19ZM14 4C14 4.55 14.45 5 15 5H17.59L8.46 14.13C8.07 14.52 8.07 15.15 8.46 15.54C8.85 15.93 9.48 15.93 9.87 15.54L19 6.41V9C19 9.55 19.45 10 20 10C20.55 10 21 9.55 21 9V4C21 3.45 20.55 3 20 3H15C14.45 3 14 3.45 14 4Z"></path>
                            </svg>
                          </a>
                        </div>
                        <div className="tran_succ_icon">
                          <svg
                            viewBox="0 0 24 24"
                            color="success"
                            width="20px"
                            xmlns="http://www.w3.org/2000/svg"
                            className="success"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15.88 8.29L10 14.17L8.12 12.29C7.73 11.9 7.1 11.9 6.71 12.29C6.32 12.68 6.32 13.31 6.71 13.7L9.3 16.29C9.69 16.68 10.32 16.68 10.71 16.29L17.3 9.7C17.69 9.31 17.69 8.68 17.3 8.29C16.91 7.9 16.27 7.9 15.88 8.29Z"></path>
                          </svg>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="no_record">
                    <p>No recent Transactions</p>
                    <Button type="button" onClick={handleClose} title="Close" />
                  </div>
                )}
              </li>
            </ul>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default RecentTransactions;
