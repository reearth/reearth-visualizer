import { styled } from "../../styled";

export const fontFamilies =
  "Noto Sans, hiragino sans, hiragino kaku gothic proN, -apple-system, BlinkMacSystem, sans-serif;";

const fontSizes = {
  h1: 38,
  h2: 30,
  h3: 24,
  h4: 20,
  h5: 16,
  body: 14,
  footnote: 12,
  xFootnote: 10,
};

export type FontSize = keyof typeof fontSizes;

const lineHeights = {
  h1: 46,
  h2: 40,
  h3: 32,
  h4: 28,
  h5: 24,
  body: 22,
  footnote: 20,
  xFootnote: 20,
};

export type LineHeight = keyof typeof lineHeights;

const fontWeights = {
  regular: "normal",
  medium: 500,
  bold: "bold",
};

export type FontWeight = keyof typeof fontWeights;

const uniqueTraits = {
  underline: "underline",
  italic: "italic",
  strike: "strike",
};

export type UniqueTraits = keyof typeof uniqueTraits;

// H1 components
export const H1Medium = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h1}px;
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights.h1}px;
`;

// H2 components
export const H2Bold = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h2}px;
  font-weight: ${fontWeights.bold};
  line-height: ${lineHeights.h2}px;
`;

export const H2Medium = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h2}px;
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights.h2}px;
`;

export const H2Regular = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h2}px;
  font-weight: ${fontWeights.regular};
  line-height: ${lineHeights.h2}px;
`;

// H3 components
export const H3Bold = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h3}px;
  font-weight: ${fontWeights.bold};
  line-height: ${lineHeights.h3}px;
`;

export const H3Medium = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h3}px;
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights.h3}px;
`;

export const H3Regular = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h3}px;
  font-weight: ${fontWeights.regular};
  line-height: ${lineHeights.h3}px;
`;

// H4 components
export const H4Bold = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h4}px;
  font-weight: ${fontWeights.bold};
  line-height: ${lineHeights.h4}px;
`;

export const H4Medium = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h4}px;
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights.h4}px;
`;

export const H4Regular = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h4}px;
  font-weight: ${fontWeights.regular};
  line-height: ${lineHeights.h4}px;
`;

// H5 components
export const H5Bold = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h5}px;
  font-weight: ${fontWeights.bold};
  line-height: ${lineHeights.h5}px;
`;

export const H5Medium = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h5}px;
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights.h5}px;
`;

export const H5Regular = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.h5}px;
  font-weight: ${fontWeights.regular};
  line-height: ${lineHeights.h5}px;
`;

// Body components
export const BodyBold = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.body}px;
  font-weight: ${fontWeights.bold};
  line-height: ${lineHeights.body}px;
`;

export const BodyMedium = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.body}px;
  font-weight: ${fontWeights.medium};
  line-height: ${lineHeights.body}px;
`;

export const BodyRegular = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.body}px;
  font-weight: ${fontWeights.regular};
  line-height: ${lineHeights.body}px;
`;

export const BodyRegularUnderline = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.body}px;
  font-weight: ${fontWeights.regular};
  text-decoration: underline;
  line-height: ${lineHeights.body}px;
`;

export const BodyRegularStrike = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.body}px;
  font-weight: ${fontWeights.regular};
  text-decoration: line-through;
  line-height: ${lineHeights.body}px;
`;

export const BodyRegularItalic = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.body}px;
  font-weight: ${fontWeights.regular};
  font-style: italic;
  line-height: ${lineHeights.body}px;
`;

// Footnote components
export const FootnoteRegular = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.footnote}px;
  font-weight: ${fontWeights.regular};
  line-height: ${lineHeights.footnote}px;
`;

export const XFootnoteRegular = styled.p`
  font-family: ${fontFamilies};
  font-size: ${fontSizes.xFootnote}px;
  font-weight: ${fontWeights.regular};
  line-height: ${lineHeights.xFootnote}px;
`;

type Typography = {
  [key in FontSize]: {
    [key in FontWeight | UniqueTraits]?: React.FC<any>;
  };
};

export const typography: Typography = {
  h1: {
    medium: H1Medium,
  },
  h2: {
    bold: H2Bold,
    medium: H2Medium,
    regular: H2Regular,
  },
  h3: {
    bold: H3Bold,
    medium: H3Medium,
    regular: H3Regular,
  },
  h4: {
    bold: H4Bold,
    medium: H4Medium,
    regular: H4Regular,
  },
  h5: {
    bold: H5Bold,
    medium: H5Medium,
    regular: H5Medium,
  },
  body: {
    bold: BodyBold,
    medium: BodyMedium,
    regular: BodyRegular,
    underline: BodyRegularUnderline,
    strike: BodyRegularStrike,
    italic: BodyRegularItalic,
  },
  footnote: {
    regular: FootnoteRegular,
  },
  xFootnote: {
    regular: XFootnoteRegular,
  },
};

const fonts = {
  typography: typography,
  weight: fontWeights,
  sizes: fontSizes,
  lineHeights: lineHeights,
};

export default fonts;
