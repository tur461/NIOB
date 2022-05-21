import { UserService } from "../../services/UserService";
import { startLoading, stopLoading } from "./LoadingActions";
import { ContractServices } from "../../services/ContractServices";

/** seting action types */
export const actionTypes = {
  REGISTER_USER_REQUEST: "REGISTER_USER_REQUEST",
  REGISTER_USER_SUCCESS: "REGISTER_USER_SUCCESS",
  REGISTER_USER_ERROR: "REGISTER_USER_ERROR",
  REGISTER_FORM_UPDATE: "REGISTER_FORM_UPDATE"

};

/*
 * Action creators for login
 */

export function saveRegisterData(data) {
  return {
    type: actionTypes.REGISTER_FORM_UPDATE,
    payload: data
  };
}


export function userRegister(data) {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    dispatch(startLoading());
    UserService.login(data)
      .then((res) => {
        resolve(res);
        dispatch(stopLoading());
      })
      .catch((ex) => {
        reject(ex);
        dispatch(stopLoading());
      });

  });
}

export function tokenOneApporval(address, value, tokenAddress) {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    dispatch(startLoading());
    ContractServices.approveToken(address, value, tokenAddress)
      .then((res) => {
        dispatch(stopLoading());
        resolve(res);
      })
      .catch((ex) => {
        reject(ex);
        dispatch(stopLoading());
      });

  });
}

export function tokenTwoApporval(data) {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    UserService.login(data)
      .then((res) => {
        //   toast.success(res.data.message);

        resolve(res);
      })
      .catch((ex) => {
        reject(ex);
      });

  });
}

