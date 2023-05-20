const { assert, expect } = require("chai")
const { network, deployments, getNamedAccounts, ethers } = require("hardhat")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains } = require("../../helper-hardhat-config.js")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Tests", function () {
        let nftMarketplace, basicNft, deployer, player
        const PRICE = ethers.utils.parseEther("0.1")
        const TOKEN_ID = 0
        beforeEach(async function () {
            //Getting the the deployer and the player from getNamedAccounts
            deployer = (await getNamedAccounts()).deployer
            //player = (await getNamedAccounts()).player
            const accounts = await ethers.getSigners()
            player = accounts[1]
            //Running all the deploy scripts with the "all" tag
            await deployments.fixture(["all"])
            //Creating a contract object to interact with the NftMarketplace contract
            nftMarketplace = await ethers.getContract("NftMarketplace")
            //Creating a contract object to interact with the BasicNft contract
            basicNft = await ethers.getContract("BasicNft")
            //Now we mint the nft and then approve for the marketplace to sell the nft
            //Specifically this gives the nftMarketplace contract permission to use the safeTransferFrom function on the nft when it is bought
            await basicNft.mintNft()
            await basicNft.approve(nftMarketplace.address, TOKEN_ID)
        })

        it("lists and can be bought", async function () {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            //The Player and not the deployer is going to be the one to buy the nft
            //So we need to connect the player to the nft marketplace because by default the deployer was connected
            //The deployer is the one that deploys the contract and mints the nft
            const playerConnectedNftMarketplace = nftMarketplace.connect(player)
            //In the buyItem function the price is not a parameter, but it doesn't need to be
            //We can just send a value and use msg.value in the function
            await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE, })
            //After the nft has been bought, we get the new address associated with the token id of the nft
            const newOwner = await basicNft.ownerOf(TOKEN_ID)
            //We also get the proceeds of the owner/seller after the nft has been bought
            const deployerProceeds = await nftMarketplace.getProceeds(deployer)
            //Ensuring the new owner address is equivalent to the address of the buyer
            assert(newOwner.toString() == player.address)
            //Ensuring the deployer proceeds have been updated to the price that was set for the nft
            assert(deployerProceeds.toString() == PRICE.toString())

        })

    })
