# StudyFlow

A student portal for organizing courses, tracking assignments, and managing deadlines.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth.js is to be in soon

## Features

- **Dashboard** — overview of enrolled courses, pending/completed assignments, upcoming deadlines, and a scratchpad to-do list. Auto-refreshes every 5 seconds.
- **Courses** — full CRUD with search, sort, color-coded cards, course code, term, and notes.
- **Assignments** — full CRUD with course linking, priority levels, type tags (assignment/exam/project/quiz), completion toggling, and filtering.

## Getting Started

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To seed sample data:

```bash
npx tsx scripts/seed.ts
npx tsx scripts/seed-assignments.ts
```

## Project Structure

```
app/
  api/
    courses/          # GET, POST
    courses/[id]/     # GET, PATCH, DELETE
    assignments/      # GET, POST
    assignments/[id]/ # PATCH, DELETE
  components/
    Sidebar.tsx
    dashboard/
      StudyStats.tsx
      QuickActions.tsx
      UpcomingDeadlines.tsx
      TodoList.tsx
  courses/page.tsx
  assignments/page.tsx
  page.tsx            # Dashboard
prisma/
  schema.prisma       # User, Course, Assignment models
lib/
  db.ts               # Prisma client singleton
scripts/
  seed.ts             # Seed courses
  seed-assignments.ts # Seed assignments
```

## Data Model

**User** — id, name, email, password, createdAt, updatedAt

**Course** — id, name, code, term, notes, color, userId, createdAt, updatedAt

**Assignment** — id, title, description, dueDate, completed, type, priority, courseId, userId, createdAt, updatedAt

One user has many courses. One course has many assignments. Each assignment belongs to one course and one user.

## Team

- Jesus Eduardo Pinta Molina
- Kevin Mbemba Kiyindou
- Kalungi Isaac
