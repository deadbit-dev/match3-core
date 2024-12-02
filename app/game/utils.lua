local ____lualib = require("lualib_bundle")
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__StringEndsWith = ____lualib.__TS__StringEndsWith
local ____exports = {}
local generate_random_level
local ____math_utils = require("utils.math_utils")
local Direction = ____math_utils.Direction
local ____utils = require("utils.utils")
local parse_time = ____utils.parse_time
function generate_random_level()
    local exclude_levels = {
        3,
        10,
        17,
        24,
        31,
        38,
        46
    }
    local levels = {}
    do
        local i = 0
        while i < 47 do
            if not __TS__ArrayIncludes(exclude_levels, i) then
                levels[#levels + 1] = i
            end
            i = i + 1
        end
    end
    local picked_level = levels[math.random(0, #levels - 1) + 1]
    print(picked_level)
    local random_level = GAME_CONFIG.levels[picked_level + 1]
    print(random_level)
    random_level.coins = 0
    random_level.steps = random_level.steps + math.random(-5, 5)
    for ____, target in ipairs(random_level.targets) do
        repeat
            local ____switch11 = target.type
            local ____cond11 = ____switch11 == 1
            if ____cond11 then
                target.count = target.count + math.random(-5, 5)
                break
            end
            ____cond11 = ____cond11 or ____switch11 == 0
            if ____cond11 then
                target.count = target.count - math.random(0, 5)
                break
            end
        until true
    end
    print(random_level)
    return random_level
end
function ____exports.get_current_level()
    return GameStorage.get("current_level")
end
function ____exports.is_last_level()
    return GameStorage.get("current_level") == #GAME_CONFIG.levels - 1
end
function ____exports.get_current_level_config()
    if GAME_CONFIG.is_revive then
        return GAME_CONFIG.revive_level
    end
    local current_level = ____exports.get_current_level()
    if current_level < 47 then
        return GAME_CONFIG.levels[current_level + 1]
    end
    return generate_random_level()
end
function ____exports.is_animal_level()
    return __TS__ArrayIncludes(
        GAME_CONFIG.animal_levels,
        ____exports.get_current_level() + 1
    )
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
    life.amount = life.amount + amount
    GameStorage.set("life", life)
    EventBus.send("ADDED_LIFE")
end
function ____exports.is_max_lifes()
    local life = GameStorage.get("life")
    return life.amount >= GAME_CONFIG.max_lifes
end
function ____exports.remove_lifes(amount)
    local life = GameStorage.get("life")
    life.amount = math.max(0, life.amount - amount)
    GameStorage.set("life", life)
    EventBus.send("REMOVED_LIFE")
end
function ____exports.is_enough_coins(amount)
    return GameStorage.get("coins") >= amount
end
function ____exports.add_coins(amount)
    local coins = GameStorage.get("coins")
    coins = math.min(coins + amount, GAME_CONFIG.max_coins)
    GameStorage.set("coins", coins)
    EventBus.send("ADDED_COIN")
    Log.log("ADDED COINS: ", amount)
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
function ____exports.is_tutorial_swap(swap_info)
    local current_level = ____exports.get_current_level()
    local tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1]
    if tutorial_data.step == nil then
        return false
    end
    local is_from = swap_info.from.x == tutorial_data.step.from.x and swap_info.from.y == tutorial_data.step.from.y
    local is_to = swap_info.to.x == tutorial_data.step.to.x and swap_info.to.y == tutorial_data.step.to.y
    local is_fromto = swap_info.to.x == tutorial_data.step.from.x and swap_info.to.y == tutorial_data.step.from.y
    local is_tofrom = swap_info.from.x == tutorial_data.step.to.x and swap_info.from.y == tutorial_data.step.to.y
    return is_from and is_to or is_fromto and is_tofrom
end
function ____exports.is_tutorial_click(pos)
    local current_level = ____exports.get_current_level()
    local tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1]
    if tutorial_data.click == nil then
        return false
    end
    return tutorial_data.click.x == pos.x and tutorial_data.click.y == pos.y
end
function ____exports.remove_ad(time)
    local current_date = System.now()
    local data = GameStorage.get("noads")
    local delta = math.min(0, data.end_data - current_date)
    data.end_data = data.end_data + (current_date + time + delta)
    GameStorage.set("noads", data)
    Log.log("REMOVE AD FOR: " .. parse_time(data.end_data))
end
function ____exports.delete_mounts()
    if not liveupdate then
        return
    end
    local mounts = liveupdate.get_mounts()
    for ____, mount in ipairs(mounts) do
        if __TS__StringEndsWith(mount.name, ".zip") then
            liveupdate.remove_mount(mount.name)
        end
    end
end
function ____exports.get_last_completed_level()
    local max_level = 0
    for ____, level in ipairs(GameStorage.get("completed_levels")) do
        level = level + 1
        if level > max_level then
            max_level = level
        end
    end
    return max_level
end
return ____exports
