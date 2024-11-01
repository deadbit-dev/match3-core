local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ObjectEntries = ____lualib.__TS__ObjectEntries
local __TS__ArrayFind = ____lualib.__TS__ArrayFind
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__Iterator = ____lualib.__TS__Iterator
local __TS__ArrayEntries = ____lualib.__TS__ArrayEntries
local __TS__ArrayFindIndex = ____lualib.__TS__ArrayFindIndex
local ____exports = {}
local flow = require("ludobits.m.flow")
local ____utils = require("game.utils")
local get_field_width = ____utils.get_field_width
local get_field_height = ____utils.get_field_height
local get_current_level_config = ____utils.get_current_level_config
local get_busters = ____utils.get_busters
local add_coins = ____utils.add_coins
local is_tutorial = ____utils.is_tutorial
local get_current_level = ____utils.get_current_level
local is_tutorial_swap = ____utils.is_tutorial_swap
local is_tutorial_click = ____utils.is_tutorial_click
local ____core = require("game.core")
local CellState = ____core.CellState
local CellType = ____core.CellType
local CombinationType = ____core.CombinationType
local ElementState = ____core.ElementState
local ElementType = ____core.ElementType
local Field = ____core.Field
local is_available_cell_type_for_move = ____core.is_available_cell_type_for_move
local NotActiveCell = ____core.NotActiveCell
local NotDamage = ____core.NotDamage
local NotFound = ____core.NotFound
local NullElement = ____core.NullElement
local ____math_utils = require("utils.math_utils")
local Axis = ____math_utils.Axis
local is_valid_pos = ____math_utils.is_valid_pos
local ____utils = require("utils.utils")
local shuffle_array = ____utils.shuffle_array
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
____exports.CellId.Stone = 5
____exports.CellId[____exports.CellId.Stone] = "Stone"
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
____exports.ElementId.AllAxisRocket = 16
____exports.ElementId[____exports.ElementId.AllAxisRocket] = "AllAxisRocket"
____exports.ElementId.Helicopter = 17
____exports.ElementId[____exports.ElementId.Helicopter] = "Helicopter"
____exports.ElementId.Dynamite = 18
____exports.ElementId[____exports.ElementId.Dynamite] = "Dynamite"
____exports.ElementId.Diskosphere = 19
____exports.ElementId[____exports.ElementId.Diskosphere] = "Diskosphere"
____exports.RandomElement = math.huge
____exports.TargetType = TargetType or ({})
____exports.TargetType.Cell = 0
____exports.TargetType[____exports.TargetType.Cell] = "Cell"
____exports.TargetType.Element = 1
____exports.TargetType[____exports.TargetType.Element] = "Element"
function ____exports.Game()
    local set_events, set_element_chances, load, set_tutorial, unlock_buster, is_gameover, on_tick, on_idle, on_rewind, try_rewind, set_helper, reset_helper, stop_helper, update_timer, is_level_completed, is_timeout, is_have_steps, on_win, win_action, on_gameover, on_revive, shuffle, on_shuffle_end, shuffle_field, try_load_field, has_combination, has_step, get_step, revive, load_cell, load_element, set_timer, set_targets, set_steps, set_random, get_state, new_state, update_core_state, copy_state, generate_uid, make_cell, make_element, generate_cell_type_by_id, generate_element_type_by_id, get_random_element_id, is_buster, is_can_swap, is_combined_elements, on_request_element, on_element_damaged, on_cell_damaged, on_near_cells_damaged, update_cell_targets, set_busters, on_activate_buster, on_activate_spinning, on_activate_hammer, on_activate_horizontal_rocket, on_activate_vertical_rocket, on_click, try_hammer_damage, try_horizontal_damage, try_vertical_damage, try_activate_buster_element, damage_element_by_mask, try_activate_dynamite, on_dynamite_action, try_activate_rocket, on_rocket_end, try_activate_diskosphere, on_diskosphere_damage_element_end, on_diskosphere_activated_end, try_activate_helicopter, on_helicopter_action, on_helicopter_end, remove_random_target, on_swap_elements, on_swap_elements_end, on_buster_activate_after_swap, on_combined_busters, on_combinate, on_combination, on_maked_element, on_combination_end, try_combo, on_falling, search_fall_element, on_fall_end, complete_tutorial, remove_tutorial, level_config, field_width, field_height, busters, field, spawn_element_chances, game_item_counter, states, is_block_input, is_first_step, start_game_time, game_timer, helper_timer, helper_data, is_idle, is_win, is_win_action
    function set_events()
        EventBus.on("REQUEST_LOAD_GAME", load)
        EventBus.on("ACTIVATE_BUSTER", on_activate_buster)
        EventBus.on("REVIVE", on_revive)
        EventBus.on(
            "OPENED_DLG",
            function()
                is_block_input = true
            end
        )
        EventBus.on(
            "CLOSED_DLG",
            function()
                is_block_input = false
            end
        )
        EventBus.on("REQUEST_CLICK", on_click, false)
        EventBus.on("REQUEST_TRY_SWAP_ELEMENTS", on_swap_elements, false)
        EventBus.on("REQUEST_SWAP_ELEMENTS_END", on_swap_elements_end, false)
        EventBus.on("REQUEST_TRY_ACTIVATE_BUSTER_AFTER_SWAP", on_buster_activate_after_swap, false)
        EventBus.on("REQUEST_COMBINED_BUSTERS", on_combined_busters, false)
        EventBus.on("REQUEST_COMBINATE", on_combinate, false)
        EventBus.on("REQUEST_COMBINATION", on_combination, false)
        EventBus.on("REQUEST_COMBINATION_END", on_combination_end, false)
        EventBus.on("REQUEST_FALLING", on_falling, false)
        EventBus.on("REQUEST_FALL_END", on_fall_end, false)
        EventBus.on("REQUEST_DYNAMITE_ACTION", on_dynamite_action, false)
        EventBus.on("REQUEST_ROCKET_END", on_rocket_end, false)
        EventBus.on("REQUEST_DISKOSPHERE_DAMAGE_ELEMENT_END", on_diskosphere_damage_element_end, false)
        EventBus.on("DISKOSPHERE_ACTIVATED_END", on_diskosphere_activated_end, false)
        EventBus.on("REQUEST_HELICOPTER_ACTION", on_helicopter_action, false)
        EventBus.on("REQUEST_HELICOPTER_END", on_helicopter_end, false)
        EventBus.on("SHUFFLE_END", on_shuffle_end, false)
        EventBus.on("REQUEST_IDLE", on_idle, false)
        EventBus.on(
            "REQUEST_RELOAD_FIELD",
            function()
                update_core_state()
                EventBus.send(
                    "RESPONSE_RELOAD_FIELD",
                    copy_state()
                )
            end,
            false
        )
        EventBus.on("MAKED_ELEMENT", on_maked_element, false)
        EventBus.on("REQUEST_REWIND", on_rewind, false)
    end
    function set_element_chances()
        for ____, ____value in ipairs(__TS__ObjectEntries(GAME_CONFIG.element_view)) do
            local key = ____value[1]
            local id = tonumber(key)
            if id ~= nil then
                local is_base_element = __TS__ArrayIncludes(GAME_CONFIG.base_elements, id)
                local is_additional_element = id == level_config.additional_element
                if is_base_element or is_additional_element then
                    spawn_element_chances[id] = 10
                else
                    spawn_element_chances[id] = 0
                end
                local is_excluded_element = id == level_config.exclude_element
                if is_excluded_element then
                    spawn_element_chances[id] = 0
                end
            end
        end
    end
    function load()
        Log.log("LOAD GAME")
        if GAME_CONFIG.is_revive then
            revive()
        else
            new_state()
            try_load_field()
            update_core_state()
            set_targets(level_config.targets)
            set_steps(level_config.steps)
            set_random()
        end
        EventBus.send(
            "RESPONSE_LOAD_GAME",
            copy_state()
        )
        if not GAME_CONFIG.is_revive and is_tutorial() then
            set_tutorial()
        end
        GAME_CONFIG.is_revive = false
        game_timer = timer.delay(1, true, on_tick)
        on_idle()
        Metrica.report(
            "data",
            {["level_" .. tostring(get_current_level() + 1)] = {type = "start"}}
        )
    end
    function set_tutorial()
        local tutorial_data = GAME_CONFIG.tutorials_data[get_current_level() + 1]
        local except_cells = tutorial_data.cells ~= nil and tutorial_data.cells or ({})
        local bounds = tutorial_data.bounds ~= nil and tutorial_data.bounds or ({from = {x = 0, y = 0}, to = {x = 0, y = 0}})
        local lock_info = {}
        do
            local y = bounds.from.y
            while y < bounds.to.y do
                do
                    local x = bounds.from.x
                    while x < bounds.to.x do
                        local cell = field.get_cell({x = x, y = y})
                        if cell ~= NotActiveCell then
                            local element = field.get_element({x = x, y = y})
                            lock_info[#lock_info + 1] = {
                                pos = {x = x, y = y},
                                cell = cell,
                                element = element,
                                is_locked = not __TS__ArrayFind(
                                    except_cells,
                                    function(____, cell) return cell.x == x and cell.y == y end
                                )
                            }
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if tutorial_data.busters ~= nil then
            busters.spinning.block = true
            busters.hammer.block = true
            busters.horizontal_rocket.block = true
            busters.vertical_rocket.block = true
            if __TS__ArrayIsArray(tutorial_data.busters) then
                for ____, buster in ipairs(tutorial_data.busters) do
                    unlock_buster(buster)
                end
            else
                unlock_buster(tutorial_data.busters)
            end
        end
        if tutorial_data.step ~= nil then
            local combined_element = field.get_element(tutorial_data.step.from)
            local elements = {}
            for ____, info in ipairs(lock_info) do
                if not info.is_locked and info.element ~= NullElement then
                    elements[#elements + 1] = info.element
                end
            end
            if combined_element ~= NullElement then
                set_helper({step = tutorial_data.step, combined_element = combined_element, elements = elements})
            end
        end
        EventBus.send("SET_TUTORIAL", lock_info)
    end
    function unlock_buster(name)
        repeat
            local ____switch35 = name
            local ____cond35 = ____switch35 == "hammer"
            if ____cond35 then
                busters.hammer.block = false
                break
            end
            ____cond35 = ____cond35 or ____switch35 == "spinning"
            if ____cond35 then
                busters.spinning.block = false
                break
            end
            ____cond35 = ____cond35 or ____switch35 == "horizontal_rocket"
            if ____cond35 then
                busters.horizontal_rocket.block = false
                break
            end
            ____cond35 = ____cond35 or ____switch35 == "vertical_rocket"
            if ____cond35 then
                busters.vertical_rocket.block = false
                break
            end
        until true
    end
    function is_gameover()
        local ____temp_0
        if level_config.time ~= nil then
            ____temp_0 = is_timeout()
        else
            ____temp_0 = not is_have_steps()
        end
        return ____temp_0
    end
    function on_tick()
        if level_config.time ~= nil and not is_win then
            update_timer()
        end
        if is_level_completed() then
            is_block_input = true
            if is_idle then
                return on_win()
            end
        end
        if is_gameover() then
            is_block_input = true
            if is_idle then
                return on_gameover()
            end
        end
    end
    function on_idle()
        if is_idle then
            Log.log("RETURN")
            return
        end
        Log.log("TRY IDLE")
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local pos = {x = x, y = y}
                        local cell = field.get_cell(pos)
                        local element = field.get_element(pos)
                        if element ~= NullElement and element.state ~= ElementState.Idle or cell ~= NotActiveCell and cell.state ~= CellState.Idle then
                            return
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if is_win_action then
            return
        end
        Log.log("IDLE")
        is_idle = true
        if is_level_completed() then
            return on_win()
        end
        if is_gameover() then
            return on_gameover()
        end
        if not has_step() then
            stop_helper()
            shuffle()
            return
        end
        update_core_state()
        new_state()
        update_core_state()
        local last_state = get_state(1)
        set_targets(last_state.targets)
        set_steps(last_state.steps)
        set_random()
        if not is_tutorial() and helper_timer == nil then
            helper_timer = timer.delay(
                5,
                true,
                function()
                    reset_helper()
                    set_helper()
                end
            )
        end
    end
    function on_rewind()
        if not is_idle then
            return
        end
        is_idle = false
        stop_helper()
        try_rewind()
        on_idle()
    end
    function try_rewind()
        if #states < 3 then
            return false
        end
        Log.log("REWIND: ", #states)
        table.remove(states)
        table.remove(states)
        local previous_state = get_state()
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
                            cell.uid = generate_uid()
                            field.set_cell({x = x, y = y}, cell)
                        else
                            field.set_cell({x = x, y = y}, NotActiveCell)
                        end
                        local element = previous_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            element.uid = generate_uid()
                            field.set_element({x = x, y = y}, element)
                        else
                            field.set_element({x = x, y = y}, NullElement)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        update_core_state()
        set_random(previous_state.randomseed)
        EventBus.send("RESPONSE_REWIND", previous_state)
        EventBus.send("UPDATED_STEP_COUNTER", previous_state.steps)
        return true
    end
    function set_helper(message)
        Log.log("SET_HELPER")
        if message ~= nil then
            helper_data = message
        else
            local info = get_step()
            if info == NotFound then
                return
            end
            local combined_element = field.get_element(info.step.from)
            local elements = {}
            for ____, pos in ipairs(info.combination.elementsInfo) do
                local element = field.get_element(pos)
                if element ~= NullElement then
                    elements[#elements + 1] = element
                end
            end
            if combined_element ~= NullElement then
                helper_data = {step = info.step, combined_element = combined_element, elements = elements}
            end
        end
        if helper_data ~= nil then
            EventBus.send("SET_HELPER", helper_data)
        end
    end
    function reset_helper()
        Log.log("RESET_HELPER")
        if helper_timer == nil then
            return
        end
        if helper_data == nil then
            return
        end
        EventBus.send("RESET_HELPER", helper_data)
        helper_data = nil
    end
    function stop_helper()
        Log.log("STOP_HELPER")
        if not is_tutorial() then
            if helper_timer == nil then
                return
            end
            timer.cancel(helper_timer)
            helper_timer = nil
        end
        if helper_data == nil then
            return
        end
        EventBus.send("STOP_HELPER", helper_data)
        helper_data = nil
    end
    function update_timer()
        if start_game_time == 0 then
            return
        end
        local dt = System.now() - start_game_time
        local remaining_time = math.max(0, level_config.time - dt)
        get_state().remaining_time = remaining_time
        EventBus.send("GAME_TIMER", remaining_time)
    end
    function is_level_completed()
        for ____, target in ipairs(get_state().targets) do
            if #target.uids < target.count then
                return false
            end
        end
        return true
    end
    function is_timeout()
        return get_state().remaining_time == 0
    end
    function is_have_steps()
        return get_state().steps > 0
    end
    function on_win()
        if not is_win then
            is_win = true
            local completed_levels = GameStorage.get("completed_levels")
            local current_level = GameStorage.get("current_level")
            if not __TS__ArrayIncludes(completed_levels, current_level) then
                completed_levels[#completed_levels + 1] = current_level
                GameStorage.set("completed_levels", completed_levels)
            end
            local last_state = get_state()
            add_coins(level_config.coins)
            if level_config.coins > 0 then
                if last_state.steps ~= nil then
                    add_coins(last_state.steps)
                end
                if last_state.remaining_time ~= nil then
                    add_coins(math.floor(last_state.remaining_time))
                end
            end
            Metrica.report(
                "data",
                {["level_" .. tostring(get_current_level() + 1)] = {
                    type = "end",
                    time = last_state.remaining_time ~= nil and math.floor(last_state.remaining_time) or nil,
                    steps = last_state.steps
                }}
            )
            Log.log({["level_" .. tostring(get_current_level() + 1)] = {
                type = "end",
                time = last_state.remaining_time ~= nil and math.floor(last_state.remaining_time) or nil,
                steps = last_state.steps
            }})
            EventBus.send("ON_WIN")
            win_action()
            return
        end
        timer.cancel(game_timer)
        update_core_state()
        EventBus.send(
            "ON_WIN_END",
            copy_state()
        )
    end
    function win_action()
        is_idle = false
        is_win_action = true
        local counts = 0
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local pos = {x = x, y = y}
                        local cell = field.get_cell(pos)
                        local element = field.get_element(pos)
                        if cell ~= NotActiveCell then
                            local ____timer_delay_2 = timer.delay
                            local ____counts_1 = counts
                            counts = ____counts_1 + 1
                            ____timer_delay_2(
                                0.05 * ____counts_1,
                                false,
                                function()
                                    if is_buster(pos) then
                                        if element ~= NullElement and element.id == ____exports.ElementId.Helicopter then
                                            EventBus.send("FORCE_REMOVE_ELEMENT", element.uid)
                                            make_element(pos, ____exports.ElementId.Dynamite)
                                            return try_activate_dynamite(pos, true)
                                        end
                                        return try_activate_buster_element(pos)
                                    end
                                    do
                                        local i = 0
                                        while i < 3 do
                                            local damage_info = field.try_damage(pos, false, false)
                                            if damage_info == NotDamage then
                                                return
                                            end
                                            EventBus.send("RESPONSE_HAMMER_DAMAGE", damage_info)
                                            i = i + 1
                                        end
                                    end
                                end
                            )
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        timer.delay(
            0.05 * counts * 1.5,
            false,
            function()
                is_win_action = false
                on_idle()
            end
        )
    end
    function on_gameover(revive)
        if revive == nil then
            revive = level_config.time == nil
        end
        timer.cancel(game_timer)
        update_core_state()
        if revive then
            GAME_CONFIG.revive_states = json.decode(json.encode(states))
        end
        EventBus.send(
            "ON_GAME_OVER",
            {
                state = copy_state(),
                revive = revive
            }
        )
        Metrica.report(
            "data",
            {["level_" .. tostring(get_current_level() + 1)] = {type = "fail"}}
        )
    end
    function on_revive(steps)
        local ____GAME_CONFIG_revive_states_index_3, ____steps_4 = GAME_CONFIG.revive_states[#GAME_CONFIG.revive_states], "steps"
        ____GAME_CONFIG_revive_states_index_3[____steps_4] = ____GAME_CONFIG_revive_states_index_3[____steps_4] + steps
        GAME_CONFIG.is_revive = true
        GAME_CONFIG.is_restart = true
        Scene.restart()
    end
    function shuffle()
        Log.log("SHUFFLE")
        is_block_input = true
        local function on_end()
            update_core_state()
            EventBus.send(
                "SHUFFLE_ACTION",
                copy_state()
            )
            if helper_timer == nil then
                helper_timer = timer.delay(
                    5,
                    true,
                    function()
                        reset_helper()
                        set_helper()
                    end
                )
            end
        end
        local function on_error()
            update_core_state()
            EventBus.send(
                "SHUFFLE_ACTION",
                copy_state()
            )
            timer.delay(
                0.5,
                false,
                function() return on_gameover(false) end
            )
        end
        EventBus.send("SHUFFLE_START")
        timer.delay(
            1,
            false,
            function()
                shuffle_field(on_end, on_error)
            end
        )
    end
    function on_shuffle_end()
        is_block_input = false
    end
    function shuffle_field(on_end, on_error)
        return flow.start(
            function()
                Log.log("SHUFFLE FIELD")
                local major_attempt = 0
                repeat
                    do
                        local attempt = 0
                        repeat
                            do
                                Log.log("SHUFFLE - ATTEMPT: " .. tostring(attempt))
                                local positions = {}
                                local elements = {}
                                do
                                    local y = 0
                                    while y < field_height do
                                        do
                                            local x = 0
                                            while x < field_width do
                                                local cell = field.get_cell({x = x, y = y})
                                                if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) then
                                                    local element = field.get_element({x = x, y = y})
                                                    if element ~= NullElement then
                                                        positions[#positions + 1] = {x = x, y = y}
                                                        elements[#elements + 1] = element
                                                        field.set_element({x = x, y = y}, NullElement)
                                                    end
                                                end
                                                x = x + 1
                                            end
                                        end
                                        y = y + 1
                                    end
                                end
                                shuffle_array(elements)
                                local counter = 0
                                local optimize_count = 5
                                for ____, position in ipairs(positions) do
                                    local element_assigned = false
                                    if counter >= optimize_count then
                                        counter = 0
                                        flow.frames(1)
                                    end
                                    do
                                        local i = #elements - 1
                                        while i >= 0 do
                                            local element = elements[i + 1]
                                            field.set_element(position, element)
                                            if field.search_combination(position) == NotFound then
                                                __TS__ArraySplice(elements, i, 1)
                                                element_assigned = true
                                                Log.log((("ASSIGNED FROM AVAILABLE IN POS: " .. tostring(position.x)) .. ", ") .. tostring(position.y))
                                                break
                                            end
                                            i = i - 1
                                        end
                                    end
                                    if not element_assigned then
                                        for ____, element_id in ipairs(GAME_CONFIG.base_elements) do
                                            if __TS__ArrayFind(
                                                elements,
                                                function(____, element) return element.id == element_id end
                                            ) == nil then
                                                make_element(position, element_id)
                                                if field.search_combination(position) == NotFound then
                                                    Log.log((("ASSIGNED NEW ELEMENT IN POS: " .. tostring(position.x)) .. ", ") .. tostring(position.y))
                                                    element_assigned = true
                                                    break
                                                end
                                            end
                                        end
                                    end
                                    if not element_assigned then
                                        Log.log((("SHUFFLE - NOT FOUND RIGHT ELEMENT, SET EMPTY IN POS: " .. tostring(position.x)) .. ", ") .. tostring(position.y))
                                        field.set_element(position, NullElement)
                                    end
                                    counter = counter + 1
                                end
                                if has_step() then
                                    for ____, element in ipairs(elements) do
                                        EventBus.send("FORCE_REMOVE_ELEMENT", element.uid)
                                    end
                                    return on_end()
                                end
                            end
                            attempt = attempt + 1
                            if not (attempt < GAME_CONFIG.shuffle_max_attempt) then
                                break
                            end
                        until false
                        Log.log("SHUFFLE - FILLED EMPTY CELLS")
                        do
                            local y = field_height - 1
                            while y > 0 do
                                do
                                    local x = 0
                                    while x < field_width do
                                        local pos = {x = x, y = y}
                                        local cell = field.get_cell(pos)
                                        if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) then
                                            local element = field.get_element(pos)
                                            if element == NullElement then
                                                local available_elements = json.decode(json.encode(GAME_CONFIG.base_elements))
                                                shuffle_array(available_elements)
                                                for ____, element_id in __TS__Iterator(available_elements) do
                                                    make_element(pos, element_id)
                                                    if field.search_combination(pos) == NotFound then
                                                        break
                                                    end
                                                end
                                            end
                                        end
                                        x = x + 1
                                    end
                                end
                                flow.frames(1)
                                y = y - 1
                            end
                        end
                        if has_step() then
                            return on_end()
                        end
                    end
                    major_attempt = major_attempt + 1
                    if not (major_attempt < GAME_CONFIG.shuffle_max_attempt) then
                        break
                    end
                until false
                Log.log("SHUFFLE FAILED")
                on_error()
            end,
            {parallel = true}
        )
    end
    function try_load_field()
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        load_cell({x = x, y = y})
                        load_element({x = x, y = y})
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if has_combination() then
            field.init()
            try_load_field()
            return
        end
    end
    function has_combination()
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local result = field.search_combination({x = x, y = y})
                        if result ~= NotFound then
                            return true
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return false
    end
    function has_step()
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = field.get_cell({x = x, y = y})
                        if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) then
                            if is_valid_pos(x + 1, y, field_width, field_height) then
                                local cell = field.get_cell({x = x + 1, y = y})
                                if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) then
                                    field.swap_elements({x = x, y = y}, {x = x + 1, y = y})
                                    local resultA = field.search_combination({x = x, y = y})
                                    local resultB = field.search_combination({x = x + 1, y = y})
                                    field.swap_elements({x = x, y = y}, {x = x + 1, y = y})
                                    if resultA ~= NotFound or resultB ~= NotFound then
                                        return true
                                    end
                                end
                            end
                            if is_valid_pos(x, y + 1, field_width, field_height) then
                                local cell = field.get_cell({x = x, y = y + 1})
                                if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) then
                                    field.swap_elements({x = x, y = y}, {x = x, y = y + 1})
                                    local resultC = field.search_combination({x = x, y = y})
                                    local resultD = field.search_combination({x = x, y = y + 1})
                                    field.swap_elements({x = x, y = y}, {x = x, y = y + 1})
                                    if resultC ~= NotFound or resultD ~= NotFound then
                                        return true
                                    end
                                end
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        return false
    end
    function get_step()
        local steps = {}
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = field.get_cell({x = x, y = y})
                        if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) then
                            if is_valid_pos(x + 1, y, field_width, field_height) then
                                local cell = field.get_cell({x = x + 1, y = y})
                                if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) then
                                    field.swap_elements({x = x, y = y}, {x = x + 1, y = y})
                                    local resultA = field.search_combination({x = x, y = y})
                                    local resultB = field.search_combination({x = x + 1, y = y})
                                    field.swap_elements({x = x, y = y}, {x = x + 1, y = y})
                                    if resultA ~= NotFound then
                                        steps[#steps + 1] = {step = {from = {x = x + 1, y = y}, to = {x = x, y = y}}, combination = resultA}
                                    end
                                    if resultB ~= NotFound then
                                        steps[#steps + 1] = {step = {from = {x = x, y = y}, to = {x = x + 1, y = y}}, combination = resultB}
                                    end
                                end
                            end
                            if is_valid_pos(x, y + 1, field_width, field_height) then
                                local cell = field.get_cell({x = x, y = y + 1})
                                if cell ~= NotActiveCell and is_available_cell_type_for_move(cell) then
                                    field.swap_elements({x = x, y = y}, {x = x, y = y + 1})
                                    local resultC = field.search_combination({x = x, y = y})
                                    local resultD = field.search_combination({x = x, y = y + 1})
                                    field.swap_elements({x = x, y = y}, {x = x, y = y + 1})
                                    if resultC ~= NotFound then
                                        steps[#steps + 1] = {step = {from = {x = x, y = y + 1}, to = {x = x, y = y}}, combination = resultC}
                                    end
                                    if resultD ~= NotFound then
                                        steps[#steps + 1] = {step = {from = {x = x, y = y}, to = {x = x, y = y + 1}}, combination = resultD}
                                    end
                                end
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if #steps == 0 then
            return NotFound
        end
        return steps[math.random(0, #steps - 1) + 1]
    end
    function revive()
        states = json.decode(json.encode(GAME_CONFIG.revive_states))
        local last_state = get_state()
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = last_state.cells[y + 1][x + 1]
                        if cell ~= NotActiveCell then
                            cell.uid = generate_uid()
                            field.set_cell({x = x, y = y}, cell)
                        else
                            field.set_cell({x = x, y = y}, NotActiveCell)
                        end
                        local element = last_state.elements[y + 1][x + 1]
                        if element ~= NullElement then
                            element.uid = generate_uid()
                            field.set_element({x = x, y = y}, element)
                        else
                            field.set_element({x = x, y = y}, NullElement)
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if not has_step() then
            shuffle()
        end
    end
    function load_cell(pos)
        local cell_config = level_config.field.cells[pos.y + 1][pos.x + 1]
        if __TS__ArrayIsArray(cell_config) then
            local cells = json.decode(json.encode(cell_config))
            local cell_id = table.remove(cells)
            if cell_id ~= nil then
                make_cell(pos, cell_id, cells)
            end
        else
            make_cell(pos, cell_config, {})
        end
    end
    function load_element(pos)
        local element = level_config.field.elements[pos.y + 1][pos.x + 1]
        make_element(
            pos,
            element == ____exports.RandomElement and get_random_element_id() or element
        )
    end
    function set_timer()
        if level_config.time == nil then
            return
        end
        start_game_time = System.now()
    end
    function set_targets(targets)
        local last_state = get_state()
        last_state.targets = json.decode(json.encode(targets))
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
    end
    function set_random(seed)
        local randomseed = seed ~= nil and seed or os.time()
        math.randomseed(randomseed)
        local last_state = get_state()
        last_state.randomseed = randomseed
    end
    function get_state(offset)
        if offset == nil then
            offset = 0
        end
        assert(#states - (1 + offset) >= 0)
        return states[#states - (1 + offset) + 1]
    end
    function new_state()
        states[#states + 1] = {}
    end
    function update_core_state()
        local last_state = get_state()
        local field_state = field.save_state()
        last_state.cells = field_state.cells
        last_state.elements = field_state.elements
        return last_state
    end
    function copy_state(offset)
        if offset == nil then
            offset = 0
        end
        local from_state = get_state(offset)
        local to_state = json.decode(json.encode(from_state))
        return to_state
    end
    function generate_uid()
        local ____game_item_counter_5 = game_item_counter
        game_item_counter = ____game_item_counter_5 + 1
        return ____game_item_counter_5
    end
    function make_cell(pos, id, under_cells)
        if id == NotActiveCell then
            return NotActiveCell
        end
        local cell = {
            id = id,
            uid = generate_uid(),
            type = generate_cell_type_by_id(id),
            strength = GAME_CONFIG.cell_strength[id],
            under_cells = under_cells,
            state = CellState.Idle
        }
        field.set_cell(pos, cell)
        return cell
    end
    function make_element(pos, id)
        if id == NullElement then
            return NullElement
        end
        local element = {
            id = id,
            uid = generate_uid(),
            type = generate_element_type_by_id(id),
            state = ElementState.Idle
        }
        field.set_element(pos, element)
        return element
    end
    function generate_cell_type_by_id(id)
        local ____type = 0
        if __TS__ArrayIncludes(GAME_CONFIG.damage_cells, id) then
            ____type = bit.bor(____type, CellType.ActionLocked)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.near_damage_cells, id) then
            ____type = bit.bor(____type, CellType.ActionLockedNear)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.disabled_cells, id) then
            ____type = bit.bor(____type, CellType.Disabled)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.not_moved_cells, id) then
            ____type = bit.bor(____type, CellType.NotMoved)
        end
        if ____type == 0 then
            ____type = CellType.Base
        end
        return ____type
    end
    function generate_element_type_by_id(id)
        return __TS__ArrayIncludes(GAME_CONFIG.buster_elements, id) and bit.bor(ElementType.Clickable, ElementType.Movable) or ElementType.Movable
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
                    local ____index_6 = index
                    index = ____index_6 - 1
                    if ____index_6 == 0 then
                        return tonumber(key)
                    end
                end
            end
        end
        return NullElement
    end
    function is_buster(pos)
        local cell = field.get_cell(pos)
        if cell == NotActiveCell or not field.is_available_cell_type_for_click(cell) then
            return false
        end
        local element = field.get_element(pos)
        if element == NullElement or not field.is_clickable_element(element) then
            return false
        end
        return true
    end
    function is_can_swap(from, to)
        if field.is_can_swap_base(from, to) then
            return true
        end
        return is_buster(from) or is_buster(to)
    end
    function is_combined_elements(e1, e2)
        if field.is_clickable_element(e1) or field.is_clickable_element(e2) then
            return false
        end
        return field.is_combined_elements_base(e1, e2)
    end
    function on_request_element(pos)
        if is_win then
            return NullElement
        end
        return make_element(
            pos,
            get_random_element_id()
        )
    end
    function on_element_damaged(pos, element)
        local targets = get_state().targets
        do
            local i = 0
            while i < #targets do
                local target = targets[i + 1]
                if target.type == ____exports.TargetType.Element and target.id == element.id then
                    local ____target_uids_7 = target.uids
                    ____target_uids_7[#____target_uids_7 + 1] = element.uid
                    EventBus.send("UPDATED_TARGET", {idx = i, target = target})
                end
                i = i + 1
            end
        end
        if is_level_completed() then
            is_block_input = true
        end
    end
    function on_cell_damaged(cell)
        local cell_damage_info = field.on_cell_damaged_base(cell)
        if cell_damage_info == NotDamage then
            return NotDamage
        end
        if field.is_type_cell(cell, CellType.ActionLocked) or field.is_type_cell(cell, CellType.ActionLockedNear) then
            if cell_damage_info.cell.strength ~= nil and cell_damage_info.cell.strength == 0 then
                local pos = field.get_cell_pos(cell)
                make_cell(pos, ____exports.CellId.Base, {})
                update_cell_targets(cell_damage_info.cell)
            end
        end
        if is_level_completed() then
            is_block_input = true
        end
        return cell_damage_info
    end
    function on_near_cells_damaged(cells)
        local damaged_cells_info = field.on_near_cells_damaged_base(cells)
        for ____, damaged_cell_info in ipairs(damaged_cells_info) do
            if field.is_type_cell(damaged_cell_info.cell, CellType.ActionLockedNear) then
                if damaged_cell_info.cell.strength ~= nil and damaged_cell_info.cell.strength == 0 then
                    local pos = field.get_cell_pos(damaged_cell_info.cell)
                    make_cell(pos, ____exports.CellId.Base, {})
                    update_cell_targets(damaged_cell_info.cell)
                end
            end
        end
        return damaged_cells_info
    end
    function update_cell_targets(cell)
        local targets = get_state().targets
        do
            local i = 0
            while i < #targets do
                local target = targets[i + 1]
                if target.type == ____exports.TargetType.Cell and target.id == cell.id then
                    local ____target_uids_8 = target.uids
                    ____target_uids_8[#____target_uids_8 + 1] = cell.uid
                    EventBus.send("UPDATED_TARGET", {idx = i, target = target})
                end
                i = i + 1
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
    function on_activate_buster(message)
        if is_block_input then
            return
        end
        repeat
            local ____switch265 = message.name
            local ____cond265 = ____switch265 == "SPINNING"
            if ____cond265 then
                on_activate_spinning()
                break
            end
            ____cond265 = ____cond265 or ____switch265 == "HAMMER"
            if ____cond265 then
                on_activate_hammer()
                break
            end
            ____cond265 = ____cond265 or ____switch265 == "HORIZONTAL_ROCKET"
            if ____cond265 then
                on_activate_horizontal_rocket()
                break
            end
            ____cond265 = ____cond265 or ____switch265 == "VERTICAL_ROCKET"
            if ____cond265 then
                on_activate_vertical_rocket()
                break
            end
        until true
    end
    function on_activate_spinning()
        if busters.spinning.block then
            return
        end
        if GameStorage.get("spinning_counts") <= 0 or not is_idle then
            return
        end
        GameStorage.set(
            "spinning_counts",
            GameStorage.get("spinning_counts") - 1
        )
        if is_tutorial() then
            complete_tutorial()
        end
        stop_helper()
        shuffle()
        Metrica.report(
            "data",
            {use = {
                level = get_current_level() + 1,
                id = "spinning"
            }}
        )
        busters.hammer.active = false
        busters.horizontal_rocket.active = false
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
    end
    function on_activate_hammer()
        if busters.hammer.block then
            return
        end
        if GameStorage.get("hammer_counts") <= 0 then
            return
        end
        busters.hammer.active = not busters.hammer.active
        busters.spinning.active = false
        busters.horizontal_rocket.active = false
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
    end
    function on_activate_horizontal_rocket()
        if busters.horizontal_rocket.block then
            return
        end
        if GameStorage.get("horizontal_rocket_counts") <= 0 then
            return
        end
        busters.horizontal_rocket.active = not busters.horizontal_rocket.active
        busters.hammer.active = false
        busters.spinning.active = false
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
    end
    function on_activate_vertical_rocket()
        if busters.vertical_rocket.block then
            return
        end
        if GameStorage.get("vertical_rocket_counts") <= 0 then
            return
        end
        busters.vertical_rocket.active = not busters.vertical_rocket.active
        busters.hammer.active = false
        busters.spinning.active = false
        busters.horizontal_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
    end
    function on_click(pos)
        if is_block_input or is_tutorial() and not is_tutorial_click(pos) then
            return
        end
        if is_tutorial() then
            complete_tutorial()
        end
        stop_helper()
        if busters.hammer.active then
            Metrica.report(
                "data",
                {use = {
                    level = get_current_level() + 1,
                    id = "hammer"
                }}
            )
            try_hammer_damage(pos)
            is_idle = false
            return
        end
        if busters.horizontal_rocket.active then
            Metrica.report(
                "data",
                {use = {
                    level = get_current_level() + 1,
                    id = "horizontal_rocket"
                }}
            )
            try_horizontal_damage(pos)
            is_idle = false
            return
        end
        if busters.vertical_rocket.active then
            Metrica.report(
                "data",
                {use = {
                    level = get_current_level() + 1,
                    id = "vertical_rocket"
                }}
            )
            try_vertical_damage(pos)
            is_idle = false
            return
        end
        if field.try_click(pos) then
            if try_activate_buster_element(pos) then
                is_idle = false
                if level_config.steps ~= nil then
                    local state = get_state()
                    state.steps = state.steps - 1
                    EventBus.send("UPDATED_STEP_COUNTER", state.steps)
                end
                if is_gameover() then
                    is_block_input = true
                end
            end
        end
    end
    function try_hammer_damage(pos)
        if is_buster(pos) then
            return try_activate_buster_element(pos)
        end
        local damage_info = field.try_damage(pos, false, true)
        if damage_info == NotDamage then
            return
        end
        EventBus.send("RESPONSE_HAMMER_DAMAGE", damage_info)
        GameStorage.set(
            "hammer_counts",
            GameStorage.get("hammer_counts") - 1
        )
        busters.hammer.active = false
        EventBus.send("UPDATED_BUTTONS")
    end
    function try_horizontal_damage(pos)
        local damages = {}
        do
            local x = 0
            while x < field_width do
                if is_buster({x = x, y = pos.y}) then
                    try_activate_buster_element({x = x, y = pos.y})
                else
                    local damage_info = field.try_damage({x = x, y = pos.y})
                    if damage_info ~= NotDamage then
                        damages[#damages + 1] = damage_info
                    end
                end
                x = x + 1
            end
        end
        EventBus.send("RESPONSE_ACTIVATED_ROCKET", {pos = pos, uid = -1, damages = damages, axis = Axis.Horizontal})
        GameStorage.set(
            "horizontal_rocket_counts",
            GameStorage.get("horizontal_rocket_counts") - 1
        )
        busters.horizontal_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
    end
    function try_vertical_damage(pos)
        local damages = {}
        do
            local y = 0
            while y < field_height do
                if is_buster({x = pos.x, y = y}) then
                    try_activate_buster_element({x = pos.x, y = y})
                else
                    local damage_info = field.try_damage({x = pos.x, y = y})
                    if damage_info ~= NotDamage then
                        damages[#damages + 1] = damage_info
                    end
                end
                y = y + 1
            end
        end
        EventBus.send("RESPONSE_ACTIVATED_ROCKET", {pos = pos, uid = -1, damages = damages, axis = Axis.Vertical})
        GameStorage.set(
            "vertical_rocket_counts",
            GameStorage.get("vertical_rocket_counts") - 1
        )
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
    end
    function try_activate_buster_element(pos)
        if field.is_pos_empty(pos) then
            return false
        end
        if try_activate_dynamite(pos) then
            return true
        end
        if try_activate_rocket(pos) then
            return true
        end
        if try_activate_diskosphere(pos) then
            return true
        end
        if try_activate_helicopter(pos) then
            return true
        end
        return false
    end
    function damage_element_by_mask(pos, mask, is_near_activation)
        if is_near_activation == nil then
            is_near_activation = false
        end
        local damages = {}
        do
            local i = pos.y - (#mask - 1) / 2
            while i <= pos.y + (#mask - 1) / 2 do
                do
                    local j = pos.x - (#mask[1] - 1) / 2
                    while j <= pos.x + (#mask[1] - 1) / 2 do
                        if mask[i - (pos.y - (#mask - 1) / 2) + 1][j - (pos.x - (#mask[1] - 1) / 2) + 1] == 1 then
                            if is_valid_pos(j, i, field_width, field_height) then
                                local cell = field.get_cell({x = j, y = i})
                                local element = field.get_element({x = j, y = i})
                                if cell ~= NotActiveCell and cell.state == CellState.Idle and (element ~= NullElement and element.state == ElementState.Idle or element == NullElement) then
                                    if is_buster({x = j, y = i}) then
                                        try_activate_buster_element({x = j, y = i})
                                    else
                                        local damage_info = field.try_damage({x = j, y = i}, is_near_activation)
                                        if damage_info ~= NotDamage then
                                            damages[#damages + 1] = damage_info
                                        end
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
        return damages
    end
    function try_activate_dynamite(pos, big_range)
        if big_range == nil then
            big_range = false
        end
        local dynamite = field.get_element(pos)
        if dynamite == NullElement or dynamite.id ~= ____exports.ElementId.Dynamite then
            return false
        end
        field.set_element_state(pos, ElementState.Busy)
        EventBus.send("RESPONSE_DYNAMITE_ACTIVATED", {pos = pos, uid = dynamite.uid, damages = {}, big_range = big_range})
        return true
    end
    function on_dynamite_action(message)
        local damage_mask = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}}
        local big_damage_mask = {
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
        }
        local damage = field.try_damage(message.pos, false, false, true)
        local damages = damage ~= NotDamage and ({damage}) or ({})
        local range_damages = damage_element_by_mask(message.pos, message.big_range and big_damage_mask or damage_mask)
        for ____, damage_info in ipairs(range_damages) do
            if damage_info ~= NotDamage then
                damages[#damages + 1] = damage_info
            end
        end
        EventBus.send("RESPONSE_DYNAMITE_ACTION", {pos = message.pos, uid = message.uid, damages = damages, big_range = message.big_range})
    end
    function try_activate_rocket(pos, all_axis)
        if all_axis == nil then
            all_axis = false
        end
        local rocket = field.get_element(pos)
        if rocket == NullElement or not __TS__ArrayIncludes(GAME_CONFIG.rockets, rocket.id) then
            return false
        end
        local damage = field.try_damage(pos, false, false, true)
        local damages = damage ~= NotDamage and ({damage}) or ({})
        local busters = {}
        if rocket.id == ____exports.ElementId.VerticalRocket or rocket.id == ____exports.ElementId.AllAxisRocket or all_axis then
            do
                local y = 0
                while y < field_height do
                    if y ~= pos.y then
                        local cell = field.get_cell({x = pos.x, y = y})
                        local element = field.get_element({x = pos.x, y = y})
                        if cell ~= NotActiveCell and cell.state == CellState.Idle and (element ~= NullElement and element.state == ElementState.Idle or element == NullElement) then
                            if is_buster({x = pos.x, y = y}) then
                                busters[#busters + 1] = {x = pos.x, y = y}
                            else
                                local damage_info = field.try_damage({x = pos.x, y = y})
                                if damage_info ~= NotDamage then
                                    field.set_element_state(damage_info.pos, ElementState.Busy)
                                    field.set_cell_state(damage_info.pos, CellState.Busy)
                                    damages[#damages + 1] = damage_info
                                end
                            end
                        end
                    end
                    y = y + 1
                end
            end
        end
        if rocket.id == ____exports.ElementId.HorizontalRocket or rocket.id == ____exports.ElementId.AllAxisRocket or all_axis then
            do
                local x = 0
                while x < field_width do
                    if x ~= pos.x then
                        local cell = field.get_cell({x = x, y = pos.y})
                        local element = field.get_element({x = x, y = pos.y})
                        if cell ~= NotActiveCell and cell.state == CellState.Idle and (element ~= NullElement and element.state == ElementState.Idle or element == NullElement) then
                            if is_buster({x = x, y = pos.y}) then
                                busters[#busters + 1] = {x = x, y = pos.y}
                            else
                                local damage_info = field.try_damage({x = x, y = pos.y})
                                if damage_info ~= NotDamage then
                                    field.set_element_state(damage_info.pos, ElementState.Busy)
                                    field.set_cell_state(damage_info.pos, CellState.Busy)
                                    damages[#damages + 1] = damage_info
                                end
                            end
                        end
                    end
                    x = x + 1
                end
            end
        end
        for ____, buster in ipairs(busters) do
            try_activate_buster_element(buster)
        end
        local axis = (rocket.id == ____exports.ElementId.AllAxisRocket or all_axis) and Axis.All or (rocket.id == ____exports.ElementId.VerticalRocket and Axis.Vertical or Axis.Horizontal)
        EventBus.send("RESPONSE_ACTIVATED_ROCKET", {pos = pos, uid = rocket.uid, damages = damages, axis = axis})
        return true
    end
    function on_rocket_end(damages)
        for ____, damage_info in ipairs(damages) do
            field.set_cell_state(damage_info.pos, CellState.Idle)
        end
    end
    function try_activate_diskosphere(pos, ids, buster)
        if ids == nil then
            ids = {get_random_element_id()}
        end
        local diskosphere = field.get_element(pos)
        if diskosphere == NullElement or diskosphere.id ~= ____exports.ElementId.Diskosphere then
            return false
        end
        local damage = field.try_damage(pos, false, false, true)
        if damage ~= NotDamage then
            field.set_element_state(damage.pos, ElementState.Busy)
            field.set_cell_state(damage.pos, CellState.Busy)
        end
        local damages = damage ~= NotDamage and ({damage}) or ({})
        for ____, element_id in ipairs(ids) do
            local elements = field.get_all_elements_by_id(element_id)
            for ____, element in ipairs(elements) do
                local element_pos = field.get_element_pos(element)
                local damage_info = field.try_damage(element_pos, true, false)
                if damage_info ~= NotDamage then
                    field.set_element_state(damage_info.pos, ElementState.Busy)
                    field.set_cell_state(damage_info.pos, CellState.Busy)
                    damages[#damages + 1] = damage_info
                end
            end
        end
        EventBus.send("RESPONSE_ACTIVATED_DISKOSPHERE", {pos = pos, uid = diskosphere.uid, damages = damages, buster = buster})
        return true
    end
    function on_diskosphere_damage_element_end(message)
        field.set_cell_state(message.damage_info.pos, CellState.Idle)
        if message.buster == nil then
            return
        end
        make_element(message.damage_info.pos, message.buster)
        try_activate_buster_element(message.damage_info.pos)
    end
    function on_diskosphere_activated_end(pos)
        field.set_cell_state(pos, CellState.Idle)
    end
    function try_activate_helicopter(pos, triple, buster)
        if triple == nil then
            triple = false
        end
        local helicopter = field.get_element(pos)
        if helicopter == NullElement or helicopter.id ~= ____exports.ElementId.Helicopter then
            return false
        end
        local under_damage = field.try_damage(pos, false, false, true)
        local damages = damage_element_by_mask(pos, {{0, 1, 0}, {1, 0, 1}, {0, 1, 0}})
        if under_damage ~= NotDamage then
            damages[#damages + 1] = under_damage
        end
        EventBus.send("RESPONSE_ACTIVATED_HELICOPTER", {
            pos = pos,
            uid = helicopter.uid,
            damages = damages,
            triple = triple,
            buster = buster
        })
        return true
    end
    function on_helicopter_action(message)
        local damages = {}
        do
            local i = 0
            while i < (message.triple and 3 or 1) do
                local damage_info = remove_random_target({message.uid})
                if damage_info ~= NullElement then
                    field.set_cell_state(damage_info.pos, CellState.Busy)
                    damages[#damages + 1] = damage_info
                end
                i = i + 1
            end
        end
        EventBus.send("RESPONSE_HELICOPTER_ACTION", {pos = message.pos, uid = message.uid, damages = damages, buster = message.buster})
    end
    function on_helicopter_end(message)
        for ____, damage_info in ipairs(message.damages) do
            if damage_info.element == nil and is_buster(damage_info.pos) then
                try_activate_buster_element(damage_info.pos)
            end
            field.set_cell_state(damage_info.pos, CellState.Idle)
            if message.buster ~= nil then
                make_element(damage_info.pos, message.buster)
                try_activate_buster_element(damage_info.pos)
            end
        end
    end
    function remove_random_target(exclude, only_base_elements)
        if only_base_elements == nil then
            only_base_elements = true
        end
        local targets = get_state().targets
        local available_targets = {}
        do
            local y = 0
            while y < field_height do
                do
                    local x = 0
                    while x < field_width do
                        local cell = field.get_cell({x = x, y = y})
                        local element = field.get_element({x = x, y = y})
                        local ____temp_11 = cell ~= NotActiveCell and cell.state ~= CellState.Busy
                        if ____temp_11 then
                            local ____opt_9 = exclude
                            ____temp_11 = (____opt_9 and __TS__ArrayFindIndex(
                                exclude,
                                function(____, uid) return uid == cell.uid end
                            )) == -1
                        end
                        local ____temp_11_14 = ____temp_11
                        if ____temp_11_14 then
                            local ____opt_12 = targets
                            ____temp_11_14 = (____opt_12 and __TS__ArrayFindIndex(
                                targets,
                                function(____, target)
                                    return target.type == ____exports.TargetType.Cell and target.id == cell.id and target.count > #target.uids and cell.strength ~= nil and cell.strength < GAME_CONFIG.cell_strength[cell.id]
                                end
                            )) ~= -1
                        end
                        local is_valid_cell = ____temp_11_14
                        if is_valid_cell then
                            if element ~= NullElement then
                                available_targets[#available_targets + 1] = {pos = {x = x, y = y}, element = element}
                            else
                                available_targets[#available_targets + 1] = {pos = {x = x, y = y}, cell = cell}
                            end
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if #available_targets == 0 then
            do
                local y = 0
                while y < field_height do
                    do
                        local x = 0
                        while x < field_width do
                            local cell = field.get_cell({x = x, y = y})
                            local element = field.get_element({x = x, y = y})
                            local ____temp_17 = cell ~= NotActiveCell and cell.state ~= CellState.Busy
                            if ____temp_17 then
                                local ____opt_15 = exclude
                                ____temp_17 = (____opt_15 and __TS__ArrayFindIndex(
                                    exclude,
                                    function(____, uid) return uid == cell.uid end
                                )) == -1
                            end
                            local ____temp_17_20 = ____temp_17
                            if ____temp_17_20 then
                                local ____opt_18 = targets
                                ____temp_17_20 = (____opt_18 and __TS__ArrayFindIndex(
                                    targets,
                                    function(____, target)
                                        return target.type == ____exports.TargetType.Cell and target.id == cell.id and target.count > #target.uids
                                    end
                                )) ~= -1
                            end
                            local is_valid_cell = ____temp_17_20
                            local ____temp_23 = element ~= NullElement
                            if ____temp_23 then
                                local ____opt_21 = exclude
                                ____temp_23 = (____opt_21 and __TS__ArrayFindIndex(
                                    exclude,
                                    function(____, uid) return uid == element.uid end
                                )) == -1
                            end
                            local ____temp_23_26 = ____temp_23
                            if ____temp_23_26 then
                                local ____opt_24 = targets
                                ____temp_23_26 = (____opt_24 and __TS__ArrayFindIndex(
                                    targets,
                                    function(____, target)
                                        return target.type == ____exports.TargetType.Element and target.id == element.id and target.count > #target.uids
                                    end
                                )) ~= -1
                            end
                            local is_valid_element = ____temp_23_26
                            if is_valid_cell then
                                if element ~= NullElement then
                                    available_targets[#available_targets + 1] = {pos = {x = x, y = y}, element = element}
                                else
                                    available_targets[#available_targets + 1] = {pos = {x = x, y = y}, cell = cell}
                                end
                            elseif is_valid_element then
                                if only_base_elements and __TS__ArrayIncludes(GAME_CONFIG.base_elements, element.type) then
                                    available_targets[#available_targets + 1] = {pos = {x = x, y = y}, element = element}
                                else
                                    available_targets[#available_targets + 1] = {pos = {x = x, y = y}, element = element}
                                end
                            end
                            x = x + 1
                        end
                    end
                    y = y + 1
                end
            end
        end
        if #available_targets == 0 then
            do
                local y = 0
                while y < field_height do
                    do
                        local x = 0
                        while x < field_width do
                            local cell = field.get_cell({x = x, y = y})
                            local element = field.get_element({x = x, y = y})
                            local is_valid_cell = cell ~= NotActiveCell and cell.id ~= ____exports.CellId.Base
                            local ____temp_29 = element ~= NullElement
                            if ____temp_29 then
                                local ____opt_27 = exclude
                                ____temp_29 = (____opt_27 and __TS__ArrayFindIndex(
                                    exclude,
                                    function(____, uid) return uid == element.uid end
                                )) == -1
                            end
                            local is_valid_element = ____temp_29
                            if is_valid_cell then
                                if element ~= NullElement then
                                    available_targets[#available_targets + 1] = {pos = {x = x, y = y}, element = element}
                                end
                            elseif is_valid_element then
                                if only_base_elements and __TS__ArrayIncludes(GAME_CONFIG.base_elements, element.type) then
                                    available_targets[#available_targets + 1] = {pos = {x = x, y = y}, element = element}
                                else
                                    available_targets[#available_targets + 1] = {pos = {x = x, y = y}, element = element}
                                end
                            end
                            x = x + 1
                        end
                    end
                    y = y + 1
                end
            end
        end
        if #available_targets == 0 then
            return NullElement
        end
        local target = available_targets[math.random(0, #available_targets - 1) + 1]
        local ____field_try_damage_32 = field.try_damage
        local ____target_pos_31 = target.pos
        local ____temp_30
        if target.cell ~= nil then
            ____temp_30 = true
        else
            ____temp_30 = false
        end
        local damage_info = ____field_try_damage_32(
            ____target_pos_31,
            false,
            false,
            false,
            ____temp_30
        )
        return damage_info ~= NotDamage and damage_info or NullElement
    end
    function on_swap_elements(swap)
        if is_block_input or is_tutorial() and not is_tutorial_swap(swap) then
            return
        end
        busters.hammer.active = false
        busters.spinning.active = false
        busters.horizontal_rocket.active = false
        busters.vertical_rocket.active = false
        EventBus.send("UPDATED_BUTTONS")
        if is_first_step then
            is_first_step = false
            set_timer()
        end
        local cell_from = field.get_cell(swap.from)
        local cell_to = field.get_cell(swap.to)
        if cell_from == NotActiveCell or cell_to == NotActiveCell then
            return
        end
        if not is_available_cell_type_for_move(cell_from) or not is_available_cell_type_for_move(cell_to) then
            return
        end
        local element_from = field.get_element(swap.from)
        local element_to = field.get_element(swap.to)
        if element_from == NullElement or element_from.state ~= ElementState.Idle then
            return
        end
        if element_to ~= NullElement and element_to.state ~= ElementState.Idle then
            return
        end
        stop_helper()
        if not field.try_swap(swap.from, swap.to) then
            EventBus.send("RESPONSE_WRONG_SWAP_ELEMENTS", {from = swap.from, to = swap.to, element_from = element_from, element_to = element_to})
            return
        end
        is_idle = false
        if level_config.steps ~= nil then
            local state = get_state()
            state.steps = state.steps - 1
            EventBus.send("UPDATED_STEP_COUNTER", state.steps)
        end
        if is_gameover() then
            is_block_input = true
        end
        local comb1 = field.search_combination(swap.from)
        if comb1 ~= NotFound then
            for ____, info in ipairs(comb1.elementsInfo) do
                field.set_element_state(info, ElementState.Busy)
                field.set_cell_state(info, CellState.Busy)
            end
        end
        local comb2 = field.search_combination(swap.to)
        if comb2 ~= NotFound then
            for ____, info in ipairs(comb2.elementsInfo) do
                field.set_element_state(info, ElementState.Busy)
                field.set_cell_state(info, CellState.Busy)
            end
        end
        EventBus.send("RESPONSE_SWAP_ELEMENTS", {from = swap.from, to = swap.to, element_from = element_from, element_to = element_to})
        if is_tutorial() then
            complete_tutorial()
        end
    end
    function on_swap_elements_end(message)
        field.set_element_state(message.from, ElementState.Idle)
        field.set_element_state(message.to, ElementState.Idle)
    end
    function on_buster_activate_after_swap(message)
        if not is_buster(message.from) and not is_buster(message.to) then
            return
        end
        local buster_from = message.element_to
        local buster_to = message.element_from
        local is_from_dynamite = buster_from ~= NullElement and buster_from.id == ____exports.ElementId.Dynamite
        local is_to_dynamite = buster_to.id == ____exports.ElementId.Dynamite
        local is_combinate_dynamites = is_from_dynamite and is_to_dynamite
        local is_from_rocket = buster_from ~= NullElement and __TS__ArrayIncludes(GAME_CONFIG.rockets, buster_from.id)
        local is_to_rocket = __TS__ArrayIncludes(GAME_CONFIG.rockets, buster_to.id)
        local is_combinate_rockets = is_from_rocket and is_to_rocket
        local is_from_helicopter = buster_from ~= NullElement and buster_from.id == ____exports.ElementId.Helicopter
        local is_to_helicopter = buster_to.id == ____exports.ElementId.Helicopter
        local is_combinate_helicopters = is_from_helicopter and is_to_helicopter
        local is_from_other_element = buster_from ~= NullElement
        local is_to_diskosphere = buster_to.id == ____exports.ElementId.Diskosphere
        local is_combinate_to_diskosphere = is_from_other_element and is_to_diskosphere
        if is_combinate_dynamites or is_combinate_rockets or is_combinate_helicopters or is_combinate_to_diskosphere then
            field.set_element_state(message.to, ElementState.Busy)
            field.set_element(message.from, NullElement)
            EventBus.send("RESPONSE_COMBINATE_BUSTERS", {buster_from = {pos = message.from, element = buster_from}, buster_to = {pos = message.to, element = buster_to}})
            return
        end
        local is_from_diskosphere = buster_from ~= NullElement and buster_from.id == ____exports.ElementId.Diskosphere
        if is_from_diskosphere then
            field.set_element_state(message.from, ElementState.Busy)
            field.set_element(message.to, NullElement)
            EventBus.send("RESPONSE_COMBINATE_BUSTERS", {buster_from = {pos = message.to, element = buster_to}, buster_to = {pos = message.from, element = buster_from}})
            return
        end
        if is_from_helicopter and __TS__ArrayIncludes(GAME_CONFIG.buster_elements, buster_to.id) then
            field.set_element_state(message.from, ElementState.Busy)
            field.set_element(message.to, NullElement)
            EventBus.send("RESPONSE_COMBINATE_BUSTERS", {buster_from = {pos = message.to, element = buster_to}, buster_to = {pos = message.from, element = buster_from}})
            return
        end
        if is_to_helicopter and buster_from ~= NullElement and __TS__ArrayIncludes(GAME_CONFIG.buster_elements, buster_from.id) then
            field.set_element_state(message.to, ElementState.Busy)
            field.set_element(message.from, NullElement)
            EventBus.send("RESPONSE_COMBINATE_BUSTERS", {buster_from = {pos = message.from, element = buster_from}, buster_to = {pos = message.to, element = buster_to}})
            return
        end
        if is_buster(message.from) then
            try_activate_buster_element(message.from)
        end
        if is_buster(message.to) then
            try_activate_buster_element(message.to)
        end
    end
    function on_combined_busters(message)
        if message.buster_from.element.id == ____exports.ElementId.Dynamite and message.buster_to.element.id == ____exports.ElementId.Dynamite then
            return try_activate_dynamite(message.buster_to.pos, true)
        end
        if __TS__ArrayIncludes(GAME_CONFIG.rockets, message.buster_from.element.id) and __TS__ArrayIncludes(GAME_CONFIG.rockets, message.buster_to.element.id) then
            return try_activate_rocket(message.buster_to.pos, true)
        end
        if message.buster_from.element.id == ____exports.ElementId.Helicopter and message.buster_to.element.id == ____exports.ElementId.Helicopter then
            return try_activate_helicopter(message.buster_to.pos, true)
        end
        if message.buster_from.element.id == ____exports.ElementId.Diskosphere then
            if message.buster_to.element.id == ____exports.ElementId.Diskosphere then
                return try_activate_diskosphere(message.buster_to.pos, GAME_CONFIG.base_elements)
            elseif __TS__ArrayIncludes(GAME_CONFIG.buster_elements, message.buster_to.element.id) then
                return try_activate_diskosphere(
                    message.buster_from.pos,
                    {get_random_element_id()},
                    message.buster_to.element.id
                )
            else
                return try_activate_diskosphere(message.buster_from.pos, {message.buster_to.element.id})
            end
        end
        if message.buster_to.element.id == ____exports.ElementId.Diskosphere then
            if message.buster_from.element.id == ____exports.ElementId.Diskosphere then
                return try_activate_diskosphere(message.buster_to.pos, GAME_CONFIG.base_elements)
            elseif __TS__ArrayIncludes(GAME_CONFIG.buster_elements, message.buster_from.element.id) then
                return try_activate_diskosphere(
                    message.buster_to.pos,
                    {get_random_element_id()},
                    message.buster_from.element.id
                )
            else
                return try_activate_diskosphere(message.buster_to.pos, {message.buster_from.element.id})
            end
        end
        if message.buster_to.element.id == ____exports.ElementId.Helicopter then
            return try_activate_helicopter(message.buster_to.pos, false, message.buster_from.element.id)
        end
        if message.buster_from.element.id == ____exports.ElementId.Helicopter then
            return try_activate_helicopter(message.buster_to.pos, false, message.buster_to.element.id)
        end
    end
    function on_combinate(message)
        for ____, pos in ipairs(message.combined_positions) do
            local combination = field.search_combination(pos)
            if combination ~= NotFound then
                for ____, info in ipairs(combination.elementsInfo) do
                    field.set_element_state(info, ElementState.Busy)
                    field.set_cell_state(info, CellState.Busy)
                end
                EventBus.send("RESPONSE_COMBINATE", combination)
            else
                EventBus.send("RESPONSE_COMBINATE_NOT_FOUND", pos)
            end
        end
    end
    function on_combination(combination)
        local damages_info = field.combinate(combination)
        local maked_element = try_combo(combination.combined_pos, combination)
        if maked_element ~= nil then
            field.set_element_state(combination.combined_pos, ElementState.Busy)
        end
        EventBus.send("RESPONSE_COMBINATION", {pos = combination.combined_pos, damages = damages_info, maked_element = maked_element})
    end
    function on_maked_element(pos)
        field.set_element_state(pos, ElementState.Idle)
    end
    function on_combination_end(damages)
        for ____, damage_info in ipairs(damages) do
            field.set_cell_state(damage_info.pos, CellState.Idle)
        end
    end
    function try_combo(pos, combination)
        local element = NullElement
        repeat
            local ____switch451 = combination.type
            local ____cond451 = ____switch451 == CombinationType.Comb4
            if ____cond451 then
                element = make_element(pos, combination.angle == 0 and ____exports.ElementId.HorizontalRocket or ____exports.ElementId.VerticalRocket)
                break
            end
            ____cond451 = ____cond451 or ____switch451 == CombinationType.Comb2x2
            if ____cond451 then
                element = make_element(pos, ____exports.ElementId.Helicopter)
                break
            end
            ____cond451 = ____cond451 or (____switch451 == CombinationType.Comb3x3a or ____switch451 == CombinationType.Comb3x3b)
            if ____cond451 then
                element = make_element(pos, ____exports.ElementId.Dynamite)
                break
            end
            ____cond451 = ____cond451 or (____switch451 == CombinationType.Comb3x4a or ____switch451 == CombinationType.Comb3x4b or ____switch451 == CombinationType.Comb3x5)
            if ____cond451 then
                element = make_element(pos, ____exports.ElementId.AllAxisRocket)
                break
            end
            ____cond451 = ____cond451 or ____switch451 == CombinationType.Comb5
            if ____cond451 then
                element = make_element(pos, ____exports.ElementId.Diskosphere)
                break
            end
        until true
        if element ~= NullElement then
            return element
        end
    end
    function on_falling(pos)
        print("FALL: ", pos.x, pos.y)
        local result = search_fall_element(pos, pos)
        if result ~= NotFound then
            local move_info = field.fell_element(result)
            if move_info ~= NotFound then
                print("RESPONSE FALLING: ", move_info.start_pos.x, move_info.start_pos.y)
                return EventBus.send("RESPONSE_FALLING", move_info)
            end
        end
        EventBus.send("RESPONSE_FALLING_NOT_FOUND", pos)
    end
    function search_fall_element(start_pos, pos, decay)
        if decay == nil then
            decay = false
        end
        if decay then
            local neighbor_cells = field.get_neighbor_cells(pos, {{1, 0, 1}, {0, 0, 0}, {0, 0, 0}})
            for ____, neighbor_cell in ipairs(neighbor_cells) do
                if is_available_cell_type_for_move(neighbor_cell) then
                    local neighbor_cell_pos = field.get_cell_pos(neighbor_cell)
                    local element = field.get_element(neighbor_cell_pos)
                    if element ~= NullElement and element.state == ElementState.Idle then
                        return element
                    end
                end
            end
        end
        local top_pos = {x = pos.x, y = pos.y - 1}
        if top_pos.y < 0 then
            return NotFound
        end
        local element = field.get_element(pos)
        if element ~= NullElement and element.state == ElementState.Idle then
            return element
        end
        if field.is_outside_pos_in_column(top_pos) and field.is_pos_empty(top_pos) and field.is_pos_empty(pos) then
            Log.log("REQUEST ELEMENT IN: ", pos)
            local element = field.request_element(top_pos)
            if element ~= NullElement then
                EventBus.send("REQUESTED_ELEMENT", {pos = top_pos, element = element})
                return element
            end
        end
        local top_cell = field.get_cell(top_pos)
        if top_cell ~= NotActiveCell then
            if not is_available_cell_type_for_move(top_cell) or top_cell.state ~= CellState.Idle then
                local neighbor_cells = field.get_neighbor_cells(pos, {{1, 0, 1}, {0, 0, 0}, {0, 0, 0}})
                for ____, neighbor_cell in ipairs(neighbor_cells) do
                    if is_available_cell_type_for_move(neighbor_cell) then
                        local neighbor_cell_pos = field.get_cell_pos(neighbor_cell)
                        local result = search_fall_element(start_pos, neighbor_cell_pos, decay)
                        if result ~= NotFound then
                            return result
                        end
                    end
                end
                if decay then
                    return NotFound
                end
                return search_fall_element(start_pos, start_pos, true)
            end
        end
        if field.is_pos_empty(top_pos) then
            return search_fall_element(start_pos, top_pos, decay)
        end
        local top_element = field.get_element(top_pos)
        if top_element ~= NullElement and top_element.state == ElementState.Idle then
            return top_element
        end
        return NotFound
    end
    function on_fall_end(pos)
        local element = field.get_element(pos)
        if element ~= NullElement then
            local move_info = field.fell_element(element)
            if move_info ~= NotFound then
                EventBus.send("RESPONSE_FALLING", move_info)
            else
                field.set_element_state(pos, ElementState.Idle)
                EventBus.send("RESPONSE_FALL_END", {pos = pos, element = element})
            end
        end
    end
    function complete_tutorial()
        local completed_tutorials = GameStorage.get("completed_tutorials")
        completed_tutorials[#completed_tutorials + 1] = get_current_level() + 1
        GameStorage.set("completed_tutorials", completed_tutorials)
        remove_tutorial()
    end
    function remove_tutorial()
        local tutorial_data = GAME_CONFIG.tutorials_data[get_current_level() + 1]
        local except_cells = tutorial_data.cells ~= nil and tutorial_data.cells or ({})
        local bounds = tutorial_data.bounds ~= nil and tutorial_data.bounds or ({from = {x = 0, y = 0}, to = {x = 0, y = 0}})
        local unlock_info = {}
        do
            local y = bounds.from.y
            while y < bounds.to.y do
                do
                    local x = bounds.from.x
                    while x < bounds.to.x do
                        local cell = field.get_cell({x = x, y = y})
                        if cell ~= NotActiveCell then
                            local element = field.get_element({x = x, y = y})
                            unlock_info[#unlock_info + 1] = {pos = {x = x, y = y}, cell = cell, element = element}
                        end
                        x = x + 1
                    end
                end
                y = y + 1
            end
        end
        if tutorial_data.busters ~= nil then
            busters.spinning.block = false
            busters.hammer.block = false
            busters.horizontal_rocket.block = false
            busters.vertical_rocket.block = false
        end
        EventBus.send("REMOVE_TUTORIAL", unlock_info)
    end
    level_config = get_current_level_config()
    field_width = get_field_width()
    field_height = get_field_height()
    busters = get_busters()
    field = Field(field_width, field_height)
    spawn_element_chances = {}
    game_item_counter = 0
    states = {}
    is_block_input = false
    is_first_step = true
    start_game_time = 0
    helper_timer = nil
    helper_data = nil
    is_idle = false
    is_win = false
    is_win_action = false
    local function init()
        Log.log("INIT GAME")
        field.init()
        field.set_callback_is_can_swap(is_can_swap)
        field.set_callback_is_combined_elements(is_combined_elements)
        field.set_callback_on_request_element(on_request_element)
        field.set_callback_on_element_damaged(on_element_damaged)
        field.set_callback_on_cell_damaged(on_cell_damaged)
        field.set_callback_on_near_cells_damaged(on_near_cells_damaged)
        set_busters()
        set_element_chances()
        set_events()
    end
    return init()
end
function ____exports.base_cell(uid)
    return {
        id = ____exports.CellId.Base,
        uid = uid,
        type = CellType.Base,
        under_cells = {},
        state = CellState.Idle
    }
end
return ____exports
