import { fetch } from "./Fetch";
import { API_HOST } from "../constant";


const getIp = () => {
  return fetch("get", "https://jsonip.com");
};

const get2FaImage = (data,options) => {
  return fetch("post", `${API_HOST}users/user/google2fa`, data,options,"");
};

const google2faValidate = (data,options) => {
  return fetch("post", `${API_HOST}users/user/google2faValidate`, data,options,"");
};

const google2faDisable = (data,options) => {
  return fetch("post", `${API_HOST}users/user/google2faDisable`, data,options,"");
};
const uploadRawFile = (data, options) => {
  return fetch("post", `${API_HOST}users/file/upload`, data, options, "");
};
const getFileById = (data, options) => {
  return fetch("post", `${API_HOST}users/file/getFile`, data, options, "");
};

const removeKycDoc = (data, options) => {
  return fetch("post", `${API_HOST}users/file/deleteFile`, data, options, "");
};
const getUserKycDetails = (options) => {
  return fetch("get", `${API_HOST}users/user/kyc`, {}, options, "");
}

const getUserProfile = (options) => {
  return fetch("get", `${API_HOST}users/profile/get`, {}, options, "");
}
const updateProfile = (data, options) => {
  return fetch("post", `${API_HOST}users/file/getFile`, data, options, "");
};

const getUserInfo = (options) => {
  return fetch("get", `${API_HOST}users/share/get-user-info`, {}, options, "");
}
const getUserTrustedDevice = (options) => {
  return fetch("get", `${API_HOST}users/user/userAgentInfo`, {}, options, "");
}
const resetUserPassword = (data, options) => {
  return fetch("post", `${API_HOST}users/user/resetPassword`, data, options, "");
};

const updateUserProfile = (data, options) => {
  return fetch("post", `${API_HOST}users/profile/update`, data, options, "");
};

const updateUserKyc = (data, options) => {
  return fetch("post", `${API_HOST}users/user/kyc`, data, options, "");
};









export const SecurityService = {

  getIp,
  get2FaImage,
  google2faValidate,
  google2faDisable,
  uploadRawFile,
  getFileById,
  removeKycDoc,
  getUserProfile,
  updateProfile,
  getUserKycDetails,
  getUserInfo,
  resetUserPassword,
  updateUserProfile,
  getUserTrustedDevice,
  updateUserKyc,

};
