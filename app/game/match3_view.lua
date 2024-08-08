local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__Delete = ____lualib.__TS__Delete
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local ____exports = {}
local flow = require("ludobits.m.flow")
local ____math_utils = require("utils.math_utils")
local Axis = ____math_utils.Axis
local Direction = ____math_utils.Direction
local is_neighbor = ____math_utils.is_neighbor
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
local TargetType = ____match3_game.TargetType
local ____match3_utils = require("game.match3_utils")
local get_current_level = ____match3_utils.get_current_level
local get_field_cell_size = ____match3_utils.get_field_cell_size
local get_field_height = ____match3_utils.get_field_height
local get_field_max_height = ____match3_utils.get_field_max_height
local get_field_max_width = ____match3_utils.get_field_max_width
local get_field_offset_border = ____match3_utils.get_field_offset_border
local get_field_width = ____match3_utils.get_field_width
local get_move_direction = ____match3_utils.get_move_direction
local is_animal_level = ____match3_utils.is_animal_level
local is_element = ____match3_utils.is_element
local is_tutorial_level = ____match3_utils.is_tutorial_level
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
    local recalculate_sizes, copy_game_state, calculate_cell_size, calculate_scale_ratio, calculate_cell_offset, set_events, on_load_field, set_tutorial, on_element_selected, on_element_unselected, on_set_step_helper, on_reset_step_helper, remove_tutorial, update_state, update_cells_state, set_win, set_gameover, remove_animals, on_game_step, dispatch_messages, on_down, on_move, on_up, recalculate_cell_offset, load_field, reset_field, reload_field, make_substrate_view, on_buster_activation_begin, on_move_phase_begin, on_move_phase_end, get_world_pos, get_view_item_by_uid, try_make_under_cell, make_cell_view, make_element_view, get_cell, get_element, get_field_pos, get_view_item_by_uid_and_index, get_all_view_items_by_uid, update_target_by_uid, delete_view_item_by_uid, delete_all_view_items_by_uid, on_swap_element_animation, on_wrong_swap_element_animation, combo_animation, on_diskisphere_activated_animation, on_swaped_diskosphere_with_buster_animation, on_swaped_diskospheres_animation, on_swaped_diskosphere_with_element_animation, activate_diskosphere_animation, trace_animation, explode_element_animation, on_rocket_activated_animation, on_swaped_rockets_animation, activate_rocket_animation, on_combined_animation, squash_element_animation, rocket_effect, on_helicopter_activated_animation, on_swaped_helicopters_animation, on_swaped_helicopter_with_element_animation, on_dynamite_activated_animation, on_swaped_dynamites_animation, activate_dynamite_animation, dynamite_activate_cell_animation, on_element_activated_animation, activate_cell_animation, on_moved_elements_animation, remove_random_element_animation, damage_element_animation, shuffle_animation, event_to_animation, original_game_width, original_game_height, prev_game_width, prev_game_height, view_state, down_item, selected_element_position, combinate_phase_duration, move_phase_duration
    function recalculate_sizes()
        local ltrb = Camera.get_ltrb()
        if ltrb.z == prev_game_width and ltrb.w == prev_game_height then
            return
        end
        Log.log("RESIZE VIEW")
        prev_game_width = ltrb.z
        prev_game_height = ltrb.w
        local width_ratio = math.abs(ltrb.z) / original_game_width
        local height_ratio = math.abs(ltrb.w) / original_game_height
        local changes_coff = math.min(width_ratio, height_ratio)
        local height_delta = math.abs(ltrb.w) - original_game_height
        view_state.cell_size = calculate_cell_size() * changes_coff
        view_state.scale_ratio = calculate_scale_ratio()
        view_state.cells_offset = calculate_cell_offset(height_delta, height_ratio)
        reload_field()
    end
    function copy_game_state()
        local copy_state = __TS__ObjectAssign({}, view_state.game_state)
        copy_state.cells = {}
        copy_state.elements = {}
        do
            local y = 0
            while y < get_field_height() do
                copy_state.cells[y + 1] = {}
                copy_state.elements[y + 1] = {}
                do
                    local x = 0
                    while x < get_field_width() do
                        copy_state.cells[y + 1][x + 1] = view_state.game_state.cells[y + 1][x + 1]
                        copy_state.elements[y + 1][x + 1] = view_state.game_state.elements[y + 1][x + 1]
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        copy_state.targets = __TS__ObjectAssign({}, view_state.game_state.targets)
        return copy_state
    end
    function calculate_cell_size()
        return math.floor(math.min(
            (original_game_width - get_field_offset_border() * 2) / get_field_max_width(),
            100
        ))
    end
    function calculate_scale_ratio()
        return view_state.cell_size / get_field_cell_size()
    end
    function calculate_cell_offset(height_delta, changes_coff)
        if height_delta == nil then
            height_delta = 0
        end
        if changes_coff == nil then
            changes_coff = 1
        end
        local offset_y = height_delta > 0 and -(original_game_height / 2 - get_field_max_height() / 2 * calculate_cell_size()) - height_delta / 2 + 100 or (-(original_game_height / 2 - get_field_max_height() / 2 * calculate_cell_size()) + 100) * changes_coff
        return vmath.vector3(
            original_game_width / 2 - get_field_width() / 2 * view_state.cell_size,
            offset_y,
            0
        )
    end
    function set_events()
        EventBus.on("ON_LOAD_FIELD", on_load_field, true)
        EventBus.on(
            "SET_TUTORIAL",
            function()
                if is_animal_level() and is_tutorial_level() then
                    EventBus.send("SET_ANIMAL_TUTORIAL_TIP")
                else
                    set_tutorial()
                end
            end,
            true
        )
        EventBus.on("HIDED_ANIMAL_TUTORIAL_TIP", set_tutorial, true)
        EventBus.on("ON_WRONG_SWAP_ELEMENTS", on_wrong_swap_element_animation, true)
        EventBus.on("ON_GAME_STEP", on_game_step, true)
        EventBus.on("ON_ELEMENT_SELECTED", on_element_selected, true)
        EventBus.on("ON_ELEMENT_UNSELECTED", on_element_unselected, true)
        EventBus.on("ON_SET_STEP_HELPER", on_set_step_helper, true)
        EventBus.on("ON_RESET_STEP_HELPER", on_reset_step_helper, true)
        EventBus.on("SHUFFLE", shuffle_animation, true)
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
    function on_load_field(game_state)
        recalculate_cell_offset(game_state)
        load_field(game_state)
        EventBus.send("INIT_UI")
        EventBus.send("UPDATED_STEP_COUNTER", game_state.steps)
        do
            local i = 0
            while i < #game_state.targets do
                local target = game_state.targets[i + 1]
                local amount = target.count - #target.uids
                view_state.targets[i] = amount
                EventBus.send("UPDATED_TARGET", {idx = i, amount = amount, id = target.id, type = target.type})
                i = i + 1
            end
        end
        recalculate_sizes()
        timer.delay(0.1, true, recalculate_sizes)
        EventBus.send("SET_HELPER")
    end
    function set_tutorial()
        local tutorial_data = GAME_CONFIG.tutorials_data[get_current_level() + 1]
        local bounds = tutorial_data.bounds ~= nil and tutorial_data.bounds or ({from_x = 0, from_y = 0, to_x = 0, to_y = 0})
        do
            local y = bounds.from_y
            while y < bounds.to_y do
                do
                    local x = bounds.from_x
                    while x < bounds.to_x do
                        local substrate = view_state.substrates[y + 1][x + 1]
                        local substrate_view = msg.url(nil, substrate, "sprite")
                        go.set(substrate_view, "material", resources.tutorial_sprite_material)
                        local cell = view_state.game_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            local cell_views = get_all_view_items_by_uid(cell.uid)
                            if cell_views ~= nil then
                                for ____, cell_view in ipairs(cell_views) do
                                    local cell_view_url = msg.url(nil, cell_view._hash, "sprite")
                                    go.set(cell_view_url, "material", resources.tutorial_sprite_material)
                                end
                            end
                        end
                        local element = view_state.game_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            local ____msg_url_2 = msg.url
                            local ____opt_0 = get_view_item_by_uid(element.uid)
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
    function on_element_selected(element)
        if element == nil then
            return
        end
        local item = get_view_item_by_uid(element.uid)
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
    function on_element_unselected(element)
        if element == nil then
            return
        end
        local item = get_view_item_by_uid(element.uid)
        if item == nil then
            return
        end
        go.cancel_animations(item._hash)
        go.set_position(selected_element_position, item._hash)
        EventBus.send("SET_HELPER")
    end
    function on_set_step_helper(data)
        local combined_item = get_view_item_by_uid(data.combined_element.uid)
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
            local item = get_view_item_by_uid(element.uid)
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
    function on_reset_step_helper(data)
        local combined_item = get_view_item_by_uid(data.combined_element.uid)
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
            local item = get_view_item_by_uid(element.uid)
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
    function remove_tutorial()
        EventBus.send("REMOVE_TUTORIAL")
        local tutorial_data = GAME_CONFIG.tutorials_data[get_current_level() + 1]
        local bounds = tutorial_data.bounds ~= nil and tutorial_data.bounds or ({from_x = 0, from_y = 0, to_x = 0, to_y = 0})
        do
            local y = bounds.from_y
            while y < bounds.to_y do
                do
                    local x = bounds.from_x
                    while x < bounds.to_x do
                        local substrate = view_state.substrates[y + 1][x + 1]
                        local substrate_view = msg.url(nil, substrate, "sprite")
                        go.set(substrate_view, "material", resources.default_sprite_material)
                        local cell = view_state.game_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            local cell_views = get_all_view_items_by_uid(cell.uid)
                            if cell_views ~= nil then
                                for ____, cell_view in ipairs(cell_views) do
                                    local cell_view_url = msg.url(nil, cell_view._hash, "sprite")
                                    go.set(cell_view_url, "material", resources.default_sprite_material)
                                end
                            end
                        end
                        local element = view_state.game_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            local ____msg_url_5 = msg.url
                            local ____opt_3 = get_view_item_by_uid(element.uid)
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
        do
            local i = 0
            while i < #state.targets do
                local target = state.targets[i + 1]
                local amount = target.count - #target.uids
                view_state.targets[i] = amount
                EventBus.send("UPDATED_TARGET", {idx = i, amount = amount, id = target.id, type = target.type})
                i = i + 1
            end
        end
        EventBus.send("SET_HELPER")
        return 0
    end
    function update_cells_state(message)
        local cells = message
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local current_cell = view_state.game_state.cells[y + 1][x + 1]
                        if current_cell ~= NotActiveCell then
                            local items = get_all_view_items_by_uid(current_cell.uid)
                            if items ~= nil then
                                for ____, item in ipairs(items) do
                                    view_state.go_manager.delete_item(item, true)
                                end
                            end
                            local cell = cells[y + 1][x + 1]
                            view_state.game_state.cells[y + 1][x + 1] = cell
                            if cell ~= NotActiveCell then
                                try_make_under_cell(x, y, cell)
                                make_cell_view(x, y, cell)
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
        local is_feeded = false
        do
            local i = 0
            while i < #view_state.game_state.targets do
                local target = view_state.game_state.targets[i + 1]
                if target.type == TargetType.Element and __TS__ArrayIncludes(GAME_CONFIG.feed_elements, target.id) then
                    is_feeded = true
                    EventBus.send("FEED_ANIMAL", target.id)
                end
                i = i + 1
            end
        end
        if is_feeded then
            timer.delay(
                7.5,
                false,
                function()
                    reset_field()
                    remove_animals()
                    EventBus.send("SET_WIN_UI")
                end
            )
        else
            reset_field()
            remove_animals()
            EventBus.send("SET_WIN_UI")
        end
    end
    function set_gameover()
        reset_field()
        remove_animals()
    end
    function remove_animals()
        if not __TS__ArrayIncludes(
            GAME_CONFIG.animal_levels,
            get_current_level() + 1
        ) then
            return
        end
        local scene_name = Scene.get_current_name()
        Scene.unload_resource(scene_name, "cat")
        Scene.unload_resource(
            scene_name,
            GAME_CONFIG.level_to_animal[get_current_level() + 1]
        )
    end
    function on_game_step(data)
        if data.events == nil then
            return
        end
        flow.start(function()
            view_state.is_processing = true
            local view = {state = view_state, get_world_pos = get_world_pos, get_view_item_by_uid = get_view_item_by_uid}
            for ____, event in ipairs(data.events) do
                repeat
                    local ____switch81 = event.key
                    local event_duration
                    local ____cond81 = ____switch81 == "ON_SWAP_ELEMENTS"
                    if ____cond81 then
                        flow.delay(event_to_animation[event.key](event.value))
                        break
                    end
                    ____cond81 = ____cond81 or ____switch81 == "ON_SPINNING_ACTIVATED"
                    if ____cond81 then
                        flow.delay(event_to_animation[event.key](event.value))
                        break
                    end
                    ____cond81 = ____cond81 or ____switch81 == "ON_MOVED_ELEMENTS"
                    if ____cond81 then
                        on_move_phase_begin()
                        move_phase_duration = event_to_animation[event.key](event.value)
                        on_move_phase_end(event.value)
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
            view_state.game_state = data.state
            view_state.is_processing = false
            EventBus.send("SET_HELPER")
            EventBus.send("ON_GAME_STEP_ANIMATION_END")
        end)
    end
    function dispatch_messages()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            view_state.go_manager.do_message(message_id, _message, sender)
        end
    end
    function on_down(item)
        if view_state.is_processing then
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
        if vmath.length(delta) < GAME_CONFIG.min_swipe_distance then
            return
        end
        local selected_element_pos = get_field_pos(selected_element_world_pos)
        local element_to_pos = {x = selected_element_pos.x, y = selected_element_pos.y}
        local direction = vmath.normalize(delta)
        local move_direction = get_move_direction(direction)
        repeat
            local ____switch91 = move_direction
            local ____cond91 = ____switch91 == Direction.Up
            if ____cond91 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond91 = ____cond91 or ____switch91 == Direction.Down
            if ____cond91 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond91 = ____cond91 or ____switch91 == Direction.Left
            if ____cond91 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond91 = ____cond91 or ____switch91 == Direction.Right
            if ____cond91 then
                element_to_pos.x = element_to_pos.x + 1
                break
            end
        until true
        local is_valid_x = element_to_pos.x >= 0 and element_to_pos.x < get_field_width()
        local is_valid_y = element_to_pos.y >= 0 and element_to_pos.y < get_field_height()
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
    function recalculate_cell_offset(game_state)
        local min_y_active_cell = get_field_height()
        local max_y_active_cell = 0
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        if game_state.cells[y + 1][x + 1] ~= NotActiveCell then
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
        local ____view_state_cells_offset_6, ____y_7 = view_state.cells_offset, "y"
        ____view_state_cells_offset_6[____y_7] = ____view_state_cells_offset_6[____y_7] + min_y_active_cell * view_state.cell_size * 0.5
        local ____view_state_cells_offset_8, ____y_9 = view_state.cells_offset, "y"
        ____view_state_cells_offset_8[____y_9] = ____view_state_cells_offset_8[____y_9] - math.abs(get_field_max_height() - max_y_active_cell) * view_state.cell_size * 0.5
    end
    function load_field(game_state, with_anim)
        if with_anim == nil then
            with_anim = true
        end
        Log.log("LOAD FIELD_VIEW")
        view_state.game_state = game_state
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local cell = view_state.game_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            make_substrate_view(x, y, view_state.game_state.cells)
                            try_make_under_cell(x, y, cell)
                            make_cell_view(x, y, cell)
                        end
                        local element = view_state.game_state.elements[y + 1][x + 1]
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
        for ____, ____value in ipairs(__TS__ObjectEntries(view_state.game_id_to_view_index)) do
            local uid = ____value[1]
            local index = ____value[2]
            local items = get_all_view_items_by_uid(uid)
            if items ~= nil then
                for ____, item in ipairs(items) do
                    view_state.go_manager.delete_item(item, true)
                end
            end
        end
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local substrate = view_state.substrates[y + 1][x + 1]
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
        view_state.game_id_to_view_index = {}
        view_state.substrates = {}
        do
            local y = 0
            while y < get_field_height() do
                view_state.substrates[y + 1] = {}
                do
                    local x = 0
                    while x < get_field_width() do
                        view_state.substrates[y + 1][x + 1] = 0
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
        if view_state.game_state == nil then
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
                        local _go = view_state.go_manager.make_go("substrate_view", pos)
                        view_state.go_manager.set_rotation_hash(_go, -angle)
                        sprite.play_flipbook(
                            msg.url(nil, _go, "sprite"),
                            GAME_CONFIG.substrate_view[mask_index]
                        )
                        go.set_scale(
                            vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
                            _go
                        )
                        view_state.substrates[y + 1][x + 1] = _go
                        return
                    end
                    mask = rotateMatrix(mask, 90)
                    angle = angle + 90
                end
                mask_index = mask_index + 1
            end
        end
    end
    function on_buster_activation_begin(message)
        flow.delay(combinate_phase_duration + 0.2)
        combinate_phase_duration = 0
        return 0
    end
    function on_move_phase_begin()
        flow.delay(combinate_phase_duration + 0.2)
        combinate_phase_duration = 0
    end
    function on_move_phase_end(message)
        local data = message
        flow.delay(move_phase_duration + 0.3)
        view_state.game_state = data.state
        move_phase_duration = 0
    end
    function get_world_pos(x, y, z)
        if z == nil then
            z = 0
        end
        return vmath.vector3(view_state.cells_offset.x + view_state.cell_size * x + view_state.cell_size * 0.5, view_state.cells_offset.y - view_state.cell_size * y - view_state.cell_size * 0.5, z)
    end
    function get_view_item_by_uid(uid)
        local indices = view_state.game_id_to_view_index[uid]
        if indices == nil then
            return
        end
        return view_state.go_manager.get_item_by_index(indices[1])
    end
    function try_make_under_cell(x, y, cell)
        if cell.data ~= nil and cell.data.under_cells ~= nil then
            local depth = 0.1
            do
                local i = #cell.data.under_cells - 1
                while i >= 0 do
                    local cell_id = cell.data.under_cells[i + 1]
                    if cell_id ~= nil then
                        if cell_id == CellId.Base then
                            local z_index = (__TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, cell_id) and GAME_CONFIG.default_top_layer_cell_z_index or GAME_CONFIG.default_cell_z_index) - depth
                            make_cell_view(
                                x,
                                y,
                                cell,
                                cell_id,
                                z_index
                            )
                            depth = depth + 0.1
                            break
                        end
                    end
                    i = i - 1
                end
            end
        end
    end
    function make_cell_view(x, y, cell, cell_id, z_index)
        local pos = get_world_pos(
            x,
            y,
            z_index ~= nil and z_index or (__TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, cell.id) and GAME_CONFIG.default_top_layer_cell_z_index or GAME_CONFIG.default_cell_z_index)
        )
        local _go = view_state.go_manager.make_go("cell_view", pos)
        local id = cell_id ~= nil and cell_id or cell.id
        print(x, y, cell_id, cell.id)
        local view = ""
        if __TS__ArrayIsArray(GAME_CONFIG.cell_view[id]) then
            local index = cell.activations ~= nil and cell.activations or (cell.near_activations ~= nil and cell.near_activations or 1)
            print(x, y, index)
            view = GAME_CONFIG.cell_view[id][index]
        else
            view = GAME_CONFIG.cell_view[id]
        end
        print(x, y, view)
        sprite.play_flipbook(
            msg.url(nil, _go, "sprite"),
            view
        )
        go.set_scale(
            vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
            _go
        )
        if id == CellId.Base then
            view_state.go_manager.set_color_hash(_go, GAME_CONFIG.base_cell_color)
        end
        local index = view_state.go_manager.add_game_item({_hash = _go, is_clickable = true})
        if view_state.game_id_to_view_index[cell.uid] == nil then
            view_state.game_id_to_view_index[cell.uid] = {}
        end
        local ____view_state_game_id_to_view_index_cell_uid_10 = view_state.game_id_to_view_index[cell.uid]
        ____view_state_game_id_to_view_index_cell_uid_10[#____view_state_game_id_to_view_index_cell_uid_10 + 1] = index
        return index
    end
    function make_element_view(x, y, ____type, uid, spawn_anim, z_index)
        if spawn_anim == nil then
            spawn_anim = false
        end
        if z_index == nil then
            z_index = GAME_CONFIG.default_element_z_index
        end
        local pos = get_world_pos(x, y, z_index)
        local _go = view_state.go_manager.make_go("element_view", pos)
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
                vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
                GAME_CONFIG.spawn_element_easing,
                GAME_CONFIG.spawn_element_time
            )
        else
            go.set_scale(
                vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
                _go
            )
        end
        local index = view_state.go_manager.add_game_item({_hash = _go, is_clickable = true})
        if view_state.game_id_to_view_index[uid] == nil then
            view_state.game_id_to_view_index[uid] = {}
        end
        if uid ~= nil then
            local ____view_state_game_id_to_view_index_uid_11 = view_state.game_id_to_view_index[uid]
            ____view_state_game_id_to_view_index_uid_11[#____view_state_game_id_to_view_index_uid_11 + 1] = index
        end
        return index
    end
    function get_cell(x, y)
        return view_state.game_state.cells[y + 1][x + 1]
    end
    function get_element(x, y)
        return view_state.game_state.elements[y + 1][x + 1]
    end
    function get_field_pos(world_pos)
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local original_world_pos = get_world_pos(x, y)
                        local in_x = world_pos.x >= original_world_pos.x - view_state.cell_size * 0.5 and world_pos.x <= original_world_pos.x + view_state.cell_size * 0.5
                        local in_y = world_pos.y >= original_world_pos.y - view_state.cell_size * 0.5 and world_pos.y <= original_world_pos.y + view_state.cell_size * 0.5
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
    function get_view_item_by_uid_and_index(uid, index)
        local indices = view_state.game_id_to_view_index[uid]
        if indices == nil then
            return
        end
        return view_state.go_manager.get_item_by_index(indices[index + 1])
    end
    function get_all_view_items_by_uid(uid)
        local indices = view_state.game_id_to_view_index[uid]
        if indices == nil then
            return
        end
        local items = {}
        for ____, index in ipairs(indices) do
            items[#items + 1] = view_state.go_manager.get_item_by_index(index)
        end
        return items
    end
    function update_target_by_uid(uid)
        do
            local i = 0
            while i < #view_state.game_state.targets do
                local target = view_state.game_state.targets[i + 1]
                if __TS__ArrayIndexOf(target.uids, uid) ~= -1 then
                    view_state.targets[i] = math.max(0, view_state.targets[i] - 1)
                    EventBus.send("UPDATED_TARGET", {idx = i, amount = view_state.targets[i], id = target.id, type = target.type})
                end
                i = i + 1
            end
        end
    end
    function delete_view_item_by_uid(uid)
        local item = get_view_item_by_uid(uid)
        if item == nil then
            __TS__Delete(view_state.game_id_to_view_index, uid)
            return false
        end
        update_target_by_uid(uid)
        view_state.go_manager.delete_item(item, true)
        __TS__ArraySplice(view_state.game_id_to_view_index[uid], 0, 1)
        return true
    end
    function delete_all_view_items_by_uid(uid)
        local items = get_all_view_items_by_uid(uid)
        if items == nil then
            return false
        end
        update_target_by_uid(uid)
        for ____, item in ipairs(items) do
            view_state.go_manager.delete_item(item, true)
        end
        __TS__Delete(view_state.game_id_to_view_index, uid)
        return true
    end
    function on_swap_element_animation(message)
        local data = message
        local from_world_pos = get_world_pos(data.from.x, data.from.y)
        local to_world_pos = get_world_pos(data.to.x, data.to.y)
        local element_from = data.element_from
        local element_to = data.element_to
        view_state.game_state = data.state
        local item_from = get_view_item_by_uid(element_from.uid)
        if item_from ~= nil then
            go.animate(
                item_from._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                to_world_pos,
                GAME_CONFIG.spawn_element_easing,
                GAME_CONFIG.swap_element_time
            )
        end
        if element_to ~= NullElement then
            local item_to = get_view_item_by_uid(element_to.uid)
            if item_to ~= nil then
                go.animate(
                    item_to._hash,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    from_world_pos,
                    GAME_CONFIG.spawn_element_easing,
                    GAME_CONFIG.swap_element_time
                )
            end
        end
        return GAME_CONFIG.swap_element_time + 0.1
    end
    function on_wrong_swap_element_animation(message)
        local data = message
        flow.start(function()
            local from_world_pos = get_world_pos(data.from.x, data.from.y)
            local to_world_pos = get_world_pos(data.to.x, data.to.y)
            local element_from = data.element_from
            local element_to = data.element_to
            view_state.is_processing = true
            local item_from = get_view_item_by_uid(element_from.uid)
            if item_from ~= nil then
                go.animate(
                    item_from._hash,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    to_world_pos,
                    GAME_CONFIG.swap_element_easing,
                    GAME_CONFIG.swap_element_time,
                    0,
                    function()
                        go.animate(
                            item_from._hash,
                            "position",
                            go.PLAYBACK_ONCE_FORWARD,
                            from_world_pos,
                            GAME_CONFIG.swap_element_easing,
                            GAME_CONFIG.swap_element_time,
                            0,
                            function()
                                view_state.is_processing = false
                            end
                        )
                    end
                )
            end
            if element_to ~= NullElement then
                local item_to = get_view_item_by_uid(element_to.uid)
                if item_to ~= nil then
                    go.animate(
                        item_to._hash,
                        "position",
                        go.PLAYBACK_ONCE_FORWARD,
                        from_world_pos,
                        GAME_CONFIG.swap_element_easing,
                        GAME_CONFIG.swap_element_time,
                        0,
                        function()
                            go.animate(
                                item_to._hash,
                                "position",
                                go.PLAYBACK_ONCE_FORWARD,
                                to_world_pos,
                                GAME_CONFIG.swap_element_easing,
                                GAME_CONFIG.swap_element_time
                            )
                        end
                    )
                end
            end
        end)
        return GAME_CONFIG.spawn_element_time * 2
    end
    function combo_animation(combo)
        local target_element_world_pos = get_world_pos(combo.combined_element.x, combo.combined_element.y)
        do
            local i = 0
            while i < #combo.combination.elements do
                local element = combo.combination.elements[i + 1]
                local item = get_view_item_by_uid(element.uid)
                if item ~= nil then
                    if i == #combo.combination.elements - 1 then
                        go.animate(
                            item._hash,
                            "position",
                            go.PLAYBACK_ONCE_FORWARD,
                            target_element_world_pos,
                            GAME_CONFIG.squash_element_easing,
                            GAME_CONFIG.squash_element_time,
                            0,
                            function()
                                delete_view_item_by_uid(element.uid)
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
                            GAME_CONFIG.squash_element_easing,
                            GAME_CONFIG.squash_element_time,
                            0,
                            function() return delete_view_item_by_uid(element.uid) end
                        )
                    end
                end
                i = i + 1
            end
        end
        for ____, cell in ipairs(combo.activated_cells) do
            activate_cell_animation(cell)
        end
        return GAME_CONFIG.squash_element_time
    end
    function on_diskisphere_activated_animation(message)
        local activation = message
        local activated_duration = activate_diskosphere_animation(activation)
        return activated_duration
    end
    function on_swaped_diskosphere_with_buster_animation(message)
        local activation = message
        damage_element_animation(message, activation.other_element.x, activation.other_element.y, activation.other_element.uid)
        local activated_duration = activate_diskosphere_animation(
            activation,
            function()
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
        flow.delay(activated_duration + GAME_CONFIG.spawn_element_time)
        return 0
    end
    function on_swaped_diskospheres_animation(message)
        local activation = message
        local activate_duration = 0
        local squash_duration = squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                delete_view_item_by_uid(activation.other_element.uid)
                activate_duration = activate_diskosphere_animation(activation)
            end
        )
        return squash_duration + 0.5
    end
    function on_swaped_diskosphere_with_element_animation(message)
        local activation = message
        local activate_duration = activate_diskosphere_animation(activation)
        return activate_duration
    end
    function activate_diskosphere_animation(activation, on_complete)
        delete_view_item_by_uid(activation.element.uid)
        local pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_element_z_index + 2.1)
        local _go = view_state.go_manager.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
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
                        trace_animation(
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
                                if on_complete ~= nil then
                                    on_complete()
                                end
                            end
                        )
                    end
                end
            end
        )
        return 1
    end
    function trace_animation(activation, diskosphere, pos, counter, on_complete)
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
        local projectile = view_state.go_manager.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
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
            local ____temp_15 = element == nil
            if not ____temp_15 then
                local ____opt_13 = get_view_item_by_uid(element.uid)
                ____temp_15 = (____opt_13 and ____opt_13._hash) == diskosphere
            end
            if not ____temp_15 then
                break
            end
            local ____activation_damaged_elements_12 = activation.damaged_elements
            counter = counter - 1
            element = ____activation_damaged_elements_12[counter + 1]
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
                    local cell = activation.activated_cells[__TS__ArrayFindIndex(
                        activation.activated_cells,
                        function(____, item)
                            return item.x == element.x and item.y == element.y
                        end
                    ) + 1]
                    if cell ~= nil then
                        activate_cell_animation(cell)
                    end
                end
            end
        )
        if counter == 0 then
            return on_complete()
        end
        trace_animation(
            activation,
            diskosphere,
            pos,
            counter - 1,
            on_complete
        )
    end
    function explode_element_animation(item)
        delete_all_view_items_by_uid(item.uid)
        local element = view_state.game_state.elements[item.y + 1][item.x + 1]
        if element == NullElement then
            return
        end
        local ____type = element.type
        if __TS__ArrayIncludes(GAME_CONFIG.buster_elements, ____type) then
            return
        end
        local pos = get_world_pos(item.x, item.y, GAME_CONFIG.default_element_z_index + 0.1)
        local effect = view_state.go_manager.make_go("effect_view", pos)
        local effect_name = "explode"
        go.set_scale(
            vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
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
        return activate_duration + GAME_CONFIG.damaged_element_time
    end
    function on_swaped_rockets_animation(message)
        local activation = message
        local activate_duration = 0
        local squash_duration = squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                delete_view_item_by_uid(activation.element.uid)
                delete_view_item_by_uid(activation.other_element.uid)
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
        return squash_duration + GAME_CONFIG.damaged_element_time
    end
    function activate_rocket_animation(activation, dir, on_fly_end)
        if activation.element.uid ~= "" then
            delete_view_item_by_uid(activation.element.uid)
        end
        local pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_element_z_index + 2.1)
        rocket_effect(pos, dir)
        timer.delay(0.3, false, on_fly_end)
        return 0.3
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
            return GAME_CONFIG.damaged_element_time
        end
        return combo_animation(combined)
    end
    function squash_element_animation(element, target_element, on_complite)
        local to_world_pos = get_world_pos(target_element.x, target_element.y)
        local item = get_view_item_by_uid(element.uid)
        if item == nil then
            return 0
        end
        go.animate(
            item._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            to_world_pos,
            GAME_CONFIG.swap_element_easing,
            GAME_CONFIG.swap_element_time,
            0,
            function()
                if on_complite ~= nil then
                    on_complite()
                end
            end
        )
        return GAME_CONFIG.swap_element_time
    end
    function rocket_effect(pos, dir)
        if dir == Axis.All then
            rocket_effect(pos, Axis.Vertical)
            rocket_effect(pos, Axis.Horizontal)
            return
        end
        local part0 = view_state.go_manager.make_go("effect_view", pos)
        local part1 = view_state.go_manager.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
            part0
        )
        go.set_scale(
            vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
            part1
        )
        repeat
            local ____switch258 = dir
            local ____cond258 = ____switch258 == Axis.Vertical
            if ____cond258 then
                view_state.go_manager.set_rotation_hash(part1, 180)
                break
            end
            ____cond258 = ____cond258 or ____switch258 == Axis.Horizontal
            if ____cond258 then
                view_state.go_manager.set_rotation_hash(part0, 90)
                view_state.go_manager.set_rotation_hash(part1, -90)
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
            local distance = get_field_height() * view_state.cell_size
            part0_to_world_pos.y = part0_to_world_pos.y + distance
            part1_to_world_pos.y = part1_to_world_pos.y + -distance
        end
        if dir == Axis.Horizontal then
            local distance = get_field_width() * view_state.cell_size
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
        print(
            "ACTIVATED: ",
            activation.element.x,
            activation.element.y,
            activation.element.uid,
            #activation.activated_cells
        )
        local activated = {}
        for ____, cell_info in ipairs(activation.activated_cells) do
            local previous_cell = get_cell(cell_info.x, cell_info.y)
            if previous_cell ~= NotActiveCell then
                local skip = false
                for ____, item in ipairs(activation.damaged_elements) do
                    local element = get_element(item.x, item.y)
                    if element ~= NullElement and cell_info.x == item.x and cell_info.y == item.y then
                        skip = true
                    end
                end
                print(activation.element.uid, activation.target_item)
                if activation.target_item ~= NullElement then
                    local is_target_pos = cell_info.x == activation.target_item.x and cell_info.y == activation.target_item.y
                    local is_not_neighbour = not is_neighbor(cell_info.x, cell_info.y, activation.element.x, activation.element.y)
                    local was_activated = __TS__ArrayIncludes(
                        activated,
                        cell_info.y * get_field_width() + cell_info.x
                    )
                    print(
                        activation.element.uid,
                        cell_info.x,
                        cell_info.y,
                        is_target_pos,
                        is_not_neighbour,
                        was_activated
                    )
                    if is_target_pos and (is_element(activation.target_item) or is_not_neighbour or was_activated) then
                        skip = true
                    end
                end
                if not skip then
                    activated[#activated + 1] = cell_info.y * get_field_width() + cell_info.x
                    activate_cell_animation(cell_info)
                end
            end
        end
        if activation.target_item ~= NullElement then
            remove_random_element_animation(message, activation.element, activation.target_item)
            return GAME_CONFIG.damaged_element_time + GAME_CONFIG.helicopter_spin_duration * 0.5 + GAME_CONFIG.helicopter_fly_duration
        end
        return damage_element_animation(message, activation.element.x, activation.element.y, activation.element.uid)
    end
    function on_swaped_helicopters_animation(message)
        local data = message
        local squash_duration = squash_element_animation(
            data.other_element,
            data.element,
            function()
                for ____, element in ipairs(data.damaged_elements) do
                    damage_element_animation(message, element.x, element.y, element.uid)
                end
                local target_element = data.target_items[1]
                if target_element ~= nil and target_element ~= NullElement then
                    remove_random_element_animation(message, data.element, target_element)
                else
                    delete_all_view_items_by_uid(data.element.uid)
                end
                target_element = data.target_items[2]
                if target_element ~= nil and target_element ~= NullElement then
                    remove_random_element_animation(message, data.other_element, target_element)
                else
                    delete_all_view_items_by_uid(data.other_element.uid)
                end
                target_element = data.target_items[3]
                if target_element ~= nil and target_element ~= NullElement then
                    make_element_view(data.element.x, data.element.y, ElementId.Helicopter, data.element.uid)
                    remove_random_element_animation(message, data.element, target_element, 1)
                end
            end
        )
        local activated = {}
        for ____, cell_info in ipairs(data.activated_cells) do
            local previous_cell = get_cell(cell_info.x, cell_info.y)
            if previous_cell ~= NotActiveCell then
                local skip = false
                for ____, item in ipairs(data.damaged_elements) do
                    local element = get_element(item.x, item.y)
                    if element ~= NullElement and cell_info.x == item.x and cell_info.y == item.y then
                        skip = true
                    end
                end
                for ____, item in ipairs(data.target_items) do
                    if item ~= NullElement then
                        local is_target_pos = cell_info.x == item.x and cell_info.y == item.y
                        local is_not_neighbour = not is_neighbor(cell_info.x, cell_info.y, data.element.x, data.element.y)
                        local was_activated = __TS__ArrayIncludes(
                            activated,
                            cell_info.y * get_field_width() + cell_info.x
                        )
                        if is_target_pos and (is_element(item) or is_not_neighbour or was_activated) then
                            skip = true
                        end
                    end
                end
                if not skip then
                    activated[#activated + 1] = cell_info.y * get_field_width() + cell_info.x
                    activate_cell_animation(cell_info)
                end
            end
        end
        return squash_duration + GAME_CONFIG.damaged_element_time + GAME_CONFIG.helicopter_spin_duration * 0.5 + GAME_CONFIG.helicopter_fly_duration
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
                if activation.target_item ~= NullElement then
                    remove_random_element_animation(message, activation.element, activation.target_item)
                end
            end
        )
        local activated = {}
        for ____, cell_info in ipairs(activation.activated_cells) do
            local previous_cell = get_cell(cell_info.x, cell_info.y)
            if previous_cell ~= NotActiveCell then
                local skip = false
                for ____, item in ipairs(activation.damaged_elements) do
                    local element = get_element(item.x, item.y)
                    if element ~= NullElement and cell_info.x == item.x and cell_info.y == item.y then
                        skip = true
                        break
                    end
                end
                if activation.target_item ~= NullElement then
                    local is_target_pos = cell_info.x == activation.target_item.x and cell_info.y == activation.target_item.y
                    local is_not_neighbour = not is_neighbor(cell_info.x, cell_info.y, activation.element.x, activation.element.y)
                    local was_activated = __TS__ArrayIncludes(
                        activated,
                        cell_info.y * get_field_width() + cell_info.x
                    )
                    if is_target_pos and (is_element(activation.target_item) or is_not_neighbour or was_activated) then
                        skip = true
                    end
                end
                if not skip then
                    activated[#activated + 1] = cell_info.y * get_field_width() + cell_info.x
                    activate_cell_animation(cell_info)
                end
            end
        end
        return squash_duration + GAME_CONFIG.damaged_element_time + GAME_CONFIG.helicopter_spin_duration * 0.5 + GAME_CONFIG.helicopter_fly_duration
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
        return activate_duration + GAME_CONFIG.damaged_element_time
    end
    function on_swaped_dynamites_animation(message)
        local activation = message
        local activate_duration = 0
        local squash_duration = squash_element_animation(
            activation.other_element,
            activation.element,
            function()
                delete_view_item_by_uid(activation.other_element.uid)
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
        return squash_duration + activate_duration + GAME_CONFIG.damaged_element_time
    end
    function activate_dynamite_animation(activation, range, on_explode)
        local pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_vfx_z_index + 0.1)
        local _go = view_state.go_manager.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(view_state.scale_ratio * range, view_state.scale_ratio * range, 1),
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
        delete_view_item_by_uid(activation.element.uid)
        local anim_props = {blend_duration = 0, playback_rate = 1.25}
        spine.play_anim(
            msg.url(nil, _go, "dynamite"),
            "action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function(____self, message_id)
                view_state.go_manager.delete_go(_go)
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
        local time = damage_element_animation(message, activation.x, activation.y, activation.uid)
        if time == 0 then
            for ____, cell in ipairs(activation.activated_cells) do
                if cell.x == activation.x and cell.y == activation.y then
                    activate_cell_animation(cell)
                end
            end
        end
        return GAME_CONFIG.damaged_element_time
    end
    function activate_cell_animation(activation)
        local previous_cell = get_cell(activation.x, activation.y)
        if previous_cell == NotActiveCell then
            return
        end
        delete_all_view_items_by_uid(previous_cell.uid)
        try_make_under_cell(activation.x, activation.y, activation.cell)
        make_cell_view(activation.x, activation.y, activation.cell)
        local ____type = previous_cell.id
        if not __TS__ArrayIncludes(GAME_CONFIG.explodable_cells, ____type) then
            return 0
        end
        local pos = get_world_pos(
            activation.x,
            activation.y,
            (__TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, ____type) and GAME_CONFIG.default_top_layer_cell_z_index or GAME_CONFIG.default_cell_z_index) + 0.1
        )
        local effect = view_state.go_manager.make_go("effect_view", pos)
        local view = ""
        if __TS__ArrayIsArray(GAME_CONFIG.cell_view[____type]) then
            view = GAME_CONFIG.cell_view[____type][#GAME_CONFIG.cell_view[____type]]
        else
            view = GAME_CONFIG.cell_view[____type]
        end
        local effect_name = view .. "_explode"
        msg.post(
            msg.url(nil, effect, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, effect, effect_name),
            "enable"
        )
        go.set_scale(
            vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1),
            effect
        )
        local anim_props = {blend_duration = 0, playback_rate = 1}
        local anim_name = ""
        if ____type == CellId.Grass then
            anim_name = "1"
        else
            anim_name = previous_cell.activations ~= nil and tostring(previous_cell.activations) or tostring(previous_cell.near_activations)
        end
        spine.play_anim(
            msg.url(nil, effect, effect_name),
            anim_name,
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function()
                go.delete(effect)
            end
        )
        return 0
    end
    function on_moved_elements_animation(message)
        local data = message
        local elements = data.elements
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
                            local item_from = get_view_item_by_uid(element.data.uid)
                            if item_from ~= nil then
                                local to_world_pos = get_world_pos(point.to_x, point.to_y)
                                if point.type == MoveType.Requested then
                                    local j = delayed_row_in_column[element.points[1].to_x + 1] ~= nil and delayed_row_in_column[element.points[1].to_x + 1] or 0
                                    view_state.go_manager.set_position_xy(item_from, to_world_pos.x, 0 + view_state.cell_size * j)
                                end
                                local move_duration = 0
                                if animation == nil then
                                    anim_pos.x = go.get(item_from._hash, "position.x")
                                    anim_pos.y = go.get(item_from._hash, "position.y")
                                    if delayed_row_in_column[element.points[1].to_x + 1] == nil then
                                        delayed_row_in_column[element.points[1].to_x + 1] = 0
                                    end
                                    local ____delayed_row_in_column_16, ____temp_17 = delayed_row_in_column, element.points[1].to_x + 1
                                    local ____delayed_row_in_column_index_18 = ____delayed_row_in_column_16[____temp_17]
                                    ____delayed_row_in_column_16[____temp_17] = ____delayed_row_in_column_index_18 + 1
                                    local delay_factor = ____delayed_row_in_column_index_18
                                    delay = delay_factor * GAME_CONFIG.duration_of_movement_between_cells
                                    if delay > max_delay then
                                        max_delay = delay
                                    end
                                    if GAME_CONFIG.movement_to_point then
                                        local diagonal = math.sqrt(math.pow(view_state.cell_size, 2) + math.pow(view_state.cell_size, 2))
                                        local delta = diagonal / view_state.cell_size
                                        local distance_beetwen_cells = point.type == MoveType.Filled and diagonal or view_state.cell_size
                                        local time = point.type == MoveType.Filled and GAME_CONFIG.duration_of_movement_between_cells * delta or GAME_CONFIG.duration_of_movement_between_cells
                                        local v = to_world_pos - vmath.vector3(anim_pos.x, anim_pos.y, 0)
                                        local l = math.sqrt(math.pow(v.x, 2) + math.pow(v.y, 2))
                                        move_duration = time * (l / distance_beetwen_cells)
                                    else
                                        local diagonal = math.sqrt(math.pow(view_state.cell_size, 2) + math.pow(view_state.cell_size, 2))
                                        local delta = diagonal / view_state.cell_size
                                        local time = point.type == MoveType.Filled and GAME_CONFIG.duration_of_movement_between_cells * delta or GAME_CONFIG.duration_of_movement_between_cells
                                        move_duration = time
                                    end
                                    animation = animator:to(anim_pos, move_duration, {x = to_world_pos.x, y = to_world_pos.y}):delay(delay):ease("linear"):onupdate(function()
                                        go.set(item_from._hash, "position.x", anim_pos.x)
                                        go.set(item_from._hash, "position.y", anim_pos.y)
                                    end)
                                else
                                    if GAME_CONFIG.movement_to_point then
                                        local previous_point = element.points[p]
                                        local current_world_pos = get_world_pos(previous_point.to_x, previous_point.to_y)
                                        local diagonal = math.sqrt(math.pow(view_state.cell_size, 2) + math.pow(view_state.cell_size, 2))
                                        local delta = diagonal / view_state.cell_size
                                        local distance_beetwen_cells = point.type == MoveType.Filled and diagonal or view_state.cell_size
                                        local time = point.type == MoveType.Filled and GAME_CONFIG.duration_of_movement_between_cells * delta or GAME_CONFIG.duration_of_movement_between_cells
                                        local v = to_world_pos - current_world_pos
                                        local l = math.sqrt(math.pow(v.x, 2) + math.pow(v.y, 2))
                                        move_duration = time * (l / distance_beetwen_cells)
                                    else
                                        local diagonal = math.sqrt(math.pow(view_state.cell_size, 2) + math.pow(view_state.cell_size, 2))
                                        local delta = diagonal / view_state.cell_size
                                        local time = point.type == MoveType.Filled and GAME_CONFIG.duration_of_movement_between_cells * delta or GAME_CONFIG.duration_of_movement_between_cells
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
    function remove_random_element_animation(message, element, target_element, view_index, on_complited)
        local target_world_pos = get_world_pos(target_element.x, target_element.y, 3)
        local ____temp_19
        if view_index ~= nil then
            ____temp_19 = get_view_item_by_uid_and_index(element.uid, view_index)
        else
            ____temp_19 = get_view_item_by_uid(element.uid)
        end
        local item = ____temp_19
        if item == nil then
            return 0
        end
        local current_world_pos = go.get_position(item._hash)
        current_world_pos.z = 3
        go.set_position(current_world_pos, item._hash)
        go.animate(
            item._hash,
            "euler.z",
            go.PLAYBACK_ONCE_FORWARD,
            720,
            go.EASING_INCUBIC,
            GAME_CONFIG.helicopter_spin_duration
        )
        go.animate(
            item._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            target_world_pos,
            go.EASING_INCUBIC,
            GAME_CONFIG.helicopter_fly_duration,
            GAME_CONFIG.helicopter_spin_duration * 0.5,
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
        return GAME_CONFIG.helicopter_spin_duration + GAME_CONFIG.helicopter_fly_duration + GAME_CONFIG.damaged_element_time
    end
    function damage_element_animation(message, x, y, uid, on_complite)
        local element_view_item = get_view_item_by_uid(uid)
        if element_view_item ~= nil then
            explode_element_animation({x = x, y = y, uid = uid})
            for ____, ____value in ipairs(__TS__ObjectEntries(message)) do
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
            return 0.5
        end
        return 0
    end
    function shuffle_animation(message)
        local game_state = message
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local element = game_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            local element_view = get_view_item_by_uid(element.uid)
                            if element_view ~= nil then
                                local to_world_pos = get_world_pos(x, y, GAME_CONFIG.default_element_z_index)
                                go.animate(
                                    element_view._hash,
                                    "position",
                                    go.PLAYBACK_ONCE_FORWARD,
                                    to_world_pos,
                                    GAME_CONFIG.swap_element_easing,
                                    0.5
                                )
                            else
                                make_element_view(
                                    x,
                                    y,
                                    element.type,
                                    element.uid,
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
        return 0.5
    end
    event_to_animation = {
        ON_SWAP_ELEMENTS = on_swap_element_animation,
        ON_WRONG_SWAP_ELEMENTS = on_wrong_swap_element_animation,
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
        REMOVE_TUTORIAL = remove_tutorial,
        SHUFFLE = shuffle_animation
    }
    original_game_width = 540
    original_game_height = 960
    prev_game_width = original_game_width
    prev_game_height = original_game_height
    view_state = {}
    view_state.is_processing = false
    view_state.go_manager = GoManager()
    view_state.cell_size = calculate_cell_size()
    view_state.scale_ratio = calculate_scale_ratio()
    view_state.cells_offset = calculate_cell_offset()
    view_state.game_state = {}
    view_state.game_id_to_view_index = {}
    view_state.substrates = {}
    view_state.targets = {}
    down_item = nil
    combinate_phase_duration = 0
    move_phase_duration = 0
    local function init()
        Log.log("Init view")
        local scene_name = Scene.get_current_name()
        Scene.load_resource(scene_name, "background")
        if __TS__ArrayIncludes(
            GAME_CONFIG.animal_levels,
            get_current_level() + 1
        ) then
            Scene.load_resource(scene_name, "cat")
            Scene.load_resource(
                scene_name,
                GAME_CONFIG.level_to_animal[get_current_level() + 1]
            )
        end
        do
            local y = 0
            while y < get_field_height() do
                view_state.substrates[y + 1] = {}
                do
                    local x = 0
                    while x < get_field_width() do
                        view_state.substrates[y + 1][x + 1] = 0
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        set_events()
        dispatch_messages()
    end
    return init()
end
return ____exports
