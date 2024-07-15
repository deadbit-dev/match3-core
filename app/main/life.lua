local ____exports = {}
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
return ____exports
