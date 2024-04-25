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
        input_listener();
    }
    
    function input_listener() {
        while (true) {
            const [message_id, _message, sender] = flow.until_any_message();
            switch(message_id) {
                case ID_MESSAGES.MSG_TOUCH: on_click(); break;
            }
        }
    }

    function on_click() {
       load_level();
    }

    function load_level() {
        Scene.load('game', true);
    }

    return init();
}