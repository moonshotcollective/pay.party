import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, SimpleGrid } from "@chakra-ui/layout";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import Link from "next/link";
import React from "react";

import Container from "../components/layout/Container";
import TabListItem from "../components/Tabs/TabListItem";
import ElectionCard from "../components/Cards/ElectionCard";

import { useMoralis } from "react-moralis";
import NotConnectedCard from "../components/Cards/NotConnectedCard";
import CenteredFrame from "../components/layout/CenteredFrame";
function home() {
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const { isAuthenticated } = useMoralis();
  if (!isAuthenticated) {
    return (
      <CenteredFrame>
        <NotConnectedCard />
      </CenteredFrame>
    );
  }

  return (
    <Container>
      <HStack w="full" justifyContent="space-between">
        <Heading fontSize="1.5rem" color={headingColor}>
          Elections
        </Heading>
        <Box>
          <Link href="/create-election" passHref>
            <Button rightIcon={<AddIcon />}>Create Election</Button>
          </Link>
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

export default home;
