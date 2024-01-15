local ____exports = {}
local flow = require("ludobits.m.flow")
local camera = require("utils.camera")
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____match3 = require("game.match3")
local Match3 = ____match3.Match3
local NullElement = ____match3.NullElement
local NotActiveCell = ____match3.NotActiveCell
local MoveDirection = ____match3.MoveDirection
local ProcessMode = ____match3.ProcessMode
____exports.CellId = CellId or ({})
____exports.CellId.Base = 0
____exports.CellId[____exports.CellId.Base] = "Base"
____exports.CellId.Ice = 1
____exports.CellId[____exports.CellId.Ice] = "Ice"
____exports.ElementId = ElementId or ({})
____exports.ElementId.Gold = 0
____exports.ElementId[____exports.ElementId.Gold] = "Gold"
____exports.ElementId.Dimonde = 1
____exports.ElementId[____exports.ElementId.Dimonde] = "Dimonde"
____exports.ElementId.Topaz = 2
____exports.ElementId[____exports.ElementId.Topaz] = "Topaz"
function ____exports.Game()
    local setup_size, setup_element_types, make_cell, make_element, get_cell_world_pos, set_cell_view, set_element_view, get_element_pos, get_move_direction, swap_elements, on_down, on_move, on_damaged_element, wait_event, game_width, game_height, min_swipe_distance, swap_element_easing, swap_element_time, origin_cell_size, field_width, field_height, offset_border, field, gm, cell_size, scale_ratio, cells_offset, selected_element
    function setup_size()
        cell_size = math.min((game_width - offset_border * 2) / field_width, 100)
        scale_ratio = cell_size / origin_cell_size
        cells_offset = vmath.vector3(game_width / 2 - field_width / 2 * cell_size, -(game_height / 2 - field_height / 2 * cell_size), 0)
    end
    function setup_element_types()
        GAME_CONFIG.element_database:forEach(function(____, value, key)
            field.set_element_type(key, value.type)
        end)
    end
    function make_cell(x, y, cell_id)
        if cell_id == NotActiveCell then
            return
        end
        local data = GAME_CONFIG.cell_database:get(cell_id)
        if data == nil then
            return
        end
        local cell = {
            id = set_cell_view(x, y, cell_id),
            type = data.type,
            is_active = data.is_active
        }
        field.set_cell(x, y, cell)
    end
    function make_element(x, y, element_id)
        if element_id == NullElement then
            return
        end
        local data = GAME_CONFIG.element_database:get(element_id)
        if data == nil then
            return
        end
        local element = {
            id = set_element_view(x, y, element_id),
            type = data.type.index
        }
        field.set_element(x, y, element)
    end
    function get_cell_world_pos(x, y, z)
        if z == nil then
            z = 0
        end
        return vmath.vector3(cells_offset.x + cell_size * x + cell_size * 0.5, cells_offset.y - cell_size * y - cell_size * 0.5, z)
    end
    function set_cell_view(x, y, cell_id, z_index)
        if z_index == nil then
            z_index = 0
        end
        local pos = get_cell_world_pos(x, y)
        pos.z = z_index
        local _go = gm.make_go("cell_view", pos)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        local ____sprite_play_flipbook_3 = sprite.play_flipbook
        local ____msg_url_result_2 = msg.url(nil, _go, "sprite")
        local ____opt_0 = GAME_CONFIG.cell_database:get(cell_id)
        ____sprite_play_flipbook_3(____msg_url_result_2, ____opt_0 and ____opt_0.view)
        return gm.add_game_item({_hash = _go})
    end
    function set_element_view(x, y, element_id, z_index)
        if z_index == nil then
            z_index = 1
        end
        local pos = get_cell_world_pos(x, y)
        pos.z = z_index
        local _go = gm.make_go("element_view", pos)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        local ____sprite_play_flipbook_7 = sprite.play_flipbook
        local ____msg_url_result_6 = msg.url(nil, _go, "sprite")
        local ____opt_4 = GAME_CONFIG.element_database:get(element_id)
        ____sprite_play_flipbook_7(____msg_url_result_6, ____opt_4 and ____opt_4.view)
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
        local element_to_world_pos = get_cell_world_pos(element_to_pos.x, element_to_pos.y)
        element_to_world_pos.z = 1
        local item_from = gm.get_item_by_index(element_from_data.id)
        go.animate(
            item_from._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            element_to_world_pos,
            swap_element_easing,
            swap_element_time
        )
        local element_from_world_pos = get_cell_world_pos(element_from_pos.x, element_from_pos.y)
        element_from_world_pos.z = 1
        local item_to = gm.get_item_by_index(element_to_data.id)
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
            while field.process_state(ProcessMode.Combinate) do
                field.process_state(ProcessMode.MoveElements)
            end
        end
    end
    function on_down(item)
        if selected_element ~= nil then
            local selected_element_world_pos = go.get_world_position(selected_element._hash)
            local element_to_world_pos = go.get_world_position(item._hash)
            local selected_element_pos = get_element_pos(selected_element_world_pos)
            local element_to_pos = get_element_pos(element_to_world_pos)
            swap_elements(selected_element_pos, element_to_pos)
            selected_element = nil
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
            local ____switch35 = move_direction
            local ____cond35 = ____switch35 == MoveDirection.Up
            if ____cond35 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond35 = ____cond35 or ____switch35 == MoveDirection.Down
            if ____cond35 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond35 = ____cond35 or ____switch35 == MoveDirection.Left
            if ____cond35 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond35 = ____cond35 or ____switch35 == MoveDirection.Right
            if ____cond35 then
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
    function on_damaged_element(damage_info)
    end
    function wait_event()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            gm.do_message(message_id, _message, sender)
            repeat
                local ____switch40 = message_id
                local ____cond40 = ____switch40 == ID_MESSAGES.MSG_ON_DOWN_ITEM
                if ____cond40 then
                    on_down(_message.item)
                    break
                end
                ____cond40 = ____cond40 or ____switch40 == ID_MESSAGES.MSG_ON_MOVE
                if ____cond40 then
                    on_move(_message)
                    break
                end
            until true
        end
    end
    game_width = 540
    game_height = 960
    min_swipe_distance = GAME_CONFIG.min_swipe_distance
    swap_element_easing = GAME_CONFIG.swap_element_easing
    swap_element_time = GAME_CONFIG.swap_element_time
    local level_config = GAME_CONFIG.levels[GameStorage.get("current_level") + 1]
    origin_cell_size = level_config.field.cell_size
    field_width = level_config.field.width
    field_height = level_config.field.height
    offset_border = level_config.field.offset_border
    field = Match3(8, 8)
    gm = GoManager()
    selected_element = nil
    local function init()
        field.init()
        setup_size()
        setup_element_types()
        field.set_callback_on_damaged_element(on_damaged_element)
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
        wait_event()
    end
    init()
    return {}
end
return ____exports
