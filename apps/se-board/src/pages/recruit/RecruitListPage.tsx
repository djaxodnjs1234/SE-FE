import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Hide,
  Icon,
  Select,
  Show,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Tab,
  TabList,
  Tabs,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  BsEye,
  BsPencilFill,
  BsPeopleFill,
  BsPerson,
  BsPersonBadge,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { RecruitPostSummary, RecruitSortType } from "@/api/recruit";
import { SkillBadge } from "@/components/common/SkillBadge";
import { MobileRecruitBottomMenu } from "@/components/MobileRecruitBottomMenu";
import { useFetchRecruitList } from "@/react-query/hooks/useRecruit";
import { userState } from "@/store/user";

const TAG_LABELS: Record<string, string> = {
  TEAM_RECRUIT: "팀 모집",
  JOB_POSTING: "채용 공고",
  TEAM_JOIN: "팀 합류",
  JOB_SEEK: "구직",
};

const TAG_COLORS: Record<string, string> = {
  TEAM_RECRUIT: "blue",
  JOB_POSTING: "green",
  TEAM_JOIN: "purple",
  JOB_SEEK: "orange",
};

const TAB_TYPES = [undefined, "RECRUIT", "SEEK"] as const;
const MAX_SKILLS = 5;
const PAGE_RANGE = 5;

export const RecruitListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const userInfo = useRecoilValue(userState);
  const [tabIndex, setTabIndex] = useState(0);
  const [includeClose, setIncludeClose] = useState(false);
  const [sort, setSort] = useState<RecruitSortType>("LATEST");
  const [page, setPage] = useState(0);

  const typeFilter = TAB_TYPES[tabIndex];
  const { data, isLoading, isError, error } = useFetchRecruitList({
    type: typeFilter,
    includeClose,
    sort,
    page,
  });

  useEffect(() => {
    if (isError && (error as any)?.response?.status === 403) {
      toast({
        title: "접근 권한이 없습니다.",
        description: "로그인이 필요합니다.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
    }
  }, [isError, error]);

  const titleColor = useColorModeValue("gray.7", "whiteAlpha.800");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  const handleTabChange = (idx: number) => {
    setTabIndex(idx);
    setPage(0);
  };
  const handleTypeChange = (type: string | undefined) => {
    setTabIndex(type === "RECRUIT" ? 1 : type === "SEEK" ? 2 : 0);
    setPage(0);
  };

  const totalPages = data?.totalPages ?? 0;
  const startPage = Math.max(
    0,
    Math.min(
      page - Math.floor(PAGE_RANGE / 2),
      Math.max(0, totalPages - PAGE_RANGE)
    )
  );
  const pageNumbers = Array.from(
    { length: Math.min(PAGE_RANGE, totalPages) },
    (_, i) => startPage + i
  ).filter((p) => p < totalPages);

  const cardGrid = (
    <>
      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} h="200px" borderRadius="xl" />
          ))}
        </SimpleGrid>
      ) : data?.content.length === 0 ? (
        <Flex
          direction="column"
          alignItems="center"
          py="8rem"
          color={mutedColor}
        >
          <Text fontSize="1.25rem" fontWeight="bold">
            게시물이 없습니다
          </Text>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full" pt={3}>
          {data?.content.map((post) => (
            <RecruitCard
              key={post.id}
              post={post}
              onClick={() => navigate(`/recruit/${post.id}`)}
            />
          ))}
        </SimpleGrid>
      )}

      {totalPages > 1 && (
        <Flex
          justifyContent="center"
          alignItems="center"
          gap={1}
          pt="30px"
          pb={"1rem"}
          flexWrap="wrap"
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPage(0)}
            isDisabled={page === 0}
          >
            «
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            isDisabled={page === 0}
          >
            ‹
          </Button>
          {pageNumbers.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "solid" : "ghost"}
              colorScheme={p === page ? "blue" : "gray"}
              onClick={() => setPage(p)}
            >
              {p + 1}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            isDisabled={page >= totalPages - 1}
          >
            ›
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPage(totalPages - 1)}
            isDisabled={page >= totalPages - 1}
          >
            »
          </Button>
        </Flex>
      )}
    </>
  );

  return (
    <>
      {/* 데스크탑 */}
      <Show above="md">
        <Stack
          alignItems="center"
          maxW="1180px"
          w="full"
          px="1rem"
          py="3rem"
          spacing={0}
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            w="full"
            mb="1rem"
          >
            <Heading fontSize="2xl" pl="1rem" color={titleColor}>
              Project / Job
            </Heading>
          </Flex>

          <Flex
            alignItems="center"
            justifyContent="space-between"
            w="full"
            py="0.5rem"
            borderY="1px"
            borderColor={borderColor}
            gap={3}
            flexWrap="wrap"
            mb="1.5rem"
          >
            <Tabs
              index={tabIndex}
              onChange={handleTabChange}
              variant="soft-rounded"
              colorScheme="blue"
              size="sm"
            >
              <TabList gap={1}>
                <Tab>전체</Tab>
                <Tab>
                  <Icon as={BsPeopleFill} mr={1} />
                  구인
                </Tab>
                <Tab>
                  <Icon as={BsPersonBadge} mr={1} />
                  구직
                </Tab>
              </TabList>
            </Tabs>

            <Flex alignItems="center" gap={3} flexWrap="wrap">
              <Select
                size="sm"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as RecruitSortType);
                  setPage(0);
                }}
                w="120px"
                borderRadius="md"
              >
                <option value="LATEST">최신순</option>
                <option value="DEADLINE">마감임박순</option>
                <option value="VIEWS">조회순</option>
              </Select>

              <FormControl display="flex" alignItems="center" w="auto" gap={2}>
                <Text fontSize="sm" color={mutedColor} whiteSpace="nowrap">
                  마감 포함
                </Text>
                <Switch
                  size="sm"
                  colorScheme="blue"
                  isChecked={includeClose}
                  onChange={(e) => {
                    setIncludeClose(e.target.checked);
                    setPage(0);
                  }}
                />
              </FormControl>

              {userInfo.userId && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Icon as={BsPencilFill} />}
                  onClick={() => navigate("/recruit/write")}
                >
                  글쓰기
                </Button>
              )}
            </Flex>
          </Flex>

          {cardGrid}
        </Stack>
      </Show>

      {/* 모바일 */}
      <Hide above="md">
        <Stack w="full" pt="56px" pb="54px" px="1rem" spacing={4}>
          {cardGrid}
        </Stack>
        <MobileRecruitBottomMenu
          typeFilter={typeFilter}
          sort={sort}
          onTypeChange={handleTypeChange}
          onSortChange={(s) => {
            setSort(s);
            setPage(0);
          }}
        />
      </Hide>
    </>
  );
};

