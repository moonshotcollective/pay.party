import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, SimpleGrid } from "@chakra-ui/layout";
import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Container from "../components/layout/Container";
import TabListItem from "../components/Tabs/TabListItem";
import ElectionCard from "../components/Cards/ElectionCard";

import dips from "../dips";
import { serverUrl } from "../dips/offChain";
import { fromWei, toBN } from "web3-utils";

function MockHome({ tx, readContracts, writeContracts, mainnetProvider, address }) {
  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("onChain");
  const [qdipHandler, setQdipHandler] = useState();
  const [electionsMap, setElectionsMap] = useState();
  const [tableDataLoading, setTableDataLoading] = useState(false);

  const viewElection = record => {
    // console.log({ record });
    routeHistory.push("/vote/" + record.id);
  };

  const createElection = () => {
    routeHistory.push("/create");
  };
  /***** Effects *****/
  useEffect(() => {
    if (readContracts && readContracts.Diplomat) {
      (async () => {
        await init();
      })();
    }
  }, [readContracts, address]);

  useEffect(() => {
    if (qdipHandler) {
      console.log("rerendered");
      const contract = readContracts.Diplomat;
      console.log(contract);
      (async () => {
        const numElections = await contract.electionCount();
        console.log({ numElections, n: numElections.toNumber() });
        const newElectionsMap = new Map();
        for await (const iterator of [...Array(numElections.toNumber()).keys()]) {
          console.log(iterator);
          const election = await contract.getElection(iterator);
          if (election) {
            console.log(iterator, election);
            let electionEntry = {
              n_voted: { outOf: election.candidates.length },
            };
            let hasVoted = false;
            let isActive = false;
            if (election && election.kind === "onChain") {
              hasVoted = await contract.getAddressVoted(iterator, address);
              isActive = election.active;
              console.log({ hasVoted });
              const electionVoted = await contract.getElectionNumVoted(iterator);
              console.log({ electionVoted });
              electionEntry.n_voted = {
                ...electionEntry.n_voted,
                n_voted: electionVoted.toNumber(),
              };
              console.log("end onChain", iterator, electionVoted);
            }
            if (election && election.kind === "offChain") {
              try {
                const votedResult = await axios.get(serverUrl + `distribution/state/${iterator}/${address}`);
                hasVoted = votedResult.data.hasVoted;
                isActive = votedResult.data.isActive;
                const offChainElectionResult = await axios.get(serverUrl + `distribution/${iterator}`);
                const { election: offChainElection } = offChainElectionResult.data;
                const nVoted = Object.keys(offChainElection.votes).length;
                electionEntry.n_voted = {
                  ...electionEntry.n_voted,
                  n_voted: nVoted,
                };
              } catch (error) {
                console.log("offChain get elections error", error);
              }
            }
            const tags = [];
            if (election.creator === address) {
              tags.push("admin");
            }
            if (election.candidates.includes(address)) {
              tags.push("candidate");
            }
            if (hasVoted) {
              tags.push("voted");
            }
            let status = isActive;
            let created = new Date(election.date * 1000).toISOString().substring(0, 10);
            electionEntry = {
              ...electionEntry,
              id: iterator,
              created_date: created,
              amount: fromWei(election.amount.toString(), "ether"),
              // TODO: use token symbol
              token: "",
              name: election.name,
              creator: election.creator,
              status: status,
              tags: tags,
            };
            newElectionsMap.set(iterator, electionEntry);
            console.log(newElectionsMap);
            setElectionsMap(newElectionsMap);
          }
        }
      })();
    }
  }, [qdipHandler]);
  console.log({ electionsMap });
  /***** Methods *****/
  const init = async () => {
    setQdipHandler(dips[selectedQdip].handler(tx, readContracts, writeContracts, mainnetProvider, address));
  };
  const headingColor = useColorModeValue("yellow.600", "yellow.500");
  // const createElection = () => {
  //   routeHistory.push("/mockcreate");
  // };
  return (
    <Container>
      <HStack w="full" justifyContent="space-between">
        <Heading fontSize="1.5rem" color={headingColor}>
          Elections
        </Heading>
        <Box>
          <Button onClick={createElection} rightIcon={<AddIcon />}>
            Create Election
          </Button>
        </Box>
      </HStack>

      <HStack w="full" justifyContent="space-between">
        <Tabs py="2rem" variant="unstyled">
          <TabList>
            <TabListItem title="Elections I'm part of" />
            <TabListItem title="My Elections" />
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={3} spacing={10} justifyItems="center">
                {electionsMap &&
                  Array.from(electionsMap.values())
                    .reverse()
                    .map(
                      election =>
                        election.tags.includes("candidate") && (
                          <ElectionCard
                            id={election.id}
                            name={election.name}
                            owner={election.creator}
                            voted={`${election.n_voted.n_voted} / ${election.n_voted.outOf}`}
                            status={election.status}
                            amount={election.amount}
                            createdAt={election.created_date}
                          />
                        ),
                    )}
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <SimpleGrid columns={3} spacing={10} justifyItems="center">
                {electionsMap &&
                  Array.from(electionsMap.values())
                    .reverse()
                    .map(
                      election =>
                        election.tags.includes("admin") && (
                          <ElectionCard
                            id={election.id}
                            name={election.name}
                            owner={election.creator}
                            voted={`${election.n_voted.n_voted} / ${election.n_voted.outOf}`}
                            status={election.status}
                            amount={election.amount}
                            createdAt={election.created_date}
                          />
                        ),
                    )}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </HStack>
    </Container>
  );
}

export default MockHome;
