import path from 'node:path'
import fs from 'node:fs/promises'
import { __dirname } from './utils'

import { getVideoInformation } from 'get-video-information'
import { getEqualAndLowerResolutions } from './utils'
import { createHlsFromVideo } from 'create-hls-from-video'
import { createHlsAudioFromVideo } from 'create-hls-audio-from-video'
import { mergeHlsIntoVideo } from 'merge-hls-into-video'
import { createPreviewFromVideo } from 'create-preview-from-video'
import { createMasterPlaylist } from 'create-master-playlist'

const ORIGINAL_VIDEO_PATH = path.join(__dirname(), '..', 'video.mp4')
const DIST_PATH = path.join(__dirname(), '..', 'dist')

async function main() {
	const videoInformation = await getVideoInformation(ORIGINAL_VIDEO_PATH)
	const availableResolutions = getEqualAndLowerResolutions(videoInformation.streams[0])
	
	await fs.mkdir(DIST_PATH, { recursive: true })
	await fs.copyFile(ORIGINAL_VIDEO_PATH, path.join(DIST_PATH, 'original.mp4'))
	
	await createHlsAudioFromVideo(ORIGINAL_VIDEO_PATH)

	await Promise.all(availableResolutions.map(resolution => {
		return createHlsFromVideo(ORIGINAL_VIDEO_PATH, resolution)
	}))
	
	await Promise.all(availableResolutions.map(resolution => {
		return mergeHlsIntoVideo(resolution)
	}))

	await createMasterPlaylist(availableResolutions)

	await createPreviewFromVideo(
		path.join(DIST_PATH, `play_${availableResolutions[0]}.mp4`)
	)
}

await main()
