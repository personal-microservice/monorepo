import { EmbedBuilder } from '@discordjs/builders';
import {
  Client,
  GatewayDispatchEvents,
  GatewayIntentBits,
} from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import {
  ConsoleLogger,
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService
  extends ConsoleLogger
  implements OnApplicationBootstrap
{
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async onApplicationBootstrap() {
    const token = this.configService.get<string>('DISCORD_TOKEN') as string;
    const rest = new REST({ version: '10' }).setToken(token);

    const gateway = new WebSocketManager({
      token,
      intents:
        GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
      rest,
    });

    this.client = new Client({ rest, gateway });
    this.client.once(GatewayDispatchEvents.Ready, () => {
      this.log('Discord bot is ready');
    });

    await gateway.connect();

    process.on('uncaughtException', (error) => {
      this.error(error.message, error.stack, 'uncaughtException');
    });
  }

  log(message: any): void {
    super.log(message);

    const embed = new EmbedBuilder();
    embed.setColor(0x1d7acb);
    embed.setTitle('Application log');
    embed.setDescription(message);

    this.client.api.channels.createMessage(
      this.configService.get<string>('DISCORD_DEV_CHANNEL_ID') as string,
      { embeds: [embed.toJSON()] }
    );
  }

  error(message: any, stack?: string, context?: string): void {
    super.error(message, stack, context);

    const embed = new EmbedBuilder();
    embed.setColor(0xff0000);
    embed.setTitle('Error');
    embed.addFields(
      {
        name: `Message`,
        value: message,
      },
      {
        name: `Stack`,
        value: stack ?? '',
      },
      {
        name: `Context`,
        value: context ?? '',
      }
    );

    this.client.api.channels.createMessage(
      this.configService.get<string>('DISCORD_DEV_CHANNEL_ID') as string,
      { embeds: [embed.toJSON()] }
    );
  }
}
