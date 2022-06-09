import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import './Header.scss'
import { Link } from 'react-router-dom'
import IconToggle from '../../assets/images/menu_toggle_icon.png'
import Iconmenu from '../../assets/images/wrap-menu.png'
import Button from "../Button/Button";
import ConnectWallet from "../ConnectWallet/ConnectWallet";
import { login, logout, versionManager } from "../../redux/actions"
import { ContractServices } from "../../services/ContractServices";
const Header = props => {
    const dispatch = useDispatch();
    const P = useSelector(state => state.persist);
    const [show, setShow] = useState(!1);
    useEffect(_ => {
        const init = async _ => {
            await dispatch(versionManager());
            if (P.walletType) {
                await ContractServices.setWalletType(P.walletType);
            } else {
                dispatch(logout());
            }
        };
        init();
        addListeners();
    }, []);
    const handleShow = _ => setShow(!0);
    const handleClose = _ => setShow(!1);
    const prepWalletConnectModal = _ => P.isConnected ? setShow(!show) : setShow(!0);

    const addListeners = async _ => {
        let addr = P.walletType === 'Metamask' ? 
        await ContractServices.isMetamaskInstalled('') : P.walletType === 'BinanceChain' ?
        await ContractServices.isBinanceChainInstalled() : null;
        ContractServices.walletWindowListener();
        addr &&
        window.ethereum.on('accountsChanged', function (accounts) {
            const account = accounts[0];
            dispatch(login({ account, walletType: P.walletType }));
            window.location.reload();
        });
        
    };

    return(
        <div className={`header_style ${props.className}`}>
                <div className="header_left_style">
                    <div className="for_desktop">
                        <div  className="hamburg" onClick={props.small_nav}>
                            {
                                props.mobileIcon ?
                                <img src={Iconmenu} alt="" />
                                :
                                <img src={IconToggle} alt=""/>                            
                            }
                        </div> 
                    </div>
                    <div className="for_mobile">
                        <div className="hamburg" onClick={props.small_nav}>
                            {
                                props.mobileIcon ?
                                <img src={IconToggle} alt=""/>
                                :
                                <img src={Iconmenu} alt="" />                            
                            }
                        </div>
                    </div>
                    <Link to="/home" className="header_logo"></Link> 
                </div>
                <div className="header_right_style">
                    <Button 
                        onClick={_ => prepWalletConnectModal()} 
                        title={P.isConnected ? `${P.priAccount.substring(1, 6)}...${P.priAccount.substr(P.priAccount.length - 4)}` : 'Connect'}
                    />
                </div>
                <ConnectWallet show={show} handleShow={handleShow} handleClose={handleClose} /> 
        </div>
    )
}

export default Header;