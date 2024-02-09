local ____lualib = require("lualib_bundle")
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local ____exports = {}
local ____math_utils = require("utils.math_utils")
local Direction = ____math_utils.Direction
local rotate_matrix_90 = ____math_utils.rotate_matrix_90
____exports.CombinationType = CombinationType or ({})
____exports.CombinationType.Comb3 = 0
____exports.CombinationType[____exports.CombinationType.Comb3] = "Comb3"
____exports.CombinationType.Comb4 = 1
____exports.CombinationType[____exports.CombinationType.Comb4] = "Comb4"
____exports.CombinationType.Comb5 = 2
____exports.CombinationType[____exports.CombinationType.Comb5] = "Comb5"
____exports.CombinationType.Comb2x2 = 3
____exports.CombinationType[____exports.CombinationType.Comb2x2] = "Comb2x2"
____exports.CombinationType.Comb3x3a = 4
____exports.CombinationType[____exports.CombinationType.Comb3x3a] = "Comb3x3a"
____exports.CombinationType.Comb3x3b = 5
____exports.CombinationType[____exports.CombinationType.Comb3x3b] = "Comb3x3b"
____exports.CombinationType.Comb3x4 = 6
____exports.CombinationType[____exports.CombinationType.Comb3x4] = "Comb3x4"
____exports.CombinationType.Comb3x5 = 7
____exports.CombinationType[____exports.CombinationType.Comb3x5] = "Comb3x5"
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
    {{1, 1}, {1, 1}},
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
____exports.CellType.ActionLockedNear = 2
____exports.CellType[____exports.CellType.ActionLockedNear] = "ActionLockedNear"
____exports.CellType.NotMoved = 3
____exports.CellType[____exports.CellType.NotMoved] = "NotMoved"
____exports.CellType.Locked = 4
____exports.CellType[____exports.CellType.Locked] = "Locked"
____exports.CellType.Disabled = 5
____exports.CellType[____exports.CellType.Disabled] = "Disabled"
____exports.CellType.Wall = 6
____exports.CellType[____exports.CellType.Wall] = "Wall"
____exports.NotActiveCell = -1
____exports.NullElement = -1
____exports.ProcessMode = ProcessMode or ({})
____exports.ProcessMode.Combinate = 0
____exports.ProcessMode[____exports.ProcessMode.Combinate] = "Combinate"
____exports.ProcessMode.MoveElements = 1
____exports.ProcessMode[____exports.ProcessMode.MoveElements] = "MoveElements"
function ____exports.Field(size_x, size_y, move_direction)
    if move_direction == nil then
        move_direction = Direction.Up
    end
    local is_combined_elements_base, is_combined_elements, try_damage_element, on_near_activation_base, on_near_activation, on_cell_activation_base, on_cell_activation, get_cell, set_element, get_element, swap_elements, get_neighbor_cells, is_available_cell_type_for_move, state, damaged_elements, cb_is_combined_elements, cb_on_near_activation, cb_on_cell_activation, cb_on_cell_activated, cb_on_damaged_element
    function is_combined_elements_base(e1, e2)
        return e1.type == e2.type or state.element_types[e1.type] and state.element_types[e2.type] and state.element_types[e1.type].index == state.element_types[e2.type].index
    end
    function is_combined_elements(e1, e2)
        if cb_is_combined_elements ~= nil then
            return cb_is_combined_elements(e1, e2)
        else
            return is_combined_elements_base(e1, e2)
        end
    end
    function try_damage_element(damaged_info)
        if __TS__ArrayFind(
            damaged_elements,
            function(____, element) return element == damaged_info.element.id end
        ) == nil then
            damaged_elements[#damaged_elements + 1] = damaged_info.element.id
            if cb_on_damaged_element ~= nil then
                cb_on_damaged_element(damaged_info)
            end
            return true
        end
        return false
    end
    function on_near_activation_base(items)
        for ____, item in ipairs(items) do
            local cell = get_cell(item.x, item.y)
            if cell ~= ____exports.NotActiveCell and bit.band(cell.type, ____exports.CellType.ActionLockedNear) == ____exports.CellType.ActionLockedNear and cell.cnt_near_acts ~= nil then
                cell.cnt_near_acts = cell.cnt_near_acts + 1
                if cb_on_cell_activated ~= nil then
                    cb_on_cell_activated(item)
                end
            end
        end
    end
    function on_near_activation(cells)
        if cb_on_near_activation ~= nil then
            return cb_on_near_activation(cells)
        else
            on_near_activation_base(cells)
        end
    end
    function on_cell_activation_base(item)
        local activated = false
        local cell = get_cell(item.x, item.y)
        if cell ~= ____exports.NotActiveCell and bit.band(cell.type, ____exports.CellType.ActionLocked) == ____exports.CellType.ActionLocked and cell.cnt_acts ~= nil then
            cell.cnt_acts = cell.cnt_acts + 1
            activated = true
        end
        if cell ~= ____exports.NotActiveCell and bit.band(cell.type, ____exports.CellType.ActionLockedNear) == ____exports.CellType.ActionLockedNear and cell.cnt_near_acts ~= nil then
            cell.cnt_near_acts = cell.cnt_near_acts + 1
            activated = true
        end
        if activated and cb_on_cell_activated ~= nil then
            cb_on_cell_activated(item)
        end
    end
    function on_cell_activation(item)
        if cb_on_cell_activation ~= nil then
            return cb_on_cell_activation(item)
        else
            on_cell_activation_base(item)
        end
    end
    function get_cell(x, y)
        return state.cells[y + 1][x + 1]
    end
    function set_element(x, y, element)
        state.elements[y + 1][x + 1] = element
    end
    function get_element(x, y)
        return state.elements[y + 1][x + 1]
    end
    function swap_elements(from_x, from_y, to_x, to_y)
        local elements_from = get_element(from_x, from_y)
        set_element(
            from_x,
            from_y,
            get_element(to_x, to_y)
        )
        set_element(to_x, to_y, elements_from)
    end
    function get_neighbor_cells(x, y, mask)
        if mask == nil then
            mask = {{0, 1, 0}, {1, 1, 1}, {0, 1, 0}}
        end
        local neighbors = {}
        do
            local i = y - 1
            while i <= y + 1 do
                do
                    local j = x - 1
                    while j <= x + 1 do
                        if i >= 0 and i < size_y and j >= 0 and j < size_x and mask[i - (y - 1) + 1][j - (x - 1) + 1] == 1 then
                            local item = get_cell(j, i)
                            if item ~= ____exports.NotActiveCell then
                                neighbors[#neighbors + 1] = {x = j, y = i, id = item.id}
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
    function is_available_cell_type_for_move(cell)
        local is_not_moved = bit.band(cell.type, ____exports.CellType.NotMoved) == ____exports.CellType.NotMoved
        local is_locked = bit.band(cell.type, ____exports.CellType.Locked) == ____exports.CellType.Locked
        local is_wall = bit.band(cell.type, ____exports.CellType.Wall) == ____exports.CellType.Wall
        if is_not_moved or is_locked or is_wall then
            return false
        end
        return true
    end
    state = {cells = {}, element_types = {}, elements = {}}
    local last_moved_elements = {}
    damaged_elements = {}
    local cb_is_can_move
    local cb_on_combinated
    local cb_on_move_element
    local cb_on_request_element
    local function init()
        do
            local y = 0
            while y < size_y do
                state.cells[y + 1] = {}
                state.elements[y + 1] = {}
                do
                    local x = 0
                    while x < size_x do
                        state.cells[y + 1][x + 1] = ____exports.NotActiveCell
                        state.elements[y + 1][x + 1] = ____exports.NullElement
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
                    local ____cond14 = ____switch14 == ____exports.CombinationType.Comb3 or ____switch14 == ____exports.CombinationType.Comb4 or ____switch14 == ____exports.CombinationType.Comb5
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
                                                        local cell = get_cell(x + j, y + i)
                                                        local element = get_element(x + j, y + i)
                                                        if cell == ____exports.NotActiveCell or not is_available_cell_type_for_move(cell) or element == ____exports.NullElement then
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
        local element_from = get_element(from_x, from_y)
        if element_from == ____exports.NullElement then
            return false
        end
        local element_type_from = state.element_types[element_from.type]
        if not element_type_from.is_movable then
            return false
        end
        local element_to = get_element(to_x, to_y)
        if element_to ~= ____exports.NullElement then
            local element_type_to = state.element_types[element_from.type]
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
    local function on_move_element(from_x, from_y, to_x, to_y, element)
        if cb_on_move_element ~= nil then
            return cb_on_move_element(
                from_x,
                from_y,
                to_x,
                to_y,
                element
            )
        end
    end
    local function set_callback_on_move_element(fnc)
        cb_on_move_element = fnc
    end
    local function on_combined_base(combined_element, combination)
        for ____, item in ipairs(combination.elements) do
            local cell = get_cell(item.x, item.y)
            local element = get_element(item.x, item.y)
            if cell ~= ____exports.NotActiveCell and element ~= ____exports.NullElement and element.id == item.id then
                on_cell_activation({x = item.x, y = item.y, id = cell.id})
                on_near_activation(get_neighbor_cells(item.x, item.y))
                try_damage_element({x = item.x, y = item.y, element = element})
                __TS__ArraySplice(
                    damaged_elements,
                    __TS__ArrayFindIndex(
                        damaged_elements,
                        function(____, elem) return elem == element.id end
                    ),
                    1
                )
                set_element(item.x, item.y, ____exports.NullElement)
            end
        end
    end
    local function set_callback_on_combinated(fnc)
        cb_on_combinated = fnc
    end
    local function on_combinated(combined_element, combination)
        if cb_on_combinated ~= nil then
            return cb_on_combinated(combined_element, combination)
        else
            return on_combined_base(combined_element, combination)
        end
    end
    local function set_callback_on_damaged_element(fnc)
        cb_on_damaged_element = fnc
    end
    local function set_callback_on_near_activation(fnc)
        cb_on_near_activation = fnc
    end
    local function set_callback_on_cell_activation(fnc)
        cb_on_cell_activation = fnc
    end
    local function set_callback_on_cell_activated(fnc)
        cb_on_cell_activated = fnc
    end
    local function on_request_element(x, y)
        if cb_on_request_element ~= nil then
            return cb_on_request_element(x, y)
        end
        return ____exports.NullElement
    end
    local function set_callback_on_request_element(fnc)
        cb_on_request_element = fnc
    end
    local function get_free_cells()
        local free_cells = {}
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        local cell = get_cell(x, y)
                        if cell ~= ____exports.NotActiveCell and get_element(x, y) == ____exports.NullElement then
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
    local function get_all_elements_by_type(element_type)
        local target_elements = {}
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        local cell = get_cell(x, y)
                        local element = get_element(x, y)
                        if cell ~= ____exports.NotActiveCell and is_available_cell_type_for_move(cell) and element ~= ____exports.NullElement and element.type == element_type then
                            target_elements[#target_elements + 1] = {x = x, y = y, id = element.id}
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return target_elements
    end
    local function set_cell(x, y, cell)
        state.cells[y + 1][x + 1] = cell
    end
    local function set_element_type(id, element_type)
        state.element_types[id] = element_type
    end
    local function get_neighbor_elements(x, y, mask)
        if mask == nil then
            mask = {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}}
        end
        local neighbors = {}
        do
            local i = y - 1
            while i <= y + 1 do
                do
                    local j = x - 1
                    while j <= x + 1 do
                        if i >= 0 and i < size_y and j >= 0 and j < size_x and mask[i - (y - 1) + 1][j - (x - 1) + 1] == 1 then
                            local item = get_element(j, i)
                            if item ~= ____exports.NullElement then
                                neighbors[#neighbors + 1] = {x = j, y = i, id = item.id}
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
        local cell = get_cell(x, y)
        if cell == ____exports.NotActiveCell then
            return
        end
        on_cell_activation({x = x, y = y, id = cell.id})
        if is_near_activation then
            on_near_activation(get_neighbor_cells(x, y))
        end
        if not is_available_cell_type_for_move(cell) then
            return
        end
        local element = get_element(x, y)
        if element == ____exports.NullElement then
            return
        end
        if is_damaging and try_damage_element({x = x, y = y, element = element}) then
            __TS__ArraySplice(
                damaged_elements,
                __TS__ArrayFindIndex(
                    damaged_elements,
                    function(____, elem) return elem == element.id end
                ),
                1
            )
            set_element(x, y, ____exports.NullElement)
        end
    end
    local function is_valid_element_pos(x, y)
        if x < 0 or x >= size_x or y < 0 or y >= size_y then
            return false
        end
        local element = get_element(x, y)
        if element == ____exports.NullElement then
            return false
        end
        return true
    end
    local function try_move(from_x, from_y, to_x, to_y)
        local cell_from = get_cell(from_x, from_y)
        if cell_from == ____exports.NotActiveCell or not is_available_cell_type_for_move(cell_from) then
            return false
        end
        local cell_to = get_cell(to_x, to_y)
        if cell_to == ____exports.NotActiveCell or not is_available_cell_type_for_move(cell_to) then
            return false
        end
        local is_can = is_can_move(from_x, from_y, to_x, to_y)
        if is_can then
            swap_elements(from_x, from_y, to_x, to_y)
            local element_from = get_element(from_x, from_y)
            if element_from ~= ____exports.NullElement then
                last_moved_elements[#last_moved_elements + 1] = {x = from_x, y = from_y, id = element_from.id}
            end
            local element_to = get_element(to_x, to_y)
            if element_to ~= ____exports.NullElement then
                last_moved_elements[#last_moved_elements + 1] = {x = to_x, y = to_y, id = element_to.id}
            end
        end
        return is_can
    end
    local function try_click(x, y)
        local cell = get_cell(x, y)
        if cell == ____exports.NotActiveCell then
            return false
        end
        local element = get_element(x, y)
        if element == ____exports.NullElement then
            return false
        end
        local element_type = state.element_types[element.type]
        if not element_type.is_clickable then
            return false
        end
        return true
    end
    local function process_combinate()
        local is_procesed = false
        for ____, combination in ipairs(get_all_combinations()) do
            local found = false
            for ____, element in ipairs(combination.elements) do
                for ____, last_moved_element in ipairs(last_moved_elements) do
                    if last_moved_element.id == element.id then
                        on_combinated(element, combination)
                        found = true
                        break
                    end
                end
                if found then
                    break
                end
            end
            if found then
                is_procesed = true
            end
        end
        __TS__ArraySplice(last_moved_elements, 0, #last_moved_elements)
        return is_procesed
    end
    local function request_element(x, y)
        local element = on_request_element(x, y)
        if element ~= ____exports.NullElement then
            last_moved_elements[#last_moved_elements + 1] = {x = x, y = y, id = element.id}
        end
    end
    local function try_move_element_from_up(x, y)
        do
            local j = y
            while j >= 0 do
                local cell = get_cell(x, j)
                if cell ~= ____exports.NotActiveCell then
                    if not is_available_cell_type_for_move(cell) then
                        return false
                    end
                    local element = get_element(x, j)
                    if element ~= ____exports.NullElement then
                        set_element(x, y, element)
                        set_element(x, j, ____exports.NullElement)
                        on_move_element(
                            x,
                            j,
                            x,
                            y,
                            element
                        )
                        last_moved_elements[#last_moved_elements + 1] = {x = x, y = y, id = element.id}
                        return true
                    end
                end
                j = j - 1
            end
        end
        request_element(x, y)
        return true
    end
    local function try_move_element_from_down(x, y)
        do
            local j = y
            while j < size_y do
                local cell = get_cell(x, j)
                if cell ~= ____exports.NotActiveCell then
                    if not is_available_cell_type_for_move(cell) then
                        return false
                    end
                    local element = get_element(x, j)
                    if element ~= ____exports.NullElement then
                        set_element(x, y, element)
                        set_element(x, j, ____exports.NullElement)
                        on_move_element(
                            x,
                            j,
                            x,
                            y,
                            element
                        )
                        last_moved_elements[#last_moved_elements + 1] = {x = x, y = y, id = element.id}
                        return true
                    end
                end
                j = j + 1
            end
        end
        request_element(x, y)
        return true
    end
    local function try_move_element_from_left(x, y)
        do
            local j = x
            while j >= 0 do
                local cell = get_cell(j, y)
                if cell ~= ____exports.NotActiveCell then
                    if not is_available_cell_type_for_move(cell) then
                        return false
                    end
                    local element = get_element(j, y)
                    if element ~= ____exports.NullElement then
                        set_element(x, y, element)
                        set_element(j, y, ____exports.NullElement)
                        on_move_element(
                            j,
                            y,
                            x,
                            y,
                            element
                        )
                        last_moved_elements[#last_moved_elements + 1] = {x = x, y = y, id = element.id}
                        return true
                    end
                end
                j = j - 1
            end
        end
        request_element(x, y)
        return true
    end
    local function try_move_element_from_right(x, y)
        do
            local j = x
            while j < size_x do
                local cell = get_cell(j, y)
                if cell ~= ____exports.NotActiveCell then
                    if not is_available_cell_type_for_move(cell) then
                        return false
                    end
                    local element = get_element(j, y)
                    if element ~= ____exports.NullElement then
                        set_element(x, y, element)
                        set_element(j, y, ____exports.NullElement)
                        on_move_element(
                            j,
                            y,
                            x,
                            y,
                            element
                        )
                        last_moved_elements[#last_moved_elements + 1] = {x = x, y = y, id = element.id}
                        return true
                    end
                end
                j = j + 1
            end
        end
        request_element(x, y)
        return true
    end
    local function process_move()
        local is_procesed = false
        repeat
            local ____switch162 = move_direction
            local ____cond162 = ____switch162 == Direction.Up
            if ____cond162 then
                do
                    local y = size_y - 1
                    while y >= 0 do
                        do
                            local x = 0
                            while x < size_x do
                                local cell = get_cell(x, y)
                                local empty = get_element(x, y)
                                if empty == ____exports.NullElement and cell ~= ____exports.NotActiveCell and is_available_cell_type_for_move(cell) then
                                    try_move_element_from_up(x, y)
                                    is_procesed = true
                                end
                                x = x + 1
                            end
                        end
                        y = y - 1
                    end
                end
                break
            end
            ____cond162 = ____cond162 or ____switch162 == Direction.Down
            if ____cond162 then
                do
                    local y = 0
                    while y < size_y do
                        do
                            local x = 0
                            while x < size_x do
                                local cell = get_cell(x, y)
                                local empty = get_element(x, y)
                                if empty == ____exports.NullElement and cell ~= ____exports.NotActiveCell and is_available_cell_type_for_move(cell) then
                                    try_move_element_from_down(x, y)
                                    is_procesed = true
                                end
                                x = x + 1
                            end
                        end
                        y = y + 1
                    end
                end
                break
            end
            ____cond162 = ____cond162 or ____switch162 == Direction.Left
            if ____cond162 then
                do
                    local x = size_x - 1
                    while x >= 0 do
                        do
                            local y = 0
                            while y < size_y do
                                local cell = get_cell(x, y)
                                local empty = get_element(x, y)
                                if empty == ____exports.NullElement and cell ~= ____exports.NotActiveCell and is_available_cell_type_for_move(cell) then
                                    try_move_element_from_left(x, y)
                                    is_procesed = true
                                end
                                y = y + 1
                            end
                        end
                        x = x - 1
                    end
                end
                break
            end
            ____cond162 = ____cond162 or ____switch162 == Direction.Right
            if ____cond162 then
                do
                    local x = 0
                    while x < size_x do
                        do
                            local y = 0
                            while y < size_y do
                                local cell = get_cell(x, y)
                                local empty = get_element(x, y)
                                if empty == ____exports.NullElement and cell ~= ____exports.NotActiveCell and is_available_cell_type_for_move(cell) then
                                    try_move_element_from_right(x, y)
                                    is_procesed = true
                                end
                                y = y + 1
                            end
                        end
                        x = x + 1
                    end
                end
                break
            end
        until true
        return is_procesed
    end
    local function process_state(mode)
        repeat
            local ____switch176 = mode
            local ____cond176 = ____switch176 == ____exports.ProcessMode.Combinate
            if ____cond176 then
                return process_combinate()
            end
            ____cond176 = ____cond176 or ____switch176 == ____exports.ProcessMode.MoveElements
            if ____cond176 then
                return process_move()
            end
        until true
    end
    local function save_state()
        local st = {cells = {}, element_types = state.element_types, elements = {}}
        do
            local y = 0
            while y < size_y do
                st.cells[y + 1] = {}
                st.elements[y + 1] = {}
                do
                    local x = 0
                    while x < size_x do
                        st.cells[y + 1][x + 1] = state.cells[y + 1][x + 1]
                        st.elements[y + 1][x + 1] = state.elements[y + 1][x + 1]
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        local copy_state = json.decode(json.encode(st))
        for ____, ____value in ipairs(__TS__ObjectEntries(copy_state.element_types)) do
            local key = ____value[1]
            local value = ____value[2]
            local id = tonumber(key)
            if id ~= nil then
                copy_state.element_types[id] = value
            end
        end
        return copy_state
    end
    local function load_state(st)
        state.element_types = st.element_types
        do
            local y = 0
            while y < size_y do
                state.cells[y + 1] = {}
                state.elements[y + 1] = {}
                do
                    local x = 0
                    while x < size_x do
                        state.cells[y + 1][x + 1] = st.cells[y + 1][x + 1]
                        state.elements[y + 1][x + 1] = st.elements[y + 1][x + 1]
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
        swap_elements = swap_elements,
        get_neighbor_cells = get_neighbor_cells,
        get_neighbor_elements = get_neighbor_elements,
        is_valid_element_pos = is_valid_element_pos,
        is_available_cell_type_for_move = is_available_cell_type_for_move,
        try_move = try_move,
        try_click = try_click,
        process_state = process_state,
        save_state = save_state,
        load_state = load_state,
        get_all_combinations = get_all_combinations,
        get_all_available_steps = get_all_available_steps,
        get_free_cells = get_free_cells,
        get_all_elements_by_type = get_all_elements_by_type,
        try_damage_element = try_damage_element,
        set_callback_on_move_element = set_callback_on_move_element,
        set_callback_is_can_move = set_callback_is_can_move,
        is_can_move_base = is_can_move_base,
        set_callback_is_combined_elements = set_callback_is_combined_elements,
        is_combined_elements_base = is_combined_elements_base,
        set_callback_on_combinated = set_callback_on_combinated,
        on_combined_base = on_combined_base,
        set_callback_on_damaged_element = set_callback_on_damaged_element,
        set_callback_on_request_element = set_callback_on_request_element,
        set_callback_on_near_activation = set_callback_on_near_activation,
        on_near_activation_base = on_near_activation_base,
        set_callback_on_cell_activation = set_callback_on_cell_activation,
        on_cell_activation_base = on_cell_activation_base,
        set_callback_on_cell_activated = set_callback_on_cell_activated
    }
end
return ____exports