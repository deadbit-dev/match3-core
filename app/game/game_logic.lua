local ____lualib = require("lualib_bundle")
local __TS__Iterator = ____lualib.__TS__Iterator
local ____exports = {}
local flow = require("ludobits.m.flow")
local camera = require("utils.camera")
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____game_config = require("main.game_config")
local ComboType = ____game_config.ComboType
local ____match3 = require("game.match3")
local Field = ____match3.Field
local NullElement = ____match3.NullElement
local NotActiveCell = ____match3.NotActiveCell
local MoveDirection = ____match3.MoveDirection
local CombinationType = ____match3.CombinationType
local ProcessMode = ____match3.ProcessMode
function ____exports.Game()
    local setup_size, setup_element_types, make_cell, make_element, make_combo_element, get_cell_world_pos, set_cell_view, set_element_view, get_element_pos, get_move_direction, swap_elements, process_move, process_game_step, on_up, on_move, on_move_element, on_combined, try_activate_combo, on_damaged_element, get_random_element_id, on_request_element, try_busters_activation, wait_event, game_width, game_height, min_swipe_distance, swap_element_easing, swap_element_time, move_delay_after_combination, move_elements_easing, move_elements_time, wait_time_after_move, damaged_element_easing, damaged_element_delay, damaged_element_time, damaged_element_scale, combined_element_easing, combined_element_time, spawn_element_easing, spawn_element_time, buster_delay, origin_cell_size, field_width, field_height, offset_border, move_direction, busters, field, gm, cell_size, scale_ratio, cells_offset, selected_element
    function setup_size()
        cell_size = math.min((game_width - offset_border * 2) / field_width, 100)
        scale_ratio = cell_size / origin_cell_size
        cells_offset = vmath.vector3(game_width / 2 - field_width / 2 * cell_size, -(game_height / 2 - field_height / 2 * cell_size), 0)
    end
    function setup_element_types()
        for ____, ____value in __TS__Iterator(GAME_CONFIG.element_database) do
            local key = ____value[1]
            local value = ____value[2]
            field.set_element_type(key, value.type)
        end
    end
    function make_cell(x, y, cell_id)
        if cell_id == NotActiveCell then
            return {}
        end
        local data = GAME_CONFIG.cell_database:get(cell_id)
        if data == nil then
            return {}
        end
        local cell = {
            id = set_cell_view(x, y, cell_id),
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
        local element_data = GAME_CONFIG.element_database:get(element_id)
        if element_data == nil then
            return NullElement
        end
        local element = {
            id = set_element_view(x, y, element_id, spawn_anim),
            type = element_data.type.index,
            data = data
        }
        field.set_element(x, y, element)
        return element
    end
    function make_combo_element(x, y, element_id, combo_type, z_index)
        if z_index == nil then
            z_index = 1
        end
        local pos = vmath.vector3(0, 0, z_index)
        local combo_view = gm.make_go("combo_view", pos)
        sprite.play_flipbook(
            msg.url(nil, combo_view, "sprite"),
            GAME_CONFIG.combo_graphics:get(combo_type)
        )
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            combo_view
        )
        local element = make_element(
            x,
            y,
            element_id,
            true,
            {combo_type = combo_type}
        )
        local item = gm.get_item_by_index(element.id)
        if item ~= nil then
            go.set_parent(combo_view, item._hash)
            go.set_position(pos, combo_view)
        end
        return element
    end
    function get_cell_world_pos(x, y, z)
        if z == nil then
            z = 0
        end
        return vmath.vector3(cells_offset.x + cell_size * x + cell_size * 0.5, cells_offset.y - cell_size * y - cell_size * 0.5, z)
    end
    function set_cell_view(x, y, cell_id, z_index)
        if z_index == nil then
            z_index = -1
        end
        local pos = get_cell_world_pos(x, y, z_index)
        local _go = gm.make_go("cell_view", pos)
        local ____sprite_play_flipbook_3 = sprite.play_flipbook
        local ____msg_url_result_2 = msg.url(nil, _go, "sprite")
        local ____opt_0 = GAME_CONFIG.cell_database:get(cell_id)
        ____sprite_play_flipbook_3(____msg_url_result_2, ____opt_0 and ____opt_0.view)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        return gm.add_game_item({_hash = _go})
    end
    function set_element_view(x, y, element_id, spawn_anim, z_index)
        if spawn_anim == nil then
            spawn_anim = false
        end
        if z_index == nil then
            z_index = 0
        end
        local pos = get_cell_world_pos(x, y, z_index)
        local _go = gm.make_go("element_view", pos)
        local ____sprite_play_flipbook_7 = sprite.play_flipbook
        local ____msg_url_result_6 = msg.url(nil, _go, "sprite")
        local ____opt_4 = GAME_CONFIG.element_database:get(element_id)
        ____sprite_play_flipbook_7(____msg_url_result_6, ____opt_4 and ____opt_4.view)
        if spawn_anim then
            go.set_scale(
                vmath.vector3(0.01, 0.01, 1),
                _go
            )
            go.animate(
                _go,
                "scale",
                go.PLAYBACK_ONCE_FORWARD,
                vmath.vector3(scale_ratio, scale_ratio, 1),
                spawn_element_easing,
                spawn_element_time
            )
        else
            go.set_scale(
                vmath.vector3(scale_ratio, scale_ratio, 1),
                _go
            )
        end
        return gm.add_game_item({_hash = _go, is_clickable = true})
    end
    function get_element_pos(world_pos)
        return {x = (world_pos.x - cells_offset.x - cell_size * 0.5) / cell_size, y = (cells_offset.y - world_pos.y - cell_size * 0.5) / cell_size}
    end
    function get_move_direction(dir)
        local cs45 = 0.7
        if dir.y > cs45 then
            return MoveDirection.Up
        elseif dir.y < -cs45 then
            return MoveDirection.Down
        elseif dir.x < -cs45 then
            return MoveDirection.Left
        elseif dir.x > cs45 then
            return MoveDirection.Right
        else
            return MoveDirection.None
        end
    end
    function swap_elements(element_from_pos, element_to_pos)
        local element_from_data = field.get_element(element_from_pos.x, element_from_pos.y)
        local element_to_data = field.get_element(element_to_pos.x, element_to_pos.y)
        if element_from_data == NullElement or element_to_data == NullElement then
            return
        end
        local element_to_world_pos = get_cell_world_pos(element_to_pos.x, element_to_pos.y, 0)
        local item_from = gm.get_item_by_index(element_from_data.id)
        if item_from == nil then
            return
        end
        go.animate(
            item_from._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            element_to_world_pos,
            swap_element_easing,
            swap_element_time
        )
        local element_from_world_pos = get_cell_world_pos(element_from_pos.x, element_from_pos.y, 0)
        local item_to = gm.get_item_by_index(element_to_data.id)
        if item_to == nil then
            return
        end
        flow.go_animate(
            item_to._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            element_from_world_pos,
            swap_element_easing,
            swap_element_time
        )
        if not field.try_move(element_from_pos.x, element_from_pos.y, element_to_pos.x, element_to_pos.y) then
            go.animate(
                item_from._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                element_from_world_pos,
                swap_element_easing,
                swap_element_time
            )
            flow.go_animate(
                item_to._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                element_to_world_pos,
                swap_element_easing,
                swap_element_time
            )
        else
            process_game_step()
        end
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
    end
    function on_up(item)
        local element_to_world_pos = go.get_world_position(item._hash)
        local element_to_pos = get_element_pos(element_to_world_pos)
        if selected_element ~= nil then
            local selected_element_world_pos = go.get_world_position(selected_element._hash)
            local selected_element_pos = get_element_pos(selected_element_world_pos)
            local dx = math.abs(selected_element_pos.x - element_to_pos.x)
            local dy = math.abs(selected_element_pos.y - element_to_pos.y)
            if dx ~= 0 and dy ~= 0 or (dx > 1 or dy > 1) then
                selected_element = item
                return
            end
            swap_elements(selected_element_pos, element_to_pos)
            selected_element = nil
            return
        end
        if try_busters_activation(element_to_pos.x, element_to_pos.y) then
            return
        end
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
        local selected_element_pos = get_element_pos(selected_element_world_pos)
        local element_to_pos = {x = selected_element_pos.x, y = selected_element_pos.y}
        local direction = vmath.normalize(delta)
        local move_direction = get_move_direction(direction)
        repeat
            local ____switch46 = move_direction
            local ____cond46 = ____switch46 == MoveDirection.Up
            if ____cond46 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond46 = ____cond46 or ____switch46 == MoveDirection.Down
            if ____cond46 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond46 = ____cond46 or ____switch46 == MoveDirection.Left
            if ____cond46 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond46 = ____cond46 or ____switch46 == MoveDirection.Right
            if ____cond46 then
                element_to_pos.x = element_to_pos.x + 1
                break
            end
        until true
        local is_valid_x = element_to_pos.x >= 0 and element_to_pos.x < field_width
        local is_valid_y = element_to_pos.y >= 0 and element_to_pos.y < field_height
        if not is_valid_x or not is_valid_y then
            return
        end
        swap_elements(selected_element_pos, element_to_pos)
        selected_element = nil
    end
    function on_move_element(from_x, from_y, to_x, to_y, element)
        local to_world_pos = get_cell_world_pos(to_x, to_y, 0)
        local item_from = gm.get_item_by_index(element.id)
        if item_from == nil then
            return
        end
        go.animate(
            item_from._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            to_world_pos,
            move_elements_easing,
            move_elements_time
        )
    end
    function on_combined(combined_element, combination)
        if combination.type == CombinationType.Comb3 then
            field.on_combined_base(combined_element, combination)
        else
            local function on_complite()
                local element_data = field.get_element(combined_element.x, combined_element.y)
                field.on_combined_base(combined_element, combination)
                local combo_type
                repeat
                    local ____switch54 = combination.type
                    local ____cond54 = ____switch54 == CombinationType.Comb4 or ____switch54 == CombinationType.Comb5
                    if ____cond54 then
                        if combination.angle == 0 then
                            combo_type = ComboType.Horizontal
                        else
                            combo_type = ComboType.Vertical
                        end
                        break
                    end
                    do
                        combo_type = ComboType.All
                        break
                    end
                until true
                make_combo_element(combined_element.x, combined_element.y, element_data.type, combo_type)
            end
            local combined_element_world_pos = get_cell_world_pos(combined_element.x, combined_element.y)
            do
                local i = 0
                while i < #combination.elements do
                    local element = combination.elements[i + 1]
                    local item = gm.get_item_by_index(element.id)
                    if item ~= nil then
                        local is_last = i == #combination.elements - 1
                        go.animate(
                            item._hash,
                            "position",
                            go.PLAYBACK_ONCE_FORWARD,
                            combined_element_world_pos,
                            combined_element_easing,
                            combined_element_time,
                            0,
                            is_last and on_complite or nil
                        )
                    end
                    i = i + 1
                end
            end
        end
    end
    function try_activate_combo(damaged_info)
        if damaged_info.element.data == nil then
            return false
        end
        repeat
            local ____switch61 = damaged_info.element.data.combo_type
            local ____cond61 = ____switch61 == ComboType.All
            if ____cond61 then
                do
                    local y = 0
                    while y < field_height do
                        field.remove_element(damaged_info.x, y, true, true)
                        y = y + 1
                    end
                end
                do
                    local x = 0
                    while x < field_width do
                        field.remove_element(x, damaged_info.y, true, true)
                        x = x + 1
                    end
                end
                break
            end
            ____cond61 = ____cond61 or ____switch61 == ComboType.Vertical
            if ____cond61 then
                do
                    local y = 0
                    while y < field_height do
                        field.remove_element(damaged_info.x, y, true, true)
                        y = y + 1
                    end
                end
                break
            end
            ____cond61 = ____cond61 or ____switch61 == ComboType.Horizontal
            if ____cond61 then
                do
                    local x = 0
                    while x < field_width do
                        field.remove_element(x, damaged_info.y, true, true)
                        x = x + 1
                    end
                end
                break
            end
        until true
        return true
    end
    function on_damaged_element(damaged_info)
        local item = gm.get_item_by_index(damaged_info.element.id)
        if item ~= nil then
            try_activate_combo(damaged_info)
            go.animate(
                item._hash,
                "scale",
                go.PLAYBACK_ONCE_FORWARD,
                damaged_element_scale,
                damaged_element_easing,
                damaged_element_time,
                damaged_element_delay,
                function()
                    gm.delete_item(item, true, true)
                end
            )
        end
    end
    function get_random_element_id()
        local index = math.random(GAME_CONFIG.element_database.size - 1)
        for ____, ____value in __TS__Iterator(GAME_CONFIG.element_database) do
            local key = ____value[1]
            local value = ____value[2]
            local ____index_8 = index
            index = ____index_8 - 1
            if ____index_8 == 0 then
                return key
            end
        end
        return -1
    end
    function on_request_element(x, y)
        local to_world_pos = get_cell_world_pos(x, y, 0)
        local element = make_element(
            x,
            y,
            get_random_element_id()
        )
        if element == NullElement then
            return NullElement
        end
        local item_from = gm.get_item_by_index(element.id)
        if item_from == nil then
            return NullElement
        end
        repeat
            local ____switch76 = move_direction
            local ____cond76 = ____switch76 == MoveDirection.Up
            if ____cond76 then
                gm.set_position_xy(item_from, to_world_pos.x, to_world_pos.y + field_height * cell_size)
                break
            end
            ____cond76 = ____cond76 or ____switch76 == MoveDirection.Down
            if ____cond76 then
                gm.set_position_xy(item_from, to_world_pos.x, to_world_pos.y - field_height * cell_size)
                break
            end
            ____cond76 = ____cond76 or ____switch76 == MoveDirection.Left
            if ____cond76 then
                gm.set_position_xy(item_from, to_world_pos.x - field_width * cell_size, to_world_pos.y)
                break
            end
            ____cond76 = ____cond76 or ____switch76 == MoveDirection.Right
            if ____cond76 then
                gm.set_position_xy(item_from, to_world_pos.x + field_width * cell_size, to_world_pos.y)
                break
            end
        until true
        go.animate(
            item_from._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            to_world_pos,
            move_elements_easing,
            move_elements_time
        )
        return element
    end
    function try_busters_activation(x, y)
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
    function wait_event()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
            repeat
                local ____switch81 = message_id
                local ____cond81 = ____switch81 == ID_MESSAGES.MSG_ON_DOWN_ITEM
                if ____cond81 then
                    on_up(_message.item)
                    break
                end
                ____cond81 = ____cond81 or ____switch81 == ID_MESSAGES.MSG_ON_MOVE
                if ____cond81 then
                    on_move(_message)
                    break
                end
            until true
        end
    end
    game_width = 540
    game_height = 960
    local game_animation_speed_cof = GAME_CONFIG.game_animation_speed_cof
    min_swipe_distance = GAME_CONFIG.min_swipe_distance
    swap_element_easing = GAME_CONFIG.swap_element_easing
    swap_element_time = GAME_CONFIG.swap_element_time * game_animation_speed_cof
    move_delay_after_combination = GAME_CONFIG.move_delay_after_combination * game_animation_speed_cof
    move_elements_easing = GAME_CONFIG.move_elements_easing
    move_elements_time = GAME_CONFIG.move_elements_time * game_animation_speed_cof
    wait_time_after_move = GAME_CONFIG.wait_time_after_move * game_animation_speed_cof
    damaged_element_easing = GAME_CONFIG.damaged_element_easing
    damaged_element_delay = GAME_CONFIG.damaged_element_delay * game_animation_speed_cof
    damaged_element_time = GAME_CONFIG.damaged_element_time * game_animation_speed_cof
    damaged_element_scale = GAME_CONFIG.damaged_element_scale
    combined_element_easing = GAME_CONFIG.combined_element_easing
    combined_element_time = GAME_CONFIG.combined_element_time * game_animation_speed_cof
    spawn_element_easing = GAME_CONFIG.spawn_element_easing
    spawn_element_time = GAME_CONFIG.spawn_element_time * game_animation_speed_cof
    buster_delay = GAME_CONFIG.buster_delay * game_animation_speed_cof
    local level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    origin_cell_size = level_config.field.cell_size
    field_width = level_config.field.width
    field_height = level_config.field.height
    offset_border = level_config.field.offset_border
    move_direction = level_config.field.move_direction
    busters = level_config.busters
    field = Field(8, 8, move_direction)
    gm = GoManager()
    selected_element = nil
    local function init()
        field.init()
        setup_size()
        setup_element_types()
        field.set_callback_on_move_element(on_move_element)
        field.set_callback_on_damaged_element(on_damaged_element)
        field.set_callback_on_combinated(on_combined)
        field.set_callback_on_request_element(on_request_element)
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
        wait_event()
    end
    init()
    return {}
end
return ____exports
