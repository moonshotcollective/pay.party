import React, { useEffect, useState, useMemo } from "react";
import { Button, Box } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useParams, useHistory } from "react-router-dom";
import MongoDBController from "../../controllers/mongodbController";
import { Vote, View, Distribute } from "./components";

export default function Party({
  address,
  mainnetProvider,
  userSigner,
  targetNetwork,
  tx,
  readContracts,
  writeContracts,
  yourLocalBalance,
}) {
  const routeHistory = useHistory();
  let { id } = useParams();

  const [partyData, setPartyData] = useState({});
  const [accountVoteData, setAccountVoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [distribution, setDistribution] = useState();

  const db = new MongoDBController();

  useEffect(async () => {
    db.fetchParty(id)
      .then(res => {
        setPartyData(res.data);
        console.log(res.data)
        const votes = res?.data?.ballots?.filter(b => b.data.ballot.address === address);
        const participating = res.data.participants.includes(address);
        setAccountVoteData(votes);
        setCanVote(votes.length === 0 && participating ? true : false);
        setIsParticipant(participating)
      })
      .catch(err => {
        console.log(err);
      });
  }, [id]);

    // Calculate percent distribution from submitted ballots
    const calcDistribution = () => {
      if (partyData &&  partyData.ballots && partyData.ballots.length > 0) {
        const votes = partyData.ballots.map(b => JSON.parse(b.data.ballot.votes.replace(/[ \n\r]/g, "")));
        let sum = 0;
        let processed = [];
        let strategy = partyData.config.strategy;
        if (!strategy || strategy === "") {
          strategy = "Linear";
          console.log("Reverted to linear strategy");
        }
        for (let i = 0; i < partyData.candidates.length; i++) {
          const candidate = partyData.candidates[i];
          // Strategy handling
          // TODO: Switch statement
          if (strategy === "Linear") {
            let c = votes.reduce((total, vote) => vote[candidate] + total, 0);
            sum += c;
            processed.push({ address: candidate, reduced: c });
          } else if (strategy === "Quadratic") {
            let c = votes.reduce((total, vote) => vote[candidate] ** 0.5 + total, 0);
            sum += c;
            processed.push({ address: candidate, reduced: c });
          }
        }
        let final = [];
        for (let i = 0; i < partyData.candidates.length; i++) {
          const candidate = partyData.candidates[i];
          final.push({ address: candidate, score: processed[i].reduced / sum });
        }
        setDistribution(final);
      }
    };
  
    // Calculate the distribution on load
    useEffect(() => {
      calcDistribution();
    }, [partyData]);

  return (
    <Box>
      <Button
        size="lg"
        variant="ghost"
        leftIcon={<ArrowBackIcon />}
        onClick={() => {
          routeHistory.push("/");
        }}
      >
        Back
      </Button>
      <Button
        size="lg"
        variant="ghost"
        onClick={() => {
          showDebug ? setShowDebug(false) : setShowDebug(true);
        }}
      >
        Debug
      </Button>
      <Box borderWidth={"1px"}>
        {showDebug && <p>{JSON.stringify(partyData)}</p>}
        {canVote ? (
          <Vote
            dbInstance={db}
            partyData={partyData}
            address={address}
            userSigner={userSigner}
            targetNetwork={targetNetwork}
            readContracts={readContracts}
            mainnetProvider={mainnetProvider}
          />
        ) : (
          <View
            partyData={partyData}
            mainnetProvider={mainnetProvider}
            votesData={accountVoteData}
            distribution={distribution}
          />
        )}
        <Distribute
          dbInstance={db}
          partyData={partyData}
          address={address}
          userSigner={userSigner}
          writeContracts={writeContracts}
          tx={tx}
          distribution={distribution}
        />
      </Box>
    </Box>
  );
}
