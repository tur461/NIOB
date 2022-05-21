import React from 'react'
import { Link } from 'react-router-dom'
import './ButtonLinkStyle.scss'

function ButtonLink(props) {
    return (
        <Link to={props.link} className={`linkBtn ${props.className}`}>{props.title} <img src={props.icon} alt={"icon"} /> </Link>
    )
}



export default ButtonLink
