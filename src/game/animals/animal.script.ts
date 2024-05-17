/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

go.property('walkable', true);

interface props {
    walkable: boolean
}

interface AnimalOptions {
    walkable: boolean
}

export function init(this: props) {
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
    timer.delay(math.random(5, 10), true, () => {
        if(options.walkable) walk();
        else action(idle);
    });
}

function walk() {
    const to_pos = go.get_position();
    to_pos.x -= 100;
    walk_to(to_pos, () => {
        action(() => {
            const back_pos = go.get_position();
            back_pos.x += 100;
            walk_back(back_pos, idle);
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