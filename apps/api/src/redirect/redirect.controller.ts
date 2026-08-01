import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { RedirectService } from './redirect.service';
import { Request, Response } from 'express';

@Controller('r')
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get(':alias')
  async redirect(
    @Param('alias') alias: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.redirectService.resolveAlias(alias);

    if (result.isExpired) {
      return res.status(410).json({
        message: 'This link has expired',
        alias,
        originalUrl: result.link.originalUrl,
      });
    }

    // Record click asynchronously (non-blocking)
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';

    this.redirectService.recordClickAsync(result.link.id, ip, userAgent, referrer as string);

    return res.redirect(302, result.link.originalUrl);
  }
}
