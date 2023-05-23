# Component Classifications

- Each component can depend on components at the same level or lower levels.
- You don't necessarily have to follow the designer's definition of component categorization strictly, because the categorization prioritizes ease of implementation and maintainability, which is difficult to determine without implementation knowledge.

## Atoms

The smallest unit of purely displayable components, responsible only for display and event publishing. Some people call it "design system."

### Responsibility

- Implementation and styling of the look and feel
- Publishing events related to user interaction

### Recommended

- Create a story for Storybook
- Simplify property type
- Be ready to go straight to the library as a design system without relying on application-specific technology or knowledge or side effects

### Prohibited

- Using GraphQL (`@reearth/gql`)
- Using drag and drop a.k.a. dnd (`@reearth/util/use-dnd`), but can use react-dnd if the dnd process is closed within a component.
- Using router (including Link and RedirectTo)
- Using local state (`@reearth/state`)

## Molecules

Application-specific display components made from a combination of atoms and molecules. The difference with atoms is that application-specific technology and knowledge is included in the components.

### Responsibility

- Layout and styling
- Define and publish the type of view model

### Recommended

- Create a story for Storybook

### OK

- Implementation of DnD (`@reearth/util/use-dnd`)
- When a component becomes large and you want to divide it into multiple components within a molecule component, you can create additional internal component files or folders within the folder as long as the reference is completely closed within the component (no external references).

### Prohibited

- Using GraphQL (`@reearth/gql`)
- Using router（including Link and RedirectTo)
- Using local state (`@reearth/state`)

## Organisms

Components that operate independently of themselves by combining molecules to communicate with the outside world

### Responsibility

- Placement of molecules components
- Connection to the local state
- Calling GraphQL queries and mutations
- Convert GraphQL data to the view model published by molecules

### Recommended

- Cut hooks out into custom hooks for each component, because they tend to be bloated
- Display spinners and placeholders while the query is communicating
- Display an error message and a retry button to users can try again when the query communication fails
- Wrap the component in ErrorBoundary to prevent the entire screen from going blank when an uncaught exception is thrown

### Prohibited

- Styling: If you feel like styling it, cut it out into atoms or molecules. Use the children and render prop patterns to reverse the dependency.

### Notes

- You don't have to force creating a story for Storybook.
- GraphQL errors are automatically caught and displayed to the user, so GraphQL error handling is essentially unnecessary, except for implementations that display a retry button.

## Pages

Thin components, combining organisms page by page. It will be routed by the top-level App component and loaded lazily via dynamic import.

### Prohibited

- Styling: If you feel like styling it, cut it out into atoms or molecules. Use the children and render prop patterns to reverse the dependency.

### Notes

- You can call GraphQL for the entire page.
- You don't have to force creating a story for Storybook.

Note: in this project, "templates" is not used.

## Design system

### Typography

There is a Text component which is used to format all text in our app.
Never define typographic styles such as font-family, font-size, font-weight, etc in another component. Always use the Text component.

### Margin & Padding

There is a BoxModel component which attaches margin, padding and border to its child component.

Never apply these directly in other components.

### Flex-box

When you want to use `flex-box` never apply `display: flex` anymore.

Use the `Flex` component for that.
