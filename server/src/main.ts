import * as path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import * as IMAP from './IMAP';
import * as SMTP from './SMTP';
import * as Contacts from './Contacts';
import { parseServerConfig } from './ServerConfig';

const serverConfig = parseServerConfig('../serverConfig.json');

express()
  // parse incoming req with JSON payloads
  .use(express.json())

  // serialize JSON responses with pretty format
  .set('json spaces', 2)

  // handle CORS
  .use((req: Request, res: Response, nextFn: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin,X-Requested-With,Contet-Type,Accept'
    );
    nextFn();
  })

  // serve web page
  .use('/', express.static(path.join(__dirname, '../../client/dist')))

  // API routes
  // contacts
  .get('/api/contacts', async (req: Request, resp: Response) => {
    try {
      const contactsWorker = new Contacts.Worker(path.resolve('contacts.db'));
      const contacts = await contactsWorker.contacts();
      resp.json(contacts);
    } catch (error) {
      resp.json({ error });
    }
  })
  .put('/api/contacts', async (req: Request, resp: Response) => {
    try {
      const contactsWorker = new Contacts.Worker(path.resolve('contacts.db'));
      const updatedContact = await contactsWorker.updateContact(req.body);
      resp.json(updatedContact || {});
    } catch (error) {
      resp.json({ error });
    }
  })
  .post('/api/contacts', async (req: Request, resp: Response) => {
    try {
      const contactsWorker = new Contacts.Worker(path.resolve('contacts.db'));
      const contact = await contactsWorker.addContact(req.body);
      resp.json(contact || {});
    } catch (error) {
      resp.json({ error });
    }
  })
  .delete('/api/contacts/:id', async (req: Request, resp: Response) => {
    try {
      const contactsWorker = new Contacts.Worker(path.resolve('contacts.db'));
      await contactsWorker.deleteContact(req.params.id);
      resp.json({ error: {} });
    } catch (error) {
      resp.json({ error });
    }
  })

  // mailboxes
  .get('/api/mailboxes', async (req: Request, resp: Response) => {
    try {
      const imapWorker = new IMAP.Worker(serverConfig);
      const mailboxes = await imapWorker.mailboxes();
      resp.json(mailboxes || []);
    } catch (error) {
      resp.json({ error });
    }
  })
  .get('/api/mailboxes/:mailbox', async (req: Request, resp: Response) => {
    try {
      const imapWorker = new IMAP.Worker(serverConfig);
      const messages = await imapWorker.messages(req.params.mailbox);
      resp.json(messages || []);
    } catch (error) {
      resp.json({ error });
    }
  })

  // messages
  .post('/api/messages', async (req: Request, resp: Response) => {
    try {
      const smtpWorker = new SMTP.Worker(serverConfig);
      await smtpWorker.sendMessage(req.body);
      resp.json({ error: {} });
    } catch (error) {
      resp.json({ error });
    }
  })
  .get('/api/messages/:mailbox/:id', async (req: Request, resp: Response) => {
    try {
      const imapWorker = new IMAP.Worker(serverConfig);
      const messageBody = await imapWorker.messageBody(
        req.params.mailbox,
        req.params.id
      );
      resp.send(messageBody || '');
    } catch (error) {
      resp.json({ error });
    }
  })
  .delete(
    '/api/messages/:mailbox/:id',
    async (req: Request, resp: Response) => {
      try {
        const imapWorker = new IMAP.Worker(serverConfig);
        await imapWorker.deleteMessage(req.params.mailbox, req.params.id);
        resp.json({ error: '' });
      } catch (error) {
        resp.json({ error });
      }
    }
  )

  // start server
  .listen(serverConfig.app.port, () =>
    console.log('mailbag server listening on port ' + serverConfig.app.port)
  );
