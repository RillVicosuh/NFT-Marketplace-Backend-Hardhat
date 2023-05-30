//This is a script that lets you mint from the basicNft contract and does not list it after it is minted
//Run with: yarn hardhat run scripts/mint.js --network localhost
const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.utils.parseEther("0.1")

async function mint() {
    //Getting the contract object
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting")
    //Minting the nft using the mintNft function of basicNft
    //This function emits an event with the token id, so we are extrapolating that token id
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log(`Got Token ID: ${tokenId}`)
    console.log(`Nft Address: ${basicNft.address}`)


    //If we are on the local hardhat chain, mine the blocks mannually
    if (network.config.chainId == "31337") {
        await moveBlocks(2, sleepAmount = 1000)
    }
}

mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })