import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Checkbox,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  StackDivider,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { PostDetail } from "@types";
import React, { useState } from "react";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";

import {
  useAnonymousAndPined,
  usePasswordInput,
  useSelectCategory,
  useSelectDisclosure,
} from "@/hooks";
import { useMenu } from "@/hooks/useMenu";
import { modifyPostState, writePostState } from "@/store";
import { openColors } from "@/styles";

interface PasswordInputProps {
  password: string;
  show: boolean;
  handleClick: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput = ({
  password,
  show,
  handleClick,
  handleChange,
}: PasswordInputProps) => {
  return (
    <InputGroup size="sm">
      <Input
        pr="4rem"
        type={show ? "text" : "password"}
        onChange={handleChange}
        value={password}
        placeholder="비밀번호를 입력해주세요."
      />
      <InputRightElement>
        <Tooltip
          label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
          closeDelay={2000}
        >
          <IconButton
            variant="ghost"
            aria-label="비밀번호 보기"
            _hover={{ bgColor: "transparent" }}
            size="sm"
            onClick={handleClick}
            icon={show ? <BsEyeSlashFill /> : <BsEyeFill />}
          />
        </Tooltip>
      </InputRightElement>
    </InputGroup>
  );
};

interface CategoryAndPrivacySettingProps {
  postData: PostDetail | undefined;
  isModified: boolean;
  onClickRegistration?: () => void;
}

const privacyOptions = [
  { kor: "전체", value: "모든 사용자가 볼 수 있습니다.", eng: "PUBLIC" },
  { kor: "금오인", value: "인증된 금오인만 볼 수 있습니다.", eng: "KUMOH" },
  { kor: "비밀", value: "비밀글입니다.", eng: "PRIVACY" },
];

export const CategoryAndPrivacySetting = ({
  postData,
  isModified,
  onClickRegistration,
}: CategoryAndPrivacySettingProps) => {
  const { getCurrentMenu } = useMenu();
  const navigate = useNavigate();
  const [writePost, setWritePost] = useRecoilState(writePostState);
  const [modifyPost, setModifyPost] = useRecoilState(modifyPostState);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [prevOption, setPrevOption] = useState({
    category: postData?.category || {
      categoryId: -1,
      name: "카테고리",
    },
    active: postData?.exposeType || "전체",
    subscript: privacyOptions[0].value,
    password: "",
    pined: postData?.isPined || false,
    isAnonymous: false,
  });
  const { selectedCategory, setSelectedCategory, selectOption } =
    useSelectCategory(
      isModified,
      postData?.category || { categoryId: -1, name: "" }
    );
  const { subscript, setSubscript, active, setActive, onClickDisclosure } =
    useSelectDisclosure(
      privacyOptions.find((value) => value.eng === postData?.exposeType)?.kor ||
        "전체",
      isModified
    );
  const { password, setPassword, show, handleClick, handleChange } =
    usePasswordInput(isModified);
  const {
    isAnonymous,
    setIsAnonymous,
    isPined,
    setIsPined,
    onClickAnonymous,
    onClickPined,
    isOldVersion,
    onClickOldVersion,
  } = useAnonymousAndPined(isModified, postData?.isPined || false);

  const settingClick = () => {
    setPrevOption({
      category: selectedCategory,
      active: active,
      pined: isPined,
      subscript,
      password,
      isAnonymous,
    });

    onClose();
  };

  const cancelClick = () => {
    setSelectedCategory(prevOption.category);
    setActive(prevOption.active);
    setSubscript(prevOption.subscript);
    setPassword(prevOption.password);
    setIsAnonymous(prevOption.isAnonymous);
    setIsPined(prevOption.pined);

    if (!isModified) {
      setWritePost({
        ...writePost,
        categoryId: prevOption.category.categoryId,
        pined: prevOption.pined,
        exposeOption: {
          name:
            privacyOptions.find((value) => value.kor === prevOption.active)
              ?.eng || "PUBLIC",
          password: prevOption.password,
        },
      });
    } else {
      setModifyPost({
        ...modifyPost,
        categoryId: prevOption.category.categoryId,
        pined: prevOption.pined,
        exposeOption: {
          name:
            privacyOptions.find((value) => value.kor === prevOption.active)
              ?.eng || "PUBLIC",
          password: prevOption.password,
        },
      });
    }
    onClose();
  };

  const color = useColorModeValue("gray.7", "whiteAlpha.800");

  return (
    <Center h="60px">
      <ButtonGroup gap="2.5rem">
        <Button
          onClick={() => {
            navigate(-1);
          }}
          variant="link"
          color="red.500"
        >
          취소
        </Button>
        <Button variant="link" onClick={onOpen}>
          {selectedCategory.name === "" ? "카테고리" : selectedCategory.name} /
          {active === "" ? " 공개범위 " : ` ${active} `}
          설정
        </Button>
        <Button variant="link" color="blue.500" onClick={onClickRegistration}>
          등록
        </Button>
      </ButtonGroup>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent color={color}>
          <ModalHeader>카테고리 / 공개범위 설정</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box my="15px">
              <Heading as="h4" size="sm" pb="4px">
                카테고리
              </Heading>
              <Select
                py="4px"
                onChange={selectOption}
                _hover={{ borderColor: "blue.500" }}
                value={selectedCategory.name}
              >
                <option value="" hidden>
                  카테고리
                </option>
                {getCurrentMenu()?.subMenu.map((option) => (
                  <option
                    key={option.name}
                    id={String(option.menuId)}
                    value={option.name}
                  >
                    {option.name}
                  </option>
                ))}
              </Select>
            </Box>

            <Box my="16px">
              <Box display="flex">
                <Heading as="h4" size="sm" pb="4px">
                  공개범위
                </Heading>
                <Text p="3px 0 0 3px" fontSize="xs">
                  {subscript}
                </Text>
              </Box>

              <HStack
                spacing="0"
                divider={<StackDivider borderColor={`${openColors.gray[3]}`} />}
                mb="0.25rem"
                border={`1px solid ${openColors.gray[3]}`}
              >
                {privacyOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={active === option.kor ? "primary" : "outline"}
                    flexGrow="1"
                    borderRadius="0"
                    w="150px"
                    border="none"
                    onClick={onClickDisclosure}
                  >
                    {option.kor}
                  </Button>
                ))}
              </HStack>
              {active === "비밀" ? (
                <PasswordInput
                  password={password}
                  show={show}
                  handleClick={handleClick}
                  handleChange={handleChange}
                />
              ) : (
                ""
              )}
            </Box>
            <HStack display="flex" wordBreak="keep-all">
              <Checkbox
                display={isModified ? "none" : "inline-flex"}
                size="md"
                borderRadius="3px"
                borderColor="gray.5"
                color={color}
                isChecked={isAnonymous}
                onChange={onClickAnonymous}
              >
                익명글 작성
              </Checkbox>
              <Checkbox
                size="md"
                borderRadius="3px"
                borderColor="gray.5"
                color={color}
                isChecked={isPined}
                onChange={onClickPined}
              >
                게시글 목록 상단 고정
              </Checkbox>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button variant={"danger"} onClick={cancelClick} mr="8px">
              취소
            </Button>
            <Button variant={"primary"} onClick={settingClick}>
              설정
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
};

