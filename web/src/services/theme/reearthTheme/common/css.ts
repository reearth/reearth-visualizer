// CSS Constants with as const to provide type safety for styled components
// This file helps avoid TypeScript errors in @emotion/styled after version upgrade

export const css = {
  // Display values
  display: {
    flex: "flex" as const,
    block: "block" as const,
    inline: "inline" as const,
    inlineBlock: "inline-block" as const,
    inlineFlex: "inline-flex" as const,
    grid: "grid" as const,
    inlineGrid: "inline-grid" as const,
    none: "none" as const,
    table: "table" as const,
    tableCell: "table-cell" as const,
    tableRow: "table-row" as const,
    contents: "contents" as const
  },

  // Flex Direction
  flexDirection: {
    row: "row" as const,
    column: "column" as const,
    rowReverse: "row-reverse" as const,
    columnReverse: "column-reverse" as const
  },

  // Justify Content
  justifyContent: {
    flexStart: "flex-start" as const,
    flexEnd: "flex-end" as const,
    center: "center" as const,
    spaceBetween: "space-between" as const,
    spaceAround: "space-around" as const,
    spaceEvenly: "space-evenly" as const,
    start: "start" as const,
    end: "end" as const
  },

  // Align Items
  alignItems: {
    flexStart: "flex-start" as const,
    flexEnd: "flex-end" as const,
    center: "center" as const,
    stretch: "stretch" as const,
    baseline: "baseline" as const,
    start: "start" as const,
    end: "end" as const
  },

  // Align Content
  alignContent: {
    flexStart: "flex-start" as const,
    flexEnd: "flex-end" as const,
    center: "center" as const,
    spaceBetween: "space-between" as const,
    spaceAround: "space-around" as const,
    spaceEvenly: "space-evenly" as const,
    stretch: "stretch" as const
  },

  // Align Self
  alignSelf: {
    auto: "auto" as const,
    flexStart: "flex-start" as const,
    flexEnd: "flex-end" as const,
    center: "center" as const,
    baseline: "baseline" as const,
    stretch: "stretch" as const
  },

  // Flex Wrap
  flexWrap: {
    nowrap: "nowrap" as const,
    wrap: "wrap" as const,
    wrapReverse: "wrap-reverse" as const
  },

  // Position
  position: {
    static: "static" as const,
    relative: "relative" as const,
    absolute: "absolute" as const,
    fixed: "fixed" as const,
    sticky: "sticky" as const
  },

  // Text Align
  textAlign: {
    left: "left" as const,
    right: "right" as const,
    center: "center" as const,
    justify: "justify" as const,
    start: "start" as const,
    end: "end" as const
  },

  // Text Overflow
  textOverflow: {
    ellipsis: "ellipsis" as const,
    clip: "clip" as const
  },

  // White Space
  whiteSpace: {
    normal: "normal" as const,
    nowrap: "nowrap" as const,
    pre: "pre" as const,
    preWrap: "pre-wrap" as const,
    preLine: "pre-line" as const,
    breakSpaces: "break-spaces" as const
  },

  // Word Break
  wordBreak: {
    normal: "normal" as const,
    breakAll: "break-all" as const,
    keepAll: "keep-all" as const,
    breakWord: "break-word" as const
  },

  // Overflow
  overflow: {
    visible: "visible" as const,
    hidden: "hidden" as const,
    scroll: "scroll" as const,
    auto: "auto" as const,
    clip: "clip" as const
  },

  // Box Sizing
  boxSizing: {
    borderBox: "border-box" as const,
    contentBox: "content-box" as const
  },

  // Font Weight
  fontWeight: {
    100: "100" as const,
    200: "200" as const,
    300: "300" as const,
    400: "400" as const,
    500: "500" as const,
    600: "600" as const,
    700: "700" as const,
    800: "800" as const,
    900: "900" as const,
    normal: "normal" as const,
    bold: "bold" as const,
    bolder: "bolder" as const,
    lighter: "lighter" as const
  },

  // Font Style
  fontStyle: {
    normal: "normal" as const,
    italic: "italic" as const,
    oblique: "oblique" as const
  },

  // Text Transform
  textTransform: {
    none: "none" as const,
    capitalize: "capitalize" as const,
    uppercase: "uppercase" as const,
    lowercase: "lowercase" as const
  },

  // Text Decoration
  textDecoration: {
    none: "none" as const,
    underline: "underline" as const,
    overline: "overline" as const,
    lineThrough: "line-through" as const
  },

  // Cursor
  cursor: {
    auto: "auto" as const,
    default: "default" as const,
    pointer: "pointer" as const,
    text: "text" as const,
    wait: "wait" as const,
    crosshair: "crosshair" as const,
    notAllowed: "not-allowed" as const,
    grab: "grab" as const,
    grabbing: "grabbing" as const,
    move: "move" as const,
    nResize: "n-resize" as const,
    sResize: "s-resize" as const,
    eResize: "e-resize" as const,
    wResize: "w-resize" as const,
    neResize: "ne-resize" as const,
    nwResize: "nw-resize" as const,
    seResize: "se-resize" as const,
    swResize: "sw-resize" as const,
    ewResize: "ew-resize" as const,
    nsResize: "ns-resize" as const,
    neswResize: "nesw-resize" as const,
    nwseResize: "nwse-resize" as const,
    colResize: "col-resize" as const,
    rowResize: "row-resize" as const,
    allScroll: "all-scroll" as const,
    zoomIn: "zoom-in" as const,
    zoomOut: "zoom-out" as const,
    help: "help" as const
  },

  // Pointer Events
  pointerEvents: {
    auto: "auto" as const,
    none: "none" as const,
    all: "all" as const
  },

  // User Select
  userSelect: {
    auto: "auto" as const,
    none: "none" as const,
    text: "text" as const,
    all: "all" as const
  },

  // Visibility
  visibility: {
    visible: "visible" as const,
    hidden: "hidden" as const,
    collapse: "collapse" as const
  },

  // Float
  float: {
    left: "left" as const,
    right: "right" as const,
    none: "none" as const
  },

  // Clear
  clear: {
    left: "left" as const,
    right: "right" as const,
    both: "both" as const,
    none: "none" as const
  },

  // Z-Index common values
  zIndex: {
    auto: "auto" as const,
    0: "0" as const,
    1: "1" as const,
    10: "10" as const,
    100: "100" as const,
    1000: "1000" as const,
    9999: "9999" as const
  },

  // Background Size
  backgroundSize: {
    auto: "auto" as const,
    cover: "cover" as const,
    contain: "contain" as const
  },

  // Background Position
  backgroundPosition: {
    center: "center" as const,
    top: "top" as const,
    bottom: "bottom" as const,
    left: "left" as const,
    right: "right" as const,
    topLeft: "top left" as const,
    topRight: "top right" as const,
    bottomLeft: "bottom left" as const,
    bottomRight: "bottom right" as const
  },

  // Background Repeat
  backgroundRepeat: {
    repeat: "repeat" as const,
    repeatX: "repeat-x" as const,
    repeatY: "repeat-y" as const,
    noRepeat: "no-repeat" as const,
    space: "space" as const,
    round: "round" as const
  },

  // Object Fit
  objectFit: {
    fill: "fill" as const,
    contain: "contain" as const,
    cover: "cover" as const,
    none: "none" as const,
    scaleDown: "scale-down" as const
  },

  // Border Style
  borderStyle: {
    none: "none" as const,
    hidden: "hidden" as const,
    dotted: "dotted" as const,
    dashed: "dashed" as const,
    solid: "solid" as const,
    double: "double" as const,
    groove: "groove" as const,
    ridge: "ridge" as const,
    inset: "inset" as const,
    outset: "outset" as const
  },

  // Resize
  resize: {
    none: "none" as const,
    both: "both" as const,
    horizontal: "horizontal" as const,
    vertical: "vertical" as const
  },

  // List Style
  listStyleType: {
    none: "none" as const,
    disc: "disc" as const,
    circle: "circle" as const,
    square: "square" as const,
    decimal: "decimal" as const,
    lowerAlpha: "lower-alpha" as const,
    upperAlpha: "upper-alpha" as const,
    lowerRoman: "lower-roman" as const,
    upperRoman: "upper-roman" as const
  },

  // Vertical Align
  verticalAlign: {
    baseline: "baseline" as const,
    sub: "sub" as const,
    super: "super" as const,
    top: "top" as const,
    textTop: "text-top" as const,
    middle: "middle" as const,
    bottom: "bottom" as const,
    textBottom: "text-bottom" as const
  },

  // WebKit specific
  webkitBoxOrient: {
    horizontal: "horizontal" as const,
    vertical: "vertical" as const,
    inlineAxis: "inline-axis" as const,
    blockAxis: "block-axis" as const,
    inherit: "inherit" as const
  },

  webkitLineClamp: {
    none: "none" as const,
    1: "1" as const,
    2: "2" as const,
    3: "3" as const,
    4: "4" as const,
    5: "5" as const
  },

  // All property (for resetting)
  all: {
    unset: "unset" as const,
    initial: "initial" as const,
    inherit: "inherit" as const,
    revert: "revert" as const
  }
} as const;

export default css;