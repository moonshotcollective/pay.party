import {
  Box,
  Button,
  Textarea,
  HStack,
  Text,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spacer,
  Center,
  Divider,
} from "@chakra-ui/react";
import React, { useState, useMemo, useEffect } from "react";
import AddressChakra from "../../../components/AddressChakra";

export const View = ({ dbInstance, partyData, address, userSigner, targetNetwork, readContracts, mainnetProvider }) => {
//   const castVotes = partyData?.ballots?.filter(b => b.data.ballot.address === address)[0].data.ballot.votes;
  const candidates = useMemo(() => {
    // let n = castVotes ? JSON.parse(castVotes) : {};
    return partyData?.candidates.map(d => {
      return (
        <Box>
          <HStack pt={2} key={`score-${d}`}>
            <AddressChakra
              address={d}
              ensProvider={mainnetProvider}
              // blockExplorer={blockExplorer}
            />
            <Spacer />
            <>{666}</>
          </HStack>
          <Divider pt={2} />
        </Box>
      );
    });
  }, [partyData]);

  return (
    <Box borderWidth={"1px"}>
      <Center pt={4}>
        <Text fontSize="lg">Party</Text>
      </Center>
      <Box pl={"12%"} pr="12%">
        <Divider />
        {candidates}
        <Center padding={4}></Center>
      </Box>
    </Box>
  );
};
