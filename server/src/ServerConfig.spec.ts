import { parseServerConfig } from './ServerConfig';

describe('ServerConfig', () => {
  describe('parseServerConfig', () => {
    it('parses a serverConfig', () => {
      parseServerConfig('./serverConfig.spec.json');
    });
  });
});
