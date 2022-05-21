import { SecurityService } from "../../services/SecurityService";
import { startLoading, stopLoading } from "./LoadingActions";
import { toast } from "../../components/Toast/Toast";
import { AUTH_TOKEN_KEY } from "../../constant";
import { getToken } from "../../Helpers/storageHelper"



/** seting action types */
export const actionTypes = {
  SAVE_GOOGLE_AUTH_DETAIL: "SAVE_GOOGLE_AUTH_DETAIL",
  KYC_FORM_UPDATE: "KYC_FORM_UPDATE",
  KYC_FORM_CLEAR: "KYC_FORM_CLEAR"

};



export function saveKycFormData(data) {

  return {
    type: actionTypes.KYC_FORM_UPDATE,
    payload: data
  };
}

export function clearKycFormData() {

  return {
    type: actionTypes.KYC_FORM_CLEAR,
  };
}


export function saveGoogleAuthDetails(data) {
  return {
    type: actionTypes.SAVE_GOOGLE_AUTH_DETAIL,
    payload: data
  };
}


export function get2FaImage(data) {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    dispatch(startLoading())
    SecurityService.get2FaImage(data, {
      jwt: getToken(AUTH_TOKEN_KEY)
    })
      .then((res) => {
        dispatch(saveGoogleAuthDetails(res.data.data))
        dispatch(stopLoading());
        resolve(res);
      })
      .catch((ex) => {
        toast.error(ex.data.message)
        dispatch(stopLoading());

        reject(ex);
      });

  });
}


export function google2faValidate(data) {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    dispatch(startLoading())
    SecurityService.google2faValidate(data, {
      jwt: getToken(AUTH_TOKEN_KEY)
    })
      .then((res) => {
        toast.success(res.data.message);

        dispatch(stopLoading());
        resolve(res);
      })
      .catch((ex) => {
        toast.error(ex.data.message)
        dispatch(stopLoading());
        reject(ex);
      });

  });
}


export function google2faDisable(data) {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    dispatch(startLoading())
    SecurityService.google2faDisable(data, {

      jwt: getToken(AUTH_TOKEN_KEY)
    })
      .then((res) => {
        toast.success(res.data.message);

        dispatch(stopLoading());
        resolve(res);
      })
      .catch((ex) => {
        toast.error(ex.data.message)
        dispatch(stopLoading());
        reject(ex);
      });

  });
}



export const uploadRawFile = file => {
  return (dispatch, getState) => {
    let state = getState();

    // dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.uploadRawFile(file, {
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          dispatch(stopLoading());
          toast.success(res.data.message);
          resolve(res);
        })
        .catch((ex) => {
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};


export const removeKycDoc = file => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.removeKycDoc(file, {
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          dispatch(stopLoading());
          toast.success(res.data.message);
          resolve(res);
        })
        .catch((ex) => {
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};


export const getUserKycDetails = data => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.getUserKycDetails({
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          dispatch(stopLoading());
          resolve(res);
        })
        .catch((ex) => {
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};




export const getFileById = data => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.getFileById(data, {
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          dispatch(stopLoading());
          resolve(res);
        })
        .catch((ex) => {
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};

//PROFILE
export const getUserProfile = () => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.getUserProfile({
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          dispatch(stopLoading());
          resolve(res);
        })
        .catch((ex) => {
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};


export const updateUserProfile = data => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.updateUserProfile(data, {
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          toast.success(res.data.message);
          dispatch(stopLoading());
          resolve(res);
        })
        .catch((ex) => {
          toast.error(ex.data.message)
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};


export const getUserInfo = () => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.getUserInfo({
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          dispatch(stopLoading());
          resolve(res);
        })
        .catch((ex) => {
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};
export const getUserTrustedDevice = () => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.getUserTrustedDevice({
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          dispatch(stopLoading());
          resolve(res);
        })
        .catch((ex) => {
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};





export const resetUserPassword = data => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.resetUserPassword(data, {
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          toast.success(res.data.message);
          dispatch(stopLoading());
          resolve(res);
        })
        .catch((ex) => {
          toast.error(ex.data.message)
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};



export const updateUserKyc = data => {
  return (dispatch, getState) => {
    let state = getState();

    dispatch(startLoading());
    return new Promise((resolve, reject) => {
      SecurityService.updateUserKyc(data, {
        jwt: getToken(AUTH_TOKEN_KEY)
      })
        .then((res) => {
          toast.success(res.data.message);
          dispatch(stopLoading());
          resolve(res);
        })
        .catch((ex) => {
          toast.error(ex.data.message)
          dispatch(stopLoading());
          reject(ex);
        });
    });
  };
};









