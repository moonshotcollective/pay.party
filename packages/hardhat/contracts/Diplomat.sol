//SPDX-License-Identifier: MIT
/**                                                                              
                                            ..                                  
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
            __  _______  ____  _   _______ __  ______  ______         
           /  |/  / __ \/ __ \/ | / / ___// / / / __ \/_  __/         
          / /|_/ / / / / / / /  |/ /\__ \/ /_/ / / / / / /            
         / /  / / /_/ / /_/ / /|  /___/ / __  / /_/ / / /             
        /_/  /_/\____/\____/_/_|_//____/_/_/_/\____/_/_/__    ________
          / ____/ __ \/ /   / /   / ____/ ____/_  __/  _/ |  / / ____/
         / /   / / / / /   / /   / __/ / /     / /  / / | | / / __/   
        / /___/ /_/ / /___/ /___/ /___/ /___  / / _/ /  | |/ / /___   
        \____/\____/_____/_____/_____/\____/ /_/ /___/  |___/_____/                                                           
*/
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ElectionFactory.sol";
import "./EIP712MetaTransaction.sol";

contract Diplomat is AccessControl, ElectionFactory, EIP712MetaTransaction("Diplomat", "1") {

    bytes32 public constant VOTER_ROLE = 
        keccak256("VOTER_ROLE");
    
    uint256 public currentElectionStartBlock;
    uint256 public electionCount;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "NOT ADMIN");
        _;
    }

    function admin(address wallet, bool value) public onlyAdmin {
        if (value) {
            grantRole(DEFAULT_ADMIN_ROLE, wallet);
        } else {
            revokeRole(DEFAULT_ADMIN_ROLE, wallet);
        }
    }

    function createElection(
        string memory electionId
    ) public returns (string memory){
        // NOTE: Using electionCount as ID
       return _createElection(electionId);
    }

    function getElections() public view returns (string[] memory){
       return elections;
    }

    function endElection(string memory electionId) public {
        _endElection(electionId);
    }

    function payElection(string memory electionId, address[] memory _adrs, uint256[] memory _shares, address _token) public payable {
        _payElection(electionId, _adrs, _shares, _token);
    }

    function deposit() public payable {}

    // payable fallback function
    receive() external payable {}

    fallback() external payable {}
}
