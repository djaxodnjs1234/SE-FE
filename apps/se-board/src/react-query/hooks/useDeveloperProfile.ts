import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  DeveloperProfileRequest,
  updateDeveloperProfile,
} from "@/api/developerProfile";

import { queryKeys } from "../queryKeys";

export const useUpdateDeveloperProfile = () => {
  const qc = useQueryClient();
  return useMutation(
    (data: DeveloperProfileRequest) => updateDeveloperProfile(data),
    { onSuccess: () => qc.invalidateQueries([queryKeys.profile]) }
  );
};
