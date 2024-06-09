/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-case-declarations */

import * as druid from 'druid.druid';
import { is_enough_coins, remove_coins } from '../main/coins';
import { TargetMessage } from '../main/game_config';
import { remove_lifes } from '../main/life';
import { parse_time, set_text, set_text_colors } from '../utils/utils';
import { Busters, CellId, ElementId, GameState, Level } from './match3_game';


interface props {
    druid: DruidClass,
    level: Level,
    busters: Busters
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
    Manager.final_script();
}

function setup(instance: props) {
    setup_info_ui(instance);
    setup_busters(instance);
    setup_sustem_ui(instance);
    setup_win_ui(instance);
    setup_gameover_ui(instance);
}

function setup_info_ui(instance: props) {
    setup_step_or_time(instance);
    setup_targets(instance);
}

function setup_step_or_time(instance: props) {
    if(instance.level['time'] != undefined) {
        const node = gui.get_node('timer');
        gui.set_enabled(node, true);

        if(instance.level['steps'] == undefined) {
            gui.set_position(node, vmath.vector3(0, -20, 0));
            gui.set_scale(node, vmath.vector3(0.6, 0.6, 1));
        } else {
            gui.set_position(node, vmath.vector3(0, -5, 0));
            gui.set_scale(node, vmath.vector3(0.5, 0.5, 1));
        }

        set_text('time', parse_time(instance.level['time']));

        gui.set_text(gui.get_node('step_time_box/text'), Lang.get_text('time'));
    }

    if(instance.level['steps'] != undefined) {
        const node = gui.get_node('step_counter');
        gui.set_enabled(node, true);

        if(instance.level['time'] == undefined) {
            gui.set_position(node, vmath.vector3(0, -25, 0));
            gui.set_scale(node, vmath.vector3(0.7, 0.7, 1));
        } else {
            gui.set_position(node, vmath.vector3(0, -45, 0));
            gui.set_scale(node, vmath.vector3(0.5, 0.5, 1));
        }

        set_text('steps', instance.level['steps']);

        gui.set_text(gui.get_node('step_time_box/text'), Lang.get_text('steps'));
    }
}

function setup_targets(instance: props) {
    const targets = instance.level['targets'];
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

    gui.set_text(gui.get_node('targets_box/text'), Lang.get_text('targets'));
}

function setup_busters(instance: props) {
    if(GAME_CONFIG.animal_levels.includes(GameStorage.get('current_level') + 1)) return;
    
    gui.set_enabled(gui.get_node('buster_buttons'), true);
    
    if(GameStorage.get('spinning_opened')) {
        instance.druid.new_button('spinning/button', () => {
            if(GameStorage.get('spinning_counts') == 0)
                return EventBus.send('TRY_BUY_SPINNING');
            EventBus.send('TRY_ACTIVATE_SPINNING');
        });

        gui.set_enabled(gui.get_node('spinning/lock'), false);
        gui.set_enabled(gui.get_node('spinning/icon'), true);
        gui.set_enabled(gui.get_node('spinning/counts'), true);
    }

    if(GameStorage.get('hammer_opened')) {
        instance.druid.new_button('hammer/button', () => {
            if(GameStorage.get('hammer_counts') == 0)
                return EventBus.send('TRY_BUY_HAMMER');
            EventBus.send('TRY_ACTIVATE_HAMMER');
        });
        
        gui.set_enabled(gui.get_node('hammer/lock'), false);
        gui.set_enabled(gui.get_node('hammer/icon'), true);
        gui.set_enabled(gui.get_node('hammer/counts'), true);
    }
    
    if(GameStorage.get('horizontal_rocket_opened')) {
        instance.druid.new_button('horizontal_rocket/button', () => {
            if(GameStorage.get('horizontal_rocket_counts') == 0)
                return EventBus.send('TRY_BUY_HORIZONTAL_ROCKET');         
            EventBus.send('TRY_ACTIVATE_HORIZONTAL_ROCKET');
        });
        
        gui.set_enabled(gui.get_node('horizontal_rocket/lock'), false);
        gui.set_enabled(gui.get_node('horizontal_rocket/icon'), true);
        gui.set_enabled(gui.get_node('horizontal_rocket/counts'), true);
    }

    if(GameStorage.get('vertical_rocket_opened')) {
        instance.druid.new_button('vertical_rocket/button', () => {
            if(GameStorage.get('vertical_rocket_counts') == 0)
                return EventBus.send('TRY_BUY_VERTICAL_ROCKET');
            EventBus.send('TRY_ACTIVATE_VERTICAL_ROCKET');
        });
        
        gui.set_enabled(gui.get_node('vertical_rocket/lock'), false);
        gui.set_enabled(gui.get_node('vertical_rocket/icon'), true);
        gui.set_enabled(gui.get_node('vertical_rocket/counts'), true);
    }

    update_buttons(instance);
}

