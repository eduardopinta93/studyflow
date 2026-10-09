# StudyFlow

A full school portal for organizing courses, tracking assignments, discussing topics, and managing grades and deadlines.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB (Atlas) via Prisma ORM
- **Styling:** Tailwind CSS 4
- **Auth:** NextAuth.js v5 (credentials + optional Google/GitHub/Microsoft OAuth)

## Features

- **Study onboarding** — after signing up, choose a study category (Technology, Business, Health Sciences, Mathematics, or All Courses), then select any course units from any category up to an 8-credit cap. Each unit ships with its own assignments, which are provisioned automatically with staggered due dates.
- **Portal navigation** — a global sidebar (Dashboard, Calendar, Courses, Assignments, Grades, To-dos, Inbox, Settings) with a live **My Courses** list, and a Canvas-style **course shell**: a course-colored header with breadcrumb plus context tabs (Home, Announcements, Modules, Assignments, Discussions, Grades) shared by every course page.
- **Dashboard** — course cards with image, code, term, notes, assignment counts, and current letter grade (A–F); opens the course home page on click. A sticky **Coming Up** rail shows pending deadlines. Auto-refreshes every 5 seconds.
- **Course home** — recent announcements, course summary, and a right rail with View Assignments / View Grades / Discussions shortcuts, a Coming Up widget, and the current grade.
- **Announcements** — post, list, and delete course announcements (Canvas-style feed shown on the course home).
- **Discussions** — create topics (optionally pinned or closed for replies) and hold threaded conversations: the topic page renders nested replies with inline composers, reply counts, and last-activity dates — just like an LMS discussion board.
- **Modules** — coursework grouped into week-based modules with per-module progress bars, mixing assignments, quizzes, exams, and discussions into one checklist.
- **Courses** — add courses by picking from the existing catalog (straight from the dashboard or the Courses page; free-form creation is not allowed), with search, sort, color-coded cards, course code, term, and notes. The 8-credit cap counts only unfinished courses: you can always add while under 8 credits, and at the limit you're denied until you drop or finish a course (finishing all of a course's assignments frees its credits). Right after registration users go straight into onboarding.
- **Assignments** — full CRUD with course linking, priority levels, type tags (assignment/exam/project/quiz), and filtering, both globally and per course (the course tab is scoped to that course). Every assignment carries **lesson content** (seeded lessons for catalog courses) and **points** (15 for assignments, 10 quizzes, 25 exams, 20 projects). Students click **Mark done** to earn the points, and each course shows a letter grade (A ≥ 90%, B ≥ 80%, C ≥ 70%, D ≥ 60%, else F) computed from earned ÷ total points.
- **Grades** — an overall average card plus per-course grade cards on `/grades`, and a per-course gradebook table (score, total, progress) under the course's Grades tab.
- **Calendar** — a month grid of every due date color-coded by course with an Upcoming sidebar.
- **Inbox** — course messages from your instructor with unread badges in the sidebar.

## Getting Started

```bash
npm install
npx prisma generate
npx prisma db push
node scripts/seed-catalog.mjs   # seed study categories, course units, assignment templates
npm run seed                    # demo user, assignments, messages, announcements, discussions
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
    courses/[id]/       # GET, PATCH, DELETE (session-scoped, cascades portal content)
    courses/[id]/announcements/ # GET, POST, DELETE announcements
    courses/[id]/discussions/   # GET, POST discussion topics
    discussions/[id]/   # GET, PATCH, DELETE a topic (with its replies)
    discussions/[id]/entries/   # POST a reply; /entries/[entryId] DELETE
    assignments/        # GET (optional ?courseId=), POST (session-scoped)
    assignments/[id]/   # PATCH, DELETE (session-scoped)
    profile/            # GET, PATCH current user profile
  components/
    Sidebar.tsx         # global portal nav + My Courses + sign-out
    course/CourseShell.tsx # course breadcrumb + context tab navigation
    dashboard/
      StudyStats.tsx
      QuickActions.tsx
      UpcomingDeadlines.tsx
      TodoList.tsx
  auth/
    login/ register/ forgot-password/
  onboarding/page.tsx  # category + course unit selection
  courses/page.tsx     # catalog management (add/remove courses)
  courses/[courseId]/  # course home, announcements, modules, assignments,
                       # discussions (+ topic detail), grades
  calendar/page.tsx    # month grid of due dates
  grades/page.tsx      # overall + per-course grades
  assignments/page.tsx
  todos/page.tsx       # scratchpad to-dos (sidebar link)
  page.tsx            # Dashboard — courses + Coming Up rail
prisma/
  schema.prisma       # User, Course, Assignment, StudyCategory, CourseUnit,
                      # AssignmentTemplate, Announcement, DiscussionTopic, DiscussionEntry
lib/
  auth.ts             # NextAuth config (session, providers)
  password.ts         # scrypt hashing
  db.ts               # Prisma client singleton
  course-image.ts     # course card images by code prefix
  grade.ts            # letter-grade math shared by cards, grades pages
app/components/
  CoursePickerModal.tsx # add a course by selecting from the catalog
scripts/
  seed-catalog.mjs    # seed the study catalog (categories, units, templates)
  seed-portal.mjs     # seed announcements + threaded discussions per course
proxy.ts              # route guard (redirects signed-out users)
```

## Data Model

**User** — id, name, email, password, major, year, studyGoal, avatarUrl, categoryId, createdAt, updatedAt

**StudyCategory** — id, name (unique), description, color; has many course units and users

**CourseUnit** — id, code (unique), name, credits, description, color, categoryId; has many assignment templates

**AssignmentTemplate** — id, title, description, dueInDays, type, priority, courseUnitId

**Course** — id, name, code, term, notes, color, userId, createdAt, updatedAt

**Assignment** — id, title, description, content (lesson material), points, dueDate, completed, type, priority, courseId, userId, createdAt, updatedAt

**Announcement** — id, title, message, authorName, courseId, createdAt, updatedAt

**DiscussionTopic** — id, title, message, authorName, pinned, locked, courseId, createdAt, updatedAt

**DiscussionEntry** — id, message, authorName, topicId, parentId (nested replies), createdAt, updatedAt

One user has many courses. One course has many assignments, announcements, and discussion topics. A topic has many entries; entries can reply to other entries via parentId.

## Team

- Jesus Eduardo Pinta Molina
- Kevin Mbemba Kiyindou
- Kalungi Isaac
