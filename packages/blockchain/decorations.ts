import {parseAbi} from 'viem';
export const decorAbi=parseAbi(['function ownerOf(uint256) view returns(address)','function transferVersion(uint256) view returns(uint256)','function sales(uint256) view returns(address currency,uint256 price,bool open)','function configureSale(uint256,address,uint256,bool)','function buy(uint256,address,uint256)','function treasury() view returns(address)']);
