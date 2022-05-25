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
import NIOBtoken from "../../assets/images/NIOB-Token-Icon.svg";
import Telegram from "../../assets/images/telegram-icon.svg";
import Docs from "../../assets/images/docs-icon.svg";
import Medium from "../../assets/images/medium-icon.svg";
import Github from "../../assets/images/git.svg";
import Globe from "../../assets/images/language-switcher-icon.svg";
import "./Sidebar.scss";
import useWindowDimensions from "../../hooks/getWindowDimensions";
import { ANCHOR_BUSD_LP, AUDIT, DOCS, INSURANCE_FUND, LOTTERY, NIOB_SHARING, PREDICTION_TRAINING, TRADING_FEE_CASHBACK } from "../../assets/tokens";
import { ExchangeService } from "../../services/ExchangeService";

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
    const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
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
        <MenuItem
          onClick={() => { closeSidebar(); setSideBarOption("") }}
          className={splitLocation[1] === "home" ? "active" : ""}
          icon={<i className="pred_nav_icon"></i>}
        >
          <Link to="/home">Prediction Trading</Link>
          <a href={"https://prdt.niob.app"} target="_blank">Prediction Trading</a>
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
          <MenuItem onClick={() => closeSidebar()}
            className={splitLocation[2] === "liquidity" ? "active" : ""}
          >
            <Link to="/trade/liquidity">Liquidity</Link>
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
        {/* <MenuItem onClick={()=>setSideBarOption("")} icon={<i className="lottery_nav_icon"></i>}><Link to="/lottery">Lottery</Link></MenuItem> */}
        <MenuItem
          onClick={() => { closeSidebar(); setSideBarOption("") }}
          className={splitLocation[1] === "referral" ? "active" : ""}
          icon={<i className="referrals_nav_icon"></i>}
        >
          <Link to="/referral">Referral</Link>
        </MenuItem>
        <MenuItem
          onClick={() => { setSideBarOption(""); closeSidebar() }}
          icon={<i className="audits_nav_icon"></i>}
        >
          <a href={AUDIT} target="_blank">Audits</a>
        </MenuItem>
        <SubMenu
          title="Features"
          open={selectedOption == "Features"}
          onOpenChange={() => setSideBarOption("Features")}
          icon={<i className="features_nav_icon"></i>}
        >
          <MenuItem
            onClick={() => { closeSidebar() }}
          >
            <a href={LOTTERY} target="_blank">Lottery</a>
          </MenuItem>
          <MenuItem
            onClick={() => { closeSidebar() }}
          >
            <a href={NIOB_SHARING} target="_blank">Niob-Sharing</a>
          </MenuItem>
          <MenuItem
            onClick={() => { closeSidebar() }}
          >
            <a href={PREDICTION_TRAINING} target="_blank">Prediction Trading</a>
          </MenuItem>
          <MenuItem
            onClick={() => { closeSidebar() }}
          >
            <a href={INSURANCE_FUND} target="_blank">Insurance Fund</a>
          </MenuItem>
          <MenuItem
            onClick={() => { closeSidebar() }}
          >
            <a href={TRADING_FEE_CASHBACK} target="_blank">Trading-Fee Cashback</a>
          </MenuItem>
        </SubMenu>

        {/* <SubMenu
          title="Listings"
          open={selectedOption == "Listings"}
          onOpenChange={() => setSideBarOption("Listings")}
          icon={<i className="listings_nav_icon"></i>}
        >
          <MenuItem
            onClick={() => {closeSidebar()}}
          >
            <Link to="/">Listing A</Link>
          </MenuItem>
          <MenuItem
            onClick={() => {closeSidebar()}}
          >
            <Link to="/">Listing B</Link>
          </MenuItem>
        </SubMenu> */}

        <SubMenu
          title="Analytics"
          open={selectedOption == "Analytics"}
          onOpenChange={() => setSideBarOption("Analytics")}
          icon={<i className="analytics_nav_icon"></i>}
        >
          <MenuItem
            onClick={() => { closeSidebar() }}
          >
            <Link to="/">Analytic A</Link>
          </MenuItem>
          <MenuItem
            onClick={() => { closeSidebar() }}
          >
            <Link to="/">Analytic B</Link>
          </MenuItem>
        </SubMenu>

        <SubMenu
          title="More"
          open={selectedOption == "More"}
          onOpenChange={() => setSideBarOption("More")}
          icon={<i className="more_nav_icon"></i>}
        >
          <MenuItem
            onClick={() => { closeSidebar() }}
          >
            <a href={DOCS} target="_blank">Docs</a>
          </MenuItem>
          {/* <MenuItem
            onClick={() => {closeSidebar()}}
          >
            <Link to="/">Blog</Link>
          </MenuItem> */}
        </SubMenu>
      </Menu>
      {/* {props.showSocial ? (
        <></>
      ) : ( */}
      <SidebarFooter className="sidebar_footer">
        <ul className="token-language">
          <li className="token_list">
            <Link to='#'>
              <img alt="icon 1" src={NIOBtoken} /> <span>${NiobBusdValue ? NiobBusdValue.toFixed(4) : "0"}</span>
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
