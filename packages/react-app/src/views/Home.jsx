import { Button, IconButton } from "@chakra-ui/button";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, HStack, SimpleGrid } from "@chakra-ui/layout";
import { Divider, Tab, TabList, TabPanel, TabPanels, Spinner, Tabs, Text, Center } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import Container from "../components/layout/Container";
import TabListItem from "../components/Tabs/TabListItem";
import ElectionCard from "../components/Cards/ElectionCard";

import BaseHandler from "../dips/baseHandler";
import { fromWei, toBN } from "web3-utils";
import CenteredFrame from "../components/layout/CenteredFrame";
import { getAllCeramicElections, newSerializeCeramicElection } from "../dips/helpers";
import { Web3Context } from "../helpers/Web3Context";

function Home({
  address,
  mainnetProvider,
  localProvider,
  mainnetContracts,
  userSigner,
  yourLocalBalance,
  price,
  tx,
  signer,
  readContracts,
  writeContracts,
  targetNetwork,
  contract,
}) {
  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const [selectedQdip, setSelectedQdip] = useState("base");
  const [ceramic, setCeramic] = useState();
  const [qdipHandler, setQdipHandler] = useState();
  const [electionsMap, setElectionsMap] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const createElection = () => {
    routeHistory.push("/create");
  };
  /***** Effects *****/
  useEffect(() => {
    if (readContracts && readContracts.Diplomat && targetNetwork) {
      (async () => {
        // console.log("INIT HOME");
        await init();
      })();
    }
  }, [readContracts, address, targetNetwork]);

  useEffect(() => {
    (async () => {
      if (qdipHandler) {
        // console.log("rerendered ");
        setIsLoading(true);
        let { idx, ceramic } = await qdipHandler.makeCeramic();
        const elections = await getAllCeramicElections(readContracts.Diplomat, ceramic);
        const sElecs = await Promise.all(
          Object.entries(elections).map(([id, elec]) =>
            newSerializeCeramicElection({ id, electionDoc: elec, address, ceramic, idx, targetNetwork }),
          ),
        );
        const electionsMap = new Map();
        sElecs.forEach(elec => electionsMap.set(elec.id, elec));
        // console.log({ electionsMap });
        setElectionsMap(electionsMap);
        setIsLoading(false);
      }
    })();
  }, [qdipHandler]);

  /***** Methods *****/
  const init = async () => {
    // console.log(address);
    if (address) {
      setQdipHandler(
        BaseHandler(tx, readContracts, writeContracts, mainnetProvider, address, undefined, targetNetwork),
      );
    }
  };
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  return (
    <Container>
      <HStack w="full" justifyContent="space-between">
        <Heading fontSize="1.5rem" color={headingColor}>
          Elections
        </Heading>
        <Box pr={40}>
          <Button onClick={createElection} rightIcon={<AddIcon />}>
            Create Election
          </Button>
        </Box>
      </HStack>

      {isLoading || !electionsMap ? (
        <CenteredFrame>
          <Flex flexDirection="column" justifyContent="center" alignItems="center">
            <Heading fontSize="1.5rem" color={headingColor}>
              Loading elections...
            </Heading>
            <Spinner color="purple.700" size="xl" />
          </Flex>
        </CenteredFrame>
      ) : (
        <HStack w="full" justifyContent="space-between">
          <Tabs py="1rem" variant="unstyled">
            <TabList>
              {/* <TabListItem title="" /> */}
              {/* <TabListItem title="Manage" /> */}
            </TabList>
            <TabPanels>
              <TabPanel>
                {Array.from(electionsMap.values()).some(election => election.tags.includes("voter")) ? (
                  <SimpleGrid columns={3} spacing={10} justifyItems="center">
                    {Array.from(electionsMap.values())
                      .reverse()
                      .map(
                        (election, idx) =>
                          election.tags.includes("voter") && (
                            <ElectionCard
                              id={election.id}
                              key={idx}
                              name={election.name}
                              owner={election.creator}
                              voted={`${election.n_voted.n_voted} / ${election.n_voted.outOf}`}
                              active={election.active}
                              amount={fromWei(election.fundAmountInWei || "0")}
                              tokenSymbol={election.tokenSymbol}
                              createdAt={election.created_date}
                              mainnetProvider={mainnetProvider}
                            />
                          ),
                      )}
                  </SimpleGrid>
                ) : (
                  <Box
                    borderColor="purple.500"
                    borderWidth="1px"
                    borderRadius="8px"
                    py="1.5rem"
                    px="2.5rem"
                    width="100%"
                  >
                    {/* <HStack spacing={4} justifyContent="space-between"> */}
                    <Heading fontSize="1.0rem" color="violet.50">
                      You are not part of any elections.
                    </Heading>

                    <Center>
                      <IconButton
                        aria-label="Create Election"
                        icon={<AddIcon />}
                        onClick={createElection}
                        variant="ghost"
                        size="lg"
                      />
                    </Center>
                    {/* </HStack> */}
                  </Box>
                )}
              </TabPanel>
              <TabPanel>
                {Array.from(electionsMap.values()).some(election => election.tags.includes("admin")) ? (
                  <SimpleGrid columns={3} spacing={10} justifyItems="center">
                    {electionsMap &&
                      Array.from(electionsMap.values())
                        .reverse()
                        .map(
                          (election, idx) =>
                            election.tags.includes("admin") && (
                              <ElectionCard
                                id={election.id}
                                key={idx}
                                name={election.name}
                                owner={election.creator}
                                tokenSymbol={election.tokenSymbol}
                                voted={`${election.n_voted.n_voted} / ${election.n_voted.outOf}`}
                                active={election.active}
                                isPaid={election.isPaid}
                                amount={fromWei(election.fundAmountInWei)}
                                createdAt={election.created_date}
                              />
                            ),
                        )}
                  </SimpleGrid>
                ) : (
                  <Box
                    borderColor="purple.500"
                    borderWidth="1px"
                    borderRadius="8px"
                    py="1.5rem"
                    px="2.5rem"
                    width="100%"
                  >
                    <HStack spacing={4} justifyContent="space-between">
                      <Heading fontSize="1.0rem" color="violet.50">
                        You don't have any elections.
                      </Heading>
                    </HStack>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </HStack>
      )}
    </Container>
  );
}

export default Home;
