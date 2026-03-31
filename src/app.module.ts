import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { CabinetsModule } from './modules/cabinets/infrastructure/cabinets.module';
import { CategoriesModule } from './modules/categories/infrastructure/categories.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), DatabaseModule, AuthModule, CabinetsModule, CategoriesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
