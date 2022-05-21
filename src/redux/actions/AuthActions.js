import { UserService } from "../../services/UserService";
import { startLoading, stopLoading } from "./LoadingActions";
import { toast } from "../../components/Toast/Toast";
import { saveUser } from "../../redux/actions"


export function saveUserInfo(data) {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    dispatch(startLoading())
    UserService.saveInfo(data)
      .then((res) => {
        dispatch(stopLoading());
        dispatch(saveUser(data));
        toast.success(res.data.message);
        resolve(res);
      })
      .catch((error) => {
        console.log(error)
        toast.error(error?.data.error.message)
        dispatch(stopLoading());

        reject(error);
      });

  });
}







