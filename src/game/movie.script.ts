/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

interface props {}

export function init(this: props) {
    Manager.init_script();

    msg.post('.', 'acquire_input_focus');
    
    const anim_props = { blend_duration: 0, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'start', go.PLAYBACK_ONCE_FORWARD, anim_props, () => Scene.load("map"));
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if (action_id == hash('touch')) Scene.load("map");
}

export function final(this: props): void {
    Scene.unload_all_resources('movie');
    Manager.final_script();
}