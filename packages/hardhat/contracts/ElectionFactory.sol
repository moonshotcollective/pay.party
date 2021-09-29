pragma solidity >=0.6.7 <0.9.0;
//SPDX-License-Identifier: MIT
import "./Distributor.sol";

contract ElectionFactory is Distributor {

    event NewElection(uint256 electionId); 
    event EndedElection(uint256 electionId);
    event PaidElection(uint256 electionId);
    
    struct Election {
        address creator;
        string name; 
        uint32 date;
        address[] candidates;
        uint256 amount;
        address token;
        int16 votes;
        string kind; 
        bool active; 
        bool paid;
    }

    mapping(uint256 => Election) public elections;

    function _emitNewElection(uint256 electionId) internal {
        emit NewElection(electionId);
    }

    function _emitEndedElection(uint256 electionId) internal {
        emit EndedElection(electionId);
    }

    function _emitPaidElection(uint256 electionId) internal {
        emit PaidElection(electionId);
    }

    function _createElection(
        uint256 electionId,
        string memory _name, 
        address[] memory _candidates,
        uint256 _amount,
        address _token, 
        int16 _votes, 
        string memory _kind
    ) internal {
        elections[electionId] = Election({
            creator: msg.sender, 
            name: _name, 
            date: uint32(block.timestamp), 
            candidates: _candidates, 
            amount: _amount, 
            token: _token,
            votes: _votes, 
            kind: _kind, 
            active: true, 
            paid: false
        });
        _emitNewElection(block.number);
    }

    function _endElection(uint256 electionId) 
        internal 
    {
        elections[electionId].active = false;
        _emitEndedElection(electionId);
    }

    function _payElection(uint256 electionId, address[] memory candidates, uint256[] memory shares) internal {
        if (elections[electionId].token == address(0)) {
            _sharePayedETH(candidates, shares);
        } else { 
            // _sharePayedToken(candidates, shares, elections[electionId].token, spender); // Token needs to IERC20
        }
        elections[electionId].paid = true;
        _emitPaidElection(electionId);
    }

    function getElection(uint256 electionId) public view returns (Election memory) {
        return elections[electionId];
    }

}