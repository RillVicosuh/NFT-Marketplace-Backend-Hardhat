const { ethers, network } = require("hardhat")
const fs = require("fs")

//This will be the location of where the network mapping json file is in you front end code
//The network mapping json file will hold the information of the contracts that are deployed
const frontEndContractsFile = "../nextjs-nft-marketplace/nft-market/constants/networkMapping.json"
//This will be the location where the abi of the contracts that are deployed are stored in the front end code
const frontEndAbiLocation = "../next-js-nft-marketplace/nft-market/constants/"

//The contract information and corresponding Abi of a deployed contract are update in the front end code
module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating the front end.")
        await updateContractAddresses()
        await updateAbi()
    }
}

async function updateAbi() {
    //Getting the contract objects
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    //Storing the abi in the front end
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    //Getting the contract address of the marketplace and the chainId
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const chainId = network.config.chainId.toString()
    //Getting the attributes that are in the json file
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    //Continue only if the chainId is of a valid chain in the front end json file
    if (chainId in contractAddresses) {
        //If the current address of the deployed NftMarketplace is not included in the json file, add it.
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
        }
    }
    //If the chainId is not included, add the chainId along with a new entry that contains the contract name and address
    else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]