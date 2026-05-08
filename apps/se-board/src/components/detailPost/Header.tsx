import {
  Box,
  Flex,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { DateType } from "@types";
import { BsClock, BsFillEyeFill } from "react-icons/bs";

import { GradientAvatar } from "@/components/common/GradientAvatar";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useBookmarked, useNavigatePage } from "@/hooks";
import { isModifiedContent, toYYYYMMDDHHhhss } from "@/utils/dateUtils";

import { BackButton } from "./BackButton";
import { Bookmark, BookmarkFill } from "./Bookmark";
import { PostMoreButton } from "./MoreButton";

interface HeaderProps {
  HeadingInfo: {
    postId: number;
    title: string;
    author: {
      loginId: string;
      name: string;
      profileImageUrl?: string | null;
      frameGradientStart?: string | null;
      frameGradientEnd?: string | null;
      badgeType?: "CHECK" | "KUMOH_CROW" | null;
      badgeLabel?: string | null;
    };
    views: number;
    category: string;
    createdAt: DateType;
    modifiedAt: DateType;
    bookmarked: boolean;
    isEditable: boolean;
  };
}

const AuthorInfoMenuList = ({
  id,
  name,
  profileImageUrl,
  frameGradientStart,
  frameGradientEnd,
  badgeType,
  badgeLabel,
}: {
  id: string;
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
            ml="2px"
            fontSize={{ base: "md", md: "lg" }}
            fontWeight={"medium"}
            whiteSpace="nowrap"
          >
            {name}
          </Text>
          <RoleBadge badgeType={badgeType} badgeLabel={badgeLabel} />
        </Box>
      </MenuButton>
      {!!id && (
        <MenuList maxW={{ base: "100px" }}>
          <MenuItem w="100%" onClick={() => goToProfilePage(id)}>
            프로필 보기
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  );
};

export const Header = ({ HeadingInfo }: HeaderProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarked(
    HeadingInfo.postId,
    HeadingInfo.bookmarked
  );

  const color = useColorModeValue("gray.7", "whiteAlpha.700");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  return (
    <Box paddingTop="56px">
      <Flex
        py="0.5rem"
        borderBottom={`1px solid`}
        borderColor={borderColor}
        color={color}
      >
        <BackButton />
        <Spacer />
        {!isBookmarked ? (
          <Bookmark toggleBookmark={toggleBookmark} />
        ) : (
          <BookmarkFill toggleBookmark={toggleBookmark} />
        )}
        <PostMoreButton
          postId={HeadingInfo.postId}
          isEditable={HeadingInfo.isEditable}
        />
      </Flex>
      <Box borderBottom={`1px solid`} borderColor={borderColor}>
        <Box m="16px 0 16px 16px">
          <Heading
            size="lg"
            w="fit-content"
            wordBreak="keep-all"
            color={color}
            mb={4}
          >{`[${HeadingInfo.category}] ${HeadingInfo.title}`}</Heading>
          <Flex
            mb={6}
            gap={4}
            flexWrap="wrap"
            alignItems="center"
            color={color}
          >
            <AuthorInfoMenuList
              id={HeadingInfo.author.loginId}
              name={HeadingInfo.author.name}
              profileImageUrl={HeadingInfo.author.profileImageUrl}
              frameGradientStart={HeadingInfo.author.frameGradientStart}
              frameGradientEnd={HeadingInfo.author.frameGradientEnd}
              badgeType={HeadingInfo.author.badgeType}
              badgeLabel={HeadingInfo.author.badgeLabel}
            />
            <Text color={borderColor} userSelect="none">
              |
            </Text>
            <Flex alignItems="center" gap={1.5}>
              <Icon as={BsClock} />
              <Text fontSize="sm">
                {toYYYYMMDDHHhhss(HeadingInfo.createdAt)}
              </Text>
              {isModifiedContent(
                HeadingInfo.createdAt,
                HeadingInfo.modifiedAt
              ) && (
                <Text fontSize="xs" color="gray.6">
                  (수정됨)
                </Text>
              )}
            </Flex>
            <Text color={borderColor} userSelect="none">
              |
            </Text>
            <Flex alignItems="center" gap={1.5}>
              <Icon as={BsFillEyeFill} boxSize="15px" />
              <Text fontSize="sm">{HeadingInfo.views}</Text>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export const DesktopHeader = ({ HeadingInfo }: HeaderProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarked(
    HeadingInfo.postId,
    HeadingInfo.bookmarked
  );

  const color = useColorModeValue("gray.7", "whiteAlpha.700");
  const borderColor = useColorModeValue("gray.3", "whiteAlpha.400");

  return (
    <Box
      display="flex"
      w="100%"
      m="0px auto 0 auto"
      borderBottom={`1px solid`}
      borderColor={borderColor}
    >
      <Box p="1.5rem 0 1rem 1rem">
        <Heading
          as="h2"
          fontSize="1.625rem"
          w="fit-content"
          wordBreak="keep-all"
          color={color}
          mb={4}
        >{`[${HeadingInfo.category}] ${HeadingInfo.title}`}</Heading>
        <Flex gap={4} flexWrap="wrap" alignItems="center" color={color}>
          <AuthorInfoMenuList
            id={HeadingInfo.author.loginId}
            name={HeadingInfo.author.name}
            profileImageUrl={HeadingInfo.author.profileImageUrl}
            frameGradientStart={HeadingInfo.author.frameGradientStart}
            frameGradientEnd={HeadingInfo.author.frameGradientEnd}
            badgeType={HeadingInfo.author.badgeType}
            badgeLabel={HeadingInfo.author.badgeLabel}
          />
          <Text color={borderColor} userSelect="none">
            |
          </Text>
          <Flex alignItems="center" gap={2}>
            <Icon as={BsClock} />
            <Text fontSize="md">{toYYYYMMDDHHhhss(HeadingInfo.createdAt)}</Text>
            {isModifiedContent(
              HeadingInfo.createdAt,
              HeadingInfo.modifiedAt
            ) && (
              <Text fontSize="sm" color="gray.6">
                (수정됨)
              </Text>
            )}
          </Flex>
          <Text color={borderColor} userSelect="none">
            |
          </Text>
          <Flex alignItems="center" gap={2}>
            <Icon as={BsFillEyeFill} boxSize="15px" />
            <Text fontSize="md">{HeadingInfo.views}</Text>
          </Flex>
        </Flex>
      </Box>
      <Spacer />
      <Box display="flex" my="auto" color={color}>
        {!isBookmarked ? (
          <Bookmark boxSize="24px" toggleBookmark={toggleBookmark} />
        ) : (
          <BookmarkFill boxSize="24px" toggleBookmark={toggleBookmark} />
        )}
        <PostMoreButton
          postId={HeadingInfo.postId}
          isEditable={HeadingInfo.isEditable}
        />
      </Box>
    </Box>
  );
};
