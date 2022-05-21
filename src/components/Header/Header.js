import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import './Header.scss'
import { Link } from 'react-router-dom'
import IconToggle from '../../assets/images/menu_toggle_icon.png'
import Iconmenu from '../../assets/images/wrap-menu.png'
import Button from "../Button/Button";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import ProfileModal from "../ProfileModal/ProfileModal";
import { login, logout, versionManager } from "../../redux/actions"
import { ContractServices } from "../../services/ContractServices";

const Header = props => {
    const dispatch = useDispatch();
    const isUserConnected = useSelector(state => state.persist.isUserConnected);
    const walletType = useSelector(state => state.persist.walletType);
    const [show, setShow] = useState(false);
    useEffect(() => {
        const init = async () => {
            await dispatch(versionManager());
            if (walletType) {
                await ContractServices.setWalletType(walletType);
            } else {
                dispatch(logout());
            }
        };
        init();
        addListeners();
    }, []);
    const handleClose = () => setShow(false);

    const handleShow = () => setShow(true);

    const connectCall = () => {
        isUserConnected ? setShow(!show) : setShow(true);
    }
    const addListeners = async () => {
        let address;
        if (walletType === 'Metamask') {
            address = await ContractServices.isMetamaskInstalled('');
        }
        if (walletType === 'BinanceChain') {
            address = await ContractServices.isBinanceChainInstalled();
        }

        ContractServices.walletWindowListener();
        if (address) {
            window.ethereum.on('accountsChanged', function (accounts) {
                const account = accounts[0];
                dispatch(login({ account, walletType }));
                window.location.reload();
            });
        }
    };
    const logoutCall = () => {
        dispatch(logout());
        setShow(false);
    }

    return (
        <div className={`header_style ${props.className}`}>
            <div className="header_left_style">
                <div className="for_desktop">
                    <div className="hamburg" onClick={props.small_nav}>
                        {
                            props.mobileIcon ?
                                <img src={Iconmenu} alt="" />
                                :
                                <img src={IconToggle} />
                        }
                    </div>
                </div>
                <div className="for_mobile">
                    <div className="hamburg" onClick={props.small_nav}>
                        {
                            props.mobileIcon ?
                                <img src={IconToggle} />
                                :
                                <img src={Iconmenu} alt="" />
                        }
                    </div>
                </div>
                <Link to="/home" className="header_logo"></Link>
            </div>
            <div className="header_right_style">
                <Button onClick={() => connectCall()} title={isUserConnected ? `${isUserConnected.substring(1, 6)}...${isUserConnected.substr(isUserConnected.length - 4)}` : 'Connect'} />
            </div>
            {isUserConnected === "" && <ConnectWallet show={show} handleShow={handleShow} handleClose={handleClose} />}
            {isUserConnected !== "" && <ProfileModal show={show} handleClose={handleClose} logout={logoutCall} />}
        </div>

    )
}

export default Header;