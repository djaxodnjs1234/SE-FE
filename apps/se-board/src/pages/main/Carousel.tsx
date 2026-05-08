import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { BannerDTO } from "@types";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Carousel = ({ banners }: { banners: BannerDTO[] }) => {
  const [viewIndex, setViewIndex] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);
  const navigate = useNavigate();

  const activeColor = useColorModeValue("gray.8", "whiteAlpha.800");
  const inactiveColor = useColorModeValue("gray.4", "whiteAlpha.400");

  useEffect(() => {
    if (banners.length === 0) return;
    timerRef.current = setTimer();

    return () => {
      window.clearInterval(timerRef.current);
    };
  }, [banners]);

  const onClickBanner = (banner: BannerDTO) => {
    if (banner.bannerUrl.startsWith("https://seboard.site"))
      navigate(banner.bannerUrl.substring(20));
    else window.location.href = banner.bannerUrl;
  };

  const handleClickBtn = (num: number) => {
    window.clearInterval(timerRef.current);
    viewMove(num);
    timerRef.current = setTimer();
  };

  const setTimer = () => {
    return window.setInterval(() => viewMove(1), 3000);
  };

  const viewMove = (num: number) => {
    setViewIndex((prev) => (banners.length + prev + num) % banners.length);
  };

  return (
    <Flex w="full" h="full" overflow="hidden" flexDirection="column">
      <Flex
        h="80%"
        transform={`translateX(-${100 * viewIndex}%)`}
        transition="transform 1s"
      >
        {banners.map((banner, i) => (
          <Box w="full" flexShrink={0} flexGrow={0}>
            <Image
              _hover={{ cursor: "pointer" }}
              onClick={() => onClickBanner(banner)}
              objectFit="contain"
              w="full"
              h="full"
              borderRadius={10}
              key={i}
              src={`${process.env.REACT_APP_API_FILE_ENDPOINT}${banner.fileMetaData.url}`}
            />
          </Box>
        ))}
      </Flex>
      <Flex justifyContent="left" h="20%">
        <Flex alignItems="center" gap={1}>
          <IconButton
            aria-label="left-btn"
            bgColor="transparent"
            onClick={() => handleClickBtn(-1)}
            icon={<ChevronLeftIcon />}
          />
          {banners.map((_, i) => (
            <CircleIcon color={viewIndex === i ? activeColor : inactiveColor} />
          ))}
          <IconButton
            aria-label="right-btn"
            bgColor="transparent"
            onClick={() => handleClickBtn(1)}
            icon={<ChevronRightIcon />}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

const CircleIcon = (props: any) => {
  return (
    <Icon viewBox="0 0 200 200" boxSize={3} {...props}>
      <path
        fill="currentColor"
        d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
      />
    </Icon>
  );
};
