# RapidAim V2 Static Handoff Implementation Brief

## Purpose

V2 should be a clean static handoff layer for the RapidAim frontend. It does not need to reproduce the full runtime behavior of the V1 prototype. V1 remains the richer UX proof-of-concept; V2 should extract the visual language, reusable components, layout patterns, and key UI states into an inspectable design-system implementation.

The goal is for a frontend engineer to compare V1 and V2, understand the intended product surfaces, and stitch the real application together using the V2 components as the source of design truth.

## Product Positioning

V1 is the interactive prototype:

- Heavily UX-focused.
- Rich map interactions, modal flows, dynamic filtering, chart updates, assignment flows, mobile sheet behavior, and organization dashboard transitions.
- Useful as the behavioral reference.

V2 is the frontend handoff system:

- Static and intentionally simpler.
- Built from shared atoms, molecules, organisms, templates, tokens, and fixtures.
- Useful as the design and component reference.
- Expected to show representative UI states rather than complete product logic.

## Primary Outcome

Create a set of static RapidAim pages and Storybook stories that all use the same component system.

Changes to foundational design-system elements, such as tokens, buttons, badges, forms, panels, charts, map treatments, spacing, or typography, should cascade consistently across:

- Storybook component stories.
- Static handoff pages.
- Template-level dashboard compositions.

## Implementation Principles

1. Do not port V1 wholesale.
   The V1 code is useful for reference, but V2 should remain clean, componentized, and readable.

2. Prefer static snapshots over complex behavior.
   Each page should show a clear state that a frontend engineer can inspect and translate into application logic later.

3. Reuse the design system everywhere.
   Static pages should not introduce one-off styling that bypasses atoms, molecules, organisms, CSS modules, or tokens.

4. Keep data realistic but fixture-driven.
   Use shared mock fixtures to populate pages and stories. Avoid random data in render paths because it makes review and visual comparison harder.

5. Make page states explicit.
   If V1 has multiple important states, represent them as separate static pages or stories rather than hidden runtime branches.

## Recommended Static Page Inventory

These pages should be available in the Vite app as simple routes or linked static views. They can be implemented with lightweight client-side routing or a small page switcher; the important thing is that each page composes the shared V2 components.

### 1. Desktop Map Dashboard: Ranking State

Reference: V1 desktop default map view.

Should show:

- Top navigation with logo, search, task icon, and profile affordance.
- Left panel in pest pressure ranking mode.
- Interactive-map visual shell using static fixture data.
- Weather widget state.
- Control center with pest, organization, ranch, threshold, layers, and legend.

Purpose:

- Demonstrates the default operating dashboard before a block, ranch, or sensor is selected.

### 2. Desktop Map Dashboard: Block Detail State

Reference: V1 block detail panel.

Should show:

- Selected block title, ranch subtitle, risk/status badge.
- Current pest count card.
- Trend indicator and benchmark copy.
- Action row with assignment/report actions.
- Day trend chart.
- 3-day average and 7-day rolling chart.
- Hourly distribution chart.
- Map showing selected block and sensors.

Purpose:

- Gives the frontend engineer the main block inspection layout.

### 3. Desktop Map Dashboard: Ranch Detail State

Reference: V1 ranch aggregate detail.

Should show:

- Ranch-level detail header.
- Aggregate count and active sensor summary.
- Last 7-day detections grid/table.
- Charts using the same chart components.
- Actions for assign scouting, AI report, and view organization.

Purpose:

- Captures the aggregate view between block-level and organization-level UX.

### 4. Desktop Map Dashboard: Sensor Detail State

Reference: V1 sensor selection detail.

Should show:

- Sensor title and parent block/ranch context.
- Online, offline, or maintenance status treatment.
- Battery/quality/sync metadata.
- Count card and trend charts.
- Assignment/report actions.

Purpose:

- Makes hardware-specific states visible in the design system.

### 5. Tasks Dropdown State

Reference: V1 active scouting task dropdown.

