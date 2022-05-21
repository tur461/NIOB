import React, { Component, lazy, Suspense } from "react";
import { withRouter } from "react-router";
import { Route, Switch } from "react-router-dom";

class PrivateRoutes extends Component {
  state = {};
  render() {
    return (
      <>
        
  
        <Switch>
       
          {/* <Route
            path={`/auth/Dashboard`}
            component={Dashboard}
            exact={true}
          /> */}
          
        </Switch>   
             
      </>
    );
  }
}

export default withRouter(PrivateRoutes);