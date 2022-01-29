import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Center,
  Text,
  Link,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  TagLeftIcon,
  Flex,
  Wrap,
  Spinner,
} from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import React, { useState, useMemo, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AddressChakra, Blockie } from "../../components";
import { default as MultiAddressInput } from "./components/MultiAddressInput";

const Create = ({ address, mainnetProvider, userSigner, tx, readContracts, writeContracts, targetNetwork }) => {
  /***** Routes *****/
  const routeHistory = useHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
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
      userSigner
        .signMessage(`Create party:\n${partyObj.name}`)
        .then(sig => {
          fetch(`${process.env.REACT_APP_API_URL}/party`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(partyObj),
          });
        })
        .catch(err => {
          setIsLoading(false);
        });
    } catch {}
  };

  const onContinue = () => {
    setIsReview(true);
  };

  const [participantInput, setParticipantInput] = useState([]);
  const [def, setDef] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(true);
  const [blockie, setBlockie] = useState(null);

  const [isReview, setIsReview] = useState(false);

  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [config, setConfig] = useState({});

  useEffect(() => {
    setPartyObj({
      name: name,
      description: description,
      receipts: [],
      config: config,
      participants: voters,
      candidates: candidates,
      ballots: [],
    });
  }, [voters, candidates, description, name, config]);

  const createForm = (
    <Box borderWidth={"1px"} shadow="xl" rounded="md" p="10" w="4xl" minW="sm">
      <Center p="5">
        <Text fontSize="xl">Create Party</Text>
      </Center>
      <FormControl id="create">
        <FormLabel>Name:</FormLabel>
        <Box bg="whiteAlpha.800" borderRadius={24} p={6}>
          <Input
            defaultValue={name}
            variant="unstyled"
            size="lg"
            rows="1"
            placeholder="Name the party"
            onChange={e => setName(e.target.value)}
          />
        </Box>
        <FormLabel>Description:</FormLabel>
        <Box bg="whiteAlpha.800" borderRadius={24} p={6}>
          <Textarea
            defaultValue={description}
            variant="unstyled"
            size="lg"
            rows="4"
            placeholder="Describe the party"
            onChange={e => setDescription(e.target.value)}
          />
        </Box>
        <FormLabel>Voters: </FormLabel>

        <MultiAddressInput
        defaultValue={voters}
          ensProvider={mainnetProvider}
          placeholder="Enter voter address/ens"
          value={voters}
          onChange={setVoters}
        />
        <FormLabel>Candidates:</FormLabel>
        <MultiAddressInput
        defaultValue={candidates}
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
    <Box borderWidth={"1px"} shadow="xl" rounded="md" p="10" w="4xl" minW="sm">
      <Center p="5">
        <Text fontSize="xl">Review</Text>
      </Center>
      <Center>
        <Button
          variant="link"
          onClick={() => {
            setIsReview(false);
          }}
          rightIcon={<EditIcon />}
        >
          Edit
        </Button>
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
          <FormLabel pt="3">Participants:</FormLabel>
          <Box p="4" borderWidth="1px" w="min-content">
            {!isLoading ? (
              voters.map(d => {
                return (
                  <Box p="1">
                    <HStack spacing={4}>
                      <Tag size="md" key={d.input} borderRadius="full" variant="solid">
                        <TagLabel>{d.input}</TagLabel>
                      </Tag>
                    </HStack>
                  </Box>
                );
              })
            ) : (
              <Text>Loading...</Text>
            )}
          </Box>
          <FormLabel pt="3">Candidates:</FormLabel>
          <Box p="4" borderWidth="1px" w="min-content">
            {!isLoading ? (
              candidates.map(d => {
                return (
                  <Box p="1">
                    <HStack spacing={4}>
                      <Tag size="md" key={d.input} borderRadius="full" variant="solid">
                        <TagLabel>{d.input}</TagLabel>
                      </Tag>
                    </HStack>
                  </Box>
                );
              })
            ) : (
              <Text>Loading...</Text>
            )}
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

  // return (
  // <Box>
  //   <Button
  //     size="lg"
  //     variant="ghost"
  //     onClick={() => {
  //       routeHistory.push("/");
  //     }}
  //     leftIcon={<ArrowBackIcon />}
  //   >
  //     Back
  //   </Button>
  //     <Center p="5">{isReview ? reviewForm : createForm}</Center>
  //   </Box>
  // );
  return (
    <Box>
      <Button
        size="lg"
        variant="ghost"
        onClick={() => {
          routeHistory.push("/");
        }}
        leftIcon={<ArrowBackIcon />}
      >
        Back
      </Button>
      <Center p="5">{isReview ? reviewForm : createForm}</Center>
    </Box>
  );
};

export default Create;
