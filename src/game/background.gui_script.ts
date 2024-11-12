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

    set_events(this);

    Camera.update_window_size();
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

function set_events(data: props) {
    EventBus.on('SYS_ON_RESIZED', on_resize, false);
}

function on_resize(data: {width: number, height: number}) {
    const bg = gui.get_node('bg');
    
    if(data.width >= data.height) gui.set_position(bg, vmath.vector3(280, 480, 0));
    else gui.set_position(bg, vmath.vector3(920, 480, 0));

    const hill = gui.get_node('hill');
    let posY = -275 + GAME_CONFIG.bottom_offset;
    if(GAME_CONFIG.debug_levels)
        posY += 100;
    gui.set_position(hill, vmath.vector3(250, posY, 0));
}