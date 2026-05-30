import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { FindDemandUseCase } from '../demands/application/find-demand.use-case';
import { DemandEntity } from '../demands/domain/demand.entity';

const BOT_AGENTS =
  /whatsapp|telegram|facebot|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|googlebot|bingbot|applebot|embedly|quora|outbrain|pinterest|vkshare|w3c_validator|developers\.google/i;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildOgHtml(demand: DemandEntity, frontendUrl: string): string {
  const title = demand.title;
  const description = (demand.description ?? '').slice(0, 160);
  const canonicalUrl = `${frontendUrl}/comments/${demand.id}`;
  const image =
    demand.evidences?.find((e) => e.mimeType.startsWith('image/'))?.url ?? '';

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeUrl = escapeHtml(canonicalUrl);
  const safeImage = escapeHtml(image);
  const redirectUrl = canonicalUrl.replace(/"/g, '\\"');

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle} | Gabinete Digital</title>
    <meta name="description" content="${safeDesc}" />

    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Gabinete Digital" />
    ${image ? `<meta property="og:image" content="${safeImage}" />` : ''}

    <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    ${image ? `<meta name="twitter:image" content="${safeImage}" />` : ''}

    <meta http-equiv="refresh" content="0; url=${safeUrl}" />
  </head>
  <body>
    <script>window.location.replace("${redirectUrl}")</script>
    <p><a href="${safeUrl}">Clique aqui para visualizar a demanda</a></p>
  </body>
</html>`;
}

@ApiExcludeController()
@Controller('og')
export class OgController {
  constructor(private readonly findDemandUseCase: FindDemandUseCase) {}

  @Get('demands/:id')
  async preview(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl =
      process.env.FRONTEND_URL ?? 'https://gabineteapp.com.br';
    const isBot = BOT_AGENTS.test(req.headers['user-agent'] ?? '');

    try {
      const demand = await this.findDemandUseCase.execute(id);

      if (!isBot) {
        res.redirect(302, `${frontendUrl}/comments/${id}`);
        return;
      }

      res
        .status(200)
        .header('Content-Type', 'text/html; charset=utf-8')
        .header('Cache-Control', 'public, max-age=60')
        .header('Content-Security-Policy', "script-src 'unsafe-inline'")
        .send(buildOgHtml(demand, frontendUrl));
    } catch {
      res.redirect(302, frontendUrl);
    }
  }
}
