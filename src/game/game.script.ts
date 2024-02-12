/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as flow from 'ludobits.m.flow';
import { Game } from './match3_game';

interface props {
}

export function init(this: props) {
    flow.start(() => Game(), {});
}

export function on_message(this: props, message_id: hash, message: any, sender: hash): void {
    flow.on_message(message_id, message, sender);
    Manager.on_message(this, message_id, message, sender);
}

export function final(this: props): void {
    flow.stop();
    EventBus.off('SET_FIELD');
    EventBus.off('SWAP_ELEMENTS');
    EventBus.off('CLICK_ACTIVATION');
    EventBus.off('REVERT_STEP');
}