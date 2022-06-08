import React, { useEffect, useState } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { useLocation, withRouter } from "react-router";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import Home from "../../pages/Home/Home";
import FarmPlanets from "../../pages/FarmPlanets/FarmPlanets";
import Footer from "../../components/Footer/Footer";
import Trade from "../../pages/Trade/Trade";
import AddLiquidity from "../../pages/Trade/AddLiquidity";
import { rootName } from "../../constant";
import PoolGalaxy from "../../pages/PoolGalaxy/PoolGalaxy";
import ReactGA from 'react-ga';

const PublicRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.initialize("UA-216327768-1");
    ReactGA.pageview(location.pathname + location.search);
  }, [location])

  const [small, setSmall] = useState(false);
  const [navCollapse, setNavCollapse] = useState(false);
  const [tradeDropdown, openCloseTradeDropdown] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () =>
        setSmall(window.pageYOffset > 200)
      );
    }
  }, []);

  const handleNavCollapse = () => {
    setNavCollapse((prevNavCollapse) => !prevNavCollapse);
    if (navCollapse === false) {
      document.body.className = "expande_container";
      // return () => { document.body.className = ''; }
    } else {
      document.body.className = "";
    }
  };

  const handleSubNav = () => {
    setNavCollapse((prevNavCollapse) => prevNavCollapse);
  };

  return (
    <>
      <Header
        className={`fixed ${small ? "isFixed" : ""}`}
        small_nav={() => handleNavCollapse()}
        mobileIcon={navCollapse}
      />
      <Sidebar
        small_nav={() => handleNavCollapse()}
        className={`fixed ${small ? "isFixed" : ""} ${
          navCollapse ? "small_nav" : ""
        }`}
        showSocial={navCollapse}
        onClickOpenSidebar={() => handleSubNav()}
        closeSidebar={() => {
          handleNavCollapse();
        }}
        tradeDropdown={() => {
          if (navCollapse === true) {
            alert("collapsed");
            handleNavCollapse();
          }
        }}
        tradeDropdown={!tradeDropdown}
        onOpenChange={(open) => {
          alert("fd");
          openCloseTradeDropdown(!open);
        }}
      />
      <Switch>
        <Route path={"/"} component={Home} exact={true} />
        <Route path={"/home"} component={Home} exact={true} />
        <Route path={"/r/:ref"} component={Home} />
        <Route
          path={"/farmplanets/:tab"}
          component={FarmPlanets}
          exact={true}
        />
        <Route path={"/trade/:tab/:fillter?"} component={Trade} exact={true} />
        <Route
              path={'/trade/addLiquidity'}
              component={AddLiquidity}
              exact={true} 
          />
        <Route path={"/poolgalaxy"} component={PoolGalaxy} exact={true} />
      </Switch>
      <Footer />
    </>
  );
};

export default withRouter(PublicRoutes);
