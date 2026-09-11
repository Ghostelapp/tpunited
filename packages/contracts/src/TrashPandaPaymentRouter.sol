// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {Pausable} from '@openzeppelin/contracts/utils/Pausable.sol';
import {SafeERC20,IERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {TrashPandaLand} from './TrashPandaLand.sol';
contract TrashPandaPaymentRouter is AccessControl,ReentrancyGuard,Pausable {
 using SafeERC20 for IERC20;
 TrashPandaLand public immutable land;
 address public treasury;
 struct Sale{address currency;uint256 price;bool open;}
 mapping(uint256=>Sale) public sales;
 mapping(address=>bool) public allowedCurrency;
 event LandPurchased(uint256 indexed landId,address indexed buyer,address currency,uint256 price);
 event SaleConfigured(uint256 indexed landId,address currency,uint256 price,bool open);
 constructor(address admin,address landAddress,address treasuryAddress){require(admin!=address(0)&&landAddress!=address(0)&&treasuryAddress!=address(0),'Zero address');land=TrashPandaLand(landAddress);treasury=treasuryAddress;_grantRole(DEFAULT_ADMIN_ROLE,admin);allowedCurrency[address(0)]=true;}
 function setCurrency(address currency,bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE){require(currency==address(0)||currency.code.length>0,'Invalid token');allowedCurrency[currency]=allowed;}
 function setTreasury(address value) external onlyRole(DEFAULT_ADMIN_ROLE){require(value!=address(0),'Zero treasury');treasury=value;}
 function configureSale(uint256 id,address currency,uint256 price,bool open) external onlyRole(DEFAULT_ADMIN_ROLE){require(id>0&&id<=land.maxSupply()&&price>0&&allowedCurrency[currency],'Invalid sale');sales[id]=Sale(currency,price,open);emit SaleConfigured(id,currency,price,open);}
 function setPaused(bool value) external onlyRole(DEFAULT_ADMIN_ROLE){if(value)_pause();else _unpause();}
 function buyLand(uint256 id,address currency,uint256 expectedPrice) external payable nonReentrant whenNotPaused {
  Sale memory sale=sales[id];require(sale.open&&sale.price==expectedPrice&&sale.currency==currency&&allowedCurrency[currency],'Sale changed or closed');sales[id].open=false;
  if(currency==address(0)){require(msg.value==sale.price,'Incorrect payment');(bool ok,)=treasury.call{value:sale.price}('');require(ok,'Payment failed');}
  else{require(msg.value==0,'Unexpected ETH');uint256 beforeBalance=IERC20(currency).balanceOf(treasury);IERC20(currency).safeTransferFrom(msg.sender,treasury,sale.price);require(IERC20(currency).balanceOf(treasury)-beforeBalance==sale.price,'Unsupported transfer fee');}
  land.mintLand(msg.sender,id);emit LandPurchased(id,msg.sender,currency,sale.price);
 }
}
