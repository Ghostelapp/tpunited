// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {ERC721Pausable} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol';
import {AccessControl} from '@openzeppelin/contracts/access/AccessControl.sol';
contract TrashPandaAssets is ERC721Pausable,AccessControl {
 bytes32 public constant MINTER_ROLE=keccak256('MINTER_ROLE');
 mapping(uint256=>uint256) public transferVersion;
 string private baseURI;
 constructor(address admin,string memory uri) ERC721('Trash Panda Collectibles','TPUITEM'){require(admin!=address(0),'Invalid admin');baseURI=uri;_grantRole(DEFAULT_ADMIN_ROLE,admin);}
 function mint(address to,uint256 id) external onlyRole(MINTER_ROLE){_safeMint(to,id);}
 function setPaused(bool value) external onlyRole(DEFAULT_ADMIN_ROLE){if(value)_pause();else _unpause();}
 function _baseURI() internal view override returns(string memory){return baseURI;}
 function _update(address to,uint256 id,address auth) internal override returns(address){transferVersion[id]++;return super._update(to,id,auth);}
 function supportsInterface(bytes4 id) public view override(ERC721,AccessControl) returns(bool){return super.supportsInterface(id);}
}
