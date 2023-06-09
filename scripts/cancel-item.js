//Script that can be utilized to cancel a listing
const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-moveBlocks.js")

const TOKEN_ID = 0
async function cancel() {
    //Getting the contract objects
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    //Calling the cancelListing function of the nftMarketplace contract
    const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log("NFT Canceled!")
    if (network.config.chainId = 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

cancel()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })