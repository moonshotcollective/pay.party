import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  Center,
  Menu,
  MenuOptionGroup,
  MenuButton,
  MenuList,
  MenuItemOption,
  Spacer,
  Text,
  HStack,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useParams, useHistory } from "react-router-dom";
import MongoDBController from "../../controllers/mongodbController";
import { VoteTable, ViewTable, ReceiptsTable, Distribute, Metadata } from "./components";

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
  const [strategy, setStrategy] = useState("linear");
  const [isPaid, setIsPaid] = useState(false);

  const db = new MongoDBController();

  useEffect(async () => {
    db.fetchParty(id)
      .then(res => {
        setPartyData(res.data);
        const votes = res?.data?.ballots?.filter(b => b.data.ballot.address === address);
        const participating = res.data.participants.includes(address);
        setAccountVoteData(votes);
        setCanVote(votes.length === 0 && participating ? true : false);
        setIsParticipant(participating);
        setIsPaid(res.data.receipts.length > 0);
      })
      .catch(err => {
        console.log(err);
      });
  }, [id]);

  // Calculate percent distribution from submitted ballots
  const calcDistribution = () => {
    if (partyData && partyData.ballots && partyData.ballots.length > 0) {
      const votes = partyData.ballots.map(b => JSON.parse(b.data.ballot.votes.replace(/[ \n\r]/g, "")));
      let sum = 0;
      let processed = [];
      // let strategy = partyData.config.strategy;
      if (!strategy || strategy === "") {
        strategy = "linear";
        console.log("Reverted to linear strategy");
      }
      for (let i = 0; i < partyData.candidates.length; i++) {
        const candidate = partyData.candidates[i];
        // Strategy handling
        // TODO: Switch statement
        if (strategy === "linear") {
          let c = votes.reduce((total, vote) => vote[candidate] + total, 0);
          sum += c;
          processed.push({ address: candidate, reduced: c });
        } else if (strategy === "quadratic") {
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

  const StrategySelect = () => {
    return (
      <Menu closeOnSelect={false}>
        <MenuButton as={Button} variant="link" rightIcon={<ChevronDownIcon />}>
          {strategy}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup title="select strategy" type="radio" onChange={e => setStrategy(e)}>
            <MenuItemOption key="linear-select" value="linear">
              Linear
            </MenuItemOption>
            ,
            <MenuItemOption key="quadratic-select" value="quadratic">
              Quadratic
            </MenuItemOption>
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    );
  };

  // Calculate the distribution on load
  useEffect(() => {
    calcDistribution();
  }, [partyData, strategy]);

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
      {/* <Button
        size="lg"
        variant="ghost"
        onClick={() => {
          showDebug ? setShowDebug(false) : setShowDebug(true);
        }}
      >
        Debug
      </Button> */}
      <Center p="5">
        <Box borderWidth={"1px"} shadow="xl" rounded="md" p="10" w="4xl">
          {showDebug && <p>{JSON.stringify(partyData)}</p>}
          <Metadata
            partyData={partyData}
            mainnetProvider={mainnetProvider}
            votesData={accountVoteData}
            distribution={distribution}
            strategy={strategy}
          />
          {canVote ? (
            <VoteTable
              dbInstance={db}
              partyData={partyData}
              address={address}
              userSigner={userSigner}
              targetNetwork={targetNetwork}
              readContracts={readContracts}
              mainnetProvider={mainnetProvider}
            />
          ) : (
            <Box>
              <Center pb="2" pt="3">
                <Text pr="3">Strategy:</Text>
                <StrategySelect />
              </Center>
              <ViewTable
                partyData={partyData}
                mainnetProvider={mainnetProvider}
                votesData={accountVoteData}
                distribution={distribution}
                strategy={strategy}
              />
            </Box>
          )}
          <Distribute
            dbInstance={db}
            partyData={partyData}
            address={address}
            userSigner={userSigner}
            writeContracts={writeContracts}
            readContracts={readContracts}
            tx={tx}
            distribution={distribution}
            strategy={strategy}
          />
          {isPaid && <ReceiptsTable partyData={partyData} />}
        </Box>
      </Center>
    </Box>
  );
}
