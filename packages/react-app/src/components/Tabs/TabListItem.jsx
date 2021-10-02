import { Tab } from "@chakra-ui/react";

function ElectionTab({ title }) {
  return (
    <Tab
      _focus={{
        boxShadow: "none",
      }}
      _selected={{
        color: "violet.300",
        fontWeight: "bold",
        borderBottomWidth: "2px",
        borderBottomColor: "violet.300",
      }}
    >
      {title}
    </Tab>
  );
}

export default ElectionTab;
