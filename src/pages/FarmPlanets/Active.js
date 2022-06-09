import React from 'react'
import { Row, Col } from "react-bootstrap";
import PlanetCard from "../../components/PlanetCard/PlanetCard";
import NIOB from "../../assets/images/saitaswap.png";
import BUSD from "../../assets/images/BUSD-Token.svg";

const Active = op => {
    console.log('[active] props:', [...op.activeFarms]);
    return (
        <div className="planet_list active">
            <Row>
                <Col xl={12}>
                    <div className="planet_list_view">
                    {
                        op.activeFarms.map((farm, i) => (
                            <PlanetCard
                                key={i}
                                index={i}
                                harvestOnClick={op.harvest}
                                currentIndex={op.cIndex}
                                handleChange={_ => op.changeHandler(i)}
                                stakeHandle={op.stakeHandler}
                                handleRoiModal={op.roiModalHandler}
                                status={true}
                                farm={farm}
                                icon1={NIOB}
                                icon2={BUSD}
                                title={`NIOB`}
                                title1={`BUSD`}
                            />
                        ))
                    } 
                    </div>
                </Col>
            </Row>
            
        </div>
    )
}

export default Active;
