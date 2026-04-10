import { ApiProperty } from '@nestjs/swagger';

export class DemandCommentResponseDto {
  @ApiProperty({ example: 'uuid-comment-id' })
  id: string;

  @ApiProperty({ example: 'The team has already been dispatched to inspect the site.' })
  content: string;

  @ApiProperty({ example: true, description: 'True if posted by a cabinet member' })
  isCabinetResponse: boolean;

  @ApiProperty({ example: 'uuid-demand-id' })
  demandId: string;

  @ApiProperty({ example: 'uuid-author-id' })
  authorId: string;

  @ApiProperty({ example: 'John Doe' })
  authorName: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatar.jpg', nullable: true, required: false })
  authorAvatarUrl?: string | null;

  @ApiProperty()
  createdAt: Date;
}
