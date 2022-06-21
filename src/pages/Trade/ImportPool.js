import React, { useEffect, useState } from "react";
import { Container, Col } from 'react-bootstrap'
import CardCustom from "../../components/cardCustom/CardCustom";
import PlusIcon from "../../assets/images/plus_yellow.png";
import ModalCurrency from "../../components/Modal/ModalCurrency/ModalCurrency";
import useCommon from "../../redux/volatiles/common";
import useCommonTrade from "../../hooks/CommonTrade";
import useRetained from "../../redux/retained";
import { T_TYPE } from "../../services/constant";
import iconDropDown from "../../assets/images/down-arrow.png";

const ImportPool = props => {
    const common = useCommon(s => s);
    const retained = useRetained(s => s);
    const cTrade = useCommonTrade();
    return (
        <>
            <Container>
                <CardCustom>
                    <div className="import-pool--section">
                        <Col className="import-pool--top">
                            <button onClick={_ => cTrade.openSelectTokenModal(T_TYPE.A)}>
                                <strong style={{ fontSize: props.selectTokenText ? "" : "" }}>
                                ETH
                                </strong>
                                <img className="dropdown-icon" src={iconDropDown}  alt="icon 22"/>
                            </button>
                        </Col>
                        <div className="convert_plus">
                            <img 
                                alt='icon 10' 
                                src={PlusIcon} 
                                style={{ width: 28 }}
                            />
                        </div>
                        <Col className="import-pool--bottom">
                            <button onClick={_ => cTrade.openSelectTokenModal(T_TYPE.B)}>
                                <strong style={{ fontSize: props.selectTokenText ? "" : "" }}>
                                BNB
                                </strong>
                                <img className="dropdown-icon" src={iconDropDown}  alt="icon 22"/>
                            </button>
                        </Col>
                        <Col>
                            <div>
                                No Pool Found
                            </div>
                        </Col>
                    </div>
                </CardCustom>
            </Container>
            <ModalCurrency
                show={common.show}
                searchByName={common.setSearch}
                handleClose={cTrade.handleClose}
                searchValue={common.searchValue}
                tokenType={common.tokenType}
                tokenList={retained.tokenList}
                currencyName={common.selectedCurrency}
                searchToken={cTrade.searchToken}
                handleOrder={retained.tokenList}
                selectCurrency={cTrade.selectToken}
            />
        </>
    );
};

export default ImportPool;
