import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Radio,
  RadioGroup,
  StackDivider,
  Text,
  Tooltip,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";

import { RecruitPostRequest } from "@/api/recruit";
import {
  SelectedSkill,
  SkillTagPicker,
} from "@/components/common/SkillTagPicker";
import { RecruitFileUploader } from "@/components/recruit/RecruitFileUploader";
import { RecruitWritingEditor } from "@/components/writing/RecruitWritingEditor";
import {
  useCreateRecruitPost,
  useFetchRecruitDetail,
  useUpdateRecruitPost,
} from "@/react-query/hooks/useRecruit";
import { openColors } from "@/styles";

const PRIVACY_OPTIONS = [
  { kor: "전체", eng: "PUBLIC", desc: "모든 사용자가 볼 수 있습니다." },
  { kor: "금오인", eng: "KUMOH", desc: "인증된 금오인만 볼 수 있습니다." },
  { kor: "비밀", eng: "PRIVACY", desc: "비밀글입니다." },
] as const;

const TYPE_OPTIONS = [
  { label: "구인", value: "RECRUIT" },
  { label: "구직", value: "SEEK" },
] as const;

const TAG_OPTIONS: Record<string, { label: string; value: string }[]> = {
  RECRUIT: [
    { label: "팀 모집", value: "TEAM_RECRUIT" },
    { label: "채용 공고", value: "JOB_POSTING" },
  ],
  SEEK: [
    { label: "팀 합류", value: "TEAM_JOIN" },
    { label: "구직", value: "JOB_SEEK" },
  ],
};

