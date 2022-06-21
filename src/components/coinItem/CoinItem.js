import React from "react";
import { Col, Row } from "react-bootstrap";
import log from "../../services/logging/logger";
import "./CoinItemStyle.scss";

const CoinItem = ({iconImage, tokenDetails, isDisabled, ...p}) => {
  log.i('coinItem:', tokenDetails, isDisabled, p.className)
  return (
    <>
    <Col {...p} className={`coinItem_style ${p.className}`} disabled={isDisabled}>
      <img src={iconImage} alt="icon 23"/>
      <p className="titleStyle">{p.title}</p>
    </Col>
    </>
  );
};
export default CoinItem;