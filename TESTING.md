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

## Teachers Page (Desktop)
- [ ] Admin: teacher list displays in card grid with avatar, name, email, department, subjects, classes
- [ ] Admin: search filters teachers by name, email, employee ID, department
- [ ] Admin: "Add Teacher" form opens inline with name, email, phone, employee ID, department, join date
- [ ] Admin: subject and class multi-select toggles work in teacher form
- [ ] Admin: edit teacher populates form with existing data
- [ ] Admin: delete teacher removes from list
- [ ] Admin: department badges show color-coded labels
- [ ] Admin: empty state shows when no teachers match search

## Students Page (Desktop)
- [ ] Admin: student list table shows roll number, name, email, class, section, DOB, actions
- [ ] Admin: class and section filter dropdowns filter the table
- [ ] Admin: search filters by name, email, roll number
- [ ] Admin: sortable columns (roll number, name, DOB) toggle asc/desc
- [ ] Admin: "Add Student" form validates required fields with error messages
- [ ] Admin: edit student populates form with existing data
- [ ] Admin: delete student removes from list with confirmation
- [ ] Admin: "Import CSV" button opens inline CSV import panel
- [ ] Admin: table footer shows filtered count and sort info

## Salary (Desktop)
- [ ] Admin: salary table shows employee ID, name, department, base, deductions, bonuses, net, status
- [ ] Admin: summary cards show total payroll, paid amount, pending amount, average salary
- [ ] Admin: month selector filters records by selected month
- [ ] Admin: add salary record form with employee ID, name, department, base, deductions, bonuses, notes
- [ ] Admin: edit salary record populates form with existing values
- [ ] Admin: "Mark as Paid" button updates pending record to paid status
- [ ] Admin: "Pay All" marks all pending records as paid
- [ ] Admin: expandable rows show notes and net calculation breakdown

## CSV Import/Export (Desktop)
- [ ] Admin: import page shows drag-and-drop zone for CSV upload
- [ ] Admin: CSV column hints show expected format
- [ ] Admin: example CSV shown in expandable details
- [ ] Admin: file drop/browse triggers CSV parsing with preview table
- [ ] Admin: validation errors shown with row numbers
- [ ] Admin: import button creates student records from valid rows
- [ ] Admin: export student list to CSV
- [ ] Admin: export attendance to CSV

## QR Codes Page (Desktop)
- [ ] Admin: grid view shows all classes with QR thumbnails
- [ ] Admin: clicking a class opens detail view with section tabs
- [ ] Admin: QR code generates for selected class and section
- [ ] Admin: section selector switches QR code in detail view
- [ ] Admin: download button saves QR as PNG
- [ ] Admin: print button opens print dialog
- [ ] Admin: "Download All" generates QR codes for all class/section combinations
- [ ] Admin: back navigation returns to grid view

## Reports Page (Desktop)
- [ ] Admin: tab bar switches between Attendance, Exam Results, Class Performance
- [ ] Admin: attendance tab shows summary cards (total, present %, absent %, late %)
- [ ] Admin: attendance distribution stacked bar visualizes present/late/absent
- [ ] Admin: per-student attendance table with percentage badges
- [ ] Admin: attendance filters by date range and class
- [ ] Admin: exam results tab shows average, highest, lowest, pass rate cards
- [ ] Admin: grade distribution bar chart shows A+ through F
- [ ] Admin: results table with rank, name, marks, percentage, grade
- [ ] Admin: class performance tab shows clickable class cards with avg score bars
- [ ] Admin: clicking class card shows subject-wise performance breakdown
- [ ] Admin: legend explains color coding for score ranges

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

## Teacher Attendance Page (Web)
- [ ] Section dropdown shows available sections
- [ ] Date picker defaults to today's date
- [ ] Student list table renders with Roll#, Name, Status columns
- [ ] Present button turns green when selected
- [ ] Absent button turns red when selected
- [ ] Late button turns yellow when selected
- [ ] "Mark All Present" sets all students to present
- [ ] Summary bar shows correct present/absent/late counts
- [ ] Submit button shows loading state and success badge
- [ ] Dark mode renders correctly on attendance page

## Teacher Test Management (Web)
- [ ] Create test form has title, subject, duration, total marks fields
- [ ] Question builder shows text area and 4 option inputs with radio buttons
- [ ] Add Question appends to questions list below
- [ ] Edit button populates question form with existing data
- [ ] Remove button deletes question from list
- [ ] Correct answer highlighted in green in questions list
- [ ] Create & Publish adds test to existing tests table
- [ ] Existing tests table shows title, questions count, status badge, date
- [ ] View Results link navigates to test results page
- [ ] Dark mode renders correctly on tests page

