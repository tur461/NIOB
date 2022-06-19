import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes/PublicRoutes";
import LoaderComponent from "./components/LoaderComponent/LoaderComponent";

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
                            <Route path={`/`} component={PublicRoutes} />
                        </Switch>
                    </Router>
                </>
            // }
        // </>
    )
}

export default Application
