import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Link,
  ListItem,
  Progress,
  Text,
  UnorderedList,
  useColorModeValue,
} from "@chakra-ui/react";
import { Attachment } from "@types";
import { BsPaperclip } from "react-icons/bs";

import { useRecruitFileInput } from "@/hooks/useRecruitFileInput";
import { openColors } from "@/styles";

interface Props {
  beforeFiles?: Attachment[];
  onAttachmentIdsChange: (ids: number[]) => void;
}

export const RecruitFileUploader = ({
  beforeFiles = [],
  onAttachmentIdsChange,
}: Props) => {
  const {
    files,
    handleFileInput,
    handleDragOver,
    handleDrop,
    handleRemove,
    isFileUploadLoading,
    isFileDeleteLoading,
  } = useRecruitFileInput(beforeFiles, onAttachmentIdsChange);

  const bgColor = useColorModeValue("gray.0", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  return (
    <Box
      maxWidth="full"
      backgroundColor={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FormControl>
        <Flex
          justifyContent="center"
          h="60px"
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <FormLabel
            w="100%"
            fontSize="md"
            my="auto"
            p="4px 8px"
            mr="0"
            htmlFor="recruit-file-input"
            cursor="pointer"
            color={openColors.gray[6]}
            _hover={{ color: openColors.gray[8] }}
            borderRadius="5px"
          >
            <Flex w="100%" justifyContent="center" alignItems="center" gap={2}>
              <Icon as={BsPaperclip} boxSize="18px" />
              <Text fontSize="sm">
                파일을 클릭하거나 드래그 & 드롭으로 첨부하세요.
              </Text>
            </Flex>
          </FormLabel>
        </Flex>

        {(isFileUploadLoading || isFileDeleteLoading) && (
          <Progress size="xs" isIndeterminate colorScheme="blue" />
        )}

        <Input
          type="file"
          id="recruit-file-input"
          onChange={handleFileInput}
          multiple
          display="none"
        />

        {files.length > 0 && (
          <Box my="10px" mx="15px">
            <Text fontSize="sm" fontWeight="semibold" mb={1}>
              첨부된 파일
            </Text>
            <UnorderedList spacing={1}>
              {files.map((file) => (
                <ListItem
                  key={file.fileMetaDataId}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Link
                    href={`${process.env.REACT_APP_API_ENDPOINT}${file.url}`}
                    download={file.originalFileName}
                    fontSize="sm"
                    color="blue.500"
                    _hover={{ textDecoration: "underline" }}
                  >
                    {file.originalFileName}
                  </Link>
                  <Button
                    variant="danger"
                    size="xs"
                    onClick={() => handleRemove(file.fileMetaDataId)}
                    isLoading={isFileDeleteLoading}
                  >
                    삭제
                  </Button>
                </ListItem>
              ))}
            </UnorderedList>
          </Box>
        )}
      </FormControl>
    </Box>
  );
};
