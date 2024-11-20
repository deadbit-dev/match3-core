/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';
import { add_lifes, add_coins, is_max_lifes, is_enough_coins, remove_coins, remove_lifes, get_current_level, remove_ad } from '../../game/utils';
import { NameMessage } from '../../modules/modules_const';
import { parse_time, set_text } from '../../utils/utils';
import { Dlg } from '../game_config';

interface props {
    druid: DruidClass,
    dlg_opened: boolean,
    is_store_open: boolean
}

export function init(this: props): void {
    Manager.init_script();

    this.druid = druid.new(this);

    gui.set_render_order(10);

    setup(this);
    set_events(this);

    on_life_tick();
    timer.delay(1, true, on_life_tick);

    on_infinit_life_tick();
    timer.delay(1, true, on_infinit_life_tick);

    if (Scene.get_current_name() == 'movie') {
        set_enabled_coins(false);
        set_enabled_lifes(false);
        set_enabled_store_button(false);
        set_enabled_sound_button(false);
        set_enabled_music_button(false);
    }
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    GAME_CONFIG.is_busy_input = this.druid?.on_input(action_id, action);
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

function set_events(data: props) {
    EventBus.on('ON_SCENE_LOADED', on_scene_loaded, true);
    EventBus.on('ON_GAME_OVER', on_gameover, true);
    EventBus.on('SET_LIFE_NOTIFICATION', () => set_enabled_life_notification(true), true);
    EventBus.on('ADDED_LIFE', on_add_lifes, true);
    EventBus.on('REMOVED_LIFE', on_remove_lifes, true);
    EventBus.on('ADDED_COIN', on_add_coins, true);
    EventBus.on('REMOVED_COIN', on_remove_coins, true);
    EventBus.on('NOT_ENOUGH_LIFE', () => set_enabled_life_notification(true), true);
    EventBus.on('REQUEST_OPEN_STORE', () => set_enabled_store(data, true));
    EventBus.on('TRY_BUY_HAMMER', () => {
        if (data.dlg_opened) return;
        set_enabled_hammer(data, true);
    }, true);
    EventBus.on('TRY_BUY_SPINNING', () => {
        if (data.dlg_opened) return;
        set_enabled_spinning(data, true);
    }, true);
    EventBus.on('TRY_BUY_HORIZONTAL_ROCKET', () => {
        if (data.dlg_opened) return;
        set_enabled_horizontall_rocket(data, true);
    }, true);
    EventBus.on('TRY_BUY_VERTICAL_ROCKET', () => {
        if (data.dlg_opened) return;
        set_enabled_vertical_rocket(data, true);
    }, true);
    EventBus.on('PURCHASE_INITIALIZED', () => {
        // products
        if (GAME_CONFIG.products.length >= 3) {
            const maney150 = GAME_CONFIG.products.filter(p => p.id == 'maney150')[0];
            const maney300 = GAME_CONFIG.products.filter(p => p.id == 'maney300')[0];
            const maney800 = GAME_CONFIG.products.filter(p => p.id == 'maney800')[0];

            set_text('store/buy_150_text', maney150.priceValue + ' ' + maney150.priceCurrencyCode);
            set_text('store/buy_300_text', maney300.priceValue + ' ' + maney300.priceCurrencyCode);
            set_text('store/buy_800_text', maney800.priceValue + ' ' + maney800.priceCurrencyCode);

            /*
            const noads1 = GAME_CONFIG.products.filter(p => p.id == 'noads1')[0];
            const noads7 = GAME_CONFIG.products.filter(p => p.id == 'noads7')[0];
            const noads30 = GAME_CONFIG.products.filter(p => p.id == 'noads30')[0];

            set_text('store/buy_ad_1_text', noads1.priceValue + ' ' + noads1.priceCurrencyCode);
            set_text('store/buy_ad_7_text', noads7.priceValue + ' ' + noads7.priceCurrencyCode);
            set_text('store/buy_ad_30_text', noads30.priceValue + ' ' + noads30.priceCurrencyCode);
            */
        }
    });
    EventBus.on('SOUND_BUTTON', on_sound, false);
    EventBus.on('MUSIC_BUTTON', on_music, false);
}

function setup(data: props) {
    setup_coins(data);
    setup_life(data);
    setup_store(data);
    setup_right_container(data);
    setup_life_notification(data);
    setup_not_enough_coins(data);
    setup_busters(data);
}

function setup_coins(data: props) {
    data.druid.new_button('coins/box', () => set_enabled_store(data, true));
    gui.set_text(gui.get_node('coins/text'), tostring(GameStorage.get('coins')));
}

function setup_life(data: props) {
    data.druid.new_button('lifes/box', () => set_enabled_store(data, true));
    gui.set_text(gui.get_node('lifes/text'), tostring(GameStorage.get('life').amount));
}

function setup_store(data: props) {
    data.druid.new_button('store/close', () => set_enabled_store(data, false));

    gui.set_text(gui.get_node('store/store_title_text'), Lang.get_text('store_title'));

    data.druid.new_button('store/buy_150_btn', () => {
        if (HtmlBridge == null) {
            Sound.play('purchase');
            add_coins(150);
            return;
        }

        HtmlBridge.purchase({ id: 'maney150' }, (result, purchase) => {
            if (!result)
                return () => { };

            Sound.play('purchase');
            add_coins(150);

            GameStorage.set('was_purchased', true);

            Metrica.report('data', { shop: { buy: 'maney150' } });

            HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
        });
    });

    data.druid.new_button('store/buy_300_btn', () => {
        if (HtmlBridge == null) {
            Sound.play('purchase');
            add_coins(300);
            return;
        }

        HtmlBridge.purchase({ id: 'maney300' }, (result, purchase) => {
            if (!result)
                return () => { };

            Sound.play('purchase');
            add_coins(300);

            GameStorage.set('was_purchased', true);

            Metrica.report('data', { shop: { buy: 'maney300' } });

            HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
        });
    });

    data.druid.new_button('store/buy_800_btn', () => {
        if (HtmlBridge == null) {
            Sound.play('purchase');
            add_coins(800);
            return;
        }

        HtmlBridge.purchase({ id: 'maney800' }, (result, purchase) => {
            if (!result)
                return () => { };

            Sound.play('purchase');
            add_coins(800);

            GameStorage.set('was_purchased', true);

            Metrica.report('data', { shop: { buy: 'maney800' } });

            HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
        });
    });

    gui.set_text(gui.get_node('store/life_title_text'), Lang.get_text('lifes'));

    data.druid.new_button('store/buy_x1_btn', () => {
        // if(is_max_lifes()) return;
        if (!is_enough_coins(20)) {
            return set_enabled_not_enough_coins(data, true);
        }

        Sound.play('purchase');

        add_lifes(1);
        remove_coins(20);

        Metrica.report('data', { shop: { buy: 'life1' } });
    });

    data.druid.new_button('store/buy_x2_btn', () => {
        // if(is_max_lifes()) return;
        if (!is_enough_coins(35)) {
            return set_enabled_not_enough_coins(data, true);
        }

        Sound.play('purchase');

        add_lifes(2);
        remove_coins(35);

        Metrica.report('data', { shop: { buy: 'life2' } });
    });

    data.druid.new_button('store/buy_x3_btn', () => {
        // if(is_max_lifes()) return;
        if (!is_enough_coins(50)) {
            return set_enabled_not_enough_coins(data, true);
        }

        Sound.play('purchase');

        add_lifes(3);
        remove_coins(50);

        Metrica.report('data', { shop: { buy: 'life3' } });
    });

    gui.set_text(gui.get_node('store/junior_box/text'), Lang.get_text('junior_box'));

    data.druid.new_button('store/junior_box/buy_button/button', () => {
        if (!is_enough_coins(60)) return set_enabled_not_enough_coins(data, true);

        Sound.play('purchase');

        remove_coins(60);

        set_infinit_life(1);

        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') + 1);
        GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') + 1);

        EventBus.send('UPDATED_BUTTONS');

        Metrica.report('data', { shop: { buy: 'set1' } });
        Metrica.report('data', { 'buy_0': { id: 'hammer' } });
        Metrica.report('data', { 'buy_0': { id: 'vertical_rocket' } });
    });

    gui.set_text(gui.get_node('store/catlover_box/text'), Lang.get_text('catlover_box'));

    data.druid.new_button('store/catlover_box/buy_button/button', () => {
        if (!is_enough_coins(100)) return set_enabled_not_enough_coins(data, true);

        Sound.play('purchase');

        remove_coins(100);

        set_infinit_life(24);

        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') + 2);
        GameStorage.set('spinning_counts', GameStorage.get('spinning_counts') + 1);
        GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') + 2);

        EventBus.send('UPDATED_BUTTONS');

        Metrica.report('data', { shop: { buy: 'set2' } });

        Metrica.report('data', { 'buy_0': { level: 0, id: 'hammer' } });
        Metrica.report('data', { 'buy_0': { level: 0, id: 'hammer' } });
        Metrica.report('data', { 'buy_0': { level: 0, id: 'spinning' } });
        Metrica.report('data', { 'buy_0': { level: 0, id: 'vertical_rocket' } });
        Metrica.report('data', { 'buy_0': { level: 0, id: 'vertical_rocket' } });
    });

    gui.set_text(gui.get_node('store/ad_title_text'), Lang.get_text('remove_ad'));

    data.druid.new_button('store/buy_ad_1_btn', () => {
        if (HtmlBridge == null) {
            Sound.play('purchase');
            remove_ad(24 * 60 * 60); // one day
            return;
        }

        HtmlBridge.purchase({ id: 'noads1' }, (result, purchase) => {
            if (!result)
                return () => { };

            Sound.play('purchase');
            remove_ad(24 * 60 * 60); // 1 day

            Metrica.report('data', { shop: { buy: 'noads1' } });

            HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
        });
    });

    data.druid.new_button('store/buy_ad_7_btn', () => {
        if (HtmlBridge == null) {
            Sound.play('purchase');
            remove_ad(24 * 60 * 60 * 7); // 7 day's
            return;
        }

        HtmlBridge.purchase({ id: 'noads7' }, (result, purchase) => {
            if (!result)
                return () => { };

            Sound.play('purchase');
            remove_ad(24 * 60 * 60 * 7); // 7 day's

            Metrica.report('data', { shop: { buy: 'noads7' } });

            HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
        });
    });

    data.druid.new_button('store/buy_ad_30_btn', () => {
        if (HtmlBridge == null) {
            Sound.play('purchase');
            remove_ad(24 * 60 * 60 * 30); // 30 day's
            return;
        }

        HtmlBridge.purchase({ id: 'noads30' }, (result, purchase) => {
            if (!result)
                return () => { };

            Sound.play('purchase');
            remove_ad(24 * 60 * 60 * 30); // 7 day's

            Metrica.report('data', { shop: { buy: 'noads30' } });

            HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
        });
    });

    if (GAME_CONFIG.debug_levels) {
        gui.set_enabled(gui.get_node('store/reset/button'), true);
        data.druid.new_button('store/reset/button', () => {
            remove_coins(GameStorage.get('coins'));
            remove_lifes(GameStorage.get('life').amount);

            const life = GameStorage.get('life');
            life.start_time = System.now();
            life.amount = 0;
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
}

function setup_right_container(data: props) {
    data.druid.new_button('store_button', () => set_enabled_store(data, true));

    data.druid.new_button('sound', on_sound);
    data.druid.new_button('music', on_music);

    const sound_off = gui.get_node('sound_off');
    const music_off = gui.get_node('music_off');

    gui.set_enabled(sound_off, !Sound.is_sfx_active());
    gui.set_enabled(music_off, !Sound.is_music_active());
}

function on_sound() {
    const sound_off = gui.get_node('sound_off');
    const state = !Sound.is_sfx_active();
    Sound.set_sfx_active(state);
    gui.set_enabled(sound_off, !state);
}

function on_music() {
    const music_off = gui.get_node('music_off');
    const state = !Sound.is_music_active();
    Sound.set_music_active(state);
    gui.set_enabled(music_off, !state);
}

function setup_busters(data: props) {
    setup_hammer(data);
    setup_spinning(data);
    setup_horizontal_rocket(data);
    setup_vertical_rocket(data);
}

function setup_hammer(data: props) {
    gui.set_text(gui.get_node('hammer/title_text'), Lang.get_text('hammer'));
    gui.set_text(gui.get_node('hammer/description'), Lang.get_text('hammer_description'));
    gui.set_text(gui.get_node('hammer/buy_button_text'), Lang.get_text('buy') + " 30");

    data.druid.new_button('hammer/buy_button', () => {
        if (!is_enough_coins(30)) {
            set_enabled_hammer(data, false);
            set_enabled_not_enough_coins(data, true);
            return;
        }
        remove_coins(30);
        GameStorage.set('hammer_counts', 1);
        EventBus.send('UPDATED_BUTTONS');
        set_enabled_hammer(data, false);

        Metrica.report('data', { ['buy_' + tostring(get_current_level() + 1)]: { id: 'hammer' } });
    });

    data.druid.new_button('hammer/close', () => {
        set_enabled_hammer(data, false);
    });
}

function setup_spinning(data: props) {
    gui.set_text(gui.get_node('spinning/title_text'), Lang.get_text('spinning'));
    gui.set_text(gui.get_node('spinning/description'), Lang.get_text('spinning_description'));
    gui.set_text(gui.get_node('spinning/buy_button_text'), Lang.get_text('buy') + " 30");

    data.druid.new_button('spinning/buy_button', () => {
        if (!is_enough_coins(30)) {
            set_enabled_spinning(data, false);
            set_enabled_not_enough_coins(data, true);
            return;
        }
        remove_coins(30);
        GameStorage.set('spinning_counts', 1);
        EventBus.send('UPDATED_BUTTONS');
        set_enabled_spinning(data, false);

        Metrica.report('data', { ['buy_' + tostring(get_current_level() + 1)]: { id: 'spinning' } });
    });

    data.druid.new_button('spinning/close', () => {
        set_enabled_spinning(data, false);
    });
}

function setup_horizontal_rocket(data: props) {
    gui.set_text(gui.get_node('horizontal_rocket/title_text'), Lang.get_text('rocket'));
    gui.set_text(gui.get_node('horizontal_rocket/description'), Lang.get_text('horizontal_rocket_description'));
    gui.set_text(gui.get_node('horizontal_rocket/buy_button_text'), Lang.get_text('buy') + " 30");

    data.druid.new_button('horizontal_rocket/buy_button', () => {
        if (!is_enough_coins(30)) {
            set_enabled_horizontall_rocket(data, false);
            set_enabled_not_enough_coins(data, true);
            return;
        }
        remove_coins(30);
        GameStorage.set('horizontal_rocket_counts', 1);
        EventBus.send('UPDATED_BUTTONS');
        set_enabled_horizontall_rocket(data, false);

        Metrica.report('data', { ['buy_' + tostring(get_current_level() + 1)]: { id: 'horizontal_rocket' } });
    });

    data.druid.new_button('horizontal_rocket/close', () => {
        set_enabled_horizontall_rocket(data, false);
    });
}

function setup_vertical_rocket(data: props) {
    gui.set_text(gui.get_node('vertical_rocket/title_text'), Lang.get_text('rocket'));
    gui.set_text(gui.get_node('vertical_rocket/description'), Lang.get_text('vertical_rocket_description'));
    gui.set_text(gui.get_node('vertical_rocket/buy_button_text'), Lang.get_text('buy') + " 30");

    data.druid.new_button('vertical_rocket/buy_button', () => {
        if (!is_enough_coins(30)) {
            set_enabled_vertical_rocket(data, false);
            set_enabled_not_enough_coins(data, true);
            return;
        }
        remove_coins(30);
        GameStorage.set('vertical_rocket_counts', 1);
        EventBus.send('UPDATED_BUTTONS');
        set_enabled_vertical_rocket(data, false);

        Metrica.report('data', { ['buy_' + tostring(get_current_level() + 1)]: { id: 'vertical_rocket' } });
    });

    data.druid.new_button('vertical_rocket/close', () => {
        set_enabled_vertical_rocket(data, false);
    });
}

function setup_life_notification(data: props) {
    data.druid.new_button('life_notification/buy_button', () => {
        if (!is_enough_coins(30)) {
            set_enabled_life_notification(false);
            set_enabled_not_enough_coins(data, true);
            return;
        }

        set_enabled_life_notification(false);
        remove_coins(30);
        add_lifes(1);
    });

    data.druid.new_button('life_notification/close', () => set_enabled_life_notification(false));
}

function setup_not_enough_coins(data: props) {
    data.druid.new_button('not_enough_coins/buy_button', () => {
        const store = gui.get_node('store/manager');
        if (gui.is_enabled(store, false)) {
            set_enabled_not_enough_coins(data, false);
            return;
        }

        set_enabled_not_enough_coins(data, false);
        set_enabled_store(data, true);
    });
}

function on_life_tick() {
    const life = GameStorage.get('life');
    const delta = System.now() - life.start_time;

    gui.set_text(gui.get_node('life_notification/time_text'), parse_time(20 * 60 - delta));

    if (delta <= 20 * 60) return;

    add_lifes(1);

    const new_life = GameStorage.get('life');
    new_life.start_time = System.now();
    GameStorage.set('life', new_life);
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
    if (!life.is_active) return;

    const delta = System.now() - life.start_time;

    gui.play_flipbook(gui.get_node('lifes/icon'), 'infinite_life_icon');
    const text = gui.get_node('lifes/text');
    gui.set_text(text, parse_time(life.duration - delta));
    //gui.set_font(text, life.duration > (1 * 60 * 60) ? '32' : '42');

    if (delta >= life.duration) {
        life.is_active = false;
        GameStorage.set('infinit_life', life);
        gui.play_flipbook(gui.get_node('lifes/icon'), 'life_icon');
        gui.set_text(text, tostring(GameStorage.get('life').amount));
        //gui.set_font(text, '32');
    }
}

// TODO: move set_enabled to utils with name and state args

function set_enabled_coins(state: boolean) {
    const coins = gui.get_node('coins/box');
    gui.set_enabled(coins, state);
}

function set_enabled_lifes(state: boolean) {
    const coins = gui.get_node('lifes/box');
    gui.set_enabled(coins, state);
}

function set_enabled_store_button(state: boolean) {
    const store_button = gui.get_node('store_button');
    gui.set_enabled(store_button, state);
}

function set_enabled_sound_button(state: boolean) {
    const sound_button = gui.get_node('sound');
    gui.set_enabled(sound_button, state);
}

function set_enabled_music_button(state: boolean) {
    const music_button = gui.get_node('music');
    gui.set_enabled(music_button, state);
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
    if (GameStorage.get('infinit_life').is_active) return;

    const lifes_text = gui.get_node('lifes/text');
    gui.set_text(lifes_text, tostring(GameStorage.get('life').amount));
}

function on_remove_lifes() {
    if (GameStorage.get('infinit_life').is_active) return;

    const lifes_text = gui.get_node('lifes/text');
    gui.set_text(lifes_text, tostring(GameStorage.get('life').amount));

}

function on_scene_loaded(scene: NameMessage) {
    switch (scene.name) {
        case 'movie': case 'game':
            set_enabled_coins(false);
            set_enabled_lifes(false);
            set_enabled_store_button(false);
            set_enabled_sound_button(false);
            set_enabled_music_button(false);
            break;
        case 'map':
            set_enabled_coins(true);
            set_enabled_lifes(true);
            set_enabled_store_button(true);
            set_enabled_sound_button(true);
            set_enabled_music_button(true);
            break;
    }
}

function on_gameover() {
    timer.delay(GAME_CONFIG.delay_before_gameover, false, () => {
        set_enabled_coins(true);
        set_enabled_lifes(true);
    });
}

function set_enabled_store(data: props, state: boolean) {
    const store = gui.get_node('store/manager');

    if (state && gui.is_enabled(store, false))
        return;

    switch (Scene.get_current_name()) {
        case "game":
            set_enabled_hammer(data, false);
            set_enabled_spinning(data, false);
            set_enabled_horizontall_rocket(data, false);
            set_enabled_vertical_rocket(data, false);

            set_enabled_coins(state);
            set_enabled_lifes(state);
            break;
        case "map":
            set_enabled_store_button(!state);
            set_enabled_sound_button(!state);
            set_enabled_music_button(!state);
            break;
    }

    if (state) {
        gui.set_enabled(store, state);
        gui.animate(gui.get_node('store/dlg'), 'position', vmath.vector3(270, 480, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3);
        EventBus.send('OPENED_DLG', Dlg.Store);
        Sound.play('store');
    } else {
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('store/dlg'), 'position', vmath.vector3(270, 1500, 0), gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(store, state);
        });
        EventBus.send('CLOSED_DLG', Dlg.Store);
        Sound.stop('store');
    }

    data.is_store_open = state;
}

function set_enabled_life_notification(state: boolean) {
    const life = gui.get_node('life_notification/manager');

    if (state) {
        gui.set_enabled(life, state);
        gui.animate(gui.get_node('life_notification/dlg'), 'position', vmath.vector3(270, 480, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3);
        EventBus.send('OPENED_DLG', Dlg.LifeNotification);
    } else {
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('life_notification/dlg'), 'position', vmath.vector3(270, 1150, 0), gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(life, state);
        });
        EventBus.send('CLOSED_DLG', Dlg.LifeNotification);
    }

    EventBus.send('LIFE_NOTIFICATION', state);
}

function set_enabled_not_enough_coins(data: props, state: boolean) {
    const coins = gui.get_node('not_enough_coins/manager');

    if (state) {
        gui.set_enabled(coins, state);
        gui.animate(gui.get_node('not_enough_coins/dlg'), 'position', vmath.vector3(270, 480, 0), gui.EASING_INCUBIC, 0.3);
        if (!data.is_store_open)
            gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3);
        EventBus.send('OPENED_DLG', Dlg.NotEnoughCoins);
    } else {
        if (!data.is_store_open)
            gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('not_enough_coins/dlg'), 'position', vmath.vector3(270, 1150, 0), gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(coins, state);
        });
        EventBus.send('CLOSED_DLG', Dlg.NotEnoughCoins);
    }
}