function setup_sustem_ui(instance: props) {
    instance.druid.new_button('back/button', () => Scene.load('map'));
    instance.druid.new_button('restart/button', () => Scene.restart());
    instance.druid.new_button('revert_step/button', () => EventBus.send('TRY_REVERT_STEP'));

    set_text('current_level_text', GameStorage.get('current_level') + 1);
}

function setup_win_ui(instance: props) {
    instance.druid.new_button('continue_button', next_level);
    gui.set_enabled(gui.get_node('win'), false);
    gui.set_text(gui.get_node('win_text'), Lang.get_text('win_title'));
    gui.set_text(gui.get_node('continue_text'), Lang.get_text('continue'));
}

function next_level() {
    GameStorage.set('current_level', GameStorage.get('current_level') + 1);
    Scene.restart();
}

function setup_gameover_ui(instance: props) {
    gui.set_text(gui.get_node('gameover_text'), Lang.get_text('gameover_title'));
    
    gui.set_text(gui.get_node('restart_text'), Lang.get_text('restart'));
    instance.druid.new_button('restart_button', () => {
        if(!GameStorage.get('infinit_life').is_active && GameStorage.get('life').amount == 0) {
            EventBus.send("SET_LIFE_NOTIFICATION");
            return;
        }
        
        Scene.restart();
    });
    
    gui.set_text(gui.get_node('map_text'), Lang.get_text('map'));
    instance.druid.new_button('map_button', () => Scene.load('map'));
    
    instance.druid.new_button('gameover_close', () => Scene.load('map'));
    instance.druid.new_button('gameover_offer_close', disabled_gameover_offer);

    gui.set_text(gui.get_node('steps_by_ad/text'), "+3 хода");
    instance.druid.new_button('steps_by_ad/button', () => EventBus.send('REVIVE', 3));
    
    gui.set_text(gui.get_node('steps_by_coins/text'), "+5 ходов    500");
    instance.druid.new_button('steps_by_coins/button', () => {
        if(!is_enough_coins(500)) return;
        remove_coins(500);
        EventBus.send('REVIVE', 5);
    });
}

