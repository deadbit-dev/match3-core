local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__Delete = ____lualib.__TS__Delete
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local ____exports = {}
local flow = require("ludobits.m.flow")
local ____math_utils = require("utils.math_utils")
local Axis = ____math_utils.Axis
local Direction = ____math_utils.Direction
local is_valid_pos = ____math_utils.is_valid_pos
local rotateMatrix = ____math_utils.rotateMatrix
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____match3_core = require("game.match3_core")
local NullElement = ____match3_core.NullElement
local NotActiveCell = ____match3_core.NotActiveCell
local MoveType = ____match3_core.MoveType
local ____match3_game = require("game.match3_game")
local SubstrateId = ____match3_game.SubstrateId
local CellId = ____match3_game.CellId
local ElementId = ____match3_game.ElementId
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
function ____exports.View(animator, resources)
    local recalculate_sizes, copy_game_state, calculate_cell_size, calculate_scale_ratio, calculate_cell_offset, set_targets, set_events, shuffle_animation, shuffle_end_animation, remove_tutorial, update_state, update_cells_state, set_win, set_gameover, remove_animals, on_game_step, dispatch_messages, on_down, on_move, on_up, recalculate_cell_offset, load_field, reset_field, reload_field, make_substrate_view, make_cell_view, make_element_view, on_swap_element_animation, on_wrong_swap_element_animation, on_combined_animation, combo_animation, on_buster_activation_begin, on_diskisphere_activated_animation, on_swaped_diskosphere_with_buster_animation, on_swaped_diskospheres_animation, on_swaped_diskosphere_with_element_animation, activate_diskosphere_animation, trace, explode_element_animation, on_rocket_activated_animation, on_swaped_rockets_animation, activate_rocket_animation, rocket_effect, on_helicopter_activated_animation, on_swaped_helicopters_animation, on_swaped_helicopter_with_element_animation, on_dynamite_activated_animation, on_swaped_dynamites_animation, activate_dynamite_animation, dynamite_activate_cell_animation, on_element_activated_animation, activate_cell_animation, on_move_phase_begin, on_moved_elements_animation, on_move_phase_end, remove_random_element_animation, damage_element_animation, squash_element_animation, get_world_pos, get_field_pos, get_move_direction, get_first_view_item_by_game_id, get_view_item_by_game_id_and_index, get_all_view_items_by_game_id, delete_view_item_by_game_id, delete_all_view_items_by_game_id, update_target_by_id, try_make_under_cell, min_swipe_distance, swap_element_easing, swap_element_time, squash_element_easing, squash_element_time, helicopter_fly_duration, damaged_element_easing, damaged_element_delay, damaged_element_time, damaged_element_scale, movement_to_point, duration_of_movement_between_cells, spawn_element_easing, spawn_element_time, current_level, level_config, field_width, field_height, max_field_width, max_field_height, offset_border, origin_cell_size, event_to_animation, gm, targets, original_game_width, original_game_height, prev_game_width, prev_game_height, cell_size, scale_ratio, cells_offset, state, down_item, selected_element_position, combinate_phase_duration, move_phase_duration, is_processing, is_shuffling, stop_shuffling
    function recalculate_sizes()
        local ltrb = Camera.get_ltrb()
        if ltrb.z == prev_game_width and ltrb.w == prev_game_height then
            return
        end
        Log.log("RESIZE VIEW")
        prev_game_width = ltrb.z
        prev_game_height = ltrb.w
        local changes_coff = math.abs(ltrb.w) / original_game_height
        cell_size = calculate_cell_size() * changes_coff
        scale_ratio = calculate_scale_ratio()
        cells_offset = vmath.vector3(
            original_game_width / 2 - field_width / 2 * cell_size,
            (-(original_game_height / 2 - max_field_height / 2 * calculate_cell_size()) + 100) * changes_coff,
            0
        )
        reload_field()
    end
    function copy_game_state()
        local copy_state = __TS__ObjectAssign({}, state.game_state)
        copy_state.cells = {}
        copy_state.elements = {}
        do
            local y = 0
            while y < field_height do
                copy_state.cells[y + 1] = {}
                copy_state.elements[y + 1] = {}
                do
                    local x = 0
                    while x < field_width do
                        copy_state.cells[y + 1][x + 1] = state.game_state.cells[y + 1][x + 1]
                        copy_state.elements[y + 1][x + 1] = state.game_state.elements[y + 1][x + 1]
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        copy_state.targets = __TS__ObjectAssign({}, state.game_state.targets)
        return copy_state
    end
    function calculate_cell_size()
        return math.floor(math.min((original_game_width - offset_border * 2) / max_field_width, 100))
    end
    function calculate_scale_ratio()
        return cell_size / origin_cell_size
    end
    function calculate_cell_offset()
        return vmath.vector3(original_game_width / 2 - field_width / 2 * cell_size, -(original_game_height / 2 - max_field_height / 2 * cell_size) + 100, 0)
    end
    function set_targets()
        do
            local i = 0
            while i < #level_config.targets do
                local target = level_config.targets[i + 1]
                targets[i] = target.count
                i = i + 1
            end
        end
    end
    function set_events()
        EventBus.on(
            "ON_LOAD_FIELD",
            function(state)
                set_targets()
                recalculate_cell_offset(state)
                load_field(state)
                EventBus.send("INIT_UI")
                EventBus.send("UPDATED_STEP_COUNTER", state.steps)
                do
                    local i = 0
                    while i < #state.targets do
                        local target = state.targets[i + 1]
                        local amount = target.count - #target.uids
                        targets[i] = amount
                        EventBus.send("UPDATED_TARGET", {id = i, count = amount})
                        i = i + 1
                    end
                end
                recalculate_sizes()
                timer.delay(0.1, true, recalculate_sizes)
                EventBus.send("SET_HELPER")
            end
        )
        EventBus.on(
            "SET_TUTORIAL",
            function()
                local tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1]
                local bounds = tutorial_data.bounds ~= nil and tutorial_data.bounds or ({from_x = 0, from_y = 0, to_x = 0, to_y = 0})
                do
                    local y = bounds.from_y
                    while y < bounds.to_y do
                        do
                            local x = bounds.from_x
                            while x < bounds.to_x do
                                local substrate = state.substrates[y + 1][x + 1]
                                local substrate_view = msg.url(nil, substrate, "sprite")
                                go.set(substrate_view, "material", resources.tutorial_sprite_material)
                                local cell = state.game_state.cells[y + 1][x + 1]
                                if cell ~= NotActiveCell then
                                    local cell_views = get_all_view_items_by_game_id(cell.uid)
                                    if cell_views ~= nil then
                                        for ____, cell_view in ipairs(cell_views) do
                                            local cell_view_url = msg.url(nil, cell_view._hash, "sprite")
                                            go.set(cell_view_url, "material", resources.tutorial_sprite_material)
                                        end
                                    end
                                end
                                local element = state.game_state.elements[y + 1][x + 1]
                                if element ~= NullElement then
                                    local ____msg_url_2 = msg.url
                                    local ____opt_0 = get_first_view_item_by_game_id(element.uid)
                                    local element_view = ____msg_url_2(nil, ____opt_0 and ____opt_0._hash, "sprite")
                                    go.set(element_view, "material", resources.tutorial_sprite_material)
                                end
                                x = x + 1
                            end
                        end
                        y = y + 1
                    end
                end
            end
        )
        EventBus.on(
            "ON_WRONG_SWAP_ELEMENTS",
            function(data)
                flow.start(function()
                    on_wrong_swap_element_animation(data)
                    EventBus.send("SET_HELPER")
                end)
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
            "ON_ELEMENT_SELECTED",
            function(element)
                if element == nil then
                    return
                end
                local item = get_first_view_item_by_game_id(element.uid)
                if item == nil then
                    return
                end
                selected_element_position = go.get_position(item._hash)
                go.animate(
                    item._hash,
                    "position.y",
                    go.PLAYBACK_LOOP_PINGPONG,
                    selected_element_position.y + 3,
                    go.EASING_INCUBIC,
                    1
                )
                EventBus.send("SET_HELPER")
            end
        )
        EventBus.on(
            "ON_ELEMENT_UNSELECTED",
            function(element)
                if element == nil then
                    return
                end
                local item = get_first_view_item_by_game_id(element.uid)
                if item == nil then
                    return
                end
                go.cancel_animations(item._hash)
                go.set_position(selected_element_position, item._hash)
                EventBus.send("SET_HELPER")
            end
        )
        EventBus.on(
            "ON_SET_STEP_HELPER",
            function(data)
                local combined_item = get_first_view_item_by_game_id(data.combined_element.uid)
                if combined_item ~= nil then
                    local from_pos = get_world_pos(data.step.from_x, data.step.from_y, GAME_CONFIG.default_element_z_index)
                    local to_pos = get_world_pos(data.step.to_x, data.step.to_y, GAME_CONFIG.default_element_z_index)
                    if data.combined_element.x == data.step.from_x and data.combined_element.y == data.step.from_y then
                        local buffer = from_pos
                        from_pos = to_pos
                        to_pos = buffer
                    end
                    go.set_position(from_pos, combined_item._hash)
                    go.animate(
                        combined_item._hash,
                        "position.x",
                        go.PLAYBACK_LOOP_PINGPONG,
                        from_pos.x + (to_pos.x - from_pos.x) * 0.1,
                        go.EASING_INCUBIC,
                        1.5
                    )
                    go.animate(
                        combined_item._hash,
                        "position.y",
                        go.PLAYBACK_LOOP_PINGPONG,
                        from_pos.y + (to_pos.y - from_pos.y) * 0.1,
                        go.EASING_INCUBIC,
                        1.5
                    )
                end
                for ____, element in ipairs(data.elements) do
                    local item = get_first_view_item_by_game_id(element.uid)
                    if item ~= nil then
                        go.animate(
                            msg.url(nil, item._hash, "sprite"),
                            "tint",
                            go.PLAYBACK_LOOP_PINGPONG,
                            vmath.vector4(0.75, 0.75, 0.75, 1),
                            go.EASING_INCUBIC,
                            1.5
                        )
                    end
                end
            end
        )
        EventBus.on(
            "ON_RESET_STEP_HELPER",
            function(data)
                local combined_item = get_first_view_item_by_game_id(data.combined_element.uid)
                if combined_item ~= nil then
                    go.cancel_animations(combined_item._hash)
                    local to_pos = get_world_pos(data.combined_element.x, data.combined_element.y, GAME_CONFIG.default_element_z_index)
                    local from_pos = get_world_pos(data.step.from_x, data.step.from_y, GAME_CONFIG.default_element_z_index)
                    if from_pos.x == to_pos.x and from_pos.y == to_pos.y then
                        from_pos = get_world_pos(data.step.to_x, data.step.to_y, GAME_CONFIG.default_element_z_index)
                    end
                    go.animate(
                        combined_item._hash,
                        "position",
                        go.PLAYBACK_ONCE_FORWARD,
                        from_pos,
                        go.EASING_INCUBIC,
                        0.25
                    )
                end
                for ____, element in ipairs(data.elements) do
                    local item = get_first_view_item_by_game_id(element.uid)
                    if item ~= nil then
                        go.cancel_animations(msg.url(nil, item._hash, "sprite"))
                        go.set(
                            msg.url(nil, item._hash, "sprite"),
                            "tint",
                            vmath.vector4(1, 1, 1, 1)
                        )
                    end
                end
            end
        )
        EventBus.on(
            "SHUFFLE_START",
            function()
                if is_shuffling then
                    return
                end
                is_shuffling = true
                stop_shuffling = false
                shuffle_animation()
            end,
            true
        )
        EventBus.on("SHUFFLE_END", shuffle_end_animation, true)
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
            "TRY_ACTIVATE_HAMMER",
            function()
                if is_processing then
                    return
                end
                EventBus.send("ACTIVATE_HAMMER")
            end
        )
        EventBus.on(
            "TRY_ACTIVATE_HORIZONTAL_ROCKET",
            function()
                if is_processing then
                    return
                end
                EventBus.send("ACTIVATE_HORIZONTAL_ROCKET")
            end
        )
        EventBus.on(
            "TRY_ACTIVATE_VERTICAL_ROCKET",
            function()
                if is_processing then
                    return
                end
                EventBus.send("ACTIVATE_VERTICAL_ROCKET")
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
        EventBus.on("UPDATED_STATE", update_state)
        EventBus.on("ON_WIN", set_win, true)
        EventBus.on("ON_GAME_OVER", set_gameover, true)
        EventBus.on(
            "MSG_ON_DOWN_ITEM",
            function(data) return on_down(data.item) end,
            true
        )
        EventBus.on(
            "MSG_ON_UP_ITEM",
            function(data) return on_up(data.item) end,
            true
        )
        EventBus.on(
            "MSG_ON_MOVE",
            function(data) return on_move(data) end,
            true
        )
    end
    function shuffle_animation()
        if stop_shuffling then
            return
        end
        Log.log("SHUFFLE ANIMATION")
        local elements = {}
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local element = state.game_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            elements[#elements + 1] = {x = x, y = y, uid = element.uid}
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        while #elements > 0 do
            local element_from = __TS__ArraySplice(
                elements,
                math.random(0, #elements - 1),
                1
            )[1]
            if #elements == 0 then
                break
            end
            local element_to = __TS__ArraySplice(
                elements,
                math.random(0, #elements - 1),
                1
            )[1]
            local item_from = get_first_view_item_by_game_id(element_from.uid)
            local item_to = get_first_view_item_by_game_id(element_to.uid)
            if item_from ~= nil and item_to ~= nil then
                local from_world_pos = go.get_position(item_from._hash)
                from_world_pos.z = GAME_CONFIG.default_top_layer_cell_z_index + 0.1
                go.set_position(from_world_pos, item_from._hash)
                local to_world_pos = go.get_position(item_to._hash)
                to_world_pos.z = GAME_CONFIG.default_top_layer_cell_z_index + 0.1
                go.set_position(to_world_pos, item_to._hash)
                go.animate(
                    item_from._hash,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    to_world_pos,
                    swap_element_easing,
                    0.7
                )
                go.animate(
                    item_to._hash,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    from_world_pos,
                    swap_element_easing,
                    0.7
                )
            end
        end
        timer.delay(0.7, false, shuffle_animation)
    end
    function shuffle_end_animation(state)
        is_shuffling = false
        stop_shuffling = true
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local element = state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            local element_view = get_first_view_item_by_game_id(element.uid)
                            if element_view ~= nil then
                                local to_world_pos = get_world_pos(x, y, GAME_CONFIG.default_element_z_index)
                                go.animate(
                                    element_view._hash,
                                    "position",
                                    go.PLAYBACK_ONCE_FORWARD,
                                    to_world_pos,
                                    swap_element_easing,
                                    0.5
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
    function remove_tutorial()
        EventBus.send("REMOVE_TUTORIAL")
        local tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1]
        local bounds = tutorial_data.bounds ~= nil and tutorial_data.bounds or ({from_x = 0, from_y = 0, to_x = 0, to_y = 0})
        do
            local y = bounds.from_y
            while y < bounds.to_y do
                do
                    local x = bounds.from_x
                    while x < bounds.to_x do
                        local substrate = state.substrates[y + 1][x + 1]
                        local substrate_view = msg.url(nil, substrate, "sprite")
                        go.set(substrate_view, "material", resources.default_sprite_material)
                        local cell = state.game_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            local cell_views = get_all_view_items_by_game_id(cell.uid)
                            if cell_views ~= nil then
                                for ____, cell_view in ipairs(cell_views) do
                                    local cell_view_url = msg.url(nil, cell_view._hash, "sprite")
                                    go.set(cell_view_url, "material", resources.default_sprite_material)
                                end
                            end
                        end
                        local element = state.game_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            local ____msg_url_5 = msg.url
                            local ____opt_3 = get_first_view_item_by_game_id(element.uid)
                            local element_view = ____msg_url_5(nil, ____opt_3 and ____opt_3._hash, "sprite")
                            go.set(element_view, "material", resources.default_sprite_material)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return 0
    end
    function update_state(message)
        Log.log("UPDATE STATE")
        local state = message
        reset_field()
        load_field(state, false)
        EventBus.send("SET_HELPER")
        return 0
    end
    function update_cells_state(message)
        local cells = message
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local current_cell = state.game_state.cells[y + 1][x + 1]
                        if current_cell ~= NotActiveCell then
                            local items = get_all_view_items_by_game_id(current_cell.uid)
                            if items ~= nil then
                                for ____, item in ipairs(items) do
                                    gm.delete_item(item, true)
                                end
                            end
                            local cell = cells[y + 1][x + 1]
                            state.game_state.cells[y + 1][x + 1] = cell
                            if cell ~= NotActiveCell then
                                try_make_under_cell(x, y, cell)
                                make_cell_view(x, y, cell.id, cell.uid)
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return 0
    end
    function set_win()
        reset_field()
        remove_animals()
    end
    function set_gameover()
        reset_field()
        remove_animals()
    end
    function remove_animals()
        if not __TS__ArrayIncludes(GAME_CONFIG.animal_levels, current_level + 1) then
            return
        end
        local scene_name = Scene.get_current_name()
        Scene.unload_resource(scene_name, "cat")
        Scene.unload_resource(scene_name, GAME_CONFIG.level_to_animal[current_level + 1])
    end
    function on_game_step(data)
        is_processing = true
        for ____, event in ipairs(data.events) do
            repeat
                local ____switch102 = event.key
                local event_duration
                local ____cond102 = ____switch102 == "ON_SWAP_ELEMENTS"
                if ____cond102 then
                    flow.delay(event_to_animation[event.key](event.value))
                    break
                end
                ____cond102 = ____cond102 or ____switch102 == "ON_SPINNING_ACTIVATED"
                if ____cond102 then
                    flow.delay(event_to_animation[event.key](event.value))
                    break
                end
                ____cond102 = ____cond102 or ____switch102 == "ON_MOVED_ELEMENTS"
                if ____cond102 then
                    on_move_phase_begin()
                    move_phase_duration = event_to_animation[event.key](event.value)
                    on_move_phase_end()
                    break
                end
                do
                    event_duration = event_to_animation[event.key](event.value)
                    if event_duration > combinate_phase_duration then
                        combinate_phase_duration = event_duration
                    end
                    break
                end
            until true
        end
        state.game_state = data.state
        is_processing = false
        EventBus.send("SET_HELPER")
        EventBus.send("ON_GAME_STEP_ANIMATION_END")
    end
    function dispatch_messages()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
        end
    end
    function on_down(item)
        if is_processing then
            return
        end
        down_item = item
    end
    function on_move(pos)
        if down_item == nil then
            return
        end
        local world_pos = Camera.screen_to_world(pos.x, pos.y)
        local selected_element_world_pos = go.get_position(down_item._hash)
        local delta = world_pos - selected_element_world_pos
        if vmath.length(delta) < min_swipe_distance then
            return
        end
        local selected_element_pos = get_field_pos(selected_element_world_pos)
        local element_to_pos = {x = selected_element_pos.x, y = selected_element_pos.y}
        local direction = vmath.normalize(delta)
        local move_direction = get_move_direction(direction)
        repeat
            local ____switch112 = move_direction
            local ____cond112 = ____switch112 == Direction.Up
            if ____cond112 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond112 = ____cond112 or ____switch112 == Direction.Down
            if ____cond112 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond112 = ____cond112 or ____switch112 == Direction.Left
            if ____cond112 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond112 = ____cond112 or ____switch112 == Direction.Right
            if ____cond112 then
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
        down_item = nil
    end
    function on_up(item)
        if down_item == nil then
            return
        end
        local item_world_pos = go.get_position(item._hash)
        local element_pos = get_field_pos(item_world_pos)
        EventBus.send("CLICK_ACTIVATION", {x = element_pos.x, y = element_pos.y})
        down_item = nil
    end
    function recalculate_cell_offset(state)
        local min_y_active_cell = field_height
        local max_y_active_cell = 0
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        if state.cells[y + 1][x + 1] ~= NotActiveCell then
                            if y < min_y_active_cell then
                                min_y_active_cell = y
                            end
                            if y > max_y_active_cell then
                                max_y_active_cell = y
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        cells_offset.y = cells_offset.y + min_y_active_cell * cell_size * 0.5
        cells_offset.y = cells_offset.y - math.abs(max_field_height - max_y_active_cell) * cell_size * 0.5
    end
    function load_field(game_state, with_anim)
        if with_anim == nil then
            with_anim = true
        end
        Log.log("LOAD FIELD_VIEW")
        state.game_state = game_state
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = state.game_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            make_substrate_view(x, y, state.game_state.cells)
                            try_make_under_cell(x, y, cell)
                            make_cell_view(x, y, cell.id, cell.uid)
                        end
                        local element = state.game_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            make_element_view(
                                x,
                                y,
                                element.type,
                                element.uid,
                                with_anim
                            )
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function reset_field()
        Log.log("RESET FIELD VIEW")
        for ____, ____value in ipairs(__TS__ObjectEntries(state.game_id_to_view_index)) do
            local sid = ____value[1]
            local index = ____value[2]
            local id = tonumber(sid)
            if id ~= nil then
                local items = get_all_view_items_by_game_id(id)
                if items ~= nil then
                    for ____, item in ipairs(items) do
                        gm.delete_item(item, true)
                    end
                end
            end
        end
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local substrate = state.substrates[y + 1][x + 1]
                        do
                            pcall(function()
                                go.delete(substrate)
                            end)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        state = {}
        state.game_id_to_view_index = {}
        state.substrates = {}
        do
            local y = 0
            while y < field_height do
                state.substrates[y + 1] = {}
                do
                    local x = 0
                    while x < field_width do
                        state.substrates[y + 1][x + 1] = 0
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function reload_field(with_anim)
        if with_anim == nil then
            with_anim = false
        end
        if state.game_state == nil then
            return
        end
        local copy_state = copy_game_state()
        reset_field()
        load_field(copy_state, with_anim)
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
                local angle = 90
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
                        state.substrates[y + 1][x + 1] = _go
                        return
                    end
                    mask = rotateMatrix(mask, angle)
                    angle = angle + 90
                end
                mask_index = mask_index + 1
            end
        end
    end
    function make_cell_view(x, y, cell_id, id, z_index)
        local pos = get_world_pos(
            x,
            y,
            z_index ~= nil and z_index or (__TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, cell_id) and GAME_CONFIG.default_top_layer_cell_z_index or GAME_CONFIG.default_cell_z_index)
        )
        local _go = gm.make_go("cell_view", pos)
        sprite.play_flipbook(
            msg.url(nil, _go, "sprite"),
            GAME_CONFIG.cell_view[cell_id]
        )
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        if cell_id == CellId.Base then
            gm.set_color_hash(_go, GAME_CONFIG.base_cell_color)
        end
        local index = gm.add_game_item({_hash = _go, is_clickable = true})
        if state.game_id_to_view_index[id] == nil then
            state.game_id_to_view_index[id] = {}
        end
        if id ~= nil then
            local ____state_game_id_to_view_index_id_6 = state.game_id_to_view_index[id]
            ____state_game_id_to_view_index_id_6[#____state_game_id_to_view_index_id_6 + 1] = index
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
            GAME_CONFIG.element_view[____type]
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
        if state.game_id_to_view_index[id] == nil then
            state.game_id_to_view_index[id] = {}
        end
        if id ~= nil then
            local ____state_game_id_to_view_index_id_7 = state.game_id_to_view_index[id]
            ____state_game_id_to_view_index_id_7[#____state_game_id_to_view_index_id_7 + 1] = index
        end
        return index
    end
    function on_swap_element_animation(message)
        local data = message
        local from_world_pos = get_world_pos(data.from.x, data.from.y)
        local to_world_pos = get_world_pos(data.to.x, data.to.y)
        local element_from = data.element_from
        local element_to = data.element_to
        state.game_state = data.state
        local item_from = get_first_view_item_by_game_id(element_from.uid)
        if item_from ~= nil then
            go.animate(
                item_from._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                to_world_pos,
                swap_element_easing,
                swap_element_time
            )
        end
        if element_to ~= NullElement then
            local item_to = get_first_view_item_by_game_id(element_to.uid)
            if item_to ~= nil then
                go.animate(
                    item_to._hash,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    from_world_pos,
                    swap_element_easing,
                    swap_element_time
                )
            end
        end
        return swap_element_time + 0.1
    end
    function on_wrong_swap_element_animation(data)
        local from_world_pos = get_world_pos(data.from.x, data.from.y)
        local to_world_pos = get_world_pos(data.to.x, data.to.y)
        local element_from = data.element_from
        local element_to = data.element_to
        is_processing = true
        local item_from = get_first_view_item_by_game_id(element_from.uid)
        if item_from ~= nil then
            go.animate(
                item_from._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                to_world_pos,
                swap_element_easing,
                swap_element_time,
                0,
                function()
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
        end
        if element_to ~= NullElement then
            local item_to = get_first_view_item_by_game_id(element_to.uid)
            if item_to ~= nil then
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
                    end
                )
            end
        end
        return spawn_element_time * 2
    end
    function on_combined_animation(message)
        local combined = message
        if combined.maked_element == nil then
            for ____, element in ipairs(combined.combination.elements) do
                damage_element_animation(message, element.x, element.y, element.uid)
            end
            for ____, cell in ipairs(combined.activated_cells) do
                local skip = false
                for ____, element in ipairs(combined.combination.elements) do
                    if cell.x == element.x and cell.y == element.y then
                        skip = true
                    end
                end
                if not skip then
                    activate_cell_animation(cell)
                end
            end
            return damaged_element_time
        end
        return combo_animation(combined)
    end
    function combo_animation(combo)
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
                                if combo.maked_element ~= nil then
                                    make_element_view(combo.maked_element.x, combo.maked_element.y, combo.maked_element.type, combo.maked_element.uid)
                                end
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
        for ____, cell in ipairs(combo.activated_cells) do
            activate_cell_animation(cell)
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
        local activated_duration = activate_diskosphere_animation(
            activation,
            function()
                for ____, cell in ipairs(activation.activated_cells) do
                    local skip = false
                    for ____, element in ipairs(activation.damaged_elements) do
                        if cell.x == element.x and cell.y == element.y then
                            skip = true
                        end
                    end
                    if not skip then
                        activate_cell_animation(cell)
                    end
                end
            end
        )
        return activated_duration
    end
    function on_swaped_diskosphere_with_buster_animation(message)
        local activation = message
        damage_element_animation(message, activation.other_element.x, activation.other_element.y, activation.other_element.uid)
        local activated_duration = activate_diskosphere_animation(
            activation,
            function()
                for ____, cell in ipairs(activation.activated_cells) do
                    local skip = false
                    for ____, element in ipairs(activation.damaged_elements) do
                        if cell.x == element.x and cell.y == element.y then
                            skip = true
                        end
                    end
                    if not skip then
                        activate_cell_animation(cell)
                    end
                end
                for ____, element in ipairs(activation.maked_elements) do
                    make_element_view(
                        element.x,
                        element.y,
                        element.type,
                        element.uid,
                        true
                    )
                end
            end
        )
        flow.delay(activated_duration + spawn_element_time)
        return 0
    end
    function on_swaped_diskospheres_animation(message)
        local activation = message
        local activate_duration = 0
        local squash_duration = squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                delete_view_item_by_game_id(activation.other_element.uid)
                activate_duration = activate_diskosphere_animation(
                    activation,
                    function()
                        for ____, cell in ipairs(activation.activated_cells) do
                            local skip = false
                            for ____, element in ipairs(activation.damaged_elements) do
                                if cell.x == element.x and cell.y == element.y then
                                    skip = true
                                end
                            end
                            if not skip then
                                activate_cell_animation(cell)
                            end
                        end
                    end
                )
            end
        )
        return squash_duration + 0.5
    end
    function on_swaped_diskosphere_with_element_animation(message)
        local activation = message
        local activate_duration = activate_diskosphere_animation(
            activation,
            function()
                for ____, cell in ipairs(activation.activated_cells) do
                    local skip = false
                    for ____, element in ipairs(activation.damaged_elements) do
                        if cell.x == element.x and cell.y == element.y then
                            skip = true
                        end
                    end
                    if not skip then
                        activate_cell_animation(cell)
                    end
                end
            end
        )
        return activate_duration
    end
    function activate_diskosphere_animation(activation, on_complete)
        delete_view_item_by_game_id(activation.element.uid)
        local pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_element_z_index + 2.1)
        local _go = gm.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        msg.post(
            msg.url(nil, _go, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, _go, "diskosphere"),
            "enable"
        )
        msg.post(
            msg.url(nil, _go, "diskosphere_light"),
            "enable"
        )
        local anim_props = {blend_duration = 0, playback_rate = 1.25}
        spine.play_anim(
            msg.url(nil, _go, "diskosphere"),
            "light_ball_intro",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function(____self, message_id, message, sender)
                if message_id == hash("spine_animation_done") then
                    local anim_props = {blend_duration = 0, playback_rate = 1.25}
                    if message.animation_id == hash("light_ball_intro") then
                        trace(
                            activation,
                            _go,
                            pos,
                            #activation.damaged_elements,
                            function()
                                spine.play_anim(
                                    msg.url(nil, _go, "diskosphere_light"),
                                    "light_ball_explosion",
                                    go.PLAYBACK_ONCE_FORWARD,
                                    anim_props
                                )
                                msg.post(
                                    msg.url(nil, _go, "diskosphere"),
                                    "disable"
                                )
                                on_complete()
                            end
                        )
                    end
                end
            end
        )
        return 0.5
    end
    function trace(activation, diskosphere, pos, counter, on_complete)
        local anim_props = {blend_duration = 0, playback_rate = 1}
        spine.play_anim(
            msg.url(nil, diskosphere, "diskosphere"),
            "light_ball_action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props
        )
        spine.play_anim(
            msg.url(nil, diskosphere, "diskosphere_light"),
            "light_ball_action_light",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props
        )
        if #activation.damaged_elements == 0 then
            return on_complete()
        end
        local projectile = gm.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            projectile
        )
        msg.post(
            msg.url(nil, projectile, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, projectile, "diskosphere_projectile"),
            "enable"
        )
        local element = activation.damaged_elements[counter + 1]
        while true do
            local ____temp_11 = element == nil
            if not ____temp_11 then
                local ____opt_9 = get_first_view_item_by_game_id(element.uid)
                ____temp_11 = (____opt_9 and ____opt_9._hash) == diskosphere
            end
            if not ____temp_11 then
                break
            end
            local ____activation_damaged_elements_8 = activation.damaged_elements
            counter = counter - 1
            element = ____activation_damaged_elements_8[counter + 1]
        end
        local target_pos = get_world_pos(element.x, element.y, GAME_CONFIG.default_element_z_index + 0.1)
        spine.set_ik_target_position(
            msg.url(nil, projectile, "diskosphere_projectile"),
            "ik_projectile_target",
            target_pos
        )
        spine.play_anim(
            msg.url(nil, projectile, "diskosphere_projectile"),
            "light_ball_projectile",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function(____self, message_id, message, sender)
                if message_id == hash("spine_animation_done") then
                    go.delete(projectile)
                    explode_element_animation(element)
                end
            end
        )
        if counter == 0 then
            return on_complete()
        end
        trace(
            activation,
            diskosphere,
            pos,
            counter - 1,
            on_complete
        )
    end
    function explode_element_animation(item)
        delete_all_view_items_by_game_id(item.uid)
        local element = state.game_state.elements[item.y + 1][item.x + 1]
        if element == NullElement then
            return
        end
        local ____type = element.id
        if not __TS__ArrayIncludes(GAME_CONFIG.base_elements, ____type) then
            return
        end
        local pos = get_world_pos(item.x, item.y, GAME_CONFIG.default_element_z_index + 0.1)
        local effect = gm.make_go("effect_view", pos)
        local effect_name = "explode"
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            effect
        )
        msg.post(
            msg.url(nil, effect, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, effect, effect_name),
            "enable"
        )
        local color = GAME_CONFIG.element_colors[____type]
        local anim_props = {blend_duration = 0, playback_rate = 1}
        spine.play_anim(
            msg.url(nil, effect, effect_name),
            color,
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function()
                go.delete(effect)
            end
        )
    end
    function on_rocket_activated_animation(message)
        local activation = message
        local activate_duration = activate_rocket_animation(
            activation,
            activation.axis,
            function()
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(message, element.x, element.y, element.uid)
                end
                for ____, cell in ipairs(activation.activated_cells) do
                    local skip = false
                    for ____, element in ipairs(activation.damaged_elements) do
                        if cell.x == element.x and cell.y == element.y then
                            skip = true
                        end
                    end
                    if not skip then
                        activate_cell_animation(cell)
                    end
                end
            end
        )
        return activate_duration + damaged_element_time
    end
    function on_swaped_rockets_animation(message)
        local activation = message
        local activate_duration = 0
        local squash_duration = squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                delete_view_item_by_game_id(activation.element.uid)
                delete_view_item_by_game_id(activation.other_element.uid)
                make_element_view(activation.element.x, activation.element.y, ElementId.AxisRocket, activation.element.uid)
                activate_duration = activate_rocket_animation(
                    activation,
                    Axis.All,
                    function()
                        for ____, element in ipairs(activation.damaged_elements) do
                            damage_element_animation(message, element.x, element.y, element.uid)
                        end
                        for ____, cell in ipairs(activation.activated_cells) do
                            local skip = false
                            for ____, element in ipairs(activation.damaged_elements) do
                                if cell.x == element.x and cell.y == element.y then
                                    skip = true
                                end
                            end
                            if not skip then
                                activate_cell_animation(cell)
                            end
                        end
                    end
                )
            end
        )
        return squash_duration + damaged_element_time
    end
    function activate_rocket_animation(activation, dir, on_fly_end)
        if activation.element.uid ~= -1 then
            delete_view_item_by_game_id(activation.element.uid)
        end
        local pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_element_z_index + 2.1)
        rocket_effect(pos, dir)
        timer.delay(0.3, false, on_fly_end)
        return 0.3
    end
    function rocket_effect(pos, dir)
        if dir == Axis.All then
            rocket_effect(pos, Axis.Vertical)
            rocket_effect(pos, Axis.Horizontal)
            return
        end
        local part0 = gm.make_go("effect_view", pos)
        local part1 = gm.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            part0
        )
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            part1
        )
        repeat
            local ____switch267 = dir
            local ____cond267 = ____switch267 == Axis.Vertical
            if ____cond267 then
                gm.set_rotation_hash(part1, 180)
                break
            end
            ____cond267 = ____cond267 or ____switch267 == Axis.Horizontal
            if ____cond267 then
                gm.set_rotation_hash(part0, 90)
                gm.set_rotation_hash(part1, -90)
                break
            end
        until true
        msg.post(
            msg.url(nil, part0, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, part1, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, part0, "rocket"),
            "enable"
        )
        msg.post(
            msg.url(nil, part1, "rocket"),
            "enable"
        )
        local anim_props = {blend_duration = 0, playback_rate = 1}
        spine.play_anim(
            msg.url(nil, part0, "rocket"),
            "action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props
        )
        spine.play_anim(
            msg.url(nil, part1, "rocket"),
            "action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props
        )
        local part0_to_world_pos = vmath.vector3(pos)
        local part1_to_world_pos = vmath.vector3(pos)
        if dir == Axis.Vertical then
            local distance = field_height * cell_size
            part0_to_world_pos.y = part0_to_world_pos.y + distance
            part1_to_world_pos.y = part1_to_world_pos.y + -distance
        end
        if dir == Axis.Horizontal then
            local distance = field_width * cell_size
            part0_to_world_pos.x = part0_to_world_pos.x + -distance
            part1_to_world_pos.x = part1_to_world_pos.x + distance
        end
        go.animate(
            part0,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            part0_to_world_pos,
            go.EASING_INCUBIC,
            0.3,
            0,
            function()
                go.delete(part0)
            end
        )
        go.animate(
            part1,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            part1_to_world_pos,
            go.EASING_INCUBIC,
            0.3,
            0,
            function()
                go.delete(part1)
            end
        )
    end
    function on_helicopter_activated_animation(message)
        local activation = message
        for ____, element in ipairs(activation.damaged_elements) do
            damage_element_animation(message, element.x, element.y, element.uid)
        end
        for ____, cell in ipairs(activation.activated_cells) do
            local skip = false
            for ____, element in ipairs(activation.damaged_elements) do
                if cell.x == element.x and cell.y == element.y then
                    skip = true
                end
            end
            if activation.target_element ~= NullElement then
                local is_target_pos = cell.x == activation.target_element.x and cell.y == activation.target_element.y
                if is_target_pos and cell.previous_id == activation.target_element.uid then
                    skip = true
                end
            end
            if not skip then
                activate_cell_animation(cell)
            end
        end
        if activation.target_element ~= NullElement then
            remove_random_element_animation(message, activation.element, activation.target_element)
            return damaged_element_time + helicopter_fly_duration + 0.2
        end
        return damage_element_animation(message, activation.element.x, activation.element.y, activation.element.uid)
    end
    function on_swaped_helicopters_animation(message)
        local activation = message
        local squash_duration = squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(message, element.x, element.y, element.uid)
                end
                local target_element = table.remove(activation.target_elements)
                if target_element ~= nil and target_element ~= NullElement then
                    remove_random_element_animation(message, activation.element, target_element)
                end
                target_element = table.remove(activation.target_elements)
                if target_element ~= nil and target_element ~= NullElement then
                    remove_random_element_animation(message, activation.other_element, target_element)
                end
                target_element = table.remove(activation.target_elements)
                if target_element ~= nil and target_element ~= NullElement then
                    make_element_view(activation.element.x, activation.element.y, ElementId.Helicopter, activation.element.uid)
                    remove_random_element_animation(message, activation.element, target_element, 1)
                end
            end
        )
        for ____, cell in ipairs(activation.activated_cells) do
            local skip = false
            for ____, element in ipairs(activation.damaged_elements) do
                if cell.x == element.x and cell.y == element.y then
                    skip = true
                end
            end
            for ____, element in ipairs(activation.target_elements) do
                if element ~= NullElement and cell.x == element.x and cell.y == element.y then
                    skip = true
                end
            end
            if not skip then
                activate_cell_animation(cell)
            end
        end
        return squash_duration + damaged_element_time + helicopter_fly_duration + 0.2
    end
    function on_swaped_helicopter_with_element_animation(message)
        local activation = message
        local squash_duration = squash_element_animation(
            activation.element,
            activation.element,
            function()
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(message, element.x, element.y, element.uid)
                end
                if activation.target_element ~= NullElement then
                    remove_random_element_animation(message, activation.element, activation.target_element)
                end
            end
        )
        for ____, cell in ipairs(activation.activated_cells) do
            local skip = false
            for ____, element in ipairs(activation.damaged_elements) do
                if cell.x == element.x and cell.y == element.y then
                    skip = true
                end
            end
            if activation.target_element ~= NullElement and cell.x == activation.target_element.x and cell.y == activation.target_element.y then
                skip = true
            end
            if not skip then
                activate_cell_animation(cell)
            end
        end
        return squash_duration + damaged_element_time + helicopter_fly_duration + 0.2
    end
    function on_dynamite_activated_animation(message)
        local activation = message
        local activate_duration = activate_dynamite_animation(
            activation,
            1,
            function()
                for ____, element in ipairs(activation.damaged_elements) do
                    damage_element_animation(message, element.x, element.y, element.uid)
                end
                dynamite_activate_cell_animation(activation.activated_cells, activation.damaged_elements)
            end
        )
        return activate_duration + damaged_element_time
    end
    function on_swaped_dynamites_animation(message)
        local activation = message
        local activate_duration = 0
        local squash_duration = squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                delete_view_item_by_game_id(activation.other_element.uid)
                activate_duration = activate_dynamite_animation(
                    activation,
                    1.5,
                    function()
                        for ____, element in ipairs(activation.damaged_elements) do
                            damage_element_animation(message, element.x, element.y, element.uid)
                        end
                        dynamite_activate_cell_animation(activation.activated_cells, activation.damaged_elements)
                    end
                )
            end
        )
        return squash_duration + activate_duration + damaged_element_time
    end
    function activate_dynamite_animation(activation, range, on_explode)
        local pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_vfx_z_index + 0.1)
        local _go = gm.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(scale_ratio * range, scale_ratio * range, 1),
            _go
        )
        msg.post(
            msg.url(nil, _go, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, _go, "dynamite"),
            "enable"
        )
        delete_view_item_by_game_id(activation.element.uid)
        local anim_props = {blend_duration = 0, playback_rate = 1.25}
        spine.play_anim(
            msg.url(nil, _go, "dynamite"),
            "action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function(____self, message_id)
                gm.delete_go(_go)
            end
        )
        local delay = 0.3
        timer.delay(delay, false, on_explode)
        return delay
    end
    function dynamite_activate_cell_animation(cells, elements)
        for ____, cell in ipairs(cells) do
            local skip = false
            for ____, element in ipairs(elements) do
                if cell.x == element.x and cell.y == element.y then
                    skip = true
                end
            end
            if not skip then
                activate_cell_animation(cell)
            end
        end
    end
    function on_element_activated_animation(message)
        local activation = message
        damage_element_animation(message, activation.x, activation.y, activation.uid)
        for ____, cell in ipairs(activation.activated_cells) do
            if cell.x == activation.x and cell.y == activation.y then
                activate_cell_animation(cell)
            end
        end
        return damaged_element_time
    end
    function activate_cell_animation(cell)
        delete_all_view_items_by_game_id(cell.previous_id)
        make_cell_view(cell.x, cell.y, cell.id, cell.uid)
        return 0
    end
    function on_move_phase_begin()
        flow.delay(combinate_phase_duration + 0.2)
        combinate_phase_duration = 0
    end
    function on_moved_elements_animation(message)
        local data = message
        local elements = data.elements
        state.game_state = data.state
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
                                    local ____delayed_row_in_column_12, ____temp_13 = delayed_row_in_column, element.points[1].to_x + 1
                                    local ____delayed_row_in_column_index_14 = ____delayed_row_in_column_12[____temp_13]
                                    ____delayed_row_in_column_12[____temp_13] = ____delayed_row_in_column_index_14 + 1
                                    local delay_factor = ____delayed_row_in_column_index_14
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
    function remove_random_element_animation(message, element, target_element, view_index, on_complited)
        local target_world_pos = get_world_pos(target_element.x, target_element.y, 3)
        local ____temp_15
        if view_index ~= nil then
            ____temp_15 = get_view_item_by_game_id_and_index(element.uid, view_index)
        else
            ____temp_15 = get_first_view_item_by_game_id(element.uid)
        end
        local item = ____temp_15
        if item == nil then
            return 0
        end
        local current_world_pos = go.get_position(item._hash)
        current_world_pos.z = 3
        go.set_position(current_world_pos, item._hash)
        go.animate(
            item._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            target_world_pos,
            go.EASING_INCUBIC,
            helicopter_fly_duration,
            0,
            function()
                damage_element_animation(message, target_element.x, target_element.y, target_element.uid)
                damage_element_animation(
                    message,
                    element.x,
                    element.y,
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
    function damage_element_animation(data, x, y, element_id, on_complite)
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
                    explode_element_animation({x = x, y = y, uid = element_id})
                    for ____, ____value in ipairs(__TS__ObjectEntries(data)) do
                        local key = ____value[1]
                        local value = ____value[2]
                        if key == "activated_cells" then
                            for ____, cell in ipairs(value) do
                                if cell.x == x and cell.y == y then
                                    activate_cell_animation(cell)
                                end
                            end
                        end
                    end
                    if on_complite ~= nil then
                        on_complite()
                    end
                end
            )
        end
        return damaged_element_time + 0.5
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
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local original_world_pos = get_world_pos(x, y)
                        local in_x = world_pos.x >= original_world_pos.x - cell_size * 0.5 and world_pos.x <= original_world_pos.x + cell_size * 0.5
                        local in_y = world_pos.y >= original_world_pos.y - cell_size * 0.5 and world_pos.y <= original_world_pos.y + cell_size * 0.5
                        if in_x and in_y then
                            return {x = x, y = y}
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return {x = -1, y = -1}
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
        local indices = state.game_id_to_view_index[id]
        if indices == nil then
            return
        end
        return gm.get_item_by_index(indices[1])
    end
    function get_view_item_by_game_id_and_index(id, index)
        local indices = state.game_id_to_view_index[id]
        if indices == nil then
            return
        end
        return gm.get_item_by_index(indices[index + 1])
    end
    function get_all_view_items_by_game_id(id)
        local indices = state.game_id_to_view_index[id]
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
            __TS__Delete(state.game_id_to_view_index, id)
            return false
        end
        update_target_by_id(id)
        gm.delete_item(item, true)
        __TS__ArraySplice(state.game_id_to_view_index[id], 0, 1)
        return true
    end
    function delete_all_view_items_by_game_id(id)
        local items = get_all_view_items_by_game_id(id)
        if items == nil then
            return false
        end
        update_target_by_id(id)
        for ____, item in ipairs(items) do
            gm.delete_item(item, true)
        end
        __TS__Delete(state.game_id_to_view_index, id)
        return true
    end
    function update_target_by_id(id)
        do
            local i = 0
            while i < #state.game_state.targets do
                local target = state.game_state.targets[i + 1]
                if __TS__ArrayIndexOf(target.uids, id) ~= -1 then
                    targets[i] = math.max(0, targets[i] - 1)
                    EventBus.send("UPDATED_TARGET", {id = i, count = targets[i]})
                end
                i = i + 1
            end
        end
    end
    function try_make_under_cell(x, y, cell)
        if cell.data ~= nil and cell.data.under_cells ~= nil then
            local depth = 0.1
            do
                local i = #cell.data.under_cells - 1
                while i >= 0 do
                    local cell_id = cell.data.under_cells[i + 1]
                    if cell_id ~= nil then
                        local z_index = (__TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, cell_id) and GAME_CONFIG.default_top_layer_cell_z_index or GAME_CONFIG.default_cell_z_index) - depth
                        make_cell_view(
                            x,
                            y,
                            cell_id,
                            cell.uid,
                            z_index
                        )
                        depth = depth + 0.1
                        if cell_id == CellId.Base then
                            break
                        end
                    end
                    i = i - 1
                end
            end
        end
    end
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
    current_level = GameStorage.get("current_level")
    level_config = GAME_CONFIG.levels[current_level + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    max_field_width = level_config.field.max_width
    max_field_height = level_config.field.max_height
    offset_border = level_config.field.offset_border
    origin_cell_size = level_config.field.cell_size
    event_to_animation = {
        ON_SWAP_ELEMENTS = on_swap_element_animation,
        ON_COMBINED = on_combined_animation,
        ON_ELEMENT_ACTIVATED = on_element_activated_animation,
        ON_ROCKET_ACTIVATED = on_rocket_activated_animation,
        ON_BUSTER_ACTIVATION = on_buster_activation_begin,
        DISKOSPHERE_ACTIVATED = on_diskisphere_activated_animation,
        SWAPED_DISKOSPHERES_ACTIVATED = on_swaped_diskospheres_animation,
        SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED = on_swaped_diskosphere_with_buster_animation,
        SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED = on_swaped_diskosphere_with_buster_animation,
        SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED = on_swaped_diskosphere_with_element_animation,
        ROCKET_ACTIVATED = on_rocket_activated_animation,
        SWAPED_ROCKETS_ACTIVATED = on_swaped_rockets_animation,
        HELICOPTER_ACTIVATED = on_helicopter_activated_animation,
        SWAPED_HELICOPTERS_ACTIVATED = on_swaped_helicopters_animation,
        SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED = on_swaped_helicopter_with_element_animation,
        DYNAMITE_ACTIVATED = on_dynamite_activated_animation,
        SWAPED_DYNAMITES_ACTIVATED = on_swaped_dynamites_animation,
        ON_MOVED_ELEMENTS = on_moved_elements_animation,
        UPDATED_CELLS_STATE = update_cells_state,
        REMOVE_TUTORIAL = remove_tutorial
    }
    gm = GoManager()
    targets = {}
    original_game_width = 540
    original_game_height = 960
    prev_game_width = original_game_width
    prev_game_height = original_game_height
    cell_size = calculate_cell_size()
    scale_ratio = calculate_scale_ratio()
    cells_offset = calculate_cell_offset()
    state = {game_state = {}, game_id_to_view_index = {}, substrates = {}}
    down_item = nil
    combinate_phase_duration = 0
    move_phase_duration = 0
    is_processing = false
    is_shuffling = false
    stop_shuffling = false
    local function init()
        Log.log("Init view")
        local scene_name = Scene.get_current_name()
        Scene.load_resource(scene_name, "background")
        if __TS__ArrayIncludes(GAME_CONFIG.animal_levels, current_level + 1) then
            Scene.load_resource(scene_name, "cat")
            Scene.load_resource(scene_name, GAME_CONFIG.level_to_animal[current_level + 1])
        end
        do
            local y = 0
            while y < field_height do
                state.substrates[y + 1] = {}
                do
                    local x = 0
                    while x < field_width do
                        state.substrates[y + 1][x + 1] = 0
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        set_events()
        dispatch_messages()
    end
    local function on_spinning_activated_animation(message)
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
    return init()
end
return ____exports
