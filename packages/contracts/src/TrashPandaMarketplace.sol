// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {Pausable} from '@openzeppelin/contracts/utils/Pausable.sol';
import {SafeERC20,IERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
interface IVersionedAsset is IERC721{function transferVersion(uint256 id) external view returns(uint256);}
contract TrashPandaMarketplace is AccessControl,ReentrancyGuard,Pausable {
 using SafeERC20 for IERC20;
 struct Listing{address seller;address asset;uint256 tokenId;address currency;uint256 price;uint256 version;uint256 feeBps;address treasury;bool active;}
 mapping(uint256=>Listing) public listings;
 mapping(address=>bool) public allowedCurrency;
 mapping(address=>bool) public allowedAsset;
 mapping(address=>mapping(uint256=>uint256)) public activeListing;
 uint256 public nextListingId=1;
 uint256 public feeBps;
 address public treasury;
 event ListingCreated(uint256 indexed listingId,address indexed seller,address indexed asset,uint256 tokenId,address currency,uint256 price);
 event ListingCancelled(uint256 indexed listingId);
 event ItemPurchased(uint256 indexed listingId,address indexed buyer,uint256 price,uint256 fee);
 constructor(address admin,address treasuryAddress,uint256 fee){require(admin!=address(0)&&treasuryAddress!=address(0)&&fee<=1000,'Invalid configuration');_grantRole(DEFAULT_ADMIN_ROLE,admin);treasury=treasuryAddress;feeBps=fee;allowedCurrency[address(0)]=true;}
 function configure(address newTreasury,uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE){require(newTreasury!=address(0)&&newFee<=1000,'Invalid fee');treasury=newTreasury;feeBps=newFee;}
 function setCurrency(address currency,bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE){require(currency==address(0)||currency.code.length>0,'Invalid token');allowedCurrency[currency]=allowed;}
 function setAsset(address asset,bool allowed) external onlyRole(DEFAULT_ADMIN_ROLE){require(asset.code.length>0,'Invalid asset');allowedAsset[asset]=allowed;}
 function setPaused(bool value) external onlyRole(DEFAULT_ADMIN_ROLE){if(value)_pause();else _unpause();}
 function list(address asset,uint256 tokenId,address currency,uint256 price) external whenNotPaused returns(uint256 id){require(allowedAsset[asset]&&allowedCurrency[currency]&&price>0,'Invalid listing');IVersionedAsset nft=IVersionedAsset(asset);require(nft.ownerOf(tokenId)==msg.sender,'Not owner');require(nft.getApproved(tokenId)==address(this)||nft.isApprovedForAll(msg.sender,address(this)),'Approve NFT first');uint256 old=activeListing[asset][tokenId];if(old!=0&&listings[old].active){listings[old].active=false;emit ListingCancelled(old);}id=nextListingId++;listings[id]=Listing(msg.sender,asset,tokenId,currency,price,nft.transferVersion(tokenId),feeBps,treasury,true);activeListing[asset][tokenId]=id;emit ListingCreated(id,msg.sender,asset,tokenId,currency,price);}
 function cancel(uint256 id) external {Listing storage l=listings[id];require(l.active&&l.seller==msg.sender,'Not active seller');l.active=false;if(activeListing[l.asset][l.tokenId]==id)delete activeListing[l.asset][l.tokenId];emit ListingCancelled(id);}
 function buy(uint256 id,address currency,uint256 expectedPrice) external payable nonReentrant whenNotPaused {Listing memory l=listings[id];require(l.active&&l.seller!=msg.sender&&l.currency==currency&&l.price==expectedPrice&&allowedCurrency[currency]&&allowedAsset[l.asset],'Invalid listing');IVersionedAsset nft=IVersionedAsset(l.asset);require(nft.ownerOf(l.tokenId)==l.seller&&nft.transferVersion(l.tokenId)==l.version,'Stale listing');listings[id].active=false;delete activeListing[l.asset][l.tokenId];uint256 fee=l.price*l.feeBps/10000;
 if(currency==address(0)){require(msg.value==l.price,'Incorrect payment');payNative(l.treasury,fee);payNative(l.seller,l.price-fee);}else{require(msg.value==0,'Unexpected ETH');payToken(currency,l.treasury,fee);payToken(currency,l.seller,l.price-fee);}
 nft.safeTransferFrom(l.seller,msg.sender,l.tokenId);emit ItemPurchased(id,msg.sender,l.price,fee);
 }
 function payNative(address recipient,uint256 amount) private{if(amount==0)return;(bool ok,)=recipient.call{value:amount}('');require(ok,'Payment failed');}
 function payToken(address currency,address recipient,uint256 amount) private{if(amount==0)return;uint256 beforeBalance=IERC20(currency).balanceOf(recipient);IERC20(currency).safeTransferFrom(msg.sender,recipient,amount);require(IERC20(currency).balanceOf(recipient)-beforeBalance==amount,'Unsupported transfer fee');}
}
