const Datastore = require('nedb');

export class Worker {
  private db: Nedb;

  constructor(contactsFilePath: string) {
    this.db = new Datastore({
      filename: contactsFilePath,
      autoload: true,
    });
  }

  public addContact(contact: Contact): Promise<Contact> {
    return new Promise((res, rej) =>
      this.db.insert(contact, (e: Error | null, contactDoc: Contact) =>
        e ? rej(e) : res(contactDoc)
      )
    );
  }

  public contacts(): Promise<Contact[]> {
    return new Promise((res, rej) =>
      this.db.find({}, (e: Error, contacts: Contact[]) =>
        e ? rej(e) : res(contacts)
      )
    );
  }

  public deleteContact(id: string): Promise<boolean> {
    return new Promise((res, rej) =>
      this.db.remove({ _id: id }, {}, (e: Error | null, booleanDigit: number) =>
        e ? rej(e) : res(!!booleanDigit)
      )
    );
  }

  public updateContact(contact: Contact): Promise<Contact> {
    return new Promise((res, rej) =>
      this.db.update(
        { _id: contact._id },
        { email: contact.email, name: contact.name },
        { returnUpdatedDocs: true },
        (e: Error | null, numberOfUpdated: number, updatedContact: Contact) =>
          e ? rej(e) : res(updatedContact)
      )
    );
  }
}

export interface Contact {
  _id?: number;
  name: string;
  email: string;
}