function set_enabled_hammer(data: props, state: boolean) {
    const hammer = gui.get_node('hammer/manager');

    set_enabled_coins(state);
    set_enabled_lifes(state);

    if (state) {
        gui.set_enabled(hammer, state);
        gui.animate(gui.get_node('hammer/dlg'), 'position', vmath.vector3(270, 480, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3);
        EventBus.send('OPENED_DLG', Dlg.Hammer);
    } else {
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('hammer/dlg'), 'position', vmath.vector3(270, 1150, 0), gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(hammer, state);
        });
        EventBus.send('CLOSED_DLG', Dlg.Hammer);
    }

    data.dlg_opened = state;
}

function set_enabled_spinning(data: props, state: boolean) {
    const spinning = gui.get_node('spinning/manager');

    set_enabled_coins(state);
    set_enabled_lifes(state);

    if (state) {
        gui.set_enabled(spinning, state);
        gui.animate(gui.get_node('spinning/dlg'), 'position', vmath.vector3(270, 480, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3);
        EventBus.send('OPENED_DLG', Dlg.Spinning);
    } else {
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('spinning/dlg'), 'position', vmath.vector3(270, 1150, 0), gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(spinning, state);
        });
        EventBus.send('CLOSED_DLG', Dlg.Spinning);
    }

    data.dlg_opened = state;
}

