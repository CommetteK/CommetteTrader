import { ethers } from "hardhat";

async function main() {
  const NFTContractFactory = await ethers.getContractFactory("UserDefinedMetadataNFT");
  const nftContract = await NFTContractFactory.deploy();

  await nftContract.deployed();

  console.log("NFT Contract deployed to:", nftContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
