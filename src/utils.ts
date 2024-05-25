import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'

import { Resolution } from './types'

export function __dirname() {
	return dirname(fileURLToPath(import.meta.url))
}

export function getEqualAndLowerResolutions(size: { width: number, height: number }): Array<keyof typeof Resolution> {
	let resolutions: Array<keyof typeof Resolution> = []

	Object.entries(Resolution).forEach(([key, value]) => {
		const [resWidth] = value.split('x').map(Number)
		if (size.width >= resWidth) resolutions.push(key as keyof typeof Resolution)
	})

	return resolutions 
}

export async function asyncExec(command: string) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout) => {
			if (error) {
				reject(error)
			}
			resolve(stdout.trim())
		})
	})
}
