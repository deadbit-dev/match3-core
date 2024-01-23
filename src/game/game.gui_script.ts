/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as druid from 'druid.druid';

interface props {
    druid: DruidClass;
    busters: any;
}

export function init(this: props): void {
    Manager.init_gui();
    
    this.druid = druid.new(this);
    this.busters = GAME_CONFIG.levels[GameStorage.get('current_level')]['busters'];
    
    this.druid.new_button('restart_button', () => {
        Scene.restart();
    });

    this.druid.new_button('hammer_button',() => {
        if(GameStorage.get('hammer_counts') > 0) this.busters.hammer_active = !this.busters.hammer_active;
    });
}

export function on_input(this: props, action_id: string | hash, action: unknown): void {
    return this.druid.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid.update(dt);

    gui.set_alpha(gui.get_node('hammer_button'), this.busters.hammer_active ? 0.5 : 1);
    gui.set_text(gui.get_node('hammer_counts'), GameStorage.get('hammer_counts').toString());
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    Manager.on_message_gui(this, message_id, message, sender);
    this.druid.on_message(message_id, message, sender);
}

export function final(this: props): void {
    this.druid.final();
}