# StudyFlow

A student portal for organizing courses, tracking assignments, and managing deadlines.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth.js v5 (credentials + optional Google/GitHub/Microsoft OAuth)

## Features

- **Study onboarding** — after signing up, choose a study category (Technology, Business, Health Sciences, Mathematics, or All Courses), then select any course units from any category up to an 8-credit cap. Each unit ships with its own assignments, which are provisioned automatically with staggered due dates.
- **Dashboard** — shows only your courses: image cards with code, term, notes, assignment counts, and the current letter grade (A–F); click a card to open its assignments. Auto-refreshes every 5 seconds. Everything else (assignments, to-dos, settings) lives in the sidebar.
- **Courses** — add courses by picking from the existing catalog (straight from the dashboard or the Courses page; free-form creation is not allowed), with search, sort, color-coded cards, course code, term, and notes. The 8-credit cap counts only unfinished courses: you can always add while under 8 credits, and at the limit you're denied until you drop or finish a course (finishing all of a course's assignments frees its credits). Right after registration users go straight into onboarding.
- **Assignments** — full CRUD with course linking, priority levels, type tags (assignment/exam/project/quiz), and filtering. Every assignment carries **lesson content** (seeded lessons for catalog courses) and **points** (15 for assignments, 10 quizzes, 25 exams, 20 projects). Students click **Mark done** to earn the points, and each course card shows a letter grade (A ≥ 90%, B ≥ 80%, C ≥ 70%, D ≥ 60%, else F) computed from earned ÷ total points.

## Getting Started

```bash
npm install
npx prisma generate
npx prisma db push
node scripts/seed-catalog.mjs   # seed study categories, course units, assignment templates
npm run dev
```

Requires a `.env` with `DATABASE_URL` and `AUTH_SECRET` (see `.env.example`).
OAuth buttons on the login page appear only when `AUTH_*` provider credentials are configured.

Open [http://localhost:3000](http://localhost:3000). Sign up at `/auth/register` — each account
starts with its own empty data.

## Project Structure

```
app/
  api/
    auth/[...nextauth]/ # NextAuth handler
    auth/register/      # POST sign-up
    auth/forgot-password/ # POST (no email provider yet)
    categories/         # GET catalog (auth-scoped)
    enrollment/         # POST pick units (max 8 credits), provisions courses+assignments
    courses/            # GET list, POST add-from-catalog (unitId, <=8 credits total)
    courses/[id]/       # GET, PATCH, DELETE (session-scoped)
    assignments/        # GET, POST (session-scoped)
    assignments/[id]/   # PATCH, DELETE (session-scoped)
    profile/            # GET, PATCH current user profile
  components/
    Sidebar.tsx         # nav + sign-out
    dashboard/
      StudyStats.tsx
      QuickActions.tsx
      UpcomingDeadlines.tsx
      TodoList.tsx
  auth/
    login/ register/ forgot-password/
  onboarding/page.tsx  # category + course unit selection
  courses/page.tsx
  assignments/page.tsx
  todos/page.tsx       # scratchpad to-dos (sidebar link)
  page.tsx            # Dashboard — courses only
prisma/
  schema.prisma       # User, Course, Assignment, StudyCategory, CourseUnit, AssignmentTemplate
lib/
  auth.ts             # NextAuth config (session, providers)
  password.ts         # scrypt hashing
  db.ts               # Prisma client singleton
  course-image.ts     # course card images by code prefix
app/components/
  CoursePickerModal.tsx # add a course by selecting from the catalog
scripts/
  seed-catalog.mjs    # seed the study catalog (categories, units, templates)
proxy.ts              # route guard (redirects signed-out users)
```

## Data Model

**User** — id, name, email, password, major, year, studyGoal, avatarUrl, categoryId, createdAt, updatedAt

**StudyCategory** — id, name (unique), description, color; has many course units and users

**CourseUnit** — id, code (unique), name, credits, description, color, categoryId; has many assignment templates

**AssignmentTemplate** — id, title, description, dueInDays, type, priority, courseUnitId

**Course** — id, name, code, term, notes, color, userId, createdAt, updatedAt

**Assignment** — id, title, description, content (lesson material), points, dueDate, completed, type, priority, courseId, userId, createdAt, updatedAt

One user has many courses. One course has many assignments. Each assignment belongs to one course and one user.

## Team

- Jesus Eduardo Pinta Molina
- Kevin Mbemba Kiyindou
- Kalungi Isaac
