local ____lualib = require("lualib_bundle")
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local __TS__Delete = ____lualib.__TS__Delete
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
    local on_game_step, set_events, input_listener, on_down, on_move, on_up, on_set_field, make_cell_view, make_element_view, on_swap_element_animation, on_wrong_swap_element_animation, on_combined_animation, on_damaged_element_animation, on_move_element_animation, request_element_animation, revert_step_animation, get_world_pos, get_field_pos, get_move_direction, get_view_item_by_game_id, delete_view_item_by_game_id, swap_element_easing, swap_element_time, move_elements_easing, move_elements_time, squash_element_easing, squash_element_time, spawn_element_easing, spawn_element_time, damaged_element_easing, damaged_element_delay, damaged_element_time, damaged_element_scale, min_swipe_distance, field_width, field_height, cell_size, scale_ratio, cells_offset, gm, game_id_to_view_index, selected_element, is_processing
    function on_game_step(events)
        is_processing = true
        for ____, event in ipairs(events) do
            if event.key == "ON_SWAP_ELEMENTS" then
                local message = event.value
                on_swap_element_animation(message.element_from, message.element_to)
                flow.delay(0.3)
            elseif event.key == "ON_COMBINED" then
                flow.delay(0.3)
            elseif event.key == "ON_COMBO" then
                local message = event.value
                on_combined_animation(message.combined_element, message.combination)
                flow.delay(0.5)
            elseif event.key == "BUSTER_ACTIVATED" then
                flow.delay(1)
            elseif event.key == "ON_DAMAGED_ELEMENT" then
                local message = event.value
                on_damaged_element_animation(message.id)
            elseif event.key == "ON_CELL_ACTIVATED" then
                local message = event.value
                delete_view_item_by_game_id(message.previous_id)
                make_cell_view(message.x, message.y, message.id, message.variety)
            elseif event.key == "ON_MAKE_ELEMENT" then
                local message = event.value
                make_element_view(
                    message.x,
                    message.y,
                    message.id,
                    message.type,
                    true
                )
            elseif event.key == "ON_MOVE_ELEMENT" then
                local message = event.value
                on_move_element_animation(
                    message.from_x,
                    message.from_y,
                    message.to_x,
                    message.to_y,
                    message.element
                )
            elseif event.key == "ON_REQUEST_ELEMENT" then
                local message = event.value
                make_element_view(message.x, message.y, message.id, message.type)
                request_element_animation(message.x, message.y, message.id)
            elseif event.key == "END_MOVE_PHASE" then
                flow.delay(1)
            end
        end
        is_processing = false
    end
    function set_events()
        EventBus.on(
            "ON_SET_FIELD",
            function(state)
                if state == nil then
                    return
                end
                on_set_field(state)
            end
        )
        EventBus.on(
            "ON_WRONG_SWAP_ELEMENTS",
            function(elements)
                if elements == nil then
                    return
                end
                flow.start(function() return on_wrong_swap_element_animation(elements.element_from, elements.element_to) end)
            end
        )
        EventBus.on(
            "GAME_STEP",
            function(events)
                if events == nil then
                    return
                end
                flow.start(function() return on_game_step(events) end)
            end
        )
        EventBus.on(
            "TRY_REVERT_STEP",
            function()
                if is_processing then
                    return
                end
                EventBus.send("REVERT_STEP")
            end
        )
        EventBus.on(
            "ON_REVERT_STEP",
            function(states)
                if states == nil then
                    return
                end
                flow.start(function() return revert_step_animation(states.current_state, states.previous_state) end)
            end
        )
    end
    function input_listener()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
            repeat
                local ____switch33 = message_id
                local ____cond33 = ____switch33 == ID_MESSAGES.MSG_ON_DOWN_ITEM
                if ____cond33 then
                    on_down(_message.item)
                    break
                end
                ____cond33 = ____cond33 or ____switch33 == ID_MESSAGES.MSG_ON_UP_ITEM
                if ____cond33 then
                    on_up(_message.item)
                    break
                end
                ____cond33 = ____cond33 or ____switch33 == ID_MESSAGES.MSG_ON_MOVE
                if ____cond33 then
                    on_move(_message)
                    break
                end
            until true
        end
    end
    function on_down(item)
        if is_processing then
            return
        end
        selected_element = item
    end
    function on_move(pos)
        if selected_element == nil then
            return
        end
        local world_pos = camera.screen_to_world(pos.x, pos.y)
        local selected_element_world_pos = go.get_world_position(selected_element._hash)
        local delta = world_pos - selected_element_world_pos
        if vmath.length(delta) < min_swipe_distance then
            return
        end
        local selected_element_pos = get_field_pos(selected_element_world_pos)
        local element_to_pos = {x = selected_element_pos.x, y = selected_element_pos.y}
        local direction = vmath.normalize(delta)
        local move_direction = get_move_direction(direction)
        repeat
            local ____switch39 = move_direction
            local ____cond39 = ____switch39 == Direction.Up
            if ____cond39 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond39 = ____cond39 or ____switch39 == Direction.Down
            if ____cond39 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond39 = ____cond39 or ____switch39 == Direction.Left
            if ____cond39 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond39 = ____cond39 or ____switch39 == Direction.Right
            if ____cond39 then
                element_to_pos.x = element_to_pos.x + 1
                break
            end
        until true
        local is_valid_x = element_to_pos.x >= 0 and element_to_pos.x < field_width
        local is_valid_y = element_to_pos.y >= 0 and element_to_pos.y < field_height
        if not is_valid_x or not is_valid_y then
            return
        end
        EventBus.send("SWAP_ELEMENTS", {from_x = selected_element_pos.x, from_y = selected_element_pos.y, to_x = element_to_pos.x, to_y = element_to_pos.y})
        selected_element = nil
    end
    function on_up(item)
        if selected_element == nil then
            return
        end
        local item_world_pos = go.get_world_position(item._hash)
        local element_pos = get_field_pos(item_world_pos)
        EventBus.send("CLICK_ACTIVATION", {x = element_pos.x, y = element_pos.y})
    end
    function on_set_field(state)
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            local ____make_cell_view_5 = make_cell_view
                            local ____array_4 = __TS__SparseArrayNew(x, y, cell.id)
                            local ____opt_0 = cell and cell.data
                            if ____opt_0 ~= nil then
                                ____opt_0 = ____opt_0.variety
                            end
                            __TS__SparseArrayPush(____array_4, ____opt_0)
                            ____make_cell_view_5(__TS__SparseArraySpread(____array_4))
                        end
                        local element = state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            make_element_view(
                                x,
                                y,
                                element.id,
                                element.type,
                                true
                            )
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function make_cell_view(x, y, id, cell_id, z_index)
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
    function make_element_view(x, y, id, ____type, spawn_anim, z_index)
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
    function on_swap_element_animation(element_from, element_to)
        local from_world_pos = get_world_pos(element_from.x, element_from.y)
        local to_world_pos = get_world_pos(element_to.x, element_to.y)
        local item_from = get_view_item_by_game_id(element_from.id)
        if item_from == nil then
            return
        end
        local item_to = get_view_item_by_game_id(element_to.id)
        if item_to == nil then
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
        go.animate(
            item_to._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            from_world_pos,
            swap_element_easing,
            swap_element_time
        )
    end
    function on_wrong_swap_element_animation(element_from, element_to)
        local from_world_pos = get_world_pos(element_from.x, element_from.y)
        local to_world_pos = get_world_pos(element_to.x, element_to.y)
        local item_from = get_view_item_by_game_id(element_from.id)
        if item_from == nil then
            return
        end
        local item_to = get_view_item_by_game_id(element_to.id)
        if item_to == nil then
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
        go.animate(
            item_to._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            from_world_pos,
            swap_element_easing,
            swap_element_time
        )
        flow.delay(swap_element_time)
        go.animate(
            item_to._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            to_world_pos,
            swap_element_easing,
            swap_element_time
        )
        go.animate(
            item_from._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            from_world_pos,
            swap_element_easing,
            swap_element_time
        )
    end
    function on_combined_animation(combination_element, combination)
        local target_element_world_pos = get_world_pos(combination_element.x, combination_element.y)
        do
            local i = 0
            while i < #combination.elements do
                local element = combination.elements[i + 1]
                local item = gm.get_item_by_index(element.id)
                if item ~= nil then
                    go.animate(
                        item._hash,
                        "position",
                        go.PLAYBACK_ONCE_FORWARD,
                        target_element_world_pos,
                        squash_element_easing,
                        squash_element_time,
                        0
                    )
                end
                i = i + 1
            end
        end
    end
    function on_damaged_element_animation(element_id)
        local element_view_item = get_view_item_by_game_id(element_id)
        if element_view_item ~= nil then
            go.animate(
                element_view_item._hash,
                "scale",
                go.PLAYBACK_ONCE_FORWARD,
                damaged_element_scale,
                damaged_element_easing,
                damaged_element_time,
                damaged_element_delay,
                function()
                    delete_view_item_by_game_id(element_id)
                end
            )
        end
    end
    function on_move_element_animation(from_x, from_y, to_x, to_y, element)
        local to_world_pos = get_world_pos(to_x, to_y, 0)
        local item_from = get_view_item_by_game_id(element.id)
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
        local item_from = get_view_item_by_game_id(id)
        if item_from == nil then
            return
        end
        local world_pos = get_world_pos(x, y)
        gm.set_position_xy(item_from, world_pos.x, world_pos.y + field_height * cell_size)
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
                            delete_view_item_by_game_id(current_cell.id)
                            local previous_cell = previous_state.cells[y + 1][x + 1]
                            if previous_cell ~= NotActiveCell then
                                local ____make_cell_view_11 = make_cell_view
                                local ____array_10 = __TS__SparseArrayNew(x, y, previous_cell.id)
                                local ____opt_6 = previous_cell and previous_cell.data
                                if ____opt_6 ~= nil then
                                    ____opt_6 = ____opt_6.variety
                                end
                                __TS__SparseArrayPush(____array_10, ____opt_6)
                                ____make_cell_view_11(__TS__SparseArraySpread(____array_10))
                            end
                        end
                        local current_element = current_state.elements[y + 1][x + 1]
                        if current_element ~= NullElement then
                            delete_view_item_by_game_id(current_element.id)
                        end
                        local previous_element = previous_state.elements[y + 1][x + 1]
                        if previous_element ~= NullElement then
                            make_element_view(
                                x,
                                y,
                                previous_element.id,
                                previous_element.type,
                                true
                            )
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
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
    function get_view_item_by_game_id(id)
        local view_index = game_id_to_view_index[id]
        return gm.get_item_by_index(view_index)
    end
    function delete_view_item_by_game_id(id)
        gm.delete_item(
            get_view_item_by_game_id(id),
            true
        )
        __TS__Delete(game_id_to_view_index, id)
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
    local move_direction = level_config.field.move_direction
    cell_size = math.min((game_width - offset_border * 2) / field_width, 100)
    scale_ratio = cell_size / origin_cell_size
    cells_offset = vmath.vector3(game_width / 2 - field_width / 2 * cell_size, -(game_height / 2 - field_height / 2 * cell_size), 0)
    gm = GoManager()
    game_id_to_view_index = {}
    selected_element = nil
    is_processing = false
    local function init()
        set_events()
        EventBus.send("LOAD_FIELD")
        input_listener()
    end
    local function remove_random_element_animation(element, target_x, target_y, on_complite)
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
