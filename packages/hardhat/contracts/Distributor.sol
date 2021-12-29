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
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/* 
Implementation Resources: 
  https://github.com/banteg/disperse-research
*/
contract Distributor {
    using SafeERC20 for IERC20;

    event ethDistributed(address indexed sender, string indexed name);
    event tokenDistributed(
        address indexed sender,
        address indexed token,
        string indexed name
    );

    function distributeEther(
        address[] memory recipients,
        uint256[] memory values,
        string memory name
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
            (bool sent, ) = recipients[i].call{value: values[i]}("");
            require(sent, "Failed to send Ether");
        }

        if (msg.value > total) {
            (bool sent, ) = msg.sender.call{value: msg.value - total}("");
            require(sent, "Failed to refund leftover Ether");
        }

        emit ethDistributed(msg.sender, name);
    }

    function distributeToken(
        IERC20 token,
        address[] memory recipients,
        uint256[] memory values,
        string memory name
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

        require(
            token.allowance(msg.sender, address(this)) >= total,
            "We don't have enough allowance to make this distribution"
        );
        require(
            token.balanceOf(msg.sender) >= total,
            "Not enough token balance to distribute"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            token.safeTransferFrom(msg.sender, recipients[i], values[i]);
        }

        emit tokenDistributed(msg.sender, address(token), name);
    }
}
