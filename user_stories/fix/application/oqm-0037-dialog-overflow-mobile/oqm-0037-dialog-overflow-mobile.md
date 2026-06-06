# OQM-0037: Fix Dialog Overflow on Mobile Devices

## Issue Type
**Fix** - Dialog components overflow viewport on mobile devices, making action buttons inaccessible

## Priority
**High** - Blocks mobile usability, especially with Finnish language translations

## Description

### Problem Statement
Application dialogs extend outside the viewport on mobile devices, requiring users to scroll to access action buttons (Cancel/Peruuta). The issue is more pronounced with Finnish language due to longer text strings compared to English.

**Affected Components:**
- Coach Login Dialog
- Admin Login Dialog
- Trainee Login Dialog
- Register PIN Dialog
- Manual Coach/Trainee Registration Dialogs
- Sparring Coach Registration Dialog
- Confirmation Dialogs (Coach, Trainee, Remove)

### User Impact
- Users cannot access Cancel/OK buttons without scrolling
- Finnish language users experience worse overflow due to longer translations
- Mobile devices (< 600px width) most severely affected
- Poor user experience on phones and small tablets

### Root Cause
Dialogs lack proper responsive constraints:
1. No fullscreen mode on mobile viewports
2. DialogContent can grow beyond Dialog Paper bounds
3. Missing flex layout constraints for content scrolling
4. No maximum height constraints on desktop viewports

## Acceptance Criteria

- [ ] All dialogs display fullscreen on mobile (< 600px width)
- [ ] DialogContent scrolls within bounds when content exceeds viewport
- [ ] Action buttons (Cancel/OK) always visible and clickable
- [ ] Finnish language text does not cause overflow
- [ ] English language continues to work correctly
- [ ] Desktop/tablet views use constrained dialog (max 90vh)
- [ ] No horizontal scrolling in any dialog
- [ ] Touch targets meet 48×48px minimum size requirement

## Technical Implementation

### 1. Create Responsive Hooks (`web/src/shared/hooks/useResponsive.ts`)

```typescript
export const useIsMobile = () => useMediaQuery(theme.breakpoints.down('sm'));
export const useIsTablet = () => useMediaQuery(theme.breakpoints.between('sm', 'md'));
export const useIsDesktop = () => useMediaQuery(theme.breakpoints.up('md'));
export const useResponsiveDialog = () => ({ fullScreen: useIsMobile() });
```

### 2. Dialog Layout Constraints

**Dialog Paper (slotProps.paper.sx):**
```tsx
{
  display: 'flex',
  flexDirection: 'column',
  maxHeight: fullScreen ? '100%' : '90vh',  // Prevents overflow
  height: fullScreen ? '100%' : 'auto',
}
```

**DialogContent (sx prop):**
```tsx
{
  flex: '1 1 0',        // Allows shrinking
  minHeight: 0,         // Enables flex shrink behavior
  maxHeight: '100%',    // Prevents overflow beyond Paper
  overflowY: 'auto'     // Makes content scrollable
}
```

### 3. Files Modified

**Dialog Components (10 files):**
- `web/src/features/coach/components/CoachLoginDialog.tsx`
- `web/src/features/admin/components/AdminLoginDialog.tsx`
- `web/src/features/trainee/components/TraineeLoginDialog.tsx`
- `web/src/shared/components/RegisterPinDialog/RegisterPinDialog.tsx`
- `web/src/features/coach/components/ManualCoachRegistrationDialog.tsx`
- `web/src/features/trainee/components/ManualTraineeRegistrationDialog.tsx`
- `web/src/features/coach/components/SparringCoachRegistrationDialog.tsx`
- `web/src/features/coach/components/ConfirmCoachRegistrationDialog.tsx`
- `web/src/features/trainee/components/ConfirmTraineeRegistrationDialog.tsx`
- `web/src/features/coach/components/ConfirmRemoveCoachDialog.tsx`

**Page Components:**
- `web/src/pages/Admin/AdminPage.tsx` - Mobile drawer variant
- `web/src/pages/Coach/CoachPage.tsx` - Responsive Grid layout
- `web/src/pages/Trainee/TraineePage.tsx` - Responsive Grid layout

