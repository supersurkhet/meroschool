# MeroSchool — Testing Checklist

## Auth
- [ ] Sign up flow — new user can create account via WorkOS AuthKit
- [ ] Sign in flow — existing user can log in, gets redirected to role-based dashboard
- [ ] Sign out — session clears, redirects to landing page
- [ ] Protected route — unauthenticated user gets redirected to /auth/login
- [ ] Role routing — admin → desktop, teacher → /dashboard/teacher, student → mobile, parent → mobile

## Admin Dashboard (Desktop)
- [ ] Sidebar shows all nav items: Dashboard, Schools, Classes, Teachers, Students, Salary, Reports
- [ ] Dashboard cards show correct counts (students, teachers, classes)
- [ ] Today's attendance % card is accurate
- [ ] School hierarchy tree loads: school → classes → sections → students

## Teacher Dashboard (Web)
- [ ] Welcome card shows teacher name and today's date
- [ ] Quick action buttons navigate to correct pages
- [ ] My Classes shows subjects assigned to this teacher
- [ ] Recent activity feed shows latest events

## Student Dashboard (Mobile)
- [ ] Greeting shows student name
- [ ] Attendance % ring chart displays correctly
- [ ] Upcoming tests list with dates
- [ ] Bottom tab navigation works (Home, Materials, Tests, Assignments, Profile)

## Parent Dashboard (Mobile)
- [ ] Child selector works for parents with multiple children
- [ ] Attendance % shows correct this-month value
- [ ] Recent test results display with scores
- [ ] Notification badge shows unread count

## Attendance
- [ ] Teacher: section selector shows assigned sections
- [ ] Teacher: date picker defaults to today
- [ ] Teacher: can toggle present/absent/late per student
- [ ] Teacher: "Mark All Present" sets all to present
- [ ] Teacher: submit saves and shows success toast
- [ ] Student: QR scan opens camera
- [ ] Student: scanning valid QR marks attendance, shows success
- [ ] Student: scanning invalid/expired QR shows error
- [ ] Parent: calendar view shows color-coded attendance days
- [ ] Admin: attendance report table filters by date range
- [ ] Admin: students below 75% highlighted in red

## Study Materials
- [ ] Teacher: can browse subject → module → topic hierarchy
- [ ] Teacher: "Add Material" dialog opens with type selector
- [ ] Teacher: uploading PDF saves to Convex storage
- [ ] Student: subject list loads with all enrolled subjects
- [ ] Student: tapping through hierarchy reaches materials
- [ ] Student: video plays inline
- [ ] Student: PDF opens in viewer

## MCQ Tests
- [ ] Teacher: create test form validates required fields
- [ ] Teacher: question builder adds question with 4 options
- [ ] Teacher: publish toggle makes test available to students
- [ ] Student: available tests list shows published tests only
- [ ] Student: test start screen shows duration and total marks
- [ ] Student: timer counts down during test
- [ ] Student: can select one option per question
- [ ] Student: submit shows score and correct answers
- [ ] Student: cannot retake same test
- [ ] Parent: child's test results show in results tab

## Assignments
- [ ] Teacher: create assignment with title, description, due date
- [ ] Teacher: view submissions list for an assignment
- [ ] Teacher: can grade submission with score and feedback
- [ ] Student: pending assignments show with due dates
- [ ] Student: can submit text response + file
- [ ] Student: overdue assignments highlighted

## Progress
- [ ] Teacher: section progress table shows all students
- [ ] Teacher: clicking student shows detailed progress
- [ ] Parent: progress card shows attendance %, test avg, assignment completion
- [ ] Admin: school-wide analytics load

## Salary (Desktop)
- [ ] Admin: teacher list with salary records
- [ ] Admin: create salary record with month/year/amount
- [ ] Admin: mark as paid updates status
- [ ] Admin: export salary to CSV

## CSV Import/Export (Desktop)
- [ ] Admin: import students from CSV with preview
- [ ] Admin: validation errors shown with row numbers
- [ ] Admin: export student list to CSV
- [ ] Admin: export attendance to CSV

## Notifications
- [ ] Parent: notification list shows with unread indicator
- [ ] Parent: tap notification marks as read
- [ ] Web: notification bell shows unread count badge
- [ ] Web: dropdown shows recent notifications

## i18n
- [ ] Language switcher toggles between English and Nepali
- [ ] All UI labels update when language changes
- [ ] Language preference persists across sessions

## Theme
- [ ] Dark mode toggle switches theme
- [ ] All components render correctly in dark mode
- [ ] Theme preference persists across sessions

