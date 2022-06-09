import React, { useState } from "react";
import "./Footer.scss";
import { Link } from "react-router-dom";
import NIOB from "../../assets/images/saitaswap.png";
import MetaMask from "../../assets/images/MetaMask-Icon.svg";
import ScrollTop from "../ScrollTop/ScrollTop";
import { Button } from "react-bootstrap";

const Footer = (props) => {
  return (
    <div className={`footer_style ${props.className}`}>
      <div className="footer_align">
        <div className="niob_price">
          <img src={NIOB} alt={"img"} />
          <div className="flex">
            <span>SAITA Price</span>
            <span className="vlue">$0.50</span>
          </div>
        </div>
        <div className="buy_niob">
          <img src={MetaMask} alt={"icon"} />
          <Button className="cm_btn">Buy SAITA</Button>
        </div>
        <div className="noib_info">
          <ul className="ps-0">
            <li>
              Total supply: <span>300.000.000 SAITA</span>
            </li>
            <li>
              Max supply: <span>600.000.000 SAITA</span>
            </li>
          </ul>
          <ul>
            <li>
              Total Value Locked (TVL): <p>$20,000,000.00</p>
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