## Teacher Test Results (Web)
- [ ] Stats cards show average, highest, lowest, pass rate
- [ ] Results table shows student name, score, percentage, time taken
- [ ] Percentage color-coded: green >= 80%, yellow >= 60%, red < 60%
- [ ] Pass/Fail badge shows correctly
- [ ] Export CSV downloads a valid CSV file
- [ ] Back to Tests link navigates correctly
- [ ] Dark mode renders correctly on results page

## Teacher Materials Page (Web)
- [ ] Subject/module/topic selectors filter content correctly
- [ ] Breadcrumb shows current subject > module > topic
- [ ] Materials list shows title, type badge, description, URL
- [ ] Type badges are color-coded (video=blue, pdf=red, link=green, document=purple)
- [ ] Add Material form creates new material under selected topic
- [ ] Delete button removes material from list
- [ ] Upload area placeholder is styled and visible
- [ ] Dark mode renders correctly on materials page

## Teacher Assignments Page (Web)
- [ ] Create assignment form has title, description, subject, section, due date, total marks
- [ ] Create Assignment button adds to assignments list
- [ ] Assignments list shows title, subject, section, due date, submissions count
- [ ] Click to expand shows submissions table
- [ ] Grade input accepts numeric value
- [ ] Feedback input accepts text
- [ ] Save button updates grade and feedback
- [ ] Active/Closed badge shows correctly
- [ ] Dark mode renders correctly on assignments page

## Landing Page Polish (Web)
- [ ] Hero heading shows "Digital School Management" with gradient text
- [ ] Dashboard mockup has improved chart and activity feed sections
- [ ] "Built for Nepal" section shows flag, 3 feature items
- [ ] Nepali language support item renders
- [ ] Surkhet mention renders
- [ ] Offline mobile mention renders
- [ ] All existing sections (features, CTA, trusted by) still render

## Notification Bell (Web)
- [ ] Bell icon visible in dashboard top bar
- [ ] Red badge shows unread count (3)
- [ ] Click bell opens dropdown with notification list
- [ ] Notifications show text and time
- [ ] "Mark all as read" clears unread count and closes dropdown
- [ ] Bell not visible on non-dashboard pages

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

## Phase 2 — Convex Backend Enhancements

### Attendance Enhancements
- [ ] `markSingle` mutation marks one student's attendance for a date
- [ ] `markSingle` prevents duplicate by updating existing record for same student+date
- [ ] `markSingle` sends `attendance_alert` notification to each parent when status is absent
- [ ] `markBulk` sends `attendance_alert` notification to parents for absent students
- [ ] `getStudentAttendanceRange` returns records between startDate and endDate
- [ ] `getSectionAttendanceHistory` returns daily present/absent/late/excused counts for a month

### MCQ Test Engine Enhancements
- [ ] `closeTest` sets isPublished=false on a test
- [ ] `getTestStats` returns totalAttempts, avgScore, highestScore, lowestScore, passRate (40% threshold)
- [ ] `getTestStats` returns zeroes when no attempts exist
- [ ] `getStudentTestHistory` returns all attempts with test title and subject name
- [ ] `submitAttempt` reads parentIds from student and sends `test_result` notification to each parent

### Material Enhancements
- [ ] `generateUploadUrl` returns a Convex storage upload URL
- [ ] `getDownloadUrl` returns URL for a given storageId
- [ ] `reorderMaterials` accepts array of {id, order} and updates each material's order
- [ ] `deleteMaterial` deletes material document and its storage file if present
- [ ] Schema includes optional `order` field on materials table

### Assignment Lifecycle
- [ ] `getAssignmentWithSubmissions` returns assignment + all submissions with student name and rollNumber
- [ ] `getStudentAssignments` returns assignments for student's section with submission status (not submitted/submitted/graded)
- [ ] `bulkGrade` updates multiple submissions with grade/feedback and sends `assignment_graded` notification
- [ ] `grade` mutation sends notification with type `assignment_graded`

### Salary Enhancements
- [ ] `getSalaryReport` returns all records for a month with teacher names and totals (totalBase, totalDeductions, totalBonuses, totalNet)
- [ ] `getTeacherSalaryHistory` returns records sorted by month descending
- [ ] `bulkCreateSalary` creates salary records for all active teachers who don't have one for the given month

### CSV Helpers
- [ ] `bulkEnrollStudents` creates user + student records for each entry
- [ ] `bulkCreateTeachers` creates user + teacher records for each entry
- [ ] `exportStudents` returns all students for a school with class name, section name, email
- [ ] `exportAttendance` returns attendance records for a section and date range with student names

