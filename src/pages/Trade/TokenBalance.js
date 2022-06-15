import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ContractServices } from '../../services/ContractServices';

const TokenBalance = ({ address }) => {

      const [balance, setBalance] = useState('');
      const P = useSelector(state => state.persist);

      useEffect(() => {
            init();
      }, [P.isConnected, address]);

      const init = async () => {
            try {
                  let res = 0;
                  if (address === 'BNB') {
                        res = await ContractServices.getETHBalance(P.priAccount);
                        setBalance(res);
                  } else {
                        res = await ContractServices.getTokenBalance(address, P.priAccount);
                        setBalance(res);
                  }
            } catch (error) {
                  console.log(error);
            }
      }

      return <span className="tokenName_textStyle">{balance}</span>

}

export default TokenBalance;