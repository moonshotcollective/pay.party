import {
  Box,
  HStack,
  Text,
  Spacer,
  Center,
  Divider,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
} from "@chakra-ui/react";
import React, { useState, useMemo, useEffect } from "react";
import AddressChakra from "../../../components/AddressChakra";

export const View = ({
  partyData,
  mainnetProvider,
  votesData,
}) => {
  const [castVotes, setCastVotes] = useState(null);

  useEffect(() => {
    const scores = votesData && votesData[0] && JSON.parse(votesData[0].data.ballot.votes);
    setCastVotes(scores);
  }, [votesData]);

  const candidateRows = useMemo(() => {
    const row =
      partyData &&
      partyData.candidates &&
      partyData.candidates.map(d => {
        return (
          <Tbody>
            <Tr>
              <Td>
                <AddressChakra
                  address={d}
                  ensProvider={mainnetProvider}
                  // blockExplorer={blockExplorer}
                />
              </Td>
              <Td>{castVotes && castVotes[d]}</Td>
            </Tr>
          </Tbody>
        );
      });
    return row;
  }, [partyData, castVotes]);

  return (
    <Box borderWidth={"1px"}>
      <Center pt={4}>
        <Text fontSize="lg">Party</Text>
      </Center>
      <Table pr={2} pl={2}>
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>Score</Th>
          </Tr>
        </Thead>
        {candidateRows}
      </Table>
    </Box>
  );
};
