import { I18n } from '@armoury/fivem-framework-client';
import { bootstrap } from '@armoury/fivem-roleplay-gamemode-client';

import { Client } from './controllers/client.controller';

bootstrap(Client, {
  providers: [I18n.withOptions()],
});
