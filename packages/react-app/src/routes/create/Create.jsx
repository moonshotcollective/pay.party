import { ChevronLeftIcon, CopyIcon, AddIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import { MdContentPaste, MdFilePresent } from "react-icons/md";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  FormHelperText,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Center,
  TableCaption,
  Tooltip,
  NumberInput,
  NumberInputField,
  Text,
  useColorModeValue,
  Textarea,
  Select,
  Spinner,
  IconButton,
  Icon,
  Checkbox,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { toWei } from "web3-utils";
import { useFieldArray, useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import CenteredFrame from "../../components/layout/CenteredFrame";
import dips from "../../dips";
import AddressInputChakra from "../../components/AddressInputChakra";
import AddressChakra from "../../components/AddressChakra";
import ElectionCard from "../../components/Cards/ElectionCard";
import { blockExplorer } from "../../App";
import { ethers } from "ethers";
import { Form, Card, InputNumber, Space } from "antd";
import MongoDBController from "../../controllers/mongodbController";
import { CERAMIC_PREFIX } from "../../dips/helpers";

const CURRENCY = process.env.REACT_APP_NETWORK_SYMBOL;
const TOKEN = process.env.REACT_APP_TOKEN_SYMBOL;
const TOKEN_ADR = process.env.REACT_APP_TOKEN_ADDRESS;
const STABLE = process.env.REACT_APP_STABLE_TOKEN_SYMBOL;
const STABLE_ADR = process.env.REACT_APP_STABLE_TOKEN_ADDRESS;

const Create = ({ address, mainnetProvider, userSigner, tx, readContracts, writeContracts, targetNetwork }) => {
  /***** Routes *****/
  const routeHistory = useHistory();

  const db = new MongoDBController();

  const [loading, setLoading] = useState(false);

  const [partyObj, setPartyObj] = useState({
    name: "",
    description: "",
    receipts: [], 
    config: {
      strategy: "", 
      nvotes: 0
    },
    participants: [],
    candidates: [],
    ballots: [],
  });

  const onSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    db.newParty(partyObj)
      .then(d => {
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <Box borderWidth={"1px"}>
      <Button
        onClick={() => {
          routeHistory.push("/");
        }}
      >
        Back
      </Button>
      <form onSubmit={onSubmit}>
        <FormControl id="create">
          <FormLabel>Name</FormLabel>
          <Input type="name" placeholder="Party Name" onChange={e => (partyObj.name = e.currentTarget.value)} />

          <FormLabel>Desciption</FormLabel>
          <Textarea
            type="description"
            placeholder="Describe your party"
            rows={3}
            onChange={e => (partyObj.description = e.currentTarget.value)}
          />

          <FormLabel>Strategy</FormLabel>
          <Select onChange={e => (partyObj.config.strategy = e.currentTarget.value)}>
            <option>Linear</option>
            <option>Quadratic</option>
          </Select>

          <FormLabel>Participants</FormLabel>
          <Textarea
            type="participants"
            placeholder="ex: 0x802999C71263f7B30927F720CF0AC10A76a0494C, 0x6b541b78349097714B9D1aB6A788dB5e0dCF21a3, ..."
            rows={3}
            onChange={e => {
              const parsed = (partyObj.participants = e.currentTarget.value.split(/[ ,]+/)).filter(c => c !== ''); 
              console.log(parsed)
            }}
          ></Textarea>

          <FormLabel>Candidates</FormLabel>
          <Textarea
            type="candidates"
            placeholder="ex: 0x802999C71263f7B30927F720CF0AC10A76a0494C, ..."
            rows={3}
            onChange={e => {
              const parsed = (partyObj.candidates = e.currentTarget.value.split(/[ ,]+/)).filter(c => c !== '')
              console.log(parsed)
            }
          }
          ></Textarea>

          <Button type="primary" type="submit" loading={loading}>
            Submit
          </Button>
        </FormControl>
      </form>
    </Box>
  );
};

export default Create;
