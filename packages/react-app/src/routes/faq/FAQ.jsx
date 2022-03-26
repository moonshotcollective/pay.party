import { Button } from "@chakra-ui/button";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, Spacer, Flex } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Wrap, WrapItem, Stack, Center, Text, Input } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory, Link } from "react-router-dom";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { CloseButton } from "@chakra-ui/react";

function FAQ({
  address,
  mainnetProvider,
  tx,
  readContracts,
  writeContracts,
  targetNetwork,
  setPartyName,
  partyName,
  partyJson,
  setPartyJson,
}) {
  /***** Load Data from db *****/
  const [data, setdata] = useState(null);
  const [id, setId] = useState(null);
  const [isInvalidId, setIsInvalidId] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  useEffect(_ => {
    (async _ => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/parties`);
      const data = await res.json();
      setPartyJson(data);
      return data;
    })();
  }, []);

  /***** Routes *****/
  const routeHistory = useHistory();

  /***** States *****/
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");


  return (
    <Center pt={10}>
      <Box borderWidth={1} borderRadius={24} shadow="xl" pl={10} pr={10} pb={6} pt={2}>
        <Center>
          <Text fontSize="xl" fontWeight="semibold" pt={6} pb={6} pr={3}>
            Frequently Asked Questions
          </Text>
          <Text fontSize="2xl" fontWeight="semibold" pt={1}>
            🎊
          </Text>
        </Center>
      </Box>
    </Center>
  );
}

export default FAQ;
