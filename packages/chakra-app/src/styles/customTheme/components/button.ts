import { DeepPartial, Theme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const Button: DeepPartial<Theme["components"]["Button"]> = {
  variants: {
    solid: (props: any) => ({
      bg: mode("violet.300", "purple.500")(props),
      color: mode("purple.700", "violet.50")(props),
      borderRadius: "full",
      textTransform: "uppercase",
      _hover: {
        boxShadow: "lg",
        fontWeight: "bold",
        background: "yellow.500",
        color: "purple.500",
      },
      _active: {
        color: "purple.500",
        bg: "yellow.800",
      },
    }),
    outline: (props: any) => ({
      borderRadius: "full",
      borderWidth: "1px",
      textTransform: "uppercase",
      borderColor: mode("violet.300", "purple.500")(props),
      color: mode("violet.300", "purple.500")(props),
      _hover: {
        boxShadow: "lg",
        fontWeight: "bold",
        background: "yellow.500",
        borderColor: "purple.500",
        color: "purple.500",
      },
      _active: {
        color: "purple.500",
        bg: "yellow.800",
      },
    }),
  },
};

export default Button;
