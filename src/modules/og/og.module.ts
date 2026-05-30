import { Module } from '@nestjs/common';
import { OgController } from './og.controller';
import { DemandsModule } from '../demands/infrastructure/demands.module';

@Module({
  imports: [DemandsModule],
  controllers: [OgController],
})
export class OgModule {}
