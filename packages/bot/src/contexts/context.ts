import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import * as EventEmitter from 'eventemitter3';
import { md5 } from '@tenbot/utils';
import { Bot } from '../bot';
import { WechatChatInfo, WechatResponseChatInfo } from '../wechat';
import {
  Message,
  MessageText,
  MessageTextOptions,
  MessageMarkdown,
  MessageMarkdownOptions,
  MessageImage,
  MessageImageOptions,
  MessageNews,
  MessageNewsOptions,
  Article,
  ArticleOptions,
  Attachment,
  AttachmentOptions,
  AttachmentActionButton,
  AttachmentActionButtonOptions,
} from '../messages';

/**
 * Context class
 */
export class Context<
  EventTypes extends string | symbol | { [K in keyof EventTypes]: unknown[] } =
    | string
    | symbol
> extends EventEmitter<EventTypes> {
  /**
   * The Bot that current context belongs to
   *
   * 当前上下文所属的机器人
   */
  readonly bot: Bot;

  /**
   * The http client used for sending http requests to Wechat Work server
   *
   * 用于向企业微信服务器发送请求的 HTTP 客户端
   */
  readonly http: AxiosInstance;

  constructor(bot?: Bot) {
    super();
    if (bot) {
      this.bot = bot;
      this.http = bot.http;
    } else {
      this.http = axios.create();
    }
  }

  /**
   * Get chat info
   * Return `null` if not available
   *
   * 获取聊天信息
   * 如果不可获取则返回 null
   */
  async getChatInfo(url: string): Promise<WechatChatInfo | null> {
    try {
      const { data } = await this.http.get<WechatResponseChatInfo>(url);

      if (data.errcode !== 0) {
        throw new Error(data.errmsg);
      }

      const { chatid: chatId, name, members } = data;

      return {
        chatId,
        name,
        members: members.map(({ userid: userId, alias, name }) => ({
          userId,
          alias,
          name,
        })),
      };
    } catch (err) {
      this.bot.debug(err);
      this.bot.emit('error', err);
      return null;
    }
  }

  /**
   * Create a text message
   *
   * 创建文字信息
   */
  async createText(options: MessageTextOptions): Promise<MessageText> {
    return new MessageText(options);
  }

  /**
   * Create a markdown message
   *
   * 创建 Markdown 信息
   */
  async createMarkdown(
    options: MessageMarkdownOptions
  ): Promise<MessageMarkdown> {
    return new MessageMarkdown(options);
  }

  /**
   * Create an image message
   *
   * 创建图片信息
   */
  async createImage(options: MessageImageOptions): Promise<MessageImage> {
    return new MessageImage(options);
  }

  /**
   * Create an image message by url
   *
   * 根据 URL 创建图片信息
   */
  async createImageByUrl(
    url: string,
    options?: Omit<MessageImageOptions, 'md5' | 'base64'>,
    httpOptions?: Pick<
      AxiosRequestConfig,
      'timeout' | 'proxy' | 'httpAgent' | 'httpsAgent'
    >
  ): Promise<MessageImage> {
    const { data } = await this.http.get<Buffer>(url, {
      responseType: 'arraybuffer',
      ...httpOptions,
    });

    const image = data;
    const imageMd5 = md5(image);
    const imageBase64 = image.toString('base64');

    return this.createImage({
      md5: imageMd5,
      base64: imageBase64,
      ...options,
    });
  }

  /**
   * Create a news message
   *
   * 创建图文信息
   */
  async createNews(options: MessageNewsOptions): Promise<MessageNews> {
    return new MessageNews(options);
  }

  /**
   * Create an article of a news message
   *
   * 创建图文信息的文章
   */
  async createArticle(options: ArticleOptions): Promise<Article> {
    return new Article(options);
  }

  /**
   * Create an attachment
   *
   * 创建附件
   */
  async createAttachment(options: AttachmentOptions): Promise<Attachment> {
    return new Attachment(options);
  }

  /**
   * Create an attachment action button
   *
   * 创建附件按钮
   */
  async createAttachmentActionButton(
    options: AttachmentActionButtonOptions
  ): Promise<AttachmentActionButton> {
    return new AttachmentActionButton(options);
  }

  /**
   * Send a message
   *
   * 向指定 URL 发送信息
   */
  async sendMessage(
    message: Message,
    url = this.bot.webhook
  ): Promise<AxiosResponse> {
    return this.http.post(url, message.toSendObject());
  }

  /**
   * Create and send a text message
   *
   * 创建并发送文字信息
   */
  async sendText(options: MessageTextOptions): Promise<AxiosResponse> {
    const message = await this.createText(options);
    return this.sendMessage(message);
  }

  /**
   * Create and send a markdown message
   *
   * 创建并发送 Markdown 信息
   */
  async sendMarkdown(options: MessageMarkdownOptions): Promise<AxiosResponse> {
    const message = await this.createMarkdown(options);
    return this.sendMessage(message);
  }

  /**
   * Create and send an image message
   *
   * 创建并发送图片信息
   */
  async sendImage(options: MessageImageOptions): Promise<AxiosResponse> {
    const message = await this.createImage(options);
    return this.sendMessage(message);
  }

  /**
   * Create and send an image message by url
   *
   * 根据图片 URL 创建并发送图片信息
   */
  async sendImageByUrl(
    url: string,
    options?: Omit<MessageImageOptions, 'md5' | 'base64'>,
    httpOptions?: Pick<
      AxiosRequestConfig,
      'timeout' | 'proxy' | 'httpAgent' | 'httpsAgent'
    >
  ): Promise<AxiosResponse> {
    const message = await this.createImageByUrl(url, options, httpOptions);
    return this.sendMessage(message);
  }

  /**
   * Create and send a news message
   *
   * 创建并发送图文信息
   */
  async sendNews(options: MessageNewsOptions): Promise<AxiosResponse> {
    const message = await this.createNews(options);
    return this.sendMessage(message);
  }
}
