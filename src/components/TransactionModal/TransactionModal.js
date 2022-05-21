//import './TransactionModal.scss'
import { Link } from 'react-router-dom'
import Card from '../Card/Card'
import closeBtn from '../../assets/images/ionic-md-close.svg'
import checkicon from '../../assets/images/check_icon.svg'
import { BSC_SCAN } from '../../constant'


const TransactionModal = ({ txHash, closeTransactionModal }) => {
    return (
        <>
            <div className="backdrop"></div>
            <Card className="selectCurrency_modal transactionSubmit">
                <div className="col modal_headerStyle">
                    <div className="row modal_headerStyle__rowA lessMargin_bottom  close-col">
                        <div className="  modal_headerStyle__rowA_colLeft">
                            <h2>Transaction Submitted</h2>
                        </div>
                        <div className=" modal_headerStyle__rowA_colRight">
                            <Link to="#" onClick={closeTransactionModal}><img src={closeBtn} alt="icon" /></Link>
                        </div>
                    </div>
                </div>
                <div className="row transaction_body">
                    <div className="col viewbox">
                        <img src={checkicon} alt="icon" width='85' />
                        <a href={`${BSC_SCAN}tx/${txHash}`} target="_blank" rel="noreferrer">View on BscScan</a>
                    </div>
                    <div className="col">
                        <button type="button" className="btn buttonStyle full" onClick={closeTransactionModal}>Close</button>
                    </div>
                </div>
            </Card>
        </>
    );

}

export default TransactionModal;