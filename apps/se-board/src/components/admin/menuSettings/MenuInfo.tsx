import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  Radio,
  RadioGroup,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { MenuInfomation, MenuRoleInfo } from "@types";
import React, { useCallback, useEffect, useState } from "react";
import { BsExclamationCircleFill } from "react-icons/bs";
import { useSetRecoilState } from "recoil";

import { useGetRoleInfos } from "@/react-query/hooks";
import {
  usePostAddMenuOrCategory,
  usePutCategory,
} from "@/react-query/hooks/useMenu";
import { newSEMenuState } from "@/store/menu";
import { errorHandle } from "@/utils/errorHandling";

import { AuthorityMenu } from "./AuthorityMenu";

interface ValueInputProps {
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  w?: { base: string; md: string };
}

const ValueInput = ({ value, placeholder, onChange, w }: ValueInputProps) => {
  return (
    <Input
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      w={w || { base: "12rem", md: "13rem" }}
      h="2rem"
      ml="0.2rem"
      borderColor="gray.5"
    />
  );
};

interface MenuInfoProps {
  menuInfo: MenuInfomation | undefined;
  menuName: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  menuID: string;
  onIDChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MenuInfo = ({
  menuInfo,
  menuName,
  onNameChange,
  menuID,
  onIDChange,
}: MenuInfoProps) => {
  const { mutate, isLoading } = usePutCategory();
  const { data: roleList } = useGetRoleInfos();

  const setSEMenu = useSetRecoilState(newSEMenuState);

  const queryClient = useQueryClient();

  const toast = useToast();

  const [roles, setRoles] = useState<MenuRoleInfo>({
    access: {
      option: "",
      roles: [],
    },
    write: {
      option: "",
      roles: [],
    },
    manage: {
      option: "",
      roles: [],
    },
    expose: {
      option: "",
      roles: [],
    },
  });

  useEffect(() => {
    if (!menuInfo) return;

    setRoles({
      access: {
        option: menuInfo.access?.option || "",
        roles:
          roleList
            ?.filter((role) => menuInfo.access?.roles.includes(role.name))
            .map((role) => role.roleId) || [],
      },
      write: {
        option: menuInfo.write?.option || "",
        roles:
          roleList
            ?.filter((role) => menuInfo.write?.roles.includes(role.name))
            .map((role) => role.roleId) || [],
      },
      manage: {
        option: menuInfo.manage?.option || "",
        roles:
          roleList
            ?.filter((role) => menuInfo.manage?.roles.includes(role.name))
            .map((role) => role.roleId) || [],
      },
      expose: {
        option: menuInfo.expose?.option || "",
        roles:
          roleList
            ?.filter((role) => menuInfo.expose?.roles.includes(role.name))
            .map((role) => role.roleId) || [],
      },
    });
  }, [menuInfo]);

  function onModifyMenuInfo() {
    if (!menuInfo?.menuId) return alert("존재하지 않는 메뉴입니다.");

    if (!roles) return alert("권한 설정을 해주세요.");

    mutate(
      {
        categoryId: menuInfo.menuId,
        data: {
          name: menuName,
          description: "",
          externalUrl: menuInfo.type === "EXTERNAL" ? menuID : "",
          urlId: menuInfo.type !== "EXTERNAL" ? menuID : "",
          access: roles.access,
          write: roles.write,
          manage: roles.manage,
          expose: roles.expose,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["adminMenuList"]);
          toast({
            title: "메뉴 수정 완료",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setSEMenu(menuName);
        },
      }
    );
  }

  const settingMenu = useCallback(() => {
    type AuthItem = {
      label: string;
      roleType: "expose" | "access" | "write" | "manage";
      disabledList?: string[];
    };
    switch (menuInfo?.type) {
      case "MENU":
        return {
          menuType: "GROUP",
          menuID: "메뉴 ID",
          authority: [
            { label: "메뉴 노출 대상", roleType: "expose" as const },
          ] as AuthItem[],
        };
      case "BOARD":
        return {
          menuType: "BOARD",
          menuID: "메뉴 ID",
          authority: [
            { label: "메뉴 노출 대상", roleType: "expose" as const },
            { label: "게시판 접근 권한", roleType: "access" as const },
          ] as AuthItem[],
        };
      case "EXTERNAL":
        return {
          menuType: "EXTERNAL",
          menuID: "메뉴 URL",
          authority: [
            { label: "메뉴 노출 대상", roleType: "expose" as const },
          ] as AuthItem[],
        };
      case "RECRUIT":
        return {
          menuType: "RECRUIT",
          menuID: "메뉴 ID",
          authority: [
            { label: "메뉴 노출 대상", roleType: "expose" as const },
            { label: "게시판 접근 권한", roleType: "access" as const },
            {
              label: "게시판 작성 권한",
              roleType: "write" as const,
              disabledList: ["all"],
            },
            {
              label: "게시판 관리 권한",
              roleType: "manage" as const,
              disabledList: ["all"],
            },
          ] as AuthItem[],
        };
      default:
        return {
          menuType: "",
          menuID: "메뉴 ID",
          authority: [] as AuthItem[],
        };
    }
  }, [menuInfo]);

  return (
    <Box
      my="20px"
      bgColor="white"
      py="1rem"
      px={{ base: "0.75rem", md: "1rem" }}
      rounded="3xl"
    >
      <Flex alignItems="center">
        <Heading fontSize="xl">메뉴 타입:</Heading>
        <Text px="0.5rem" fontWeight="semibold" fontSize="lg">
          {settingMenu().menuType}
        </Text>
      </Flex>
      <Divider borderColor="gray.6" my="1rem" />
      <Box>
        <Heading fontSize="xl">메뉴 정보</Heading>
        <Flex alignItems="center" mt="0.5rem">
          <Heading fontSize="md" w={{ md: "5rem" }}>
            메뉴 이름:
          </Heading>
          <ValueInput
            value={menuName}
            onChange={onNameChange}
            placeholder="메뉴 이름"
          />
        </Flex>
        <Flex alignItems="center" mt="0.5rem" mb="1rem">
          <Heading fontSize="md" w={{ md: "5rem" }}>
            {settingMenu().menuID}:
          </Heading>
          <ValueInput
            value={menuID}
            onChange={onIDChange}
            placeholder={settingMenu().menuID}
            w={
              menuInfo?.type === "EXTERNAL"
                ? { base: "14rem", md: "16rem" }
                : undefined
            }
          />
        </Flex>
      </Box>
      <Divider borderColor="gray.6" my="1rem" />
      <Box>
        <HStack spacing={1} align="baseline">
          <Heading fontSize="xl">권한 설정</Heading>
          <Tooltip
            label="선택 사용자 설정 시 관리자 권한은 기본 설정됩니다."
            placement="right"
            whiteSpace="nowrap"
            maxW="25rem"
          >
            <span>
              <Icon as={BsExclamationCircleFill} color="blue.6" />
            </span>
          </Tooltip>
        </HStack>
        {settingMenu().authority.map((item) => (
          <Flex key={item.roleType} alignItems="center" mt="0.5rem">
            <Heading fontSize="md" w={{ md: "8.25rem" }}>
              {item.label}
            </Heading>
            <AuthorityMenu
              roleType={item.roleType}
              setRoles={setRoles}
              defaultOption={menuInfo?.[item.roleType]?.option}
              defaultRoles={menuInfo?.[item.roleType]?.roles}
              disabledList={item.disabledList}
            />
          </Flex>
        ))}
      </Box>
      <Box textAlign="right">
        <Button
          variant="primary"
          onClick={onModifyMenuInfo}
          isLoading={isLoading}
          loadingText="저장 중"
        >
          저장
        </Button>
      </Box>
    </Box>
  );
};

export const AddMenuInfo = ({
  menuName,
  onNameChange,
  menuID,
  onIDChange,
}: MenuInfoProps) => {
  const { mutate, isLoading } = usePostAddMenuOrCategory();

  const queryClient = useQueryClient();

  const [menu, setMenu] = useState<string>("GROUP");
  const [roles, setRoles] = useState<MenuRoleInfo>({
    access: {
      option: "",
      roles: [],
    },
    write: {
      option: "",
      roles: [],
    },
    manage: {
      option: "",
      roles: [],
    },
    expose: {
      option: "",
      roles: [],
    },
  });

  const setNewSEMenuState = useSetRecoilState(newSEMenuState);

  const toast = useToast();

  const settingMenu = useCallback(() => {
    switch (menu) {
      case "GROUP":
        return {
          menuID: "메뉴 ID",
          authority: ["메뉴 노출 대상"],
        };
      case "BOARD":
        return {
          menuID: "메뉴 ID",
          authority: ["메뉴 노출 대상", "게시판 접근 권한"],
        };
      case "EXTERNAL":
        return {
          menuID: "메뉴 URL",
          authority: ["메뉴 노출 대상"],
        };
      case "RECRUIT":
        return {
          menuID: "메뉴 ID",
          authority: ["메뉴 노출 대상", "게시판 접근 권한"],
        };
      default:
        return {
          menuType: "",
          menuID: "메뉴 ID",
          authority: [],
        };
    }
  }, [menu]);

  function onMenuAddClick() {
    mutate(
      {
        categoryType: menu === "GROUP" ? "MENU" : menu,
        data: {
          superCategoryId: null,
          name: menuName,
          urlId: menu === "GROUP" || menu === "BOARD" ? menuID : "",
          description: "",
          externalUrl: menu === "EXTERNAL" ? menuID : "",
          access: roles.access,
          write: roles.write,
          manage: roles.manage,
          expose: roles.expose,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "메뉴 생성 완료",
            description: (
              <Box>
                <Text>{menuName} 메뉴가 생성되었어요!</Text>
              </Box>
            ),
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          queryClient.invalidateQueries(["adminMenuList"]);
          setNewSEMenuState(menuName);
        },
        onError: (error) => {
          errorHandle(error);
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
    >
      <Flex alignItems="center">
        <Heading fontSize="xl">메뉴 타입:</Heading>
        <RadioGroup onChange={setMenu} value={menu} ml="1rem">
          <Grid templateColumns="repeat(3, 1fr)" gap="0.5rem">
            <Radio value="GROUP">그룹 메뉴</Radio>
            <Radio value="BOARD">게시판 메뉴</Radio>
            <Radio value="EXTERNAL">외부 링크</Radio>
          </Grid>
        </RadioGroup>
      </Flex>
      <Divider borderColor="gray.6" my="1rem" />
      <Box>
        <Heading fontSize="xl">메뉴 정보</Heading>
        <Flex alignItems="center" mt="0.5rem">
          <Heading fontSize="md" w={{ md: "5rem" }}>
            메뉴 이름:
          </Heading>
          <ValueInput
            value={menuName}
            onChange={onNameChange}
            placeholder="메뉴 이름"
          />
        </Flex>
        <Flex alignItems="center" mt="0.5rem" mb="1rem">
          <Heading fontSize="md" w={{ md: "5rem" }}>
            {settingMenu().menuID}:
          </Heading>
          <ValueInput
            value={menuID}
            onChange={onIDChange}
            placeholder={settingMenu().menuID}
          />
        </Flex>
      </Box>
      <Divider borderColor="gray.6" my="1rem" />
      <Box>
        <Heading fontSize="xl">권한 설정</Heading>
        {settingMenu().authority.map((authorityMenu, index) => (
          <Flex key={index} alignItems="center" mt="0.5rem">
            <Heading fontSize="md" w={{ md: "8.25rem" }}>
              {authorityMenu}
            </Heading>
            <AuthorityMenu
              roleType={index === 0 ? "expose" : "access"}
              setRoles={setRoles}
            />
          </Flex>
        ))}
      </Box>
      <Box textAlign="right">
        <Button
          variant="primary"
          onClick={onMenuAddClick}
          isLoading={isLoading}
          loadingText="저장 중"
        >
          저장
        </Button>
      </Box>
    </Box>
  );
};
