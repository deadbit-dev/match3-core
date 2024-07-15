export function add_lifes(amount: number) {
    const life = GameStorage.get('life');
    life.amount = math.min(life.amount + amount, GAME_CONFIG.max_lifes);
    GameStorage.set('life', life);
    EventBus.send('ADDED_LIFE');
}

export function is_max_lifes() {
    const life = GameStorage.get('life');
    return life.amount >= GAME_CONFIG.max_lifes;
}

export function remove_lifes(amount: number) {
    const life = GameStorage.get('life');
    life.amount = math.max(life.amount - amount, GAME_CONFIG.min_lifes);
    GameStorage.set('life', life);
    EventBus.send('REMOVED_LIFE');
}