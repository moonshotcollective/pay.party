import { Box, Button, FormControl, FormLabel, Input, Textarea, Select, Center, Heading, Text} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import React, { useState, useEffect, useMemo } from "react";
import { useHistory } from "react-router-dom";
import MongoDBController from "../../controllers/mongodbController";

const Create = ({ address, mainnetProvider, userSigner, tx, readContracts, writeContracts, targetNetwork }) => {
  /***** Routes *****/
  const routeHistory = useHistory();

  const db = new MongoDBController();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
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
    event.preventDefault();
    setLoadingText("Submitting...");
    setIsLoading(true);
    userSigner
      .signMessage(`Create party:\n${partyObj.name}`)
      .then(sig => {
        // TODO: Do something with this
        db.newParty(partyObj)
          .then(d => {
            setIsLoading(false);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        setIsLoading(false);
      });
  };

  const [inputParticipants, setInputParticipants] = useState([]);
  const [inputCandidates, setInputCandidates] = useState([]);
  const [resolvedCandidateAdrs, setResolvedCandidateAdrs] = useState([]);
  const [resolvedParticipantAdrs, setResolvedParticipantAdrs] = useState([]);
  const [candidateAdrs, setCandidateAdrs] = useState([]);
  const [participantAdrs, setParticipantAdrs] = useState([]);
  const [isInvalidCandidateInput, setIsInvalidCandidateInput] = useState(false);
  const [isInvalidParticipantInput, setIsInvalidParticipantInput] = useState(false);

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
    const splitInput = e.currentTarget.value.split(/[ ,]+/).filter(c => c !== "");
    setInputCandidates(splitInput);
  };

  useMemo(async () => {
    setLoadingText("Checking...");
    setIsLoading(true);
    const p = await resolveInput2(inputParticipants);
    setParticipantAdrs(p.adrs);
    setResolvedParticipantAdrs(p.res);
    partyObj.participants = p.adrs;
    setIsLoading(p.adrs.length !== inputParticipants.length);
    setIsInvalidParticipantInput(p.adrs.length !== inputParticipants.length);
  }, [inputParticipants]);

  useMemo(async () => {
    setLoadingText("Checking...");
    setIsLoading(true);
    const c = await resolveInput2(inputCandidates);
    setCandidateAdrs(c.adrs);
    setResolvedCandidateAdrs(c.res);
    partyObj.candidates = c.adrs;
    setIsLoading(c.adrs.length !== inputCandidates.length);
    setIsInvalidCandidateInput(c.adrs.length !== inputCandidates.length);
  }, [inputCandidates]);

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
      <Box borderWidth={"1px"} padding={"4% 18% 6% 18%"} borderRadius={12}>
        <Center>
          <Text fontSize='lg'>
            Create
          </Text>
          {/* Create a party */}
        </Center>
        <form onSubmit={onSubmit}>
          <FormControl id="create">
            <FormLabel>Name</FormLabel>
            <Input
              type="name"
              size="lg"
              placeholder="Party Name"
              onChange={e => (partyObj.name = e.currentTarget.value)}
            />

            <FormLabel>Desciption</FormLabel>
            <Textarea
              type="description"
              size="lg"
              placeholder="Describe your party"
              rows={3}
              onChange={e => (partyObj.description = e.currentTarget.value)}
            />

            <FormLabel>Participants</FormLabel>
            <Textarea
              type="participants"
              size="lg"
              placeholder="ex: alice.eth, 0x6b541b78349097714B9D1aB6A788dB5e0dCF21a3, ..."
              rows={5}
              onChange={parseParticipants}
              isInvalid={isInvalidParticipantInput}
            />

            <FormLabel>Candidates</FormLabel>
            <Textarea
              type="candidates"
              size="lg"
              placeholder="ex: 0x802999C71263f7B30927F720CF0AC10A76a0494C, bob.eth, ..."
              rows={4}
              onChange={parseCandidates}
              isInvalid={isInvalidCandidateInput}
            />
            <FormLabel>Strategy</FormLabel>
            <Select size="lg" onChange={e => (partyObj.config.strategy = e.currentTarget.value)}>
              <option>Linear</option>
              <option>Quadratic</option>
            </Select>

            <Center pt={10}>
              <Button
                size="lg"
                type="primary"
                type="submit"
                isLoading={isLoading}
                loadingText={loadingText}
                width={"50%"}
              >
                Submit Party
              </Button>
            </Center>
          </FormControl>
        </form>
      </Box>
    </Box>
  );
};

export default Create;
