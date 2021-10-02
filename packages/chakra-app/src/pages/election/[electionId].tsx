import { Box, Button, Grid, GridItem } from "@chakra-ui/react";
import DistributionCard from "components/Cards/DistributionCard";
import Container from "components/layout/Container";
import { useRouter } from "next/router";
import React, { useState } from "react";

import SideCard from "../../components/Cards/SideCard";
import VoteCard from "../../components/Cards/VoterCards/VoteCard";

// export async function getStaticPaths() {
//   const paths = [
//     { params: { id: "one" } },
//     { params: { id: "two" } },
//     { params: { id: "three" } },
//   ];
//   return {
//     paths,
//     fallback: false,
//   };
// }
// export async function getStaticProps({ params }) {
//   return {
//     props: {
//       electionId: params.id,
//     },
//   };
// }
function Election() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  function getElectionId() {
    console.log(router.query.electionId);
  }
  return (
    <Container>
      <Grid w="full" templateColumns="repeat(3, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <SideCard />
        </GridItem>
        <GridItem colSpan={2}>
          <Box
            w="full"
            pt="1rem"
            align="end"
            borderColor="purple.500"
            borderWidth="1px"
            borderRadius="8px"
            py="3rem"
            px="2.5rem"
          >
            {submitted === false ? (
              <>
                <VoteCard />
                <Box w="full" pt="1rem" align="end">
                  <Button
                    ml="0.5rem"
                    onClick={() => {
                      console.log("submitted true");
                      setSubmitted(true);
                    }}
                    px="1.25rem"
                    fontSize="md"
                  >
                    Submit
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <DistributionCard />
                {/* TO BE REMOVED AFTER BACKEND INTEGRATION */}
                <Box w="full" pt="1rem" align="end">
                  <Button
                    ml="0.5rem"
                    onClick={() => {
                      console.log("submitted false");
                      setSubmitted(false);
                    }}
                    px="1.25rem"
                    fontSize="md"
                  >
                    Go to Vote
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
}

export default Election;
