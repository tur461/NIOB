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

const ConnectWallet = ({ show, handleClose }) => {
    const dispatch = useDispatch();

    const loginCall = async (walletType, type) => {
        try {
            if (walletType === 'BinanceChain') {
                const account = await ContractServices.isBinanceChainInstalled();
                if (account) {
                    dispatch(login({ account, walletType }));
                    handleClose(false);
                    window.location.reload();
                }
            } else if (walletType === 'Walletconnect') {
                try {
                    const provider = new WalletConnectProvider({
                        //infuraId: "8570afa4d18b4c5d9cb3a629b08de069",
                        rpc: {
                            97: 'https://data-seed-prebsc-2-s3.binance.org:8545/',
                            56: "https://bsc-dataseed.binance.org/",
                        },
                        chainId: 56,
                        network: "binance",
                        qrcode: true,
                        qrcodeModalOptions: {
                            mobileLinks: [
                                "rainbow",
                                "metamask",
                                "argent",
                                "trust",
                                "imtoken",
                                "pillar",
                            ],
                            desktopLinks: [
                                "encrypted ink",
                            ]
                        }
                    });
                    const results = await provider.enable();

                    provider.on('accountsChanged', async (accounts) => {
                        setTimeout(function () {
                            window.location.reload()
                        }, 500)
                        let account = accounts[0]
                        dispatch(login({ account, walletType }));
                        handleClose(false);
                        //return;
                        // window.location.reload();
                    });
                    await ContractServices.callWeb3ForWalletConnect(provider);
                    const account = await provider.accounts[0];
                    dispatch(login({ account, walletType }));
                    handleClose(false);
                    //  window.location.reload();
                } catch (error) {
                    console.log(error, 'wallet error')
                }

            } else {
                const account = await ContractServices.isMetamaskInstalled(type);
                if (account) {
                    dispatch(login({ account, walletType }));
                    handleClose(false);
                    // window.location.reload();
                }
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
                            <li><Button onClick={() => loginCall('Metamask', 'Metamask')}>MetaMask<span><img src={iconMatamask} /></span> </Button></li>
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
