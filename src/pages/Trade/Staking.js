import React from "react";
import {
  Container,
  Col,
  Row,
  Button,
  Form,
  FormControl,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Reflink from "../../assets/images/reflink-icon.svg";
import Twitter from "../../assets/images/twitter-icon.svg";
import Telegram from "../../assets/images/telegram-icon.svg";
import "./Staking.scss";

const Referral = () => {
  return (
    <div className="container_wrap referral_page">
      <div className="timeto_connect">
        <Container className="custom_container">
          <Row>
            <Col>
              <div className="staking_block">
                <div className="staking_head">
                  <p>Stake</p>
                </div>
                <p className="para">
                  Balance <span className="ms-2">123</span>
                </p>
                <div className="staking_content">
                  <FormControl placeholder="Input" />
                  <div className="duration_sec">
                    <Button className="time_duration">60 days</Button>
                    <Button className="time_duration">90 days</Button>
                    <Button className="time_duration">120 days</Button>
                  </div>
                  <div className="text_area text-white">
                    <div className="d-flex flex-column">
                      <p className="d-flex">
                        <span>APY:</span>
                        <span className="ms-2">20%</span>
                      </p>
                      <p className="d-flex">
                        <span>Lock Days:</span> <span className="ms-2">60</span>
                      </p>
                      <p className="d-flex">
                        <span>Final Rewards:</span>{" "}
                        <span className="ms-2">60</span>
                      </p>
                    </div>
                    <div>
                      <p className="d-flex">
                        <span>Daily Rewards:</span>{" "}
                        <span className="ms-2">60</span>
                      </p>
                    </div>
                  </div>
                  <Button className="stake_btn">Stake</Button>
                </div>
                <div className="duration_bits">
                  <h3>60 days</h3>
                  <div className="value_sec px-3">
                    <div className="value_amount_sec d-block">
                      <div className="value_amount d-flex">
                        <p>Stake Amount:</p>
                        <p>124</p>
                      </div>
                      <div className="value_amount d-flex">
                        <p>Stake Amount:</p>
                        <p>23</p>
                      </div>
                      <div className="value_amount d-flex">
                        <p>Stake Amount:</p>
                        <p>1</p>
                      </div>
                    </div>
                    <Button className="unstake_btn">Unstake</Button>
                  </div>
                </div>
                <div className="duration_bits">
                  <h3>90 days</h3>
                  <div className="value_sec d-flex px-3">
                    <div className="value_amount_sec d-block">
                      <div className="value_amount d-flex">
                        <p>Stake Amount:</p>
                        <p>124</p>
                      </div>
                      <div className="value_amount d-flex g-2">
                        <p>Stake Amount:</p>
                        <p>23</p>
                      </div>
                      <div className="value_amount d-flex">
                        <p>Stake Amount:</p>
                        <p>1</p>
                      </div>
                    </div>
                    <Button className="unstake_btn">Unstake</Button>
                  </div>
                </div>
                <div className="duration_bits">
                  <h3>120 days</h3>
                  <div className="value_sec px-3">
                    <div className="value_amount_sec d-block">
                      <div className="value_amount d-flex">
                        <p>Stake Amount:</p>
                        <p>124</p>
                      </div>
                      <div className="value_amount d-flex g-2">
                        <p>Stake Amount:</p>
                        <p>23</p>
                      </div>
                      <div className="value_amount d-flex">
                        <p>Stake Amount:</p>
                        <p>1</p>
                      </div>
                    </div>
                    <Button className="unstake_btn">Unstake</Button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      {/* <div className="referrl_comm">
                <Container className="custom_container">
                    <Row>
                       
                    </Row>
                </Container>
            </div> */}
    </div>
  );
};

export default Referral;
