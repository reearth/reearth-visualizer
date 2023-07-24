import { useEffect, useRef, useState } from "react";

interface UseDynamicSVGImportOptions {
  onCompleted?: (
    name: string,
    SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> | undefined,
  ) => void;
  onError?: (err: Error) => void;
}

function useDynamicSVGImport(name?: string, options: UseDynamicSVGImportOptions = {}) {
  const ImportedIconRef = useRef<React.FC<React.SVGProps<SVGSVGElement>>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const { onCompleted, onError } = options;
  useEffect(() => {
    setLoading(true);
    const importIcon = async (): Promise<void> => {
      try {
        if (!name) return;

        ImportedIconRef.current = (await import(`./icons/${name}.svg`)).ReactComponent;
        onCompleted?.(name, ImportedIconRef.current);
      } catch (err) {
        onError?.(err as Error);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    importIcon();
  }, [name, onCompleted, onError]);

  return { error, loading, SvgIcon: ImportedIconRef.current };
}

export default (name?: string, options: UseDynamicSVGImportOptions = {}) => {
  const { SvgIcon } = useDynamicSVGImport(name, options);

  return {
    SvgIcon,
  };
};
