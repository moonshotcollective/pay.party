import { Step, Steps, useSteps } from "chakra-ui-steps";
import { Button, Box } from "@chakra-ui/react";

import SelectMemberCard from "./SelectMemberCard";
import AfterVoteCard from "./AfterVoteCard";
import VoteCard from "./VoteCard";

const SelectMember = <SelectMemberCard />;
const AfterVote = <AfterVoteCard />;
const Vote = <VoteCard />;

const steps = [
  { label: "Select", content: SelectMember },
  { label: "Vote", content: Vote },
  { label: "Complete", content: AfterVote },
];

const VoterSteps = () => {
  const { nextStep, prevStep, setStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  return (
    <>
      <Steps colorScheme="purple" size="sm" activeStep={activeStep}>
        {steps.map(({ label, content }) => (
          <Step pb="1rem" label={label} key={label}>
            {content}
          </Step>
        ))}
      </Steps>
      <Box pt="1rem" align="end">
        {activeStep > 0 && activeStep < 2 && (
          <Button
            variant="outline"
            onClick={() => prevStep()}
            px="1.25rem"
            fontSize="md"
          >
            Prev
          </Button>
        )}
        {activeStep < 1 && (
          <Button
            ml="0.5rem"
            onClick={() => nextStep()}
            px="1.25rem"
            fontSize="md"
          >
            Next
          </Button>
        )}
        {activeStep === 1 && (
          <Button
            ml="0.5rem"
            onClick={() => nextStep()}
            px="1.25rem"
            fontSize="md"
          >
            Submit
          </Button>
        )}
      </Box>
    </>
  );
};

export default VoterSteps;
