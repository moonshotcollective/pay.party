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

/* 
    Implementation Resources: 
    https://github.com/banteg/disperse-research
    https://github.com/Rari-Capital/solmate
*/

contract Distributor {
  using SafeTransferLib for ERC20;

  event ethDistributed(address indexed sender, string indexed id);
  event tokenDistributed(
    address indexed sender,
    address indexed token,
    string indexed id
  );

  function distributeEther(
    address[] memory recipients,
    uint256[] memory values,
    string memory id
  ) external payable {
    require(
      recipients.length == values.length,
      "Invalid recipients to values ratio"
    );

    uint256 total = 0;
    for (uint256 i = 0; i < recipients.length; i++) {
      require(
        recipients[i] != address(0),
        "You can't distribute to the genesis address"
      );
      require(values[i] > 0, "Why waste gas for zero Ether send");
      total += values[i];
    }
    require(msg.value >= total, "Not enough Ether to distribute");

    for (uint256 i = 0; i < recipients.length; i++) {
      SafeTransferLib.safeTransferETH(recipients[i], values[i]);
    }

    if (msg.value > total) {
      (bool sent, ) = msg.sender.call{value: msg.value - total}("");
      require(sent, "Failed to refund leftover Ether");
    }

    emit ethDistributed(msg.sender, id);
  }

  function distributeToken(
    ERC20 token,
    address[] memory recipients,
    uint256[] memory values,
    string memory id
  ) external {
    require(
      recipients.length == values.length,
      "Invalid recipients to values ratio"
    );

    uint256 total = 0;
    for (uint256 i = 0; i < recipients.length; i++) {
      require(
        recipients[i] != address(0),
        "You can't distribute to the genesis address"
      );
      require(values[i] > 0, "Why waste gas for zero token send");
      total += values[i];
    }

    for (uint256 i = 0; i < recipients.length; i++) {
      token.safeTransferFrom(msg.sender, recipients[i], values[i]);
    }

    emit tokenDistributed(msg.sender, address(token), id);
  }
}
