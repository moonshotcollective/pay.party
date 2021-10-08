import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, HStack, SimpleGrid } from "@chakra-ui/layout";
import { Divider, Tab, TabList, TabPanel, TabPanels, Spinner, Tabs, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Container from "../components/layout/Container";
import TabListItem from "../components/Tabs/TabListItem";
import ElectionCard from "../components/Cards/ElectionCard";

import BaseHandler from "../dips/baseHandler";
import { fromWei, toBN } from "web3-utils";
import CenteredFrame from "../components/layout/CenteredFrame";
import { CERAMIC_PREFIX } from "../dips/helpers";

function MockHome({ tx, readContracts, writeContracts, mainnetProvider, address }) {
  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("base");
  const [qdipHandler, setQdipHandler] = useState();
  const [electionsMap, setElectionsMap] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const viewElection = record => {
    // console.log({ record });
    const isCeramicRecord = record.id.startsWith(CERAMIC_PREFIX);
    const electionId = isCeramicRecord ? record.id.split(CERAMIC_PREFIX)[1] : record.id;
    routeHistory.push("/mockelection/" + electionId + `?kind=${isCeramicRecord ? "ceramic" : "offChain"}`);
  };

  const createElection = () => {
    routeHistory.push("/mockcreate");
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
    (async () => {
      if (qdipHandler) {
        console.log("rerendered");
        setIsLoading(true);
        let electionsMap = await qdipHandler.getElections();
        console.log({ electionsMap });
        setElectionsMap(electionsMap);
        setIsLoading(false);
        //   const contract = readContracts.Diplomat;
        //   console.log(contract);
        //   (async () => {
        //     const numElections = await contract.electionCount();
        //     console.log({ numElections, n: numElections.toNumber() });
        //     const newElectionsMap = new Map();
        //     for await (const iterator of [...Array(numElections.toNumber()).keys()]) {
        //       const election = await contract.getElection(iterator);
        //       if (election) {
        //         console.log({ election });
        //         let electionEntry = {
        //           n_voted: { outOf: election.candidates.length },
        //         };
        //         let hasVoted = false;
        //         let isActive = false;
        //         if (election && election.kind === "onChain") {
        //           hasVoted = await contract.getAddressVoted(iterator, address);
        //           isActive = election.active;
        //           console.log({ hasVoted });
        //           const electionVoted = await contract.getElectionNumVoted(iterator);
        //           console.log({ electionVoted });
        //           electionEntry.n_voted = {
        //             ...electionEntry.n_voted,
        //             n_voted: electionVoted.toNumber(),
        //           };
        //         }
        //         if (election && election.kind === "offChain") {
        //           try {
        //             const votedResult = await axios.get(serverUrl + `distribution/state/${iterator}/${address}`);
        //             console.log({ votedResult });
        //             hasVoted = votedResult.data.hasVoted;
        //             isActive = votedResult.data.isActive;
        //             const offChainElectionResult = await axios.get(serverUrl + `distribution/${iterator}`);
        //             const { election: offChainElection } = offChainElectionResult.data;
        //             const nVoted = Object.keys(offChainElection.votes).length;
        //             electionEntry.n_voted = {
        //               ...electionEntry.n_voted,
        //               n_voted: nVoted,
        //             };
        //           } catch (error) {
        //             console.log("offChain get elections error", error);
        //           }
        //         }
        //         const tags = [];
        //         if (election.creator === address) {
        //           tags.push("admin");
        //         }
        //         if (election.candidates.includes(address)) {
        //           tags.push("candidate");
        //         }
        //         if (hasVoted) {
        //           tags.push("voted");
        //         }
        //         let created = new Date(election.date * 1000).toISOString().substring(0, 10);
        //         electionEntry = {
        //           ...electionEntry,
        //           id: iterator,
        //           created_date: created,
        //           amount: fromWei(election.amount.toString(), "ether"),
        //           token: election.token,
        //           tokenSymbol: election.token === "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" ? "UNI" : "ETH",
        //           name: election.name,
        //           creator: election.creator,
        //           active: isActive,
        //           tags: tags,
        //         };
        //         newElectionsMap.set(iterator, electionEntry);
        //         console.log(newElectionsMap);
        //       }
        //     }
        //     setElectionsMap(newElectionsMap);
        //     setIsLoading(false);
        //   })();
      }
    })();
  }, [qdipHandler]);

  /***** Methods *****/
  const init = async () => {
    setQdipHandler(BaseHandler(tx, readContracts, writeContracts, mainnetProvider, address));
  };
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  return (
    <Container>
      <Divider backgroundColor="purple.500" />
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
      <Divider backgroundColor="purple.500" />

      {isLoading || !electionsMap ? (
        <CenteredFrame>
          <Flex flexDirection="column" justifyContent="center" alignItems="center">
            <Heading fontSize="1.5rem" color={headingColor}>
              Loading elections
            </Heading>
            <Spinner color="purple.700" size="xl" />
          </Flex>
        </CenteredFrame>
      ) : (
        <HStack w="full" justifyContent="space-between">
          <Tabs py="1rem" variant="unstyled">
            <TabList>
              <TabListItem title="Elections I'm part of" />
              <TabListItem title="My Elections" />
            </TabList>
            <TabPanels>
              <TabPanel>
                <SimpleGrid columns={3} spacing={10} justifyItems="center">
                  {Array.from(electionsMap.values())
                    .reverse()
                    .map(
                      election =>
                        election.tags.includes("candidate") && (
                          <ElectionCard
                            id={election.id}
                            name={election.name}
                            owner={election.creator}
                            voted={`${election.n_voted.n_voted} / ${election.n_voted.outOf}`}
                            active={election.active}
                            amount={election.amount}
                            tokenSymbol={election.tokenSymbol}
                            createdAt={election.created_date}
                            mainnetProvider={mainnetProvider}
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
                              tokenSymbol={election.tokenSymbol}
                              voted={`${election.n_voted.n_voted} / ${election.n_voted.outOf}`}
                              active={election.active}
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
      )}
    </Container>
  );
}

export default MockHome;
