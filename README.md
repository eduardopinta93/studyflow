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
- **Admin console** — a role-gated `/admin` area (redirected away for students) with an overview of platform stats, user management (search, promote/demote to admin, message, delete with cascading cleanup), course management, and cross-course announcements.
- **Password recovery** — forgot/reset password flow with single-use, 30-minute tokens; a "Change password" section in Settings lets signed-in users rotate their password without email.

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

## Deployment (Vercel)

```bash
npm i -g vercel
vercel link                 # attach the folder to the Vercel project
vercel --prod               # build + deploy (build runs `prisma generate && next build`)
```

Set these environment variables on the Vercel project (Settings → Environment Variables → Production), then redeploy:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MongoDB connection string (Prisma) |
| `AUTH_SECRET` | NextAuth session/CSRF secret |
| `AUTH_URL` | Canonical app URL, e.g. `https://teamproject-delta-two.vercel.app` |
| `ADMIN_EMAIL` | Email(s) granted the `ADMIN` role on sign-in (comma-separated) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Optional GitHub OAuth (callback URL must be registered in the GitHub app) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | Optional: enables real reset-email delivery |

Notes:

- If Deployment Protection is enabled on the Vercel project, turn it off (or share the protection bypass) so the public URL resolves without a login wall.
- The database schema is MongoDB: use `npx prisma db push` (never `prisma migrate`).
- The admin account is the `ADMIN_EMAIL` address; sign in from `/auth/login` after deploying.

## API Routes

All routes require an authenticated session unless noted; responses are JSON. Admin routes (`/api/admin/*`) additionally require the session user's role to be `ADMIN` (403 otherwise).

### Auth

| Method & path | Description |
| --- | --- |
| `POST /api/auth/register` | Create an account (name, email, password) |
| `POST /api/auth/forgot-password` | Issue a reset token and email the link (always returns success to avoid account enumeration) |
| `POST /api/auth/reset-password` | Consume token + new password (single-use, 30-min expiry) |
| `GET/POST /api/auth/[...nextauth]` | NextAuth sign-in/out/session handlers |

### Catalog & enrollment

| Method & path | Description |
| --- | --- |
| `GET /api/categories` | Study categories and course-unit catalog |
| `POST /api/enrollment` | Pick category + units (8-credit cap), provisioning courses and assignments |

### Courses

| Method & path | Description |
| --- | --- |
| `GET /api/courses` | List the signed-in user's courses |
| `POST /api/courses` | Add a unit from the catalog as a course (enforces 8-credit cap) |
| `GET/PATCH/DELETE /api/courses/[courseId]` | Read / update / delete one course (DELETE cascades announcements, discussions, assignments) |
| `GET/POST /api/courses/[courseId]/announcements` | List / post announcements |
| `DELETE /api/courses/[courseId]/announcements?...` | (see discussions below) |
| `GET/POST /api/courses/[courseId]/discussions` | List / create discussion topics |

### Assignments

| Method & path | Description |
| --- | --- |
| `GET /api/assignments?courseId=` | List assignments (optional course filter) |
| `POST /api/assignments` | Create an assignment |
| `PATCH/DELETE /api/assignments/[assignmentId]` | Update (e.g. mark done) / delete |

### Discussions

| Method & path | Description |
| --- | --- |
| `GET/PATCH/DELETE /api/discussions/[topicId]` | Read / edit / delete a topic (DELETE removes its replies) |
| `POST /api/discussions/[topicId]/entries` | Post a reply |
| `DELETE /api/discussions/[topicId]/entries/[entryId]` | Delete a reply |

### Profile, users & messages

| Method & path | Description |
| --- | --- |
| `GET/PATCH /api/profile` | Read / update the signed-in user's profile |
| `POST /api/profile/password` | Change password (verifies current password, invalidates reset tokens) |
| `GET /api/users` | List users (for addressing messages) |
| `GET/POST /api/messages` | Inbox list / send a message |
| `PATCH/DELETE /api/messages/[messageId]` | Mark read/unread / delete |

### Admin (`ADMIN` role only)

| Method & path | Description |
| --- | --- |
| `GET /api/admin/stats` | Platform totals, growth, recent activity |
| `GET /api/admin/users?q=&role=` | Search users |
| `PATCH /api/admin/users/[userId]` | Change role (self-demotion blocked) |
| `DELETE /api/admin/users/[userId]` | Delete user with cascading cleanup of their data |
| `GET /api/admin/courses?q=&limit=` | All courses across users (with owners) |
| `DELETE /api/admin/courses/[courseId]` | Delete a course and its content |
| `GET/POST /api/admin/announcements?q=` | List all / post to any course |
| `DELETE /api/admin/announcements/[announcementId]` | Remove an announcement |

