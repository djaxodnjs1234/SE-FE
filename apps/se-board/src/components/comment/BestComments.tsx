import {
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { BestComment } from "@types";
import { AiFillLike } from "react-icons/ai";

import { GradientAvatar } from "@/components/common/GradientAvatar";
import { toYYYYMMDDHHhh } from "@/utils/dateUtils";

interface BestCommentsProps {
  bestComments: BestComment[];
  onClickComment: (commentId: number, pageNumber: number) => void;
}

export const BestComments = ({
  bestComments,
  onClickComment,
}: BestCommentsProps) => {
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");
  const bg = useColorModeValue("orange.50", "orange.900");
  const color = useColorModeValue("gray.700", "whiteAlpha.800");
  const metaColor = useColorModeValue("gray.500", "whiteAlpha.500");

  if (bestComments.length === 0) return null;

  return (
    <Box borderTop="1px solid" borderColor={borderColor}>
      {bestComments.map((comment) => (
        <Box
          key={comment.commentId}
          w="100%"
          p="16px"
          bgColor={bg}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          {/* 작성자 정보 */}
          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center" gap="8px">
              <GradientAvatar
                size="sm"
                name={comment.author.name}
                glow={false}
                borderWidth={0}
                gapWidth={0}
              />
              <Text fontWeight="600" fontSize="md" color={color}>
                {comment.author.name}
              </Text>
              <Badge
                colorScheme="orange"
                fontSize="0.6rem"
                px="0.4rem"
                borderRadius="full"
              >
                BEST
              </Badge>
              {comment.isReply && (
                <Badge
                  colorScheme="gray"
                  fontSize="0.6rem"
                  px="0.4rem"
                  borderRadius="full"
                >
                  답글
                </Badge>
              )}
            </Flex>
            <Text fontSize="xs" color={metaColor}>
              {toYYYYMMDDHHhh(comment.createdAt)}
            </Text>
          </Flex>

          {/* 내용 */}
          <Text
            mt="8px"
            fontSize="sm"
            color={color}
            whiteSpace="pre-line"
            noOfLines={3}
            textAlign="left"
          >
            {comment.contents}
          </Text>

          {/* 하단: 좋아요 수 + 바로가기 */}
          <Flex alignItems="center" mt="10px" gap="6px">
            <Flex alignItems="center" gap="4px" color="orange.400">
              <Icon as={AiFillLike} boxSize="14px" />
              <Text fontSize="xs" fontWeight="700">
                {comment.likeCount}
              </Text>
            </Flex>
            <Button
              ml="auto"
              size="xs"
              variant="ghost"
              colorScheme="orange"
              onClick={() =>
                onClickComment(comment.commentId, comment.pageNumber)
              }
            >
              댓글로 바로가기
            </Button>
          </Flex>
        </Box>
      ))}
    </Box>
  );
};
