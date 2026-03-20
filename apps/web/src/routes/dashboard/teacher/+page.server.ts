import type { PageServerLoad } from './$types'
import { query } from '$lib/server/convex'

const FALLBACK_CLASSES = [
	{ subject: 'Mathematics', section: 'Class 10-A', students: 42 },
	{ subject: 'Science', section: 'Class 9-B', students: 38 },
	{ subject: 'Mathematics', section: 'Class 8-A', students: 45 },
]

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent()
	const classes = user?.id
		? await query('academics:listSubjectsByTeacher', { teacherId: user.id }, FALLBACK_CLASSES)
		: FALLBACK_CLASSES
	return { classes }
}
