// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {IERC20,SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
contract TrashPandaDecorations is ERC721,AccessControl,ReentrancyGuard {
 using SafeERC20 for IERC20;
 struct Sale {address currency;uint256 price;bool open;}
 mapping(uint256=>Sale) public sales;
 mapping(uint256=>uint256) public transferVersion;
 address public immutable treasury;
 string private baseURI;
 constructor(address admin,address receiver,string memory uri) ERC721('Trash Panda Decorations','TPUDECOR') {require(admin!=address(0)&&receiver!=address(0),'Invalid address');treasury=receiver;baseURI=uri;_grantRole(DEFAULT_ADMIN_ROLE,admin);}
 function configureSale(uint256 id,address currency,uint256 price,bool open) external onlyRole(DEFAULT_ADMIN_ROLE){require(id>0&&_ownerOf(id)==address(0),'Already minted');require(currency.code.length>0&&price>0,'Invalid price or currency');sales[id]=Sale(currency,price,open);}
 function buy(uint256 id,address currency,uint256 price) external nonReentrant {Sale memory s=sales[id];require(s.open&&s.currency==currency&&s.price==price,'Sale changed or closed');require(msg.sender!=treasury,'Use a buyer wallet different from treasury');sales[id].open=false;uint256 beforeBalance=IERC20(currency).balanceOf(treasury);IERC20(currency).safeTransferFrom(msg.sender,treasury,price);require(IERC20(currency).balanceOf(treasury)-beforeBalance==price,'Unsupported transfer fee');_safeMint(msg.sender,id);}
 function _baseURI() internal view override returns(string memory){return baseURI;}
 function _update(address to,uint256 id,address auth) internal override returns(address){transferVersion[id]++;return super._update(to,id,auth);}
 function supportsInterface(bytes4 id) public view override(ERC721,AccessControl) returns(bool){return super.supportsInterface(id);}
}
