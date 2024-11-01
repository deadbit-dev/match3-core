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

    const anim_props = { blend_duration: 0, playback_rate: 0 };
    spine.play_anim('#spinemodel', 'start', go.PLAYBACK_ONCE_FORWARD, anim_props);

    // Sound.play('map', 1, 0.7);

    EventBus.on('START_MOVIE', () => {
        Sound.play('car');
        timer.delay(1, false, () => {
            Sound.play('crash');
        });
        timer.delay(1.7, false, () => {
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
    });
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    Manager.on_message(this, message_id, message, sender);
}

export function on_input(this: props, action_id: string | hash, action: any): void {
    if (action_id == hash('touch') && action.released) on_end();
}

export function final(this: props): void {
    Scene.unload_all_resources('movie');
    EventBus.off_all_current_script();
    Manager.final_script();
}

function on_end() {
    Sound.stop('car');
    Sound.stop('crash');
    Sound.stop('vcat');
    Sound.stop('meay');
    EventBus.send('MOVIE_END');
}