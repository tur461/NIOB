import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row, Modal, Button, Table } from 'react-bootstrap'
import './ReturnInvest.scss'
const ReturnInvest = ({ roiModalData, handleClose, lpDetails, show, niobId }) => {
    const handleROI = (day, liquidity) => {
        const lq = liquidity ? 1000 : roiModalData?.liquidity;
        let apr;
        if (niobId == 12) {
             apr = (((roiModalData?.allocPoint / roiModalData?.totalAllcationPoint) * ((roiModalData?.anchorPerBlock / 10 ** 18) * 28800 * day * 100 * roiModalData?.anchorPrice)) / lq) * 10.5537;
        }
        else {
             apr = ((roiModalData?.allocPoint / roiModalData?.totalAllcationPoint) * ((roiModalData?.anchorPerBlock / 10 ** 18) * 28800 * day * 100 * roiModalData?.anchorPrice)) / lq;
        }
        return isNaN(apr) ? 0 : apr.toFixed(2);
    }

    const handleAnchorPerThousand = (day) => {
        const totalLpWorth = roiModalData?.liquidity;
        let anchorPerThousand;
        if (niobId == 12) {
          anchorPerThousand = ((1000 * (roiModalData?.anchorPerBlock / 10 ** 18) * 28800 * day * (roiModalData?.allocPoint / roiModalData?.totalAllcationPoint)) / totalLpWorth) * 10.5537;
        } else {
          anchorPerThousand = (1000 * (roiModalData?.anchorPerBlock / 10 ** 18) * 28800 * day * (roiModalData?.allocPoint / roiModalData?.totalAllcationPoint)) / totalLpWorth;
        }
        return isNaN(anchorPerThousand) ? 0 : anchorPerThousand.toFixed(2);
    }
    return (
        <Modal centered scrollable={true} className="connect_wallet return_invest" show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Return on Invest</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col className="lp_tokens">
                        <div className="invest_area">
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Timeframe</th>
                                        <th>ROI</th>
                                        <th>NIOB per $1000</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1d</td>
                                        <td>{handleROI(1, false)}%</td>
                                        <td>{handleAnchorPerThousand(1)}</td>
                                    </tr>
                                    <tr>
                                        <td>7d</td>
                                        <td>{handleROI(7, false)}%</td>
                                        <td>{handleAnchorPerThousand(7)}</td>
                                    </tr>
                                    <tr>
                                        <td>30d</td>
                                        <td>{handleROI(30, false)}%</td>
                                        <td>{handleAnchorPerThousand(30)}</td>
                                    </tr>
                                    <tr>
                                        <td>365d(APR)</td>
                                        <td>{handleROI(365, false)}%</td>
                                        <td>{handleAnchorPerThousand(365)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                            <p>Rates are estimates provided for your convenience only, and by no means represent guaranteed returns.</p>
                            <div className="confirmation">
                                <Link to="trade/liquidity/addLiquidity" className="btn buttonStyle" onClick={handleClose}>Get {lpDetails?.lpTokenName} </Link>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    )
}

export default ReturnInvest;
