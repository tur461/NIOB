import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes/PublicRoutes";
import { rootName } from "./constant";
import LoaderComponent from "./components/LoaderComponent/LoaderComponent";
import Confirmation from "./Confirmation";
import { useSelector } from "react-redux";

const Application = () => {
    // const hasAccess = useSelector(state => state.persist.hasAccess);

    return (
        // <>
            // {hasAccess === false ?
                // <> <Confirmation /> </>
                // :
                <>
                    <LoaderComponent></LoaderComponent>
                    <Router>
                        <Switch>
                            {/* <AuthGuard path={`${rootName}/auth`} component={PrivateRoutes} /> */}
                            <Route path={`${rootName}/`} component={PublicRoutes} />
                        </Switch>
                    </Router>
                </>
            // }
        // </>
    )
}

export default Application
