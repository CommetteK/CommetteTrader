require('dotenv').config(); // Import and configure dotenv
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json()); // For parsing application/json

// Initialize Moralis SDK
Moralis.start({
  apiKey: process.env.MORALIS_API_KEY,
});

// Log the OpenAI API Key to verify it's loaded correctly
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is in the .env file
});

// Endpoint to fetch wallet balances
app.get('/balances', async (req, res) => {
  try {
    const { address } = req.query; // Extract wallet address from query parameters

    if (!address) {
      return res.status(400).json({ error: 'Address parameter is missing' });
    }

    console.log(`Fetching balances for address: ${address}`);

    const [nativeBalance, tokenBalances] = await Promise.all([
      Moralis.EvmApi.balance.getNativeBalance({
        chain: EvmChain.BASE_SEPOLIA,
        address,
      }),
      Moralis.EvmApi.token.getWalletTokenBalances({
        chain: EvmChain.BASE_SEPOLIA,
        address,
      }),
    ]);

    console.log("Fetched balances:", { nativeBalance, tokenBalances });

    res.status(200).json({
      address,
      nativeBalance: nativeBalance.result.balance.ether,
      tokenBalances: tokenBalances.result.map(token => token.display()),
    });
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ error: 'Error fetching balances' });
  }
});

// Endpoint to fetch NFT metadata
app.get('/nft-metadata', async (req, res) => {
  try {
    const { address, tokenId, chain } = req.query; // Extract contract address, token ID, and chain from query parameters

    if (!address || !tokenId || !chain) {
      return res.status(400).json({ error: 'Address, tokenId, and chain parameters are missing' });
    }

    console.log(`Fetching NFT metadata for address: ${address}, tokenId: ${tokenId}, chain: ${chain}`);

    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      chain,
      address,
      tokenId,
      normalizeMetadata: true,
    });

    console.log("Fetched NFT metadata:", response.raw);

    res.status(200).json(response.raw);
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    res.status(500).json({ error: 'Error fetching NFT metadata' });
  }
});

// Endpoint to fetch NFTs by wallet address
app.get('/wallet-nfts', async (req, res) => {
  try {
    const { address, chain, format = 'decimal', mediaItems = false, tokenAddresses } = req.query; // Extract wallet address, chain, format, mediaItems, and tokenAddresses from query parameters

    if (!address || !chain || !tokenAddresses) {
      return res.status(400).json({ error: 'Address, chain, and tokenAddresses parameters are missing' });
    }

    console.log(`Fetching NFTs for wallet: ${address}, chain: ${chain}, tokenAddresses: ${tokenAddresses}`);

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      chain,
      address,
      format,
      mediaItems,
      tokenAddresses: [tokenAddresses], // Pass the token addresses as an array
    });

    console.log("Fetched wallet NFTs:", response.raw);

    res.status(200).json(response.raw);
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching wallet NFTs' });
  }
});

// Endpoint to generate a strategy using OpenAI
app.post('/api/generate-strategy', async (req, res) => {
  const { userStrategy } = req.body;

  console.log("Received strategy request:", userStrategy);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",  // Ensure the model name matches what you intend to use
      messages: [{ role: "user", content: userStrategy }],
    });

    console.log("OpenAI API response:", response);

    const tradingInstructions = response.choices[0].message.content;

    res.send({ status: 'success', instructions: tradingInstructions });
  } catch (error) {
    console.error("Error with OpenAI API or processing:", error);
    res.status(500).send({ status: 'error', message: 'Failed to generate strategy or execute trade' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '../frontend/build/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
