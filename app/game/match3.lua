local ____lualib = require("lualib_bundle")
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local __TS__TypeOf = ____lualib.__TS__TypeOf
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local ____exports = {}
local ____math_utils = require("utils.math_utils")
local rotate_matrix_90 = ____math_utils.rotate_matrix_90
____exports.MoveDirection = MoveDirection or ({})
____exports.MoveDirection.Up = 0
____exports.MoveDirection[____exports.MoveDirection.Up] = "Up"
____exports.MoveDirection.Down = 1
____exports.MoveDirection[____exports.MoveDirection.Down] = "Down"
____exports.MoveDirection.Left = 2
____exports.MoveDirection[____exports.MoveDirection.Left] = "Left"
____exports.MoveDirection.Right = 3
____exports.MoveDirection[____exports.MoveDirection.Right] = "Right"
____exports.MoveDirection.None = 4
____exports.MoveDirection[____exports.MoveDirection.None] = "None"
local CombinationType = CombinationType or ({})
CombinationType.Comb3 = 0
CombinationType[CombinationType.Comb3] = "Comb3"
CombinationType.Comb4 = 1
CombinationType[CombinationType.Comb4] = "Comb4"
CombinationType.Comb5 = 2
CombinationType[CombinationType.Comb5] = "Comb5"
CombinationType.Comb3x3 = 3
CombinationType[CombinationType.Comb3x3] = "Comb3x3"
CombinationType.Comb3x4 = 4
CombinationType[CombinationType.Comb3x4] = "Comb3x4"
CombinationType.Comb3x5 = 5
CombinationType[CombinationType.Comb3x5] = "Comb3x5"
local CombinationMasks = {
    {{1, 1, 1}},
    {{1, 1, 1, 1}},
    {{
        1,
        1,
        1,
        1,
        1
    }},
    {{0, 1, 0}, {0, 1, 0}, {1, 1, 1}},
    {{1, 0, 0}, {1, 0, 0}, {1, 1, 1}},
    {{0, 1, 0, 0}, {0, 1, 0, 0}, {1, 1, 1, 1}},
    {{0, 0, 1, 0}, {0, 0, 1, 0}, {1, 1, 1, 1}},
    {{
        0,
        0,
        1,
        0,
        0
    }, {
        0,
        0,
        1,
        0,
        0
    }, {
        1,
        1,
        1,
        1,
        1
    }}
}
____exports.CellType = CellType or ({})
____exports.CellType.Base = 0
____exports.CellType[____exports.CellType.Base] = "Base"
____exports.CellType.ActionLocked = 1
____exports.CellType[____exports.CellType.ActionLocked] = "ActionLocked"
____exports.CellType.NotMoved = 2
____exports.CellType[____exports.CellType.NotMoved] = "NotMoved"
____exports.CellType.Locked = 3
____exports.CellType[____exports.CellType.Locked] = "Locked"
____exports.CellType.Disabled = 4
____exports.CellType[____exports.CellType.Disabled] = "Disabled"
____exports.CellType.Wall = 5
____exports.CellType[____exports.CellType.Wall] = "Wall"
____exports.NotActiveCell = -1
____exports.NullElement = -1
____exports.ProcessMode = ProcessMode or ({})
____exports.ProcessMode.Combinate = 0
____exports.ProcessMode[____exports.ProcessMode.Combinate] = "Combinate"
____exports.ProcessMode.MoveElements = 1
____exports.ProcessMode[____exports.ProcessMode.MoveElements] = "MoveElements"
function ____exports.Match3(size_x, size_y)
    local is_combined_elements_base, is_combined_elements, try_damage_element, swap_elements, element_types, elements, cb_is_combined_elements, cb_on_damaged_element
    function is_combined_elements_base(e1, e2)
        return e1.type == e2.type or element_types[e1.type] and element_types[e2.type] and element_types[e1.type].index == element_types[e2.type].index
    end
    function is_combined_elements(e1, e2)
        if cb_is_combined_elements ~= nil then
            return cb_is_combined_elements(e1, e2)
        else
            return is_combined_elements_base(e1, e2)
        end
    end
    function try_damage_element(damaged_info)
        if cb_on_damaged_element ~= nil then
            return cb_on_damaged_element(damaged_info)
        end
    end
    function swap_elements(from_x, from_y, to_x, to_y)
        local elements_from = elements[from_y + 1][from_x + 1]
        elements[from_y + 1][from_x + 1] = elements[to_y + 1][to_x + 1]
        elements[to_y + 1][to_x + 1] = elements_from
    end
    local move_direction = ____exports.MoveDirection.Up
    local cells = {}
    element_types = {}
    elements = {}
    local last_moved_elements = {}
    local cb_is_can_move
    local cb_on_combinated
    local cb_ob_near_activation
    local cb_on_cell_activated
    local function init()
        do
            local y = 0
            while y < size_y do
                cells[y + 1] = {}
                elements[y + 1] = {}
                do
                    local x = 0
                    while x < size_x do
                        cells[y + 1][x + 1] = ____exports.NotActiveCell
                        elements[y + 1][x + 1] = ____exports.NullElement
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    local function is_unique_element_combination(element, combinations)
        for ____, comb in ipairs(combinations) do
            for ____, elem in ipairs(comb.elements) do
                if elem.id == element.id then
                    return false
                end
            end
        end
        return true
    end
    local function get_all_combinations()
        local combinations = {}
        do
            local mask_index = #CombinationMasks - 1
            while mask_index >= 0 do
                local mask = CombinationMasks[mask_index + 1]
                local is_one_row_mask = false
                repeat
                    local ____switch14 = mask_index
                    local ____cond14 = ____switch14 == CombinationType.Comb3 or ____switch14 == CombinationType.Comb4 or ____switch14 == CombinationType.Comb5
                    if ____cond14 then
                        is_one_row_mask = true
                        break
                    end
                until true
                local angle = 0
                local max_angle = is_one_row_mask and 90 or 270
                while angle <= max_angle do
                    do
                        local y = 0
                        while y + #mask <= size_y do
                            do
                                local x = 0
                                while x + #mask[1] <= size_x do
                                    local combination = {}
                                    combination.elements = {}
                                    combination.angle = angle
                                    local is_combined = true
                                    local last_element = ____exports.NullElement
                                    do
                                        local i = 0
                                        while i < #mask and is_combined do
                                            do
                                                local j = 0
                                                while j < #mask[1] and is_combined do
                                                    if mask[i + 1][j + 1] == 1 then
                                                        local element = elements[y + i + 1][x + j + 1]
                                                        if element == ____exports.NullElement then
                                                            is_combined = false
                                                            break
                                                        end
                                                        if not is_unique_element_combination(element, combinations) then
                                                            is_combined = false
                                                            break
                                                        end
                                                        local ____combination_elements_0 = combination.elements
                                                        ____combination_elements_0[#____combination_elements_0 + 1] = {x = x + j, y = y + i, id = element.id}
                                                        if last_element ~= ____exports.NullElement then
                                                            is_combined = is_combined_elements(last_element, element)
                                                        end
                                                        last_element = element
                                                    end
                                                    j = j + 1
                                                end
                                            end
                                            i = i + 1
                                        end
                                    end
                                    if is_combined then
                                        local is_find = false
                                        for ____, element in ipairs(combination.elements) do
                                            for ____, last_moved_element in ipairs(last_moved_elements) do
                                                if last_moved_element.id == element.id then
                                                    combination.combined_element = element
                                                    is_find = true
                                                    break
                                                end
                                            end
                                            if is_find then
                                                break
                                            end
                                        end
                                        combination.type = mask_index
                                        combinations[#combinations + 1] = combination
                                    end
                                    x = x + 1
                                end
                            end
                            y = y + 1
                        end
                    end
                    mask = rotate_matrix_90(mask)
                    angle = angle + 90
                end
                mask_index = mask_index - 1
            end
        end
        return combinations
    end
    local function set_callback_is_combined_elements(fnc)
        cb_is_combined_elements = fnc
    end
    local function is_can_move_base(from_x, from_y, to_x, to_y)
        local element_from = elements[from_y + 1][from_x + 1]
        if element_from == ____exports.NullElement then
            return false
        end
        local element_type_from = element_types[element_from.type]
        if not element_type_from.is_movable then
            return false
        end
        local element_to = elements[to_y + 1][to_x + 1]
        if element_to ~= ____exports.NullElement then
            local element_type_to = element_types[element_from.type]
            if not element_type_to.is_movable then
                return false
            end
        end
        swap_elements(from_x, from_y, to_x, to_y)
        local was = false
        local combinations = get_all_combinations()
        for ____, combination in ipairs(combinations) do
            for ____, element in ipairs(combination.elements) do
                local is_from = element.id == element_from.id
                local is_to = element_to ~= ____exports.NullElement and element_to.id == element.id
                if is_from or is_to then
                    was = true
                    break
                end
            end
            if was then
                break
            end
        end
        swap_elements(from_x, from_y, to_x, to_y)
        return was
    end
    local function is_can_move(from_x, from_y, to_x, to_y)
        if cb_is_can_move ~= nil then
            return cb_is_can_move(from_x, from_y, to_x, to_y)
        else
            return is_can_move_base(from_x, from_y, to_x, to_y)
        end
    end
    local function set_callback_is_can_move(fnc)
        cb_is_can_move = fnc
    end
    local function on_combined_base(combined_item, items, combination_type, combination_angle)
        __TS__ArrayForEach(
            items,
            function(____, item)
                local element = elements[item.y + 1][item.x + 1]
                if element ~= ____exports.NullElement then
                    try_damage_element({x = item.x, y = item.y, element = element})
                    if element.id == item.id then
                        elements[item.y + 1][item.x + 1] = ____exports.NullElement
                    end
                end
            end
        )
    end
    local function set_callback_on_combinated(fnc)
        cb_on_combinated = fnc
    end
    local function on_combinated(combined_item, items, combination_type, combination_angle)
        if cb_on_combinated ~= nil then
            return cb_on_combinated(combined_item, items, combination_type, combination_angle)
        else
            return on_combined_base(combined_item, items, combination_type, combination_angle)
        end
    end
    local function set_callback_on_damaged_element(fnc)
        cb_on_damaged_element = fnc
    end
    local function on_near_activation_base(items)
        __TS__ArrayForEach(
            items,
            function(____, item)
                local cell = cells[item.y + 1][item.x + 1]
                if cell == ____exports.NotActiveCell then
                    return
                end
                if cell.type ~= ____exports.CellType.ActionLocked then
                    return
                end
                if cell.cnt_acts then
                    cell.cnt_acts = cell.cnt_acts + 1
                end
                if cell.cnt_acts ~= cell.cnt_acts_req then
                    return
                end
                if cb_on_cell_activated ~= nil then
                    cb_on_cell_activated(item)
                end
            end
        )
    end
    local function set_callback_ob_near_activation(fnc)
        cb_ob_near_activation = fnc
    end
    local function set_callback_on_cell_activated(fnc)
        cb_on_cell_activated = fnc
    end
    local function on_near_activation(cells)
        if cb_ob_near_activation ~= nil then
            return cb_ob_near_activation(cells)
        else
            on_near_activation_base(cells)
        end
    end
    local function get_free_cells()
        local free_cells = {}
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        local cell = cells[y + 1][x + 1]
                        if cell ~= ____exports.NotActiveCell and elements[y + 1][x + 1] == ____exports.NullElement then
                            free_cells[#free_cells + 1] = {x = x, y = y, id = cell.id}
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return free_cells
    end
    local function set_cell(x, y, cell)
        cells[y + 1][x + 1] = cell
    end
    local function get_cell(x, y)
        return cells[y + 1][x + 1]
    end
    local function set_element_type(id, element_type)
        element_types[id] = element_type
    end
    local function set_element(x, y, element)
        elements[y + 1][x + 1] = element
    end
    local function get_element(x, y)
        return elements[y + 1][x + 1]
    end
    local function get_neighbors(x, y, array)
        if array == nil then
            array = elements
        end
        local neighbors = {}
        do
            local i = y - 1
            while i <= y + 1 do
                do
                    local j = x - 1
                    while j <= x + 1 do
                        if i >= 0 and i < size_y and j >= 0 and j < size_x and not (i == y and j == x) then
                            local id = -1
                            local item = array[i + 1][j + 1]
                            repeat
                                local ____switch88 = __TS__TypeOf(array)
                                local ____cond88 = ____switch88 == __TS__TypeOf(elements)
                                if ____cond88 then
                                    if item ~= ____exports.NullElement then
                                        id = item.id
                                    end
                                    break
                                end
                                ____cond88 = ____cond88 or ____switch88 == __TS__TypeOf(cells)
                                if ____cond88 then
                                    id = item.id
                                    break
                                end
                            until true
                            if id == -1 then
                                neighbors[#neighbors + 1] = {x = j, y = i, id = id}
                            end
                        end
                        j = j + 1
                    end
                end
                i = i + 1
            end
        end
        return neighbors
    end
    local function remove_element(x, y, is_damaging, is_near_activation)
        local element = elements[y + 1][x + 1]
        if element == ____exports.NullElement then
            return
        end
        if is_damaging then
            try_damage_element({x = x, y = y, element = element})
        end
        if is_near_activation then
            on_near_activation(get_neighbors(x, y))
        end
        elements[y + 1][x + 1] = ____exports.NullElement
    end
    local function is_available_cell_type(cell)
        repeat
            local ____switch96 = cell.type
            local ____cond96 = ____switch96 == ____exports.CellType.NotMoved or ____switch96 == ____exports.CellType.Locked or ____switch96 == ____exports.CellType.Wall
            if ____cond96 then
                return false
            end
            ____cond96 = ____cond96 or ____switch96 == ____exports.CellType.ActionLocked
            if ____cond96 then
                if cell.cnt_acts ~= cell.cnt_acts_req then
                    return false
                end
                break
            end
        until true
        return true
    end
    local function try_move(from_x, from_y, to_x, to_y)
        local cell_from = cells[from_y + 1][from_x + 1]
        if cell_from == ____exports.NotActiveCell or not is_available_cell_type(cell_from) then
            return false
        end
        local cell_to = cells[to_y + 1][to_x + 1]
        if cell_to == ____exports.NotActiveCell or not is_available_cell_type(cell_to) then
            return false
        end
        local is_can = is_can_move(from_x, from_y, to_x, to_y)
        if is_can then
            swap_elements(from_x, from_y, to_x, to_y)
            local element_from = elements[from_y + 1][from_x + 1]
            if element_from ~= ____exports.NullElement then
                last_moved_elements[#last_moved_elements + 1] = {x = from_x, y = from_y, id = element_from.id}
            end
            local element_to = elements[to_y + 1][to_x + 1]
            if element_to ~= ____exports.NullElement then
                last_moved_elements[#last_moved_elements + 1] = {x = to_x, y = to_y, id = element_to.id}
            end
        end
        return is_can
    end
    local function try_click(x, y)
        local cell = cells[y + 1][x + 1]
        if cell == ____exports.NotActiveCell then
            return false
        end
        local element = elements[y + 1][x + 1]
        if element == ____exports.NullElement then
            return false
        end
        local element_type = element_types[element.type]
        if not element_type.is_clickable then
            return false
        end
        return true
    end
    local function process_state(mode)
        repeat
            local ____switch109 = mode
            local is_combined, combinations
            local ____cond109 = ____switch109 == ____exports.ProcessMode.Combinate
            if ____cond109 then
                is_combined = false
                combinations = get_all_combinations()
                for ____, combination in ipairs(combinations) do
                    on_combinated(combination.combined_element, combination.elements, combination.type, combination.angle)
                    __TS__ArrayForEach(
                        combination.elements,
                        function(____, element)
                            on_near_activation(get_neighbors(element.x, element.y, cells))
                        end
                    )
                    is_combined = true
                end
                if is_combined then
                    __TS__ArraySplice(last_moved_elements, 0, #last_moved_elements)
                    return true
                end
                break
            end
            ____cond109 = ____cond109 or ____switch109 == ____exports.ProcessMode.MoveElements
            if ____cond109 then
                break
            end
        until true
        return false
    end
    local function save_state()
        return {cells = cells, elements = elements}
    end
    local function load_state(state)
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        set_cell(x, y, state.cells[y + 1][x + 1])
                        set_element(x, y, state.elements[y + 1][x + 1])
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    local function get_all_available_steps()
        return {}
    end
    return {
        init = init,
        set_element_type = set_element_type,
        set_cell = set_cell,
        get_cell = get_cell,
        set_element = set_element,
        get_element = get_element,
        remove_element = remove_element,
        try_move = try_move,
        try_click = try_click,
        process_state = process_state,
        save_state = save_state,
        load_state = load_state,
        get_all_combinations = get_all_combinations,
        get_all_available_steps = get_all_available_steps,
        get_free_cells = get_free_cells,
        set_callback_is_can_move = set_callback_is_can_move,
        is_can_move_base = is_can_move_base,
        set_callback_is_combined_elements = set_callback_is_combined_elements,
        is_combined_elements_base = is_combined_elements_base,
        set_callback_on_combinated = set_callback_on_combinated,
        on_combined_base = on_combined_base,
        set_callback_on_damaged_element = set_callback_on_damaged_element,
        set_callback_ob_near_activation = set_callback_ob_near_activation,
        on_near_activation_base = on_near_activation_base,
        set_callback_on_cell_activated = set_callback_on_cell_activated
    }
end
return ____exports
