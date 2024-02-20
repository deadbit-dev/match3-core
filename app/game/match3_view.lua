local ____lualib = require("lualib_bundle")
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local __TS__Delete = ____lualib.__TS__Delete
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local ____exports = {}
local flow = require("ludobits.m.flow")
local camera = require("utils.camera")
local ____math_utils = require("utils.math_utils")
local Direction = ____math_utils.Direction
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____game_config = require("main.game_config")
local ElementId = ____game_config.ElementId
local ____match3_core = require("game.match3_core")
local NullElement = ____match3_core.NullElement
local NotActiveCell = ____match3_core.NotActiveCell
function ____exports.View()
    local set_events, on_game_step, input_listener, on_down, on_move, on_up, on_set_field, make_cell_view, make_element_view, on_swap_element_animation, on_wrong_swap_element_animation, on_combined_animation, on_combo_animation, on_diskisphere_activated_animation, on_swaped_buster_with_diskosphere_animation, on_swaped_diskospheres_animation, on_swaped_diskosphere_with_buster_animation, on_axis_rocket_activated_animation, on_rocket_activated_animation, on_swaped_rockets_animation, on_helicopter_activated_animation, on_swaped_helicopters_animation, on_dynamite_activated_animation, on_swaped_dynamites_animation, on_swaped_diskosphere_with_element_animation, on_activated_element_animation, on_cell_activated_animation, on_move_element_animation, on_request_element_animation, on_revert_step_animation, remove_random_element_animation, damage_element_animation, activate_buster_animation, swap_elements_animation, squash_element_animation, get_world_pos, get_field_pos, get_move_direction, get_first_view_item_by_game_id, get_view_item_by_game_id_and_index, get_all_view_items_by_game_id, delete_view_item_by_game_id, delete_all_view_items_by_game_id, try_make_under_cell, swap_element_easing, swap_element_time, move_elements_easing, move_elements_time, squash_element_easing, squash_element_time, spawn_element_easing, spawn_element_time, damaged_element_easing, damaged_element_delay, damaged_element_time, damaged_element_scale, min_swipe_distance, field_width, field_height, cell_size, scale_ratio, cells_offset, gm, game_id_to_view_index, selected_element, is_processing
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
            "ON_GAME_STEP",
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
                flow.start(function() return on_revert_step_animation(states.current_state, states.previous_state) end)
            end
        )
    end
    function on_game_step(events)
        is_processing = true
        for ____, event in ipairs(events) do
            repeat
                local ____switch20 = event.key
                local ____cond20 = ____switch20 == "ON_SWAP_ELEMENTS"
                if ____cond20 then
                    on_swap_element_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "ON_COMBINED"
                if ____cond20 then
                    on_combined_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "ON_COMBO"
                if ____cond20 then
                    on_combo_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED"
                if ____cond20 then
                    on_swaped_buster_with_diskosphere_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "DISKOSPHERE_ACTIVATED"
                if ____cond20 then
                    on_diskisphere_activated_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "SWAPED_DISKOSPHERES_ACTIVATED"
                if ____cond20 then
                    on_swaped_diskospheres_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED"
                if ____cond20 then
                    on_swaped_diskosphere_with_buster_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED"
                if ____cond20 then
                    on_swaped_diskosphere_with_element_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "AXIS_ROCKET_ACTIVATED"
                if ____cond20 then
                    on_axis_rocket_activated_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "ROCKET_ACTIVATED"
                if ____cond20 then
                    on_rocket_activated_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "SWAPED_ROCKETS_ACTIVATED"
                if ____cond20 then
                    on_swaped_rockets_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "HELICOPTER_ACTIVATED"
                if ____cond20 then
                    on_helicopter_activated_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "SWAPED_HELICOPTERS_ACTIVATED"
                if ____cond20 then
                    on_swaped_helicopters_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "DYNAMITE_ACTIVATED"
                if ____cond20 then
                    on_dynamite_activated_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "SWAPED_DYNAMITES_ACTIVATED"
                if ____cond20 then
                    on_swaped_dynamites_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "ACTIVATED_ELEMENT"
                if ____cond20 then
                    on_activated_element_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "ON_CELL_ACTIVATED"
                if ____cond20 then
                    on_cell_activated_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "MOVE_PHASE_BEGIN"
                if ____cond20 then
                    flow.delay(0.1)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "ON_MOVE_ELEMENT"
                if ____cond20 then
                    on_move_element_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "ON_REQUEST_ELEMENT"
                if ____cond20 then
                    on_request_element_animation(event.value)
                    break
                end
                ____cond20 = ____cond20 or ____switch20 == "MOVE_PHASE_END"
                if ____cond20 then
                    flow.delay(1)
                    break
                end
            until true
        end
        is_processing = false
    end
    function input_listener()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
            repeat
                local ____switch24 = message_id
                local ____cond24 = ____switch24 == ID_MESSAGES.MSG_ON_DOWN_ITEM
                if ____cond24 then
                    on_down(_message.item)
                    break
                end
                ____cond24 = ____cond24 or ____switch24 == ID_MESSAGES.MSG_ON_UP_ITEM
                if ____cond24 then
                    on_up(_message.item)
                    break
                end
                ____cond24 = ____cond24 or ____switch24 == ID_MESSAGES.MSG_ON_MOVE
                if ____cond24 then
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
            local ____switch30 = move_direction
            local ____cond30 = ____switch30 == Direction.Up
            if ____cond30 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond30 = ____cond30 or ____switch30 == Direction.Down
            if ____cond30 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond30 = ____cond30 or ____switch30 == Direction.Left
            if ____cond30 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond30 = ____cond30 or ____switch30 == Direction.Right
            if ____cond30 then
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
        selected_element = nil
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
                            try_make_under_cell(x, y, cell)
                            local ____make_cell_view_5 = make_cell_view
                            local ____array_4 = __TS__SparseArrayNew(x, y, cell.id, cell.uid)
                            local ____opt_0 = cell and cell.data
                            if ____opt_0 ~= nil then
                                ____opt_0 = ____opt_0.z_index
                            end
                            __TS__SparseArrayPush(____array_4, ____opt_0)
                            ____make_cell_view_5(__TS__SparseArraySpread(____array_4))
                        end
                        local element = state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            make_element_view(
                                x,
                                y,
                                element.type,
                                element.uid,
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
    function make_cell_view(x, y, cell_id, id, z_index)
        if z_index == nil then
            z_index = GAME_CONFIG.default_cell_z_index
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
        local index = gm.add_game_item({_hash = _go, is_clickable = true})
        if game_id_to_view_index[id] == nil then
            game_id_to_view_index[id] = {}
        end
        if id ~= nil then
            local ____game_id_to_view_index_id_6 = game_id_to_view_index[id]
            ____game_id_to_view_index_id_6[#____game_id_to_view_index_id_6 + 1] = index
        end
        return index
    end
    function make_element_view(x, y, ____type, id, spawn_anim, z_index)
        if spawn_anim == nil then
            spawn_anim = false
        end
        if z_index == nil then
            z_index = GAME_CONFIG.default_element_z_index
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
        local index = gm.add_game_item({_hash = _go, is_clickable = true})
        if game_id_to_view_index[id] == nil then
            game_id_to_view_index[id] = {}
        end
        if id ~= nil then
            local ____game_id_to_view_index_id_7 = game_id_to_view_index[id]
            ____game_id_to_view_index_id_7[#____game_id_to_view_index_id_7 + 1] = index
        end
        return index
    end
    function on_swap_element_animation(message)
        local elements = message
        swap_elements_animation(elements.element_from, elements.element_to)
        flow.delay(swap_element_time + 0.1)
    end
    function on_wrong_swap_element_animation(element_from, element_to)
        local from_world_pos = get_world_pos(element_from.x, element_from.y)
        local to_world_pos = get_world_pos(element_to.x, element_to.y)
        local item_from = get_first_view_item_by_game_id(element_from.uid)
        if item_from == nil then
            return
        end
        local item_to = get_first_view_item_by_game_id(element_to.uid)
        if item_to == nil then
            return
        end
        is_processing = true
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
        flow.delay(swap_element_time)
        is_processing = false
    end
    function on_combined_animation(message)
        local combined = message
        for ____, element in ipairs(combined.combination.elements) do
            damage_element_animation(element.uid)
        end
    end
    function on_combo_animation(message)
        local combo = message
        local target_element_world_pos = get_world_pos(combo.combined_element.x, combo.combined_element.y)
        do
            local i = 0
            while i < #combo.combination.elements do
                local element = combo.combination.elements[i + 1]
                local item = get_first_view_item_by_game_id(element.uid)
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
                damage_element_animation(element.uid)
                i = i + 1
            end
        end
        make_element_view(combo.maked_element.x, combo.maked_element.y, combo.maked_element.type, combo.maked_element.uid)
    end
    function on_diskisphere_activated_animation(message)
        local activation = message
        damage_element_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
    end
    function on_swaped_buster_with_diskosphere_animation(message)
        local activation = message
        squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                damage_element_animation(activation.other_element.uid)
                damage_element_animation(activation.element.uid)
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
                for ____, element in ipairs(activation.maked_elements) do
                    make_element_view(element.x, element.y, element.type, element.uid)
                end
            end
        )
        flow.delay(swap_element_time + damaged_element_time)
    end
    function on_swaped_diskospheres_animation(message)
        local activation = message
        squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                damage_element_animation(activation.element.uid)
                damage_element_animation(activation.other_element.uid)
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
            end
        )
    end
    function on_swaped_diskosphere_with_buster_animation(message)
        local activation = message
        squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                damage_element_animation(activation.other_element.uid)
                damage_element_animation(activation.element.uid)
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
                for ____, element in ipairs(activation.maked_elements) do
                    make_element_view(element.x, element.y, element.type, element.uid)
                end
            end
        )
        flow.delay(swap_element_time + damaged_element_time)
    end
    function on_axis_rocket_activated_animation(message)
        local activation = message
        damage_element_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
    end
    function on_rocket_activated_animation(message)
        local activation = message
        damage_element_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
    end
    function on_swaped_rockets_animation(message)
        local activation = message
        squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                damage_element_animation(activation.other_element.uid)
                damage_element_animation(activation.element.uid)
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
            end
        )
    end
    function on_helicopter_activated_animation(message)
        local activation = message
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
        if activation.target_element ~= NullElement then
            remove_random_element_animation(activation.element, activation.target_element)
        else
            damage_element_animation(activation.element.uid)
        end
        flow.delay(1.3)
    end
    function on_swaped_helicopters_animation(message)
        local activation = message
        squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
                local target_element = table.remove(activation.target_elements)
                if target_element ~= nil and target_element ~= NullElement then
                    remove_random_element_animation(activation.element, target_element)
                end
                target_element = table.remove(activation.target_elements)
                if target_element ~= nil and target_element ~= NullElement then
                    remove_random_element_animation(activation.other_element, target_element)
                end
                target_element = table.remove(activation.target_elements)
                if target_element ~= nil and target_element ~= NullElement then
                    make_element_view(activation.element.x, activation.element.y, ElementId.Helicopter, activation.element.uid)
                    remove_random_element_animation(activation.element, target_element, 1)
                end
            end
        )
        flow.delay(3)
    end
    function on_dynamite_activated_animation(message)
        local activation = message
        activate_buster_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
    end
    function on_swaped_dynamites_animation(message)
        local activation = message
        squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                delete_view_item_by_game_id(activation.other_element.uid)
                activate_buster_animation(activation.element.uid)
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
            end
        )
    end
    function on_swaped_diskosphere_with_element_animation(message)
        local activation = message
        squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                damage_element_animation(activation.element.uid)
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
            end
        )
    end
    function on_activated_element_animation(message)
        local activation = message
        damage_element_animation(activation.uid)
    end
    function on_cell_activated_animation(message)
        local activation = message
        delete_all_view_items_by_game_id(activation.previous_id)
        make_cell_view(activation.x, activation.y, activation.id, activation.uid)
    end
    function on_move_element_animation(message)
        local move = message
        for ____, pos in ipairs(move.path) do
            local to_world_pos = get_world_pos(pos.x, pos.y, 0)
            local item_from = get_first_view_item_by_game_id(move.element.uid)
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
    end
    function on_request_element_animation(message)
        local request_element = message
        make_element_view(request_element.x, request_element.y, request_element.type, request_element.uid)
        local item_from = get_first_view_item_by_game_id(request_element.uid)
        if item_from == nil then
            return
        end
        local world_pos = get_world_pos(request_element.x, request_element.y)
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
    function on_revert_step_animation(current_state, previous_state)
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local current_cell = current_state.cells[y + 1][x + 1]
                        if current_cell ~= NotActiveCell then
                            delete_all_view_items_by_game_id(current_cell.uid)
                            local previous_cell = previous_state.cells[y + 1][x + 1]
                            if previous_cell ~= NotActiveCell then
                                try_make_under_cell(x, y, previous_cell)
                                local ____make_cell_view_13 = make_cell_view
                                local ____array_12 = __TS__SparseArrayNew(x, y, previous_cell.id, previous_cell.uid)
                                local ____opt_8 = previous_cell and previous_cell.data
                                if ____opt_8 ~= nil then
                                    ____opt_8 = ____opt_8.z_index
                                end
                                __TS__SparseArrayPush(____array_12, ____opt_8)
                                ____make_cell_view_13(__TS__SparseArraySpread(____array_12))
                            end
                        end
                        local current_element = current_state.elements[y + 1][x + 1]
                        if current_element ~= NullElement then
                            delete_view_item_by_game_id(current_element.uid)
                        end
                        local previous_element = previous_state.elements[y + 1][x + 1]
                        if previous_element ~= NullElement then
                            make_element_view(
                                x,
                                y,
                                previous_element.type,
                                previous_element.uid,
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
    function remove_random_element_animation(element, target_element, view_index, on_complited)
        local target_world_pos = get_world_pos(target_element.x, target_element.y)
        local ____temp_14
        if view_index ~= nil then
            ____temp_14 = get_view_item_by_game_id_and_index(element.uid, view_index)
        else
            ____temp_14 = get_first_view_item_by_game_id(element.uid)
        end
        local item = ____temp_14
        if item == nil then
            return
        end
        go.animate(
            item._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            target_world_pos,
            go.EASING_INCUBIC,
            1,
            0.1,
            function()
                damage_element_animation(target_element.uid)
                damage_element_animation(
                    element.uid,
                    function()
                        if on_complited ~= nil then
                            on_complited()
                        end
                    end
                )
            end
        )
    end
    function damage_element_animation(element_id, on_complite)
        local element_view_item = get_first_view_item_by_game_id(element_id)
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
                    if on_complite ~= nil then
                        on_complite()
                    end
                end
            )
        end
    end
    function activate_buster_animation(element_id, on_complite)
        local element_view_item = get_first_view_item_by_game_id(element_id)
        if element_view_item ~= nil then
            go.animate(
                element_view_item._hash,
                "scale",
                go.PLAYBACK_ONCE_FORWARD,
                damaged_element_scale,
                go.EASING_INELASTIC,
                damaged_element_time,
                damaged_element_delay,
                function()
                    delete_view_item_by_game_id(element_id)
                    if on_complite ~= nil then
                        on_complite()
                    end
                end
            )
        end
    end
    function swap_elements_animation(element_from, element_to)
        local from_world_pos = get_world_pos(element_from.x, element_from.y)
        local to_world_pos = get_world_pos(element_to.x, element_to.y)
        local item_from = get_first_view_item_by_game_id(element_from.uid)
        if item_from == nil then
            return
        end
        local item_to = get_first_view_item_by_game_id(element_to.uid)
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
    function squash_element_animation(element, target_element, on_complite)
        local to_world_pos = get_world_pos(target_element.x, target_element.y)
        local item = get_first_view_item_by_game_id(element.uid)
        if item == nil then
            return
        end
        go.animate(
            item._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            to_world_pos,
            swap_element_easing,
            swap_element_time,
            0,
            function()
                if on_complite ~= nil then
                    on_complite()
                end
            end
        )
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
    function get_first_view_item_by_game_id(id)
        local indices = game_id_to_view_index[id]
        if indices == nil then
            return
        end
        return gm.get_item_by_index(indices[1])
    end
    function get_view_item_by_game_id_and_index(id, index)
        local indices = game_id_to_view_index[id]
        if indices == nil then
            return
        end
        return gm.get_item_by_index(indices[index + 1])
    end
    function get_all_view_items_by_game_id(id)
        local indices = game_id_to_view_index[id]
        if indices == nil then
            return
        end
        local items = {}
        for ____, index in ipairs(indices) do
            items[#items + 1] = gm.get_item_by_index(index)
        end
        return items
    end
    function delete_view_item_by_game_id(id)
        local item = get_first_view_item_by_game_id(id)
        if item == nil then
            __TS__Delete(game_id_to_view_index, id)
            return false
        end
        gm.delete_item(item, true)
        __TS__ArraySplice(game_id_to_view_index[id], 0, 1)
        return true
    end
    function delete_all_view_items_by_game_id(id)
        local items = get_all_view_items_by_game_id(id)
        if items == nil then
            return false
        end
        for ____, item in ipairs(items) do
            gm.delete_item(item, true)
        end
        __TS__Delete(game_id_to_view_index, id)
        return true
    end
    function try_make_under_cell(x, y, cell)
        if cell.data ~= nil and cell.data.is_render_under_cell and cell.data.under_cells ~= nil then
            local cell_id = cell.data.under_cells[#cell.data.under_cells]
            if cell_id ~= nil then
                local ____make_cell_view_18 = make_cell_view
                local ____array_17 = __TS__SparseArrayNew(x, y, cell_id, cell.uid)
                local ____opt_15 = cell.data
                if ____opt_15 ~= nil then
                    ____opt_15 = ____opt_15.z_index
                end
                __TS__SparseArrayPush(____array_17, ____opt_15 - 1)
                ____make_cell_view_18(__TS__SparseArraySpread(____array_17))
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
    return init()
end
return ____exports
