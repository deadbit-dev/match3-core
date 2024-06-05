export function add_lifes(amount: number) {
    const life = GameStorage.get('life');
    life.amount += amount;
    GameStorage.set('life', life);
    EventBus.send('ADDED_LIFE');
}

export function remove_lifes(amount: number) {
    const life = GameStorage.get('life');
    life.amount -= amount;
    GameStorage.set('life', life);
    EventBus.send('REMOVED_LIFE');
}