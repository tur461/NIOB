import { actionTypes } from "../actions";

const initialState = {
  loading: false,
  poolLength:0
};

const farmReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SAVE_POOL_LENGTH:
      return {
          ...state,
          loading: false,
          poolLength: action.payload
      };

    default:
      return state;
  }
};

export default farmReducer;
