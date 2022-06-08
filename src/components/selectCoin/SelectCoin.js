import "./SelectCoinStyle.scss";
import { Col, Row } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import iconDropDown from "../../assets/images/down-arrow.png";

const SelectCoin = (props) => {
  const [symbolsArr] = useState(["e", "E", "+", "-"]);
  useEffect(_ => {
    console.log('token value changed:', props.tokenValue);
  }, [props.tokenValue])
  return (
    <Col className={`selectCoin_style ${props.className}`}>
      <Row className="mx-0">
        <Col className="selectCoin_left_style">
          <label>{props.inputLabel}</label>
          <input
            type="number"
            disabled={props.disabled}
            onKeyDown={(evt) => { symbolsArr.includes(evt.key) && evt.preventDefault() }}
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
          <label>{props.label}</label>
          <Col className="select_buttonStyle">
            {props.max && <strong onClick={props.onMax}>MAX</strong>}
            <button onClick={props.onClick}>
              <div> {props.coinImage && <img src={props.coinImage} className="coin_Img" alt="icon 21"/>}
                <strong style={{ fontSize: props.selectTokenText ? "" : "" }}>
                  {props.value}
                </strong></div>
              <img className="selectDropDownStyle" src={iconDropDown}  alt="icon 22"/>
            </button>
          </Col>
        </Col>
      </Row>
    </Col>
  );
};

export default SelectCoin;
