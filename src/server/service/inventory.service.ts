import { EVENT_DIRECTIONS, EventListener, SessionService } from '@armoury/fivem-framework-server';
import { Character, Stash, StashService } from '@armoury/fivem-roleplay-gamemode-server';
import { Injectable } from 'injection-js';

@Injectable()
export class InventoryService {
  private _characterIdsToStashIds = new Map<number, Record<InventoryStashType, number>>();

  public constructor(private readonly _stashes: StashService, private readonly _sessions: SessionService) {}

  public getPlayerStashFromPlayerId(playerId: number, type: InventoryStashType): Stash | null {
    const session = this._sessions.getSessionByPlayerId(playerId);
    if (session.principal == null) {
      console.error(
        `(getPlayerStashFromPlayerId:) Attempted to get the stash of player with ID ${playerId}`,
        'but their session had no principal. Are they not logged in?'
      );
      return null;
    }

    return this.getPlayerStashFromCharacterId(session.principal!, type);
  }

  public getPlayerStashFromCharacterId(characterId: number, type: InventoryStashType): Stash | null {
    if (!this._characterIdsToStashIds.has(characterId)) {
      console.error(
        '(getPlayerStashFromCharacterId:) Attempted to get the stash of character with ID',
        `${characterId}, but there was no cached stash for that character.`
      );
      return null;
    }

    const stashId = this._characterIdsToStashIds.get(characterId)![type];
    if (stashId == null || isNaN(stashId)) {
      console.error(
        '(getPlayerStashFromCharacterId:) Attempted to get the stash of character with ID',
        `${characterId}, but there was no cached stash for that character. (type: ${type})`
      );
      return null;
    }

    return this._stashes.findByIdImmediate(stashId);
  }

  private async loadPlayerInventory(playerId: number, characterId?: number, persistableId?: number): Promise<void> {
    if (characterId == null) {
      console.error(
        `A player [${Cfx.Server.GetPlayerName(playerId.toString())} (playerId: ${playerId})]`,
        'had their principal updated, but no characterId was found.',
        'This should never happen. Player kicked.'
      );

      Cfx.Server.DropPlayer(
        playerId.toString(),
        'An unknown error has occured. Please try reconnecting. (Error Code: INV-000)'
      );
      return;
    }

    if (persistableId == null) {
      console.error(
        `A player [${Cfx.Server.GetPlayerName(playerId.toString())} (playerId: ${playerId})]`,
        'had their principal updated, but no persistableId was found.',
        'This should never happen. Player kicked.'
      );

      Cfx.Server.DropPlayer(
        playerId.toString(),
        'An unknown error has occured. Please try reconnecting. (Error Code: INV-001)'
      );
      return;
    }

    if (this._characterIdsToStashIds.has(characterId)) {
      console.error(
        `A player [${Cfx.Server.GetPlayerName(playerId.toString())}`,
        `(playerId: ${playerId})] had their principal updated, but their character ID`,
        'was already present inside the cache. This should never happen. Player kicked.'
      );

      Cfx.Server.DropPlayer(
        playerId.toString(),
        'An unknown error has occured. Please try reconnecting. (Error Code: INV-002)'
      );
      return;
    }

    const stashes = await Promise.all(
      InventoryStashTypes.map((type) => {
        this._characterIdsToStashIds.set(characterId, {
          ...((this._characterIdsToStashIds.get(characterId) ?? {}) as Record<InventoryStashType, number>),
          [type]: NaN,
        });

        return this._stashes.findByType(type, persistableId);
      })
    );

    for (const type of InventoryStashTypes) {
      const index = InventoryStashTypes.indexOf(type);

      if (stashes[index].length > 1) {
        console.error(
          `A player [${Cfx.Server.GetPlayerName(playerId.toString())}`,
          `(characterId: ${characterId}, playerId: ${playerId})] has been found to`,
          'have multiple stashes which are supposed to be unique, character-based',
          `(${type}). This should never happen. Player kicked.`
        );

        Cfx.Server.DropPlayer(
          playerId.toString(),
          'An unknown error has occured. Please try reconnecting. (Error Code: INV-002)'
        );
        return;
      }

      if (!stashes[index].length) {
        // TODO: Create stash for player. After implementing, remove the "continue" below.
        continue;
      }

      let stash = stashes[index][0];
      this._characterIdsToStashIds.set(characterId, {
        ...((this._characterIdsToStashIds.get(characterId) ?? {}) as Record<InventoryStashType, number>),
        [type]: stash.id,
      });

      console.log(
        `Loaded stash of type (${type}) for player`,
        `[${Cfx.Server.GetPlayerName(playerId.toString())}`,
        `(characterId: ${characterId}, playerId: ${playerId})].`
      );
    }
  }

  private async forgetPlayerInventory(playerId: number, characterId?: number): Promise<void> {
    if (characterId == null) {
      return;
    }

    this._characterIdsToStashIds.delete(characterId);
    // TODO: _stashes.drop()
  }

  @EventListener({
    /* TODO: Remove the eventName, it will be handled by the method name */ eventName: 'armoury:character-logged-into',
    direction: EVENT_DIRECTIONS.SERVER_TO_SERVER,
  })
  protected onPlayerLoggedIntoCharacter(playerId: number, character: Character): void {
    console.log(
      `Player [${Cfx.Server.GetPlayerName(playerId.toString())}`,
      `(characterId: ${character.id}, playerId: ${playerId})]`,
      'has logged out of their character. Forgetting their inventory..'
    );

    this.loadPlayerInventory(playerId, character.id, character.persistableId);
  }

  @EventListener({ direction: EVENT_DIRECTIONS.SERVER_TO_SERVER })
  protected onPlayerSessionDestroyed /* TODO: Don't do onPlayerSessionDestroyed here. Instead, create a new built-in event 'onPlayerLoggedOutCharacter' or something like that. */(
    playerId: number,
    characterId: number
  ): void {
    this.forgetPlayerInventory(playerId, characterId);
  }
}

const InventoryStashTypes = ['character_main', 'character_quick_use'] as const;
type InventoryStashType = typeof InventoryStashTypes[number];