## Phase 2 — Mobile Screens (Expo)

### Teacher Attendance (Mobile)
- [ ] Section selector shows all assigned sections as horizontal chips
- [ ] Date navigator shows today's date with < > arrows
- [ ] Tapping "Today" label resets to current date
- [ ] Student list renders with roll number, name, and P/A/L toggle buttons
- [ ] Present button highlights green when selected
- [ ] Absent button highlights red when selected
- [ ] Late button highlights yellow when selected
- [ ] Tapping same status again deselects it (toggles to null)
- [ ] "Mark All" button sets all students to present
- [ ] Summary bar shows present/total count and absent/late counts
- [ ] Submit button is disabled when no students are marked
- [ ] Submit shows confirmation Alert with attendance summary
- [ ] Submit shows success Alert after confirmation
- [ ] FlatList renders 20 students with smooth scrolling

### QR Scanner (Mobile)
- [ ] Camera permission request screen renders when permission not granted
- [ ] Camera view opens with QR scanning overlay and corner accents
- [ ] Valid QR code triggers success screen with green checkmark animation
- [ ] Success screen shows "Attendance Marked!" with section and time
- [ ] Expired QR shows "QR Expired" error with retry button
- [ ] Wrong section QR shows "Wrong Section" error with section mismatch info
- [ ] Invalid QR format shows "Invalid QR" error
- [ ] "Try Again" resets scanner to scanning state
- [ ] "Go Back" navigates back to previous screen
- [ ] Back arrow in camera overlay navigates back

### Student Materials (Mobile)
- [ ] Subject grid renders 6 subjects in 2-column layout with icons
- [ ] Tapping subject navigates to modules list
- [ ] Modules list shows topic count and total materials count
- [ ] Tapping module navigates to topics list
- [ ] Topics list shows material type emojis preview
- [ ] Tapping topic navigates to materials list
- [ ] Material cards show type icon, title, detail, and type badge
- [ ] Tapping material opens URL via Linking.openURL
- [ ] Back button in header navigates up one level
- [ ] Breadcrumb subtitle updates at each level

### Student Test Taking (Mobile)
- [ ] "Available Tests" tab lists tests with subject, title, duration, marks
- [ ] "Past Results" tab lists completed tests with color-coded percentage
- [ ] Tapping available test shows test info screen with details
- [ ] Test info shows duration, question count, total marks
- [ ] "Start Test" begins test with countdown timer
- [ ] Timer shows mm:ss format and counts down every second
- [ ] Timer turns red when under 60 seconds remaining
- [ ] Options A/B/C/D rendered with radio-style selection
- [ ] Selected option highlighted with primary color
- [ ] Question navigation dots at bottom: green=answered, gray=unanswered, blue=current
- [ ] Previous/Next buttons navigate between questions
- [ ] Submit button shows answered/total count
- [ ] Submit confirmation Alert warns about unanswered questions
- [ ] Results screen shows score circle with color coding
- [ ] Per-question review shows correct/incorrect with explanations
- [ ] Tapping past result shows detail view with question review
- [ ] Percentage color: green >= 70%, yellow 40-70%, red < 40%

### Student Assignments (Mobile)
- [ ] "Pending" tab shows assignment cards with subject badge and due status
- [ ] Due status color: green (> 3 days), yellow (1-3 days), red (overdue/today)
- [ ] Tapping assignment opens detail view with description
- [ ] Detail view has text input area for submission
- [ ] "Attach File" button shows placeholder alert
- [ ] Submit validates non-empty text input
- [ ] Submit confirmation shows success alert
- [ ] "Completed" tab shows graded assignments with grade badge and feedback
- [ ] Empty states render when no items in either tab

### Parent Attendance Calendar (Mobile)
- [ ] Month header shows "March 2026" with < > navigation arrows
- [ ] Calendar grid renders 7-column layout with weekday headers
- [ ] Present days are green, absent days are red, late days are yellow
- [ ] Weekend days are gray/muted
- [ ] Legend row explains color meanings
- [ ] Monthly summary card shows present, absent, late counts
- [ ] Attendance percentage calculated correctly
- [ ] Progress bar shows proportional present/late/absent segments
- [ ] Navigating months updates calendar and summary data

### Parent Results (Mobile)
- [ ] Summary cards show average score and total tests taken
- [ ] Best subject card identifies highest-average subject
- [ ] Test results list shows color-coded percentage circles
- [ ] Green >= 70%, yellow 40-70%, red < 40% percentage coloring
- [ ] Tapping result opens detail view with per-question review
- [ ] Detail view shows correct (checkmark) and incorrect (X) indicators
- [ ] Incorrect answers show both user answer and correct answer

