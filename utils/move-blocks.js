const { network } = require("hardhat")

//This function returns a Promise, which won't resolve untill the alloted time of timeInMs has passed.
function sleep(timeInMs) {
    return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

//Script that manual mines a certain amount of blocks on the local hardhat node
async function moveBlocks(amount, sleepAmount = 0) {
    console.log("Mining blocks....")
    //Using the evm_miner to mine the block mannually
    for (let index = 0; index < amount; index) {
        await network.provider.request({
            method: "evm_miner",
            params: [],
        })
    }
    //After blocks are mined, call the sleep function to wait for the indicated amount of time
    if (sleepAmount) {
        console.log(`Sleeping for ${sleepAmount} `)
        await sleep(sleepAmount)
    }
}

module.exports = { moveBlocks, sleep }