// services/ai/processing.js
import { GoogleGenerativeAI } from "@google/generative-ai";

class ProcessingService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    // Supported chains for validation
    this.supportedChains = [
      'base sepolia',
      'sepolia',
      'mantle sepolia',
      'inco rivest testnet',
      'zircuit testnet',
      'morph holesky',
      'rootstock testnet',
      'flow testnet',
      'celo alfajores',
      'rome protocol',
      'hedera testnet',
      'scroll sepolia',
      'neo x testnet t4',
      'neo x mainnet',
    ].sort((a, b) => b.length - a.length);
  }

  validateEthereumAddress(address) {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  }

  normalizeChainName(chain) {
    const normalizedChain = chain.toLowerCase().trim();

    // Handle common variations
    const chainMappings = {
      'eth': 'sepolia',
      'base': 'base sepolia',
      'mantle': 'mantle testnet',
      'inco': 'inco rivest testnet',
      'zircuit': 'zircuit testnet',
      'morph': 'morph holesky',
      'linea': 'linea sepolia',
      'rootstock': 'rootstock testnet',
      'flow': 'flow testnet',
      'celo': 'celo alfajores',
      'rome': 'rome protocol',
      'hedera': 'hedera testnet',
      'scroll': 'scroll sepolia',
      'neo': 'neo x mainnet',
      'neox mainnet': 'neo x mainnet',
      'neox': 'neo x mainnet',
      'neo x testnet': 'neo x testnet t4',
      'neox testnet': 'neo x testnet t4',
      'neo testnet': 'neo x testnet t4',
    };

    return chainMappings[normalizedChain] || normalizedChain;
  }

  // extractAddresses(text) {
  //   const addressRegex = /0x[a-fA-F0-9]{40}/g;
  //   const matches = text.match(addressRegex) || [];
  //   return matches.filter(addr => this.validateEthereumAddress(addr));
  // }

  extractAddresses(text) {
    const addressRegex = /0x[a-fA-F0-9]{40}/g;

    const matches = Array.from(text.matchAll(addressRegex)) || [];

    return matches
      .map(match => match[0])
      .filter(addr => this.validateEthereumAddress(addr));
  }


  extractChain(text) {
    const normalizedText = text.toLowerCase();
    return this.supportedChains.find(chain =>
      normalizedText.includes(chain) ||
      normalizedText.includes(this.normalizeChainName(chain))
    );
  }

  extractThreshold(text) {
    // Look for explicit threshold mentions
    const thresholdRegex = /(\d+)[\s-]*(out of|of|\/|signatures?|required)/i;
    const match = text.match(thresholdRegex);
    if (match) {
      const threshold = parseInt(match[1]);
      return threshold > 0 ? threshold : 1;
    }
    return 1; // Default threshold
  }

  async processMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message input');
    }

    // Extract information directly from the message first
    const addresses = this.extractAddresses(message);
    const chain = this.extractChain(message);
    const threshold = this.extractThreshold(message);

    // If we have the minimum required information, return it
    if (addresses.length > 0 && chain) {
      return {
        action: "Create Multisig",
        chain: this.normalizeChainName(chain),
        owners: addresses,
        threshold: Math.min(threshold, addresses.length), // Ensure threshold doesn't exceed number of owners
        userMessage: `Creating a ${chain} multisig with ${threshold} required signature${threshold > 1 ? 's' : ''} out of ${addresses.length} owners: ${addresses.join(', ')}`
      };
    }

    // If direct extraction failed, try AI processing
    const prompt = `You are an AI assistant for Safe (formerly Gnosis Safe) wallet operations.
Parse this command and extract:
1. Ethereum addresses (0x...)
2. Blockchain network name
3. Required signatures (default: 1)

User message: "${message}"

Return JSON only:
{
    "action": "Create Multisig",
    "chain": "string",
    "owners": ["address1, address2, ..."],
    "threshold": number,
    "userMessage": "confirmation message"
}

Or if information is missing:
{
    "action": "NEED_INFO",
    "missingInfo": ["what's missing"],
    "userMessage": "what information is needed"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }

      const response = JSON.parse(jsonMatch[0]);

      // Validate AI response
      if (response.action === "Create Multisig") {
        // Validate addresses and chain
        const validAddresses = response.owners.filter(addr => this.validateEthereumAddress(addr));
        const validChain = this.normalizeChainName(response.chain);

        if (validAddresses.length === 0 || !this.supportedChains.includes(validChain)) {
          return {
            action: "NEED_INFO",
            missingInfo: [
              !validAddresses.length && "valid Ethereum addresses",
              !validChain && "supported blockchain network"
            ].filter(Boolean),
            userMessage: "Please provide valid Ethereum addresses and a supported blockchain network."
          };
        }

        // Update response with validated data
        response.owners = validAddresses;
        response.chain = validChain;
        response.threshold = Math.min(response.threshold || 1, validAddresses.length);
      }

      return response;

    } catch (error) {
      console.error('Processing Error:', error);
      return {
        action: "NEED_INFO",
        missingInfo: ["Could not process the command"],
        userMessage: "Please provide the wallet addresses and chain name in a clear format."
      };
    }
  }
}

export const processingService = new ProcessingService();