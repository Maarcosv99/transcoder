import path from 'node:path'
import { execSync } from 'node:child_process'

import { __dirname } from 'utils'

const DIST_PATH = path.join(__dirname(), '..', 'dist')

export async function createPreviewFromVideo(videoPath: string) {
	const gifPath = path.join(DIST_PATH, 'preview.gif')

	execSync([
		'ffmpeg',
		`-i '${videoPath}'`,
		'-ss 0',
		'-t 10',
		'-vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"',
		'-loop 0',
		`'${gifPath}'`
	].join(' '))
}
