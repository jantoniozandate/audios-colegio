import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

function runFfmpeg(buffer) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("ffmpeg not available."));
      return;
    }

    const chunks = [];
    const errors = [];
    const ffmpeg = spawn(ffmpegPath, [
      "-i",
      "pipe:0",
      "-vn",
      "-acodec",
      "libmp3lame",
      "-ar",
      "44100",
      "-ac",
      "1",
      "-b:a",
      "160k",
      "-f",
      "mp3",
      "pipe:1"
    ]);

    ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
    ffmpeg.stderr.on("data", (chunk) => errors.push(chunk));
    ffmpeg.on("error", (error) => reject(error));
    ffmpeg.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(errors).toString("utf8") || "ffmpeg failed."));
        return;
      }

      resolve(Buffer.concat(chunks));
    });

    ffmpeg.stdin.write(buffer);
    ffmpeg.stdin.end();
  });
}

export async function normalizeAudioUpload(file) {
  const input = Buffer.from(await file.arrayBuffer());
  const output = await runFfmpeg(input);

  return {
    buffer: output,
    contentType: "audio/mpeg",
    fileName: `${file.name.replace(/\.[^.]+$/, "") || "nota"}.mp3`
  };
}
