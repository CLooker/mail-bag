import { ParsedMail, simpleParser } from 'mailparser';
import { ServerConfig } from './ServerConfig';

// no types file
const ImapClient = require('emailjs-imap-client');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export class Worker {
  private serverConfig: ServerConfig;

  constructor(serverConfig: ServerConfig) {
    this.serverConfig = serverConfig;
  }

  public async deleteMessage(clientOptions: ClientOptions): Promise<void> {
    const client = this.client();
    await client.connect();

    await client.deleteMessages(
      clientOptions.mailbox,
      clientOptions.id ? +clientOptions.id : -1,
      {
        byUid: true,
      }
    );

    await client.close();
  }

  public async mailboxes(): Promise<Mailbox[]> {
    const client = this.client();
    await client.connect();
    const mailboxes = await client.listMailboxes();
    await client.close();

    let result: Mailbox[] = [];
    (function _mailboxes(mbs) {
      mbs.forEach(({ children, name, path }: Mailbox) => {
        result.push({ name, path });
        _mailboxes(children);
      });
    })(mailboxes.children);
    return result;
  }

  public async messageBody(clientOptions: ClientOptions): Promise<string> {
    const client = this.client();
    await client.connect();

    const messages = await client.listMessages(
      clientOptions.mailbox,
      clientOptions.id || '',
      ['body[]'],
      { byUid: true }
    );

    await client.close();

    const parsedMail: ParsedMail = await simpleParser(messages[0]['body[]']);

    return parsedMail.text || '';
  }

  public async messages(clientOptions: ClientOptions): Promise<Message[]> {
    const client = this.client();
    await client.connect();
    const mailbox = await client.selectMailbox(clientOptions.mailbox);

    if (!mailbox.exists) {
      await client.close();
      return [];
    }

    const messages: {
      uid: string;
      envelope: {
        date: string;
        from: {
          address: string;
        }[];
        subject: string;
      };
    }[] = await client.listMessages(clientOptions.mailbox, '1:*', [
      'uid',
      'envelope',
    ]);

    console.log({ messages });

    await client.close();

    return messages.map(message => ({
      id: message.uid,
      date: message.envelope.date,
      from: message.envelope.from[0].address,
      subject: message.envelope.subject,
    }));
  }

  private client(): Client {
    const client = new ImapClient.default(
      this.serverConfig.imap.host,
      this.serverConfig.imap.port,
      { auth: this.serverConfig.imap.auth }
    );

    client.logLevel = client.LOG_LEVEL_NONE;
    client.onerror = (e: Error) =>
      console.log('IMAP.Worker.client connection error: ', e);

    return client;
  }
}

interface Client {
  close: () => Promise<any>;
  connect: () => Promise<any>;
  deleteMessages: (mailbox: string, id: number, options: any) => Promise<any>;
  listMailboxes: () => Promise<any>;
  listMessages: (
    mailbox: string,
    id: string,
    query: any,
    options?: any
  ) => Promise<any>;
  selectMailbox: (mailbox: string) => Promise<any>;
}

export interface ClientOptions {
  mailbox: string;
  id?: string;
}

export interface Message {
  id: string;
  date: string;
  from: string;
  subject: string;
  body?: string;
}

export interface Mailbox {
  children?: Mailbox[];
  name: string;
  path: string;
}
