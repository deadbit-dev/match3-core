/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-case-declarations */

import * as flow from 'ludobits.m.flow';
import * as druid from 'druid.druid';
import { Dlg, TargetMessage } from '../main/game_config';
import { format_string, get_point_curve, parse_time, set_text, set_text_colors } from '../utils/utils';
import { get_current_level, get_current_level_config, is_animal_level, is_enough_coins, is_last_level, is_time_level, remove_coins, remove_lifes } from './utils';
import { Busters, CellId, ElementId, GameState, TargetType } from './game';
import { Level } from './level';
import { Position } from './core';
import { View } from './view';

const presets = {
    targets: [
        // set position and scale for each target, depend of total targets length
        {
            node_name: 'first_target',
            preset_depend_of_length: {
                1: { position: vmath.vector3(0, 0, 0), scale: vmath.vector3(0.5, 0.5, 1) },
                2: { position: vmath.vector3(-50, 0, 0), scale: vmath.vector3(0.5, 0.5, 1) },
                3: { position: vmath.vector3(-55, 20, 0), scale: vmath.vector3(0.4, 0.4, 1) }
            }

        },
        {
            node_name: 'second_target',
            preset_depend_of_length: {
                2: { position: vmath.vector3(35, 0, 0), scale: vmath.vector3(0.5, 0.5, 1) },
                3: { position: vmath.vector3(55, 20, 0), scale: vmath.vector3(0.4, 0.4, 1) }
            }
        },
        {
            node_name: 'third_target',
            preset_depend_of_length: {
                3: { position: vmath.vector3(0, -35, 0), scale: vmath.vector3(0.4, 0.4, 1) }
            }
        }
    ]
} as {
    targets: {
        node_name: string,
        preset_depend_of_length: {
            [key in number]: {
                position: vmath.vector3,
                scale: vmath.vector3
            }
        }
    }[]
};


interface props {
    druid: DruidClass,
    level: Level,
    busters: Busters,
    settings_opened: boolean
}

export function init(this: props): void {
    Manager.init_script();

    this.druid = druid.new(this);
    this.level = GAME_CONFIG.levels[GameStorage.get('current_level')];
    this.busters = this.level['busters'];

    set_text('text', Lang.get_text('play'));
    // FIXME: (for now) test animal tutorial tip
    this.druid.new_button('btn', () => {
        const window = gui.get_node('window');
        gui.set_enabled(window, false);
        EventBus.send("HIDED_ANIMAL_TUTORIAL_TIP");
    });

    set_events(this);
}

export function on_input(this: props, action_id: string | hash, action: unknown): boolean {
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
    if (GAME_CONFIG.debug_levels) setup_sustem_ui(instance);
    setup_win_ui(instance);
    setup_gameover_ui(instance);
}

function setup_info_ui(instance: props) {
    setup_step_or_time(instance);
    setup_avatar_or_clock(instance);
    setup_targets(instance);
    // TTTTTT
    set_text('current_level', Lang.get_text('level') + ' ' + (GameStorage.get('current_level') + 1));
    if (System.platform == 'HTML5' && html5.run(`new URL(location).searchParams.get('hide')||'0'`) == '1')
        set_text('current_level', '');
    gui.animate(gui.get_node('substrate'), 'position', vmath.vector3(270, 880, 0), gui.EASING_INCUBIC, 0.5);
}

function setup_avatar_or_clock(instance: props) {
    if (GAME_CONFIG.animal_levels.includes(GameStorage.get('current_level') + 1)) {
        const avatar = gui.get_node('avatar');
        const clock = gui.get_node('clock');
        gui.set_enabled(avatar, false);
        gui.set_enabled(clock, true);
    }
}

function setup_step_or_time(instance: props) {
    if (instance.level['time'] != undefined) {
        const node = gui.get_node('timer');
        gui.set_enabled(node, true);

        set_text('time', parse_time(instance.level['time']));

        gui.set_text(gui.get_node('step_time_box/text'), Lang.get_text('time'));
    }

    if (instance.level['steps'] != undefined) {
        const node = gui.get_node('step_counter');
        gui.set_enabled(node, true);

        set_text('steps', instance.level['steps']);
        // TTTTTT
        gui.set_text(gui.get_node('step_time_box/text'), Lang.get_text('steps'));
        if (System.platform == 'HTML5' && html5.run(`new URL(location).searchParams.get('hide')||'0'`) == '1')
            set_text('step_time_box/text', '');
    }
}

function setup_targets(instance: props) {
    const targets = instance.level['targets'];
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        if (target != undefined) {
            const node = gui.get_node(presets.targets[i].node_name);
            gui.set_enabled(node, true);
            gui.set_position(node, presets.targets[i].preset_depend_of_length[targets.length].position);
            gui.set_scale(node, presets.targets[i].preset_depend_of_length[targets.length].scale);

            let view;
            if (target.type == TargetType.Cell) {
                view = GAME_CONFIG.cell_view[target.id as CellId];
                if (Array.isArray(view))
                    view = view[view.length - 1];
            } else view = GAME_CONFIG.element_view[target.id as ElementId];

            gui.play_flipbook(gui.get_node(presets.targets[i].node_name + '_icon'), (view == 'cell_web') ? view + '_ui' : view);
            set_text(presets.targets[i].node_name + '_counts', target.count);
        }
    }
    //TTTTTT
    gui.set_text(gui.get_node('targets_box/text'), Lang.get_text('targets'));
    if (System.platform == 'HTML5' && html5.run(`new URL(location).searchParams.get('hide')||'0'`) == '1')
        set_text('targets_box/text', '');
}

function setup_busters(instance: props) {
    if (GAME_CONFIG.animal_levels.includes(GameStorage.get('current_level') + 1)) return;

    const busters = gui.get_node('buster_buttons');
    gui.set_enabled(busters, true);
    const pos = gui.get_position(busters);
    pos.y += GAME_CONFIG.bottom_offset;
    if (GAME_CONFIG.debug_levels) pos.y += 125;
    gui.set_position(busters, pos);

    instance.druid.new_button('spinning/button', () => {
        if (GameStorage.get('spinning_opened')) {
            if (GameStorage.get('spinning_counts') == 0) {
                if (GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
                    if (GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                        EventBus.send('TRY_BUY_SPINNING');
                } else EventBus.send('TRY_BUY_SPINNING');
                return;
            }
            EventBus.send('ACTIVATE_BUSTER', { name: 'SPINNING' });
        } else {
            const popup = gui.get_node('popup');
            gui.set_position(popup, vmath.vector3(-70, -5, 0));
            set_text('popup/text', format_string(Lang.get_text('buster_open'),[9]));
            gui.set_enabled(popup, !gui.is_enabled(popup, false));
        }
    });
    if (GameStorage.get('spinning_opened')) {
        gui.set_enabled(gui.get_node('spinning/lock'), false);
        gui.set_enabled(gui.get_node('spinning/icon'), true);
        gui.set_enabled(gui.get_node('spinning/counts'), true);
    }

    
    instance.druid.new_button('hammer/button', () => {
        if (GameStorage.get('hammer_opened')) {
            if (GameStorage.get('hammer_counts') == 0) {
                if (GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
                    if (GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                        EventBus.send('TRY_BUY_HAMMER');
                } else EventBus.send('TRY_BUY_HAMMER');
                return;
            }
            EventBus.send('ACTIVATE_BUSTER', { name: 'HAMMER' });
        } else {
            const popup = gui.get_node('popup');
            gui.set_position(popup, vmath.vector3(-170, -5, 0));
            set_text('popup/text', format_string(Lang.get_text('buster_open'), [6]));
            gui.set_enabled(popup, !gui.is_enabled(popup, false));
        }
    });

    if (GameStorage.get('hammer_opened')) {
        gui.set_enabled(gui.get_node('hammer/lock'), false);
        gui.set_enabled(gui.get_node('hammer/icon'), true);
        gui.set_enabled(gui.get_node('hammer/counts'), true);
    }

    
    instance.druid.new_button('horizontal_rocket/button', () => {
        if (GameStorage.get('horizontal_rocket_opened')) {
            if (GameStorage.get('horizontal_rocket_counts') == 0) {
                if (GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
                    if (GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                        EventBus.send('TRY_BUY_HORIZONTAL_ROCKET');
                } else EventBus.send('TRY_BUY_HORIZONTAL_ROCKET');
                return;
            }
            EventBus.send('ACTIVATE_BUSTER', { name: 'HORIZONTAL_ROCKET' });
        } else {
            const popup = gui.get_node('popup');
            gui.set_position(popup, vmath.vector3(30, -5, 0));
            set_text('popup/text', format_string(Lang.get_text('buster_open'), [17]));
            gui.set_enabled(popup, !gui.is_enabled(popup, false));
        }
    });

    if (GameStorage.get('horizontal_rocket_opened')) {
        gui.set_enabled(gui.get_node('horizontal_rocket/lock'), false);
        gui.set_enabled(gui.get_node('horizontal_rocket/icon'), true);
        gui.set_enabled(gui.get_node('horizontal_rocket/counts'), true);
    }

    
    instance.druid.new_button('vertical_rocket/button', () => {
        if (GameStorage.get('vertical_rocket_opened')) {
            if (GameStorage.get('vertical_rocket_counts') == 0) {
                if (GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
                    if (GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                        EventBus.send('TRY_BUY_VERTICAL_ROCKET');
                } else EventBus.send('TRY_BUY_VERTICAL_ROCKET');
                return;
            }
            EventBus.send('ACTIVATE_BUSTER', { name: 'VERTICAL_ROCKET' });
        } else {
            const popup = gui.get_node('popup');
            gui.set_position(popup, vmath.vector3(130, -5, 0));
            set_text('popup/text', format_string(Lang.get_text('buster_open'), [17]));
            gui.set_enabled(popup, !gui.is_enabled(popup, false));
        }
    });

    if (GameStorage.get('vertical_rocket_opened')) {
        gui.set_enabled(gui.get_node('vertical_rocket/lock'), false);
        gui.set_enabled(gui.get_node('vertical_rocket/icon'), true);
        gui.set_enabled(gui.get_node('vertical_rocket/counts'), true);
    }

    instance.druid.new_button('settings/button', () => {
        if (GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
            if (!GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                return;
        }

        instance.settings_opened = !instance.settings_opened;

        set_enabled_settings(instance.settings_opened);

        instance.druid.new_button('sound', () => {
            EventBus.send('SOUND_BUTTON');
            const sound_off = gui.get_node('sound_off');
            gui.set_enabled(sound_off, !Sound.is_sfx_active());
        });

        instance.druid.new_button('music', () => {
            EventBus.send('MUSIC_BUTTON');
            const music_off = gui.get_node('music_off');
            gui.set_enabled(music_off, !Sound.is_music_active());
        });

        instance.druid.new_button('store', () => {
            set_enabled_settings(false);
            instance.settings_opened = false;
            Sound.stop('game');
            EventBus.send('REQUEST_OPEN_STORE');
        });

        instance.druid.new_button('map', () => {
            Sound.stop('game');
            Scene.load('map');
        });

        const sound_off = gui.get_node('sound_off');
        const music_off = gui.get_node('music_off');

        gui.set_enabled(sound_off, !Sound.is_sfx_active());
        gui.set_enabled(music_off, !Sound.is_music_active());
    });

    update_buttons(instance);
}

function set_enabled_settings(state: boolean) {
    const sound = gui.get_node('sound');
    const music = gui.get_node('music');
    const store = gui.get_node('store');
    const map = gui.get_node('map');

    if (state) {
        const sound_pos = gui.get_position(sound);
        sound_pos.y += 80;
        gui.set_enabled(sound, true);
        gui.animate(sound, gui.PROP_POSITION, sound_pos, gui.EASING_INCUBIC, 0.3);
        const music_pos = gui.get_position(music);
        music_pos.y += 150;
        gui.set_enabled(music, true);
        gui.animate(music, gui.PROP_POSITION, music_pos, gui.EASING_INCUBIC, 0.3);
        const store_pos = gui.get_position(store);
        store_pos.y += 220;
        gui.set_enabled(store, true);
        gui.animate(store, gui.PROP_POSITION, store_pos, gui.EASING_INCUBIC, 0.3);
        const map_pos = gui.get_position(map);
        map_pos.y += 290;
        gui.set_enabled(map, true);
        gui.animate(map, gui.PROP_POSITION, map_pos, gui.EASING_INCUBIC, 0.3);
    } else {
        const sound_pos = gui.get_position(sound);
        sound_pos.y -= 80;
        gui.animate(sound, gui.PROP_POSITION, sound_pos, gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(sound, false);
        });
        const music_pos = gui.get_position(music);
        music_pos.y -= 150;
        gui.animate(music, gui.PROP_POSITION, music_pos, gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(music, false);
        });
        const store_pos = gui.get_position(store);
        store_pos.y -= 220;
        gui.animate(store, gui.PROP_POSITION, store_pos, gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(store, false);
        });
        const map_pos = gui.get_position(map);
        map_pos.y -= 290;
        gui.animate(map, gui.PROP_POSITION, map_pos, gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(map, false);
        });
    }
}

function setup_sustem_ui(instance: props) {
    instance.druid.new_button('back/button', () => {
        Sound.stop('game');
        Scene.load('map');
    });
    instance.druid.new_button('restart/button', () => {
        GAME_CONFIG.is_restart = true;
        Scene.restart();
    });

    instance.druid.new_button('rewind/button', () => EventBus.send('REQUEST_REWIND'));

    gui.animate(gui.get_node('system_buttons'), 'position', vmath.vector3(0, -40, 0), gui.EASING_INCUBIC, 0.5);
}

function setup_win_ui(instance: props) {
    instance.druid.new_button('continue_button', () => {
        gui.set_enabled(gui.get_node('continue_button'), false);
        if (!GameStorage.get('was_purchased')) Ads.show_interstitial(true, next_level);
        else next_level();
    });
    instance.druid.new_button('win_close', to_map);

    instance.druid.new_button('last_level_btn', to_map);

    gui.set_enabled(gui.get_node('win'), false);
    gui.set_text(gui.get_node('win_text'), Lang.get_text('win_title'));
    gui.set_text(gui.get_node('continue_text'), Lang.get_text('next'));
    gui.set_text(gui.get_node('last_level_btn_text'), Lang.get_text('on_map'));
    gui.set_text(gui.get_node('last_level_text'), Lang.get_text('last_level_text'));
}

function next_level() {
    GAME_CONFIG.steps_by_ad = 0;
    GameStorage.set('current_level', GameStorage.get('current_level') + 1);
    GAME_CONFIG.is_restart = true;
    Scene.restart();
}

function setup_gameover_ui(instance: props) {
    gui.set_text(gui.get_node('gameover_text'), Lang.get_text('gameover_title'));

    gui.set_text(gui.get_node('restart_text'), Lang.get_text('restart'));
    instance.druid.new_button('restart_button', () => {
        if (!GameStorage.get('infinit_life').is_active && GameStorage.get('life').amount == 0) {
            EventBus.send("SET_LIFE_NOTIFICATION");
            return;
        }

        GAME_CONFIG.steps_by_ad = 0;

        GAME_CONFIG.is_restart = true;
        Scene.restart();
    });

    gui.set_text(gui.get_node('map_text'), Lang.get_text('map'));
    instance.druid.new_button('map_button', to_map);

    instance.druid.new_button('gameover_close', to_map);

    instance.druid.new_button('gameover_offer_close', disabled_gameover_offer);

    gui.set_text(gui.get_node('steps_by_ad/text'), "+3 " + Lang.get_text('3steps'));
    instance.druid.new_button('steps_by_ad/button', () => {
        Ads.show_reward(() => {
            GAME_CONFIG.steps_by_ad++;
            Metrica.report('data', { ['fail_level_' + tostring(get_current_level() + 1)]: { event: '3step_ads' } });
            EventBus.send('REVIVE', { steps: 3 });
        });
    });

    gui.set_text(gui.get_node('steps_by_coins/text'), "+5 " + Lang.get_text('5steps'));
    gui.set_text(gui.get_node('steps_by_coins/text1'), "30");
    instance.druid.new_button('steps_by_coins/button', () => {
        if (!is_enough_coins(30)) {
            EventBus.send('REQUEST_OPEN_STORE');
            return;
        }
        remove_coins(30);
        Metrica.report('data', { ['fail_level_' + tostring(get_current_level() + 1)]: { event: '5step_money' } });
        EventBus.send('REVIVE', { steps: 5 });
    });

    gui.set_text(gui.get_node('time_by_coins/text'), "+20 " + Lang.get_text('sec'));
    gui.set_text(gui.get_node('time_by_coins/text1'), "40");
    instance.druid.new_button('time_by_coins/button', () => {
        if (!is_enough_coins(40)) {
            EventBus.send('REQUEST_OPEN_STORE');
            return;
        }
        remove_coins(40);
        Metrica.report('data', { ['fail_level_' + tostring(get_current_level() + 1)]: { event: 'time_money' } });
        EventBus.send('REVIVE', { time: 20 });
    });
}

function to_map() {
    if (!GameStorage.get('was_purchased')) {
        Ads.show_interstitial(true, () => {
            Sound.stop('game');
            Scene.load('map');
        });
    } else {
        Sound.stop('game');
        Scene.load('map');
    }
}

function set_animal_tutorial_tip() {
    const window = gui.get_node('window');
    gui.set_enabled(window, true);
    gui.set_text(gui.get_node('description'), Lang.get_text('animal_tutorial_description'));
    gui.set_text(gui.get_node('description1'), Lang.get_text('animal_tutorial_description1'));
}

// TODO: get data from game load event instead read config
function set_events(instance: props) {
    EventBus.on('SET_ANIMAL_TUTORIAL_TIP', set_animal_tutorial_tip, true);
    EventBus.on('INIT_UI', () => setup(instance));
    EventBus.on('UPDATED_STEP_COUNTER', (steps) => set_text('steps', steps), true);
    EventBus.on('UPDATED_TARGET_UI', (data) => update_targets(data), true);
    EventBus.on('UPDATED_BUTTONS', () => update_buttons(instance), true);
    EventBus.on('GAME_TIMER', (time) => set_text('time', parse_time(time)), true);
    EventBus.on('SET_TUTORIAL', set_tutorial, true);
    EventBus.on('REMOVE_TUTORIAL', remove_tutorial, true);
    EventBus.on('ON_WIN_END', on_win_end);
    EventBus.on('ON_GAME_OVER', (state) => {
        timer.delay(GAME_CONFIG.delay_before_gameover, false, () => {
            set_gameover(instance, state);
        });
    }, true);
    EventBus.on('SHUFFLE_START', on_shuffle_start);
    EventBus.on('SHUFFLE_ACTION', on_shuffle_action);
    EventBus.on('OPENED_DLG', (dlg: Dlg) => {
        if (dlg == Dlg.Store) {
            gui.set_enabled(gui.get_node('buster_buttons'), false);
        }
    });
    EventBus.on('CLOSED_DLG', (dlg: Dlg) => {
        if (dlg == Dlg.Store) {
            gui.set_enabled(gui.get_node('buster_buttons'), true);
            Sound.play('game');
        }
    });
}

function update_targets(data: TargetMessage) {
    if (data.pos != undefined && data.type == TargetType.Element) {
        const pos = Camera.world_to_screen(data.pos);
        const element = gui.new_box_node(pos, vmath.vector3(40, 40, 1));
        const view = GAME_CONFIG.element_view[data.id as ElementId];
        gui.set_texture(element, 'graphics');
        gui.play_flipbook(element, view);
        gui.animate(element, gui.PROP_POSITION, vmath.vector3(450, 850, 0), gui.EASING_INQUAD, 0.5, 0, () => {
            gui.delete_node(element);
            set_target(data);
        });
    } else set_target(data);
}

function set_target(data: TargetMessage) {
    switch (data.idx) {
        case 0: set_text('first_target_counts', math.max(0, data.amount)); break;
        case 1: set_text('second_target_counts', math.max(0, data.amount)); break;
        case 2: set_text('third_target_counts', math.max(0, data.amount)); break;
    }
}

function feed_animation() {
    const level_config = get_current_level_config();
    let item_id = 0;
    for (const target of level_config.targets) {
        if (target.type == TargetType.Element && GAME_CONFIG.feed_elements.includes(target.id))
            item_id = target.id;
    }

    for (let i = 0; i < 5; i++) {
        timer.delay(0.05 * i, false, () => {
            flow.start(() => {
                const element = gui.new_box_node(vmath.vector3(420, 870, 0), vmath.vector3(40, 40, 1));
                const view = GAME_CONFIG.element_view[item_id as ElementId];
                gui.set_texture(element, 'graphics');
                gui.play_flipbook(element, view);

                const ltrb = Camera.get_ltrb();
                const width = 540;
                const height = math.abs(ltrb.w);
                const points = [
                    { x: 420, y: 870 },
                    { x: width * 0.3, y: height * 0.5 },
                    { x: width * 0.5, y: 50 + GAME_CONFIG.bottom_offset }
                ];

                if (GAME_CONFIG.debug_levels) {
                    points[points.length - 1].y = width * 0.4 + GAME_CONFIG.bottom_offset;
                }

                let result = vmath.vector3();
                for (let i = 0; i < 100; i++) {
                    const p = get_point_curve(i / 100, points, result);
                    gui.animate(element, gui.PROP_POSITION, p, gui.EASING_LINEAR, 0.01);

                    flow.delay(0.01);
                }

                const scale = gui.get_scale(element);
                scale.x *= 2;
                scale.y *= 2;
                gui.animate(element, gui.PROP_SCALE, scale, gui.EASING_INCUBIC, 0.5, 0, () => {
                    timer.delay(2, false, () => {
                        gui.delete_node(element);
                    });
                });
            });
        });
    }
}

function update_buttons(instance: props) {
    const spinning = GameStorage.get('spinning_counts');
    set_text('spinning/counts', (spinning == 0) ? "+" : spinning);
    set_text_colors(['spinning/button'], '#fff', instance.busters.spinning.active ? 0.5 : 1);
    
    if(GameStorage.get('spinning_opened')) {
        gui.set_enabled(gui.get_node('spinning/lock'), false);
        gui.set_enabled(gui.get_node('spinning/icon'), true);
        gui.set_enabled(gui.get_node('spinning/counts'), true);
    }


    const hammer = GameStorage.get('hammer_counts');
    set_text('hammer/counts', (hammer == 0) ? "+" : hammer);
    set_text_colors(['hammer/button'], '#fff', instance.busters.hammer.active ? 0.5 : 1);

    if(GameStorage.get('hammer_opened')) {
        gui.set_enabled(gui.get_node('hammer/lock'), false);
        gui.set_enabled(gui.get_node('hammer/icon'), true);
        gui.set_enabled(gui.get_node('hammer/counts'), true);
    }

    const horizontal_rocket = GameStorage.get('horizontal_rocket_counts');
    set_text('horizontal_rocket/counts', (horizontal_rocket == 0) ? "+" : horizontal_rocket);
    set_text_colors(['horizontal_rocket/button'], '#fff', instance.busters.horizontal_rocket.active ? 0.5 : 1);
    
    if(GameStorage.get('horizontal_rocket_opened')) {
        gui.set_enabled(gui.get_node('horizontal_rocket/lock'), false);
        gui.set_enabled(gui.get_node('horizontal_rocket/icon'), true);
        gui.set_enabled(gui.get_node('horizontal_rocket/counts'), true);
    }

    const vertical_rocket = GameStorage.get('vertical_rocket_counts');
    set_text('vertical_rocket/counts', (vertical_rocket == 0) ? "+" : vertical_rocket);
    set_text_colors(['vertical_rocket/button'], '#fff', instance.busters.vertical_rocket.active ? 0.5 : 1);

    if(GameStorage.get('vertical_rocket_opened')) {
        gui.set_enabled(gui.get_node('vertical_rocket/lock'), false);
        gui.set_enabled(gui.get_node('vertical_rocket/icon'), true);
        gui.set_enabled(gui.get_node('vertical_rocket/counts'), true);
    }
}

let hand_timer: hash;
function set_tutorial() {
    const tutorial_data = GAME_CONFIG.tutorials_data[GameStorage.get("current_level") + 1];
    const tutorial = gui.get_node('tutorial');
    const tutorial_text = gui.get_node('tutorial_text');

    gui.set_position(tutorial_text, tutorial_data.text.pos);
    gui.set_text(tutorial_text, Lang.get_text(tutorial_data.text.data));
    gui.set_enabled(tutorial, true);

    gui.set_enabled(gui.get_node('lock1'), true);

    if (tutorial_data.arrow_pos != undefined) {
        const arrow = gui.get_node('arrow');
        gui.set_enabled(arrow, true);
        gui.set_position(arrow, tutorial_data.arrow_pos);
    }

    if (tutorial_data.buster_icon != undefined) {
        const buster = gui.get_node('buster');
        const buster_icon = gui.get_node('buster_icon');

        gui.set_enabled(buster, true);
        gui.set_position(buster, tutorial_data.buster_icon.pos);
        gui.play_flipbook(buster_icon, tutorial_data.buster_icon.icon);
    }

    if (tutorial_data.busters != undefined) {
        const busters = Array.isArray(tutorial_data.busters) ? tutorial_data.busters : [tutorial_data.busters];
        for (const buster of busters)
            gui.set_layer(gui.get_node(buster + "/button"), "top");
    }

    switch (get_current_level() + 1) {
        case 6:
            hand_timer = timer.delay(2, false, () => {
                const from_pos = vmath.vector3(-200, -400, 0);
                const to_pos = vmath.vector3(100, 70, 0);
                if (GAME_CONFIG.debug_levels) {
                    from_pos.y += 125;
                    to_pos.y += 50;
                }
                click_in_two_pos(from_pos, to_pos);
            });
            break;
        case 7:
            hand_timer = timer.delay(2, false, () => {
                const pos = vmath.vector3(-245, -210, 0);
                if (GAME_CONFIG.debug_levels) pos.y += 50;
                hand_click_animation(pos);
            });
            break;
        case 8:
            hand_timer = timer.delay(2, false, hand_swap_animation);
            break;
        case 9:
            hand_timer = timer.delay(2, false, () => {
                const pos = vmath.vector3(-100, -400, 0);
                if (GAME_CONFIG.debug_levels) pos.y += 125;
                hand_click_animation(pos);
            });
            break;
        case 17:
            hand_timer = timer.delay(2, false, () => {
                const from_pos = vmath.vector3(0, -400, 0);
                const to_pos = vmath.vector3(-100, 10, 0);
                if (GAME_CONFIG.debug_levels) {
                    from_pos.y += 125;
                    to_pos.y += 50;
                }
                click_in_two_pos(from_pos, to_pos);
            });
            break;
    }
}

function click_in_two_pos(pos1: vmath.vector3, pos2: vmath.vector3) {
    const hand = gui.get_node('hand');
    hand_click_animation(pos1, () => {
        timer.delay(1, false, () => {
            hand_click_animation(pos2, () => {
                gui.set_enabled(hand, false);
                timer.delay(1, false, () => {
                    click_in_two_pos(pos1, pos2);
                });
            });
        });
    });
}

function hand_click_animation(position: vmath.vector3, on_end?: () => void) {
    const hand = gui.get_node('hand');
    gui.set_position(hand, position);
    gui.set_enabled(hand, true);
    gui.animate(hand, gui.PROP_SCALE, vmath.vector3(0.5, 0.5, 0.5), gui.EASING_INCUBIC, 1, 0, () => {
        gui.set_enabled(hand, false);
        if (on_end != undefined) on_end();
        else timer.delay(1, false, () => {
            hand_click_animation(position, on_end);
        });
    }, gui.PLAYBACK_ONCE_PINGPONG);
}

function hand_swap_animation() {
    const hand = gui.get_node('hand');
    const color = gui.get_color(hand);
    const from_pos = vmath.vector3(70, 50, 0);
    const to_pos = vmath.vector3(190, 50, 0);
    if (GAME_CONFIG.debug_levels) {
        from_pos.y += 50;
        to_pos.y += 50;
    }
    gui.set_position(hand, from_pos);
    color.w = 0.5;
    gui.set_color(hand, color);
    gui.set_enabled(hand, true);
    color.w = 1;
    gui.animate(hand, gui.PROP_COLOR, color, gui.EASING_INCUBIC, 0.3, 0, () => {

        gui.animate(hand, gui.PROP_POSITION, to_pos, gui.EASING_INCUBIC, 1, 0, () => {
            color.w = 0.5;
            gui.animate(hand, gui.PROP_COLOR, color, gui.EASING_INCUBIC, 0.7, 0, () => {
                gui.set_enabled(hand, false);
                timer.delay(1, false, hand_swap_animation);
            });
        });
    });
}

function remove_tutorial() {
    if (hand_timer != null) timer.cancel(hand_timer);
    gui.set_enabled(gui.get_node('lock1'), false);
    gui.set_enabled(gui.get_node('tutorial'), false);
}

function on_win_end(data: { state: GameState, with_reward: boolean }) {
    if (is_animal_level()) {
        timer.delay(0.1, false, feed_animation);
    }

    timer.delay(is_animal_level() ? GAME_CONFIG.animal_level_delay_before_win : GAME_CONFIG.delay_before_win, false, () => {
        disable_game_ui();

        const lock = gui.get_node('lock1');
        gui.set_enabled(lock, true);
        gui.set_alpha(lock, 0);
        gui.animate(lock, gui.PROP_COLOR, vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.6, 0, () => {
            gui.set_enabled(gui.get_node('win'), true);
            if (is_last_level()) {
                gui.set_enabled(gui.get_node('win_close'), false);
                gui.set_enabled(gui.get_node('continue_button'), false);
            }

            const on_end_for_last_level = () => {
                if (!is_last_level())
                    return;
                timer.delay(0.5, false, () => {
                    gui.set_enabled(gui.get_node('win'), false);
                    const popup = gui.get_node('last_level_popup');
                    gui.set_enabled(popup, true);
                    gui.animate(popup, gui.PROP_POSITION, vmath.vector3(270, 480, 0), gui.EASING_INCUBIC, 0.5);
                });
            };

            if (data.with_reward) {

                let level_coins = get_current_level_config().coins;
                let steps = (data.state.steps != undefined) ? data.state.steps : 0;
                let remaining_time = (data.state.remaining_time != undefined) ? math.floor(data.state.remaining_time) : 0;
                if (level_coins > 0) {
                    const current_coins = GameStorage.get('coins');
                    const before_reward = current_coins - level_coins - steps - remaining_time;
                    gui.set_enabled(gui.get_node('reward'), true);
                    gui.set_text(gui.get_node('coins_count'), tostring(before_reward));

                    const on_each_coin_drop_end = (init_value: number, idx: number) => {
                        Sound.play('coin');

                        gui.set_text(gui.get_node('coins_count'), tostring(init_value + idx + 1));
                        const icon = gui.get_node('coin_icon');
                        const init_scale = gui.get_scale(icon);
                        gui.animate(icon, gui.PROP_SCALE, vmath.vector3(init_scale.x + 0.03, init_scale.y + 0.03, init_scale.z), gui.EASING_INELASTIC, 0.01, 0, () => {
                            gui.animate(icon, gui.PROP_SCALE, init_scale, gui.EASING_INELASTIC, 0.01);
                        });
                    };

                    drop_steptime(() => {
                        const ltrb = Camera.get_ltrb();
                        const width = 540;
                        const height = math.abs(ltrb.w);
                        const level_coin_points = [
                            { x: 450, y: 850 },
                            { x: width * 0.3, y: height * 0.5 },
                            { x: 270 + 25, y: 480 - 200 }
                        ];
                        if (steps > 0 || remaining_time > 0) {
                            const steptime_points = [
                                { x: 100, y: 850 },
                                { x: width * 0.25, y: height * 0.5 },
                                { x: 270 + 25, y: 480 - 200 }
                            ];

                            const on_each_coin_drop_start = (idx: number) => {
                                if (steps > 0) {
                                    gui.set_text(gui.get_node('steps'), tostring(steps - (idx + 1)));
                                    return;
                                }

                                if (remaining_time > 0) {
                                    gui.set_text(gui.get_node('time'), parse_time(remaining_time - (idx + 1)));
                                    return;
                                }
                            };

                            drop_coins(before_reward, steps + remaining_time, steptime_points, on_each_coin_drop_start, on_each_coin_drop_end, () => {
                                fade_steptime(() => {
                                    drop_targets(() => {
                                        drop_coins(before_reward + steps + remaining_time, level_coins, level_coin_points, (idx: number) => {
                                            gui.set_text(gui.get_node('coins_text'), tostring(level_coins - (idx + 1)));
                                        }, on_each_coin_drop_end, () => {
                                            fade_targets(on_end_for_last_level);
                                        });
                                    });
                                });
                            });
                        } else {
                            drop_targets(() => {
                                drop_coins(before_reward, level_coins, level_coin_points, (idx: number) => {
                                    gui.set_text(gui.get_node('coins_text'), tostring(level_coins - (idx + 1)));
                                }, on_each_coin_drop_end, () => {
                                    fade_targets(on_end_for_last_level);
                                });
                            });
                        }
                    });
                } else on_end_for_last_level();
            } else on_end_for_last_level();
        });

        Sound.play('passed');
        Sound.play('animalwin');

        const anim_props = { blend_duration: 0, playback_rate: 1 };
        gui.play_spine_anim(gui.get_node("firework"), hash("firework"), gui.PLAYBACK_LOOP_FORWARD, anim_props);
    });
}

function drop_steptime(on_end: () => void) {
    gui.set_enabled(gui.get_node('substrate'), true);
    const steptime = gui.get_node('step_time');
    gui.set_layer(steptime, 'ontop');
    const pos = gui.get_position(steptime);
    pos.y -= 300;
    gui.animate(steptime, 'position', pos, gui.EASING_OUTBOUNCE, 0.5, 0, on_end);
}

function drop_targets(on_end: () => void) {
    gui.set_enabled(gui.get_node('substrate'), true);
    const targets = gui.get_node('targets');
    gui.set_enabled(gui.get_node('coins'), true);
    set_text('coins_text', get_current_level_config().coins);
    gui.set_layer(targets, 'ontop');
    const pos = gui.get_position(targets);
    pos.y -= 300;
    gui.animate(targets, 'position', pos, gui.EASING_OUTBOUNCE, 0.5, 0, on_end);
}

function fade_steptime(on_end: () => void) {
    const steptime = gui.get_node('step_time');
    const pos = gui.get_position(steptime);
    pos.y += 300;
    gui.animate(steptime, 'position', pos, gui.EASING_OUTCUBIC, 0.5, 0, () => {
        gui.set_layer(steptime, '');
        gui.set_enabled(gui.get_node('substrate'), false);
        on_end();
    });
}

function fade_targets(on_end: () => void) {
    const targets = gui.get_node('targets');
    const pos = gui.get_position(targets);
    pos.y += 300;
    gui.animate(targets, 'position', pos, gui.EASING_OUTCUBIC, 0.5, 0, () => {
        gui.set_layer(targets, '');
        gui.set_enabled(gui.get_node('coins'), false);
        gui.set_enabled(gui.get_node('substrate'), false);
        on_end();
    });
}

function drop_coins(init_value: number, amount: number, points: Position[], on_each_drop_start?: (inidx: number) => void, on_each_drop_end?: (init_value: number, idx: number) => void, on_end?: () => void) {
    for (let i = 0; i < amount; i++) {
        const idx = i;
        timer.delay(0.1 * i, false, () => {
            flow.start(() => {
                const coin = gui.new_box_node(vmath.vector3(points[0].x, points[0].y, 0), vmath.vector3(40, 40, 1));
                gui.set_layer(coin, 'ontop');
                gui.set_texture(coin, 'ui');
                gui.play_flipbook(coin, 'coin_icon_1');

                if (on_each_drop_start != undefined)
                    on_each_drop_start(idx);

                let result = vmath.vector3();
                for (let i = 0; i < 100; i++) {
                    const p = get_point_curve(i / 100, points, result);
                    gui.animate(coin, gui.PROP_POSITION, p, gui.EASING_LINEAR, 0.01);

                    flow.delay(0.01);
                }

                gui.delete_node(coin);

                if (on_each_drop_end != undefined)
                    on_each_drop_end(init_value, idx);
            });
        });
    }

    if (on_end != undefined)
        timer.delay((amount * 0.1) + (100 * 0.01), false, on_end);
}

// TODO: make presets for gameover
function set_gameover(instance: props, state: GameState) {
    disable_game_ui();

    const lock = gui.get_node('lock1');
    gui.set_enabled(lock, true);
    gui.animate(lock, gui.PROP_COLOR, vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3, 0, () => {
        gui.set_enabled(gui.get_node('gameover'), true);
        gui.set_enabled(gui.get_node('missing_targets'), true);
    });


    Sound.play('failed');
    Sound.play('animallose');

    set_text('missing_text', Lang.get_text("targets"));

    const target_1 = gui.get_node('target_1');
    const target_2 = gui.get_node('target_2');
    const target_3 = gui.get_node('target_3');

    if (state.targets.length == 1) {
        const target1 = state.targets[0];

        let view1 = '';
        if (target1.type == TargetType.Cell) {
            if (Array.isArray(GAME_CONFIG.cell_view[target1.id as CellId])) view1 = GAME_CONFIG.cell_view[target1.id as CellId][0];
            else view1 = GAME_CONFIG.cell_view[target1.id as CellId] as string;
        } else view1 = GAME_CONFIG.element_view[target1.id as ElementId];

        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);

        gui.set_text(gui.get_node('target_1_text'), tostring(math.min(target1.uids.length, target1.count) + "/" + target1.count));

        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);

        gui.set_position(target_1, vmath.vector3(0, 0, 0));
        gui.set_enabled(target_1, true);
    }
    else if (state.targets.length == 2) {
        const target1 = state.targets[0];

        let view1 = '';
        if (target1.type == TargetType.Cell) {
            if (Array.isArray(GAME_CONFIG.cell_view[target1.id as CellId])) view1 = GAME_CONFIG.cell_view[target1.id as CellId][0];
            else view1 = GAME_CONFIG.cell_view[target1.id as CellId] as string;
        } else view1 = GAME_CONFIG.element_view[target1.id as ElementId];

        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);

        gui.set_text(gui.get_node('target_1_text'), tostring(math.min(target1.uids.length, target1.count) + "/" + target1.count));

        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);

        gui.set_position(target_1, vmath.vector3(-70, 0, 0));
        gui.set_enabled(target_1, true);

        const target2 = state.targets[1];

        let view2 = '';
        if (target2.type == TargetType.Cell) {
            if (Array.isArray(GAME_CONFIG.cell_view[target2.id as CellId])) view2 = GAME_CONFIG.cell_view[target2.id as CellId][0];
            else view2 = GAME_CONFIG.cell_view[target2.id as CellId] as string;
        } else view2 = GAME_CONFIG.element_view[target2.id as ElementId];

        gui.play_flipbook(gui.get_node('target_2'), (view2 == 'cell_web') ? view2 + '_ui' : view2);

        gui.set_text(gui.get_node('target_2_text'), tostring(math.min(target2.uids.length, target2.count) + "/" + target2.count));

        gui.set_enabled(gui.get_node('target_2_fail_icon'), target2.uids.length < target2.count);

        gui.set_position(target_2, vmath.vector3(70, 0, 0));
        gui.set_enabled(target_2, true);
    }
    else if (state.targets.length == 3) {
        const target1 = state.targets[0];

        let view1 = '';
        if (target1.type == TargetType.Cell) {
            if (Array.isArray(GAME_CONFIG.cell_view[target1.id as CellId])) view1 = GAME_CONFIG.cell_view[target1.id as CellId][0];
            else view1 = GAME_CONFIG.cell_view[target1.id as CellId] as string;
        } else view1 = GAME_CONFIG.element_view[target1.id as ElementId];

        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);

        gui.set_text(gui.get_node('target_1_text'), tostring(math.min(target1.uids.length, target1.count) + "/" + target1.count));

        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);

        gui.set_position(target_1, vmath.vector3(-125, 0, 0));
        gui.set_enabled(target_1, true);

        const target2 = state.targets[1];

        let view2 = '';
        if (target2.type == TargetType.Cell) {
            if (Array.isArray(GAME_CONFIG.cell_view[target2.id as CellId])) view2 = GAME_CONFIG.cell_view[target2.id as CellId][0];
            else view2 = GAME_CONFIG.cell_view[target2.id as CellId] as string;
        } else view2 = GAME_CONFIG.element_view[target2.id as ElementId];

        gui.play_flipbook(gui.get_node('target_2'), (view2 == 'cell_web') ? view2 + '_ui' : view2);

        gui.set_text(gui.get_node('target_2_text'), tostring(math.min(target2.uids.length, target2.count) + "/" + target2.count));

        gui.set_enabled(gui.get_node('target_2_fail_icon'), target2.uids.length < target2.count);

        gui.set_position(target_2, vmath.vector3(0, 0, 0));
        gui.set_enabled(target_2, true);

        const target3 = state.targets[2];

        let view3 = '';
        if (target3.type == TargetType.Cell) {
            if (Array.isArray(GAME_CONFIG.cell_view[target3.id as CellId])) view3 = GAME_CONFIG.cell_view[target3.id as CellId][0];
            else view3 = GAME_CONFIG.cell_view[target3.id as CellId] as string;
        } else view3 = GAME_CONFIG.element_view[target3.id as ElementId];

        gui.play_flipbook(gui.get_node('target_3'), (view3 == 'cell_web') ? view3 + '_ui' : view3);

        gui.set_text(gui.get_node('target_3_text'), tostring(math.min(target3.uids.length, target3.count) + "/" + target3.count));

        gui.set_enabled(gui.get_node('target_3_fail_icon'), target3.uids.length < target3.count);

        gui.set_position(target_3, vmath.vector3(125, 0, 0));
        gui.set_enabled(target_3, true);
    }

    set_gameover_offer();
}

function set_gameover_offer() {
    gui.set_enabled(gui.get_node('gameover_offer_close'), true);
    if (!is_time_level()) {
        if (GAME_CONFIG.steps_by_ad < 2) gui.set_enabled(gui.get_node('steps_by_ad/button'), true);
        gui.set_enabled(gui.get_node('steps_by_coins/button'), true);
    } else gui.set_enabled(gui.get_node('time_by_coins/button'), true);
}

function disabled_gameover_offer() {
    remove_lifes(1);

    gui.set_enabled(gui.get_node('gameover_offer_close'), false);
    gui.set_enabled(gui.get_node('steps_by_ad/button'), false);
    gui.set_enabled(gui.get_node('steps_by_coins/button'), false);
    gui.set_enabled(gui.get_node('time_by_coins/button'), false);

    gui.set_enabled(gui.get_node('gameover_close'), true);
    gui.set_enabled(gui.get_node('restart_button'), true);
    gui.set_enabled(gui.get_node('map_button'), true);
}

function disable_game_ui() {
    gui.set_enabled(gui.get_node('buster_buttons'), false);

    gui.animate(gui.get_node('substrate'), 'position', vmath.vector3(270, 1050, 0), gui.EASING_INCUBIC, 0.5);
    gui.animate(gui.get_node('system_buttons'), 'position', vmath.vector3(0, -200, 0), gui.EASING_INCUBIC, 0.5);

    timer.delay(0.5, false, () => {
        gui.set_enabled(gui.get_node('substrate'), false);
        gui.set_enabled(gui.get_node('system_buttons'), false);
    });
}

function on_shuffle_start() {
    const shuffle = gui.get_node('shuffle');
    // const init_scale = gui.get_scale(shuffle);
    // gui.set_scale(shuffle, vmath.vector3());

    const lock = gui.get_node('lock1');
    gui.set_enabled(lock, true);
    gui.animate(lock, gui.PROP_COLOR, vmath.vector4(0, 0, 0, GAME_CONFIG.fade_value), gui.EASING_INCUBIC, 0.3, 0, () => {
        gui.set_enabled(shuffle, true);
    });
    // gui.animate(shuffle, gui.PROP_COLOR, vmath.vector4(0, 0, 0, 1), gui.EASING_INCUBIC, 0.3);
}

function on_shuffle_action() {
    timer.delay(0.7, false, () => {
        const shuffle = gui.get_node('shuffle');
        // const init_scale = gui.get_scale(shuffle);
        const lock = gui.get_node('lock1');
        gui.set_enabled(shuffle, false);
        gui.animate(lock, gui.PROP_COLOR, vmath.vector4(), gui.EASING_INCUBIC, 0.3, 0, () => {
            gui.set_enabled(lock, false);
        });
        // gui.animate(shuffle, gui.PROP_COLOR, vmath.vector4(), gui.EASING_INCUBIC, 0.3, 0, () => {

        // });
    });
}