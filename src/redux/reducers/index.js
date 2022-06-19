import { combineReducers } from "redux";
// import { reducer as formReducer } from "redux-form";
import { connectRouter } from "connected-react-router";
import { createBrowserHistory } from "history";
import loading from "./loading";
import persist from "./persist";
import farmReducer from './farm';
export const history = createBrowserHistory();
const appReducer = combineReducers({
 
  loading: loading,
  persist:persist,
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
