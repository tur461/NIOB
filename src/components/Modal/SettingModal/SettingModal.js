import React, { useState } from "react";
import { Col, Row, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { saveDeadline, saveSlippagePercentage } from "../../../redux/actions";
import "./SettingModal.scss";
import ReactTooltip from "react-tooltip";
import TolerenceImg from "../../../assets/images/tolerence.png";
import { Link } from "react-router-dom";

const SettingModal = ({ show, handleClose }) => {
  const dispatch = useDispatch();

  const slippagePercentage = useSelector(
    (state) => state.persist.slippagePercentage
  );

  const MAX_SLIPPAGE = 49000;
  const RISKY_SLIPPAGE_LOW = 50;
  const RISKY_SLIPPAGE_HIGH = 4900;

  const [value, setValue] = useState(slippagePercentage);
  const [error, setError] = useState(null);
  const [deadline, setDeadline] = useState(20);
  const [deadlineError, setDeadlineError] = useState(null);

  const predefinedValues = [0.1, 0.5, 1];

  const handleChange = (e) => {
    let v = parseFloat(e.target.value);
    setValue(v);
    validateValue(v);
  };
  const validateValue = async (v) => {
    try {
      setValue(v);
      v *= 100;
      v = parseInt(v);
      if (!Number.isNaN(v) && v > 0 && v < MAX_SLIPPAGE) {
        if (v < RISKY_SLIPPAGE_LOW) {
          return setError("Your transaction may fail");
        } else if (v > RISKY_SLIPPAGE_HIGH) {
          return setError("Maximum allowed slippage value exceeded");
        }
        v /= 100;
        await dispatch(saveSlippagePercentage(v));
        setError(null);
      } else {
        setError("Enter valid a slippage percentage");
      }
    } catch (err) {
      setError("Enter valid a slippage percentage");
    }
  };

  const changeDeadline = async (e) => {
    const dl = parseInt(e.target.value);
    setDeadline(dl);
    if (dl <= 0) {
      return setDeadlineError("Enter a valid deadline");
    }
    dispatch(saveDeadline(dl));
    setDeadlineError(null);
  };

  return (
    <Modal
      scrollable={true}
      className="selectCurrency_modal setting_modl"
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Row>
        <Col>
          <div className="tokenName">
            <hr />
          </div>
        </Col>
      </Row>

      <Modal.Body>
        <Row>
          <Col>
            <div className="stting_modl">
              <h6>
                Slippage tolerance{" "}
                <Link to="#">
                  <img
                    data-tip
                    data-for="registerTip"
                    src={TolerenceImg}
                    alt="icon"
                    className="toleranceIcon"
                  />
                </Link>
              </h6>
              <ReactTooltip
                id="registerTip"
                place="right"
                effect="solid"
                className="tooltipbox"
              >
                Your transaction will revert if the price changes unfavorably by
                more than this percentage.
              </ReactTooltip>
              <div className="selct_area">
                <div className="d-flex">
                  {predefinedValues.map((d) => {
                    return (
                      <span key={d}>
                        <button
                          variant={value === d ? "primary" : "tertiary"}
                          onClick={() => validateValue(d)}
                        >
                          {d}%
                        </button>
                      </span>
                    );
                  })}
                  <span className="d-flex align-items-center">
                    <input
                      type="number"
                      scale="lg"
                      step={0.1}
                      min={0.1}
                      placeholder="5%"
                      value={value}
                      onChange={handleChange}
                    />{" "}
                    %
                  </span>
                </div>
                {error && <small className="frontrunText">{error}</small>}
              </div>
              <h6>Transaction deadline</h6>
              <div className="selct_area dedline">
                <div className="d-flex align-items-center">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={deadline}
                    onChange={changeDeadline}
                  />{" "}
                  &nbsp;<span>Minutes</span>
                  {deadlineError && (
                    <p style={{ color: "red", marginTop: "10px" }}>
                      {deadlineError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default SettingModal;
