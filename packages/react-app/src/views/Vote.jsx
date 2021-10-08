import { PageHeader } from "antd";
import { useParams, useHistory, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Button, Divider, Table, Space, Typography, Input } from "antd";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { Address, PayButton } from "../components";
import { ethers } from "ethers";
import qs from "query-string";
import { PlusSquareOutlined, MinusSquareOutlined, SendOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dips from "../dips";
import { makeCeramicClient } from "../helpers";
import { CERAMIC_PREFIX } from "../dips/helpers";

const { Text } = Typography;

var Map = require("collections/map");

export default function Vote({
  address,
  mainnetProvider,
  blockExplorer,
  localProvider,
  userSigner,
  tx,
  readContracts,
  writeContracts,
  yourLocalBalance,
}) {
  /***** Routes *****/
  const routeHistory = useHistory();
  let { id } = useParams();
  const location = useLocation();

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("ceramic");
  const [qdipHandler, setQdipHandler] = useState();

  const [electionState, setElectionState] = useState({});
  console.log({ electionState });
  const [votesLeft, setVotesLeft] = useState(0);
  const [tableSrc, setTableSrc] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  //   const [tableCols, setTableCols] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isElectionEnding, setIsElectionEnding] = useState(false);
  const [candidateMap, setCandidateMap] = useState();
  const [candidateScores, setCandidateScores] = useState([]);

  //Payout
  const [finalPayout, setFinalPayout] = useState({
    scores: [],
    payout: [],
    scoreSum: 0,
  });
  const [token, setToken] = useState("ETH");
  const [spender, setSpender] = useState("");
  const [availableTokens, setAvailableTokens] = useState([]);
  const [isPaying, setIsPaying] = useState(false);

  const updateCandidateScore = async () => {
    const scores = await qdipHandler.getCandidatesScores(id);
    setCandidateScores(scores);
  };

  const updateFinalPayout = async () => {
    const payout = await qdipHandler.getFinalPayout(id);
    setFinalPayout(payout);
  };
  /***** Effects *****/
  useEffect(() => {
    if (readContracts) {
      if (readContracts.Diplomat) {
        init();
      }
    }
  }, [readContracts, address]);

  useEffect(async () => {
    if (qdipHandler) {
      await loadElectionState();
    }
  }, [qdipHandler]);

  //   useEffect(async () => {
  //     if (candidateMap) {
  //       setTableCols(makeTableCols());
  //     }
  //   }, [candidateMap]);

  useEffect(() => {
    (async () => {
      if (electionState && electionState.name) {
        updateTableSrc();
        setVotesLeft(electionState.voteAllocation);
        if (electionState.active) {
          await updateCandidateScore();
        } else {
          await updateFinalPayout();
        }
      }
    })();
  }, [electionState, address]);

  /***** Methods *****/

  const init = async () => {
    // TODO: handle invalid urls in the UI -> 404 ?
    const { kind } = qs.parse(location.search);
    setQdipHandler(dips[kind].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner));
    setSpender(readContracts?.Diplomat?.address);
    // loadERC20List();
  };

  const loadERC20List = async () => {
    const erc20List = Object.keys(readContracts).reduce((acc, contract) => {
      console.log(contract);
      if (typeof readContracts[contract].decimals !== "undefined") {
        acc.push(contract);
      }
      return acc;
    }, []);
  };

  const loadElectionState = async () => {
    let electionState = await qdipHandler.getElectionStateById(id);
    setElectionState(electionState);
  };

  const updateTableSrc = async () => {
    let data = [];
    if (electionState.candidates) {
      for (let i = 0; i < electionState.candidates.length; i++) {
        const addr = electionState.candidates[i];
        data.push({ key: i, address: addr });
      }
    }
    setTableSrc(data);
    if (electionState.candidates) {
      const mapping = new Map();
      for (let i = 0; i < electionState.candidates.length; i++) {
        mapping.set(electionState.candidates[i], { votes: 0, score: 0 });
      }
      setCandidateMap(mapping);
    }
  };

  const minusVote = addr => {
    const candidate = candidateMap.get(addr);
    if (candidate.votes > 0) {
      candidate.votes = candidate.votes - 1;
      candidate.score = (candidate.votes ** 0.5).toFixed(2);
      candidateMap.set(addr, candidate);
      setVotesLeft(votesLeft + 1);
      setErrorMsg(null);
    }
  };

  const addVote = addr => {
    const candidate = candidateMap.get(addr);
    if (candidate.votes < electionState.voteAllocation && votesLeft > 0) {
      candidate.votes = candidate.votes + 1;
      candidate.score = (candidate.votes ** 0.5).toFixed(2);
      candidateMap.set(addr, candidate);
      setVotesLeft(votesLeft - 1);
      setErrorMsg(null);
    }
  };

  const castBallot = async () => {
    setIsVoting(true);
    if (votesLeft > 0) {
      setErrorMsg("All remaining votes need to be distributed");
      return;
    }
    setErrorMsg(null);

    const candidates = Array.from(candidateMap.keys());
    const scores = [];
    candidateMap.forEach(d => {
      scores.push(Math.floor(d.score * 100));
    });
    console.log(candidates, scores);
    return qdipHandler
      .castBallot(id, candidates, scores, userSigner)
      .then(async totalScores => {
        console.log({ totalScores });
        setCandidateScores(totalScores);
        await loadElectionState();
        setIsVoting(false);
      })
      .catch(err => {
        console.log(err);
        setIsVoting(false);
      });
  };

  const endElection = async () => {
    setIsElectionEnding(true);
    return qdipHandler
      .endElection(id)
      .then(async success => {
        await loadElectionState();
        setIsElectionEnding(false);
      })
      .catch(err => {
        console.log("err endElection", err);
        setIsElectionEnding(false);
      });
  };

  const ethPayHandler = () => {
    console.log({ electionState, finalPayout });
    const totalValueInWei = electionState.fundAmount;
    //convert payout to wei
    let payoutInWei = finalPayout.payout.map(p => toWei(p));
    console.log({ payoutInWei });

    return qdipHandler
      .distributeEth({
        id,
        candidates: electionState.candidates,
        payoutInWei,
        totalValueInWei,
        tokenAddress: electionState.tokenAdr,
      })
      .then(async success => {
        return loadElectionState();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const tokenPayHandler = async opts => {
    const adrs = Array.from(candidateMap.keys());
    //convert payout to wei
    let payoutInWei = finalPayout.payout.map(p => toWei(p));
    tx(
      writeContracts.Diplomat.payElection(id, adrs, payoutInWei, {
        gasLimit: 12450000,
      }),
      async update => {
        if (update) {
          if (update.status === "confirmed" || update.status === 1) {
            loadElectionState();
          }
        }
      },
    );
  };

  /***** Render *****/
  const actionCol = () => {
    if (electionState.canVote) {
      return {
        title: "Vote",
        key: "action",
        render: (text, record, index) => (
          <>
            <Space size="middle">
              <Button
                icon={<MinusSquareOutlined />}
                type="link"
                size="large"
                onClick={() => minusVote(text.address)}
              ></Button>
              <Typography.Title level={4} style={{ margin: "0.1em" }}>
                {candidateMap && candidateMap.get(text.address).votes}
              </Typography.Title>
              <Button
                icon={<PlusSquareOutlined />}
                type="link"
                size="large"
                onClick={() => addVote(text.address)}
              ></Button>
            </Space>
          </>
        ),
      };
    } else {
      return {};
    }
  };

  const scoreCol = () => {
    if (electionState.active && candidateScores) {
      return {
        title: "Quadratic Score",
        key: "score",
        render: (text, record, index) => <>{candidateScores[index]}</>,
      };
    } else {
      return {
        title: "Quadratic Score",
        key: "score",
        render: (text, record, index) => <>{Math.floor(candidateMap.get(text.address).score * 10)}</>,
      };
    }
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
    return {
      title: "Expected Payout",
      dataIndex: "payout",
      key: "payout",
      render: (text, record, index) => <>{`${Number(finalPayout.payout[index]).toFixed(4)}` + ` ${token}`}</>,
    };
  };

  const percentageCol = () => {
    return {
      title: "Allocation %",
      key: "percentage",
      render: (text, record, index) => (
        <>{`${((finalPayout.scores[index] / finalPayout.scoreSum) * 100).toFixed(1)}` + "%"}</>
      ),
    };
  };

  const makeTableCols = () => {
    if (electionState && electionState.active) {
      if (electionState.canVote) {
        return [addressCol(), actionCol()];
      } else {
        return [addressCol(), scoreCol()];
      }
    } else {
      return [addressCol(), percentageCol(), payoutCol()];
    }
  };

  const approveuni = async () => {
    const token = "UNI";
    const decimals = await readContracts[token].decimals();
    const maxApproval = "100000000";
    const newAllowance = ethers.utils.parseUnits(maxApproval, decimals);
    const res = await writeContracts[token].approve(spender, newAllowance);
    await res.wait(1);
  };

  const testUni = async () => {
    const adrs = ["0x76c48E1F02774C40372a3497620D946136136172"];
    //convert payout to wei
    let payoutInWei = ["0.01"].map(p => toWei(p));
    tx(
      writeContracts.Diplomat.payElection(id, adrs, payoutInWei, {
        gasLimit: 12450000,
      }),
      async update => {
        if (update) {
          if (update.status === "confirmed" || update.status === 1) {
            loadElectionState();
          }
        }
      },
    );
  };

  //TODO: table votes are hard to update if we use useState, so has to be outside
  const tableCols = makeTableCols();

  return (
    <>
      <div
        className="voting-view"
        style={{ border: "1px solid #cccccc", padding: 16, width: 900, margin: "auto", marginTop: 64 }}
      >
        {/* <Button onClick={() => testUni()}>Test UNI Send</Button>
        <Button onClick={() => approveuni()}>Approve UNI Send</Button> */}

        <PageHeader
          ghost={false}
          onBack={() => routeHistory.push("/")}
          title={electionState ? electionState.name : "Loading Election..."}
          extra={[
            electionState && electionState.active && electionState.isAdmin && (
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
            ),
            electionState && !electionState.active && electionState.isAdmin && !electionState.isPaid && (
              <PayButton
                token={"ETH"}
                tokenAddr={electionState.tokenAdr}
                appName="Quadratic Diplomacy"
                tokenListHandler={tokens => setAvailableTokens(tokens)}
                callerAddress={address}
                maxApproval={electionState.fundAmount}
                amount={electionState.fundAmount}
                spender={spender}
                yourLocalBalance={yourLocalBalance}
                readContracts={readContracts}
                writeContracts={writeContracts}
                ethPayHandler={ethPayHandler}
                tokenPayHandler={tokenPayHandler}
              />
            ),
          ]}
        >
          {electionState.canVote && (
            <Typography.Title level={5}>
              Funding: {electionState.fundAmount} {<Divider type="vertical" />} Remaining Votes: {votesLeft}{" "}
            </Typography.Title>
          )}
          <Table
            dataSource={tableSrc}
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
          <Divider />
          <div>
            {electionState.canVote && electionState.active && (
              <Button
                icon={<SendOutlined />}
                size="large"
                loading={isVoting}
                shape="round"
                type="primary"
                onClick={castBallot}
              >
                Cast Ballot
              </Button>
            )}
          </div>
          <div>{errorMsg && <Text type="danger">{errorMsg}</Text>}</div>
          <div>{electionState.isPaid && <Text type="success">Election Payout Complete!</Text>}</div>
        </PageHeader>
      </div>
    </>
  );
}
