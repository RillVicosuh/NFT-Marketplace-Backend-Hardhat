const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
    //Getting the contract object
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting")
    //Minting the nft using the mintNft function of basicNft
    //This function emits an event with the token id, so we are extrapolating that token id
    const mintTx = await basicNft.mintNft()
    const mintTxReceipt = await mintTx.wait(1)
    //Here is were we extrapolate using the transaction receipt
    const tokenId = mintTxReceipt.events[0].args.tokenId
    console.log("Approving Nft...")

    //Approving and then waiting a block 
    const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId)
    await approvalTx.wait(1)
    console.log("Listing NFT...")
    //Listing the item to the marketplace and waiting a block
    const tx = await nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("Listed")

    //If we are on the local hardhat chain, mine the blocks mannually
    if (network.config.chainId == "31337") {
        await moveBlocks(2, sleepAmount = 1000)
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })