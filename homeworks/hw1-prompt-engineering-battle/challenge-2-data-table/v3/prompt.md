# Version 3 Prompt

You are a Senior Frontend Engineer specializing in React + TypeScript data table, and enterprise-grade UI engineering. You strictly follow the frontend architecture, design principles, and coding conventions described in the `skill.md` file that I have attached. Your output must be elegant, minimalistic, highly readable, type-safe, semantically correct, and production-ready with zero TypeScript errors. All code must be strictly typed with zero TypeScript errors. Never use `any` type for variables, parameters, function returns, or attributes. If the correct type is unknown, use appropriate generic types, union types, or explicitly define interfaces/types. All React props, event handlers, and DOM attributes must use their proper TypeScript types from React's type definitions.

DO NOT WRITE ANY CODE YET UNTIL I SAY SO.

You will prepare to build a React + TypeScript Claude artifact that displays a complete dataset of Marvel characters and all major attributes, such as `name`, `codeName`, `age`, `ranking` (power ranking), `birthPlace`, `dateOfBirth`, `affiliation`, `status` (active, retired, deceased, unknown), `species`, `firstAppearance`, `abilities` (string array), `moviesCount`, `currentLocation`, and any additional relevant properties.

The table must follow all design practices and UI styling conventions from `skill.md` (which I have provided).  
This includes color tokens, spacing rules, card layout rules, shadow rules, interaction states, responsive breakpoints, hover/tap behavior, font weights, font sizes, container width guidelines, and dark/light theme synchronization.

All of the below core requirements must be satisfied.

- Data Table Integration: Build a fully custom React + TypeScript data table from scratch with no external dependencies, no TanStack, no UI libraries, and no utility table libraries. All table behaviors must be implemented manually using React state, memoization, and clean functional component patterns.
- Column Design: Each column must include accessor key, header component, cell renderer, sorting function (string, number, date aware), filtering behavior. It must follow the `skill.md` interaction patterns for hover states, focus states, badges/pills, color-emphasis rules (e.g., ranking → heatmap, status → color-coded tag)
- UI + Theming Requirements: Table must visually match the color palette, styles, and component behavior from `skill.md`. Use correct semantic colors for rankings (heatmap or tier colors), birthplaces (geo tags), status (success/warning/danger/gray tokens). Use the spacing + typography scale defined in `skill.md`. The component must support both dark mode and light mode using the prescribed tokens.
- Interactivity: Clicking a row should open a side panel (drawer) with full character details. The drawer design must follow the modal/drawer spec in `skill.md`. Rows should have hover elevation (if allowed), selection state, keyboard navigability
- Performance: Use `useMemo`, `useCallback`, and virtualization if needed. Minimize unnecessary re-renders and the table must handle 500+ character rows smoothly. Column definitions must be fully typed and not rely on `any`.
- Accessibility: Table must follow WAI-ARIA table guidelines. Sort buttons must have aria-sort attributes. Drawer must trap focus and support keyboard closing (Esc key).
- Restrictions: NO external UI component libraries (MUI, Mantine, Chakra, AntD, ShadCN, TanStack Table, or any other dependency). You may only use React, TypeScript, CSS Modules/inline styles (depending on skill.md), no test files (Claude Artifact limitation). 

When I say the exact phrase “begin coding”, output ONLY `MarvelTable.tsx`. Until then ask me questions in case of any uncertainties and if you are extremely clear, after I explicitly say "begin coding", proceed with creating artifact. Most importantly, there should not be any type script type errors