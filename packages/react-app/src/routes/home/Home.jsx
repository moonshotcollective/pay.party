import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, Spacer, Flex } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Wrap, WrapItem, Stack, Center } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory, Link } from "react-router-dom";
import { PartyCard, EmptyCard } from "./components";

function Home({ address, mainnetProvider, tx, readContracts, writeContracts, targetNetwork }) {
  /***** Load Data from db *****/
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/parties`);
      const data = await res.json();
      setData(data);
      return res;
    })();
  }, []);

  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");

  // TODO: Implement a sortable table
  const cards = useMemo(() => {
    let c =
      data &&
      data.map(d => (
        <Box p="2" pr="10" key={`party-${d.id}`}>
          <PartyCard name={d.name} desc={d.description} id={d.id} />
        </Box>
      ));

    return c;
  }, [data]);

  const createElection = () => {
    routeHistory.push("/create");
  };

  return (
    <Box>
      <HStack>
        <Heading pl={2} as="h1" size="md" color={headingColor}>
          All Parties
        </Heading>
        <Spacer />
        <Button onClick={createElection} rightIcon={<AddIcon />} size="lg" variant="ghost">
          Create Party
        </Button>
      </HStack>
      <Center>
        <Stack>{cards && cards.length > 0 ? cards : <EmptyCard />}</Stack>
      </Center>
    </Box>
  );
}

export default Home;
