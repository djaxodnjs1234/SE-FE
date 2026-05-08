import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { IconType } from "react-icons";
import {
  BsExclamationCircle,
  BsPencilSquare,
  BsShare,
  BsThreeDotsVertical,
  BsTrash3,
} from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";

import { useMenu } from "@/hooks/useMenu";
import {
  useDeletePostMutation,
  useReportCommentMutation,
  useReportPost,
} from "@/react-query/hooks";
import {
  useDeleteCommentMutation,
  useDeleteReplyMutation,
} from "@/react-query/hooks";
import { useUserState } from "@/store/user";
import { openColors } from "@/styles";
import { errorHandle } from "@/utils/errorHandling";
interface MoreButtonProps {
  fontSize?: string;
  menuItems: {
    name: string;
    onClick: () => void;
    isWriter: boolean;
    icon: IconType;
  }[];
}

export const MoreButton = ({ fontSize, menuItems }: MoreButtonProps) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="더보기 버튼"
        icon={<BsThreeDotsVertical />}
        fontSize={fontSize || "24px"}
        mx="1vw"
        backgroundColor={openColors.white}
        _hover={{ backgroundColor: openColors.white }}
        _expanded={{ backgroundColor: openColors.white }}
      />
      <MenuList minWidth="120px" shadow="xl">
        {menuItems.map(
          (item) =>
            item.isWriter && (
              <MenuItem
                key={item.name}
                icon={<item.icon />}
                onClick={item.onClick}
                maxW="120px"
              >
                {item.name}
              </MenuItem>
            )
        )}
      </MenuList>
    </Menu>
  );
};

