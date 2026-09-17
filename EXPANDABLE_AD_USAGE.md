# ExpandableAdSlot Component Usage Guide

## Overview

The `ExpandableAdSlot` component provides a reusable, customizable expandable/collapsible advertisement container with the following features:

- ✅ Expand/collapse animation with customizable heights
- ✅ localStorage persistence (remembers user preference)
- ✅ Prevents layout shift (always reserves space)
- ✅ Graceful ad failure handling
- ✅ Fully responsive (desktop/tablet/mobile)
- ✅ Google Ad Manager integration
- ✅ Retry logic for failed ads
- ✅ Accessible (ARIA labels, keyboard navigation)

---

## Basic Usage

```jsx
import ExpandableAdSlot from './components/ExpandableAdSlot';

function MyPage() {
  return (
    <ExpandableAdSlot
      placement="top-banner"
      adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP}
      adSizes={[[970, 250], [728, 90], [320, 100]]}
      expandedHeight="250px"
      collapsedHeight="60px"
    />
  );
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placement` | `string` | `"expandable-ad"` | Unique identifier for this ad placement |
| `adUnitPath` | `string` | **Required** | GAM ad unit path or environment variable |
| `adSizes` | `array` | `[[728, 90], [320, 50]]` | Array of ad sizes `[[width, height], ...]` |
| `buildSizeMapping` | `function` | Auto-generated | Custom size mapping function for responsive ads |
| `expandedHeight` | `string` | `"250px"` | CSS height when expanded |
| `collapsedHeight` | `string` | `"60px"` | CSS height when collapsed |
| `rememberState` | `boolean` | `true` | Save collapse state to localStorage |
| `storageKey` | `string` | Auto-generated | Custom localStorage key |
| `defaultExpanded` | `boolean` | `true` | Initial expanded state |
| `className` | `string` | `""` | Additional CSS classes |
| `transitionDuration` | `number` | `400` | Animation duration in milliseconds |

---

## Examples

### Example 1: Top Banner (Desktop: 250px, Mobile: 100px)

```jsx
<ExpandableAdSlot
  placement="top-banner"
  adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP}
  adSizes={[
    [970, 250],  // Desktop large
    [728, 90],   // Desktop medium
    [468, 60],   // Tablet
    [320, 100],  // Mobile
  ]}
  expandedHeight="250px"
  collapsedHeight="60px"
  className="top-banner-ad"
/>
```

### Example 2: Fixed Position Sticky Ad

```jsx
<div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
  <ExpandableAdSlot
    placement="sticky-top"
    adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_TOP_STICKY_EXPANDABLE}
    adSizes={[[970, 250], [728, 90], [320, 100], [320, 50]]}
    expandedHeight="280px"
    collapsedHeight="60px"
    transitionDuration={500}
  />
</div>
```

### Example 3: Custom Size Mapping

```jsx
const customSizeMapping = (googletag) => {
  return googletag
    .sizeMapping()
    .addSize([1024, 0], [[970, 250], [728, 90]])
    .addSize([768, 0], [[728, 90], [468, 60]])
    .addSize([0, 0], [[320, 100], [320, 50]])
    .build();
};

<ExpandableAdSlot
  placement="custom-banner"
  adUnitPath="/23338698373/my-custom-ad"
  adSizes={[[970, 250], [728, 90], [468, 60], [320, 100], [320, 50]]}
  buildSizeMapping={customSizeMapping}
  expandedHeight="280px"
  collapsedHeight="60px"
/>
```

### Example 4: Mobile-Only Expandable Ad

```jsx
<ExpandableAdSlot
  placement="mobile-banner"
  adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_MOBILE_ANCHOR}
  adSizes={[[320, 100], [320, 50]]}
  expandedHeight="100px"
  collapsedHeight="50px"
  defaultExpanded={false}  // Start collapsed
  className="mobile-only-ad"
/>
```

### Example 5: No localStorage (Don't Remember State)

