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

    let was_drag = false;
    
    function init() {
        set_completed_levels();

        const pos = go.get_position('map');
        pos.y = GameStorage.get('map_last_pos_y');
        go.set_position(pos, 'map');

        input_listener();
    }

    function set_completed_levels() {
        for(const level of GameStorage.get('completed_levels')) {
            const url = msg.url(undefined, hash('/level_' + tostring(level + 1)), 'sprite');
            sprite.play_flipbook(url, 'button_level_green');
        }
    }
    
    function input_listener() {
        while (true) {
            const [message_id, message, sender] = flow.until_any_message();
            switch(message_id) {
                case ID_MESSAGES.MSG_TOUCH:
                    if(!message.pressed && !message.released) on_drag(message);
                    else if(message.released) {
                        if(was_drag) {
                            was_drag = false;
                            break;
                        }

                        for(let i = 1; i <= GAME_CONFIG.levels.length /* && i <= GameStorage.get('completed_levels').length + 1 */; i++)
                            msg.post(msg.url(undefined, hash('/level_' + tostring(i)), 'level'), message_id, message);
                    }
                break;
            }
        }
    }

    function on_drag(action: any) {
        if(math.abs(action.dy) == 0)
            return;
        
        was_drag = true;

        const pos = go.get_position('map');
        pos.y = math.max(-2800, math.min(0, pos.y + action.dy));
        go.set_position(pos, 'map');

        GameStorage.set('map_last_pos_y', pos.y);
    }
    
    return init();
}