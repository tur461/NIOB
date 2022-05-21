import React from 'react'
import { Card } from 'react-bootstrap'
import './CardStyle.scss'

const CardCustom = props => {
    return (
       <Card className={`cardStyle ${props.cardStyle}`}>
           {props.children}
       </Card>
    )
}

export default CardCustom
