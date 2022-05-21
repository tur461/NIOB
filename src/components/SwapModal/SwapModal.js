import './SwapModal.scss'
import { Link } from "react-router-dom";
import Card from "../Card/Card";
import closeBtn from "../../assets/images/ionic-md-close.svg";
import { Col, Row, Modal, Button } from "react-bootstrap";

const SwapModal = ({
  closeModal,
  tokenOneCurrency,
  tokenTwoCurrency,
  tokenOneValue,
  tokenTwoValue,
  tokenOneIcon,
  tokenTwoIcon,
  sharePoolValue,
  handleSwap,
  priceImpact,
  liquidityProviderFee,
  show,
}) => {
  return (
    <>
      <Modal
        centered
        scrollable={true}
        className="connect_wallet supply_mode"
        show={show}
        onHide={closeModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>You are creating a pool</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <ul className="swap_confirmation">
              <li>
                <p>
                  <img src={tokenOneIcon} alt="icon" className='me-2' />
                  {tokenOneValue}
                </p>{" "}
                <span> {tokenOneCurrency}</span>
              </li>
              <li>
                <p>
                  <img src={tokenTwoIcon} alt="icon" className="me-2" />
                  {tokenTwoValue}
                </p>{" "}
                <span> {tokenTwoCurrency}</span>
              </li>
              <li>
                Price:{" "}
                <span>
                  {" "}
                  {sharePoolValue} {tokenOneCurrency}/ {tokenTwoCurrency}
                </span>
              </li>
              <li>
                Price Impact: <span>{priceImpact}%</span>
              </li>
              <li>
                Liquidity provider fee: <span>{liquidityProviderFee}</span>
              </li>
            </ul>
            <div className="col modal_headerStyle__rowC_colRight Confirm_btn">
              <button className="btn buttonStyle full" onClick={() => handleSwap()}>
                Confirm
              </button>
            </div>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SwapModal;
