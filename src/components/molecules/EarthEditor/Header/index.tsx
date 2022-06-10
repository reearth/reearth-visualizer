import React, { useRef, useMemo } from "react";

import Button from "@reearth/components/atoms/Button";
import Dropdown, { Ref as DropDownRef } from "@reearth/components/atoms/Dropdown";
import Flex from "@reearth/components/atoms/Flex";
import PublicationStatus, { Status } from "@reearth/components/atoms/PublicationStatus";
import CommonHeader, {
  Props as CommonHeaderProps,
} from "@reearth/components/molecules/Common/Header";
import {
  MenuList,
  MenuListItem,
  MenuListItemLabel,
} from "@reearth/components/molecules/Common/MenuList";
import ProjectMenu from "@reearth/components/molecules/Common/ProjectMenu";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

// Proxy dependent types
export type { User, Team } from "@reearth/components/molecules/Common/Header";

export type publishingType = "publishing" | "updating" | "unpublishing";
export type Project = {
  id?: string;
  name?: string;
};

export type Props = {
  currentProject?: Project;
  currentProjectStatus?: Status;
  teamId?: string;
  onPublishmentStatusClick?: (p: publishingType) => void;
  onPreviewOpen?: () => void;
} & CommonHeaderProps;

const Header: React.FC<Props> = ({
  currentProject,
  currentProjectStatus,
  teamId,
  onPublishmentStatusClick,
  onPreviewOpen,
  ...props
}) => {
  const t = useT();
  const dropDownRef = useRef<DropDownRef>(null);

  const publicationButtonText = useMemo(() => {
    return currentProjectStatus === "unpublished" ? t("Publish") : t("Update");
  }, [t, currentProjectStatus]);

  const disableUnpublish = useMemo(() => {
    return currentProjectStatus === "unpublished" ? true : false;
  }, [currentProjectStatus]);

  const center = currentProject && <ProjectMenu currentProject={currentProject} teamId={teamId} />;

  const right = (
    <RightArea justify="flex-end" align="center">
      <PreviewButton
        text={t("Preview")}
        buttonType="secondary"
        onClick={onPreviewOpen}
        margin="0 12px 0 0"></PreviewButton>
      <Dropdown
        ref={dropDownRef}
        openOnClick
        noHoverStyle
        label={
          <Button buttonType="secondary" margin="0" icon="arrowDown" iconRight>
            <PublicationStatus status={currentProjectStatus} />
          </Button>
        }>
        <ChildrenWrapper>
          <Section>
            <MenuList>
              <MenuListItem>
                <MenuListItemLabel
                  disabled={disableUnpublish}
                  icon="unpublish"
                  onClick={
                    currentProjectStatus !== "unpublished"
                      ? () => onPublishmentStatusClick?.("unpublishing")
                      : undefined
                  }
                  text={t("Unpublish")}
                />
              </MenuListItem>

              <MenuListItem>
                <MenuListItemLabel
                  icon="publish"
                  onClick={
                    currentProjectStatus === "published" || currentProjectStatus === "limited"
                      ? () => onPublishmentStatusClick?.("updating")
                      : () => onPublishmentStatusClick?.("publishing")
                  }
                  text={publicationButtonText}
                />
              </MenuListItem>
            </MenuList>
          </Section>
        </ChildrenWrapper>
      </Dropdown>
    </RightArea>
  );

  return <CommonHeader {...props} center={center} right={right} />;
};

const PreviewButton = styled(Button)`
  white-space: nowrap;
`;

const RightArea = styled(Flex)`
  height: 100%;
  align-items: center;
`;

const ChildrenWrapper = styled.div`
  width: 100%;
`;

const Section = styled.div`
  padding: 0;
`;

export default Header;
