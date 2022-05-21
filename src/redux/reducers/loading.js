import { actionTypes } from "../actions/LoadingActions";

const initialState = {
  loading: false 
};

const loading = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.START_LOADING:
      return {loading: true};
    case actionTypes.STOP_LOADING:
      return {loading: false};
    default:
      return state;
  }
};

export default loading;
