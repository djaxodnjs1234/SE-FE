import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  closeRecruitPost,
  createRecruitComment,
  createRecruitPost,
  deleteRecruitComment,
  deleteRecruitPost,
  fetchRecruitComments,
  fetchRecruitDetail,
  fetchRecruitList,
  fetchSkillTags,
  RecruitPostRequest,
  updateRecruitPost,
} from "@/api/recruit";

import { queryKeys } from "../queryKeys";

export const useFetchRecruitList = (params: {
  type?: string;
  includeClose?: boolean;
  page?: number;
  sort?: import("@/api/recruit").RecruitSortType;
}) => {
  return useQuery([queryKeys.recruit, params], () => fetchRecruitList(params), {
    select: (res) => res.data,
  });
};

export const useFetchRecruitDetail = (id: number) => {
  return useQuery([queryKeys.recruit, id], () => fetchRecruitDetail(id), {
    select: (res) => res.data,
    enabled: !!id,
  });
};

export const useCreateRecruitPost = () => {
  const qc = useQueryClient();
  return useMutation((data: RecruitPostRequest) => createRecruitPost(data), {
    onSuccess: () => qc.invalidateQueries([queryKeys.recruit]),
  });
};

export const useUpdateRecruitPost = (id: number) => {
  const qc = useQueryClient();
  return useMutation(
    (data: RecruitPostRequest) => updateRecruitPost(id, data),
    { onSuccess: () => qc.invalidateQueries([queryKeys.recruit]) }
  );
};

export const useCloseRecruitPost = () => {
  const qc = useQueryClient();
  return useMutation((id: number) => closeRecruitPost(id), {
    onSuccess: () => qc.invalidateQueries([queryKeys.recruit]),
  });
};

export const useDeleteRecruitPost = () => {
  const qc = useQueryClient();
  return useMutation((id: number) => deleteRecruitPost(id), {
    onSuccess: (_data, id) => {
      qc.removeQueries([queryKeys.recruit, id]);
      qc.invalidateQueries([queryKeys.recruit]);
    },
  });
};

export const useFetchRecruitComments = (recruitPostId: number) => {
  return useQuery(
    [queryKeys.recruitComments, recruitPostId],
    () => fetchRecruitComments(recruitPostId),
    { select: (res) => res.data, enabled: !!recruitPostId }
  );
};

export const useCreateRecruitComment = (recruitPostId: number) => {
  const qc = useQueryClient();
  return useMutation(
    (data: { contents: string; parentCommentId?: number | null }) =>
      createRecruitComment(recruitPostId, data),
    {
      onSuccess: () =>
        qc.invalidateQueries([queryKeys.recruitComments, recruitPostId]),
    }
  );
};

export const useDeleteRecruitComment = (recruitPostId: number) => {
  const qc = useQueryClient();
  return useMutation(
    (commentId: number) => deleteRecruitComment(recruitPostId, commentId),
    {
      onSuccess: () =>
        qc.invalidateQueries([queryKeys.recruitComments, recruitPostId]),
    }
  );
};

export const useSkillTagsPaged = (params: {
  category: string;
  keyword: string;
  page: number;
}) => {
  return useQuery(
    [queryKeys.skills, params.category, params.keyword, params.page],
    () => fetchSkillTags(params),
    {
      select: (res) => res.data,
      keepPreviousData: true,
      staleTime: 30_000,
    }
  );
};
