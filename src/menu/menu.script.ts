/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

interface props {
}

export function init(this: props) {
    Manager.init_script();
    Scene.load_resource ('menu', 'background');
    msg.post('.', 'acquire_input_focus');
}

export function on_message(this: props, message_id: hash, message: any, sender: hash): void {
    Manager.on_message(this, message_id, message, sender);
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if(action_id == ID_MESSAGES.MSG_TOUCH && action.released) Scene.load('map');
}

export function final(this: props): void {
    Scene.unload_all_resources('menu');
    Manager.final_script();
}