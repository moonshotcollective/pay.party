import React from "react";
import { Box } from "@chakra-ui/react";

function QDIcon() {
  return (
    <Box
      width="15"
      height="16"
      viewBox="0 0 15 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      as="svg"
      role="img"
      _hover={{
        fill: "brand.accent",
      }}
    >
      <g clip-path="url(#clip0)">
        <path
          d="M0.25 7H6.25V1H0.25V7ZM1.25 2H5.25V6H1.25V2ZM8.25 1V7H14.25V1H8.25ZM13.25 6H9.25V2H13.25V6ZM0.25 15H6.25V9H0.25V15ZM1.25 10H5.25V14H1.25V10ZM2.25 3H4.25V5H2.25V3ZM12.25 5H10.25V3H12.25V5ZM2.25 11H4.25V13H2.25V11ZM13.25 9H14.25V13H10.25V12H9.25V15H8.25V9H11.25V10H13.25V9ZM13.25 14H14.25V15H13.25V14ZM11.25 14H12.25V15H11.25V14Z"
          fill="#C9B8FF"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect
            width="14"
            height="16"
            fill="white"
            transform="translate(0.25)"
          />
        </clipPath>
      </defs>
    </Box>
  );
}

export default QDIcon;
