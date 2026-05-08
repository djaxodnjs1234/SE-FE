import {
  Badge,
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { MemberFrameInfo } from "@types";
import React, { useEffect, useRef, useState } from "react";
import {
  BsBell,
  BsBookmark,
  BsCameraFill,
  BsChatLeftText,
  BsCheckLg,
  BsChevronDown,
  BsChevronRight,
  BsChevronUp,
  BsFileText,
  BsGem,
  BsKey,
  BsPencil,
  BsTrash,
} from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { GradientAvatar } from "@/components/common/GradientAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import {
  useDeleteProfileImage,
  useEquipFrame,
  useFetchMyFrames,
  useFetchUserProfile,
  useUnequipFrame,
  useUploadProfileImage,
} from "@/react-query/hooks/useProfile";
import { userState } from "@/store/user";

import { PageNotFound } from "../PageNotFound";
import { DeveloperProfileInfoSection } from "./DeveloperProfileSection";
import { DeveloperReadmeSection } from "./DeveloperReadmeSection";

export const ProfilePage = () => {
  const [isFrameVaultOpen, setIsFrameVaultOpen] = useState(false);
  const userInfo = useRecoilValue(userState);
  const setUserState = useSetRecoilState(userState);
  const { userId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const { data, isError, isLoading } = useFetchUserProfile(userId!);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadImage, isLoading: isUploading } = useUploadProfileImage(
    userId!
  );
  const { mutate: deleteImage, isLoading: isDeleting } = useDeleteProfileImage(
    userId!
  );
  const { data: myFrames } = useFetchMyFrames();
  const { mutate: equipFrameMutate } = useEquipFrame(userId!);
  const { mutate: unequipFrameMutate } = useUnequipFrame(userId!);

  const isMyProfile =
    userInfo.email === userId || userInfo.userId === Number(userId);

  useEffect(() => {
    if (isMyProfile && data) {
      setUserState((prev) => ({
        ...prev,
        frameGradientStart: data.equippedFrame?.gradientStart ?? null,
        frameGradientEnd: data.equippedFrame?.gradientEnd ?? null,
      }));
    }
  }, [isMyProfile, data, setUserState]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadImage(file, {
      onError: () =>
        toast({ title: "이미지 업로드 실패", status: "error", duration: 3000 }),
    });
    e.target.value = "";
  };

  const handleDeleteImage = () => {
    deleteImage(undefined, {
      onSuccess: () =>
        toast({
          title: "프로필 이미지가 삭제되었습니다",
          status: "success",
          duration: 2000,
        }),
      onError: () =>
        toast({ title: "이미지 삭제 실패", status: "error", duration: 3000 }),
    });
  };

  const onClickKumohCertification = () => {
    if (userInfo.roles.includes("금오인")) {
      toast({
        title: "이미 금오인 입니다",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      navigate("/profile/kumoh-certification");
    }
  };

  const bgColor = useColorModeValue("gray.0", "#1A202C");
  const cardBgColor = useColorModeValue("white", "whiteAlpha.50");
  const titleColor = useColorModeValue("gray.7", "whiteAlpha.800");
  const borderColor = useColorModeValue("gray.2", "whiteAlpha.400");
  const hoverBgColor = useColorModeValue("gray.50", "whiteAlpha.50");

  if (isError) return <PageNotFound />;

  return (
    <Flex
      justifyContent="center"
      position="relative"
      zIndex={0}
      w="full"
      minH={{ base: "100vh", md: "calc(100vh - 59px)" }}
      bg={bgColor}
    >
      <Box
        maxW="1180px"
        w="full"
        pt={{ base: "calc(56px + 1rem)", md: "1.5rem" }}
        px={{ base: "1rem", md: "1rem" }}
        pb="2rem"
      >
        {isLoading ? (
          <Grid templateColumns={{ base: "1fr", md: "320px 1fr" }} gap={4}>
            <Stack>
              <Skeleton h="120px" borderRadius="md" />
              <Skeleton h="200px" borderRadius="md" />
            </Stack>
            <Stack>
              <Skeleton h="300px" borderRadius="md" />
            </Stack>
          </Grid>
        ) : (
          <Grid
            templateColumns={{ base: "1fr", md: "320px 1fr" }}
            gap={4}
            alignItems="start"
          >
            {/* 좌측 사이드바 */}
            <GridItem>
              <Stack spacing={3}>
                {/* 아바타 + 기본 정보 */}
                <Box
                  bg={cardBgColor}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={4}
                >
                  <Flex direction="column" alignItems="center" gap={3}>
                    <Box position="relative" display="inline-block">
                      <GradientAvatar
                        size="xl"
                        src={data?.profileImageUrl ?? undefined}
                        gradientStart={data?.equippedFrame?.gradientStart}
                        gradientEnd={data?.equippedFrame?.gradientEnd}
                        borderWidth={4}
                        gapWidth={2}
                        cursor={isMyProfile ? "pointer" : "default"}
                        onClick={() =>
                          isMyProfile && fileInputRef.current?.click()
                        }
                        opacity={isUploading ? 0.6 : 1}
                      />
                      {isMyProfile && (
                        <>
                          <Tooltip label="사진 변경" hasArrow>
                            <IconButton
                              aria-label="프로필 이미지 변경"
                              icon={<Icon as={BsCameraFill} boxSize="12px" />}
                              size="xs"
                              borderRadius="full"
                              position="absolute"
                              bottom="0"
                              right="0"
                              bgColor="gray.500"
                              color="white"
                              _hover={{ bgColor: "gray.600" }}
                              onClick={() => fileInputRef.current?.click()}
                              isLoading={isUploading}
                            />
                          </Tooltip>
                          {data?.profileImageUrl && (
                            <Tooltip label="사진 삭제" hasArrow>
                              <IconButton
                                aria-label="프로필 이미지 삭제"
                                icon={<Icon as={BsTrash} boxSize="10px" />}
                                size="xs"
                                borderRadius="full"
                                position="absolute"
                                top="0"
                                right="0"
                                bgColor="red.400"
                                color="white"
                                _hover={{ bgColor: "red.500" }}
                                onClick={handleDeleteImage}
                                isLoading={isDeleting}
                              />
                            </Tooltip>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                          />
                        </>
                      )}
                    </Box>

                    <Box textAlign="center">
                      <Flex
                        alignItems="center"
                        justifyContent="center"
                        gap="0.5rem"
                        flexWrap="wrap"
                      >
                        {isMyProfile && (
                          <Icon
                            onClick={() => navigate("/profile/edit")}
                            as={BsPencil}
                            boxSize="0.875rem"
                            _hover={{ cursor: "pointer" }}
                            color={titleColor}
                          />
                        )}
                        <Text
                          fontSize="1.125rem"
                          fontWeight="bold"
                          color={titleColor}
                        >
                          {data?.nickname}
                        </Text>
                        <RoleBadge
                          badgeType={data?.badgeType}
                          badgeLabel={data?.badgeLabel}
                          size="sm"
                        />
                      </Flex>
                      {data?.activityScore != null && (
                        <Text color="gray.5" fontSize="xs" mt={1}>
                          활동 점수: {data.activityScore}
                        </Text>
                      )}
                    </Box>

                    {/* 통계 */}
                    <Flex gap={4} w="full" justifyContent="center">
                      <Flex direction="column" alignItems="center">
                        <Text fontWeight="bold" fontSize="sm">
                          {data?.postCount || 0}
                        </Text>
                        <Text fontSize="xs" color="gray.5">
                          게시글
                        </Text>
                      </Flex>
                      <Flex direction="column" alignItems="center">
                        <Text fontWeight="bold" fontSize="sm">
                          {data?.commentCount || 0}
                        </Text>
                        <Text fontSize="xs" color="gray.5">
                          댓글
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>

                {/* 개발자 프로필 */}
                <DeveloperProfileInfoSection
                  profile={data?.developerProfile ?? null}
                  isMyProfile={isMyProfile}
                />
              </Stack>
            </GridItem>

            {/* 우측 메인 영역 */}
            <GridItem minW={0}>
              <Stack spacing={3}>
                {/* README */}
                <DeveloperReadmeSection
                  profile={data?.developerProfile ?? null}
                  isMyProfile={isMyProfile}
                />

                {/* 활동 메뉴 */}
                <Box
                  bg={cardBgColor}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <Flex
                    onClick={() => navigate("posts")}
                    alignItems="center"
                    w="full"
                    py="0.875rem"
                    px="1rem"
                    color={titleColor}
                    _hover={{ bg: hoverBgColor, cursor: "pointer" }}
                    borderRadius="md"
                  >
                    <Icon as={BsFileText} boxSize="1rem" mr="0.75rem" />
                    <Text fontSize="sm" fontWeight="semibold">
                      작성한 글
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="primary"
                      ml="0.5rem"
                    >
                      {data?.postCount || 0}
                    </Text>
                    <Icon as={BsChevronRight} boxSize="1rem" ml="auto" />
                  </Flex>

                  <Flex
                    onClick={() => navigate("comments")}
                    alignItems="center"
                    w="full"
                    py="0.875rem"
                    px="1rem"
                    color={titleColor}
                    _hover={{ bg: hoverBgColor, cursor: "pointer" }}
                  >
                    <Icon as={BsChatLeftText} boxSize="1rem" mr="0.75rem" />
                    <Text fontSize="sm" fontWeight="semibold">
                      작성한 댓글
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="primary"
                      ml="0.5rem"
                    >
                      {data?.commentCount || 0}
                    </Text>
                    <Icon as={BsChevronRight} boxSize="1rem" ml="auto" />
                  </Flex>

                  {isMyProfile && (
                    <>
                      <Flex
                        onClick={() => navigate("/profile/bookmark")}
                        alignItems="center"
                        w="full"
                        py="0.875rem"
                        px="1rem"
                        color={titleColor}
                        _hover={{ bg: hoverBgColor, cursor: "pointer" }}
                      >
                        <Icon as={BsBookmark} boxSize="1rem" mr="0.75rem" />
                        <Text fontSize="sm" fontWeight="semibold">
                          북마크
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="primary"
                          ml="0.5rem"
                        >
                          {data?.bookmarkCount || 0}
                        </Text>
                        <Icon as={BsChevronRight} boxSize="1rem" ml="auto" />
                      </Flex>
                    </>
                  )}
                </Box>

                {/* 내 프로필 설정 (본인만) */}
                {isMyProfile && (
                  <Box
                    bg={cardBgColor}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    {/* 프레임 보관함 */}
                    <Box w="full" color={titleColor}>
                      <Flex
                        alignItems="center"
                        w="full"
                        py="0.875rem"
                        px="1rem"
                        cursor="pointer"
                        onClick={() => setIsFrameVaultOpen((v) => !v)}
                        _hover={{ bg: hoverBgColor }}
                        borderRadius={isFrameVaultOpen ? "md md 0 0" : "md"}
                      >
                        <Icon as={BsGem} boxSize="1rem" mr="0.75rem" />
                        <Text fontSize="sm" fontWeight="semibold">
                          프레임 보관함
                        </Text>
                        {data?.equippedFrame && !isFrameVaultOpen && (
                          <Box
                            ml="0.5rem"
                            w="14px"
                            h="14px"
                            borderRadius="full"
                            background={`linear-gradient(135deg, ${data.equippedFrame.gradientStart}, ${data.equippedFrame.gradientEnd})`}
                            flexShrink={0}
                          />
                        )}
                        <Icon
                          as={isFrameVaultOpen ? BsChevronUp : BsChevronDown}
                          boxSize="1rem"
                          ml="auto"
                        />
                      </Flex>
                      <Collapse in={isFrameVaultOpen} animateOpacity>
                        <Box px="1rem" pb="1rem" pt={"1rem"}>
                          {myFrames && myFrames.length > 0 ? (
                            <Flex gap="0.75rem" flexWrap="wrap">
                              {myFrames.map((mf) => (
                                <FrameCard
                                  key={mf.memberFrameId}
                                  memberFrame={mf}
                                  isEquipped={
                                    data?.equippedFrame?.frameId ===
                                    mf.frame.frameId
                                  }
                                  onEquip={() =>
                                    equipFrameMutate({
                                      frameId: mf.frame.frameId,
                                      gradientStart: mf.frame.gradientStart,
                                      gradientEnd: mf.frame.gradientEnd,
                                    })
                                  }
                                  onUnequip={() => unequipFrameMutate()}
                                />
                              ))}
                            </Flex>
                          ) : (
                            <Text fontSize="xs" color="gray.5">
                              아직 획득한 프레임이 없어요.
                            </Text>
                          )}
                        </Box>
                      </Collapse>
                    </Box>

                    {/* 알림 설정 */}
                    <Flex
                      onClick={() => navigate("/profile/notification/setting")}
                      alignItems="center"
                      w="full"
                      py="0.875rem"
                      px="1rem"
                      color={titleColor}
                      _hover={{ bg: hoverBgColor, cursor: "pointer" }}
                    >
                      <Icon as={BsBell} boxSize="1rem" mr="0.75rem" />
                      <Text fontSize="sm" fontWeight="semibold">
                        알림 설정
                      </Text>
                      <Icon as={BsChevronRight} boxSize="1rem" ml="auto" />
                    </Flex>

                    {/* 비밀번호 변경 */}
                    <Flex
                      onClick={() => navigate("/profile/password/edit")}
                      alignItems="center"
                      w="full"
                      py="0.875rem"
                      px="1rem"
                      color={titleColor}
                      _hover={{ bg: hoverBgColor, cursor: "pointer" }}
                    >
                      <Icon as={BsKey} boxSize="1rem" mr="0.75rem" />
                      <Text fontSize="sm" fontWeight="semibold">
                        비밀번호 변경
                      </Text>
                      <Icon as={BsChevronRight} boxSize="1rem" ml="auto" />
                    </Flex>

                    {/* 금오인 인증 */}
                    <Flex
                      onClick={onClickKumohCertification}
                      alignItems="center"
                      w="full"
                      py="0.875rem"
                      px="1rem"
                      color={titleColor}
                      _hover={{ bg: hoverBgColor, cursor: "pointer" }}
                    >
                      <Icon as={BsCheckLg} boxSize="1rem" mr="0.75rem" />
                      <Text fontSize="sm" fontWeight="semibold">
                        금오인 인증
                      </Text>
                      <Icon as={BsChevronRight} boxSize="1rem" ml="auto" />
                    </Flex>
                  </Box>
                )}

                {isMyProfile && (
                  <Button
                    onClick={() => navigate("/profile/withdrawal")}
                    variant="link"
                    w="max"
                    fontSize="13px"
                    fontWeight="normal"
                    color="gray.5"
                  >
                    회원탈퇴
                  </Button>
                )}
              </Stack>
            </GridItem>
          </Grid>
        )}
      </Box>
    </Flex>
  );
};

const FrameCard = ({
  memberFrame,
  isEquipped,
  onEquip,
  onUnequip,
}: {
  memberFrame: MemberFrameInfo;
  isEquipped: boolean;
  onEquip: () => void;
  onUnequip: () => void;
}) => {
  const { frame } = memberFrame;
  const borderColor = useColorModeValue("gray.2", "whiteAlpha.300");

  return (
    <Flex
      direction="column"
      alignItems="center"
      gap="0.5rem"
      p="0.75rem"
      border="1px"
      borderColor={isEquipped ? "blue.400" : borderColor}
      borderRadius="md"
      minW="80px"
      cursor="pointer"
      onClick={isEquipped ? onUnequip : onEquip}
      position="relative"
    >
      {isEquipped && (
        <Badge
          colorScheme="blue"
          position="absolute"
          top="-8px"
          fontSize="0.6rem"
          borderRadius="full"
          px="0.4rem"
        >
          장착중
        </Badge>
      )}
      <Box
        w="40px"
        h="40px"
        borderRadius="full"
        background={`linear-gradient(135deg, ${frame.gradientStart}, ${frame.gradientEnd})`}
      />
      <Text fontSize="xs" fontWeight="bold" textAlign="center" noOfLines={2}>
        {frame.name}
      </Text>
    </Flex>
  );
};
