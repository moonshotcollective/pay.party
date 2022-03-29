import { Button } from "@chakra-ui/button";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, Spacer, Flex } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Wrap, WrapItem, Stack, Center, Text, Input } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory, Link } from "react-router-dom";
import { PartyCard, EmptyCard, PartyTable, MyParties } from "./components";
import { Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { CloseButton } from "@chakra-ui/react";
import { CopyIcon, ExternalLinkIcon } from "@chakra-ui/icons";

function Home({
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

  /***** Create a party *****/
  const createParty = _ => {
    setPartyName(id);
    routeHistory.push("/create");
  };

  /** Cards ***/
  const cards = useMemo(() => {
    let c =
      partyJson &&
      partyJson.filter(p => {
        return p.participants.some(q => {
          return q.toLowerCase() === address.toLowerCase();
        });
      });
    let d =
      partyJson &&
      partyJson.filter(p => {
        return p.candidates.some(q => {
          return q.toLowerCase() === address.toLowerCase();
        });
      });

    if (c != null && d != null) {
      c = c.concat(d);
      var initial = c;
      var final = [];
      for (var i = 0, l = initial.length; i < l; i++) {
        var unique = true;
        for (var j = 0, k = final.length; j < k; j++) {
          if (initial[i].id === final[j].id) {
            unique = false;
          }
        }
        if (unique) {
          final.push(initial[i]);
        }
      }
    }
    setFilteredData(final);
  }, [partyJson]);

  /***** Join a party from ID *****/
  const joinParty = async id => {
    try {
      setIsLoading(true);
      const parties = partyJson;
      const match = parties.filter(p => {
        return p.name === id || p.id === id;
      });
      if (match.length === 1) {
        routeHistory.push(`/party/${match[0].id}`);
      } else {
        setIsInvalidId(true);
      }
      setIsLoading(false);
    } catch (err) {
      setIsInvalidId(true);
      setIsLoading(false);
      console.log(err);
    }
  };

  const alertInvalidId = _ => {
    return isInvalidId ? (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle mr={2}>Invalid Party!</AlertTitle>
        <CloseButton position="absolute" right="8px" top="8px" onClick={_ => setIsInvalidId(false)} />
      </Alert>
    ) : null;
  };

  return (
    <>
      <Center pt={10}>
        <Box borderWidth={1} borderRadius={24} shadow="xl" pl={10} pr={10} pb={6} pt={2}>
          <Center>
            <Text fontSize="xl" fontWeight="semibold" pt={6} pb={6} pr={3}>
              Join the party
            </Text>
            <Text fontSize="2xl" fontWeight="semibold" pt={1}>
              🎊
            </Text>
          </Center>
          <Box bg={useColorModeValue("whiteAlpha.900", "purple.900")} borderRadius={24}>
            {alertInvalidId()}
            <Input
              variant="unstyled"
              p={6}
              isInvalid={isInvalidId}
              placeholder="Party Name or UID"
              onChange={e => setId(e.target.value)}
            ></Input>
          </Box>
          <Center pt={4}>
            <Box pt={4} pr={2}>
              <Button onClick={createParty} rightIcon={<AddIcon />} size="lg" variant="outline">
                Create Party
              </Button>
            </Box>
            <Text pt="1em">or</Text>
            <Box pt={4} pl={2}>
              <Button
                isLoading={isLoading}
                size="lg"
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
          </Center>
        </Box>
      </Center>
        <MyParties data={filteredData} />
    </>
  );
}

export default Home;
