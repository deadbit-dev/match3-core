/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import * as reszip from 'liveupdate_reszip.reszip';
import { MAIN_BUNDLE_SCENES } from '../main/game_config';
import { hex2rgba } from "../utils/utils";
import { Messages } from "./modules_const";


/*
    Модуль для работы со сценой
*/

declare global {
    const Scene: ReturnType<typeof SceneModule>;
}

export function register_scene() {
    (_G as any).Scene = SceneModule();
}


function SceneModule() {
    let wait_load_scene = '';
    let last_loading_scene = '';
    let last_scene = '';
    let is_restarting_scene = false;
    let is_resource = false;
    let _wait_ready_manager = false;
    

    const scene_resources: { [key in string]: string[] } = {};
    
    function init() {
        if (System.platform == 'HTML5')
            html5.run(`window.set_light = function(val){document.body.style.backgroundColor = val}`);
    }

    function set_bg(color: string) {
        msg.post("@render:", "clear_color", { color: hex2rgba(color, 0) });
        if (System.platform == 'HTML5')
            html5.run(`set_light('` + color + `')`);
    }

    // загрузить сцену с именем. wait_ready_manager - ждать ли сначала полной загрузки менеджера
    function load(name: string, wait_ready_manager = false) {
        _wait_ready_manager = wait_ready_manager;
    
        Manager.send('LOAD_SCENE', { name });
    }

    function load_resource(scene: string, resource: string) {
        if(scene_resources[scene] == null) scene_resources[scene] = [];
        scene_resources[scene].push(resource);

        Manager.send('LOAD_RESOURCE', { name: resource });
    }

    function unload_resource(scene: string, resource: string) {
        const index = scene_resources[scene].indexOf(resource);
        if(index == -1) return;

        scene_resources[scene].splice(index, 1);
        Manager.send('UNLOAD_RESOURCE', { name: resource });
    }

    function unload_all_resources() {
        const scene = get_current_name();
        for(const resource of scene_resources[scene])
            unload_resource(scene, resource);
    }

    function restart() {
        Manager.send('RESTART_SCENE');
    }
    
    function try_load(name: string, on_loaded: () => void) {
        const missing_resources = collectionproxy.missing_resources(Manager.MANAGER_ID + '#' + name);
        // const miss_resource = missing_resources != null;
        // if(miss_resource) Log.warn("Нехватает ресурсов!");

        let is_missing = false;
        for(const [key, value] of Object.entries(missing_resources)) {
            Log.warn("Ненайден ресурс: " + key + " " + value);
            if(value != null) {
                is_missing = true;
                break;
            }
        }

        const resource_file = name + ".zip";

        // FIXME: why 'reszip.version_match' allways return false ?
        const miss_match_version = false; //!reszip.version_match(resource_file);
        if(miss_match_version) Log.warn("Несовпадает версия ресурс файла!");

        if(liveupdate && (miss_match_version || is_missing) && !MAIN_BUNDLE_SCENES.includes(name)) {
            Log.log("Загрузка ресурсов для сцены: " + name);
            reszip.load_and_mount_zip(resource_file, {
                filename: resource_file,
                delete_old_file: true,
                on_finish: (self: any, err: any) => {
                    if(!err) {
                        Log.log("Загружены ресурсы для сцены: " + name);
                        on_loaded();
                    } else Log.warn('Неудалось загрузить сцену: ' + name);
                },
            });
        } else on_loaded();
    }

    function _on_message(_this: any, message_id: hash, _message: any, sender: hash) {
        if (message_id == to_hash('MANAGER_READY')) {
            // еще не поступала никакая сцена на загрузку значит ничего не делаем
            if (wait_load_scene == '')
                return;
            Manager.send('LOAD_SCENE', { name: wait_load_scene });
        }
        if (message_id == to_hash('RESTART_SCENE')) {
            if (last_scene == '')
                return Log.warn('Сцена для перезагрузки не найдена');
            
            const scene = Manager.MANAGER_ID + "#" + last_scene;
            msg.post(scene, "disable");
            msg.post(scene, "final");
            msg.post(scene, "unload");
            
            is_restarting_scene = true;
        }
        if (message_id == to_hash('LOAD_SCENE')) {
            const message = _message as Messages['LOAD_SCENE'];
            
            // ждем готовности модулей
            if (_wait_ready_manager && !Manager.is_ready()) {
                wait_load_scene = message.name;
                return;
            }

            wait_load_scene = '';
            last_loading_scene = message.name;

            try_load(message.name, () => {
                msg.post(Manager.MANAGER_ID + "#" + message.name, "load");
            });
        }
        if (message_id == hash('LOAD_RESOURCE')) {
            const message = _message as Messages['LOAD_RESOURCE'];

            try_load(message.name, () => {
                is_resource = true;
                msg.post(Manager.MANAGER_ID + "#" + message.name, "load");
            });
        }
        if (message_id == hash('UNLOAD_RESOURCE')) {
            const message = _message as Messages['UNLOAD_RESOURCE'];
            is_resource = true;
            msg.post(Manager.MANAGER_ID + "#" + message.name, "unload");
        } 
        if (message_id == hash("proxy_loaded")) {
            if(!is_resource) on_loaded_scene(sender);
            else on_loaded_resource(sender);        
        }
        if (message_id == hash("proxy_unloaded")) {
            if (!is_resource && is_restarting_scene && last_scene != '') {
                Manager.send('LOAD_SCENE', { name: last_scene });
            }

            is_resource = false;
        }
    }

    function on_loaded_scene(sender: hash) {
        if (last_scene != '' && !is_restarting_scene) {
            const scene = Manager.MANAGER_ID + "#" + last_scene;
            msg.post(scene, "disable");
            msg.post(scene, "final");
            msg.post(scene, "unload");
            
            last_scene = '';
        }

        is_restarting_scene = false;

        msg.post(sender, "init");
        msg.post(sender, "enable");
        
        last_scene = last_loading_scene;
        last_loading_scene = '';

        Manager.send('SCENE_LOADED', { name: last_scene });
    }

    function on_loaded_resource(sender: hash) {
        is_resource = false;
        
        msg.post(sender, "init");
        msg.post(sender, "enable");
    }

    function get_current_name() {
        return last_scene;
    }

    init();

    return { _on_message, restart, load, load_resource, unload_resource, unload_all_resources, set_bg, get_current_name };
}