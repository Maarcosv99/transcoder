import path from 'node:path'
import { execSync } from 'node:child_process'

import { __dirname } from 'utils'
import { Resolution } from './types'

const DIST_PATH = path.join(__dirname(), '..', 'dist')

export async function mergeHlsIntoVideo(resolution: keyof typeof Resolution) {
	const playlistPath = path.join(DIST_PATH, resolution, 'video.m3u8')
	const joinedVideoPath = path.join(DIST_PATH, `play_${resolution}.mp4`)

	execSync([
		'ffmpeg',
		`-i '${playlistPath}'`,
		'-codec: copy',
		`'${joinedVideoPath}'`
	].join(' '))
}
