/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';
import { Dlg } from '../main/game_config';


interface props {
    druid: DruidClass;
    block_input: boolean
}

export function init(this: props): void {
    Manager.init_script();
    
    this.druid = druid.new(this);

    Camera.set_dynamic_orientation(false);
    Camera.set_go_prjection(-1, 0, -3, 3);

    set_last_map_position();
    set_completed_levels();
    
    set_level_buttons(this);

    set_events(this);

    Sound.play('map');

    set_current_level();
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if(GAME_CONFIG.is_busy_input || this.block_input) return;

    this.druid.on_input(action_id, action);
    
    if(action_id == hash("scroll_up") && action.value == 1) {
        return on_scroll(250);
    }
    
    if(action_id == hash("scroll_down") && action.value == 1) {
        return on_scroll(-250);
    }

    if(action_id == ID_MESSAGES.MSG_TOUCH && !action.pressed && !action.released) on_drag(action);
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
    Scene.unload_all_resources('map', ['shared_gui']);
    Manager.final_script();
}

function set_level_buttons(data: props) {
    for(let i = 0; i < 47; i++) {
        data.druid.new_button(tostring(i + 1) + '/level', (self, params) => {
            load_level(params);
        }, i);
    }
}

function load_level(level: number) {
    if(!GAME_CONFIG.debug_levels) {
        if(level > GameStorage.get('completed_levels').length)
            return;
    }
    if(!GameStorage.get('infinit_life').is_active && GameStorage.get('life').amount == 0) {
        return EventBus.send('NOT_ENOUGH_LIFE');
    }
    GAME_CONFIG.steps_by_ad = 0;
    GameStorage.set('current_level', level);
    Sound.stop('map');
    Scene.load('game');
}

function set_last_map_position() {
    const map = gui.get_node('map');
    const pos = gui.get_position(map);
    const offset = get_offset();
    pos.y = math.max(-3990 + offset, math.min(0 - offset, GameStorage.get('map_last_pos_y')));
    gui.set_position(map, pos);
}

function set_completed_levels() {
    for(const level of GameStorage.get('completed_levels')) {
        const level_node = gui.get_node(tostring(level + 1) + '/level');
        gui.set_texture(level_node, "map");
        gui.play_flipbook(level_node, 'button_level_green');
    }
}

function set_current_level() {
    let max_level = 0;
    for(let level of GameStorage.get('completed_levels')) {
        if(++level > max_level)
            max_level = level;
    }
    const level = gui.get_node(tostring(math.min(47, max_level + 1)) + "/level");
    gui.set_texture(level, "map");
    gui.play_flipbook(level, (GAME_CONFIG.animal_levels.includes(max_level + 1)) ? 'button_level_red' : 'button_level');
    const level_pos = gui.get_position(level);
    gui.set_position(gui.get_node('cat'), level_pos);

    const map = gui.get_node('map');
    const map_pos = gui.get_position(map);
    const offset = get_offset();
    map_pos.y = math.max(-3990 + offset, math.min(0 - offset, -(level_pos.y - 250)));
    gui.set_position(map, map_pos);
}

function on_drag(action: any) {
    if(math.abs(action.dy) == 0)
        return;
    
    const map = gui.get_node('map');
    const pos = gui.get_position(map);
    const offset = get_offset();
    pos.y = math.max(-3990 + offset, math.min(0 - offset, pos.y + action.dy));
    gui.set_position(map, pos);

    GameStorage.set('map_last_pos_y', pos.y);
}

function on_scroll(value: number) {
    const map = gui.get_node('map');
    const pos = gui.get_position(map);
    const offset = get_offset();
    pos.y = math.max(-3990 + offset, math.min(0 - offset, pos.y + value));
    gui.animate(map, gui.PROP_POSITION, pos, gui.EASING_OUTQUAD, 0.5);
    GameStorage.set('map_last_pos_y', pos.y);
}

function set_events(instace: props) {
    EventBus.on('OPENED_DLG', (dlg: Dlg) => {
        instace.block_input = true;
        if(dlg == Dlg.Store) Sound.stop('map');
    });

    EventBus.on('CLOSED_DLG', (dlg: Dlg) => {
        instace.block_input = false;
        if(dlg == Dlg.Store) Sound.play('map');
    });

    EventBus.on('LIFE_NOTIFICATION', (state) => {
        instace.block_input = state;
    });

    EventBus.on("SYS_ON_RESIZED", on_resize);
}

function on_resize(data: { width: number, height: number }) {
    Log.log("RESIZE");
    const offset = get_offset();
    const map = gui.get_node('map');
    const pos = gui.get_position(map);
    pos.y = math.max(-3990 + offset, math.min(0 - offset, pos.y));
    gui.set_position(map, pos);

    const back_left = gui.get_node('back_left');
    const back_right = gui.get_node('back_right');
    print("DATA: ", data.width, data.height);
    const dr = data.width / data.height;
    const br = 2160/2400;
    if(dr > br) {
        const delta = dr - br;
        print(delta);
        const scale = math.min(2.1 + delta, 2.6);
        gui.set_scale(back_left, vmath.vector3(scale, scale, 1));
        gui.set_scale(back_right, vmath.vector3(scale, scale, 1));
    }
}

function get_offset() {
    const height = Camera.get_ltrb(true).w;
    if(height >= -480)
        return 0;

    return math.abs(480 - math.abs(height));
}