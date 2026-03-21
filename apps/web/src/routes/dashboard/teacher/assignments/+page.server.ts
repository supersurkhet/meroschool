import { mutate, query } from '$lib/server/convex'
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

const FALLBACK_ASSIGNMENTS = [
	{
		id: 'a1',
		title: 'Algebra Homework Ch. 5',
		description: 'Complete exercises 1-20 from chapter 5',
		subject: 'Mathematics',
		section: '10-A',
		dueDate: '2026-03-25',
		totalMarks: 50,
		status: 'active' as const,
		submissions: [
			{
				studentName: 'Aarav Sharma',
				submittedDate: '2026-03-20',
				grade: null,
				feedback: '',
			},
			{
				studentName: 'Bipana Thapa',
				submittedDate: '2026-03-19',
				grade: 42,
				feedback: 'Good work',
			},
			{
				studentName: 'Deepa Gurung',
				submittedDate: '2026-03-21',
				grade: null,
				feedback: '',
			},
		],
	},
	{
		id: 'a2',
		title: 'Science Lab Report',
		description: 'Write a detailed lab report on the photosynthesis experiment',
		subject: 'Science',
		section: '9-A',
		dueDate: '2026-03-22',
		totalMarks: 30,
		status: 'closed' as const,
		submissions: [
			{
				studentName: 'Eshan Karki',
				submittedDate: '2026-03-20',
				grade: 25,
				feedback: 'Well structured report',
			},
			{
				studentName: 'Fatima Khatun',
				submittedDate: '2026-03-21',
				grade: 28,
				feedback: 'Excellent observations',
			},
		],
	},
]

export const load: PageServerLoad = async ({ url }) => {
	const sectionId = url.searchParams.get('sectionId')
	const assignments = sectionId
		? await query('assignments:listBySection', { sectionId }, FALLBACK_ASSIGNMENTS)
		: FALLBACK_ASSIGNMENTS
	return { assignments }
}

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData()
		const title = formData.get('title') as string
		const dueDate = formData.get('dueDate') as string

		if (!title || !dueDate) {
			return fail(400, { error: 'Missing required fields' })
		}

		try {
			await mutate('assignments:create', {
				title,
				description: formData.get('description') as string,
				subjectId: formData.get('subjectId') as string,
				sectionId: formData.get('sectionId') as string,
				dueDate,
				totalMarks: Number(formData.get('totalMarks') ?? 50),
				createdBy: formData.get('userId') ?? '',
			})
			return { success: true }
		} catch (e) {
			return fail(500, {
				error: e instanceof Error ? e.message : 'Failed to create assignment',
			})
		}
	},
	grade: async ({ request }) => {
		const formData = await request.formData()
		const submissionId = formData.get('submissionId') as string
		const grade = Number(formData.get('grade'))
		const feedback = formData.get('feedback') as string

		try {
			await mutate('assignments:grade', {
				submissionId,
				grade,
				feedback,
				gradedBy: formData.get('userId') ?? '',
			})
			return { success: true }
		} catch (e) {
			return fail(500, {
				error: e instanceof Error ? e.message : 'Failed to save grade',
			})
		}
	},
}
