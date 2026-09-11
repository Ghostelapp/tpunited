// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {ERC721Pausable} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol';
import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
contract TrashPandaLand is ERC721Pausable, AccessControl {
 bytes32 public constant MINTER_ROLE=keccak256('MINTER_ROLE');
 uint256 public immutable maxSupply;
 mapping(uint256=>uint256) public transferVersion;
 string private baseURI;
 constructor(address admin,uint256 supply,string memory uri) ERC721('Trash Panda Land','TPULAND'){require(admin!=address(0)&&supply>0,'Invalid configuration');maxSupply=supply;baseURI=uri;_grantRole(DEFAULT_ADMIN_ROLE,admin);}
 function mintLand(address to,uint256 id) external onlyRole(MINTER_ROLE){require(id>0&&id<=maxSupply,'Unknown parcel');_safeMint(to,id);}
 function setPaused(bool value) external onlyRole(DEFAULT_ADMIN_ROLE){if(value)_pause();else _unpause();}
 function _baseURI() internal view override returns(string memory){return baseURI;}
 function _update(address to,uint256 tokenId,address auth) internal override returns(address){transferVersion[tokenId]++;return super._update(to,tokenId,auth);}
 function supportsInterface(bytes4 id) public view override(ERC721,AccessControl) returns(bool){return super.supportsInterface(id);}
}