### Parent Notifications (Mobile)
- [ ] FlatList renders notification items with type-specific icons and colors
- [ ] attendance_alert type shows red alert icon
- [ ] test_result type shows blue document icon
- [ ] assignment_graded type shows green checkmark icon
- [ ] general type shows gray info icon
- [ ] Unread notifications have bold title and colored left border
- [ ] Unread dot indicator shows on unread items
- [ ] Tapping notification marks it as read
- [ ] "Mark as Read" button in header marks all as read
- [ ] Unread count updates in subtitle after marking read
- [ ] Pull to refresh triggers RefreshControl
- [ ] Empty state shows "No Notifications" when list is empty

## Phase 3 — Mobile Wiring (Convex, i18n, Error Boundaries, Loading, Dark Mode)

### Convex Integration (Mobile)
- [ ] ConvexReactClient uses EXPO_PUBLIC_CONVEX_URL env var
- [ ] ConvexProviderWrapper wraps app in root _layout.tsx
- [ ] lib/convex/hooks.ts re-exports useQuery and useMutation from convex/react
- [ ] Student dashboard has commented Convex query patterns for attendance, tests, assignments
- [ ] Convex queries can be uncommented and work when backend is running

### i18n System (Mobile)
- [ ] lib/i18n/en.ts has comprehensive English strings for all roles (common, auth, student, teacher, parent, qr)
- [ ] lib/i18n/ne.ts has matching Nepali translations for all keys
- [ ] lib/i18n/translations/en.ts and ne.ts mirror root translations with additional keys
- [ ] lib/i18n/context.tsx provides I18nProvider with useI18n hook
- [ ] Language switcher component toggles between "EN | ने"
- [ ] Language preference persists in AsyncStorage across app restarts
- [ ] All screens use useTranslation() for label text
- [ ] Switching language updates all visible labels immediately

### Error Boundaries (Mobile)
- [ ] ErrorBoundary class component catches render errors in subtree
- [ ] ErrorScreen shows warning icon, error message, and retry button
- [ ] Student tab group _layout.tsx wrapped with ErrorBoundary
- [ ] Teacher tab group _layout.tsx wrapped with ErrorBoundary
- [ ] Parent tab group _layout.tsx wrapped with ErrorBoundary
- [ ] Retry button in ErrorScreen resets error state and re-renders children
- [ ] Error info logged to console for debugging

### Loading States (Mobile)
- [ ] Skeleton component renders animated shimmer placeholder with configurable dimensions
- [ ] Skeleton animation pulses opacity using React Native Animated API
- [ ] SkeletonCard provides pre-composed card skeleton layout
- [ ] SkeletonList renders multiple SkeletonCard items
- [ ] LoadingScreen shows centered ActivityIndicator with loading text
- [ ] LoadingScreen uses theme colors for dark mode compatibility

### Dark Mode (Mobile)
- [ ] ThemeContext provides isDark, toggle, and colors values
- [ ] Theme toggle in profile screen switches between light and dark
- [ ] Theme preference persists in AsyncStorage with @meroschool/theme key
- [ ] All screens use useTheme() colors, no hardcoded color values
- [ ] Tab bar background and border colors update in dark mode
- [ ] Card, Badge, Button components use theme colors
- [ ] StatusBar style switches between light and dark based on theme
- [ ] System color scheme is used as initial default

## Phase 3 — Convex Backend: Notifications, Query Optimization, Validation, Cron Jobs

### Notification System
- [ ] `subscribeUnread` query returns up to 20 unread notifications sorted desc for a userId
- [ ] `sendAttendanceAlert` internal mutation looks up student name, finds parents, inserts attendance_alert notification for each parent
- [ ] `sendTestResultNotification` internal mutation looks up student name and test title, sends test_result notification to parents
- [ ] `sendAssignmentDueReminder` internal mutation finds assignments due tomorrow, sends assignment_due notification to students who haven't submitted
- [ ] `sendAssignmentGradedNotification` internal mutation looks up submission/assignment/student and sends assignment_graded notification to student
- [ ] `deleteOldNotifications` internal mutation deletes read notifications older than 30 days

### Cron Jobs
- [ ] `crons.ts` registers daily "send-assignment-reminders" cron at 00:15 UTC calling `sendAssignmentDueReminder`
- [ ] `crons.ts` registers weekly "cleanup-old-notifications" cron on Sunday at 02:00 UTC calling `deleteOldNotifications`

