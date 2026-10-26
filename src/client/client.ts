import { I18n } from '@armoury/fivem-framework-client';
import { bootstrap } from '@armoury/fivem-roleplay-gamemode-client';

import { Client } from './controllers/client.controller';
import { InventoryToggleInteraction } from './service/interaction/inventory-toggle.interaction';

bootstrap(Client, {
  eager: [InventoryToggleInteraction],
  providers: [I18n.withOptions()],
});
