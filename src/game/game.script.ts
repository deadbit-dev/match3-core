/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Game } from './match3_game';

interface props {
}

export function init(this: props) {
    Manager.init_script();
    Game();
}

export function on_message(this: props, message_id: hash, message: any, sender: hash): void {
    Manager.on_message(this, message_id, message, sender);
}

export function final(this: props): void {
    Manager.final_script();
}