```jsx
<ExpandableAdSlot
  placement="temporary-banner"
  adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_CONTENT_MIDDLE_1}
  adSizes={[[728, 90], [300, 250]]}
  expandedHeight="250px"
  collapsedHeight="60px"
  rememberState={false}  // Always starts expanded on page load
/>
```

### Example 6: Fast Animation

```jsx
<ExpandableAdSlot
  placement="quick-banner"
  adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_CONTENT_BOTTOM}
  adSizes={[[970, 90], [728, 90], [320, 50]]}
  expandedHeight="90px"
  collapsedHeight="50px"
  transitionDuration={200}  // 200ms animation
/>
```

---

## Responsive Behavior

The component automatically adjusts for different screen sizes:

### Desktop (1024px+)
- Uses larger ad sizes (970×250, 728×90)
- Expanded height as specified
- Full toggle button (48×24px)

### Tablet (768px - 1023px)
- Medium ad sizes (728×90, 468×60)
- Expanded height as specified
- Standard toggle button

### Mobile (<768px)
- Mobile ad sizes (320×100, 320×50)
- Uses `--expanded-height-mobile` if provided, otherwise `expandedHeight`
- Uses `--collapsed-height-mobile` if provided, otherwise `collapsedHeight`
- Smaller toggle button (40×20px)

---

## Custom CSS Variables

You can override heights per breakpoint using CSS custom properties:

```css
.my-expandable-ad {
  --expanded-height: 250px;
  --collapsed-height: 60px;
  --expanded-height-mobile: 100px;
  --collapsed-height-mobile: 50px;
  --transition-duration: 500ms;
}
```

```jsx
<ExpandableAdSlot
  placement="custom-heights"
  adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP}
  adSizes={[[970, 250], [320, 100]]}
  className="my-expandable-ad"
/>
```

---

## Ad Failure Handling

When an ad fails to load or returns no fill:

1. **First Attempt**: Component tries to load the ad
2. **Retry 1**: After 2 seconds, refreshes the ad slot
3. **Retry 2**: After 4 more seconds, final refresh attempt
4. **No Fill**: Shows "ADVERTISEMENT" text fallback
5. **Container Preserved**: Height is maintained to prevent layout shift

---

## LocalStorage Keys

By default, collapse state is saved with the key format:
```
finvexa-ad-{placement}-expanded
```

Examples:
- `finvexa-ad-top-banner-expanded` → `"true"` or `"false"`
- `finvexa-ad-sticky-top-expanded` → `"true"` or `"false"`

Custom key:
```jsx
<ExpandableAdSlot
  placement="my-ad"
  storageKey="custom-ad-state"
  ...
/>
```

---

## Accessibility

The component includes:

- `role="complementary"` - Identifies as supplementary content
- `aria-label` - Describes the ad placement
- `aria-expanded` - Indicates current state
- `aria-label` on button - Describes toggle action
- Keyboard focus styles - `:focus-visible` outline
- Screen reader friendly - Semantic HTML

---

## Integration with Current TopStickyExpandableAd

If you want to replace the current `TopStickyExpandableAd` with the reusable component:

**Before:**
```jsx
import TopStickyExpandableAd from './components/TopStickyExpandableAd';

<TopStickyExpandableAd />
```

**After:**
```jsx
import ExpandableAdSlot from './components/ExpandableAdSlot';

<div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, width: '100%', maxWidth: '100vw' }}>
  <ExpandableAdSlot
    placement="top-sticky-expandable"
    adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_TOP_STICKY_EXPANDABLE}
    adSizes={[[970, 250], [728, 90], [468, 60], [320, 100], [320, 50]]}
    expandedHeight="280px"
    collapsedHeight="60px"
    buildSizeMapping={(gt) =>
      gt.sizeMapping()
        .addSize([1024, 0], [[970, 250], [728, 90]])
        .addSize([768, 0], [[728, 90], [468, 60]])
        .addSize([0, 0], [[320, 100], [320, 50]])
        .build()
    }
  />
</div>
```

