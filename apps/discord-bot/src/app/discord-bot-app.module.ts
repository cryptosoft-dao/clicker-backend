import { ConfigurationModule } from '@aofg/configuration';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigurationModule],
  controllers: [],
  providers: [],
})
export class DiscordBotAppModule {}
