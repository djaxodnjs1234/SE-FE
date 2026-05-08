import { Box, useColorModeValue } from "@chakra-ui/react";
import DOMPurify from "dompurify";

export const Content = ({ contents }: { contents: string }) => {
  const color = useColorModeValue("#2D3748", "#ffffffa3");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  const coloredContents = `<div style="color:${color}">${contents}</div>`;

  return (
    <Box
      maxW="100%"
      minH="450px"
      mx="auto"
      borderBottom={`1px solid`}
      borderColor={borderColor}
    >
      <Box
        className="ck-content"
        m="16px"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(coloredContents, {
            ADD_TAGS: ["iframe"],
            ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
          }),
        }}
      />
    </Box>
  );
};
