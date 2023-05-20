//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketPlace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

contract NftMarketplace {
    struct Listing {
        uint256 price;
        address seller;
    }

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 tokenId);

    //NFT Contract Address -> NFT TokenID -> Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    //Seller address -> Amount earned
    mapping(address => uint256) private s_proceeds;

    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    //Creating a modifier that ensures the one listing the nft is the owner
    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        //Creating the IERC721 object using the nft address
        IERC721 nft = IERC721(nftAddress);
        //Using the ownerOf function to get the address associated with the tokenId
        address owner = nft.ownerOf(tokenId);
        //If the one calling the function is not the owner then an error is given
        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    //Creating a modifier to ensure the nft someone wants to buy is listed
    modifier isListed(address nftAddress, uint256 tokenId) {
        //Using the nftAddress and tokenId to see what listing object is mapped to it
        Listing memory listing = s_listings[nftAddress][tokenId];
        //If the price is less then or equal to 0 that means it is not listed and an error is given
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    //We want to make this external because we probably wont call this function inside the contract
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        //Ensuring the price that we want to list the item for is above 0
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }
        //Creating an IERC721 by passing the address the nft belongs to to the constructor of the IERC721 contract
        //Creating this object will allow us to call the getApproved function
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketPlace();
        }
        //If the marketplace is approved to sell the item, then this executes
        //This maps the nftAddress, along with the associated tokenId of the nft, to a Listing object that has the price and owner/seller of the nft
        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    //Needs to be payable because funds need to be sent to contract to buy an item
    function buyItem(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
    {
        //Gets the listing object that is mapped to the nft address and token id of the item
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        //Ensures that the value the buyer has sent to the contract is greater than or equal to the listed price of the nft
        if (msg.value < listedItem.price) {
            revert NftMarketplace__PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        //When someone buys and item we update the sellers proceeds
        s_proceeds[listedItem.seller] = s_proceeds[listedItem.seller] + msg.value;
        //After the item/nft is purchased we also want to remove it from the mapping of the listings
        delete (s_listings[nftAddress][tokenId]);
        //Then finally we send the nft from the seller to the buyer
        IERC721(nftAddress).safeTransferFrom(listedItem.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        //removes the listing from the mapping
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId) {
        //Updates the price of the listing object associated with the nft address and token id in the mapping
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        //Gets the amount the seller has earned from selling
        uint256 proceeds = s_proceeds[msg.sender];
        //If there are no earnings to withdraw then an error is given
        if (proceeds <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        //The proceeds are reset to 0 before using the call function to transfer the funds
        //This is done to prevent a reentrancy attack
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
