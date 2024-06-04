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

    setup(this);
    set_events(this);
}

export function on_input(this: props, action_id: string | hash, action: any): void {
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
    EventBus.on('ON_SCENE_LOADED', (message) => {
        switch(message.name) {
            case 'game':
                set_enabled_coins(false);
                set_enabled_lifes(false);
            break;
            case 'map':
                set_enabled_coins(true);
                set_enabled_lifes(true);
            break;
        }
    }, true);
}

function setup(data: props) {
    setup_coins(data);
    setup_life(data);
    setup_store(data);
}

function setup_coins(data: props) {
    data.druid.new_button('coins/button', () => {
        const store = gui.get_node('store/manager');
        gui.set_enabled(store, true);
    });

    gui.set_text(gui.get_node('coins/text'), tostring(GameStorage.get('coins')));
}

function setup_life(data: props) {
    data.druid.new_button('lifes/button', () => {
        const store = gui.get_node('store/manager');
        gui.set_enabled(store, true);
    });

    gui.set_text(gui.get_node('lifes/text'), tostring(GameStorage.get('lifes')));
}

function setup_store(data: props) {
    gui.set_render_order(1);

    data.druid.new_button('store/close', () => {
        const store = gui.get_node('store/manager');
        gui.set_enabled(store, false);
    });

    data.druid.new_button('store/buy_30_btn', () => add_coins(30));
    data.druid.new_button('store/buy_150_btn', () => add_coins(150));
    data.druid.new_button('store/buy_300_btn', () => add_coins(300));
    data.druid.new_button('store/buy_800_btn', () => add_coins(800));

    data.druid.new_button('store/buy_x1_btn', () => {
        if(!is_enough_coins(30)) return;

        add_lifes(1);
        remove_coins(30);
    });

    data.druid.new_button('store/buy_x2_btn', () => {
        if(!is_enough_coins(50)) return;

        add_lifes(2);
        remove_coins(50);
    });

    data.druid.new_button('store/buy_x3_btn', () => {
        if(!is_enough_coins(70)) return;

        add_lifes(3);
        remove_coins(70);
    });

    data.druid.new_button('store/junior_box/buy_button/button', () => {
        if(!is_enough_coins(90)) return;

        remove_coins(90);
        add_coins(150);
        // update_lifes(Infinity);
        
        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') + 1);
        GameStorage.set('spinning_counts', GameStorage.get('spinning_counts') + 1);
        GameStorage.set('horizontal_rocket_counts', GameStorage.get('horizontal_rocket_counts') + 1);
        GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') + 1);
    });
    
    data.druid.new_button('store/junior_box/buy_button/button', () => {
        if(!is_enough_coins(180)) return;

        remove_coins(180);
        add_coins(300);
        // update_lifes(Infinity);
        
        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') + 2);
        GameStorage.set('spinning_counts', GameStorage.get('spinning_counts') + 2);
        GameStorage.set('horizontal_rocket_counts', GameStorage.get('horizontal_rocket_counts') + 2);
        GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') + 2);
    });

    data.druid.new_button('store/buy_ad_1_btn', () => {
        if(!is_enough_coins(100)) return;
        remove_coins(100);
    });

    data.druid.new_button('store/buy_ad_7_btn', () => {
        if(!is_enough_coins(250)) return;
        remove_coins(250);
    });

    data.druid.new_button('store/buy_ad_30_btn', () => {
        if(!is_enough_coins(600)) return;
        remove_coins(600);
    });
}

function is_enough_coins(amount: number) {
    return GameStorage.get('coins') >= amount;
}

function set_enabled_coins(state: boolean) {
    const coins = gui.get_node('coins/button');
    gui.set_enabled(coins, state);
}

function set_enabled_lifes(state: boolean) {
    const coins = gui.get_node('lifes/button');
    gui.set_enabled(coins, state);
}

function add_coins(amount: number) {
    let coins = GameStorage.get('coins');
    coins = math.max(coins + amount, 10000);
    
    const coins_text = gui.get_node('coins/text');
    gui.set_text(coins_text, tostring(coins));
    
    GameStorage.set('coins', coins);
}

function remove_coins(amount: number) {
    let coins = GameStorage.get('coins');
    coins -= amount;
    
    const coins_text = gui.get_node('coins/text');
    gui.set_text(coins_text, tostring(coins));
    
    GameStorage.set('coins', coins);
}

function add_lifes(amount: number) {
    let lifes = GameStorage.get('lifes');
    lifes += amount;

    const lifes_text = gui.get_node('lifes/text');
    gui.set_text(lifes_text, tostring(lifes));
    GameStorage.set('lifes', lifes);
}

function remove_lifes(amount: number) {
    let lifes = GameStorage.get('lifes');
    lifes -= amount;

    const lifes_text = gui.get_node('lifes/text');
    gui.set_text(lifes_text, tostring(lifes));
    GameStorage.set('lifes', lifes);
}