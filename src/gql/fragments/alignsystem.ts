import { gql } from "@apollo/client";

const widgetAlignSysFragment = gql`
  fragment WidgetAlignSystemFragment on WidgetAlignSystem {
    outer {
      ...WidgetZoneFragment
    }
    inner {
      ...WidgetZoneFragment
    }
  }

  fragment WidgetZoneFragment on WidgetZone {
    left {
      ...WidgetSectionFragment
    }
    center {
      ...WidgetSectionFragment
    }
    right {
      ...WidgetSectionFragment
    }
  }

  fragment WidgetSectionFragment on WidgetSection {
    top {
      ...WidgetAreaFragment
    }
    middle {
      ...WidgetAreaFragment
    }
    bottom {
      ...WidgetAreaFragment
    }
  }

  fragment WidgetAreaFragment on WidgetArea {
    widgetIds
    align
  }
`;

export default widgetAlignSysFragment;
