/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

interface props {}

export function init(this: props) {
    const anim_props = { blend_duration: 0, playback_rate: 1 };
    spine.play_anim('#spinemodel', 'idle', go.PLAYBACK_LOOP_FORWARD, anim_props);
}