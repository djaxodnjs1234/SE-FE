import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { MenuInfomation, MenuType, PutSubMenu } from "@types";
import { useSetRecoilState } from "recoil";

import { useGetRoleInfos } from "@/react-query/hooks";
import { usePutGroupSubMenu } from "@/react-query/hooks/useMenu";
import { newSEMenuState } from "@/store/menu";

interface SubMenuCardProps {
  menu: MenuInfomation;
  superMenuName: string;
}

type MenuTypeList = {
  [key in MenuType | "ADD" | "NULL"]: string;
};

const menuTypeList: MenuTypeList = {
  MENU: "그룹 메뉴",
  BOARD: "게시판 메뉴",
  EXTERNAL: "외부 링크",
  CATEGORY: "카테고리",
  RECRUIT: "구인구직 메뉴",
  ADD: "추가",
  NULL: "기타",
};

export const SubMenuCard = ({ menu, superMenuName }: SubMenuCardProps) => {
  const { data: roles } = useGetRoleInfos();
  const { mutate, isLoading } = usePutGroupSubMenu();

  const queryClient = useQueryClient();
  const setNewSEMenu = useSetRecoilState(newSEMenuState);

  const toast = useToast();

  const onExcludeClick = () => {
    const accessRole = [];

    if (menu?.access !== null) {
      for (const role of menu?.access.roles || []) {
        const roleId = roles?.find((v) => v.name === role)?.roleId;
        if (roleId) accessRole.push(roleId);
      }
    }

    const exposeRole = [];
    for (const role of menu?.expose.roles || []) {
      const roleId = roles?.find((v) => v.name === role)?.roleId;
      if (roleId) exposeRole.push(roleId);
    }

    const subMenu: PutSubMenu = {
      name: menu.name,
      superMenuId: null,
      description: "",
      urlId: menu.urlId,
      externalUrl: menu.urlId,
      access: menu.access
        ? {
            option: menu.access.option,
            roles: accessRole,
          }
        : null,
      expose: {
        option: menu.expose.option,
        roles: exposeRole,
      },
      write: menu.write ? { option: menu.write.option, roles: [] } : null,
      manage: menu.manage ? { option: menu.manage.option, roles: [] } : null,
    };

    mutate(
      { categoryId: menu.menuId, data: subMenu },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["adminMenuList"]);
          setNewSEMenu(superMenuName);
          toast({
            title: "그룹 메뉴 제외 완료",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        },
      }
    );
  };

  const onMoveClick = () => {
    setNewSEMenu(menu.name);
    queryClient.invalidateQueries(["adminMenuList"]);
    toast({
      title: "메뉴 관리 페이지로 이동합니다.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Card
      w={{ sm: "3rem", md: "16rem" }}
      h={{ sm: "2.5rem", md: "15rem" }}
      shadow="md"
      border="1px solid"
      borderColor="gray.1"
    >
      <CardBody>
        <Stack spacing={{ md: "0.5rem" }}>
          <Heading size={{ md: "lg" }} mb={{ md: "1rem" }}>
            {menu.name}
          </Heading>
          <Text>Menu ID: {menu.menuId}</Text>
          <Text>Menu TYPE: {menuTypeList[menu.type]}</Text>
        </Stack>
      </CardBody>
      <Divider borderColor="gray.5" />
      <CardFooter mx="auto" px="0">
        <ButtonGroup
          display={{ sm: "block", md: "flex" }}
          spacing={{ sm: "0.25rem", md: "0.25rem" }}
        >
          <Button
            variant="primary-outline"
            size="sm"
            _hover={{
              shadow: "xl",
              bgColor: "primary",
              color: "primary-content",
            }}
            onClick={onMoveClick}
          >
            메뉴 관리 이동
          </Button>
          <Button
            variant="danger-outline"
            size="sm"
            _hover={{ shadow: "xl", bgColor: "error", color: "error-content" }}
            onClick={onExcludeClick}
            isLoading={isLoading}
          >
            그룹 메뉴 제외
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};
