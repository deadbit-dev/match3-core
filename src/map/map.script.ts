/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as flow from 'ludobits.m.flow';
import { Map } from './map';


interface props {}

export function init(this: props) {
    msg.post('.', 'acquire_input_focus');

    Manager.init_script();

    flow.start(() => Map(), {});
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if (action_id == hash('touch'))
        msg.post('.', action_id, action);
}

export function on_message(this: props, message_id: hash, message: any, sender: hash): void {
    flow.on_message(message_id, message, sender);
    Manager.on_message(this, message_id, message, sender);
}

export function final(this: props): void {
    flow.stop();
    EventBus.off_all_current_script();
    Scene.unload_all_resources('map');
    Manager.final_script();
}