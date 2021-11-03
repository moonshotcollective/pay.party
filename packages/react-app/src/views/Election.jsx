import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Spinner,
  Text,
  useColorModeValue,
  Heading,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import {} from "@chakra-ui/icons";
import { useHistory, useParams } from "react-router-dom";
import qs from "query-string";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";

import DistributionCard from "../components/Cards/DistributionCard";
import Container from "../components/layout/Container";
import SideCard from "../components/Cards/SideCard";
import VoteCard from "../components/Cards/VoterCards/VoteCard";
import dips from "../dips";
import CenteredFrame from "../components/layout/CenteredFrame";
import Confetti from "react-confetti";

export default function Election({
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
  const [isVoting, setIsVoting] = useState(false);
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
  const [numberOfConfettiPieces, setNumberOfConfettiPieces] = useState(0);

  const handleConfetti = e => {
    setNumberOfConfettiPieces(200);
    setTimeout(() => {
      setNumberOfConfettiPieces(0);
    }, 4000);
  };

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

  useEffect(async () => {
    if (candidateMap) {
      if (electionState.isActive) {
        // updateCandidateScore();
      } else {
        // updateFinalPayout();
      }
    }
  }, [candidateMap]);

  useEffect(() => {
    if (electionState && electionState.name) {
      // updateTableSrc();
      //   console.log({ electionState });
      setVotesLeft(electionState.voteAllocation);
    }
  }, [electionState, address]);

  /***** Methods *****/

  const init = async () => {
    const { kind } = qs.parse(location.search);
    setQdipHandler(dips[kind].handler(tx, readContracts, writeContracts, mainnetProvider, address, userSigner));
    setSpender(readContracts?.Diplomat?.address);
  };

  const loadERC20List = async () => {
    const erc20List = Object.keys(readContracts).reduce((acc, contract) => {
      // console.log(contract);
      if (typeof readContracts[contract].decimals !== "undefined") {
        acc.push(contract);
      }
      return acc;
    }, []);
  };

  const loadElectionState = async () => {
    let electionState = await qdipHandler.getElectionStateById(id);
    console.log({ electionState });
    electionState.amtFromWei = electionState.fundAmountInWei || "0";
    setElectionState(electionState);
    updateCandidateMap(electionState);
    return "success";
  };

  const minusVote = addr => {
    if (typeof candidateMap !== "undefined") {
      const candidate = candidateMap.get(addr);
      if (candidate.votes > 0) {
        candidate.votes = candidate.votes - 1;
        candidate.score = (candidate.votes ** 0.5).toFixed(2);
        candidateMap.set(addr, candidate);
        setVotesLeft(votesLeft + 1);
        setErrorMsg(null);
      }
    }
    // console.log(candidate);
  };

  const addVote = addr => {
    if (typeof candidateMap !== "undefined") {
      const candidate = candidateMap.get(addr);
      // console.log(candidate);
      if (candidate.votes < electionState.voteAllocation && votesLeft > 0) {
        candidate.votes = candidate.votes + 1;
        candidate.score = (candidate.votes ** 0.5).toFixed(2);
        candidateMap.set(addr, candidate);
        setVotesLeft(votesLeft - 1);
        setErrorMsg(null);
      }
    }
  };

  const castBallot = async () => {
    if (typeof candidateMap !== "undefined") {
      console.log("casting ballot ", votesLeft);
      if (votesLeft > 0) {
        setErrorMsg("All remaining votes need to be distributed");
        return;
      }
      setErrorMsg(null);
      setIsVoting(true);
      const candidates = Array.from(candidateMap.keys());
      console.log({ candidateMap, candidates });
      const scores = [];
      candidateMap.forEach(d => {
        console.log({ d });
        scores.push(Number(d.score));
      });
      console.log({ scores });
      let result = await qdipHandler.castBallot(id, candidates, scores);
      if (result) {
        console.log(result);
        let res = await loadElectionState();
        if (res == "success") {
          setIsVoting(false);
          handleConfetti();
        }
      } else {
        console.log("could not cast ballot");
        setIsVoting(false);
      }
      // FIX THIS
      // const candidates = Array.from(candidateMap.keys());
      // console.log({ candidates });
      // const scores = [];
      // let last = NaN;
      // candidateMap.forEach(d => {
      //   if (last !== d.score) {
      //     if (typeof d.score === "undefined") {
      //       d.score = "0.00";
      //     }
      //     scores.push(Number(d.score));
      //   }
      //   last = d.score;
      // });
      // console.log({ scores });
      // let result = await qdipHandler.castBallot(id, candidates, scores, userSigner);
      // if (result) {
      //   console.log(result);
      //   let res = await loadElectionState();
      //   if (res == "success") {
      //     setIsVoting(false);
      //     handleConfetti();
      //   }
      // } else {
      //   console.log("could not cast ballot");
      //   setIsVoting(false);
      // }
    }
  };

  const updateCandidateMap = async electionState => {
    const candidates = electionState.candidates;
    if (!candidates) {
      console.log("no candidates found");
      return;
    }

    let totalScores = await qdipHandler.getCandidatesScores(id);
    console.log({ totalScores });
    let totalScoresSum = totalScores.reduce((sum, curr) => sum + curr, 0);
    // console.log({ totalScoresSum });
    let mapping = new Map();
    // if (candidateMap) {
    //   mapping = candidateMap;
    // } else {
    for (let i = 0; i < electionState.candidates.length; i++) {
      mapping.set(electionState.candidates[i], { votes: 0, score: 0 });
    }
    setCandidateMap(mapping);
    // }
    // Score Updating and Quadratic Calculation
    const candidateArr = candidates.map((addr, idx) => {
      const candidate = mapping.get(addr);
      let votedAddrs = Object.keys(electionState.votes);
      candidate.voted = votedAddrs.includes(addr);
      candidate.score = totalScores[idx];
      candidate.allocation = (totalScores[idx] / totalScoresSum) * 100;
      candidate.allocation = candidate.allocation.toFixed(2);
      // console.log({ electionState });

      const candidatePay = (totalScores[idx] / totalScoresSum) * electionState.fundAmount;
      // console.log({ candidatePay });
      if (!isNaN(candidatePay)) {
        candidate.payoutFromWei = candidatePay.toString();
      } else {
        candidate.payoutFromWei = "0";
      }
      // return candidate;
      // Compute the scores from everyone
      // return new Map(mapping.set(addr, candidate));
      return [addr, candidate];
    });
    const candidateMapping = new Map(candidateArr);
    setCandidateMap(candidateMapping);
    console.log({ candidateMapping });
  };

  const updateFinalPayout = async () => {
    setFinalPayout(await qdipHandler.getFinalPayout(id));
  };

  const endElection = async () => {
    // console.log("endElection");
    setIsElectionEnding(true);
    let result = await qdipHandler.endElection(electionState.id);
    if (result) {
      // console.log(result);
      let res = await loadElectionState();
      if (res == "success") {
        setIsElectionEnding(false);
      }
    } else {
      console.log("could not end election");
      setIsElectionEnding(false);
    }
  };

  const ethPayHandler = async () => {
    if (typeof candidateMap !== "undefined") {
      // console.log({ electionState, finalPayout });
      const totalValueInWei = electionState.fundAmountInWei;
      //convert payout to wei
      let payoutInWei = [];
      electionState.candidates.forEach((addr, idx) => {
        const candidate = candidateMap.get(addr);
        // console.log({ candidate });
        payoutInWei.push(toWei(Number.parseFloat(candidate.payoutFromWei).toFixed(18).toString()));
      });
      // console.log({ payoutInWei });
      const result = await qdipHandler.distributeEth({
        id,
        candidates: electionState.candidates,
        payoutInWei,
        totalValueInWei,
        tokenAddress: electionState.tokenAdr,
      });
      // console.log(result);
      if (result) {
        let res = await loadElectionState();
        if (res == "success") {
          handleConfetti();
          return result;
        }
      }
    }
  };

  const tokenPayHandler = async opts => {
    if (typeof candidateMap !== "undefined") {
      //convert payout to wei
      let payoutInWei = [];
      electionState.candidates.forEach((addr, idx) => {
        const candidate = candidateMap.get(addr);
        payoutInWei.push(toWei(candidate.payoutFromWei));
      });
      const result = await qdipHandler.distributeTokens({
        id,
        candidates: electionState.candidates,
        payoutInWei,
        tokenAddress: electionState.tokenAdr,
      });
      if (result) {
        let res = await loadElectionState();
        if (res == "success") {
          handleConfetti();
          return result;
        }
      }
    }
  };
  return isLoading || !electionState.n_voted ? (
    <CenteredFrame>
      <Flex flexDirection="column" justifyContent="center" alignItems="center">
        <Heading fontSize="1.5rem" color={headingColor}>
          Loading election...
        </Heading>
        <Spinner color="purple.700" size="xl" />
      </Flex>
    </CenteredFrame>
  ) : (
    <Container>
      <Confetti recycle={true} run={true} numberOfPieces={numberOfConfettiPieces} tweenDuration={3000} />
      <Grid w="full" templateColumns="repeat(3, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <SideCard
            electionState={electionState}
            mainnetProvider={mainnetProvider}
            endElection={endElection}
            isEndingElection={isElectionEnding}
            address={address}
            spender={spender}
            yourLocalBalance={yourLocalBalance}
            readContracts={readContracts}
            writeContracts={writeContracts}
            ethPayHandler={ethPayHandler}
            tokenPayHandler={tokenPayHandler}
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
                <VoteCard
                  candidates={electionState.candidates}
                  candidateMap={candidateMap}
                  voteAllocation={electionState.voteAllocation}
                  votesLeft={votesLeft}
                  addVote={addVote}
                  minusVote={minusVote}
                  mainnetProvider={mainnetProvider}
                />
                <Box w="full" pt="1rem" align="end">
                  <Text fontSize="1rem" color="red.400">
                    {errorMsg}
                  </Text>
                  <Button
                    ml="0.5rem"
                    onClick={castBallot}
                    px="1.25rem"
                    fontSize="md"
                    isLoading={isVoting}
                    loadingText="Voting"
                  >
                    Submit
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <DistributionCard
                  candidates={electionState.candidates}
                  candidateMap={candidateMap}
                  mainnetProvider={mainnetProvider}
                  isPaid={electionState.isPaid}
                  tokenSym={electionState.tokenSymbol}
                />
              </>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}
