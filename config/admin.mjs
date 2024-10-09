import path from 'node:path';
import { Central } from '@lionrockjs/central';

export default {
  logPath: path.normalize(`${Central.APP_PATH}/../logs`),
};
