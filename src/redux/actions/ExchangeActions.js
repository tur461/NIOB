import { WETH } from "../../assets/tokens";
import { try2weth } from "../../services/utils/trading";
import PairContract from "../../services/contracts/PairContract";
import TokenContract from "../../services/contracts/TokenContract";
import { iContains, isAddr, rEq } from "../../services/utils/global";
import default_icon from "../../assets/images/token_icons/default.svg";
import { checkUserLpTokens, saveUserLpTokens } from "./PersistActions";

const PC = PairContract;
const TC = TokenContract;

export const searchTokenByNameOrAddress = q => async (_, getState) => {
  const TC = TokenContract;
  try {
      const {
        persist: { tokenList, priAccount },
      } = getState();
      q = try2weth(q);
      if (isAddr(q)) {
        const filtered = tokenList.filter(tkn => rEq(tkn.addr, q));
        if (filtered.length > 0) return filtered;
        TC.setTo(q);
        const tokenDecimal = await TC.decimals();
        const tokenName = await TC.name();
        const tokenSymbol = await TC.symbol();
        const tokenBalance = await TC.balanceOf(priAccount);
        const obj = {
          icon: default_icon,
          name: tokenName,
          addr: q,
          bal: tokenBalance,
          isAdded: !0,
          isDeleted: !1,
          dec: tokenDecimal,
          sym: tokenSymbol,
        };
        tokenList.push(obj);
        return tokenList;
      }
      return tokenList.filter(tkn => iContains(tkn.name, q));
    } catch (error) {
      console.log("Error: ", error);
      return error;
    }
  };

export const delTokenFromList = d => async (_, getState) => {
  try {
    const {
      persist: { tokenList },
    } = getState();
    tokenList.splice(tokenList.findIndex(tkn => rEq(tkn.addr, d.address)), 1);
    return tokenList;
  } catch (error) {
    console.log("Error: ", error);
    return error;
  }
};

export const commonLpToken = (lp) => {
  return async (dispatch, getState) => {
    try {
      const {
        persist: { priAccount, tokenList, userLpTokens },
      } = getState();
      TC.setTo(lp.pair);
      const balance = await TC.balanceOf(priAccount);
      if (balance > 0) {
        let userLpTokensArr = userLpTokens;
        let token0Obj = {},
          token1Obj = {},
          token0Deposit = 0,
          token1Deposit = 0,
          poolShare = "0",
          ratio = 0;
        const totalSupply = await TC.totalSupply();

        ratio = balance / totalSupply;
        poolShare = ((balance / totalSupply) * 100).toFixed(2);
        PC.setTo(lp.pair);
        const reserves = await PC.getReserves();

        if (lp.token0.toLowerCase() === WETH.toLowerCase()) {
          token0Obj = tokenList.find((d) => d.addr === "BNB");
        } else {
          token0Obj = tokenList.find(
            (d) => d.addr.toLowerCase() === lp.token0.toLowerCase()
          );
        }
        if (lp.token1.toLowerCase() === WETH.toLowerCase()) {
          token1Obj = tokenList.find((d) => d.addr === "BNB");
        } else {
          token1Obj = tokenList.find(
            (d) => d.addr.toLowerCase() === lp.token1.toLowerCase()
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
        persist: { priAccount, tokenList, userLpTokens },
      } = getState();
      if (lp) {
        dispatch(checkUserLpTokens(true));
        let userLpTokensArr = userLpTokens;
        TC.setTo(lp.pair);
        const balance = await TC.balanceOf(priAccount);
        if (balance > 0) {
          let token0Obj = {},
            token1Obj = {},
            token0Deposit = 0,
            token1Deposit = 0,
            poolShare = "0",
            ratio = 0;
          
          const totalSupply = await TC.totalSupply();

          ratio = balance / totalSupply;
          poolShare = ((balance / totalSupply) * 100).toFixed(2);

          PC.setTo(lp.pair);
          const reserves = await PairContract.getReserves();

          if (lp.token0.toLowerCase() === WETH.toLowerCase()) {
            lp.token0 = 'BNB';
            token0Obj = tokenList.find((d) => d.addr === "BNB");
          } else {
            token0Obj = tokenList.find(
              (d) => d.addr.toLowerCase() === lp.token0.toLowerCase()
            );
          }
          if (lp.token1.toLowerCase() === WETH.toLowerCase()) {
            lp.token1 = 'BNB';
            token1Obj = tokenList.find((d) => d.addr === "BNB");
          } else {
            token1Obj = tokenList.find(
              (d) => d.addr.toLowerCase() === lp.token1.toLowerCase()
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
