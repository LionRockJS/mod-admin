import path from 'node:path';
import { Central } from '@lionrockjs/central';

export default {
  logPath: path.normalize(`${Central.APP_PATH}/../logs`),
  databaseMap: new Map([
    ['admin', `${Central.APP_PATH}/../database/admin.sqlite`],
  ])
};
