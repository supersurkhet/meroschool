import { mutate, query } from '$lib/server/convex'

export const actions = {
	register: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
		const data = await request.formData()

		const schoolName = data.get('schoolName') as string
		const address = data.get('address') as string
		const phone = data.get('phone') as string
		const email = data.get('email') as string
		const classesJson = data.get('classes') as string
		const sectionsJson = data.get('sections') as string

		if (!schoolName) {
			return { error: 'School name is required' }
		}

		try {
			// 1. Create school
			const schoolId = await mutate('schools:create', {
				name: schoolName,
				address,
				phone: phone || undefined,
				email: email || undefined,
			})

			// 2. Create classes and sections
			const classes: string[] = classesJson ? JSON.parse(classesJson) : []
			const sections: Record<string, string[]> = sectionsJson ? JSON.parse(sectionsJson) : {}

			for (const className of classes) {
				const classId = await mutate('schools:createClass', {
					schoolId,
					name: className,
					grade: classes.indexOf(className) + 1,
				})

				const classSections = sections[className] ?? []
				for (const sectionName of classSections) {
					await mutate('schools:createSection', {
						classId,
						name: sectionName,
					})
				}
			}

			// 3. Link admin user to school (if logged in)
			if (locals.user?.id) {
				try {
					const users = await query('auth:getUsersByRole', { role: 'admin' }, [])
					const adminUser = (users as any[]).find(
						(u: any) => u.workosUserId === locals.user?.id
					)
					if (adminUser) {
						await mutate('people:updateUser', {
							id: adminUser._id,
							schoolId,
						})
					}
				} catch {
					// Non-critical
				}
			}

			return { success: true, schoolId }
		} catch (e) {
			return { error: (e as Error).message ?? 'Failed to create school' }
		}
	},
}
