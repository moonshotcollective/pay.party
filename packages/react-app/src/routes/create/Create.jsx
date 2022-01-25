import { Box, Button, FormControl, FormLabel, Input, Textarea, Select, Center, Text, Link } from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon } from "@chakra-ui/icons";
import React, { useState, useMemo, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { AddressChakra } from "../../components";

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

  const [isReview, setIsReview] = useState(false);

  const onSubmit = async event => {
    try {
      event.preventDefault();
      setLoadingText("Submitting...");
      setIsLoading(true);
      userSigner
        .signMessage(`Create party:\n${partyObj.name}`)
        .then(sig => {
          // TODO: Do something with this
          // db.newParty(partyObj)
          //   .then(d => {
          //     routeHistory.push(`/party/${d.data.id}`);
          //     setIsLoading(false);
          //   })
          //   .catch(err => {
          //     console.log(err);
          //   });
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

  const [inputParticipants, setInputParticipants] = useState([]);
  const [inputCandidates, setInputCandidates] = useState([]);
  const [resolvedCandidateAdrs, setResolvedCandidateAdrs] = useState([]);
  const [resolvedParticipantAdrs, setResolvedParticipantAdrs] = useState([]);
  const [candidateAdrs, setCandidateAdrs] = useState([]);
  const [participantAdrs, setParticipantAdrs] = useState([]);
  const [isInvalidCandidateInput, setIsInvalidCandidateInput] = useState(false);
  const [isInvalidParticipantInput, setIsInvalidParticipantInput] = useState(false);

  const [partyName, setPartyName] = useState(null);
  const [partyDescription, setPartyDescription] = useState(null);

  const resolveInput2 = async input => {
    const adrs = [];
    const res = [];
    for (let i = 0; i < input.length; i++) {
      try {
        let adr = await mainnetProvider.resolveName(input[i]);
        if (adr) {
          if (!adrs.includes(adr)) {
            adrs.push(adr);
          }
          let ens = await mainnetProvider.lookupAddress(adr);
          if (ens) {
            if (!res.includes(ens)) {
              res.push(ens);
            }
          } else {
            if (!res.includes(adr)) {
              res.push(adr);
            }
          }
        } else {
          // Do something
          // return input;
        }
      } catch {
        console.log("oh it borked");
      }
    }
    return { adrs: adrs, res: res };
  };

  const parseParticipants = e => {
    // NOTE: This moves to resolve any ens to addresses before caching (ens -> address)
    // If the ens/address resolves to an address, its a valid address, otherwise not.
    const splitInput = e.currentTarget.value.split(/[ ,\n]+/).filter(c => c !== "");
    setInputParticipants(splitInput);
  };

  const parseCandidates = e => {
    const splitInput = e.currentTarget.value.split(/[ ,\n]+/).filter(c => c !== "");
    setInputCandidates(splitInput);
  };

  useMemo(() => {
    (async () => {
      setLoadingText("Loading...");
      setIsLoading(true);
      const p = await resolveInput2(inputParticipants);
      setParticipantAdrs(p.adrs);
      setResolvedParticipantAdrs(p.res);
      partyObj.participants = p.adrs;
      setIsLoading(false);
      setIsInvalidParticipantInput(p.adrs.length !== inputParticipants.length);
    })();
  }, [inputParticipants]);

  useMemo(() => {
    (async () => {
      setLoadingText("Loading...");
      setIsLoading(true);
      const c = await resolveInput2(inputCandidates);
      setCandidateAdrs(c.adrs);
      setResolvedCandidateAdrs(c.res);
      partyObj.candidates = c.adrs;
      // NOTE: This sets the amoung of votes based on the candidate count
      // TODO: Configurable amounts
      partyObj.config.nvotes = c.adrs.length * 5;
      setIsLoading(false);
      setIsInvalidCandidateInput(c.adrs.length !== inputCandidates.length);
    })();
  }, [inputCandidates]);

  useEffect(() => {
    if (isInvalidCandidateInput | isInvalidParticipantInput | isLoading) {
      setIsConfirmDisabled(true);
    } else {
      setIsConfirmDisabled(false);
    }
  }, [isInvalidCandidateInput, isInvalidCandidateInput, isLoading]);

  const createForm = (
    <Box borderWidth={"1px"} shadow="xl" rounded="md" p="10" w="4xl" minW="sm">
      <Center p="5">
        <Text fontSize="xl">Create Party</Text>
      </Center>
      <FormControl id="create">
        <FormLabel>Name</FormLabel>
        <Input
          size="lg"
          placeholder="Party Name"
          defaultValue={partyName}
          onChange={e => {
            partyObj.name = e.currentTarget.value;
            setPartyName(e.currentTarget.value);
          }}
        />
        <FormLabel>Description</FormLabel>
        <Textarea
          size="lg"
          placeholder="Describe your party"
          rows={3}
          defaultValue={partyDescription}
          onChange={e => {
            partyObj.description = e.currentTarget.value;
            setPartyDescription(e.currentTarget.value);
          }}
        />
        <FormLabel>Voters</FormLabel>
        <Textarea
          size="lg"
          placeholder="ex: alice.eth, 0x6b541b78349097714B9D1aB6A788dB5e0dCF21a3, ..."
          rows={5}
          defaultValue={inputParticipants.join(",\n")}
          onChange={parseParticipants}
          isInvalid={isInvalidParticipantInput}
        />
        <FormLabel>Candidates</FormLabel>
        <Textarea
          size="lg"
          placeholder="ex: 0x802999C71263f7B30927F720CF0AC10A76a0494C, bob.eth, ..."
          rows={4}
          defaultValue={inputCandidates.join(",\n")}
          onChange={parseCandidates}
          isInvalid={isInvalidCandidateInput}
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
            <Text fontSize="lg">{partyObj.name}</Text>
          </Box>
          <FormLabel pt="3">Description:</FormLabel>
          <Box p="4" borderWidth="1px">
            <Text fontSize="lg">{partyObj.description}</Text>
          </Box>
          <FormLabel pt="3">Participants:</FormLabel>
          <Box p="4" borderWidth="1px" w="min-content">
            {!isLoading ? (resolvedParticipantAdrs.map(d => {
              return (
                <Text p="0.5" key={d}>
                  {d}
                </Text>
              );
              // return <AddressChakra address={d} ensProvider={mainnetProvider} />;
            })):(<Text>Loading...</Text>)}
          </Box>
          <FormLabel pt="3">Candidates:</FormLabel>
          <Box p="4" borderWidth="1px" w="min-content">
            {!isLoading ? (resolvedCandidateAdrs.map(d => {
              return (
                <Text p="0.5" key={d}>
                  {d}
                </Text>
              );
              // return <AddressChakra address={d} ensProvider={mainnetProvider} />;
            })):(<Text>Loading...</Text>)}
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
