import { Table, Thead, Tbody, Tr, Th, Td, chakra, Spinner, Box, Button, Text } from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { useTable, useSortBy, usePagination } from "react-table";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory, Link } from "react-router-dom";

export const PartyTable = ({ parties }) => {
  const routeHistory = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const data = useMemo(() => {
    //console.log(parties);
    if (parties) {
      setIsLoading(false);

      return parties;
    } else {
      setIsLoading(true);
      return [];
    }
  }, [parties]);

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: ({ name }) => (
          <Text fontSize="lg" fontWeight="semibold" isTruncated minW="10vw" maxW="28vw">
            {name}
          </Text>
        ),
      },
      {
        Header: "Description",
        accessor: ({ description }) => (
          <Text isTruncated minW="10vw" maxW="20vw">
            {description}
          </Text>
        ),
      },
      {
        Header: " ",
        accessor: ({ id }) => {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                routeHistory.push(`/party/${id}`);
              }}
            >
              View
            </Button>
          );
        },
      },
    ],
    [isLoading],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [
          {
            desc: false,
          },
        ],
      },
    },
    useSortBy,
    usePagination,
  );

  return !isLoading ? 
    (parties.length > 0 ? (
    <Box borderWidth="1px" borderRadius={24} p={6} shadow="xl">
      <Box borderWidth="1px">
        <Table {...getTableProps()} maxW="calc(100%)">
          <Thead>
            {headerGroups.map(headerGroup => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <Th {...column.getHeaderProps(column.getSortByToggleProps())} isNumeric={column.isNumeric}>
                    {column.render("Header")}
                    <chakra.span pl="4">
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <TriangleDownIcon aria-label="sorted descending" />
                        ) : (
                          <TriangleUpIcon aria-label="sorted ascending" />
                        )
                      ) : null}
                    </chakra.span>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <Td {...cell.getCellProps()} isNumeric={cell.column.isNumeric}>
                        {cell.render("Cell")}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  ) : (<Text>You are not part of any parties yet!</Text>)) : (
    <Spinner size='xl'/>
  );
};
