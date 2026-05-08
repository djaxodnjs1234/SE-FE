import { DeveloperProfileInfo } from "@types";

import { HTTP_METHODS } from ".";
import { _axios, getJWTHeader } from "./axiosInstance";

export interface DeveloperProfileRequest {
  intro?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  grade?: string;
  readmeContent?: string;
  skillIds?: number[];
}

export const updateDeveloperProfile = (data: DeveloperProfileRequest) => {
  return _axios<DeveloperProfileInfo>({
    url: "/developer-profile",
    method: HTTP_METHODS.PUT,
    headers: { ...getJWTHeader() },
    data,
  });
};
