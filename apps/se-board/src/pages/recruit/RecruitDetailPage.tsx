import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Flex,
  Hide,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  SimpleGrid,
  Spacer,
  Text,
  Textarea,
  Tooltip,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import DOMPurify from "dompurify";
import { useState } from "react";
import {
  BsArrowLeft,
  BsArrowReturnRight,
  BsCalendar,
  BsChatLeftText,
  BsClock,
  BsFillEyeFill,
  BsLink45Deg,
  BsPaperclip,
  BsPeopleFill,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { RecruitComment, RecruitPostDetail } from "@/api/recruit";
import { GradientAvatar } from "@/components/common/GradientAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import { SkillBadge } from "@/components/common/SkillBadge";
import { useNavigatePage } from "@/hooks";
import {
  useCloseRecruitPost,
  useCreateRecruitComment,
  useDeleteRecruitComment,
  useDeleteRecruitPost,
  useFetchRecruitComments,
  useFetchRecruitDetail,
} from "@/react-query/hooks/useRecruit";
import { menuListState } from "@/store/menu";
import { userState } from "@/store/user";
import { openColors } from "@/styles";
import { isModifiedContent, toYYYYMMDDHHhhss } from "@/utils/dateUtils";

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

const RecruitMetaBox = ({
  post,
  metaBgColor,
  metaLabelColor,
  metaValueColor,
}: {
  post: RecruitPostDetail;
  metaBgColor: string;
  metaLabelColor: string;
  metaValueColor: string;
}) => (
  <Box bg={metaBgColor} p={{ base: 4, md: 5 }} borderRadius="lg" w="full">
    <SimpleGrid columns={{ base: 1, md: 2 }} spacingY={3} spacingX={6}>
      {post.headcount && (
        <Flex align="center">
          <Flex w="90px" align="center" gap={1.5} color={metaLabelColor}>
            <Icon as={BsPeopleFill} />
            <Text fontSize="sm" fontWeight="medium">
              모집 인원
            </Text>
          </Flex>
          <Text fontSize="sm" fontWeight="semibold" color={metaValueColor}>
            {post.headcount}명
          </Text>
        </Flex>
      )}

      {(post.startDate || post.endDate) && (
        <Flex align="center">
          <Flex w="90px" align="center" gap={1.5} color={metaLabelColor}>
            <Icon as={BsCalendar} />
            <Text fontSize="sm" fontWeight="medium">
              진행 기간
            </Text>
          </Flex>
          <Text fontSize="sm" fontWeight="semibold" color={metaValueColor}>
            {post.startDate ?? "미정"} ~ {post.endDate ?? "미정"}
          </Text>
        </Flex>
      )}

      {post.portfolioUrl && (
        <Flex align="center">
          <Flex w="90px" align="center" gap={1.5} color={metaLabelColor}>
            <Icon as={BsLink45Deg} boxSize="18px" />
            <Text fontSize="sm" fontWeight="medium">
              관련 링크
            </Text>
          </Flex>
          <Text
            as="a"
            href={post.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            fontSize="sm"
            fontWeight="semibold"
            color="blue.500"
            _hover={{ textDecoration: "underline" }}
            isTruncated
            maxW={{ base: "200px", md: "300px" }}
          >
            {post.portfolioUrl}
          </Text>
        </Flex>
      )}

      {post.skills.length > 0 && (
        <Flex align="flex-start" gridColumn={{ md: "span 2" }} mt={1}>
          <Flex
            w="90px"
            align="center"
            gap={1.5}
            color={metaLabelColor}
            pt="2px"
          >
            <Text fontSize="sm" fontWeight="medium">
              기술 스택
            </Text>
          </Flex>
          <Flex gap={1.5} flexWrap="wrap" flex={1}>
            {post.skills.map((s) => (
              <SkillBadge key={s.id} name={s.name} iconSlug={s.iconSlug} />
            ))}
          </Flex>
        </Flex>
      )}
    </SimpleGrid>
  </Box>
);

/* ── 작성자 클릭 메뉴 (Header.tsx의 AuthorInfoMenuList와 동일) ── */
const AuthorMenu = ({
  id,
  name,
  profileImageUrl,
  frameGradientStart,
  frameGradientEnd,
  badgeType,
  badgeLabel,
}: {
  id: number;
  name: string;
  profileImageUrl?: string | null;
  frameGradientStart?: string | null;
  frameGradientEnd?: string | null;
  badgeType?: "CHECK" | "KUMOH_CROW" | null;
  badgeLabel?: string | null;
}) => {
  const { goToProfilePage } = useNavigatePage();

  return (
    <Menu autoSelect={false}>
      <MenuButton cursor={id ? "pointer" : "not-allowed"}>
        <Box display="flex" alignItems="center" gap="6px">
          <GradientAvatar
            src={profileImageUrl ?? undefined}
            size="sm"
            name={profileImageUrl ? undefined : name}
            gradientStart={frameGradientStart}
            gradientEnd={frameGradientEnd}
            borderWidth={2}
            gapWidth={1}
            glow={false}
          />
          <Text
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="medium"
            whiteSpace="nowrap"
          >
            {name}
          </Text>
          <RoleBadge badgeType={badgeType} badgeLabel={badgeLabel} />
        </Box>
      </MenuButton>
      {!!id && (
        <MenuList maxW={{ base: "100px" }}>
          <MenuItem w="100%" onClick={() => goToProfilePage(id.toString())}>
            프로필 보기
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  );
};

export const RecruitDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const userInfo = useRecoilValue(userState);
  const menuList = useRecoilValue(menuListState);
  const postId = Number(id);

  const { data: post, isLoading } = useFetchRecruitDetail(postId);
  const { data: comments = [] } = useFetchRecruitComments(postId);
  const { mutate: closePost } = useCloseRecruitPost();
  const { mutate: deletePost } = useDeleteRecruitPost();
  const { mutate: createComment } = useCreateRecruitComment(postId);
  const { mutate: deleteComment } = useDeleteRecruitComment(postId);

  const [commentText, setCommentText] = useState("");

  const color = useColorModeValue("gray.800", "whiteAlpha.900");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const contentColor = useColorModeValue("#2D3748", "#ffffffa3");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  // 메타 정보 박스 배경색
  const metaBgColor = useColorModeValue("gray.50", "whiteAlpha.50");
  const metaLabelColor = useColorModeValue("gray.500", "gray.400");
  const metaValueColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const isOwner =
    !!post?.author?.userId && post.author.userId === userInfo.userId;
  const canManage = (() => {
    if (userInfo.userId <= 0) return false;
    const findRecruit = (menus: typeof menuList): boolean =>
      menus.some(
        (m) =>
          (m.type === "RECRUIT" && !!m.manageable) ||
          (m.subMenu?.length && findRecruit(m.subMenu as typeof menuList))
      );
    return findRecruit(menuList);
  })();
  const canEdit = (isOwner || canManage) && post?.status === "ACTIVE";
  const canDelete = isOwner || canManage;

  const totalComments = comments.reduce(
    (acc, c) =>
      acc +
      (c.deleted ? 0 : 1) +
      (c.replies?.filter((r) => !r.deleted).length ?? 0),
    0
  );

  const handleClose = () => {
    if (!window.confirm("마감 처리 하시겠습니까?")) return;
    closePost(postId, {
      onSuccess: () =>
        toast({
          title: "마감 처리되었습니다.",
          status: "success",
          duration: 2000,
        }),
      onError: () =>
        toast({
          title: "오류가 발생했습니다.",
          status: "error",
          duration: 2000,
        }),
    });
  };

  const handleDelete = () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    deletePost(postId, {
      onSuccess: () => {
        toast({ title: "삭제되었습니다.", status: "success", duration: 2000 });
        navigate("/recruit", { replace: true });
      },
      onError: () =>
        toast({
          title: "오류가 발생했습니다.",
          status: "error",
          duration: 2000,
        }),
    });
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    createComment(
      { contents: commentText, parentCommentId: null },
      {
        onSuccess: () => setCommentText(""),
        onError: () =>
          toast({ title: "댓글 작성 실패", status: "error", duration: 2000 }),
      }
    );
  };

  if (isLoading || !post) return null;

  const coloredContents = `<div style="color:${contentColor}">${post.contents}</div>`;

  /* 작성자/관리자 액션 메뉴 */
  const ownerMenu = canDelete ? (
    <Menu autoSelect={false}>
      <MenuButton
        as={IconButton}
        aria-label="더보기"
        icon={<Icon as={BsThreeDotsVertical} />}
        variant="ghost"
        size="sm"
      />
      <MenuList>
        {canEdit && (
          <MenuItem onClick={() => navigate(`/recruit/${postId}/edit`)}>
            수정
          </MenuItem>
        )}
        {(isOwner || canManage) && post.status === "ACTIVE" && (
          <MenuItem onClick={handleClose}>마감 처리</MenuItem>
        )}
        <MenuItem color="red.500" onClick={handleDelete}>
          삭제
        </MenuItem>
      </MenuList>
    </Menu>
  ) : null;

  return (
    <Box maxW="984px" w="100%">
      {/* ── 데스크탑 헤더 ── */}
      <Show above="md">
        <Box
          display="flex"
          w="100%"
          m="0px auto 0 auto"
          borderBottom="1px solid"
          borderColor={borderColor}
          pb={6} // 여백 추가
        >
          <Box p="1.5rem 0 0 1rem" w="full">
            <Flex justify="space-between" align="flex-start" w="full">
              <Box w="full">
                {/* 태그 */}
                <Flex alignItems="center" gap={2} mb={3} flexWrap="wrap">
                  <Badge
                    colorScheme={TAG_COLORS[post.tag] ?? "gray"}
                    px={2.5}
                    py={0.5}
                    fontSize="sm"
                    borderRadius="full"
                  >
                    {TAG_LABELS[post.tag] ?? post.tag}
                  </Badge>
                  {post.status === "CLOSED" && (
                    <Badge
                      colorScheme="red"
                      px={2.5}
                      py={0.5}
                      fontSize="sm"
                      borderRadius="full"
                    >
                      마감
                    </Badge>
                  )}
                </Flex>

                {/* 제목 */}
                <Text
                  as="h2"
                  fontSize="1.75rem"
                  fontWeight="bold"
                  wordBreak="keep-all"
                  color={color}
                  lineHeight="1.3"
                  mb={4}
                >
                  {post.title}
                </Text>

                {/* 작성자 & 기본 메타 (작성일, 조회수) */}
                <Flex alignItems="center" gap={4} color={mutedColor} mb={6}>
                  <AuthorMenu
                    id={post.author.userId}
                    name={post.author.name}
                    profileImageUrl={post.author.profileImageUrl}
                    frameGradientStart={post.author.frameGradientStart}
                    frameGradientEnd={post.author.frameGradientEnd}
                    badgeType={post.author.badgeType}
                    badgeLabel={post.author.badgeLabel}
                  />
                  <Text color={borderColor}>|</Text>
                  <Flex alignItems="center" gap={1.5}>
                    <Icon as={BsClock} />
                    <Text fontSize="sm">
                      {toYYYYMMDDHHhhss(post.createdAt)}
                    </Text>
                    {post.modifiedAt &&
                      isModifiedContent(post.createdAt, post.modifiedAt) && (
                        <Text fontSize="xs">(수정됨)</Text>
                      )}
                  </Flex>
                  <Text color={borderColor}>|</Text>
                  <Flex alignItems="center" gap={1.5}>
                    <Icon as={BsFillEyeFill} boxSize="15px" />
                    <Text fontSize="sm">{post.viewCount}</Text>
                  </Flex>
                </Flex>

                {/* 정보 요약 박스 (모집인원, 기간, 스킬 등) */}
                <RecruitMetaBox
                  post={post}
                  metaBgColor={metaBgColor}
                  metaLabelColor={metaLabelColor}
                  metaValueColor={metaValueColor}
                />
              </Box>

              {/* 더보기 버튼 */}
              <Box pr="1rem" color={color}>
                {ownerMenu}
              </Box>
            </Flex>
          </Box>
        </Box>
      </Show>

      {/* ── 모바일 헤더 ── */}
      <Hide above="md">
        <Box pt="56px">
          <Flex
            py="0.5rem"
            borderBottom="1px solid"
            borderColor={borderColor}
            color={color}
          >
            <IconButton
              aria-label="뒤로가기"
              icon={<Icon as={BsArrowLeft} />}
              variant="ghost"
              onClick={() => navigate(-1)}
              size="sm"
            />
            <Spacer />
            {ownerMenu}
          </Flex>
          <Box borderBottom="1px solid" borderColor={borderColor} pb={5}>
            <Box m="16px 16px 0 16px">
              <Flex gap={2} mb={3} flexWrap="wrap">
                <Badge
                  colorScheme={TAG_COLORS[post.tag] ?? "gray"}
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="sm"
                >
                  {TAG_LABELS[post.tag] ?? post.tag}
                </Badge>
                {post.status === "CLOSED" && (
                  <Badge
                    colorScheme="red"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                    borderRadius="sm"
                  >
                    마감
                  </Badge>
                )}
              </Flex>
              <Text
                fontSize="1.25rem"
                fontWeight="bold"
                wordBreak="keep-all"
                color={color}
                mb={4}
                lineHeight="1.3"
              >
                {post.title}
              </Text>

              {/* 작성자 & 기본 메타 */}
              <Flex
                alignItems="center"
                gap={3}
                color={mutedColor}
                flexWrap="wrap"
                mb={5}
              >
                <AuthorMenu
                  id={post.author.userId}
                  name={post.author.name}
                  profileImageUrl={post.author.profileImageUrl}
                  frameGradientStart={post.author.frameGradientStart}
                  frameGradientEnd={post.author.frameGradientEnd}
                  badgeType={post.author.badgeType}
                  badgeLabel={post.author.badgeLabel}
                />
                <Text color={borderColor} userSelect="none">
                  |
                </Text>
                <Flex alignItems="center" gap={1.5}>
                  <Icon as={BsClock} boxSize="13px" />
                  <Text fontSize="xs">{toYYYYMMDDHHhhss(post.createdAt)}</Text>
                </Flex>
                <Text color={borderColor} userSelect="none">
                  |
                </Text>
                <Flex alignItems="center" gap={1.5}>
                  <Icon as={BsFillEyeFill} boxSize="15px" />
                  <Text fontSize="xs">{post.viewCount}</Text>
                </Flex>
              </Flex>

              {/* 정보 요약 박스 */}
              <RecruitMetaBox
                post={post}
                metaBgColor={metaBgColor}
                metaLabelColor={metaLabelColor}
                metaValueColor={metaValueColor}
              />
            </Box>
          </Box>
        </Box>
      </Hide>

      {/* ── 첨부파일 ── */}
      {(post.attachments?.length ?? 0) > 0 && (
        <Box maxW="984px" mx="auto" color={color}>
          <Accordion allowToggle borderColor={borderColor}>
            <AccordionItem>
              <AccordionButton _hover={{ backgroundColor: hoverBg }}>
                <Icon as={BsPaperclip} mr={1} />
                첨부파일({post.attachments.length})
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                {post.attachments.map((file) => (
                  <Tooltip
                    key={file.fileMetaDataId}
                    label="다운로드"
                    placement="right-end"
                  >
                    <Box
                      w="fit-content"
                      color={openColors.gray[6]}
                      _hover={{ color: openColors.gray[7] }}
                    >
                      <a
                        href={`${process.env.REACT_APP_API_FILE_ENDPOINT}${file.url}`}
                        download={file.originalFileName}
                      >
                        {file.originalFileName}
                      </a>
                    </Box>
                  </Tooltip>
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      )}

      {/* ── 본문 ── */}
      <Box
        maxW="100%"
        minH="450px"
        mx="auto"
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Box
          className="ck-content"
          m="16px"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(coloredContents, {
              ADD_TAGS: ["iframe"],
              ADD_ATTR: [
                "allow",
                "allowfullscreen",
                "frameborder",
                "scrolling",
              ],
            }),
          }}
        />
      </Box>

      {/* ── 댓글 헤더 ── */}
      <Box
        my="auto"
        borderBottom="1px solid"
        borderColor={borderColor}
        color={color}
      >
        <Flex my={{ base: "12px", md: "16px" }} ml="16px" gap={1}>
          <Icon as={BsChatLeftText} boxSize="16px" my="auto" />
          <Text ml="6px" fontSize="md" fontWeight="bold">
            댓글
          </Text>
          <Text
            ml="2px"
            fontSize="md"
            fontWeight="bold"
            color={openColors.orange[7]}
          >
            {totalComments}
          </Text>
        </Flex>
      </Box>

      {/* ── 루트 댓글 입력 ── */}
      <Box
        borderTop="1px solid"
        borderColor={borderColor}
        px={{ base: "12px", md: "16px" }}
        py="16px"
      >
        {userInfo.userId ? (
          <Flex gap={3} alignItems="flex-start">
            <GradientAvatar
              size="sm"
              name={userInfo.nickname}
              src={userInfo.profileImageUrl ?? undefined}
              glow={false}
            />
            <Box flex={1}>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="프로젝트에 대한 문의나 댓글을 남겨주세요."
                size="sm"
                resize="vertical"
                rows={3}
                borderColor={borderColor}
                borderRadius="md"
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px #4299E1",
                }}
              />
              <Flex justifyContent="flex-end" mt={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleSubmitComment}
                >
                  댓글 등록
                </Button>
              </Flex>
            </Box>
          </Flex>
        ) : (
          <Text
            fontSize="sm"
            color="gray.500"
            py={4}
            textAlign="center"
            bg={metaBgColor}
            borderRadius="md"
          >
            댓글을 작성하려면 로그인이 필요합니다.
          </Text>
        )}
      </Box>

      {/* ── 댓글 목록 (답글 입력창 인라인) ── */}
      <Box>
        {comments.map((c) => (
          <RecruitCommentItem
            key={c.id}
            postId={postId}
            comment={c}
            currentUserId={userInfo.userId}
            currentUserInfo={userInfo}
            onDelete={(id) => deleteComment(id)}
            borderColor={borderColor}
            color={color}
          />
        ))}
      </Box>
    </Box>
  );
};

/* ── 댓글 아이템 (루트 댓글 + 답글 목록 + 인라인 답글 입력창) ── */
const RecruitCommentItem = ({
  postId,
  comment,
  currentUserId,
  currentUserInfo,
  onDelete,
  borderColor,
  color,
}: {
  postId: number;
  comment: RecruitComment;
  currentUserId: number | null;
  currentUserInfo: { nickname: string; profileImageUrl: string | null };
  onDelete: (id: number) => void;
  borderColor: string;
  color: string;
}) => {
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyTargetName, setReplyTargetName] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const { mutate: createReply } = useCreateRecruitComment(postId);
  const toast = useToast();

  const replyBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const inputBorderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  const getTagName = (tagCommentId: number | null) => {
    if (!tagCommentId) return null;
    return (
      comment.replies?.find((r) => r.id === tagCommentId)?.author?.name ?? null
    );
  };

  const handleToggleReply = (id: number, nickname: string) => {
    if (replyTargetId === id) {
      setReplyTargetId(null);
      setReplyText("");
    } else {
      setReplyTargetId(id);
      setReplyTargetName(nickname);
      setReplyText("");
    }
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    createReply(
      { contents: replyText, parentCommentId: replyTargetId },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyTargetId(null);
        },
        onError: () =>
          toast({ title: "답글 작성 실패", status: "error", duration: 2000 }),
      }
    );
  };

  return (
    <Box borderTop="1px solid" borderColor={borderColor} color={color}>
      {/* 루트 댓글 */}
      <CommentFormationRow
        comment={comment}
        tagName={null}
        currentUserId={currentUserId}
        replyTargetId={replyTargetId}
        onReply={handleToggleReply}
        onDelete={onDelete}
      />

      {/* 답글 목록 */}
      {comment.replies?.map((reply) => (
        <Box
          key={reply.id}
          w="100%"
          pl={{ base: "36px", md: "64px" }}
          borderTop="1px solid"
          borderColor={borderColor}
          bg={replyBg}
        >
          <CommentFormationRow
            comment={reply}
            tagName={getTagName(reply.tagCommentId)}
            currentUserId={currentUserId}
            replyTargetId={replyTargetId}
            onReply={handleToggleReply}
            onDelete={onDelete}
            isReply
          />
        </Box>
      ))}

      {/* 인라인 답글 입력창 */}
      {replyTargetId !== null && currentUserId && (
        <Box
          pl={{ base: "36px", md: "64px" }}
          pr={{ base: "12px", md: "16px" }}
          py="12px"
          borderTop="1px solid"
          borderColor={borderColor}
          bg={replyBg}
        >
          <Flex alignItems="center" gap={1} mb={2}>
            <Icon as={BsArrowReturnRight} color="gray.500" boxSize="0.8rem" />
            <Text fontSize="xs" color="blue.500" fontWeight="medium">
              @{replyTargetName} 님에게 답글
            </Text>
            <Button
              size="xs"
              variant="ghost"
              color="gray.400"
              ml={1}
              onClick={() => {
                setReplyTargetId(null);
                setReplyText("");
              }}
            >
              취소
            </Button>
          </Flex>
          <Flex gap={2} alignItems="flex-start">
            <GradientAvatar
              size="xs"
              name={currentUserInfo.nickname}
              src={currentUserInfo.profileImageUrl ?? undefined}
              glow={false}
            />
            <Box flex={1}>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="답글을 입력하세요..."
                size="sm"
                rows={2}
                resize="vertical"
                borderColor={inputBorderColor}
                borderRadius="md"
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px #4299E1",
                }}
                autoFocus
              />
              <Flex justifyContent="flex-end" mt={1.5} gap={2}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    setReplyTargetId(null);
                    setReplyText("");
                  }}
                >
                  취소
                </Button>
                <Button
                  size="xs"
                  colorScheme="blue"
                  onClick={handleSubmitReply}
                >
                  답글 등록
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

