//SPDX-License-Identifier: MIT
/**                                                                                                         ..                                  
                            ,*.                                   
                          .**,                                    
                          ,***.                                    
                    .,.   ,***,                                    
                  .**,    *****.                                   
                .****.    ,*****,                                  
              .******,     ,******,                                
            .*******.       .********,              .              
          ,******.            .*************,,*****.               
        ,*****.        ,,.        ,************,.                  
    .,****.         ,*****,                                       
    ,***,          ,*******,.              ..                      
  ,**,          .*******,.       ,********.                        
              .******,.       .********,                           
            .*****,         .*******,                              
          ,****,          .******,                                 
        ,***,.          .*****,                                    
      ,**,.           ./***,                                       
    ,,             .***,                                          
                  .**,                 

                    Moonshot Collective
            https://github.com/moonshotcollective 
*/
pragma solidity >=0.8.0;

import "@rari-capital/solmate/src/utils/SafeTransferLib.sol";

contract Distributor {

  using SafeTransferLib for ERC20;

  event DistributeETH(address indexed sender, string indexed id);
  event DistributeERC20(address indexed sender, address indexed token, string indexed id);

  function distributeEther(
    address[] memory recipients,
    uint256[] memory values,
    string memory id
  ) external payable {
    require(recipients.length == values.length, "DISTRIBUTE_LENGTH_MISMATCH");

    uint256 total = 0;
    for (uint256 i = 0; i < recipients.length; i++) {
      total += values[i];
      if (total > msg.value) {
        revert("NOT_ENOUGH_ETH");
      }
      SafeTransferLib.safeTransferETH(recipients[i], values[i]);
    }

    if (msg.value - total > 0) {
      SafeTransferLib.safeTransferETH(msg.sender, msg.value - total);
    }

    emit DistributeETH(msg.sender, id);
  }

  function distributeToken(
    ERC20 token,
    address[] memory recipients,
    uint256[] memory values,
    string memory id
  ) external {
    require(recipients.length == values.length, "DISTRIBUTE_LENGTH_MISMATCH");

    for (uint256 i = 0; i < recipients.length; i++) {
      token.safeTransferFrom(msg.sender, recipients[i], values[i]);
    }

    emit DistributeERC20(msg.sender, address(token), id);
  }
}

/* 
  Implementation Resources: 
    https://github.com/banteg/disperse-research
    https://github.com/Rari-Capital/solmate
*/
