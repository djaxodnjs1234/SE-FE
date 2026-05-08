import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Image,
  SimpleGrid,
  Switch,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Attachment } from "@types";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BsArrowReturnRight } from "react-icons/bs";
import { MdClose, MdImage } from "react-icons/md";
import { useParams } from "react-router-dom";

import { postFile } from "@/api/file";
import { GradientAvatar } from "@/components/common/GradientAvatar";
import { useNavigatePage } from "@/hooks";
import {
  usePostCommentMutation,
  usePostReplyMutation,
  usePutCommentMutation,
  usePutReplyMutation,
} from "@/react-query/hooks";
import { useWriteCommentState } from "@/store/CommentState";
import { useUserState } from "@/store/user";
import { openColors } from "@/styles";

const MAX_ATTACHMENTS = 5;

interface ImagePreviewProps {
  files: Attachment[];
  onRemove: (id: number) => void;
}

const ImagePreview = ({ files, onRemove }: ImagePreviewProps) => {
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.300");

  if (files.length === 0) return null;

  return (
    <SimpleGrid columns={Math.min(files.length, 4)} gap="8px" mt="8px">
      {files.map((file) => (
        <Box key={file.fileMetaDataId} position="relative">
          <Image
            src={file.url}
            alt={file.originalFileName}
            w="100%"
            h="80px"
            objectFit="cover"
            borderRadius="6px"
            border="1px solid"
            borderColor={borderColor}
          />
          <IconButton
            aria-label="이미지 제거"
            icon={<Icon as={MdClose} boxSize="12px" />}
            size="xs"
            position="absolute"
            top="2px"
            right="2px"
            borderRadius="full"
            bgColor="blackAlpha.600"
            color="white"
            _hover={{ bgColor: "blackAlpha.800" }}
            minW="18px"
            h="18px"
            onClick={() => onRemove(file.fileMetaDataId)}
          />
        </Box>
      ))}
    </SimpleGrid>
  );
};

