// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
/// Test fixture only. Never deployed by deploy.mjs.
contract MockToken is ERC20 {constructor() ERC20('Test credits','TEST'){_mint(msg.sender,1000000 ether);}}
