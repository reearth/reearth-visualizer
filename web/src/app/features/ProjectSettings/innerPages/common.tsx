import { Collapse, Typography } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode } from "react";

// type Props = {
//   actions?: ReactNode;
//   title?: string;
// };

// export const EditPageWrapper = styled("div")(({ theme }) => ({
//   border: `1px solid ${theme.outline.weaker}`
// }));

// export const HeaderWrapper = styled("div")(({ theme }) => ({
//   display: "flex",
//   gap: theme.spacing.normal
// }));

// export const EditAndPreviewLayout: FC<Props> = ({ title, actions }) => {
//   const t = useT();
//   return (
//     <InnerPage wide>
//       <SettingsWrapper>
//         <SettingsFields>
//           <TitleWrapper size="body" weight="bold">
//             {title}
//           </TitleWrapper>
//           <HeaderWrapper>
//             <Tabs
//               tabStyle="separated"
//               hasBorder
//               tabs={[
//                 {
//                   id: "edit",
//                   name: t("Edit")
//                 },
//                 {
//                   id: "preview",
//                   name: t("Preview"),
//                   children: (
//                     <Typography size="body" color="weak">
//                       {t("Preview is not available in this page.")}
//                     </Typography>
//                   )
//                 }
//               ]}
//             />
//             {actions && <ButtonWrapper>{actions}</ButtonWrapper>}
//           </HeaderWrapper>
//         </SettingsFields>
//       </SettingsWrapper>
//     </InnerPage>
//   );
// };

// CommonLayout.jsx

export const InnerPage = styled("div")<{
  wide?: boolean;
  transparent?: boolean;
}>(({ wide, transparent, theme }) => ({
  boxSizing: "border-box",
  display: "flex",
  width: "100%",
  maxWidth: wide ? 950 : 750,
  backgroundColor: transparent ? "none" : theme.bg[1],
  borderRadius: theme.radius.normal
}));

export const InnerSidebar = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: 213,
  borderRight: `1px solid ${theme.outline.weaker}`,
  padding: `${theme.spacing.normal}px 0`
}));

export const SettingsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest,
  width: "100%",
  flex: 1,
  ["> div:not(:last-child)"]: {
    borderBottom: `1px solid ${theme.outline.weaker}`
  }
}));

export const SettingsFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest,
  padding: `${theme.spacing.normal}px ${theme.spacing.largest}px ${theme.spacing.largest}px`
}));

export const SettingsRow = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "row",
  gap: theme.spacing.largest
}));

export const SettingsRowItem = styled("div")(() => ({
  width: "100%"
}));

export const Thumbnail = styled("div")<{ src?: string }>(({ src, theme }) => ({
  width: "100%",
  paddingBottom: "52.3%",
  fontSize: 0,
  background: src ? `url(${src}) center/contain no-repeat` : "",
  backgroundColor: theme.relative.dark,
  borderRadius: theme.radius.small
}));

export const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing.small
}));

export const TitleWrapper = styled(Typography)(({ theme }) => ({
  color: theme.content.main
}));

export const ArchivedSettingNotice: FC = () => {
  const t = useT();
  return (
    <Collapse title={t("Notice")} size="large">
      <Typography size="body">
        {t(
          "Most project settings are hidden when the project is archived. Please unarchive the project to view and edit these settings."
        )}
      </Typography>
    </Collapse>
  );
};

const CommonLayoutWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest,
  width: "100%",
  padding: theme.spacing.large
}));

const TabContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.small
}));

const TabGroup = styled("div")(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.bg[0],
  borderRadius: theme.radius.normal,
  gap: theme.spacing.micro,
  flex: 1,
  padding: theme.spacing.smallest + 1
}));

const Tab = styled("div")<{ active?: boolean }>(({ active, theme }) => ({
  background: active ? theme.bg[1] : "inherit",
  borderRadius: theme.radius.small,
  alignItems: "center",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  color: active ? theme.content.main : theme.content.weak,
  cursor: "pointer",
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

export const PreviewWrapper = styled("div")(({ theme }) => ({
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  "@media (prefers-color-scheme: dark)": {
    backgroundColor: "transparent",
    color: "inherit"
  },

  "& ul": {
    listStyleType: "initial"
  },

  "& ol": {
    listStyleType: "decimal"
  }
}));

const ContentArea = styled("div")(({ theme }) => ({
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: theme.radius.small,
  minHeight: 500,
  boxShadow: theme.shadow.input
}));

type CommonLayoutProps = {
  actions?: ReactNode;
  title?: string;
  activeTab: string;
  tabs: { id: string; label: string }[];
  onTabChange: (tabId: string) => void;
  children: ReactNode;
};

const CommonLayout: FC<CommonLayoutProps> = ({
  title,
  activeTab,
  tabs,
  onTabChange,
  actions,
  children
}) => {
  return (
    <InnerPage wide>
      <CommonLayoutWrapper>
        <TitleWrapper size="body" weight="bold">
          {title}
        </TitleWrapper>

        <TabContainer>
          <TabGroup>
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </Tab>
            ))}
          </TabGroup>
          {actions && <ButtonWrapper>{actions}</ButtonWrapper>}
        </TabContainer>

        <ContentArea>{children}</ContentArea>
      </CommonLayoutWrapper>
    </InnerPage>
  );
};

export default CommonLayout;
