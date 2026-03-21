import { mutate, query } from '$lib/server/convex'
import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

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

export const load: PageServerLoad = async ({ url }) => {
	const subjectId = url.searchParams.get('subjectId')
	const tests = subjectId
		? await query('tests:listTestsBySubject', { subjectId }, FALLBACK_TESTS)
		: FALLBACK_TESTS
	return { tests }
}

export const actions: Actions = {
	publish: async ({ request }) => {
		const formData = await request.formData()
		const title = formData.get('title') as string
		const subjectId = formData.get('subject') as string
		const totalMarks = Number(formData.get('totalMarks'))

		if (!title || !subjectId) {
			return fail(400, { error: 'Missing required fields' })
		}

		try {
			await mutate('tests:createTest', {
				title,
				subjectId,
				totalMarks,
				durationMinutes: Number(formData.get('duration') ?? 60),
				createdBy: formData.get('userId') ?? '',
			})
			return { success: true }
		} catch (e) {
			return fail(500, {
				error: e instanceof Error ? e.message : 'Failed to create test',
			})
		}
	},
}
