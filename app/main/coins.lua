local ____exports = {}
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
return ____exports
