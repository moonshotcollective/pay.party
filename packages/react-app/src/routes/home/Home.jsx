import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, Spacer } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory, Link } from "react-router-dom";
import MongoDbController from "../../controllers/mongodbController";

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
    return (
      data &&
      data.map(d => (
        <Box borderWidth="1px" key={`box-${d.id}`}>
          <p>{`Id: ${d.id}`}</p>
          <p>{d.name}</p>
          <p>{d.desc}</p>
          <Button
            variant="link"
            to={`/party/${d.id}`}
            onClick={() => {
              routeHistory.push(`/party/${d.id}`);
            }}
          >
            View
          </Button>
        </Box>
      ))
    );
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
      <Box>{cards}</Box>
    </Box>
  );
}

export default Home;
