import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { DownloadService } from './download.service';
import { DownloadDto } from './dto/download.dto';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post()
  async downloadImages(@Body() dto: DownloadDto, @Res() res: Response) {
    const { buffer, fileName } =
      await this.downloadService.downloadImagesAsZip(dto.urls, dto.zipName);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    const stream = this.downloadService.getStreamFromBuffer(buffer);
    stream.pipe(res);
  }
}
