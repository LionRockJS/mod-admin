import { Central } from '@lionrockjs/central';

Central.initConfig(new Map([
  ['admin', await import('./config/admin.mjs')],
]));