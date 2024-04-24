/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';
import * as default_style from "druid.styles.default.style";
import * as reszip from 'liveupdate_reszip.reszip';
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
    try_load('map');
}

function try_load(name: string) {
    const resource_file = sys.get_config("liveupdate_reszip.filename", "resources.zip");
    const missing_resources = collectionproxy.missing_resources('#' + name);
    if(liveupdate && (reszip.version_match(resource_file) || missing_resources != null)) {
        print("START_LOAD_RESOURCES");
        reszip.load_and_mount_zip(resource_file, {
            filename: resource_file,
            delete_old_file: true,
            on_finish: (self: any, err: any) => {
                print("FINISH_LOAD_RESOURCES");
                if(!err) Scene.load(name, true);
                else {
                    print("ERROR: ", err);
                    Scene.load('game', true, ['background']);
                }
            },
        });
    } else Scene.load(name, true);
}

export function update(this: props, dt: number): void {
    Manager.update(dt);
}

export function on_message(this: props, message_id: hash, _message: any, sender: hash): void {
    Manager.on_message(this, message_id, _message, sender);
}