local ____lualib = require("lualib_bundle")
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayEntries = ____lualib.__TS__ArrayEntries
local __TS__Iterator = ____lualib.__TS__Iterator
local ____exports = {}
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
    local set_element_types, set_busters, set_events, load_field, load_cell, load_element, make_cell, make_element, try_click_activation, try_activate_buster_element, try_activate_vertical_rocket, try_activate_horizontal_rocket, try_activate_axis_rocket, try_activate_helicopter, try_activate_dynamite, try_activate_diskosphere, try_hammer_activation, swap_elements, process_game_step, revert_step, is_can_move, try_combo, on_combined, on_move_element, on_damaged_element, on_cell_activated, on_request_element, is_click_activation, get_random_element_id, remove_random_element, write_game_step_event, send_game_step, level_config, field_width, field_height, busters, field, game_item_counter, previous_states, activated_elements, game_step_events
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
                swap_elements(elements.from_x, elements.from_y, elements.to_x, elements.to_y)
            end
        )
        EventBus.on(
            "CLICK_ACTIVATION",
            function(pos)
                if pos == nil then
                    return
                end
                try_click_activation(pos.x, pos.y)
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
        EventBus.send("ON_SET_FIELD", state)
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
    function make_cell(x, y, cell_id, data, with_event)
        if with_event == nil then
            with_event = false
        end
        if cell_id == NotActiveCell then
            return NotActiveCell
        end
        local config = GAME_CONFIG.cell_database[cell_id]
        local ____game_item_counter_0 = game_item_counter
        game_item_counter = ____game_item_counter_0 + 1
        local cell = {
            id = ____game_item_counter_0,
            type = config.type,
            cnt_acts = config.cnt_acts,
            cnt_near_acts = config.cnt_near_acts,
            data = __TS__ObjectAssign({variety = cell_id}, data)
        }
        field.set_cell(x, y, cell)
        return cell
    end
    function make_element(x, y, element_id, with_event, data)
        if with_event == nil then
            with_event = false
        end
        if data == nil then
            data = nil
        end
        if element_id == NullElement then
            return NullElement
        end
        local ____game_item_counter_1 = game_item_counter
        game_item_counter = ____game_item_counter_1 + 1
        local element = {id = ____game_item_counter_1, type = element_id, data = data}
        field.set_element(x, y, element)
        if with_event then
            write_game_step_event("ON_MAKE_ELEMENT", {x = x, y = y, id = element.id, type = element_id})
        end
        return element
    end
    function try_click_activation(x, y)
        if not try_activate_buster_element({x = x, y = y}) and not try_hammer_activation(x, y) then
            return false
        end
        process_game_step()
        return true
    end
    function try_activate_buster_element(data)
        local element = field.get_element(data.x, data.y)
        if element == NullElement then
            return false
        end
        repeat
            local ____switch30 = element.type
            local ____cond30 = ____switch30 == ElementId.AxisRocket
            if ____cond30 then
                try_activate_axis_rocket(data)
                break
            end
            ____cond30 = ____cond30 or ____switch30 == ElementId.VerticalRocket
            if ____cond30 then
                try_activate_vertical_rocket(data)
                break
            end
            ____cond30 = ____cond30 or ____switch30 == ElementId.HorizontalRocket
            if ____cond30 then
                try_activate_horizontal_rocket(data)
                break
            end
            ____cond30 = ____cond30 or ____switch30 == ElementId.Helicopter
            if ____cond30 then
                try_activate_helicopter(data)
                break
            end
            ____cond30 = ____cond30 or ____switch30 == ElementId.Dynamite
            if ____cond30 then
                try_activate_dynamite(data)
                break
            end
            ____cond30 = ____cond30 or ____switch30 == ElementId.Diskosphere
            if ____cond30 then
                try_activate_diskosphere(data)
                break
            end
            do
                return false
            end
        until true
        write_game_step_event("BUSTER_ACTIVATED", {})
        return true
    end
    function try_activate_vertical_rocket(data)
        local element = field.get_element(data.x, data.y)
        if element == NullElement then
            return false
        end
        if data.other_x ~= nil and data.other_y ~= nil then
            local other_element = field.get_element(data.other_x, data.other_y)
            if other_element ~= NullElement and __TS__ArrayIncludes({ElementId.HorizontalRocket, ElementId.VerticalRocket}, other_element.type) then
                field.remove_element(data.other_x, data.other_y, true, false)
                try_activate_axis_rocket({x = data.x, y = data.y})
                return
            end
        end
        field.remove_element(data.x, data.y, true, false)
        do
            local y = 0
            while y < field_height do
                if y ~= data.y then
                    if not try_activate_buster_element({x = data.x, y = y}) then
                        field.remove_element(data.x, y, true, false)
                    end
                end
                y = y + 1
            end
        end
    end
    function try_activate_horizontal_rocket(data)
        local element = field.get_element(data.x, data.y)
        if element == NullElement then
            return false
        end
        if data.other_x ~= nil and data.other_y ~= nil then
            local other_element = field.get_element(data.other_x, data.other_y)
            if other_element ~= NullElement and __TS__ArrayIncludes({ElementId.HorizontalRocket, ElementId.VerticalRocket}, other_element.type) then
                field.remove_element(data.other_x, data.other_y, true, false)
                try_activate_axis_rocket({x = data.x, y = data.y})
                return
            end
        end
        field.remove_element(data.x, data.y, true, false)
        do
            local x = 0
            while x < field_width do
                if x ~= data.x then
                    if not try_activate_buster_element({x = x, y = data.y}) then
                        field.remove_element(x, data.y, true, false)
                    end
                end
                x = x + 1
            end
        end
    end
    function try_activate_axis_rocket(data)
        field.remove_element(data.x, data.y, true, false)
        do
            local y = 0
            while y < field_height do
                if y ~= data.y then
                    if not try_activate_buster_element({x = data.x, y = y}) then
                        field.remove_element(data.x, y, true, false)
                    end
                end
                y = y + 1
            end
        end
        do
            local x = 0
            while x < field_width do
                if x ~= data.x then
                    if not try_activate_buster_element({x = x, y = data.y}) then
                        field.remove_element(x, data.y, true, false)
                    end
                end
                x = x + 1
            end
        end
    end
    function try_activate_helicopter(data)
        local helicopter = field.get_element(data.x, data.y)
        if helicopter == NullElement then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == helicopter.id end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = helicopter.id
        local was_iteraction = false
        if data.other_x ~= nil and data.other_y ~= nil then
            local other_element = field.get_element(data.other_x, data.other_y)
            if other_element ~= NullElement and other_element.type == ElementId.Helicopter then
                field.remove_element(data.other_x, data.other_y, true, false)
                was_iteraction = true
            end
        end
        if field.is_valid_element_pos(data.x - 1, data.y) and not try_activate_buster_element({x = data.x - 1, y = data.y}) then
            field.remove_element(data.x - 1, data.y, true, false)
        end
        if field.is_valid_element_pos(data.x, data.y - 1) and not try_activate_buster_element({x = data.x, y = data.y - 1}) then
            field.remove_element(data.x, data.y - 1, true, false)
        end
        if field.is_valid_element_pos(data.x + 1, data.y) and not try_activate_buster_element({x = data.x + 1, y = data.y}) then
            field.remove_element(data.x + 1, data.y, true, false)
        end
        if field.is_valid_element_pos(data.x, data.y + 1) and not try_activate_buster_element({x = data.x, y = data.y + 1}) then
            field.remove_element(data.x, data.y + 1, true, false)
        end
        remove_random_element(data.x, data.y, helicopter)
        do
            local i = 0
            while i < 2 and was_iteraction do
                helicopter = make_element(data.x, data.y, ElementId.Helicopter, true)
                if helicopter ~= NullElement then
                    activated_elements[#activated_elements + 1] = helicopter.id
                    remove_random_element(data.x, data.y, helicopter)
                end
                i = i + 1
            end
        end
        return true
    end
    function try_activate_dynamite(data)
        local dynamite = field.get_element(data.x, data.y)
        if dynamite == NullElement then
            return false
        end
        if __TS__ArrayFindIndex(
            activated_elements,
            function(____, element_id) return element_id == dynamite.id end
        ) ~= -1 then
            return false
        end
        activated_elements[#activated_elements + 1] = dynamite.id
        local range = 2
        if data.other_x ~= nil and data.other_y ~= nil then
            local other_element = field.get_element(data.other_x, data.other_y)
            if other_element ~= NullElement and other_element.type == ElementId.Dynamite then
                field.remove_element(data.other_x, data.other_y, true, false)
                range = 3
            end
        end
        field.remove_element(data.x, data.y, true, false)
        do
            local y = data.y - range
            while y <= data.y + range do
                do
                    local x = data.x - range
                    while x <= data.x + range do
                        if field.is_valid_element_pos(x, y) then
                            if not try_activate_buster_element({x = x, y = y}) then
                                field.remove_element(x, y, true, false)
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return true
    end
    function try_activate_diskosphere(data)
        local element = field.get_element(data.x, data.y)
        if element == NullElement then
            return false
        end
        if data.other_x ~= nil and data.other_y ~= nil then
            local other_element = field.get_element(data.other_x, data.other_y)
            if other_element ~= NullElement then
                if __TS__ArrayIncludes({ElementId.Dynamite, ElementId.HorizontalRocket, ElementId.VerticalRocket}, other_element.type) then
                    local element_id = get_random_element_id()
                    if element_id == NullElement then
                        return
                    end
                    local elements = field.get_all_elements_by_type(element_id)
                    for ____, element in ipairs(elements) do
                        field.remove_element(element.x, element.y, true, false)
                        make_element(element.x, element.y, other_element.type, true)
                    end
                    field.remove_element(data.x, data.y, true, false)
                    field.remove_element(data.other_x, data.other_y, true, false)
                    for ____, element in ipairs(elements) do
                        try_activate_buster_element({x = element.x, y = element.y})
                    end
                    return
                end
                if other_element.type == ElementId.Diskosphere then
                    for ____, element_id in ipairs(GAME_CONFIG.base_elements) do
                        local elements = field.get_all_elements_by_type(element_id)
                        for ____, element in ipairs(elements) do
                            field.remove_element(element.x, element.y, true, false)
                        end
                    end
                    field.remove_element(data.x, data.y, true, false)
                    field.remove_element(data.other_x, data.other_y, true, false)
                    return
                end
                field.remove_element(data.x, data.y, true, false)
                local elements = field.get_all_elements_by_type(other_element.type)
                for ____, element in ipairs(elements) do
                    field.remove_element(element.x, element.y, true, false)
                end
                return
            end
        end
        local element_id = get_random_element_id()
        if element_id == NullElement then
            return
        end
        field.remove_element(data.x, data.y, true, true)
        local elements = field.get_all_elements_by_type(element_id)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, true)
        end
    end
    function try_hammer_activation(x, y)
        if not busters.hammer_active or GameStorage.get("hammer_counts") <= 0 then
            return false
        end
        field.remove_element(x, y, true, false)
        process_game_step()
        GameStorage.set(
            "hammer_counts",
            GameStorage.get("hammer_counts") - 1
        )
        busters.hammer_active = false
        EventBus.send("UPDATED_HAMMER")
        return true
    end
    function swap_elements(from_x, from_y, to_x, to_y)
        local cell_from = field.get_cell(from_x, from_y)
        local cell_to = field.get_cell(to_x, to_y)
        if cell_from == NotActiveCell or cell_to == NotActiveCell then
            return
        end
        if not field.is_available_cell_type_for_move(cell_from) or not field.is_available_cell_type_for_move(cell_to) then
            return
        end
        local element_from = field.get_element(from_x, from_y)
        local element_to = field.get_element(to_x, to_y)
        if element_from == NullElement or element_to == NullElement then
            return
        end
        if field.try_move(from_x, from_y, to_x, to_y) then
            write_game_step_event("ON_SWAP_ELEMENTS", {element_from = {x = to_x, y = to_y, id = element_to.id}, element_to = {x = from_x, y = from_y, id = element_from.id}})
            local is_click_to = not is_click_activation(to_x, to_y) and is_click_activation(from_x, from_y)
            if is_click_to then
                try_activate_buster_element({x = from_x, y = from_y, other_x = to_x, other_y = to_y})
            else
                try_activate_buster_element({x = to_x, y = to_y, other_x = from_x, other_y = from_y})
            end
            process_game_step()
        else
            write_game_step_event("ON_WRONG_SWAP_ELEMENTS", {element_from = {x = from_x, y = from_y, id = element_from.id}, element_to = {x = to_x, y = to_y, id = element_to.id}})
        end
    end
    function process_game_step()
        if field.process_state(ProcessMode.MoveElements) then
            write_game_step_event("END_MOVE_PHASE", {})
        end
        while field.process_state(ProcessMode.Combinate) do
            field.process_state(ProcessMode.MoveElements)
            write_game_step_event("END_MOVE_PHASE", {})
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
                            local ____make_cell_10 = make_cell
                            local ____x_8 = x
                            local ____y_9 = y
                            local ____opt_2 = cell and cell.data
                            if ____opt_2 ~= nil then
                                ____opt_2 = ____opt_2.variety
                            end
                            ____make_cell_10(____x_8, ____y_9, ____opt_2, cell and cell.data)
                        else
                            field.set_cell(x, y, NotActiveCell)
                        end
                        local element = previous_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            make_element(
                                x,
                                y,
                                element.type,
                                false,
                                element.data
                            )
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
        return is_click_activation(from_x, from_y) or is_click_activation(to_x, to_y)
    end
    function try_combo(combined_element, combination)
        repeat
            local ____switch118 = combination.type
            local ____cond118 = ____switch118 == CombinationType.Comb4
            if ____cond118 then
                make_element(combined_element.x, combined_element.y, combination.angle == 0 and ElementId.HorizontalRocket or ElementId.VerticalRocket, true)
                return true
            end
            ____cond118 = ____cond118 or ____switch118 == CombinationType.Comb5
            if ____cond118 then
                make_element(combined_element.x, combined_element.y, ElementId.Diskosphere, true)
                return true
            end
            ____cond118 = ____cond118 or ____switch118 == CombinationType.Comb2x2
            if ____cond118 then
                make_element(combined_element.x, combined_element.y, ElementId.Helicopter, true)
                break
            end
            ____cond118 = ____cond118 or (____switch118 == CombinationType.Comb3x3a or ____switch118 == CombinationType.Comb3x3b)
            if ____cond118 then
                make_element(combined_element.x, combined_element.y, ElementId.Dynamite, true)
                return true
            end
            ____cond118 = ____cond118 or (____switch118 == CombinationType.Comb3x4 or ____switch118 == CombinationType.Comb3x5)
            if ____cond118 then
                make_element(combined_element.x, combined_element.y, ElementId.AxisRocket, true)
                return true
            end
        until true
        return false
    end
    function on_combined(combined_element, combination)
        field.on_combined_base(combined_element, combination)
        if try_combo(combined_element, combination) then
            write_game_step_event("ON_COMBO", {combined_element = combined_element, combination = combination})
        else
            write_game_step_event("ON_COMBINED", {})
        end
    end
    function on_move_element(from_x, from_y, to_x, to_y, element)
        write_game_step_event("ON_MOVE_ELEMENT", {
            from_x = from_x,
            from_y = from_y,
            to_x = to_x,
            to_y = to_y,
            element = element
        })
    end
    function on_damaged_element(damaged_info)
        __TS__ArraySplice(
            activated_elements,
            __TS__ArrayFindIndex(
                activated_elements,
                function(____, element_id) return element_id == damaged_info.element.id end
            ),
            1
        )
        write_game_step_event("ON_DAMAGED_ELEMENT", {id = damaged_info.element.id})
    end
    function on_cell_activated(item_info)
        local cell = field.get_cell(item_info.x, item_info.y)
        if cell == NotActiveCell then
            return
        end
        repeat
            local ____switch127 = cell.type
            local ____cond127 = ____switch127 == CellType.ActionLocked
            if ____cond127 then
                if cell.cnt_acts == nil then
                    break
                end
                if cell.cnt_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            local new_cell = make_cell(
                                item_info.x,
                                item_info.y,
                                cell_id,
                                cell.data,
                                true
                            )
                            if new_cell ~= NotActiveCell then
                                write_game_step_event("ON_CELL_ACTIVATED", {
                                    x = item_info.x,
                                    y = item_info.y,
                                    id = new_cell.id,
                                    variety = cell_id,
                                    previous_id = item_info.id
                                })
                            end
                            return
                        end
                    end
                    local new_cell = make_cell(
                        item_info.x,
                        item_info.y,
                        CellId.Base,
                        nil,
                        true
                    )
                    if new_cell ~= NotActiveCell then
                        write_game_step_event("ON_CELL_ACTIVATED", {
                            x = item_info.x,
                            y = item_info.y,
                            id = new_cell.id,
                            variety = CellId.Base,
                            previous_id = item_info.id
                        })
                    end
                end
                break
            end
            ____cond127 = ____cond127 or ____switch127 == bit.bor(CellType.ActionLockedNear, CellType.Wall)
            if ____cond127 then
                if cell.cnt_near_acts == nil then
                    break
                end
                if cell.cnt_near_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            local new_cell = make_cell(
                                item_info.x,
                                item_info.y,
                                cell_id,
                                cell.data,
                                true
                            )
                            if new_cell ~= NotActiveCell then
                                write_game_step_event("ON_CELL_ACTIVATED", {
                                    x = item_info.x,
                                    y = item_info.y,
                                    id = new_cell.id,
                                    variety = cell_id,
                                    previous_id = item_info.id
                                })
                            end
                            return
                        end
                    end
                    local new_cell = make_cell(
                        item_info.x,
                        item_info.y,
                        CellId.Base,
                        nil,
                        true
                    )
                    if new_cell ~= NotActiveCell then
                        write_game_step_event("ON_CELL_ACTIVATED", {
                            x = item_info.x,
                            y = item_info.y,
                            id = new_cell.id,
                            variety = CellId.Base,
                            previous_id = item_info.id
                        })
                    end
                end
                break
            end
        until true
    end
    function on_request_element(x, y)
        local element = make_element(
            x,
            y,
            get_random_element_id()
        )
        if element == NullElement then
            return NullElement
        end
        write_game_step_event("ON_REQUEST_ELEMENT", {x = x, y = y, id = element.id, type = element.type})
        return element
    end
    function is_click_activation(x, y)
        local cell = field.get_cell(x, y)
        if cell == NotActiveCell or not field.is_available_cell_type_for_move(cell) then
            return false
        end
        local element = field.get_element(x, y)
        if element == NullElement then
            return false
        end
        if not GAME_CONFIG.element_database[element.type].type.is_clickable then
            return false
        end
        return true
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
                    local ____index_11 = index
                    index = ____index_11 - 1
                    if ____index_11 == 0 then
                        return tonumber(key)
                    end
                end
            end
        end
        return NullElement
    end
    function remove_random_element(x, y, element)
        local available_elements = {}
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local element = field.get_element(x, y)
                        if element ~= NullElement then
                            available_elements[#available_elements + 1] = {x = x, y = y}
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        field.remove_element(x, y, true, false)
        if #available_elements == 0 then
            return
        end
        local target = available_elements[math.random(0, #available_elements - 1) + 1]
        if not try_activate_buster_element({x = target.x, y = target.y}) then
            field.remove_element(target.x, target.y, true, false)
        end
        return target
    end
    function write_game_step_event(message_id, message)
        game_step_events[#game_step_events + 1] = {key = message_id, value = message}
    end
    function send_game_step()
        EventBus.send("GAME_STEP", game_step_events)
        game_step_events = {}
    end
    level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    local move_direction = level_config.field.move_direction
    busters = level_config.busters
    field = Field(field_width, field_height)
    game_item_counter = 0
    previous_states = {}
    activated_elements = {}
    game_step_events = {}
    local function init()
        field.init()
        field.set_callback_is_can_move(is_can_move)
        field.set_callback_on_move_element(on_move_element)
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
