import { EVENT_DIRECTIONS, EventListener } from '@armoury/fivem-framework-common';
import { Injectable } from 'injection-js';

import { InventoryService } from '../inventory.service';

@Injectable()
export class InventoryOpenInteraction {
  public constructor(private readonly _inventories: InventoryService) {}

  @EventListener({ eventName: 'inventory:unsafe:open:request', direction: EVENT_DIRECTIONS.CLIENT_TO_SERVER })
  protected _onInventoryOpenRequestUnsafe(): void {
    const playerId = Cfx.source;

    const mainStash = this._inventories.getPlayerStashFromPlayerId(playerId, 'character_main');

    const quickUseStash = this._inventories.getPlayerStashFromPlayerId(playerId, 'character_quick_use');

    Cfx.emitNet('inventory:unsafe:open:request:response', playerId, {
      character_main: mainStash /* TODO: Replace with Stash.toStub(mainStash) */,
      // character_quick_use: quickUseStash /* TODO: Replace with Stash.toStub(mainStash) */,
    });
  }
}