function set_events(instance: props) {
    EventBus.on('INIT_UI', () => setup(instance));
    EventBus.on('UPDATED_STEP_COUNTER', (steps) => {
        print("RECIVE STEPS: ", steps);
        set_text('steps', steps);
    }, true);
    EventBus.on('UPDATED_TARGET', (data) => update_targets(data), true);
    EventBus.on('UPDATED_BUTTONS', () => update_buttons(instance), true);
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

function update_buttons(instance: props) {
    const spinning = GameStorage.get('spinning_counts');
    set_text('spinning/counts', (spinning == 0) ? "+" : spinning);
    set_text_colors(['spinning/button'], '#fff', instance.busters.spinning.active ? 0.5 : 1);
    
    const hammer = GameStorage.get('hammer_counts');
    set_text('hammer/counts', (hammer == 0) ? "+" : hammer);
    set_text_colors(['hammer/button'], '#fff', instance.busters.hammer.active ? 0.5 : 1);
    
    const horizontal_rocket = GameStorage.get('horizontal_rocket_counts');
    set_text('horizontal_rocket/counts', (horizontal_rocket == 0) ? "+" : horizontal_rocket);
    set_text_colors(['horizontal_rocket/button'], '#fff', instance.busters.horizontal_rocket.active ? 0.5 : 1);
    
    const vertical_rocket = GameStorage.get('vertical_rocket_counts');
    set_text('vertical_rocket/counts', (vertical_rocket == 0) ? "+" : vertical_rocket);
    set_text_colors(['vertical_rocket/button'], '#fff', instance.busters.vertical_rocket.active ? 0.5 : 1);
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

function set_gameover(state: GameState) {
    disable_game_ui();
    
    gui.set_enabled(gui.get_node('gameover'), true);
    gui.set_enabled(gui.get_node('missing_targets'), true);

    const target_1 = gui.get_node('target_1');
    const target_2 = gui.get_node('target_2');
    const target_3 = gui.get_node('target_3');
    
    if(state.targets.length == 1) {
        const target1 = state.targets[0];
        const view1 = target1.is_cell ? GAME_CONFIG.cell_view[target1.type as CellId] : GAME_CONFIG.element_view[target1.type as ElementId];
        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);
        
        gui.set_text(gui.get_node('target_1_text'), tostring(target1.uids.length + "/" + target1.count));

        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);
        
        gui.set_position(target_1, vmath.vector3(0, 0, 0));
        gui.set_enabled(target_1, true);
    }
    else if(state.targets.length == 2) {
        const target1 = state.targets[0];
        const view1 = target1.is_cell ? GAME_CONFIG.cell_view[target1.type as CellId] : GAME_CONFIG.element_view[target1.type as ElementId];
        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);
        
        gui.set_text(gui.get_node('target_1_text'), tostring(target1.uids.length + "/" + target1.count));
        
        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);
        
        gui.set_position(target_1, vmath.vector3(-70, 0, 0));
        gui.set_enabled(target_1, true);
        
        const target2 = state.targets[1];
        const view2 = target2.is_cell ? GAME_CONFIG.cell_view[target2.type as CellId] : GAME_CONFIG.element_view[target2.type as ElementId];
        gui.play_flipbook(gui.get_node('target_2'), (view2 == 'cell_web') ? view2 + '_ui' : view2);
        
        gui.set_text(gui.get_node('target_2_text'), tostring(target2.uids.length + "/" + target2.count));
        
        gui.set_enabled(gui.get_node('target_2_fail_icon'), target2.uids.length < target2.count);
        
        gui.set_position(target_2, vmath.vector3(70, 0, 0));
        gui.set_enabled(target_2, true);
    }
    else if(state.targets.length == 3) {
        const target1 = state.targets[0];
        const view1 = target1.is_cell ? GAME_CONFIG.cell_view[target1.type as CellId] : GAME_CONFIG.element_view[target1.type as ElementId];
        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);
        
        gui.set_text(gui.get_node('target_1_text'), tostring(target1.uids.length + "/" + target1.count));

        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);
        
        gui.set_position(target_1, vmath.vector3(-125, 0, 0));
        gui.set_enabled(target_1, true);
    
        const target2 = state.targets[1];
        const view2 = target2.is_cell ? GAME_CONFIG.cell_view[target2.type as CellId] : GAME_CONFIG.element_view[target2.type as ElementId];
        gui.play_flipbook(gui.get_node('target_2'), (view2 == 'cell_web') ? view2 + '_ui' : view2);

        gui.set_text(gui.get_node('target_2_text'), tostring(target2.uids.length + "/" + target2.count));

        gui.set_enabled(gui.get_node('target_2_fail_icon'), target2.uids.length < target2.count);
        
        gui.set_position(target_2, vmath.vector3(0, 0, 0));
        gui.set_enabled(target_2, true);
    
        const target3 = state.targets[2];
        const view3 = target3.is_cell ? GAME_CONFIG.cell_view[target3.type as CellId] : GAME_CONFIG.element_view[target3.type as ElementId];
        gui.play_flipbook(gui.get_node('target_3'), (view3 == 'cell_web') ? view3 + '_ui' : view3);

        gui.set_text(gui.get_node('target_3_text'), tostring(target3.uids.length + "/" + target3.count));

        gui.set_enabled(gui.get_node('target_3_fail_icon'), target3.uids.length < target3.count);

        gui.set_position(target_3, vmath.vector3(125, 0, 0));
        gui.set_enabled(target_3, true);
    }

    set_gameover_offer();
}

function set_gameover_offer() {
    gui.set_enabled(gui.get_node('gameover_offer_close'), true);
    gui.set_enabled(gui.get_node('steps_by_ad/button'), true);
    gui.set_enabled(gui.get_node('steps_by_coins/button'), true);
}

function disabled_gameover_offer() {
    remove_lifes(1);

    gui.set_enabled(gui.get_node('damage'), false);
    gui.set_enabled(gui.get_node('gameover_offer_close'), false);
    gui.set_enabled(gui.get_node('steps_by_ad/button'), false);
    gui.set_enabled(gui.get_node('steps_by_coins/button'), false);
    
    gui.set_enabled(gui.get_node('gameover_close'), true);
    gui.set_enabled(gui.get_node('restart_button'), true);
    gui.set_enabled(gui.get_node('map_button'), true);
}

function disable_game_ui() {
    gui.set_enabled(gui.get_node('substrate'), false);
    gui.set_enabled(gui.get_node('buster_buttons'), false);
    gui.set_enabled(gui.get_node('system_buttons'), false);
}