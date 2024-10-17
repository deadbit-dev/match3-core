local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__Delete = ____lualib.__TS__Delete
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local ____exports = {}
local ____GoManager = require("modules.GoManager")
local GoManager = ____GoManager.GoManager
local ____math_utils = require("utils.math_utils")
local Axis = ____math_utils.Axis
local Direction = ____math_utils.Direction
local is_valid_pos = ____math_utils.is_valid_pos
local rotateMatrix = ____math_utils.rotateMatrix
local ____utils = require("game.utils")
local get_current_level = ____utils.get_current_level
local get_field_cell_size = ____utils.get_field_cell_size
local get_field_height = ____utils.get_field_height
local get_field_max_height = ____utils.get_field_max_height
local get_field_max_width = ____utils.get_field_max_width
local get_field_offset_border = ____utils.get_field_offset_border
local get_field_width = ____utils.get_field_width
local get_move_direction = ____utils.get_move_direction
local is_animal_level = ____utils.is_animal_level
local is_tutorial = ____utils.is_tutorial
local ____core = require("game.core")
local NotActiveCell = ____core.NotActiveCell
local NullElement = ____core.NullElement
local is_available_cell_type_for_move = ____core.is_available_cell_type_for_move
local ElementState = ____core.ElementState
local ____game = require("game.game")
local base_cell = ____game.base_cell
local CellId = ____game.CellId
local ElementId = ____game.ElementId
local SubstrateMasks = {
    {{0, 1, 0}, {1, 0, 1}, {0, 0, 0}},
    {{0, 1, 0}, {1, 0, 0}, {0, 0, 1}},
    {{0, 1, 0}, {1, 0, 0}, {0, 0, 0}},
    {{0, 0, 0}, {1, 0, 1}, {0, 0, 0}},
    {{0, 0, 1}, {1, 0, 0}, {0, 0, 1}},
    {{0, 0, 1}, {1, 0, 0}, {0, 0, 0}},
    {{0, 0, 0}, {1, 0, 0}, {0, 0, 1}},
    {{0, 0, 0}, {1, 0, 0}, {0, 0, 0}},
    {{0, 0, 1}, {0, 0, 0}, {0, 0, 1}},
    {{0, 0, 0}, {0, 0, 0}, {0, 0, 1}},
    {{0, 0, 0}, {0, 0, 0}, {0, 0, 0}}
}
____exports.SubstrateId = SubstrateId or ({})
____exports.SubstrateId.OutsideArc = 0
____exports.SubstrateId[____exports.SubstrateId.OutsideArc] = "OutsideArc"
____exports.SubstrateId.OutsideInsideAngle = 1
____exports.SubstrateId[____exports.SubstrateId.OutsideInsideAngle] = "OutsideInsideAngle"
____exports.SubstrateId.OutsideAngle = 2
____exports.SubstrateId[____exports.SubstrateId.OutsideAngle] = "OutsideAngle"
____exports.SubstrateId.LeftRightStrip = 3
____exports.SubstrateId[____exports.SubstrateId.LeftRightStrip] = "LeftRightStrip"
____exports.SubstrateId.LeftStripTopBottomInsideAngle = 4
____exports.SubstrateId[____exports.SubstrateId.LeftStripTopBottomInsideAngle] = "LeftStripTopBottomInsideAngle"
____exports.SubstrateId.LeftStripTopInsideAngle = 5
____exports.SubstrateId[____exports.SubstrateId.LeftStripTopInsideAngle] = "LeftStripTopInsideAngle"
____exports.SubstrateId.LeftStripBottomInsideAngle = 6
____exports.SubstrateId[____exports.SubstrateId.LeftStripBottomInsideAngle] = "LeftStripBottomInsideAngle"
____exports.SubstrateId.LeftStrip = 7
____exports.SubstrateId[____exports.SubstrateId.LeftStrip] = "LeftStrip"
____exports.SubstrateId.TopBottomInsideAngle = 8
____exports.SubstrateId[____exports.SubstrateId.TopBottomInsideAngle] = "TopBottomInsideAngle"
____exports.SubstrateId.InsideAngle = 9
____exports.SubstrateId[____exports.SubstrateId.InsideAngle] = "InsideAngle"
____exports.SubstrateId.Full = 10
____exports.SubstrateId[____exports.SubstrateId.Full] = "Full"
____exports.EMPTY_SUBSTRATE = -1
____exports.Action = Action or ({})
____exports.Action.Swap = 0
____exports.Action[____exports.Action.Swap] = "Swap"
____exports.Action.Combination = 1
____exports.Action[____exports.Action.Combination] = "Combination"
____exports.Action.Combo = 2
____exports.Action[____exports.Action.Combo] = "Combo"
____exports.Action.HelicopterFly = 3
____exports.Action[____exports.Action.HelicopterFly] = "HelicopterFly"
____exports.Action.DiskosphereActivation = 4
____exports.Action[____exports.Action.DiskosphereActivation] = "DiskosphereActivation"
____exports.Action.DiskosphereTrace = 5
____exports.Action[____exports.Action.DiskosphereTrace] = "DiskosphereTrace"
____exports.Action.DynamiteActivation = 6
____exports.Action[____exports.Action.DynamiteActivation] = "DynamiteActivation"
____exports.Action.RocketActivation = 7
____exports.Action[____exports.Action.RocketActivation] = "RocketActivation"
____exports.Action.Falling = 8
____exports.Action[____exports.Action.Falling] = "Falling"
function ____exports.View(resources)
    local set_events, set_scene_art, set_substrates, calculate_cell_size, calculate_scale_ratio, calculate_cell_offset, on_load_game, on_resize, load_field, reset_field, on_rewind_animation, get_view_item_by_uid, get_all_view_items_by_uid, delete_view_item_by_uid, delete_all_view_items_by_uid, update_targets_by_uid, get_world_pos, get_field_pos, make_substrate_view, make_cell_view, make_element_view, on_down, on_move, on_up, on_set_helper, on_reset_helper, on_stop_helper, swap_elements_animation, wrong_swap_elements_animation, record_action, remove_action, has_actions, damage_element_animation, damage_cell_animation, on_combinate_busters, on_combinate_animation, on_combined_animation, on_combo_animation, on_combinate_not_found, on_requested_element_animation, on_falling_animation, on_falling_not_found, on_fall_end_animation, request_falling, on_damage, on_hammer_damage_animation, on_horizontal_damage_animation, on_vertical_damage_animation, on_dynamite_activated_animation, on_dynamite_action_animation, activate_dynamite_animation, on_rocket_activated_animation, rocket_effect, on_diskosphere_activated_animation, diskosphere_effect, trace_animation, on_helicopter_activated_animation, on_helicopter_action_animation, on_shuffle_animation, on_win, on_gameover, clear_field, remove_animals, on_set_tutorial, on_remove_tutorial, go_manager, view_state, original_game_width, original_game_height, cell_size, scale_ratio, cells_offset, down_item, is_block_input, locks, actions
    function set_events()
        EventBus.on("SYS_ON_RESIZED", on_resize)
        EventBus.on("RESPONSE_LOAD_GAME", on_load_game, false)
        EventBus.on("RESPONSE_RELOAD_FIELD", load_field, false)
        EventBus.on("MSG_ON_DOWN_ITEM", on_down)
        EventBus.on("MSG_ON_UP_ITEM", on_up)
        EventBus.on("MSG_ON_MOVE", on_move)
        EventBus.on("ON_WIN", on_win)
        EventBus.on("ON_GAME_OVER", on_gameover)
        EventBus.on(
            "SET_TUTORIAL",
            function(lock_info)
                if is_animal_level() and is_tutorial() then
                    EventBus.send("SET_ANIMAL_TUTORIAL_TIP")
                    EventBus.on(
                        "HIDED_ANIMAL_TUTORIAL_TIP",
                        function()
                            on_set_tutorial(lock_info)
                        end
                    )
                else
                    on_set_tutorial(lock_info)
                end
            end
        )
        EventBus.on("SET_HELPER", on_set_helper, false)
        EventBus.on("RESET_HELPER", on_reset_helper, false)
        EventBus.on("STOP_HELPER", on_stop_helper, false)
        EventBus.on("REMOVE_TUTORIAL", on_remove_tutorial)
        EventBus.on("RESPONSE_SWAP_ELEMENTS", swap_elements_animation, false)
        EventBus.on("RESPONSE_WRONG_SWAP_ELEMENTS", wrong_swap_elements_animation, false)
        EventBus.on("RESPONSE_COMBINATE_BUSTERS", on_combinate_busters, false)
        EventBus.on("RESPONSE_COMBINATE", on_combinate_animation, false)
        EventBus.on("RESPONSE_COMBINATE_NOT_FOUND", on_combinate_not_found, false)
        EventBus.on("RESPONSE_COMBINATION", on_combined_animation, false)
        EventBus.on("RESPONSE_FALLING", on_falling_animation, false)
        EventBus.on("RESPONSE_FALLING_NOT_FOUND", on_falling_not_found, false)
        EventBus.on("RESPONSE_FALL_END", on_fall_end_animation, false)
        EventBus.on("REQUESTED_ELEMENT", on_requested_element_animation, false)
        EventBus.on("RESPONSE_HAMMER_DAMAGE", on_hammer_damage_animation, false)
        EventBus.on("RESPONSE_DYNAMITE_ACTIVATED", on_dynamite_activated_animation, false)
        EventBus.on("RESPONSE_DYNAMITE_ACTION", on_dynamite_action_animation, false)
        EventBus.on("RESPONSE_ACTIVATED_ROCKET", on_rocket_activated_animation, false)
        EventBus.on("RESPONSE_ACTIVATED_DISKOSPHERE", on_diskosphere_activated_animation, false)
        EventBus.on("RESPONSE_ACTIVATED_HELICOPTER", on_helicopter_activated_animation, false)
        EventBus.on("RESPONSE_HELICOPTER_ACTION", on_helicopter_action_animation, false)
        EventBus.on("SHUFFLE_ACTION", on_shuffle_animation, false)
        EventBus.on(
            "UPDATED_TARGET",
            function(message)
                view_state.targets[message.idx] = message.target
            end,
            false
        )
        EventBus.on("RESPONSE_REWIND", on_rewind_animation, false)
    end
    function set_scene_art()
        local scene_name = Scene.get_current_name()
        Scene.load_resource(scene_name, "background")
        if __TS__ArrayIncludes(
            GAME_CONFIG.animal_levels,
            get_current_level() + 1
        ) then
            Scene.load_resource(scene_name, "cat")
            Scene.load_resource(
                scene_name,
                GAME_CONFIG.level_to_animal[get_current_level() + 1]
            )
        end
    end
    function set_substrates()
        do
            local y = 0
            while y < get_field_height() do
                view_state.substrates[y + 1] = {}
                do
                    local x = 0
                    while x < get_field_width() do
                        view_state.substrates[y + 1][x + 1] = ____exports.EMPTY_SUBSTRATE
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function calculate_cell_size()
        return math.floor(math.min(
            (original_game_width - get_field_offset_border() * 2) / get_field_max_width(),
            100
        ))
    end
    function calculate_scale_ratio()
        return cell_size / get_field_cell_size()
    end
    function calculate_cell_offset(height_delta, changes_coff)
        if height_delta == nil then
            height_delta = 0
        end
        if changes_coff == nil then
            changes_coff = 1
        end
        local offset_x = original_game_width / 2 - get_field_width() / 2 * cell_size
        local offset_y = -(original_game_height / 2 - get_field_max_height() / 2 * cell_size) + 600
        return vmath.vector3(offset_x, offset_y, 0)
    end
    function on_load_game(game_state)
        load_field(game_state)
        EventBus.send("INIT_UI")
        EventBus.send("UPDATED_STEP_COUNTER", game_state.steps)
        do
            local i = 0
            while i < #game_state.targets do
                local target = game_state.targets[i + 1]
                local amount = target.count - #target.uids
                view_state.targets[i] = target
                EventBus.send("UPDATED_TARGET_UI", {idx = i, amount = amount, id = target.id, type = target.type})
                i = i + 1
            end
        end
        EventBus.send("REQUEST_IDLE")
    end
    function on_resize(data)
        Log.log("RESIZE")
        local display_height = 960
        local window_aspect = data.width / data.height
        local display_width = tonumber(sys.get_config("display.width"))
        if display_width then
            local aspect = display_width / display_height
            local zoom = 1
            if window_aspect >= aspect then
                local height = display_width / window_aspect
                zoom = height / display_height
            end
            Log.log("ZOOM")
            Camera.set_zoom(zoom)
        end
    end
    function load_field(game_state, with_anim)
        if with_anim == nil then
            with_anim = true
        end
        Log.log("LOAD FIELD_VIEW")
        set_substrates()
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local cell = game_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            make_substrate_view({x = x, y = y}, game_state.cells)
                            make_cell_view(
                                {x = x, y = y},
                                base_cell(cell.uid)
                            )
                            make_cell_view({x = x, y = y}, cell)
                        end
                        local element = game_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            make_element_view(x, y, element, with_anim)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function reset_field()
        Log.log("RESET FIELD VIEW")
        for ____, ____value in ipairs(__TS__ObjectEntries(view_state.game_id_to_view_index)) do
            local suid = ____value[1]
            local index = ____value[2]
            local uid = tonumber(suid)
            if uid ~= nil then
                local items = get_all_view_items_by_uid(uid)
                if items ~= nil then
                    for ____, item in ipairs(items) do
                        go_manager.delete_item(item, true)
                    end
                end
            end
        end
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local substrate = view_state.substrates[y + 1][x + 1]
                        if substrate ~= ____exports.EMPTY_SUBSTRATE then
                            go.delete(substrate)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        view_state.game_id_to_view_index = {}
        view_state.substrates = {}
        do
            local y = 0
            while y < get_field_height() do
                view_state.substrates[y + 1] = {}
                do
                    local x = 0
                    while x < get_field_width() do
                        view_state.substrates[y + 1][x + 1] = ____exports.EMPTY_SUBSTRATE
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function on_rewind_animation(state)
        reset_field()
        load_field(state)
        do
            local i = 0
            while i < #state.targets do
                local target = state.targets[i + 1]
                local amount = target.count - #target.uids
                view_state.targets[i] = target
                EventBus.send("UPDATED_TARGET_UI", {idx = i, amount = amount, id = target.id, type = target.type})
                i = i + 1
            end
        end
    end
    function get_view_item_by_uid(uid)
        local indices = view_state.game_id_to_view_index[uid]
        if indices == nil then
            return
        end
        return go_manager.get_item_by_index(indices[1])
    end
    function get_all_view_items_by_uid(uid)
        local indices = view_state.game_id_to_view_index[uid]
        if indices == nil then
            return
        end
        local items = {}
        for ____, index in ipairs(indices) do
            items[#items + 1] = go_manager.get_item_by_index(index)
        end
        return items
    end
    function delete_view_item_by_uid(uid)
        local item = get_view_item_by_uid(uid)
        if item == nil then
            __TS__Delete(view_state.game_id_to_view_index, uid)
            return
        end
        update_targets_by_uid(uid)
        go_manager.delete_item(item, true)
        __TS__ArraySplice(view_state.game_id_to_view_index[uid], 0, 1)
    end
    function delete_all_view_items_by_uid(uid)
        local items = get_all_view_items_by_uid(uid)
        if items == nil then
            return
        end
        for ____, item in ipairs(items) do
            go_manager.delete_item(item, true)
        end
        update_targets_by_uid(uid)
        __TS__Delete(view_state.game_id_to_view_index, uid)
    end
    function update_targets_by_uid(uid)
        do
            local i = 0
            while i < #__TS__ObjectEntries(view_state.targets) do
                local target = view_state.targets[i]
                if __TS__ArrayIncludes(target.uids, uid) then
                    local amount = target.count - #target.uids
                    EventBus.send("UPDATED_TARGET_UI", {idx = i, amount = amount, id = target.id, type = target.type})
                end
                i = i + 1
            end
        end
    end
    function get_world_pos(pos, z)
        if z == nil then
            z = 0
        end
        return vmath.vector3(cells_offset.x + cell_size * pos.x + cell_size * 0.5, cells_offset.y - cell_size * pos.y - cell_size * 0.5, z)
    end
    function get_field_pos(world_pos)
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local original_world_pos = get_world_pos({x = x, y = y})
                        local in_x = world_pos.x >= original_world_pos.x - cell_size * 0.5 and world_pos.x <= original_world_pos.x + cell_size * 0.5
                        local in_y = world_pos.y >= original_world_pos.y - cell_size * 0.5 and world_pos.y <= original_world_pos.y + cell_size * 0.5
                        if in_x and in_y then
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
    function make_substrate_view(pos, cells, z_index)
        if z_index == nil then
            z_index = GAME_CONFIG.default_substrate_z_index
        end
        do
            local mask_index = 0
            while mask_index < #SubstrateMasks do
                local mask = SubstrateMasks[mask_index + 1]
                local is_90_mask = false
                if mask_index == ____exports.SubstrateId.LeftRightStrip then
                    is_90_mask = true
                end
                local angle = 0
                local max_angle = is_90_mask and 90 or 270
                while angle <= max_angle do
                    local is_valid = true
                    do
                        local i = pos.y - (#mask - 1) / 2
                        while i <= pos.y + (#mask - 1) / 2 and is_valid do
                            do
                                local j = pos.x - (#mask[1] - 1) / 2
                                while j <= pos.x + (#mask[1] - 1) / 2 and is_valid do
                                    if mask[i - (pos.y - (#mask - 1) / 2) + 1][j - (pos.x - (#mask[1] - 1) / 2) + 1] == 1 then
                                        if is_valid_pos(j, i, #cells[1], #cells) then
                                            local cell = cells[i + 1][j + 1]
                                            is_valid = cell == NotActiveCell
                                        else
                                            is_valid = true
                                        end
                                    end
                                    j = j + 1
                                end
                            end
                            i = i + 1
                        end
                    end
                    if is_valid then
                        local worldPos = get_world_pos(pos, z_index)
                        local _go = go_manager.make_go("substrate_view", worldPos)
                        go_manager.set_rotation_hash(_go, -angle)
                        sprite.play_flipbook(
                            msg.url(nil, _go, "sprite"),
                            GAME_CONFIG.substrate_view[mask_index]
                        )
                        go.set_scale(
                            vmath.vector3(scale_ratio, scale_ratio, 1),
                            _go
                        )
                        view_state.substrates[pos.y + 1][pos.x + 1] = _go
                        return
                    end
                    mask = rotateMatrix(mask, 90)
                    angle = angle + 90
                end
                mask_index = mask_index + 1
            end
        end
    end
    function make_cell_view(pos, cell)
        local z_index
        local is_top_layer_cell = __TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, cell.id)
        if is_top_layer_cell then
            z_index = GAME_CONFIG.default_top_layer_cell_z_index
        else
            z_index = GAME_CONFIG.default_cell_z_index
        end
        if cell.id == CellId.Base then
            z_index = z_index - 0.1
        end
        local worldPos = get_world_pos(pos, z_index)
        local _go = go_manager.make_go("cell_view", worldPos)
        local view
        if __TS__ArrayIsArray(GAME_CONFIG.cell_view[cell.id]) then
            local index = cell.strength ~= nil and cell.strength or 1
            view = GAME_CONFIG.cell_view[cell.id][index]
        else
            view = GAME_CONFIG.cell_view[cell.id]
        end
        sprite.play_flipbook(
            msg.url(nil, _go, "sprite"),
            view
        )
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        if cell.id == CellId.Base then
            go_manager.set_color_hash(_go, GAME_CONFIG.base_cell_color)
        end
        local index = go_manager.add_game_item({_hash = _go, is_clickable = true})
        if view_state.game_id_to_view_index[cell.uid] == nil then
            view_state.game_id_to_view_index[cell.uid] = {}
        end
        local ____view_state_game_id_to_view_index_cell_uid_0 = view_state.game_id_to_view_index[cell.uid]
        ____view_state_game_id_to_view_index_cell_uid_0[#____view_state_game_id_to_view_index_cell_uid_0 + 1] = index
        return index
    end
    function make_element_view(x, y, element, spawn_anim)
        if spawn_anim == nil then
            spawn_anim = false
        end
        local z_index = GAME_CONFIG.default_element_z_index
        local pos = get_world_pos({x = x, y = y}, z_index)
        local _go = go_manager.make_go("element_view", pos)
        sprite.play_flipbook(
            msg.url(nil, _go, "sprite"),
            GAME_CONFIG.element_view[element.id]
        )
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
                GAME_CONFIG.spawn_element_easing,
                GAME_CONFIG.spawn_element_time
            )
        else
            go.set_scale(
                vmath.vector3(scale_ratio, scale_ratio, 1),
                _go
            )
        end
        local item = {_hash = _go, is_clickable = true}
        local index = go_manager.add_game_item(item)
        if view_state.game_id_to_view_index[element.uid] == nil then
            view_state.game_id_to_view_index[element.uid] = {}
        end
        if element.uid ~= nil then
            local ____view_state_game_id_to_view_index_element_uid_1 = view_state.game_id_to_view_index[element.uid]
            ____view_state_game_id_to_view_index_element_uid_1[#____view_state_game_id_to_view_index_element_uid_1 + 1] = index
        end
        return item
    end
    function on_down(message)
        down_item = message.item
    end
    function on_move(pos)
        if down_item == nil then
            return
        end
        local world_pos = Camera.screen_to_world(pos.x, pos.y)
        local selected_element_world_pos = go.get_position(down_item._hash)
        local delta = world_pos - selected_element_world_pos
        if vmath.length(delta) < GAME_CONFIG.min_swipe_distance then
            return
        end
        local selected_element_pos = get_field_pos(selected_element_world_pos)
        local element_to_pos = json.decode(json.encode(selected_element_pos))
        local direction = vmath.normalize(delta)
        local move_direction = get_move_direction(direction)
        repeat
            local ____switch91 = move_direction
            local ____cond91 = ____switch91 == Direction.Up
            if ____cond91 then
                element_to_pos.y = element_to_pos.y - 1
                break
            end
            ____cond91 = ____cond91 or ____switch91 == Direction.Down
            if ____cond91 then
                element_to_pos.y = element_to_pos.y + 1
                break
            end
            ____cond91 = ____cond91 or ____switch91 == Direction.Left
            if ____cond91 then
                element_to_pos.x = element_to_pos.x - 1
                break
            end
            ____cond91 = ____cond91 or ____switch91 == Direction.Right
            if ____cond91 then
                element_to_pos.x = element_to_pos.x + 1
                break
            end
        until true
        local is_valid_x = element_to_pos.x >= 0 and element_to_pos.x < get_field_width()
        local is_valid_y = element_to_pos.y >= 0 and element_to_pos.y < get_field_height()
        if not is_valid_x or not is_valid_y then
            return
        end
        EventBus.send("REQUEST_TRY_SWAP_ELEMENTS", {from = selected_element_pos, to = element_to_pos})
        down_item = nil
    end
    function on_up(message)
        if down_item == nil then
            return
        end
        local item = message.item
        if item == nil then
            return
        end
        local item_world_pos = go.get_position(item._hash)
        local element_pos = get_field_pos(item_world_pos)
        EventBus.send("REQUEST_CLICK", {x = element_pos.x, y = element_pos.y})
        down_item = nil
    end
    function on_set_helper(data)
        local combined_item = get_view_item_by_uid(data.combined_element.uid)
        if combined_item ~= nil then
            local from_pos = get_world_pos(data.step.from, GAME_CONFIG.default_element_z_index)
            local to_pos = get_world_pos(data.step.to, GAME_CONFIG.default_element_z_index)
            go.set_position(from_pos, combined_item._hash)
            go.animate(
                combined_item._hash,
                "position.x",
                go.PLAYBACK_LOOP_PINGPONG,
                from_pos.x + (to_pos.x - from_pos.x) * 0.1,
                go.EASING_INCUBIC,
                2.5
            )
            go.animate(
                combined_item._hash,
                "position.y",
                go.PLAYBACK_LOOP_PINGPONG,
                from_pos.y + (to_pos.y - from_pos.y) * 0.1,
                go.EASING_INCUBIC,
                2.5
            )
        end
        for ____, element in ipairs(data.elements) do
            local item = get_view_item_by_uid(element.uid)
            if item ~= nil then
                go.animate(
                    msg.url(nil, item._hash, "sprite"),
                    "tint",
                    go.PLAYBACK_LOOP_PINGPONG,
                    vmath.vector4(0.75, 0.75, 0.75, 1),
                    go.EASING_INCUBIC,
                    2.5
                )
            end
        end
    end
    function on_reset_helper(data)
        local combined_item = get_view_item_by_uid(data.combined_element.uid)
        if combined_item ~= nil then
            go.cancel_animations(combined_item._hash)
            local from_pos = get_world_pos(data.step.from, GAME_CONFIG.default_element_z_index)
            go.set(combined_item._hash, "position", from_pos)
        end
        for ____, element in ipairs(data.elements) do
            local item = get_view_item_by_uid(element.uid)
            if item ~= nil then
                go.cancel_animations(msg.url(nil, item._hash, "sprite"))
                go.set(
                    msg.url(nil, item._hash, "sprite"),
                    "tint",
                    vmath.vector4(1, 1, 1, 1)
                )
            end
        end
    end
    function on_stop_helper(data)
        local combined_item = get_view_item_by_uid(data.combined_element.uid)
        if combined_item ~= nil then
            go.cancel_animations(combined_item._hash)
            local from_pos = get_world_pos(data.step.from, GAME_CONFIG.default_element_z_index)
            go.animate(
                combined_item._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                from_pos,
                go.EASING_INCUBIC,
                0.15
            )
        end
        for ____, element in ipairs(data.elements) do
            local item = get_view_item_by_uid(element.uid)
            if item ~= nil then
                go.cancel_animations(msg.url(nil, item._hash, "sprite"))
                go.set(
                    msg.url(nil, item._hash, "sprite"),
                    "tint",
                    vmath.vector4(1, 1, 1, 1)
                )
            end
        end
    end
    function swap_elements_animation(message)
        local from_world_pos = get_world_pos(message.from)
        local to_world_pos = get_world_pos(message.to)
        local element_from = message.element_from
        local element_to = message.element_to
        local item_from = get_view_item_by_uid(element_from.uid)
        if item_from ~= nil then
            go.animate(
                item_from._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                to_world_pos,
                GAME_CONFIG.spawn_element_easing,
                GAME_CONFIG.swap_element_time
            )
        end
        if element_to ~= NullElement then
            local item_to = get_view_item_by_uid(element_to.uid)
            if item_to ~= nil then
                go.animate(
                    item_to._hash,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    from_world_pos,
                    GAME_CONFIG.spawn_element_easing,
                    GAME_CONFIG.swap_element_time
                )
            end
        end
        Sound.play("swap")
        record_action(____exports.Action.Swap)
        timer.delay(
            GAME_CONFIG.swap_element_time,
            false,
            function()
                remove_action(____exports.Action.Swap)
                EventBus.send("REQUEST_SWAP_ELEMENTS_END", message)
                if element_to == NullElement then
                    print("REQUEST FALLING SWAP: ", message.from.x, message.from.y)
                    request_falling(message.from)
                end
                record_action(____exports.Action.Combination)
                record_action(____exports.Action.Combination)
                EventBus.send("REQUEST_COMBINATE", {combined_positions = {message.from, message.to}})
                EventBus.send("REQUEST_TRY_ACTIVATE_BUSTER_AFTER_SWAP", message)
            end
        )
    end
    function wrong_swap_elements_animation(message)
        local from_world_pos = get_world_pos(message.from)
        local to_world_pos = get_world_pos(message.to)
        local element_from = message.element_from
        local element_to = message.element_to
        local item_from = get_view_item_by_uid(element_from.uid)
        if item_from ~= nil then
            go.animate(
                item_from._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                to_world_pos,
                GAME_CONFIG.swap_element_easing,
                GAME_CONFIG.swap_element_time,
                0,
                function()
                    go.animate(
                        item_from._hash,
                        "position",
                        go.PLAYBACK_ONCE_FORWARD,
                        from_world_pos,
                        GAME_CONFIG.swap_element_easing,
                        GAME_CONFIG.swap_element_time
                    )
                end
            )
        end
        if element_to ~= NullElement then
            local item_to = get_view_item_by_uid(element_to.uid)
            if item_to ~= nil then
                go.animate(
                    item_to._hash,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    from_world_pos,
                    GAME_CONFIG.swap_element_easing,
                    GAME_CONFIG.swap_element_time,
                    0,
                    function()
                        go.animate(
                            item_to._hash,
                            "position",
                            go.PLAYBACK_ONCE_FORWARD,
                            to_world_pos,
                            GAME_CONFIG.swap_element_easing,
                            GAME_CONFIG.swap_element_time
                        )
                    end
                )
            end
        end
        Sound.play("swap")
    end
    function record_action(action)
        actions[#actions + 1] = action
    end
    function remove_action(action)
        __TS__ArraySplice(
            actions,
            __TS__ArrayFindIndex(
                actions,
                function(____, a) return a == action end
            ),
            1
        )
    end
    function has_actions()
        return #actions > 0
    end
    function damage_element_animation(element)
        local element_view = get_view_item_by_uid(element.uid)
        if element_view == nil then
            return
        end
        delete_all_view_items_by_uid(element.uid)
        if __TS__ArrayIncludes(GAME_CONFIG.buster_elements, element.id) then
            return
        end
        local world_pos = go.get_position(element_view._hash)
        local effect = go_manager.make_go("effect_view", world_pos)
        local effect_name = "explode"
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            effect
        )
        msg.post(
            msg.url(nil, effect, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, effect, effect_name),
            "enable"
        )
        local color = GAME_CONFIG.element_colors[element.id]
        local anim_props = {blend_duration = 0, playback_rate = 1}
        spine.play_anim(
            msg.url(nil, effect, effect_name),
            color,
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function()
                go.delete(effect)
            end
        )
    end
    function damage_cell_animation(cell)
        local cell_view = get_view_item_by_uid(cell.uid)
        if cell_view == nil then
            return
        end
        delete_all_view_items_by_uid(cell.uid)
        local world_pos = go.get_position(cell_view._hash)
        local pos = get_field_pos(world_pos)
        make_cell_view(
            pos,
            base_cell(cell.uid)
        )
        if cell.strength ~= nil and cell.strength > 0 then
            make_cell_view(pos, cell)
        elseif __TS__ArrayIncludes(GAME_CONFIG.not_moved_cells, cell.id) then
            print("REQUEST FALLING DAMAGE CELL: ", pos.x, pos.y)
            request_falling(pos)
        end
        local ____type = cell.id
        if not __TS__ArrayIncludes(GAME_CONFIG.explodable_cells, ____type) then
            return
        end
        local effect_pos = get_world_pos(
            pos,
            (__TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, ____type) and GAME_CONFIG.default_top_layer_cell_z_index or GAME_CONFIG.default_cell_z_index) + 0.1
        )
        local effect = go_manager.make_go("effect_view", effect_pos)
        local view = ""
        if __TS__ArrayIsArray(GAME_CONFIG.cell_view[____type]) then
            view = GAME_CONFIG.cell_view[____type][#GAME_CONFIG.cell_view[____type]]
        else
            view = GAME_CONFIG.cell_view[____type]
        end
        local effect_name = view .. "_explode"
        msg.post(
            msg.url(nil, effect, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, effect, effect_name),
            "enable"
        )
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            effect
        )
        local anim_props = {blend_duration = 0, playback_rate = 1}
        local anim_name = ""
        if ____type == CellId.Grass then
            anim_name = "1"
        else
            anim_name = cell.strength ~= nil and tostring(cell.strength + 1) or "1"
        end
        spine.play_anim(
            msg.url(nil, effect, effect_name),
            anim_name,
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function()
                go.delete(effect)
            end
        )
    end
    function on_combinate_busters(message)
        local view_from_buster = get_view_item_by_uid(message.buster_from.element.uid)
        if view_from_buster == nil then
            return
        end
        local to_world_pos = get_world_pos(message.buster_to.pos)
        go.animate(
            view_from_buster._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            to_world_pos,
            GAME_CONFIG.squash_easing,
            GAME_CONFIG.squash_time,
            0,
            function()
                delete_view_item_by_uid(message.buster_from.element.uid)
                print("REQUEST FALLING COMBINATE: ", message.buster_from.pos.x, message.buster_from.pos.y)
                request_falling(message.buster_from.pos)
                EventBus.send("REQUEST_COMBINED_BUSTERS", message)
            end
        )
    end
    function on_combinate_animation(combination)
        timer.delay(
            GAME_CONFIG.combination_delay,
            false,
            function()
                EventBus.send("REQUEST_COMBINATION", combination)
            end
        )
    end
    function on_combined_animation(message)
        remove_action(____exports.Action.Combination)
        if message.maked_element ~= nil then
            return on_combo_animation(message)
        end
        for ____, damage_info in ipairs(message.damages) do
            on_damage(damage_info)
            print("REQUEST FALLING COMBINED: ", damage_info.pos.x, damage_info.pos.y)
            request_falling(damage_info.pos)
        end
        EventBus.send("REQUEST_COMBINATION_END", message.damages)
    end
    function on_combo_animation(message)
        local world_pos = get_world_pos(message.pos)
        for ____, damage_info in ipairs(message.damages) do
            if damage_info.element ~= nil then
                local element = damage_info.element
                local element_view = get_view_item_by_uid(element.uid)
                if element_view ~= nil then
                    go.animate(
                        element_view._hash,
                        "position",
                        go.PLAYBACK_ONCE_FORWARD,
                        world_pos,
                        GAME_CONFIG.squash_easing,
                        GAME_CONFIG.squash_time,
                        0,
                        function()
                            delete_view_item_by_uid(element.uid)
                            if damage_info.damaged_cells ~= nil then
                                for ____, damaged_cell_info in ipairs(damage_info.damaged_cells) do
                                    if __TS__ArrayIncludes(GAME_CONFIG.sounded_cells, damaged_cell_info.cell.id) then
                                        Sound.play(GAME_CONFIG.cell_sound[damaged_cell_info.cell.id])
                                    end
                                    damage_cell_animation(damaged_cell_info.cell)
                                end
                            end
                        end
                    )
                    print("REQUEST FALLING COMBO: ", damage_info.pos.x, damage_info.pos.y)
                    request_falling(damage_info.pos, GAME_CONFIG.squash_time + 0.1)
                end
            end
        end
        Sound.play("combo")
        record_action(____exports.Action.Combo)
        timer.delay(
            GAME_CONFIG.squash_time,
            false,
            function()
                remove_action(____exports.Action.Combo)
                if message.maked_element ~= nil then
                    print("MAKE ELEMENT: ", message.pos.x, message.pos.y)
                    make_element_view(message.pos.x, message.pos.y, message.maked_element)
                    EventBus.send("MAKED_ELEMENT", message.pos)
                end
                EventBus.send("REQUEST_COMBINATION_END", message.damages)
            end
        )
    end
    function on_combinate_not_found(pos)
        remove_action(____exports.Action.Combination)
        print("REQUEST FALLING COMBINATE NOT FOUND: ", pos.x, pos.y)
        request_falling(pos)
    end
    function on_requested_element_animation(message)
        make_element_view(message.pos.x, message.pos.y, message.element)
    end
    function on_falling_animation(message)
        local element_view = get_view_item_by_uid(message.element.uid)
        if element_view ~= nil then
            print("REQUEST FALLING ANIMATION: ", message.start_pos.x, message.start_pos.y)
            request_falling(message.start_pos)
            local to_world_pos = get_world_pos(message.next_pos)
            go.animate(
                element_view._hash,
                "position",
                go.PLAYBACK_ONCE_FORWARD,
                to_world_pos,
                go.EASING_LINEAR,
                GAME_CONFIG.falling_time,
                0,
                function()
                    EventBus.send("REQUEST_FALL_END", message.next_pos)
                end
            )
        else
            print("FAIL FALL ANIMATION: ", message.start_pos.x, message.start_pos.y)
        end
    end
    function on_falling_not_found(pos)
        remove_action(____exports.Action.Falling)
        if not has_actions() then
            EventBus.send("REQUEST_IDLE")
        end
    end
    function on_fall_end_animation(info)
        local element_view = get_view_item_by_uid(info.element.uid)
        if element_view == nil then
            return
        end
        remove_action(____exports.Action.Falling)
        record_action(____exports.Action.Combination)
        local world_pos = go.get_position(element_view._hash)
        world_pos.y = world_pos.y + 5
        go.animate(
            element_view._hash,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            world_pos,
            go.EASING_OUTQUAD,
            0.25,
            0,
            function()
                world_pos.y = world_pos.y - 5
                go.animate(
                    element_view._hash,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    world_pos,
                    go.EASING_OUTBOUNCE,
                    0.25
                )
            end
        )
        timer.delay(
            0.25,
            false,
            function()
                EventBus.send("REQUEST_COMBINATE", {combined_positions = {info.pos}})
            end
        )
    end
    function request_falling(pos, delay)
        if delay == nil then
            delay = GAME_CONFIG.falling_dalay
        end
        record_action(____exports.Action.Falling)
        timer.delay(
            delay,
            false,
            function()
                Log.log("REQUEST FALLING: ", pos.x, pos.y)
                EventBus.send("REQUEST_FALLING", pos)
            end
        )
    end
    function on_damage(damage_info)
        if damage_info.element ~= nil then
            Sound.play("broke_element")
            if damage_info.element.state == ElementState.Fall then
                remove_action(____exports.Action.Falling)
            end
            damage_element_animation(damage_info.element)
        end
        if damage_info.damaged_cells ~= nil then
            for ____, damaged_cell_info in ipairs(damage_info.damaged_cells) do
                if __TS__ArrayIncludes(GAME_CONFIG.sounded_cells, damaged_cell_info.cell.id) then
                    Sound.play(GAME_CONFIG.cell_sound[damaged_cell_info.cell.id])
                end
                damage_cell_animation(damaged_cell_info.cell)
            end
        end
    end
    function on_hammer_damage_animation(damage_info)
        on_damage(damage_info)
        request_falling(damage_info.pos)
    end
    function on_horizontal_damage_animation(damages)
        for ____, damage_info in ipairs(damages) do
            on_damage(damage_info)
            request_falling(damage_info.pos)
        end
    end
    function on_vertical_damage_animation(damages)
        for ____, damage_info in ipairs(damages) do
            on_damage(damage_info)
            request_falling(damage_info.pos)
        end
    end
    function on_dynamite_activated_animation(messages)
        Sound.play("dynamite")
        record_action(____exports.Action.DynamiteActivation)
        activate_dynamite_animation(
            messages.pos,
            messages.big_range and 1.5 or 1,
            function()
                remove_action(____exports.Action.DynamiteActivation)
                EventBus.send("REQUEST_DYNAMITE_ACTION", messages)
            end
        )
    end
    function on_dynamite_action_animation(message)
        for ____, damage_info in ipairs(message.damages) do
            on_damage(damage_info)
            request_falling(damage_info.pos)
        end
    end
    function activate_dynamite_animation(pos, range, on_explode)
        local world_pos = get_world_pos(pos, GAME_CONFIG.default_vfx_z_index + 0.1)
        local _go = go_manager.make_go("effect_view", world_pos)
        go.set_scale(
            vmath.vector3(scale_ratio * range, scale_ratio * range, 1),
            _go
        )
        msg.post(
            msg.url(nil, _go, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, _go, "dynamite"),
            "enable"
        )
        local anim_props = {blend_duration = 0, playback_rate = 1.25}
        spine.play_anim(
            msg.url(nil, _go, "dynamite"),
            "action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function()
                go_manager.delete_go(_go)
            end
        )
        timer.delay(0.5, false, on_explode)
    end
    function on_rocket_activated_animation(message)
        local world_pos = get_world_pos(message.pos, GAME_CONFIG.default_element_z_index + 2.1)
        record_action(____exports.Action.RocketActivation)
        rocket_effect(
            message,
            world_pos,
            message.axis,
            function()
                remove_action(____exports.Action.RocketActivation)
                repeat
                    local ____switch199 = message.axis
                    local ____cond199 = ____switch199 == Axis.Horizontal
                    if ____cond199 then
                        on_horizontal_damage_animation(message.damages)
                        break
                    end
                    ____cond199 = ____cond199 or ____switch199 == Axis.Vertical
                    if ____cond199 then
                        on_vertical_damage_animation(message.damages)
                        break
                    end
                    ____cond199 = ____cond199 or ____switch199 == Axis.All
                    if ____cond199 then
                        on_horizontal_damage_animation(message.damages)
                        on_vertical_damage_animation(message.damages)
                        break
                    end
                until true
                EventBus.send("REQUEST_ROCKET_END", message.damages)
            end
        )
        delete_view_item_by_uid(message.uid)
    end
    function rocket_effect(message, pos, axis, on_end)
        Sound.play("rocket")
        if axis == Axis.All then
            rocket_effect(message, pos, Axis.Vertical, on_end)
            rocket_effect(message, pos, Axis.Horizontal, on_end)
            return
        end
        local part0 = go_manager.make_go("effect_view", pos)
        local part1 = go_manager.make_go("effect_view", pos)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            part0
        )
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            part1
        )
        repeat
            local ____switch202 = axis
            local ____cond202 = ____switch202 == Axis.Vertical
            if ____cond202 then
                go_manager.set_rotation_hash(part1, 180)
                break
            end
            ____cond202 = ____cond202 or ____switch202 == Axis.Horizontal
            if ____cond202 then
                go_manager.set_rotation_hash(part0, 90)
                go_manager.set_rotation_hash(part1, -90)
                break
            end
        until true
        msg.post(
            msg.url(nil, part0, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, part1, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, part0, "rocket"),
            "enable"
        )
        msg.post(
            msg.url(nil, part1, "rocket"),
            "enable"
        )
        local anim_props = {blend_duration = 0, playback_rate = 1}
        spine.play_anim(
            msg.url(nil, part0, "rocket"),
            "action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props
        )
        spine.play_anim(
            msg.url(nil, part1, "rocket"),
            "action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props
        )
        local part0_to_world_pos = vmath.vector3(pos)
        local part1_to_world_pos = vmath.vector3(pos)
        if axis == Axis.Vertical then
            local distance = get_field_height() * cell_size
            part0_to_world_pos.y = part0_to_world_pos.y + distance
            part1_to_world_pos.y = part1_to_world_pos.y + -distance
        end
        if axis == Axis.Horizontal then
            local distance = get_field_width() * cell_size
            part0_to_world_pos.x = part0_to_world_pos.x + -distance
            part1_to_world_pos.x = part1_to_world_pos.x + distance
        end
        go.animate(
            part0,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            part0_to_world_pos,
            go.EASING_INCUBIC,
            0.3,
            0,
            function()
                go.delete(part0)
            end
        )
        go.animate(
            part1,
            "position",
            go.PLAYBACK_ONCE_FORWARD,
            part1_to_world_pos,
            go.EASING_INCUBIC,
            0.3,
            0,
            function()
                go.delete(part1)
            end
        )
        timer.delay(0.3, false, on_end)
    end
    function on_diskosphere_activated_animation(message)
        diskosphere_effect(message.pos, message.uid, message.damages, message.buster)
    end
    function diskosphere_effect(pos, uid, damages, buster, on_complete)
        local damage_info = __TS__ArrayFind(
            damages,
            function(____, damage_info)
                if damage_info.element == nil then
                    return false
                end
                return damage_info.element.id == ElementId.Diskosphere
            end
        )
        if damage_info ~= nil and damage_info.element then
            delete_view_item_by_uid(damage_info.element.uid)
        end
        local worldPos = get_world_pos(pos, GAME_CONFIG.default_element_z_index + 2.1)
        local _go = go_manager.make_go("effect_view", worldPos)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            _go
        )
        msg.post(
            msg.url(nil, _go, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, _go, "diskosphere"),
            "enable"
        )
        msg.post(
            msg.url(nil, _go, "diskosphere_light"),
            "enable"
        )
        record_action(____exports.Action.DiskosphereActivation)
        local anim_props = {blend_duration = 0, playback_rate = 1.25}
        spine.play_anim(
            msg.url(nil, _go, "diskosphere"),
            "light_ball_intro",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function(____self, message_id, message, sender)
                if message_id == hash("spine_animation_done") then
                    remove_action(____exports.Action.DiskosphereActivation)
                    EventBus.send("DISKOSPHERE_ACTIVATED_END", pos)
                    local anim_props = {blend_duration = 0, playback_rate = 1.25}
                    if message.animation_id == hash("light_ball_intro") then
                        record_action(____exports.Action.DiskosphereTrace)
                        trace_animation(
                            worldPos,
                            _go,
                            damages,
                            #damages,
                            function(damage_info)
                                remove_action(____exports.Action.DiskosphereTrace)
                                local ____opt_2 = damage_info.element
                                if (____opt_2 and ____opt_2.uid) == uid then
                                    return request_falling(damage_info.pos)
                                end
                                on_damage(damage_info)
                                request_falling(damage_info.pos)
                                EventBus.send("REQUEST_DISKOSPHERE_DAMAGE_ELEMENT_END", {damage_info = damage_info, buster = buster})
                            end,
                            function()
                                spine.play_anim(
                                    msg.url(nil, _go, "diskosphere_light"),
                                    "light_ball_explosion",
                                    go.PLAYBACK_ONCE_FORWARD,
                                    anim_props
                                )
                                msg.post(
                                    msg.url(nil, _go, "diskosphere"),
                                    "disable"
                                )
                                if on_complete ~= nil then
                                    on_complete()
                                end
                            end
                        )
                    end
                end
            end
        )
    end
    function trace_animation(world_pos, diskosphere, damages, counter, on_trace_end, on_complete)
        local anim_props = {blend_duration = 0, playback_rate = 1}
        spine.play_anim(
            msg.url(nil, diskosphere, "diskosphere"),
            "light_ball_action",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props
        )
        spine.play_anim(
            msg.url(nil, diskosphere, "diskosphere_light"),
            "light_ball_action_light",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props
        )
        if #damages == 0 then
            return on_complete()
        end
        local projectile = go_manager.make_go("effect_view", world_pos)
        go.set_scale(
            vmath.vector3(scale_ratio, scale_ratio, 1),
            projectile
        )
        msg.post(
            msg.url(nil, projectile, nil),
            "disable"
        )
        msg.post(
            msg.url(nil, projectile, "diskosphere_projectile"),
            "enable"
        )
        local damage_info = damages[counter + 1]
        while true do
            local ____temp_8 = damage_info == nil
            if not ____temp_8 then
                local ____temp_7 = damage_info.element ~= nil
                if ____temp_7 then
                    local ____opt_5 = get_view_item_by_uid(damage_info.element.uid)
                    ____temp_7 = (____opt_5 and ____opt_5._hash) == diskosphere
                end
                ____temp_8 = ____temp_7
            end
            if not ____temp_8 then
                break
            end
            local ____damages_4 = damages
            counter = counter - 1
            damage_info = ____damages_4[counter + 1]
        end
        local target_pos = get_world_pos(damage_info.pos, GAME_CONFIG.default_element_z_index + 0.1)
        spine.set_ik_target_position(
            msg.url(nil, projectile, "diskosphere_projectile"),
            "ik_projectile_target",
            target_pos
        )
        spine.play_anim(
            msg.url(nil, projectile, "diskosphere_projectile"),
            "light_ball_projectile",
            go.PLAYBACK_ONCE_FORWARD,
            anim_props,
            function(____self, message_id, message, sender)
                if message_id == hash("spine_animation_done") then
                    go.delete(projectile)
                    on_trace_end(damage_info)
                end
            end
        )
        if counter == 0 then
            return on_complete()
        end
        trace_animation(
            world_pos,
            diskosphere,
            damages,
            counter - 1,
            on_trace_end,
            on_complete
        )
    end
    function on_helicopter_activated_animation(message)
        for ____, damage_info in ipairs(message.damages) do
            on_damage(damage_info)
            request_falling(damage_info.pos)
        end
        EventBus.send("REQUEST_HELICOPTER_ACTION", message)
    end
    function on_helicopter_action_animation(message)
        Sound.play("helicopter")
        local helicopter_world_pos = get_world_pos(message.pos)
        helicopter_world_pos.z = 3
        local helicopters = {}
        do
            local i = 0
            while i < #message.damages do
                local _go = go_manager.make_go("element_view", helicopter_world_pos)
                sprite.play_flipbook(
                    msg.url(nil, _go, "sprite"),
                    GAME_CONFIG.element_view[ElementId.Helicopter]
                )
                go.set_scale(
                    vmath.vector3(scale_ratio, scale_ratio, 1),
                    _go
                )
                helicopters[#helicopters + 1] = _go
                i = i + 1
            end
        end
        do
            local i = 0
            while i < #message.damages do
                local helicopter = helicopters[i + 1]
                go.animate(
                    helicopter,
                    "euler.z",
                    go.PLAYBACK_LOOP_FORWARD,
                    360,
                    go.EASING_LINEAR,
                    0.25
                )
                local damage_info = message.damages[i + 1]
                local target_world_pos = get_world_pos(damage_info.pos, 3)
                record_action(____exports.Action.HelicopterFly)
                if message.buster ~= nil then
                    local pos = vmath.vector3(helicopter_world_pos.x, helicopter_world_pos.y, helicopter_world_pos.z - 0.1)
                    local icon = go_manager.make_go("element_view", pos)
                    sprite.play_flipbook(
                        msg.url(nil, icon, "sprite"),
                        GAME_CONFIG.element_view[message.buster]
                    )
                    go.set_scale(
                        go.get_scale(helicopter),
                        icon
                    )
                    go.animate(
                        icon,
                        "position",
                        go.PLAYBACK_ONCE_FORWARD,
                        target_world_pos,
                        go.EASING_INCUBIC,
                        GAME_CONFIG.helicopter_fly_duration,
                        0.1,
                        function()
                            go.delete(icon, true)
                        end
                    )
                    go.animate(
                        helicopter,
                        "position",
                        go.PLAYBACK_ONCE_FORWARD,
                        target_world_pos,
                        go.EASING_INCUBIC,
                        GAME_CONFIG.helicopter_fly_duration,
                        0,
                        function()
                            remove_action(____exports.Action.HelicopterFly)
                            go.delete(helicopter, true)
                            on_damage(damage_info)
                            EventBus.send("REQUEST_HELICOPTER_END", message)
                        end
                    )
                    return
                end
                go.animate(
                    helicopter,
                    "position",
                    go.PLAYBACK_ONCE_FORWARD,
                    target_world_pos,
                    go.EASING_INCUBIC,
                    GAME_CONFIG.helicopter_fly_duration,
                    0,
                    function()
                        remove_action(____exports.Action.HelicopterFly)
                        go.delete(helicopter, true)
                        on_damage(damage_info)
                        request_falling(damage_info.pos)
                        EventBus.send("REQUEST_HELICOPTER_END", message)
                    end
                )
                i = i + 1
            end
        end
        request_falling(message.pos)
    end
    function on_shuffle_animation(game_state)
        timer.delay(
            1,
            false,
            function()
                Sound.play("shuffle")
                do
                    local y = 0
                    while y < get_field_height() do
                        do
                            local x = 0
                            while x < get_field_width() do
                                local element = game_state.elements[y + 1][x + 1]
                                if element ~= NullElement then
                                    local element_view = get_view_item_by_uid(element.uid)
                                    if element_view ~= nil then
                                        local to_world_pos = get_world_pos({x = x, y = y}, GAME_CONFIG.default_element_z_index)
                                        go.animate(
                                            element_view._hash,
                                            "position",
                                            go.PLAYBACK_ONCE_FORWARD,
                                            to_world_pos,
                                            GAME_CONFIG.swap_element_easing,
                                            0.5
                                        )
                                    else
                                        make_element_view(x, y, element, true)
                                    end
                                end
                                x = x + 1
                            end
                        end
                        y = y + 1
                    end
                end
                timer.delay(
                    0.5,
                    false,
                    function()
                        EventBus.send("SHUFFLE_END")
                    end
                )
            end
        )
    end
    function on_win(state)
        is_block_input = true
        local counts = 0
        do
            local y = 0
            while y < get_field_height() do
                do
                    local x = 0
                    while x < get_field_width() do
                        local cell = state.cells[y + 1][x + 1]
                        local element = state.elements[y + 1][x + 1]
                        if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) and element ~= NullElement then
                            local ____timer_delay_10 = timer.delay
                            local ____counts_9 = counts
                            counts = ____counts_9 + 1
                            ____timer_delay_10(
                                0.05 * ____counts_9,
                                false,
                                function()
                                    Sound.play("broke_element")
                                    damage_element_animation(element)
                                end
                            )
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        timer.delay(0.05 * counts, false, reset_field)
        timer.delay(
            is_animal_level() and GAME_CONFIG.animal_level_delay_before_win or GAME_CONFIG.delay_before_win,
            false,
            function()
                if __TS__ArrayIncludes(
                    GAME_CONFIG.animal_levels,
                    get_current_level() + 1
                ) then
                    remove_animals()
                end
            end
        )
    end
    function on_gameover()
        is_block_input = true
        timer.delay(GAME_CONFIG.delay_before_gameover, false, clear_field)
    end
    function clear_field()
        reset_field()
        if __TS__ArrayIncludes(
            GAME_CONFIG.animal_levels,
            get_current_level() + 1
        ) then
            remove_animals()
        end
    end
    function remove_animals()
        local scene_name = Scene.get_current_name()
        Scene.unload_resource(scene_name, "cat")
        Scene.unload_resource(
            scene_name,
            GAME_CONFIG.level_to_animal[get_current_level() + 1]
        )
    end
    function on_set_tutorial(lock_info)
        for ____, info in ipairs(lock_info) do
            local substrate_view = view_state.substrates[info.pos.y + 1][info.pos.x + 1]
            local substrate_view_url = msg.url(nil, substrate_view, "sprite")
            go.set(substrate_view_url, "material", resources.tutorial_sprite_material)
            local cell_views = get_all_view_items_by_uid(info.cell.uid)
            if cell_views ~= nil then
                for ____, cell_view in ipairs(cell_views) do
                    local cell_view_url = msg.url(nil, cell_view._hash, "sprite")
                    go.set(cell_view_url, "material", resources.tutorial_sprite_material)
                end
            end
            if info.element ~= NullElement then
                local element_view = get_view_item_by_uid(info.element.uid)
                if element_view ~= nil then
                    local element_view_url = msg.url(nil, element_view._hash, "sprite")
                    go.set(element_view_url, "material", resources.tutorial_sprite_material)
                end
            end
            if info.is_locked then
                local world_pos = get_world_pos(info.pos, GAME_CONFIG.default_top_layer_cell_z_index)
                local _go = go_manager.make_go("cell_view", world_pos)
                sprite.play_flipbook(
                    msg.url(nil, _go, "sprite"),
                    "cell_lock"
                )
                go.set_scale(
                    vmath.vector3(scale_ratio, scale_ratio, 1),
                    _go
                )
                local url = msg.url(nil, _go, "sprite")
                go.set(url, "material", resources.tutorial_sprite_material)
                locks[#locks + 1] = _go
            end
        end
    end
    function on_remove_tutorial(unlock_info)
        for ____, info in ipairs(unlock_info) do
            local substrate_view = view_state.substrates[info.pos.y + 1][info.pos.x + 1]
            local substrate_view_url = msg.url(nil, substrate_view, "sprite")
            go.set(substrate_view_url, "material", resources.default_sprite_material)
            local cell_views = get_all_view_items_by_uid(info.cell.uid)
            if cell_views ~= nil then
                for ____, cell_view in ipairs(cell_views) do
                    local cell_view_url = msg.url(nil, cell_view._hash, "sprite")
                    go.set(cell_view_url, "material", resources.default_sprite_material)
                end
            end
            if info.element ~= NullElement then
                local element_view = get_view_item_by_uid(info.element.uid)
                if element_view ~= nil then
                    local element_view_url = msg.url(nil, element_view._hash, "sprite")
                    go.set(element_view_url, "material", resources.default_sprite_material)
                end
            end
        end
        for ____, lock in ipairs(locks) do
            go.delete(lock)
        end
    end
    go_manager = GoManager()
    view_state = {}
    view_state.game_id_to_view_index = {}
    view_state.substrates = {}
    view_state.targets = {}
    original_game_width = 540
    original_game_height = 960
    cell_size = calculate_cell_size()
    scale_ratio = calculate_scale_ratio()
    cells_offset = calculate_cell_offset()
    down_item = nil
    is_block_input = false
    locks = {}
    actions = {}
    local function init()
        Log.log("INIT VIEW")
        Camera.set_dynamic_orientation(false)
        Camera.set_go_prjection(-1, 0, -3, 3)
        set_scene_art()
        set_events()
        Camera.update_window_size()
        if not GAME_CONFIG.is_restart then
            Sound.play("game")
        end
        GAME_CONFIG.is_restart = false
        EventBus.send("REQUEST_LOAD_GAME")
    end
    local function on_message(self, message_id, message, sender)
        go_manager.do_message(message_id, message, sender)
    end
    init()
    return {on_message = on_message}
end
return ____exports
