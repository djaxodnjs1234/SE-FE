import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Tab,
  TabList,
  Tabs,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useState } from "react";
import {
  BsChevronLeft,
  BsChevronRight,
  BsPlus,
  BsSearch,
} from "react-icons/bs";
import { useDebounce } from "use-debounce";

import { SkillTag } from "@/api/recruit";
import { useSkillTagsPaged } from "@/react-query/hooks/useRecruit";

import { SkillBadge } from "./SkillBadge";

const TABS = [
  "ALL",
  "FRONTEND",
  "BACKEND",
  "DB",
  "INFRA",
  "LANGUAGE",
  "GAME",
  "EMBEDDED",
  "AI",
  "OTHER",
] as const;
const TAB_LABELS: Record<string, string> = {
  ALL: "전체",
  FRONTEND: "프론트",
  BACKEND: "백엔드",
  DB: "DB",
  INFRA: "인프라",
  LANGUAGE: "언어",
  GAME: "게임",
  EMBEDDED: "임베디드",
  AI: "인공지능",
  OTHER: "기타",
};

export interface SelectedSkill {
  id: number;
  name: string;
  iconSlug: string | null;
}

interface SkillTagPickerProps {
  selectedSkills: SelectedSkill[];
  onToggle: (skill: SelectedSkill) => void;
}

export const SkillTagPicker = ({
  selectedSkills,
  onToggle,
}: SkillTagPickerProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [rawKeyword, setRawKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [keyword] = useDebounce(rawKeyword, 300);

  const activeCategory = TABS[tabIndex];
  const selectedIds = new Set(selectedSkills.map((s) => s.id));

  const { data, isLoading } = useSkillTagsPaged({
    category: activeCategory,
    keyword,
    page,
  });

  const popoverBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
  const hoverBg = useColorModeValue("blue.50", "blue.900");
  const selectedBg = useColorModeValue("blue.100", "blue.800");

  const handleTabChange = (idx: number) => {
    setTabIndex(idx);
    setPage(0);
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawKeyword(e.target.value);
    setPage(0);
  };

  const toggle = (skill: SkillTag) => {
    onToggle({ id: skill.id, name: skill.name, iconSlug: skill.iconSlug });
  };

  const totalPages = data?.totalPages ?? 0;

  return (
    <Box>
      {/* 선택된 스킬 */}
      <Flex gap={2} flexWrap="wrap" mb={2} minH="28px" alignItems="center">
        {selectedSkills.map((s) => (
          <SkillBadge
            key={s.id}
            name={s.name}
            iconSlug={s.iconSlug}
            onRemove={() => onToggle(s)}
            mode="normal"
          />
        ))}

        {/* 추가 버튼 */}
        <Popover placement="bottom-start" isLazy>
          <PopoverTrigger>
            <Badge
              as="button"
              colorScheme="gray"
              borderRadius="full"
              px={3}
              py={1}
              display="flex"
              alignItems="center"
              gap={1}
              fontSize="xs"
              cursor="pointer"
            >
              <Icon as={BsPlus} boxSize="0.9rem" />
              기술 스택 추가
            </Badge>
          </PopoverTrigger>
          <PopoverContent
            w="420px"
            bg={popoverBg}
            border="1px solid"
            borderColor={borderColor}
            boxShadow="lg"
          >
            <PopoverHeader fontWeight="semibold" fontSize="sm" pb={2}>
              기술 스택 선택
            </PopoverHeader>
            <PopoverCloseButton />
            <PopoverBody p={3}>
              {/* 검색 */}
              <InputGroup size="sm" mb={2}>
                <InputLeftElement>
                  <Icon as={BsSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="이름 검색..."
                  value={rawKeyword}
                  onChange={handleKeywordChange}
                  borderRadius="md"
                />
              </InputGroup>

              {/* 카테고리 탭 */}
              <Tabs
                size="sm"
                variant="soft-rounded"
                colorScheme="blue"
                index={tabIndex}
                onChange={handleTabChange}
                mb={2}
              >
                <TabList flexWrap="wrap" gap={1}>
                  {TABS.map((tab) => (
                    <Tab key={tab} fontSize="xs" px={2} py={0.5}>
                      {TAB_LABELS[tab]}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>

              {/* 스킬 목록 */}
              <Box minH="120px">
                {isLoading ? (
                  <Flex justifyContent="center" py={6}>
                    <Spinner size="sm" />
                  </Flex>
                ) : (data?.content.length ?? 0) === 0 ? (
                  <Text
                    fontSize="xs"
                    color="gray.400"
                    textAlign="center"
                    py={6}
                  >
                    검색 결과가 없습니다.
                  </Text>
                ) : (
                  <Flex flexWrap="wrap" gap={1.5}>
                    {data?.content.map((skill) => {
                      const isSel = selectedIds.has(skill.id);
                      return (
                        <Box
                          key={skill.id}
                          as="button"
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="medium"
                          cursor="pointer"
                          bg={isSel ? selectedBg : "transparent"}
                          _hover={{ bg: isSel ? selectedBg : hoverBg }}
                          display="flex"
                          alignItems="center"
                          gap="4px"
                          onClick={() => toggle(skill)}
                        >
                          <SkillBadge
                            name={skill.name}
                            iconSlug={skill.iconSlug}
                            mode="normal"
                            size="sm"
                          />
                        </Box>
                      );
                    })}
                  </Flex>
                )}
              </Box>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <HStack justifyContent="center" mt={2} spacing={2}>
                  <Box
                    as="button"
                    p={1}
                    borderRadius="md"
                    _hover={{ bg: hoverBg }}
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    opacity={page === 0 ? 0.4 : 1}
                    cursor={page === 0 ? "not-allowed" : "pointer"}
                  >
                    <Icon as={BsChevronLeft} boxSize="0.75rem" />
                  </Box>
                  <Text fontSize="xs" color="gray.500">
                    {page + 1} / {totalPages}
                  </Text>
                  <Box
                    as="button"
                    p={1}
                    borderRadius="md"
                    _hover={{ bg: hoverBg }}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    opacity={page >= totalPages - 1 ? 0.4 : 1}
                    cursor={page >= totalPages - 1 ? "not-allowed" : "pointer"}
                  >
                    <Icon as={BsChevronRight} boxSize="0.75rem" />
                  </Box>
                </HStack>
              )}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
    </Box>
  );
};
