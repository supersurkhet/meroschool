import type { PageServerLoad, Actions } from './$types'
import { query, mutate } from '$lib/server/convex'
import { fail } from '@sveltejs/kit'

const FALLBACK_SECTIONS = ['10-A', '10-B', '9-A', '9-B', '8-A', '8-B']

const FALLBACK_STUDENTS = [
	{ id: '1', roll: 1, name: 'Aarav Sharma', status: 'present' as const },
	{ id: '2', roll: 2, name: 'Bipana Thapa', status: 'present' as const },
	{ id: '3', roll: 3, name: 'Chandan Adhikari', status: 'present' as const },
	{ id: '4', roll: 4, name: 'Deepa Gurung', status: 'present' as const },
	{ id: '5', roll: 5, name: 'Eshan Karki', status: 'present' as const },
	{ id: '6', roll: 6, name: 'Fatima Khatun', status: 'present' as const },
	{ id: '7', roll: 7, name: 'Ganesh Poudel', status: 'present' as const },
	{ id: '8', roll: 8, name: 'Hira Tamang', status: 'present' as const },
	{ id: '9', roll: 9, name: 'Ishwor Bhandari', status: 'present' as const },
	{ id: '10', roll: 10, name: 'Janaki Rai', status: 'present' as const },
	{ id: '11', roll: 11, name: 'Krishna Magar', status: 'present' as const },
	{ id: '12', roll: 12, name: 'Laxmi Shrestha', status: 'present' as const },
]

export const load: PageServerLoad = async ({ url }) => {
	const sectionId = url.searchParams.get('sectionId')
	const sections = FALLBACK_SECTIONS
	const students = sectionId
		? await query('people:listStudentsBySection', { sectionId }, FALLBACK_STUDENTS)
		: FALLBACK_STUDENTS
	return { sections, students }
}

export const actions: Actions = {
	submit: async ({ request }) => {
		const formData = await request.formData()
		const sectionId = formData.get('sectionId') as string
		const date = formData.get('date') as string
		const recordsJson = formData.get('records') as string

		if (!sectionId || !date || !recordsJson) {
			return fail(400, { error: 'Missing required fields' })
		}

		try {
			const records = JSON.parse(recordsJson)
			await mutate('attendance:markBulk', {
				sectionId,
				date,
				records,
				markedBy: formData.get('userId') ?? '',
			})
			return { success: true }
		} catch (e) {
			return fail(500, {
				error: e instanceof Error ? e.message : 'Failed to submit attendance',
			})
		}
	},
}
