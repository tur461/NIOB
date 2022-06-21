import React, { useEffect, useState } from "react";
import { Col, Row, Modal } from "react-bootstrap";
import "./ModalCurrencyStyle.scss";
import CoinItem from "../../coinItem/CoinItem";
import { useDispatch } from "react-redux";
import { tokenListAdd, tokenListDel } from "../../../redux/actions";

const ModalCurrency = ({ 
  show, 
  searchValue, 
  handleClose, 
  tokenList, 
  searchByName, 
  searchToken, 
  selectCurrency, 
  tokenType, 
  currencyName 
}) => {
  function _searchCallback(e) {
    e.preventDefault();
    searchToken(e.target.value);
  }

  return (
    <Modal
      scrollable={true}
      className="selectCurrency_modal"
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Select a Token</Modal.Title>
      </Modal.Header>
      <Row>
        <Col>
          <div className="gradiantWrap">
            <input
              value={searchValue}
              className="searchInput_Style"
              placeholder="Search name or paste address"
              name="tokenSearch"
              onChange={_searchCallback}
              onPaste={_searchCallback}
            />
          </div>
          <div className="tokenName">
            <h4>Token Name</h4>
            <hr />
          </div>
        </Col>
      </Row>

      <Modal.Body>
        <Row className="coinListBlockStyle">
          {tokenList && tokenList.length ? tokenList.map((tkn, i) =>
            <Col key={i}>
              <CoinItem 
                className={currencyName === tkn.sym ? 'active' : ''}
                onClick={_ => selectCurrency(tkn, tokenType)} 
                // isDisabled={tkn.isDisabled} 
                iconImage={tkn.icon} 
                title={tkn.sym} 
                tokenDetails={tkn} 
              />
            </Col>
          ) : <div className="">No results found.</div>}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCurrency;