/* ── 공통 하단 액션 바 (이미지·익명·비밀댓글) ── */
const CommentActionBar = ({
  uploadedFiles,
  isUploading,
  isAnonymous,
  isSecret,
  onImageClick,
  onToggleAnonymous,
  onToggleSecret,
  anonymousId,
  secretId,
}: {
  uploadedFiles: Attachment[];
  isUploading: boolean;
  isAnonymous: boolean;
  isSecret: boolean;
  onImageClick: () => void;
  onToggleAnonymous: () => void;
  onToggleSecret: () => void;
  anonymousId: string;
  secretId: string;
}) => {
  const color = useColorModeValue("gray.7", "whiteAlpha.800");

  return (
    <Flex alignItems="center" gap={3} flexWrap="wrap" color={color}>
      <Tooltip
        label={
          uploadedFiles.length >= MAX_ATTACHMENTS
            ? `최대 ${MAX_ATTACHMENTS}장까지 첨부 가능합니다`
            : "이미지 첨부"
        }
        hasArrow
      >
        <IconButton
          aria-label="이미지 첨부"
          icon={<Icon as={MdImage} boxSize="18px" />}
          size="sm"
          variant="ghost"
          color={uploadedFiles.length > 0 ? openColors.blue[5] : "gray.500"}
          isLoading={isUploading}
          isDisabled={uploadedFiles.length >= MAX_ATTACHMENTS}
          onClick={onImageClick}
        />
      </Tooltip>
      {uploadedFiles.length > 0 && (
        <Text fontSize="xs" color="gray.500">
          {uploadedFiles.length}/{MAX_ATTACHMENTS}
        </Text>
      )}
      <FormControl display="flex" alignItems="center" w="auto" gap={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <FormLabel
            htmlFor={anonymousId}
            mb="0"
            fontSize="sm"
            cursor="pointer"
          >
            익명
          </FormLabel>
          <Switch
            id={anonymousId}
            size="sm"
            isChecked={isAnonymous}
            onChange={onToggleAnonymous}
          />
        </Box>
        <Tooltip
          hasArrow
          label="비밀댓글은 나와 게시글 작성자만 볼 수 있어요!"
          bg={openColors.gray[7]}
          closeDelay={1000}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <FormLabel htmlFor={secretId} mb="0" fontSize="sm" cursor="pointer">
              비밀
            </FormLabel>
            <Switch
              id={secretId}
              size="sm"
              isChecked={isSecret}
              onChange={onToggleSecret}
            />
          </Box>
        </Tooltip>
      </FormControl>
    </Flex>
  );
};

/* ── 댓글 입력 ── */
export const CommentInput = () => {
  const { postId } = useParams();
  const [value, setValue] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSecret, setIsSecret] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { writeCommentTrue } = useWriteCommentState();
  const { hasAuth, userInfo } = useUserState();
  const { goToLoginPage } = useNavigatePage();

  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  const checkAuth = () => {
    if (!hasAuth) {
      alert("로그인이 필요합니다.");
      goToLoginPage();
      return false;
    }
    return true;
  };

  const postCommentMutation = usePostCommentMutation(postId);
  const queryClient = useQueryClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remaining = MAX_ATTACHMENTS - uploadedFiles.length;
    if (remaining <= 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.slice(0, remaining).forEach((f) => formData.append("files", f));
      const result = await postFile(formData);
      setUploadedFiles((prev) => [...prev, ...result.fileMetaDataList]);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    postCommentMutation.mutate(
      {
        postId: Number(postId),
        contents: value,
        isAnonymous,
        isReadOnlyAuthor: isSecret,
        attachmentIds: uploadedFiles.map((f) => f.fileMetaDataId),
      },
      {
        onSuccess: () => {
          setIsAnonymous(false);
          setValue("");
          setIsSecret(false);
          setUploadedFiles([]);
          writeCommentTrue();
          queryClient.invalidateQueries(["comments", postId]);
        },
      }
    );
  };

  return (
    <Box px={{ base: "12px", md: "16px" }} py="16px">
      <Flex gap={3} alignItems="flex-start">
        <GradientAvatar
          size="sm"
          name={userInfo.nickname}
          src={userInfo.profileImageUrl ?? undefined}
          glow={false}
        />
        <Box flex={1}>
          <Textarea
            placeholder="댓글을 입력해주세요."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={(e) => {
              if (!checkAuth()) e.target.blur();
            }}
            rows={3}
            resize="vertical"
            borderColor={borderColor}
            borderRadius="md"
            focusBorderColor={openColors.blue[5]}
            _focus={{ boxShadow: `0 0 0 1px ${openColors.blue[5]}` }}
          />
          <ImagePreview
            files={uploadedFiles}
            onRemove={(id) =>
              setUploadedFiles((p) => p.filter((f) => f.fileMetaDataId !== id))
            }
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            flexWrap="wrap"
            gap={2}
          >
            <CommentActionBar
              uploadedFiles={uploadedFiles}
              isUploading={isUploading}
              isAnonymous={isAnonymous}
              isSecret={isSecret}
              onImageClick={() => checkAuth() && fileInputRef.current?.click()}
              onToggleAnonymous={() => setIsAnonymous((v) => !v)}
              onToggleSecret={() => setIsSecret((v) => !v)}
              anonymousId="comment-anonymous"
              secretId="comment-secret"
            />
            <Button
              size="sm"
              colorScheme="blue"
              isLoading={postCommentMutation.isLoading}
              loadingText="등록중"
              isDisabled={!value.trim()}
              onClick={handleSubmit}
            >
              댓글 등록
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

/* ── 답글 입력 ── */
interface SubCommentInputProps {
  superCommentId: number;
  tagCommentId: number;
  tagAuthorName?: string | null;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  setIsWriteState: React.Dispatch<React.SetStateAction<number | null>>;
}

export const SubCommentInput = ({
  superCommentId,
  tagCommentId,
  tagAuthorName,
  inputRef,
  setIsWriteState,
}: SubCommentInputProps) => {
  const { postId } = useParams<{ postId: string }>();
  const { mutate: postReplyMutate, isLoading: isPostReplyLoading } =
    usePostReplyMutation(postId);
  const queryClient = useQueryClient();
  const { userInfo } = useUserState();

  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSecret, setIsSecret] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remaining = MAX_ATTACHMENTS - uploadedFiles.length;
    if (remaining <= 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.slice(0, remaining).forEach((f) => formData.append("files", f));
      const result = await postFile(formData);
      setUploadedFiles((prev) => [...prev, ...result.fileMetaDataList]);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    postReplyMutate(
      {
        postId: Number(postId),
        superCommentId,
        tagCommentId,
        contents: text,
        isAnonymous,
        isReadOnlyAuthor: isSecret,
        attachmentIds: uploadedFiles.map((f) => f.fileMetaDataId),
      },
      {
        onSuccess: () => {
          setText("");
          setIsAnonymous(false);
          setIsSecret(false);
          setUploadedFiles([]);
          setIsWriteState(null);
          queryClient.invalidateQueries(["comments", postId]);
        },
      }
    );
  };

  return (
    <Box px={{ base: "12px", md: "16px" }} py="12px">
      {tagAuthorName && (
        <Flex alignItems="center" gap={1} mb={2}>
          <Icon as={BsArrowReturnRight} color="gray.500" boxSize="0.8rem" />
          <Text fontSize="xs" color="blue.500" fontWeight="medium">
            @{tagAuthorName} 님에게 답글
          </Text>
        </Flex>
      )}
      <Flex gap={2} alignItems="flex-start">
        <GradientAvatar
          size="xs"
          name={userInfo.nickname}
          src={userInfo.profileImageUrl ?? undefined}
          glow={false}
        />
        <Box flex={1}>
          <Textarea
            placeholder="답글을 입력해주세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            resize="vertical"
            borderColor={borderColor}
            borderRadius="md"
            focusBorderColor={openColors.blue[5]}
            _focus={{ boxShadow: `0 0 0 1px ${openColors.blue[5]}` }}
            ref={inputRef}
            autoFocus
          />
          <ImagePreview
            files={uploadedFiles}
            onRemove={(id) =>
              setUploadedFiles((p) => p.filter((f) => f.fileMetaDataId !== id))
            }
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mt={1.5}
            flexWrap="wrap"
            gap={2}
          >
            <CommentActionBar
              uploadedFiles={uploadedFiles}
              isUploading={isUploading}
              isAnonymous={isAnonymous}
              isSecret={isSecret}
              onImageClick={() => fileInputRef.current?.click()}
              onToggleAnonymous={() => setIsAnonymous((v) => !v)}
              onToggleSecret={() => setIsSecret((v) => !v)}
              anonymousId="reply-anonymous"
              secretId="reply-secret"
            />
            <Flex gap={2}>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setIsWriteState(null)}
              >
                취소
              </Button>
              <Button
                size="xs"
                colorScheme="blue"
                isLoading={isPostReplyLoading}
                loadingText="등록중"
                isDisabled={!text.trim()}
                onClick={handleSubmit}
              >
                답글 등록
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

/* ── 댓글/답글 수정 입력 ── */
interface CommentModifyInputProps {
  commentId: number;
  commentContent: string;
  existingAttachments?: Attachment[];
  isComment: boolean;
  setIsModify: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}

export const CommentModifyInput = ({
  commentId,
  commentContent,
  existingAttachments = [],
  isComment,
  setIsModify,
  inputRef,
}: CommentModifyInputProps) => {
  const { postId } = useParams<{ postId: string }>();
  const { mutate: putCommentMutate, isLoading: isPutLoading } =
    usePutCommentMutation(postId);
  const { mutate: putSubCommentMutate, isLoading: isPutSubCommentLoading } =
    usePutReplyMutation(postId);
  const queryClient = useQueryClient();
  const { userInfo } = useUserState();

  const [text, setText] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [inputRef]);

  useEffect(() => {
    setText(commentContent);
    setUploadedFiles(existingAttachments);
  }, [commentContent]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const remaining = MAX_ATTACHMENTS - uploadedFiles.length;
    if (remaining <= 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(e.target.files)
        .slice(0, remaining)
        .forEach((f) => formData.append("files", f));
      const result = await postFile(formData);
      setUploadedFiles((prev) => [...prev, ...result.fileMetaDataList]);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    const data = {
      contents: text,
      isReadOnlyAuthor: isSecret,
      attachmentIds: uploadedFiles.map((f) => f.fileMetaDataId),
    };
    const onSuccess = () => {
      setIsModify(false);
      setText("");
      setIsSecret(false);
      queryClient.invalidateQueries(["comments", postId]);
    };
    if (isComment)
      putCommentMutate({ commentId, putCommentData: data }, { onSuccess });
    else
      putSubCommentMutate(
        { replyId: commentId, putReplyData: data },
        { onSuccess }
      );
  };

  return (
    <Box py="8px">
      <Flex gap={2} alignItems="flex-start">
        <GradientAvatar
          size="xs"
          name={userInfo.nickname}
          src={userInfo.profileImageUrl ?? undefined}
          glow={false}
        />
        <Box flex={1}>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            resize="vertical"
            borderColor={borderColor}
            borderRadius="md"
            focusBorderColor={openColors.blue[5]}
            ref={inputRef}
          />
          <ImagePreview
            files={uploadedFiles}
            onRemove={(id) =>
              setUploadedFiles((p) => p.filter((f) => f.fileMetaDataId !== id))
            }
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <Flex
            justifyContent="space-between"
            alignItems="center"
            mt={1.5}
            flexWrap="wrap"
            gap={2}
          >
            <Flex alignItems="center" gap={2}>
              <Tooltip
                hasArrow
                label={
                  uploadedFiles.length >= MAX_ATTACHMENTS
                    ? `최대 ${MAX_ATTACHMENTS}장`
                    : "이미지 첨부"
                }
              >
                <IconButton
                  aria-label="이미지 첨부"
                  icon={<Icon as={MdImage} boxSize="18px" />}
                  size="sm"
                  variant="ghost"
                  color={
                    uploadedFiles.length > 0 ? openColors.blue[5] : "gray.500"
                  }
                  isLoading={isUploading}
                  isDisabled={uploadedFiles.length >= MAX_ATTACHMENTS}
                  onClick={() => fileInputRef.current?.click()}
                />
              </Tooltip>
              <Box display="flex" alignItems="center" gap={1}>
                <FormLabel
                  htmlFor="modify-secret"
                  mb="0"
                  fontSize="sm"
                  cursor="pointer"
                >
                  비밀
                </FormLabel>
                <Switch
                  id="modify-secret"
                  size="sm"
                  isChecked={isSecret}
                  onChange={() => setIsSecret((v) => !v)}
                />
              </Box>
            </Flex>
            <Flex gap={2}>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setIsModify(false)}
              >
                취소
              </Button>
              <Button
                size="xs"
                colorScheme="blue"
                isLoading={isPutLoading || isPutSubCommentLoading}
                loadingText="수정중"
                isDisabled={!text.trim()}
                onClick={handleSubmit}
              >
                수정
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};
