import { Central } from '@lionrockjs/central';

await Central.initConfig(new Map([
  ['admin', await import('./config/admin.mjs')],
]));