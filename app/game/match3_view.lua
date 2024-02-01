local ____exports = {}
local flow = require("ludobits.m.flow")
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____match3_core = require("game.match3_core")
local NullElement = ____match3_core.NullElement
local ____math_utils = require("utils.math_utils")
local Direction = ____math_utils.Direction
function ____exports.View()
    local delete_item, gm
    function delete_item(item, remove_from_scene, recursive)
        if remove_from_scene == nil then
            remove_from_scene = true
        end
        if recursive == nil then
            recursive = false
        end
        return gm.delete_item(item, remove_from_scene, recursive)
    end
    local game_width = 540
    local game_height = 960
    local swap_element_easing = GAME_CONFIG.swap_element_easing
    local swap_element_time = GAME_CONFIG.swap_element_time
    local move_elements_easing = GAME_CONFIG.move_elements_easing
    local move_elements_time = GAME_CONFIG.move_elements_time
    local squash_element_easing = GAME_CONFIG.squash_element_easing
    local squash_element_time = GAME_CONFIG.squash_element_time
    local spawn_element_easing = GAME_CONFIG.spawn_element_easing
    local spawn_element_time = GAME_CONFIG.spawn_element_time
    local damaged_element_easing = GAME_CONFIG.damaged_element_easing
    local damaged_element_delay = GAME_CONFIG.damaged_element_delay
    local damaged_element_time = GAME_CONFIG.damaged_element_time
    local damaged_element_scale = GAME_CONFIG.damaged_element_scale
    local level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    local field_width = level_config.field.width
    local field_height = level_config.field.height
    local offset_border = level_config.field.offset_border
    local origin_cell_size = level_config.field.cell_size
    local move_direction = level_config.field.move_direction
    gm = GoManager()
    local cell_size
    local scale_ratio
    local cells_offset
    local function init()
        cell_size = math.min((game_width - offset_border * 2) / field_width, 100)
        scale_ratio = cell_size / origin_cell_size
        cells_offset = vmath.vector3(game_width / 2 - field_width / 2 * cell_size, -(game_height / 2 - field_height / 2 * cell_size), 0)
    end
    local function get_cell_world_pos(x, y, z)
        if z == nil then
            z = 0
        end
        return vmath.vector3(cells_offset.x + cell_size * x + cell_size * 0.5, cells_offset.y - cell_size * y - cell_size * 0.5, z)
    end
    local function get_element_pos(world_pos)
        return {x = (world_pos.x - cells_offset.x - cell_size * 0.5) / cell_size, y = (cells_offset.y - world_pos.y - cell_size * 0.5) / cell_size}
    end
    local function get_item_by_index(index)
        return gm.get_item_by_index(index)
    end
    local function damaged_element_animation(element_id, on_complite)
        local item = get_item_by_index(element_id)
        if item ~= nil then
            go.animate(
                item._hash,
                "scale",
                go.PLAYBACK_ONCE_FORWARD,
                damaged_element_scale,
                damaged_element_easing,
                damaged_element_time,
                damaged_element_delay,
                function()
                    delete_item(item, true)
                    if on_complite ~= nil then
                        on_complite()
                    end
                end
            )
        end
    end
    local function do_message(message_id, message, sender)
        gm.do_message(message_id, message, sender)
    end
    local function set_cell_view(x, y, cell_id, z_index)
        if z_index == nil then
            z_index = -1
        end
        local pos = get_cell_world_pos(x, y, z_index)
        local _go = gm.make_go("cell_view", pos)
        sprite.play_flipbook(
            msg.url(nil, _go, "sprite"),
            GAME_CONFIG.cell_database[cell_id].view
        )
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        return gm.add_game_item({_hash = _go})
    end
    local function set_element_view(x, y, element_id, spawn_anim, z_index)
        if spawn_anim == nil then
            spawn_anim = false
        end
        if z_index == nil then
            z_index = 0
        end
        local pos = get_cell_world_pos(x, y, z_index)
        local _go = gm.make_go("element_view", pos)
        sprite.play_flipbook(
            msg.url(nil, _go, "sprite"),
            GAME_CONFIG.element_database[element_id].view
        )
        if spawn_anim then
            go.set_scale(
                vmath.vector3(0.01, 0.01, 1),
                _go
            )
            go.animate(
                _go,
                "scale",
                go.PLAYBACK_ONCE_FORWARD,
                vmath.vector3(scale_ratio, scale_ratio, 1),
                spawn_element_easing,
                spawn_element_time
            )
        else
            go.set_scale(
                vmath.vector3(scale_ratio, scale_ratio, 1),
                _go
            )
        end
        return gm.add_game_item({_hash = _go, is_clickable = true})
    end
    local function squash_animation(target_element, elements, on_complite)
        local target_element_world_pos = get_cell_world_pos(target_element.x, target_element.y)
        do
            local i = 0
            while i < #elements do
                local element = elements[i + 1]
                local item = gm.get_item_by_index(element.id)
                if item ~= nil then
                    local is_last = i == #elements - 1
                    if not is_last then
                        go.animate(
                            item._hash,
                            "position",
                            go.PLAYBACK_ONCE_FORWARD,
                            target_element_world_pos,
                            squash_element_easing,
                            squash_element_time,
                            0
                        )
                    else
                        flow.go_animate(
                            item._hash,
                            "position",
                            go.PLAYBACK_ONCE_FORWARD,
                            target_element_world_pos,
                            squash_element_easing,
                            squash_element_time,
                            0
                        )
                        on_complite()
                    end
                end
                i = i + 1
            end
        end
    end
    local function attack_animation(element, target_x, target_y, on_complite)
        local target_world_pos = get_cell_world_pos(target_x, target_y)
        local item = gm.get_item_by_index(element.id)
        if item == nil then
            return
        end
        flow.go_animate(
            item._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            target_world_pos,
            go.EASING_INCUBIC,
            1,
            0.1
        )
        if on_complite ~= nil then
            on_complite()
        end
    end
    local function swap_element_animation(element_from, element_to, from_world_pos, to_world_pos)
        local item_from = get_item_by_index(element_from.id)
        if item_from == nil then
            return
        end
        go.animate(
            item_from._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            to_world_pos,
            swap_element_easing,
            swap_element_time
        )
        local item_to = get_item_by_index(element_to.id)
        if item_to == nil then
            return
        end
        flow.go_animate(
            item_to._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            from_world_pos,
            swap_element_easing,
            swap_element_time
        )
    end
    local function on_move_element_animation(from_x, from_y, to_x, to_y, element)
        local to_world_pos = get_cell_world_pos(to_x, to_y, 0)
        local item_from = get_item_by_index(element.id)
        if item_from == nil then
            return
        end
        go.animate(
            item_from._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            to_world_pos,
            move_elements_easing,
            move_elements_time
        )
    end
    local function request_element_animation(element, x, y, z)
        local item_from = gm.get_item_by_index(element.id)
        if item_from == nil then
            return
        end
        local world_pos = get_cell_world_pos(x, y, z)
        repeat
            local ____switch32 = move_direction
            local ____cond32 = ____switch32 == Direction.Up
            if ____cond32 then
                gm.set_position_xy(item_from, world_pos.x, world_pos.y + field_height * cell_size)
                break
            end
            ____cond32 = ____cond32 or ____switch32 == Direction.Down
            if ____cond32 then
                gm.set_position_xy(item_from, world_pos.x, world_pos.y - field_height * cell_size)
                break
            end
            ____cond32 = ____cond32 or ____switch32 == Direction.Left
            if ____cond32 then
                gm.set_position_xy(item_from, world_pos.x - field_width * cell_size, world_pos.y)
                break
            end
            ____cond32 = ____cond32 or ____switch32 == Direction.Right
            if ____cond32 then
                gm.set_position_xy(item_from, world_pos.x + field_width * cell_size, world_pos.y)
                break
            end
        until true
        go.animate(
            item_from._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            world_pos,
            move_elements_easing,
            move_elements_time
        )
    end
    local function revert_step_animation(current_state, previous_state)
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local current_element = current_state.elements[y + 1][x + 1]
                        if current_element ~= NullElement then
                            local current_item = get_item_by_index(current_element.id)
                            if current_item ~= nil then
                                local pos = {x = x, y = y}
                                go.animate(
                                    current_item._hash,
                                    "scale",
                                    go.PLAYBACK_ONCE_FORWARD,
                                    vmath.vector3(0.1, 0.1, 1),
                                    damaged_element_easing,
                                    damaged_element_time,
                                    damaged_element_delay,
                                    function()
                                        gm.delete_item(current_item)
                                        local previous_element = previous_state.elements[pos.y + 1][pos.x + 1]
                                        if previous_element ~= NullElement then
                                            previous_element.id = set_element_view(pos.x, pos.y, previous_element.type, true)
                                            previous_state.elements[pos.y + 1][pos.x + 1] = previous_element
                                        end
                                    end
                                )
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return previous_state
    end
    return {
        init = init,
        set_cell_view = set_cell_view,
        set_element_view = set_element_view,
        get_cell_world_pos = get_cell_world_pos,
        get_element_pos = get_element_pos,
        squash_animation = squash_animation,
        attack_animation = attack_animation,
        swap_element_animation = swap_element_animation,
        request_element_animation = request_element_animation,
        damaged_element_animation = damaged_element_animation,
        revert_step_animation = revert_step_animation,
        on_move_element_animation = on_move_element_animation,
        get_item_by_index = get_item_by_index,
        delete_item = delete_item,
        do_message = do_message
    }
end
return ____exports
