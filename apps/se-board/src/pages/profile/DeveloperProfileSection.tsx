import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DeveloperProfileInfo } from "@types";
import { useEffect, useState } from "react";
import {
  BsBoxArrowUpRight,
  BsCodeSlash,
  BsGithub,
  BsPencil,
  BsPersonBadge,
} from "react-icons/bs";

import { SkillBadge } from "@/components/common/SkillBadge";
import {
  SelectedSkill,
  SkillTagPicker,
} from "@/components/common/SkillTagPicker";
import { useUpdateDeveloperProfile } from "@/react-query/hooks/useDeveloperProfile";

export const DeveloperProfileInfoSection = ({
  profile,
  isMyProfile,
}: {
  profile: DeveloperProfileInfo | undefined | null;
  isMyProfile: boolean;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue("gray.2", "whiteAlpha.200");
  const cardBg = useColorModeValue("white", "whiteAlpha.50");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const emptyBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const titleColor = useColorModeValue("gray.700", "whiteAlpha.800");

  const hasContent =
    profile &&
    (profile.intro ||
      profile.githubUrl ||
      profile.portfolioUrl ||
      (profile.skills?.length ?? 0) > 0);

  if (!hasContent && !isMyProfile) return null;

  return (
    <>
      <Box
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        overflow="hidden"
      >
        {/* 헤더 */}
        <Flex
          alignItems="center"
          justifyContent="space-between"
          px={4}
          py={3}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <Flex alignItems="center" gap={2}>
            <Icon as={BsCodeSlash} boxSize="14px" color="blue.400" />
            <Text fontSize="sm" fontWeight="bold" color={titleColor}>
              개발자 프로필
            </Text>
          </Flex>
          {isMyProfile && (
            <Button
              size="xs"
              leftIcon={<Icon as={BsPencil} boxSize="10px" />}
              variant="ghost"
              colorScheme="blue"
              onClick={onOpen}
            >
              편집
            </Button>
          )}
        </Flex>

        {/* 본문 */}
        {!hasContent ? (
          <Flex
            direction="column"
            alignItems="center"
            gap={3}
            py={6}
            px={4}
            bg={emptyBg}
          >
            <Icon as={BsPersonBadge} boxSize="32px" color="gray.300" />
            <Text fontSize="sm" color={mutedColor} textAlign="center">
              개발자 프로필을 작성하면
              <br />
              구인구직에서 더 쉽게 찾을 수 있어요.
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              leftIcon={<Icon as={BsPencil} boxSize="11px" />}
              onClick={onOpen}
            >
              프로필 작성하기
            </Button>
          </Flex>
        ) : (
          <Stack spacing={0} divider={<Divider borderColor={borderColor} />}>
            {/* 한 줄 소개 + 학년 */}
            <Box px={4} py={3}>
              {profile?.intro && (
                <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
                  {profile.intro}
                </Text>
              )}
            </Box>
            {profile?.grade && (
              <Box px={4} py={3}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={titleColor}
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  학위 / 학년
                </Text>
                <Flex gap={1.5} flexWrap="wrap">
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={mutedColor}
                    mb={1}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    {profile.grade}
                  </Text>
                </Flex>
              </Box>
            )}

            {/* 기술 스택 */}
            {(profile?.skills?.length ?? 0) > 0 && (
              <Box px={4} py={3}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={titleColor}
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  기술 스택
                </Text>
                <Flex gap={1.5} flexWrap="wrap">
                  {profile?.skills.map((s) => (
                    <SkillBadge
                      key={s.id}
                      name={s.name}
                      iconSlug={s.iconSlug}
                    />
                  ))}
                </Flex>
              </Box>
            )}

            {/* 링크 */}
            {(profile?.githubUrl || profile?.portfolioUrl) && (
              <Box px={4} py={3}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={titleColor}
                  mb={2}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                >
                  관련 링크
                </Text>
                <Stack spacing={2}>
                  {profile?.githubUrl && (
                    <Tooltip label={profile.githubUrl} hasArrow placement="top">
                      <Flex
                        as="a"
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        alignItems="center"
                        gap={2}
                        w="fit-content"
                        _hover={{ color: "blue.500" }}
                        color={mutedColor}
                      >
                        <Icon as={BsGithub} boxSize="14px" flexShrink={0} />
                        <Text fontSize="sm" isTruncated maxW="180px">
                          {profile.githubUrl.replace(/^https?:\/\//, "")}
                        </Text>
                        <Icon
                          as={BsBoxArrowUpRight}
                          boxSize="10px"
                          flexShrink={0}
                        />
                      </Flex>
                    </Tooltip>
                  )}
                  {profile?.portfolioUrl && (
                    <Tooltip
                      label={profile.portfolioUrl}
                      hasArrow
                      placement="top"
                    >
                      <Flex
                        as="a"
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        alignItems="center"
                        gap={2}
                        w="fit-content"
                        _hover={{ color: "blue.500" }}
                        color={mutedColor}
                      >
                        <Icon
                          as={BsBoxArrowUpRight}
                          boxSize="14px"
                          flexShrink={0}
                        />
                        <Text fontSize="sm" isTruncated maxW="180px">
                          {profile.portfolioUrl.replace(/^https?:\/\//, "")}
                        </Text>
                        <Icon
                          as={BsBoxArrowUpRight}
                          boxSize="10px"
                          flexShrink={0}
                        />
                      </Flex>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {isMyProfile && (
        <DeveloperProfileInfoEditModal
          isOpen={isOpen}
          onClose={onClose}
          profile={profile}
        />
      )}
    </>
  );
};

const DeveloperProfileInfoEditModal = ({
  isOpen,
  onClose,
  profile,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: DeveloperProfileInfo | undefined | null;
}) => {
  const toast = useToast();
  const { mutate: updateProfile, isLoading } = useUpdateDeveloperProfile();

  const [intro, setIntro] = useState(profile?.intro ?? "");
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl ?? "");
  const [grade, setGrade] = useState(profile?.grade ?? "");
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>(
    profile?.skills?.map((s) => ({
      id: s.id,
      name: s.name,
      iconSlug: s.iconSlug,
    })) ?? []
  );

  useEffect(() => {
    if (profile) {
      setIntro(profile.intro ?? "");
      setGithubUrl(profile.githubUrl ?? "");
      setPortfolioUrl(profile.portfolioUrl ?? "");
      setGrade(profile.grade ?? "");
      setSelectedSkills(
        profile.skills?.map((s) => ({
          id: s.id,
          name: s.name,
          iconSlug: s.iconSlug,
        })) ?? []
      );
    }
  }, [profile]);

  const handleToggleSkill = (skill: SelectedSkill) => {
    setSelectedSkills((prev) =>
      prev.some((s) => s.id === skill.id)
        ? prev.filter((s) => s.id !== skill.id)
        : [...prev, skill]
    );
  };

  const handleSave = () => {
    updateProfile(
      {
        intro,
        githubUrl,
        portfolioUrl,
        grade,
        readmeContent: profile?.readmeContent ?? undefined,
        skillIds: selectedSkills.map((s) => s.id),
      },
      {
        onSuccess: () => {
          toast({
            title: "저장되었습니다.",
            status: "success",
            duration: 2000,
          });
          onClose();
        },
        onError: () =>
          toast({
            title: "오류가 발생했습니다.",
            status: "error",
            duration: 2000,
          }),
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md">개발자 프로필 편집</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">학위 / 학년</FormLabel>
              <Input
                size="sm"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="예: 3학년"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">한 줄 소개</FormLabel>
              <Input
                size="sm"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="간단한 자기소개"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">GitHub URL</FormLabel>
              <Input
                size="sm"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">포트폴리오 URL</FormLabel>
              <Input
                size="sm"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">기술 스택</FormLabel>
              <SkillTagPicker
                selectedSkills={selectedSkills}
                onToggle={handleToggleSkill}
              />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isLoading}
          >
            저장
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