**Card Components:**
- `web/src/features/coach/components/SessionCard.tsx` - Responsive width
- `web/src/features/trainee/components/TraineeSessionCard.tsx` - Responsive width

**New Files:**
- `web/src/shared/hooks/useResponsive.ts` - Centralized responsive utilities
- `web/src/shared/hooks/__tests__/useResponsive.test.ts` - Unit tests
- `web/src/shared/hooks/index.ts` - Exports

## Testing Requirements

### Manual Testing Checklist

#### Mobile Viewport (375×812 - iPhone SE)
- [ ] Open each dialog in Finnish language
- [ ] Verify dialog fills fullscreen (no rounded corners)
- [ ] Verify DialogContent scrolls when needed
- [ ] Verify Cancel/Peruuta button visible at bottom
- [ ] Click Cancel/Peruuta button - dialog closes
- [ ] Repeat test in English language
- [ ] Verify no horizontal scrolling

#### Tablet Viewport (768×1024 - iPad)
- [ ] Open dialogs in both languages
- [ ] Verify dialogs are constrained (not fullscreen)
- [ ] Verify rounded corners visible
- [ ] Verify max-height constraint (90vh)
- [ ] Verify buttons accessible

#### Desktop Viewport (≥1280px)
- [ ] Verify dialogs centered and constrained
- [ ] Verify proper spacing and layout
- [ ] Test all dialog interactions

### Automated Testing
- [ ] useResponsive hooks unit tests pass
- [ ] TypeScript compilation succeeds
- [ ] No console errors or warnings

## Dependencies
- Material-UI v6 `useMediaQuery` hook
- Material-UI Dialog component with `fullScreen` prop
- Material-UI theme breakpoints (xs: 0, sm: 600, md: 960)

## Breaking Changes
None - All changes are internal styling improvements

## Performance Impact
Minimal - Only adds MUI's standard media query listeners (already used elsewhere)

## Rollback Plan
Revert commit containing dialog Paper and DialogContent style changes

## Documentation Updates
- Frontend instructions updated with mobile-first principles
- Review checklist updated with responsive testing requirements

## Related Issues
- Initial report: Dialog overflow on mobile devices
- Language issue: Finnish translations cause button cutoff

## Success Metrics
- ✅ All 10 dialogs tested on mobile viewport (375×812)
- ✅ Both English and Finnish languages verified
- ✅ Cancel buttons accessible and clickable
- ✅ No horizontal scrolling detected
- ✅ Dialog content scrolls properly when needed

## Implementation Notes

### Why English Worked but Finnish Failed
- **English**: Shorter text ("Coach login", "Enter PIN code") naturally fits in viewport
- **Finnish**: Longer text ("Valmentajan kirjautuminen", "Syötä PIN-koodi") requires scrolling
- **Solution**: Proper flex constraints ensure scrolling works correctly for both languages

### Key CSS Properties
The critical combination for preventing overflow:
1. `display: flex` + `flexDirection: column` on Dialog Paper
2. `maxHeight` constraint on Paper (100% mobile, 90vh desktop)
3. `flex: '1 1 0'` + `minHeight: 0` on DialogContent enables shrinking
4. `maxHeight: '100%'` on DialogContent prevents exceeding Paper bounds
5. `overflowY: 'auto'` makes content scrollable

### Browser Compatibility
- Chrome/Edge: ✅ Tested and working
- Firefox: ✅ Standard flexbox support
- Safari: ✅ Standard flexbox support
- Mobile browsers: ✅ Target platform, tested

## Screenshots

### Before (Problem)
- Finnish dialog extends beyond viewport
- Cancel button not visible without scrolling
- DialogContent covers DialogActions area

### After (Fixed)
- Dialog fills fullscreen on mobile
- Content scrolls within dialog bounds
- Cancel button always visible at bottom
- Both English and Finnish work correctly

## Review Checklist
- [ ] All dialog components updated consistently
- [ ] Responsive hooks created with tests
- [ ] TypeScript types correct
- [ ] No breaking changes to dialog behavior
- [ ] Performance acceptable (no additional re-renders)
- [ ] Code follows frontend instructions
- [ ] Manual testing completed on all viewports
- [ ] Documentation updated

## Deployment Notes
- No backend changes required
- No database migrations needed
- Safe to deploy - only frontend styling changes
- Test on actual mobile devices recommended after deployment
