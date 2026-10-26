import { EVENT_DIRECTIONS, EventListener } from '@armoury/fivem-framework-common';
import { Stashes, Stash } from '@armoury/fivem-roleplay-gamemode-server';
import { Injectable } from 'injection-js';

import { InventoryService } from '../inventory.service';

@Injectable()
export class InventoryToggleInteraction {

  private _playersViewingInventoryStashes = new Map<number, Set<number>>();

  public constructor(
    private readonly _inventories: InventoryService,
  ) {}

  @EventListener({ eventName: 'inventory:unsafe:open:request', direction: EVENT_DIRECTIONS.CLIENT_TO_SERVER })
  protected _onInventoryOpenRequestUnsafe(): void {
    const playerId = Cfx.source;

    const mainStash = this._inventories.getPlayerStashFromPlayerId(playerId, 'character_main');
    const quickUseStash = this._inventories.getPlayerStashFromPlayerId(playerId, 'character_quick_use');

    Stashes.allow(playerId, mainStash.id);
    Stashes.allow(playerId, quickUseStash.id);

    this._playersViewingInventoryStashes.set(
      playerId,
      new Set([...this._playersViewingInventoryStashes.get(playerId) ?? [], mainStash.id, quickUseStash.id])
    );

    Cfx.emitNet('inventory:unsafe:open:request:response', playerId, {
      character_main: Stash.toStub(mainStash),
      character_quick_use: Stash.toStub(quickUseStash),
    });
  }

  @EventListener({ eventName: 'inventory:unsafe:close:request', direction: EVENT_DIRECTIONS.CLIENT_TO_SERVER })
  protected _onInventoryCloseRequestUnsafe(): void {
    const playerId = Cfx.source;
    const stashIds = this._playersViewingInventoryStashes.get(playerId);
    if (stashIds == null) {
      return;
    }

    for (const stashId of stashIds) {
      // TODO: Check whether the player actually has access to that stash: SessionService.hasAccess
      Stashes.disallow(playerId, stashId);
    }
  }
}
