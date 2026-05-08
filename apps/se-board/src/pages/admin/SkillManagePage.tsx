import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Image,
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
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BsPlus, BsSearch, BsToggleOff, BsToggleOn, BsX } from "react-icons/bs";
import { useDebounce } from "use-debounce";

import { HTTP_METHODS } from "@/api";
import { _axios, getJWTHeader } from "@/api/axiosInstance";
import siIndex from "@/assets/simple-icons-index.json";
import { PageHeaderTitle } from "@/components/admin";

interface SkillTag {
  id: number;
  name: string;
  category: string;
  active: boolean;
  iconSlug: string | null;
}

interface PageResult {
  content: SkillTag[];
  totalPages: number;
  number: number;
  totalElements: number;
}

type SkillPayload = { name: string; category: string; iconSlug: string | null };

const fetchSkills = (category: string, keyword: string, page: number) =>
  _axios<PageResult>({
    url: "/admin/skills",
    method: HTTP_METHODS.GET,
    headers: { ...getJWTHeader() },
    params: {
      category: category || undefined,
      keyword: keyword || undefined,
      page,
      size: 20,
    },
  });

const createSkill = (data: SkillPayload) =>
  _axios<SkillTag>({
    url: "/admin/skills",
    method: HTTP_METHODS.POST,
    headers: { ...getJWTHeader() },
    data,
  });

const updateSkill = (id: number, data: SkillPayload) =>
  _axios<SkillTag>({
    url: `/admin/skills/${id}`,
    method: HTTP_METHODS.PUT,
    headers: { ...getJWTHeader() },
    data,
  });

const toggleSkill = (id: number) =>
  _axios<void>({
    url: `/admin/skills/${id}/toggle`,
    method: "PATCH",
    headers: { ...getJWTHeader() },
  });

const CATEGORIES = [
  "FRONTEND",
  "BACKEND",
  "DB",
  "INFRA",
  "LANGUAGE",
  "GAME",
  "EMBEDDED",
  "AI",
  "OTHER",
];

const CDN_BASE = "https://cdn.simpleicons.org";

const ALL_ICONS = (siIndex as { slug: string; title: string }[])
  .slice()
  .sort((a, b) => a.title.localeCompare(b.title));

/* ── 아이콘 피커 ── */
const IconPicker = ({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (slug: string | null) => void;
}) => {
  const [search, setSearch] = useState("");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_ICONS.slice(0, 40);
    const q = search.toLowerCase();
    return ALL_ICONS.filter(
      (i) => i.title.toLowerCase().includes(q) || i.slug.includes(q)
    ).slice(0, 40);
  }, [search]);

  return (
    <Box>
      {value && (
        <Flex alignItems="center" gap={2} mb={2}>
          <Image
            src={`${CDN_BASE}/${value}`}
            w="20px"
            h="20px"
            objectFit="contain"
          />
          <Text fontSize="sm" fontWeight="medium">
            {value}
          </Text>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="red"
            leftIcon={<Icon as={BsX} />}
            onClick={() => onChange(null)}
          >
            제거
          </Button>
        </Flex>
      )}
      <InputGroup size="sm" mb={2}>
        <Input
          placeholder="아이콘 검색 (예: react, java, docker)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <InputRightElement>
          <Icon as={BsSearch} color="gray.400" />
        </InputRightElement>
      </InputGroup>
      <Box
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        overflowY="auto"
        maxH="200px"
        p={2}
      >
        <Flex flexWrap="wrap" gap={1}>
          {filtered.map((icon) => (
            <Box
              key={icon.slug}
              as="button"
              type="button"
              p="6px"
              borderRadius="md"
              border="1px solid"
              borderColor={value === icon.slug ? "blue.400" : "transparent"}
              bg={value === icon.slug ? "blue.50" : "transparent"}
              _hover={{ bg: hoverBg }}
              _dark={{ bg: value === icon.slug ? "blue.900" : "transparent" }}
              onClick={() => onChange(icon.slug)}
              title={icon.title}
            >
              <Image
                src={`${CDN_BASE}/${icon.slug}`}
                w="20px"
                h="20px"
                objectFit="contain"
              />
            </Box>
          ))}
        </Flex>
        {filtered.length === 0 && (
          <Text fontSize="xs" color="gray.400" textAlign="center" py={4}>
            검색 결과 없음
          </Text>
        )}
      </Box>
      <Text fontSize="xs" color="gray.400" mt={1}>
        {search
          ? `${filtered.length}개 표시`
          : "상위 40개 표시 — 검색으로 찾기"}
      </Text>
    </Box>
  );
};

/* ── 페이지네이션 ── */
const Pagination = ({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const range = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const start = Math.max(0, Math.min(page - 2, totalPages - 5));
    return start + i;
  });

  return (
    <HStack justifyContent="center" mt={4} spacing={1}>
      <Button size="sm" onClick={() => onChange(0)} isDisabled={page === 0}>
        {"<<"}
      </Button>
      <Button
        size="sm"
        onClick={() => onChange(page - 1)}
        isDisabled={page === 0}
      >
        {"<"}
      </Button>
      {range.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "solid" : "outline"}
          colorScheme={p === page ? "blue" : "gray"}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </Button>
      ))}
      <Button
        size="sm"
        onClick={() => onChange(page + 1)}
        isDisabled={page >= totalPages - 1}
      >
        {">"}
      </Button>
      <Button
        size="sm"
        onClick={() => onChange(totalPages - 1)}
        isDisabled={page >= totalPages - 1}
      >
        {">>"}
      </Button>
    </HStack>
  );
};

