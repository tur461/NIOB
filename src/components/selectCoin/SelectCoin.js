import "./SelectCoinStyle.scss";
import { Col, Row } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import iconDropDown from "../../assets/images/down-arrow.png";

const SelectCoin = (props) => {
  return (
    <Col className={`selectCoin_style ${props.className}`}>
      <Row className="mx-0">
        <Col className="selectCoin_left_style">
          <input
            type="number"
            disabled={props.disabled}
            onKeyDown={e => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
            onChange={props.onChange}
            placeholder={props.placeholder}
            value={props.tokenValue}
            min={0}
            minLength={1}
            maxLength={79}
            autoCorrect="off"
            autoComplete="off"
          />
        </Col>
        <Col className="selectCoin_right_style">
          <Col className="select_buttonStyle">
            <button onClick={props.onClick}>
              <div> {props.coinImage && <img src={props.coinImage} className="coin_Img" alt="icon 21"/>}
                <strong style={{ fontSize: props.selectTokenText ? "" : "" }}>
                  {props.value}
                </strong></div>
              <img className="selectDropDownStyle" src={iconDropDown}  alt="icon 22"/>
            </button>
          </Col>
          <label className="label-balance">
            <span>{props.label}</span>
            {props.showMaxBtn ? <span className="btn-max" onClick={props.onMax}><strong>MAX</strong></span>:<></>}
          </label>
        </Col>
      </Row>
    </Col>
  );
};

export default SelectCoin;
