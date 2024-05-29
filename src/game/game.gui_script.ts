/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';
import { TargetMessage } from '../main/game_config';
import { parse_time, set_text, set_text_colors } from '../utils/utils';
import { Busters, CellId, ElementId, Level, Target } from './match3_game';


interface props {
    druid: DruidClass;
    level: Level;
    busters: Busters;
}

export function init(this: props): void {
    Manager.init_script();
    
    this.druid = druid.new(this);
    this.level = GAME_CONFIG.levels[GameStorage.get('current_level')];
    this.busters = this.level['busters'];

    set_events(this);
}

export function on_input(this: props, action_id: string | hash, action: unknown): void {
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
}

function setup(data: props) {
    setup_info_ui(data);
    setup_busters(data);
    setup_sustem_ui(data);
    setup_win_ui(data);
    setup_gameover_ui(data);
}

function setup_info_ui(data: props) {
    setup_step_or_time(data);
    setup_targets(data);
}

function setup_step_or_time(data: props) {
    if(data.level['time'] != undefined) {
        const node = gui.get_node('timer');
        gui.set_enabled(node, true);

        if(data.level['steps'] == undefined) {
            gui.set_position(node, vmath.vector3(0, -20, 0));
            gui.set_scale(node, vmath.vector3(0.6, 0.6, 1));
        } else {
            gui.set_position(node, vmath.vector3(0, -5, 0));
            gui.set_scale(node, vmath.vector3(0.5, 0.5, 1));
        }

        set_text('time', parse_time(data.level['time']));
    }

    if(data.level['steps'] != undefined) {
        const node = gui.get_node('step_counter');
        gui.set_enabled(node, true);

        if(data.level['time'] == undefined) {
            gui.set_position(node, vmath.vector3(0, -25, 0));
            gui.set_scale(node, vmath.vector3(0.7, 0.7, 1));
        } else {
            gui.set_position(node, vmath.vector3(0, -45, 0));
            gui.set_scale(node, vmath.vector3(0.5, 0.5, 1));
        }

        set_text('steps', data.level['steps']);
    }
}

function setup_targets(data: props) {
    const targets = data.level['targets'];
    if(targets[0] != undefined) {
        const node = gui.get_node('first_target');
        gui.set_enabled(node, true);
        
        switch(targets.length) {
            case 1: 
                gui.set_position(node, vmath.vector3(0, -15, 0));
                gui.set_scale(node, vmath.vector3(0.4, 0.4, 1));
            break;
            case 2:
                gui.set_position(node, vmath.vector3(-35, -15, 0));
                gui.set_scale(node, vmath.vector3(0.4, 0.4, 1));
            break;
            case 3:
                gui.set_position(node, vmath.vector3(-45, -5, 0));
                gui.set_scale(node, vmath.vector3(0.3, 0.3, 1));
            break;
        }

        const target = targets[0];
        const view = target.is_cell ? GAME_CONFIG.cell_view[target.type as CellId] : GAME_CONFIG.element_view[target.type as ElementId];
        gui.play_flipbook(gui.get_node('first_target_icon'), (view == 'cell_web') ? view + '_ui' : view);
        set_text('first_target_counts', target.count);
    }

    if(targets[1] != undefined) {
        const node = gui.get_node('second_target');
        gui.set_enabled(node, true);
        
        switch(targets.length) {
            case 2:
                gui.set_position(node, vmath.vector3(25, -15, 0));
                gui.set_scale(node, vmath.vector3(0.4, 0.4, 1));
            break;
            case 3:
                gui.set_position(node, vmath.vector3(36, -5, 0));
                gui.set_scale(node, vmath.vector3(0.3, 0.3, 1));
            break;
        }

        const target = targets[1];
        const view = target.is_cell ? GAME_CONFIG.cell_view[target.type as CellId] : GAME_CONFIG.element_view[target.type as ElementId];
        gui.play_flipbook(gui.get_node('second_target_icon'), (view == 'cell_web') ? view + '_ui' : view);
        set_text('second_target_counts', target.count);
    }

    if(targets[2] != undefined) {
        const node = gui.get_node('third_target');
        gui.set_enabled(node, true);
        
        gui.set_position(node, vmath.vector3(-2, -36, 0));
        gui.set_scale(node, vmath.vector3(0.3, 0.3, 1));
        
        const target = targets[2];
        const view = target.is_cell ? GAME_CONFIG.cell_view[target.type as CellId] : GAME_CONFIG.element_view[target.type as ElementId];
        gui.play_flipbook(gui.get_node('third_target_icon'), (view == 'cell_web') ? view + '_ui' : view);
        set_text('third_target_counts', target.count);
    }
}

