import { exec } from "node:child_process"

interface VideoInformation {
	streams: Array<{
		width: number;
		height: number;
	}>
	format: {
		duration: string;
		size: string;
	}
}

export async function getVideoInformation(videoPath: string): Promise<VideoInformation> {
	return new Promise((resolve, reject) => {
		const command = `ffprobe -v error -show_entries stream=width,height -show_entries format=size,duration -print_format json -i '${videoPath}'`
		exec(command, (error, stdout) => {
			if (error) reject(error)
			resolve(JSON.parse(stdout) as VideoInformation)
		})
	})
}
