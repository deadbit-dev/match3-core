/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';
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

    if(this.level['time'] != undefined) {
        const node = gui.get_node('timer');
        gui.set_enabled(node, true);

        if(this.level['steps'] == undefined) {
            gui.set_position(node, vmath.vector3(0, -20, 0));
            gui.set_scale(node, vmath.vector3(0.6, 0.6, 1));
        } else {
            gui.set_position(node, vmath.vector3(0, -5, 0));
            gui.set_scale(node, vmath.vector3(0.5, 0.5, 1));
        }

        set_text('time', parse_time(this.level['time']));
    }

    if(this.level['steps'] != undefined) {
        const node = gui.get_node('step_counter');
        gui.set_enabled(node, true);

        if(this.level['time'] == undefined) {
            gui.set_position(node, vmath.vector3(0, -25, 0));
            gui.set_scale(node, vmath.vector3(0.7, 0.7, 1));
        } else {
            gui.set_position(node, vmath.vector3(0, -45, 0));
            gui.set_scale(node, vmath.vector3(0.5, 0.5, 1));
        }

        set_text('steps', this.level['steps']);
    }

    const targets = this.level['targets'];
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

    this.druid.new_button('back_button', () => {
        Scene.load('map');
    });
    
    this.druid.new_button('restart_button', () => Scene.restart());
    this.druid.new_button('revert_step_button', () => EventBus.send('TRY_REVERT_STEP'));
    
    if(GameStorage.get('spinning_opened')) {
        this.druid.new_button('spinning/button', () => {
            if(GameStorage.get('spinning_counts') > 0) this.busters.spinning.active = !this.busters.spinning.active;
        
            this.busters.hammer.active = false;
            this.busters.horizontal_rocket.active = false;
            this.busters.vertical_rocket.active = false;

            EventBus.send('TRY_ACTIVATE_SPINNING');
            EventBus.send('UPDATED_BUTTONS');
        });

        gui.set_enabled(gui.get_node('spinning/lock'), false);
        gui.set_enabled(gui.get_node('spinning/icon'), true);
    }

    if(GameStorage.get('hammer_opened')) {
        this.druid.new_button('hammer/button', () => {
            if(GameStorage.get('hammer_counts') > 0) this.busters.hammer.active = !this.busters.hammer.active;
    
            this.busters.horizontal_rocket.active = false;
            this.busters.vertical_rocket.active = false;

            EventBus.send('UPDATED_BUTTONS');
        });
        
        gui.set_enabled(gui.get_node('hammer/lock'), false);
        gui.set_enabled(gui.get_node('hammer/icon'), true);
    }
     
    if(GameStorage.get('horizontal_rocket_opened')) {
        this.druid.new_button('horizontal_rocket/button', () => {
            if(GameStorage.get('horizontal_rocket_counts') > 0) this.busters.horizontal_rocket.active = !this.busters.horizontal_rocket.active;
            
            this.busters.hammer.active = false;
            this.busters.vertical_rocket.active = false;

            EventBus.send('UPDATED_BUTTONS');
        });
        
        gui.set_enabled(gui.get_node('horizontal_rocket/lock'), false);
        gui.set_enabled(gui.get_node('horizontal_rocket/icon'), true);
    }

    if(GameStorage.get('vertical_rocket_opened')) {
        this.druid.new_button('vertical_rocket/button', () => {
            if(GameStorage.get('vertical_rocket_counts') > 0) this.busters.vertical_rocket.active = !this.busters.vertical_rocket.active;
            
            this.busters.hammer.active = false;
            this.busters.horizontal_rocket.active = false;

            EventBus.send('UPDATED_BUTTONS');
        });
        
        gui.set_enabled(gui.get_node('vertical_rocket/lock'), false);
        gui.set_enabled(gui.get_node('vertical_rocket/icon'), true);
    }

    if(!GAME_CONFIG.animal_levels.includes(GameStorage.get('current_level') + 1))
        gui.set_enabled(gui.get_node('buster_buttons'), true);

    EventBus.on('UPDATED_STEP_COUNTER', (steps) => {
        set_text('steps', steps);
    }, true);

    EventBus.on('UPDATED_TARGET', (data) => {
        switch(data.id) {
            case 0: set_text('first_target_counts', data.count); break;
            case 1: set_text('second_target_counts', data.count); break;
            case 2: set_text('third_target_counts', data.count); break;
        }
    }, true);
    
    EventBus.on('UPDATED_BUTTONS', () => {
        set_text_colors(['spinning/button'], '#fff', this.busters.spinning.active ? 0.5 : 1);
        set_text('spinning/counts', GameStorage.get('spinning_counts'));
        
        set_text_colors(['hammer/button'], '#fff', this.busters.hammer.active ? 0.5 : 1);
        set_text('hammer/counts', GameStorage.get('hammer_counts'));
        
        set_text_colors(['horizontal_rocket/button'], '#fff', this.busters.horizontal_rocket.active ? 0.5 : 1);
        set_text('horizontal_rocket/counts', GameStorage.get('horizontal_rocket_counts'));
        
        set_text_colors(['vertical_rocket/button'], '#fff', this.busters.vertical_rocket.active ? 0.5 : 1);
        set_text('vertical_rocket/counts', GameStorage.get('vertical_rocket_counts'));
    }, true);
    
    EventBus.on('GAME_TIMER', (time) => {
        set_text('time', parse_time(time));
    }, true);
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