import React from "react";
import { Button } from "@chakra-ui/react";
function BasicButton({text}: {text: string}) {
  return (
    <Button
      textColor="#ffcc00"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
        fontWeight: "bold",
        background: "#ffcc00",
        color: "#6F3FF5",
      }}
      rounded="full"
      backgroundColor="#6F3FF5"
    >
      {text}
    </Button>
  );
}

export default BasicButton;
