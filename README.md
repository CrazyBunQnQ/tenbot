# Tenbot

> Create your Wechat Work Bot - 创建你的企业微信机器人

## 安装

> 要求 Node.js >= 10

```sh
npm i @tenbot/app @tenbot/bot
```

## 使用

详细使用方式[查看项目文档](https://tenbot.github.io)

```ts
import { App } from '@tenbot/app';
import { Bot } from '@tenbot/bot';

// 创建一个机器人
const bot = new Bot({
  // 机器人的名称，和在企业微信中创建的机器人名称相对应
  name: 'hello-bot',
  // 在企业微信中创建机器人后，生成的 Webhook 地址
  webhook: 'xxx',
  // 企业微信 - 机器人配置 - 接收消息配置 - Token
  token: 'xxx',
  // 企业微信 - 机器人配置 - 接收消息配置 - EncodingAESKey
  encodingAesKey: 'xxx',
});

// 默认消息处理器
bot.onMessage(async (message, context) => {
  // 来自企业微信的消息
  console.log(message);

  // 无论消息是什么，都回复 hello
  await context.sendText({ content: 'hello' });
});

// 创建一个 app
const app = new App({
  // 填写 app 监听的 host 和 port
  host: '0.0.0.0',
  port: 10080,
});

// 在路径 '/hello-bot' 上注册机器人
// 机器人将会监听在 URL `http://${host}:${port}/hello-bot`
// 这个 URL 填写到 企业微信 - 机器人配置 - 接收消息配置 - URL
app.register(bot, '/hello-bot');

// 启动 app
app.run().catch(console.error);
```

## License

[MIT](https://github.com/tenbot/tenbot/blob/master/LICENSE) &copy; [meteorlxy](https://github.com/meteorlxy) & [Contributors](https://github.com/tenbot/tenbot/graphs/contributors)