export const DesktopCategoryAndPrivacySetting = ({
  postData,
  isModified,
}: CategoryAndPrivacySettingProps) => {
  const { getCurrentMenu } = useMenu();

  const { selectedCategory, selectOption } = useSelectCategory(
    isModified,
    postData?.category || { categoryId: -1, name: "" }
  );
  const { subscript, active, onClickDisclosure } = useSelectDisclosure(
    privacyOptions.find((value) => value.eng === postData?.exposeType)?.kor ||
      "전체",
    isModified
  );
  const { password, show, handleClick, handleChange } =
    usePasswordInput(isModified);
  const {
    isAnonymous,
    setIsAnonymous,
    isPined,
    setIsPined,
    onClickAnonymous,
    onClickPined,
    isOldVersion,
    onClickOldVersion,
  } = useAnonymousAndPined(isModified, postData?.isPined || false);

  const categoryOptions = getCurrentMenu()?.subMenu;

  const color = useColorModeValue("gray.7", "whiteAlpha.800");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  return (
    <Flex
      maxW="100%"
      minHeight="75px"
      margin="60px auto 0 auto"
      borderY={`1px solid`}
      borderColor={borderColor}
      justifyContent="space-between"
    >
      <Box my="10px" color={color}>
        <Heading as="h4" size="md" pb="4px">
          카테고리
        </Heading>
        <Select
          py="8px"
          w="20rem"
          maxW="260px"
          border={`1px solid ${openColors.gray[3]}`}
          borderRadius="5"
          onChange={selectOption}
          _hover={{ borderColor: openColors.blue[5] }}
          value={selectedCategory.name}
        >
          <option value="" hidden>
            카테고리
          </option>
          {categoryOptions?.map((option, idx) => (
            <option
              key={option.name + idx}
              id={String(option.menuId)}
              value={option.name}
            >
              {option.name}
            </option>
          ))}
        </Select>
      </Box>
      <Box my="10px" maxW="344px" color={color}>
        <Box display="flex">
          <Heading as="h4" size="md" pb="4px" pr="4px">
            공개범위
          </Heading>
          <Text h="fit-content" pt="5px" fontSize="sm">
            {subscript}
          </Text>
        </Box>

        <HStack
          spacing="0"
          mb="0.25rem"
          border={`1px solid ${openColors.gray[3]}`}
          divider={<StackDivider borderColor={borderColor} />}
        >
          {privacyOptions.map((option) => (
            <Button
              key={option.value}
              variant={active === option.kor ? "primary" : "outline"}
              flexGrow="1"
              borderRadius="0"
              border="none"
              w="150px"
              onClick={onClickDisclosure}
            >
              {option.kor}
            </Button>
          ))}
        </HStack>
        {active === "비밀" ? (
          <PasswordInput
            password={password}
            show={show}
            handleClick={handleClick}
            handleChange={handleChange}
          />
        ) : (
          ""
        )}
      </Box>
      <Box my="auto" mr="32px" color={color}>
        <Heading as="h4" size="md" pb="8px">
          추가 설정
        </Heading>
        <VStack
          py={isModified ? "8px" : "0"}
          align="start"
          spacing="1px"
          wordBreak="keep-all"
        >
          <Checkbox
            display={isModified ? "none" : "inline-flex"}
            size="md"
            borderRadius="3px"
            borderColor="gray.5"
            color={color}
            isChecked={isAnonymous}
            onChange={onClickAnonymous}
          >
            익명글 작성
          </Checkbox>
          <Checkbox
            size="md"
            borderRadius="3px"
            borderColor="gray.5"
            color={color}
            isChecked={isPined}
            onChange={onClickPined} // 게시글 수정 시 체크되어 있을 수도 있어야 함
          >
            리스트 상단 고정
          </Checkbox>
        </VStack>
      </Box>
    </Flex>
  );
};
