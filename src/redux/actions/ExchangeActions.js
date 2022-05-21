import { ContractServices } from "../../services/ContractServices";
import default_icon from "../../assets/images/token_icons/default.svg";
import { UserService } from "../../services/UserService";
import { checkUserLpTokens, saveUserLpTokens } from "./PersistActions";
import { WETH } from "../../assets/tokens";
import { ExchangeService } from "../../services/ExchangeService";

export const searchTokenByNameOrAddress =
  (address) => async (dispatch, getState) => {
    try {
      const {
        persist: { tokenList },
      } = getState();

      if (address.length === 42) {
        const filteredTokenList = tokenList.filter((token) =>
          token.address.toLowerCase().includes(address.toLowerCase())
        );
        if (filteredTokenList.length > 0) {
          return filteredTokenList;
        }
        const tokenDecimal = await ContractServices.getDecimals(address);
        const tokenName = await ContractServices.getTokenName(address);
        const tokenSymbol = await ContractServices.getTokenSymbol(address);
        const tokenBalance = await ContractServices.getTokenBalance(address);
        const obj = {
          icon: default_icon,
          name: tokenName,
          address,
          isAdd: true,
          isDel: false,
          decimals: tokenDecimal,
          symbol: tokenSymbol,
        };
        tokenList.push(obj);
        return tokenList;
      }
      return tokenList.filter((token) =>
        token.name.toLowerCase().includes(address.toLowerCase())
      );
    } catch (error) {
      console.log("Error: ", error);
      return error;
    }
  };

export const delTokenFromList = (data) => async (dispatch, getState) => {
  try {
    const {
      persist: { tokenList },
    } = getState();
    tokenList.splice(
      tokenList.findIndex(
        (a) => a.address.toLowerCase() === data.address.toLowerCase()
      ),
      1
    );
    return tokenList;
  } catch (error) {
    console.log("Error: ", error);
    return error;
  }
};

export const getUserLPTokens = () => async (dispatch, getState) => {
  try {
    const {
      persist: { updateUserLpTokens },
    } = getState();
    if (!updateUserLpTokens) {
      dispatch(saveUserLpTokens([]));
      let lpTokensCount = await UserService.getPairsCount();
      lpTokensCount = lpTokensCount.data.count;

      const limit = 100;
      const totalPages = Math.ceil(lpTokensCount / limit);
      // let lpTokensArr = [];
      for (let page = 1; page <= totalPages; page++) {
        let lpTokens = await UserService.getPairs({ page, limit });

        lpTokens = lpTokens.data;
        // lpTokensArr = lpTokensArr.concat(lpTokens);
        for (let lp of lpTokens) {
          await dispatch(commonLpToken(lp));
        }

        // console.log("LPTOKENS:", lpTokens);
      }
    }
  } catch (error) {
    console.log("Error: ", error);
    return error;
  }
};
export const commonLpToken = (lp) => {
  return async (dispatch, getState) => {
    try {
      const {
        persist: { isUserConnected, tokenList, userLpTokens },
      } = getState();
      const balance = await ContractServices.getTokenBalanceFull(
        lp.pair,
        isUserConnected
      );
      if (balance > 0) {
        let userLpTokensArr = userLpTokens;
        let token0Obj = {},
          token1Obj = {},
          token0Deposit = 0,
          token1Deposit = 0,
          poolShare = "0",
          ratio = 0;
        const totalSupply = await ContractServices.getTotalSupply(lp.pair);

        ratio = balance / totalSupply;
        poolShare = ((balance / totalSupply) * 100).toFixed(2);

        const reserves = await ExchangeService.getReserves(lp.pair);

        if (lp.token0.toLowerCase() === WETH.toLowerCase()) {
          token0Obj = tokenList.find((d) => d.address === "BNB");
        } else {
          token0Obj = tokenList.find(
            (d) => d.address.toLowerCase() === lp.token0.toLowerCase()
          );
        }
        if (lp.token1.toLowerCase() === WETH.toLowerCase()) {
          token1Obj = tokenList.find((d) => d.address === "BNB");
        } else {
          token1Obj = tokenList.find(
            (d) => d.address.toLowerCase() === lp.token1.toLowerCase()
          );
        }
        //lp deposit
        token0Deposit = (
          ratio *
          (reserves["_reserve0"] / 10 ** token0Obj.decimals)
        );
        token1Deposit = (
          ratio *
          (reserves["_reserve1"] / 10 ** token1Obj.decimals)
        );

        const data = {
          ...lp,
          token0Obj,
          token1Obj,
          token0Deposit,
          token1Deposit,
          balance,
          poolShare,
        };
        userLpTokensArr = [...userLpTokensArr, data];
        dispatch(
          saveUserLpTokens(userLpTokensArr)
        );
      }
    } catch (error) {

    }
  }
}

export const addLpToken = (lp) => {
  return async (dispatch, getState) => {
    try {
      const {
        persist: { isUserConnected, tokenList, userLpTokens },
      } = getState();
      if (lp) {
        dispatch(checkUserLpTokens(true));
        let userLpTokensArr = userLpTokens;

        const balance = await ContractServices.getTokenBalanceFull(
          lp.pair,
          isUserConnected
        );
        if (balance > 0) {
          let token0Obj = {},
            token1Obj = {},
            token0Deposit = 0,
            token1Deposit = 0,
            poolShare = "0",
            ratio = 0;
          const totalSupply = await ContractServices.getTotalSupply(lp.pair);

          ratio = balance / totalSupply;
          poolShare = ((balance / totalSupply) * 100).toFixed(2);

          const reserves = await ExchangeService.getReserves(lp.pair);

          if (lp.token0.toLowerCase() === WETH.toLowerCase()) {
            lp.token0 = 'BNB';
            token0Obj = tokenList.find((d) => d.address === "BNB");
          } else {
            token0Obj = tokenList.find(
              (d) => d.address.toLowerCase() === lp.token0.toLowerCase()
            );
          }
          if (lp.token1.toLowerCase() === WETH.toLowerCase()) {
            lp.token1 = 'BNB';
            token1Obj = tokenList.find((d) => d.address === "BNB");
          } else {
            token1Obj = tokenList.find(
              (d) => d.address.toLowerCase() === lp.token1.toLowerCase()
            );
          }
          //lp deposit
          token0Deposit = (
            ratio *
            (reserves["_reserve0"] / 10 ** token0Obj.decimals)
          );
          token1Deposit = (
            ratio *
            (reserves["_reserve1"] / 10 ** token1Obj.decimals)
          );

          const data = {
            ...lp,
            token0Obj,
            token1Obj,
            token0Deposit,
            token1Deposit,
            balance,
            poolShare,
          };
          let check = true;
          for (let oldLp of userLpTokens) {
            if (oldLp.pair.toLowerCase() === lp.pair.toLowerCase()) {
              check = false;
            }
          }
          if (check) {
            userLpTokensArr = [...userLpTokensArr, data];
            await dispatch(
              saveUserLpTokens(userLpTokensArr)
            );
          }
          return data;
        } else {
          return null;
        }
      }
    } catch (error) {
      console.log("Error: ", error);
      return error;
    }
  };
};
