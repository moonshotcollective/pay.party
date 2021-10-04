pragma solidity >=0.6.7 <0.9.0;
//SPDX-License-Identifier: MIT
import "./Distributor.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ElectionFactory is Distributor {

    event NewElection(uint256 electionId, address sender); 
    event EndedElection(uint256 electionId, address sender);
    event PaidElection(uint256 electionId, address sender);

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

    modifier onlyElectionAdmin(uint256 electionId) {
        require(msg.sender == elections[electionId].creator, "Sender not Election Admin!" );
        _;
    }

    modifier onlyElectionCandidate(uint256 electionId) {
        bool isCandidate = false;
        for (uint256 i = 0; i < elections[electionId].candidates.length; i++) {
            if (elections[electionId].candidates[i] == msg.sender) {
                isCandidate = true; 
                break; 
            }
        }
        require(isCandidate, "Sender not Election Candidate!");
        _;
    }

    function _emitNewElection(uint256 electionId) internal {
        emit NewElection(electionId, msg.sender);
    }

    function _emitEndedElection(uint256 electionId) internal {
        emit EndedElection(electionId, msg.sender);
    }

    function _emitPaidElection(uint256 electionId) internal {
        emit PaidElection(electionId, msg.sender);
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
        _emitNewElection(electionId);
    }

    function _endElection(uint256 electionId) 
        internal 
        onlyElectionAdmin(electionId)
    {
        elections[electionId].active = false;
        _emitEndedElection(electionId);
    }

    function _payElection(uint256 electionId, address[] memory candidates, uint256[] memory shares) 
        internal 
        onlyElectionAdmin(electionId) 
    {
        // NOTE: Not Escrow Version
        if (elections[electionId].token == address(0)) {
            _sharePayedETH(candidates, shares); 
        } else { 
            _sharePayedToken(candidates, shares, IERC20(elections[electionId].token), msg.sender); // Token needs to IERC20
        }
        elections[electionId].paid = true;
        _emitPaidElection(electionId);
    }

    function _getElection(uint256 electionId) internal view returns (Election memory) {
        return elections[electionId];
    }

}