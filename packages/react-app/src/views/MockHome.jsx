import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, SimpleGrid } from "@chakra-ui/layout";
import { Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import React from "react";

import Container from "../components/layout/Container";
import TabListItem from "../components/Tabs/TabListItem";
import ElectionCard from "../components/Cards/ElectionCard";

import { useHistory } from "react-router-dom";

function MockHome() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");
  const routeHistory = useHistory();
  const createElection = () => {
    routeHistory.push("/mockcreate");
  };
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
                <ElectionCard />
                <ElectionCard />
                <ElectionCard />
                <ElectionCard />
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <SimpleGrid columns={3} spacing={10} justifyItems="center">
                <ElectionCard />
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </HStack>
    </Container>
  );
}

export default MockHome;
