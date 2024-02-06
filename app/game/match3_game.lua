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
local camera = require("utils.camera")
local ____math_utils = require("utils.math_utils")
local Direction = ____math_utils.Direction
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
local ____match3_view = require("game.match3_view")
local View = ____match3_view.View
function ____exports.Game()
    local setup_element_types, init_cell, init_element, make_cell, make_element, process_move, process_game_step, get_move_direction, is_can_move, swap_elements, is_click_activation, try_click_activation, try_hammer_activation, on_down, on_move, on_up, make_buster, on_combined, is_buster_element, is_axis_buster, is_diskosphere, try_iteract_with_other_buster, try_activate_vertical_buster, try_activate_horizontal_buster, try_activate_axis_buster, attack, try_activate_helicopter, try_activate_dynamite, try_activate_diskosphere, try_activate_buster_element, on_damaged_element, on_cell_activated, get_random_element_id, on_request_element, revert_step, wait_event, min_swipe_distance, move_delay_after_combination, wait_time_after_move, buster_delay, level_config, field_width, field_height, busters, field, view, previous_states, selected_element, activated_elements
    function setup_element_types()
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_database)) do
            local key = ____value[1]
            local value = ____value[2]
            field.set_element_type(
                tonumber(key),
                value.type
            )
        end
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
        local cell = {
            id = view.set_cell_view(x, y, cell_id),
            type_id = config.type_id,
            type = config.type,
            cnt_acts = config.cnt_acts,
            cnt_near_acts = config.cnt_near_acts,
            data = data
        }
        field.set_cell(x, y, cell)
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
        local element_data = GAME_CONFIG.element_database[element_id]
        local element = {
            id = view.set_element_view(x, y, element_id, spawn_anim),
            type = element_data.type.index,
            data = data
        }
        field.set_element(x, y, element)
        return element
    end
    function process_move()
        field.process_state(ProcessMode.MoveElements)
        flow.delay(wait_time_after_move)
    end
    function process_game_step()
        process_move()
        while field.process_state(ProcessMode.Combinate) do
            flow.delay(move_delay_after_combination)
            process_move()
        end
        previous_states[#previous_states + 1] = field.save_state()
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
    function is_can_move(from_x, from_y, to_x, to_y)
        if field.is_can_move_base(from_x, from_y, to_x, to_y) then
            return true
        end
        return is_click_activation(from_x, from_y) or is_click_activation(to_x, to_y)
    end
    function swap_elements(from_pos_x, from_pos_y, to_pos_x, to_pos_y)
        local cell_from = field.get_cell(from_pos_x, from_pos_y)
        local cell_to = field.get_cell(to_pos_x, to_pos_y)
        if cell_from == NotActiveCell or cell_to == NotActiveCell then
            return
        end
        if not field.is_available_cell_type_for_move(cell_from) or not field.is_available_cell_type_for_move(cell_to) then
            return
        end
        local element_from = field.get_element(from_pos_x, from_pos_y)
        local element_to = field.get_element(to_pos_x, to_pos_y)
        if element_from == NullElement or element_to == NullElement then
            return
        end
        local element_to_world_pos = view.get_cell_world_pos(to_pos_x, to_pos_y, 0)
        local element_from_world_pos = view.get_cell_world_pos(from_pos_x, from_pos_y, 0)
        view.swap_element_animation(element_from, element_to, element_from_world_pos, element_to_world_pos)
        if not field.try_move(from_pos_x, from_pos_y, to_pos_x, to_pos_y) then
            view.swap_element_animation(element_from, element_to, element_to_world_pos, element_from_world_pos)
        else
            if is_buster_element(to_pos_x, to_pos_y) and not is_buster_element(from_pos_x, from_pos_y) or is_diskosphere(to_pos_x, to_pos_y) or is_axis_buster(to_pos_x, to_pos_y) and is_axis_buster(from_pos_x, from_pos_y) then
                try_activate_buster_element({x = to_pos_x, y = to_pos_y, other_x = from_pos_x, other_y = from_pos_y})
            else
                try_activate_buster_element({x = from_pos_x, y = from_pos_y, other_x = to_pos_x, other_y = to_pos_y})
            end
            process_game_step()
        end
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
    function try_click_activation(x, y)
        if not is_click_activation(x, y) then
            return false
        end
        if not try_activate_buster_element({x = x, y = y}) then
            return false
        end
        process_game_step()
        return true
    end
    function try_hammer_activation(x, y)
        if not busters.hammer_active or GameStorage.get("hammer_counts") <= 0 then
            return false
        end
        field.remove_element(x, y, true, false)
        flow.delay(buster_delay)
        process_game_step()
        GameStorage.set(
            "hammer_counts",
            GameStorage.get("hammer_counts") - 1
        )
        busters.hammer_active = false
        return true
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
        local selected_element_pos = view.get_element_pos(selected_element_world_pos)
        local element_to_pos = {x = selected_element_pos.x, y = selected_element_pos.y}
        local direction = vmath.normalize(delta)
        local move_direction = get_move_direction(direction)
        repeat
            local ____switch50 = move_direction
            local ____cond50 = ____switch50 == Direction.Up
            if ____cond50 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond50 = ____cond50 or ____switch50 == Direction.Down
            if ____cond50 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond50 = ____cond50 or ____switch50 == Direction.Left
            if ____cond50 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond50 = ____cond50 or ____switch50 == Direction.Right
            if ____cond50 then
                element_to_pos.x = element_to_pos.x + 1
                break
            end
        until true
        local is_valid_x = element_to_pos.x >= 0 and element_to_pos.x < field_width
        local is_valid_y = element_to_pos.y >= 0 and element_to_pos.y < field_height
        if not is_valid_x or not is_valid_y then
            return
        end
        swap_elements(selected_element_pos.x, selected_element_pos.y, element_to_pos.x, element_to_pos.y)
        selected_element = nil
    end
    function on_up(item)
        local item_world_pos = go.get_world_position(item._hash)
        local element_pos = view.get_element_pos(item_world_pos)
        if try_click_activation(element_pos.x, element_pos.y) then
            return
        end
        if try_hammer_activation(element_pos.x, element_pos.y) then
            return
        end
    end
    function make_buster(combined_element, combination, buster)
        local function on_complite()
            field.on_combined_base(combined_element, combination)
            make_element(combined_element.x, combined_element.y, buster, true)
        end
        view.squash_animation(combined_element, combination.elements, on_complite)
    end
    function on_combined(combined_element, combination)
        repeat
            local ____switch58 = combination.type
            local ____cond58 = ____switch58 == CombinationType.Comb4
            if ____cond58 then
                make_buster(combined_element, combination, combination.angle == 0 and ElementId.HorizontalBuster or ElementId.VerticalBuster)
                break
            end
            ____cond58 = ____cond58 or ____switch58 == CombinationType.Comb5
            if ____cond58 then
                make_buster(combined_element, combination, ElementId.Diskosphere)
                break
            end
            ____cond58 = ____cond58 or ____switch58 == CombinationType.Comb2x2
            if ____cond58 then
                make_buster(combined_element, combination, ElementId.Helicopter)
                break
            end
            ____cond58 = ____cond58 or (____switch58 == CombinationType.Comb3x3a or ____switch58 == CombinationType.Comb3x3b)
            if ____cond58 then
                make_buster(combined_element, combination, ElementId.Dynamite)
                break
            end
            ____cond58 = ____cond58 or (____switch58 == CombinationType.Comb3x4 or ____switch58 == CombinationType.Comb3x5)
            if ____cond58 then
                make_buster(combined_element, combination, ElementId.AxisBuster)
                break
            end
            do
                field.on_combined_base(combined_element, combination)
                break
            end
        until true
    end
    function is_buster_element(x, y)
        return is_click_activation(x, y)
    end
    function is_axis_buster(x, y)
        local element = field.get_element(x, y)
        if element == NullElement then
            return false
        end
        return element.type == ElementId.VerticalBuster or element.type == ElementId.HorizontalBuster
    end
    function is_diskosphere(x, y)
        local element = field.get_element(x, y)
        if element == NullElement then
            return false
        end
        return element.type == ElementId.Diskosphere
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
    function try_activate_vertical_buster(data)
        if try_iteract_with_other_buster(
            data,
            {ElementId.HorizontalBuster, ElementId.VerticalBuster},
            function(item, other_item)
                view.squash_animation(
                    item,
                    {other_item},
                    function()
                        field.remove_element(other_item.x, other_item.y, true, false)
                        try_activate_axis_buster({x = item.x, y = item.y})
                    end
                )
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
    function try_activate_horizontal_buster(data)
        if try_iteract_with_other_buster(
            data,
            {ElementId.HorizontalBuster, ElementId.VerticalBuster},
            function(item, other_item)
                view.squash_animation(
                    item,
                    {other_item},
                    function()
                        field.remove_element(other_item.x, other_item.y, true, false)
                        try_activate_axis_buster({x = item.x, y = item.y})
                    end
                )
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
    function try_activate_axis_buster(data)
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
    function attack(x, y, element)
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
        view.attack_animation(
            element,
            target.x,
            target.y,
            function()
                field.remove_element(x, y, true, false)
                if not try_activate_buster_element({x = target.x, y = target.y}) then
                    field.remove_element(target.x, target.y, true, false)
                end
            end
        )
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
                view.squash_animation(
                    item,
                    {other_item},
                    function()
                        field.remove_element(other_item.x, other_item.y, true, false)
                    end
                )
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
        attack(data.x, data.y, helicopter)
        do
            local i = 0
            while i < 2 and was_iteraction do
                helicopter = make_element(data.x, data.y, ElementId.Helicopter, true)
                if helicopter ~= NullElement then
                    activated_elements[#activated_elements + 1] = helicopter.id
                    attack(data.x, data.y, helicopter)
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
                view.squash_animation(
                    item,
                    {other_item},
                    function()
                        field.remove_element(other_item.x, other_item.y, true, false)
                        range = 3
                    end
                )
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
            {ElementId.Dynamite, ElementId.HorizontalBuster, ElementId.VerticalBuster},
            function(item, other_item)
                view.squash_animation(
                    item,
                    {other_item},
                    function()
                        local other_element = field.get_element(other_item.x, other_item.y)
                        if other_element == NullElement then
                            return
                        end
                        local element_id = get_random_element_id()
                        if element_id == NullElement then
                            return
                        end
                        local element_data = GAME_CONFIG.element_database[element_id]
                        local elements = field.get_all_elements_by_type(element_data.type.index)
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
                )
            end
        ) then
            return
        end
        if try_iteract_with_other_buster(
            data,
            {ElementId.Diskosphere},
            function(item, other_item)
                view.squash_animation(
                    item,
                    {other_item},
                    function()
                        local other_element = field.get_element(other_item.x, other_item.y)
                        if other_element == NullElement then
                            return
                        end
                        for ____, element_id in ipairs(GAME_CONFIG.base_elements) do
                            local element_data = GAME_CONFIG.element_database[element_id]
                            local elements = field.get_all_elements_by_type(element_data.type.index)
                            for ____, element in ipairs(elements) do
                                field.remove_element(element.x, element.y, true, false)
                            end
                        end
                        field.remove_element(item.x, item.y, true, false)
                        field.remove_element(other_item.x, other_item.y, true, false)
                    end
                )
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
            view.squash_animation(
                {x = data.x, y = data.y, id = element.id},
                {{x = data.other_x, y = data.other_y, id = other_element.id}},
                function()
                    local element_id = other_element.type
                    local element_data = GAME_CONFIG.element_database[element_id]
                    local elements = field.get_all_elements_by_type(element_data.type.index)
                    field.remove_element(data.x, data.y, true, false)
                    for ____, element in ipairs(elements) do
                        field.remove_element(element.x, element.y, true, false)
                    end
                end
            )
            return
        end
        local element_id = get_random_element_id()
        if element_id == NullElement then
            return
        end
        local element_data = GAME_CONFIG.element_database[element_id]
        local elements = field.get_all_elements_by_type(element_data.type.index)
        field.remove_element(data.x, data.y, true, true)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, true)
        end
    end
    function try_activate_buster_element(data)
        local element = field.get_element(data.x, data.y)
        if element == NullElement then
            return false
        end
        repeat
            local ____switch145 = element.type
            local ____cond145 = ____switch145 == ElementId.AxisBuster
            if ____cond145 then
                try_activate_axis_buster(data)
                break
            end
            ____cond145 = ____cond145 or ____switch145 == ElementId.VerticalBuster
            if ____cond145 then
                try_activate_vertical_buster(data)
                break
            end
            ____cond145 = ____cond145 or ____switch145 == ElementId.HorizontalBuster
            if ____cond145 then
                try_activate_horizontal_buster(data)
                break
            end
            ____cond145 = ____cond145 or ____switch145 == ElementId.Helicopter
            if ____cond145 then
                try_activate_helicopter(data)
                break
            end
            ____cond145 = ____cond145 or ____switch145 == ElementId.Dynamite
            if ____cond145 then
                try_activate_dynamite(data)
                break
            end
            ____cond145 = ____cond145 or ____switch145 == ElementId.Diskosphere
            if ____cond145 then
                try_activate_diskosphere(data)
                break
            end
            do
                return false
            end
        until true
        flow.delay(buster_delay)
        return true
    end
    function on_damaged_element(damaged_info)
        view.damaged_element_animation(
            damaged_info.element.id,
            function()
                __TS__ArraySplice(
                    activated_elements,
                    __TS__ArrayFindIndex(
                        activated_elements,
                        function(____, element_id) return element_id == damaged_info.element.id end
                    ),
                    1
                )
            end
        )
    end
    function on_cell_activated(item_info)
        local cell = field.get_cell(item_info.x, item_info.y)
        if cell == NotActiveCell then
            return
        end
        local item = view.get_item_by_index(item_info.id)
        if item == nil then
            return
        end
        view.delete_item(item, true)
        repeat
            local ____switch152 = cell.type
            local ____cond152 = ____switch152 == CellType.ActionLocked
            if ____cond152 then
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
            ____cond152 = ____cond152 or ____switch152 == bit.bor(CellType.ActionLockedNear, CellType.Wall)
            if ____cond152 then
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
                    local ____index_0 = index
                    index = ____index_0 - 1
                    if ____index_0 == 0 then
                        return tonumber(key)
                    end
                end
            end
        end
        return NullElement
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
        view.request_element_animation(element, x, y, 0)
        return element
    end
    function revert_step()
        local current_state = table.remove(previous_states)
        local previous_state = table.remove(previous_states)
        if current_state == nil or previous_state == nil then
            return false
        end
        previous_state = view.revert_step_animation(current_state, previous_state)
        if previous_state ~= nil then
            field.load_state(previous_state)
            previous_states[#previous_states + 1] = previous_state
        end
        return true
    end
    function wait_event()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            view.do_message(message_id, _message, sender)
            repeat
                local ____switch185 = message_id
                local ____cond185 = ____switch185 == ID_MESSAGES.MSG_ON_DOWN_ITEM
                if ____cond185 then
                    on_down(_message.item)
                    break
                end
                ____cond185 = ____cond185 or ____switch185 == ID_MESSAGES.MSG_ON_UP_ITEM
                if ____cond185 then
                    on_up(_message.item)
                    break
                end
                ____cond185 = ____cond185 or ____switch185 == ID_MESSAGES.MSG_ON_MOVE
                if ____cond185 then
                    on_move(_message)
                    break
                end
                ____cond185 = ____cond185 or ____switch185 == to_hash("REVERT_STEP")
                if ____cond185 then
                    revert_step()
                    break
                end
            until true
        end
    end
    min_swipe_distance = GAME_CONFIG.min_swipe_distance
    move_delay_after_combination = GAME_CONFIG.move_delay_after_combination
    wait_time_after_move = GAME_CONFIG.wait_time_after_move
    buster_delay = GAME_CONFIG.buster_delay
    level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    local move_direction = level_config.field.move_direction
    busters = level_config.busters
    field = Field(8, 8, move_direction)
    view = View()
    previous_states = {}
    selected_element = nil
    activated_elements = {}
    local function init()
        field.init()
        view.init()
        setup_element_types()
        field.set_callback_is_can_move(is_can_move)
        field.set_callback_on_move_element(view.on_move_element_animation)
        field.set_callback_on_damaged_element(on_damaged_element)
        field.set_callback_on_combinated(on_combined)
        field.set_callback_on_request_element(on_request_element)
        field.set_callback_on_cell_activated(on_cell_activated)
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
        GameStorage.set("hammer_counts", 5)
        busters.hammer_active = GameStorage.get("hammer_counts") <= 0
        previous_states[#previous_states + 1] = field.save_state()
        wait_event()
    end
    init()
    return {}
end
return ____exports
