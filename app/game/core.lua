local ____exports = {}
local ____math_utils = require("utils.math_utils")
local rotateMatrix = ____math_utils.rotateMatrix
function ____exports.is_type_cell(cell, ____type)
    return bit.band(cell.type, ____type) == ____type
end
function ____exports.is_available_cell_type_for_move(cell)
    local is_not_moved = ____exports.is_type_cell(cell, ____exports.CellType.NotMoved)
    local is_locked = ____exports.is_type_cell(cell, ____exports.CellType.Locked)
    local is_disabled = ____exports.is_type_cell(cell, ____exports.CellType.Disabled)
    if is_not_moved or is_locked or is_disabled then
        return false
    end
    return true
end
____exports.CombinationType = CombinationType or ({})
____exports.CombinationType.Comb3 = 0
____exports.CombinationType[____exports.CombinationType.Comb3] = "Comb3"
____exports.CombinationType.Comb2x2 = 1
____exports.CombinationType[____exports.CombinationType.Comb2x2] = "Comb2x2"
____exports.CombinationType.Comb4 = 2
____exports.CombinationType[____exports.CombinationType.Comb4] = "Comb4"
____exports.CombinationType.Comb3x3a = 3
____exports.CombinationType[____exports.CombinationType.Comb3x3a] = "Comb3x3a"
____exports.CombinationType.Comb3x3b = 4
____exports.CombinationType[____exports.CombinationType.Comb3x3b] = "Comb3x3b"
____exports.CombinationType.Comb3x4a = 5
____exports.CombinationType[____exports.CombinationType.Comb3x4a] = "Comb3x4a"
____exports.CombinationType.Comb3x4b = 6
____exports.CombinationType[____exports.CombinationType.Comb3x4b] = "Comb3x4b"
____exports.CombinationType.Comb3x5 = 7
____exports.CombinationType[____exports.CombinationType.Comb3x5] = "Comb3x5"
____exports.CombinationType.Comb5 = 8
____exports.CombinationType[____exports.CombinationType.Comb5] = "Comb5"
____exports.CombinationMasks = {
    {{1, 1, 1}},
    {{1, 1}, {1, 1}},
    {{1, 1, 1, 1}},
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
    }},
    {{
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
____exports.CellState = CellState or ({})
____exports.CellState.Idle = 0
____exports.CellState[____exports.CellState.Idle] = "Idle"
____exports.CellState.Busy = 1
____exports.CellState[____exports.CellState.Busy] = "Busy"
____exports.NotActiveCell = -1
____exports.ElementType = ElementType or ({})
____exports.ElementType.Movable = 1
____exports.ElementType[____exports.ElementType.Movable] = "Movable"
____exports.ElementType.Clickable = 2
____exports.ElementType[____exports.ElementType.Clickable] = "Clickable"
____exports.ElementState = ElementState or ({})
____exports.ElementState.Idle = 0
____exports.ElementState[____exports.ElementState.Idle] = "Idle"
____exports.ElementState.Swap = 1
____exports.ElementState[____exports.ElementState.Swap] = "Swap"
____exports.ElementState.Fall = 2
____exports.ElementState[____exports.ElementState.Fall] = "Fall"
____exports.ElementState.Busy = 3
____exports.ElementState[____exports.ElementState.Busy] = "Busy"
____exports.NullElement = -1
____exports.NotFound = nil
____exports.NotDamage = nil
function ____exports.Field(size_x, size_y)
    local rotate_all_masks, set_cell, get_cell, get_cell_pos, set_element, get_element, get_element_pos, swap_elements, get_neighbor_cells, search_combination, on_element_damaged, on_cell_damaged, on_cell_damaged_base, on_near_cells_damaged, on_near_cells_damaged_base, is_combined_elements, is_combined_elements_base, falling_down, falling_through_corner, is_can_swap, is_can_swap_base, on_request_element, is_available_cell_type_for_activation, is_available_cell_type_for_click, is_type_element, is_movable_element, is_clickable_element, get_last_pos_in_column, is_pos_empty, state, rotated_masks, cb_is_can_swap, cb_is_combined_elements, cb_on_element_damaged, cb_on_cell_damaged, cb_on_near_cells_damaged, cb_on_request_element
    function rotate_all_masks()
        do
            local mask_index = #____exports.CombinationMasks - 1
            while mask_index >= 0 do
                local mask = ____exports.CombinationMasks[mask_index + 1]
                local is_one_row_mask = false
                repeat
                    local ____switch14 = mask_index
                    local ____cond14 = ____switch14 == ____exports.CombinationType.Comb3 or ____switch14 == ____exports.CombinationType.Comb4 or ____switch14 == ____exports.CombinationType.Comb5
                    if ____cond14 then
                        is_one_row_mask = true
                        break
                    end
                until true
                rotated_masks[mask_index + 1] = {}
                local ____rotated_masks_index_0 = rotated_masks[mask_index + 1]
                ____rotated_masks_index_0[#____rotated_masks_index_0 + 1] = mask
                local angle = 90
                local max_angle = is_one_row_mask and 90 or 270
                while angle <= max_angle do
                    local ____rotated_masks_index_1 = rotated_masks[mask_index + 1]
                    ____rotated_masks_index_1[#____rotated_masks_index_1 + 1] = rotateMatrix(mask, angle)
                    angle = angle + 90
                end
                mask_index = mask_index - 1
            end
        end
    end
    function set_cell(pos, cell)
        state.cells[pos.y + 1][pos.x + 1] = cell
    end
    function get_cell(pos)
        return state.cells[pos.y + 1][pos.x + 1]
    end
    function get_cell_pos(cell)
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        local current_cell = get_cell({x = x, y = y})
                        if current_cell ~= ____exports.NotActiveCell and current_cell == cell then
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
    function set_element(pos, element)
        state.elements[pos.y + 1][pos.x + 1] = element
    end
    function get_element(pos)
        return state.elements[pos.y + 1][pos.x + 1]
    end
    function get_element_pos(element)
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        local current_element = get_element({x = x, y = y})
                        if current_element ~= ____exports.NullElement and current_element == element then
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
    function swap_elements(from, to)
        local elements_from = get_element(from)
        set_element(
            from,
            get_element(to)
        )
        set_element(to, elements_from)
    end
    function get_neighbor_cells(pos, mask)
        if mask == nil then
            mask = {{0, 1, 0}, {1, 1, 1}, {0, 1, 0}}
        end
        local neighbors = {}
        do
            local i = pos.y - 1
            while i <= pos.y + 1 do
                do
                    local j = pos.x - 1
                    while j <= pos.x + 1 do
                        if i >= 0 and i < size_y and j >= 0 and j < size_x and mask[i - (pos.y - 1) + 1][j - (pos.x - 1) + 1] == 1 then
                            local cell = get_cell({x = j, y = i})
                            if cell ~= ____exports.NotActiveCell then
                                neighbors[#neighbors + 1] = cell
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
    function search_combination(combined_pos)
        do
            local mask_index = #____exports.CombinationMasks - 1
            while mask_index >= 0 do
                local masks = rotated_masks[mask_index + 1]
                do
                    local m = 0
                    while m < #masks do
                        local mask = masks[m + 1]
                        do
                            local my = 0
                            while my < #mask do
                                do
                                    local mx = 0
                                    while mx < #mask[my + 1] do
                                        local value = mask[my + 1][mx + 1]
                                        if value == 1 then
                                            local combination = {combined_pos = combined_pos, elementsInfo = {}, angle = m * 90, type = mask_index}
                                            local start_y = combined_pos.y - my
                                            local end_y = combined_pos.y + (#mask - my)
                                            if start_y >= 0 and end_y < size_y then
                                                local start_x = combined_pos.x - mx
                                                local end_x = combined_pos.x + (#mask[my + 1] - mx)
                                                if start_x >= 0 and end_x < size_x then
                                                    local is_combined = true
                                                    local last_element = ____exports.NullElement
                                                    do
                                                        local i = 0
                                                        while i < #mask and is_combined do
                                                            do
                                                                local j = 0
                                                                while j < #mask[i + 1] and is_combined do
                                                                    if mask[i + 1][j + 1] == 1 then
                                                                        local pos = {x = start_x + j, y = start_y + i}
                                                                        local cell = get_cell(pos)
                                                                        local element = get_element(pos)
                                                                        if element == ____exports.NullElement or cell == ____exports.NotActiveCell or not is_available_cell_type_for_activation(cell) then
                                                                            is_combined = false
                                                                            break
                                                                        end
                                                                        if last_element ~= ____exports.NullElement then
                                                                            is_combined = is_combined_elements(last_element, element)
                                                                        end
                                                                        local ____combination_elementsInfo_2 = combination.elementsInfo
                                                                        ____combination_elementsInfo_2[#____combination_elementsInfo_2 + 1] = pos
                                                                        last_element = element
                                                                    end
                                                                    j = j + 1
                                                                end
                                                            end
                                                            i = i + 1
                                                        end
                                                    end
                                                    if is_combined then
                                                        return combination
                                                    end
                                                end
                                            end
                                        end
                                        mx = mx + 1
                                    end
                                end
                                my = my + 1
                            end
                        end
                        m = m + 1
                    end
                end
                mask_index = mask_index - 1
            end
        end
        return ____exports.NotFound
    end
    function on_element_damaged(pos, element)
        if cb_on_element_damaged ~= nil then
            cb_on_element_damaged(pos, element)
        end
    end
    function on_cell_damaged(cell)
        if cb_on_cell_damaged ~= ____exports.NotDamage then
            return cb_on_cell_damaged(cell)
        else
            return on_cell_damaged_base(cell)
        end
    end
    function on_cell_damaged_base(cell)
        if cell.strength == nil then
            return ____exports.NotDamage
        end
        if not ____exports.is_type_cell(cell, ____exports.CellType.ActionLocked) and not ____exports.is_type_cell(cell, ____exports.CellType.ActionLockedNear) then
            return ____exports.NotDamage
        end
        cell.strength = cell.strength - 1
        return {
            pos = get_cell_pos(cell),
            cell = cell
        }
    end
    function on_near_cells_damaged(cells)
        if cb_on_near_cells_damaged ~= nil then
            return cb_on_near_cells_damaged(cells)
        else
            return on_near_cells_damaged_base(cells)
        end
    end
    function on_near_cells_damaged_base(cells)
        local near_damaged_cells = {}
        for ____, cell in ipairs(cells) do
            if cell.strength ~= nil and ____exports.is_type_cell(cell, ____exports.CellType.ActionLockedNear) then
                cell.strength = cell.strength - 1
                near_damaged_cells[#near_damaged_cells + 1] = {
                    pos = get_cell_pos(cell),
                    cell = cell
                }
            end
        end
        return near_damaged_cells
    end
    function is_combined_elements(e1, e2)
        if cb_is_combined_elements ~= nil then
            return cb_is_combined_elements(e1, e2)
        else
            return is_combined_elements_base(e1, e2)
        end
    end
    function is_combined_elements_base(e1, e2)
        local is_same_id = e1.id == e2.id
        local is_same_type = e1.type == e2.type
        local is_right_state = e1.state == ____exports.ElementState.Idle and e2.state == ____exports.ElementState.Idle
        return is_same_id and is_same_type and is_right_state
    end
    function falling_down(element, moveInfo)
        local pos = get_element_pos(element)
        if pos.y >= get_last_pos_in_column(pos) then
            return false
        end
        local next_y = pos.y + 1
        local bottom_element = get_element({x = pos.x, y = next_y})
        if bottom_element ~= ____exports.NullElement then
            return false
        end
        local bottom_cell = get_cell({x = pos.x, y = next_y})
        if bottom_cell ~= ____exports.NotActiveCell then
            if not ____exports.is_available_cell_type_for_move(bottom_cell) or bottom_cell.state ~= ____exports.CellState.Idle then
                return false
            end
        end
        do
            local y = next_y
            while y < get_last_pos_in_column(pos) do
                local next_cell = get_cell({x = pos.x, y = y})
                if next_cell ~= ____exports.NotActiveCell then
                    if is_pos_empty({x = pos.x, y = y}) then
                        break
                    end
                    return false
                elseif not is_pos_empty({x = pos.x, y = y}) then
                    return false
                end
                y = y + 1
            end
        end
        swap_elements(pos, {x = pos.x, y = next_y})
        moveInfo.next_pos = {x = pos.x, y = next_y}
        return true
    end
    function falling_through_corner(element, moveInfo)
        local pos = get_element_pos(element)
        local neighbor_cells = get_neighbor_cells(pos, {{0, 0, 0}, {0, 0, 0}, {1, 0, 1}})
        for ____, neighbor_cell in ipairs(neighbor_cells) do
            if ____exports.is_available_cell_type_for_move(neighbor_cell) and neighbor_cell.state == ____exports.CellState.Idle then
                local neighbor_cell_pos = get_cell_pos(neighbor_cell)
                local element = get_element(neighbor_cell_pos)
                if element == ____exports.NullElement then
                    local available = false
                    do
                        local y = neighbor_cell_pos.y - 1
                        while y > 0 do
                            local top_cell = get_cell({x = neighbor_cell_pos.x, y = y})
                            local is_not_available_cell = top_cell ~= ____exports.NotActiveCell and not ____exports.is_available_cell_type_for_move(top_cell)
                            if is_not_available_cell then
                                available = true
                                break
                            end
                            local is_not_empty_pos = not is_pos_empty({x = neighbor_cell_pos.x, y = y})
                            if is_not_empty_pos then
                                available = false
                                break
                            end
                            y = y - 1
                        end
                    end
                    if available then
                        swap_elements(pos, neighbor_cell_pos)
                        moveInfo.next_pos = neighbor_cell_pos
                        return true
                    end
                end
            end
        end
        return false
    end
    function is_can_swap(from, to)
        if cb_is_can_swap ~= nil then
            return cb_is_can_swap(from, to)
        else
            return is_can_swap_base(from, to)
        end
    end
    function is_can_swap_base(from, to)
        local cell_from = get_cell(from)
        if cell_from == ____exports.NotActiveCell or not ____exports.is_available_cell_type_for_move(cell_from) or cell_from.state ~= ____exports.CellState.Idle then
            return false
        end
        local cell_to = get_cell(to)
        if cell_to == ____exports.NotActiveCell or not ____exports.is_available_cell_type_for_move(cell_to) or cell_to.state ~= ____exports.CellState.Idle then
            return false
        end
        local element_from = get_element(from)
        if element_from == ____exports.NullElement or not is_movable_element(element_from) or element_from.state ~= ____exports.ElementState.Idle then
            return false
        end
        local element_to = get_element(to)
        if element_to ~= ____exports.NullElement and (not is_movable_element(element_to) or element_to.state ~= ____exports.ElementState.Idle) then
            return false
        end
        swap_elements(from, to)
        local combination_from = search_combination(from)
        local combination_to = search_combination(to)
        local was = combination_from ~= ____exports.NotFound or combination_to ~= ____exports.NotFound
        swap_elements(to, from)
        return was
    end
    function on_request_element(pos)
        if cb_on_request_element ~= nil then
            return cb_on_request_element(pos)
        end
        return ____exports.NullElement
    end
    function is_available_cell_type_for_activation(cell)
        if ____exports.is_type_cell(cell, ____exports.CellType.Disabled) then
            return false
        end
        return true
    end
    function is_available_cell_type_for_click(cell)
        return not ____exports.is_type_cell(cell, ____exports.CellType.Disabled)
    end
    function is_type_element(element, ____type)
        return bit.band(element.type, ____type) == ____type
    end
    function is_movable_element(element)
        return is_type_element(element, ____exports.ElementType.Movable)
    end
    function is_clickable_element(element)
        return is_type_element(element, ____exports.ElementType.Clickable)
    end
    function get_last_pos_in_column(pos)
        do
            local y = size_y - 1
            while y > 0 do
                local cell = get_cell({x = pos.x, y = y})
                if cell ~= ____exports.NotActiveCell then
                    return y
                end
                y = y - 1
            end
        end
        return size_y - 1
    end
    function is_pos_empty(pos)
        local cell = get_cell(pos)
        local element = get_element(pos)
        return (cell == ____exports.NotActiveCell or ____exports.is_available_cell_type_for_move(cell) and cell.state == ____exports.CellState.Idle) and element == ____exports.NullElement
    end
    state = {cells = {}, elements = {}}
    rotated_masks = {}
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
                        set_cell({x = x, y = y}, ____exports.NotActiveCell)
                        set_element({x = x, y = y}, ____exports.NullElement)
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    local function save_state()
        local st = {cells = {}, elements = {}}
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
        return json.decode(json.encode(st))
    end
    local function load_state(st)
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
    local function set_cell_state(pos, state)
        local cell = get_cell(pos)
        if cell ~= ____exports.NotActiveCell then
            cell.state = state
        end
    end
    local function set_element_state(pos, state)
        local element = get_element(pos)
        if element ~= ____exports.NullElement then
            element.state = state
        end
    end
    local function get_neighbor_elements(pos, mask)
        if mask == nil then
            mask = {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}}
        end
        local neighbors = {}
        do
            local i = pos.y - 1
            while i <= pos.y + 1 do
                do
                    local j = pos.x - 1
                    while j <= pos.x + 1 do
                        if i >= 0 and i < size_y and j >= 0 and j < size_x and mask[i - (pos.y - 1) + 1][j - (pos.x - 1) + 1] == 1 then
                            local element = get_element({x = j, y = i})
                            if element ~= ____exports.NullElement then
                                neighbors[#neighbors + 1] = element
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
    local function get_free_cells()
        local free_cells = {}
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        local cell = get_cell({x = x, y = y})
                        if cell ~= ____exports.NotActiveCell and get_element({x = x, y = y}) == ____exports.NullElement then
                            free_cells[#free_cells + 1] = cell
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return free_cells
    end
    local function get_all_elements_by_id(element_id)
        local target_elements = {}
        do
            local y = 0
            while y < size_y do
                do
                    local x = 0
                    while x < size_x do
                        local cell = get_cell({x = x, y = y})
                        local element = get_element({x = x, y = y})
                        if cell ~= ____exports.NotActiveCell and element ~= ____exports.NullElement and element.id == element_id then
                            target_elements[#target_elements + 1] = element
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return target_elements
    end
    local function try_swap(from, to)
        local is_can = is_can_swap(from, to)
        if is_can then
            set_element_state(from, ____exports.ElementState.Swap)
            set_element_state(to, ____exports.ElementState.Swap)
            swap_elements(from, to)
        end
        return is_can
    end
    local function try_click(pos)
        local cell = get_cell(pos)
        if cell == ____exports.NotActiveCell or not is_available_cell_type_for_click(cell) or cell.state ~= ____exports.CellState.Idle then
            return false
        end
        local element = get_element(pos)
        if element == ____exports.NullElement or not is_clickable_element(element) or element.state ~= ____exports.ElementState.Idle then
            return false
        end
        return true
    end
    local function try_damage(pos, is_near_activation, without_element, force, only_cell)
        if is_near_activation == nil then
            is_near_activation = false
        end
        if without_element == nil then
            without_element = false
        end
        if force == nil then
            force = false
        end
        if only_cell == nil then
            only_cell = false
        end
        local damage_info = {}
        damage_info.pos = pos
        damage_info.damaged_cells = {}
        local cell = get_cell(pos)
        if cell == ____exports.NotActiveCell or not force and cell.state == ____exports.CellState.Busy then
            return ____exports.NotDamage
        end
        local damaged_cell = on_cell_damaged(cell)
        if damaged_cell ~= ____exports.NotDamage then
            local ____damage_info_damaged_cells_3 = damage_info.damaged_cells
            ____damage_info_damaged_cells_3[#____damage_info_damaged_cells_3 + 1] = damaged_cell
        end
        if is_near_activation then
            local near_activated_cells = on_near_cells_damaged(get_neighbor_cells(pos))
            for ____, near_activated_cell in ipairs(near_activated_cells) do
                local ____damage_info_damaged_cells_4 = damage_info.damaged_cells
                ____damage_info_damaged_cells_4[#____damage_info_damaged_cells_4 + 1] = near_activated_cell
            end
        end
        if without_element and not ____exports.is_available_cell_type_for_move(cell) or only_cell then
            if #damage_info.damaged_cells == 0 then
                return ____exports.NotDamage
            end
            return damage_info
        end
        local element = get_element(pos)
        if element == ____exports.NullElement or not force and element.state == ____exports.ElementState.Busy then
            if #damage_info.damaged_cells == 0 then
                return ____exports.NotDamage
            end
            return damage_info
        end
        damage_info.element = element
        set_element(pos, ____exports.NullElement)
        on_element_damaged(pos, element)
        return damage_info
    end
    local function set_callback_on_element_damaged(fnc)
        cb_on_element_damaged = fnc
    end
    local function set_callback_on_cell_damaged(fnc)
        cb_on_cell_damaged = fnc
    end
    local function set_callback_on_near_cells_damaged(fnc)
        cb_on_near_cells_damaged = fnc
    end
    local function combinate(combination)
        local damages_info = {}
        for ____, elementInfo in ipairs(combination.elementsInfo) do
            local damage_info = try_damage(elementInfo, true, false, true)
            if damage_info ~= ____exports.NotDamage then
                damages_info[#damages_info + 1] = damage_info
            end
        end
        return damages_info
    end
    local function set_callback_is_combined_elements(fnc)
        cb_is_combined_elements = fnc
    end
    local function fell_element(element)
        local moveInfo = {}
        moveInfo.element = element
        moveInfo.start_pos = get_element_pos(element)
        moveInfo.next_pos = moveInfo.start_pos
        local was = true
        if not falling_down(element, moveInfo) then
            was = falling_through_corner(element, moveInfo)
        end
        if was then
            set_element_state(moveInfo.next_pos, ____exports.ElementState.Fall)
            return moveInfo
        end
    end
    local function request_element(pos)
        local element = on_request_element(pos)
        set_element(pos, element)
        return element
    end
    local function set_callback_is_can_swap(fnc)
        cb_is_can_swap = fnc
    end
    local function set_callback_on_request_element(fnc)
        cb_on_request_element = fnc
    end
    local function is_outside_pos_in_column(pos)
        do
            local y = pos.y
            while y > 0 do
                local cell = get_cell({x = pos.x, y = y})
                if cell ~= ____exports.NotActiveCell then
                    return false
                end
                y = y - 1
            end
        end
        local cell = get_cell({x = pos.x, y = pos.y + 1})
        if cell == ____exports.NotActiveCell then
            return false
        end
        return true
    end
    local function get_first_pos_in_column(pos)
        do
            local y = 0
            while y < size_y do
                local cell = get_cell({x = pos.x, y = y})
                if cell ~= ____exports.NotActiveCell then
                    return y
                end
                y = y + 1
            end
        end
        return 0
    end
    return {
        init = init,
        save_state = save_state,
        load_state = load_state,
        set_cell = set_cell,
        get_cell = get_cell,
        get_cell_pos = get_cell_pos,
        set_cell_state = set_cell_state,
        set_element = set_element,
        get_element = get_element,
        get_element_pos = get_element_pos,
        set_element_state = set_element_state,
        swap_elements = swap_elements,
        get_neighbor_cells = get_neighbor_cells,
        get_neighbor_elements = get_neighbor_elements,
        try_swap = try_swap,
        try_click = try_click,
        get_free_cells = get_free_cells,
        get_all_elements_by_id = get_all_elements_by_id,
        search_combination = search_combination,
        try_damage = try_damage,
        combinate = combinate,
        fell_element = fell_element,
        set_callback_is_can_swap = set_callback_is_can_swap,
        is_can_swap_base = is_can_swap_base,
        set_callback_is_combined_elements = set_callback_is_combined_elements,
        is_combined_elements_base = is_combined_elements_base,
        set_callback_on_element_damaged = set_callback_on_element_damaged,
        on_element_damaged = on_element_damaged,
        set_callback_on_cell_damaged = set_callback_on_cell_damaged,
        on_cell_damaged_base = on_cell_damaged_base,
        set_callback_on_near_cells_damaged = set_callback_on_near_cells_damaged,
        on_near_cells_damaged_base = on_near_cells_damaged_base,
        set_callback_on_request_element = set_callback_on_request_element,
        request_element = request_element,
        is_available_cell_type_for_activation = is_available_cell_type_for_activation,
        is_available_cell_type_for_click = is_available_cell_type_for_click,
        is_movable_element = is_movable_element,
        is_clickable_element = is_clickable_element,
        is_type_cell = ____exports.is_type_cell,
        is_type_element = is_type_element,
        is_outside_pos_in_column = is_outside_pos_in_column,
        get_first_pos_in_column = get_first_pos_in_column,
        get_last_pos_in_column = get_last_pos_in_column,
        is_pos_empty = is_pos_empty
    }
end
return ____exports
