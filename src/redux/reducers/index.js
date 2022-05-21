import { combineReducers } from "redux";
// import { reducer as formReducer } from "redux-form";
import { connectRouter } from "connected-react-router";
import { createBrowserHistory } from "history";
import loading from "./loading";
import register from "./register";
import persist from "./persist";
import security from "./security";
import farmReducer from './farm';
export const history = createBrowserHistory();
const appReducer = combineReducers({
 
  loading: loading,
  register: register,
  persist:persist,
  security:security,
  farm: farmReducer,
  router: connectRouter(history)
});

const rootReducer = (state, action) => {
  if (action.type === "LOGOUT_USERS_PERSIST") {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
