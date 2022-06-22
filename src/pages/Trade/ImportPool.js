import React, { useEffect, useRef, useState } from "react";
import { Container, Col } from 'react-bootstrap'
import CardCustom from "../../components/cardCustom/CardCustom";
import PlusIcon from "../../assets/images/plus_yellow.png";
import ModalCurrency from "../../components/Modal/ModalCurrency/ModalCurrency";
import useCommon from "../../redux/volatiles/common";
import useCommonTrade from "../../hooks/CommonTrade";
import useRetained from "../../redux/retained";
import { MISC, T_TYPE } from "../../services/constant";
import iconDropDown from "../../assets/images/down-arrow.png";
import { getEthBalance } from "../../services/contracts/Common";
import { fixBy, isAddr, toDec } from "../../services/utils/global";
import { useSelector } from "react-redux";

const ImportPool = props => {
    const ref = useRef(!0);
    const cTrade = useCommonTrade();
    const common = useCommon(s => s);
    const retained = useRetained(s => s);
    const P = useSelector(s => s.persist);

    useEffect(_ => {
        if(ref.current) {
            (
                async _ => common.setTokenBalance(
                    toDec(
                        await getEthBalance(P.priAccount), MISC.DEF_DEC
                    ), 
                    T_TYPE.A
                )
            )();
            ref.current = !1;
        }
    });
    return (
        <>
            <Container>
                <CardCustom>
                    <div className="import-pool--section">
                        <Col className="import-pool--top">
                            <button onClick={_ => cTrade.openSelectTokenModal(T_TYPE.A)}>
                                <img className="token-icon" src={common.token1.icon}  alt="icon 22"/>
                                <strong style={{ fontSize: props.selectTokenText ? "" : "" }}>
                                {common.token1.sym}
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
                                {common.token2.icon ? 
                                <img className="token-icon" src={common.token2.icon}  alt="icon 22"/> :
                                <></>}
                                <strong style={{ fontSize: props.selectTokenText ? "" : "" }}>
                                {common.token2.sym || 'Select Token'}
                                </strong>
                                <img className="dropdown-icon" src={iconDropDown}  alt="icon 22"/>
                            </button>
                        </Col>
                    </div>
                    {
                        (isAddr(common.addrPair[0]) && isAddr(common.addrPair[1])) ?
                            common.pairExist ?
                                <div className="">
                                    <p>Pool Found!</p>
                                    <h4>LP TOKENS IN YOUR WALLET</h4>
                                    <ul className="lp-token-details--section">
                                        <li>
                                            <img src={common.token1.icon} alt="icon" /> 
                                            <img src={common.token2.icon} alt="icon" /> 
                                            <span>
                                            {   common.token1.sym} / {common.token2.sym}
                                            </span> 
                                            <span>
                                                {fixBy(common.lpTokenBalance, 5)}
                                            </span>
                                        </li> <br />
                                        <li>
                                            <span>{common.token1.sym}:</span> <span>{common.token1.bal}</span>
                                        </li> <br />
                                        <li>
                                            <span>{common.token2.sym}:</span> <span>{common.token2.bal}</span>
                                        </li> <br />
                                    </ul>
                                </div>
                                :
                                <div className="">
                                    <p>No pool found</p>
                                    {/* <p>
                                        <Link to="#" onClick={() => props.addBtn()}>Create pool</Link>
                                    </p> */}
                                    <br />
                                </div>
                            :
                            <div className="">
                                <p>Select a token to find your liquidity.</p>
                                <br />
                            </div>
                    }
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
