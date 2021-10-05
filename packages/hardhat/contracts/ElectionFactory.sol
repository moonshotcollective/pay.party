pragma solidity >=0.6.7 <0.9.0;
//SPDX-License-Identifier: MIT
import "./Distributor.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ElectionFactory is Distributor {

    event NewElection(string electionId, address sender); 
    event EndedElection(string electionId, address sender);
    event PaidElection(string electionId, address sender);
    
    string[] public elections;

    modifier onlyElectionAdmin(string memory electionId) {
        _;
    }

    modifier onlyElectionCandidate(string memory electionId) {
        _;
    }

    function _emitNewElection(string memory electionId) internal {
        emit NewElection(electionId, msg.sender);
    }

    function _emitEndedElection(string memory electionId) internal {
        emit EndedElection(electionId, msg.sender);
    }

    function _emitPaidElection(string memory electionId) internal {
        emit PaidElection(electionId, msg.sender);
    }

    function _createElection(
        string memory electionId
    ) internal returns (string memory) {
        elections.push(electionId); 
        _emitNewElection(electionId);
        return electionId;
    }

    function _endElection(string memory electionId) 
        internal 
        onlyElectionAdmin(electionId)
    {
        _emitEndedElection(electionId);
    }

    // TODO: Implement Chainlink to check pay validity
    function _payElection(string memory electionId, address[] memory candidates, uint256[] memory shares, address token) 
        internal 
        onlyElectionAdmin(electionId) 
    {
        // NOTE: Not Escrow Version
        if (token == address(0)) {
            _sharePayedETH(candidates, shares); 
        } else { 
            _sharePayedToken(candidates, shares, IERC20(token), msg.sender); // Token needs to IERC20
        }
        _emitPaidElection(electionId);
    }


}