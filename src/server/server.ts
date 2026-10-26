import { bootstrap, Stashes } from '@armoury/fivem-roleplay-gamemode-server';

import { Server } from './controllers/server.controller';
import { InventoryToggleInteraction } from './service/interaction/inventory-toggle.interaction';
import { InventoryService } from './service/inventory.service';

bootstrap(Server, {
  eager: [InventoryToggleInteraction, InventoryService, Stashes /* TODO: Remove this with version 1.0.60 of gamemode */],
});
