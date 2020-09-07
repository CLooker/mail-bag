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
      this.db.find({}, (e: Error, contactDocs: Contact[]) =>
        e ? rej(e) : res(contactDocs)
      )
    );
  }

  public deleteContact(id: string): Promise<boolean> {
    return new Promise((res, rej) =>
      this.db.remove({ _id: id }, {}, (e: Error | null, wasDeleted: number) =>
        e ? rej(e) : res(!!wasDeleted)
      )
    );
  }

  public updateContact(contact: Contact): Promise<Contact> {
    return new Promise((res, rej) =>
      this.db.update(
        { _id: contact._id },
        { email: contact.email, name: contact.name },
        { returnUpdatedDocs: true },
        (
          e: Error | null,
          numberOfUpdated: number,
          updatedContactDoc: Contact
        ) => (e ? rej(e) : res(updatedContactDoc))
      )
    );
  }
}

export interface Contact {
  _id?: number;
  name: string;
  email: string;
}
