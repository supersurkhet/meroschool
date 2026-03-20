import { WorkOS } from '@workos-inc/node'

let _workos: WorkOS | null = null

export function getWorkOS(): WorkOS {
	if (!_workos) {
		const apiKey = process.env.WORKOS_API_KEY ?? ''
		if (!apiKey) {
			throw new Error('WORKOS_API_KEY environment variable is required')
		}
		_workos = new WorkOS(apiKey)
	}
	return _workos
}

export const workos = {
	get userManagement() {
		return getWorkOS().userManagement
	},
}

export function getClientId(): string {
	return process.env.WORKOS_CLIENT_ID ?? ''
}

/** @deprecated Use getClientId() instead */
export const clientId = ''
