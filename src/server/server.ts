import { bootstrap } from '@armoury/fivem-roleplay-gamemode-server';

import { Server } from './controllers/server.controller';
import { InventoryOpenInteraction } from './service/interaction/inventory-open.interaction';
import { InventoryService } from './service/inventory.service';

bootstrap(Server, {
  eager: [InventoryOpenInteraction, InventoryService],
});
