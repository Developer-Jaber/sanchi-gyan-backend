import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ContentModule } from './content/content.module';
import { ProgressModule } from './progress/progress.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [AuthModule, UsersModule, SubscriptionsModule, ContentModule, ProgressModule, NotificationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
