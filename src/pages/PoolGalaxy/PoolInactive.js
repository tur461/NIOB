import React from "react";
import NIOB from "../../assets/images/saitaswap.png";
import BUSD from "../../assets/images/BUSD-Token.svg";
import GalaxyCard from "../../components/GalaxyCard/GalaxyCard";
import { Col, Row } from "react-bootstrap";

const PoolInactive = op => {

  return (
    <div className="planet_list active">
      <Row>
      <Col xl={12}>
          <div className="planet_list_view">
            <div className="headingStyle">
              <h6>Token</h6>
              <h6>APR</h6>
              <h6>Total Staked</h6>
              <h6 className="earnTxt">Earned</h6>
            </div>
            {op.inactiveFarms.map((farm, index) =>
                <GalaxyCard
                  key={index}
                  index={index}
                  harvestOnClick={op.harvest}
                  currentIndex={op.cIndex}
                  handleChange={() => op.changeHandler(index)}
                  stakeHandle={op.stakeHandler}
                  handleRoiModal={op.roiModalHandler}
                  status={false}
                  farm={farm}
                  icon1={NIOB}
                  icon2={BUSD}
                  title={`NIOB`}
                  title1={`BUSD`}
                />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PoolInactive;
