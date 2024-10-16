/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { is_tutorial } from "../utils";

go.property('walkable', true);

interface props {
    walkable: boolean
    timers: hash[]
}

interface AnimalOptions {
    walkable: boolean
}

export function init(this: props) {
    Manager.init_script();

    this.timers = [];

    EventBus.on('ON_WIN', () => {
        for(const t of this.timers)
            timer.cancel(t);
        idle();
    });
    
    if(is_tutorial()) {
        EventBus.on('HIDED_ANIMAL_TUTORIAL_TIP', () => {
            start_action(this, {walkable: this.walkable});
        });
    } else start_action(this, {walkable: this.walkable});

    animal_init({
        walkable: this.walkable
    });
}

function animal_init(options: AnimalOptions) {
    if(GAME_CONFIG.animal_offset) {
        const pos = go.get_position();
        pos.y += 100; 
        go.set_position(pos);
    }

    idle();
}

function start_action(props: props, options: AnimalOptions) {

    if(options.walkable) props.timers.push(timer.delay(math.random(5, 10), false, walk));
    else {
        props.timers.push(timer.delay(math.random(5, 10), false, () => {
            action(() => {
                idle();
                props.timers.push(timer.delay(math.random(5, 10), false, () => {
                    action(() => {
                        idle();
                    });
                }));
            });
        }));
    }
}

function walk() {
    const to_pos = go.get_position();
    to_pos.x -= 70;
    walk_to(to_pos, () => {
        action(() => {
            const back_pos = go.get_position();
            back_pos.x += 70;
            walk_back(back_pos, () => {
                idle();
                timer.delay(math.random(5, 10), false, walk);
            });
        });
    });
}

function idle() {
    const anim_props = { blend_duration: 0.1, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'idle', go.PLAYBACK_LOOP_FORWARD, anim_props);
}

function walk_to(pos: vmath.vector3, callback?: () => void) {
    const anim_props = { blend_duration: 0.5, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'walk', go.PLAYBACK_ONCE_FORWARD, anim_props);
    go.animate(go.get_id(), 'position', go.PLAYBACK_ONCE_FORWARD, pos, go.EASING_LINEAR, 1, 0, () => {
        if(callback != undefined) callback();
    });
}

function action(callback?: () => void) {
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