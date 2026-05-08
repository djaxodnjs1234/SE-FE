import { Attachment } from "@types";
import React, { useState } from "react";

import {
  useDeleteFileQuery,
  usePostFileQuery,
} from "@/react-query/hooks/useFileQuery";

export const useRecruitFileInput = (
  beforeFiles: Attachment[] = [],
  onAttachmentIdsChange: (ids: number[]) => void
) => {
  const [files, setFiles] = useState<Attachment[]>(beforeFiles);

  const { mutate: postFileMutate, isLoading: isFileUploadLoading } =
    usePostFileQuery();
  const { mutate: deleteFileMutate, isLoading: isFileDeleteLoading } =
    useDeleteFileQuery();

  const updateIds = (newFiles: Attachment[]) => {
    onAttachmentIdsChange(newFiles.map((f) => f.fileMetaDataId));
  };

  const upload = (formData: FormData) => {
    postFileMutate(formData, {
      onSuccess(data) {
        const next = [...files, ...data.fileMetaDataList];
        setFiles(next);
        updateIds(next);
      },
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("files", e.target.files[i]);
    }
    upload(formData);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const formData = new FormData();
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      formData.append("files", e.dataTransfer.files[i]);
    }
    upload(formData);
  };

  const handleRemove = (fileId: number) => {
    deleteFileMutate(fileId, {
      onSuccess() {
        const next = files.filter((f) => f.fileMetaDataId !== fileId);
        setFiles(next);
        updateIds(next);
      },
    });
  };

  return {
    files,
    handleFileInput,
    handleDragOver,
    handleDrop,
    handleRemove,
    isFileUploadLoading,
    isFileDeleteLoading,
  };
};
