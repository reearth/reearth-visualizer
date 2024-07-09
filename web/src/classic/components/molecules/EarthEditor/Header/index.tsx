import React, { useRef, useMemo } from "react";

import PublicationStatus, { Status } from "@reearth/beta/components/PublicationStatus";
import Button from "@reearth/classic/components/atoms/Button";
import Dropdown, { Ref as DropDownRef } from "@reearth/classic/components/atoms/Dropdown";
import Flex from "@reearth/classic/components/atoms/Flex";
import CommonHeader, {
  Props as CommonHeaderProps,
} from "@reearth/classic/components/molecules/Common/Header";
import {
  MenuList,
  MenuListItem,
  MenuListItemLabel,
} from "@reearth/classic/components/molecules/Common/MenuList";
import ProjectMenu from "@reearth/classic/components/molecules/Common/ProjectMenu";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

// Proxy dependent types
export type { User, Workspace } from "@reearth/classic/components/molecules/Common/Header";

export type publishingType = "publishing" | "updating" | "unpublishing";
export type Project = {
  id?: string;
  name?: string;
};

export type Props = {
  currentProject?: Project;
  currentProjectStatus?: Status;
  workspaceId?: string;
  onPublishmentStatusClick?: (p: publishingType) => void;
  onPreviewOpen?: () => void;
} & CommonHeaderProps;

const Header: React.FC<Props> = ({
  currentProject,
  currentProjectStatus,
  workspaceId,
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

  const center = currentProject && (
    <ProjectMenu currentProject={currentProject} workspaceId={workspaceId} />
  );

  const right = (
    <RightArea justify="flex-end" align="center">
      <PreviewButton
        text={t("Preview")}
        buttonType="secondary"
        onClick={onPreviewOpen}
        margin="0 12px 0 0"
      />
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
