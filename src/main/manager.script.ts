/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import * as druid from 'druid.druid';
import * as default_style from "druid.styles.default.style";

import { register_manager } from '../modules/Manager';
import { load_config } from '../game/match3_game';


interface props {
}


export function init(this: props) {
    msg.post('.', 'acquire_input_focus');
    register_manager();
    
    Manager.init(() => {
        log('All ready');
    }, true);
    
    Sound.attach_druid_click('sel');

    default_style.scroll.WHEEL_SCROLL_SPEED = 10;
    druid.set_default_style(default_style);

    Camera.set_go_prjection(-1, 1, -3, 3);
    Scene.set_bg('#88dfeb');

    load_config();
    Scene.load('movie');
}

export function update(this: props, dt: number): void {
    Manager.update(dt);
}

export function on_message(this: props, message_id: hash, _message: any, sender: hash): void {
    Manager.on_message(this, message_id, _message, sender);
}