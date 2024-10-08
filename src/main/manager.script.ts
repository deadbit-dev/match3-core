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
import { BannerPos } from '../modules/Ads';
import { register_manager } from '../modules/Manager';
import { load_levels_config } from '../game/level';


interface props {
}


export function init(this: props) {
    msg.post('.', 'acquire_input_focus');
    register_manager();
    
    Manager.init(() => {
        EventBus.on('ON_SCENE_LOADED', (message) => {
            const name = message.name;
            // window.set_dim_mode(name.includes('game') ? window.DIMMING_OFF : window.DIMMING_ON);
            if (message.name == 'game')
                Ads.show_banner(BannerPos.POS_BOTTOM_CENTER);
            else
                Ads.hide_banner();
        });
        
        // если это одноклассники
        if (System.platform == 'HTML5' && HtmlBridge.get_platform() == 'ok')
            HtmlBridge.start_resize_monitor();

        Sound.set_gain('map', GameStorage.get('sound_bg') ? 1 : 0);
        Sound.set_gain('game', GameStorage.get('sound_bg') ? 1 : 0);
        Sound.set_gain('store', GameStorage.get('sound_bg') ? 1 : 0);

        default_style.scroll.WHEEL_SCROLL_SPEED = 10;
        druid.set_default_style(default_style);
        Sound.attach_druid_click('btn');
        Camera.set_go_prjection(-1, 1, -3, 3);

        Scene.load(GameStorage.get('move_showed') ? 'map' : 'movie');
        Scene.set_bg('#88dfeb');

        timer.delay(0, false, load_levels_config);
    }, true);
}

export function on_message(this: props, message_id: hash, _message: any, sender: hash): void {
    Manager.on_message_main(this, message_id, _message, sender);
}