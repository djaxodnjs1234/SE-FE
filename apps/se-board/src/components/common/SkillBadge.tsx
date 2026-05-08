import {
  Box,
  Image,
  Tag,
  TagCloseButton,
  TagLabel,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";

const CDN_BASE = "https://cdn.simpleicons.org";

interface SkillBadgeProps {
  name: string;
  iconSlug?: string | null;
  onRemove?: () => void;
  /** 명시적 모드 지정. 미지정 시 반응형 (md+=normal, base=simple) */
  mode?: "normal" | "simple";
  size?: "sm" | "md";
}

export const SkillBadge = ({
  name,
  iconSlug,
  onRemove,
  mode: modeProp,
  size = "sm",
}: SkillBadgeProps) => {
  const responsiveMode = useBreakpointValue<"normal" | "simple">({
    base: "simple",
    md: "normal",
  });
  const mode = modeProp ?? responsiveMode ?? "normal";
  const skillText = useColorModeValue("gray.700", "gray.200");

  /* ── 심플 모드 ── */
  if (mode === "simple") {
    if (iconSlug) {
      return (
        <Tooltip label={name} hasArrow placement="top" openDelay={200}>
          <Box
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            w="26px"
            h="26px"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            _dark={{ borderColor: "whiteAlpha.200" }}
            bg="white"
            cursor="default"
            flexShrink={0}
          >
            <Image
              src={`${CDN_BASE}/${iconSlug}`}
              alt={name}
              w="16px"
              h="16px"
              objectFit="contain"
              fallback={
                <Tag
                  size={size}
                  variant="outline"
                  color={skillText}
                  border={"1px solid #dbdbdb"}
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  cursor="default"
                >
                  <TagLabel>{name}</TagLabel>
                </Tag>
              }
            />
          </Box>
        </Tooltip>
      );
    }
    return (
      <Tooltip label={name} hasArrow placement="top" openDelay={200}>
        <Tag
          size={size}
          variant="outline"
          colorScheme={"black"}
          border={"1px solid #dbdbdb"}
          px={3}
          py={1.5}
          borderRadius="full"
          cursor="default"
        >
          <TagLabel>{name}</TagLabel>
        </Tag>
      </Tooltip>
    );
  }

  /* ── 일반 모드 ── */
  return (
    <Tag
      size={size}
      variant="outline"
      color={skillText}
      border={"1px solid #dbdbdb"}
      px={3}
      py={1.5}
      borderRadius="full"
      cursor="default"
    >
      {iconSlug && (
        <Image
          src={`${CDN_BASE}/${iconSlug}`}
          alt={name}
          w="16px"
          h="16px"
          objectFit="contain"
          mr="5px"
          flexShrink={0}
          fallback={<Box />}
        />
      )}
      <TagLabel fontSize={"sm"} fontWeight={"semibold"}>
        {name}
      </TagLabel>
      {onRemove && <TagCloseButton onClick={onRemove} />}
    </Tag>
  );
};
