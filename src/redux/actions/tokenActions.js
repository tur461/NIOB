import { UserService } from "../../services/UserService";
import { startLoading, stopLoading } from "./LoadingActions";
import { PersistActions } from "../actions"
import { ContractServices } from "../../services/ContractServices";



export function getTokenBalance() {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    ContractServices.tokenBalance()
      .then((res) => {
        resolve(res);
      })
      .catch((ex) => {
        reject(ex);
      });

  });
}


