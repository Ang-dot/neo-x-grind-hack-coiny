import { useEffect, useMemo } from 'react'
import { FEATURES, RPC_AUTHENTICATION, type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import { Errors, logError } from '@/services/exceptions'
import { getConfigs } from '@/hooks/loadables/helpers/config'

const neoChains: ChainInfo[] = [
  {
    chainId: '47763',
    chainName: 'Neo X Mainnet',
    description: '',
    chainLogoUri: 'https://x.neo.org/assets/hero-x.png',
    l2: true,
    isTestnet: false,
    nativeCurrency: {
      name: 'GAS',
      symbol: 'GAS',
      decimals: 18,
      logoUri: 'https://assets.coingecko.com/coins/images/858/standard/GAS_512_512.png',
    },
    transactionService: '',
    blockExplorerUriTemplate: {
      address: 'https://xexplorer.neo.org/address/{{address}}',
      txHash: 'https://xexplorer.neo.org/tx/{{txHash}}',
      api: 'https://xexplorer.neo.org/api?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}',
    },
    disabledWallets: ['coinbase', 'ledger_v2', 'pk', 'safeMobile', 'socialSigner'],
    ensRegistryAddress: null,
    features: [FEATURES.EIP1271, FEATURES.EIP1559, FEATURES.ERC721, FEATURES.TX_SIMULATION],
    gasPrice: [],
    publicRpcUri: {
      authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
      value: 'https://mainnet-1.rpc.banelabs.org',
    },
    rpcUri: {
      authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
      value: 'https://mainnet-1.rpc.banelabs.org',
    },
    safeAppsRpcUri: {
      authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
      value: 'https://mainnet-1.rpc.banelabs.org',
    },
    shortName: 'neox',
    theme: {
      textColor: '#ffffff',
      backgroundColor: '#2B1463',
    },
    balancesProvider: {
      chainName: null,
      enabled: false,
    },
    contractAddresses: {
      safeSingletonAddress: '0x4544204163b39b4E27e3c4fBe29B5Ec416805D8B',
      safeProxyFactoryAddress: '0x886D92443799Fc88c31573E3EB7e4DE66AD0b0a6',
      multiSendAddress: '0x218543288004CD07832472D464648173c77D7eB7',
      multiSendCallOnlyAddress: '0x3EbB62B65423a33a846416ff7Ce9BE6f9b86b3B4',
      fallbackHandlerAddress: '0x411c6dbBb6c908f7345b0156C47FD0b5B986D48D',
      signMessageLibAddress: '0x05A6FF767f1bb9e380dEb8ef3B291b2695Cde59A',
      createCallAddress: '0xB22D635D552eC95142E2Abe3FfB859eA7d7C0316',
      simulateTxAccessorAddress: '0x07EfA797c55B5DdE3698d876b277aBb6B893654C',
      safeWebAuthnSignerFactoryAddress: null,
    },
  },
  {
    chainId: '12227332',
    chainName: 'Neo X Testnet T4',
    description: '',
    chainLogoUri: 'https://x.neo.org/assets/hero-x.png',
    l2: true,
    isTestnet: true,
    nativeCurrency: {
      name: 'GAS',
      symbol: 'GAS',
      decimals: 18,
      logoUri: 'https://assets.coingecko.com/coins/images/858/standard/GAS_512_512.png',
    },
    transactionService: '',
    blockExplorerUriTemplate: {
      address: 'https://neoxt4scan.ngd.network/address/{{address}}',
      txHash: 'https://neoxt4scan.ngd.network/tx/{{txHash}}',
      api: 'https://neoxt4scan.ngd.network/api?module={{module}}&action={{action}}&address={{address}}&apiKey={{apiKey}}',
    },
    disabledWallets: ['coinbase', 'ledger_v2', 'pk', 'safeMobile', 'socialSigner'],
    ensRegistryAddress: null,
    features: [FEATURES.EIP1271, FEATURES.EIP1559, FEATURES.ERC721, FEATURES.TX_SIMULATION],
    gasPrice: [],
    publicRpcUri: {
      authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
      value: 'https://testnet.rpc.banelabs.org',
    },
    rpcUri: {
      authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
      value: 'https://testnet.rpc.banelabs.org',
    },
    safeAppsRpcUri: {
      authentication: RPC_AUTHENTICATION.NO_AUTHENTICATION,
      value: 'https://testnet.rpc.banelabs.org',
    },
    shortName: 'neot4',
    theme: {
      textColor: '#ffffff',
      backgroundColor: '#2B1463',
    },
    balancesProvider: {
      chainName: null,
      enabled: false,
    },
    contractAddresses: {
      safeSingletonAddress: '0x4544204163b39b4E27e3c4fBe29B5Ec416805D8B',
      safeProxyFactoryAddress: '0x886D92443799Fc88c31573E3EB7e4DE66AD0b0a6',
      multiSendAddress: '0x218543288004CD07832472D464648173c77D7eB7',
      multiSendCallOnlyAddress: '0x3EbB62B65423a33a846416ff7Ce9BE6f9b86b3B4',
      fallbackHandlerAddress: '0x411c6dbBb6c908f7345b0156C47FD0b5B986D48D',
      signMessageLibAddress: '0x05A6FF767f1bb9e380dEb8ef3B291b2695Cde59A',
      createCallAddress: '0xB22D635D552eC95142E2Abe3FfB859eA7d7C0316',
      simulateTxAccessorAddress: '0x07EfA797c55B5DdE3698d876b277aBb6B893654C',
      safeWebAuthnSignerFactoryAddress: null,
    },
  },
]

export const useLoadChains = (): AsyncResult<ChainInfo[]> => {
  const [data, error, loading] = useAsync<ChainInfo[]>(getConfigs, [])

  // Combine the API data with the custom chain
  const combinedData = useMemo(() => {
    if (data) {
      return [...neoChains, ...data]
    }
    return []
  }, [data])

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._620, error.message)
    }
  }, [error])

  // Return the combined data, error, and loading state
  return [combinedData, error, loading]
}

export default useLoadChains
