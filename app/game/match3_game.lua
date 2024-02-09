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
local flow = require("ludobits.m.flow")
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
    local process, set_element_types, set_field, set_busters, init_cell, init_element, make_cell, make_element, try_click_activation, try_activate_buster_element, try_iteract_with_other_buster, try_activate_vertical_rocket, try_activate_horizontal_rocket, try_activate_axis_rocket, try_activate_helicopter, try_activate_dynamite, try_activate_diskosphere, try_hammer_activation, swap_elements, process_game_step, revert_step, is_can_move, on_combined, on_move_element, on_damaged_element, on_cell_activated, on_request_element, is_click_activation, get_random_element_id, remove_random_element, level_config, field_width, field_height, busters, field, game_item_counter, previous_states, activated_elements
    function process()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            repeat
                local ____switch6 = message_id
                local info, pos
                local ____cond6 = ____switch6 == to_hash("SWAP_ELEMENTS")
                if ____cond6 then
                    info = _message
                    swap_elements(info.from_x, info.from_y, info.to_x, info.to_y)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("CLICK_ACTIVATION")
                if ____cond6 then
                    pos = _message
                    try_click_activation(pos.x, pos.y)
                    break
                end
                ____cond6 = ____cond6 or ____switch6 == to_hash("REVERT_STEP")
                if ____cond6 then
                    revert_step()
                    break
                end
            until true
        end
    end
    function set_element_types()
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_database)) do
            local key = ____value[1]
            local value = ____value[2]
            local element_id = tonumber(key)
            field.set_element_type(element_id, {index = element_id, is_clickable = value.type.is_clickable, is_movable = value.type.is_movable})
        end
    end
    function set_field()
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        init_cell(x, y)
                        init_element(x, y)
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        previous_states[#previous_states + 1] = field.save_state()
    end
    function set_busters()
        GameStorage.set("hammer_counts", 5)
        busters.hammer_active = GameStorage.get("hammer_counts") <= 0
    end
    function init_cell(x, y)
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
    function init_element(x, y)
        make_element(x, y, level_config.field.elements[y + 1][x + 1])
    end
    function make_cell(x, y, cell_id, data)
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
        local ____Manager_send_raw_view_9 = Manager.send_raw_view
        local ____to_hash_result_8 = to_hash("ON_MAKE_CELL")
        local ____x_5 = x
        local ____y_6 = y
        local ____cell_id_7 = cell.id
        local ____opt_1 = cell and cell.data
        if ____opt_1 ~= nil then
            ____opt_1 = ____opt_1.variety
        end
        ____Manager_send_raw_view_9(____to_hash_result_8, {x = ____x_5, y = ____y_6, id = ____cell_id_7, variety = ____opt_1})
        return cell
    end
    function make_element(x, y, element_id, spawn_anim, data)
        if spawn_anim == nil then
            spawn_anim = false
        end
        if data == nil then
            data = nil
        end
        if element_id == NullElement then
            return NullElement
        end
        local ____game_item_counter_10 = game_item_counter
        game_item_counter = ____game_item_counter_10 + 1
        local element = {id = ____game_item_counter_10, type = element_id, data = data}
        field.set_element(x, y, element)
        Manager.send_raw_view(
            to_hash("ON_MAKE_ELEMENT"),
            {x = x, y = y, id = element.id, type = element.type}
        )
        return element
    end
    function try_click_activation(x, y)
        if not is_click_activation(x, y) then
            return false
        end
        if not try_activate_buster_element({x = x, y = y}) then
            return false
        end
        if not try_hammer_activation(x, y) then
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
            local ____switch29 = element.type
            local ____cond29 = ____switch29 == ElementId.AxisRocket
            if ____cond29 then
                try_activate_axis_rocket(data)
                break
            end
            ____cond29 = ____cond29 or ____switch29 == ElementId.VerticalRocket
            if ____cond29 then
                try_activate_vertical_rocket(data)
                break
            end
            ____cond29 = ____cond29 or ____switch29 == ElementId.HorizontalRocket
            if ____cond29 then
                try_activate_horizontal_rocket(data)
                break
            end
            ____cond29 = ____cond29 or ____switch29 == ElementId.Helicopter
            if ____cond29 then
                try_activate_helicopter(data)
                break
            end
            ____cond29 = ____cond29 or ____switch29 == ElementId.Dynamite
            if ____cond29 then
                try_activate_dynamite(data)
                break
            end
            ____cond29 = ____cond29 or ____switch29 == ElementId.Diskosphere
            if ____cond29 then
                try_activate_diskosphere(data)
                break
            end
            do
                return false
            end
        until true
        return true
    end
    function try_iteract_with_other_buster(data, types_for_check, on_interact)
        local element = field.get_element(data.x, data.y)
        if element == NullElement then
            return false
        end
        if data.other_x == nil or data.other_y == nil then
            return false
        end
        local other_element = field.get_element(data.other_x, data.other_y)
        if other_element == NullElement then
            return false
        end
        if not __TS__ArrayIncludes(types_for_check, other_element.type) then
            return false
        end
        on_interact({x = data.x, y = data.y, id = element.id}, {x = data.other_x, y = data.other_y, id = other_element.id})
        return true
    end
    function try_activate_vertical_rocket(data)
        if try_iteract_with_other_buster(
            data,
            {ElementId.HorizontalRocket, ElementId.VerticalRocket},
            function(item, other_item)
                field.remove_element(other_item.x, other_item.y, true, false)
                try_activate_axis_rocket({x = item.x, y = item.y})
            end
        ) then
            return
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
        if try_iteract_with_other_buster(
            data,
            {ElementId.HorizontalRocket, ElementId.VerticalRocket},
            function(item, other_item)
                field.remove_element(other_item.x, other_item.y, true, false)
                try_activate_axis_rocket({x = item.x, y = item.y})
            end
        ) then
            return
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
        local was_iteraction = try_iteract_with_other_buster(
            data,
            {ElementId.Helicopter},
            function(item, other_item)
                field.remove_element(other_item.x, other_item.y, true, false)
            end
        )
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
        local range = 2
        try_iteract_with_other_buster(
            data,
            {ElementId.Dynamite},
            function(item, other_item)
                field.remove_element(other_item.x, other_item.y, true, false)
                range = 3
            end
        )
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
    end
    function try_activate_diskosphere(data)
        if try_iteract_with_other_buster(
            data,
            {ElementId.Dynamite, ElementId.HorizontalRocket, ElementId.VerticalRocket},
            function(item, other_item)
                local other_element = field.get_element(other_item.x, other_item.y)
                if other_element == NullElement then
                    return
                end
                local element_id = get_random_element_id()
                if element_id == NullElement then
                    return
                end
                local elements = field.get_all_elements_by_type(element_id)
                for ____, element in ipairs(elements) do
                    field.remove_element(element.x, element.y, true, false)
                    make_element(element.x, element.y, other_element.type, true)
                end
                field.remove_element(item.x, item.y, true, false)
                field.remove_element(other_item.x, other_item.y, true, false)
                for ____, element in ipairs(elements) do
                    try_activate_buster_element({x = element.x, y = element.y})
                end
            end
        ) then
            return
        end
        if try_iteract_with_other_buster(
            data,
            {ElementId.Diskosphere},
            function(item, other_item)
                local other_element = field.get_element(other_item.x, other_item.y)
                if other_element == NullElement then
                    return
                end
                for ____, element_id in ipairs(GAME_CONFIG.base_elements) do
                    local elements = field.get_all_elements_by_type(element_id)
                    for ____, element in ipairs(elements) do
                        field.remove_element(element.x, element.y, true, false)
                    end
                end
                field.remove_element(item.x, item.y, true, false)
                field.remove_element(other_item.x, other_item.y, true, false)
            end
        ) then
            return
        end
        if data.other_x ~= nil and data.other_y ~= nil then
            local element = field.get_element(data.x, data.y)
            if element == NullElement then
                return
            end
            local other_element = field.get_element(data.other_x, data.other_y)
            if other_element == NullElement then
                return
            end
            field.remove_element(data.x, data.y, true, false)
            local elements = field.get_all_elements_by_type(other_element.type)
            for ____, element in ipairs(elements) do
                field.remove_element(element.x, element.y, true, false)
            end
            return
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
            Manager.send_raw_view(
                to_hash("ON_SWAP_ELEMENTS"),
                {element_from = {x = to_x, y = to_y, id = element_to.id}, element_to = {x = from_x, y = from_y, id = element_from.id}}
            )
            local is_click_to = not is_click_activation(to_x, to_y) and is_click_activation(from_x, from_y)
            if is_click_to then
                try_activate_buster_element({x = from_x, y = from_y, other_x = to_x, other_y = to_y})
            else
                try_activate_buster_element({x = to_x, y = to_y, other_x = from_x, other_y = from_y})
            end
            process_game_step()
        end
    end
    function process_game_step()
        field.process_state(ProcessMode.MoveElements)
        while field.process_state(ProcessMode.Combinate) do
            field.process_state(ProcessMode.MoveElements)
        end
        previous_states[#previous_states + 1] = field.save_state()
    end
    function revert_step()
        local current_state = table.remove(previous_states)
        local previous_state = table.remove(previous_states)
        if current_state == nil or previous_state == nil then
            return false
        end
        field.load_state(previous_state)
        previous_states[#previous_states + 1] = previous_state
        Manager.send_raw_view(
            to_hash("ON_REVERT_STEP"),
            {current_state = current_state, previous_state = previous_state}
        )
        return true
    end
    function is_can_move(from_x, from_y, to_x, to_y)
        if field.is_can_move_base(from_x, from_y, to_x, to_y) then
            return true
        end
        return is_click_activation(from_x, from_y) or is_click_activation(to_x, to_y)
    end
    function on_combined(combined_element, combination)
        Manager.send_raw_view(
            to_hash("ON_COMBINED"),
            {combined_element = combined_element, combination = combination}
        )
        repeat
            local ____switch111 = combination.type
            local ____cond111 = ____switch111 == CombinationType.Comb4
            if ____cond111 then
                make_element(combined_element.x, combined_element.y, combination.angle == 0 and ElementId.HorizontalRocket or ElementId.VerticalRocket, true)
                break
            end
            ____cond111 = ____cond111 or ____switch111 == CombinationType.Comb5
            if ____cond111 then
                make_element(combined_element.x, combined_element.y, ElementId.Diskosphere, true)
                break
            end
            ____cond111 = ____cond111 or ____switch111 == CombinationType.Comb2x2
            if ____cond111 then
                make_element(combined_element.x, combined_element.y, ElementId.Helicopter, true)
                break
            end
            ____cond111 = ____cond111 or (____switch111 == CombinationType.Comb3x3a or ____switch111 == CombinationType.Comb3x3b)
            if ____cond111 then
                make_element(combined_element.x, combined_element.y, ElementId.Dynamite, true)
                break
            end
            ____cond111 = ____cond111 or (____switch111 == CombinationType.Comb3x4 or ____switch111 == CombinationType.Comb3x5)
            if ____cond111 then
                make_element(combined_element.x, combined_element.y, ElementId.AxisRocket, true)
                break
            end
        until true
        field.on_combined_base(combined_element, combination)
    end
    function on_move_element(from_x, from_y, to_x, to_y, element)
        Manager.send_raw_view(
            to_hash("ON_MOVE_ELEMENT"),
            {
                from_x = from_x,
                from_y = from_y,
                to_x = to_x,
                to_y = to_y,
                element = element
            }
        )
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
        Manager.send_raw_view(
            to_hash("ON_DAMAGED_ELEMENT"),
            {id = damaged_info.element.id}
        )
    end
    function on_cell_activated(item_info)
        local cell = field.get_cell(item_info.x, item_info.y)
        if cell == NotActiveCell then
            return
        end
        repeat
            local ____switch117 = cell.type
            local ____cond117 = ____switch117 == CellType.ActionLocked
            if ____cond117 then
                if cell.cnt_acts == nil then
                    break
                end
                if cell.cnt_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            make_cell(item_info.x, item_info.y, cell_id, cell.data)
                        else
                            make_cell(item_info.x, item_info.y, CellId.Base)
                        end
                    else
                        make_cell(item_info.x, item_info.y, CellId.Base)
                    end
                end
                break
            end
            ____cond117 = ____cond117 or ____switch117 == bit.bor(CellType.ActionLockedNear, CellType.Wall)
            if ____cond117 then
                if cell.cnt_near_acts == nil then
                    break
                end
                if cell.cnt_near_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            make_cell(item_info.x, item_info.y, cell_id, cell.data)
                        else
                            make_cell(item_info.x, item_info.y, CellId.Base)
                        end
                    else
                        make_cell(item_info.x, item_info.y, CellId.Base)
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
        Manager.send_raw_view(
            to_hash("ON_REQUEST_ELEMENT"),
            {x = x, y = y, id = element.id}
        )
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
        if #available_elements == 0 then
            field.remove_element(x, y, true, false)
            return
        end
        local target = available_elements[math.random(0, #available_elements - 1) + 1]
        field.remove_element(x, y, true, false)
        if not try_activate_buster_element({x = target.x, y = target.y}) then
            field.remove_element(target.x, target.y, true, false)
        end
    end
    level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    local move_direction = level_config.field.move_direction
    busters = level_config.busters
    field = Field(field_width, field_height, move_direction)
    game_item_counter = 0
    previous_states = {}
    activated_elements = {}
    local function init()
        field.init()
        field.set_callback_is_can_move(is_can_move)
        field.set_callback_on_move_element(on_move_element)
        field.set_callback_on_combinated(on_combined)
        field.set_callback_on_damaged_element(on_damaged_element)
        field.set_callback_on_request_element(on_request_element)
        field.set_callback_on_cell_activated(on_cell_activated)
        set_element_types()
        set_field()
        set_busters()
        process()
    end
    return init()
end
return ____exports
