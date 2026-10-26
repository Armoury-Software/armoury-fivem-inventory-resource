import { Command, EVENT_DIRECTIONS, EventListener, I18n, UI } from '@armoury/fivem-framework-client';
import { Stash, type Stub } from '@armoury/fivem-roleplay-gamemode-client';
import { Injectable } from 'injection-js';

@Injectable()
export class InventoryToggleInteraction {

  private _inventoryOpen: boolean;

  public constructor() {
    setTimeout(() =>
      Cfx.Client.RegisterKeyMapping('inventory', I18n.translate('command_inventory_name'), 'keyboard', 'i')
    , 1000);
  }

  @EventListener({ eventName: 'inventory:unsafe:open:request:response', direction: EVENT_DIRECTIONS.SERVER_TO_CLIENT })
  protected _onInventoryOpenRequested(stashes: Record<string, Stub<Stash>>) {
    UI.sendMessage({
      type: 'inventory:my-stash:open',
      stashes,
    });

    this._inventoryOpen = true;
  }

  @EventListener({ eventName: 'armoury:unsafe:ui:focus:gone', direction: EVENT_DIRECTIONS.CLIENT_TO_CLIENT })
  protected _onUiClosedUnsafe(): void {
    if (this._inventoryOpen) {
      console.log('Inventory focus gone.');
      this._inventoryOpen = false;
      Cfx.emitNet('inventory:unsafe:close:request');
    }
  }

  @Command()
  protected inventory(): void {
    Cfx.emitNet('inventory:unsafe:open:request');
  }
}
