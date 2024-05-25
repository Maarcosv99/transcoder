import path from 'node:path'
import fs from 'node:fs/promises'
import { execSync } from "node:child_process";

import { __dirname } from 'utils';

const DIST_PATH = path.join(__dirname(), '..', 'dist')

export async function createSeekFromVideo(videoPath: string) {
	const thumbnailPath = path.join(DIST_PATH, 'thumbnails', 'img%03d.png')
	const thumbnailGalleryFilesPath = path.join(DIST_PATH, 'thumbnails', '*.png')
	const thumbnailGalleryImagePath = path.join(DIST_PATH, 'seek.jpeg')

	execSync([
		'ffmpeg',
		`-i '${videoPath}'`,
		`-vf "select='eq(pict_type,PICT_TYPE_I)',scale=-1:120"`,
		'-vsync vfr',
		`'${thumbnailPath}'`	
	].join(' '))

	execSync([
		'montage',
		'-compress jpeg',
		'-quality 50',
		'-tile x4',
		'-geometry +5+5',
		`'${thumbnailGalleryFilesPath}'`,
		`'${thumbnailGalleryImagePath}'`
	].join(' '))

	fs.rm(path.join(DIST_PATH, 'thumbnails'), { force: true })
}
