import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./SelectCoinStyle.scss";
import iconDropDown from "../../assets/images/down-arrow.png";

const SelectCoin = (props) => {
  const [symbolsArr] = useState(["e", "E", "+", "-"]);
  return (
    <Col className={`selectCoin_style ${props.className}`}>
      <Row className="mx-0">
        <Col className="selectCoin_left_style">
          <label>{props.inputLabel}</label>
          <input
            type="number"
            onKeyDown={(evt) => { symbolsArr.includes(evt.key) && evt.preventDefault() }}
            onChange={props.onChange}
            placeholder={props.placeholder}
            value={props.defaultValue}
            min={0}
            minLength={1}
            maxLength={79}
            autoCorrect="off"
            autoComplete="off"
          />
        </Col>
        <Col className="selectCoin_right_style">
          <label>{props.label}</label>
          <Col className="select_buttonStyle">
            {props.max && <strong onClick={props.onMax}>MAX</strong>}
            <button onClick={props.onClick}>
              <div> {props.coinImage && <img src={props.coinImage} className="coin_Img" />}
                <strong style={{ fontSize: props.selectTokenText ? "" : "" }}>
                  {props.value}
                </strong></div>
              <img className="selectDropDownStyle" src={iconDropDown} />
            </button>
          </Col>
        </Col>
      </Row>
    </Col>
  );
};

export default SelectCoin;
