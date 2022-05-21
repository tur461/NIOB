// set token
export const setToken = (tokenKey, tokenValue) => {
  window.sessionStorage.setItem(tokenKey, tokenValue);
  return true;
};

export const getToken = (tokenKey) =>
  window.sessionStorage.getItem(tokenKey);

export const removeToken = (tokenKey) =>
  window.sessionStorage.removeItem(tokenKey);

// set user type

export const setUserType = (userType, userTypeValue) => {
  window.sessionStorage.setItem(userType, userTypeValue);
  return true;
};

export const getUserType = (userType) =>
  window.sessionStorage.getItem(userType);

export const removeUserType = (userType) =>
  window.sessionStorage.removeItem(userType);
