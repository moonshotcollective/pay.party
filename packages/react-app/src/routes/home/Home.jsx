import { Button } from "@chakra-ui/button";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, Spacer } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory, Link } from "react-router-dom";
import MongoDbController from "../../controllers/mongodbController";
import { Space } from "antd";

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
        // <Space wrap size={[8, 16]} align="baseline" key={`${d._id}-space`}>
        //   <div style={{ padding: 16 }} key={`${d._id}-div`}>
        <Box borderWidth="1px">
          <p>{`Id: ${d._id}`}</p>
          <Link
            to={`/party/${d._id}`}
            onClick={() => {
              routeHistory.push(`/party/${d._id}`);
            }}
          >
            View
          </Link>
          <p>{d.name}</p>
          <p>{d.desc}</p>
        </Box>
        //   </div>
        // </Space>
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
        <Button onClick={createElection} leftIcon={<AddIcon />} size="lg" variant="ghost">
          Create Party
        </Button>
      </HStack>
      <Box>{cards}</Box>
    </Box>
  );
}

export default Home;
