/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as flow from 'ludobits.m.flow';
import { View } from './match3_view';

interface props {
}

export function init(this: props) {
    msg.post('.', 'acquire_input_focus');
    flow.start(() => View(), {});
}

export function on_message(this: props, message_id: hash, message: any, sender: hash): void {
    flow.on_message(message_id, message, sender);
    Manager.on_message(this, message_id, message, sender);
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if (action_id == hash('touch'))
        msg.post('.', action_id, action);
}

export function final(this: props): void {
    flow.stop();
    EventBus.off('ON_SET_FIELD');
    EventBus.off('GAME_STEP');
    EventBus.off('ON_REVERT_STEP');
    EventBus.off('TRY_REVERT_STEP');
}