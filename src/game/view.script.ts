/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { View } from './view';

go.property("default_sprite_material", resource.material("/builtins/materials/sprite.material"));
go.property("tutorial_sprite_material", resource.material("/assets/materials/tutorial_sprite.material"));

interface props {
    view: View,
    default_sprite_material: hash,
    tutorial_sprite_material: hash
}

export function init(this: props) {
    Manager.init_script();
    
    msg.post('.', 'acquire_input_focus');
    this.view = View({
        default_sprite_material: this.default_sprite_material,
        tutorial_sprite_material: this.tutorial_sprite_material
    });
}

export function on_message(this: props, message_id: hash, message: any, sender: hash): void {
    this.view.on_message(message_id, message, sender);
    Manager.on_message(this, message_id, message, sender);
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if (action_id == hash('touch')) {
        msg.post('.', action_id, action);
    }
}

export function final(this: props): void {
    Scene.unload_all_resources('game');
    Manager.final_script();
}