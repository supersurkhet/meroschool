/* eslint-disable */
/**
 * Generated Convex API stub for MeroSchool.
 * Replace with actual generated types via `npx convex dev`.
 */

// biome-ignore lint: generated file
export declare const api: {
  auth: {
    currentUser: any;
    upsertUser: any;
    getUsersByRole: any;
    deactivateUser: any;
  };
  people: {
    createStudent: any;
    getStudentByUser: any;
    listStudentsBySection: any;
    updateStudent: any;
    createTeacher: any;
    getTeacherByUser: any;
    listTeachersBySchool: any;
    createParent: any;
    getParentByUser: any;
    getParentChildren: any;
  };
  academics: {
    createSubject: any;
    listSubjectsByClass: any;
    listSubjectsByTeacher: any;
    updateSubject: any;
    createModule: any;
    listModulesBySubject: any;
    updateModule: any;
    createTopic: any;
    listTopicsByModule: any;
    updateTopic: any;
    getSubjectHierarchy: any;
  };
  materials: {
    upload: any;
    listByTopic: any;
    listByModule: any;
    get: any;
    remove: any;
    generateUploadUrl: any;
    getFileUrl: any;
    getDownloadUrl: any;
    reorderMaterials: any;
  };
  tests: {
    createTest: any;
    getTest: any;
    listTestsBySubject: any;
    publishTest: any;
    closeTest: any;
    getTestStats: any;
    getStudentTestHistory: any;
    addQuestion: any;
    addQuestionsBulk: any;
    listQuestions: any;
    listQuestionsForStudent: any;
    updateQuestion: any;
    deleteQuestion: any;
    generateRandomTest: any;
    submitAttempt: any;
    getAttempt: any;
    listAttemptsByTest: any;
    listAttemptsByStudent: any;
  };
  attendance: {
    markSingle: any;
    markBulk: any;
    getBySectionDate: any;
    getStudentAttendance: any;
    dailySummary: any;
    getStudentAttendanceRange: any;
    getSectionAttendanceHistory: any;
    monthlyStudentSummary: any;
  };
  assignments: {
    create: any;
    listBySection: any;
    listBySubject: any;
    get: any;
    submit: any;
    grade: any;
    bulkGrade: any;
    listSubmissions: any;
    getStudentSubmission: any;
    listStudentSubmissions: any;
    getAssignmentWithSubmissions: any;
    getStudentAssignments: any;
  };
  progress: {
    getStudentProgress: any;
    getSectionProgress: any;
  };
  notifications: {
    send: any;
    sendBulk: any;
    listUnread: any;
    listAll: any;
    markRead: any;
    markAllRead: any;
    unreadCount: any;
    subscribeUnread: any;
  };
  schools: {
    create: any;
    list: any;
    get: any;
    update: any;
    createClass: any;
    listClasses: any;
    createSection: any;
    listSections: any;
    getSchoolHierarchy: any;
  };
  salary: {
    create: any;
    markPaid: any;
    cancel: any;
    update: any;
    listByTeacher: any;
    listByMonth: any;
    get: any;
    getSalaryReport: any;
    getTeacherSalaryHistory: any;
    bulkCreateSalary: any;
  };
  csv: {
    bulkEnrollStudents: any;
    bulkCreateTeachers: any;
    exportStudents: any;
    exportAttendance: any;
  };
  reports: {
    getClassTestAverages: any;
    getSectionAttendanceRate: any;
    getSchoolDashboardStats: any;
    getAssignmentCompletionReport: any;
  };
};
