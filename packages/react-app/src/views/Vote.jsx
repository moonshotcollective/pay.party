import { PageHeader } from "antd";
import { useParams, useHistory } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Button, Divider, Table, Space, Typography, Input } from "antd";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";
import { Address, PayButton } from "../components";
import { PlusSquareOutlined, MinusSquareOutlined, SendOutlined, CloseCircleOutlined } from "@ant-design/icons";

import { CenteredFrame } from "../components/layout";
import dips from "../dips";

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

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("onChain");
  const [qdipHandler, setQdipHandler] = useState();

  const [electionState, setElectionState] = useState({});
  const [votesLeft, setVotesLeft] = useState(0);
  const [tableSrc, setTableSrc] = useState([]);
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
      loadElectionState();
    }
  }, [qdipHandler]);

  //   useEffect(async () => {
  //     if (candidateMap) {
  //       setTableCols(makeTableCols());
  //     }
  //   }, [candidateMap]);

  useEffect(() => {
    if (electionState && electionState.name) {
      updateTableSrc();
      console.log({ electionState });
      setVotesLeft(electionState.votes);
      if (electionState.active) {
        updateCandidateScore();
      } else {
        updateFinalPayout();
      }
    }
  }, [electionState, address]);

  /***** Methods *****/

  const init = async () => {
    const election = await readContracts.Diplomat.getElection(id);
    console.log({ election });
    // setSelectedQdip();
    setQdipHandler(
      dips[election.kind].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner),
    );
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
    console.log({ electionState });
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
    // console.log(candidate);
  };

  const addVote = addr => {
    const candidate = candidateMap.get(addr);
    if (candidate.votes < electionState.votes && votesLeft > 0) {
      candidate.votes = candidate.votes + 1;
      candidate.score = (candidate.votes ** 0.5).toFixed(2);
      candidateMap.set(addr, candidate);
      setVotesLeft(votesLeft - 1);
      setErrorMsg(null);
    }
    // console.log(candidate);
  };

  const castBallot = async () => {
    console.log("casting ballot ", votesLeft);
    if (votesLeft > 0) {
      setErrorMsg("All remaining votes need to be distributed");
      return;
    }
    setErrorMsg(null);

    const candidates = Array.from(candidateMap.keys());
    const scores = [];
    candidateMap.forEach(d => {
      scores.push(Math.floor(d.score * 10));
    });
    console.log(candidates, scores);
    qdipHandler
      .castBallot(id, candidates, scores, userSigner)
      .then(success => {
        console.log("success");
        loadElectionState();
      })
      .catch(err => {
        console.log(err);
      });
  };

  const updateCandidateScore = async () => {
    setCandidateScores(await qdipHandler.getCandidatesScores(id));
  };

  const updateFinalPayout = async () => {
    setFinalPayout(await qdipHandler.getFinalPayout(id));
  };

  const endElection = async () => {
    console.log("endElection");
    setIsElectionEnding(true);
    qdipHandler
      .endElection(id)
      .then(success => {
        loadElectionState();
        setIsElectionEnding(false);
      })
      .catch(err => {
        setIsElectionEnding(false);
      });
  };

  const ethPayHandler = () => {
    // setIsElectionPaying(true);
    const adrs = Array.from(candidateMap.keys());
    const totalValueInWei = toWei(electionState.fundingAmount);
    //convert payout to wei
    let payoutInWei = finalPayout.payout.map(p => toWei(p));

    console.log(adrs, payoutInWei, totalValueInWei);

    return new Promise((resolve, reject) => {
      qdipHandler
        .distributeEth(id, adrs, payoutInWei, totalValueInWei)
        .then(success => {
          loadElectionState();
          resolve(success);
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  const tokenPayHandler = async opts => {
    setIsElectionPaying(true);
    console.log(opts);
    console.log({ payoutInfo });
    const election = await readContracts.Diplomat.getElectionById(id);
    console.log({ election });

    tx(
      writeContracts.Diplomat.payoutElection(id, payoutInfo.candidates, payoutInfo.payout, {
        gasLimit: 12450000,
      }),
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
    if (electionState.active) {
      return {
        title: "Quadratic Score",
        key: "score",
        render: (text, record, index) => <>{candidateScores[index]}</>,
      };
    } else {
      return {
        title: "Quadratic Score",
        key: "score",
        render: (text, record, index) => (
          <>{Math.floor(candidateMap.get(text.address).score * 10 ** electionScoreFactor)}</>
        ),
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
  //TODO: table votes are hard to update if we use useState, so has to be outside
  const tableCols = makeTableCols();

  return (
    <>
      <CenteredFrame>
        <PageHeader
          ghost={false}
          onBack={() => routeHistory.push("/")}
          title={electionState ? electionState.name : "Loading Election..."}
          style={{ width: 1000 }}
          extra={[
            electionState && electionState.active && electionState.isAdmin && (
              <Button
                icon={<CloseCircleOutlined />}
                type="danger"
                size="large"
                shape="round"
                key="unique2"
                style={{ margin: 4 }}
                onClick={() => endElection()}
                loading={isElectionEnding}
              >
                End Election
              </Button>
            ),
            electionState && !electionState.active && electionState.isAdmin && !electionState.isPaid && (
              <PayButton
                token={token}
                appName="Quadratic Diplomacy"
                tokenListHandler={tokens => setAvailableTokens(tokens)}
                callerAddress={address}
                maxApproval={electionState.fundingAmount}
                amount={electionState.fundingAmount}
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
              Funding: {electionState.fundingAmount} {<Divider type="vertical" />} Remaining Votes: {votesLeft}{" "}
            </Typography.Title>
          )}
          <Table
            dataSource={tableSrc}
            columns={tableCols}
            rowKey="address"
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
              <Button icon={<SendOutlined />} size="large" shape="round" type="primary" onClick={() => castBallot()}>
                Cast Ballot
              </Button>
            )}
          </div>
          <div>{errorMsg && <Text type="danger">{errorMsg}</Text>}</div>
          <div>{electionState.paid && <Text type="success">Election Payout Complete!</Text>}</div>
        </PageHeader>
      </CenteredFrame>
    </>
  );
}
