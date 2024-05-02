/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-case-declarations */

import * as flow from 'ludobits.m.flow';

export function Map() {
    
    function init() {
        set_completed_levels();
        input_listener();
    }

    function set_completed_levels() {
        for(const level of GameStorage.get('completed_levels')) {
            const url = msg.url(undefined, hash('/level_' + tostring(level + 1)), 'sprite');
            print(url);
            sprite.play_flipbook(url, 'button_level_green');
        }
    }
    
    function input_listener() {
        while (true) {
            const [message_id, message, sender] = flow.until_any_message();
            switch(message_id) {
                case ID_MESSAGES.MSG_TOUCH:
                    for(let i = 1; i <= GAME_CONFIG.levels.length /* && i <= GameStorage.get('completed_levels').length + 1 */; i++)
                        msg.post(msg.url(undefined, hash('/level_' + tostring(i)), 'level'), message_id, message);
                    if(!message.pressed && !message.released) on_drag(message);
                break;
            }
        }
    }

    function on_drag(action: any) {
        const pos = go.get_world_position('map');
        pos.y = math.max(-2800, math.min(0, pos.y + action.dy));
        go.set_position(pos, 'map');
    }
    
    return init();
}