import { Box, Center, Table, Thead, Tbody, Tfoot, Tr, Th, Td } from "@chakra-ui/react";
import React, { useState, useMemo } from "react";
import AddressChakra from "../../../components/AddressChakra";

export const ViewTable = ({ partyData, mainnetProvider, votesData, distribution, strategy, amountToDistribute }) => {
  const [castVotes, setCastVotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const candidateRows = useMemo(() => {
    const ballotVotes = votesData && votesData[0] && JSON.parse(votesData[0].data.ballot.votes);
    const dist =
      distribution && distribution.reduce((obj, item) => Object.assign(obj, { [item.address]: item.score }), {});
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
                <Center>{ballotVotes && ballotVotes[d]}</Center>
              </Td>
              <Td>
                <Center>{!isNaN(dist[d] * 1) && dist && (dist[d] * 100).toFixed(2)}%</Center>
              </Td>
              {amountToDistribute ? (
                <Td>
                  <Center>{(dist[d] * amountToDistribute).toFixed(2)}</Center>
                </Td>
              ) : null}
            </Tr>
          </Tbody>
        );
      });

    setCastVotes(ballotVotes);
    return row;
  }, [partyData, votesData, distribution, strategy, amountToDistribute]);

  return (
    <Box>
      <Table borderWidth="1px">
        <Thead>
          <Tr>
            <Th>
              <Center>Address</Center>
            </Th>
            <Th>
              <Center>{castVotes ? "Your Ballot" : ""}</Center>
            </Th>
            <Th>
              <Center>{`Score (${strategy})`}</Center>
            </Th>
            {amountToDistribute ? (
              <Th>
                <Center>{"Payout"}</Center>
              </Th>
            ) : null}
          </Tr>
        </Thead>
        {candidateRows}
        <Tfoot></Tfoot>
      </Table>
    </Box>
  );
};
