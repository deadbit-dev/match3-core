local ____lualib = require("lualib_bundle")
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local ____exports = {}
local flow = require("ludobits.m.flow")
local camera = require("utils.camera")
local ____math_utils = require("utils.math_utils")
local Direction = ____math_utils.Direction
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____match3_core = require("game.match3_core")
local NullElement = ____match3_core.NullElement
local NotActiveCell = ____match3_core.NotActiveCell
function ____exports.View()
    local process, on_down, on_move, on_up, set_cell_view, set_element_view, get_world_pos, get_field_pos, get_move_direction, get_view_index_by_game_id, on_combined_animation, on_swap_element_animation, on_damaged_element_animation, on_move_element_animation, request_element_animation, revert_step_animation, swap_element_easing, swap_element_time, move_elements_easing, move_elements_time, squash_element_easing, squash_element_time, spawn_element_easing, spawn_element_time, damaged_element_easing, damaged_element_delay, damaged_element_time, damaged_element_scale, min_swipe_distance, field_width, field_height, move_direction, cell_size, scale_ratio, cells_offset, gm, game_id_to_view_index, selected_element
    function process()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
            repeat
                local ____switch6 = message_id
                local cell, element, swap_elements, combined_data, move_element, damaged_element, request_element, revert_step_data
                local ____cond6 = ____switch6 == ID_MESSAGES.MSG_ON_DOWN_ITEM
                if ____cond6 then
                    on_down(_message.item)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == ID_MESSAGES.MSG_ON_UP_ITEM
                if ____cond6 then
                    on_up(_message.item)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == ID_MESSAGES.MSG_ON_MOVE
                if ____cond6 then
                    on_move(_message)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("ON_MAKE_CELL")
                if ____cond6 then
                    cell = _message
                    set_cell_view(cell.x, cell.y, cell.id, cell.variety)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("ON_MAKE_ELEMENT")
                if ____cond6 then
                    element = _message
                    set_element_view(element.x, element.y, element.id, element.type)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("ON_SWAP_ELEMENTS")
                if ____cond6 then
                    swap_elements = _message
                    on_swap_element_animation(swap_elements.element_from, swap_elements.element_to)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("ON_COMBINED")
                if ____cond6 then
                    combined_data = _message
                    on_combined_animation(combined_data.combined_element, combined_data.combination)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("ON_MOVE_ELEMENT")
                if ____cond6 then
                    move_element = _message
                    on_move_element_animation(
                        move_element.from_x,
                        move_element.from_y,
                        move_element.to_x,
                        move_element.to_y,
                        move_element.element
                    )
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("ON_DAMAGED_ELEMENT")
                if ____cond6 then
                    damaged_element = _message
                    on_damaged_element_animation(damaged_element.id)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("ON_REQUEST_ELEMENT")
                if ____cond6 then
                    request_element = _message
                    request_element_animation(request_element.x, request_element.y, request_element.id)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("ON_REVERT_STEP")
                if ____cond6 then
                    revert_step_data = _message
                    revert_step_animation(revert_step_data.current_state, revert_step_data.previous_state)
                    break
                end
            until true
        end
    end
    function on_down(item)
        selected_element = item
    end
    function on_move(pos)
        if selected_element == nil then
            return
        end
        local world_pos = camera.screen_to_world(pos.x, pos.y)
        local selected_element_world_pos = go.get_world_position(selected_element._hash)
        local delta = world_pos - selected_element_world_pos
        if math.abs(delta.x + delta.y) < min_swipe_distance then
            return
        end
        local selected_element_pos = get_field_pos(selected_element_world_pos)
        local element_to_pos = {x = selected_element_pos.x, y = selected_element_pos.y}
        local direction = vmath.normalize(delta)
        local move_direction = get_move_direction(direction)
        repeat
            local ____switch11 = move_direction
            local ____cond11 = ____switch11 == Direction.Up
            if ____cond11 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond11 = ____cond11 or ____switch11 == Direction.Down
            if ____cond11 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond11 = ____cond11 or ____switch11 == Direction.Left
            if ____cond11 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond11 = ____cond11 or ____switch11 == Direction.Right
            if ____cond11 then
                element_to_pos.x = element_to_pos.x + 1
                break
            end
        until true
        local is_valid_x = element_to_pos.x >= 0 and element_to_pos.x < field_width
        local is_valid_y = element_to_pos.y >= 0 and element_to_pos.y < field_height
        if not is_valid_x or not is_valid_y then
            return
        end
        Manager.send_raw_game(
            to_hash("SWAP_ELEMENTS"),
            {from_x = selected_element_pos.x, from_y = selected_element_pos.y, to_x = element_to_pos.x, to_y = element_to_pos.y}
        )
        selected_element = nil
    end
    function on_up(item)
        local item_world_pos = go.get_world_position(item._hash)
        local element_pos = get_field_pos(item_world_pos)
    end
    function set_cell_view(x, y, id, cell_id, z_index)
        if z_index == nil then
            z_index = -1
        end
        local pos = get_world_pos(x, y, z_index)
        local _go = gm.make_go("cell_view", pos)
        sprite.play_flipbook(
            msg.url(nil, _go, "sprite"),
            GAME_CONFIG.cell_database[cell_id].view
        )
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        game_id_to_view_index[id] = gm.add_game_item({_hash = _go, is_clickable = true})
    end
    function set_element_view(x, y, id, ____type, spawn_anim, z_index)
        if spawn_anim == nil then
            spawn_anim = false
        end
        if z_index == nil then
            z_index = 0
        end
        local pos = get_world_pos(x, y, z_index)
        local _go = gm.make_go("element_view", pos)
        sprite.play_flipbook(
            msg.url(nil, _go, "sprite"),
            GAME_CONFIG.element_database[____type].view
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
        game_id_to_view_index[id] = gm.add_game_item({_hash = _go, is_clickable = true})
    end
    function get_world_pos(x, y, z)
        if z == nil then
            z = 0
        end
        return vmath.vector3(cells_offset.x + cell_size * x + cell_size * 0.5, cells_offset.y - cell_size * y - cell_size * 0.5, z)
    end
    function get_field_pos(world_pos)
        return {x = (world_pos.x - cells_offset.x - cell_size * 0.5) / cell_size, y = (cells_offset.y - world_pos.y - cell_size * 0.5) / cell_size}
    end
    function get_move_direction(dir)
        local cs45 = 0.7
        if dir.y > cs45 then
            return Direction.Up
        elseif dir.y < -cs45 then
            return Direction.Down
        elseif dir.x < -cs45 then
            return Direction.Left
        elseif dir.x > cs45 then
            return Direction.Right
        else
            return Direction.None
        end
    end
    function get_view_index_by_game_id(id)
        return game_id_to_view_index[id]
    end
    function on_combined_animation(combination_element, combination)
        local target_element_world_pos = get_world_pos(combination_element.x, combination_element.y)
        do
            local i = 0
            while i < #combination.elements do
                local element = combination.elements[i + 1]
                local item = gm.get_item_by_index(element.id)
                if item ~= nil then
                    local is_last = i == #combination.elements - 1
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
                    end
                end
                i = i + 1
            end
        end
    end
    function on_swap_element_animation(element_from, element_to)
        local from_world_pos = get_world_pos(element_from.x, element_from.y)
        local to_world_pos = get_world_pos(element_to.x, element_to.y)
        local item_from = gm.get_item_by_index(element_from.id)
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
        local item_to = gm.get_item_by_index(element_to.id)
        if item_to == nil then
            return
        end
        go.animate(
            item_to._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            from_world_pos,
            swap_element_easing,
            swap_element_time
        )
    end
    function on_damaged_element_animation(element_id)
        local element_view_index = get_view_index_by_game_id(element_id)
        local element_item = gm.get_item_by_index(element_view_index)
        if element_item ~= nil then
            go.animate(
                element_item._hash,
                "scale",
                go.PLAYBACK_ONCE_FORWARD,
                damaged_element_scale,
                damaged_element_easing,
                damaged_element_time,
                damaged_element_delay,
                function()
                    gm.delete_item(element_item, true)
                end
            )
        end
    end
    function on_move_element_animation(from_x, from_y, to_x, to_y, element)
        local to_world_pos = get_world_pos(to_x, to_y, 0)
        local item_from = gm.get_item_by_index(element.id)
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
    function request_element_animation(x, y, id)
        local element_view_index = get_view_index_by_game_id(id)
        local item_from = gm.get_item_by_index(element_view_index)
        if item_from == nil then
            return
        end
        local world_pos = get_world_pos(x, y)
        repeat
            local ____switch45 = move_direction
            local ____cond45 = ____switch45 == Direction.Up
            if ____cond45 then
                gm.set_position_xy(item_from, world_pos.x, world_pos.y + field_height * cell_size)
                break
            end
            ____cond45 = ____cond45 or ____switch45 == Direction.Down
            if ____cond45 then
                gm.set_position_xy(item_from, world_pos.x, world_pos.y - field_height * cell_size)
                break
            end
            ____cond45 = ____cond45 or ____switch45 == Direction.Left
            if ____cond45 then
                gm.set_position_xy(item_from, world_pos.x - field_width * cell_size, world_pos.y)
                break
            end
            ____cond45 = ____cond45 or ____switch45 == Direction.Right
            if ____cond45 then
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
    function revert_step_animation(current_state, previous_state)
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local current_cell = current_state.cells[y + 1][x + 1]
                        if current_cell ~= NotActiveCell then
                            local current_cell_view_index = get_view_index_by_game_id(current_cell.id)
                            local current_cell_item = gm.get_item_by_index(current_cell_view_index)
                            if current_cell_item ~= nil then
                                gm.delete_item(current_cell_item)
                                local previous_cell = previous_state.cells[y + 1][x + 1]
                                if previous_cell ~= NotActiveCell then
                                    local ____set_cell_view_5 = set_cell_view
                                    local ____array_4 = __TS__SparseArrayNew(x, y, previous_cell.id)
                                    local ____opt_0 = previous_cell and previous_cell.data
                                    if ____opt_0 ~= nil then
                                        ____opt_0 = ____opt_0.variety
                                    end
                                    __TS__SparseArrayPush(____array_4, ____opt_0)
                                    ____set_cell_view_5(__TS__SparseArraySpread(____array_4))
                                end
                            end
                        end
                        local current_element = current_state.elements[y + 1][x + 1]
                        if current_element ~= NullElement then
                            local current_element_view_index = get_view_index_by_game_id(current_element.id)
                            local current_element_view_item = gm.get_item_by_index(current_element_view_index)
                            if current_element_view_item ~= nil then
                                local pos = {x = x, y = y}
                                go.animate(
                                    current_element_view_item._hash,
                                    "scale",
                                    go.PLAYBACK_ONCE_FORWARD,
                                    vmath.vector3(0.1, 0.1, 1),
                                    damaged_element_easing,
                                    damaged_element_time,
                                    damaged_element_delay,
                                    function()
                                        gm.delete_item(current_element_view_item)
                                        local previous_element = previous_state.elements[pos.y + 1][pos.x + 1]
                                        if previous_element ~= NullElement then
                                            set_element_view(
                                                pos.x,
                                                pos.y,
                                                previous_element.id,
                                                previous_element.type,
                                                true
                                            )
                                        end
                                    end
                                )
                            end
                        else
                            local previous_element = previous_state.elements[y + 1][x + 1]
                            if previous_element ~= NullElement then
                                set_element_view(
                                    x,
                                    y,
                                    previous_element.id,
                                    previous_element.type,
                                    true
                                )
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    local game_width = 540
    local game_height = 960
    swap_element_easing = GAME_CONFIG.swap_element_easing
    swap_element_time = GAME_CONFIG.swap_element_time
    move_elements_easing = GAME_CONFIG.move_elements_easing
    move_elements_time = GAME_CONFIG.move_elements_time
    squash_element_easing = GAME_CONFIG.squash_element_easing
    squash_element_time = GAME_CONFIG.squash_element_time
    spawn_element_easing = GAME_CONFIG.spawn_element_easing
    spawn_element_time = GAME_CONFIG.spawn_element_time
    damaged_element_easing = GAME_CONFIG.damaged_element_easing
    damaged_element_delay = GAME_CONFIG.damaged_element_delay
    damaged_element_time = GAME_CONFIG.damaged_element_time
    damaged_element_scale = GAME_CONFIG.damaged_element_scale
    min_swipe_distance = GAME_CONFIG.min_swipe_distance
    local move_delay_after_combination = GAME_CONFIG.move_delay_after_combination
    local wait_time_after_move = GAME_CONFIG.wait_time_after_move
    local buster_delay = GAME_CONFIG.buster_delay
    local level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    local offset_border = level_config.field.offset_border
    local origin_cell_size = level_config.field.cell_size
    move_direction = level_config.field.move_direction
    cell_size = math.min((game_width - offset_border * 2) / field_width, 100)
    scale_ratio = cell_size / origin_cell_size
    cells_offset = vmath.vector3(game_width / 2 - field_width / 2 * cell_size, -(game_height / 2 - field_height / 2 * cell_size), 0)
    gm = GoManager()
    game_id_to_view_index = {}
    selected_element = nil
    local function init()
        process()
    end
    local function attack_animation(element, target_x, target_y, on_complite)
        local target_world_pos = get_world_pos(target_x, target_y)
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
    return init()
end
return ____exports
