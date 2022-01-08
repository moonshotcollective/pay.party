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

export const ViewTable = ({ partyData, mainnetProvider, votesData, distribution, strategy }) => {
  const [castVotes, setCastVotes] = useState(null);
  const [currentDist, setCurrentDist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const scores = votesData && votesData[0] && JSON.parse(votesData[0].data.ballot.votes);
    setCastVotes(scores);
    const dist =
      distribution && distribution.reduce((obj, item) => Object.assign(obj, { [item.address]: item.score }), {});
    setCurrentDist(dist);
  }, [votesData, distribution]);

  const candidateRows = useMemo(() => {
    const row =
      partyData &&
      partyData.candidates &&
      partyData.candidates.map(d => {
        return (
          <Tbody key={`view-row-${d}`}>
            <Tr>
              <Td>
                  <AddressChakra
                  address={d}
                  ensProvider={mainnetProvider}
                  // blockExplorer={blockExplorer}
                />
              </Td>
              <Td>
                <Center>{castVotes && castVotes[d]}</Center>
              </Td>
              <Td>
                <Center>{currentDist && (currentDist[d] * 100).toFixed(0)}%</Center>
              </Td>
            </Tr>
          </Tbody>
        );
      });
    return row;
  }, [partyData, castVotes, distribution]);

  return (
    <Box>
      <Table borderWidth="1px">
        <Thead>
          <Tr>
            <Th><Center>Address</Center></Th>
            <Th><Center>{castVotes ? "Your Ballot" : " "}</Center></Th>
            <Th><Center>{`Score (${strategy})`}</Center></Th>
          </Tr>
        </Thead>
        {candidateRows}
        <Tfoot></Tfoot>
      </Table>
    </Box>
  );
};
