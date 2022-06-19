import Web3 from "web3";
import l_t from "../logging/l_t";
import { rEq, toDec, toFull, validateTxParams } from "../utils/global";
import { ERR, MISC, NETWORK, WALLET_TYPE } from "../constant";
import WalletConnectProvider from '@walletconnect/web3-provider'
import log from "../logging/logger";

let defaultWalletType = WALLET_TYPE.M_MASK;

const setWalletType = type => defaultWalletType = type;

async function tryGetAccount (type) {
    let { ethereum, web3, r } = window;
    try { 
        r = ethereum && ethereum.isMetaMask ? (await ethereum.request({ method: 'eth_requestAccounts' }))[0] 
            : web3 ? (await web3.eth.getAccounts())[0] 
            : type ? l_t.e(`Install ${type} extension first!`) ? null : null : null;
    } catch(e) {r=null}
    return r;
}

const Web_3 = (_ => {
    let _web3 = null;
    return _ => {
        if (_web3) return _web3;
        const { ethereum, web3, BinanceChain } = window;
        _web3 = WALLET_TYPE.isMMask(defaultWalletType) ? 
        (ethereum && ethereum.isMetaMask 
            ? new Web3(ethereum) :
            ethereum 
            ? new Web3(ethereum) : 
                web3 ? new Web3(web3.currentProvider) : null 
        ) :
        BinanceChain ? new Web3(BinanceChain) : null;
        return _web3 ? _web3 : l_t.e(ERR.INSTALL_WALLET.msg);
    }
})()

function _getByMeth(abi, meth) {
    return abi.filter(a => rEq(a.name, meth))[0];
}

function _getData(abi, meth, params) {
    return {data: (Web_3()).eth.abi.encodeFunctionCall(_getByMeth(abi, meth), params)};
}

const getContract = (_ => {
    return (a, abi) => {
        let w = Web_3();
        return new w.eth.Contract(abi, a);
    }
})();

function _gas(inst, meth, xtra, p) {
    return inst.methods[meth](...p).estimateGas(xtra)
}

function _call(inst, meth, p=[]) {
    log.i('_call:', meth, p);
    try{
        return inst.methods[meth](...p).call();
    } catch(e) {
        console.trace(e, p);
    }
    return new Promise((_, j) => j('some err'));
}

async function _send(abi, inst, meth, xtra, p=[]) {
    // const txObj = {...xtra, ..._getData(abi, meth, p)}
    p = validateTxParams(p);
    log.i('_send', meth, p);
    try {
        await _gas(inst, meth, xtra, p);
    } catch(e) {
        log.i(e);
        return new Promise((_, j) => j(e.reason||e.message||e.toString()));
    }
    
    return inst.methods[meth](...p).send(xtra);
}

function getGasPrice() {
    return (Web_3()).eth.getGasPrice();
}

async function getEthBalance (addr) {
    return toFull(await (Web_3()).eth.getBalance(addr), MISC.DEF_DEC);
}

async function setupWalletEventListeners () {
    const { BinanceChain, ethereum } = window;
    if (WALLET_TYPE.isMMask(defaultWalletType)) {
        const result = Boolean(ethereum && ethereum.isMetaMask);
        if (result) {
            if (ethereum.chainId !== NETWORK.CHAIN_ID)
            try {
                await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: NETWORK.CHAIN_ID }],
                });
            } catch (er) {
                console.log('metamask error', er);
                if (er?.code === 4902)
                try {
                    await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: NETWORK.CHAIN_ID,
                        chainName: NETWORK.CHAIN_NAME,
                        nativeCurrency: {
                        name: NETWORK.NATIVE_CURR_NAME,
                        symbol: NETWORK.NATIVE_CURR_SYM,
                        decimals: Number(NETWORK.NATIVE_CURR_DEC)
                        },
                        rpcUrls: [NETWORK.RPC_URL],
                        blockExplorerUrls: [NETWORK.LINK]
                    }],
                    });
                    window.location.reload();
                } catch (e) { }
            }
        else console.log('chain id match:', ethereum);

            ethereum.on('chainChanged', async (chainId) => {
            if (chainId !== NETWORK.CHAIN_ID)
                try {
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: NETWORK.CHAIN_ID }],
                });
                } catch (er) {
                console.log('metamask error', er);
                if (er?.code === 4902)
                    try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                        chainName: NETWORK.CHAIN_NAME,
                        chainId: await window.ethereum.chainId,
                        nativeCurrency: {
                            name: NETWORK.NATIVE_CURR_NAME,
                            symbol: NETWORK.NATIVE_CURR_SYM,
                            decimals: Number(NETWORK.NATIVE_CURR_DEC)
                        },
                        rpcUrls: [NETWORK.RPC_URL],
                        blockExplorerUrls: [NETWORK.LINK]
                        }],
                    });
                    } catch (e) {}
                }
            });
        }

        }
        if (WALLET_TYPE.isBinance(defaultWalletType)) {
        if (BinanceChain) {
            BinanceChain.on('chainChanged', async chainId => {
            if (chainId !== NETWORK.CHAIN_ID)
                try {
                await BinanceChain.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: NETWORK.CHAIN_ID }],
                });
                } catch (error) {
                console.log('binance error', error)
                }
            });
        }
        }
}

async function callWeb3ForWalletConnect () {
    const provide = new WalletConnectProvider({
      //infuraId: "8570afa4d18b4c5d9cb3a629b08de069",
    rpc: {
    97: 'https://data-seed-prebsc-2-s3.binance.org:8545/',
    56: "https://bsc-dataseed.binance.org/",
    },
    chainId: 97,
    network: "binance",
    qrcode: !0,
    qrcodeModalOptions: {
    mobileLinks: [
        "rainbow",
        "metamask",
        "argent",
        "trust",
        "imtoken",
        "pillar",
    ],
    desktopLinks: [
        "encrypted ink",
    ]
    }
});
}

async function isMMaskConnected () {
    const { ethereum } = window;
    const result = Boolean(ethereum && ethereum.isMetaMask);
    try {
        if (result) {
            const chain = await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK.CHAIN_ID }],
            });
            return !0;
        } else {
            window.alert(`Install Metamask extension first!`);
            window.open('https://metamask.io/', '_blank');
            return !1;
        }
        } catch (error) {
        if (error?.code === 4902) {
            try {
            const addChain = await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                chainId: await window.ethereum.chainId,
                chainName: NETWORK.CHAIN_NAME,
                nativeCurrency: {
                    name: NETWORK.NATIVE_CURR_NAME,
                    symbol: NETWORK.NATIVE_CURR_SYM,
                    decimals: Number(NETWORK.NATIVE_CURR_DEC)
                },
                rpcUrls: [NETWORK.RPC_URL],
                blockExplorerUrls: [NETWORK.LINK]
                }],
            });
    
            return !0;;
    
            } catch (error) {
            return !1;
            }
        }
        if (error?.code === 4001) {
            return !1;
        }
        throw error;
        }    
}

export {
    _call,
    _send,
    Web_3,
    getContract,
    getGasPrice,
    tryGetAccount,
    setWalletType,
    getEthBalance,
    isMMaskConnected,
    callWeb3ForWalletConnect,
    setupWalletEventListeners,
}