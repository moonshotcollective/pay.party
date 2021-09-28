import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Divider,
  Button,
  AspectRatio,
} from "@chakra-ui/react";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Link, SimpleGrid } from "@chakra-ui/layout";

import QDIcon from "../components/Icons/QDIcon";
import Circle from "../components/Circles/Circle";

import NextLink from "next/link";

import CenteredFrame from "../components/layout/CenteredFrame";
import NotConnectedCard from "../components/layout/Card/NotConnectedCard";
import NotMemberCard from "../components/layout/Card/NotMemberCard";
import SelectMemberCard from "../components/layout/Card/SelectMemberCard";

import { useState } from "react";

enum CardEnum {
  NotConnectedCard,
  NotMember,
  SelectMemberCard,
}

const Voter = () => {
  const [activeCard, setActiveCard] = useState(CardEnum.NotConnectedCard);
  return (
    <CenteredFrame>
      <HStack pb="2">
        <Button
          size="xs"
          onClick={() => setActiveCard(CardEnum.NotConnectedCard)}
        >
          NotConnected
        </Button>
        <Button size="xs" onClick={() => setActiveCard(CardEnum.NotMember)}>
          NotMember
        </Button>
        <Button
          size="xs"
          onClick={() => setActiveCard(CardEnum.SelectMemberCard)}
        >
          Voter
        </Button>
      </HStack>
      {activeCard === CardEnum.NotConnectedCard && <NotConnectedCard />}
      {activeCard === CardEnum.NotMember && <NotMemberCard />}
      {activeCard === CardEnum.SelectMemberCard && <SelectMemberCard />}
    </CenteredFrame>
  );
};

export default Voter;