Should show:

- Empty state.
- Populated state with multiple tasks.
- Priority badges.
- Assignee, target entity, type, notes, and status.

Purpose:

- Captures task notification and task list UI without needing live dispatch logic.

### 6. Scouting Assignment Modal State

Reference: V1 scouting modal.

Should show:

- Context badge row for entity, status, and pest category.
- Assignment type segmented control.
- Assignee select.
- Priority segmented control.
- Notes textarea.
- Cancel and dispatch buttons.

Purpose:

- Captures the field-work creation form as a reusable static modal pattern.

### 7. AI Insights Report Modal State

Reference: V1 AI report modal.

Should show:

- Loading/synthesizing state.
- Completed report state.
- Export as PDF action.
- Report sections with risk interpretation, observations, and recommendation copy.

Purpose:

- Gives engineers the report structure without requiring AI/report generation logic.

### 8. Mobile Map Dashboard: Ranking Sheet State

Reference: V1 mobile default view.

Should show:

- Mobile header.
- Map.
- Floating action buttons.
- Bottom sheet in ranking-list state.
- Block count badge.

Purpose:

- Captures mobile operational default.

### 9. Mobile Map Dashboard: Detail Sheet State

Reference: V1 mobile detail view.

Should show:

- Back affordance.
- Detail title, subtitle, status badge.
- Count card.
- Assignment/report action buttons.
- Detection grid if ranch state is shown.
- Charts stacked in mobile proportions.

Purpose:

- Captures how desktop detail content translates to mobile sheet layout.

### 10. Mobile Overlays State

Reference: V1 mobile floating controls and task overlay.

Should show:

- Layers dropdown.
- Pest selector dropdown.
- Ranch selector dropdown.
- Active tasks overlay.
- Scouting modal in mobile proportions.

Purpose:

- Makes mobile-specific controls inspectable without implementing full gesture behavior.

### 11. Organization Dashboard State

Reference: V1 organization dashboard overlay.

Should show:

- Organization header.
- Hero metrics row.
- Multi-site pressure trajectory chart.
- Ranch priority list.
- Crop or portfolio summary cards.
- Logistics/compliance panel.

Purpose:

- Preserves the enterprise dashboard direction as a static template.

### 12. Account Settings State

Reference: existing V2 account settings work.

Should show:

- Default form.
- Error state.
- Success state.
- Saving state.

Purpose:

- Keeps non-map form patterns aligned with the same tokens and controls.

## Storybook Requirements

Storybook should remain the component-level source of truth.

Required story coverage:

- Every atom should have default, disabled, error, selected, and size variants where relevant.
- Every molecule should have realistic RapidAim examples, not generic placeholder copy.
- Every organism should include at least one normal state and one edge state.
- Every template/static page should have a matching Storybook story.
- Data fixtures used in pages should also be used in stories.

Recommended Storybook groups:

- Foundations: tokens, typography, colors, spacing.
- Atoms: button, badge, input, select, checkbox, icon button.
- Molecules: stat card, ranking item, form field, alert, search bar, task item.
- Organisms: top navigation, control center, detail panel, task dropdown, scouting modal, report modal, map, charts, weather widget.
- Templates: desktop map states, mobile map states, organization dashboard, account settings.
- Documentation: data schema, V1-to-V2 parity matrix, implementation notes.

## Component Gaps To Add Or Extend

Existing V2 components are a good foundation, but the following should be added or expanded for handoff completeness:

- `TaskDropdown`
- `TaskListItem`
- `ScoutingAssignmentModal`
- `ReportModal`
- `WeatherWidget`
- `DetectionGrid`
- `SensorMetaGrid`
- `SegmentedControl`
- `IconButton`
- `FloatingActionButton`
- `MobileBottomSheet`
- `MobileControlDropdown`
- `DashboardPageShell`
- `StaticPageNav` or equivalent page index for handoff browsing

Existing components to strengthen:

