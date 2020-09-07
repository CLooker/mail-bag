import * as nodemailer from 'nodemailer';
import { ServerConfig } from './ServerConfig';
import { SendMailOptions, SentMessageInfo } from 'nodemailer';

export class Worker {
  private serverConfig: ServerConfig;

  constructor(serverConfig: ServerConfig) {
    this.serverConfig = serverConfig;
  }

  sendMessage(sendMailOptions: SendMailOptions): Promise<string> {
    return new Promise((res, rej) =>
      nodemailer
        .createTransport(this.serverConfig.smtp)
        .sendMail(
          sendMailOptions,
          (e: Error | null, sentMessageInfo: SentMessageInfo) =>
            e ? rej(e) : res()
        )
    );
  }
}