const RecruitCard = ({
  post,
  onClick,
}: {
  post: RecruitPostSummary;
  onClick: () => void;
}) => {
  const cardBg = useColorModeValue("white", "gray.750");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.300");
  const hoverBorderColor = useColorModeValue("blue.300", "blue.400");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const titleColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const skillBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const skillBorderColor = useColorModeValue("gray.200", "whiteAlpha.300");
  const skillTextColor = useColorModeValue("gray.700", "gray.300");
  const moreTextColor = useColorModeValue("gray.400", "gray.500");

  const extraSkills = post.skills.length - MAX_SKILLS;

  return (
    <Flex
      direction="column"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={5}
      h="200px"
      cursor="pointer"
      opacity={post.status === "CLOSED" ? 0.6 : 1}
      transition="all 0.2s ease"
      _hover={{
        transform: "translateY(-3px)",
        boxShadow: "md",
        borderColor: hoverBorderColor,
      }}
      onClick={onClick}
    >
      <Flex gap={2} mb={2.5} flexWrap="wrap">
        <Badge
          colorScheme={TAG_COLORS[post.tag] ?? "gray"}
          px={2}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
        >
          {TAG_LABELS[post.tag] ?? post.tag}
        </Badge>
        {post.status === "CLOSED" && (
          <Badge
            colorScheme="red"
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="xs"
          >
            마감
          </Badge>
        )}
      </Flex>

      <Text
        fontWeight="bold"
        fontSize="0.95rem"
        color={titleColor}
        noOfLines={2}
        flex={1}
        lineHeight="1.5"
        mb={2.5}
      >
        {post.title}
      </Text>

      <Flex gap={1.5} flexWrap="wrap" mb={3} minH="20px" alignItems={"center"}>
        {post.skills.slice(0, MAX_SKILLS).map((s) => (
          <SkillBadge key={s.id} name={s.name} iconSlug={s.iconSlug} />
        ))}
        {extraSkills > 0 && (
          <Box
            px={2}
            py="2px"
            borderRadius="md"
            fontWeight={"semibold"}
            fontSize="sm"
          >
            +{extraSkills}
          </Box>
        )}
      </Flex>

      <Flex alignItems="center" color={mutedColor} fontSize="xs" gap={3}>
        <Flex alignItems="center" gap={1}>
          <Icon as={BsPerson} boxSize="0.7rem" />
          <Text>{post.author.name}</Text>
        </Flex>
        <Flex alignItems="center" gap={1}>
          <Icon as={BsEye} boxSize="0.7rem" />
          <Text>{post.viewCount}</Text>
        </Flex>
        {post.endDate && <Text ml="auto">~{post.endDate}</Text>}
      </Flex>
    </Flex>
  );
};
