/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';
import { NameMessage } from '../../modules/modules_const';
import { parse_time } from '../../utils/utils';
import { add_coins, is_enough_coins, remove_coins } from '../coins';
import { add_lifes, is_max_lifes, remove_lifes } from '../life';


interface props {
    druid: DruidClass,
}

export function init(this: props): void {
    Manager.init_script();

    this.druid = druid.new(this);

    gui.set_render_order(10);

    setup(this);
    set_events();

    timer.delay(1200, true, () => add_lifes(1));
    
    on_life_tick();
    timer.delay(1, true, on_life_tick);

    on_infinit_life_tick();
    timer.delay(1, true, on_infinit_life_tick);
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    this.druid?.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid?.update(dt);
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    Manager.on_message(this, message_id, message, sender);
    this.druid?.on_message(message_id, message, sender);
}

export function final(this: props): void {
    this.druid.final();
    Manager.final_script();
}

function set_events() {
    EventBus.on('ON_SCENE_LOADED', on_scene_loaded, true);
    EventBus.on('ON_GAME_OVER', on_gameover, true);
    EventBus.on('SET_LIFE_NOTIFICATION', () => set_enabled_life_notification(true), true);
    EventBus.on('ADDED_LIFE', on_add_lifes, true);
    EventBus.on('REMOVED_LIFE', on_remove_lifes, true);
    EventBus.on('ADDED_COIN', on_add_coins, true);
    EventBus.on('REMOVED_COIN', on_remove_coins, true);
    EventBus.on('NOT_ENOUGH_LIFE', () => set_enabled_life_notification(true), true);
    EventBus.on('TRY_BUY_HAMMER', () => set_enabled_hammer(true), true);
    EventBus.on('TRY_BUY_SPINNING', () => set_enabled_spinning(true), true);
    EventBus.on('TRY_BUY_HORIZONTAL_ROCKET', () => set_enabled_horizontall_rocket(true), true);
    EventBus.on('TRY_BUY_VERTICAL_ROCKET', () => set_enabled_vertical_rocket(true), true);
}

function setup(instance: props) {
    setup_coins(instance);
    setup_life(instance);
    setup_store(instance);
    setup_settings(instance);
    setup_life_notification(instance);
    setup_busters(instance);
}

function setup_coins(instance: props) {
    instance.druid.new_button('coins/button', () => set_enabled_store(true));
    gui.set_text(gui.get_node('coins/text'), tostring(GameStorage.get('coins')));
}

function setup_life(instance: props) {
    instance.druid.new_button('lifes/button', () => set_enabled_store(true));
    gui.set_text(gui.get_node('lifes/text'), tostring(GameStorage.get('life').amount));
}

function setup_store(instance: props) {
    instance.druid.new_button('store_button', () => set_enabled_store(true));

    instance.druid.new_button('store/close', () => set_enabled_store(false));

    gui.set_text(gui.get_node('store/store_title_text'), Lang.get_text('store_title'));
    
    instance.druid.new_button('store/buy_30_btn', () => add_coins(30));
    instance.druid.new_button('store/buy_150_btn', () => add_coins(150));
    instance.druid.new_button('store/buy_300_btn', () => add_coins(300));
    instance.druid.new_button('store/buy_800_btn', () => add_coins(800));

    gui.set_text(gui.get_node('store/life_title_text'), Lang.get_text('lifes'));

    instance.druid.new_button('store/buy_x1_btn', () => {
        if(!is_enough_coins(30) || is_max_lifes()) return;

        add_lifes(1);
        remove_coins(30);
    });

    instance.druid.new_button('store/buy_x2_btn', () => {
        if(!is_enough_coins(50) || is_max_lifes()) return;

        add_lifes(2);
        remove_coins(50);
    });

    instance.druid.new_button('store/buy_x3_btn', () => {
        if(!is_enough_coins(70) || is_max_lifes()) return;

        add_lifes(3);
        remove_coins(70);
    });

    gui.set_text(gui.get_node('store/junior_box/text'), Lang.get_text('junior_box'));

    instance.druid.new_button('store/junior_box/buy_button/button', () => {
        if(!is_enough_coins(90)) return;

        remove_coins(90);
        add_coins(150);
        
        set_infinit_life(1);
        
        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') + 1);
        GameStorage.set('spinning_counts', GameStorage.get('spinning_counts') + 1);
        GameStorage.set('horizontal_rocket_counts', GameStorage.get('horizontal_rocket_counts') + 1);
        GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') + 1);
    });

    gui.set_text(gui.get_node('store/catlover_box/text'), Lang.get_text('catlover_box'));
    
    instance.druid.new_button('store/catlover_box/buy_button/button', () => {
        if(!is_enough_coins(180)) return;

        remove_coins(180);
        add_coins(300);

        set_infinit_life(24);
        
        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') + 2);
        GameStorage.set('spinning_counts', GameStorage.get('spinning_counts') + 2);
        GameStorage.set('horizontal_rocket_counts', GameStorage.get('horizontal_rocket_counts') + 2);
        GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') + 2);
    });

    gui.set_text(gui.get_node('store/ad_title_text'), Lang.get_text('remove_ad'));

    instance.druid.new_button('store/buy_ad_1_btn', () => {
        if(!is_enough_coins(100)) return;
        remove_coins(100);
    });

    instance.druid.new_button('store/buy_ad_7_btn', () => {
        if(!is_enough_coins(250)) return;
        remove_coins(250);
    });

    instance.druid.new_button('store/buy_ad_30_btn', () => {
        if(!is_enough_coins(600)) return;
        remove_coins(600);
    });

    instance.druid.new_button('store/reset/button', () => {
        remove_coins(GameStorage.get('coins'));
        remove_lifes(GameStorage.get('life').amount);

        const life = GameStorage.get('life');
        life.start_time = System.now() - life.start_time;
        GameStorage.set('life', life);
        on_life_tick();

        const infinit_life = GameStorage.get('infinit_life');
        infinit_life.start_time = System.now() - infinit_life.duration;
        GameStorage.set('infinit_life', infinit_life);
        on_infinit_life_tick();

        GameStorage.set('hammer_counts', 0);
        GameStorage.set('spinning_counts', 0);
        GameStorage.set('horizontal_rocket_counts', 0);
        GameStorage.set('vertical_rocket_counts', 0);
    });
}

