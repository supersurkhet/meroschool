import { useQuery, useMutation } from "convex/react"

// Re-export Convex React hooks for convenience.
// Usage:
//   import { useQuery, useMutation } from '@/lib/convex/hooks'
//   const data = useQuery(api.attendance.getStudentAttendance, { studentId })
//   const markAttendance = useMutation(api.attendance.markSingle)
//
// Note: `api` is imported from the generated Convex API module.
// Once `npx convex dev` has been run and _generated/ exists:
//   import { api } from '../../../convex/_generated/api'
//
// Until then, import these hooks and reference api in comments.

export { useQuery, useMutation }
