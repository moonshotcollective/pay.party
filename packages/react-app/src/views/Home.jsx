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

function Home({ tx, readContracts, writeContracts, mainnetProvider, address }) {
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
    if (readContracts && readContracts.Diplomat) {
      (async () => {
        await init();
      })();
    }
  }, [readContracts, address]);

  useEffect(() => {
    (async () => {
      if (qdipHandler) {
        console.log("rerendered ");
        setIsLoading(true);
        let { idx, ceramic } = await qdipHandler.makeCeramic();
        let electionsMap = await qdipHandler.getElections(ceramic, idx);
        console.log({ electionsMap });
        setElectionsMap(electionsMap);
        setIsLoading(false);
      }
    })();
  }, [qdipHandler]);

  /***** Methods *****/
  const init = async () => {
    console.log(address);
    if (address) {
      setQdipHandler(BaseHandler(tx, readContracts, writeContracts, mainnetProvider, address));
    }
  };
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

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
              <TabListItem title="Elections I'm part of" />
              <TabListItem title="My Elections" />
            </TabList>
            <TabPanels>
              <TabPanel>
                {Array.from(electionsMap.values()).some(election => election.tags.includes("candidate")) ? (
                  <SimpleGrid columns={3} spacing={10} justifyItems="center">
                    {Array.from(electionsMap.values())
                      .reverse()
                      .map(
                        (election, idx) =>
                          election.tags.includes("candidate") && (
                            <ElectionCard
                              id={election.id}
                              key={idx}
                              name={election.name}
                              owner={election.creator}
                              voted={`${election.n_voted.n_voted} / ${election.n_voted.outOf}`}
                              active={election.active}
                              amount={fromWei(election.amtFromWei || "0")}
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
                    <HStack spacing={4} justifyContent="space-between">
                      <Heading fontSize="1.0rem" color="violet.50">
                        You are not part of any elections.
                      </Heading>
                    </HStack>
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
                                amount={fromWei(election.amtFromWei)}
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
