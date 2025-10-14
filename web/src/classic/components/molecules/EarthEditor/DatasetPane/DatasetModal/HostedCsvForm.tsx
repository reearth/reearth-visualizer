import React, { useState, useCallback } from "react";
import Input from "@reearth/classic/components/atoms/TextBox";
import Select from "@reearth/classic/components/atoms/Select";
import { Option } from "@reearth/classic/components/atoms/SelectOption";
import Text from "@reearth/classic/components/atoms/Text";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import Icon from "@reearth/classic/components/atoms/Icon";
import { metricsSizes } from "@reearth/classic/theme";

export type AuthType = "none" | "basic" | "apikey";

interface Props {
    onReturn: () => void;
    onUrlChange: (url: string) => void;
    url?: string;
    authType: AuthType;
    onAuthTypeChange: (type: AuthType) => void;
    username: string;
    onUsernameChange: (value: string) => void;
    password: string;
    onPasswordChange: (value: string) => void;
    apiKey: string;
    onApiKeyChange: (value: string) => void;
}

const HostedCsvForm: React.FC<Props> = ({
    onReturn,
    onUrlChange,
    url,
    authType,
    onAuthTypeChange,
    username,
    onUsernameChange,
    password,
    onPasswordChange,
    apiKey,
    onApiKeyChange,
}) => {
    const t = useT();
    const theme = useTheme();

    const handleAuthTypeChange = useCallback((value: AuthType | undefined) => {
        if (value) onAuthTypeChange(value);
    }, [onAuthTypeChange]);

    return (
        <div>
            <StyledIcon
                icon="arrowLongLeft"
                size={24}
                onClick={onReturn}
                color={theme.classic.main.text}
            />

            <div style={{ marginTop: `${metricsSizes.l}px`, marginBottom: `${metricsSizes.m}px` }}>
                <Text size="m" color={theme.classic.main.strongText}>
                    {t("Import CSV from URL")}
                </Text>
            </div>

            <StyledForm>
                <Input
                    value={url}
                    onChange={(value) => value !== undefined && onUrlChange(value)}
                    placeholder={t("Enter CSV URL")}
                    className="form-item"
                />

                <SelectWrapper>
                    <Label size="s">{t("Authentication Type")}</Label>
                    <DropdownFix>
                        <div style={{ width: "190px", position: "relative" }}>
                            <Select<AuthType>
                                value={authType}
                                onChange={handleAuthTypeChange}
                            >
                                <Option key="none" value="none" label={t("No Authentication")}>
                                    {t("No Authentication")}
                                </Option>
                                <Option key="basic" value="basic" label={t("Basic Auth")}>
                                    {t("Basic Auth")}
                                </Option>
                                <Option key="apikey" value="apikey" label={t("API Key")}>
                                    {t("API Key")}
                                </Option>
                            </Select>
                        </div>
                    </DropdownFix>
                </SelectWrapper>

                {authType === "basic" && (
                    <>
                        <Input
                            placeholder={t("Username")}
                            value={username}
                            autoComplete="off"
                            onChange={(value) => onUsernameChange(value ?? "")}
                            className="form-item"
                        />
                        <Input
                            type="password"
                            placeholder={t("Password")}
                            value={password}
                            autoComplete="new-password"
                            onChange={(value) => onPasswordChange(value ?? "")}
                            className="form-item"
                        />
                    </>
                )}

                {authType === "apikey" && (
                    <Input
                        placeholder={t("API Key")}
                        value={apiKey}
                        onChange={(value) => onApiKeyChange(value ?? "")}
                        className="form-item"
                    />
                )}
            </StyledForm>
        </div>
    );
};

const StyledIcon = styled(Icon)`
  cursor: pointer;
  &:hover {
    color: ${props => props.theme.classic.main.strongText};
  }
`;

const StyledForm = styled.div`
  width: 100%;
  > .form-item {
    margin-bottom: ${metricsSizes.m}px;
  }
`;

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: ${metricsSizes.m}px;
`;

const Label = styled(Text)`
  margin-right: ${metricsSizes.m}px;
`;

const DropdownFix = styled.div`
  & .css-bylfny {
    transform: translateX(0) !important;
    left: 0 !important;
    right: auto !important;
  }
`;

export default HostedCsvForm;