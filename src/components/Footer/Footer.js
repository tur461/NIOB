import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import "./Footer.scss";
import { Link } from "react-router-dom";
import NIOB from "../../assets/images/token_icons/NIOB.svg";
import MetaMask from "../../assets/images/MetaMask-Icon.svg";
import ScrollTop from "../ScrollTop/ScrollTop";
import { Button } from "react-bootstrap";
import { addCommas } from "../../constant";

const Footer = (props) => {
  const footerValues = useSelector(state => state.persist.footerValues);
  useEffect(() => {

  }, []);
  const handelToken = async () => {
    const { ethereum } = window;
    const tokenAddress = '0x5ac5e6Af46Ef285B3536833E65D245c49b608d9b';
    const tokenSymbol = 'NIOB';
    const tokenDecimals = 18;
    //const tokenImage = 'http://placekitten.com/200/300';
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            //image: tokenImage, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log('Your loss!');
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className={`footer_style ${props.className}`}>
      <div className="footer_align">
        <div className="niob_price">
          <img src={NIOB} alt={"img"} />
          <div className="flex">
            <span>NIOB</span>
            {/* <span className="vlue">${footerValues?.niobValue?.toFixed(2)}</span> */}
          </div>
        </div>
        <div className="buy_niob">
          <img src={MetaMask} alt={"icon"} onClick={() => handelToken()} />
          <Link to="/trade/exchange"><Button className="cm_btn">Buy NIOB</Button></Link>
        </div>
        <div className="noib_info">
          <ul className="ps-0">
            <li>
              Total supply: <span>{footerValues?.totalSupply ? addCommas(footerValues?.totalSupply) : "loading"} NIOB</span>
            </li>
            <li>
              Max supply: <span>600,000,000 NIOB</span>
            </li>
          </ul>
          <ul>
            <li>
              {/* {console.log('sssssssss', footerValues?.tvl)} */}
              Total Value Locked (TVL): <p>${isNaN(footerValues?.tvl) ? "0.00" : footerValues?.tvl }</p>
            </li>
          </ul>
        </div>
        <div className="scrollUp">
          <ScrollTop />
        </div>
      </div>
    </div>
  );
};

export default Footer;
