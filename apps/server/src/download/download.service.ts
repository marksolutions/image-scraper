import { Injectable, BadRequestException } from "@nestjs/common";
import JSZip from "jszip";
import axios from "axios";
import { Readable } from "stream";

@Injectable()
export class DownloadService {
  async downloadImagesAsZip(urls: string[], zipName?: string) {
    if (!urls || urls.length === 0) {
      throw new BadRequestException("Image URLs are required");
    }

    const zip = new JSZip();
    const total = urls.length;
    let completed = 0;

    // Initial progress
    this.printProgress(completed, total);

    const downloadTasks = urls.map(async (url, index) => {
      try {
        const buffer = await this.fetchWithRetry(url, index, 50);

        if (buffer) {
          const ext = this.getExtension(url);
          zip.file(`${index + 1}${ext}`, buffer);
          completed++;
          this.printProgress(completed, total);
        }
      } catch (error) {
        // console.error(`‼️ FAILED ${index + 1} → ${url}`);
        this.failedUrls.push({ index: index + 1, url });
      }
    });

    await Promise.all(downloadTasks);

    const totalFiles = Object.keys(zip.files).length;

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    console.log(); // New line after progress bar

    const zipSizeBytes = zipBuffer.length;
    const zipSizeMB = (zipSizeBytes / (1024 * 1024)).toFixed(2);

    if (totalFiles === urls.length) {
      console.log(`✅ All ${total} images downloaded successfully. ZIP size: ${zipSizeMB} MB`);
    } else {
      console.log(`Failed to fetch some urls`, this.failedUrls);
    }

    this.failedUrls = [];

    return {
      buffer: zipBuffer,
      fileName: `${zipName || "images"}.zip`,
    };
  }

  private async fetchWithRetry(url: string, index: number, retries = 3, delayMs = 800): Promise<Buffer | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        return Buffer.from(res.data);
      } catch (err) {
        // console.warn(`⚠️ Attempt ${attempt} failed for #${index + 1}: ${url}`);
        if (attempt < retries) await this.sleep(delayMs);
      }
    }
    return null;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getExtension(url: string): string {
    try {
      const pathname = new URL(url).pathname;
      const ext = pathname.split(".").pop();
      if (!ext || ext.length > 5) return ".jpg";
      return `.${ext}`;
    } catch {
      return ".jpg";
    }
  }

  getStreamFromBuffer(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  private printProgress(completed: number, total: number) {
    const barLength = 100;
    const ratio = completed / total;
    const equalsCount = Math.round(ratio * barLength);
    const dashCount = barLength - equalsCount;

    const progressBar = "=".repeat(equalsCount) + "-".repeat(dashCount);
    process.stdout.write(`\r[${progressBar}] ${completed}/${total}`);
  }

  failedUrls: { index: number; url: string }[] = [];
}
