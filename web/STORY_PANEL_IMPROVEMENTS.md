# Story Panel Page Switching Improvements

## Issue Resolved
Fixed rapid switching between story pages due to multiple pages being "current" simultaneously when scrolling.

## Root Causes Identified

### 1. **Multiple Pages Intersecting Simultaneously**
- **Problem**: With 20% threshold, adjacent pages could both be visible
- **Result**: Both pages triggered `onCurrentPageChange` rapidly

### 2. **Unstable Intersection Observer Options**
- **Problem**: Options object recreated on every render → Observer recreation
- **Result**: Performance issues and potential race conditions

### 3. **No Debouncing of Page Changes**
- **Problem**: Each intersection change triggered immediate page change
- **Result**: Rapid flickering between pages

### 4. **Low Visibility Threshold**
- **Problem**: 20% threshold too low for reliable "current page" detection
- **Result**: Pages changed too early in scroll

## Solutions Implemented

### ✅ **Enhanced useElementOnScreen Hook**
```typescript
// Added intersection ratio tracking
const [intersectionRatio, setIntersectionRatio] = useState(0);

// Memoized callback to prevent observer recreation
const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
  const [entry] = entries;
  setIsIntersecting(entry.isIntersecting);
  setIntersectionRatio(entry.intersectionRatio); // NEW
}, []);
```

### ✅ **Improved Threshold Strategy**
```typescript
// Multiple thresholds for better detection
threshold: [0, 0.1, 0.5, 0.9, 1.0]

// Only change page when >50% visible
if (intersectionRatio >= 0.5) {
  onCurrentPageChange?.(pageId, true);
}
```

### ✅ **Added Page Change Debouncing**
```typescript
// 150ms debounce to prevent rapid switching
clearTimeout(pageChangeTimeoutRef.current);
pageChangeTimeoutRef.current = setTimeout(() => {
  onCurrentPageChange?.(pageId, true);
}, 150);
```

### ✅ **Stable Intersection Options**
```typescript
// Prevents observer recreation on every render
const intersectionOptions = useStableIntersectionOptions(
  rootElement,
  [0, 0.1, 0.5, 0.9, 1.0],
  "0px"
);
```

### ✅ **Proper Cleanup**
```typescript
return () => {
  // Cleanup debounce timer
  clearTimeout(pageChangeTimeoutRef.current);
  // Cleanup scroll timeout
  clearTimeout(scrollTimeoutRef.current);
  // Remove event listeners
  wrapperElement.removeEventListener("scroll", handleScroll);
};
```

## Files Modified

1. **`useElementOnScreen.tsx`**:
   - Added `intersectionRatio` tracking
   - Memoized intersection callback
   - Improved cleanup with `observer.disconnect()`

2. **`Page/index.tsx`**:
   - Increased visibility threshold to 50%
   - Added 150ms debouncing for page changes
   - Improved memory leak prevention
   - Added stable intersection options

3. **`useStableIntersectionOptions.ts`** (NEW):
   - Prevents unnecessary observer recreation
   - Stable memoization of options object

## Performance Benefits

- ✅ **No Memory Leaks**: Proper event listener cleanup
- ✅ **Stable Observers**: Options memoization prevents recreation
- ✅ **Smooth Scrolling**: Passive event listeners
- ✅ **Reduced Jitter**: 50% threshold + debouncing
- ✅ **Better UX**: Predictable page switching behavior

## Testing
- ✅ TypeScript compilation passes
- ✅ Production build succeeds
- ✅ No new linting errors

The rapid page switching issue should now be resolved with more predictable and stable page detection.