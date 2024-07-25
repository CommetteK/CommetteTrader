// index.js
require('dotenv').config(); // Import and configure dotenv
const Moralis = require('moralis').default;
const express = require('express');
const cors = require('cors');
const { EvmChain } = require('@moralisweb3/common-evm-utils');

const app = express();
const port = 8080;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

const MORALIS_API_KEY = process.env.MORALIS_API_KEY; // Use environment variable

// Initialize Moralis SDK at the entry point of your application
Moralis.start({
  apiKey: MORALIS_API_KEY,
});

app.get('/balances', async (req, res) => {
  try {
    const { address } = req.query; // Extract wallet address from query parameters

    if (!address) {
      return res.status(400).json({ error: 'Address parameter is missing' });
    }

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

// New endpoint for fetching NFT metadata
app.get('/nft-metadata', async (req, res) => {
  try {
    const { address, tokenId, chain } = req.query; // Extract contract address, token ID, and chain from query parameters

    if (!address || !tokenId || !chain) {
      return res.status(400).json({ error: 'Address, tokenId, and chain parameters are missing' });
    }

    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      chain,
      address,
      tokenId,
      normalizeMetadata: true,
    });

    res.status(200).json(response.raw);
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    res.status(500).json({ error: 'Error fetching NFT metadata' });
  }
});

// New endpoint for fetching NFTs by wallet address
app.get('/wallet-nfts', async (req, res) => {
  try {
    const { address, chain, format = 'decimal', mediaItems = false } = req.query; // Extract wallet address, chain, format, and mediaItems from query parameters

    if (!address || !chain) {
      return res.status(400).json({ error: 'Address and chain parameters are missing' });
    }

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      chain,
      address,
      format,
      mediaItems,
    });

    res.status(200).json(response.raw);
  } catch (error) {
    console.error('Error fetching wallet NFTs:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error fetching wallet NFTs' });
  }
});

const startServer = () => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

startServer();
