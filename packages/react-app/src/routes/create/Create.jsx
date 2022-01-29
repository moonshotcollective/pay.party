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

  // const [isReview, setIsReview] = useState(false);

  // const onSubmit = async event => {
  //   try {
  //     event.preventDefault();
  //     setLoadingText("Submitting...");
  //     setIsLoading(true);
  //     userSigner
  //       .signMessage(`Create party:\n${partyObj.name}`)
  //       .then(sig => {
  //         // TODO: Do something with this
  //         // db.newParty(partyObj)
  //         //   .then(d => {
  //         //     routeHistory.push(`/party/${d.data.id}`);
  //         //     setIsLoading(false);
  //         //   })
  //         //   .catch(err => {
  //         //     console.log(err);
  //         //   });
  //         fetch(`${process.env.REACT_APP_API_URL}/party`, {
  //           method: "post",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(partyObj),
  //         });
  //       })
  //       .catch(err => {
  //         setIsLoading(false);
  //       });
  //   } catch {}
  // };

  const onContinue = () => {
    setIsReview(true);
  };

  // const [inputParticipants, setInputParticipants] = useState([]);
  // const [inputCandidates, setInputCandidates] = useState([]);
  // const [resolvedCandidateAdrs, setResolvedCandidateAdrs] = useState([]);
  // const [resolvedParticipantAdrs, setResolvedParticipantAdrs] = useState([]);
  // const [candidateAdrs, setCandidateAdrs] = useState([]);
  // const [participantAdrs, setParticipantAdrs] = useState([]);
  // const [isInvalidCandidateInput, setIsInvalidCandidateInput] = useState(false);
  // const [isInvalidParticipantInput, setIsInvalidParticipantInput] = useState(false);

  // const [partyName, setPartyName] = useState(null);
  // const [partyDescription, setPartyDescription] = useState(null);

  // const resolveInput2 = async input => {
  //   const adrs = [];
  //   const res = [];
  //   for (let i = 0; i < input.length; i++) {
  //     try {
  //       let adr = await mainnetProvider.resolveName(input[i]);
  //       if (adr) {
  //         if (!adrs.includes(adr)) {
  //           adrs.push(adr);
  //         }
  //         let ens = await mainnetProvider.lookupAddress(adr);
  //         if (ens) {
  //           if (!res.includes(ens)) {
  //             res.push(ens);
  //           }
  //         } else {
  //           if (!res.includes(adr)) {
  //             res.push(adr);
  //           }
  //         }
  //       } else {
  //         // Do something
  //         // return input;
  //       }
  //     } catch {
  //       console.log("oh it borked");
  //     }
  //   }
  //   return { adrs: adrs, res: res };
  // };

  // const parseParticipants = e => {
  //   // NOTE: This moves to resolve any ens to addresses before caching (ens -> address)
  //   // If the ens/address resolves to an address, its a valid address, otherwise not.
  //   const splitInput = e.currentTarget.value.split(/[ ,\n]+/).filter(c => c !== "");
  //   setInputParticipants(splitInput);
  // };

  // const parseCandidates = e => {
  //   const splitInput = e.currentTarget.value.split(/[ ,\n]+/).filter(c => c !== "");
  //   setInputCandidates(splitInput);
  // };

  // useMemo(() => {
  //   (async () => {
  //     setLoadingText("Loading...");
  //     setIsLoading(true);
  //     const p = await resolveInput2(inputParticipants);
  //     setParticipantAdrs(p.adrs);
  //     setResolvedParticipantAdrs(p.res);
  //     partyObj.participants = p.adrs;
  //     setIsLoading(false);
  //     setIsInvalidParticipantInput(p.adrs.length !== inputParticipants.length);
  //   })();
  // }, [inputParticipants]);

  // useMemo(() => {
  //   (async () => {
  //     setLoadingText("Loading...");
  //     setIsLoading(true);
  //     const c = await resolveInput2(inputCandidates);
  //     setCandidateAdrs(c.adrs);
  //     setResolvedCandidateAdrs(c.res);
  //     partyObj.candidates = c.adrs;
  //     // NOTE: This sets the amoung of votes based on the candidate count
  //     // TODO: Configurable amounts
  //     partyObj.config.nvotes = c.adrs.length * 5;
  //     setIsLoading(false);
  //     setIsInvalidCandidateInput(c.adrs.length !== inputCandidates.length);
  //   })();
  // }, [inputCandidates]);

  // useEffect(() => {
  //   if (isInvalidCandidateInput | isInvalidParticipantInput | isLoading) {
  //     setIsConfirmDisabled(true);
  //   } else {
  //     setIsConfirmDisabled(false);
  //   }
  // }, [isInvalidCandidateInput, isInvalidCandidateInput, isLoading]);

  const [participantInput, setParticipantInput] = useState([]);
  const [def, setDef] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(true);
  const [blockie, setBlockie] = useState(null);

  const [voters, setVoters] = useState([]);

  // const v = useMemo((input) => {
  //   (async () => {
  //   try{
  //     const adr = await mainnetProvider.resolveName(input);
  //     setBlockie(<Blockie address={adr} size={5} scale={3} />);
  //     setIsLookingUp(false);
  // } catch {}
  //   })();
  // }, [participantInput]);

  // useEffect(() => {
  //   console.log("updating voters")
  //   const o = participantInput.map(input => {
  //     return {input: input, address: await mainnetProvider.resolveName(input), ens: null, blockie: null}
  //   })
  //   setVoters([...voters, o])
  // }, [participantInput])

  useEffect(() => {
    participantInput.map(async input => {
      if (voters.some(d => d.input === input)) {
      } else {
        const voter = { input: input, isValid: null, address: null, ens: null, blockie: null, isBusy: true };
        try {
          if (input.endsWith(".eth") || input.endsWith(".xyz")) {
            voter.address = await mainnetProvider.resolveName(input);
            voter.ens = input;
          } else {
            voter.ens = await mainnetProvider.lookupAddress(input);
            voter.address = input;
          }
          voter.blockie = <Blockie address={voter.address} size={5} scale={3} />;
          voter.isValid = true;
        } catch {
          voter.isValid = false;
        }
        voter.isBusy = false;
        setVoters([...voters, voter]);
        // console.log(voter)
      }
    });
  }, [participantInput]);

  // useEffect(() => {
  //   console.log(voters);
  // }, [voters]);

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
          // defaultValue={partyName}
          // onChange={e => {
          //   partyObj.name = e.currentTarget.value;
          //   setPartyName(e.currentTarget.value);
          // }}
        />
        <FormLabel>Description</FormLabel>
        <Textarea
          size="lg"
          placeholder="Describe your party"
          rows={3}
          // defaultValue={partyDescription}
          // onChange={e => {
          //   partyObj.description = e.currentTarget.value;
          //   setPartyDescription(e.currentTarget.value);
          // }}
        />
        <FormLabel>Participants</FormLabel>
        <Box bg="whiteAlpha.800" borderRadius={24} p={6}>
          <Wrap>
            {participantInput.map(d => {
              const voter = voters.filter(v => v.input === d)[0];
              return (
                <Box p="1" key={d}>
                  <HStack spacing={4}>
                    <Tag size="md" key="md" borderRadius="full" variant="solid">
                      {voter ? <Blockie address={voter.address} size={5} scale={3} /> : <Spinner size="xs" />}
                      <TagLabel>{d}</TagLabel>
                      <TagCloseButton
                        onClick={e => {
                          setParticipantInput(participantInput.filter(adr => adr !== d));
                        }}
                      />
                    </Tag>
                  </HStack>
                </Box>
              );
            })}
          </Wrap>
          <Textarea
            draggable={false}
            variant="unstyled"
            size="lg"
            rows="1"
            placeholder="Address/ENS"
            onChange={e => {
              setIsLookingUp(true);
              const lastInput = e.target.value[e.target.value.length - 1];
              if (lastInput === "," || lastInput === "\n") {
                const splitInput = e.currentTarget.value.split(/[ ,\n]+/).filter(c => c !== "");
                setParticipantInput([...participantInput, ...splitInput]);

                e.target.value = "";
              }
            }}
          />
        </Box>
        <FormLabel>Candidates</FormLabel>
        <Textarea
          size="lg"
          placeholder="ex: 0x802999C71263f7B30927F720CF0AC10A76a0494C, bob.eth, ..."
          rows={4}
          // defaultValue={inputCandidates.join(",\n")}
          // onChange={parseCandidates}
          // isInvalid={isInvalidCandidateInput}
        />
        <Center pt={10}>
          <Button size="lg" onClick={onContinue}>
            Continue
          </Button>
        </Center>
      </FormControl>
    </Box>
  );

  // const reviewForm = (
  //   <Box borderWidth={"1px"} shadow="xl" rounded="md" p="10" w="4xl" minW="sm">
  //     <Center p="5">
  //       <Text fontSize="xl">Review</Text>
  //     </Center>
  //     <Center>
  //       <Button
  //         variant="link"
  //         onClick={() => {
  //           setIsReview(false);
  //         }}
  //         rightIcon={<EditIcon />}
  //       >
  //         Edit
  //       </Button>
  //     </Center>
  //     <form onSubmit={onSubmit}>
  //       <FormControl id="Review">
  //         <FormLabel pt="3">Name:</FormLabel>
  //         <Box p="4" borderWidth="1px">
  //           <Text fontSize="lg">{partyObj.name}</Text>
  //         </Box>
  //         <FormLabel pt="3">Description:</FormLabel>
  //         <Box p="4" borderWidth="1px">
  //           <Text fontSize="lg">{partyObj.description}</Text>
  //         </Box>
  //         <FormLabel pt="3">Participants:</FormLabel>
  //         <Box p="4" borderWidth="1px" w="min-content">
  //           {!isLoading ? (
  //             resolvedParticipantAdrs.map((d,i) => {
  //               return (
  // <Box p ='1'>
  // <HStack spacing={4}>
  //   <Tag size="md" key="md" borderRadius="full" variant="solid">
  //     <TagLabel>{d}</TagLabel>
  //     <TagCloseButton onClick={(e) => {
  //         delete resolvedParticipantAdrs[i]
  //         delete participantAdrs[i]
  //         console.log(resolvedParticipantAdrs, participantAdrs)
  //       }}
  //     />
  //   </Tag>
  // </HStack>
  // </Box>
  //               );
  //             })
  //           ) : (
  //             <Text>Loading...</Text>
  //           )}
  //         </Box>
  //         <FormLabel pt="3">Candidates:</FormLabel>
  //         <Box p="4" borderWidth="1px" w="min-content">
  //           {!isLoading ? (
  //             resolvedCandidateAdrs.map(d => {
  //               return (
  //                 <Box p ='1'>
  //                 <HStack spacing={4}>
  //                 <Tag size="md" key="md" borderRadius="full" variant="solid">
  //                   <TagLabel>{d}</TagLabel>
  //                   <TagCloseButton />
  //                 </Tag>
  //               </HStack>
  //               </Box>
  //               );
  //             })
  //           ) : (
  //             <Text>Loading...</Text>
  //           )}
  //         </Box>
  //         <Center pt={10}>
  //           <Button
  //             size="lg"
  //             type="submit"
  //             isLoading={isLoading}
  //             loadingText={loadingText}
  //             isDisabled={isConfirmDisabled}
  //           >
  //             Confirm
  //           </Button>
  //         </Center>
  //       </FormControl>
  //     </form>
  //   </Box>
  // );

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
      <Center p="5">{createForm}</Center>
    </Box>
  );
};

export default Create;