function set_enabled_horizontall_rocket(data: props, state: boolean) {
    const horizontal_rocket = gui.get_node('horizontal_rocket/manager');

    set_enabled_coins(state);
    set_enabled_lifes(state);

    if (state) {
        gui.set_enabled(horizontal_rocket, state);
        gui.animate(gui.get_node('horizontal_rocket/dlg'), 'position', vmath.vector3(270, 480, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3);
        EventBus.send('OPENED_DLG', Dlg.HorizontalRocket);
    } else {
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('horizontal_rocket/dlg'), 'position', vmath.vector3(270, 1150, 0), gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(horizontal_rocket, state);
        });
        EventBus.send('CLOSED_DLG', Dlg.HorizontalRocket);
    }

    data.dlg_opened = state;
}

function set_enabled_vertical_rocket(data: props, state: boolean) {
    const vertical_rocket = gui.get_node('vertical_rocket/manager');

    set_enabled_coins(state);
    set_enabled_lifes(state);

    if (state) {
        gui.set_enabled(vertical_rocket, state);
        gui.animate(gui.get_node('vertical_rocket/dlg'), 'position', vmath.vector3(270, 480, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3);
        EventBus.send('OPENED_DLG', Dlg.VerticalRocket);
    } else {
        gui.animate(gui.get_node('fade'), 'color', vmath.vector4(0, 0, 0, 0), gui.EASING_INCUBIC, 0.3);
        gui.animate(gui.get_node('vertical_rocket/dlg'), 'position', vmath.vector3(270, 1150, 0), gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(vertical_rocket, state);
        });
        EventBus.send('CLOSED_DLG', Dlg.VerticalRocket);
    }

    data.dlg_opened = state;
}

