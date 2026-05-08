import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { BsFunnel, BsPencil, BsSortDown } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { RecruitSortType } from "@/api/recruit";
import { userState } from "@/store/user";

interface Props {
  typeFilter: string | undefined;
  sort: RecruitSortType;
  onTypeChange: (type: string | undefined) => void;
  onSortChange: (sort: RecruitSortType) => void;
}

export const MobileRecruitBottomMenu = ({
  typeFilter,
  sort,
  onTypeChange,
  onSortChange,
}: Props) => {
  const navigate = useNavigate();
  const userInfo = useRecoilValue(userState);
  const filterDrawer = useDisclosure();
  const sortDrawer = useDisclosure();

  const color = useColorModeValue("gray.7", "whiteAlpha.800");
  const navBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  const currentTypeLabel =
    typeFilter === "RECRUIT" ? "구인" : typeFilter === "SEEK" ? "구직" : "전체";

  return (
    <>
      <Flex
        position="fixed"
        bottom="0"
        w="full"
        justifyContent="space-around"
        borderTop="2px"
        bgColor={navBgColor}
        borderColor={borderColor}
        p="0.5rem"
        zIndex={10}
      >
        {/* 필터 */}
        <Flex
          direction="column"
          alignItems="center"
          color={color}
          cursor="pointer"
          onClick={filterDrawer.onOpen}
        >
          <Icon as={BsFunnel} />
          <Text fontSize="sm">{currentTypeLabel}</Text>
        </Flex>

        {/* 정렬 */}
        <Flex
          direction="column"
          alignItems="center"
          color={color}
          cursor="pointer"
          onClick={sortDrawer.onOpen}
        >
          <Icon as={BsSortDown} />
          <Text fontSize="sm">
            {sort === "LATEST"
              ? "최신순"
              : sort === "DEADLINE"
              ? "마감임박"
              : "조회순"}
          </Text>
        </Flex>

        {/* 글쓰기 */}
        {userInfo.userId ? (
          <Flex
            direction="column"
            alignItems="center"
            color={color}
            cursor="pointer"
            onClick={() => navigate("/recruit/write")}
          >
            <Icon as={BsPencil} />
            <Text fontSize="sm">글쓰기</Text>
          </Flex>
        ) : (
          <Flex direction="column" alignItems="center" color="gray.300">
            <Icon as={BsPencil} />
            <Text fontSize="sm">글쓰기</Text>
          </Flex>
        )}
      </Flex>

      {/* 필터 Drawer */}
      <Drawer
        isOpen={filterDrawer.isOpen}
        placement="bottom"
        onClose={filterDrawer.onClose}
      >
        <DrawerOverlay />
        <DrawerContent color={color}>
          <DrawerCloseButton />
          <DrawerHeader>유형 필터</DrawerHeader>
          <DrawerBody pb="2rem">
            <RadioGroup
              value={typeFilter ?? ""}
              onChange={(v) => {
                onTypeChange(v === "" ? undefined : v);
                filterDrawer.onClose();
              }}
            >
              <Stack spacing={3}>
                <Radio value="">전체</Radio>
                <Radio value="RECRUIT">구인</Radio>
                <Radio value="SEEK">구직</Radio>
              </Stack>
            </RadioGroup>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* 정렬 Drawer */}
      <Drawer
        isOpen={sortDrawer.isOpen}
        placement="bottom"
        onClose={sortDrawer.onClose}
      >
        <DrawerOverlay />
        <DrawerContent color={color}>
          <DrawerCloseButton />
          <DrawerHeader>정렬</DrawerHeader>
          <DrawerBody pb="2rem">
            <RadioGroup
              value={sort}
              onChange={(v) => {
                onSortChange(v as RecruitSortType);
                sortDrawer.onClose();
              }}
            >
              <Stack spacing={3}>
                <Radio value="LATEST">최신순</Radio>
                <Radio value="DEADLINE">마감임박순</Radio>
                <Radio value="VIEWS">조회순</Radio>
              </Stack>
            </RadioGroup>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};