const PostModifyMenuItem = ({ postId }: { postId: number }) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const modifyCancelRef = React.useRef<HTMLButtonElement>(null);
  const { getCurrentMenu } = useMenu();

  const postModifyClick = () => {
    onClose();

    const menuName = getCurrentMenu()?.urlId;

    navigate(`/${menuName}/${postId}/modify`);
  };

  return (
    <>
      <MenuItem icon={<BsPencilSquare />} onClick={onOpen} maxW="120px">
        수정
      </MenuItem>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={modifyCancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              게시글 수정
            </AlertDialogHeader>
            <AlertDialogBody>작성글을 수정하시겠습니까?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={modifyCancelRef} onClick={onClose}>
                취소
              </Button>
              <Button variant="primary" onClick={postModifyClick} ml="8px">
                수정
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const PostDeleteAlert = ({ postId }: { postId: number }) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteAlertRef = React.useRef<HTMLButtonElement>(null);
  const { mutate: deleteMutate, isLoading } = useDeletePostMutation();

  const postDeleteClick = () => {
    deleteMutate(postId, {
      onSuccess: () => {
        onClose();
        navigate(-1);
      },
      onError: (error) => {
        onClose();
        errorHandle(error);
      },
    });
  };

  return (
    <>
      <MenuItem icon={<BsTrash3 />} onClick={onOpen} maxW="120px">
        삭제
      </MenuItem>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={deleteAlertRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              삭제
            </AlertDialogHeader>
            <AlertDialogBody>작성글을 삭제하시겠습니까?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteAlertRef} onClick={onClose}>
                취소
              </Button>
              <Button
                isLoading={isLoading}
                loadingText="삭제 중"
                variant="danger"
                onClick={postDeleteClick}
                ml="8px"
              >
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const PostReportAlert = ({ postId }: { postId: number }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutate, isLoading } = useReportPost();
  const reportAlertRef = React.useRef<HTMLButtonElement>(null);

  const toast = useToast();

  const commentReportClick = () => {
    mutate(postId, {
      onSuccess: () => {
        onClose();

        toast({
          title: "게시글 신고",
          description: "해당 게시글을 신고했어요!",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
      onError: (error) => {
        onClose();
        errorHandle(error);
      },
    });
  };

  return (
    <>
      <MenuItem icon={<BsExclamationCircle />} onClick={onOpen} maxW="120px">
        신고
      </MenuItem>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={reportAlertRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              신고
            </AlertDialogHeader>
            <AlertDialogBody> 해당 게시글을 신고하시겠습니까?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={reportAlertRef} onClick={onClose}>
                취소
              </Button>
              <Button
                variant="danger"
                onClick={commentReportClick}
                isLoading={isLoading}
                loadingText="신고 중"
                ml="8px"
              >
                신고
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const PostShareMenuItem = ({ onShareClick }: { onShareClick: () => void }) => {
  return (
    <MenuItem icon={<BsShare />} onClick={onShareClick} maxW="120px">
      공유
    </MenuItem>
  );
};

export const PostMoreButton = ({
  postId,
  isEditable,
}: {
  postId: number;
  isEditable: boolean;
}) => {
  const toast = useToast();
  const { hasAuth } = useUserState();

  const onShareClick = () => {
    const url = window.location.href;

    navigator.clipboard.writeText(url).then(
      () => {
        toast({
          title: "URL이 복사되었습니다.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      },
      (err) => {
        toast({
          title: "URL 복사에 실패했습니다.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    );
  };

  const hoverBgColor = useColorModeValue("blackAlpha.300", "whiteAlpha.300");

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="더보기 버튼"
        icon={<BsThreeDotsVertical />}
        fontSize="24px"
        mx="1vw"
        backgroundColor="transparent"
        _hover={{ backgroundColor: hoverBgColor }}
        _expanded={{ backgroundColor: hoverBgColor }}
      />
      <MenuList minWidth="120px" shadow="xl">
        {isEditable ? (
          <>
            <PostModifyMenuItem postId={postId} />
            <PostDeleteAlert postId={postId} />
            <PostShareMenuItem onShareClick={onShareClick} />
          </>
        ) : (
          <>
            <PostShareMenuItem onShareClick={onShareClick} />
            {hasAuth && <PostReportAlert postId={postId} />}
          </>
        )}
      </MenuList>
    </Menu>
  );
};

interface CommentMoreButtonProps {
  isEditable: boolean;
  setIsModify: React.Dispatch<React.SetStateAction<boolean>>;
  commentId: number;
  isReply: boolean;
}

const CommentDeleteAlert = ({
  commentId,
  isReply,
  postId,
}: {
  commentId: number;
  isReply: boolean;
  postId?: string;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const queryClient = useQueryClient();

  const deleteAlertRef = React.useRef<HTMLButtonElement>(null);

  const { mutate: deleteMutate, isLoading: commentDeleteIsLoading } =
    useDeleteCommentMutation(postId);
  const { mutate: deleteReplyMutate, isLoading: deleteReplyIsLoading } =
    useDeleteReplyMutation(postId);

  const commentDeleteClick = () => {
    if (!isReply) {
      deleteMutate(commentId, {
        onSuccess: () => {
          onClose();

          queryClient.invalidateQueries(["comments", postId]);
        },
        onError: (error) => {
          errorHandle(error);
          onClose();
        },
      });
    } else {
      deleteReplyMutate(commentId, {
        onSuccess: () => {
          onClose();
          queryClient.invalidateQueries(["comments", postId]);
        },
        onError: (error) => {
          errorHandle(error);
          onClose();
        },
      });
    }
  };

  return (
    <>
      <MenuItem icon={<BsTrash3 />} onClick={onOpen} maxW="120px">
        삭제
      </MenuItem>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={deleteAlertRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              삭제
            </AlertDialogHeader>
            <AlertDialogBody>댓글을 삭제하시겠습니까?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteAlertRef} onClick={onClose}>
                취소
              </Button>
              <Button
                isLoading={commentDeleteIsLoading || deleteReplyIsLoading}
                loadingText="삭제 중"
                variant="danger"
                onClick={commentDeleteClick}
                ml="8px"
              >
                삭제
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const CommentReportAlert = ({ commentId }: { commentId: number }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasAuth } = useUserState();
  const reportAlertRef = React.useRef<HTMLButtonElement>(null);

  const { mutate } = useReportCommentMutation();

  const toast = useToast();

  const commentReportClick = () => {
    if (!hasAuth) {
      onClose();
      alert("로그인 후 신고가능합니다.");
    }

    mutate(commentId, {
      onSuccess: () => {
        onClose();
        toast({
          description: "해당 댓글을 신고했어요!",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  return (
    <>
      <MenuItem icon={<BsExclamationCircle />} onClick={onOpen} maxW="120px">
        신고
      </MenuItem>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={reportAlertRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              신고
            </AlertDialogHeader>
            <AlertDialogBody> 해당 댓글을 신고하시겠습니까?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={reportAlertRef} onClick={onClose}>
                취소
              </Button>
              <Button variant="danger" onClick={commentReportClick} ml="8px">
                신고
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export const CommentMoreButton = ({
  isEditable,
  setIsModify,
  commentId,
  isReply,
}: CommentMoreButtonProps) => {
  const commentModifyClick = () => {
    setIsModify(true);
  };
  const { postId } = useParams();

  const hoverBgColor = useColorModeValue("blackAlpha.300", "whiteAlpha.300");

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="더보기 버튼"
        icon={<BsThreeDotsVertical />}
        fontSize="16px"
        mx="1vw"
        backgroundColor="transparent"
        _hover={{ backgroundColor: hoverBgColor }}
        _expanded={{ backgroundColor: hoverBgColor }}
      />
      <MenuList minWidth="120px" shadow="xl">
        {isEditable ? (
          <>
            <MenuItem
              icon={<BsPencilSquare />}
              onClick={commentModifyClick}
              maxW="120px"
            >
              수정
            </MenuItem>
            <CommentDeleteAlert
              commentId={commentId}
              isReply={isReply}
              postId={postId}
            />
          </>
        ) : (
          <>
            <CommentReportAlert commentId={commentId} />
          </>
        )}
      </MenuList>
    </Menu>
  );
};
