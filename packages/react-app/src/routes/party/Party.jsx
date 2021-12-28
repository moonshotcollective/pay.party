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

  const db = new MongoDBController();

  useEffect(async () => {
    db.fetchParty(id)
      .then(res => {
        setPartyData(res.data);
        const votes = res.data.ballots.filter(b => b.data.ballot.address === address);
        setAccountVoteData(votes);
        setCanVote(votes.length === 0 ? true : false);

      })
      .catch(err => {
        console.log(err);
      });
  }, [id]);

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
          />
        )}
        <Distribute
          dbInstance={db}
          partyData={partyData}
          address={address}
          userSigner={userSigner}
          writeContracts={writeContracts}
          tx={tx}
        />
      </Box>
    </Box>
  );
}
