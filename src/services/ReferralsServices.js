import { MAIN_CONTRACT_LIST } from "../assets/tokens";
import { ContractServices } from "./ContractServices";

const getReferralCount = async (address) => {
  try {
    const contract = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.referrals.address,
      MAIN_CONTRACT_LIST.referrals.abi
    );
    return await contract.methods.referralsCount(address).call();
  } catch (error) {
    return error;
  }
};

const getReferralCommissions = async (address) => {
  try {
    const contract = await ContractServices.callContract(
      MAIN_CONTRACT_LIST.referrals.address,
      MAIN_CONTRACT_LIST.referrals.abi
    );
    const decimals = Number(
      await ContractServices.getDecimals(MAIN_CONTRACT_LIST.anchorNew.address)
    );
    const amount = await contract.methods.totalReferralCommissions(address).call();
    return amount / (10 ** decimals);
  } catch (error) {
    return error;
  }
}

const getReferrer = async (address) => {
  try {
    const contract = await ContractServices.callContract(MAIN_CONTRACT_LIST.referrals.address, MAIN_CONTRACT_LIST.referrals.abi);
    return await contract.methods.getReferrer(address).call();
  } catch (err) {
    return err;
  }
}

export const ReferralsServices = {
  getReferralCount,
  getReferralCommissions,
  getReferrer
};
