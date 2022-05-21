import { MAIN_CONTRACT_LIST } from "../assets/tokens";
import { ContractServices } from "./ContractServices";
import { toast } from "../Components/Toast/Toast";

const getTotalPotSize = async () => {
  try {
    const contract = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.lottary.address,
      MAIN_CONTRACT_LIST.lottary.abi
    );
    const decimals = Number(
      await ContractServices.getDecimals(MAIN_CONTRACT_LIST.anchor.address)
    );
    let prizeArray = [];
    for (let initialIndex = 0; initialIndex <= 2; initialIndex++) {
      const number = Number(
        await contract.methods.allocation(initialIndex).call()
      );
      prizeArray.push(number);
    }
    const price = Number(await contract.methods.minPrice().call());
    const amount = Number(await contract.methods.totalAmount().call());

    return { decimals, amount, price, prizeArray };
  } catch (error) {
    console.log(error);
  }
};

const getCurrentTickets = async (user) => {
  try {
    const contract = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.lottary.address,
      MAIN_CONTRACT_LIST.lottary.abi
    );

    const contract2 = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.NFT.address,
      MAIN_CONTRACT_LIST.NFT.abi
    );

    const issueIndex = await contract.methods.issueIndex().call();
    const response = await contract.methods
      .getCurrentLength(user, issueIndex)
      .call();

    let array = [];
    if (response.length > 0) {
      for (let i = 0; i <= response.length - 1; i++) {
        array.push(
          await contract2.methods.getLotteryNumbers(response[i]).call()
        );
      }
    }

    return array;
  } catch (error) {
    console.log(error);
  }
};

const getRewards = async (user, issueIndex) => {
  try {
    const contract = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.lottary.address,
      MAIN_CONTRACT_LIST.lottary.abi
    );
    const contractNFT = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.NFT.address,
      MAIN_CONTRACT_LIST.NFT.abi
    );
    let totalRewards = 0;
    const lastClaim = await contract.methods.lastClaimIndex(user).call();
    let tokenIds = [];
    for (let j = issueIndex; j >= lastClaim; j--) {
      const response = await contract.methods.getCurrentLength(user, j).call();
      if (response.length > 0) {
        tokenIds.push(response);
        for (let k = 0; k <= response.length - 1; k++) {
          try {
            const claimStatus = await contractNFT.methods
              .getClaimStatus(response[k])
              .call();
            if (!claimStatus) {
              const res = await contract.methods
                .getRewardView(response[k])
                .call();
              totalRewards += Number(res);
            } 
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
    return { totalRewards: totalRewards / 10 ** 18, tokenIds };
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getClaim = async (tokenIds, user, rewards) => {
  try {
    const contract = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.lottary.address,
      MAIN_CONTRACT_LIST.lottary.abi
    );

    const gasPrice = await ContractServices.calculateGasPrice();
    const gas = await contract.methods
      .multiClaim(tokenIds[0])
      .estimateGas({ from: user, value: 0 });

    contract.methods
      .multiClaim(tokenIds[0])
      .send({ from: user, gasPrice, gas, value: 0 })
      .on("transactionHash", (hash) => {
        return hash;
      })
      .on("receipt", (receipt) => {
        toast.success("Rewards claimed successfully!");
      })
      .on("error", (error, receipt) => {
        return error;
      });
  } catch (error) {
    console.log(error);
  }
};

const getTransferTaxRate = async () => {
  try {
    const contract = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.anchor.address,
      MAIN_CONTRACT_LIST.anchor.abi
    );
    const transferTaxRate = Number(
      await contract.methods.transferTaxRate().call()
    );
    return transferTaxRate;
  } catch (error) {
    console.log(error);
  }
};

const getBurnAddress = async () => {
  try {
    const contract = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.anchorNew.address,
      MAIN_CONTRACT_LIST.anchorNew.abi
    );
    const burnAddress = await contract.methods.BURN_ADDRESS().call();
    const burnedToken = await ContractServices.getTokenBalance(
      MAIN_CONTRACT_LIST.anchorNew.address,
      burnAddress
    );
    return burnedToken.toFixed(2);
  } catch (error) {
    console.log(error);
  }
};

export const LotteryServices = {
  getTotalPotSize,
  getCurrentTickets,
  getRewards,
  getClaim,
  getTransferTaxRate,
  getBurnAddress,
};
