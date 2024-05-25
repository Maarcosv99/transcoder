import fs from 'node:fs/promises'

import path from 'node:path'

import { __dirname, asyncExec } from 'utils'

const DIST_PATH = path.join(__dirname(), '..', 'dist')
const AUDIO_PATH = path.join(DIST_PATH, 'audio')

export async function createHlsAudioFromVideo(videoPath: string) {
	await fs.mkdir(AUDIO_PATH, { recursive: true })

	const segmentPath = path.join(AUDIO_PATH, 'segment_%06d.aac')
	const audioPath = path.join(DIST_PATH, 'audio.aac')
	const playlistPath = path.join(AUDIO_PATH, 'audio.m3u8')

	await asyncExec([
		'ffmpeg',
		`-i '${videoPath}'`,
		'-vn',
		'-codec:a aac', // Audio Codec. AAC supports stream
		'-b:a 128k', // Audio Bitrate
		'-ac 2', // Audio channels (stereo)
		`'${audioPath}'`	
	].join(' '))
	
	await asyncExec([
		'ffmpeg',
		`-i '${audioPath}'`,
		'-codec: copy',
		'-start_number 0',
		'-hls_time 4', // New segment each 4 seconds
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
