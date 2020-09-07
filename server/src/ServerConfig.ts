import * as fs from 'fs';
import * as path from 'path';
import { pipe } from './util';

export const parseServerConfig = (serverConfigPath: string): ServerConfig =>
  pipe(
    (_: any) => path.resolve(__dirname, serverConfigPath),
    fs.readFileSync,
    JSON.parse
  )();

export interface ServerConfig {
  app: {
    port: number;
  };
  smtp: {
    host: string;
    port: number;
    auth: { user: string; pass: string };
  };
  imap: {
    host: string;
    port: number;
    auth: { user: string; pass: string };
  };
}
