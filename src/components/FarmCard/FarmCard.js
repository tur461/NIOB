import React from 'react'
import { Card } from 'react-bootstrap'
import ButtonLink from "../buttonLink/ButtonLink";
import { rootName } from "../../constant";
import farmicon from "../../assets/images/farm-button-icon.png";
import './FarmCard.scss'
import { useHistory } from 'react-router';

const FarmCard = props => {
    const history = useHistory();

    return (
       <Card className="farmcard">
           <div className="d-flex">
                <div className="cions">
                    <span className="coin_imgs uppr"><img src={props.icon1} alt={"icon"}/></span>
                    <span className="coin_imgs dwn"><img src={props.icon2} alt={"icon"}/></span>
                </div>
                <div className="coin_name">
                    <h3 className="coin_title">{props.title}-{props.title1}</h3>
                    <span>Liquidity {props.liquidity}</span>
                </div>
            </div> 
            <div className="direction">
                <h3>APR {props.apy}</h3>
                <ButtonLink title="Farm" icon={farmicon} link="/farmplanets/active" />
            </div>
       </Card>
    )
}

export default FarmCard;