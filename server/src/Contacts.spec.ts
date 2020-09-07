import * as path from 'path';
import * as Contacts from './Contacts';

describe('Contacts', () => {
  describe('Worker', () => {
    const contactsFilePath = path.resolve('contacts.spec.db');
    const contact: Contacts.Contact = {
      email: 'foo@foo.com',
      name: 'foo bar baz',
    };
    let worker: Contacts.Worker;

    beforeEach(() => {
      worker = new Contacts.Worker(contactsFilePath);
    });

    afterEach(async () => {
      const contacts: Contacts.Contact[] = await worker.contacts();
      for (let c of contacts) {
        await worker.deleteContact(c?._id?.toString() || '');
      }
    });

    it('adds a contact', async () => {
      const result: Contacts.Contact = await worker.addContact(contact);
      expect(result).toEqual(expect.objectContaining(contact));
    });

    it('deletes a contact', async () => {
      const contactWithId: Contacts.Contact = await worker.addContact(contact);
      const contacts: Contacts.Contact[] = await worker.contacts();
      const indexOfContact = contacts.findIndex(
        c => c.email === contact.email && c.name === c.name
      );

      expect(indexOfContact).not.toBe(-1);
      expect(contactWithId).toEqual(expect.objectContaining(contact));

      const wasDeleted = await worker.deleteContact(
        contactWithId?._id?.toString() || ''
      );
      expect(wasDeleted).toBeTruthy();

      const fakeId = 'foobarbaz';
      const wasFakeIdDeleted = await worker.deleteContact(fakeId);
      expect(wasFakeIdDeleted).toBeFalsy();
    });

    it('returns contacts', async () => {
      await worker.addContact(contact);
      const contacts = await worker.contacts();
      expect(contacts.length).toBe(1);
      expect(contacts[0]).toEqual(expect.objectContaining(contact));
    });

    it('updates a contact', async () => {
      await worker.addContact(contact);
      const [contactWithId] = await worker.contacts();
      const intendedUpdatedContact = {
        ...contactWithId,
        name: 'updated name',
        email: 'updated email',
      };
      const updatedContact = await worker.updateContact(intendedUpdatedContact);
      expect(updatedContact).toEqual(intendedUpdatedContact);
    });
  });
});
