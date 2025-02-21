'use client'

import { CHAIN_NAMESPACES, IAdapter, IProvider, IWeb3AuthCoreOptions, UX_MODE, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { useEffect, useState } from "react";
import { WalletConnectV2Adapter, getWalletConnectV2Settings } from "@web3auth/wallet-connect-v2-adapter";
import { WalletConnectModal } from "@walletconnect/modal";
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";
import { getInjectedAdapters } from "@web3auth/default-evm-adapter";
import { ethers } from "ethers";

import testAbi from "@/contracts/abi.json";

import RPC from "./etherRPC";

// const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"
const clientId = "BCP4LesPQ1f-L3igfyo9vrojfZOCkDBCnzDbNfAgZSdFGHFsOyxOiAiClD51cZdGKIBzeAh6s9FVSKO7pp9QfQc"

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1",
  rpcTarget: "https://rpc.ankr.com/eth",
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  displayName: "Ethereum Mainnet",
  blockExplorerUrl: "https://etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};


let injectedAdapters: any;
export default function Home() {
  const [web3auth, setWeb3Auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null)
  const [loggedIn, setLoggedin] = useState(false)
  const [walletServicesPlugin, setWalletServicesPlugin] = useState<WalletServicesPlugin | null>(null);

  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       // adding wallet connect v2 adapter
  //       const web3authNoModalOptions: IWeb3AuthCoreOptions = {
  //         clientId,
  //         web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  //         privateKeyProvider,
  //       };

  //       const defaultWcSettings = await getWalletConnectV2Settings(CHAIN_NAMESPACES.EIP155, ["0x1", "0xaa36a7"], "04309ed1007e77d1f119b85205bb779d");
  //       const walletConnectModal = new WalletConnectModal({ projectId: "04309ed1007e77d1f119b85205bb779d" });
  //       const walletConnectV2Adapter = new WalletConnectV2Adapter({
  //         adapterSettings: {
  //           qrcodeModal: walletConnectModal,
  //           ...defaultWcSettings.adapterSettings,
  //         },
  //         loginSettings: { ...defaultWcSettings.loginSettings },
  //       });
  //       web3auth.configureAdapter(walletConnectV2Adapter);

  //       injectedAdapters = await getInjectedAdapters({ options: web3authNoModalOptions });
  //       injectedAdapters.forEach((adapter: IAdapter<unknown>) => {
  //         web3auth.configureAdapter(adapter);
  //       });

  //       const walletServicesPluginInstance = new WalletServicesPlugin({
  //         wsEmbedOpts: {},
  //         walletInitOptions: { whiteLabel: { showWidgetButton: true } },
  //       });

  //       setWalletServicesPlugin(walletServicesPluginInstance);
  //       web3auth.addPlugin(walletServicesPluginInstance);

  //       // IMP END - SDK Initialization
  //       // IMP START - SDK Initialization
  //       await web3auth.init();
  //       setProvider(web3auth.provider);
  //       if (web3auth.connected) {
  //         setLoggedin(true);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   init();
  // }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
        const web3authNoModalOptions: IWeb3AuthCoreOptions = {
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        };
        const web3auth = new Web3AuthNoModal(web3authNoModalOptions);

        const authAdapter = new AuthAdapter();
        web3auth.configureAdapter(authAdapter);

        // adding wallet connect v2 adapter
        const defaultWcSettings = await getWalletConnectV2Settings(CHAIN_NAMESPACES.EIP155, ["0x1", "0xaa36a7"], "04309ed1007e77d1f119b85205bb779d");
        const walletConnectModal = new WalletConnectModal({ projectId: "04309ed1007e77d1f119b85205bb779d" });
        const walletConnectV2Adapter = new WalletConnectV2Adapter({
          adapterSettings: {
            qrcodeModal: walletConnectModal,
            ...defaultWcSettings.adapterSettings,
          },
          loginSettings: { ...defaultWcSettings.loginSettings },
        });
        web3auth.configureAdapter(walletConnectV2Adapter);

        injectedAdapters = getInjectedAdapters({ options: web3authNoModalOptions });
        injectedAdapters.forEach((adapter: IAdapter<unknown>) => {
          web3auth.configureAdapter(adapter);
        });

        const walletServicesPluginInstance = new WalletServicesPlugin({
          wsEmbedOpts: {},
          walletInitOptions: { whiteLabel: { showWidgetButton: true } },
        });

        setWalletServicesPlugin(walletServicesPluginInstance);
        web3auth.addPlugin(walletServicesPluginInstance);

        setWeb3Auth(web3auth);
        await web3auth.init();
        setProvider(web3auth.provider);
        if (web3auth.connected) {
          setLoggedin(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const logIn = async () => {
    var web3authProvider = null;
    web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
      loginProvider: "google",
    });
    console.log(web3authProvider);
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedin(true)
    }
  }

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedin(false);
  };

  const getUserInfo = async () => {
    // IMP START - Get User Information
    const user = await web3auth.getUserInfo();
    // IMP END - Get User Information
    uiConsole(user);
  };


  // log in wallet
  const loginWithInjected = async (adapterName: string) => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(adapterName);
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedin(true);
    }
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const address = await RPC.getAccounts(provider);
    uiConsole(address);
  };

  const loginWCModal = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.WALLET_CONNECT_V2);
    setProvider(web3authProvider);
    if (web3auth.connected) {
      setLoggedin(true);
    }
  }

  const abiIntraction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const abiAddress = "0x46f2392F70FaDc9cA077aa8cd13346a4E639E388";
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const abi = new ethers.Contract(abiAddress, testAbi, signer);

    const abiData = await abi.retrieve();

    uiConsole(abiData);
  }

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  return (
    <div>
      <button onClick={logIn}>
        {
          loggedIn ? "logged in" : "not logged in"
        }
      </button>
      <button onClick={logout}>logout</button>

      <br></br>

      <button onClick={getUserInfo}>
        Get USer Info
      </button>

      <button onClick={getAccounts}>
        Get Account
      </button>

      <br></br>

      <div className="bg-red-200">
        {injectedAdapters?.map((adapter: IAdapter<unknown>) => (
          <button key={adapter.name.toUpperCase()} onClick={() => loginWithInjected(adapter.name)} className="card">
            Login with {adapter.name.charAt(0).toUpperCase() + adapter.name.slice(1)} Wallet
          </button>
        ))}
      </div>


      <br></br>
      <button onClick={loginWCModal} className="card">
        Login with Wallet Connect v2
      </button>


      <br></br>
      <button onClick={abiIntraction} className="card">
        Abi Interaction
      </button>

      
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </div>
  );
}