function setup_settings(instance: props) {
    instance.druid.new_button('settings_button', () => {});
}

function setup_busters(instance: props) {
    setup_hammer(instance);
    setup_spinning(instance);
    setup_horizontal_rocket(instance);
    setup_vertical_rocket(instance);
}

function setup_hammer(instance: props) {
    gui.set_text(gui.get_node('hammer/title_text'), Lang.get_text('hammer'));
    gui.set_text(gui.get_node('hammer/description'), Lang.get_text('hammer_description'));
    gui.set_text(gui.get_node('hammer/buy_button_text'), Lang.get_text('buy') + " 30");

    instance.druid.new_button('hammer/buy_button', () => {
        if(!is_enough_coins(30)) return;
        remove_coins(30);
        GameStorage.set('hammer_counts', 1);
        EventBus.send('UPDATED_BUTTONS');
        set_enabled_hammer(false);
    });

    instance.druid.new_button('hammer/close', () => set_enabled_hammer(false));
}

function setup_spinning(instance: props) {
    gui.set_text(gui.get_node('spinning/title_text'), Lang.get_text('spinning'));
    gui.set_text(gui.get_node('spinning/description'), Lang.get_text('spinning_description'));
    gui.set_text(gui.get_node('spinning/buy_button_text'), Lang.get_text('buy') + " 30");

    instance.druid.new_button('spinning/buy_button', () => {
        if(!is_enough_coins(30)) return;
        remove_coins(30);
        GameStorage.set('spinning_counts', 1);
        EventBus.send('UPDATED_BUTTONS');
        set_enabled_spinning(false);
    });

    instance.druid.new_button('spinning/close', () => set_enabled_spinning(false));
}

function setup_horizontal_rocket(instance: props) {
    gui.set_text(gui.get_node('horizontal_rocket/title_text'), Lang.get_text('horizontal_rocket'));
    gui.set_text(gui.get_node('horizontal_rocket/description'), Lang.get_text('horizontal_rocket_description'));
    gui.set_text(gui.get_node('horizontal_rocket/buy_button_text'), Lang.get_text('buy') + " 30");
    
    instance.druid.new_button('horizontal_rocket/buy_button', () => {
        if(!is_enough_coins(30)) return;
        remove_coins(30);
        GameStorage.set('horizontal_rocket_counts', 1);
        EventBus.send('UPDATED_BUTTONS');
        set_enabled_horizontall_rocket(false);
    });

    instance.druid.new_button('horizontal_rocket/close', () => set_enabled_horizontall_rocket(false));
}

function setup_vertical_rocket(instance: props) {
    gui.set_text(gui.get_node('vertical_rocket/title_text'), Lang.get_text('vertical_rocket'));
    gui.set_text(gui.get_node('vertical_rocket/description'), Lang.get_text('vertical_rocket_description'));
    gui.set_text(gui.get_node('vertical_rocket/buy_button_text'), Lang.get_text('buy') + " 30");
    
    instance.druid.new_button('vertical_rocket/buy_button', () => {
        if(!is_enough_coins(30)) return;
        remove_coins(30);
        GameStorage.set('vertical_rocket_counts', 1);
        EventBus.send('UPDATED_BUTTONS');
        set_enabled_vertical_rocket(false);
    });

    instance.druid.new_button('vertical_rocket/close', () => set_enabled_vertical_rocket(false));
}

function setup_life_notification(instance: props) {
    instance.druid.new_button('life_notification/buy_button', () => {
        if(!is_enough_coins(30)) {
            set_enabled_life_notification(false);
            set_enabled_store(true);
            return;
        }

        set_enabled_life_notification(false);
        remove_coins(30);
        add_lifes(1);
    });

    instance.druid.new_button('life_notification/close', () => set_enabled_life_notification(false));
}

