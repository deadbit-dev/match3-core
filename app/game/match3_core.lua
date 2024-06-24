local ____lualib = require("lualib_bundle")
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local ____exports = {}
local ____math_utils = require("utils.math_utils")
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
____exports.CombinationMasks = {
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
____exports.CellType.Base = 1
____exports.CellType[____exports.CellType.Base] = "Base"
____exports.CellType.ActionLocked = 2
____exports.CellType[____exports.CellType.ActionLocked] = "ActionLocked"
____exports.CellType.ActionLockedNear = 4
____exports.CellType[____exports.CellType.ActionLockedNear] = "ActionLockedNear"
____exports.CellType.NotMoved = 8
____exports.CellType[____exports.CellType.NotMoved] = "NotMoved"
____exports.CellType.Locked = 16
____exports.CellType[____exports.CellType.Locked] = "Locked"
____exports.CellType.Disabled = 32
____exports.CellType[____exports.CellType.Disabled] = "Disabled"
____exports.NotActiveCell = -1
____exports.NullElement = -1
____exports.MoveType = MoveType or ({})
____exports.MoveType.Swaped = 0
____exports.MoveType[____exports.MoveType.Swaped] = "Swaped"
____exports.MoveType.Falled = 1
____exports.MoveType[____exports.MoveType.Falled] = "Falled"
____exports.MoveType.Requested = 2
____exports.MoveType[____exports.MoveType.Requested] = "Requested"
____exports.MoveType.Filled = 3
____exports.MoveType[____exports.MoveType.Filled] = "Filled"
____exports.ProcessMode = ProcessMode or ({})
____exports.ProcessMode.Combinate = 0
____exports.ProcessMode[____exports.ProcessMode.Combinate] = "Combinate"
____exports.ProcessMode.MoveElements = 1
____exports.ProcessMode[____exports.ProcessMode.MoveElements] = "MoveElements"
function ____exports.Field(size_x, size_y, complex_process_move)
    if complex_process_move == nil then
        complex_process_move = true
    end
    local rotate_all_masks, is_combined_elements_base, is_combined_elements, try_damage_element, on_near_activation_base, on_near_activation, on_cell_activation_base, on_cell_activation, get_cell, set_element, get_element, swap_elements, get_neighbor_cells, is_available_cell_type_for_activation, is_available_cell_type_for_move, save_state, state, rotated_masks, damaged_elements, cb_is_combined_elements, cb_on_near_activation, cb_on_cell_activation, cb_on_cell_activated, cb_on_damaged_element
    function rotate_all_masks()
        do
            local mask_index = #____exports.CombinationMasks - 1
            while mask_index >= 0 do
                local mask = ____exports.CombinationMasks[mask_index + 1]
                local is_one_row_mask = false
                repeat
                    local ____switch9 = mask_index
                    local ____cond9 = ____switch9 == ____exports.CombinationType.Comb3 or ____switch9 == ____exports.CombinationType.Comb4 or ____switch9 == ____exports.CombinationType.Comb5
                    if ____cond9 then
                        is_one_row_mask = true
                        break
                    end
                until true
                rotated_masks[mask_index + 1] = {}
                local ____rotated_masks_index_0 = rotated_masks[mask_index + 1]
                ____rotated_masks_index_0[#____rotated_masks_index_0 + 1] = mask
                local angle = 0
                local max_angle = is_one_row_mask and 90 or 270
                while angle <= max_angle do
                    local ____rotated_masks_index_1 = rotated_masks[mask_index + 1]
                    ____rotated_masks_index_1[#____rotated_masks_index_1 + 1] = rotate_matrix_90(mask)
                    angle = angle + 90
                end
                mask_index = mask_index - 1
            end
        end
    end
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
    function try_damage_element(item)
        if __TS__ArrayFind(
            damaged_elements,
            function(____, element) return element == item.uid end
        ) == nil then
            damaged_elements[#damaged_elements + 1] = item.uid
            if cb_on_damaged_element ~= nil then
                cb_on_damaged_element(item)
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
                            local cell = get_cell(j, i)
                            if cell ~= ____exports.NotActiveCell then
                                neighbors[#neighbors + 1] = {x = j, y = i, uid = cell.uid}
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
    function is_available_cell_type_for_activation(cell)
        local is_disabled = bit.band(cell.type, ____exports.CellType.Disabled) == ____exports.CellType.Disabled
        if is_disabled then
            return false
        end
        return true
    end
    function is_available_cell_type_for_move(cell)
        local is_not_moved = bit.band(cell.type, ____exports.CellType.NotMoved) == ____exports.CellType.NotMoved
        local is_locked = bit.band(cell.type, ____exports.CellType.Locked) == ____exports.CellType.Locked
        local is_disabled = bit.band(cell.type, ____exports.CellType.Disabled) == ____exports.CellType.Disabled
        if is_not_moved or is_locked or is_disabled then
            return false
        end
        return true
    end
    function save_state()
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
    state = {cells = {}, element_types = {}, elements = {}}
    rotated_masks = {}
    local moved_elements = {}
    damaged_elements = {}
    local cb_is_can_move
    local cb_on_combinated
    local cb_on_move_element
    local cb_on_moved_elements
    local cb_on_request_element
    local function init()
        rotate_all_masks()
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
    local function get_rotated_masks(mask_index)
        return rotated_masks[mask_index + 1]
    end
    local function get_all_combinations(check)
        if check == nil then
            check = false
        end
        local combinations = {}
        local combinations_elements = {}
        do
            local mask_index = #____exports.CombinationMasks - 1
            while mask_index >= 0 do
                local masks = rotated_masks[mask_index + 1]
                do
                    local i = 0
                    while i < #masks do
                        local mask = masks[i + 1]
                        do
                            local y = 0
                            while y + #mask <= size_y do
                                do
                                    local x = 0
                                    while x + #mask[1] <= size_x do
                                        local combination = {}
                                        combination.elements = {}
                                        combination.angle = i * 90
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
                                                            if element == ____exports.NullElement or cell == ____exports.NotActiveCell or not is_available_cell_type_for_activation(cell) then
                                                                is_combined = false
                                                                break
                                                            end
                                                            if combinations_elements[element.uid] then
                                                                is_combined = false
                                                                break
                                                            end
                                                            local ____combination_elements_2 = combination.elements
                                                            ____combination_elements_2[#____combination_elements_2 + 1] = {x = x + j, y = y + i, uid = element.uid}
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
                                            for ____, element in ipairs(combination.elements) do
                                                combinations_elements[element.uid] = true
                                            end
                                            if check then
                                                return combinations
                                            end
                                        end
                                        x = x + 1
                                    end
                                end
                                y = y + 1
                            end
                        end
                        i = i + 1
                    end
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
        local cell_from = get_cell(from_x, from_y)
        if cell_from == ____exports.NotActiveCell or not is_available_cell_type_for_move(cell_from) then
            return false
        end
        local cell_to = get_cell(to_x, to_y)
        if cell_to == ____exports.NotActiveCell or not is_available_cell_type_for_move(cell_to) then
            return false
        end
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
        local combinations = get_all_combinations(true)
        for ____, combination in ipairs(combinations) do
            for ____, element in ipairs(combination.elements) do
                local is_from = element.uid == element_from.uid
                local is_to = element_to ~= ____exports.NullElement and element_to.uid == element.uid
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
    local function on_moved_elements(elements, state)
        if cb_on_moved_elements ~= nil then
            return cb_on_moved_elements(elements, state)
        end
    end
    local function set_callback_on_moved_elements(fnc)
        cb_on_moved_elements = fnc
    end
    local function on_combined_base(combined_element, combination)
        for ____, item in ipairs(combination.elements) do
            local cell = get_cell(item.x, item.y)
            local element = get_element(item.x, item.y)
            if cell ~= ____exports.NotActiveCell and element ~= ____exports.NullElement and element.uid == item.uid then
                on_cell_activation({x = item.x, y = item.y, uid = cell.uid})
                on_near_activation(get_neighbor_cells(item.x, item.y))
                if try_damage_element(item) then
                    set_element(item.x, item.y, ____exports.NullElement)
                    __TS__ArraySplice(
                        damaged_elements,
                        __TS__ArrayFindIndex(
                            damaged_elements,
                            function(____, elem) return elem == element.uid end
                        ),
                        1
                    )
                end
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
                            free_cells[#free_cells + 1] = {x = x, y = y, uid = cell.uid}
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
                            target_elements[#target_elements + 1] = {x = x, y = y, uid = element.uid}
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return target_elements
    end
    local function get_pos_by_uid(uid)
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        local element = get_element(x, y)
                        if element ~= ____exports.NullElement and element.uid == uid then
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
    local function set_cell(x, y, cell)
        state.cells[y + 1][x + 1] = cell
    end
    local function set_element_type(id, element_type)
        state.element_types[id] = element_type
    end
    local function get_element_type(id)
        return state.element_types[id]
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
                            local element = get_element(j, i)
                            if element ~= ____exports.NullElement then
                                neighbors[#neighbors + 1] = {x = j, y = i, uid = element.uid}
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
    local function remove_element(x, y, is_damaging, is_near_activation, all)
        if all == nil then
            all = false
        end
        local cell = get_cell(x, y)
        if cell == ____exports.NotActiveCell then
            return
        end
        on_cell_activation({x = x, y = y, uid = cell.uid})
        if is_near_activation then
            on_near_activation(get_neighbor_cells(x, y))
        end
        if not all and not is_available_cell_type_for_move(cell) then
            return
        end
        local element = get_element(x, y)
        if element == ____exports.NullElement then
            return
        end
        if is_damaging and try_damage_element({x = x, y = y, uid = element.uid}) then
            __TS__ArraySplice(
                damaged_elements,
                __TS__ArrayFindIndex(
                    damaged_elements,
                    function(____, elem) return elem == element.uid end
                ),
                1
            )
            set_element(x, y, ____exports.NullElement)
        end
        return element
    end
    local function is_available_cell_type_for_click(cell)
        local is_disabled = bit.band(cell.type, ____exports.CellType.Disabled) == ____exports.CellType.Disabled
        if is_disabled then
            return false
        end
        return true
    end
    local function try_move(from_x, from_y, to_x, to_y)
        local is_can = is_can_move(from_x, from_y, to_x, to_y)
        if is_can then
            swap_elements(from_x, from_y, to_x, to_y)
            local element_from = get_element(from_x, from_y)
            if element_from ~= ____exports.NullElement then
                local index = __TS__ArrayFindIndex(
                    moved_elements,
                    function(____, e) return e.data.uid == element_from.uid end
                )
                if index == -1 then
                    moved_elements[#moved_elements + 1] = {points = {{to_x = to_x, to_y = to_y, type = ____exports.MoveType.Swaped}}, data = element_from}
                else
                    local ____moved_elements_index_points_3 = moved_elements[index + 1].points
                    ____moved_elements_index_points_3[#____moved_elements_index_points_3 + 1] = {to_x = to_x, to_y = to_y, type = ____exports.MoveType.Swaped}
                end
            end
            local element_to = get_element(to_x, to_y)
            if element_to ~= ____exports.NullElement then
                local index = __TS__ArrayFindIndex(
                    moved_elements,
                    function(____, e) return e.data.uid == element_to.uid end
                )
                if index == -1 then
                    moved_elements[#moved_elements + 1] = {points = {{to_x = from_x, to_y = from_y, type = ____exports.MoveType.Swaped}}, data = element_to}
                else
                    local ____moved_elements_index_points_4 = moved_elements[index + 1].points
                    ____moved_elements_index_points_4[#____moved_elements_index_points_4 + 1] = {to_x = from_x, to_y = from_y, type = ____exports.MoveType.Swaped}
                end
            end
        end
        return is_can
    end
    local function try_click(x, y)
        local cell = get_cell(x, y)
        if cell == ____exports.NotActiveCell or not is_available_cell_type_for_click(cell) then
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
                for ____, moved_element in ipairs(moved_elements) do
                    if moved_element.data.uid == element.uid then
                        on_combinated(element, combination)
                        found = true
                        break
                    end
                end
                if found then
                    break
                end
            end
            if not found then
                local element = combination.elements[math.random(0, #combination.elements - 1) + 1]
                on_combinated(element, combination)
            end
            is_procesed = true
        end
        __TS__ArraySplice(moved_elements, 0, #moved_elements)
        return is_procesed
    end
    local function request_element(x, y)
        local element = on_request_element(x, y)
        if element ~= ____exports.NullElement then
            local j = GAME_CONFIG.movement_to_point and y - 1 or 0
            local ____temp_5 = #moved_elements + 1
            moved_elements[____temp_5] = {points = {{to_x = x, to_y = j, type = ____exports.MoveType.Requested}}, data = element}
            local index = ____temp_5 - 1
            while true do
                local ____j_7 = j
                j = ____j_7 + 1
                if not (____j_7 < y) then
                    break
                end
                local ____moved_elements_index_points_6 = moved_elements[index + 1].points
                ____moved_elements_index_points_6[#____moved_elements_index_points_6 + 1] = {to_x = x, to_y = j, type = ____exports.MoveType.Falled}
            end
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
                        j = GAME_CONFIG.movement_to_point and y - 1 or j
                        while true do
                            local ____j_9 = j
                            j = ____j_9 + 1
                            if not (____j_9 < y) then
                                break
                            end
                            local index = __TS__ArrayFindIndex(
                                moved_elements,
                                function(____, e) return e.data.uid == element.uid end
                            )
                            if index == -1 then
                                moved_elements[#moved_elements + 1] = {points = {{to_x = x, to_y = j, type = ____exports.MoveType.Falled}}, data = element}
                            else
                                local ____moved_elements_index_points_8 = moved_elements[index + 1].points
                                ____moved_elements_index_points_8[#____moved_elements_index_points_8 + 1] = {to_x = x, to_y = j, type = ____exports.MoveType.Falled}
                            end
                        end
                        return true
                    end
                end
                j = j - 1
            end
        end
        request_element(x, y)
        return true
    end
    local function try_move_element_from_corners(x, y)
        local neighbor_cells = get_neighbor_cells(x, y, {{1, 0, 1}, {0, 0, 0}, {0, 0, 0}})
        for ____, neighbor_cell in ipairs(neighbor_cells) do
            local cell = get_cell(neighbor_cell.x, neighbor_cell.y)
            if cell ~= ____exports.NotActiveCell and is_available_cell_type_for_move(cell) then
                local element = get_element(neighbor_cell.x, neighbor_cell.y)
                if element ~= ____exports.NullElement then
                    set_element(x, y, element)
                    set_element(neighbor_cell.x, neighbor_cell.y, ____exports.NullElement)
                    on_move_element(
                        neighbor_cell.x,
                        neighbor_cell.y,
                        x,
                        y,
                        element
                    )
                    local index = __TS__ArrayFindIndex(
                        moved_elements,
                        function(____, e) return e.data.uid == element.uid end
                    )
                    if index == -1 then
                        moved_elements[#moved_elements + 1] = {points = {{to_x = x, to_y = y, type = ____exports.MoveType.Filled}}, data = element}
                    else
                        local ____moved_elements_index_points_10 = moved_elements[index + 1].points
                        ____moved_elements_index_points_10[#____moved_elements_index_points_10 + 1] = {to_x = x, to_y = y, type = ____exports.MoveType.Filled}
                    end
                    return true
                end
            end
        end
        return false
    end
    local function process_falling()
        local is_procesed = false
        do
            local y = size_y - 1
            while y >= 0 do
                do
                    local x = 0
                    while x < size_x do
                        local cell = get_cell(x, y)
                        local element = get_element(x, y)
                        if element == ____exports.NullElement and cell ~= ____exports.NotActiveCell and is_available_cell_type_for_move(cell) then
                            try_move_element_from_up(x, y)
                            is_procesed = true
                        end
                        x = x + 1
                    end
                end
                y = y - 1
            end
        end
        return is_procesed
    end
    local function process_filling()
        do
            local y = size_y - 1
            while y >= 0 do
                do
                    local x = 0
                    while x < size_x do
                        local cell = get_cell(x, y)
                        local element = get_element(x, y)
                        if element == ____exports.NullElement and cell ~= ____exports.NotActiveCell and is_available_cell_type_for_move(cell) then
                            if try_move_element_from_corners(x, y) then
                                return true
                            end
                        end
                        x = x + 1
                    end
                end
                y = y - 1
            end
        end
        return false
    end
    local function process_move()
        local is_procesed = process_falling()
        if complex_process_move then
            while process_filling() do
                process_falling()
            end
        end
        if is_procesed then
            on_moved_elements(
                __TS__ObjectAssign({}, moved_elements),
                save_state()
            )
        end
        return is_procesed
    end
    local function process_state(mode)
        repeat
            local ____switch190 = mode
            local ____cond190 = ____switch190 == ____exports.ProcessMode.Combinate
            if ____cond190 then
                return process_combinate()
            end
            ____cond190 = ____cond190 or ____switch190 == ____exports.ProcessMode.MoveElements
            if ____cond190 then
                return process_move()
            end
        until true
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
    return {
        init = init,
        set_element_type = set_element_type,
        get_element_type = get_element_type,
        set_cell = set_cell,
        get_cell = get_cell,
        set_element = set_element,
        get_element = get_element,
        remove_element = remove_element,
        swap_elements = swap_elements,
        get_pos_by_uid = get_pos_by_uid,
        get_neighbor_cells = get_neighbor_cells,
        get_neighbor_elements = get_neighbor_elements,
        is_available_cell_type_for_move = is_available_cell_type_for_move,
        try_move = try_move,
        try_click = try_click,
        process_state = process_state,
        save_state = save_state,
        load_state = load_state,
        get_all_combinations = get_all_combinations,
        get_free_cells = get_free_cells,
        get_all_elements_by_type = get_all_elements_by_type,
        try_damage_element = try_damage_element,
        is_available_cell_type_for_activation = is_available_cell_type_for_activation,
        get_rotated_masks = get_rotated_masks,
        set_callback_on_move_element = set_callback_on_move_element,
        set_callback_on_moved_elements = set_callback_on_moved_elements,
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
