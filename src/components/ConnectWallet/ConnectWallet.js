import React from 'react'
import { Col, Row, Modal, Button } from 'react-bootstrap'
import './ConnectWallet.scss'
import { useDispatch } from "react-redux"
import { ContractServices } from "../../services/ContractServices"
import { login } from "../../redux/actions"
import { toast } from "../../components/Toast/Toast";
import WalletConnectProvider from '@walletconnect/web3-provider'

import iconMatamask from '../../assets/images/metamask_icon.png'
import iconCoinbase from '../../assets/images/coinbase_icon.svg'
import iconWallet from '../../assets/images/wallet_icon.svg'
import TokenPocket from '../../assets/images/tp.png'
import TrustWallet from '../../assets/images/trust-wallet.png'
import Binance from '../../assets/images/Binance-chain.png'
import MathWallet from '../../assets/images/mathwallet.png'
import { WALLET_TYPE } from '../../services/constant'
import { tryGetAccount } from '../../services/contracts/Common'

const ConnectWallet = ({ show, handleClose }) => {
    const dispatch = useDispatch();

    const tryConnect2Wallet = async (walletType) => {
        try {
            const account = await tryGetAccount(walletType);
            if (account) {
                dispatch(login({ account, walletType }));
                handleClose(false);
            }
            
        } catch (err) {
            toast.error(err.message);
        }
    }

    return (
        <Modal centered scrollable={true} className="connect_wallet" show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Connect to a wallet</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col className="baseToken_style token_strut">
                        <ul>
                            <li><Button onClick={() => tryConnect2Wallet(WALLET_TYPE.M_MASK)}>MetaMask<span><img src={iconMatamask} /></span> </Button></li>
                            <li><Button>CoinBase Wallet<span><img src={iconCoinbase} /></span> </Button></li>
                            <li><Button>WalletConnect<span><img src={iconWallet} /></span> </Button></li>
                            <li><Button>TrustWallet<span><img src={TrustWallet} /></span> </Button></li>
                            <li><Button>MathWallet<span><img src={MathWallet} /></span> </Button></li>
                            <li><Button>TokenPocket<span><img src={TokenPocket} /></span> </Button></li>
                            <li><Button>Binance Chain Wallet<span><img src={Binance} /></span> </Button></li>
                        </ul>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    )
}

export default ConnectWallet;
