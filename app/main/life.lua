local ____exports = {}
function ____exports.add_lifes(amount)
    local life = GameStorage.get("life")
    life.amount = life.amount + amount
    GameStorage.set("life", life)
    EventBus.send("ADDED_LIFE")
end
function ____exports.remove_lifes(amount)
    local life = GameStorage.get("life")
    life.amount = life.amount - amount
    GameStorage.set("life", life)
    EventBus.send("REMOVED_LIFE")
end
return ____exports
