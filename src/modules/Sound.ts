/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as druid from 'druid.druid';
import { Messages } from "./modules_const";

/*
    Модуль для работы со звуком
*/

declare global {
    const Sound: ReturnType<typeof SoundModule>;
}

export function register_sound() {
    (_G as any).Sound = SoundModule();
}

function SoundModule() {

    function init() {
        set_active(is_active());
        set_sfx_active(is_sfx_active());
        set_music_active(is_music_active());
        //  play('empty');
    }

    function attach_druid_click(name = 'btn') {
        druid.set_sound_function(() => play(name));
    }

    function _on_message(_this: any, message_id: hash, _message: any, sender: hash) {
        if (message_id == to_hash('STOP_SND')) {
            const message = _message as Messages['STOP_SND'];
            sound.stop('/sounds#' + message.name);
        }
        if (message_id == to_hash('PLAY_SND')) {
            const message = _message as Messages['PLAY_SND'];
            //sound.stop('/sounds#' + message.name);
            sound.play('/sounds#' + message.name, { speed: message.speed, gain: message.volume });
        }
        if (message_id == to_hash('SET_GAIN')) {
            const message = _message as Messages['SET_GAIN'];
            sound.set_gain('/sounds#' + message.name, message.val);
        }
    }

    function is_active() {
        return Storage.get_bool('is_sound', true);
    }

    function is_sfx_active() {
        return Storage.get_bool('is_sfx', true);
    }

    function is_music_active() {
        return Storage.get_bool('is_music', true);
    }

    function set_active(active: boolean) {
        Storage.set('is_sound', active);
        sound.set_group_gain('master', active ? 1 : 0);
    }

    function set_sfx_active(state: boolean) {
        Storage.set('is_sfx', state);
        sound.set_group_gain('sfx', state ? 1 : 0);
    }

    function set_music_active(state: boolean) {
        Storage.set('is_music', state);
        sound.set_group_gain('music', state ? 0.5 : 0);
    }

    function play(name: string, speed = 1, volume = 1) {
        Manager.send('PLAY_SND', { name, speed, volume });
    }

    function stop(name: string) {
        Manager.send('STOP_SND', { name });
    }

    function set_pause(val: boolean) {
        const scene_name = Scene.get_current_name();
        if (scene_name != '')
            Manager.send('ON_SOUND_PAUSE', { val }, scene_name + ':/ui#' + scene_name);
        if (!is_active())
            return;
        sound.set_group_gain('master', val ? 0 : 1);
    }

    function set_gain(name: string, val: number) {
        Manager.send('SET_GAIN', { name, val });
    }




    init();

    return { _on_message, is_active, set_active, is_sfx_active, set_sfx_active, is_music_active, set_music_active, play, stop, set_pause, attach_druid_click, set_gain };
}