## Known Issues & Opportunities

- **Password-reset emails need an SMTP provider.** The full reset flow works (token issued, link consumed, password rotated), but no `SMTP_*` variables are configured yet, so in production the email is logged server-side rather than delivered. Setting SMTP env vars activates real delivery; locally the reset link is shown on-screen for testing.
- **No Git integration on Vercel** — production is deployed manually with `vercel --prod`. Connecting the repo (`vercel git connect`) would enable preview deployments per PR.
- **GitHub OAuth callback** must include the production URL (`/api/auth/callback/github`) in the GitHub app settings before GitHub sign-in works in production.
- **No automated test suite** — flows were verified with end-to-end scripts against a local server; a Vitest/Playwright suite would be the natural next step.
- **Lighthouse/accessibility pass** not yet recorded; keyboard navigation and focus states could be audited page by page.

## Product Demo Summary

StudyFlow solves the everyday coordination problem of students juggling multiple courses: deadlines, announcements, materials, and grades live in different places, and it is easy to lose track of what is due next. It is aimed at college/university students (and the instructors or administrators who support them), giving each student a single portal where they register for course units under an 8-credit cap, receive provisioned assignments with lesson content, track grades computed from real points, discuss topics in threaded course discussions, and message other users through an inbox.

The most important user flow is the study loop: a student signs up, completes onboarding by choosing a category and up to 8 credits of course units, and immediately lands on a dashboard populated with their courses, upcoming deadlines, and progress. From there they open a course shell (announcements → modules → assignments → discussions → grades), complete assignments to earn points, and watch letter grades update — while a calendar, to-do list, and inbox keep cross-course work visible. Administrators get a parallel flow: a role-gated console where they can search users, promote admins, message people, moderate announcements across any course, and clean up data with cascading deletes.

The app's value is that it is a genuine full-stack system rather than a static demo: every view is driven by an API route backed by MongoDB, authentication protects every route, and roles split the experience into student and admin surfaces — so the same project serves both day-to-day studying and the operational side of running a study group or cohort.

## Project Structure

```
app/
  api/
    auth/[...nextauth]/ # NextAuth handler
    auth/register/      # POST sign-up
    auth/forgot-password/ # POST issue reset token (email via SMTP if configured)
    auth/reset-password/  # POST consume token, set new password
    admin/stats/        # GET platform totals (ADMIN)
    admin/users/        # GET search; [userId] PATCH role, DELETE cascade (ADMIN)
    admin/courses/      # GET all courses; [courseId] DELETE cascade (ADMIN)
    admin/announcements/ # GET/POST any course; [announcementId] DELETE (ADMIN)
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
    messages/           # GET, POST; [messageId] PATCH read-state, DELETE
    profile/            # GET, PATCH current user profile
    users/              # GET user list (message addressing)
  components/
    Sidebar.tsx         # global portal nav + My Courses + sign-out (admin-aware)
    Avatar.tsx, ThemeToggle.tsx, QuickAddFab.tsx
    course/CourseShell.tsx # course breadcrumb + context tab navigation
    dashboard/
      StudyStats.tsx
      QuickActions.tsx
      UpcomingDeadlines.tsx
      TodoList.tsx
  admin/                # ADMIN-only console (server-side guarded layout)
    layout.tsx AdminTabs.tsx page.tsx # overview
    users/ courses/ announcements/    # management views
  auth/
    login/ register/ forgot-password/ reset-password/
  onboarding/page.tsx  # category + course unit selection
  inbox/page.tsx       # messages (+ ?compose=1&to= prefill)
  settings/page.tsx    # theme, password change
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
                      # AssignmentTemplate, Announcement, DiscussionTopic,
                      # DiscussionEntry, Message, PasswordResetToken
lib/
  auth.ts             # NextAuth config (session, providers, ADMIN_EMAIL role)
  admin.ts            # requireAdmin, cascade deletes, owner attachment
  password.ts         # scrypt hashing
  reset-token.ts      # hashed, single-use reset tokens (30-min TTL)
  mailer.ts           # SMTP delivery for reset links (logs when unconfigured)
  db.ts               # Prisma client singleton
  course-image.ts     # course card images by code prefix
  grade.ts            # letter-grade math shared by cards, grades pages
app/components/
  CoursePickerModal.tsx # add a course by selecting from the catalog
scripts/
  seed-catalog.mjs    # seed the study catalog (categories, units, templates)
  seed-portal.mjs     # seed announcements + threaded discussions per course
proxy.ts              # route guard: auth redirects + admin-only /admin
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

## Team members | collaborators

- Jesus Eduardo Pinta Molina
- Kevin Mbemba Kiyindou
- Kalungi Isaac
