local ____lualib = require("lualib_bundle")
local __TS__ObjectKeys = ____lualib.__TS__ObjectKeys
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__Iterator = ____lualib.__TS__Iterator
local ____exports = {}
local SceneModule
local reszip = require("liveupdate_reszip.reszip")
local ____utils = require("utils.utils")
local hex2rgba = ____utils.hex2rgba
local ____game_config = require("main.game_config")
local MAIN_BUNDLE_SCENES = ____game_config.MAIN_BUNDLE_SCENES
local RESOURCE_VERSION = ____game_config.RESOURCE_VERSION
function SceneModule()
    local on_loaded_scene, on_loaded_resource, last_loading_scene, last_scene, is_restarting_scene
    function on_loaded_scene(sender)
        if last_scene ~= "" and not is_restarting_scene then
            local scene = (Manager.MANAGER_ID .. "#") .. last_scene
            msg.post(scene, "disable")
            msg.post(scene, "final")
            msg.post(scene, "unload")
            last_scene = ""
        end
        is_restarting_scene = false
        msg.post(sender, "init")
        msg.post(sender, "enable")
        EventBus.send("ON_SCENE_LOADED", {name = last_loading_scene})
        last_scene = last_loading_scene
        last_loading_scene = ""
    end
    function on_loaded_resource(sender)
        msg.post(sender, "init")
        msg.post(sender, "enable")
    end
    local wait_load_scene = ""
    last_loading_scene = ""
    last_scene = ""
    is_restarting_scene = false
    local _wait_ready_manager = false
    local scene_resources = {main = {}}
    local sender_to_name = {}
    local resource_to_checker = {}
    local function init()
        if System.platform == "HTML5" then
            html5.run("window.set_light = function(val){document.body.style.backgroundColor = val}")
        end
    end
    local function set_bg(color)
        msg.post(
            "@render:",
            "clear_color",
            {color = hex2rgba(color, 0)}
        )
        if System.platform == "HTML5" then
            html5.run(("set_light('" .. color) .. "')")
        end
    end
    local function is_resource(name)
        return not __TS__ArrayIncludes(
            __TS__ObjectKeys(scene_resources),
            name
        )
    end
    local function get_name_by_hash(h)
        local name = ""
        for ____, ____value in ipairs(__TS__ObjectEntries(sender_to_name)) do
            local key = ____value[1]
            local value = ____value[2]
            if value == h then
                name = key
            end
        end
        return name
    end
    local function load(name, wait_ready_manager)
        if wait_ready_manager == nil then
            wait_ready_manager = false
        end
        _wait_ready_manager = wait_ready_manager
        if scene_resources[name] == nil then
            scene_resources[name] = {}
        end
        Manager.send("SYS_LOAD_SCENE", {name = name})
    end
    local function load_resource(scene, resource, checker)
        if checker == nil then
            checker = function()
                return true
            end
        end
        if __TS__ArrayIndexOf(scene_resources[scene], resource) ~= -1 then
            return
        end
        local ____scene_resources_scene_0 = scene_resources[scene]
        ____scene_resources_scene_0[#____scene_resources_scene_0 + 1] = resource
        resource_to_checker[resource] = checker
        Manager.send("SYS_LOAD_RESOURCE", {name = resource})
    end
    local function unload_resource(scene, resource)
        if __TS__ArrayIndexOf(scene_resources[scene], resource) == -1 then
            return
        end
        __TS__ArraySplice(
            scene_resources[scene],
            __TS__ArrayIndexOf(scene_resources[scene], resource),
            1
        )
        Manager.send("SYS_UNLOAD_RESOURCE", {name = resource})
    end
    local function unload_all_resources(scene, except)
        local resources = json.decode(json.encode(scene_resources[scene]))
        if resources == nil then
            return
        end
        for ____, resource in __TS__Iterator(resources) do
            local ____opt_1 = except
            if not (____opt_1 and __TS__ArrayIncludes(except, resource)) then
                unload_resource(scene, resource)
            end
        end
    end
    local function restart()
        Manager.send("SYS_RESTART_SCENE")
    end
    local function try_load_async(name)
        Manager.send("SYS_ASYNC_LOAD_RESOURCE", {name = name})
    end
    local function try_load(name, on_loaded)
        if not liveupdate or System.platform ~= "HTML5" or __TS__ArrayIncludes(MAIN_BUNDLE_SCENES, name) then
            return on_loaded()
        end
        Log.log("Найдены рессурсы: ")
        for ____, mount in ipairs(liveupdate.get_mounts()) do
            Log.log((("\tРессурс: " .. mount.uri) .. " в маунте: ") .. mount.name)
        end
        local missing_resources = collectionproxy.missing_resources((Manager.MANAGER_ID .. "#") .. name)
        local is_missing = false
        for ____, ____value in ipairs(__TS__ObjectEntries(missing_resources)) do
            local key = ____value[1]
            local value = ____value[2]
            if value ~= nil then
                Log.warn((("Ненайден ресурс: " .. tostring(key)) .. " ") .. tostring(value))
                is_missing = true
                break
            end
        end
        local versioned_file_name = ((name .. "_v") .. tostring(RESOURCE_VERSION)) .. ".zip"
        local resource_file = name .. ".zip"
        local miss_match_version = not reszip.version_match(versioned_file_name, name)
        if miss_match_version then
            Log.warn("Несовпадает версия ресурс файла!")
        end
        if miss_match_version or is_missing then
            Log.log("Загрузка ресурсов для сцены: " .. name)
            reszip.load_and_mount_zip(
                (("v" .. tostring(RESOURCE_VERSION)) .. "/") .. resource_file,
                {
                    filename = versioned_file_name,
                    mount_name = name,
                    delete_old_file = true,
                    on_finish = function(____self, err)
                        if not err then
                            Log.log("Загружены ресурсы для сцены: " .. name)
                            on_loaded()
                        else
                            Log.warn("Неудалось загрузить сцену: " .. name)
                        end
                    end
                }
            )
        else
            on_loaded()
        end
    end
    local function _on_message(_this, message_id, _message, sender)
        if message_id == to_hash("MANAGER_READY") then
            if wait_load_scene == "" then
                return
            end
            Manager.send("SYS_LOAD_SCENE", {name = wait_load_scene})
        end
        if message_id == to_hash("SYS_RESTART_SCENE") then
            if last_scene == "" then
                return Log.warn("Сцена для перезагрузки не найдена")
            end
            local n = (Manager.MANAGER_ID .. "#") .. last_scene
            msg.post(n, "disable")
            msg.post(n, "final")
            msg.post(n, "unload")
            is_restarting_scene = true
        end
        if message_id == to_hash("SYS_LOAD_SCENE") then
            local message = _message
            if _wait_ready_manager and not Manager.is_ready() then
                wait_load_scene = message.name
                return
            end
            wait_load_scene = ""
            last_loading_scene = message.name
            try_load(
                message.name,
                function()
                    local receiver = (Manager.MANAGER_ID .. "#") .. message.name
                    sender_to_name[message.name] = msg.url(receiver)
                    msg.post(receiver, "load")
                end
            )
        end
        if message_id == hash("SYS_LOAD_RESOURCE") then
            local message = _message
            try_load(
                message.name,
                function()
                    if not resource_to_checker[message.name]() then
                        return
                    end
                    local receiver = (Manager.MANAGER_ID .. "#") .. message.name
                    sender_to_name[message.name] = msg.url(receiver)
                    msg.post(receiver, "load")
                end
            )
        end
        if message_id == hash("SYS_ASYNC_LOAD_RESOURCE") then
            local message = _message
            try_load(
                message.name,
                function()
                    Log.log(("RESOURCES FOR " .. message.name) .. " ASYNC LOADED")
                end
            )
        end
        if message_id == hash("SYS_UNLOAD_RESOURCE") then
            local message = _message
            msg.post((Manager.MANAGER_ID .. "#") .. message.name, "unload")
        end
        if message_id == hash("proxy_unloaded") then
            if not is_resource(get_name_by_hash(sender)) and is_restarting_scene and last_scene ~= "" then
                last_loading_scene = last_scene
                msg.post((Manager.MANAGER_ID .. "#") .. last_scene, "load")
            end
        end
        if message_id == hash("proxy_loaded") then
            local name = get_name_by_hash(sender)
            if not is_resource(name) then
                on_loaded_scene(sender)
            else
                on_loaded_resource(sender)
            end
        end
    end
    local function get_current_name()
        return last_scene
    end
    init()
    return {
        _on_message = _on_message,
        restart = restart,
        load = load,
        load_resource = load_resource,
        unload_resource = unload_resource,
        unload_all_resources = unload_all_resources,
        try_load_async = try_load_async,
        set_bg = set_bg,
        get_current_name = get_current_name
    }
end
function ____exports.register_scene()
    _G.Scene = SceneModule()
end
return ____exports