export const RecruitFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const postId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: existing } = useFetchRecruitDetail(isEdit ? postId : 0);
  const { mutate: create, isLoading: creating } = useCreateRecruitPost();
  const { mutate: update, isLoading: updating } = useUpdateRecruitPost(postId);

  const [type, setType] = useState("RECRUIT");
  const [tag, setTag] = useState("TEAM_RECRUIT");
  // title/contents: 제출 시 사용 (에디터 onChange로 업데이트)
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  // initialTitle/initialContents: 에디터 초기값 (edit 모드에서 API 로드 후 한 번만 세팅)
  const [initialTitle, setInitialTitle] = useState("");
  const [initialContents, setInitialContents] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [attachmentIds, setAttachmentIds] = useState<number[]>([]);
  const [headcount, setHeadcount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "KUMOH" | "PRIVACY">(
    "PUBLIC"
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");
  const labelColor = useColorModeValue("gray.7", "whiteAlpha.800");
  const inputBorderColor = useColorModeValue("gray.200", "whiteAlpha.300");
  const privacyDesc =
    PRIVACY_OPTIONS.find((o) => o.eng === privacy)?.desc ?? "";

  useEffect(() => {
    if (existing && isEdit) {
      if (existing.status === "CLOSED") {
        toast({
          title: "마감된 게시글은 수정할 수 없습니다.",
          status: "warning",
          duration: 2000,
        });
        navigate(`/recruit/${postId}`, { replace: true });
        return;
      }
      setType(existing.type);
      setTag(existing.tag);
      setTitle(existing.title);
      setContents(existing.contents);
      setInitialTitle(existing.title);
      setInitialContents(existing.contents);
      setHeadcount(existing.headcount?.toString() ?? "");
      setStartDate(existing.startDate ?? "");
      setEndDate(existing.endDate ?? "");
      setPortfolioUrl(existing.portfolioUrl ?? "");
      setSelectedSkills(
        existing.skills.map((s) => ({
          id: s.id,
          name: s.name,
          iconSlug: s.iconSlug,
        }))
      );
    }
  }, [existing, isEdit]);

  useEffect(() => {
    setTag(TAG_OPTIONS[type][0].value);
  }, [type]);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "제목을 입력해주세요.",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    if (!contents.trim()) {
      toast({
        title: "내용을 입력해주세요.",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    if (privacy === "PRIVACY" && !password) {
      toast({
        title: "비밀번호를 입력해주세요.",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    const payload: RecruitPostRequest = {
      type,
      tag,
      title,
      contents,
      skillIds: selectedSkills.map((s) => s.id),
      attachmentIds,
      exposeState: privacy,
      privatePassword: privacy === "PRIVACY" ? password : undefined,
      headcount: type === "RECRUIT" && headcount ? Number(headcount) : null,
      startDate: type === "RECRUIT" && startDate ? startDate : null,
      endDate: type === "RECRUIT" && endDate ? endDate : null,
      portfolioUrl: type === "SEEK" && portfolioUrl ? portfolioUrl : null,
    };

    const onSuccess = () => {
      toast({
        title: isEdit ? "수정되었습니다." : "등록되었습니다.",
        status: "success",
        duration: 2000,
      });
      navigate("/recruit");
    };
    const onError = () =>
      toast({ title: "오류가 발생했습니다.", status: "error", duration: 2000 });

    if (isEdit) update(payload, { onSuccess, onError });
    else create(payload, { onSuccess, onError });
  };

  return (
    <Box maxW="984px" w="100%" pt="56px" mx="auto">
      {/* 상단 설정 바 — DesktopCategoryAndPrivacySetting 스타일 */}
      <Flex
        minH="75px"
        borderY="1px solid"
        borderColor={borderColor}
        justifyContent="space-between"
        alignItems="flex-start"
        px="1rem"
        py="0.75rem"
        gap={4}
        flexWrap="wrap"
      >
        {/* 유형 + 분류 */}
        <Box color={labelColor}>
          <Text fontWeight="bold" fontSize="sm" mb={2}>
            유형
          </Text>
          <RadioGroup value={type} onChange={setType} isDisabled={isEdit}>
            <HStack spacing={4} mb={2}>
              {TYPE_OPTIONS.map((o) => (
                <Radio key={o.value} value={o.value} size="sm">
                  {o.label}
                </Radio>
              ))}
            </HStack>
          </RadioGroup>
          <RadioGroup value={tag} onChange={setTag}>
            <HStack spacing={4}>
              {TAG_OPTIONS[type].map((o) => (
                <Radio
                  key={o.value}
                  value={o.value}
                  size="sm"
                  colorScheme="blue"
                >
                  {o.label}
                </Radio>
              ))}
            </HStack>
          </RadioGroup>
        </Box>

        {/* 모집 정보 (RECRUIT 전용) */}
        {type === "RECRUIT" ? (
          <Box color={labelColor}>
            <Text fontWeight="bold" fontSize="sm" mb={2}>
              모집 정보
            </Text>
            <HStack spacing={3} flexWrap="wrap">
              <Box>
                <Text fontSize="xs" mb={1}>
                  인원
                </Text>
                <Input
                  size="sm"
                  type="number"
                  w="60px"
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  placeholder="명"
                  borderColor={inputBorderColor}
                />
              </Box>
              <Box>
                <Text fontSize="xs" mb={1}>
                  시작일
                </Text>
                <Input
                  size="sm"
                  type="date"
                  w="140px"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  borderColor={inputBorderColor}
                />
              </Box>
              <Box>
                <Text fontSize="xs" mb={1}>
                  마감일
                </Text>
                <Input
                  size="sm"
                  type="date"
                  w="140px"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  borderColor={inputBorderColor}
                />
              </Box>
            </HStack>
          </Box>
        ) : (
          <Box color={labelColor}>
            <Text fontWeight="bold" fontSize="sm" mb={2}>
              포트폴리오
            </Text>
            <Input
              size="sm"
              w="240px"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://..."
              borderColor={inputBorderColor}
            />
          </Box>
        )}

        {/* 공개범위 */}
        <Box color={labelColor} maxW="340px">
          <Flex alignItems="baseline" gap={2} mb={2}>
            <Text fontWeight="bold" fontSize="sm">
              공개범위
            </Text>
            <Text fontSize="xs" color="gray.500">
              {privacyDesc}
            </Text>
          </Flex>
          <HStack
            spacing="0"
            border={`1px solid ${openColors.gray[3]}`}
            divider={<StackDivider borderColor={borderColor} />}
            mb={2}
          >
            {PRIVACY_OPTIONS.map((o) => (
              <Button
                key={o.eng}
                size="sm"
                variant={privacy === o.eng ? "primary" : "outline"}
                flexGrow={1}
                borderRadius="0"
                border="none"
                onClick={() => setPrivacy(o.eng)}
              >
                {o.kor}
              </Button>
            ))}
          </HStack>
          {privacy === "PRIVACY" && (
            <InputGroup size="sm">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해주세요."
                borderColor={inputBorderColor}
              />
              <InputRightElement>
                <Tooltip
                  label={showPassword ? "숨기기" : "보기"}
                  closeDelay={2000}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <Icon as={showPassword ? BsEyeSlashFill : BsEyeFill} />
                  </Button>
                </Tooltip>
              </InputRightElement>
            </InputGroup>
          )}
        </Box>
      </Flex>

      {/* 기술 스택 피커 — 에디터 상단 */}
      <Box
        px="1rem"
        py="0.75rem"
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Text fontWeight="bold" fontSize="sm" color={labelColor} mb={2}>
          기술 스택
        </Text>
        <SkillTagPicker
          selectedSkills={selectedSkills}
          onToggle={(skill) =>
            setSelectedSkills((prev) =>
              prev.some((s) => s.id === skill.id)
                ? prev.filter((s) => s.id !== skill.id)
                : [...prev, skill]
            )
          }
        />
      </Box>

      {/* 첨부파일 업로더 */}
      <Box pb={3}>
        <RecruitFileUploader onAttachmentIdsChange={setAttachmentIds} />
      </Box>

      {/* 위지윅 에디터 (제목 포함) */}
      <RecruitWritingEditor
        initialTitle={initialTitle}
        initialContents={initialContents}
        onTitleChange={setTitle}
        onContentsChange={setContents}
      />

      {/* 하단 등록 바 — DesktopAnonymousRegister 스타일 */}
      <Center
        borderTop="1px solid"
        borderColor={borderColor}
        py="1rem"
        px="1rem"
        justifyContent="flex-end"
      >
        <ButtonGroup spacing={3}>
          <Button variant="outline" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={creating || updating}
          >
            {isEdit ? "수정" : "등록"}
          </Button>
        </ButtonGroup>
      </Center>
    </Box>
  );
};
