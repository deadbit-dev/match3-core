/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as reszip from 'liveupdate_reszip.reszip';
import { hex2rgba } from "../utils/utils";
import { Messages } from "./modules_const";
import { MAIN_BUNDLE_SCENES, RESOURCE_VERSION } from '../main/game_config';

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
    let _wait_ready_manager = false;

    const scene_resources: { [key in string]: string[] } = { 'main': [] };
    const sender_to_name: { [key in string]: hash } = {};
    const resource_to_checker: { [key in string]: () => boolean } = {};

    function init() {
        if (System.platform == 'HTML5')
            html5.run(`window.set_light = function(val){document.body.style.backgroundColor = val}`);
    }

    function set_bg(color: string) {
        msg.post("@render:", "clear_color", { color: hex2rgba(color, 0) });
        if (System.platform == 'HTML5')
            html5.run(`set_light('` + color + `')`);
    }

    function is_resource(name: string) {
        return !Object.keys(scene_resources).includes(name);
    }

    function get_name_by_hash(h: hash) {
        let name = '';
        for (const [key, value] of Object.entries(sender_to_name))
            if (value == h) name = key;
        return name;
    }

    // загрузить сцену с именем. wait_ready_manager - ждать ли сначала полной загрузки менеджера
    function load(name: string, wait_ready_manager = false) {
        _wait_ready_manager = wait_ready_manager;
        if (scene_resources[name] == undefined)
            scene_resources[name] = [];
        Manager.send('SYS_LOAD_SCENE', { name });
    }
    function load_resource(scene: string, resource: string, checker = () => { return true; }) {
        if (scene_resources[scene].indexOf(resource) != -1)
            return;

        scene_resources[scene].push(resource);
        resource_to_checker[resource] = checker;
        Manager.send('SYS_LOAD_RESOURCE', { name: resource });
    }

    function unload_resource(scene: string, resource: string) {
        if (scene_resources[scene].indexOf(resource) == -1)
            return;

        scene_resources[scene].splice(scene_resources[scene].indexOf(resource), 1);

        Manager.send('SYS_UNLOAD_RESOURCE', { name: resource });
    }

    function unload_all_resources(scene: string, except?: string[]) {
        const resources = json.decode(json.encode(scene_resources[scene]));
        if (resources == null) return;

        for (const resource of resources) {
            if (!except?.includes(resource)) {
                unload_resource(scene, resource);
            }
        }
    }

    function restart() {
        Manager.send('SYS_RESTART_SCENE');
    }

    function try_load_async(name: string) {
        Manager.send('SYS_ASYNC_LOAD_RESOURCE', { name });
    }

    function try_load(name: string, on_loaded: () => void) {
        if (!liveupdate || System.platform != 'HTML5' || MAIN_BUNDLE_SCENES.includes(name))
            return on_loaded();

        Log.log("Найдены рессурсы: ");
        for (const mount of liveupdate.get_mounts()) {
            Log.log(`\tРессурс: ${mount.uri} в маунте: ${mount.name}`);
        }

        const missing_resources = collectionproxy.missing_resources(Manager.MANAGER_ID + '#' + name);
        let is_missing = false;
        for (const [key, value] of Object.entries(missing_resources)) {
            if (value != null) {
                Log.warn("Ненайден ресурс: " + key + " " + value);
                is_missing = true;
                break;
            }
        }

        const versioned_file_name = name + "_v" + RESOURCE_VERSION + ".zip";
        const resource_file = name + ".zip";
        const miss_match_version = !reszip.version_match(versioned_file_name, name);
        if (miss_match_version) Log.warn("Несовпадает версия ресурс файла!");

        if (miss_match_version || is_missing) {
            Log.log("Загрузка ресурсов для сцены: " + name);

            reszip.load_and_mount_zip('v' + RESOURCE_VERSION + '/' + resource_file, {
                filename: versioned_file_name,
                mount_name: name,
                delete_old_file: true,
                on_finish: (self: any, err: any) => {
                    if (!err) {
                        Log.log("Загружены ресурсы для сцены: " + name);
                        on_loaded();
                    } else Log.warn('Неудалось загрузить сцену: ' + name);
                },
            });
        } else on_loaded();
    }

    // function version_match(versioned_file_name: string, mount_name: string): boolean {
    //     const mounts = liveupdate.get_mounts();
    //     for(const mount of mounts) {
    //         if(mount.name == mount_name) {
    //             const basename = mount.uri.find()  '^.+(v\\d+.+)$')[0];
    //             Log.log("MOUNT: ", basename);
    //             return basename == versioned_file_name;
    //         }
    //     }

    //     return false;
    // }

    function _on_message(_this: any, message_id: hash, _message: any, sender: hash) {
        if (message_id == to_hash('MANAGER_READY')) {
            // еще не поступала никакая сцена на загрузку значит ничего не делаем
            if (wait_load_scene == '')
                return;
            Manager.send('SYS_LOAD_SCENE', { name: wait_load_scene });
        }
        if (message_id == to_hash('SYS_RESTART_SCENE')) {
            if (last_scene == '')
                return Log.warn('Сцена для перезагрузки не найдена');
            const n = Manager.MANAGER_ID + "#" + last_scene;
            msg.post(n, "disable");
            msg.post(n, "final");
            msg.post(n, "unload");
            is_restarting_scene = true;
        }
        if (message_id == to_hash('SYS_LOAD_SCENE')) {
            const message = _message as Messages['SYS_LOAD_SCENE'];
            // ждем готовности модулей
            if (_wait_ready_manager && !Manager.is_ready()) {
                wait_load_scene = message.name;
                return;
            }
            wait_load_scene = '';
            last_loading_scene = message.name;
            try_load(message.name, () => {
                const receiver = Manager.MANAGER_ID + "#" + message.name;
                sender_to_name[message.name] = msg.url(receiver);
                msg.post(receiver, "load");
            });
        }
        if (message_id == hash('SYS_LOAD_RESOURCE')) {
            const message = _message as Messages['SYS_LOAD_RESOURCE'];

            try_load(message.name, () => {
                if (!resource_to_checker[message.name]())
                    return;
                const receiver = Manager.MANAGER_ID + "#" + message.name;
                sender_to_name[message.name] = msg.url(receiver);
                msg.post(receiver, "load");
            });
        }
        if (message_id == hash('SYS_ASYNC_LOAD_RESOURCE')) {
            const message = _message as Messages['SYS_ASYNC_LOAD_RESOURCE'];

            try_load(message.name, () => {
                Log.log(`RESOURCES FOR ${message.name} ASYNC LOADED`);
            });
        }
        if (message_id == hash('SYS_UNLOAD_RESOURCE')) {
            const message = _message as Messages['SYS_UNLOAD_RESOURCE'];
            msg.post(Manager.MANAGER_ID + "#" + message.name, "unload");
        }
        if (message_id == hash("proxy_unloaded")) {
            if (!is_resource(get_name_by_hash(sender)) && is_restarting_scene && last_scene != '') {
                last_loading_scene = last_scene;
                msg.post(Manager.MANAGER_ID + "#" + last_scene, "load");
            }
        }
        if (message_id == hash("proxy_loaded")) {
            const name = get_name_by_hash(sender);
            if (!is_resource(name)) on_loaded_scene(sender);
            else on_loaded_resource(sender);
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

        EventBus.send('ON_SCENE_LOADED', { name: last_loading_scene });

        last_scene = last_loading_scene;
        last_loading_scene = '';
    }

    function on_loaded_resource(sender: hash) {
        msg.post(sender, "init");
        msg.post(sender, "enable");
    }

    function get_current_name() {
        return last_scene;
    }

    init();

    return { _on_message, restart, load, load_resource, unload_resource, unload_all_resources, try_load_async, set_bg, get_current_name };
}