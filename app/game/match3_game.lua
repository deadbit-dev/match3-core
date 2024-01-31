local ____lualib = require("lualib_bundle")
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
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
local ____match3_view = require("game.match3_view")
local View = ____match3_view.View
function ____exports.Game()
    local setup_element_types, make_cell, make_element, process_move, process_game_step, get_move_direction, is_can_move, swap_elements, is_click_actiovation, try_click_activation, try_hammer_activation, on_down, on_move, on_up, make_buster, on_combined, try_activate_vertical_buster, try_activate_horizontal_buster, try_activate_axis_buster, try_activate_helicopter, try_activate_dynamite, try_activate_diskosphere, try_activate_buster_element, on_damaged_element, on_cell_activated, get_random_element_id, on_request_element, revert_step, wait_event, min_swipe_distance, move_delay_after_combination, wait_time_after_move, buster_delay, field_width, field_height, busters, field, view, previous_states, selected_element
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
    function make_cell(x, y, cell_id)
        if cell_id == NotActiveCell then
            return NotActiveCell
        end
        local data = GAME_CONFIG.cell_database[cell_id]
        local cell = {
            id = view.set_cell_view(x, y, cell_id),
            type = data.type,
            is_active = data.is_active
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
        return is_click_actiovation(from_x, from_y) or is_click_actiovation(to_x, to_y)
    end
    function swap_elements(from_pos_x, from_pos_y, to_pos_x, to_pos_y)
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
            local is_from = try_click_activation(from_pos_x, from_pos_y, false)
            local is_to = try_click_activation(to_pos_x, to_pos_y, false)
            if is_from or is_to then
                flow.delay(buster_delay)
            end
            process_game_step()
        end
    end
    function is_click_actiovation(x, y)
        local element = field.get_element(x, y)
        if element == NullElement then
            return false
        end
        if not GAME_CONFIG.element_database[element.type].type.is_clickable then
            return false
        end
        return true
    end
    function try_click_activation(x, y, with_process)
        if with_process == nil then
            with_process = true
        end
        if not is_click_actiovation(x, y) then
            return false
        end
        field.remove_element(x, y, true, false)
        if with_process then
            flow.delay(buster_delay)
            process_game_step()
        end
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
            local ____switch41 = move_direction
            local ____cond41 = ____switch41 == Direction.Up
            if ____cond41 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond41 = ____cond41 or ____switch41 == Direction.Down
            if ____cond41 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond41 = ____cond41 or ____switch41 == Direction.Left
            if ____cond41 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond41 = ____cond41 or ____switch41 == Direction.Right
            if ____cond41 then
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
        view.squash_combo_animation(combined_element, combination, on_complite)
    end
    function on_combined(combined_element, combination)
        repeat
            local ____switch49 = combination.type
            local ____cond49 = ____switch49 == CombinationType.Comb4
            if ____cond49 then
                make_buster(combined_element, combination, combination.angle == 0 and ElementId.HorizontalBuster or ElementId.VerticalBuster)
                break
            end
            ____cond49 = ____cond49 or ____switch49 == CombinationType.Comb5
            if ____cond49 then
                make_buster(combined_element, combination, ElementId.Diskosphere)
                break
            end
            ____cond49 = ____cond49 or ____switch49 == CombinationType.Comb2x2
            if ____cond49 then
                make_buster(combined_element, combination, ElementId.Helicopter)
                break
            end
            ____cond49 = ____cond49 or (____switch49 == CombinationType.Comb3x3a or ____switch49 == CombinationType.Comb3x3b)
            if ____cond49 then
                make_buster(combined_element, combination, ElementId.Dynamite)
                break
            end
            ____cond49 = ____cond49 or (____switch49 == CombinationType.Comb3x4 or ____switch49 == CombinationType.Comb3x5)
            if ____cond49 then
                make_buster(combined_element, combination, ElementId.AxisBuster)
                break
            end
            do
                field.on_combined_base(combined_element, combination)
                break
            end
        until true
    end
    function try_activate_vertical_buster(damaged_info)
        do
            local y = 0
            while y < field_height do
                field.remove_element(damaged_info.x, y, true, true)
                y = y + 1
            end
        end
    end
    function try_activate_horizontal_buster(damaged_info)
        do
            local x = 0
            while x < field_width do
                field.remove_element(x, damaged_info.y, true, true)
                x = x + 1
            end
        end
    end
    function try_activate_axis_buster(damaged_info)
        try_activate_vertical_buster(damaged_info)
        try_activate_horizontal_buster(damaged_info)
    end
    function try_activate_helicopter(damaged_info)
        if field.is_valid_element_pos(damaged_info.x - 1, damaged_info.y) then
            field.remove_element(damaged_info.x - 1, damaged_info.y, true, true)
        end
        if field.is_valid_element_pos(damaged_info.x, damaged_info.y - 1) then
            field.remove_element(damaged_info.x, damaged_info.y - 1, true, true)
        end
        if field.is_valid_element_pos(damaged_info.x + 1, damaged_info.y) then
            field.remove_element(damaged_info.x + 1, damaged_info.y, true, true)
        end
        if field.is_valid_element_pos(damaged_info.x, damaged_info.y + 1) then
            field.remove_element(damaged_info.x, damaged_info.y + 1, true, true)
        end
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
        local target = available_elements[math.random(0, #available_elements - 1) + 1]
        view.helicopter_animation(
            damaged_info.element,
            target.x,
            target.y,
            function() return field.remove_element(target.x, target.y, true, true) end
        )
    end
    function try_activate_dynamite(damaged_info)
        do
            local y = damaged_info.y - 2
            while y <= damaged_info.y + 2 do
                do
                    local x = damaged_info.x - 2
                    while x <= damaged_info.x + 2 do
                        if field.is_valid_element_pos(x, y) then
                            field.remove_element(x, y, true, true)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function try_activate_diskosphere(damaged_info)
        local random_element_id = get_random_element_id()
        if random_element_id == NullElement then
            return
        end
        local element_data = GAME_CONFIG.element_database[random_element_id]
        local elements = field.get_all_elements_by_type(element_data.type.index)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, true)
        end
    end
    function try_activate_buster_element(damaged_info)
        repeat
            local ____switch73 = damaged_info.element.type
            local ____cond73 = ____switch73 == ElementId.AxisBuster
            if ____cond73 then
                try_activate_axis_buster(damaged_info)
                break
            end
            ____cond73 = ____cond73 or ____switch73 == ElementId.VerticalBuster
            if ____cond73 then
                try_activate_vertical_buster(damaged_info)
                break
            end
            ____cond73 = ____cond73 or ____switch73 == ElementId.HorizontalBuster
            if ____cond73 then
                try_activate_horizontal_buster(damaged_info)
                break
            end
            ____cond73 = ____cond73 or ____switch73 == ElementId.Helicopter
            if ____cond73 then
                try_activate_helicopter(damaged_info)
                break
            end
            ____cond73 = ____cond73 or ____switch73 == ElementId.Dynamite
            if ____cond73 then
                try_activate_dynamite(damaged_info)
                break
            end
            ____cond73 = ____cond73 or ____switch73 == ElementId.Diskosphere
            if ____cond73 then
                try_activate_diskosphere(damaged_info)
                break
            end
            do
                return false
            end
        until true
        return true
    end
    function on_damaged_element(damaged_info)
        try_activate_buster_element(damaged_info)
        view.damaged_element_animation(damaged_info.element.id)
    end
    function on_cell_activated(item_info)
        local item = view.get_item_by_index(item_info.id)
        if item == nil then
            return
        end
        view.delete_item(item, true)
        make_cell(item_info.x, item_info.y, CellId.Base)
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
                local ____switch97 = message_id
                local ____cond97 = ____switch97 == ID_MESSAGES.MSG_ON_DOWN_ITEM
                if ____cond97 then
                    on_down(_message.item)
                    break
                end
                ____cond97 = ____cond97 or ____switch97 == ID_MESSAGES.MSG_ON_UP_ITEM
                if ____cond97 then
                    on_up(_message.item)
                    break
                end
                ____cond97 = ____cond97 or ____switch97 == ID_MESSAGES.MSG_ON_MOVE
                if ____cond97 then
                    on_move(_message)
                    break
                end
                ____cond97 = ____cond97 or ____switch97 == to_hash("REVERT_STEP")
                if ____cond97 then
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
    local level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    local move_direction = level_config.field.move_direction
    busters = level_config.busters
    field = Field(8, 8, move_direction)
    view = View()
    previous_states = {}
    selected_element = nil
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
                        make_cell(x, y, level_config.field.cells[y + 1][x + 1])
                        make_element(x, y, level_config.field.elements[y + 1][x + 1])
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        busters.hammer_active = GameStorage.get("hammer_counts") <= 0
        previous_states[#previous_states + 1] = field.save_state()
        wait_event()
    end
    init()
    return {}
end
return ____exports
