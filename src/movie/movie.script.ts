/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

interface props {}

export function init(this: props) {
    Manager.init_script();

    msg.post('.', 'acquire_input_focus');

    Sound.play('car');
    timer.delay(1, false, () => {
        Sound.play('crash');
    });
    timer.delay(2, false, () => {
        Sound.play('crash');
    });
    timer.delay(2.5, false, () => {
        Sound.play('vcat');
    });
    timer.delay(5, false, () => {
        Sound.play('meay');
    });

    
    const anim_props = { blend_duration: 0, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'start', go.PLAYBACK_ONCE_FORWARD, anim_props, (self: any, message_id: any, message: any, sender: any) => {
        if (message_id != hash("spine_animation_done")) return;
        on_end();
    });
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if (action_id == hash('touch') && action.released) on_end();
}

export function final(this: props): void {
    Scene.unload_all_resources('movie');
    Manager.final_script();
}

function on_end() {
    Sound.stop('car');
    Sound.stop('crash');
    Sound.stop('vcat');
    Sound.stop('meay');
    GameStorage.set("move_showed", true);
    EventBus.send('MOVIE_END');
}