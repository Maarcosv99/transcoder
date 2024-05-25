import fs from 'node:fs/promises'
import path from 'node:path'

import { __dirname, asyncExec } from 'utils'
import { Resolution } from './types'

const DIST_PATH = path.join(__dirname(), '..', 'dist')

export async function createHlsFromVideo(videoPath: string, resolution: keyof typeof Resolution) {
	const resolutionPath = path.join(DIST_PATH, resolution)
	const segmentPath = path.join(resolutionPath, 'segment_%06d.ts')
	const playlistPath = path.join(resolutionPath, 'video.m3u8')
	
	await fs.mkdir(resolutionPath, { recursive: true })
	
	await asyncExec([
		'ffmpeg',
		`-i '${videoPath}'`,
		'-preset veryfast',
		'-g 25', // FPS
		'-crf 21',
		'-sc_threshold 0',
		'-hide_banner',
		'-codec:v libx264',
		'-c:a copy', // Audio Codec.
		'-an', // Remove audio
		`-s ${Resolution[resolution].replace('x', ':')}`,
		'-start_number 0',
		'-hls_time 4', // New segment each 4 seconds
		'-hls_segment_type mpegts',
		`-hls_segment_filename '${segmentPath}'`,	
		'-hls_playlist_type vod',
		'-hls_flags independent_segments',
		'-hls_list_size 0',
		'-f hls',
		`'${playlistPath}'`
	].join(' '))
	
	const playlistFileContent = await fs.readFile(playlistPath)

	const chunkRegex = /chunk[0-9]{5}\.ts/g
	const chunksGenerated = ((playlistFileContent.toString() || '').match(chunkRegex) || []).length
	return chunksGenerated
}
