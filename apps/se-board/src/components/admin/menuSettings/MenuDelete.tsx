import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Heading,
  Select,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import {
  useDeleteCategory,
  usePostMoveBoardMenu,
} from "@/react-query/hooks/useMenu";
import { boardMenuListState, newSEMenuState } from "@/store/menu";
import { semanticColors } from "@/styles";

interface MenuDeleteProps {
  menuType: string | undefined;
  menuId: number | undefined;
}

export const MenuDelete = ({ menuType, menuId }: MenuDeleteProps) => {
  const boardMenuList = useRecoilValue(boardMenuListState);
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    mutate: moveMutate,
    isLoading: moveIsLoading,
    isSuccess: moveIsSuccess,
    reset: moveReset,
  } = usePostMoveBoardMenu();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toMenuIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!menuId) return;
    moveReset();
  }, [menuId]);

  function onPostsMoveClick() {
    if (!menuId) return alert("현재 게시판을 삭제할 수 없습니다.");

    if (!toMenuIdRef.current)
      return alert("게시글을 이동할 게시판을 선택해주세요.");

    moveMutate(
      {
        fromBoardMenuId: menuId,
        toBoardMenuId: toMenuIdRef.current,
      },
      {
        onSuccess: () => {
          toast({
            title: "게시글 이동 완료",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          queryClient.invalidateQueries(["adminMenuList"]);
        },
      }
    );
  }

  return (
    <Box
      my="20px"
      bgColor="white"
      py="1rem"
      px={{ base: "0.75rem", md: "1rem" }}
      rounded="3xl"
      border="1px solid"
      borderColor="red.5"
    >
      <Heading fontSize="xl" color={semanticColors.error}>
        메뉴 삭제
      </Heading>
      {menuType === "BOARD" && (
        <Box my="1rem">
          <Text>게시글 이동 후 삭제 가능합니다.</Text>
          <Flex alignItems="center" my="0.5rem">
            <Heading fontSize="md" wordBreak="keep-all" textAlign="center">
              게시글 이동
            </Heading>
            <Select
              w="14rem"
              h="2.25rem"
              border="1px solid"
              borderColor="gray.5"
              mx={{ base: "8px", md: "16px" }}
              onChange={(e) => (toMenuIdRef.current = Number(e.target.value))}
            >
              <option value="" hidden>
                게시판
              </option>
              {boardMenuList
                .filter((menu) => menu.menuId !== menuId)
                .map((menu) => (
                  <option key={menu.menuId} value={menu.menuId}>
                    {menu.name}
                  </option>
                ))}
            </Select>
            <Button
              variant="primary"
              size="sm"
              onClick={onPostsMoveClick}
              isLoading={moveIsLoading}
              loadingText="이동 중"
              isDisabled={moveIsSuccess}
            >
              이동
            </Button>
          </Flex>
        </Box>
      )}

      {menuType === "BOARD" && <Divider borderColor="gray.6" my="0.5rem" />}

      <Box>
        {menuType === "BOARD" && (
          <Heading fontSize="md" color={semanticColors.error}>
            메뉴 삭제
          </Heading>
        )}
        <Flex my="0.25rem" alignItems="center">
          {menuType === "RECRUIT" ? (
            <Text wordBreak="keep-all" color={semanticColors.error}>
              구인구직 메뉴는 삭제할 수 없습니다.
            </Text>
          ) : (
            <>
              <Text wordBreak="keep-all">
                메뉴를 삭제하면 다시 복구할 수 없습니다. 신중히 선택해 주세요.
              </Text>
              <Button
                variant="danger"
                ml="1rem"
                size="sm"
                isDisabled={menuType === "BOARD" ? !moveIsSuccess : false}
                onClick={onOpen}
              >
                삭제
              </Button>
            </>
          )}
        </Flex>
      </Box>
      <DeleteAlert
        menuId={menuId}
        isOpen={isOpen}
        onClose={onClose}
        moveReset={moveReset}
      />
    </Box>
  );
};

interface DeleteAlertProps {
  menuId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
  moveReset: () => void;
}

const DeleteAlert = ({
  menuId,
  isOpen,
  onClose,
  moveReset,
}: DeleteAlertProps) => {
  const queryClient = useQueryClient();

  const { mutate: deleteMutate, isLoading: deleteIsLoading } =
    useDeleteCategory();

  const cancelRef = useRef<HTMLButtonElement>(null);

  const setNewSEMenu = useSetRecoilState(newSEMenuState);

  function onMenuDeleteClick() {
    if (!menuId) return alert("현재 게시판을 삭제할 수 없습니다.");

    deleteMutate(menuId, {
      onSuccess: () => {
        setNewSEMenu("");
        queryClient.invalidateQueries(["adminMenuList"]);
        moveReset();
        onClose();
      },
    });
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="xl" fontWeight="bold">
            메뉴 삭제
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text>메뉴 삭제 시 복구가 불가능 합니다.</Text>
            <Text>정말 삭제하시겠습니까?</Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <ButtonGroup>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button
                variant="danger"
                onClick={onMenuDeleteClick}
                isLoading={deleteIsLoading}
                loadingText="삭제 중"
              >
                삭제
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
