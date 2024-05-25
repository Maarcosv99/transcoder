import path from 'node:path'
import fs from 'node:fs'

import { __dirname } from './utils'
import { Resolution } from './types'
import Hls from 'hls-parser'

const DIST_PATH = path.join(__dirname(), '..', 'dist')
const { MasterPlaylist, Variant, Rendition } = Hls.types

export async function createMasterPlaylist(resolutions: Array<keyof typeof Resolution>) {
	const audioRendition = new Rendition({
		uri: 'audio/audio.m3u8',
		type: 'AUDIO',
		name: 'Portuguese',
		isDefault: true,
		groupId: 'audio',
		autoselect: true,
		language: 'Portuguese',
		forced: true
	})

	const variants = resolutions.map((resolution) => {
		const playlistPath = path.join(DIST_PATH, resolution, 'video.m3u8')
		const playlistContent = fs.readFileSync(playlistPath, { encoding: 'utf-8' })

		const { segments } = Hls.parse(playlistContent) as Hls.types.MediaPlaylist
		const segment = segments[0]
		const segmentPath = path.join(DIST_PATH, resolution, segment.uri)
		const { size } = fs.statSync(segmentPath)

		const bandwidth = size * 8 / segment.duration
		const [width, height] = Resolution[resolution].split('x').map(Number)

		return new Variant({
			uri: `${resolution}/video.m3u8`,
			bandwidth: Math.ceil(bandwidth),
			codecs: "avc1.4d401e,mp4a.40.2",
			audio: [audioRendition],
			resolution: {
				width,
				height
			}
		})
	})

	const masterPlaylist = new MasterPlaylist({
		variants
	})

	await fs.promises.writeFile(
		path.join(DIST_PATH, 'master.m3u8'),
		Hls.stringify(masterPlaylist)
	)
}
