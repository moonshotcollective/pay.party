import { Button, IconButton } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, HStack, SimpleGrid } from "@chakra-ui/layout";
import { TabList, TabPanel, TabPanels, Spinner, Tabs, Text, Center } from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import React, { useEffect, useState, useMemo} from "react";
import { useHistory, Link } from "react-router-dom";
import Container from "../../components/layout/Container";
import ElectionCard from "../../components/Cards/ElectionCard";
import BaseHandler from "../../dips/baseHandler";
import { fromWei } from "web3-utils";
import CenteredFrame from "../../components/layout/CenteredFrame";
import { getAllCeramicElections, newSerializeCeramicElection } from "../../dips/helpers";
import MongoDbController from "../../controllers/mongodbController";
import {Space, Card, Tag} from "antd"

function Home({ address, mainnetProvider, tx, readContracts, writeContracts, targetNetwork }) {

  /***** Load Data from db *****/ 
  const [data, setData] = useState(null);
  const db = new MongoDbController();
  useEffect(() => {
    db.fetchAllParties()
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  
  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const headingColor = useColorModeValue("yellow.600", "yellow.500");

  const cards = useMemo(() => {
    return (
      data &&
      data.map((d) => (
        <Space wrap size={[8, 16]} align="baseline" key={`${d._id}-space`}>
          <div style={{ padding: 16 }} key={`${d._id}-div`}>
            <Box style={{ width: '80vw' }}borderWidth='1px'>

              <p>{`Id: ${d._id}`}</p>
              <Link
                  to={`/party/${d._id}`}
                  onClick={() => {
                    routeHistory.push(`/party/${d._id}`);
                  }}>
                  View
                </Link>
              <p>{d.name}</p>
              <p>{d.desc}</p>
            </Box>
          </div>
        </Space>
      ))
    );
  }, [data]);

  const createElection = () => {
    routeHistory.push('/create')
  }

  return (
    <Container>
      <HStack w="full" justifyContent="space-between">
        <Heading fontSize="1.5rem" color={headingColor}>
          Parties
        </Heading>
        <Box pr={40}>
          <Button onClick={createElection} rightIcon={<AddIcon />}>
            Create Party
          </Button>
        </Box>
      </HStack>
      {cards}
    </Container>
  );
}

export default Home;
