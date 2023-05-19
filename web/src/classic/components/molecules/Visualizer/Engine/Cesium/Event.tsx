import { useEffect } from "react";

export type Props = {
  onMount?: () => void;
  onUnmount?: () => void;
};

export default function Event({ onMount, onUnmount }: Props) {
  useEffect(() => {
    onMount?.();
    return () => onUnmount?.();
  }, [onMount, onUnmount]);

  return null;
}
