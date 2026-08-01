import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LinksModule } from './links/links.module';
import { ClicksModule } from './clicks/clicks.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TagsModule } from './tags/tags.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RedirectModule } from './redirect/redirect.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DATABASE_PATH', 'data/tinytag.sqlite'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    LinksModule,
    ClicksModule,
    AnalyticsModule,
    CampaignsModule,
    TagsModule,
    ApiKeysModule,
    DashboardModule,
    RedirectModule,
    SeedModule,
  ],
})
export class AppModule {}
