import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { DeveloperProfileInfo } from "@types";
import Editor from "ckeditor5-custom-build/build/ckeditor";
import { useEffect, useState } from "react";
import { BsFileEarmarkText, BsPencil } from "react-icons/bs";

import { postFile } from "@/api/file";
import { useUpdateDeveloperProfile } from "@/react-query/hooks/useDeveloperProfile";

export const DeveloperReadmeSection = ({
  profile,
  isMyProfile,
}: {
  profile: DeveloperProfileInfo | null | undefined;
  isMyProfile: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(
    profile?.readmeContent ?? ""
  );
  const { mutate: updateProfile, isLoading } = useUpdateDeveloperProfile();
  const toast = useToast();

  const borderColor = useColorModeValue("gray.2", "whiteAlpha.200");
  const cardBg = useColorModeValue("white", "whiteAlpha.50");
  const titleColor = useColorModeValue("gray.700", "whiteAlpha.800");
  const mutedColor = useColorModeValue("gray.400", "gray.500");
  const emptyBg = useColorModeValue("gray.50", "whiteAlpha.50");

  useEffect(() => {
    setEditorContent(profile?.readmeContent ?? "");
  }, [profile?.readmeContent]);

  const hasContent = !!profile?.readmeContent?.trim();

  if (!hasContent && !isMyProfile) return null;

  function customUploadAdapter(loader: any) {
    return {
      upload: () =>
        new Promise<{ default: string }>((resolve, reject) => {
          loader.file.then((file: File) => {
            const formData = new FormData();
            formData.append("files", file);
            postFile(formData)
              .then((res) => {
                const url = res.fileMetaDataList[0]?.url ?? "";
                resolve({
                  default: `${process.env.REACT_APP_API_FILE_ENDPOINT}${url}`,
                });
              })
              .catch(reject);
          });
        }),
      abort: () => {},
    };
  }

  function uploadPlugin(editor: any) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) =>
      customUploadAdapter(loader);
  }

  const handleSave = () => {
    updateProfile(
      {
        intro: profile?.intro ?? undefined,
        githubUrl: profile?.githubUrl ?? undefined,
        portfolioUrl: profile?.portfolioUrl ?? undefined,
        grade: profile?.grade ?? undefined,
        readmeContent: editorContent,
        skillIds: profile?.skills?.map((s) => s.id) ?? [],
      },
      {
        onSuccess: () => {
          toast({
            title: "저장되었습니다.",
            status: "success",
            duration: 2000,
          });
          setIsEditing(false);
        },
        onError: () =>
          toast({
            title: "오류가 발생했습니다.",
            status: "error",
            duration: 2000,
          }),
      }
    );
  };

  return (
    <Box
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
      maxW="100%"
    >
      {/* 헤더 */}
      <Flex
        alignItems="center"
        justifyContent="space-between"
        px={4}
        py={3}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Flex alignItems="center" gap={2}>
          <Icon as={BsFileEarmarkText} boxSize="14px" color="gray.500" />
          <Text fontSize="sm" fontWeight="bold" color={titleColor}>
            README
          </Text>
        </Flex>
        {isMyProfile && !isEditing && (
          <Button
            size="xs"
            leftIcon={<Icon as={BsPencil} boxSize="10px" />}
            variant="ghost"
            colorScheme="blue"
            onClick={() => setIsEditing(true)}
          >
            {hasContent ? "편집" : "작성하기"}
          </Button>
        )}
      </Flex>

      {isEditing ? (
        /* ── 편집 모드 ── */
        <Box p={4} maxW={"100%"}>
          <CKEditor
            editor={Editor}
            config={{
              extraPlugins: [uploadPlugin],
              mediaEmbed: { previewsInData: true },
            }}
            data={editorContent}
            onReady={(editor: any) => {
              editor.editing.view.change((writer: any) => {
                writer.setStyle(
                  "height",
                  "400px",
                  editor.editing.view.document.getRoot()
                );
              });
            }}
            onChange={(_: any, editor: any) => {
              setEditorContent(editor.getData());
            }}
          />
          <Flex gap={2} mt={3} justifyContent="flex-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditorContent(profile?.readmeContent ?? "");
                setIsEditing(false);
              }}
            >
              취소
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              isLoading={isLoading}
              onClick={handleSave}
            >
              저장
            </Button>
          </Flex>
        </Box>
      ) : hasContent ? (
        /* ── 보기 모드 ── */
        <Box
          px={6}
          py={5}
          className="ck-content"
          dangerouslySetInnerHTML={{ __html: profile!.readmeContent! }}
        />
      ) : (
        /* ── 빈 상태 (본인만 표시) ── */
        <Flex
          direction="column"
          alignItems="center"
          gap={3}
          py={10}
          px={4}
          bg={emptyBg}
        >
          <Icon as={BsFileEarmarkText} boxSize="36px" color="gray.300" />
          <Text fontSize="sm" color={mutedColor} textAlign="center">
            GitHub README처럼 위지윅으로 나를 소개해보세요.
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            leftIcon={<Icon as={BsPencil} boxSize="11px" />}
            onClick={() => setIsEditing(true)}
          >
            README 작성하기
          </Button>
        </Flex>
      )}
    </Box>
  );
};
