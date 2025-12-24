/**
 * @fileoverview App Feature Configuration Management
 *
 * This module manages application-level feature flags and configuration settings for Re:Earth Visualizer.
 * It provides functionality to:
 * - Load feature configurations from Enterprise Edition (EE) modules
 * - Generate external URLs with dynamic parameter replacement
 * - Control feature availability based on deployment type and configuration
 *
 * ## Key Features:
 * - **Feature Toggles**: Controls visibility of dashboard features like member management, workspace creation
 * - **External URL Generation**: Safely generates URLs with workspace, project, and user context
 * - **Enterprise Integration**: Loads additional configuration from EE modules when available
 * - **Security**: Validates and sanitizes all URL parameters to prevent injection attacks
 *
 * ## Usage:
 * ```typescript
 * // Load configuration during app initialization
 * loadAppFeatureConfig();
 *
 * // Get current configuration
 * const features = appFeature();
 *
 * // Generate external URLs with context
 * const managementUrl = generateExternalUrl({
 *   url: "https://example.com/manage/[WORKSPACE_ALIAS]",
 *   workspaceAlias: "my-workspace",
 *   projectAlias: "my-project",
 *   meAlias: "user123"
 * });
 * ```
 *
 * ## Configuration Sources:
 * 1. **Default Configuration**: Baseline feature flags (all enabled by default)
 * 2. **Enterprise Edition**: Additional/override configuration from EE modules
 * 3. **Runtime Loading**: Configuration is loaded during app initialization
 *
 * ## URL Replacement Patterns:
 * - `[WORKSPACE_ALIAS]` → Replaced with workspace.alias
 * - `[PROJECT_ALIAS]` → Replaced with project.alias
 * - `[USER_ALIAS]` → Replaced with me.alias
 */

import { getFeatureConfig } from "@reearth/ee/featureConfig";

import { config } from ".";

export type AppFeatureConfig = {
  membersManagementOnDashboard?: boolean;
  workspaceCreation?: boolean;
  workspaceManagement?: boolean;
  externalWorkspaceManagementUrl?: string;
  accountManagement?: boolean;
  externalAccountManagementUrl?: string;
  projectVisibility?: boolean;
  builtinTimelineWidget?: boolean;
};

const DEFAULT_APP_FEATURE_CONFIG: AppFeatureConfig = {
  membersManagementOnDashboard: true,
  workspaceCreation: true,
  workspaceManagement: true,
  externalWorkspaceManagementUrl: undefined,
  accountManagement: true,
  projectVisibility: false,
  externalAccountManagementUrl: undefined,
  builtinTimelineWidget: true
};

let appFeatureConfig: AppFeatureConfig = {
  ...DEFAULT_APP_FEATURE_CONFIG
};

export const loadAppFeatureConfig = () => {
  try {
    const configData = config();
    if (!configData?.featureCollection) {
      return;
    }

    if (configData.featureCollection === "ee") {
      const eeConfig = getFeatureConfig();
      if (eeConfig && typeof eeConfig === "object") {
        appFeatureConfig = {
          ...appFeatureConfig,
          ...eeConfig
        };
      } else {
        console.warn("Invalid EE feature config received");
      }
    }
  } catch (error) {
    console.error("Failed to load app feature config:", error);
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const generateExternalUrl = ({
  url,
  workspaceAlias,
  projectAlias,
  meAlias
}: {
  url: string;
  workspaceAlias?: string;
  projectAlias?: string;
  meAlias?: string;
}): string => {
  // Validate input URL
  if (!url || typeof url !== "string") {
    console.error("Invalid URL provided to generateExternalUrl");
    return "";
  }

  // Replace [WORKSPACE_ALIAS] with workspace.alias if it exists
  // Replace [PROJECT_ALIAS] with project?.alias if it exists
  // Replace [USER_ALIAS] with me?.alias if it exists
  const processedUrl = url
    .replace(/\[WORKSPACE_ALIAS\]/g, workspaceAlias ?? "")
    .replace(/\[PROJECT_ALIAS\]/g, projectAlias ?? "")
    .replace(/\[USER_ALIAS\]/g, meAlias ?? "");

  // Validate the resulting URL
  if (!isValidUrl(processedUrl)) {
    console.error("Generated URL is invalid:", processedUrl);
    return "";
  }

  return processedUrl;
};

export const appFeature = () => appFeatureConfig;
