import React, { useEffect, useState } from "react";
import { Container, Col, Accordion } from "react-bootstrap";
import CardCustom from "../../components/cardCustom/CardCustom";
import ButtonPrimary from "../../components/Button/Button";
import SettingIcon from "../../assets/images/Settings-Icon.svg";
import TimerIcon from "../../assets/images/ionic-ios-timer.svg";

import PlusIcon from "../../assets/images/plus_ico.png";
import SettingModal from "../../components/Modal/SettingModal/SettingModal";
import { Link } from "react-router-dom";
import ButtonLink from "../../components/buttonLink/ButtonLink";
import "./Trade.scss";
import RemoveLiquidity from "../../components/Modal/RemoveLiquidity/RemoveLiquidity";
import { useDispatch, useSelector } from "react-redux";
import RecentTransactions from "../../components/RecentTransactions/RecentTransactions";
import TokenBalance from "./TokenBalance";

const Liquidity = ({ handleAddLiquidity, handleRemove }) => {
    const [settingShow, setsettingShow] = useState(!1);
    const settingClose = () => setsettingShow(!1);
    const settingHandleShow = () => setsettingShow(!0);
    // remove liquidity
    const [removeShow, setremoveShow] = useState(!1);
    const removeClose = () => setremoveShow(!1);
    const removehandleShow = () => setremoveShow(!0);

    const dispatch = useDispatch();
    const isUserConnected = useSelector((state) => state.persist.isUserConnected);
    const userLpTokens = useState([]);

    const [showSettings, setShowSettings] = useState(!1);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [showRecent, setShowRecent] = useState(!1);
    const recentTransactionsClose = () => setShowRecent(!1);

    const [lptoken, setLptoken] = useState(null);

    const toggleDropdwon = (index) => {
        if (currentIndex === index) {
        setCurrentIndex(-1);
        } else {
        setCurrentIndex(index);
        }
    };

    return (
        <>
        <Container fluid className="swapScreen comnSection add_lq_box">
            <CardCustom>
            <div className="settingSec">
                <div className="in_title">
                    <h4>Liquidity</h4>
                    <p className="mb-0">Add liquidity to receive LP tokens</p>
                </div>
                <div className="settingIcon">
                <img
                    src={TimerIcon}
                    onClick={() => setShowRecent(!0)}
                    className="timerImg"
                    alt="icon"
                />
                <img src={SettingIcon} onClick={() => settingHandleShow(!0)} alt='icon'/>
                </div>
            </div>

            <div className="add_liq text-center">
                <ButtonLink
                title="Add liquidity"
                className="add_liquidity_btn"
                icon={PlusIcon}
                link="/trade/liquidity/addLiquidity"
                />
            </div>
            <div className="settingSec d-block mb-0">
                <div className="in_title">
                <h4>Your Liquidity</h4>
                </div>
            </div>
            {
                // userLpTokens.length ? (
                //     <>
                //     {
                //         userLpTokens.map((lp, index) => (
                //             <Accordion
                //             defaultActiveKey={index}
                //             className="yourLiq_accordian"
                //             >
                //             <Accordion.Item eventKey="0">
                //                 <Accordion.Header>
                //                 {lp.pairName} <span className="ms-auto">Manage</span>
                //                 </Accordion.Header>
                //                 <Accordion.Body>
                //                 <div className="amountDiv">
                //                     <ul className="text-start">
                //                     <li>Your total pool tokens:</li>
                //                     <li>Pooled {lp.token0Obj?.symbol}:</li>
                //                     <li>Pooled {lp.token1Obj?.symbol}:</li>
                //                     <li>Your pool share:</li>
                //                     </ul>
                //                     <ul className="text-end">
                //                     <li>{lp.balance.toFixed(5)}</li>
                //                     <li>{lp.token0Deposit.toFixed(5)}</li>
                //                     <li>{lp.token1Deposit.toFixed(5)}</li>
                //                     <li>{lp.poolShare}%</li>
                //                     </ul>
                //                 </div>
                //                 <div className="remove_liq text-center mb-2">
                //                     <ButtonPrimary
                //                     title="Add liquidity"
                //                     className="remove_liq_btn"
                //                     // onClick={() =>  removehandleShow(!0)}
                //                     onClick={() => handleAddLiquidity(lp)}
                //                     />
                //                     <ButtonPrimary
                //                     title="Remove liquidity"
                //                     className="remove_liq_btn"
                //                     onClick={() => {
                //                         setLptoken(lp);
                //                         removehandleShow();
                //                     }}
                //                     />
                //                 </div>
                //                 </Accordion.Body>
                //             </Accordion.Item>
                //             </Accordion>
                //         ))
                //     }
                //     </>
                // ) : 
                (
                    <div className="liquidity_list">
                    <h3>No liquidity found.</h3>
                    </div>
                )
            }

            <Col className="tokeninfo">
                <p>
                Don't see a pool you joined?{" "}
                <Link to={"/trade/liquidity/importPool"}>import it.</Link>
                </p>
                <p>
                Or, if you staked your LP tokens in a farm, unstake them to see
                them here.
                </p>
            </Col>
            </CardCustom>
        </Container>
        <SettingModal
            show={settingShow}
            handleShow={settingHandleShow}
            handleClose={settingClose}
        />
        <RemoveLiquidity
            lptoken={lptoken}
            show={removeShow}
            handleShow={removehandleShow}
            handleClose={removeClose}
        />
        <RecentTransactions
            show={showRecent}
            handleClose={recentTransactionsClose}
        />
        </>
    );
};

export default Liquidity;