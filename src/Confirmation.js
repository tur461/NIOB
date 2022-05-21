import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginConfirmationScreen } from "./redux/actions";

const Confirmation = () => {
    const dispatch = useDispatch();

    let m = "hN5r&HCPMs";
    const [inputValue, setInputValue] = useState("");

    const onChange = (e) => {
        setInputValue(e.target.value);
    }

    const handleEnter = (e) => {
        e.preventDefault();
        if(inputValue === m) {
            dispatch(loginConfirmationScreen())
        }
    }

    return (
          <div className="d-center">
              <div className="information-box">
                <h3>Welcome To NiobSwap</h3>  
                <h3>Please Enter Code To Access Site</h3>
                <form action="">
                    <input type="text" value={inputValue} onChange={onChange} className="form-control mb-3" />
                    <h6><button onClick={handleEnter}>Enter</button></h6>
                </form>
              </div>
          </div>
        
    )
}

export default Confirmation
