import React, { Component } from "react";
import { connect } from "react-redux";
import Loader from 'react-loader-spinner'
import './LoaderStyle.scss'

class LoaderComponent extends Component {
  render() {
    if (this.props.loading) {
      return (
        <div className="overlayDiv">
          <Loader
            type="BallTriangle"
            color="#FFFFFF"
            height={60}
            width={60}
            visible={true}
          // timeout={5000} //3 secs
          />
        </div>
      );
    } else {
      return <></>
    }
  }
}

const mapStateToProps = state => {
  return {
    loading: state.loading.loading
  };
};

export default connect(mapStateToProps)(LoaderComponent);