function setup_busters(data: props) {
    if(GAME_CONFIG.animal_levels.includes(GameStorage.get('current_level') + 1)) return;
    
    gui.set_enabled(gui.get_node('buster_buttons'), true);
    
    if(GameStorage.get('spinning_opened')) {
        data.druid.new_button('spinning/button', () => {
            EventBus.send('TRY_ACTIVATE_SPINNING');
        });

        gui.set_enabled(gui.get_node('spinning/lock'), false);
        gui.set_enabled(gui.get_node('spinning/icon'), true);
        gui.set_enabled(gui.get_node('spinning/counts'), true);
    }

    if(GameStorage.get('hammer_opened')) {
        data.druid.new_button('hammer/button', () => {
            EventBus.send('TRY_ACTIVATE_HAMMER');
        });
        
        gui.set_enabled(gui.get_node('hammer/lock'), false);
        gui.set_enabled(gui.get_node('hammer/icon'), true);
        gui.set_enabled(gui.get_node('hammer/counts'), true);
    }
    
    if(GameStorage.get('horizontal_rocket_opened')) {
        data.druid.new_button('horizontal_rocket/button', () => {
            EventBus.send('TRY_ACTIVATE_HORIZONTAL_ROCKET');
        });
        
        gui.set_enabled(gui.get_node('horizontal_rocket/lock'), false);
        gui.set_enabled(gui.get_node('horizontal_rocket/icon'), true);
        gui.set_enabled(gui.get_node('horizontal_rocket/counts'), true);
    }

    if(GameStorage.get('vertical_rocket_opened')) {
        data.druid.new_button('vertical_rocket/button', () => {
            EventBus.send('TRY_ACTIVATE_VERTICAL_ROCKET');
        });
        
        gui.set_enabled(gui.get_node('vertical_rocket/lock'), false);
        gui.set_enabled(gui.get_node('vertical_rocket/icon'), true);
        gui.set_enabled(gui.get_node('vertical_rocket/counts'), true);
    }
}

function setup_sustem_ui(data: props) {
    data.druid.new_button('back/button', () => Scene.load('map'));
    data.druid.new_button('restart/button', () => Scene.restart());
    data.druid.new_button('revert_step/button', () => EventBus.send('TRY_REVERT_STEP'));

    set_text('current_level_text', GameStorage.get('current_level') + 1);
}

function setup_win_ui(data: props) {
    data.druid.new_button('continue_button', next_level);
    gui.set_enabled(gui.get_node('win'), false);
}

function next_level() {
    GameStorage.set('current_level', GameStorage.get('current_level') + 1);
    Scene.restart();
}

function setup_gameover_ui(data: props) {
    data.druid.new_button('restart_button', restart_level);
    data.druid.new_button('map_button', () => Scene.load('map'));
    gui.set_enabled(gui.get_node('gameover'), false);
}

function restart_level() {
    Scene.restart();
}

function set_events(data: props) {
    EventBus.on('INIT_UI', () => setup(data));
    EventBus.on('UPDATED_STEP_COUNTER', (steps) => set_text('steps', steps), true);
    EventBus.on('UPDATED_TARGET', (data) => update_targets(data), true);
    EventBus.on('UPDATED_BUTTONS', () => update_buttons(data), true);
    EventBus.on('GAME_TIMER', (time) => set_text('time', parse_time(time)), true);
    EventBus.on('SET_TUTORIAL', () => set_tutorial(), true);
    EventBus.on('REMOVE_TUTORIAL', () => gui.set_enabled(gui.get_node('tutorial'), false), true);
    EventBus.on('ON_WIN', set_win, true);
    EventBus.on('ON_GAME_OVER', set_gameover, true);
}

function update_targets(data: TargetMessage) {
    switch(data.id) {
        case 0: set_text('first_target_counts', data.count); break;
        case 1: set_text('second_target_counts', data.count); break;
        case 2: set_text('third_target_counts', data.count); break;
    }
}

function update_buttons(data: props) {
    set_text_colors(['spinning/button'], '#fff', data.busters.spinning.active ? 0.5 : 1);
    set_text('spinning/counts', GameStorage.get('spinning_counts'));
    
    set_text_colors(['hammer/button'], '#fff', data.busters.hammer.active ? 0.5 : 1);
    set_text('hammer/counts', GameStorage.get('hammer_counts'));
    
    set_text_colors(['horizontal_rocket/button'], '#fff', data.busters.horizontal_rocket.active ? 0.5 : 1);
    set_text('horizontal_rocket/counts', GameStorage.get('horizontal_rocket_counts'));
    
    set_text_colors(['vertical_rocket/button'], '#fff', data.busters.vertical_rocket.active ? 0.5 : 1);
    set_text('vertical_rocket/counts', GameStorage.get('vertical_rocket_counts'));
}

function set_tutorial() {
    const tutorial_data = GAME_CONFIG.tutorials_data[GameStorage.get("current_level") + 1];
    const tutorial = gui.get_node('tutorial');
    gui.set_position(tutorial, tutorial_data.position);
    gui.set_enabled(tutorial, true);
    gui.set_text(gui.get_node('tutorial_text'), Lang.get_text(tutorial_data.text));
}

function set_win() {
    disable_game_ui();
    gui.set_enabled(gui.get_node('win'), true);
}

function set_gameover() {
    disable_game_ui();
    gui.set_enabled(gui.get_node('gameover'), true);
}

function disable_game_ui() {
    gui.set_enabled(gui.get_node('substrate'), false);
    gui.set_enabled(gui.get_node('buster_buttons'), false);
    gui.set_enabled(gui.get_node('system_buttons'), false);
}