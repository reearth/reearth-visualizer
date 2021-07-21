import { styled } from "./styled";

const type = {
  base: '"Noto Sans", "hiragino sans", "hiragino kaku gothic proN", -apple-system, BlinkMacSystem, sans-serif',
};

const fontSizes = {
  xl: 28,
  l: 20,
  m: 16,
  s: 14,
  xs: 12,
  "2xs": 10,
};

const weight = {
  normal: "normal",
  bold: "bold",
};

export const XLBold = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.xl}px;
  font-weight: ${weight.bold};
`;

export const XLRegular = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.xl}px;
  font-weight: ${weight.normal};
`;

export const LBold = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.l}px;
  font-weight: ${weight.bold};
`;

export const LRegular = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.l}px;
  font-weight: ${weight.normal};
`;

export const MBold = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.m}px;
  font-weight: ${weight.bold};
`;

export const MRegular = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.m}px;
  font-weight: ${weight.normal};
`;

export const MParagraph = styled(MRegular)`
  line-height: 1.5;
`;

export const SBold = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.s}px;
  font-weight: ${weight.bold};
`;

export const SRegular = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.s}px;
  font-weight: ${weight.normal};
`;

export const SParagraph = styled(SRegular)`
  line-height: 1.5;
`;

export const XSBold = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.xs}px;
  font-weight: ${weight.bold};
`;

export const XSRegular = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes.xs}px;
  font-weight: ${weight.normal};
`;

export const XXSRegular = styled.p`
  font-family: ${type.base};
  font-size: ${fontSizes["2xs"]}px;
  font-weight: ${weight.normal};
`;

export const typography = {
  xl: {
    bold: XLBold,
    regular: XLRegular,
  },
  l: {
    bold: LBold,
    regular: LRegular,
  },
  m: {
    bold: MBold,
    regular: MRegular,
    paragraph: MParagraph,
  },
  s: {
    bold: SBold,
    regular: SRegular,
    paragraph: SParagraph,
  },
  xs: {
    bold: XSBold,
    regular: XSRegular,
  },
  "2xs": {
    regular: XXSRegular,
  },
};

export type TypographySize = keyof typeof typography;

export type FontWeight = keyof typeof weight;

const fonts = {
  typography: typography,
  weight: weight,
  sizes: fontSizes,
};

export default fonts;
