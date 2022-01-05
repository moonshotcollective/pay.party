import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, Spacer, Flex } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Wrap, WrapItem } from '@chakra-ui/react'
import React, { useEffect, useState, useMemo } from "react";
import { useHistory, Link } from "react-router-dom";
import MongoDbController from "../../controllers/mongodbController";
import { PartyCard, EmptyCard } from "./components";

function Home({ address, mainnetProvider, tx, readContracts, writeContracts, targetNetwork }) {
  /***** Load Data from db *****/
  const [data, setData] = useState(null);
  const db = new MongoDbController();
  useEffect(() => {
    db.fetchAllParties()
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const cards = useMemo(() => {
    return data && data.map(d => <WrapItem p='2'><PartyCard name={d.name} desc={d.description} id={d.id} /></WrapItem>);
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
      <Wrap>
      {
        cards && cards.length > 0 
        ? 
        cards 
        : 
        <EmptyCard />
      }
      </Wrap>
    </Box>
  );
}

export default Home;
