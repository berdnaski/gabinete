import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GetCabinetTestimonialsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(slug: string) {
    const raw = await this.prisma.$queryRawUnsafe<
      {
        id: string;
        title: string;
        survey_rating: number;
        survey_comment: string;
        survey_submitted_at: Date;
        reporter_name: string;
        reporter_avatar_url: string | null;
      }[]
    >(
      `
      SELECT d.id, d.title, d.survey_rating, d.survey_comment, d.survey_submitted_at,
             u.name as reporter_name, u.avatar_url as reporter_avatar_url
      FROM demands d
      JOIN users u ON d.reporter_id = u.id
      JOIN cabinets c ON d.cabinet_id = c.id
      WHERE c.slug = $1
        AND d.survey_rating >= 4
        AND d.survey_comment IS NOT NULL
        AND d.disabled_at IS NULL
      ORDER BY d.survey_submitted_at DESC
      LIMIT 10
      `,
      slug
    );

    return raw.map((r) => ({
      id: r.id,
      title: r.title,
      surveyRating: r.survey_rating,
      surveyComment: r.survey_comment,
      surveySubmittedAt: r.survey_submitted_at,
      reporterName: r.reporter_name,
      reporterAvatarUrl: r.reporter_avatar_url,
    }));
  }
}