function on_life_tick() {
    const life = GameStorage.get('life');
    const delta = System.now() - life.start_time;

    gui.set_text(gui.get_node('life_notification/time_text'), parse_time(20 * 60 - delta));

    if(delta < 20 * 60) return;

    add_lifes(1);
    
    life.start_time = System.now();
    GameStorage.set('life', life);

}

function set_infinit_life(duration: number) {
    const life = GameStorage.get('infinit_life');
    life.is_active = true;
    life.duration = duration * 60 * 60;
    life.start_time = System.now();

    GameStorage.set('infinit_life', life);
}

function on_infinit_life_tick() {
    const life = GameStorage.get('infinit_life'); 
    if(!life.is_active) return;

    const delta = System.now() - life.start_time;
    
    gui.play_flipbook(gui.get_node('lifes/icon'), 'infinite_life_icon');
    const text = gui.get_node('lifes/text');
    gui.set_text(text, parse_time(life.duration - delta));
    gui.set_font(text, life.duration > (1 * 60 * 60) ? '18' : '27');
    
    if(delta >= life.duration) {
        life.is_active = false;
        GameStorage.set('infinit_life', life);
        gui.play_flipbook(gui.get_node('lifes/icon'), 'life_icon');
        gui.set_text(text, tostring(GameStorage.get('life').amount));
        gui.set_font(text, '32');
    }
}

// TODO: move set_enabled to utils with name and state args

function set_enabled_coins(state: boolean) {
    const coins = gui.get_node('coins/button');
    gui.set_enabled(coins, state);
}

function set_enabled_lifes(state: boolean) {
    const coins = gui.get_node('lifes/button');
    gui.set_enabled(coins, state);
}

function set_enabled_store_button(state: boolean) {
    const store_button = gui.get_node('store_button');
    gui.set_enabled(store_button, state);
}

function set_enabled_settings_button(state: boolean) {
    const settings_button = gui.get_node('settings_button');
    gui.set_enabled(settings_button, state);
}

function set_enabled_store(state: boolean) {
    const store = gui.get_node('store/manager');
    gui.set_enabled(store, state);

    EventBus.send('DLG_ACTIVE', state);
}

function set_enabled_life_notification(state: boolean) {
    const life = gui.get_node('life_notification/manager');
    gui.set_enabled(life, state);

    EventBus.send('LIFE_NOTIFICATION', state);
}

function on_add_coins() {
    const coins_text = gui.get_node('coins/text');
    gui.set_text(coins_text, tostring(GameStorage.get('coins')));
}

function on_remove_coins() {
    const coins_text = gui.get_node('coins/text');
    gui.set_text(coins_text, tostring(GameStorage.get('coins')));
}

function on_add_lifes() {
    if(GameStorage.get('infinit_life').is_active) return;

    const lifes_text = gui.get_node('lifes/text');
    gui.set_text(lifes_text, tostring(GameStorage.get('life').amount));
}

function on_remove_lifes() {
    if(GameStorage.get('infinit_life').is_active) return;

    const lifes_text = gui.get_node('lifes/text');
    gui.set_text(lifes_text, tostring(GameStorage.get('life').amount));

}

function on_scene_loaded(scene: NameMessage) {
    switch(scene.name) {
        case 'game':
            set_enabled_coins(false);
            set_enabled_lifes(false);
            set_enabled_store_button(false);
            set_enabled_settings_button(false);
        break;
        case 'map':
            set_enabled_coins(true);
            set_enabled_lifes(true);
            set_enabled_store_button(true);
            set_enabled_settings_button(true);
        break;
    }
}

function on_gameover() {
    set_enabled_coins(true);
    set_enabled_lifes(true);
}

function on_gameover_offer_close() {
    if(!GameStorage.get('infinit_life').is_active && GameStorage.get('life').amount == 0) {
        timer.delay(5, false, () => set_enabled_life_notification(true));
    }
}

function set_enabled_hammer(state: boolean) {
    const hammer = gui.get_node('hammer/manager');
    gui.set_enabled(hammer, state);

    EventBus.send('DLG_ACTIVE', state);
}

function set_enabled_spinning(state: boolean) {
    const spinning = gui.get_node('spinning/manager');
    gui.set_enabled(spinning, state);

    EventBus.send('DLG_ACTIVE', state);
}

function set_enabled_horizontall_rocket(state: boolean) {
    const horizontal_rocket = gui.get_node('horizontal_rocket/manager');
    gui.set_enabled(horizontal_rocket, state);

    EventBus.send('DLG_ACTIVE', state);
}

function set_enabled_vertical_rocket(state: boolean) {
    const vertical_rocket = gui.get_node('vertical_rocket/manager');
    gui.set_enabled(vertical_rocket, state);

    EventBus.send('DLG_ACTIVE', state);
}