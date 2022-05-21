import React, { useEffect, useState } from "react";
import { Container, Col, Row, Form, FormControl } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { ReferralsServices } from "../../services/ReferralsServices";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Reflink from "../../assets/images/reflink-icon.svg";
import Twitter from "../../assets/images/twitter-icon.svg";
import Telegram from "../../assets/images/telegram-icon.svg";
import './Referral.scss'
import { useSelector } from "react-redux";
import Button from "../../components/Button/Button";
import ConnectWallet from "../../components/ConnectWallet/ConnectWallet";
import { toast } from "../../components/Toast/Toast";

const Referral = () => {
    const isUserConnected = useSelector((state) => state.persist.isUserConnected);
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    const handleShow = () => setShow(true);

    const connectCall = () => {
        isUserConnected ? setShow(!show) : setShow(true);
    }

    useEffect(() => {
        init();
        return () => { };
    }, []);

    const [referralCount, setReferralCount] = useState("");
    const [referralIncome, setReferralIncome] = useState("");

    const init = async () => {
        const count = await ReferralsServices.getReferralCount(isUserConnected);
        // console.log('dddd', count);
        const income = await ReferralsServices.getReferralCommissions(
            isUserConnected
        );
        // console.log('inc',income);
        setReferralCount(count);
        setReferralIncome(income);
    };

    return (
        <div className="container_wrap referral_page">
            <div className="timeto_connect">
                <Container className="custom_container">
                    <Row>
                        <Col xxl={6} xl={6}>
                            <div className="invite_othr">
                                <h1 className="title_hd">Time to connect</h1>
                                <h3>Invite your friends to earn rewards from their NIOB staking rewards. </h3>
                                <p>Every direct referral provides 1% income on Niob farms and pools staking rewards claims. Every indirect referral provides an additional 1% referral reward. Users can receive these rewards on their indirect referrals for up to the 3-rd level. Referral rewards are paid in NIOB tokens. </p>
                            </div>
                        </Col>
                        <Col xxl={5} xl={6}>
                            <div className="invite_othr refflink">
                                {isUserConnected ? <>  <img src={Reflink} />
                                    <h2>My Referral Link</h2>
                                    <div className="referalcodeDiv d-block">
                                        <Form.Group>
                                            <div className="referalCopyBox">
                                                <input class="form-control" value={`https://niob.app/r/${isUserConnected}`} readOnly />
                                                <CopyToClipboard text={`${window.location.origin}/r/${isUserConnected}`} onCopy={() => toast.success('Copied!')}>
                                                    <button></button>
                                                </CopyToClipboard>
                                            </div>
                                        </Form.Group>
                                    </div>
                                    {/* <ul className="how_get">
                                        <li>
                                            <p>You will get</p>
                                            <span>100%</span>
                                        </li>
                                        <li>
                                            <p>Friends will get</p>
                                            <span>0%</span>
                                        </li>
                                    </ul> */}
                                    <div className="share_anyone">
                                        <p>Share</p>
                                        <ul class="shareable">
                                            <li><Link><img src={Twitter} /></Link></li>
                                            <li><Link><img src={Telegram} /></Link></li>
                                        </ul>
                                    </div> </>
                                    :
                                    <>
                                        <Button onClick={() => connectCall()} title="Unlock Wallet" />
                                        <h2>Unlock wallet to get your unique referral link</h2>
                                        {isUserConnected === "" && <ConnectWallet show={show} handleShow={handleShow} handleClose={handleClose} />}
                                    </>
                                }
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className="referrl_comm">
                <Container className="custom_container">
                    <Row>
                        <Col lg={4} md={6} xs={12}>
                            {isUserConnected && <div className="totl_reff">
                                <div className="reff_title">
                                    <h3>Total Referrals</h3>
                                </div>
                                <div className="reff_cont">
                                    <span>{referralCount}</span>
                                </div>
                            </div>}
                        </Col>
                        <Col lg={4} md={6} xs={12}>
                            {isUserConnected && <div className="totl_reff">
                                <div className="reff_title">
                                    <h3>Total Referral Commission</h3>
                                </div>
                                <div className="reff_cont">
                                    <span>{referralIncome}</span>
                                </div>
                            </div>}
                        </Col>
                    </Row>
                </Container>
            </div>

        </div>

    )

}

export default Referral;