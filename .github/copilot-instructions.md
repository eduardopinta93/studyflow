# StudyFlow Copilot Instructions

## Project Overview

StudyFlow is a full-stack web application designed to help college students organize courses, assignments, deadlines, and academic workload in one place.

Development should remain focused on the MVP before introducing optional features.

## Technology Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- MongoDB
- ESLint
- Prettier

Use the existing project dependencies and conventions. Do not introduce major libraries or frameworks without a clear project need and team agreement.

## MVP Scope

The initial MVP includes:

- User authentication and profile management
- Course CRUD
- Assignment CRUD
- Academic workload dashboard
- Responsive desktop and mobile interfaces
- Loading, validation, empty, success, and error states

Do not prioritize Phase 2 functionality such as AI features, calendar integrations, notifications, grade tracking, file uploads, or advanced analytics until the MVP is complete.

## Application Routes

The planned MVP routes are:

- `/` - Landing page
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Academic workload dashboard
- `/courses` - Course management
- `/courses/[courseId]` - Individual course details
- `/assignments` - Assignment management
- `/profile` - User profile

Follow Next.js App Router conventions for routing.

## Component Architecture

Prefer reusable components over duplicated page-specific UI.

Planned shared components include:

- `AppHeader`
- `Navigation`
- `CourseCard`
- `AssignmentCard`
- `CourseForm`
- `AssignmentForm`
- `StatusBadge`
- `EmptyState`
- `LoadingState`

Use Server Components by default. Add `"use client"` only when a component requires client-side interactivity, state, event handlers, or browser APIs.

## Data Model

StudyFlow uses three core entities:

### User

- `id`
- `name`
- `email`
- `createdAt`
- `updatedAt`

### Course

- `id`
- `name`
- `code` (optional)
- `term` (optional)
- `notes` (optional)
- `userId`
- `createdAt`
- `updatedAt`

### Assignment

- `id`
- `title`
- `description` (optional)
- `dueDate`
- `completed`
- `courseId`
- `userId`
- `createdAt`
- `updatedAt`

Relationships:

- One User can have many Courses.
- One User can have many Assignments.
- One Course belongs to one User.
- One Course can have many Assignments.
- One Assignment belongs to one Course and one User.

Use MongoDB IDs/references to represent these relationships.

## TypeScript Conventions

- Use TypeScript consistently.
- Keep strict typing enabled.
- Explicitly type component props, application data, API responses, and database models.
- Define and reuse shared types/interfaces when data crosses application layers.
- Avoid `any` unless absolutely necessary and document why it is required.
- Use clear and descriptive names for variables, functions, components, and types.

Shared TypeScript definitions should be established before frontend-backend integration when multiple features depend on the same data structure.

## API and Data Access

Use Next.js Route Handlers for required client-server-database operations.

Keep database access and server-side logic out of presentational components.

Validate incoming data and return meaningful error responses.

Authenticated data must be scoped to the current user. A user must not be able to access or modify another user's courses or assignments.

## Styling and Branding

StudyFlow should have a clean, modern, academic productivity-focused appearance.

### Colors

- Primary Indigo: `#4F46E5`
- Primary Dark/Hover: `#4338CA`
- Accent Sky Blue: `#0EA5E9`
- Background: `#F8FAFC`
- Surface/Card: `#FFFFFF`
- Main Text: `#0F172A`
- Secondary Text: `#64748B`
- Success/Completed: `#16A34A`
- Warning/Upcoming: `#F59E0B`
- Error/Overdue: `#DC2626`

### Typography

Use Inter as the primary application font.

### Layout and Spacing

- Use Tailwind CSS as the primary styling system.
- Prefer Tailwind's standard spacing scale and consistent multiples of 4px.
- Use consistent spacing for cards, forms, and page sections.
- Maintain shared navigation and a consistent main content area.
- Design for both desktop and mobile layouts.
- Avoid unnecessary custom CSS when Tailwind utilities are sufficient.

Do not introduce an additional UI component library for the initial MVP unless the team agrees that it is necessary.

## UI and Accessibility

- Build reusable UI patterns.
- Provide clear loading, empty, success, validation, and error states.
- Forms must provide understandable validation feedback.
- Interactive elements should be keyboard accessible where appropriate.
- Maintain readable text and sufficient visual contrast.
- Ensure interfaces remain usable on desktop and mobile screens.

## Naming and Git Conventions

Use descriptive names and keep naming consistent across the project.

Suggested branch prefixes:

- `feature/`
- `fix/`
- `chore/`
- `docs/`

Use concise, descriptive commit messages.

Do not make feature work directly on `main`.

Development should follow:

1. Create a task/feature branch.
2. Implement and test the change.
3. Run linting and formatting checks.
4. Push the branch.
5. Open a pull request.
6. Receive at least one peer approval.
7. Merge into `main`.

## Code Quality

- Follow the existing ESLint and Prettier configuration.
- Keep components focused on a clear responsibility.
- Avoid unnecessary duplication.
- Prefer simple MVP solutions over premature abstraction.
- Handle expected errors instead of silently failing.
- Verify critical user flows before merging.

## Current Development Priority

Week 04 development prioritizes:

1. Authentication
2. Shared responsive layout and navigation
3. Course backend and MongoDB integration
4. Course management interface

Assignments and dashboard functionality will follow after these foundational features are established.
