import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  Button,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";
import DistributionCard from "../components/Cards/DistributionCard";
import Container from "../components/layout/Container";
import SideCard from "../components/Cards/SideCard";
import VoteCard from "../components/Cards/VoterCards/VoteCard";
import CeramicHandler from "../dips/ceramicHandler";
import Confetti from "react-confetti";
import { PayButton } from "../components";

export default function Election({
  address,
  mainnetProvider,
  userSigner,
  targetNetwork,
  tx,
  readContracts,
  writeContracts,
  yourLocalBalance,
}) {
  // /***** Routes *****/
  // const routeHistory = useHistory();
  let { id } = useParams();
  const [handler, setHandler] = useState();
  const [electionState, setElectionState] = useState({});
  const [spender, setSpender] = useState("");
  const [voteMap, setVoteMap] = useState();
  const [candidates, setCandidates] = useState([]);
  const [canVote, setCanVote] = useState(false);
  const [totalScores, setTotalScores] = useState([]);
  const [percentDist, setPercentDist] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const [isBusyEnding, setIsBusyEnding] = useState(false);
  const [numberOfConfettiPieces, setNumberOfConfettiPieces] = useState(0);
  const [error, setError] = useState(false);

  /***** Effects *****/
  useEffect(() => {
    if (readContracts) {
      if (readContracts.Diplomat && targetNetwork) {
        (async () => {
          await init(id);
        })();
      }
    }
  }, [readContracts, id, targetNetwork]);

  const init = async id => {
    // Set Handler to Ceramic
    const handle = await CeramicHandler(
      tx,
      readContracts,
      writeContracts,
      mainnetProvider,
      address,
      userSigner,
      targetNetwork,
    );
    // Load the election state
    const state = await handle.getElectionStateById(id);

    const voteMapping = new Map();
    state.candidates.forEach(addr => {
      voteMapping.set(addr, 0);
    });

    setVoteMap(voteMapping);
    setElectionState(state);
    setHandler(handle);
    setSpender(readContracts?.Diplomat?.address);
    setCandidates(state.candidates);
    setCanVote(state.canVote);
    setTotalScores(state.totalScores);

    if (!state.canVote && state.voters.includes(address)) {
      // Has voted -> Show stats
      const totalScoreSum = state.totalScores.length > 0 ? state.totalScores.reduce((x, y) => x + y) : 0;
      const pdist = state.totalScores.map(score => (score / totalScoreSum).toFixed(12));
      // console.log({ pdist });

      // TODO: Write a test to make sure its always an int -> string
      const alloc = pdist.map(p => String(p * state.fundAmountInWei));
      // console.log({ alloc });
      setPercentDist(pdist);
      setAllocations(alloc);
    }

    // console.log({ state: state, handle: handle, spender: spender });
  };

  const handleConfetti = () => {
    setNumberOfConfettiPieces(200);
    setTimeout(() => {
      setNumberOfConfettiPieces(0);
    }, 4000);
  };

  const castBallot = async () => {
    setIsBusy(true);
    const scores = [];
    const candidates = [];
    voteMap.forEach((votes, addr) => {
      scores.push(votes ** 0.5);
      candidates.push(addr);
    });
    // console.log({ candidates: candidates, scores: scores });
    let result = await handler.castBallot(id, candidates, scores);
    // console.log({ result });
    // setIsBusy(false);
    handleConfetti();
    init(id);
  };

  const endElection = async () => {
    setIsBusyEnding(true);
    let result = await handler.endElection(id);
    //  console.log({ result });
    init(id);
    handleConfetti();
    // setIsBusyEnding(false);
  };

  const ethPayHandler = async () => {
    setIsBusy(true);
    // console.log("ether pay handler");
    // console.log({ allocations: allocations, candidates: candidates });

    const totalAllocation = allocations.reduce((x, y) => String(Number(x) + Number(y)), 0);

    // check if total allocation is right and if not, default to less expensive
    if (totalAllocation !== electionState.fundAmountInWei) {
      console.log("The expected allocation differs from the set allocation!");
    }

    // console.log({ totalAllocation });

    // console.log({ id: id, candidates: candidates, allocations: allocations });
    const result = await handler.distributeEth({
      id: id,
      candidates: candidates,
      payoutInWei: allocations,
      totalValueInWei: electionState.fundAmountInWei,
      tokenAddress: electionState.tokenAdr,
    });

    if (result === "error") {
      setError(true);
    } else {
      handleConfetti();
    }
    // setIsBusy(false);
    init(id);
  };

  const tokenPayHandler = async opts => {
    setIsBusy(true);
    // console.log("token pay handler");
    // console.log({ allocations: allocations, candidates: candidates });
    // console.log({ id: id, candidates: candidates, allocations: allocations });
    const result = await handler.distributeTokens({
      id: id,
      candidates: candidates,
      payoutInWei: allocations,
      tokenAddress: electionState.tokenAdr,
    });
    handleConfetti();
    // setIsBusy(false);
    init(id);
  };

  const distribute = async () => {
    if (electionState.tokenAdr === "0x0000000000000000000000000000000000000000") {
      ethPayHandler();
    } else {
      tokenPayHandler();
    }
  };

  return (
    <Container>
      <Confetti recycle={true} run={true} numberOfPieces={numberOfConfettiPieces} tweenDuration={3000} />
      <Grid w="full" templateColumns="repeat(3, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <SideCard
            electionState={electionState}
            mainnetProvider={mainnetProvider}
            endElection={endElection}
            isEndingElection={false}
            address={address}
            spender={spender}
            yourLocalBalance={yourLocalBalance}
            readContracts={readContracts}
            writeContracts={writeContracts}
            ethPayHandler={ethPayHandler}
            tokenPayHandler={tokenPayHandler}
          />

          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertTitle mr={2}>An Error has occured!</AlertTitle>
              <CloseButton
                onClick={() => {
                  setError(false);
                }}
                position="absolute"
                right="8px"
                top="8px"
              />
            </Alert>
          )}

          {!electionState.isPaid && !electionState.active && electionState.isAdmin && (
            <PayButton
              token={electionState.tokenSymbol}
              tokenAddr={electionState.tokenAdr}
              appName="Pay Party"
              // tokenListHandler={tokens => setAvailableTokens(tokens)}
              callerAddress={address}
              maxApproval={electionState.fundAmountInWei}
              amount={electionState.fundAmountInWei}
              spender={spender}
              yourLocalBalance={yourLocalBalance}
              readContracts={readContracts}
              writeContracts={writeContracts}
              ethPayHandler={ethPayHandler}
              tokenPayHandler={tokenPayHandler}
            />
          )}
          {electionState.active && electionState.isAdmin && (
            <Button
              leftIcon={<LockIcon />}
              isLoading={isBusyEnding}
              loadingText="Ending Election..."
              onClick={() => {
                console.log("end election");
                endElection();
              }}
            >
              End Election
            </Button>
          )}
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
            {canVote ? (
              <>
                <VoteCard
                  candidates={candidates}
                  voteMap={voteMap}
                  voteAllocation={electionState.voteAllocation}
                  mainnetProvider={mainnetProvider}
                />
                <Box w="full" pt="1rem" align="end">
                  <Button
                    ml="0.5rem"
                    onClick={castBallot}
                    px="1.25rem"
                    fontSize="md"
                    isLoading={isBusy}
                    loadingText="Voting"
                  >
                    Submit
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <DistributionCard
                  candidates={candidates}
                  scores={totalScores}
                  percent={percentDist}
                  allocations={allocations}
                  fundAllocation={electionState.fundAllocation}
                  candidateMap={{}}
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
