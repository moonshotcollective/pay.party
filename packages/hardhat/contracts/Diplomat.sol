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

pragma solidity >=0.6.7 <0.9.0;
pragma experimental ABIEncoderV2;
//SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ElectionFactory.sol";
import "./Voter.sol";

contract Diplomat is AccessControl, ElectionFactory, Voter {

    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    uint256 public currentElectionStartBlock;
    uint256 public electionCount;

    constructor(
        //address startingAdmin
        ) public {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);//startingAdmin);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        currentElectionStartBlock = block.number; 
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "NOT ADMIN");
        _;
    }

    modifier canVote() {
        require(
            hasRole(VOTER_ROLE, msg.sender),
            "You don't have the permission to vote."
        );
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
        string memory _name, 
        address[] memory _candidates,
        uint256 _amount,
        address _token, 
        int16 _votes, 
        string memory _kind
    ) public returns (uint256 electionId) {
        // NOTE: Using electionCount as ID
        _createElection(electionCount, _name, _candidates, _amount, _token, _votes, _kind);
        electionCount++;
		return electionCount;
    }

    // On Chain voting
    function vote(uint256 electionId, address[] memory _adrs, uint256[] memory _scores) public {
        _vote(electionId, _adrs, _scores);
    }

    function endElection(uint256 electionId) public {
        _endElection(electionId);
    }

    function payElection(uint256 electionId, address[] memory _adrs, uint256[] memory _shares) public payable {
        _payElection(electionId, _adrs, _shares);
    }

    function getElection(uint256 electionId) public view returns(Election memory) {
        return _getElection(electionId);
    }

    function getElectionNumVoted(uint256 electionId) public view returns(uint256 voted) {
        for (uint256 i = 0; i < elections[electionId].candidates.length; i++) {
            if (_getAddressVoted(electionId, elections[electionId].candidates[i])) {
                voted++;
            } 
        }
    }

    function getAddressVoted(uint256 electionId, address _adr) public view returns(bool) {
        return _getAddressVoted(electionId, _adr);
    }

    function getElectionAddressScore(uint256 electionId, address _adr) public view returns(uint256 score) {
        return _getScore(electionId, _adr);
    }

    function getElectionScoreTotal(uint256 electionId) public view returns (uint256)  {
        return _getElectionScoreTotal(electionId);
    }

    function deposit() public payable {}

    // payable fallback function
    receive() external payable {}

    fallback() external payable {}
}