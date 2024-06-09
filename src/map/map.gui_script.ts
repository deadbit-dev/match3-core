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
    block_input: boolean
}

export function init(this: props): void {
    Manager.init_script();
    
    this.druid = druid.new(this);

    set_last_map_position();
    set_completed_levels();
    
    set_level_buttons(this);

    set_events(this);

    Scene.load_resource('map', 'shared_gui');
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if(this.block_input) return;

    this.druid.on_input(action_id, action);
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
    if(!GameStorage.get('infinit_life').is_active && GameStorage.get('life').amount == 0) {
        return EventBus.send('NOT_ENOUGH_LIFE');
    }
    GameStorage.set('current_level', level);
    Scene.load('game');
}

function set_last_map_position() {
    const map = gui.get_node('map');
    const pos = gui.get_position(map);
    pos.y = GameStorage.get('map_last_pos_y');
    gui.set_position(map, pos);
}

function set_completed_levels() {
    for(const level of GameStorage.get('completed_levels')) {
        const level_node = gui.get_node(tostring(level + 1) + '/level');
        gui.set_texture(level_node, "map");
        gui.play_flipbook(level_node, 'button_level_green');
    }
}

function on_drag(action: any) {
    if(math.abs(action.dy) == 0)
        return;
    
    const map = gui.get_node('map');
    const pos = gui.get_position(map);
    pos.y = math.max(-2800, math.min(0, pos.y + action.dy));
    gui.set_position(map, pos);

    GameStorage.set('map_last_pos_y', pos.y);
}

function set_events(instace: props) {
    EventBus.on('STORE_ACTIVATION', (state) => {
        instace.block_input = state;
    });

    EventBus.on('LIFE_NOTIFICATION', (state) => {
        instace.block_input = state;
    });
}