const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "rinkeby",
        //Retrieved from docs.chaink.link
        vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        //Predetermined price we set to enter the raffle
        entranceFee: "10000000000000000", //ethers.utils.parseEthers("0.01"),
        //Retrieved from docs.chain.link and its the 30 gwei key hash
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "12286",
        callbackGasLimit: "500000",
        interval: "30", //30 seconds
        mintFee: "100000000000000000" //0.01 ETH
    },
    31337: {
        name: "hardhat",
        entranceFee: "10000000000000000", //ethers.utils.parseEthers("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        interval: "30",
        mintFee: "100000000000000000" //0.01 ETH
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}