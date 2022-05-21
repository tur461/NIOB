import React, { useEffect, useState } from 'react'
import { Col, Row, Modal, Button, Form, InputGroup, FormControl } from 'react-bootstrap'
import './GetLPToken.scss'
import { FarmService } from '../../services/FarmService'
import { toast } from '../Toast/Toast'


const WithDrawLPToken = props => {
    const [symbolsArr] = useState(["e", "E", "+", "-"]);
    const [niobWithdrawable, setNiob] = useState(0);
    useEffect(() => {
        
        if (props.isNiobWithdrawabe && props?.stakeData?.isLocked) init();
    }, []);

    const init = async () => {
        const niob = await FarmService.getNiob(props.address);
        setNiob(niob);
    }

    const checkIfAmountGreaterThanWithdrawable = (value, isLocked) => {
        // console.log('oooo', props.farms.isLocked);
        // if ( (props.isNiobWithdrawabe && props?.stakeData?.isLocked) && value > niobWithdrawable) {
            // toast.error('Amount greater than withdrawable !')
        // } else {
            props.depositWithdraw('withdraw', isLocked);
        // }
    }

    return (
        <Modal centered scrollable={true} className="connect_wallet get_tokens" show={props.show} onHide={props.closeStakeModal}>
            <Modal.Header closeButton>
                <Modal.Title>Withdraw {props.stakeData?.lpTokenDetails?.lpTokenName} Tokens</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col className="lp_tokens">
                        <Form className="lptokn_area">
                            <p className="text-end"><span>{props.stakeData?.balance}</span> {props.stakeData?.lpTokenDetails?.lpTokenName} available</p>
                            {/* {(props.isNiobWithdrawabe && props?.stakeData?.isLocked) &&
                                <p className="text-end"><span>{niobWithdrawable ? niobWithdrawable?.toFixed(4) : 0}</span> Withdrawable Niob</p>} */}
                            <InputGroup>
                                <FormControl
                                    onKeyDown={(evt) => { symbolsArr.includes(evt.key) && evt.preventDefault() }}
                                    type="number"
                                    id="search"
                                    autoCorrect="off"
                                    autoComplete="off"
                                    placeholder="0.0"
                                    minLength={1}
                                    maxLength={79}
                                    value={props.stakeValue}
                                    onChange={(e) => props.handleStakeValue(e)}
                                />
                                <div className="action">
                                    <span className="token_name"></span>
                                    <Button onClick={() => props.setMaxValue()} className="max_btn cm_btn">Max</Button>
                                </div>
                            </InputGroup>
                            <div className="confirmation">
                                <Button onClick={() => props.closeStakeModal()} className="cancel_btn">Cancel</Button>
                                {/* <Button disabled={props.stakeConfirmation} onClick={() => props.depositWithdraw('withdraw')} className="cm_btn confirm">Confirm</Button> */}
                                <Button disabled={props.stakeConfirmation} onClick={() => checkIfAmountGreaterThanWithdrawable(props.stakeValue, props.stakeData.isLocked)} className="cm_btn confirm">Confirm</Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    )
}

export default WithDrawLPToken;
