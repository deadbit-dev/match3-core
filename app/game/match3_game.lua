local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayPush = ____lualib.__TS__ArrayPush
local __TS__ArrayEntries = ____lualib.__TS__ArrayEntries
local __TS__Iterator = ____lualib.__TS__Iterator
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local ____exports = {}
local flow = require("ludobits.m.flow")
local ____math_utils = require("utils.math_utils")
local Axis = ____math_utils.Axis
local is_valid_pos = ____math_utils.is_valid_pos
local ____game_config = require("main.game_config")
local CellId = ____game_config.CellId
local ElementId = ____game_config.ElementId
local ____match3_core = require("game.match3_core")
local Field = ____match3_core.Field
local NullElement = ____match3_core.NullElement
local NotActiveCell = ____match3_core.NotActiveCell
local CombinationType = ____match3_core.CombinationType
local ProcessMode = ____match3_core.ProcessMode
local CellType = ____match3_core.CellType
____exports.RandomElement = -2
function ____exports.Game()
    local set_element_types, set_element_chances, set_busters, set_events, load_field, on_game_timer_tick, load_cell, load_element, make_cell, make_element, set_helper, stop_helper, stop_all_coroutines, reset_helper, set_combination_for_helper, search_available_steps, get_step_combination, try_combinate_before_buster_activation, try_click_activation, try_activate_buster_element, try_activate_swaped_busters, try_activate_diskosphere, try_activate_swaped_diskospheres, try_activate_swaped_diskosphere_with_buster, try_activate_swaped_buster_with_diskosphere, try_activate_swaped_diskosphere_with_element, try_activate_rocket, try_activate_swaped_rockets, try_activate_swaped_rocket_with_element, try_activate_helicopter, try_activate_swaped_helicopters, try_activate_swaped_helicopter_with_element, try_activate_dynamite, try_activate_swaped_dynamites, try_activate_swaped_dynamite_with_element, try_activate_swaped_buster_with_buster, try_spinning_activation, shuffle_field, try_hammer_activation, try_horizontal_rocket_activation, try_vertical_rocket_activation, try_swap_elements, set_random, process_game_step, revert_step, is_level_completed, is_have_steps, is_can_move, try_combo, on_damaged_element, is_combined_elements, on_combined, on_request_element, on_moved_elements, on_cell_activated, is_buster, get_random_element_id, remove_random_element, remove_element_by_mask, write_game_step_event, send_game_step, level_config, field_width, field_height, busters, field, game_item_counter, previous_states, previous_randomseeds, randomseed, activated_elements, game_step_events, selected_element, spawn_element_chances, available_steps, coroutines, previous_helper_data, helper_data, helper_timer, is_simulating, is_step, is_block_input, step_counter, start_game_time
    function set_element_types()
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local element_id = tonumber(key)
            print(element_id)
            field.set_element_type(
                element_id,
                {
                    index = element_id,
                    is_movable = true,
                    is_clickable = __TS__ArrayIncludes(GAME_CONFIG.buster_elements, element_id)
                }
            )
        end
    end
    function set_element_chances()
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local id = tonumber(key)
            if id ~= nil then
                if __TS__ArrayIncludes(GAME_CONFIG.base_elements, id) or id == level_config.additional_element then
                    spawn_element_chances[id] = 10
                else
                    spawn_element_chances[id] = 0
                end
                if id == level_config.exclude_element then
                    spawn_element_chances[id] = 0
                end
            end
        end
    end
    function set_busters()
        GameStorage.set("spinning_counts", 5)
        busters.spinning_active = GameStorage.get("spinning_counts") <= 0
        GameStorage.set("hammer_counts", 5)
        busters.hammer_active = GameStorage.get("hammer_counts") <= 0
        GameStorage.set("horizontal_rocket_counts", 5)
        busters.horizontal_rocket_active = GameStorage.get("horizontal_rocket_counts") <= 0
        GameStorage.set("vertical_rocket_counts", 5)
        busters.vertical_rocket_active = GameStorage.get("vertical_rocket_counts") <= 0
        EventBus.send("UPDATED_BUTTONS")
    end
    function set_events()
        EventBus.on("LOAD_FIELD", load_field)
        EventBus.on("SET_HELPER", set_helper)
        EventBus.on(
            "SWAP_ELEMENTS",
            function(elements)
                if is_block_input or elements == nil then
                    return
                end
                local c0 = socket.gettime()
                stop_helper()
                if not try_swap_elements(elements.from_x, elements.from_y, elements.to_x, elements.to_y) then
                    return
                end
                local is_procesed = try_combinate_before_buster_activation(elements.from_x, elements.from_y, elements.to_x, elements.to_y)
                is_step = true
                process_game_step(is_procesed)
                print(
                    "SWAP ELEMENTS TIME: ",
                    (socket.gettime() - c0) * 1000,
                    "ms"
                )
            end
        )
        EventBus.on(
            "CLICK_ACTIVATION",
            function(pos)
                if is_block_input or pos == nil then
                    return
                end
                stop_helper()
                if try_click_activation(pos.x, pos.y) then
                    process_game_step(true)
                else
                    local element = field.get_element(pos.x, pos.y)
                    if element ~= NullElement then
                        if selected_element ~= nil and selected_element.uid == element.uid then
                            EventBus.send(
                                "ON_ELEMENT_UNSELECTED",
                                __TS__ObjectAssign({}, selected_element)
                            )
                            selected_element = nil
                        else
                            local is_swap = false
                            if selected_element ~= nil then
                                EventBus.send(
                                    "ON_ELEMENT_UNSELECTED",
                                    __TS__ObjectAssign({}, selected_element)
                                )
                                local neighbors = field.get_neighbor_elements(selected_element.x, selected_element.y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
                                for ____, neighbor in ipairs(neighbors) do
                                    if neighbor.uid == element.uid then
                                        is_swap = true
                                        break
                                    end
                                end
                            end
                            if selected_element ~= nil and is_swap then
                                EventBus.send("SWAP_ELEMENTS", {from_x = selected_element.x, from_y = selected_element.y, to_x = pos.x, to_y = pos.y})
                            else
                                selected_element = {x = pos.x, y = pos.y, uid = element.uid}
                                EventBus.send(
                                    "ON_ELEMENT_SELECTED",
                                    __TS__ObjectAssign({}, selected_element)
                                )
                            end
                        end
                    end
                end
            end
        )
        EventBus.on(
            "ACTIVATE_SPINNING",
            function()
                if is_block_input then
                    return
                end
                stop_helper()
                try_spinning_activation()
            end
        )
        EventBus.on(
            "REVERT_STEP",
            function()
                stop_helper()
                revert_step()
            end
        )
        EventBus.on(
            "ON_GAME_STEP_ANIMATION_END",
            function()
                if is_level_completed() then
                    EventBus.send("ON_LEVEL_COMPLETED")
                elseif not is_have_steps() then
                    EventBus.send("ON_GAME_OVER")
                end
                print("[GAME]: end step")
                is_block_input = true
                search_available_steps(
                    1,
                    function(steps)
                        if #steps ~= 0 then
                            print("[GAME]: end check of available steps after end game step")
                            is_block_input = false
                            return
                        end
                        print("[GAME]: shuffle field after end game step")
                        stop_helper()
                        shuffle_field()
                    end
                )
            end
        )
    end
    function load_field()
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        load_cell(x, y)
                        load_element(x, y)
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if #field.get_all_combinations(true) > 0 then
            field.init()
            load_field()
            return
        end
        local state = field.save_state()
        previous_states[#previous_states + 1] = state
        search_available_steps(
            5,
            function(steps)
                available_steps = steps
            end
        )
        EventBus.send("ON_LOAD_FIELD", state)
        if level_config.time ~= nil then
            start_game_time = System.now()
            timer.delay(1, true, on_game_timer_tick)
        end
    end
    function on_game_timer_tick()
        local dt = System.now() - start_game_time
        local remaining_time = level_config.time - dt
        if level_config.time >= dt then
            EventBus.send("GAME_TIMER", remaining_time)
        else
            EventBus.send("ON_GAME_OVER")
        end
    end
    function load_cell(x, y)
        local cell_config = level_config.field.cells[y + 1][x + 1]
        if __TS__ArrayIsArray(cell_config) then
            local cells = __TS__ObjectAssign({}, cell_config)
            local cell_id = table.remove(cells)
            if cell_id ~= nil then
                make_cell(x, y, cell_id, {under_cells = cells})
            end
        else
            make_cell(x, y, cell_config)
        end
    end
    function load_element(x, y)
        local element = level_config.field.elements[y + 1][x + 1]
        make_element(
            x,
            y,
            element == ____exports.RandomElement and get_random_element_id() or element
        )
    end
    function make_cell(x, y, cell_id, data)
        if cell_id == NotActiveCell then
            return NotActiveCell
        end
        local config = GAME_CONFIG.cell_view[cell_id]
        local ____type
        if __TS__ArrayIncludes(GAME_CONFIG.activation_cells, cell_id) then
            ____type = ____type == nil and CellType.ActionLocked or bit.bor(____type, CellType.ActionLocked)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.near_activated_cells, cell_id) then
            ____type = ____type == nil and CellType.ActionLockedNear or bit.bor(____type, CellType.ActionLockedNear)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.disabled_cells, cell_id) then
            ____type = ____type == nil and CellType.Disabled or bit.bor(____type, CellType.Disabled)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.not_moved_cells, cell_id) then
            ____type = ____type == nil and CellType.NotMoved or bit.bor(____type, CellType.NotMoved)
        end
        if ____type == nil then
            ____type = CellType.Base
        end
        local ____cell_id_1 = cell_id
        local ____game_item_counter_0 = game_item_counter
        game_item_counter = ____game_item_counter_0 + 1
        local cell = {
            id = ____cell_id_1,
            uid = ____game_item_counter_0,
            type = ____type,
            cnt_acts = 0,
            cnt_near_acts = 0,
            data = __TS__ObjectAssign({}, data)
        }
        cell.data.current_id = cell_id
        cell.data.z_index = __TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, cell_id) and 2 or -1
        field.set_cell(x, y, cell)
        return cell
    end
    function make_element(x, y, element_id, data)
        if data == nil then
            data = nil
        end
        if element_id == NullElement then
            return NullElement
        end
        local ____game_item_counter_2 = game_item_counter
        game_item_counter = ____game_item_counter_2 + 1
        local element = {uid = ____game_item_counter_2, type = element_id, data = data}
        field.set_element(x, y, element)
        return element
    end
    function set_helper()
        helper_timer = timer.delay(
            5,
            false,
            function()
                set_combination_for_helper(available_steps)
                print("[GAME]: try to set helper")
                if helper_data ~= nil then
                    print("[GAME]: set helper")
                    reset_helper()
                    previous_helper_data = __TS__ObjectAssign({}, helper_data)
                    EventBus.send(
                        "ON_SET_STEP_HELPER",
                        __TS__ObjectAssign({}, helper_data)
                    )
                    set_helper()
                end
            end
        )
    end
    function stop_helper()
        if helper_timer == nil then
            return
        end
        print("[GAME]: stop helper")
        stop_all_coroutines()
        helper_data = nil
        timer.cancel(helper_timer)
        reset_helper()
    end
    function stop_all_coroutines()
        for ____, ____coroutine in ipairs(coroutines) do
            flow.stop(____coroutine)
        end
    end
    function reset_helper()
        if previous_helper_data == nil then
            return
        end
        print("[GAME]: reset helper")
        EventBus.send(
            "ON_RESET_STEP_HELPER",
            __TS__ObjectAssign({}, previous_helper_data)
        )
        previous_helper_data = nil
    end
    function set_combination_for_helper(steps)
        if #steps == 0 then
            return
        end
        local step = steps[math.random(0, #steps - 1) + 1]
        local combination = get_step_combination(step)
        if combination == nil then
            return
        end
        for ____, element in ipairs(combination.elements) do
            local is_from = element.x == step.from_x and element.y == step.from_y
            local is_to = element.x == step.to_x and element.y == step.to_y
            if is_from or is_to then
                helper_data = {step = step, elements = combination.elements, combined_element = element}
                print("[GAME]: set helper data")
                return
            end
        end
    end
    function search_available_steps(count, on_end)
        local ____coroutine = flow.start(function()
            print("[GAME]: search available steps")
            local steps = {}
            do
                local y = 0
                while y < field_height do
                    do
                        local x = 0
                        while x < field_width do
                            flow.frames(1)
                            local c0 = socket.gettime()
                            if is_buster(x, y) then
                                steps[#steps + 1] = {from_x = x, from_y = y, to_x = x, to_y = y}
                            end
                            if is_valid_pos(x + 1, y, field_width, field_height) and is_can_move(x, y, x + 1, y) then
                                steps[#steps + 1] = {from_x = x, from_y = y, to_x = x + 1, to_y = y}
                            end
                            print(
                                "first part time: ",
                                (socket.gettime() - c0) * 1000,
                                "ms"
                            )
                            if #steps > count then
                                return on_end(steps)
                            end
                            flow.frames(1)
                            local c1 = socket.gettime()
                            if is_valid_pos(x, y + 1, field_width, field_height) and is_can_move(x, y, x, y + 1) then
                                steps[#steps + 1] = {from_x = x, from_y = y, to_x = x, to_y = y + 1}
                            end
                            print(
                                "second part time: ",
                                (socket.gettime() - c1) * 1000,
                                "ms"
                            )
                            if #steps > count then
                                return on_end(steps)
                            end
                            x = x + 1
                        end
                    end
                    y = y + 1
                end
            end
            print("[GAME]: found ", #steps, " steps")
            on_end(steps)
        end)
        coroutines[#coroutines + 1] = ____coroutine
    end
    function get_step_combination(step)
        field.swap_elements(step.from_x, step.from_y, step.to_x, step.to_y)
        local combinations = field.get_all_combinations()
        field.swap_elements(step.from_x, step.from_y, step.to_x, step.to_y)
        for ____, combination in ipairs(combinations) do
            for ____, element in ipairs(combination.elements) do
                local is_x = element.x == step.from_x or element.x == step.to_x
                local is_y = element.y == step.from_y or element.y == step.to_y
                if is_x and is_y then
                    return combination
                end
            end
        end
        local element_from = field.get_element(step.from_x, step.from_y)
        local element_to = field.get_element(step.to_x, step.to_y)
        if element_from ~= NullElement and element_to ~= NullElement then
            local combination = {}
            combination.elements = {{x = step.from_x, y = step.from_y, uid = element_to.uid}, {x = step.to_x, y = step.to_y, uid = element_from.uid}}
            return combination
        end
        return nil
    end
    function try_combinate_before_buster_activation(from_x, from_y, to_x, to_y)
        local is_from_buster = is_buster(to_x, to_y)
        local is_to_buster = is_buster(from_x, from_y)
        if not is_from_buster and not is_to_buster then
            return false
        end
        local is_activated = false
        local is_procesed = field.process_state(ProcessMode.Combinate)
        if not is_procesed then
            is_activated = try_activate_swaped_busters(to_x, to_y, from_x, from_y)
        else
            write_game_step_event("ON_BUSTER_ACTIVATION", {})
            if is_from_buster then
                is_activated = try_activate_buster_element(to_x, to_y)
            end
            if is_to_buster then
                is_activated = try_activate_buster_element(from_x, from_y)
            end
        end
        return is_procesed or is_activated
    end
    function try_click_activation(x, y)
        if not is_simulating then
            if try_hammer_activation(x, y) then
                return true
            end
            if try_horizontal_rocket_activation(x, y) then
                return true
            end
            if try_vertical_rocket_activation(x, y) then
                return true
            end
        end
        if field.try_click(x, y) and try_activate_buster_element(x, y) then
            is_step = true
            return true
        end
        return false
    end
    function try_activate_buster_element(x, y, with_check)
        if with_check == nil then
            with_check = true
        end
        local element = field.get_element(x, y)
        if element == NullElement then
            return false
        end
        if with_check then
            if __TS__ArrayIndexOf(activated_elements, element.uid) ~= -1 then
                return false
            end
            activated_elements[#activated_elements + 1] = element.uid
        end
        EventBus.send(
            "ON_ELEMENT_UNSELECTED",
            __TS__ObjectAssign({}, selected_element)
        )
        selected_element = nil
        local activated = false
        if try_activate_rocket(x, y) then
            activated = true
        elseif try_activate_helicopter(x, y) then
            activated = true
        elseif try_activate_dynamite(x, y) then
            activated = true
        elseif try_activate_diskosphere(x, y) then
            activated = true
        end
        if activated then
            print("[GAME]: try activate buster element: ", x, y)
        end
        if not activated and with_check then
            __TS__ArraySplice(activated_elements, #activated_elements - 1, 1)
        end
        return activated
    end
    function try_activate_swaped_busters(x, y, other_x, other_y)
        local element = field.get_element(x, y)
        local other_element = field.get_element(other_x, other_y)
        if element == NullElement or other_element == NullElement then
            return false
        end
        if __TS__ArrayIndexOf(activated_elements, element.uid) ~= -1 or __TS__ArrayIndexOf(activated_elements, other_element.uid) ~= -1 then
            return false
        end
        __TS__ArrayPush(activated_elements, element.uid, other_element.uid)
        local activated = false
        if try_activate_swaped_diskospheres(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_buster_with_diskosphere(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_diskosphere_with_buster(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_diskosphere_with_element(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_diskosphere_with_element(other_x, other_y, x, y) then
            activated = true
        elseif try_activate_swaped_rockets(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_rocket_with_element(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_rocket_with_element(other_x, other_y, x, y) then
            activated = true
        elseif try_activate_swaped_helicopters(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_helicopter_with_element(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_helicopter_with_element(other_x, other_y, x, y) then
            activated = true
        elseif try_activate_swaped_dynamites(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_dynamite_with_element(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_dynamite_with_element(other_x, other_y, x, y) then
            activated = true
        elseif try_activate_swaped_buster_with_buster(x, y, other_x, other_y) then
            activated = true
        end
        if not activated then
            __TS__ArraySplice(activated_elements, #activated_elements - 2, 2)
        end
        return activated
    end
    function try_activate_diskosphere(x, y)
        local diskosphere = field.get_element(x, y)
        if diskosphere == NullElement or diskosphere.type ~= ElementId.Diskosphere then
            return false
        end
        local element_id = get_random_element_id()
        if element_id == NullElement then
            return false
        end
        local event_data = {}
        write_game_step_event("DISKOSPHERE_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.activated_cells = {}
        local elements = field.get_all_elements_by_type(element_id)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, true)
        end
        event_data.damaged_elements = elements
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_swaped_diskospheres(x, y, other_x, other_y)
        local diskosphere = field.get_element(x, y)
        if diskosphere == NullElement or diskosphere.type ~= ElementId.Diskosphere then
            return false
        end
        local other_diskosphere = field.get_element(other_x, other_y)
        if other_diskosphere == NullElement or other_diskosphere.type ~= ElementId.Diskosphere then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERES_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_diskosphere.uid}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        for ____, element_id in ipairs(GAME_CONFIG.base_elements) do
            local elements = field.get_all_elements_by_type(element_id)
            for ____, element in ipairs(elements) do
                field.remove_element(element.x, element.y, true, false)
                local ____event_data_damaged_elements_3 = event_data.damaged_elements
                ____event_data_damaged_elements_3[#____event_data_damaged_elements_3 + 1] = element
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_swaped_diskosphere_with_buster(x, y, other_x, other_y)
        local diskosphere = field.get_element(x, y)
        if diskosphere == NullElement or diskosphere.type ~= ElementId.Diskosphere then
            return false
        end
        local other_buster = field.get_element(other_x, other_y)
        if other_buster == NullElement or not __TS__ArrayIncludes({ElementId.Helicopter, ElementId.Dynamite, ElementId.HorizontalRocket, ElementId.VerticalRocket}, other_buster.type) then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_buster.uid}
        event_data.activated_cells = {}
        event_data.damaged_elements = {}
        event_data.maked_elements = {}
        local element_id = get_random_element_id()
        if element_id == NullElement then
            return false
        end
        local elements = field.get_all_elements_by_type(element_id)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, false)
            local ____event_data_damaged_elements_4 = event_data.damaged_elements
            ____event_data_damaged_elements_4[#____event_data_damaged_elements_4 + 1] = element
            local maked_element = make_element(element.x, element.y, other_buster.type, true)
            if maked_element ~= NullElement then
                local ____event_data_maked_elements_5 = event_data.maked_elements
                ____event_data_maked_elements_5[#____event_data_maked_elements_5 + 1] = {x = element.x, y = element.y, uid = maked_element.uid, type = maked_element.type}
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        for ____, element in ipairs(elements) do
            try_activate_buster_element(element.x, element.y)
        end
        return true
    end
    function try_activate_swaped_buster_with_diskosphere(x, y, other_x, other_y)
        local buster = field.get_element(x, y)
        if buster == NullElement or __TS__ArrayIncludes(GAME_CONFIG.base_elements, buster.type) then
            return false
        end
        local diskosphere = field.get_element(other_x, other_y)
        if diskosphere == NullElement or diskosphere.type ~= ElementId.Diskosphere then
            return false
        end
        local event_data = {}
        event_data.element = {x = other_x, y = other_y, uid = diskosphere.uid}
        event_data.other_element = {x = x, y = y, uid = buster.uid}
        event_data.activated_cells = {}
        event_data.damaged_elements = {}
        event_data.maked_elements = {}
        write_game_step_event("SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED", event_data)
        local element_id = get_random_element_id()
        if element_id == NullElement then
            return false
        end
        local elements = field.get_all_elements_by_type(element_id)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, false)
            local ____event_data_damaged_elements_6 = event_data.damaged_elements
            ____event_data_damaged_elements_6[#____event_data_damaged_elements_6 + 1] = element
            local maked_element = make_element(element.x, element.y, buster.type, true)
            if maked_element ~= NullElement then
                local ____event_data_maked_elements_7 = event_data.maked_elements
                ____event_data_maked_elements_7[#____event_data_maked_elements_7 + 1] = {x = element.x, y = element.y, uid = maked_element.uid, type = maked_element.type}
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        for ____, element in ipairs(elements) do
            try_activate_buster_element(element.x, element.y)
        end
        return true
    end
    function try_activate_swaped_diskosphere_with_element(x, y, other_x, other_y)
        local diskosphere = field.get_element(x, y)
        if diskosphere == NullElement or diskosphere.type ~= ElementId.Diskosphere then
            return false
        end
        local other_element = field.get_element(other_x, other_y)
        if other_element == NullElement then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_element.uid}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        local elements = field.get_all_elements_by_type(other_element.type)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, false)
            local ____event_data_damaged_elements_8 = event_data.damaged_elements
            ____event_data_damaged_elements_8[#____event_data_damaged_elements_8 + 1] = element
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_rocket(x, y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or not __TS__ArrayIncludes({ElementId.HorizontalRocket, ElementId.VerticalRocket, ElementId.AxisRocket}, rocket.type) then
            return false
        end
        local event_data = {}
        write_game_step_event("ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = rocket.uid}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        event_data.axis = rocket.type == ElementId.VerticalRocket and Axis.Vertical or Axis.Horizontal
        if rocket.type == ElementId.VerticalRocket or rocket.type == ElementId.AxisRocket then
            do
                local i = 0
                while i < field_height do
                    if i ~= y then
                        if is_buster(x, i) then
                            try_activate_buster_element(x, i)
                        else
                            local removed_element = field.remove_element(x, i, true, false)
                            if removed_element ~= nil then
                                local ____event_data_damaged_elements_9 = event_data.damaged_elements
                                ____event_data_damaged_elements_9[#____event_data_damaged_elements_9 + 1] = {x = x, y = i, uid = removed_element.uid}
                            end
                        end
                    end
                    i = i + 1
                end
            end
        end
        if rocket.type == ElementId.HorizontalRocket or rocket.type == ElementId.AxisRocket then
            do
                local i = 0
                while i < field_width do
                    if i ~= x then
                        if is_buster(i, y) then
                            try_activate_buster_element(i, y)
                        else
                            local removed_element = field.remove_element(i, y, true, false)
                            if removed_element ~= nil then
                                local ____event_data_damaged_elements_10 = event_data.damaged_elements
                                ____event_data_damaged_elements_10[#____event_data_damaged_elements_10 + 1] = {x = i, y = y, uid = removed_element.uid}
                            end
                        end
                    end
                    i = i + 1
                end
            end
        end
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_swaped_rockets(x, y, other_x, other_y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or not __TS__ArrayIncludes({ElementId.HorizontalRocket, ElementId.VerticalRocket}, rocket.type) then
            return false
        end
        local other_rocket = field.get_element(other_x, other_y)
        if other_rocket == NullElement or not __TS__ArrayIncludes({ElementId.HorizontalRocket, ElementId.VerticalRocket}, other_rocket.type) then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_ROCKETS_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = rocket.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_rocket.uid}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        do
            local i = 0
            while i < field_height do
                if i ~= y then
                    if is_buster(x, i) then
                        try_activate_buster_element(x, i)
                    else
                        local removed_element = field.remove_element(x, i, true, false)
                        if removed_element ~= nil then
                            local ____event_data_damaged_elements_11 = event_data.damaged_elements
                            ____event_data_damaged_elements_11[#____event_data_damaged_elements_11 + 1] = {x = x, y = i, uid = removed_element.uid}
                        end
                    end
                end
                i = i + 1
            end
        end
        do
            local i = 0
            while i < field_width do
                if i ~= x then
                    if is_buster(i, y) then
                        try_activate_buster_element(i, y)
                    else
                        local removed_element = field.remove_element(i, y, true, false)
                        if removed_element ~= nil then
                            local ____event_data_damaged_elements_12 = event_data.damaged_elements
                            ____event_data_damaged_elements_12[#____event_data_damaged_elements_12 + 1] = {x = i, y = y, uid = removed_element.uid}
                        end
                    end
                end
                i = i + 1
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_swaped_rocket_with_element(x, y, other_x, other_y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or not __TS__ArrayIncludes({ElementId.HorizontalRocket, ElementId.VerticalRocket, ElementId.AxisRocket}, rocket.type) then
            return false
        end
        local other_element = field.get_element(other_x, other_y)
        if other_element == NullElement or not __TS__ArrayIncludes(GAME_CONFIG.base_elements, other_element.type) then
            return false
        end
        if try_activate_rocket(x, y) then
            return true
        end
        return false
    end
    function try_activate_helicopter(x, y)
        local helicopter = field.get_element(x, y)
        if helicopter == NullElement or helicopter.type ~= ElementId.Helicopter then
            return false
        end
        local event_data = {}
        write_game_step_event("HELICOPTER_ACTIVATED", event_data)
        event_data.activated_cells = {}
        event_data.element = {x = x, y = y, uid = helicopter.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
        event_data.target_element = remove_random_element(event_data.damaged_elements)
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_swaped_helicopters(x, y, other_x, other_y)
        local helicopter = field.get_element(x, y)
        if helicopter == NullElement or helicopter.type ~= ElementId.Helicopter then
            return false
        end
        local other_helicopter = field.get_element(other_x, other_y)
        if other_helicopter == NullElement or other_helicopter.type ~= ElementId.Helicopter then
            return false
        end
        local event_data = {}
        event_data.target_elements = {}
        event_data.activated_cells = {}
        write_game_step_event("SWAPED_HELICOPTERS_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = helicopter.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_helicopter.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
        do
            local i = 0
            while i < 3 do
                local ____event_data_target_elements_13 = event_data.target_elements
                ____event_data_target_elements_13[#____event_data_target_elements_13 + 1] = remove_random_element(event_data.damaged_elements)
                i = i + 1
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_swaped_helicopter_with_element(x, y, other_x, other_y)
        local helicopter = field.get_element(x, y)
        if helicopter == NullElement or helicopter.type ~= ElementId.Helicopter then
            return false
        end
        local other_element = field.get_element(other_x, other_y)
        if other_element == NullElement or not __TS__ArrayIncludes(GAME_CONFIG.base_elements, other_element.type) then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED", event_data)
        event_data.activated_cells = {}
        event_data.element = {x = x, y = y, uid = helicopter.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_element.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
        event_data.target_element = remove_random_element(event_data.damaged_elements)
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_dynamite(x, y)
        local dynamite = field.get_element(x, y)
        if dynamite == NullElement or dynamite.type ~= ElementId.Dynamite then
            return false
        end
        local event_data = {}
        write_game_step_event("DYNAMITE_ACTIVATED", event_data)
        event_data.activated_cells = {}
        event_data.element = {x = x, y = y, uid = dynamite.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}})
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_swaped_dynamites(x, y, other_x, other_y)
        local dynamite = field.get_element(x, y)
        if dynamite == NullElement or dynamite.type ~= ElementId.Dynamite then
            return false
        end
        local other_dynamite = field.get_element(other_x, other_y)
        if other_dynamite == NullElement or other_dynamite.type ~= ElementId.Dynamite then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_DYNAMITES_ACTIVATED", event_data)
        event_data.activated_cells = {}
        event_data.element = {x = x, y = y, uid = dynamite.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_dynamite.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {
            {
                1,
                1,
                1,
                1,
                1
            },
            {
                1,
                1,
                1,
                1,
                1
            },
            {
                1,
                1,
                0,
                1,
                1
            },
            {
                1,
                1,
                1,
                1,
                1
            },
            {
                1,
                1,
                1,
                1,
                1
            }
        })
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_swaped_dynamite_with_element(x, y, other_x, other_y)
        local dynamite = field.get_element(x, y)
        if dynamite == NullElement or dynamite.type ~= ElementId.Dynamite then
            return false
        end
        local other_element = field.get_element(other_x, other_y)
        if other_element == NullElement or not __TS__ArrayIncludes(GAME_CONFIG.base_elements, other_element.type) then
            return false
        end
        try_activate_dynamite(x, y)
        return true
    end
    function try_activate_swaped_buster_with_buster(x, y, other_x, other_y)
        if not is_buster(x, y) or not is_buster(other_x, other_y) then
            return false
        end
        return try_activate_buster_element(x, y, false) and try_activate_buster_element(other_x, other_y, false)
    end
    function try_spinning_activation()
        if not busters.spinning_active or GameStorage.get("spinning_counts") <= 0 then
            return false
        end
        shuffle_field()
        GameStorage.set(
            "spinning_counts",
            GameStorage.get("spinning_counts") - 1
        )
        busters.spinning_active = false
        EventBus.send("UPDATED_BUTTONS")
        return true
    end
    function shuffle_field()
        local state = field.save_state()
        print("[GAME]: shuffle field")
        local event_data = {}
        write_game_step_event("ON_SPINNING_ACTIVATED", event_data)
        local base_elements = {}
        for ____, element_id in ipairs(GAME_CONFIG.base_elements) do
            for ____, element in ipairs(field.get_all_elements_by_type(element_id)) do
                base_elements[#base_elements + 1] = element
            end
        end
        while #base_elements > 0 do
            local element = table.remove(__TS__ArraySplice(
                base_elements,
                math.random(0, #base_elements - 1),
                1
            ))
            if #base_elements > 0 then
                local other_element = table.remove(__TS__ArraySplice(
                    base_elements,
                    math.random(0, #base_elements - 1),
                    1
                ))
                if element ~= nil and other_element ~= nil then
                    field.swap_elements(element.x, element.y, other_element.x, other_element.y)
                    event_data[#event_data + 1] = {element_from = element, element_to = other_element}
                end
            end
        end
        is_block_input = true
        search_available_steps(
            1,
            function(steps)
                if #steps ~= 0 then
                    print("[GAME]: end search available steps after shuffle field")
                    process_game_step(false)
                else
                    game_step_events = {}
                    field.load_state(state)
                    shuffle_field()
                end
            end
        )
    end
    function try_hammer_activation(x, y)
        if not busters.hammer_active or GameStorage.get("hammer_counts") <= 0 then
            return false
        end
        EventBus.send(
            "ON_ELEMENT_UNSELECTED",
            __TS__ObjectAssign({}, selected_element)
        )
        selected_element = nil
        if is_buster(x, y) then
            try_activate_buster_element(x, y)
        else
            local event_data = {}
            event_data.x = x
            event_data.y = y
            event_data.activated_cells = {}
            write_game_step_event("ON_ELEMENT_ACTIVATED", event_data)
            local removed_element = field.remove_element(x, y, true, false)
            if removed_element ~= nil then
                event_data.uid = removed_element.uid
            end
        end
        GameStorage.set(
            "hammer_counts",
            GameStorage.get("hammer_counts") - 1
        )
        busters.hammer_active = false
        EventBus.send("UPDATED_BUTTONS")
        return true
    end
    function try_horizontal_rocket_activation(x, y)
        if not busters.horizontal_rocket_active or GameStorage.get("horizontal_rocket_counts") <= 0 then
            return false
        end
        EventBus.send(
            "ON_ELEMENT_UNSELECTED",
            __TS__ObjectAssign({}, selected_element)
        )
        selected_element = nil
        local event_data = {}
        write_game_step_event("ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = -1}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        event_data.axis = Axis.Horizontal
        do
            local i = 0
            while i < field_width do
                if is_buster(i, y) then
                    try_activate_buster_element(i, y)
                else
                    local removed_element = field.remove_element(i, y, true, false)
                    if removed_element ~= nil then
                        local ____event_data_damaged_elements_14 = event_data.damaged_elements
                        ____event_data_damaged_elements_14[#____event_data_damaged_elements_14 + 1] = {x = i, y = y, uid = removed_element.uid}
                    end
                end
                i = i + 1
            end
        end
        GameStorage.set(
            "horizontal_rocket_counts",
            GameStorage.get("horizontal_rocket_counts") - 1
        )
        busters.horizontal_rocket_active = false
        EventBus.send("UPDATED_BUTTONS")
        return true
    end
    function try_vertical_rocket_activation(x, y)
        if not busters.vertical_rocket_active or GameStorage.get("vertical_rocket_counts") <= 0 then
            return false
        end
        EventBus.send(
            "ON_ELEMENT_UNSELECTED",
            __TS__ObjectAssign({}, selected_element)
        )
        selected_element = nil
        local event_data = {}
        write_game_step_event("ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = -1}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        event_data.axis = Axis.Vertical
        do
            local i = 0
            while i < field_height do
                if is_buster(x, i) then
                    try_activate_buster_element(x, i)
                else
                    local removed_element = field.remove_element(x, i, true, false)
                    if removed_element ~= nil then
                        local ____event_data_damaged_elements_15 = event_data.damaged_elements
                        ____event_data_damaged_elements_15[#____event_data_damaged_elements_15 + 1] = {x = x, y = i, uid = removed_element.uid}
                    end
                end
                i = i + 1
            end
        end
        GameStorage.set(
            "vertical_rocket_counts",
            GameStorage.get("vertical_rocket_counts") - 1
        )
        busters.vertical_rocket_active = false
        EventBus.send("UPDATED_BUTTONS")
        return true
    end
    function try_swap_elements(from_x, from_y, to_x, to_y)
        local cell_from = field.get_cell(from_x, from_y)
        local cell_to = field.get_cell(to_x, to_y)
        if cell_from == NotActiveCell or cell_to == NotActiveCell then
            return false
        end
        if not field.is_available_cell_type_for_move(cell_from) or not field.is_available_cell_type_for_move(cell_to) then
            return false
        end
        local element_from = field.get_element(from_x, from_y)
        local element_to = field.get_element(to_x, to_y)
        if element_from == NullElement then
            return false
        end
        EventBus.send(
            "ON_ELEMENT_UNSELECTED",
            __TS__ObjectAssign({}, selected_element)
        )
        selected_element = nil
        local c0 = socket.gettime()
        if not field.try_move(from_x, from_y, to_x, to_y) then
            EventBus.send("ON_WRONG_SWAP_ELEMENTS", {from = {x = from_x, y = from_y}, to = {x = to_x, y = to_y}, element_from = element_from, element_to = element_to})
            return false
        end
        print(
            "TRY SWAP TIME: ",
            (socket.gettime() - c0) * 1000,
            "ms"
        )
        write_game_step_event("ON_SWAP_ELEMENTS", {from = {x = from_x, y = from_y}, to = {x = to_x, y = to_y}, element_from = element_from, element_to = element_to})
        return true
    end
    function set_random(seed)
        randomseed = seed ~= nil and seed or os.time()
        previous_randomseeds[#previous_randomseeds + 1] = randomseed
        print("set_random: ", randomseed)
        math.randomseed(randomseed)
    end
    function process_game_step(after_activation)
        if after_activation == nil then
            after_activation = false
        end
        if after_activation then
            field.process_state(ProcessMode.MoveElements)
        end
        local c0 = socket.gettime()
        while field.process_state(ProcessMode.Combinate) do
            print("[GAME]: after combination in game")
            field.process_state(ProcessMode.MoveElements)
            print("[GAME]: after movements in game")
        end
        print(
            "STEP TIME: ",
            (socket.gettime() - c0) * 1000,
            "ms"
        )
        previous_states[#previous_states + 1] = field.save_state()
        search_available_steps(
            5,
            function(steps)
                available_steps = steps
            end
        )
        if is_step then
            step_counter = step_counter + 1
        end
        is_step = false
        if level_config.steps ~= nil then
            EventBus.send("UPDATED_STEP_COUNTER", level_config.steps - step_counter)
        end
        send_game_step()
        set_random()
    end
    function revert_step()
        local current_state = table.remove(previous_states)
        local previous_state = table.remove(previous_states)
        if current_state == nil or previous_state == nil then
            return false
        end
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = previous_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            make_cell(x, y, cell.id, cell and cell.data)
                        else
                            field.set_cell(x, y, NotActiveCell)
                        end
                        local element = previous_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            make_element(x, y, element.type, element.data)
                        else
                            field.set_element(x, y, NullElement)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        previous_state = field.save_state()
        previous_states[#previous_states + 1] = previous_state
        table.remove(previous_randomseeds)
        local previous_seed = table.remove(previous_randomseeds)
        print("previous_seed: ", previous_seed)
        set_random(previous_seed)
        search_available_steps(
            5,
            function(steps)
                available_steps = steps
            end
        )
        EventBus.send("ON_REVERT_STEP", {current_state = current_state, previous_state = previous_state})
        return true
    end
    function is_level_completed()
        for ____, target in ipairs(level_config.targets) do
            if #target.uids < target.count then
                return false
            end
        end
        return true
    end
    function is_have_steps()
        if level_config.steps ~= nil then
            return step_counter <= level_config.steps
        end
        return true
    end
    function is_can_move(from_x, from_y, to_x, to_y)
        if field.is_can_move_base(from_x, from_y, to_x, to_y) then
            return true
        end
        return is_buster(from_x, from_y) or is_buster(to_x, to_y)
    end
    function try_combo(combined_element, combination)
        local element = NullElement
        repeat
            local ____switch281 = combination.type
            local ____cond281 = ____switch281 == CombinationType.Comb4
            if ____cond281 then
                element = make_element(combined_element.x, combined_element.y, combination.angle == 0 and ElementId.HorizontalRocket or ElementId.VerticalRocket)
                break
            end
            ____cond281 = ____cond281 or ____switch281 == CombinationType.Comb5
            if ____cond281 then
                element = make_element(combined_element.x, combined_element.y, ElementId.Diskosphere)
                break
            end
            ____cond281 = ____cond281 or ____switch281 == CombinationType.Comb2x2
            if ____cond281 then
                element = make_element(combined_element.x, combined_element.y, ElementId.Helicopter)
                break
            end
            ____cond281 = ____cond281 or (____switch281 == CombinationType.Comb3x3a or ____switch281 == CombinationType.Comb3x3b)
            if ____cond281 then
                element = make_element(combined_element.x, combined_element.y, ElementId.Dynamite)
                break
            end
            ____cond281 = ____cond281 or (____switch281 == CombinationType.Comb3x4 or ____switch281 == CombinationType.Comb3x5)
            if ____cond281 then
                element = make_element(combined_element.x, combined_element.y, ElementId.AxisRocket)
                break
            end
        until true
        if element ~= NullElement and not is_simulating then
            game_step_events[#game_step_events].value.maked_element = {x = combined_element.x, y = combined_element.y, uid = element.uid, type = element.type}
            return true
        end
        return false
    end
    function on_damaged_element(item)
        local index = __TS__ArrayIndexOf(activated_elements, item.uid)
        if index ~= -1 then
            __TS__ArraySplice(activated_elements, index, 1)
        end
        print("[GAME]: damage: ", item.x, item.y)
        local e = field.get_element(item.x, item.y)
        if e ~= NullElement then
            print(e.type)
        end
        if is_simulating then
            return
        end
        local element = field.get_element(item.x, item.y)
        if element == NullElement then
            return
        end
        for ____, target in ipairs(level_config.targets) do
            if not target.is_cell and target.type == element.type then
                local ____target_uids_18 = target.uids
                ____target_uids_18[#____target_uids_18 + 1] = element.uid
            end
        end
    end
    function is_combined_elements(e1, e2)
        if field.get_element_type(e1.type).is_clickable or field.get_element_type(e2.type).is_clickable then
            return false
        end
        return field.is_combined_elements_base(e1, e2)
    end
    function on_combined(combined_element, combination)
        if is_buster(combined_element.x, combined_element.y) then
            return
        end
        write_game_step_event("ON_COMBINED", {combined_element = combined_element, combination = combination, activated_cells = {}})
        print("[GAME]: combined")
        field.on_combined_base(combined_element, combination)
        try_combo(combined_element, combination)
    end
    function on_request_element(x, y)
        return make_element(
            x,
            y,
            get_random_element_id()
        )
    end
    function on_moved_elements(elements)
        write_game_step_event("ON_MOVED_ELEMENTS", elements)
    end
    function on_cell_activated(item_info)
        local cell = field.get_cell(item_info.x, item_info.y)
        if cell == NotActiveCell then
            return
        end
        local new_cell = NotActiveCell
        if bit.band(cell.type, CellType.ActionLockedNear) == CellType.ActionLockedNear then
            if cell.cnt_near_acts ~= nil then
                if cell.cnt_near_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil and #cell.data.under_cells > 0 then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data)
                        end
                    end
                    if new_cell == NotActiveCell then
                        new_cell = make_cell(item_info.x, item_info.y, CellId.Base)
                    end
                end
            end
        end
        if bit.band(cell.type, CellType.ActionLocked) == CellType.ActionLocked then
            if cell.cnt_acts ~= nil then
                if cell.cnt_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil and #cell.data.under_cells > 0 then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data)
                        end
                    end
                    if new_cell == NotActiveCell then
                        new_cell = make_cell(item_info.x, item_info.y, CellId.Base)
                    end
                end
            end
        end
        if new_cell ~= NotActiveCell and not is_simulating then
            for ____, ____value in ipairs(__TS__ObjectEntries(game_step_events[#game_step_events].value)) do
                local key = ____value[1]
                local value = ____value[2]
                if key == "activated_cells" then
                    value[#value + 1] = {
                        x = item_info.x,
                        y = item_info.y,
                        uid = new_cell.uid,
                        id = new_cell.id,
                        previous_id = item_info.uid
                    }
                end
            end
            for ____, target in ipairs(level_config.targets) do
                local check_for_not_stone = target.type ~= CellId.Stone0 and target.type == cell.data.current_id
                local check_stone_with_last_cell = target.type == CellId.Stone0 and cell.data.current_id == CellId.Stone2
                if target.is_cell and (check_for_not_stone or check_stone_with_last_cell) then
                    local ____target_uids_19 = target.uids
                    ____target_uids_19[#____target_uids_19 + 1] = cell.uid
                end
            end
        end
    end
    function is_buster(x, y)
        return field.try_click(x, y)
    end
    function get_random_element_id()
        local sum = 0
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local id = tonumber(key)
            if id ~= nil then
                sum = sum + spawn_element_chances[id]
            end
        end
        local bins = {}
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local id = tonumber(key)
            if id ~= nil then
                local normalized_value = spawn_element_chances[id] / sum
                if #bins == 0 then
                    bins[#bins + 1] = normalized_value
                else
                    bins[#bins + 1] = normalized_value + bins[#bins]
                end
            end
        end
        local rand = math.random()
        for ____, ____value in __TS__Iterator(__TS__ArrayEntries(bins)) do
            local index = ____value[1]
            local value = ____value[2]
            if value >= rand then
                for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
                    local key = ____value[1]
                    local _ = ____value[2]
                    local ____index_20 = index
                    index = ____index_20 - 1
                    if ____index_20 == 0 then
                        return tonumber(key)
                    end
                end
            end
        end
        return NullElement
    end
    function remove_random_element(exclude, only_base_elements)
        if only_base_elements == nil then
            only_base_elements = true
        end
        local available_elements = {}
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local element = field.get_element(x, y)
                        if element ~= NullElement and exclude ~= nil and __TS__ArrayFindIndex(
                            exclude,
                            function(____, item) return item.uid == element.uid end
                        ) == -1 then
                            if only_base_elements then
                                if __TS__ArrayIncludes(GAME_CONFIG.base_elements, element.type) then
                                    available_elements[#available_elements + 1] = {x = x, y = y, uid = element.uid}
                                end
                            else
                                available_elements[#available_elements + 1] = {x = x, y = y, uid = element.uid}
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if #available_elements == 0 then
            return NullElement
        end
        local target = available_elements[math.random(0, #available_elements - 1) + 1]
        if is_buster(target.x, target.y) then
            try_activate_buster_element(target.x, target.y)
        else
            field.remove_element(target.x, target.y, true, false)
        end
        return target
    end
    function remove_element_by_mask(x, y, mask, is_near_activation)
        if is_near_activation == nil then
            is_near_activation = false
        end
        local removed_elements = {}
        do
            local i = y - (#mask - 1) / 2
            while i <= y + (#mask - 1) / 2 do
                do
                    local j = x - (#mask[1] - 1) / 2
                    while j <= x + (#mask[1] - 1) / 2 do
                        if mask[i - (y - (#mask - 1) / 2) + 1][j - (x - (#mask[1] - 1) / 2) + 1] == 1 then
                            if is_valid_pos(j, i, field_width, field_height) then
                                if is_buster(j, i) then
                                    try_activate_buster_element(j, i)
                                else
                                    local removed_element = field.remove_element(j, i, true, is_near_activation)
                                    if removed_element ~= nil then
                                        removed_elements[#removed_elements + 1] = {x = j, y = i, uid = removed_element.uid}
                                    end
                                end
                            end
                        end
                        j = j + 1
                    end
                end
                i = i + 1
            end
        end
        return removed_elements
    end
    function write_game_step_event(message_id, message)
        if is_simulating then
            return
        end
        game_step_events[#game_step_events + 1] = {key = message_id, value = message}
    end
    function send_game_step()
        if is_simulating then
            return
        end
        EventBus.send("ON_GAME_STEP", game_step_events)
        game_step_events = {}
    end
    level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    busters = level_config.busters
    field = Field(field_width, field_height, GAME_CONFIG.complex_move)
    game_item_counter = 0
    previous_states = {}
    previous_randomseeds = {}
    activated_elements = {}
    game_step_events = {}
    selected_element = nil
    spawn_element_chances = {}
    available_steps = {}
    coroutines = {}
    previous_helper_data = nil
    helper_data = nil
    is_simulating = false
    is_step = false
    is_block_input = false
    step_counter = 0
    start_game_time = 0
    local function init()
        field.init()
        field.set_callback_is_can_move(is_can_move)
        field.set_callback_on_moved_elements(on_moved_elements)
        field.set_callback_is_combined_elements(is_combined_elements)
        field.set_callback_on_combinated(on_combined)
        field.set_callback_on_damaged_element(on_damaged_element)
        field.set_callback_on_request_element(on_request_element)
        field.set_callback_on_cell_activated(on_cell_activated)
        set_element_types()
        set_element_chances()
        set_busters()
        set_events()
        set_random()
    end
    return init()
end
function ____exports.load_config()
    local data = sys.load_resource("/resources/levels.json")
    if data == nil then
        return
    end
    local levels = json.decode(data)
    for ____, level_data in ipairs(levels) do
        local level = {
            field = {
                width = 10,
                height = 10,
                max_width = 10,
                max_height = 10,
                cell_size = 128,
                offset_border = 20,
                cells = {},
                elements = {}
            },
            additional_element = level_data.additional_element,
            exclude_element = level_data.exclude_element,
            time = level_data.time,
            steps = level_data.steps,
            targets = {},
            busters = {hammer_active = false, spinning_active = false, horizontal_rocket_active = false, vertical_rocket_active = false}
        }
        do
            local y = 0
            while y < #level_data.field do
                level.field.cells[y + 1] = {}
                level.field.elements[y + 1] = {}
                do
                    local x = 0
                    while x < #level_data.field[y + 1] do
                        local data = level_data.field[y + 1][x + 1]
                        if type(data) == "string" then
                            repeat
                                local ____switch363 = data
                                local ____cond363 = ____switch363 == "-"
                                if ____cond363 then
                                    level.field.cells[y + 1][x + 1] = NotActiveCell
                                    level.field.elements[y + 1][x + 1] = NullElement
                                    break
                                end
                                ____cond363 = ____cond363 or ____switch363 == ""
                                if ____cond363 then
                                    level.field.cells[y + 1][x + 1] = CellId.Base
                                    level.field.elements[y + 1][x + 1] = ____exports.RandomElement
                                    break
                                end
                            until true
                        else
                            if data.cell ~= nil then
                                if data.cell == CellId.Stone0 then
                                    level.field.cells[y + 1][x + 1] = {CellId.Base, CellId.Stone2, CellId.Stone1, CellId.Stone0}
                                else
                                    level.field.cells[y + 1][x + 1] = {CellId.Base, data.cell}
                                end
                            else
                                level.field.cells[y + 1][x + 1] = CellId.Base
                            end
                            if data.element ~= nil then
                                level.field.elements[y + 1][x + 1] = data.element
                            else
                                level.field.elements[y + 1][x + 1] = ____exports.RandomElement
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        for ____, target_data in ipairs(level_data.targets) do
            local target
            if target_data.type.element ~= nil then
                target = {is_cell = false, type = target_data.type.element, count = 0, uids = {}}
            end
            if target_data.type.cell ~= nil then
                target = {is_cell = true, type = target_data.type.cell, count = 0, uids = {}}
            end
            if target ~= nil then
                local count = tonumber(target_data.count)
                target.count = count ~= nil and count or target.count
                local ____level_targets_21 = level.targets
                ____level_targets_21[#____level_targets_21 + 1] = target
            end
        end
        local ____GAME_CONFIG_levels_22 = GAME_CONFIG.levels
        ____GAME_CONFIG_levels_22[#____GAME_CONFIG_levels_22 + 1] = level
    end
end
return ____exports
