import React, { useState, useEffect } from "react";
import { Button, Divider, Table, Space, Typography, Input, PageHeader } from "antd";
import { useParams, useHistory } from "react-router-dom";
import { PlusSquareOutlined, MinusSquareOutlined, SendOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { Address } from "../components";
import dips from "../dips";

export default function Vote({
  address,
  mainnetProvider,
  blockExplorer,
  localProvider,
  tx,
  readContracts,
  writeContracts,
}) {
  const routeHistory = useHistory();
  let { id } = useParams();

  const [election, setElection] = useState({});
  const [selectedDip, setSelectedDip] = useState("onChain");
  const [voteMetadata, setVoteMetadata] = useState({});
  const [voteTableData, setVoteTableData] = useState([]);
  const [electionScoreFactor, setElectionScoreFactor] = useState();
  const [isElectionActive, setIsElectionActive] = useState(false);

  useEffect(() => {
    if (readContracts) {
      if (readContracts.Diplomacy) {
        init();
      }
    }
  }, [readContracts, address]);

  useEffect(() => {
    updateTable();
    updateCandidateMap();
  }, [election, address]);

  const dipsKeys = Object.keys(dips);

  const init = async () => {
    const loadedElection = await readContracts.Diplomacy.getElectionById(id);
    const SCORE_FACTOR = await readContracts.Diplomacy.electionScoreFactor();
    const isCandidate = loadedElection.candidates.includes(address);
    const votedStatus = await readContracts.Diplomacy.hasVoted(id, address);

    const electionData = { ...loadedElection };
    electionData.electionFundingAmount = fromWei(loadedElection.funds.toString(), "ether");
    setElection(electionData);
    setIsElectionActive(electionData.isActive);
    setElectionScoreFactor(SCORE_FACTOR);

    const vote = {};
    vote.canVote = !votedStatus && isCandidate;
    vote.votesLeft = loadedElection.votes;
    setVoteMetadata(vote);

    if (!loadedElection.isActive || votedStatus) {
      updateVotingData();
    }
  };

  const updateTable = async () => {
    let data = [];
    if (election.candidates) {
      for (let i = 0; i < election.candidates.length; i++) {
        const addr = election.candidates[i];
        data.push({ key: i, address: addr });
      }
    }
    setVoteTableData(data);
  };

  const [candidateMap, setCandidateMap] = useState();
  const updateCandidateMap = () => {
    if (election.candidates) {
      const mapping = new Map();
      for (let i = 0; i < election.candidates.length; i++) {
        mapping.set(election.candidates[i], { votes: 0, score: 0 });
      }
      setCandidateMap(mapping);
    }
  };

  const updateVotingData = async () => {
    const scoresData = await dips[selectedDip].handler.getElectionScores(readContracts.Diplomacy, id);
    console.log({ scoresData });
  };

  const [isElectionEnding, setIsElectionEnding] = useState(false);
  const endElection = async () => {
    console.log("endElection");
  };

  const minusVote = addr => {
    const candidate = candidateMap.get(addr);
    if (candidate.votes > 0) {
      candidate.votes = candidate.votes - 1;
      candidate.score = (candidate.votes ** 0.5).toFixed(2);
      candidateMap.set(addr, candidate);
      setVoteMetadata({ ...voteMetadata, votesLeft: voteMetadata.votesLeft + 1 });
      //   setErrorMsg(null);
    }
  };

  const addVote = addr => {
    const candidate = candidateMap.get(addr);
    if (candidate.votes < election.votes && voteMetadata.votesLeft > 0) {
      candidate.votes = candidate.votes + 1;
      candidate.score = (candidate.votes ** 0.5).toFixed(2);
      candidateMap.set(addr, candidate);
      setVoteMetadata({ ...voteMetadata, votesLeft: voteMetadata.votesLeft - 1 });
      //   setErrorMsg(null);
    }
  };

  //render
  const actionCol = () => {
    if (voteMetadata.canVote) {
      return {
        title: "Vote",
        key: "action",
        render: (text, record, index) => (
          <>
            <>
              <Space size="middle">
                <Button
                  icon={<MinusSquareOutlined />}
                  type="link"
                  size="large"
                  onClick={() => minusVote(text.address)}
                ></Button>
                <Typography.Title level={4} style={{ margin: "0.1em" }}>
                  {candidateMap.get(text.address).votes}
                </Typography.Title>
                <Button
                  icon={<PlusSquareOutlined />}
                  type="link"
                  size="large"
                  onClick={() => addVote(text.address)}
                ></Button>
              </Space>
            </>
          </>
        ),
      };
    } else {
      return {};
    }
  };
  const scoreCol = () => {
    // candidateScores[index]
    return {
      title: "Quadratic Score",
      key: "score",
      render: (text, record, index) => (
        <>{Math.floor(candidateMap.get(text.address).score * 10 ** electionScoreFactor)}</>
      ),
    };
  };
  const addressCol = () => {
    return {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: address => (
        <Address address={address} fontSize="14pt" ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
      ),
    };
  };

  const payoutCol = () => {
    // {`${Number(candidatePayout[index]).toFixed(4)}` + ` ${token}`}
    return {
      title: "Expected Payout",
      dataIndex: "payout",
      key: "payout",
      render: (text, record, index) => <>{"$"}</>,
    };
  };

  const percentageCol = () => {
    // `${((candidateScores[index] / electionScoreSum) * 100).toFixed(1)}`
    return {
      title: "Allocation %",
      key: "percentage",
      render: (text, record, index) => <>{"%"}</>,
    };
  };
  const makeTableCols = () => {
    if (isElectionActive) {
      return [addressCol(), scoreCol(), actionCol()];
    } else {
      return [addressCol(), percentageCol(), payoutCol()];
    }
  };
  const tableCols = makeTableCols();

  const endElectionButton = (
    <Button
      icon={<CloseCircleOutlined />}
      type="danger"
      size="large"
      shape="round"
      style={{ margin: 4 }}
      onClick={() => endElection()}
      loading={isElectionEnding}
    >
      End Election
    </Button>
  );

  return (
    <div style={{ border: "1px solid #cccccc", padding: 16, width: 900, margin: "auto", marginTop: 64 }}>
      <PageHeader
        ghost={false}
        onBack={() => routeHistory.push("/")}
        title={election ? election.name : "Loading Election..."}
        extra={[endElectionButton]}
      >
        {voteMetadata.canVote && (
          <Typography.Title level={5}>
            Funding: {election.electionFundingAmount} {<Divider type="vertical" />} Remaining Votes:{" "}
            {voteMetadata.votesLeft}{" "}
          </Typography.Title>
        )}
        <Table
          dataSource={voteTableData}
          columns={tableCols}
          pagination={false}
          onRow={(record, rowIndex) => {
            return {
              onClick: event => {}, // click row
              onDoubleClick: event => {}, // double click row
              onContextMenu: event => {}, // right button click row
              onMouseEnter: event => {}, // mouse enter row
              onMouseLeave: event => {}, // mouse leave row
            };
          }}
        />
      </PageHeader>
    </div>
  );
}
