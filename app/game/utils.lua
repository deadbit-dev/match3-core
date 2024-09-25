local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local ____exports = {}
local ____math_utils = require("utils.math_utils")
local Direction = ____math_utils.Direction
function ____exports.get_current_level()
    return GameStorage.get("current_level")
end
function ____exports.get_current_level_config()
    return GAME_CONFIG.levels[____exports.get_current_level() + 1]
end
function ____exports.is_animal_level()
    return __TS__ArrayIncludes(
        GAME_CONFIG.animal_levels,
        ____exports.get_current_level() + 1
    )
end
function ____exports.get_level_targets()
    local level_config = GAME_CONFIG.levels[____exports.get_current_level() + 1]
    return level_config.targets
end
function ____exports.get_field_width()
    local level_config = GAME_CONFIG.levels[____exports.get_current_level() + 1]
    return level_config.field.width
end
function ____exports.get_field_height()
    local level_config = GAME_CONFIG.levels[____exports.get_current_level() + 1]
    return level_config.field.height
end
function ____exports.get_field_max_width()
    local level_config = GAME_CONFIG.levels[____exports.get_current_level() + 1]
    return level_config.field.max_width
end
function ____exports.get_field_max_height()
    local level_config = GAME_CONFIG.levels[____exports.get_current_level() + 1]
    return level_config.field.max_height
end
function ____exports.get_field_offset_border()
    local level_config = GAME_CONFIG.levels[____exports.get_current_level() + 1]
    return level_config.field.offset_border
end
function ____exports.get_field_cell_size()
    local level_config = GAME_CONFIG.levels[____exports.get_current_level() + 1]
    return level_config.field.cell_size
end
function ____exports.get_busters()
    local level_config = GAME_CONFIG.levels[____exports.get_current_level() + 1]
    return level_config.busters
end
function ____exports.get_move_direction(dir)
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
function ____exports.add_lifes(amount)
    local life = GameStorage.get("life")
    life.amount = math.min(life.amount + amount, GAME_CONFIG.max_lifes)
    GameStorage.set("life", life)
    EventBus.send("ADDED_LIFE")
end
function ____exports.is_max_lifes()
    local life = GameStorage.get("life")
    return life.amount >= GAME_CONFIG.max_lifes
end
function ____exports.remove_lifes(amount)
    local life = GameStorage.get("life")
    life.amount = math.max(life.amount - amount, GAME_CONFIG.min_lifes)
    GameStorage.set("life", life)
    EventBus.send("REMOVED_LIFE")
end
function ____exports.is_enough_coins(amount)
    return GameStorage.get("coins") >= amount
end
function ____exports.add_coins(amount)
    local coins = GameStorage.get("coins")
    coins = math.min(coins + amount, 10000)
    GameStorage.set("coins", coins)
    EventBus.send("ADDED_COIN")
end
function ____exports.remove_coins(amount)
    local coins = GameStorage.get("coins")
    coins = coins - amount
    GameStorage.set("coins", coins)
    EventBus.send("REMOVED_COIN")
end
function ____exports.is_tutorial()
    local current_level = ____exports.get_current_level()
    local is_tutorial_level = __TS__ArrayIncludes(GAME_CONFIG.tutorial_levels, current_level + 1)
    local is_not_completed = not __TS__ArrayIncludes(
        GameStorage.get("completed_tutorials"),
        current_level + 1
    )
    return is_tutorial_level and is_not_completed
end
function ____exports.is_tutorial_step(swap_info)
    local current_level = ____exports.get_current_level()
    local tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1]
    if tutorial_data.step == nil then
        return true
    end
    local is_from = swap_info.from.x == tutorial_data.step.from.x and swap_info.from.y == tutorial_data.step.from.y
    local is_to = swap_info.to.x == tutorial_data.step.to.x and swap_info.to.y == tutorial_data.step.to.y
    return is_from and is_to
end
return ____exports
