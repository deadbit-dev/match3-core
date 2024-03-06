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
local is_valid_pos = ____math_utils.is_valid_pos
local rotate_matrix_90 = ____math_utils.rotate_matrix_90
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____game_config = require("main.game_config")
local CellId = ____game_config.CellId
local ElementId = ____game_config.ElementId
local SubstrateId = ____game_config.SubstrateId
local ____match3_core = require("game.match3_core")
local NullElement = ____match3_core.NullElement
local NotActiveCell = ____match3_core.NotActiveCell
local MoveType = ____match3_core.MoveType
local SubstrateMasks = {
    {{0, 1, 0}, {1, 0, 1}, {0, 0, 0}},
    {{0, 1, 0}, {1, 0, 0}, {0, 0, 1}},
    {{0, 1, 0}, {1, 0, 0}, {0, 0, 0}},
    {{0, 0, 0}, {1, 0, 1}, {0, 0, 0}},
    {{0, 0, 1}, {1, 0, 0}, {0, 0, 1}},
    {{0, 0, 1}, {1, 0, 0}, {0, 0, 0}},
    {{0, 0, 0}, {1, 0, 0}, {0, 0, 1}},
    {{0, 0, 0}, {1, 0, 0}, {0, 0, 0}},
    {{0, 0, 1}, {0, 0, 0}, {0, 0, 1}},
    {{0, 0, 0}, {0, 0, 0}, {0, 0, 1}},
    {{0, 0, 0}, {0, 0, 0}, {0, 0, 0}}
}
function ____exports.View(animator)
    local set_events, on_game_step, input_listener, on_down, on_move, on_up, on_load_field, make_substrate_view, make_cell_view, make_element_view, on_swap_element_animation, on_wrong_swap_element_animation, on_combined_animation, on_combo_animation, on_buster_activation_begin, on_diskisphere_activated_animation, on_swaped_buster_with_diskosphere_animation, on_swaped_diskosphere_with_buster_animation, on_swaped_diskospheres_animation, on_rocket_activated_animation, on_swaped_rockets_animation, on_helicopter_activated_animation, on_swaped_helicopters_animation, on_swaped_helicopter_with_element_animation, on_dynamite_activated_animation, on_swaped_dynamites_animation, on_swaped_diskosphere_with_element_animation, on_spinning_activated_animation, on_element_activated_animation, on_cell_activated_animation, on_move_phase_begin, on_moved_elements_animation, on_move_phase_end, on_revert_step_animation, remove_random_element_animation, damage_element_animation, activate_buster_animation, squash_element_animation, get_world_pos, get_field_pos, get_move_direction, get_first_view_item_by_game_id, get_view_item_by_game_id_and_index, get_all_view_items_by_game_id, delete_view_item_by_game_id, delete_all_view_items_by_game_id, try_make_under_cell, min_swipe_distance, swap_element_easing, swap_element_time, squash_element_easing, squash_element_time, helicopter_fly_duration, damaged_element_easing, damaged_element_delay, damaged_element_time, damaged_element_scale, movement_to_point, duration_of_movement_between_cells, spawn_element_easing, spawn_element_time, field_width, field_height, cell_size, scale_ratio, cells_offset, event_to_animation, gm, game_id_to_view_index, selected_element, selected_element_position, combinate_phase_duration, move_phase_duration, is_processing
    function set_events()
        EventBus.on(
            "ON_LOAD_FIELD",
            function(state)
                if state == nil then
                    return
                end
                on_load_field(state)
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
            "TRY_ACTIVATE_SPINNING",
            function()
                if is_processing then
                    return
                end
                EventBus.send("ACTIVATE_SPINNING")
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
            local is_move_phase = event.key == "ON_MOVED_ELEMENTS"
            if is_move_phase then
                on_move_phase_begin()
            end
            local event_duration = event_to_animation[event.key](event.value)
            if is_move_phase then
                move_phase_duration = event_duration
                on_move_phase_end()
            elseif event_duration > combinate_phase_duration then
                combinate_phase_duration = event_duration
            end
        end
        is_processing = false
    end
    function input_listener()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
            repeat
                local ____switch28 = message_id
                local ____cond28 = ____switch28 == ID_MESSAGES.MSG_ON_DOWN_ITEM
                if ____cond28 then
                    on_down(_message.item)
                    break
                end
                ____cond28 = ____cond28 or ____switch28 == ID_MESSAGES.MSG_ON_UP_ITEM
                if ____cond28 then
                    on_up(_message.item)
                    break
                end
                ____cond28 = ____cond28 or ____switch28 == ID_MESSAGES.MSG_ON_MOVE
                if ____cond28 then
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
        if selected_element ~= nil then
            go.cancel_animations(selected_element._hash, "position.y")
            go.set_position(selected_element_position, selected_element._hash)
            local selected_element_world_pos = go.get_position(selected_element._hash)
            local current_element_world_pos = go.get_position(item._hash)
            local selected_element_pos = get_field_pos(selected_element_world_pos)
            local current_element_pos = get_field_pos(current_element_world_pos)
            local is_valid_x = math.abs(selected_element_pos.x - current_element_pos.x) <= 1
            local is_valid_y = math.abs(selected_element_pos.y - current_element_pos.y) <= 1
            local is_corner = math.abs(selected_element_pos.x - current_element_pos.x) ~= 0 and math.abs(selected_element_pos.y - current_element_pos.y) ~= 0
            if is_valid_x and is_valid_y and not is_corner then
                EventBus.send("SWAP_ELEMENTS", {from_x = selected_element_pos.x, from_y = selected_element_pos.y, to_x = current_element_pos.x, to_y = current_element_pos.y})
                selected_element = nil
                return
            end
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
            local ____switch36 = move_direction
            local ____cond36 = ____switch36 == Direction.Up
            if ____cond36 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond36 = ____cond36 or ____switch36 == Direction.Down
            if ____cond36 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond36 = ____cond36 or ____switch36 == Direction.Left
            if ____cond36 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond36 = ____cond36 or ____switch36 == Direction.Right
            if ____cond36 then
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
        selected_element_position = item_world_pos
        go.animate(
            item._hash,
            "position.y",
            go.PLAYBACK_LOOP_PINGPONG,
            item_world_pos.y + 4,
            go.EASING_OUTBOUNCE,
            1.5
        )
        EventBus.send("CLICK_ACTIVATION", {x = element_pos.x, y = element_pos.y})
    end
    function on_load_field(state)
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            make_substrate_view(x, y, state.cells)
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
    function make_substrate_view(x, y, cells, z_index)
        if z_index == nil then
            z_index = GAME_CONFIG.default_substrate_z_index
        end
        do
            local mask_index = 0
            while mask_index < #SubstrateMasks do
                local mask = SubstrateMasks[mask_index + 1]
                local is_90_mask = false
                if mask_index == SubstrateId.LeftRightStrip then
                    is_90_mask = true
                end
                local angle = 0
                local max_angle = is_90_mask and 90 or 270
                while angle <= max_angle do
                    local is_valid = true
                    do
                        local i = y - (#mask - 1) / 2
                        while i <= y + (#mask - 1) / 2 and is_valid do
                            do
                                local j = x - (#mask[1] - 1) / 2
                                while j <= x + (#mask[1] - 1) / 2 and is_valid do
                                    if mask[i - (y - (#mask - 1) / 2) + 1][j - (x - (#mask[1] - 1) / 2) + 1] == 1 then
                                        if is_valid_pos(j, i, #cells[1], #cells) then
                                            local cell = cells[i + 1][j + 1]
                                            is_valid = cell == NotActiveCell
                                        else
                                            is_valid = true
                                        end
                                    end
                                    j = j + 1
                                end
                            end
                            i = i + 1
                        end
                    end
                    if is_valid then
                        local pos = get_world_pos(x, y, z_index)
                        local _go = gm.make_go("substrate_view", pos)
                        gm.set_rotation_hash(_go, -angle)
                        sprite.play_flipbook(
                            msg.url(nil, _go, "sprite"),
                            GAME_CONFIG.substrate_database[mask_index]
                        )
                        go.set_scale(
                            vmath.vector3(scale_ratio, scale_ratio, 1),
                            _go
                        )
                        return
                    end
                    mask = rotate_matrix_90(mask)
                    angle = angle + 90
                end
                mask_index = mask_index + 1
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
        if cell_id == CellId.Base then
            gm.set_color_hash(_go, GAME_CONFIG.base_cell_color)
        end
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
        local element_from = elements.element_from
        local element_to = elements.element_to
        local from_world_pos = get_world_pos(element_from.x, element_from.y)
        local to_world_pos = get_world_pos(element_to.x, element_to.y)
        local item_from = get_first_view_item_by_game_id(element_from.uid)
        if item_from == nil then
            return 0
        end
        local item_to = get_first_view_item_by_game_id(element_to.uid)
        if item_to == nil then
            return 0
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
        return swap_element_time + 0.1
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
            swap_element_time,
            0,
            function()
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
                    swap_element_time,
                    0,
                    function()
                        is_processing = false
                    end
                )
            end
        )
        return spawn_element_time * 2
    end
    function on_combined_animation(message)
        local combined = message
        for ____, element in ipairs(combined.combination.elements) do
            damage_element_animation(element.uid)
        end
        return damaged_element_time
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
                    if i == #combo.combination.elements - 1 then
                        go.animate(
                            item._hash,
                            "position",
                            go.PLAYBACK_ONCE_FORWARD,
                            target_element_world_pos,
                            squash_element_easing,
                            squash_element_time,
                            0,
                            function()
                                delete_view_item_by_game_id(element.uid)
                                make_element_view(combo.maked_element.x, combo.maked_element.y, combo.maked_element.type, combo.maked_element.uid)
                            end
                        )
                    else
                        go.animate(
                            item._hash,
                            "position",
                            go.PLAYBACK_ONCE_FORWARD,
                            target_element_world_pos,
                            squash_element_easing,
                            squash_element_time,
                            0,
                            function() return delete_view_item_by_game_id(element.uid) end
                        )
                    end
                end
                i = i + 1
            end
        end
        return squash_element_time
    end
    function on_buster_activation_begin(message)
        flow.delay(combinate_phase_duration + 0.2)
        combinate_phase_duration = 0
        return 0
    end
    function on_diskisphere_activated_animation(message)
        local activation = message
        damage_element_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
        return damaged_element_time
    end
    function on_swaped_buster_with_diskosphere_animation(message)
        local activation = message
        damage_element_animation(activation.other_element.uid)
        damage_element_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
        for ____, element in ipairs(activation.maked_elements) do
            make_element_view(element.x, element.y, element.type, element.uid)
        end
        return damaged_element_time
    end
    function on_swaped_diskosphere_with_buster_animation(message)
        local activation = message
        damage_element_animation(activation.other_element.uid)
        damage_element_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
        for ____, element in ipairs(activation.maked_elements) do
            make_element_view(element.x, element.y, element.type, element.uid)
        end
        return damaged_element_time
    end
    function on_swaped_diskospheres_animation(message)
        local activation = message
        local squash_duration = squash_element_animation(
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
        return squash_duration + damaged_element_time
    end
    function on_rocket_activated_animation(message)
        local activation = message
        damage_element_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
        return damaged_element_time
    end
    function on_swaped_rockets_animation(message)
        local activation = message
        local squash_duration = squash_element_animation(
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
        return squash_duration + damaged_element_time
    end
    function on_helicopter_activated_animation(message)
        local activation = message
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
        if activation.target_element ~= NullElement then
            remove_random_element_animation(activation.element, activation.target_element)
            return damaged_element_time + helicopter_fly_duration + 0.2
        end
        return damage_element_animation(activation.element.uid)
    end
    function on_swaped_helicopters_animation(message)
        local activation = message
        local squash_duration = squash_element_animation(
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
        return squash_duration + damaged_element_time + helicopter_fly_duration + 0.2
    end
    function on_swaped_helicopter_with_element_animation(message)
        local activation = message
        local squash_duration = squash_element_animation(
            activation.element,
            activation.element,
            function()
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
                if activation.target_element ~= NullElement then
                    remove_random_element_animation(activation.element, activation.target_element)
                end
            end
        )
        return squash_duration + damaged_element_time + helicopter_fly_duration + 0.2
    end
    function on_dynamite_activated_animation(message)
        local activation = message
        local activation_duration = activate_buster_animation(
            activation.element.uid,
            function()
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(element.uid)
                end
            end
        )
        return activation_duration + damaged_element_time
    end
    function on_swaped_dynamites_animation(message)
        local activation = message
        local squash_duration = squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                delete_view_item_by_game_id(activation.other_element.uid)
                activate_buster_animation(
                    activation.element.uid,
                    function()
                        for ____, element in ipairs(activation.damaged_elements) do
                            damage_element_animation(element.uid)
                        end
                    end
                )
            end
        )
        return squash_duration + damaged_element_time * 2
    end
    function on_swaped_diskosphere_with_element_animation(message)
        local activation = message
        damage_element_animation(activation.element.uid)
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(element.uid)
        end
        return damaged_element_time
    end
    function on_spinning_activated_animation(message)
        local data = message
        for ____, swap_info in ipairs(data) do
            local from_world_pos = get_world_pos(swap_info.element_from.x, swap_info.element_from.y)
            local to_world_pos = get_world_pos(swap_info.element_to.x, swap_info.element_to.y)
            local item_from = get_first_view_item_by_game_id(swap_info.element_from.uid)
            if item_from == nil then
                return 0
            end
            local item_to = get_first_view_item_by_game_id(swap_info.element_to.uid)
            if item_to == nil then
                return 0
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
        return swap_element_time + 0.1
    end
    function on_element_activated_animation(message)
        local activation = message
        return damage_element_animation(activation.uid)
    end
    function on_cell_activated_animation(message)
        local activation = message
        delete_all_view_items_by_game_id(activation.previous_id)
        make_cell_view(activation.x, activation.y, activation.id, activation.uid)
        return 0
    end
    function on_move_phase_begin()
        flow.delay(combinate_phase_duration + 0.2)
        combinate_phase_duration = 0
    end
    function on_moved_elements_animation(message)
        local elements = message
        local delayed_row_in_column = {}
        local max_delay = 0
        local max_move_duration = 0
        do
            local i = 0
            while i < #elements do
                local element = elements[i + 1]
                local delay = 0
                local total_move_duration = 0
                local animation = nil
                local anim_pos = {}
                do
                    local p = 0
                    while p < #element.points do
                        local point = element.points[p + 1]
                        if point.type ~= MoveType.Swaped then
                            if point.type == MoveType.Requested then
                                make_element_view(point.to_x, point.to_y, element.data.type, element.data.uid)
                            end
                            local item_from = get_first_view_item_by_game_id(element.data.uid)
                            if item_from ~= nil then
                                local to_world_pos = get_world_pos(point.to_x, point.to_y)
                                if point.type == MoveType.Requested then
                                    local j = delayed_row_in_column[element.points[1].to_x + 1] ~= nil and delayed_row_in_column[element.points[1].to_x + 1] or 0
                                    gm.set_position_xy(item_from, to_world_pos.x, 0 + cell_size * j)
                                end
                                local move_duration = 0
                                if animation == nil then
                                    anim_pos.x = go.get(item_from._hash, "position.x")
                                    anim_pos.y = go.get(item_from._hash, "position.y")
                                    if delayed_row_in_column[element.points[1].to_x + 1] == nil then
                                        delayed_row_in_column[element.points[1].to_x + 1] = 0
                                    end
                                    local ____delayed_row_in_column_8, ____temp_9 = delayed_row_in_column, element.points[1].to_x + 1
                                    local ____delayed_row_in_column_index_10 = ____delayed_row_in_column_8[____temp_9]
                                    ____delayed_row_in_column_8[____temp_9] = ____delayed_row_in_column_index_10 + 1
                                    local delay_factor = ____delayed_row_in_column_index_10
                                    delay = delay_factor * duration_of_movement_between_cells
                                    if delay > max_delay then
                                        max_delay = delay
                                    end
                                    if movement_to_point then
                                        local diagonal = math.sqrt(math.pow(cell_size, 2) + math.pow(cell_size, 2))
                                        local delta = diagonal / cell_size
                                        local distance_beetwen_cells = point.type == MoveType.Filled and diagonal or cell_size
                                        local time = point.type == MoveType.Filled and duration_of_movement_between_cells * delta or duration_of_movement_between_cells
                                        local v = to_world_pos - vmath.vector3(anim_pos.x, anim_pos.y, 0)
                                        local l = math.sqrt(math.pow(v.x, 2) + math.pow(v.y, 2))
                                        move_duration = time * (l / distance_beetwen_cells)
                                    else
                                        local diagonal = math.sqrt(math.pow(cell_size, 2) + math.pow(cell_size, 2))
                                        local delta = diagonal / cell_size
                                        local time = point.type == MoveType.Filled and duration_of_movement_between_cells * delta or duration_of_movement_between_cells
                                        move_duration = time
                                    end
                                    animation = animator:to(anim_pos, move_duration, {x = to_world_pos.x, y = to_world_pos.y}):delay(delay):ease("linear"):onupdate(function()
                                        go.set(item_from._hash, "position.x", anim_pos.x)
                                        go.set(item_from._hash, "position.y", anim_pos.y)
                                    end)
                                else
                                    if movement_to_point then
                                        local previous_point = element.points[p]
                                        local current_world_pos = get_world_pos(previous_point.to_x, previous_point.to_y)
                                        local diagonal = math.sqrt(math.pow(cell_size, 2) + math.pow(cell_size, 2))
                                        local delta = diagonal / cell_size
                                        local distance_beetwen_cells = point.type == MoveType.Filled and diagonal or cell_size
                                        local time = point.type == MoveType.Filled and duration_of_movement_between_cells * delta or duration_of_movement_between_cells
                                        local v = to_world_pos - current_world_pos
                                        local l = math.sqrt(math.pow(v.x, 2) + math.pow(v.y, 2))
                                        move_duration = time * (l / distance_beetwen_cells)
                                    else
                                        local diagonal = math.sqrt(math.pow(cell_size, 2) + math.pow(cell_size, 2))
                                        local delta = diagonal / cell_size
                                        local time = point.type == MoveType.Filled and duration_of_movement_between_cells * delta or duration_of_movement_between_cells
                                        move_duration = time
                                    end
                                    animation = animation:after(anim_pos, move_duration, {x = to_world_pos.x, y = to_world_pos.y}):onupdate(function()
                                        go.set(item_from._hash, "position.x", anim_pos.x)
                                        go.set(item_from._hash, "position.y", anim_pos.y)
                                    end)
                                end
                                total_move_duration = total_move_duration + move_duration
                            end
                        end
                        p = p + 1
                    end
                end
                if total_move_duration > max_move_duration then
                    max_move_duration = total_move_duration
                end
                i = i + 1
            end
        end
        return max_move_duration + max_delay
    end
    function on_move_phase_end()
        flow.delay(move_phase_duration)
        move_phase_duration = 0
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
                                local ____make_cell_view_16 = make_cell_view
                                local ____array_15 = __TS__SparseArrayNew(x, y, previous_cell.id, previous_cell.uid)
                                local ____opt_11 = previous_cell and previous_cell.data
                                if ____opt_11 ~= nil then
                                    ____opt_11 = ____opt_11.z_index
                                end
                                __TS__SparseArrayPush(____array_15, ____opt_11)
                                ____make_cell_view_16(__TS__SparseArraySpread(____array_15))
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
        local ____temp_17
        if view_index ~= nil then
            ____temp_17 = get_view_item_by_game_id_and_index(element.uid, view_index)
        else
            ____temp_17 = get_first_view_item_by_game_id(element.uid)
        end
        local item = ____temp_17
        if item == nil then
            return 0
        end
        go.animate(
            item._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            target_world_pos,
            go.EASING_INCUBIC,
            helicopter_fly_duration,
            0,
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
        return helicopter_fly_duration + damaged_element_time
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
        return damaged_element_time
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
        return damaged_element_time
    end
    function squash_element_animation(element, target_element, on_complite)
        local to_world_pos = get_world_pos(target_element.x, target_element.y)
        local item = get_first_view_item_by_game_id(element.uid)
        if item == nil then
            return 0
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
        return swap_element_time
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
                local ____make_cell_view_21 = make_cell_view
                local ____array_20 = __TS__SparseArrayNew(x, y, cell_id, cell.uid)
                local ____opt_18 = cell.data
                if ____opt_18 ~= nil then
                    ____opt_18 = ____opt_18.z_index
                end
                __TS__SparseArrayPush(____array_20, ____opt_18 - 1)
                ____make_cell_view_21(__TS__SparseArraySpread(____array_20))
            end
        end
    end
    local game_width = 540
    local game_height = 960
    min_swipe_distance = GAME_CONFIG.min_swipe_distance
    swap_element_easing = GAME_CONFIG.swap_element_easing
    swap_element_time = GAME_CONFIG.swap_element_time
    squash_element_easing = GAME_CONFIG.squash_element_easing
    squash_element_time = GAME_CONFIG.squash_element_time
    helicopter_fly_duration = GAME_CONFIG.helicopter_fly_duration
    damaged_element_easing = GAME_CONFIG.damaged_element_easing
    damaged_element_delay = GAME_CONFIG.damaged_element_delay
    damaged_element_time = GAME_CONFIG.damaged_element_time
    damaged_element_scale = GAME_CONFIG.damaged_element_scale
    movement_to_point = GAME_CONFIG.movement_to_point
    duration_of_movement_between_cells = GAME_CONFIG.duration_of_movement_bettween_cells
    spawn_element_easing = GAME_CONFIG.spawn_element_easing
    spawn_element_time = GAME_CONFIG.spawn_element_time
    local level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    local max_field_width = level_config.field.max_width
    local max_field_height = level_config.field.height
    local offset_border = level_config.field.offset_border
    local origin_cell_size = level_config.field.cell_size
    cell_size = math.floor(math.min((game_width - offset_border * 2) / max_field_width, 100))
    scale_ratio = cell_size / origin_cell_size
    cells_offset = vmath.vector3(game_width / 2 - field_width / 2 * cell_size, -(game_height / 2 - max_field_height / 2 * cell_size) + 50, 0)
    event_to_animation = {
        ON_SWAP_ELEMENTS = on_swap_element_animation,
        ON_COMBINED = on_combined_animation,
        ON_COMBO = on_combo_animation,
        ON_ELEMENT_ACTIVATED = on_element_activated_animation,
        ON_CELL_ACTIVATED = on_cell_activated_animation,
        ON_SPINNING_ACTIVATED = on_spinning_activated_animation,
        ON_BUSTER_ACTIVATION = on_buster_activation_begin,
        SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED = on_swaped_buster_with_diskosphere_animation,
        DISKOSPHERE_ACTIVATED = on_diskisphere_activated_animation,
        SWAPED_DISKOSPHERES_ACTIVATED = on_swaped_diskospheres_animation,
        SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED = on_swaped_diskosphere_with_buster_animation,
        SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED = on_swaped_diskosphere_with_element_animation,
        ROCKET_ACTIVATED = on_rocket_activated_animation,
        SWAPED_ROCKETS_ACTIVATED = on_swaped_rockets_animation,
        HELICOPTER_ACTIVATED = on_helicopter_activated_animation,
        SWAPED_HELICOPTERS_ACTIVATED = on_swaped_helicopters_animation,
        SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED = on_swaped_helicopter_with_element_animation,
        DYNAMITE_ACTIVATED = on_dynamite_activated_animation,
        SWAPED_DYNAMITES_ACTIVATED = on_swaped_dynamites_animation,
        ON_MOVED_ELEMENTS = on_moved_elements_animation
    }
    gm = GoManager()
    game_id_to_view_index = {}
    selected_element = nil
    combinate_phase_duration = 0
    move_phase_duration = 0
    is_processing = false
    local function init()
        set_events()
        EventBus.send("LOAD_FIELD")
        input_listener()
    end
    return init()
end
return ____exports
