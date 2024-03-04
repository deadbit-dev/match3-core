local ____lualib = require("lualib_bundle")
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayEntries = ____lualib.__TS__ArrayEntries
local __TS__Iterator = ____lualib.__TS__Iterator
local ____exports = {}
local ____math_utils = require("utils.math_utils")
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
function ____exports.Game()
    local set_element_types, set_busters, set_events, load_field, load_cell, load_element, make_cell, make_element, try_click_activation, try_activate_buster_element, try_activate_swaped_busters, try_activate_diskosphere, try_activate_swaped_diskospheres, try_activate_swaped_diskosphere_with_buster, try_activate_swaped_buster_with_diskosphere, try_activate_swaped_diskosphere_with_element, try_activate_vertical_rocket, try_activate_horizontal_rocket, try_activate_swaped_rocket_with_element, try_activate_swaped_rockets, try_activate_axis_rocket, try_activate_helicopter, try_activate_swaped_helicopters, try_activate_swaped_helicopter_with_element, try_activate_dynamite, try_activate_swaped_dynamites, try_activate_swaped_dynamite_with_element, try_activate_swaped_buster_with_buster, try_hammer_activation, try_swap_elements, process_game_step, revert_step, is_can_move, try_combo, on_damaged_element, on_combined, on_request_element, on_moved_elements, on_cell_activated, is_buster, get_random_element_id, remove_random_element, remove_element_by_mask, write_game_step_event, send_game_step, level_config, field_width, field_height, busters, field, game_item_counter, previous_states, activated_elements, game_step_events
    function set_element_types()
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_database)) do
            local key = ____value[1]
            local value = ____value[2]
            local element_id = tonumber(key)
            field.set_element_type(element_id, {index = element_id, is_clickable = value.type.is_clickable, is_movable = value.type.is_movable})
        end
    end
    function set_busters()
        GameStorage.set("hammer_counts", 5)
        busters.hammer_active = GameStorage.get("hammer_counts") <= 0
        EventBus.send("UPDATED_HAMMER")
    end
    function set_events()
        EventBus.on("LOAD_FIELD", load_field)
        EventBus.on(
            "SWAP_ELEMENTS",
            function(elements)
                if elements == nil then
                    return
                end
                if not try_swap_elements(elements.from_x, elements.from_y, elements.to_x, elements.to_y) then
                    return
                end
                local result = try_activate_swaped_busters(elements.to_x, elements.to_y, elements.from_x, elements.from_y)
                process_game_step(result)
            end
        )
        EventBus.on(
            "CLICK_ACTIVATION",
            function(pos)
                if pos == nil then
                    return
                end
                try_click_activation(pos.x, pos.y)
                process_game_step(true)
            end
        )
        EventBus.on("REVERT_STEP", revert_step)
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
        local state = field.save_state()
        previous_states[#previous_states + 1] = state
        EventBus.send("ON_LOAD_FIELD", state)
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
        make_element(x, y, level_config.field.elements[y + 1][x + 1])
    end
    function make_cell(x, y, cell_id, data)
        if cell_id == NotActiveCell then
            return NotActiveCell
        end
        local config = GAME_CONFIG.cell_database[cell_id]
        local ____cell_id_1 = cell_id
        local ____game_item_counter_0 = game_item_counter
        game_item_counter = ____game_item_counter_0 + 1
        local cell = {
            id = ____cell_id_1,
            uid = ____game_item_counter_0,
            type = config.type,
            cnt_acts = config.cnt_acts,
            cnt_near_acts = config.cnt_near_acts,
            data = __TS__ObjectAssign({}, data)
        }
        cell.data.is_render_under_cell = config.is_render_under_cell
        cell.data.z_index = config.z_index
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
    function try_click_activation(x, y)
        if try_hammer_activation(x, y) then
            return true
        end
        if field.try_click(x, y) and try_activate_buster_element(x, y) then
            return true
        end
        return false
    end
    function try_activate_buster_element(x, y)
        if try_activate_vertical_rocket(x, y) then
            return true
        end
        if try_activate_horizontal_rocket(x, y) then
            return true
        end
        if try_activate_axis_rocket(x, y) then
            return true
        end
        if try_activate_helicopter(x, y) then
            return true
        end
        if try_activate_dynamite(x, y) then
            return true
        end
        if try_activate_diskosphere(x, y) then
            return true
        end
        return false
    end
    function try_activate_swaped_busters(x, y, other_x, other_y)
        if try_activate_swaped_buster_with_diskosphere(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_diskospheres(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_diskosphere_with_buster(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_diskosphere_with_element(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_diskosphere_with_element(other_x, other_y, x, y) then
            return true
        end
        if try_activate_swaped_rockets(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_rocket_with_element(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_rocket_with_element(other_x, other_y, x, y) then
            return true
        end
        if try_activate_swaped_helicopters(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_helicopter_with_element(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_helicopter_with_element(other_x, other_y, x, y) then
            return true
        end
        if try_activate_swaped_dynamites(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_dynamite_with_element(x, y, other_x, other_y) then
            return true
        end
        if try_activate_swaped_dynamite_with_element(other_x, other_y, x, y) then
            return true
        end
        if try_activate_swaped_buster_with_buster(x, y, other_x, other_y) then
            return true
        end
        return false
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == diskosphere.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = diskosphere.uid
        local event_data = {}
        write_game_step_event("DISKOSPHERE_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == diskosphere.uid end
        ) ~= -1 then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == other_diskosphere.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = diskosphere.uid
        activated_elements[#activated_elements + 1] = other_diskosphere.uid
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERES_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_diskosphere.uid}
        event_data.damaged_elements = {}
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
        if other_buster == NullElement or not __TS__ArrayIncludes({ElementId.Dynamite, ElementId.HorizontalRocket, ElementId.VerticalRocket}, other_buster.type) then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == diskosphere.uid end
        ) ~= -1 then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == other_buster.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = diskosphere.uid
        activated_elements[#activated_elements + 1] = other_buster.uid
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_buster.uid}
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == buster.uid end
        ) ~= -1 then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == diskosphere.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = buster.uid
        activated_elements[#activated_elements + 1] = diskosphere.uid
        local event_data = {}
        event_data.element = {x = other_x, y = other_y, uid = diskosphere.uid}
        event_data.other_element = {x = x, y = y, uid = buster.uid}
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == diskosphere.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = diskosphere.uid
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_element.uid}
        event_data.damaged_elements = {}
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
    function try_activate_vertical_rocket(x, y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or rocket.type ~= ElementId.VerticalRocket then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == rocket.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = rocket.uid
        local event_data = {}
        write_game_step_event("ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = rocket.uid}
        event_data.damaged_elements = {}
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
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_horizontal_rocket(x, y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or rocket.type ~= ElementId.HorizontalRocket then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == rocket.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = rocket.uid
        local event_data = {}
        write_game_step_event("ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = rocket.uid}
        event_data.damaged_elements = {}
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
        field.remove_element(x, y, true, false)
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
        if try_activate_vertical_rocket(x, y) then
            return true
        end
        if try_activate_horizontal_rocket(x, y) then
            return true
        end
        if try_activate_axis_rocket(x, y) then
            return true
        end
        return false
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == rocket.uid end
        ) ~= -1 then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == other_rocket.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = rocket.uid
        activated_elements[#activated_elements + 1] = other_rocket.uid
        local event_data = {}
        write_game_step_event("SWAPED_ROCKETS_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = rocket.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_rocket.uid}
        event_data.damaged_elements = {}
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
    function try_activate_axis_rocket(x, y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or rocket.type ~= ElementId.AxisRocket then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == rocket.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = rocket.uid
        local event_data = {}
        write_game_step_event("AXIS_ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = rocket.uid}
        event_data.damaged_elements = {}
        do
            local i = 0
            while i < field_height do
                if i ~= y then
                    if is_buster(x, i) then
                        try_activate_buster_element(x, i)
                    else
                        local removed_element = field.remove_element(x, i, true, false)
                        if removed_element ~= nil then
                            local ____event_data_damaged_elements_13 = event_data.damaged_elements
                            ____event_data_damaged_elements_13[#____event_data_damaged_elements_13 + 1] = {x = x, y = i, uid = removed_element.uid}
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
                            local ____event_data_damaged_elements_14 = event_data.damaged_elements
                            ____event_data_damaged_elements_14[#____event_data_damaged_elements_14 + 1] = {x = i, y = y, uid = removed_element.uid}
                        end
                    end
                end
                i = i + 1
            end
        end
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_helicopter(x, y)
        local helicopter = field.get_element(x, y)
        if helicopter == NullElement or helicopter.type ~= ElementId.Helicopter then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == helicopter.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = helicopter.uid
        local event_data = {}
        write_game_step_event("HELICOPTER_ACTIVATED", event_data)
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == helicopter.uid end
        ) ~= -1 then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == other_helicopter.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = helicopter.uid
        activated_elements[#activated_elements + 1] = other_helicopter.uid
        local event_data = {}
        event_data.target_elements = {}
        write_game_step_event("SWAPED_HELICOPTERS_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = helicopter.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_helicopter.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
        do
            local i = 0
            while i < 3 do
                local ____event_data_target_elements_15 = event_data.target_elements
                ____event_data_target_elements_15[#____event_data_target_elements_15 + 1] = remove_random_element(event_data.damaged_elements)
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == helicopter.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = helicopter.uid
        local event_data = {}
        write_game_step_event("SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED", event_data)
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == dynamite.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = dynamite.uid
        local event_data = {}
        write_game_step_event("DYNAMITE_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = dynamite.uid}
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
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == dynamite.uid end
        ) ~= -1 then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == other_dynamite.uid end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = dynamite.uid
        activated_elements[#activated_elements + 1] = other_dynamite.uid
        local event_data = {}
        write_game_step_event("SWAPED_DYNAMITES_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = dynamite.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_dynamite.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {
            {
                1,
                1,
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
                1,
                1,
                1
            },
            {
                1,
                1,
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
                0,
                1,
                1,
                1
            },
            {
                1,
                1,
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
                1,
                1,
                1
            },
            {
                1,
                1,
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
        try_activate_buster_element(x, y)
        try_activate_buster_element(other_x, other_y)
        return true
    end
    function try_hammer_activation(x, y)
        if not busters.hammer_active or GameStorage.get("hammer_counts") <= 0 then
            return false
        end
        if is_buster(x, y) then
            try_activate_buster_element(x, y)
        else
            local removed_element = field.remove_element(x, y, true, false)
            if removed_element ~= nil then
                write_game_step_event("ON_ELEMENT_ACTIVATED", {x = x, y = y, uid = removed_element.uid})
            end
        end
        GameStorage.set(
            "hammer_counts",
            GameStorage.get("hammer_counts") - 1
        )
        busters.hammer_active = false
        EventBus.send("UPDATED_HAMMER")
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
        if element_from == NullElement or element_to == NullElement then
            return false
        end
        if not field.try_move(from_x, from_y, to_x, to_y) then
            EventBus.send("ON_WRONG_SWAP_ELEMENTS", {element_from = {x = from_x, y = from_y, uid = element_from.uid}, element_to = {x = to_x, y = to_y, uid = element_to.uid}})
            return false
        end
        write_game_step_event("ON_SWAP_ELEMENTS", {element_from = {x = to_x, y = to_y, uid = element_to.uid}, element_to = {x = from_x, y = from_y, uid = element_from.uid}})
        return true
    end
    function process_game_step(after_activation)
        if after_activation == nil then
            after_activation = false
        end
        if after_activation then
            field.process_state(ProcessMode.MoveElements)
        end
        while field.process_state(ProcessMode.Combinate) do
            field.process_state(ProcessMode.MoveElements)
        end
        previous_states[#previous_states + 1] = field.save_state()
        send_game_step()
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
        EventBus.send("ON_REVERT_STEP", {current_state = current_state, previous_state = previous_state})
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
            local ____switch215 = combination.type
            local ____cond215 = ____switch215 == CombinationType.Comb4
            if ____cond215 then
                element = make_element(combined_element.x, combined_element.y, combination.angle == 0 and ElementId.HorizontalRocket or ElementId.VerticalRocket)
                break
            end
            ____cond215 = ____cond215 or ____switch215 == CombinationType.Comb5
            if ____cond215 then
                element = make_element(combined_element.x, combined_element.y, ElementId.Diskosphere)
                break
            end
            ____cond215 = ____cond215 or ____switch215 == CombinationType.Comb2x2
            if ____cond215 then
                element = make_element(combined_element.x, combined_element.y, ElementId.Helicopter)
                break
            end
            ____cond215 = ____cond215 or (____switch215 == CombinationType.Comb3x3a or ____switch215 == CombinationType.Comb3x3b)
            if ____cond215 then
                element = make_element(combined_element.x, combined_element.y, ElementId.Dynamite)
                break
            end
            ____cond215 = ____cond215 or (____switch215 == CombinationType.Comb3x4 or ____switch215 == CombinationType.Comb3x5)
            if ____cond215 then
                element = make_element(combined_element.x, combined_element.y, ElementId.AxisRocket)
                break
            end
        until true
        if element ~= NullElement then
            write_game_step_event("ON_COMBO", {combined_element = combined_element, combination = combination, maked_element = {x = combined_element.x, y = combined_element.y, uid = element.uid, type = element.type}})
            return true
        end
        return false
    end
    function on_damaged_element(item)
        local index = __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == item.uid end
        )
        if index ~= -1 then
            __TS__ArraySplice(activated_elements, index, 1)
        end
    end
    function on_combined(combined_element, combination)
        field.on_combined_base(combined_element, combination)
        if not try_combo(combined_element, combination) then
            write_game_step_event("ON_COMBINED", {combined_element = combined_element, combination = combination})
        end
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
        repeat
            local ____switch226 = cell.type
            local ____cond226 = ____switch226 == CellType.ActionLocked
            if ____cond226 then
                if cell.cnt_acts == nil then
                    break
                end
                if cell.cnt_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil and #cell.data.under_cells > 0 then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data)
                            break
                        end
                    end
                    new_cell = make_cell(item_info.x, item_info.y, CellId.Base)
                end
                break
            end
            ____cond226 = ____cond226 or ____switch226 == bit.bor(CellType.ActionLockedNear, CellType.Wall)
            if ____cond226 then
                if cell.cnt_near_acts == nil then
                    break
                end
                if cell.cnt_near_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil and #cell.data.under_cells > 0 then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data)
                            break
                        end
                    end
                    new_cell = make_cell(item_info.x, item_info.y, CellId.Base)
                end
                break
            end
        until true
        if new_cell ~= NotActiveCell then
            write_game_step_event("ON_CELL_ACTIVATED", {
                x = item_info.x,
                y = item_info.y,
                uid = new_cell.uid,
                id = new_cell.id,
                previous_id = item_info.uid
            })
        end
    end
    function is_buster(x, y)
        return field.try_click(x, y)
    end
    function get_random_element_id()
        local sum = 0
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_database)) do
            local _ = ____value[1]
            local value = ____value[2]
            sum = sum + value.percentage
        end
        local bins = {}
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_database)) do
            local _ = ____value[1]
            local value = ____value[2]
            local normalized_value = value.percentage / sum
            if #bins == 0 then
                bins[#bins + 1] = normalized_value
            else
                bins[#bins + 1] = normalized_value + bins[#bins]
            end
        end
        local rand = math.random()
        for ____, ____value in __TS__Iterator(__TS__ArrayEntries(bins)) do
            local index = ____value[1]
            local value = ____value[2]
            if value >= rand then
                for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_database)) do
                    local key = ____value[1]
                    local _ = ____value[2]
                    local ____index_18 = index
                    index = ____index_18 - 1
                    if ____index_18 == 0 then
                        return tonumber(key)
                    end
                end
            end
        end
        return NullElement
    end
    function remove_random_element(exclude)
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
                            available_elements[#available_elements + 1] = {x = x, y = y, uid = element.uid}
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
        game_step_events[#game_step_events + 1] = {key = message_id, value = message}
    end
    function send_game_step()
        EventBus.send("ON_GAME_STEP", game_step_events)
        game_step_events = {}
    end
    level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    busters = level_config.busters
    field = Field(field_width, field_height, level_config.field.complex_move)
    game_item_counter = 0
    previous_states = {}
    activated_elements = {}
    game_step_events = {}
    local function init()
        field.init()
        field.set_callback_is_can_move(is_can_move)
        field.set_callback_on_moved_elements(on_moved_elements)
        field.set_callback_on_combinated(on_combined)
        field.set_callback_on_damaged_element(on_damaged_element)
        field.set_callback_on_request_element(on_request_element)
        field.set_callback_on_cell_activated(on_cell_activated)
        set_element_types()
        set_busters()
        set_events()
    end
    return init()
end
return ____exports
