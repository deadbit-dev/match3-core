/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as druid from 'druid.druid';


interface props {
    druid: DruidClass;
    is_started: boolean;
}

export function init(this: props): void {
    Manager.init_script();
    this.druid = druid.new(this);
    this.is_started = false;

    gui.set_text(gui.get_node('description'), Lang.get_text('movie_description'));
    gui.set_text(gui.get_node('text'), Lang.get_text('play'));

    this.druid.new_button('btn', () => {
        GameStorage.set("move_showed", true);
        gui.set_enabled(gui.get_node('window'), false);
        GAME_CONFIG.steps_by_ad = 0;
        GameStorage.set('current_level', 0);
        Sound.stop('map');
        Scene.load('game');
        Scene.try_load_async('map');
        Metrica.report('data', { 'movie': { event: 'button_2' } });
    });

    gui.set_text(gui.get_node('start_lable'), Lang.get_text('start'));
    Metrica.report('data', { 'movie': { event: 'start' } });
    this.druid.new_button('start_button', () => {
        this.is_started = true;
        gui.set_enabled(gui.get_node('start_button'), false);
        EventBus.send('START_MOVIE');
        Metrica.report('data', { 'movie': { event: 'button_1' } });
    });

    Camera.set_dynamic_orientation(false);
    Camera.set_go_prjection(-1, 0, -3, 3);

    EventBus.on("SYS_ON_RESIZED", on_resize);

    Camera.update_window_size();

    EventBus.on('MOVIE_END', () => {
        if (!this.is_started)
            return;
        const window = gui.get_node('window');
        gui.set_enabled(window, true);
    });
}

export function on_input(this: props, action_id: string | hash, action: any): boolean {
    return this.druid.on_input(action_id, action);
}

export function update(this: props, dt: number): void {
    this.druid.update(dt);
}

export function on_message(this: props, message_id: string | hash, message: any, sender: string | hash | url): void {
    Manager.on_message(this, message_id, message, sender);
    this.druid.on_message(message_id, message, sender);
}

export function final(this: props): void {
    this.druid.final();
    EventBus.off_all_current_script();
    Manager.final_script();
}

function on_resize(data: { width: number, height: number }) {
    const display_height = 960;
    const window_aspect = data.width / data.height;
    const display_width = tonumber(sys.get_config("display.width"));
    if (display_width) {
        const aspect = display_width / display_height;
        let zoom = 1;
        if (window_aspect >= aspect) {
            const height = display_width / window_aspect;
            zoom = height / display_height;
        }
        Camera.set_zoom(zoom);
    }
}