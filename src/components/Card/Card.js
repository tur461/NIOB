import './Card.scss'

const Card = props => {
    return (
        <div className={`card_style ${props?.className}`}>
            {props.children}
        </div>
    )

}

export default Card;