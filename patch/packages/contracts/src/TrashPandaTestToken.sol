// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/// @notice Test currency only. No promise of mainnet redemption.
/// @dev Per-wallet cooldown is not Sybil resistance. Supply is globally capped.
contract TrashPandaTestToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 10_000_000 ether;
    uint256 public constant CLAIM_AMOUNT = 1_000 ether;
    uint256 public constant COOLDOWN = 1 days;
    mapping(address => uint256) public nextClaimAt;
    event Claimed(address indexed account, uint256 amount, uint256 nextClaimAt);
    error UnsupportedChain();
    error CooldownActive(uint256 availableAt);
    error SupplyExhausted();
    constructor() ERC20('Trash Panda Test Token', 'tTPU') {
        if (block.chainid != 84532 && block.chainid != 31337) revert UnsupportedChain();
    }
    function claim() external {
        if (block.timestamp < nextClaimAt[msg.sender]) revert CooldownActive(nextClaimAt[msg.sender]);
        if (totalSupply() + CLAIM_AMOUNT > MAX_SUPPLY) revert SupplyExhausted();
        nextClaimAt[msg.sender] = block.timestamp + COOLDOWN;
        _mint(msg.sender, CLAIM_AMOUNT);
        emit Claimed(msg.sender, CLAIM_AMOUNT, nextClaimAt[msg.sender]);
    }
}
