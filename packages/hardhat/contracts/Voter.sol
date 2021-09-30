pragma solidity >=0.6.7 <0.9.0;
//SPDX-License-Identifier: MIT

contract Voter {
    
    // electionId => ...
    mapping(uint256 => mapping(address => bool)) public addressVoted;
    mapping(uint256 => mapping(address => uint256)) public electionScore;
    mapping(uint256 => uint256) public electionScoreTotal;

    // On Chain voting
    function _vote(uint256 electionId, address[] memory _adrs, uint256[] memory _scores) internal {
        uint256 scoreTotal = 0;
        for (uint256 i = 0; i < _adrs.length; i++) {
            electionScore[electionId][_adrs[i]] += _scores[i];
            scoreTotal += _scores[i];
        }
        electionScoreTotal[electionId] = scoreTotal;
        addressVoted[electionId][msg.sender] = true;
    }

    function getElectionScoreTotal(uint256 electionId) public view returns(uint256) {
        return electionScoreTotal[electionId];
    }

    function getScore(uint256 electionId, address _adr) public view returns(uint256) {
        return electionScore[electionId][_adr];
    }

    function getAddressVoted(uint256 electionId, address _adr) public view returns(bool) {
        return addressVoted[electionId][_adr]; 
    }

}