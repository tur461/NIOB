import { fetch } from "./Fetch";
import { API_HOST } from "../constant";

const getPairsCount = () => fetch("get", `${API_HOST}pair/count`, {});
const getPairs = (data) => fetch("post", `${API_HOST}pair/getAll`, data);
const saveInfo = (user) => fetch("post", `${API_HOST}account/saveInfo`, user);

const getHistoryNumbers = (page, limit) =>
  fetch("get", `${API_HOST}drawing/getAll/${page}/${limit}`);
const getLotteryDetails = (index) =>
  fetch("get", `${API_HOST}drawing/getAll/${index}`);

const getChartDetails = () => fetch("get", `${API_HOST}drawing/getChart`);

export const UserService = {
  saveInfo,
  getPairsCount,
  getPairs,
  getHistoryNumbers,
  getLotteryDetails,
  getChartDetails,
};
