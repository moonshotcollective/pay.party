import {Box, Button} from "@chakra-ui/react";
import { useHistory, Link } from "react-router-dom";

export const EmptyCard = ({}) => {
const routeHistory = useHistory();
    return ( 
        <Box borderWidth="1px" key={`box-create`}>
        <p>No Parties.</p>
        <Button
          variant="link"
          to={`/create`}
          onClick={() => {
            routeHistory.push(`/create`);
          }}
        >
          Create
        </Button>
      </Box>
    )
}