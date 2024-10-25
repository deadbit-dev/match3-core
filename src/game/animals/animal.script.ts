/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

// FIXME: REAFACTORING !!!

import { get_current_level, is_tutorial } from "../utils";

go.property('walkable', true);

interface props {
    walkable: boolean,
    is_win: boolean
}

interface AnimalOptions {
    walkable: boolean
}

export function init(this: props) {
    Manager.init_script();

    EventBus.on('ON_WIN', () => {
        this.is_win = true;
        if(this.walkable) {
            
            if(go.get(msg.url(undefined, undefined, "spinemodel"), 'animation') != hash("idle")) {
                const back_pos = go.get_position();
                back_pos.x += 70;
                walk_back(back_pos, idle);
            }
        }
    }, false);
    
    if(is_tutorial()) {
        EventBus.on('HIDED_ANIMAL_TUTORIAL_TIP', () => {
            print("HERE0");
            start_action(this, {walkable: this.walkable});
        }, false);
    } else start_action(this, {walkable: this.walkable});

    animal_init();
}

function animal_init() {
    if(GAME_CONFIG.animal_offset) {
        const pos = go.get_position();
        pos.y += 100; 
        go.set_position(pos);
    }

    idle();
}

function start_action(props: props, options: AnimalOptions) {
    if(options.walkable) {
        const name = GAME_CONFIG.level_to_animal[get_current_level() + 1];
        timer.delay(math.random(5, name == 'kozel' ? 6 : 10), false, () => {
            if(props.is_win)
                return;
            walk(props);
        });
    } else {
        timer.delay(math.random(5, 10), false, () => {
            if(props.is_win)
                return;
            action(() => {
                idle();
                start_action(props, options);
            });
        });
    }
}

function walk(props: props) {
    if(props.is_win)
        return;

    const to_pos = go.get_position();
    to_pos.x -= 70;
    walk_to(to_pos, () => {
        if(props.is_win)
            return;
        action(() => {
            if(props.is_win)
                return;
            const back_pos = go.get_position();
            back_pos.x += 70;
            walk_back(back_pos, () => {
                idle();
                if(props.is_win)
                    return;
                const name = GAME_CONFIG.level_to_animal[get_current_level() + 1];
                timer.delay(math.random(5, name == 'kozel' ? 6 : 10), false, walk);
            });
        });
    });
}

function idle() {
    const anim_props = { blend_duration: 0.1, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'idle', go.PLAYBACK_LOOP_FORWARD, anim_props, (self: any, message_id: any, message: any, sender: any) => {
        if (message_id == hash("spine_animation_done")) {
            idle();
        }
    });

    const name = GAME_CONFIG.level_to_animal[get_current_level() + 1];
    if(name == 'kozel') {
        timer.delay(3.25, false, () => {
            Sound.play(name);
            timer.delay(2, false, () => {
                Sound.play('cat');
            });
        });
    }
}

function walk_to(pos: vmath.vector3, callback?: () => void) {
    const anim_props = { blend_duration: 0.5, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'walk', go.PLAYBACK_ONCE_FORWARD, anim_props);
    go.animate(go.get_id(), 'position', go.PLAYBACK_ONCE_FORWARD, pos, go.EASING_LINEAR, 1, 0, () => {
        if(callback != undefined) callback();
    });
}

function action(callback?: () => void) {
    const name = GAME_CONFIG.level_to_animal[get_current_level() + 1];
    Sound.play(name);
    timer.delay(2, false, () => {
        Sound.play('cat');
    });

    const anim_props = { blend_duration: 0.3, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'action', go.PLAYBACK_ONCE_FORWARD, anim_props, (self: any, message_id: any, message: any, sender: any) => {
        if (message_id == hash("spine_animation_done") && callback != undefined) callback();
    });
}

function walk_back(pos: vmath.vector3, callback?: () => void) {
    const anim_props = { blend_duration: 0.5, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'walk_back', go.PLAYBACK_ONCE_FORWARD, anim_props);
    go.animate(go.get_id(), 'position', go.PLAYBACK_ONCE_FORWARD, pos, go.EASING_LINEAR, 1, 0, () => {
        if(callback != undefined) callback();
    });
}

export function final() {
    EventBus.off_all_current_script();
    Manager.final_script();
}