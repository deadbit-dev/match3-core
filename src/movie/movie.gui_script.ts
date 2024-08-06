/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';


interface props {
    druid: DruidClass;
}

export function init(this: props): void {
    Manager.init_script();
    this.druid = druid.new(this);

    this.druid.new_button('btn', () => {
        Scene.load("map");
    });
    
    EventBus.on('MOVIE_END', () => {
        print('HERE');
        const window = gui.get_node('window');
        gui.set_enabled(window, true);
    });
}

export function on_input(this: props, action_id: string | hash, action: any): boolean {
    return this.druid.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid.update(dt);
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    Manager.on_message(this, message_id, message, sender);
    this.druid.on_message(message_id, message, sender);
}

export function final(this: props): void {
    this.druid.final();
    EventBus.off_all_current_script();
    Manager.final_script();
}