---

## Common Patterns

### Pattern 1: Header with Sticky Expandable Ad

```jsx
function Layout() {
  return (
    <>
      <div className="top-sticky-ad-wrapper">
        <ExpandableAdSlot
          placement="top-sticky"
          adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_TOP_STICKY_EXPANDABLE}
          adSizes={[[970, 250], [728, 90], [320, 100]]}
          expandedHeight="250px"
          collapsedHeight="60px"
        />
      </div>
      <Header />
      <main>{/* Content */}</main>
    </>
  );
}
```

```css
.top-sticky-ad-wrapper {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  width: 100%;
  max-width: 100vw;
}
```

### Pattern 2: In-Content Expandable Ad

```jsx
function BlogPost() {
  return (
    <article>
      <h1>My Blog Post</h1>
      <p>First paragraph...</p>

      <ExpandableAdSlot
        placement="blog-inline"
        adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_CONTENT_MIDDLE_1}
        adSizes={[[728, 90], [336, 280], [300, 250]]}
        expandedHeight="280px"
        collapsedHeight="60px"
        className="blog-inline-ad"
      />

      <p>More content...</p>
    </article>
  );
}
```

---

## Troubleshooting

### Ad Not Showing
- Check that `adUnitPath` is correctly configured in `.env`
- Verify ad sizes match your GAM configuration
- Check browser console for GAM debug logs
- Ensure GPT script is loaded (`AdScriptLoader` component)

### Layout Shift Issues
- Always specify `expandedHeight` and `collapsedHeight`
- Don't use `display: none` on the container
- Component automatically reserves space

### localStorage Not Working
- Check browser privacy settings
- Ensure `rememberState={true}`
- Verify `storageKey` is unique per placement

### Animation Issues
- Adjust `transitionDuration` prop
- Check that CSS transitions aren't disabled globally
- Verify no conflicting CSS animations

---

## Performance Tips

1. **Lazy Loading**: GAM automatically lazy loads ads (configured in `AdManager.jsx`)
2. **Single Request**: Multiple ads batched in one request
3. **Responsive Sizing**: Serves appropriate ad size per device
4. **Empty Div Collapse**: Automatically collapses empty slots

---

## Testing Checklist

- [ ] Ad loads on desktop
- [ ] Ad loads on tablet
- [ ] Ad loads on mobile
- [ ] Expand/collapse animation is smooth
- [ ] Toggle button is clickable
- [ ] State persists after page reload (if `rememberState={true}`)
- [ ] No layout shift when expanding/collapsing
- [ ] "ADVERTISEMENT" shows when ad fails
- [ ] No horizontal scrolling
- [ ] Works after client-side navigation
- [ ] Keyboard navigation works
- [ ] Screen reader announces state correctly

---

## Migration Guide

If you have existing ad slots and want to make them expandable:

**Step 1**: Replace static ad with ExpandableAdSlot
```jsx
// Before
<AdUnit slot="TOP" />

// After
<ExpandableAdSlot
  placement="top-banner"
  adUnitPath={import.meta.env.VITE_GAM_AD_UNIT_CONTENT_TOP}
  adSizes={[[970, 90], [728, 90], [320, 50]]}
  expandedHeight="90px"
  collapsedHeight="50px"
/>
```

**Step 2**: Adjust CSS if needed
```css
/* Remove fixed heights from parent containers */
.top-ad-rail {
  /* height: 90px; ❌ Remove this */
  min-height: auto; /* ✅ Let component control height */
}
```

**Step 3**: Test responsive behavior at all breakpoints

---

## Support

For issues or questions:
1. Check browser console for GAM debug logs
2. Verify environment variables in `.env`
3. Review this documentation
4. Check `AdManager.jsx` and `AdScriptLoader.jsx` configuration

---

**Created**: 2025
**Component Version**: 1.0.0
**License**: MIT
