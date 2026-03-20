import type { PageServerLoad } from './$types'
import { query } from '$lib/server/convex'

const FALLBACK_SUBJECTS = [
	{
		name: 'Mathematics',
		modules: [
			{
				name: 'Algebra',
				topics: [
					{
						name: 'Linear Equations',
						materials: [
							{
								id: 'm1',
								title: 'Introduction to Linear Equations',
								type: 'video' as const,
								url: 'https://example.com/video1',
								description:
									'Basics of linear equations in one variable',
							},
							{
								id: 'm2',
								title: 'Linear Equations Worksheet',
								type: 'pdf' as const,
								url: 'https://example.com/pdf1',
								description:
									'Practice problems for linear equations',
							},
						],
					},
					{
						name: 'Quadratic Equations',
						materials: [
							{
								id: 'm3',
								title: 'Quadratic Formula',
								type: 'link' as const,
								url: 'https://example.com/quadratic',
								description:
									'Complete guide to the quadratic formula',
							},
						],
					},
				],
			},
			{
				name: 'Geometry',
				topics: [
					{
						name: 'Triangles',
						materials: [
							{
								id: 'm4',
								title: 'Types of Triangles',
								type: 'document' as const,
								url: '',
								description:
									'Classification and properties of triangles',
							},
						],
					},
					{ name: 'Circles', materials: [] },
				],
			},
		],
	},
	{
		name: 'Science',
		modules: [
			{
				name: 'Physics',
				topics: [
					{
						name: 'Motion',
						materials: [
							{
								id: 'm5',
								title: 'Newton Laws of Motion',
								type: 'video' as const,
								url: 'https://example.com/newton',
								description:
									'All three laws explained with examples',
							},
						],
					},
					{ name: 'Energy', materials: [] },
				],
			},
		],
	},
]

export const load: PageServerLoad = async ({ url }) => {
	const subjectId = url.searchParams.get('subjectId')

	// If a subjectId is provided, fetch the full hierarchy from Convex
	if (subjectId) {
		const hierarchy = await query(
			'academics:getSubjectHierarchy',
			{ subjectId },
			null,
		)
		if (hierarchy) {
			return { subjectsData: [hierarchy] }
		}
	}

	return { subjectsData: FALLBACK_SUBJECTS }
}
