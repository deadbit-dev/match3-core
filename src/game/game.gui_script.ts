/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as druid from 'druid.druid';
import { set_text, set_text_colors } from '../utils/utils';

interface props {
    druid: DruidClass;
    busters: any;
}

export function init(this: props): void {
    Manager.init_gui();
    
    this.druid = druid.new(this);
    this.busters = GAME_CONFIG.levels[GameStorage.get('current_level')]['busters'];

    set_text('current_level', GameStorage.get('current_level'));

    this.druid.new_button('previous_level_button', () => {
        let previous_level = GameStorage.get('current_level') - 1;
        if(previous_level < 0) return;
        
        GameStorage.set('current_level', previous_level);
        Scene.restart();
    });

    this.druid.new_button('next_level_button', () => {
        let next_level = GameStorage.get('current_level') + 1;
        if(next_level >= GAME_CONFIG.levels.length) return;
        
        GameStorage.set('current_level', next_level);
        Scene.restart();
    });
    
    this.druid.new_button('restart_button', () => Scene.restart());
    this.druid.new_button('revert_step_button', () => EventBus.send('TRY_REVERT_STEP'));
    
    this.druid.new_button('spinning_button', () => {
        if(GameStorage.get('spinning_counts') > 0) this.busters.spinning_active = !this.busters.spinning_active;
    
        this.busters.hammer_active = false;
        this.busters.horizontal_rocket_active = false;
        this.busters.vertical_rocket_active = false;

        EventBus.send('TRY_ACTIVATE_SPINNING');
        EventBus.send('UPDATED_BUTTONS');
    });

    this.druid.new_button('hammer_button', () => {
        if(GameStorage.get('hammer_counts') > 0) this.busters.hammer_active = !this.busters.hammer_active;
 
        this.busters.horizontal_rocket_active = false;
        this.busters.vertical_rocket_active = false;

        EventBus.send('UPDATED_BUTTONS');
    });
    
    this.druid.new_button('horizontal_rocket_button', () => {
        if(GameStorage.get('horizontal_rocket_counts') > 0) this.busters.horizontal_rocket_active = !this.busters.horizontal_rocket_active;
        
        this.busters.hammer_active = false;
        this.busters.vertical_rocket_active = false;

        EventBus.send('UPDATED_BUTTONS');
    });

    this.druid.new_button('vertical_rocket_button', () => {
        if(GameStorage.get('vertical_rocket_counts') > 0) this.busters.vertical_rocket_active = !this.busters.vertical_rocket_active;
        
        this.busters.hammer_active = false;
        this.busters.horizontal_rocket_active = false;

        EventBus.send('UPDATED_BUTTONS');
    });
    
    EventBus.on('UPDATED_BUTTONS', () => {
        set_text_colors(['spinning_button'], '#fff', this.busters.spinning_active_active ? 0.5 : 1);
        set_text('spinning_counts', GameStorage.get('spinning_counts'));
        
        set_text_colors(['hammer_button'], '#fff', this.busters.hammer_active ? 0.5 : 1);
        set_text('hammer_counts', GameStorage.get('hammer_counts'));
        
        set_text_colors(['horizontal_rocket_button'], '#fff', this.busters.horizontal_rocket_active ? 0.5 : 1);
        set_text('horizontal_rocket_counts', GameStorage.get('horizontal_rocket_counts'));
        
        set_text_colors(['vertical_rocket_button'], '#fff', this.busters.vertical_rocket_active ? 0.5 : 1);
        set_text('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts'));
    });
}

export function on_input(this: props, action_id: string | hash, action: unknown): void {
    return this.druid.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid.update(dt);
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    Manager.on_message_gui(this, message_id, message, sender);
    this.druid.on_message(message_id, message, sender);
}

export function final(this: props): void {
    this.druid.final();
    EventBus.off_all_current_script();
}