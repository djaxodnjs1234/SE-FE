import {
  Badge,
  Box,
  Flex,
  Heading,
  Icon,
  IconButton,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRef } from "react";
import { BsChevronLeft, BsChevronRight, BsEye, BsPerson } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

import { RecruitPostSummary } from "@/api/recruit";
import { SkillBadge } from "@/components/common/SkillBadge";
import { useFetchRecruitList } from "@/react-query/hooks/useRecruit";

const TAG_LABELS: Record<string, string> = {
  TEAM_RECRUIT: "팀 모집",
  JOB_POSTING: "채용",
  TEAM_JOIN: "팀 합류",
  JOB_SEEK: "구직",
};

const TAG_COLORS: Record<string, string> = {
  TEAM_RECRUIT: "blue",
  JOB_POSTING: "green",
  TEAM_JOIN: "purple",
  JOB_SEEK: "orange",
};

const MAX_SKILLS_SHOWN = 5;

export const RecruitPreview = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useFetchRecruitList({ page: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const headingBgColor = useColorModeValue("gray.1", "whiteAlpha.200");
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild
      ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 16
      : 280;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  if (isLoading) return <RecruitPreviewSkeleton />;

  return (
    <Stack w="full" spacing={4}>
      {/* 헤더 */}
      <Flex
        onClick={() => navigate("/recruit")}
        alignItems="center"
        justifyContent="space-between"
        w="full"
        px={{ base: "1rem", md: "1.5rem" }}
        py="1rem"
        bgColor={headingBgColor}
        borderRadius="xl"
        transition="all 0.2s"
        _hover={{
          cursor: "pointer",
        }}
      >
        <Heading
          fontSize={{ base: "1.1rem", md: "1.25rem" }}
          color={headingColor}
          fontWeight="bold"
        >
          Project / Job
        </Heading>
      </Flex>

      {/* 카드 캐러셀 (데스크탑) */}
      <Box display={{ base: "none", md: "block" }} position="relative" px={2}>
        <IconButton
          aria-label="이전"
          icon={<Icon as={BsChevronLeft} />}
          size="md"
          position="absolute"
          left="-1rem"
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          borderRadius="full"
          onClick={() => scroll("left")}
          colorScheme="whiteAlpha"
          bg={useColorModeValue("white", "gray.700")}
          color={useColorModeValue("gray.700", "white")}
          boxShadow="md"
          _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}
        />

        <Flex
          ref={scrollRef}
          overflowX="hidden"
          gap={4}
          py={4}
          px={2}
          sx={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {data?.content.map((post) => (
            <RecruitCard
              key={post.id}
              post={post}
              onClick={() => navigate(`/recruit/${post.id}`)}
            />
          ))}
          {data?.content.length === 0 && (
            <Flex w="full" justify="center" py={10}>
              <Text fontSize="sm" color={mutedColor}>
                게시글이 없습니다.
              </Text>
            </Flex>
          )}
        </Flex>

        <IconButton
          aria-label="다음"
          icon={<Icon as={BsChevronRight} />}
          size="md"
          position="absolute"
          right="-1rem"
          top="50%"
          transform="translateY(-50%)"
          zIndex={2}
          borderRadius="full"
          onClick={() => scroll("right")}
          colorScheme="whiteAlpha"
          bg={useColorModeValue("white", "gray.700")}
          color={useColorModeValue("gray.700", "white")}
          boxShadow="md"
          _hover={{ bg: useColorModeValue("gray.50", "gray.600") }}
        />
      </Box>

      {/* 모바일: 리스트 */}
      <Stack display={{ base: "flex", md: "none" }} spacing={2}>
        {data?.content.map((post) => (
          <MobileRecruitRow
            key={post.id}
            post={post}
            onClick={() => navigate(`/recruit/${post.id}`)}
            mutedColor={mutedColor}
          />
        ))}
        {data?.content.length === 0 && (
          <Text fontSize="sm" color={mutedColor} py={6} textAlign="center">
            게시글이 없습니다.
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

const RecruitCard = ({
  post,
  onClick,
}: {
  post: RecruitPostSummary;
  onClick: () => void;
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedColor = useColorModeValue("gray.500", "gray.400");

  // 스킬 태그용 색상 (대비감 살짝 올림)
  const skillBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const skillBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const skillText = useColorModeValue("gray.700", "gray.200");

  const extraSkills = post.skills.length - MAX_SKILLS_SHOWN;

  return (
    <Flex
      direction="column"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      minW="260px"
      maxW="280px"
      height="260px"
      flexShrink={0}
      cursor="pointer"
      transition="all 0.3s ease"
      opacity={post.status === "CLOSED" ? 0.6 : 1}
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "md",
        borderColor: useColorModeValue("blue.300", "blue.500"),
      }}
      onClick={onClick}
    >
      {/* 태그 영역 (아래 여백 줄임) */}
      <Flex gap={2} mb={3} flexWrap="wrap">
        <Badge
          colorScheme={TAG_COLORS[post.tag] ?? "gray"}
          px={2}
          py={0.5}
          width={"60px"}
          textAlign={"center"}
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

      {/* 제목 (색상을 더 진하게, 폰트 크기 살짝 키움) */}
      <Text
        fontWeight="bold"
        fontSize="1.1rem"
        color={useColorModeValue("gray.800", "white")}
        noOfLines={2}
        mb={3}
        lineHeight="1.4"
      >
        {post.title}
      </Text>

      {/* 스킬 태그 */}

      <Flex gap={1.5} flexWrap="wrap" mb={3} minH="20px" alignItems={"center"}>
        {post.skills.slice(0, MAX_SKILLS_SHOWN).map((s) => (
          <SkillBadge key={s.id} name={s.name} iconSlug={s.iconSlug} />
        ))}
        {extraSkills > 0 && (
          <Box
            px={2}
            py="2px"
            borderRadius="md"
            color={skillText}
            fontWeight={"semibold"}
            fontSize="sm"
          >
            +{extraSkills}
          </Box>
        )}
      </Flex>

      {/* 하단 메타 정보 */}
      <Stack
        mt="auto"
        pt={3}
        borderTop="1px dashed"
        borderColor={useColorModeValue("gray.200", "whiteAlpha.300")}
        spacing={2}
      >
        <Flex
          justify="space-between"
          align="center"
          color={mutedColor}
          fontSize="xs"
        >
          <Flex align="center" gap={1.5}>
            <Icon as={BsPerson} boxSize={3.5} />
            <Text isTruncated maxW="100px">
              {post.author.name}
            </Text>
          </Flex>
          <Flex align="center" gap={1.5}>
            <Icon as={BsEye} boxSize={3.5} />
            <Text>{post.viewCount}</Text>
          </Flex>
        </Flex>
      </Stack>
    </Flex>
  );
};

const MobileRecruitRow = ({
  post,
  onClick,
  mutedColor,
}: {
  post: RecruitPostSummary;
  onClick: () => void;
  mutedColor: string;
}) => {
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200"); // 구분선 색상
  const mobileSkillBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const skillText = useColorModeValue("gray.700", "gray.200");
  const extraSkills = post.skills.length - MAX_SKILLS_SHOWN;

  return (
    <Flex
      direction="column"
      py={4} // 상하 여백을 늘려 클릭 영역 확보
      px={2}
      borderBottom="1px solid" // 목록 구분을 위한 확실한 하단 선 추가
      borderColor={borderColor}
      gap={2}
      cursor="pointer"
      transition="background 0.2s"
      opacity={post.status === "CLOSED" ? 0.6 : 1}
      _hover={{ bg: hoverBg }}
      onClick={onClick}
    >
      <Flex alignItems="center" gap={2}>
        <Badge
          colorScheme={TAG_COLORS[post.tag] ?? "gray"}
          fontSize="2xs"
          px={1.5}
          borderRadius="sm"
          flexShrink={0}
        >
          {TAG_LABELS[post.tag] ?? post.tag}
        </Badge>
        <Text
          fontSize="0.95rem"
          color={useColorModeValue("gray.800", "white")}
          noOfLines={1}
          flex={1}
          fontWeight="bold"
        >
          {post.title}
        </Text>
      </Flex>

      <Flex gap={1.5} flexWrap="wrap" mb={3} minH="20px" alignItems={"center"}>
        {post.skills.slice(0, MAX_SKILLS_SHOWN).map((s) => (
          <SkillBadge key={s.id} name={s.name} iconSlug={s.iconSlug} />
        ))}
        {extraSkills > 0 && (
          <Box
            px={2}
            py="2px"
            borderRadius="md"
            color={skillText}
            fontWeight={"semibold"}
            fontSize="sm"
          >
            +{extraSkills}
          </Box>
        )}
      </Flex>

      {/* 모바일 하단 정보 */}
      <Flex justify="space-between" color={mutedColor} fontSize="xs" mt={1}>
        <Flex gap={3}>
          <Flex alignItems="center" gap={1}>
            <Icon as={BsPerson} />
            <Text>{post.author.name}</Text>
          </Flex>
          <Flex alignItems="center" gap={1}>
            <Icon as={BsEye} />
            <Text>{post.viewCount}</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const RecruitPreviewSkeleton = () => (
  <Stack w="full" spacing={4}>
    <Skeleton h="56px" borderRadius="xl" />
    <Flex gap={4} display={{ base: "none", md: "flex" }} px={2}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} h="260px" minW="260px" borderRadius="xl" />
      ))}
    </Flex>
    <Stack display={{ base: "flex", md: "none" }} spacing={2}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} h="90px" borderRadius="lg" />
      ))}
    </Stack>
  </Stack>
);
