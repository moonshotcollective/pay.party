import { Button } from "@chakra-ui/button";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, Spacer, Flex } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Wrap, WrapItem, Stack, Center, Text, Input } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory, Link } from "react-router-dom";
import { PartyCard, EmptyCard, PartyTable } from "./components";

function Home({ address, mainnetProvider, tx, readContracts, writeContracts, targetNetwork }) {
  /***** Load Data from db *****/
  const [data, setdata] = useState(null);
  const [id, setId] = useState(null);
  const [isInvalidId, setIsInvalidId] = useState(null);

  // useEffect(() => {
  //   (async () => {
  //     const res = await fetch(`${process.env.REACT_APP_API_URL}/parties`);
  //     const data = await res.json();
  //     setData(data);
  //     return res;
  //   })();
  // }, []);
  //
  const fetchParties = _ => {
    (async () => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/parties`);
      const data = await res.json();
      setData(data);
      return res;
    })();
  };

  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");

  // TODO: Implement a sortable table
  // const cards = useMemo(() => {
  //   let c =
  //     data &&
  //     data.map(d => (
  //       <Box p="2" pr="10" key={`party-${d.id}`}>
  //         <PartyCard name={d.name} desc={d.description} id={d.id} />
  //       </Box>
  //     ));

  //   return c;
  // }, [data]);

  const createParty = _ => {
    routeHistory.push("/create");
  };

  const joinParty = async id => {
    //fetchParties();

    try {
      // Fetch the party
      const res = await fetch(`${process.env.REACT_APP_API_URL}/party/${id}`);
      const data = await res.json();
      routeHistory.push(`/party/${id}`);
      //setData(data);
      //return res;

      if (data) {
        console.log(data);
      }
    } catch (err) {
      setIsInvalidId(true);
      console.log(err);
    }
    // routeHistory.push(`/party/${id}`);
  };

  // return (
  //   <Box>
  //     <HStack>
  //       <Heading pl={2} as="h1" size="md" color={headingColor}>
  //         All Parties
  //       </Heading>
  //       <Spacer />
  //       <Button onClick={createElection} rightIcon={<AddIcon />} size="lg" variant="ghost">
  //         Create Party
  //       </Button>
  //     </HStack>
  //     <Center>
  //       {/* <Stack>{cards && cards.length > 0 ? cards : <EmptyCard />}</Stack> */}
  //     <PartyTable parties={data} />
  //     </Center>
  //   </Box>
  // );
  //

  return (
    <Center>
      <Box borderWidth={1} borderRadius={24} shadow="xl" p={10}>
        <Center>
          <Text fontSize="xl" fontWeight="semibold" p={6}>
            Join the party
          </Text>
        </Center>
        <Box bg="whiteAlpha.800" borderRadius={24}>
          <Input
            variant="unstyled"
            p={6}
            isInvalid={isInvalidId}
            placeholder="Party name"
            onChange={e => setId(e.target.value)}
          ></Input>
        </Box>
        <Center>
          <Box p={2}>
            <Button
              rightIcon={<CheckIcon />}
              onClick={_ => {
                if (id) {
                  joinParty(id);
                }
              }}
            >
              Join Party
            </Button>
          </Box>
          <Box p={2}>
            <Button onClick={createParty} rightIcon={<AddIcon />} size="lg" variant="ghost">
              Create Party
            </Button>
          </Box>
        </Center>
      </Box>
    </Center>
  );
}

export default Home;
