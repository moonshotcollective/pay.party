import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Center,
  Text,
  HStack,
  Spacer,
  Tag,
  TagLabel,
  Tooltip,
} from "@chakra-ui/react";
import {
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, QuestionOutlineIcon, WarningIcon } from "@chakra-ui/icons";
import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { default as MultiAddressInput } from "./components/MultiAddressInput";
import { useColorModeValue } from "@chakra-ui/color-mode";
import Blockie from "../../components/Blockie";



const Create = ({
  address,
  mainnetProvider,
  userSigner,
  tx,
  readContracts,
  writeContracts,
  targetNetwork,
  partyName,
  partyJson,
  setPartyJson,
}) => {
  const routeHistory = useHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
  const [isInvalidName, setIsInvalidName] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [partyObj, setPartyObj] = useState({
    name: "",
    description: "",
    receipts: [],
    config: {
      strategy: "",
      nvotes: 0,
    },
    participants: [],
    candidates: [],
    ballots: [],
  });

  const onSubmit = async event => {
    try {
      event.preventDefault();
      setLoadingText("Submitting...");
      setIsLoading(true);

      const sig = await userSigner.signMessage(`Create party:\n${partyObj.name}`);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/party`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partyObj),
      });
      const json = await res.json();
      routeHistory.push(`/party/${json.id}`);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  const onContinue = _ => {
    setIsReview(true);
  };

  const [isReview, setIsReview] = useState(false);
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [description, setDescription] = useState("");
  const [name, setName] = useState(partyName);
  
  useEffect(_ => {
    if (!partyJson) {
      (async _ => {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/parties`);
        const data = await res.json();
        setPartyJson(data);
      })();
    }
  }, []);

  useEffect(
    _ => {
      try {
        if (partyJson.filter(d => d.name === name).length > 0) {
          throw "Error: Party name already taken.";
        }
        const voterAddresses = voters.map(d => d.address);
        const candidateAddresses = candidates.map(d => d.address);
        const config = {
          strategy: "",
          nvotes: candidateAddresses.length * 5,
        };
        if (name !== "" && candidateAddresses.length > 0 && voterAddresses.length > 0) {
          setIsConfirmDisabled(false);
        }
        setIsInvalidName(false);
        setPartyObj({
          name: name,
          description: description,
          receipts: [],
          config: config,
          participants: voterAddresses,
          candidates: candidateAddresses,
          ballots: [],
        });
      } catch (err) {
        setIsConfirmDisabled(true);
        setIsInvalidName(true);
        console.log(err);
      }
    },
    [voters, candidates, description, name],
  );

  const createForm = (
    <Box borderWidth={"1px"} shadow="xl" rounded="md" p="10" w="4xl" minW="sm" borderRadius={24}>
      <Center p="5">
        <Text fontSize="xl" fontWeight="semibold">
          Create Party
        </Text>
      </Center>
      <FormControl id="create">
        <FormLabel pl="2" pt="2">
          Name:
        </FormLabel>
        <Box bg={useColorModeValue("whiteAlpha.900", "purple.900")} borderRadius={24} p={6}>
          <Input
            defaultValue={name}
            isInvalid={isInvalidName}
            variant="unstyled"
            size="lg"
            rows="1"
            placeholder="Name the party"
            onChange={e => setName(e.target.value)}
          />

          {isInvalidName ? (
            <HStack>
              <WarningIcon />
              <Text>Name has already been used. Please try another.</Text>
            </HStack>
          ) : null}
        </Box>
        <FormLabel pl="2" pt="2">
          Description:
        </FormLabel>
        <Box bg={useColorModeValue("whiteAlpha.900", "purple.900")} borderRadius={24} p={6}>
          <Textarea
            defaultValue={description}
            variant="unstyled"
            size="lg"
            rows="4"
            placeholder="Describe the party"
            onChange={e => setDescription(e.target.value)}
          />
        </Box>
        <HStack>
          <FormLabel pl="2" pt="2">
            Voters:
          </FormLabel>
          <Spacer />
          <Tooltip label="Voters are the addresses that are eligible to cast votes.">
            <QuestionOutlineIcon w={3.5} h={3.5} />
          </Tooltip>
        </HStack>
        <MultiAddressInput
          ensProvider={mainnetProvider}
          placeholder="Enter voter address/ens"
          value={voters}
          onChange={setVoters}
        />
        <HStack>
          <FormLabel pl="2" pt="2">
            Candidates:
          </FormLabel>
          <Spacer />
          <Tooltip label="Candidates are the addresses that are being voted on, and the recipients of distributed funds. This also determines the votes that each voter is able to use.">
            <QuestionOutlineIcon w={3.5} h={3.5} />
          </Tooltip>
        </HStack>
        <MultiAddressInput
          ensProvider={mainnetProvider}
          placeholder="Enter candidate address/ens"
          value={candidates}
          onChange={setCandidates}
        />
        <Center pt={10}>
          <Button size="lg" onClick={onContinue}>
            Continue
          </Button>
        </Center>
      </FormControl>
    </Box>
  );

  const reviewForm = (
    <Box borderWidth={"1px"} shadow="xl" rounded="md" p="10" w="4xl" minW="sm" borderRadius={24}>
      <Center p="5">
        <Text fontSize="xl">Review</Text>
      </Center>
      <form onSubmit={onSubmit}>
        <FormControl id="Review">
          <FormLabel pt="3">Name:</FormLabel>
          <Box p="4" borderWidth="1px">
            <Text fontSize="lg">{name}</Text>
          </Box>
          <FormLabel pt="3">Description:</FormLabel>
          <Box p="4" borderWidth="1px">
            <Text fontSize="lg">{description}</Text>
          </Box>
          <FormLabel pt="3">Voters:</FormLabel>
          <Box p="4" borderWidth="1px" w="min-content">
            {voters.map(d => {
              return (
                <Box p="1">
                  <HStack spacing={4}>
                    <Tag size="md" key={d.input} borderRadius="full" variant="solid">
                      <Box p="1">
                        <Blockie address={d.address} size={5} scale={3} />
                      </Box>
                      <TagLabel>{d.input}</TagLabel>
                    </Tag>
                  </HStack>
                </Box>
              );
            })}
          </Box>
          <FormLabel pt="3">Candidates:</FormLabel>
          <Box p="4" borderWidth="1px" w="min-content">
            {candidates.map(d => {
              return (
                <Box p="1">
                  <HStack spacing={4}>
                    <Tag size="md" key={d.input} borderRadius="full" variant="solid">
                      <Box p="1">
                        <Blockie address={d.address} size={5} scale={3} />
                      </Box>
                      <TagLabel>{d.input}</TagLabel>
                    </Tag>
                  </HStack>
                </Box>
              );
            })}
          </Box>
          <Center pt={10}>
            <Button
              size="lg"
              type="submit"
              isLoading={isLoading}
              loadingText={loadingText}
              isDisabled={isConfirmDisabled}
            >
              Confirm
            </Button>
          </Center>
        </FormControl>
      </form>
    </Box>
  );

  const goHomeAlert = (
      <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Go to home page?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure? All the details entered will be deleted.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button 
            colorScheme='red' 
            ml={3}
            onClick={() => {
              routeHistory.push("/");
            }}
             >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );


  return (
    <Box>
    {isReview ? (
      <Button
        size="lg"
        variant="ghost"
        onClick={() => {
            setIsReview(false);
          }}
        leftIcon={<ArrowBackIcon />}
      >
        Edit
      </Button>
      ) : (
        <Button
        size="lg"
        variant="ghost"
        onClick={onOpen}
        leftIcon={<ArrowBackIcon />}
      >
        Home
      </Button>
        )
      }
      {goHomeAlert}
      <Center p="5">{isReview ? reviewForm : createForm}</Center>
    </Box>
  );
};

export default Create;
