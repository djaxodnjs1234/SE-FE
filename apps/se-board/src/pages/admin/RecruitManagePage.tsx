import {
  Badge,
  Box,
  Button,
  HStack,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { HTTP_METHODS } from "@/api";
import { _axios, getJWTHeader } from "@/api/axiosInstance";
import { PageHeaderTitle } from "@/components/admin";

interface RecruitPostSummary {
  id: number;
  type: string;
  tag: string;
  title: string;
  status: string;
  accountId: number;
}

interface PageResult {
  content: RecruitPostSummary[];
  totalPages: number;
  number: number;
}

const fetchAdminRecruits = (type?: string, page = 0) =>
  _axios<PageResult>({
    url: "/admin/recruit",
    method: HTTP_METHODS.GET,
    headers: { ...getJWTHeader() },
    params: { type: type || undefined, page, size: 20 },
  });

const forceClose = (id: number) =>
  _axios<void>({
    url: `/admin/recruit/${id}/close`,
    method: "PATCH",
    headers: { ...getJWTHeader() },
  });

const forceDelete = (id: number) =>
  _axios<void>({
    url: `/admin/recruit/${id}`,
    method: HTTP_METHODS.DELETE,
    headers: { ...getJWTHeader() },
  });

const TAG_LABELS: Record<string, string> = {
  TEAM_RECRUIT: "팀 모집",
  JOB_POSTING: "채용",
  TEAM_JOIN: "팀 합류",
  JOB_SEEK: "구직",
};

export const RecruitManagePage = () => {
  const toast = useToast();
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery(
    ["admin-recruit", typeFilter, page],
    () => fetchAdminRecruits(typeFilter || undefined, page),
    { select: (res) => res.data }
  );

  const { mutate: closeMutate } = useMutation(forceClose, {
    onSuccess: () => {
      qc.invalidateQueries(["admin-recruit"]);
      toast({
        title: "마감 처리되었습니다.",
        status: "success",
        duration: 2000,
      });
    },
    onError: () =>
      toast({ title: "오류가 발생했습니다.", status: "error", duration: 2000 }),
  });

  const { mutate: deleteMutate } = useMutation(forceDelete, {
    onSuccess: () => {
      qc.invalidateQueries(["admin-recruit"]);
      toast({ title: "삭제되었습니다.", status: "success", duration: 2000 });
    },
    onError: () =>
      toast({ title: "오류가 발생했습니다.", status: "error", duration: 2000 }),
  });

  const handleDelete = (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    deleteMutate(id);
  };

  return (
    <Box h="full" textAlign="left">
      <PageHeaderTitle title="구인구직 관리" />

      <HStack mb={4} spacing={3}>
        <Select
          size="sm"
          w="150px"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(0);
          }}
        >
          <option value="">전체</option>
          <option value="RECRUIT">구인</option>
          <option value="SEEK">구직</option>
        </Select>
      </HStack>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>분류</Th>
                <Th>제목</Th>
                <Th>상태</Th>
                <Th>작성자</Th>
                <Th>관리</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.content.map((post) => (
                <Tr key={post.id}>
                  <Td>{post.id}</Td>
                  <Td>
                    <Badge fontSize="xs">
                      {TAG_LABELS[post.tag] ?? post.tag}
                    </Badge>
                  </Td>
                  <Td maxW="300px">
                    <Text noOfLines={1}>{post.title}</Text>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={post.status === "ACTIVE" ? "green" : "red"}
                    >
                      {post.status === "ACTIVE" ? "진행중" : "마감"}
                    </Badge>
                  </Td>
                  <Td>{post.accountId}</Td>
                  <Td>
                    <HStack spacing={1}>
                      {post.status === "ACTIVE" && (
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="orange"
                          onClick={() => closeMutate(post.id)}
                        >
                          마감
                        </Button>
                      )}
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => handleDelete(post.id)}
                      >
                        삭제
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {data && data.totalPages > 1 && (
            <HStack justifyContent="center" mt={4} spacing={1}>
              <Button
                size="sm"
                onClick={() => setPage(0)}
                isDisabled={page === 0}
              >
                {"<<"}
              </Button>
              <Button
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                isDisabled={page === 0}
              >
                {"<"}
              </Button>
              {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                const start = Math.max(
                  0,
                  Math.min(page - 2, data.totalPages - 5)
                );
                const p = start + i;
                return (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === page ? "solid" : "outline"}
                    colorScheme={p === page ? "blue" : "gray"}
                    onClick={() => setPage(p)}
                  >
                    {p + 1}
                  </Button>
                );
              })}
              <Button
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                isDisabled={page >= data.totalPages - 1}
              >
                {">"}
              </Button>
              <Button
                size="sm"
                onClick={() => setPage(data.totalPages - 1)}
                isDisabled={page >= data.totalPages - 1}
              >
                {">>"}
              </Button>
            </HStack>
          )}
        </>
      )}
    </Box>
  );
};

export default RecruitManagePage;