### Query Optimization
- [ ] `listUnread` notifications query uses `.take(50)` instead of `.collect()`
- [ ] `listTestsBySubject` uses `.take(100)` instead of `.collect()`
- [ ] `getStudentTestHistory` uses `.take(100)` instead of `.collect()`
- [ ] `getParentChildren` uses `.take(500)` instead of unbounded `.collect()`
- [ ] `schools.list` uses `.take(50)` instead of `.collect()`
- [ ] `getUsersByRole` uses `.take(100)` instead of `.collect()`
- [ ] `listByTeacher` (salary) uses `.take(50)` instead of `.collect()`
- [ ] `listBySection` (assignments) uses `.take(100)` instead of `.collect()`
- [ ] `listBySubject` (assignments) uses `.take(100)` instead of `.collect()`
- [ ] `listSubmissions` uses `.take(100)` instead of `.collect()`
- [ ] `listStudentSubmissions` uses `.take(100)` instead of `.collect()`
- [ ] `getStudentAttendance` uses `.take(100)` instead of `.collect()`
- [ ] `exportAttendance` uses `.take(1000)` instead of `.collect()`

### Data Validation
- [ ] `upsertUser` validates email format with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- [ ] `schools.create` validates email format and phone format `/^(98|97)\d{8}$/`
- [ ] `createStudent` validates dateOfBirth and admissionDate format (YYYY-MM-DD)
- [ ] `markSingle` validates date format (YYYY-MM-DD)
- [ ] `markBulk` validates date format (YYYY-MM-DD)
- [ ] `getStudentAttendance` validates startDate and endDate format (YYYY-MM-DD)
- [ ] `assignments.create` validates dueDate format (YYYY-MM-DD)
- [ ] `createTest` validates durationMinutes > 0 and <= 180
- [ ] `addQuestion` validates exactly 4 options and correctOptionIndex 0-3
- [ ] `addQuestionsBulk` validates options count and correctOptionIndex for each question
- [ ] `salary.create` validates baseSalary >= 0
- [ ] `bulkCreateSalary` validates baseSalary >= 0
- [ ] `bulkEnrollStudents` validates email format, dateOfBirth, and admissionDate format
- [ ] `bulkCreateTeachers` validates email format
- [ ] `exportAttendance` validates startDate and endDate format (YYYY-MM-DD)

## Phase 3 — Web Verification

### Onboarding Flow (Web)
- [ ] Step 1: School info form renders with name, address, phone, email, province, district, school type
- [ ] Step 2: Add Classes form renders with text input and Add button
- [ ] Step 2: Adding class appends to list, remove button removes it
- [ ] Step 3: For each class, section inputs render with add/remove
- [ ] Step 3: Section badges display with X remove button
- [ ] Step 4: Teacher email input with invite button renders
- [ ] Step 4: Adding teacher email appends to invited list
- [ ] Step 4: Send Invites button appears when teachers are added
- [ ] Visual stepper shows 4 steps with current highlighted, completed steps show checkmark
- [ ] Back/Next navigation works across all 4 steps
- [ ] Final success screen shows "Your school is ready!" with summary stats
- [ ] Success screen links to dashboard

### Student Progress Page (Web)
- [ ] Section selector dropdown renders with class options
- [ ] Progress table shows 15 sample students with all columns
- [ ] Attendance % cells are color-coded: green >70%, yellow 40-70%, red <40%
- [ ] Test Average % cells are color-coded correctly
- [ ] Overall rating is calculated and color-coded
- [ ] Click row expands detail card with attendance trend and test scores
- [ ] Attendance trend shows bar chart for last 6 months with correct heights
- [ ] Test scores show subject name, progress bar, and percentage
- [ ] Click expanded row again collapses it
- [ ] Export CSV button downloads valid CSV file
- [ ] Dark mode renders correctly on progress page

### i18n Completion (Web)
- [ ] All onboarding step 2-4 keys exist in English
- [ ] All onboarding step 2-4 keys exist in Nepali
- [ ] All progress page keys exist in English
- [ ] All progress page keys exist in Nepali
- [ ] Language switcher updates all new labels correctly

### Type Checking & Build (Web)
- [ ] svelte-check runs with 0 errors
- [ ] vite build succeeds with adapter-cloudflare
- [ ] Input, Select, Textarea components support bind:value

### Deploy Preparation (Web)
- [ ] svelte.config.js uses @sveltejs/adapter-cloudflare
- [ ] wrangler.jsonc exists with correct config
- [ ] .env.example lists required environment variables
- [ ] WorkOS auth initializes lazily (no build-time crash)