/* ── 메인 페이지 ── */
export const SkillManagePage = () => {
  const toast = useToast();
  const qc = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editing, setEditing] = useState<SkillTag | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("FRONTEND");
  const [iconSlug, setIconSlug] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [debouncedKeyword] = useDebounce(filterKeyword, 300);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery(
    ["admin-skills", filterCategory, debouncedKeyword, page],
    () => fetchSkills(filterCategory, debouncedKeyword, page),
    { select: (res) => res.data, keepPreviousData: true }
  );

  const { mutate: createMutate, isLoading: creating } = useMutation(
    createSkill,
    {
      onSuccess: () => {
        qc.invalidateQueries(["admin-skills"]);
        toast({ title: "추가되었습니다.", status: "success", duration: 2000 });
        handleClose();
      },
      onError: () =>
        toast({
          title: "오류가 발생했습니다.",
          status: "error",
          duration: 2000,
        }),
    }
  );

  const { mutate: updateMutate, isLoading: updating } = useMutation(
    ({ id, data }: { id: number; data: SkillPayload }) => updateSkill(id, data),
    {
      onSuccess: () => {
        qc.invalidateQueries(["admin-skills"]);
        toast({ title: "수정되었습니다.", status: "success", duration: 2000 });
        handleClose();
      },
      onError: () =>
        toast({
          title: "오류가 발생했습니다.",
          status: "error",
          duration: 2000,
        }),
    }
  );

  const { mutate: toggleMutate } = useMutation(toggleSkill, {
    onSuccess: () => qc.invalidateQueries(["admin-skills"]),
    onError: () =>
      toast({ title: "오류가 발생했습니다.", status: "error", duration: 2000 }),
  });

  const handleOpen = (skill?: SkillTag) => {
    setEditing(skill ?? null);
    setName(skill?.name ?? "");
    setCategory(skill?.category ?? "FRONTEND");
    setIconSlug(skill?.iconSlug ?? null);
    onOpen();
  };

  const handleClose = () => {
    setEditing(null);
    setName("");
    setCategory("FRONTEND");
    setIconSlug(null);
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const payload: SkillPayload = { name, category, iconSlug };
    if (editing) updateMutate({ id: editing.id, data: payload });
    else createMutate(payload);
  };

  const handleFilterCategory = (val: string) => {
    setFilterCategory(val);
    setPage(0);
  };

  const handleFilterKeyword = (val: string) => {
    setFilterKeyword(val);
    setPage(0);
  };

  return (
    <Box h="full" textAlign="left">
      <PageHeaderTitle title="스킬 태그 관리" />

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Button
          leftIcon={<Icon as={BsPlus} />}
          colorScheme="blue"
          size="sm"
          onClick={() => handleOpen()}
        >
          스킬 추가
        </Button>
        <Select
          size="sm"
          w="150px"
          value={filterCategory}
          onChange={(e) => handleFilterCategory(e.target.value)}
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <InputGroup size="sm" w="200px">
          <Input
            placeholder="이름 검색"
            value={filterKeyword}
            onChange={(e) => handleFilterKeyword(e.target.value)}
          />
          <InputRightElement>
            <Icon as={BsSearch} color="gray.400" />
          </InputRightElement>
        </InputGroup>
        {data && (
          <Text fontSize="sm" color="gray.500">
            총 {data.totalElements}개
          </Text>
        )}
      </HStack>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>아이콘</Th>
                <Th>이름</Th>
                <Th>카테고리</Th>
                <Th>상태</Th>
                <Th>관리</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.content.map((skill) => (
                <Tr key={skill.id}>
                  <Td>
                    {skill.iconSlug ? (
                      <Image
                        src={`${CDN_BASE}/${skill.iconSlug}`}
                        w="18px"
                        h="18px"
                        objectFit="contain"
                      />
                    ) : (
                      <Text fontSize="xs" color="gray.400">
                        —
                      </Text>
                    )}
                  </Td>
                  <Td>{skill.name}</Td>
                  <Td>
                    <Badge>{skill.category}</Badge>
                  </Td>
                  <Td>
                    <Icon
                      as={skill.active ? BsToggleOn : BsToggleOff}
                      color={skill.active ? "green.400" : "gray.400"}
                      boxSize={5}
                      cursor="pointer"
                      onClick={() => toggleMutate(skill.id)}
                    />
                  </Td>
                  <Td>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleOpen(skill)}
                    >
                      수정
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 0}
            onChange={setPage}
          />
        </>
      )}

      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editing ? "스킬 수정" : "스킬 추가"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel fontSize="sm">이름</FormLabel>
              <Input
                size="sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel fontSize="sm">카테고리</FormLabel>
              <Select
                size="sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">아이콘 (simple-icons)</FormLabel>
              <IconPicker value={iconSlug} onChange={setIconSlug} />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button size="sm" variant="ghost" onClick={handleClose}>
              취소
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleSave}
              isLoading={creating || updating}
            >
              {editing ? "수정" : "추가"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SkillManagePage;
