MoveDirection = MoveDirection or ({})
MoveDirection.Up = 0
MoveDirection[MoveDirection.Up] = "Up"
MoveDirection.Down = 1
MoveDirection[MoveDirection.Down] = "Down"
MoveDirection.Left = 2
MoveDirection[MoveDirection.Left] = "Left"
MoveDirection.Right = 3
MoveDirection[MoveDirection.Right] = "Right"
MoveDirection.None = 4
MoveDirection[MoveDirection.None] = "None"
CellType = CellType or ({})
CellType.Base = 0
CellType[CellType.Base] = "Base"
CellType.ActionLocked = 1
CellType[CellType.ActionLocked] = "ActionLocked"
CellType.NotMoved = 2
CellType[CellType.NotMoved] = "NotMoved"
CellType.Locked = 3
CellType[CellType.Locked] = "Locked"
CellType.Disabled = 4
CellType[CellType.Disabled] = "Disabled"
CellType.Wall = 5
CellType[CellType.Wall] = "Wall"
CombinationType = CombinationType or ({})
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
CombinationMasks = {
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
    {{0, 0, 1}, {0, 0, 1}, {1, 1, 1}},
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
NullElement = 0
ProcessMode = ProcessMode or ({})
ProcessMode.Combinate = 0
ProcessMode[ProcessMode.Combinate] = "Combinate"
ProcessMode.MoveElements = 1
ProcessMode[ProcessMode.MoveElements] = "MoveElements"
function Match3(size_x, size_y)
    local move_direction = MoveDirection.Up
    local cells = {}
    local dc_elements = {}
    local elements = {}
    local cb_is_can_move
    local cb_on_combinated
    local cb_ob_near_activation
    local cb_is_combined_elements
    local cb_on_celll_activated
    local cb_on_damaged_element
    local function init()
        do
            local y = 0
            while y < size_y do
                cells[y + 1] = {}
                elements[y + 1] = {}
                do
                    local x = 0
                    while x < size_x do
                        cells[y + 1][x + 1] = {id = y * size_x + x, type = ____exports.CellType.Base, is_active = false}
                        elements[y + 1][x + 1] = ____exports.NullElement
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    local function get_all_combinations()
    end
    local function is_combined_elements_base(e1, e2)
        return e1.dc_element == e2.dc_element or dc_elements[e1.dc_element] and dc_elements[e2.dc_element] and dc_elements[e1.dc_element].index == dc_elements[e2.dc_element].index
    end
    local function is_combined_elements(e1, e2)
        if cb_is_combined_elements then
            return cb_is_combined_elements(e1, e2)
        else
            return is_combined_elements_base(e1, e2)
        end
    end
    local function set_callback_is_combined_elements(fnc)
        cb_is_combined_elements = fnc
    end
    local function is_can_move_base(from_x, from_y, to_x, to_y)
        return false
    end
    local function is_can_move(from_x, from_y, to_x, to_y)
        if cb_is_can_move then
            return cb_is_can_move(from_x, from_y, to_x, to_y)
        else
            return is_can_move_base(from_x, from_y, to_x, to_y)
        end
    end
    local function set_callback_is_can_move(fnc)
        cb_is_can_move = fnc
    end
    local function on_base_combined(combined_element, elements, combination_type, combination_angle)
    end
    local function on_combinated(combined_element, elements, combination_type, combination_angle)
        if cb_on_combinated then
            return cb_on_combinated(combined_element, elements, combination_type, combination_angle)
        else
            return on_base_combined(combined_element, elements, combination_type, combination_angle)
        end
    end
    local function set_callback_on_combinated(fnc)
        cb_on_combinated = fnc
    end
    local function try_damage_element(damaged_info)
    end
    local function on_base_near_activation(cells)
    end
    local function on_near_activation(cells)
        if cb_ob_near_activation then
            return cb_ob_near_activation(cells)
        else
            on_base_near_activation(cells)
        end
    end
    local function set_callback_ob_near_activation(fnc)
        cb_ob_near_activation = fnc
    end
    local function set_callback_on_cell_activated(fnc)
        cb_on_celll_activated = fnc
    end
    local function save_state()
        return {}
    end
    local function load_state(state)
    end
    local function get_free_cells()
        return {}
    end
    local function set_element(x, y, element)
        elements[y + 1][x + 1] = element
    end
    local function remove_element(x, y, is_damagind, is_near_activation)
    end
    local function set_cell(x, y, cell)
        cells[y + 1][x + 1] = cell
    end
    local function set_dc_element(id, element)
        dc_elements[id] = element
    end
    local function get_all_available_steps()
        return {}
    end
    local function try_move(from_x, from_y, to_x, to_y)
        return false
    end
    local function try_click(x, y)
        return false
    end
    local function process_state(mode)
        return false
    end
    return {
        init = init,
        is_can_move_base = is_can_move_base,
        set_callback_is_can_move = set_callback_is_can_move,
        save_state = save_state,
        load_state = load_state,
        get_free_cells = get_free_cells,
        set_element = set_element,
        set_cell = set_cell,
        set_dc_element = set_dc_element,
        on_base_combined = on_base_combined,
        set_callback_on_combinated = set_callback_on_combinated,
        set_callback_ob_near_activation = set_callback_ob_near_activation,
        set_callback_is_combined_elements = set_callback_is_combined_elements,
        is_combined_elements_base = is_combined_elements_base,
        get_all_combinations = get_all_combinations,
        set_callback_on_cell_activated = set_callback_on_cell_activated,
        on_base_near_activation = on_base_near_activation,
        try_move = try_move,
        try_click = try_click,
        process_state = process_state,
        get_all_available_steps = get_all_available_steps,
        remove_element = remove_element
    }
end
