import type { PageServerLoad, Actions } from './$types'
import { convexQuery, convexMutation, api } from '$lib/server/convex'
import { fail } from '@sveltejs/kit'

const FALLBACK_TESTS = [
	{
		id: 'test-1',
		title: 'Mid-term Mathematics',
		subject: 'Mathematics',
		questionsCount: 25,
		status: 'published' as const,
		date: '2026-03-15',
		totalMarks: 100,
	},
	{
		id: 'test-2',
		title: 'Science Unit Test',
		subject: 'Science',
		questionsCount: 15,
		status: 'published' as const,
		date: '2026-03-10',
		totalMarks: 50,
	},
	{
		id: 'test-3',
		title: 'English Grammar Quiz',
		subject: 'English',
		questionsCount: 10,
		status: 'draft' as const,
		date: '2026-03-18',
		totalMarks: 30,
	},
]

export const load: PageServerLoad = async () => {
	const tests = await convexQuery(null, {}, FALLBACK_TESTS)
	return { tests }
}

export const actions: Actions = {
	publish: async ({ request }) => {
		const formData = await request.formData()
		const title = formData.get('title') as string
		const subject = formData.get('subject') as string
		const totalMarks = Number(formData.get('totalMarks'))
		const questionsJson = formData.get('questions') as string

		if (!title || !questionsJson) {
			return fail(400, { error: 'Missing required fields' })
		}

		try {
			const questions = JSON.parse(questionsJson)
			// Create test and add questions via Convex
			await convexMutation(api.tests?.createTest, {
				title,
				subjectId: subject,
				totalMarks,
				durationMinutes: Number(formData.get('duration') ?? 60),
				createdBy: formData.get('userId') ?? '',
			})
			return { success: true }
		} catch (e) {
			return fail(500, {
				error:
					e instanceof Error ? e.message : 'Failed to create test',
			})
		}
	},
}
