// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract UserDefinedMetadataNFT is ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Metadata {
        string name;
        string title;
        string userAddress;
    }

    mapping(uint256 => Metadata) private _tokenMetadata;

    constructor() ERC721("UserDefinedMetadataNFT", "UDMNFT") Ownable() {}

    function mintNFT(
        address recipient,
        string memory name,
        string memory title,
        string memory userAddress,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tokenMetadata[newItemId] = Metadata(name, title, userAddress);

        _tokenIds.increment();
        return newItemId;
    }

    function getTokenMetadata(uint256 tokenId)
        public
        view
        returns (Metadata memory)
    {
        require(_exists(tokenId), "ERC721Metadata: Query for nonexistent token");
        return _tokenMetadata[tokenId];
    }

    // Override required functions
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
