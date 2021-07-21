# Property Name Text
[![Generic badge](https://img.shields.io/badge/GROUP-property-yellow.svg)]()
[![Generic badge](https://img.shields.io/badge/SIZE-atom-blue.svg)]()

Text for property

> NOTE: Property以外にも使えると思っているので、利用シーンがあればglobalでも良い気がする

## Usage

```tsx
import Text from "@reearth/components/atoms/Text";


<Text size="m" weight="bold"> This is Text </Text>
<Text size="l" weight="normal" color="red"> ここはテクストです </Text>
<Text size="l" weight="normal" isParagraph={true}>
  If you set the Text component as a paragraph, the line height will become 1.5. Otherwise, 	it will be the default line height of 1. 
</Text>
<Text size="l" weight="normal" color="red" otherProperties={{ margin: "14px 0" }}> ここはテクストです </Text>
```



- If you put text inside another component and need more complex styling such as hover effects you can override the color prop in favor of passing stylings from the parent.

```jsx
<LongBannerButton
    align="center"
    justify="center"
    onClick={() => window.location.assign("http://docs.reearth.io")}>
  <MapIcon icon="map" />
  <Text size="m" weight="bold" customColor>
    {intl.formatMessage({ defaultMessage: "User guide" })}
  </Text>
  </LongBannerButton>

const LongBannerButton = styled(Flex)`
  background: ${props => props.theme.main.paleBg};
  width: 100%;
  color: ${props => props.theme.main.text};

  &:hover {
    background: ${props => props.theme.colors.bg[5]};
    color: ${props => props.theme.main.strongText};
  }
`;
```



## Properties

### className: string

### children: ReactNode

### color: string

### customColor: boolean

### size: 

- xl: 28
- l: 20
- m: 16
- s: 14
- xs: 12
- 2xs: 10

### isParagraph: boolean

​	If isParagraph is true, the line height will be 1.5. Default is 1.

### weight:

- Normal: 400
- Bold: 700

### otherProperties: 

​	Inline CSS, excluding: "color" | "fontFamily" | "fontSize" | "lineHeight" | "fontStyle"

### onClick : function()



