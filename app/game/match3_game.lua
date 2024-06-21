local ____lualib = require("lualib_bundle")
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__ArrayPush = ____lualib.__TS__ArrayPush
local __TS__ArrayEntries = ____lualib.__TS__ArrayEntries
local __TS__Iterator = ____lualib.__TS__Iterator
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local ____exports = {}
local flow = require("ludobits.m.flow")
local ____math_utils = require("utils.math_utils")
local Axis = ____math_utils.Axis
local is_valid_pos = ____math_utils.is_valid_pos
local ____match3_core = require("game.match3_core")
local Field = ____match3_core.Field
local NullElement = ____match3_core.NullElement
local NotActiveCell = ____match3_core.NotActiveCell
local CombinationType = ____match3_core.CombinationType
local ProcessMode = ____match3_core.ProcessMode
local CellType = ____match3_core.CellType
local ____coins = require("main.coins")
local add_coins = ____coins.add_coins
____exports.RandomElement = -2
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
____exports.CellId = CellId or ({})
____exports.CellId.Base = 0
____exports.CellId[____exports.CellId.Base] = "Base"
____exports.CellId.Grass = 1
____exports.CellId[____exports.CellId.Grass] = "Grass"
____exports.CellId.Flowers = 2
____exports.CellId[____exports.CellId.Flowers] = "Flowers"
____exports.CellId.Web = 3
____exports.CellId[____exports.CellId.Web] = "Web"
____exports.CellId.Box = 4
____exports.CellId[____exports.CellId.Box] = "Box"
____exports.CellId.Stone0 = 5
____exports.CellId[____exports.CellId.Stone0] = "Stone0"
____exports.CellId.Stone1 = 6
____exports.CellId[____exports.CellId.Stone1] = "Stone1"
____exports.CellId.Stone2 = 7
____exports.CellId[____exports.CellId.Stone2] = "Stone2"
____exports.CellId.Lock = 8
____exports.CellId[____exports.CellId.Lock] = "Lock"
____exports.ElementId = ElementId or ({})
____exports.ElementId.Dimonde = 0
____exports.ElementId[____exports.ElementId.Dimonde] = "Dimonde"
____exports.ElementId.Gold = 1
____exports.ElementId[____exports.ElementId.Gold] = "Gold"
____exports.ElementId.Topaz = 2
____exports.ElementId[____exports.ElementId.Topaz] = "Topaz"
____exports.ElementId.Ruby = 3
____exports.ElementId[____exports.ElementId.Ruby] = "Ruby"
____exports.ElementId.Emerald = 4
____exports.ElementId[____exports.ElementId.Emerald] = "Emerald"
____exports.ElementId.Cheese = 5
____exports.ElementId[____exports.ElementId.Cheese] = "Cheese"
____exports.ElementId.Cabbage = 6
____exports.ElementId[____exports.ElementId.Cabbage] = "Cabbage"
____exports.ElementId.Acorn = 7
____exports.ElementId[____exports.ElementId.Acorn] = "Acorn"
____exports.ElementId.RareMeat = 8
____exports.ElementId[____exports.ElementId.RareMeat] = "RareMeat"
____exports.ElementId.MediumMeat = 9
____exports.ElementId[____exports.ElementId.MediumMeat] = "MediumMeat"
____exports.ElementId.Chicken = 10
____exports.ElementId[____exports.ElementId.Chicken] = "Chicken"
____exports.ElementId.SunFlower = 11
____exports.ElementId[____exports.ElementId.SunFlower] = "SunFlower"
____exports.ElementId.Salad = 12
____exports.ElementId[____exports.ElementId.Salad] = "Salad"
____exports.ElementId.Hay = 13
____exports.ElementId[____exports.ElementId.Hay] = "Hay"
____exports.ElementId.VerticalRocket = 14
____exports.ElementId[____exports.ElementId.VerticalRocket] = "VerticalRocket"
____exports.ElementId.HorizontalRocket = 15
____exports.ElementId[____exports.ElementId.HorizontalRocket] = "HorizontalRocket"
____exports.ElementId.AxisRocket = 16
____exports.ElementId[____exports.ElementId.AxisRocket] = "AxisRocket"
____exports.ElementId.Helicopter = 17
____exports.ElementId[____exports.ElementId.Helicopter] = "Helicopter"
____exports.ElementId.Dynamite = 18
____exports.ElementId[____exports.ElementId.Dynamite] = "Dynamite"
____exports.ElementId.Diskosphere = 19
____exports.ElementId[____exports.ElementId.Diskosphere] = "Diskosphere"
function ____exports.Game()
    local init_targets, set_targets, set_timer, set_steps, set_element_types, set_element_chances, set_busters, set_events, load_field, is_tutorial, set_tutorial, lock_cells, unlock_cells, lock_buters, unlock_busters, try_load_field, complete_tutorial, on_swap_elements, on_click_activation, on_activate_spinning, on_activate_hammer, on_activate_vertical_rocket, on_activate_horizontal_rocket, on_revert_step, on_game_step_animation_end, on_game_timer_tick, gameover, load_cell, load_element, make_cell, generate_cell_type_by_cell_id, make_element, set_helper, stop_helper, stop_all_coroutines, reset_helper, set_combination_for_helper, search_available_steps, get_step_combination, try_combinate_before_buster_activation, try_click_activation, try_activate_buster_element, try_activate_swaped_busters, try_activate_diskosphere, try_activate_swaped_diskospheres, try_activate_swaped_diskosphere_with_buster, try_activate_swaped_buster_with_diskosphere, try_activate_swaped_diskosphere_with_element, try_activate_rocket, try_activate_swaped_rockets, try_activate_swaped_rocket_with_element, try_activate_helicopter, try_activate_swaped_helicopters, try_activate_swaped_helicopter_with_element, try_activate_dynamite, try_activate_swaped_dynamites, try_activate_swaped_dynamite_with_element, try_activate_swaped_buster_with_buster, try_spinning_activation, shuffle_field, try_hammer_activation, try_horizontal_rocket_activation, try_vertical_rocket_activation, try_swap_elements, set_random, process_game_step, revert_step, is_level_completed, is_have_steps, is_can_move, try_combo, on_damaged_element, is_combined_elements, on_combined, on_request_element, on_moved_elements, on_cell_activated, on_revive, get_state, update_state, update_cells_state, copy_state, is_buster, get_random_element_id, remove_random_element, remove_element_by_mask, write_game_step_event, send_game_step, current_level, level_config, field_width, field_height, busters, field, game_timer, start_game_time, game_item_counter, states, activated_elements, game_step_events, selected_element, spawn_element_chances, available_steps, coroutines, previous_helper_data, helper_data, helper_timer, is_simulating, is_step, is_block_input, is_block_spinning, is_block_hammer, is_block_vertical_rocket, is_block_horizontal_rocket, is_gameover
    function init_targets()
        local last_state = get_state()
        last_state.targets = {}
        for ____, target in ipairs(level_config.targets) do
            local copy = __TS__ObjectAssign({}, target)
            copy.uids = __TS__ObjectAssign({}, target.uids)
            local ____last_state_targets_0 = last_state.targets
            ____last_state_targets_0[#____last_state_targets_0 + 1] = copy
        end
    end
    function set_targets(targets)
        local last_state = get_state()
        last_state.targets = targets
    end
    function set_timer()
        if level_config.time == nil then
            return
        end
        start_game_time = System.now()
        game_timer = timer.delay(1, true, on_game_timer_tick)
    end
    function set_steps(steps)
        if steps == nil then
            steps = 0
        end
        if level_config.steps == nil then
            return
        end
        local last_state = get_state()
        last_state.steps = steps
        EventBus.send("UPDATED_STEP_COUNTER", last_state.steps)
    end
    function set_element_types()
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local element_id = tonumber(key)
            field.set_element_type(
                element_id,
                {
                    index = element_id,
                    is_movable = true,
                    is_clickable = __TS__ArrayIncludes(GAME_CONFIG.buster_elements, element_id)
                }
            )
        end
    end
    function set_element_chances()
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local id = tonumber(key)
            if id ~= nil then
                if __TS__ArrayIncludes(GAME_CONFIG.base_elements, id) or id == level_config.additional_element then
                    spawn_element_chances[id] = 10
                else
                    spawn_element_chances[id] = 0
                end
                if id == level_config.exclude_element then
                    spawn_element_chances[id] = 0
                end
            end
        end
    end
    function set_busters()
        if not GameStorage.get("spinning_opened") and level_config.busters.spinning.counts ~= 0 then
            GameStorage.set("spinning_opened", true)
        end
        if not GameStorage.get("hammer_opened") and level_config.busters.hammer.counts ~= 0 then
            GameStorage.set("hammer_opened", true)
        end
        if not GameStorage.get("horizontal_rocket_opened") and level_config.busters.horizontal_rocket.counts ~= 0 then
            GameStorage.set("horizontal_rocket_opened", true)
        end
        if not GameStorage.get("vertical_rocket_opened") and level_config.busters.vertical_rocket.counts ~= 0 then
            GameStorage.set("vertical_rocket_opened", true)
        end
        local spinning_counts = tonumber(level_config.busters.spinning.counts)
        if GameStorage.get("spinning_counts") <= 0 and spinning_counts ~= nil then
            GameStorage.set("spinning_counts", spinning_counts)
        end
        local hammer_counts = tonumber(level_config.busters.hammer.counts)
        if GameStorage.get("hammer_counts") <= 0 and hammer_counts ~= nil then
            GameStorage.set("hammer_counts", hammer_counts)
        end
        local horizontal_rocket_counts = tonumber(level_config.busters.horizontal_rocket.counts)
        if GameStorage.get("horizontal_rocket_counts") <= 0 and horizontal_rocket_counts ~= nil then
            GameStorage.set("horizontal_rocket_counts", horizontal_rocket_counts)
        end
        local vertical_rocket_counts = tonumber(level_config.busters.vertical_rocket.counts)
        if GameStorage.get("vertical_rocket_counts") <= 0 and vertical_rocket_counts ~= nil then
            GameStorage.set("vertical_rocket_counts", vertical_rocket_counts)
        end
        EventBus.send("UPDATED_BUTTONS")
    end
    function set_events()
        EventBus.on("SET_HELPER", set_helper)
        EventBus.on("SWAP_ELEMENTS", on_swap_elements)
        EventBus.on("CLICK_ACTIVATION", on_click_activation)
        EventBus.on("ACTIVATE_SPINNING", on_activate_spinning)
        EventBus.on("ACTIVATE_HAMMER", on_activate_hammer)
        EventBus.on("ACTIVATE_VERTICAL_ROCKET", on_activate_vertical_rocket)
        EventBus.on("ACTIVATE_HORIZONTAL_ROCKET", on_activate_horizontal_rocket)
        EventBus.on("REVERT_STEP", on_revert_step)
        EventBus.on("ON_GAME_STEP_ANIMATION_END", on_game_step_animation_end)
        EventBus.on("REVIVE", on_revive)
    end
    function load_field()
        Log.log("LOAD FIELD")
        states[#states + 1] = {}
        try_load_field()
        if is_tutorial() then
            set_tutorial()
        end
        if not is_tutorial() then
            is_block_input = true
            search_available_steps(
                5,
                function(steps)
                    if #steps ~= 0 then
                        is_block_input = false
                        available_steps = steps
                        return
                    end
                    shuffle_field()
                end
            )
        else
            local step = GAME_CONFIG.tutorials_data[current_level + 1].step
            if step ~= nil then
                available_steps = {step}
            end
        end
        init_targets()
        set_steps(level_config.steps)
        if not is_tutorial() then
            set_timer()
        end
        set_random()
        if GAME_CONFIG.is_revive then
            Log.log("REVIVE")
            GAME_CONFIG.is_revive = false
            table.remove(states)
            do
                local y = 0
                while y < field_height do
                    do
                        local x = 0
                        while x < field_width do
                            local cell = GAME_CONFIG.revive_state.cells[y + 1][x + 1]
                            if cell ~= NotActiveCell then
                                make_cell(x, y, cell.id, cell and cell.data)
                            else
                                field.set_cell(x, y, NotActiveCell)
                            end
                            local element = GAME_CONFIG.revive_state.elements[y + 1][x + 1]
                            if element ~= NullElement then
                                make_element(x, y, element.type, element.data)
                            else
                                field.set_element(x, y, NullElement)
                            end
                            x = x + 1
                        end
                    end
                    y = y + 1
                end
            end
            local state = field.save_state()
            GAME_CONFIG.revive_state.cells = state.cells
            GAME_CONFIG.revive_state.elements = state.elements
            states[#states + 1] = GAME_CONFIG.revive_state
        end
        local last_state = update_state()
        EventBus.send("ON_LOAD_FIELD", last_state)
        if is_tutorial() then
            EventBus.send("SET_TUTORIAL")
        end
        states[#states + 1] = {}
        set_targets(last_state.targets)
        set_steps(last_state.steps)
        set_random()
    end
    function is_tutorial()
        local is_tutorial_level = __TS__ArrayIncludes(GAME_CONFIG.tutorial_levels, current_level + 1)
        local is_not_completed = not __TS__ArrayIncludes(
            GameStorage.get("completed_tutorials"),
            current_level + 1
        )
        return is_tutorial_level and is_not_completed
    end
    function set_tutorial()
        local tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1]
        local except_cells = tutorial_data.cells ~= nil and tutorial_data.cells or ({})
        lock_cells(except_cells)
        if tutorial_data.busters ~= nil then
            if __TS__ArrayIsArray(tutorial_data.busters) then
                lock_buters(tutorial_data.busters)
            else
                lock_buters({tutorial_data.busters})
            end
        else
            lock_buters({})
        end
    end
    function lock_cells(except_cells)
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        if not __TS__ArrayFind(
                            except_cells,
                            function(____, cell) return cell.x == x and cell.y == y end
                        ) then
                            local cell = field.get_cell(x, y)
                            if cell ~= NotActiveCell then
                                if cell.data == nil or cell.data.under_cells == nil then
                                    cell.data.under_cells = {}
                                end
                                local ____cell_data_under_cells_3 = cell.data.under_cells
                                ____cell_data_under_cells_3[#____cell_data_under_cells_3 + 1] = cell.id
                                cell.id = ____exports.CellId.Lock
                                cell.type = ____exports.CellId.Lock
                                field.set_cell(x, y, cell)
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function unlock_cells()
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = field.get_cell(x, y)
                        if cell ~= NotActiveCell and cell.type == ____exports.CellId.Lock then
                            local id = table.remove(cell.data.under_cells)
                            cell.id = id == nil and ____exports.CellId.Base or id
                            cell.type = generate_cell_type_by_cell_id(cell.id)
                            field.set_cell(x, y, cell)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
    end
    function lock_buters(except_busters)
        is_block_spinning = not __TS__ArrayIncludes(except_busters, "spinning")
        is_block_hammer = not __TS__ArrayIncludes(except_busters, "hammer")
        is_block_vertical_rocket = not __TS__ArrayIncludes(except_busters, "vertical_rocket")
        is_block_horizontal_rocket = not __TS__ArrayIncludes(except_busters, "horizontal_rocket")
    end
    function unlock_busters()
        is_block_spinning = false
        is_block_hammer = false
        is_block_vertical_rocket = false
        is_block_horizontal_rocket = false
    end
    function try_load_field()
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        load_cell(x, y)
                        load_element(x, y)
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if #field.get_all_combinations(true) > 0 then
            field.init()
            try_load_field()
            return
        end
    end
    function complete_tutorial()
        unlock_busters()
        unlock_cells()
        update_cells_state()
        write_game_step_event("REMOVE_TUTORIAL", {})
        write_game_step_event(
            "UPDATED_CELLS_STATE",
            get_state().cells
        )
        local completed_tutorials = GameStorage.get("completed_tutorials")
        completed_tutorials[#completed_tutorials + 1] = current_level + 1
        GameStorage.set("completed_tutorials", completed_tutorials)
        set_timer()
    end
    function on_swap_elements(elements)
        if is_block_input or is_gameover or elements == nil then
            return
        end
        stop_helper()
        if not try_swap_elements(elements.from_x, elements.from_y, elements.to_x, elements.to_y) then
            return
        end
        is_step = true
        local is_procesed = try_combinate_before_buster_activation(elements.from_x, elements.from_y, elements.to_x, elements.to_y)
        process_game_step(is_procesed)
    end
    function on_click_activation(pos)
        if is_block_input or is_gameover or pos == nil then
            return
        end
        stop_helper()
        if try_click_activation(pos.x, pos.y) then
            process_game_step(true)
        else
            local element = field.get_element(pos.x, pos.y)
            if element ~= NullElement then
                if selected_element ~= nil and selected_element.uid == element.uid then
                    EventBus.trigger("ON_ELEMENT_UNSELECTED", selected_element, true, true)
                    selected_element = nil
                else
                    local is_swap = false
                    if selected_element ~= nil then
                        EventBus.trigger("ON_ELEMENT_UNSELECTED", selected_element, true, true)
                        local neighbors = field.get_neighbor_elements(selected_element.x, selected_element.y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
                        for ____, neighbor in ipairs(neighbors) do
                            if neighbor.uid == element.uid then
                                is_swap = true
                                break
                            end
                        end
                    end
                    if selected_element ~= nil and is_swap then
                        EventBus.send("SWAP_ELEMENTS", {from_x = selected_element.x, from_y = selected_element.y, to_x = pos.x, to_y = pos.y})
                    else
                        selected_element = {x = pos.x, y = pos.y, uid = element.uid}
                        EventBus.trigger("ON_ELEMENT_SELECTED", selected_element, true, true)
                    end
                end
            end
        end
    end
    function on_activate_spinning()
        if GameStorage.get("spinning_counts") <= 0 or is_block_input or is_block_spinning then
            return
        end
        busters.spinning.active = not busters.spinning.active
        busters.hammer.active = false
        busters.horizontal_rocket.active = false
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
        if is_tutorial() then
            complete_tutorial()
        end
        stop_helper()
        try_spinning_activation()
    end
    function on_activate_hammer()
        if GameStorage.get("hammer_counts") <= 0 or is_block_input or is_block_hammer then
            return
        end
        busters.hammer.active = not busters.hammer.active
        busters.spinning.active = false
        busters.horizontal_rocket.active = false
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
        if is_tutorial() then
            complete_tutorial()
        end
    end
    function on_activate_vertical_rocket()
        if GameStorage.get("vertical_rocket_counts") <= 0 or is_block_input or is_block_vertical_rocket then
            return
        end
        busters.vertical_rocket.active = not busters.vertical_rocket.active
        busters.hammer.active = false
        busters.spinning.active = false
        busters.horizontal_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
        if is_tutorial() then
            complete_tutorial()
        end
    end
    function on_activate_horizontal_rocket()
        if GameStorage.get("horizontal_rocket_counts") <= 0 or is_block_input or is_block_horizontal_rocket then
            return
        end
        busters.horizontal_rocket.active = not busters.horizontal_rocket.active
        busters.hammer.active = false
        busters.spinning.active = false
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
        if is_tutorial() then
            complete_tutorial()
        end
    end
    function on_revert_step()
        stop_helper()
        revert_step()
    end
    function on_game_step_animation_end()
        is_block_input = false
        if is_level_completed() then
            local completed_levels = GameStorage.get("completed_levels")
            completed_levels[#completed_levels + 1] = GameStorage.get("current_level")
            GameStorage.set("completed_levels", completed_levels)
            add_coins(level_config.coins)
            timer.delay(
                0.5,
                false,
                function() return EventBus.send("ON_WIN") end
            )
        elseif not is_have_steps() or is_gameover then
            timer.delay(0.5, false, gameover)
        end
        Log.log("END STEP ANIMATION")
    end
    function on_game_timer_tick()
        local dt = System.now() - start_game_time
        local remaining_time = level_config.time - dt
        if level_config.time >= dt then
            get_state().remaining_time = remaining_time
            EventBus.send("GAME_TIMER", remaining_time)
        else
            timer.cancel(game_timer)
            is_gameover = true
        end
    end
    function gameover()
        GAME_CONFIG.is_revive = false
        GAME_CONFIG.revive_state = copy_state(2)
        EventBus.send(
            "ON_GAME_OVER",
            get_state()
        )
    end
    function load_cell(x, y)
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
    function load_element(x, y)
        local element = level_config.field.elements[y + 1][x + 1]
        make_element(
            x,
            y,
            element == ____exports.RandomElement and get_random_element_id() or element
        )
    end
    function make_cell(x, y, cell_id, data)
        if cell_id == NotActiveCell then
            return NotActiveCell
        end
        local ____cell_id_5 = cell_id
        local ____game_item_counter_4 = game_item_counter
        game_item_counter = ____game_item_counter_4 + 1
        local cell = {
            id = ____cell_id_5,
            uid = ____game_item_counter_4,
            type = generate_cell_type_by_cell_id(cell_id),
            cnt_acts = 0,
            cnt_near_acts = 0,
            data = __TS__ObjectAssign({}, data)
        }
        cell.data.z_index = __TS__ArrayIncludes(GAME_CONFIG.top_layer_cells, cell_id) and 2 or -1
        field.set_cell(x, y, cell)
        return cell
    end
    function generate_cell_type_by_cell_id(cell_id)
        local ____type
        if __TS__ArrayIncludes(GAME_CONFIG.activation_cells, cell_id) then
            ____type = ____type == nil and CellType.ActionLocked or bit.bor(____type, CellType.ActionLocked)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.near_activated_cells, cell_id) then
            ____type = ____type == nil and CellType.ActionLockedNear or bit.bor(____type, CellType.ActionLockedNear)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.disabled_cells, cell_id) then
            ____type = ____type == nil and CellType.Disabled or bit.bor(____type, CellType.Disabled)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.not_moved_cells, cell_id) then
            ____type = ____type == nil and CellType.NotMoved or bit.bor(____type, CellType.NotMoved)
        end
        if ____type == nil then
            ____type = CellType.Base
        end
        return ____type
    end
    function make_element(x, y, element_id, data)
        if data == nil then
            data = nil
        end
        if element_id == NullElement then
            return NullElement
        end
        local ____element_id_7 = element_id
        local ____game_item_counter_6 = game_item_counter
        game_item_counter = ____game_item_counter_6 + 1
        local element = {id = ____element_id_7, uid = ____game_item_counter_6, type = element_id, data = data}
        field.set_element(x, y, element)
        return element
    end
    function set_helper()
        local delay = is_tutorial() and 1 or 5
        helper_timer = timer.delay(
            delay,
            false,
            function()
                set_combination_for_helper(available_steps)
                if helper_data ~= nil then
                    Log.log("START HELPER")
                    reset_helper()
                    timer.delay(
                        1,
                        false,
                        function()
                            if helper_data == nil then
                                return
                            end
                            previous_helper_data = __TS__ObjectAssign({}, helper_data)
                            EventBus.trigger("ON_SET_STEP_HELPER", helper_data, true, true)
                            if not is_tutorial() then
                                set_helper()
                            end
                        end
                    )
                end
            end
        )
    end
    function stop_helper()
        if helper_timer == nil then
            return
        end
        Log.log("STOP HELPER")
        stop_all_coroutines()
        helper_data = nil
        timer.cancel(helper_timer)
        reset_helper()
    end
    function stop_all_coroutines()
        for ____, ____coroutine in ipairs(coroutines) do
            flow.stop(____coroutine)
        end
        coroutines = {}
    end
    function reset_helper()
        if previous_helper_data == nil then
            return
        end
        Log.log("RESTART HELPER")
        EventBus.trigger("ON_RESET_STEP_HELPER", previous_helper_data, true, true)
        previous_helper_data = nil
    end
    function set_combination_for_helper(steps)
        if #steps == 0 then
            return
        end
        local step = steps[math.random(0, #steps - 1) + 1]
        local combination = get_step_combination(step)
        if combination == nil then
            return
        end
        for ____, element in ipairs(combination.elements) do
            local is_from = element.x == step.from_x and element.y == step.from_y
            local is_to = element.x == step.to_x and element.y == step.to_y
            if is_from or is_to then
                helper_data = {step = step, elements = combination.elements, combined_element = element}
                return Log.log("SETUP HELPER DATA")
            end
        end
    end
    function search_available_steps(count, on_end)
        local ____coroutine = flow.start(
            function()
                Log.log("SEARCH AVAILABLE STEPS")
                local steps = {}
                do
                    local y = 0
                    while y < field_height do
                        do
                            local x = 0
                            while x < field_width do
                                flow.frames(1)
                                if is_valid_pos(x + 1, y, field_width, field_height) and field.is_can_move_base(x, y, x + 1, y) then
                                    steps[#steps + 1] = {from_x = x, from_y = y, to_x = x + 1, to_y = y}
                                end
                                if #steps > count then
                                    return on_end(steps)
                                end
                                flow.frames(1)
                                if is_valid_pos(x, y + 1, field_width, field_height) and field.is_can_move_base(x, y, x, y + 1) then
                                    steps[#steps + 1] = {from_x = x, from_y = y, to_x = x, to_y = y + 1}
                                end
                                if #steps > count then
                                    return on_end(steps)
                                end
                                x = x + 1
                            end
                        end
                        y = y + 1
                    end
                end
                Log.log(("FOUND " .. tostring(#steps)) .. " STEPS")
                on_end(steps)
            end,
            {parallel = true}
        )
        coroutines[#coroutines + 1] = ____coroutine
    end
    function get_step_combination(step)
        field.swap_elements(step.from_x, step.from_y, step.to_x, step.to_y)
        local combinations = field.get_all_combinations()
        field.swap_elements(step.from_x, step.from_y, step.to_x, step.to_y)
        for ____, combination in ipairs(combinations) do
            for ____, element in ipairs(combination.elements) do
                local is_x = element.x == step.from_x or element.x == step.to_x
                local is_y = element.y == step.from_y or element.y == step.to_y
                if is_x and is_y then
                    return combination
                end
            end
        end
        local element_from = field.get_element(step.from_x, step.from_y)
        local element_to = field.get_element(step.to_x, step.to_y)
        if element_from ~= NullElement and element_to ~= NullElement then
            local combination = {}
            combination.elements = {{x = step.from_x, y = step.from_y, uid = element_to.uid}, {x = step.to_x, y = step.to_y, uid = element_from.uid}}
            return combination
        end
        return nil
    end
    function try_combinate_before_buster_activation(from_x, from_y, to_x, to_y)
        local is_from_buster = is_buster(to_x, to_y)
        local is_to_buster = is_buster(from_x, from_y)
        if not is_from_buster and not is_to_buster then
            return false
        end
        local is_activated = false
        local is_procesed = field.process_state(ProcessMode.Combinate)
        if not is_procesed then
            is_activated = try_activate_swaped_busters(to_x, to_y, from_x, from_y)
        else
            write_game_step_event("ON_BUSTER_ACTIVATION", {})
            if is_from_buster then
                is_activated = try_activate_buster_element(to_x, to_y)
            end
            if is_to_buster then
                is_activated = try_activate_buster_element(from_x, from_y)
            end
        end
        return is_procesed or is_activated
    end
    function try_click_activation(x, y)
        if not is_simulating then
            if try_hammer_activation(x, y) then
                return true
            end
            if try_horizontal_rocket_activation(x, y) then
                return true
            end
            if try_vertical_rocket_activation(x, y) then
                return true
            end
        end
        if field.try_click(x, y) and try_activate_buster_element(x, y) then
            is_step = true
            return true
        end
        return false
    end
    function try_activate_buster_element(x, y, with_check)
        if with_check == nil then
            with_check = true
        end
        local element = field.get_element(x, y)
        if element == NullElement then
            return false
        end
        if with_check then
            if __TS__ArrayIndexOf(activated_elements, element.uid) ~= -1 then
                return false
            end
            activated_elements[#activated_elements + 1] = element.uid
        end
        if selected_element ~= nil then
            EventBus.trigger("ON_ELEMENT_UNSELECTED", selected_element, true, true)
        end
        selected_element = nil
        local activated = false
        if try_activate_rocket(x, y) then
            activated = true
        elseif try_activate_helicopter(x, y) then
            activated = true
        elseif try_activate_dynamite(x, y) then
            activated = true
        elseif try_activate_diskosphere(x, y) then
            activated = true
        end
        if not activated and with_check then
            __TS__ArraySplice(activated_elements, #activated_elements - 1, 1)
        end
        return activated
    end
    function try_activate_swaped_busters(x, y, other_x, other_y)
        local element = field.get_element(x, y)
        local other_element = field.get_element(other_x, other_y)
        if element == NullElement or other_element == NullElement then
            return false
        end
        if __TS__ArrayIndexOf(activated_elements, element.uid) ~= -1 or __TS__ArrayIndexOf(activated_elements, other_element.uid) ~= -1 then
            return false
        end
        __TS__ArrayPush(activated_elements, element.uid, other_element.uid)
        local activated = false
        if try_activate_swaped_diskospheres(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_buster_with_diskosphere(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_diskosphere_with_buster(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_diskosphere_with_element(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_diskosphere_with_element(other_x, other_y, x, y) then
            activated = true
        elseif try_activate_swaped_rockets(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_rocket_with_element(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_rocket_with_element(other_x, other_y, x, y) then
            activated = true
        elseif try_activate_swaped_helicopters(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_helicopter_with_element(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_helicopter_with_element(other_x, other_y, x, y) then
            activated = true
        elseif try_activate_swaped_dynamites(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_dynamite_with_element(x, y, other_x, other_y) then
            activated = true
        elseif try_activate_swaped_dynamite_with_element(other_x, other_y, x, y) then
            activated = true
        elseif try_activate_swaped_buster_with_buster(x, y, other_x, other_y) then
            activated = true
        end
        if not activated then
            __TS__ArraySplice(activated_elements, #activated_elements - 2, 2)
        end
        return activated
    end
    function try_activate_diskosphere(x, y)
        local diskosphere = field.get_element(x, y)
        if diskosphere == NullElement or diskosphere.type ~= ____exports.ElementId.Diskosphere then
            return false
        end
        local element_id = get_random_element_id()
        if element_id == NullElement then
            return false
        end
        local event_data = {}
        write_game_step_event("DISKOSPHERE_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.activated_cells = {}
        local elements = field.get_all_elements_by_type(element_id)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, true)
        end
        event_data.damaged_elements = elements
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_swaped_diskospheres(x, y, other_x, other_y)
        local diskosphere = field.get_element(x, y)
        if diskosphere == NullElement or diskosphere.type ~= ____exports.ElementId.Diskosphere then
            return false
        end
        local other_diskosphere = field.get_element(other_x, other_y)
        if other_diskosphere == NullElement or other_diskosphere.type ~= ____exports.ElementId.Diskosphere then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERES_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_diskosphere.uid}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        for ____, element_id in ipairs(GAME_CONFIG.base_elements) do
            local elements = field.get_all_elements_by_type(element_id)
            for ____, element in ipairs(elements) do
                field.remove_element(element.x, element.y, true, false)
                local ____event_data_damaged_elements_8 = event_data.damaged_elements
                ____event_data_damaged_elements_8[#____event_data_damaged_elements_8 + 1] = element
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_swaped_diskosphere_with_buster(x, y, other_x, other_y)
        local diskosphere = field.get_element(x, y)
        if diskosphere == NullElement or diskosphere.type ~= ____exports.ElementId.Diskosphere then
            return false
        end
        local other_buster = field.get_element(other_x, other_y)
        if other_buster == NullElement or not __TS__ArrayIncludes({____exports.ElementId.Helicopter, ____exports.ElementId.Dynamite, ____exports.ElementId.HorizontalRocket, ____exports.ElementId.VerticalRocket}, other_buster.type) then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_buster.uid}
        event_data.activated_cells = {}
        event_data.damaged_elements = {}
        event_data.maked_elements = {}
        local element_id = get_random_element_id()
        if element_id == NullElement then
            return false
        end
        local elements = field.get_all_elements_by_type(element_id)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, false)
            local ____event_data_damaged_elements_9 = event_data.damaged_elements
            ____event_data_damaged_elements_9[#____event_data_damaged_elements_9 + 1] = element
            local maked_element = make_element(element.x, element.y, other_buster.type, true)
            if maked_element ~= NullElement then
                local ____event_data_maked_elements_10 = event_data.maked_elements
                ____event_data_maked_elements_10[#____event_data_maked_elements_10 + 1] = {x = element.x, y = element.y, uid = maked_element.uid, type = maked_element.type}
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        for ____, element in ipairs(elements) do
            try_activate_buster_element(element.x, element.y)
        end
        return true
    end
    function try_activate_swaped_buster_with_diskosphere(x, y, other_x, other_y)
        local buster = field.get_element(x, y)
        if buster == NullElement or __TS__ArrayIncludes(GAME_CONFIG.base_elements, buster.type) then
            return false
        end
        local diskosphere = field.get_element(other_x, other_y)
        if diskosphere == NullElement or diskosphere.type ~= ____exports.ElementId.Diskosphere then
            return false
        end
        local event_data = {}
        event_data.element = {x = other_x, y = other_y, uid = diskosphere.uid}
        event_data.other_element = {x = x, y = y, uid = buster.uid}
        event_data.activated_cells = {}
        event_data.damaged_elements = {}
        event_data.maked_elements = {}
        write_game_step_event("SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED", event_data)
        local element_id = get_random_element_id()
        if element_id == NullElement then
            return false
        end
        local elements = field.get_all_elements_by_type(element_id)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, false)
            local ____event_data_damaged_elements_11 = event_data.damaged_elements
            ____event_data_damaged_elements_11[#____event_data_damaged_elements_11 + 1] = element
            local maked_element = make_element(element.x, element.y, buster.type, true)
            if maked_element ~= NullElement then
                local ____event_data_maked_elements_12 = event_data.maked_elements
                ____event_data_maked_elements_12[#____event_data_maked_elements_12 + 1] = {x = element.x, y = element.y, uid = maked_element.uid, type = maked_element.type}
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        for ____, element in ipairs(elements) do
            try_activate_buster_element(element.x, element.y)
        end
        return true
    end
    function try_activate_swaped_diskosphere_with_element(x, y, other_x, other_y)
        local diskosphere = field.get_element(x, y)
        if diskosphere == NullElement or diskosphere.type ~= ____exports.ElementId.Diskosphere then
            return false
        end
        local other_element = field.get_element(other_x, other_y)
        if other_element == NullElement then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = diskosphere.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_element.uid}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        local elements = field.get_all_elements_by_type(other_element.type)
        for ____, element in ipairs(elements) do
            field.remove_element(element.x, element.y, true, false)
            local ____event_data_damaged_elements_13 = event_data.damaged_elements
            ____event_data_damaged_elements_13[#____event_data_damaged_elements_13 + 1] = element
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_rocket(x, y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or not __TS__ArrayIncludes({____exports.ElementId.HorizontalRocket, ____exports.ElementId.VerticalRocket, ____exports.ElementId.AxisRocket}, rocket.type) then
            return false
        end
        local event_data = {}
        write_game_step_event("ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = rocket.uid}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        event_data.axis = rocket.type == ____exports.ElementId.VerticalRocket and Axis.Vertical or Axis.Horizontal
        if rocket.type == ____exports.ElementId.VerticalRocket or rocket.type == ____exports.ElementId.AxisRocket then
            do
                local i = 0
                while i < field_height do
                    if i ~= y then
                        if is_buster(x, i) then
                            try_activate_buster_element(x, i)
                        else
                            local removed_element = field.remove_element(x, i, true, false)
                            if removed_element ~= nil then
                                local ____event_data_damaged_elements_14 = event_data.damaged_elements
                                ____event_data_damaged_elements_14[#____event_data_damaged_elements_14 + 1] = {x = x, y = i, uid = removed_element.uid}
                            end
                        end
                    end
                    i = i + 1
                end
            end
        end
        if rocket.type == ____exports.ElementId.HorizontalRocket or rocket.type == ____exports.ElementId.AxisRocket then
            do
                local i = 0
                while i < field_width do
                    if i ~= x then
                        if is_buster(i, y) then
                            try_activate_buster_element(i, y)
                        else
                            local removed_element = field.remove_element(i, y, true, false)
                            if removed_element ~= nil then
                                local ____event_data_damaged_elements_15 = event_data.damaged_elements
                                ____event_data_damaged_elements_15[#____event_data_damaged_elements_15 + 1] = {x = i, y = y, uid = removed_element.uid}
                            end
                        end
                    end
                    i = i + 1
                end
            end
        end
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_swaped_rockets(x, y, other_x, other_y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or not __TS__ArrayIncludes({____exports.ElementId.HorizontalRocket, ____exports.ElementId.VerticalRocket}, rocket.type) then
            return false
        end
        local other_rocket = field.get_element(other_x, other_y)
        if other_rocket == NullElement or not __TS__ArrayIncludes({____exports.ElementId.HorizontalRocket, ____exports.ElementId.VerticalRocket}, other_rocket.type) then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_ROCKETS_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = rocket.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_rocket.uid}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        do
            local i = 0
            while i < field_height do
                if i ~= y then
                    if is_buster(x, i) then
                        try_activate_buster_element(x, i)
                    else
                        local removed_element = field.remove_element(x, i, true, false)
                        if removed_element ~= nil then
                            local ____event_data_damaged_elements_16 = event_data.damaged_elements
                            ____event_data_damaged_elements_16[#____event_data_damaged_elements_16 + 1] = {x = x, y = i, uid = removed_element.uid}
                        end
                    end
                end
                i = i + 1
            end
        end
        do
            local i = 0
            while i < field_width do
                if i ~= x then
                    if is_buster(i, y) then
                        try_activate_buster_element(i, y)
                    else
                        local removed_element = field.remove_element(i, y, true, false)
                        if removed_element ~= nil then
                            local ____event_data_damaged_elements_17 = event_data.damaged_elements
                            ____event_data_damaged_elements_17[#____event_data_damaged_elements_17 + 1] = {x = i, y = y, uid = removed_element.uid}
                        end
                    end
                end
                i = i + 1
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_swaped_rocket_with_element(x, y, other_x, other_y)
        local rocket = field.get_element(x, y)
        if rocket == NullElement or not __TS__ArrayIncludes({____exports.ElementId.HorizontalRocket, ____exports.ElementId.VerticalRocket, ____exports.ElementId.AxisRocket}, rocket.type) then
            return false
        end
        local other_element = field.get_element(other_x, other_y)
        if other_element == NullElement or __TS__ArrayIncludes(GAME_CONFIG.buster_elements, other_element.type) then
            return false
        end
        if try_activate_rocket(x, y) then
            return true
        end
        return false
    end
    function try_activate_helicopter(x, y)
        local helicopter = field.get_element(x, y)
        if helicopter == NullElement or helicopter.type ~= ____exports.ElementId.Helicopter then
            return false
        end
        local event_data = {}
        write_game_step_event("HELICOPTER_ACTIVATED", event_data)
        event_data.activated_cells = {}
        event_data.element = {x = x, y = y, uid = helicopter.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
        event_data.target_element = remove_random_element(
            event_data.damaged_elements,
            get_state().targets
        )
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_swaped_helicopters(x, y, other_x, other_y)
        local helicopter = field.get_element(x, y)
        if helicopter == NullElement or helicopter.type ~= ____exports.ElementId.Helicopter then
            return false
        end
        local other_helicopter = field.get_element(other_x, other_y)
        if other_helicopter == NullElement or other_helicopter.type ~= ____exports.ElementId.Helicopter then
            return false
        end
        local event_data = {}
        event_data.target_elements = {}
        event_data.activated_cells = {}
        write_game_step_event("SWAPED_HELICOPTERS_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = helicopter.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_helicopter.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
        do
            local i = 0
            while i < 3 do
                local ____event_data_target_elements_18 = event_data.target_elements
                ____event_data_target_elements_18[#____event_data_target_elements_18 + 1] = remove_random_element(
                    event_data.damaged_elements,
                    get_state().targets
                )
                i = i + 1
            end
        end
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_swaped_helicopter_with_element(x, y, other_x, other_y)
        local helicopter = field.get_element(x, y)
        if helicopter == NullElement or helicopter.type ~= ____exports.ElementId.Helicopter then
            return false
        end
        local other_element = field.get_element(other_x, other_y)
        if other_element == NullElement or __TS__ArrayIncludes(GAME_CONFIG.buster_elements, other_element.type) then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED", event_data)
        event_data.activated_cells = {}
        event_data.element = {x = x, y = y, uid = helicopter.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_element.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
        event_data.target_element = remove_random_element(
            event_data.damaged_elements,
            get_state().targets
        )
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_dynamite(x, y)
        local dynamite = field.get_element(x, y)
        if dynamite == NullElement or dynamite.type ~= ____exports.ElementId.Dynamite then
            return false
        end
        local event_data = {}
        write_game_step_event("DYNAMITE_ACTIVATED", event_data)
        event_data.activated_cells = {}
        event_data.element = {x = x, y = y, uid = dynamite.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}})
        field.remove_element(x, y, true, false)
        return true
    end
    function try_activate_swaped_dynamites(x, y, other_x, other_y)
        local dynamite = field.get_element(x, y)
        if dynamite == NullElement or dynamite.type ~= ____exports.ElementId.Dynamite then
            return false
        end
        local other_dynamite = field.get_element(other_x, other_y)
        if other_dynamite == NullElement or other_dynamite.type ~= ____exports.ElementId.Dynamite then
            return false
        end
        local event_data = {}
        write_game_step_event("SWAPED_DYNAMITES_ACTIVATED", event_data)
        event_data.activated_cells = {}
        event_data.element = {x = x, y = y, uid = dynamite.uid}
        event_data.other_element = {x = other_x, y = other_y, uid = other_dynamite.uid}
        event_data.damaged_elements = remove_element_by_mask(x, y, {
            {
                1,
                1,
                1,
                1,
                1
            },
            {
                1,
                1,
                1,
                1,
                1
            },
            {
                1,
                1,
                0,
                1,
                1
            },
            {
                1,
                1,
                1,
                1,
                1
            },
            {
                1,
                1,
                1,
                1,
                1
            }
        })
        field.remove_element(x, y, true, false)
        field.remove_element(other_x, other_y, true, false)
        return true
    end
    function try_activate_swaped_dynamite_with_element(x, y, other_x, other_y)
        local dynamite = field.get_element(x, y)
        if dynamite == NullElement or dynamite.type ~= ____exports.ElementId.Dynamite then
            return false
        end
        local other_element = field.get_element(other_x, other_y)
        if other_element == NullElement or __TS__ArrayIncludes(GAME_CONFIG.buster_elements, other_element.type) then
            return false
        end
        try_activate_dynamite(x, y)
        return true
    end
    function try_activate_swaped_buster_with_buster(x, y, other_x, other_y)
        if not is_buster(x, y) or not is_buster(other_x, other_y) then
            return false
        end
        return try_activate_buster_element(x, y, false) and try_activate_buster_element(other_x, other_y, false)
    end
    function try_spinning_activation()
        if not busters.spinning.active or GameStorage.get("spinning_counts") <= 0 then
            return false
        end
        shuffle_field()
        GameStorage.set(
            "spinning_counts",
            GameStorage.get("spinning_counts") - 1
        )
        busters.spinning.active = false
        EventBus.send("UPDATED_BUTTONS")
        return true
    end
    function shuffle_field()
        Log.log("SHUFFLE FIELD")
        local state = field.save_state()
        local event_data = {}
        write_game_step_event("ON_SPINNING_ACTIVATED", event_data)
        local base_elements = {}
        for ____, element_id in ipairs(GAME_CONFIG.base_elements) do
            for ____, element in ipairs(field.get_all_elements_by_type(element_id)) do
                base_elements[#base_elements + 1] = element
            end
        end
        while #base_elements > 0 do
            local element = table.remove(__TS__ArraySplice(
                base_elements,
                math.random(0, #base_elements - 1),
                1
            ))
            if #base_elements > 0 then
                local other_element = table.remove(__TS__ArraySplice(
                    base_elements,
                    math.random(0, #base_elements - 1),
                    1
                ))
                if element ~= nil and other_element ~= nil then
                    field.swap_elements(element.x, element.y, other_element.x, other_element.y)
                    event_data[#event_data + 1] = {element_from = element, element_to = other_element}
                end
            end
        end
        is_block_input = true
        search_available_steps(
            1,
            function(steps)
                if #steps ~= 0 then
                    process_game_step(false)
                else
                    game_step_events = {}
                    field.load_state(state)
                    shuffle_field()
                end
            end
        )
    end
    function try_hammer_activation(x, y)
        if not busters.hammer.active or GameStorage.get("hammer_counts") <= 0 then
            return false
        end
        if selected_element ~= nil then
            EventBus.trigger("ON_ELEMENT_UNSELECTED", selected_element, true, true)
        end
        selected_element = nil
        if is_buster(x, y) then
            try_activate_buster_element(x, y)
        else
            local event_data = {}
            event_data.x = x
            event_data.y = y
            event_data.activated_cells = {}
            write_game_step_event("ON_ELEMENT_ACTIVATED", event_data)
            local removed_element = field.remove_element(x, y, true, false)
            if removed_element ~= nil then
                event_data.uid = removed_element.uid
            end
        end
        GameStorage.set(
            "hammer_counts",
            GameStorage.get("hammer_counts") - 1
        )
        busters.hammer.active = false
        EventBus.send("UPDATED_BUTTONS")
        return true
    end
    function try_horizontal_rocket_activation(x, y)
        if not busters.horizontal_rocket.active or GameStorage.get("horizontal_rocket_counts") <= 0 then
            return false
        end
        if selected_element ~= nil then
            EventBus.trigger("ON_ELEMENT_UNSELECTED", selected_element, true, true)
        end
        selected_element = nil
        local event_data = {}
        write_game_step_event("ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = -1}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        event_data.axis = Axis.Horizontal
        do
            local i = 0
            while i < field_width do
                if is_buster(i, y) then
                    try_activate_buster_element(i, y)
                else
                    local removed_element = field.remove_element(i, y, true, false)
                    if removed_element ~= nil then
                        local ____event_data_damaged_elements_19 = event_data.damaged_elements
                        ____event_data_damaged_elements_19[#____event_data_damaged_elements_19 + 1] = {x = i, y = y, uid = removed_element.uid}
                    end
                end
                i = i + 1
            end
        end
        GameStorage.set(
            "horizontal_rocket_counts",
            GameStorage.get("horizontal_rocket_counts") - 1
        )
        busters.horizontal_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
        return true
    end
    function try_vertical_rocket_activation(x, y)
        if not busters.vertical_rocket.active or GameStorage.get("vertical_rocket_counts") <= 0 then
            return false
        end
        if selected_element ~= nil then
            EventBus.trigger("ON_ELEMENT_UNSELECTED", selected_element, true, true)
        end
        selected_element = nil
        local event_data = {}
        write_game_step_event("ROCKET_ACTIVATED", event_data)
        event_data.element = {x = x, y = y, uid = -1}
        event_data.damaged_elements = {}
        event_data.activated_cells = {}
        event_data.axis = Axis.Vertical
        do
            local i = 0
            while i < field_height do
                if is_buster(x, i) then
                    try_activate_buster_element(x, i)
                else
                    local removed_element = field.remove_element(x, i, true, false)
                    if removed_element ~= nil then
                        local ____event_data_damaged_elements_20 = event_data.damaged_elements
                        ____event_data_damaged_elements_20[#____event_data_damaged_elements_20 + 1] = {x = x, y = i, uid = removed_element.uid}
                    end
                end
                i = i + 1
            end
        end
        GameStorage.set(
            "vertical_rocket_counts",
            GameStorage.get("vertical_rocket_counts") - 1
        )
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
        return true
    end
    function try_swap_elements(from_x, from_y, to_x, to_y)
        local cell_from = field.get_cell(from_x, from_y)
        local cell_to = field.get_cell(to_x, to_y)
        if cell_from == NotActiveCell or cell_to == NotActiveCell then
            return false
        end
        if not field.is_available_cell_type_for_move(cell_from) or not field.is_available_cell_type_for_move(cell_to) then
            return false
        end
        local element_from = field.get_element(from_x, from_y)
        local element_to = field.get_element(to_x, to_y)
        if element_from == NullElement then
            return false
        end
        if selected_element ~= nil then
            EventBus.trigger("ON_ELEMENT_UNSELECTED", selected_element, true, true)
        end
        selected_element = nil
        if is_tutorial() then
            local tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1]
            if tutorial_data.step ~= nil then
                local is_from = tutorial_data.step.from_x == from_x and tutorial_data.step.from_y == from_y and tutorial_data.step.to_x == to_x and tutorial_data.step.to_y == to_y
                local is_to = tutorial_data.step.from_x == to_x and tutorial_data.step.from_y == to_y and tutorial_data.step.to_x == from_x and tutorial_data.step.to_y == from_y
                if not is_from and not is_to then
                    return false
                end
                complete_tutorial()
            end
        end
        if not field.try_move(from_x, from_y, to_x, to_y) then
            update_state()
            EventBus.send(
                "ON_WRONG_SWAP_ELEMENTS",
                {
                    from = {x = from_x, y = from_y},
                    to = {x = to_x, y = to_y},
                    element_from = element_from,
                    element_to = element_to,
                    state = copy_state()
                }
            )
            return false
        end
        update_state()
        write_game_step_event(
            "ON_SWAP_ELEMENTS",
            {
                from = {x = from_x, y = from_y},
                to = {x = to_x, y = to_y},
                element_from = element_from,
                element_to = element_to,
                state = copy_state()
            }
        )
        return true
    end
    function set_random(seed)
        local randomseed = seed ~= nil and seed or os.time()
        math.randomseed(randomseed)
        get_state().randomseed = randomseed
    end
    function process_game_step(after_activation)
        if after_activation == nil then
            after_activation = false
        end
        if after_activation then
            field.process_state(ProcessMode.MoveElements)
        end
        while field.process_state(ProcessMode.Combinate) do
            field.process_state(ProcessMode.MoveElements)
        end
        local last_state = update_state()
        search_available_steps(
            5,
            function(steps)
                if #steps ~= 0 then
                    available_steps = steps
                    return
                end
                stop_helper()
                shuffle_field()
            end
        )
        if level_config.steps ~= nil and is_step then
            local ____get_state_result_21, ____steps_22 = get_state(), "steps"
            ____get_state_result_21[____steps_22] = ____get_state_result_21[____steps_22] - 1
        end
        is_step = false
        if level_config.steps ~= nil then
            EventBus.send("UPDATED_STEP_COUNTER", last_state.steps)
        end
        send_game_step()
        states[#states + 1] = {}
        set_targets(last_state.targets)
        set_steps(last_state.steps)
        set_random()
    end
    function revert_step()
        Log.log("REVERT STEP")
        table.remove(states)
        table.remove(states)
        local previous_state = table.remove(states)
        if previous_state == nil then
            return false
        end
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = previous_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            make_cell(x, y, cell.id, cell and cell.data)
                        else
                            field.set_cell(x, y, NotActiveCell)
                        end
                        local element = previous_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            make_element(x, y, element.type, element.data)
                        else
                            field.set_element(x, y, NullElement)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        local state = field.save_state()
        previous_state.cells = state.cells
        previous_state.elements = state.elements
        states[#states + 1] = previous_state
        set_random(previous_state.randomseed)
        search_available_steps(
            5,
            function(steps)
                available_steps = steps
            end
        )
        EventBus.send("UPDATED_STATE", previous_state)
        states[#states + 1] = {}
        set_targets(previous_state.targets)
        set_steps(previous_state.steps)
        set_random()
        return true
    end
    function is_level_completed()
        for ____, target in ipairs(get_state(2).targets) do
            if #target.uids < target.count then
                return false
            end
        end
        return true
    end
    function is_have_steps()
        if level_config.steps ~= nil then
            return get_state().steps > 0
        end
        return true
    end
    function is_can_move(from_x, from_y, to_x, to_y)
        if field.is_can_move_base(from_x, from_y, to_x, to_y) then
            return true
        end
        return is_buster(from_x, from_y) or is_buster(to_x, to_y)
    end
    function try_combo(combined_element, combination)
        local element = NullElement
        repeat
            local ____switch352 = combination.type
            local ____cond352 = ____switch352 == CombinationType.Comb4
            if ____cond352 then
                element = make_element(combined_element.x, combined_element.y, combination.angle == 0 and ____exports.ElementId.HorizontalRocket or ____exports.ElementId.VerticalRocket)
                break
            end
            ____cond352 = ____cond352 or ____switch352 == CombinationType.Comb5
            if ____cond352 then
                element = make_element(combined_element.x, combined_element.y, ____exports.ElementId.Diskosphere)
                break
            end
            ____cond352 = ____cond352 or ____switch352 == CombinationType.Comb2x2
            if ____cond352 then
                element = make_element(combined_element.x, combined_element.y, ____exports.ElementId.Helicopter)
                break
            end
            ____cond352 = ____cond352 or (____switch352 == CombinationType.Comb3x3a or ____switch352 == CombinationType.Comb3x3b)
            if ____cond352 then
                element = make_element(combined_element.x, combined_element.y, ____exports.ElementId.Dynamite)
                break
            end
            ____cond352 = ____cond352 or (____switch352 == CombinationType.Comb3x4 or ____switch352 == CombinationType.Comb3x5)
            if ____cond352 then
                element = make_element(combined_element.x, combined_element.y, ____exports.ElementId.AxisRocket)
                break
            end
        until true
        if element ~= NullElement and not is_simulating then
            game_step_events[#game_step_events].value.maked_element = {x = combined_element.x, y = combined_element.y, uid = element.uid, type = element.type}
            return true
        end
        return false
    end
    function on_damaged_element(item)
        local index = __TS__ArrayIndexOf(activated_elements, item.uid)
        if index ~= -1 then
            __TS__ArraySplice(activated_elements, index, 1)
        end
        if is_simulating then
            return
        end
        local element = field.get_element(item.x, item.y)
        if element == NullElement then
            return
        end
        for ____, target in ipairs(get_state().targets) do
            if not target.is_cell and target.type == element.type then
                local ____target_uids_25 = target.uids
                ____target_uids_25[#____target_uids_25 + 1] = element.uid
            end
        end
    end
    function is_combined_elements(e1, e2)
        if field.get_element_type(e1.type).is_clickable or field.get_element_type(e2.type).is_clickable then
            return false
        end
        return field.is_combined_elements_base(e1, e2)
    end
    function on_combined(combined_element, combination)
        if is_buster(combined_element.x, combined_element.y) then
            return
        end
        write_game_step_event("ON_COMBINED", {combined_element = combined_element, combination = combination, activated_cells = {}})
        field.on_combined_base(combined_element, combination)
        try_combo(combined_element, combination)
    end
    function on_request_element(x, y)
        return make_element(
            x,
            y,
            get_random_element_id()
        )
    end
    function on_moved_elements(elements)
        update_state()
        write_game_step_event(
            "ON_MOVED_ELEMENTS",
            {
                elements = elements,
                state = copy_state()
            }
        )
    end
    function on_cell_activated(item_info)
        local cell = field.get_cell(item_info.x, item_info.y)
        if cell == NotActiveCell then
            return
        end
        local new_cell = NotActiveCell
        if bit.band(cell.type, CellType.ActionLockedNear) == CellType.ActionLockedNear then
            if cell.cnt_near_acts ~= nil then
                if cell.cnt_near_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil and #cell.data.under_cells > 0 then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data)
                        end
                    end
                    if new_cell == NotActiveCell then
                        new_cell = make_cell(item_info.x, item_info.y, ____exports.CellId.Base)
                    end
                end
            end
        end
        if bit.band(cell.type, CellType.ActionLocked) == CellType.ActionLocked then
            if cell.cnt_acts ~= nil then
                if cell.cnt_acts > 0 then
                    if cell.data ~= nil and cell.data.under_cells ~= nil and #cell.data.under_cells > 0 then
                        local cell_id = table.remove(cell.data.under_cells)
                        if cell_id ~= nil then
                            new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data)
                        end
                    end
                    if new_cell == NotActiveCell then
                        new_cell = make_cell(item_info.x, item_info.y, ____exports.CellId.Base)
                    end
                end
            end
        end
        if new_cell ~= NotActiveCell and not is_simulating then
            for ____, ____value in ipairs(__TS__ObjectEntries(game_step_events[#game_step_events].value)) do
                local key = ____value[1]
                local value = ____value[2]
                if key == "activated_cells" then
                    value[#value + 1] = {
                        x = item_info.x,
                        y = item_info.y,
                        uid = new_cell.uid,
                        id = new_cell.id,
                        previous_id = item_info.uid
                    }
                end
            end
            for ____, target in ipairs(get_state().targets) do
                local check_for_not_stone = target.type ~= ____exports.CellId.Stone0 and target.type == cell.id
                local check_stone_with_last_cell = target.type == ____exports.CellId.Stone0 and ____exports.CellId.Stone2 == cell.id
                if target.is_cell and (check_for_not_stone or check_stone_with_last_cell) then
                    local ____target_uids_26 = target.uids
                    ____target_uids_26[#____target_uids_26 + 1] = cell.uid
                end
            end
        end
    end
    function on_revive(steps)
        local ____GAME_CONFIG_revive_state_27, ____steps_28 = GAME_CONFIG.revive_state, "steps"
        ____GAME_CONFIG_revive_state_27[____steps_28] = ____GAME_CONFIG_revive_state_27[____steps_28] + steps
        GAME_CONFIG.is_revive = true
        Scene.restart()
    end
    function get_state(offset)
        if offset == nil then
            offset = 1
        end
        assert(#states - offset >= 0)
        return states[#states - offset + 1]
    end
    function update_state()
        local last_state = get_state()
        local field_state = field.save_state()
        last_state.cells = field_state.cells
        last_state.element_types = field_state.element_types
        last_state.elements = field_state.elements
        return last_state
    end
    function update_cells_state()
        local last_state = get_state()
        local field_state = field.save_state()
        last_state.cells = field_state.cells
        return last_state
    end
    function copy_state(offset)
        if offset == nil then
            offset = 1
        end
        local from_state = get_state(offset)
        local to_state = __TS__ObjectAssign({}, from_state)
        to_state.cells = {}
        to_state.elements = {}
        do
            local y = 0
            while y < field_height do
                to_state.cells[y + 1] = {}
                to_state.elements[y + 1] = {}
                do
                    local x = 0
                    while x < field_width do
                        to_state.cells[y + 1][x + 1] = from_state.cells[y + 1][x + 1]
                        to_state.elements[y + 1][x + 1] = from_state.elements[y + 1][x + 1]
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        to_state.targets = __TS__ObjectAssign({}, from_state.targets)
        return to_state
    end
    function is_buster(x, y)
        return field.try_click(x, y)
    end
    function get_random_element_id()
        local sum = 0
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local id = tonumber(key)
            if id ~= nil then
                sum = sum + spawn_element_chances[id]
            end
        end
        local bins = {}
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local id = tonumber(key)
            if id ~= nil then
                local normalized_value = spawn_element_chances[id] / sum
                if #bins == 0 then
                    bins[#bins + 1] = normalized_value
                else
                    bins[#bins + 1] = normalized_value + bins[#bins]
                end
            end
        end
        local rand = math.random()
        for ____, ____value in __TS__Iterator(__TS__ArrayEntries(bins)) do
            local index = ____value[1]
            local value = ____value[2]
            if value >= rand then
                for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
                    local key = ____value[1]
                    local _ = ____value[2]
                    local ____index_29 = index
                    index = ____index_29 - 1
                    if ____index_29 == 0 then
                        return tonumber(key)
                    end
                end
            end
        end
        return NullElement
    end
    function remove_random_element(exclude, targets, only_base_elements)
        if only_base_elements == nil then
            only_base_elements = true
        end
        local available_items = {}
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = field.get_cell(x, y)
                        local element = field.get_element(x, y)
                        local ____temp_32 = cell ~= NotActiveCell
                        if ____temp_32 then
                            local ____opt_30 = targets
                            ____temp_32 = (____opt_30 and __TS__ArrayFindIndex(
                                targets,
                                function(____, target)
                                    local check_for_not_stone = target.type ~= ____exports.CellId.Stone0 and target.type == cell.id
                                    local check_stone_with_last_cell = target.type == ____exports.CellId.Stone0 and ____exports.CellId.Stone2 == cell.id
                                    return target.is_cell and (check_for_not_stone or check_stone_with_last_cell)
                                end
                            )) ~= -1
                        end
                        local is_valid_cell = ____temp_32
                        local ____temp_35 = element ~= NullElement
                        if ____temp_35 then
                            local ____opt_33 = exclude
                            ____temp_35 = (____opt_33 and __TS__ArrayFindIndex(
                                exclude,
                                function(____, item) return item.uid == element.uid end
                            )) == -1
                        end
                        local ____temp_35_38 = ____temp_35
                        if ____temp_35_38 then
                            local ____opt_36 = targets
                            ____temp_35_38 = (____opt_36 and __TS__ArrayFindIndex(
                                targets,
                                function(____, target)
                                    return not target.is_cell and target.type == element.type
                                end
                            )) ~= -1
                        end
                        local is_valid_element = ____temp_35_38
                        if is_valid_cell then
                            available_items[#available_items + 1] = {x = x, y = y, uid = element ~= NullElement and element.uid or cell.uid}
                        elseif is_valid_element then
                            if only_base_elements and __TS__ArrayIncludes(GAME_CONFIG.base_elements, element.type) then
                                available_items[#available_items + 1] = {x = x, y = y, uid = element.uid}
                            else
                                available_items[#available_items + 1] = {x = x, y = y, uid = element.uid}
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if #available_items == 0 then
            return NullElement
        end
        local target = available_items[math.random(0, #available_items - 1) + 1]
        if is_buster(target.x, target.y) then
            try_activate_buster_element(target.x, target.y)
        else
            field.remove_element(target.x, target.y, true, false)
        end
        return target
    end
    function remove_element_by_mask(x, y, mask, is_near_activation)
        if is_near_activation == nil then
            is_near_activation = false
        end
        local removed_elements = {}
        do
            local i = y - (#mask - 1) / 2
            while i <= y + (#mask - 1) / 2 do
                do
                    local j = x - (#mask[1] - 1) / 2
                    while j <= x + (#mask[1] - 1) / 2 do
                        if mask[i - (y - (#mask - 1) / 2) + 1][j - (x - (#mask[1] - 1) / 2) + 1] == 1 then
                            if is_valid_pos(j, i, field_width, field_height) then
                                if is_buster(j, i) then
                                    try_activate_buster_element(j, i)
                                else
                                    local removed_element = field.remove_element(j, i, true, is_near_activation)
                                    if removed_element ~= nil then
                                        removed_elements[#removed_elements + 1] = {x = j, y = i, uid = removed_element.uid}
                                    end
                                end
                            end
                        end
                        j = j + 1
                    end
                end
                i = i + 1
            end
        end
        return removed_elements
    end
    function write_game_step_event(message_id, message)
        if is_simulating then
            return
        end
        game_step_events[#game_step_events + 1] = {key = message_id, value = message}
    end
    function send_game_step()
        if is_simulating then
            return
        end
        EventBus.send(
            "ON_GAME_STEP",
            {
                events = game_step_events,
                state = get_state()
            }
        )
        game_step_events = {}
    end
    current_level = GameStorage.get("current_level")
    level_config = GAME_CONFIG.levels[current_level + 1]
    field_width = level_config.field.width
    field_height = level_config.field.height
    busters = level_config.busters
    field = Field(field_width, field_height, GAME_CONFIG.complex_move)
    start_game_time = 0
    game_item_counter = 0
    states = {}
    activated_elements = {}
    game_step_events = {}
    selected_element = nil
    spawn_element_chances = {}
    available_steps = {}
    coroutines = {}
    previous_helper_data = nil
    helper_data = nil
    is_simulating = false
    is_step = false
    is_block_input = false
    is_block_spinning = false
    is_block_hammer = false
    is_block_vertical_rocket = false
    is_block_horizontal_rocket = false
    is_gameover = false
    local function init()
        field.init()
        field.set_callback_is_can_move(is_can_move)
        field.set_callback_on_moved_elements(on_moved_elements)
        field.set_callback_is_combined_elements(is_combined_elements)
        field.set_callback_on_combinated(on_combined)
        field.set_callback_on_damaged_element(on_damaged_element)
        field.set_callback_on_request_element(on_request_element)
        field.set_callback_on_cell_activated(on_cell_activated)
        set_element_types()
        set_element_chances()
        set_busters()
        set_events()
        timer.delay(0.1, false, load_field)
    end
    return init()
end
function ____exports.load_config()
    local data = sys.load_resource("/resources/levels.json")
    if data == nil then
        return
    end
    local levels = json.decode(data)
    for ____, level_data in ipairs(levels) do
        local level = {
            field = {
                width = 10,
                height = 10,
                max_width = 8,
                max_height = 8,
                cell_size = 128,
                offset_border = 20,
                cells = {},
                elements = {}
            },
            coins = level_data.coins,
            additional_element = level_data.additional_element,
            exclude_element = level_data.exclude_element,
            time = level_data.time,
            steps = level_data.steps,
            targets = {},
            busters = {hammer = {name = "hammer", counts = level_data.busters.hammer, active = false}, spinning = {name = "spinning", counts = level_data.busters.spinning, active = false}, horizontal_rocket = {name = "horizontal_rocket", counts = level_data.busters.horizontal_rocket, active = false}, vertical_rocket = {name = "vertical_rocket", counts = level_data.busters.vertical_rocket, active = false}}
        }
        do
            local y = 0
            while y < #level_data.field do
                level.field.cells[y + 1] = {}
                level.field.elements[y + 1] = {}
                do
                    local x = 0
                    while x < #level_data.field[y + 1] do
                        local data = level_data.field[y + 1][x + 1]
                        if type(data) == "string" then
                            repeat
                                local ____switch442 = data
                                local ____cond442 = ____switch442 == "-"
                                if ____cond442 then
                                    level.field.cells[y + 1][x + 1] = NotActiveCell
                                    level.field.elements[y + 1][x + 1] = NullElement
                                    break
                                end
                                ____cond442 = ____cond442 or ____switch442 == ""
                                if ____cond442 then
                                    level.field.cells[y + 1][x + 1] = ____exports.CellId.Base
                                    level.field.elements[y + 1][x + 1] = ____exports.RandomElement
                                    break
                                end
                            until true
                        else
                            if data.cell ~= nil then
                                repeat
                                    local ____switch445 = data.cell
                                    local ____cond445 = ____switch445 == ____exports.CellId.Stone0
                                    if ____cond445 then
                                        level.field.cells[y + 1][x + 1] = {____exports.CellId.Base, ____exports.CellId.Stone2, ____exports.CellId.Stone1, ____exports.CellId.Stone0}
                                        break
                                    end
                                    ____cond445 = ____cond445 or ____switch445 == ____exports.CellId.Grass
                                    if ____cond445 then
                                        level.field.cells[y + 1][x + 1] = {____exports.CellId.Base, ____exports.CellId.Grass}
                                        break
                                    end
                                    do
                                        level.field.cells[y + 1][x + 1] = {____exports.CellId.Base, data.cell}
                                    end
                                until true
                            else
                                level.field.cells[y + 1][x + 1] = ____exports.CellId.Base
                            end
                            if data.element ~= nil then
                                level.field.elements[y + 1][x + 1] = data.element
                            else
                                level.field.elements[y + 1][x + 1] = ____exports.RandomElement
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        for ____, target_data in ipairs(level_data.targets) do
            local target
            if target_data.type.element ~= nil then
                target = {is_cell = false, type = target_data.type.element, count = 0, uids = {}}
            end
            if target_data.type.cell ~= nil then
                target = {is_cell = true, type = target_data.type.cell, count = 0, uids = {}}
            end
            if target ~= nil then
                local count = tonumber(target_data.count)
                target.count = count ~= nil and count or target.count
                local ____level_targets_39 = level.targets
                ____level_targets_39[#____level_targets_39 + 1] = target
            end
        end
        local ____GAME_CONFIG_levels_40 = GAME_CONFIG.levels
        ____GAME_CONFIG_levels_40[#____GAME_CONFIG_levels_40 + 1] = level
    end
end
return ____exports
