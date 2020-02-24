import { Server } from 'http';
import * as dbg from 'debug';
import * as Koa from 'koa';
import * as Router from '@koa/router';
import { formatPath } from '@tenbot/utils';
import { Bot } from '@tenbot/bot';

const debug = dbg('tenbot:app');

export interface AppOptions {
  host: string;
  port: number;
}

export class App {
  protected readonly options: AppOptions;

  protected readonly server: Koa;

  protected readonly bots: Map<string, Bot>;

  constructor(options: AppOptions) {
    this.options = options;
    this.server = new Koa();
    this.bots = new Map();
  }

  /**
   * Register a bot on particular path
   */
  register(bot: Bot, path = '/'): App {
    const botPath = formatPath(path);
    const currentBot = this.bots.get(botPath);
    if (currentBot) {
      throw new Error(
        `bot [${currentBot.name}] has already registered on path '${botPath}'`
      );
    }

    this.bots.set(botPath, bot);

    debug(`registered bot [${bot.name}] on '${path}'`);

    return this;
  }

  /**
   * Listen this app on particular port and host
   */
  run(): Promise<Server> {
    return new Promise((resolve, reject) => {
      // get the count of registered bots
      const botsCount = this.bots.size;

      debug(`registered ${botsCount} bot(s) in total`);

      if (botsCount < 1) {
        reject(new Error('No bots registered'));
        return;
      }

      // use routers of bots
      const router = new Router();
      this.bots.forEach((bot, path) => {
        const botRouter = bot.createRouter();
        router.use(path, botRouter.routes(), botRouter.allowedMethods());
      });

      // server listening
      const { port, host } = this.options;
      const server = this.server
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(port, host, () => {
          console.log(`tenbot app is listening at http://${host}:${port}`);
          resolve(server);
        });

      server.on('error', err => {
        debug(`server.on('error'):`, err);
        server.close();
        reject(err);
      });
    });
  }
}