- `DetailPanel`: support block, ranch, sensor, and organization detail variants.
- `ControlCenter`: expose values as props and add static collapsed/expanded layer states.
- `TrendChart`: support deterministic fixture data, date navigation labels, bar/line variants, and multi-series charts.
- `InteractiveMap`: support selected block, hidden sensors, offline sensors, heatmap/polygon variants, and map style variants.
- `TopNavigationBar`: support task badge count, mobile variant, and static task dropdown trigger state.
- `HeroMetricsRow`: support icon, status color, description, and enterprise metric variants.

## Shared Fixtures

Create fixture modules for repeatable data:

- `ranches`
- `blocks`
- `sensors`
- `tasks`
- `charts`
- `reports`
- `users`
- `weather`

Fixtures should be deterministic and imported by both stories and static pages.

Avoid `Math.random()` in rendered components. If variation is needed, create named fixture scenarios such as:

- `highRiskBlock`
- `mediumRiskRanch`
- `offlineSensor`
- `emptyTasks`
- `activeTasks`
- `reportLoading`
- `reportComplete`

## V1-To-V2 Parity Matrix

Add a handoff matrix documenting which V1 surfaces are captured in V2.

Suggested columns:

- V1 surface
- V1 reference file/area
- V2 component/template/page
- Storybook story
- Static page
- Status: Captured, Partial, Missing, Deferred
- Notes for frontend engineer

This should be explicit that behavioral logic remains a frontend implementation task.

## Suggested App Structure

```text
src/
  components/
    atoms/
    molecules/
    organisms/
    templates/
    pages/
  fixtures/
    rapidAimFixtures.js
  handoff/
    HandoffIndex.jsx
    DesktopRankingPage.jsx
    DesktopBlockDetailPage.jsx
    DesktopRanchDetailPage.jsx
    DesktopSensorDetailPage.jsx
    TasksDropdownPage.jsx
    ScoutingModalPage.jsx
    ReportModalPage.jsx
    MobileRankingPage.jsx
    MobileDetailPage.jsx
    MobileOverlaysPage.jsx
    OrganizationDashboardPage.jsx
  docs/
    DataSchema.mdx
    ParityMatrix.mdx
```

The Vite app can render `HandoffIndex` by default. This is preferable to leaving the Vite starter app in place.

## Build And Documentation Requirements

Before handoff, the following commands should pass:

```bash
npm run build
npm run lint
npm run build-storybook
```

Current known issue:

- The Vite app builds, but currently renders the starter page rather than RapidAim.
- Storybook static build currently fails due to Storybook package version mismatch. Align Storybook packages before relying on the static docs build.

## Acceptance Criteria

The V2 handoff is ready when:

- The default Vite app opens to a RapidAim handoff index, not the starter Vite screen.
- Each major V1 UI surface has a corresponding static page or documented deferral.
- Each static page is built from shared V2 components.
- Each shared component has matching Storybook coverage.
- Token changes visibly cascade through pages and stories.
- Fixtures are deterministic and shared.
- Storybook static build passes.
- The parity matrix clearly states what is captured, partial, missing, or deferred.

## Non-Goals

Do not implement the full product logic in this phase.

Specifically out of scope:

- Real API integration.
- Full map interaction parity with V1.
- Scouting task persistence.
- AI report generation.
- PDF export implementation.
- Authentication and authorization.
- Production routing and app state management.
- Gesture-perfect mobile bottom sheet behavior.

These remain frontend/product implementation concerns after the design-system handoff.

## Recommended Next Steps

1. Replace the Vite starter `App.jsx` with a RapidAim handoff index.
2. Fix Storybook dependency alignment so `npm run build-storybook` passes.
3. Add deterministic shared fixtures.
4. Add the missing handoff components listed above.
5. Build the static page inventory.
6. Add matching Storybook stories for each static page and component.
7. Create the V1-to-V2 parity matrix.
8. Run a visual review against V1 and mark intentional simplifications clearly.

