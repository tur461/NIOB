import { UserService } from "../../services/UserService";
import { actionTypes } from "../actions";

const initialState = {
  email: "",
  captcha: ""
};

const register = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.REGISTER_FORM_UPDATE:
      return {

        ...state, [action.payload.prop]: action.payload.value

      };



    default:
      return state;
  }
}
export default register;
