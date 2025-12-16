import {
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

export default ({
  indicatorRef,
  updateIndicatorPosition,
  startTime,
  endTime,
  currentTime,
  setCurrentTime,
  updateTimeline
}: {
  indicatorRef: RefObject<HTMLDivElement>;
  updateIndicatorPosition: (newTime: number) => void;
  startTime: number;
  endTime: number;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  updateTimeline: (newTime: number) => void;
}) => {
  const timelinePanelRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [panelWidth, setPanelWidth] = useState<number>(0);

  const panelWidthStyle = useMemo(() => {
    return {
      width: `${panelWidth}px`
    };
  }, [panelWidth]);

  // ResizeObserver to track panel width changes
  useEffect(() => {
    const panelElement = timelinePanelRef.current;
    if (!panelElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setPanelWidth(width);
      }
    });

    resizeObserver.observe(panelElement);

    // Set initial width
    const initialWidth = panelElement.getBoundingClientRect().width;
    setPanelWidth(initialWidth);

    return () => {
      resizeObserver.unobserve(panelElement);
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate time from mouse position
  const calculateTimeFromPosition = useCallback(
    (clientX: number): number => {
      if (!timelinePanelRef.current) return currentTime;

      const rect = timelinePanelRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const clampedX = Math.max(0, Math.min(relativeX, rect.width));
      const timeRatio = clampedX / rect.width;

      return startTime + timeRatio * (endTime - startTime);
    },
    [startTime, endTime, currentTime]
  );

  // Mouse down handler - start drag or click
  const handleTimelinePanelMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      const newTime = calculateTimeFromPosition(event.clientX);
      setIsDragging(true);

      // Immediate visual update (fast)
      updateIndicatorPosition(newTime);

      // Update timeline state and commit changes
      updateTimeline(newTime);
    },
    [calculateTimeFromPosition, updateIndicatorPosition, updateTimeline]
  );

  // Mouse move handler - handle drag
  const handleTimelinePanelMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;

      event.preventDefault();
      let newTime = calculateTimeFromPosition(event.clientX);

      if (newTime < startTime) {
        newTime = startTime;
      }

      // During drag: only update indicator position directly (fast)
      updateIndicatorPosition(newTime);

      // Optionally throttle timeline updates during drag for better performance
      updateTimeline(newTime);
    },
    [
      isDragging,
      calculateTimeFromPosition,
      updateIndicatorPosition,
      updateTimeline,
      startTime
    ]
  );

  // Mouse up handler - end drag
  const handleTimelinePanelMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);

      // Final state sync when drag ends
      const currentLeft = indicatorRef.current?.style.left;
      if (currentLeft) {
        const leftPercent = parseFloat(currentLeft);
        const finalTime =
          startTime + (leftPercent / 100) * (endTime - startTime);
        setCurrentTime(Math.max(startTime, Math.min(finalTime, endTime)));
      }
    }
  }, [isDragging, startTime, endTime, setCurrentTime, indicatorRef]);

  // Global mouse up handler to handle mouse up outside the timeline
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);

        // Final state sync when drag ends
        const currentLeft = indicatorRef.current?.style.left;
        if (currentLeft) {
          const leftPercent = parseFloat(currentLeft);
          const finalTime =
            startTime + (leftPercent / 100) * (endTime - startTime);
          setCurrentTime(Math.max(startTime, Math.min(finalTime, endTime)));
        }
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
    }

    // Return undefined explicitly for the else case
    return undefined;
  }, [isDragging, startTime, endTime, setCurrentTime, indicatorRef]);

  return {
    timelinePanelRef,
    indicatorRef,
    isDragging,
    panelWidthStyle,
    handleTimelinePanelMouseDown,
    handleTimelinePanelMouseMove,
    handleTimelinePanelMouseUp
  };
};
