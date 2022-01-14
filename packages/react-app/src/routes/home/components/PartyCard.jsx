import { Box, Button, Text } from "@chakra-ui/react";
import { useHistory, Link } from "react-router-dom";

export const PartyCard = ({ name, desc, id }) => {
  const routeHistory = useHistory();
  return (
    <Box borderWidth="1px" key={`box-${id}`} rounded="md" shadow="md" p="3" w="68vw" >
      <Text fontSize="lg" fontWeight="semibold" isTruncated>
        {name}
      </Text>
      <Text fontSize="xs" color="gray.400">{`Id: ${id}`}</Text>
      <Text isTruncated>{desc}</Text>
      <Button
        variant="link"
        to={`/party/${id}`}
        onClick={() => {
          routeHistory.push(`/party/${id}`);
        }}
      >
        View
      </Button>
    </Box>
  );
};
