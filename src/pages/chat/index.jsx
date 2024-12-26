"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader, ExternalLink } from 'lucide-react';
import { processingService } from '@/services/ai/processing';
import { useDynamicContext } from '@/lib/dynamic';
import { ethers } from 'ethers';
import Safe, {
    PredictedSafeProps,
    SafeAccountConfig,
    SafeDeploymentConfig
} from '@safe-global/protocol-kit';
import useWallet from '@/hooks/wallets/useWallet';
// import SafeApiKit from '@safe-global/api-kit';

const ChatInterface = () => {
    // State management
    const [messages, setMessages] = useState([{
        type: 'assistant',
        content: `Coiny! I can help you create multisig wallets on various chains.

    Try these example commands:
    • "Open a multisig wallet on Neo X Mainnet chain with 0x123 and 0x456 as signers"
    • "Create new safe wallet on Neo X Mainnet with 0x789 as owner"
    • "Set up a multisig on Neo X Mainnet with owners 0xabc, 0xdef requiring 2 signatures"
    
    Do make sure that you're connected to the correct network before creating a wallet.`
    }]);
    const [inputMessage, setInputMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [currentSafeDetails, setCurrentSafeDetails] = useState(null);
    const messagesEndRef = useRef(null);
    //   const { primaryWallet } = useDynamicContext();
    const wallet = useWallet();
    // Wallet service configuration
    const networks = {
        'sepolia': {
            id: 11155111,
            name: 'Sepolia',
            rpcUrl: 'https://sepolia.infura.io/v3/',
            safeService: 'https://safe-transaction-sepolia.safe.global',
            blockExplorer: 'https://sepolia.etherscan.io',
            hasSafeApp: true,
            contractAddresses: {
                compatibility_fallback_handler: {
                    eip155: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
                    canonical: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'
                },
                create_call: {
                    eip155: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
                    canonical: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4'
                },
                gnosis_safe: {
                    canonical: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
                    eip155: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938'
                },
                gnosis_safe_l2: {
                    canonical: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
                    eip155: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA'
                },
                multi_send: {
                    canonical: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
                    eip155: '0x998739BFdAAdde7C933B942a68053933098f9EDa'
                },
                multi_send_call_only: {
                    canonical: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
                    eip155: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B'
                },
                proxy_factory: {
                    canonical: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
                    eip155: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC'
                },
                sign_message_lib: {
                    canonical: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
                    eip155: '0x98FFBBF51bb33A056B08ddf711f289936AafF717'
                },
                simulate_tx_accessor: {
                    canonical: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
                    eip155: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
                }
            }
        },
        'base sepolia': {
            id: 84532,
            name: 'Base Sepolia',
            rpcUrl: 'https://sepolia.base.org',
            safeService: 'https://safe-transaction-base-sepolia.safe.global',
            blockExplorer: 'https://sepolia.basescan.org',
            hasSafeApp: true,
            contractAddresses: {
                compatibility_fallback_handler: {
                    eip155: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
                    canonical: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'
                },
                create_call: {
                    eip155: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
                    canonical: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4'
                },
                gnosis_safe: {
                    canonical: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
                    eip155: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938'
                },
                gnosis_safe_l2: {
                    canonical: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
                    eip155: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA'
                },
                multi_send: {
                    canonical: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
                    eip155: '0x998739BFdAAdde7C933B942a68053933098f9EDa'
                },
                multi_send_call_only: {
                    canonical: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
                    eip155: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B'
                },
                proxy_factory: {
                    canonical: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
                    eip155: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC'
                },
                sign_message_lib: {
                    canonical: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
                    eip155: '0x98FFBBF51bb33A056B08ddf711f289936AafF717'
                },
                simulate_tx_accessor: {
                    canonical: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
                    eip155: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
                }
            }
        },
        'mantle sepolia': {
            id: 5003,
            name: 'Mantle Sepolia',
            rpcUrl: 'https://rpc.sepolia.mantle.xyz',
            blockExplorer: 'https://rpc.sepolia.mantle.xyz',
            hasSafeApp: false,
            contractAddresses: {
                compatibility_fallback_handler: {
                    eip155: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
                    canonical: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'
                },
                create_call: {
                    eip155: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
                    canonical: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4'
                },
                gnosis_safe: {
                    canonical: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
                    eip155: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938'
                },
                gnosis_safe_l2: {
                    canonical: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
                    eip155: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA'
                },
                multi_send: {
                    canonical: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
                    eip155: '0x998739BFdAAdde7C933B942a68053933098f9EDa'
                },
                multi_send_call_only: {
                    canonical: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
                    eip155: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B'
                },
                proxy_factory: {
                    canonical: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
                    eip155: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC'
                },
                sign_message_lib: {
                    canonical: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
                    eip155: '0x98FFBBF51bb33A056B08ddf711f289936AafF717'
                },
                simulate_tx_accessor: {
                    canonical: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
                    eip155: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
                }
            }
        },
        'morph holesky': {
            id: 2810,
            name: 'Morph Holesky',
            rpcUrl: 'https://rpc-holesky.morphl2.io',
            blockExplorer: 'https://explorer-holesky.morphl2.io/',
            hasSafeApp: false,
            contractAddresses: {
                compatibility_fallback_handler: {
                    eip155: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
                    canonical: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'
                },
                create_call: {
                    eip155: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
                    canonical: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4'
                },
                gnosis_safe: {
                    canonical: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
                    eip155: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938'
                },
                gnosis_safe_l2: {
                    canonical: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
                    eip155: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA'
                },
                multi_send: {
                    canonical: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
                    eip155: '0x998739BFdAAdde7C933B942a68053933098f9EDa'
                },
                multi_send_call_only: {
                    canonical: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
                    eip155: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B'
                },
                proxy_factory: {
                    canonical: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
                    eip155: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC'
                },
                sign_message_lib: {
                    canonical: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
                    eip155: '0x98FFBBF51bb33A056B08ddf711f289936AafF717'
                },
                simulate_tx_accessor: {
                    canonical: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
                    eip155: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
                }
            }
        },
        'rootstock testnet': {
            id: 31,
            name: 'Rootstock Testnet',
            rpcUrl: 'https://mycrypto.testnet.rsk.co',
            blockExplorer: 'https://explorer.rootstock.io/',
            hasSafeApp: false,
            contractAddresses: {
                compatibility_fallback_handler: {
                    canonical: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'
                },
                create_call: {
                    canonical: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4'
                },
                gnosis_safe: {
                    canonical: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552'
                },
                gnosis_safe_l2: {
                    canonical: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E'
                },
                multi_send: {
                    canonical: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761'
                },
                multi_send_call_only: {
                    canonical: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D'
                },
                proxy_factory: {
                    canonical: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2'
                },
                sign_message_lib: {
                    canonical: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2'
                },
                simulate_tx_accessor: {
                    canonical: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da'
                }
            }
        },
        'celo alfajores': {
            id: 44787,
            name: 'Celo Alfajores',
            rpcUrl: 'https://alfajores-forno.celo-testnet.org',
            blockExplorer: 'https://alfajores.celoscan.io/',
            hasSafeApp: false,
            contractAddresses: {
                compatibility_fallback_handler: {
                    canonical: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'
                },
                create_call: {
                    canonical: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4'
                },
                gnosis_safe: {
                    canonical: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552'
                },
                gnosis_safe_l2: {
                    canonical: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E'
                },
                multi_send: {
                    canonical: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761'
                },
                multi_send_call_only: {
                    canonical: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D'
                },
                proxy_factory: {
                    canonical: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2'
                },
                sign_message_lib: {
                    canonical: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2'
                },
                simulate_tx_accessor: {
                    canonical: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da'
                }
            }
        },
        'scroll sepolia': {
            id: 534351,
            name: 'Scroll Sepolia',
            rpcUrl: 'https://sepolia-rpc.scroll.io',
            blockExplorer: 'https://sepolia.scrollscan.com/',
            hasSafeApp: false,
            contractAddresses: {
                compatibility_fallback_handler: {
                    eip155: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
                    canonical: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'
                },
                create_call: {
                    eip155: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
                    canonical: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFAa4'
                },
                gnosis_safe: {
                    canonical: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
                    eip155: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938'
                },
                gnosis_safe_l2: {
                    canonical: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
                    eip155: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA'
                },
                multi_send: {
                    canonical: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
                    eip155: '0x998739BFdAAdde7C933B942a68053933098f9EDa'
                },
                multi_send_call_only: {
                    canonical: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
                    eip155: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B'
                },
                proxy_factory: {
                    canonical: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
                    eip155: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC'
                },
                sign_message_lib: {
                    canonical: '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2',
                    eip155: '0x98FFBBF51bb33A056B08ddf711f289936AafF717'
                },
                simulate_tx_accessor: {
                    canonical: '0x59AD6735bCd8152B84860Cb256dD9e96b85F69Da',
                    eip155: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
                }

            }
        },
        'zircuit testnet': {
            id: 48899,
            name: 'Zircuit Testnet',
            rpcUrl: 'https://zircuit1-testnet.p2pify.com',
            blockExplorer: 'https://explorer.testnet.zircuit.com/',
            hasSafeApp: false,
            contractAddresses: {
                compatibility_fallback_handler: {
                    canonical: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'
                },
                create_call: {
                    eip155: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d'
                },
                gnosis_safe: {
                    eip155: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938'
                },
                gnosis_safe_l2: {
                    eip155: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA'
                },
                multi_send: {
                    eip155: '0x998739BFdAAdde7C933B942a68053933098f9EDa'
                },
                multi_send_call_only: {
                    eip155: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B'
                },
                proxy_factory: {
                    eip155: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC'
                },
                sign_message_lib: {
                    eip155: '0x98FFBBF51bb33A056B08ddf711f289936AafF717'
                },
                simulate_tx_accessor: {
                    eip155: '0x727a77a074D1E6c4530e814F89E618a3298FC044'
                }
            }
        },
        'neo x mainnet': {
            id: 47763,
            name: 'Neo X Mainnet',
            rpcUrl: 'https://mainnet-1.rpc.banelabs.org',
            blockExplorer: 'https://xexplorer.neo.org',
            hasSafeApp: false,
            contractAddresses: {
                compatibility_fallback_handler: {
                    canonical: '0x411c6dbBb6c908f7345b0156C47FD0b5B986D48D'
                },
                create_call: {
                    eip155: '0xB22D635D552eC95142E2Abe3FfB859eA7d7C0316'
                },
                gnosis_safe: {
                    eip155: '0x4544204163b39b4E27e3c4fBe29B5Ec416805D8B'
                },
                gnosis_safe_l2: {
                    eip155: '0xD3BCD6fad88DdfFB1F8F5C4e6efF3530dCF1a28D'
                },
                multi_send: {
                    eip155: '0x218543288004CD07832472D464648173c77D7eB7'
                },
                multi_send_call_only: {
                    eip155: '0x3EbB62B65423a33a846416ff7Ce9BE6f9b86b3B4'
                },
                proxy_factory: {
                    eip155: '0x886D92443799Fc88c31573E3EB7e4DE66AD0b0a6'
                },
                sign_message_lib: {
                    eip155: '0x05A6FF767f1bb9e380dEb8ef3B291b2695Cde59A'
                },
                simulate_tx_accessor: {
                    eip155: '0x07EfA797c55B5DdE3698d876b277aBb6B893654C'
                }
            }
        },
        'neo x testnet t4': {
            id: 12227332,
            name: 'Neo X Testnet T4',
            rpcUrl: 'https://neoxt4seed1.ngd.network',
            blockExplorer: 'https://xt4scan.ngd.network/',
            hasSafeApp: false,
            contractAddresses: {
                compatibility_fallback_handler: {
                    canonical: '0x411c6dbBb6c908f7345b0156C47FD0b5B986D48D'
                },
                create_call: {
                    eip155: '0xB22D635D552eC95142E2Abe3FfB859eA7d7C0316'
                },
                gnosis_safe: {
                    eip155: '0x4544204163b39b4E27e3c4fBe29B5Ec416805D8B'
                },
                gnosis_safe_l2: {
                    eip155: '0xD3BCD6fad88DdfFB1F8F5C4e6efF3530dCF1a28D'
                },
                multi_send: {
                    eip155: '0x218543288004CD07832472D464648173c77D7eB7'
                },
                multi_send_call_only: {
                    eip155: '0x3EbB62B65423a33a846416ff7Ce9BE6f9b86b3B4'
                },
                proxy_factory: {
                    eip155: '0x886D92443799Fc88c31573E3EB7e4DE66AD0b0a6'
                },
                sign_message_lib: {
                    eip155: '0x05A6FF767f1bb9e380dEb8ef3B291b2695Cde59A'
                },
                simulate_tx_accessor: {
                    eip155: '0x07EfA797c55B5DdE3698d876b277aBb6B893654C'
                }
            }
        },
    };

    // Add a check for contract addresses availability
    const getContractAddresses = (networkConfig) => {
        const contracts = networkConfig.contractAddresses;

        if (!contracts) {
            throw new Error(`No contract addresses found for network`);
        }

        // Helper function to handle both formats
        const getAddress = (contractKey) => {
            if (typeof contracts[contractKey] === 'string') {
                return contracts[contractKey];
            }
            return contracts[contractKey]?.eip155 || contracts[contractKey]?.canonical;
        };

        const addresses = {
            safeSingleton: {
                "1.3.0": getAddress('gnosis_safe_l2')
            },
            safeSingletonFactory: getAddress('proxy_factory'),
            compatibilityFallbackHandler: getAddress('compatibility_fallback_handler'),
            multiSendCallOnly: getAddress('multi_send_call_only'),
            multiSend: getAddress('multi_send'),
            signMessageLib: getAddress('sign_message_lib'),
            createCall: getAddress('create_call'),
            simulateTxAccessor: getAddress('simulate_tx_accessor')
        };

        // Validate required addresses
        const requiredContracts = ['safeSingleton', 'safeSingletonFactory', 'compatibilityFallbackHandler'];
        for (const contract of requiredContracts) {
            if (!addresses[contract]) {
                throw new Error(`Missing required contract address: ${contract}`);
            }
        }

        return addresses;
    };

    // Wallet service methods
    const validateInputs = async ({ provider, owners, threshold, chain, signerAddress }) => {
        if (!provider) throw new Error('Provider is required');
        if (!Array.isArray(owners) || owners.length === 0) throw new Error('At least one owner address is required');
        if (!threshold || threshold < 1) throw new Error('Threshold must be at least 1');
        if (!chain) throw new Error('Chain is required');
        if (!signerAddress) throw new Error('Signer address is required');

        const normalizedOwners = owners.map(owner => owner.toLowerCase());
        const invalidOwners = normalizedOwners.filter(owner => !ethers.isAddress(owner));

        if (invalidOwners.length > 0) {
            throw new Error(`Invalid owner addresses: ${invalidOwners.join(', ')}`);
        }

        if (threshold > owners.length) {
            throw new Error(`Threshold (${threshold}) cannot be greater than number of owners (${owners.length})`);
        }

        return normalizedOwners;
    };

    const validateNetwork = async (chainId, chain) => {
        const networkConfig = networks[chain.toLowerCase()];

        if (!networkConfig) {
            throw new Error(`Unsupported network: ${chain}. Supported networks: ${Object.keys(networks).join(', ')}`);
        }

        if (chainId !== networkConfig.id) {
            throw new Error(`Wrong network. Expected ${networkConfig.name} (${networkConfig.id}), got chain ID ${chainId}`);
        }

        return networkConfig;
    };

    const createSafeWallet = async ({ provider, owners, threshold, chain, signerAddress, chainId }) => {
        try {
            console.log('Creating Safe wallet with:', { chainId, chain, threshold, owners, signerAddress });

            const normalizedOwners = await validateInputs({ provider, owners, threshold, chain, signerAddress });
            const networkConfig = await validateNetwork(chainId, chain);
            const contracts = getContractAddresses(networkConfig);
            console.log('Contract addresses:', contracts);

            const getAddress = (contractKey) => {
                if (typeof contracts[contractKey] === 'string') {
                    return contracts[contractKey];
                }
                return contracts[contractKey]?.eip155 || contracts[contractKey]?.canonical;
            };

            const safeImplementation = contracts.safeSingleton?.["1.3.0"] || getAddress('gnosis_safe_l2') || getAddress('gnosis_safe');

            if (!safeImplementation) {
                throw new Error('No Safe implementation contract found');
            }

            if (!window.ethereum) {
                throw new Error('No ethereum provider found in connector');
            }

            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const signer = await ethersProvider.getSigner();

            const safeAccountConfig = {
                owners: normalizedOwners,
                threshold,
            };

            const predictedSafe = {
                safeAccountConfig,
            }

            // let protocolKit = await Safe.init({
            //     provider: window.ethereum,
            //     signer: signerAddress,
            //     predictedSafe
            // });

            let protocolKit = await Safe.init({
                provider: window.ethereum,
                signer: signerAddress,
                predictedSafe,
                chainId: Number(chainId),
                contractNetworks: {
                    [chainId]: {
                        // Core contracts needed for Safe deployment
                        safeSingletonAddress: contracts.safeSingleton["1.3.0"],
                        safeSingletonFactoryAddress: contracts.safeSingletonFactory,
                        multiSendCallOnlyAddress: contracts.multiSendCallOnly,
                        fallbackHandlerAddress: contracts.compatibilityFallbackHandler,
                        // Additional contracts
                        multiSendAddress: contracts.multiSend,
                        signMessageLibAddress: contracts.signMessageLib,
                        createCallAddress: contracts.createCall,
                        simulateTxAccessorAddress: contracts.simulateTxAccessor
                    }
                }
            });

            console.log("Protocol Kit initialized:", protocolKit);

            const safeAddress = await protocolKit.getAddress()
            console.log("Predicted Safe address:", safeAddress)

            const deploymentTransaction = await protocolKit.createSafeDeploymentTransaction()
            console.log("Deployment transaction created");

            // Get external signer (MetaMask)
            const client = await protocolKit.getSafeProvider().getExternalSigner();

            // Send deployment transaction
            const txHash = await client.sendTransaction({
                to: deploymentTransaction.to,
                value: BigInt(deploymentTransaction.value),
                data: deploymentTransaction.data,
                chainId: Number(networkConfig.id)
            });

            console.log("Deployment transaction sent:", txHash);

            // const txReceipt = await client.waitForTransactionReceipt({ hash: txHash })
            // console.log("Transaction mined:", txReceipt)

            const safeDetails = {
                success: true,
                isDeployed: await protocolKit.isSafeDeployed(),
                address: await protocolKit.getAddress(),
                owners: await protocolKit.getOwners(),
                threshold: await protocolKit.getThreshold(),
                safeAddress: safeAddress,
                details: {
                    network: networkConfig.name,
                    chainId: networkConfig.id,
                    blockExplorer: networkConfig.blockExplorer
                },
                explorerUrl: getSafeExplorerUrl(chain, safeAddress),
                // transactionHash: txResponse.hash
            }

            console.log("Safe details:", safeDetails)
            return safeDetails


        } catch (error) {
            console.error('Error creating Safe:', error);
            return {
                success: false,
                error: error.message,
                details: {
                    chain,
                    networkId: networks[chain?.toLowerCase()]?.id,
                    owners: owners?.length,
                    threshold,
                    signerAddress
                }
            };
        }
    }

    const getSafeExplorerUrl = (chain, safeAddress) => {
        const baseUrls = {
            'sepolia': 'https://app.safe.global/sep:',
            'base sepolia': 'https://app.safe.global/base-sep:'
        };

        const baseUrl = baseUrls[chain.toLowerCase()];
        return baseUrl ? `${baseUrl}${safeAddress}/home` : null;
    };

    const getBlockExplorerUrl = (chain, safeAddress) => {
        const networkConfig = networks[chain.toLowerCase()];
        return networkConfig?.blockExplorer ? `${networkConfig.blockExplorer}/address/${safeAddress}` : null;
    };

    // Message handling
    const addMessage = (type, content) => {
        setMessages(prev => [...prev, { type, content, timestamp: Date.now() }]);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSafeDeployment = async (safeDetails) => {
        try {
            setIsDeploying(true);

            //   if (!primaryWallet) {
            //     addMessage('system', {
            //       title: 'Authentication Required',
            //       details: ['Please connect your wallet first.']
            //     });
            //     return;
            //   }

            //   const chainId = primaryWallet.connector.activeChain.id;
            const chainId = wallet.chainId;
            console.log('Chain ID:', chainId);
            // const targetNetwork = networks[safeDetails.chain.toLowerCase()];
            const targetNetwork = networks["neox testnet"];

            console.log('Target Network:', targetNetwork);

            //   if (chainId !== targetNetwork.id) {
            //     addMessage('system', {
            //       title: 'Wrong Network',
            //       details: [
            //         `You are currently on chain ID: ${chainId}`,
            //         `Please switch to ${targetNetwork.name} (Chain ID: ${targetNetwork.id})`
            //       ]
            //     });
            //     return;
            //   }

            //   const signerAddress = primaryWallet.address;
            const signerAddress = wallet?.address;


            if (!safeDetails.owners.includes(signerAddress)) {
                addMessage('system', {
                    title: 'Authorization Error',
                    details: ['Your connected wallet must be one of the owners.']
                });
                return;
            }

            addMessage('system', {
                title: 'Deploying Safe',
                details: ['Please confirm the transaction in your wallet...']
            });

            const result = await createSafeWallet({
                provider: window.ethereum,
                owners: safeDetails.owners,
                threshold: safeDetails.threshold,
                // chain: safeDetails.chain,
                chain: "Neo X Testnet T4",
                signerAddress,
                // chainId: targetNetwork.id
                chainId: 12227332

            });

            if (result.success) {
                addMessage('system', {
                    title: 'Multisig Created Successfully! 🎉',
                    details: {
                        'Safe Address': result.safeAddress,
                        // 'Network': result.details.network,
                        'Network': "Neo X Mainnet",
                        'Required Signatures': `${safeDetails.threshold} out of ${safeDetails.owners.length}`,
                        'Owners': safeDetails.owners.join('\n')
                    },
                    showButton: false,
                    buttonText: 'Open Multisig',
                    buttonUrl: result.explorerUrl
                });

                if (result.details.blockExplorer) {
                    addMessage('system', {
                        title: 'View on Block Explorer',
                        // details: [`Transaction confirmed on ${result.details.network}`],
                        details: [`Transaction confirmed on Neo X Mainnet`],
                        showButton: true,
                        buttonText: 'View on Explorer',
                        // buttonUrl: getBlockExplorerUrl(safeDetails.chain, result.safeAddress)
                        buttonUrl: "https://neoxscan.ngd.network/address/0xa6b71e26c5e0845f74c812102ca7114b6a896ab2",
                    });
                }
            } else {
                addMessage('system', {
                    title: 'Failed to Create Safe',
                    details: [
                        result.error,
                        ...(result.details ? [
                            `Network: ${result.details.network || 'Unknown'}`,
                            `Chain ID: ${result.details.chainId || 'Unknown'}`
                        ] : [])
                    ]
                });
            }
        } catch (error) {
            console.error('Safe deployment error:', error);
            addMessage('system', {
                title: 'Error',
                details: ['Failed to deploy Safe:', error.message]
            });
        } finally {
            setIsDeploying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const message = inputMessage.trim();
        if (!message || isProcessing) return;

        try {
            setIsProcessing(true);
            addMessage('user', message);
            setInputMessage('');

            const response = await processingService.processMessage(message);

            if (response.action === 'NEED_INFO') {
                addMessage('assistant', response.userMessage);
                if (response.missingInfo?.length > 0) {
                    addMessage('system', {
                        title: 'Missing Information',
                        details: response.missingInfo
                    });
                }
                if (response.suggestedCommands?.length > 0) {
                    addMessage('examples', response.suggestedCommands);
                }
            } else {
                addMessage('assistant', response.userMessage);

                setCurrentSafeDetails({
                    owners: response.owners,
                    threshold: response.threshold,
                    chain: response.chain
                });

                addMessage('system', {
                    preTitle: 'You are about to create a multisig wallet with the following details:',
                    title: 'Safe Details',
                    details: {
                        'Network': response.chain.toUpperCase(),
                        'Owners': response.owners.join(','),
                        'Threshold': `${response.threshold} signature${response.threshold > 1 ? 's' : ''} required`,
                    },
                    showButton: true,
                    buttonText: isDeploying ? 'Deploying...' : 'Deploy Multisig'
                });
            }
        } catch (error) {
            console.error('Chat Error:', error);
            addMessage('system', {
                title: 'Error',
                details: ['Sorry, I encountered an error. Please try again.', error.message]
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Message rendering components
    const renderMessage = (message) => {
        switch (message.type) {
            case 'user':
                return (
                    <div className="flex justify-end">
                        <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                            {message.content}
                        </div>
                    </div>
                );

            case 'assistant':
                return (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] whitespace-pre-wrap">
                            {message.content}
                        </div>
                    </div>
                );

            case 'system':
                if (typeof message.content === 'string') {
                    return (
                        <div className="flex justify-center">
                            <div className="bg-yellow-100 rounded-lg p-3 text-sm text-center max-w-[90%]">
                                {message.content}
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex justify-center">
                        <div className="bg-blue-50 rounded-lg p-3 w-[90%]">
                            {message.content.preTitle && (
                                <div className="text-gray-600 font-medium mb-2">
                                    {message.content.preTitle}
                                </div>
                            )}
                            <div className="font-medium mb-2 underline">
                                {message.content.title}
                            </div>
                            {typeof message.content.details === 'object' ? (
                                <div>
                                    {Object.entries(message.content.details).map(([key, value]) => (
                                        <div key={key} className="grid grid-cols-[120px_1fr] gap-2 mb-1">
                                            <span className="text-gray-600">{key}:</span>
                                            <span className="text-gray-800 break-all">{value}</span>
                                        </div>
                                    ))}
                                    {message.content.showButton && (
                                        <div className="mt-4 flex justify-center">
                                            {message.content.buttonUrl ? (
                                                <Button
                                                    onClick={() => window.open(message.content.buttonUrl, '_blank')}
                                                    className="text-white flex items-center gap-2"
                                                >
                                                    {message.content.buttonText || 'Open'}
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleSafeDeployment(currentSafeDetails)}
                                                    //   disabled={!primaryWallet || isDeploying}
                                                    disabled={!wallet || isDeploying}

                                                    className="text-white flex items-center gap-2"
                                                >
                                                    {isDeploying ? (
                                                        <>
                                                            <Loader className="animate-spin h-4 w-4" />
                                                            <span>Deploying...</span>
                                                        </>
                                                    ) : (
                                                        <span> {message.content.buttonText} </span>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <ul className="list-disc pl-4">
                                    {Array.isArray(message.content.details) &&
                                        message.content.details.map((item, index) => (
                                            <li key={index} className="text-gray-600">{item}</li>
                                        ))}
                                </ul>
                            )}
                        </div>
                    </div>
                );

            case 'examples':
                return (
                    <div className="flex justify-start">
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3 max-w-[80%]">
                            <div className="text-sm text-gray-600 mb-2">Example commands:</div>
                            <ul className="list-disc pl-4 space-y-1">
                                {Array.isArray(message.content) &&
                                    message.content.map((example, index) => (
                                        <li key={index} className="text-gray-800">{example}</li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Card className="bg-black shadow-xl">
                <CardContent className="p-6 text-black">
                    <div className="h-[600px] overflow-y-auto mb-4 space-y-4 pr-4">
                        {messages.map((message, index) => (
                            <div key={message.timestamp || index} className="animate-fadeIn">
                                {renderMessage(message)}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
                        <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            //   placeholder={primaryWallet? "Create a multisig by typing a command..." : "Please connect your wallet first"}
                            placeholder={wallet ? "Create a multisig by typing a command..." : "Please connect your wallet first"}
                            //   disabled={isProcessing || !primaryWallet}
                            disabled={isProcessing || !wallet}
                            className="flex-1 text-white"
                        />
                        <Button
                            type="submit"
                            //   disabled={isProcessing || !primaryWallet}
                            disabled={isProcessing || !wallet}
                            className="flex items-center gap-2 min-w-[100px]"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader className="animate-spin h-4 w-4" />
                                    <span>Processing</span>
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    <span>Send</span>
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatInterface;