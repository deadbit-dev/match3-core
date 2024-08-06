/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-case-declarations */

import * as druid from 'druid.druid';
import { TargetMessage } from '../main/game_config';
import { parse_time, set_text, set_text_colors } from '../utils/utils';
import { Busters, CellId, ElementId, GameState, Level, TargetType } from './match3_game';
import { is_enough_coins, remove_coins, remove_lifes } from './match3_utils';

const presets = {
    targets: [
        // set position and scale for each target, depend of total targets length
        {
            node_name: 'first_target',
            preset_depend_of_length: {
                1: { position: vmath.vector3(0, 0, 0), scale: vmath.vector3(0.5, 0.5, 1) },
                2: { position: vmath.vector3(-40, 0, 0), scale: vmath.vector3(0.5, 0.5, 1) },
                3: { position: vmath.vector3(-35, 20, 0), scale: vmath.vector3(0.4, 0.4, 1) }
            }
            
        },
        {
            node_name: 'second_target',
            preset_depend_of_length: {
                2: { position: vmath.vector3(40, 0, 0), scale: vmath.vector3(0.5, 0.5, 1) },
                3: { position: vmath.vector3(35, 20, 0), scale: vmath.vector3(0.4, 0.4, 1) }
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
    busters: Busters
}

export function init(this: props): void {
    Manager.init_script();
    
    this.druid = druid.new(this);
    this.level = GAME_CONFIG.levels[GameStorage.get('current_level')];
    this.busters = this.level['busters'];

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
    setup_sustem_ui(instance);
    setup_win_ui(instance);
    setup_gameover_ui(instance);

    gui.animate(gui.get_node('substrate'), 'position', vmath.vector3(270, 880, 0), gui.EASING_INCUBIC, 0.5);
    gui.animate(gui.get_node('system_buttons'), 'position', vmath.vector3(270, 65, 0), gui.EASING_INCUBIC, 0.5);

    gui.set_scale(gui.get_node('hammer/button'), vmath.vector3(0, 0, 0));
    gui.set_scale(gui.get_node('spinning/button'), vmath.vector3(0, 0, 0));
    gui.set_scale(gui.get_node('horizontal_rocket/button'), vmath.vector3(0, 0, 0));
    gui.set_scale(gui.get_node('vertical_rocket/button'), vmath.vector3(0, 0, 0));

    gui.animate(gui.get_node('hammer/button'), 'scale', vmath.vector3(0.9, 0.9, 1), gui.EASING_INCUBIC, 0.3);
    gui.animate(gui.get_node('spinning/button'), 'scale', vmath.vector3(0.9, 0.9, 1), gui.EASING_INCUBIC, 0.3);
    gui.animate(gui.get_node('horizontal_rocket/button'), 'scale', vmath.vector3(0.9, 0.9, 1), gui.EASING_INCUBIC, 0.3);
    gui.animate(gui.get_node('vertical_rocket/button'), 'scale', vmath.vector3(0.9, 0.9, 1), gui.EASING_INCUBIC, 0.3);
}

function setup_info_ui(instance: props) {
    setup_step_or_time(instance);
    setup_avatar_or_clock(instance);
    setup_targets(instance);
}

function setup_avatar_or_clock(instance: props) {
    if(GAME_CONFIG.animal_levels.includes(GameStorage.get('current_level') + 1)) {
        const avatar = gui.get_node('avatar');
        const clock = gui.get_node('clock');
        gui.set_enabled(avatar, false);
        gui.set_enabled(clock, true);
    }
}

function setup_step_or_time(instance: props) {
    if(instance.level['time'] != undefined) {
        const node = gui.get_node('timer');
        gui.set_enabled(node, true);

        set_text('time', parse_time(instance.level['time']));

        gui.set_text(gui.get_node('step_time_box/text'), Lang.get_text('time'));
    }

    if(instance.level['steps'] != undefined) {
        const node = gui.get_node('step_counter');
        gui.set_enabled(node, true);

        set_text('steps', instance.level['steps']);

        gui.set_text(gui.get_node('step_time_box/text'), Lang.get_text('steps'));
    }
}

function setup_targets(instance: props) {
    const targets = instance.level['targets'];
    for(let i = 0; i < targets.length; i++) {
        const target = targets[i];
        if(target != undefined) {
            const node = gui.get_node(presets.targets[i].node_name);
            gui.set_enabled(node, true);
            gui.set_position(node, presets.targets[i].preset_depend_of_length[targets.length].position);
            gui.set_scale(node, presets.targets[i].preset_depend_of_length[targets.length].scale);

            let view;
            if(target.type == TargetType.Cell) {
                view = GAME_CONFIG.cell_view[target.id as CellId];
                if(Array.isArray(view))
                    view = view[0];
            } else view = GAME_CONFIG.element_view[target.id as ElementId];
        
            gui.play_flipbook(gui.get_node(presets.targets[i].node_name + '_icon'), (view == 'cell_web') ? view + '_ui' : view);
            set_text(presets.targets[i].node_name + '_counts', target.count);
        }
    }

    gui.set_text(gui.get_node('targets_box/text'), Lang.get_text('targets'));
}

function setup_busters(instance: props) {
    if(GAME_CONFIG.animal_levels.includes(GameStorage.get('current_level') + 1)) return;
    
    gui.set_enabled(gui.get_node('buster_buttons'), true);
    
    if(GameStorage.get('spinning_opened')) {
        instance.druid.new_button('spinning/button', () => {
            if(GameStorage.get('spinning_counts') == 0) {
                if(GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
                    if(GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                        EventBus.send('TRY_BUY_SPINNING');
                } else EventBus.send('TRY_BUY_SPINNING');
                return;
            }
            EventBus.send('ACTIVATE_BUSTER', {name: 'SPINNING'});
        });

        gui.set_enabled(gui.get_node('spinning/lock'), false);
        gui.set_enabled(gui.get_node('spinning/icon'), true);
        gui.set_enabled(gui.get_node('spinning/counts'), true);
    }

    if(GameStorage.get('hammer_opened')) {
        instance.druid.new_button('hammer/button', () => {
            if(GameStorage.get('hammer_counts') == 0) {
                if(GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
                    if(GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                        EventBus.send('TRY_BUY_HAMMER');
                } else EventBus.send('TRY_BUY_HAMMER');
                return;
            }
            EventBus.send('ACTIVATE_BUSTER', {name: 'HAMMER'});
        });
        
        gui.set_enabled(gui.get_node('hammer/lock'), false);
        gui.set_enabled(gui.get_node('hammer/icon'), true);
        gui.set_enabled(gui.get_node('hammer/counts'), true);
    }
    
    if(GameStorage.get('horizontal_rocket_opened')) {
        instance.druid.new_button('horizontal_rocket/button', () => {
            if(GameStorage.get('horizontal_rocket_counts') == 0) {
                if(GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
                    if(GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                        EventBus.send('TRY_BUY_HORIZONTAL_ROCKET');
                } else EventBus.send('TRY_BUY_HORIZONTAL_ROCKET');
                return;
            }
            EventBus.send('ACTIVATE_BUSTER', {name: 'HORIZONTAL_ROCKET'});
        });
        
        gui.set_enabled(gui.get_node('horizontal_rocket/lock'), false);
        gui.set_enabled(gui.get_node('horizontal_rocket/icon'), true);
        gui.set_enabled(gui.get_node('horizontal_rocket/counts'), true);
    }

    if(GameStorage.get('vertical_rocket_opened')) {
        instance.druid.new_button('vertical_rocket/button', () => {
            if(GameStorage.get('vertical_rocket_counts') == 0) {
                if(GAME_CONFIG.tutorial_levels.includes(GameStorage.get('current_level') + 1)) {
                    if(GameStorage.get('completed_tutorials').includes(GameStorage.get('current_level') + 1))
                        EventBus.send('TRY_BUY_VERTICAL_ROCKET');
                } else EventBus.send('TRY_BUY_VERTICAL_ROCKET');
                return;
            }
            EventBus.send('ACTIVATE_BUSTER', {name: 'VERTICAL_ROCKET'});
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
    instance.druid.new_button('revert_step/button', () => EventBus.send('REVERT_STEP'));

    set_text('current_level', 'Уровень ' + (GameStorage.get('current_level') + 1));
}

function setup_win_ui(instance: props) {
    instance.druid.new_button('continue_button', next_level);
    instance.druid.new_button('win_close', () => Scene.load('map'));
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
    
    gui.set_text(gui.get_node('steps_by_coins/text'), "+5 ходов         500");
    instance.druid.new_button('steps_by_coins/button', () => {
        if(!is_enough_coins(500)) {
            EventBus.send('REQUEST_OPEN_STORE');
            return;
        }
        remove_coins(500);
        EventBus.send('REVIVE', 5);
    });
}

function set_animal_tutorial_tip() {
    const window = gui.get_node('window');
    gui.set_enabled(window, true);
}

// TODO: get data from game load event instead read config
function set_events(instance: props) {
    EventBus.on('SET_ANIMAL_TUTORIAL_TIP', set_animal_tutorial_tip, true);
    EventBus.on('INIT_UI', () => setup(instance));
    EventBus.on('UPDATED_STEP_COUNTER', (steps) => set_text('steps', steps), true);
    EventBus.on('UPDATED_TARGET', (data) => update_targets(data), true);
    EventBus.on('UPDATED_BUTTONS', () => update_buttons(instance), true);
    EventBus.on('GAME_TIMER', (time) => set_text('time', parse_time(time)), true);
    EventBus.on('SET_TUTORIAL', set_tutorial, true);
    EventBus.on('REMOVE_TUTORIAL', remove_tutorial, true);
    EventBus.on('SET_WIN_UI', set_win, true);
    EventBus.on('ON_GAME_OVER', (state) => { set_gameover(instance, state); }, true);
    EventBus.on('FEED_ANIMAL', feed_animation, true);

}

function update_targets(data: TargetMessage) {
    switch(data.idx) {
        case 0: set_text('first_target_counts', math.max(0, data.amount)); break;
        case 1: set_text('second_target_counts', math.max(0, data.amount)); break;
        case 2: set_text('third_target_counts', math.max(0, data.amount)); break;
    }
}

function feed_animation(item_type: number) {
    for(let i = 0; i < 10; i++) {
        timer.delay(0.05 * i, false, () => {
            const element = gui.new_box_node(vmath.vector3(420, 870, 0), vmath.vector3(40, 40, 1));
            const view = GAME_CONFIG.element_view[item_type as ElementId];
            gui.set_texture(element, 'graphics');
            gui.play_flipbook(element, view);
            gui.animate(element, 'position', vmath.vector3(250, 150, 0), gui.EASING_INCUBIC, 1, 0, () => {
                gui.animate(element, gui.PROP_SCALE, vmath.vector3(0, 0, 0), gui.EASING_INCUBIC, 0.5, 5, () => { gui.delete_node(element); });
            });
        });
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

let hand_timer: hash;
function set_tutorial() {
    const tutorial_data = GAME_CONFIG.tutorials_data[GameStorage.get("current_level") + 1];
    const tutorial = gui.get_node('tutorial');
    const tutorial_text = gui.get_node('tutorial_text');
    gui.set_position(tutorial_text, tutorial_data.text.pos);
    gui.set_text(tutorial_text, Lang.get_text(tutorial_data.text.data));
    gui.set_enabled(tutorial, true);

    if(tutorial_data.arrow_pos != undefined) {
        const arrow = gui.get_node('arrow');
        gui.set_enabled(arrow, true);
        gui.set_position(arrow, tutorial_data.arrow_pos);
    }

    if(tutorial_data.buster_icon != undefined) {
        const buster = gui.get_node('buster');
        const buster_icon = gui.get_node('buster_icon');

        gui.set_enabled(buster, true);
        gui.set_position(buster, tutorial_data.buster_icon.pos);
        gui.play_flipbook(buster_icon, tutorial_data.buster_icon.icon);
    }

    if(tutorial_data.busters != undefined) {
        const busters = Array.isArray(tutorial_data.busters) ? tutorial_data.busters : [tutorial_data.busters];        
        for(const buster of busters)
            gui.set_layer(gui.get_node(buster + "/button"), "top");

        if(busters.includes('spinning')) {
            // TODO: separate hand logic
            const hand = gui.get_node('hand');
            hand_timer = timer.delay(4, true, () => {
                gui.set_position(hand, vmath.vector3(-170, -350, 0));
                gui.set_enabled(hand, true);
                gui.animate(hand, gui.PROP_SCALE, vmath.vector3(0.7, 0.7, 0.7), gui.EASING_INCUBIC, 0.5, 0, () => {
                    gui.set_enabled(hand, false);
                }, gui.PLAYBACK_ONCE_PINGPONG);
            });
        }

        if(busters.includes('hammer')) {
            // TODO: separate hand logic
            const hand = gui.get_node('hand');
            hand_timer = timer.delay(4, true, () => {
                gui.set_position(hand, vmath.vector3(-60, -350, 0));
                gui.set_enabled(hand, true);
                gui.animate(hand, gui.PROP_SCALE, vmath.vector3(0.7, 0.7, 0.7), gui.EASING_INCUBIC, 0.5, 0, () => {
                    gui.animate(hand, gui.PROP_POSITION, vmath.vector3(70, 70, 0), gui.EASING_INCUBIC, 1, 0, () => {
                        gui.animate(hand, gui.PROP_SCALE, vmath.vector3(0.7, 0.7, 0.7), gui.EASING_INCUBIC, 0.5, 0, () => {
                            gui.set_enabled(hand, false);
                        }, gui.PLAYBACK_ONCE_PINGPONG);
                    });
                }, gui.PLAYBACK_ONCE_PINGPONG);
            });
        }

        if(busters.includes('horizontal_rocket')) {
            // TODO: separate hand logic
            const hand = gui.get_node('hand');
            hand_timer = timer.delay(4, true, () => {
                gui.set_position(hand, vmath.vector3(50, -350, 0));
                gui.set_enabled(hand, true);
                gui.animate(hand, gui.PROP_SCALE, vmath.vector3(0.7, 0.7, 0.7), gui.EASING_INCUBIC, 0.5, 0, () => {
                    gui.animate(hand, gui.PROP_POSITION, vmath.vector3(-100, 20, 0), gui.EASING_INCUBIC, 1, 0, () => {
                        gui.animate(hand, gui.PROP_SCALE, vmath.vector3(0.7, 0.7, 0.7), gui.EASING_INCUBIC, 0.5, 0, () => {
                            gui.set_enabled(hand, false);
                        }, gui.PLAYBACK_ONCE_PINGPONG);
                    });
                }, gui.PLAYBACK_ONCE_PINGPONG);
            });
        }
    }
}

function remove_tutorial() {
    if(hand_timer != null) timer.cancel(hand_timer);
    gui.set_enabled(gui.get_node('tutorial'), false);
}

function set_win() {
    disable_game_ui();
    gui.set_enabled(gui.get_node('win'), true);

    const anim_props = { blend_duration: 0, playback_rate: 1 };
    gui.play_spine_anim(gui.get_node("firework"), hash("firework"), gui.PLAYBACK_LOOP_FORWARD, anim_props);
}

// TODO: make presets for gameover
function set_gameover(instance: props, state: GameState) {
    disable_game_ui();
    
    gui.set_enabled(gui.get_node('gameover'), true);
    gui.set_enabled(gui.get_node('missing_targets'), true);

    const target_1 = gui.get_node('target_1');
    const target_2 = gui.get_node('target_2');
    const target_3 = gui.get_node('target_3');
    
    if(state.targets.length == 1) {
        const target1 = state.targets[0];

        let view1 = '';
        if(target1.type == TargetType.Cell) {
            if(Array.isArray(GAME_CONFIG.cell_view[target1.id as CellId])) view1 = GAME_CONFIG.cell_view[target1.id as CellId][0];
            else view1 = GAME_CONFIG.cell_view[target1.id as CellId] as string;
        } else view1 = GAME_CONFIG.element_view[target1.id as ElementId];

        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);
        
        gui.set_text(gui.get_node('target_1_text'), tostring(math.min(target1.uids.length, target1.count) + "/" + target1.count));

        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);
        
        gui.set_position(target_1, vmath.vector3(0, 0, 0));
        gui.set_enabled(target_1, true);
    }
    else if(state.targets.length == 2) {
        const target1 = state.targets[0];

        let view1 = '';
        if(target1.type == TargetType.Cell) {
            if(Array.isArray(GAME_CONFIG.cell_view[target1.id as CellId])) view1 = GAME_CONFIG.cell_view[target1.id as CellId][0];
            else view1 = GAME_CONFIG.cell_view[target1.id as CellId] as string;
        } else view1 = GAME_CONFIG.element_view[target1.id as ElementId];

        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);
        
        gui.set_text(gui.get_node('target_1_text'), tostring(math.min(target1.uids.length, target1.count) + "/" + target1.count));
        
        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);
        
        gui.set_position(target_1, vmath.vector3(-70, 0, 0));
        gui.set_enabled(target_1, true);

        const target2 = state.targets[1];
        
        let view2 = '';
        if(target2.type == TargetType.Cell) {
            if(Array.isArray(GAME_CONFIG.cell_view[target2.id as CellId])) view2 = GAME_CONFIG.cell_view[target2.id as CellId][0];
            else view2 = GAME_CONFIG.cell_view[target2.id as CellId] as string;
        } else view2 = GAME_CONFIG.element_view[target2.id as ElementId];

        gui.play_flipbook(gui.get_node('target_2'), (view2 == 'cell_web') ? view2 + '_ui' : view2);
        
        gui.set_text(gui.get_node('target_2_text'), tostring(math.min(target2.uids.length, target2.count) + "/" + target2.count));
        
        gui.set_enabled(gui.get_node('target_2_fail_icon'), target2.uids.length < target2.count);
        
        gui.set_position(target_2, vmath.vector3(70, 0, 0));
        gui.set_enabled(target_2, true);
    }
    else if(state.targets.length == 3) {
        const target1 = state.targets[0];

        let view1 = '';
        if(target1.type == TargetType.Cell) {
            if(Array.isArray(GAME_CONFIG.cell_view[target1.id as CellId])) view1 = GAME_CONFIG.cell_view[target1.id as CellId][0];
            else view1 = GAME_CONFIG.cell_view[target1.id as CellId] as string;
        } else view1 = GAME_CONFIG.element_view[target1.id as ElementId];

        gui.play_flipbook(gui.get_node('target_1'), (view1 == 'cell_web') ? view1 + '_ui' : view1);
        
        gui.set_text(gui.get_node('target_1_text'), tostring(math.min(target1.uids.length, target1.count) + "/" + target1.count));

        gui.set_enabled(gui.get_node('target_1_fail_icon'), target1.uids.length < target1.count);
        
        gui.set_position(target_1, vmath.vector3(-125, 0, 0));
        gui.set_enabled(target_1, true);
    
        const target2 = state.targets[1];

        let view2 = '';
        if(target2.type == TargetType.Cell) {
            if(Array.isArray(GAME_CONFIG.cell_view[target2.id as CellId])) view2 = GAME_CONFIG.cell_view[target2.id as CellId][0];
            else view2 = GAME_CONFIG.cell_view[target2.id as CellId] as string;
        } else view2 = GAME_CONFIG.element_view[target2.id as ElementId];

        gui.play_flipbook(gui.get_node('target_2'), (view2 == 'cell_web') ? view2 + '_ui' : view2);

        gui.set_text(gui.get_node('target_2_text'), tostring(math.min(target2.uids.length, target2.count) + "/" + target2.count));

        gui.set_enabled(gui.get_node('target_2_fail_icon'), target2.uids.length < target2.count);
        
        gui.set_position(target_2, vmath.vector3(0, 0, 0));
        gui.set_enabled(target_2, true);
    
        const target3 = state.targets[2];

        let view3 = '';
        if(target3.type == TargetType.Cell) {
            if(Array.isArray(GAME_CONFIG.cell_view[target3.id as CellId])) view3 = GAME_CONFIG.cell_view[target3.id as CellId][0];
            else view3 = GAME_CONFIG.cell_view[target3.id as CellId] as string;
        } else view3 = GAME_CONFIG.element_view[target3.id as ElementId];

        gui.play_flipbook(gui.get_node('target_3'), (view3 == 'cell_web') ? view3 + '_ui' : view3);

        gui.set_text(gui.get_node('target_3_text'), tostring(math.min(target3.uids.length, target3.count) + "/" + target3.count));

        gui.set_enabled(gui.get_node('target_3_fail_icon'), target3.uids.length < target3.count);

        gui.set_position(target_3, vmath.vector3(125, 0, 0));
        gui.set_enabled(target_3, true);
    }

    if(instance.level.steps != undefined) set_gameover_offer();
    else disabled_gameover_offer();
}

function set_gameover_offer() {
    gui.set_enabled(gui.get_node('gameover_offer_close'), true);
    gui.set_enabled(gui.get_node('steps_by_ad/button'), true);
    gui.set_enabled(gui.get_node('steps_by_coins/button'), true);
}

function disabled_gameover_offer() {
    remove_lifes(1);

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