//Dcript that can be utilized to buy a listed nft 
const { ether, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

const TOKEN_ID = 0

async function buyItem() {
    //Get the contract objects
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("basicNft")
    //Calling the getListing function of the nftMarketplace contract to get the Listing object
    const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
    //Getting the price from the listing object
    const price = listing.price.toString()
    const tx = await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: price })
    await tx.wait(1)
    console.log("Bought the NFT.")
    if ((network.config.chainId = "31337")) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
