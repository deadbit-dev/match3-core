export function is_enough_coins(amount: number) {
    return GameStorage.get('coins') >= amount;
}

export function add_coins(amount: number) {
    let coins = GameStorage.get('coins');
    coins = math.min(coins + amount, 10000);
    GameStorage.set('coins', coins);
    EventBus.send('ADDED_COIN');
}

export function remove_coins(amount: number) {
    let coins = GameStorage.get('coins');
    coins -= amount;
    GameStorage.set('coins', coins);
    EventBus.send('REMOVED_COIN');
}