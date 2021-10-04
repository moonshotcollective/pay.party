import React, { useEffect, useState } from "react";
import { Box, Button, Grid, GridItem, Spinner, useColorModeValue, Heading, Flex } from "@chakra-ui/react";
import { useHistory, useParams } from "react-router-dom";

import DistributionCard from "../components/Cards/DistributionCard";
import Container from "../components/layout/Container";
import SideCard from "../components/Cards/SideCard";
import VoteCard from "../components/Cards/VoterCards/VoteCard";
import { handlers } from "../dips";
import CenteredFrame from "../components/layout/CenteredFrame";

function MockElectionPage({
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
  const [isPaying, setIsPaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  /***** Effects *****/
  useEffect(() => {
    if (readContracts) {
      if (readContracts.Diplomat) {
        (async () => {
          setIsLoading(true);
          await init();
          setIsLoading(false);
        })();
      }
    }
  }, [readContracts, address]);

  useEffect(() => {
    if (qdipHandler) {
      (async () => {
        setIsLoading(true);
        await loadElectionState();
        setIsLoading(false);
      })();
    }
  }, [qdipHandler]);

  //   useEffect(async () => {
  //     if (candidateMap) {
  //       setTableCols(makeTableCols());
  //     }
  //   }, [candidateMap]);

  useEffect(() => {
    if (electionState && electionState.name) {
      // updateTableSrc();
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
    if (election.token == "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984") {
      setToken("UNI");
    }
    // setSelectedQdip();
    setQdipHandler(
      handlers[election.kind].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner),
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
      scores.push(Math.floor(d.score * 100));
    });
    console.log(candidates, scores);
    qdipHandler
      .castBallot(id, candidates, scores, userSigner)
      .then(totalScores => {
        setCandidateScores(totalScores);
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
        console.log("err endElection", err);
        setIsElectionEnding(false);
      });
  };

  const ethPayHandler = () => {
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
    const adrs = Array.from(candidateMap.keys());
    //convert payout to wei
    let payoutInWei = finalPayout.payout.map(p => toWei(p));
    const election = await readContracts.Diplomat.getElection(id);
    console.log({ election });
    tx(
      writeContracts.Diplomat.payElection(id, adrs, payoutInWei, {
        gasLimit: 12450000,
      }),
    );
  };
  return isLoading || !electionState.n_voted ? (
    <CenteredFrame>
      <Flex flexDirection="column" justifyContent="center" alignItems="center">
        <Heading fontSize="1.5rem" color={headingColor}>
          Loading election {id}
        </Heading>
        <Spinner color="purple.700" size="xl" />
      </Flex>
    </CenteredFrame>
  ) : (
    <Container>
      <Grid w="full" templateColumns="repeat(3, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <SideCard
            id={electionState.id}
            name={electionState.name}
            creator={electionState.creator}
            tokenSymbol={electionState.tokenSymbol}
            voted={`${electionState.n_voted.n_voted} / ${electionState.n_voted.outOf}`}
            active={electionState.active}
            amount={electionState.amount}
            createdAt={electionState.created_date}
          />
        </GridItem>
        <GridItem colSpan={2}>
          <Box
            w="full"
            pt="1rem"
            align="end"
            borderColor="purple.500"
            borderWidth="1px"
            borderRadius="8px"
            py="3rem"
            px="2.5rem"
          >
            {electionState.canVote ? (
              <>
                <VoteCard candidates={electionState.candidates} voteAllocation={electionState.voteAllocation} />
                <Box w="full" pt="1rem" align="end">
                  <Button
                    ml="0.5rem"
                    onClick={() => {
                      console.log("submitted true");
                      setSubmitted(true);
                    }}
                    px="1.25rem"
                    fontSize="md"
                  >
                    Submit
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <DistributionCard />
                {/* TO BE REMOVED AFTER BACKEND INTEGRATION */}
                <Box w="full" pt="1rem" align="end">
                  <Button
                    ml="0.5rem"
                    onClick={() => {
                      console.log("submitted false");
                      setSubmitted(false);
                    }}
                    px="1.25rem"
                    fontSize="md"
                  >
                    Go to Vote
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}

export default MockElectionPage;
