import {Box, Button, Text} from "@chakra-ui/react";
import { useHistory, Link } from "react-router-dom";

export const EmptyCard = ({}) => {
const routeHistory = useHistory();
    return ( 
        <Box borderWidth="1px" rounded="md" shadow="md" p="5" w="sm" key={`box-create`}>
        <Text>No Parties</Text>
        <Button
          variant="link"
          to={`/create`}
          onClick={() => {
            routeHistory.push(`/create`);
          }}
        >
          Create a new party
        </Button>
      </Box>
    )
}