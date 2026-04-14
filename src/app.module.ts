import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { CabinetsModule } from './modules/cabinets/infrastructure/cabinets.module';
import { CategoriesModule } from './modules/categories/infrastructure/categories.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';

import { SharedModule } from './shared/shared.module';
import { DemandsModule } from './modules/demands/infrastructure/demands.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationsModule } from './modules/notifications/infrastructure/notifications.module';
import { ResultsModule } from './modules/results/infrastructure/results.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: Number(process.env.THROTTLE_TTL) || 60000,
          limit: Number(process.env.THROTTLE_LIMIT) || 10,
        },
      ],
    }),
    DatabaseModule,
    AuthModule,
    CabinetsModule,
    CategoriesModule,
    SharedModule,
    DemandsModule,
    EventEmitterModule.forRoot(),
    NotificationsModule,
    ResultsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
