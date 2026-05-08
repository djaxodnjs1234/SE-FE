import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { CommentContent } from "@types";
import React, { useRef, useState } from "react";
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
import { BsArrowReturnRight } from "react-icons/bs";

import { GradientAvatar } from "@/components/common/GradientAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useNavigatePage } from "@/hooks";
import { useCommentLike } from "@/hooks/useCommentLike";
import { openColors } from "@/styles";
import { isModifiedContent, toYYYYMMDDHHhh } from "@/utils/dateUtils";

import { CommentMoreButton } from "../detailPost";
import { CommentModifyInput } from "./CommentInput";

interface CommentFormationProps {
  comment: CommentContent;
  setIsWriteState: React.Dispatch<React.SetStateAction<number | null>>;
  tag?: string;
}

export const CommentFormation = ({
  comment,
  setIsWriteState,
  tag,
}: CommentFormationProps) => {
  const [isModify, setIsModify] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const commentModifyAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    onOpen();
  };

  const hoverColor = useColorModeValue("gray.0", "whiteAlpha.200");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");
  const mutedColor = useColorModeValue("gray.5", "whiteAlpha.500");

  const { likeCount, dislikeCount, myReaction, toggleLike, toggleDislike } =
    useCommentLike(
      comment.commentId,
      comment.likeCount,
      comment.dislikeCount,
      comment.myReaction
    );

  return (
    <Box w="100%" p="16px">
      {!isModify ? (
        <>
          {/* ── 작성자 | 날짜 | MoreButton — recruit 스타일로 한 행에 */}
          <Flex alignItems="center" gap={3} mb={1.5} flexWrap="wrap">
            <AuthorInfoMenuList
              name={comment.author.name}
              authorId={comment.author.userId}
              profileImageUrl={comment.author.profileImageUrl}
              frameGradientStart={comment.author.frameGradientStart}
              frameGradientEnd={comment.author.frameGradientEnd}
              badgeType={comment.author.badgeType}
              badgeLabel={comment.author.badgeLabel}
            />
            <Text color={borderColor} userSelect="none">
              |
            </Text>
            <Flex alignItems="baseline" gap={1} color={mutedColor}>
              <Text fontSize="sm">{toYYYYMMDDHHhh(comment.createdAt)}</Text>
              {isModifiedContent(comment.createdAt, comment.modifiedAt) && (
                <Text as="span" fontSize="xs" color="gray.6">
                  (수정됨)
                </Text>
              )}
            </Flex>
            <Box ml="auto">
              {comment.isActive && (
                <CommentMoreButton
                  isEditable={comment.isEditable}
                  setIsModify={setIsModify}
                  commentId={comment.commentId}
                  isReply={tag ? true : false}
                />
              )}
            </Box>
          </Flex>

          {/* ── 태그 (Recruit 스타일) */}
          {tag && (
            <Flex alignItems="center" gap={1} mb={1.5} color={mutedColor}>
              <Icon as={BsArrowReturnRight} boxSize="1rem" />
              <Text fontSize="md" color="blue.500" fontWeight="medium">
                @{tag}
              </Text>
            </Flex>
          )}

          {/* ── 내용 */}
          <Text textAlign="left" maxW="850px" whiteSpace="pre-line">
            {comment.contents}
          </Text>

          {/* ── 이미지 첨부 */}
          {comment.attachments && comment.attachments.length > 0 && (
            <SimpleGrid
              columns={Math.min(comment.attachments.length, 3)}
              gap="8px"
              mt="10px"
            >
              {comment.attachments.map((att) => (
                <Image
                  key={att.fileMetaDataId}
                  src={att.url}
                  alt={att.originalFileName}
                  w="100%"
                  objectFit="contain"
                  borderRadius="6px"
                  cursor="pointer"
                  bg="gray.50"
                  onClick={() => handleImageClick(att.url)}
                  _hover={{ opacity: 0.85 }}
                />
              ))}
            </SimpleGrid>
          )}

          {/* ── 좋아요 / 싫어요 / 답글 */}
          <Flex alignItems="center" mt="8px" gap="6px">
            <Button
              size="xs"
              variant="ghost"
              px="6px"
              color={myReaction === "LIKE" ? openColors.blue[5] : "gray.500"}
              leftIcon={
                <Icon
                  as={myReaction === "LIKE" ? AiFillLike : AiOutlineLike}
                  boxSize="14px"
                />
              }
              onClick={toggleLike}
            >
              {likeCount}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              px="6px"
              color={myReaction === "DISLIKE" ? openColors.red[5] : "gray.500"}
              leftIcon={
                <Icon
                  as={
                    myReaction === "DISLIKE" ? AiFillDislike : AiOutlineDislike
                  }
                  boxSize="14px"
                />
              }
              onClick={toggleDislike}
            >
              {dislikeCount}
            </Button>
            {comment.isActive && (
              <Button
                size="sm"
                p="0"
                ml="4px"
                leftIcon={<BsArrowReturnRight />}
                variant="ghost"
                color="gray.6"
                _hover={{ bgColor: hoverColor, color: "gray.7" }}
                onClick={() => setIsWriteState(comment.commentId)}
              >
                답글 달기
              </Button>
            )}
          </Flex>
        </>
      ) : (
        <CommentModifyInput
          commentId={comment.commentId}
          commentContent={comment.contents}
          existingAttachments={comment.attachments ?? []}
          isComment={tag ? false : true}
          setIsModify={setIsModify}
          inputRef={commentModifyAreaRef}
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" />
          <ModalBody p={0} display="flex" justifyContent="center">
            {selectedImage && (
              <Image
                src={selectedImage}
                maxH="80vh"
                maxW="100%"
                objectFit="contain"
                borderRadius="8px"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const AuthorInfoMenuList = ({
  name,
  authorId,
  profileImageUrl,
  frameGradientStart,
  frameGradientEnd,
  badgeType,
  badgeLabel,
}: {
  name: string;
  authorId: string | null;
  profileImageUrl?: string | null;
  frameGradientStart?: string | null;
  frameGradientEnd?: string | null;
  badgeType?: "CHECK" | "KUMOH_CROW" | null;
  badgeLabel?: string | null;
}) => {
  const { goToProfilePage } = useNavigatePage();

  return (
    <Menu autoSelect={false}>
      <MenuButton cursor={!authorId ? "not-allowed" : "pointer"}>
        <Box display="flex" alignItems="center" gap="6px">
          <GradientAvatar
            src={profileImageUrl ?? undefined}
            size="xs"
            name={profileImageUrl ? undefined : name}
            gradientStart={frameGradientStart}
            gradientEnd={frameGradientEnd}
            borderWidth={2}
            gapWidth={1}
            glow={false}
          />
          <Text
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="medium"
            whiteSpace="nowrap"
          >
            {name}
          </Text>
          <RoleBadge badgeType={badgeType} badgeLabel={badgeLabel} />
        </Box>
      </MenuButton>
      {!!authorId && (
        <MenuList>
          <MenuItem onClick={() => goToProfilePage(authorId)}>
            프로필 보기
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  );
};
