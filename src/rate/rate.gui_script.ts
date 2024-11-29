/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as druid from 'druid.druid';
import { IS_HUAWEI, RATE_FIRST_SHOW, RATE_SECOND_SHOW } from '../main/game_config';
import { hide_gui_list, show_gui_list } from '../utils/utils';

interface props {
    druid: DruidClass;
    rate_val: number;
}

let rate_log: typeof Log.log;

function init_gui(_this: props): void {
    Manager.init_script();
    gui.set_render_order(10);

    hide_gui_list(['rate_bg']);
    
    _this.rate_val = 0;
    _this.druid = druid.new(_this);

    _this.druid.new_blocker('rate_bg');

    _this.druid.new_button('btnClose', hide_rate);

    _this.druid.new_button('btnRate/button', () => {
        hide_rate();
        show_rate_form(_this);
    });

    _this.druid.new_button('s0', () => show_rate(0, _this));
    _this.druid.new_button('s1', () => show_rate(1, _this));
    _this.druid.new_button('s2', () => show_rate(2, _this));
    _this.druid.new_button('s3', () => show_rate(3, _this));
    _this.druid.new_button('s4', () => show_rate(4, _this));

    EventBus.on('SYS_SHOW_RATE', () => {
        print("HERE2");
        show_form();
    });
}

function hide_rate() {
    gui.set_enabled(gui.get_node('rate_bg'), false);
    EventBus.send('SYS_HIDE_RATE');
}

export function on_input(this: props, action_id: string | hash, action: unknown) {
    Camera.transform_input_action(action);
    return this.druid?.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid?.update(dt);
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    if (message_id == to_hash('MANAGER_READY')) {
        init_gui(this);
        init_rate_info();
    }
    this.druid?.on_message(message_id, message, sender);
    Manager.on_message(this, message_id, message, sender);
}

export function final(this: props): void {
    this.druid?.final();
    Manager.final_script();
}


// ---------------------------------------------------------------------------------------------------------------

function show_rate(cnt: number, _this: props) {
    _this.rate_val = cnt + 1;
    for (let i = 0; i < 5; i++)
        gui.play_flipbook(gui.get_node('s' + i), i <= cnt ? 'star' : 'starBack');
    show_gui_list(['rate_bg']);
}


function show_form() {
    rate_log('show rate check');
    if (mark_ok()) {
        Rate._mark_shown();
        rate_log('show rate OK');
        gui.set_enabled(gui.get_node('rate_bg'), true);
        return;
    }

    EventBus.send('SYS_HIDE_RATE');
}

let first_start = 0;

function init_rate_info() {
    rate_log = Log.get_with_prefix('rate').log;
    first_start = Storage.get_int('firstStart', 0);
    if (first_start == 0) {
        Storage.set('firstStart', System.now());
        first_start = System.now();
    }
}

function show_rate_form(_this: props) {
    Storage.set("isRated", 1);
    // блочим оценку ниже 4
    if (_this.rate_val < 4)
        return;
    if (System.platform == 'HTML5') {
        Ads.feedback_request_review(function () {
            log('feedback result:');
        });
    }
    else if ((System.platform == 'Android' && !IS_HUAWEI) || System.platform == 'iPhone OS') {
        if (review != null && review.is_supported())
            review.request_review();
        else
            rate_log('review not supported');
    }
    else
        rate_log('not supported platform', System.platform);
}

function mark_ok() {
    if (Storage.get_int('isRated', 0) == 1) {
        rate_log('is rated');
        return false;
    }
    const firstShow = Storage.get_int('firstShow', 0);
    const wait = firstShow == 0 ? RATE_FIRST_SHOW : RATE_SECOND_SHOW;
    const dt = System.now() - first_start;
    // можно показать
    if (dt >= wait) {
        // уже когда-то показывали, нужно лишь 2 раза макс
        if (firstShow != 0)
            Storage.set("isRated", 1);

        // еще не было пометки о первом показе
        if (firstShow == 0)
            Storage.set("firstShow", System.now());
        rate_log('mark ok = true');
        return true;
    }
    // еще рано показывать
    else {
        rate_log("wait time:" + (wait - dt));
        return false;
    }
}

