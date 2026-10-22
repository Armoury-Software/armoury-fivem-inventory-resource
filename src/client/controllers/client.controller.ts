import { Command, Controller, EVENT_DIRECTIONS, EventListener, I18n, UI } from '@armoury/fivem-framework-client';
import { Stash } from '@armoury/fivem-roleplay-gamemode-client';

@Controller()
export class Client {
  public constructor() {
    setTimeout(() =>
      Cfx.Client.RegisterKeyMapping('inventory', I18n.translate('command_inventory_name'), 'keyboard', 'i')
    );
  }

  @EventListener({ eventName: 'inventory:unsafe:open:request:response', direction: EVENT_DIRECTIONS.SERVER_TO_CLIENT })
  protected _onInventoryOpenRequested(stashes: Record<string, Stash /* TODO: Replace with Stub<Stash> */>) {
    UI.sendMessage({
      type: 'inventory:my-stash:open',
      stashes: Object.entries(stashes).reduce(
        (prev, [type, stash]) => ({
          ...prev,
          [type]: stash.slots.map(
            (slot) => slot ?? { itemIdentifier: null, amount: 0 }
          ) /* TODO: Don't do the map and expect the UI to have the exact same pattern? (+performance) */,
        }),
        {}
      ),
    });
  }

  @Command()
  protected inventory(): void {
    Cfx.emitNet('inventory:unsafe:open:request');
  }
}