## Schema & Auth Alignment (Phase 1.1 + 1.5)
- [ ] `users` table exists with workosUserId, name, email, role, avatarUrl, isActive, schoolId fields
- [ ] `users` table has `by_workos_id` and `by_role` indexes
- [ ] `auth.ts` currentUser/upsertUser/getUsersByRole/deactivateUser functions work against `users` table
- [ ] `attendance` table uses flat individual records (studentId, sectionId, date, status, markedBy) not embedded arrays
- [ ] `attendance` table has `by_section`, `by_student`, and `by_section_date` indexes
- [ ] `attendance.status` union includes "excused" in addition to present/absent/late
- [ ] `tests` table uses `isPublished: boolean` and `createdBy: id("users")` instead of status union
- [ ] `tests` table uses `durationMinutes` field name (not `duration`)
- [ ] `testQuestions` table has `order` and `correctOptionIndex` fields
- [ ] `testAttempts` table has `totalMarks` and `submittedAt` fields
- [ ] `students` table has `parentIds: optional(array(id("parents")))` and `userId: id("users")`
- [ ] `students` table uses `by_user` index (not `by_userId`)
- [ ] `teachers` table has `userId: id("users")`, `employeeId`, `department` fields and `by_user` index
- [ ] `parents` table has `userId: id("users")`, `occupation`, `address` fields and `by_user` index
- [ ] `assignments` table has `totalMarks: number` field
- [ ] `submissions.grade` is `optional(number)` not `optional(string)`
- [ ] `submissions` table has `fileId`, `textContent`, `gradedBy` fields
- [ ] `notifications` table uses `userId: id("users")` and `isRead: boolean` (not `recipientId`/`read`)
- [ ] `notifications` table has `relatedId: optional(string)` field
- [ ] `notifications` indexes are `by_user` and `by_user_unread`
- [ ] `salaryRecords` table uses `month: string` (YYYY-MM) with `baseSalary`, `deductions`, `bonuses`, `netSalary` fields
- [ ] `salaryRecords` has `by_teacher_month` and `by_month` indexes
- [ ] `materials` table supports "document" type and has `fileId: optional(id("_storage"))` and `uploadedBy: id("users")`
- [ ] `subjects` table has optional `code` and `teacherId`, no `schoolId`
- [ ] `auth.config.ts` uses `WORKOS_CLIENT_ID` env var in issuer domain URL
- [ ] `npx convex dev` starts without schema validation errors

## Auth Integration — Web (Phase 1.2)
- [ ] GET /auth/login redirects to WorkOS AuthKit authorization URL
- [ ] GET /auth/callback exchanges code for session and sets httpOnly cookie
- [ ] GET /auth/callback redirects to role-based dashboard path
- [ ] GET /auth/logout clears session cookie and redirects to /
- [ ] hooks.server.ts decodes JWT from session cookie into event.locals.user
- [ ] Unauthenticated access to /dashboard/* redirects to /auth/login
- [ ] Dashboard layout shows sidebar with nav links and user name in topbar
- [ ] Dashboard layout supports mobile sidebar toggle

## Teacher Dashboard — Web (Phase 2.2)
- [ ] Welcome card displays teacher name from session
- [ ] Welcome card shows today's date formatted
- [ ] Quick action grid renders 4 cards: Attendance, Test, Material, Assignment
- [ ] Quick action cards link to correct placeholder routes
- [ ] My Classes section shows sample class cards with subject, section, student count
- [ ] Layout is responsive: 2 cols on mobile, 4 cols on desktop for quick actions
- [ ] Dark mode renders correctly on teacher dashboard
- [ ] i18n keys work for both English and Nepali on teacher dashboard

## Auth Integration — Mobile (Phase 1.3)
- [ ] AuthProvider loads stored user from SecureStore on app launch
- [ ] Login screen renders with MeroSchool branding, email/password fields, and Sign In button
- [ ] Mock login creates user and stores token in expo-secure-store
- [ ] Logout clears SecureStore token and AsyncStorage user data
- [ ] Role-based routing: student email -> (student) tabs, teacher -> (teacher), parent -> (parent)
- [ ] Unauthenticated user redirected to (auth)/login
- [ ] ConvexProviderWrapper wraps app with ConvexReactClient
- [ ] Root layout uses AuthProvider and ConvexProviderWrapper

## Student Dashboard — Mobile (Phase 2.3)
- [ ] Greeting card shows "Namaste, {name}!" with avatar placeholder initial
- [ ] Circular attendance progress indicator shows percentage (94%)
- [ ] Stats row displays attendance rate and upcoming test count
- [ ] Upcoming Tests section lists test cards with subject, chapter, date, time
- [ ] Pending Assignments section shows assignments with title, subject, due date, status badge
- [ ] Recent test scores show subject, score/total, date, and letter grade
- [ ] Bottom tabs: Home, Materials, Tests, Assignments, Profile all navigate correctly
- [ ] QR scan button in header links to /qr-scan
- [ ] Dark mode renders correctly on student dashboard

## Parent Dashboard — Mobile (Phase 2.4)
- [ ] Child selector shows when parent has multiple children
- [ ] Tapping child selector switches displayed data (attendance, scores, results)
- [ ] Child info card shows selected child name, class, roll number
- [ ] Attendance and average score stat cards display correct values per child
- [ ] Quick links row: Attendance, Results, Notifications with navigation
- [ ] Notification badge shows unread count on bell icon in header
- [ ] Recent test results cards show test name, score, date with color-coded percentage
- [ ] Recent activity feed shows attendance, test, assignment, and absence events
- [ ] Bottom tabs: Home, Attendance, Results, Notifications all navigate correctly
- [ ] Dark mode renders correctly on parent dashboard

## Auth + Admin Guard — Desktop (Phase 1.4)
- [ ] AuthUser type supports admin, teacher, student, parent roles
- [ ] isAdmin() returns true only for role === 'admin'
- [ ] Non-admin authenticated users see "Access Denied" screen with sign-out button
- [ ] Unauthenticated users redirect to /auth login page

## Admin Dashboard + School Management — Desktop (Phase 2.1)
- [ ] Sidebar shows Schools and Classes & Sections nav items with correct icons
- [ ] Schools page lists sample schools in a table with name, address, phone, email
- [ ] Add School form opens inline with name, address, phone, email fields
- [ ] Edit school populates form with existing values and saves changes
- [ ] Delete school removes it from the list
- [ ] School search filters by name and address
- [ ] Classes page lists classes with expand/collapse for sections
- [ ] Add Class form creates new class with name and school
- [ ] Add Section form (inline) creates section with name and capacity
- [ ] Section cards show student count / capacity with fill bar
- [ ] Delete class and delete section work correctly
- [ ] i18n keys for Schools and Classes & Sections exist in English and Nepali
- [ ] Dark mode renders correctly on schools and classes pages
