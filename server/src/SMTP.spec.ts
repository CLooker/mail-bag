import * as SMTP from './SMTP';
import { parseServerConfig } from './ServerConfig';
const serverConfig = parseServerConfig('./serverConfig.spec.json');

describe('SMTP', () => {
  describe('Worker', () => {
    it('constructs', () => {
      new SMTP.Worker(serverConfig);
    });
  });
});