/* ── CommentFormation — 프레임/뱃지/답글 달기 포함 ── */
const CommentFormationRow = ({
  comment,
  tagName,
  currentUserId,
  replyTargetId,
  onReply,
  onDelete,
  isReply = false,
}: {
  comment: RecruitComment;
  tagName: string | null;
  currentUserId: number | null;
  replyTargetId: number | null;
  onReply: (id: number, nickname: string) => void;
  onDelete: (id: number) => void;
  isReply?: boolean;
}) => {
  const navigate = useNavigate();
  const color = useColorModeValue("gray.800", "whiteAlpha.900");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");
  const deletedColor = useColorModeValue("gray.400", "whiteAlpha.400");
  const isOwn = currentUserId === comment.author?.userId;
  const { author } = comment;

  /* 삭제된 댓글 플레이스홀더 — 일반 Post와 동일 */
  if (comment.deleted) {
    return (
      <Box px={{ base: "12px", md: "16px" }} py="0.875rem">
        <Text fontSize="sm" color={deletedColor} fontStyle="italic">
          삭제된 댓글입니다.
        </Text>
      </Box>
    );
  }

  return (
    <Box px={{ base: "12px", md: "16px" }} py="0.875rem">
      {/* 작성자 | 날짜 행 — CommentFormation과 동일 구조 */}
      <Flex alignItems="center" gap={3} mb={1.5} flexWrap="wrap">
        <Menu autoSelect={false}>
          <MenuButton>
            <Flex alignItems="center" gap="6px">
              <GradientAvatar
                size="xs"
                src={author?.profileImageUrl ?? undefined}
                name={author?.profileImageUrl ? undefined : author?.name}
                gradientStart={author?.frameGradientStart}
                gradientEnd={author?.frameGradientEnd}
                borderWidth={2}
                gapWidth={1}
                glow={false}
              />
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="medium"
                whiteSpace="nowrap"
              >
                {author?.name}
              </Text>
              {author && (
                <RoleBadge
                  badgeType={author.badgeType}
                  badgeLabel={author.badgeLabel}
                />
              )}
            </Flex>
          </MenuButton>
          <MenuList maxW="120px">
            <MenuItem onClick={() => navigate(`/profile/${author?.userId}`)}>
              프로필 보기
            </MenuItem>
          </MenuList>
        </Menu>

        <Text color={borderColor} userSelect="none">
          |
        </Text>

        <Flex alignItems="baseline" gap={1} color={mutedColor}>
          <Text fontSize="sm">{toYYYYMMDDHHhhss(comment.createdAt)}</Text>
          {comment.modifiedAt &&
            isModifiedContent(comment.createdAt, comment.modifiedAt) && (
              <Text fontSize="xs">(수정됨)</Text>
            )}
        </Flex>

        {isOwn && (
          <Menu autoSelect={false}>
            <MenuButton
              as={IconButton}
              aria-label="더보기"
              icon={<Icon as={BsThreeDotsVertical} />}
              variant="ghost"
              size="xs"
              ml="auto"
              color={mutedColor}
            />
            <MenuList>
              <MenuItem color="red.500" onClick={() => onDelete(comment.id)}>
                삭제
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>

      {/* 태그된 사람 표시 */}
      {tagName && (
        <Flex alignItems="center" gap={1} mb={1} ml={{ base: 0, md: "34px" }}>
          <Icon as={BsArrowReturnRight} color={mutedColor} boxSize="1rem" />
          <Text fontSize="md" color="blue.500" fontWeight="medium">
            @{tagName}
          </Text>
        </Flex>
      )}

      {/* 댓글 내용 */}
      <Text
        fontSize="sm"
        whiteSpace="pre-wrap"
        color={color}
        ml={{ base: 0, md: "34px" }}
        lineHeight="1.6"
      >
        {comment.contents}
      </Text>

      {/* 답글 버튼 — 루트/답글 모두 표시 */}
      <Button
        size="xs"
        variant="ghost"
        color={mutedColor}
        leftIcon={<Icon as={BsArrowReturnRight} />}
        mt={1.5}
        ml={{ base: 0, md: "28px" }}
        onClick={() => onReply(comment.id, author?.name ?? "")}
      >
        {replyTargetId === comment.id ? "답글 취소" : "답글 달기"}
      </Button>
    </Box>
  );
};
