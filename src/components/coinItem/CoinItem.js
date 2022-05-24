import React from "react";
import { Col, Row } from "react-bootstrap";
import "./CoinItemStyle.scss";

const CoinItem = ({iconImage, tokenDetails, ...p}) => {
  return (
    <>
    <Col {...p} className={`coinItem_style ${p.className}`}>
      <img src={iconImage} alt="icon 23"/>
      <p className="titleStyle">{p.title}</p>
    </Col>
    </>
  );
};
export default CoinItem;