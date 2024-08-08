import { Direction } from "../utils/math_utils";
import { ItemInfo } from "./match3_core";

export function get_current_level() {
    return GameStorage.get('current_level');
}

export function is_animal_level() {
    return GAME_CONFIG.animal_levels.includes(get_current_level() + 1);
}

export function is_tutorial_level() {
    return GAME_CONFIG.tutorial_levels.includes(get_current_level() + 1);
}

export function get_level_targets() {
    const level_config = GAME_CONFIG.levels[get_current_level()];
    return level_config.targets;
}

export function get_field_width() {
    const level_config = GAME_CONFIG.levels[get_current_level()];
    return level_config['field']['width'];
}

export function get_field_height() {
    const level_config = GAME_CONFIG.levels[get_current_level()];
    return level_config['field']['height'];
}

export function get_field_max_width() {
    const level_config = GAME_CONFIG.levels[get_current_level()];
    return level_config['field']['max_width'];
}

export function get_field_max_height() {
    const level_config = GAME_CONFIG.levels[get_current_level()];
    return level_config['field']['max_height'];
}

export function get_field_offset_border() {
    const level_config = GAME_CONFIG.levels[get_current_level()];
    return level_config['field']['offset_border'];
}

export function get_field_cell_size() {
    const level_config = GAME_CONFIG.levels[get_current_level()];
    return level_config['field']['cell_size'];
}

export function get_move_direction(dir: vmath.vector3) {
    const cs45 = 0.7;
    if (dir.y > cs45) return Direction.Up;
    else if (dir.y < -cs45) return Direction.Down;
    else if (dir.x < -cs45) return Direction.Left;
    else if (dir.x > cs45) return Direction.Right;
    else return Direction.None;
}
export function is_element(item: ItemInfo) {
    return (item.uid[0] == 'E');
}

export function is_cell(item: ItemInfo) {
    return (item.uid[0] == 'C');
}

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