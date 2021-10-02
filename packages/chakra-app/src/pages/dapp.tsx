import { HStack, Button } from "@chakra-ui/react";

import CenteredFrame from "../components/layout/CenteredFrame";
import NotConnectedCard from "../components/Cards/NotConnectedCard";
import NotMemberCard from "../components/Cards/NotMemberCard";
import VoterSteps from "../components/Cards/VoterCards/VoterSteps";
import AddMembersCard from "../components/Cards/AdminCards/AddMembersCard";
import AdminHomeCard from "../components/Cards/AdminCards/AdminHomeCard";
import RewardMembersCard from "../components/Cards/AdminCards/RewardMembersCard";

import { useState } from "react";

enum CardEnum {
  NotConnectedCard,
  NotMember,
  SelectMemberCard,
  AddMembersCard,
  AdminHomeCard,
  RewardMembersCard,
}

const Dapp = () => {
  const [activeCard, setActiveCard] = useState(CardEnum.NotConnectedCard);

  function handleActiveCard(card: CardEnum) {
    setActiveCard(card);
  }

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
        <Button
          size="xs"
          onClick={() => setActiveCard(CardEnum.AddMembersCard)}
        >
          AddMembers
        </Button>
        <Button size="xs" onClick={() => setActiveCard(CardEnum.AdminHomeCard)}>
          Admin
        </Button>
        <Button
          size="xs"
          onClick={() => setActiveCard(CardEnum.RewardMembersCard)}
        >
          Reward
        </Button>
      </HStack>
      {activeCard === CardEnum.NotConnectedCard && <NotConnectedCard />}
      {activeCard === CardEnum.NotMember && <NotMemberCard />}
      {activeCard === CardEnum.SelectMemberCard && <VoterSteps />}
      {activeCard === CardEnum.AddMembersCard && <AddMembersCard />}
      {activeCard === CardEnum.AdminHomeCard && (
        <AdminHomeCard changeActive={handleActiveCard} CardEnum={CardEnum} />
      )}
      {activeCard === CardEnum.RewardMembersCard && <RewardMembersCard />}
    </CenteredFrame>
  );
};

export default Dapp;
