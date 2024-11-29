/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';
import { is_animal_level } from './utils';


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
    const dr = data.width / data.height;
    const br = 1920/1080;
    
    if(dr < br) {
        gui.set_pivot(bg, gui.PIVOT_W);
        gui.set_xanchor(bg, gui.ANCHOR_LEFT);
        const pos = vmath.vector3(0, 444, 0);
        if(is_animal_level())
            pos.y += 90;
        gui.set_position(bg, pos);
        gui.set_scale(bg, vmath.vector3(1, 1, 1));
    } else {
        gui.set_pivot(bg, gui.PIVOT_CENTER);
        gui.set_xanchor(bg, gui.ANCHOR_NONE);
        gui.set_position(bg, vmath.vector3(280, 444, 0));
        const delta = dr - br;
        const scale = math.min(1 + delta, 1.5);
        gui.set_scale(bg, vmath.vector3(scale, scale, 1));
    }

    if(data.width < 800) {
        const scale = 1.5;
        gui.set_scale(bg, vmath.vector3(scale, scale, 1));
    }

    const hill = gui.get_node('hill');
    gui.set_enabled(hill, is_animal_level());
    let posY = -250 + GAME_CONFIG.bottom_offset;
    if(GAME_CONFIG.debug_levels)
        posY += 100;
    gui.set_position(hill, vmath.vector3(250, posY, 0));
}