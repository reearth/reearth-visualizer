import { fetchAndZipFiles } from "@reearth/app/utils/file";
import { usePluginMutations } from "@reearth/services/api/plugin";
import { config } from "@reearth/services/config";
import {
  useDevPluginExtensionRenderKey,
  useDevPluginExtensions
} from "@reearth/services/state";
import * as yaml from "js-yaml";
import { useCallback, useEffect } from "react";

type ReearthYML = {
  id: string;
  version: string;
  extensions?: {
    id: string;
  }[];
};

type Props = {
  sceneId?: string;
};

export default ({ sceneId }: Props) => {
  const [devPluginExtensions, setDevPluginExtensions] =
    useDevPluginExtensions();
  const [_, updateDevPluginExtensionRenderKey] =
    useDevPluginExtensionRenderKey();
  const { uploadPluginWithFile } = usePluginMutations();

  const handleDevPluginExtensionsReload = useCallback(() => {
    updateDevPluginExtensionRenderKey((prev) => prev + 1);
  }, [updateDevPluginExtensionRenderKey]);

  const handleInstallPluginFromFile = useCallback(
    async (file: File) => {
      if (!sceneId || !file) return;
      uploadPluginWithFile(sceneId, file);
    },
    [sceneId, uploadPluginWithFile]
  );

  const handleDevPluginsInstall = useCallback(async () => {
    if (!sceneId) return;

    const { devPluginUrls } = config() ?? {};
    if (!devPluginUrls || devPluginUrls.length === 0) return;

    devPluginUrls.forEach(async (url) => {
      const file: File | undefined = await getPluginZipFromUrl(url);
      if (!file) return;
      handleInstallPluginFromFile(file);
    });
  }, [sceneId, handleInstallPluginFromFile]);

  useEffect(() => {
    const { devPluginUrls } = config() ?? {};
    if (!devPluginUrls || devPluginUrls.length === 0) return;

    const fetchExtensions = async () => {
      const extensions = await Promise.all(
        devPluginUrls.map(async (url) => {
          const response = await fetch(`${url}/reearth.yml`);
          if (!response.ok) {
            throw new Error(`Failed to fetch the file: ${response.statusText}`);
          }
          const yamlText = await response.text();
          const data = yaml.load(yamlText) as ReearthYML;
          return (
            data.extensions?.map((e) => ({
              id: e.id,
              url: `${url}/${e.id}.js`
            })) ?? []
          );
        })
      );
      setDevPluginExtensions(extensions.flatMap((e) => e));
    };

    fetchExtensions();
  }, [setDevPluginExtensions]);

  return {
    devPluginExtensions,
    handleDevPluginsInstall,
    handleDevPluginExtensionsReload
  };
};

async function getPluginZipFromUrl(url: string) {
  try {
    const response = await fetch(`${url}/reearth.yml`);
    if (!response.ok) {
      throw new Error(`Failed to fetch the file: ${response.statusText}`);
    }
    const yamlText = await response.text();
    const data = yaml.load(yamlText) as ReearthYML;

    const extensionUrls = data?.extensions?.map(
      (extensions) => `${url}/${extensions.id}.js`
    );
    if (!extensionUrls) return;

    const file = await fetchAndZipFiles(
      [...extensionUrls, `${url}/reearth.yml`],
      `${data.id}-${data.version}.zip`
    );

    return file;
  } catch (_err) {
    return undefined;
  }
}
