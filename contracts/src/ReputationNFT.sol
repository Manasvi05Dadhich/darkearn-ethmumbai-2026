// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {IVerifier} from "./ReputationVerifier.sol";

/// @title ReputationNFT - Soulbound ERC-721 for DarkEarn reputation
/// @notice One NFT per ENS name. Band backed by ZK proof. Cannot be transferred.
contract ReputationNFT is ERC721 {
    using Strings for uint256;

    // --- State ---
    IVerifier public immutable verifier;
    address public immutable owner;
    uint256 private _nextTokenId;

    // ENS string storage (no on-chain registry - Base Sepolia has no ENS)
    mapping(string => uint256) public ensToTokenId;
    mapping(uint256 => string) public tokenIdToEns;

    // Minter address storage (for privacy enforcement in BountyEscrow)
    mapping(uint256 => address) public tokenIdToMinter;

    // Reputation band (0-4)
    mapping(uint256 => uint256) public tokenIdToBand;

    // Member since timestamp
    mapping(uint256 => uint256) public tokenIdToMemberSince;

    // --- Events ---
    event BandUpgraded(
        uint256 indexed tokenId,
        uint256 oldBand,
        uint256 newBand
    );

    // --- Errors ---
    error InvalidProof();
    error ENSAlreadyRegistered();
    error SoulboundTransferBlocked();
    error BandNotHigher();
    error NotTokenOwner();
    error EmptyENSName();
    error NotContractOwner();

    constructor(address _verifier) ERC721("DarkEarn Reputation", "DEREP") {
        verifier = IVerifier(_verifier);
        owner = msg.sender;
        _nextTokenId = 1;
    }

    /// @notice Override _update to make NFTs soulbound (non-transferable)
    /// @dev Only minting (from == address(0)) is allowed. All transfers revert.
    function _update(
        address to,
        uint256 tokenId,
        address from
    ) internal override returns (address) {
        if (from != address(0)) {
            revert SoulboundTransferBlocked();
        }
        return super._update(to, tokenId, from);
    }

    /// @notice Mint a soulbound ReputationNFT with a ZK proof
    /// @param _proof The ZK proof bytes
    /// @param _publicInputs Public inputs (score band as bytes32[])
    /// @param _ensName The ENS name to bind to this NFT (stored as string)
    function mint(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs,
        string calldata _ensName
    ) external returns (uint256) {
        // Validate ENS name
        if (bytes(_ensName).length == 0) revert EmptyENSName();
        if (ensToTokenId[_ensName] != 0) revert ENSAlreadyRegistered();

        // Verify ZK proof
        bool valid = verifier.verify(_proof, _publicInputs);
        if (!valid) revert InvalidProof();

        // Extract score band from public inputs (first element)
        uint256 scoreBand = uint256(_publicInputs[0]);

        // Mint
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        // Store mappings
        ensToTokenId[_ensName] = tokenId;
        tokenIdToEns[tokenId] = _ensName;
        tokenIdToMinter[tokenId] = msg.sender;
        tokenIdToBand[tokenId] = scoreBand;
        tokenIdToMemberSince[tokenId] = block.timestamp;

        return tokenId;
    }

    /// @notice Owner-only mint for integration testing — bypasses ZK proof
    /// @param _to Address to mint to
    /// @param _ensName ENS name to bind
    /// @param _band Reputation band (0-4)
    function testMint(
        address _to,
        string calldata _ensName,
        uint256 _band
    ) external returns (uint256) {
        if (msg.sender != owner) revert NotContractOwner();
        if (bytes(_ensName).length == 0) revert EmptyENSName();
        if (ensToTokenId[_ensName] != 0) revert ENSAlreadyRegistered();

        uint256 tokenId = _nextTokenId++;
        _safeMint(_to, tokenId);

        ensToTokenId[_ensName] = tokenId;
        tokenIdToEns[tokenId] = _ensName;
        tokenIdToMinter[tokenId] = _to;
        tokenIdToBand[tokenId] = _band;
        tokenIdToMemberSince[tokenId] = block.timestamp;

        return tokenId;
    }

    /// @notice Upgrade reputation band with a new ZK proof
    /// @param _tokenId The NFT token ID
    /// @param _proof New ZK proof bytes
    /// @param _publicInputs New public inputs with higher band
    function upgradeBand(
        uint256 _tokenId,
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external {
        if (ownerOf(_tokenId) != msg.sender) revert NotTokenOwner();

        // Verify ZK proof
        bool valid = verifier.verify(_proof, _publicInputs);
        if (!valid) revert InvalidProof();

        // Extract new band
        uint256 newBand = uint256(_publicInputs[0]);
        uint256 oldBand = tokenIdToBand[_tokenId];

        // New band must be strictly greater
        if (newBand <= oldBand) revert BandNotHigher();

        tokenIdToBand[_tokenId] = newBand;
        emit BandUpgraded(_tokenId, oldBand, newBand);
    }

    /// @notice Returns base64-encoded on-chain JSON metadata
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory ensName = tokenIdToEns[tokenId];
        uint256 band = tokenIdToBand[tokenId];
        uint256 memberSince = tokenIdToMemberSince[tokenId];

        string memory json = string(
            abi.encodePacked(
                '{"name":"DarkEarn Reputation #',
                tokenId.toString(),
                '","description":"Soulbound reputation credential for ',
                ensName,
                '","attributes":[{"trait_type":"ENS Name","value":"',
                ensName,
                '"},{"trait_type":"Band","value":',
                band.toString(),
                '},{"trait_type":"Member Since","value":',
                memberSince.toString(),
                "}]}"
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    /// @notice Get token ID by ENS name
    function getTokenIdByENS(
        string calldata _ensName
    ) external view returns (uint256) {
        return ensToTokenId[_ensName];
    }

    /// @notice Get minter address for a token (used by BountyEscrow for privacy check)
    function getMinterAddress(
        uint256 _tokenId
    ) external view returns (address) {
        return tokenIdToMinter[_tokenId];
    }

    /// @notice Get band for a token
    function getBand(uint256 _tokenId) external view returns (uint256) {
        return tokenIdToBand[_tokenId];
    }
}
