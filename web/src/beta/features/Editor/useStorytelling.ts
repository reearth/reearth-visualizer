import { useCallback, useMemo, useState } from "react";

import { StoryFragmentFragment } from "@reearth/services/gql";

type Props = {
  stories: StoryFragmentFragment[];
};
export default function useStorytelling({ stories }: Props) {
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(undefined);

  const selectedStory = useMemo(() => {
    return stories.length ? stories[0] : undefined;
  }, [stories]);

  const selectedPage = useMemo(() => {
    if (!selectedPageId && selectedStory?.pages?.length) {
      return selectedStory?.pages[0];
    }

    return (selectedStory?.pages ?? []).find(p => p.id === selectedPageId);
  }, [selectedPageId, selectedStory?.pages]);

  const onPageSelect = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
  }, []);
  const onPageDuplicate = useCallback(async (pageId: string) => {
    console.log("onPageDuplicate", pageId);
  }, []);
  const onPageDelete = useCallback(async (pageId: string) => {
    console.log("onPageDelete", pageId);
  }, []);
  const onPageAdd = useCallback(async (isSwipeable: boolean) => {
    console.log("onPageAdd", isSwipeable);
  }, []);

  return {
    selectedStory,
    selectedPage,
    onPageSelect,
    onPageDuplicate,
    onPageDelete,
    onPageAdd,
  };
}
