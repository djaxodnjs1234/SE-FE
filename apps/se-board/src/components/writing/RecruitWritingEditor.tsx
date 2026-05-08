import { Box } from "@chakra-ui/react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build/build/ckeditor";
import { useEffect, useState } from "react";

import { postFile } from "@/api/file";
import { errorHandle } from "@/utils/errorHandling";

interface Props {
  // 초기값만 받음 — 이 props가 바뀌어도 에디터를 재초기화하지 않음
  initialTitle: string;
  initialContents: string;
  onTitleChange: (title: string) => void;
  onContentsChange: (contents: string) => void;
}

export const RecruitWritingEditor = ({
  initialTitle,
  initialContents,
  onTitleChange,
  onContentsChange,
}: Props) => {
  const [editorData, setEditorData] = useState<string>("");

  // initialTitle/initialContents는 edit 모드에서 API 응답이 왔을 때 한 번만 변경됨
  // 사용자 타이핑 시에는 부모가 이 props를 바꾸지 않으므로 루프 없음
  useEffect(() => {
    setEditorData(`<h1>${initialTitle}</h1>` + initialContents);
  }, [initialTitle, initialContents]);

  const customUploadAdapter = (loader: any) => {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          const uploadData = new FormData();
          loader.file.then((file: File) => {
            uploadData.append("files", file);
            postFile(uploadData)
              .then((res) => {
                const urls = res.fileMetaDataList.map(
                  (f) => `${process.env.REACT_APP_API_FILE_ENDPOINT}${f.url}`
                );
                resolve({ default: urls.length > 1 ? urls : urls[0] });
              })
              .catch((err) => reject(errorHandle(err)));
          });
        });
      },
      abort: () => {},
    };
  };

  const uploadPlugin = function (editor: any) {
    editor.plugins.get("FileRepository").createUploadAdapter = (
      loader: any
    ) => {
      return customUploadAdapter(loader);
    };
  };

  const editorConfiguration = {
    fontSize: {
      options: [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 30],
    },
    extraPlugins: [uploadPlugin],
    mediaEmbed: { previewsInData: true },
  };

  return (
    <Box maxW="100%" m="0 auto">
      <CKEditor
        editor={Editor}
        config={editorConfiguration}
        data={editorData}
        onReady={(editor: any) => {
          editor.editing.view.change((writer: any) => {
            writer.setStyle(
              "height",
              "45rem",
              editor.editing.view.document.getRoot()
            );
          });
        }}
        onChange={(_event: any, editor: any) => {
          const data = editor.getData();
          const match = data.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
          const extractedTitle = match
            ? match[1].replaceAll("&nbsp;", "").trim()
            : "";
          const body = data.replace(match ? match[0] : "", "");

          setEditorData(data);
          onTitleChange(extractedTitle);
          onContentsChange(body);
        }}
      />
    </Box>
  );
};
