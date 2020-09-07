import * as IMAP from './IMAP';
import { parseServerConfig } from './ServerConfig';
const serverConfig = parseServerConfig('./serverConfig.spec.json');

describe('IMAP', () => {
  describe('Worker', () => {
    it('constructs', () => {
      new IMAP.Worker(serverConfig);
    });
  });
});
