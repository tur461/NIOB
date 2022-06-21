import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarFooter,
} from "react-pro-sidebar";
import { isMobile } from "react-device-detect";
import Twitter from "../../assets/images/twitter-icon.svg";
import SaitamaTokenImg from "../../assets/images/token_icons/Saitama.png";
import Telegram from "../../assets/images/telegram-icon.svg";
import Docs from "../../assets/images/docs-icon.svg";
import Medium from "../../assets/images/medium-icon.svg";
import Github from "../../assets/images/git.svg";
import Globe from "../../assets/images/language-switcher-icon.svg";
import "./Sidebar.scss";
import useWindowDimensions from "../../hooks/getWindowDimensions";
import PairContract from "../../services/contracts/PairContract";
import { ANCHOR_BUSD_LP } from "../../assets/tokens";

const Sidebar = (props) => {
  const { width } = useWindowDimensions();

  const [selectedOption, setSelectedOption] = useState("");
  const [NiobBusdValue, setNiobBusdValue] = useState("");
  const location = useLocation();
  const { pathname } = location;
  const splitLocation = pathname.split("/");

  const closeSidebar = () => {
    if (width < 991) {
      props.small_nav();
    }
  }

  const setSideBarOption = (option) => {
    if (selectedOption == option) {
      setSelectedOption("");
    } else {
      if (props.showSocial) {
        if (!isMobile) {
          // props.closeSidebar();
        }
      }
      setSelectedOption(option);
    }
  };

  const getNiobDollarValue = async () => {
    PairContract.setTo(ANCHOR_BUSD_LP);
    const reserves = await PairContract.getReserves();
    setNiobBusdValue(reserves[1] / reserves[0]);
  }

  React.useEffect(() => {
    getNiobDollarValue();
    if (props.showSocial) {
      setSelectedOption("");
    }
  }, [props.showSocial]);
  return (
    <ProSidebar className={`sidebar_style ${props.className}`}>
      <Menu iconShape="square">
        <MenuItem
          onClick={() => { closeSidebar(); setSideBarOption("") }}
          className={splitLocation[1] === "home" ? "active" : ""}
          icon={<i className="home_nav_icon"></i>}
        >
          <Link to="/home">Homebase</Link>
        </MenuItem>
        <SubMenu
          title="Trade"
          open={selectedOption == "Trade"}
          onOpenChange={() => setSideBarOption("Trade")}
          icon={<i className="trade_nav"></i>}
        >
          <MenuItem onClick={() => closeSidebar()} className={splitLocation[2] === "exchange" ? "active" : ""}>
            <Link to="/trade/exchange">Exchange</Link>
          </MenuItem>
          <MenuItem onClick={() => closeSidebar()} className={splitLocation[2] === "liquidity" ? "active" : ""}>
            <Link to="/trade/liquidity">Liquidity</Link>
          </MenuItem>
          <MenuItem onClick={() => closeSidebar()}  className={splitLocation[2] === "staking" ? "active" : ""}>
            <Link to="/trade/staking">Staking</Link>
          </MenuItem>
        </SubMenu>
        <MenuItem
          onClick={() => { closeSidebar(); setSideBarOption("") }}
          className={splitLocation[1] === "farmplanets" ? "active" : ""}
          icon={<i className="farm_nav_icon"></i>}
        >
          <Link to="/farmplanets/active">Farm Planets</Link>
        </MenuItem>
        <MenuItem
          onClick={() => { closeSidebar(); setSideBarOption("") }}
          className={splitLocation[1] === "poolgalaxy" ? "active" : ""}
          icon={<i className="pools_nav_icon"></i>}
        >
          <Link to="/poolgalaxy">Pool Galaxy</Link>
        </MenuItem>
      </Menu>
      {/* {props.showSocial ? (
        <></>
      ) : ( */}
      <SidebarFooter className="sidebar_footer">
        <ul className="token-language">
          <li className="token_list">
            <Link to='#'>
              <img alt="icon 1" src={SaitamaTokenImg} /> <span>${NiobBusdValue ? NiobBusdValue.toFixed(4) : "0"}</span>
            </Link>
          </li>
          <li className="lang_list">
            <img alt="icon 1" src={Globe} /> <span className="lang_text">EN</span>
          </li>
        </ul>
        <ul className="social_links">
          <li>
            <Link to='#'>
              <img alt="icon 1" src={Github} />
            </Link>
          </li>
          <li>
            <a href="https://docs.niob.finance" target="_blank">
              <img alt="icon 1" src={Docs} />
            </a>
          </li>
          <li>
            <Link to='#'>
              <img alt="icon 1" src={Medium} />
            </Link>
          </li>
          <li>
            <a href="https://twitter.com/niobfinance" target="_blank">
              <img alt="icon 1" src={Twitter} />
            </a>
          </li>
          <li>
            <a href="https://t.me/niobofficial" target="_blank">
              <img alt="icon 1" src={Telegram} />
            </a>
          </li>
        </ul>
      </SidebarFooter>
      {/* )} */}
    </ProSidebar>
  );
};
export default Sidebar;
