import { Box, Button, FormControl, FormLabel, Input, Textarea, Select } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import MongoDBController from "../../controllers/mongodbController";

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
      nvotes: 0,
    },
    participants: [],
    candidates: [],
    ballots: [],
  });

  const onSubmit = async event => {
    event.preventDefault();
    setLoading(true);
    userSigner.signMessage(`Create party:\n${partyObj.name}`).then(sig => {
      // TODO: Do something with this
      db.newParty(partyObj)
        .then(d => {
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
        });
    });
  };

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
      <Box borderWidth={"1px"}>
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
                const parsed = (partyObj.participants = e.currentTarget.value.split(/[ ,]+/)).filter(c => c !== "");
              }}
            />

            <FormLabel>Candidates</FormLabel>
            <Textarea
              type="candidates"
              placeholder="ex: 0x802999C71263f7B30927F720CF0AC10A76a0494C, ..."
              rows={3}
              onChange={e => {
                const parsed = (partyObj.candidates = e.currentTarget.value.split(/[ ,]+/)).filter(c => c !== "");
              }}
            />

            <Button size="lg" type="primary" type="submit" loading={loading}>
              Submit
            </Button>
          </FormControl>
        </form>
      </Box>
    </Box>
  );
};

export default Create;
