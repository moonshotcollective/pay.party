import { Button } from "@chakra-ui/button";
import { AddIcon, CheckIcon } from "@chakra-ui/icons";
import { Box, Heading, HStack, Spacer, Flex } from "@chakra-ui/layout";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Wrap, WrapItem, Stack, Center, Text, Input, List, ListItem, OrderedList, UnorderedList } from "@chakra-ui/react";
import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { Alert, AlertIcon, AlertTitle, AlertDescription, Link } from "@chakra-ui/react";
import { CopyIcon, ExternalLinkIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { CloseButton } from "@chakra-ui/react";

function FAQ({
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


  return (
    <Center pt={10}>
      <Box borderWidth={1} borderRadius={24} shadow="xl" pl={10} pr={10} pb={6} pt={2}>
        <Center>
        <Button
        size="lg"
        variant="ghost"
        onClick={() => {routeHistory.push("/");}}
        leftIcon={<ArrowBackIcon />}
      	></Button>
          <Text fontSize="xl" fontWeight="semibold" pt={6} pb={6} pr={3}>
            Frequently Asked Questions
          </Text>
          <Text fontSize="2xl" fontWeight="semibold" pt={1}>
            🎊
          </Text>
        </Center>
        <Box>
        <OrderedList spacing={4}>
        <ListItem>
         <Text fontWeight="bold">
          What is Pay.Party?
        </Text>
        <Text>Pay.Party is a new DAO-native tool to pay your contributors. 
        You can create a Pay.Party, invite contributors, vote, and then distribute tokens. If you’re invited to a Pay.Party then get ready for some moo-lah!
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        Why would I use Pay.Party?
        </Text>
        <Text>
        To decide how much contributors should get paid! 
        <br /> <br />
        One of the challenges DAOs face is deciding how to pay contributors based on their contributions, without a centralized authority. 
        Pay.party solves this using contribution-based pay, meaning team members vote on each other based on their level of visible involvement in the project. This is a democratic process that rewards those who are directly involved in doing the work.
        </Text>
        </ListItem>
        <ListItem>
         <Text fontWeight="bold">
          Who is a voter?
        </Text>
        <Text>
        Any active participant or contributor who can vouch for someone’s contributions.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
         Who is a candidate?
        </Text>
        <Text>
        Any contributor who is eligible for compensation for the work they have done.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
         Can someone be both a candidate and voter?
        </Text>
        <Text>
        Yes! We recommend it.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
         How do I use Pay.Party?
        </Text>
        <Text>
        Create a Pay Party after connecting your wallet to the&nbsp; 
        <Link href="https://app.pay.party" isExternal m="2">
            app <ExternalLinkIcon mx="2px" />
         </Link>
        <UnorderedList>
        <ListItem>
        Determine who your <b>voters</b> and <b>candidates</b> are. 
        </ListItem>
        <ListItem>
        <b>Vote:</b> Share the link to the pay.party with your team so they can connect their wallet and cast their vote
        </ListItem>
        <ListItem>
        <b>Pay:</b> Enter the amount of funds you’d like to distribute in ETH or a token of your choice. Candidates will receive a portion of these funds proportional to how many votes they recieved. 
        </ListItem>
        </UnorderedList>
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
         How many votes do I get?
        </Text>
        <Text>
        Voters are given 5 votes per candidate in the party and are able to distribute those votes however they choose. For example, if there are 5 candidates then each voter gets 25 votes.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
         Can others see how I vote?
        </Text>
        <Text>
        No! Your votes are known only to you.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
         What is a distribution strategy?
        </Text>
        <Text>
        The distribution strategy determines how the votes convert to payout. Pay.party currently supports two strategies: linear and quadratic.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        What is a linear distribution strategy?
        </Text>
        <Text>
        In a linear strategy, each candidate gets a percentage of the total payment pool equal to the percentage of the votes they get. For example, if the payment pool is 10 ETH and a candidate has received 20% of the votes then the candidate will get 2 ETH.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        What is a quadratic distribution strategy?
        </Text>
        <Text>
        In a quadratic strategy, we take the square root of votes from each voter before allocating payment amounts. For example, if you sent someone four votes then we would take the square root and allocate two votes. This encourages people not to send all their votes to one person but instead spread them out.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        Which strategy is right for my team?
        </Text>
        <Text>
        It really depends!
        <br /> <br />
        We recommend a linear strategy for simplicity, when you just want regular voting with directly proportional payout.
        <br /> <br />
        We recommend a quadratic strategy when you see one or two people getting overcompensated or skewed distributions. A quadratic strategy works well when you’re looking for smaller payouts to more people.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        What tokens can I pay the party in?
        </Text>
        <Text>
        ETH, GTC, stablecoins, or any other ERC-20 work with Pay Party!
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        Does everyone need to vote before the payout?
        </Text>
        <Text>
        No, you can payout at any time. The payout will be based on the votes so far. 
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        Who can make payouts?
        </Text>
        <Text>
        Anyone can make payouts to the room! 
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        Is Pay.Party free to use?
        </Text>
        <Text>
        Absolutely.
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        I’m having issues while using pay party. How do I get help?
        </Text>
        <Text>
        Please reach out to our support team via e-mail <b>(sameer@gitcoin.co)</b> or hop in our&nbsp; 
        <Link href="https://t.me/+awQIQm56pXU0MTkx" isExternal m="2">
            telegram <ExternalLinkIcon mx="2px" />
         </Link>
         &nbsp;and we’d be happy to help you! 
        </Text>
        </ListItem>
        <ListItem>
        <Text fontWeight="bold">
        How do I leave feedback, contribute, or request a new feature?
        </Text>
        <Text>
        Please reach out to our support team via e-mail <b>(sameer@gitcoin.co)</b> or hop in our&nbsp; 
        <Link href="https://t.me/+awQIQm56pXU0MTkx" isExternal m="2">
            telegram <ExternalLinkIcon mx="2px" />
         </Link>
         &nbsp;and we’d be happy to help you! 
        </Text>
        </ListItem>
        </OrderedList>
        </Box>
      </Box>
    </Center>
  );
}

export default FAQ;
