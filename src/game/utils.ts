import { Direction } from "../utils/math_utils";
import { parse_time } from "../utils/utils";
import { Position, SwapInfo } from "./core";

export function get_current_level() {
    return GameStorage.get('current_level');
}

export function is_last_level() {
    return GameStorage.get('current_level') == (GAME_CONFIG.levels.length - 1);
}

export function get_current_level_config() {
    return GAME_CONFIG.levels[get_current_level()];
}

export function is_animal_level() {
    return GAME_CONFIG.animal_levels.includes(get_current_level() + 1);
}

export function is_time_level() {
    return (GAME_CONFIG.levels[get_current_level()].time != undefined);
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

export function get_busters() {
    const level_config = GAME_CONFIG.levels[get_current_level()];
    return level_config['busters'];
}

export function get_move_direction(dir: vmath.vector3) {
    const cs45 = 0.7;
    if (dir.y > cs45) return Direction.Up;
    else if (dir.y < -cs45) return Direction.Down;
    else if (dir.x < -cs45) return Direction.Left;
    else if (dir.x > cs45) return Direction.Right;
    else return Direction.None;
}

export function add_lifes(amount: number) {
    const life = GameStorage.get('life');
    life.amount = life.amount + amount;
    GameStorage.set('life', life);
    EventBus.send('ADDED_LIFE');
}

export function is_max_lifes() {
    const life = GameStorage.get('life');
    return life.amount >= GAME_CONFIG.max_lifes;
}

export function remove_lifes(amount: number) {
    const life = GameStorage.get('life');
    life.amount = math.max(0, life.amount - amount);
    GameStorage.set('life', life);
    EventBus.send('REMOVED_LIFE');
}

export function is_enough_coins(amount: number) {
    return GameStorage.get('coins') >= amount;
}

export function add_coins(amount: number) {
    let coins = GameStorage.get('coins');
    coins = math.min(coins + amount, GAME_CONFIG.max_coins);
    GameStorage.set('coins', coins);
    EventBus.send('ADDED_COIN');

    print("ADDED COINS: ", amount);
}

export function remove_coins(amount: number) {
    let coins = GameStorage.get('coins');
    coins -= amount;
    GameStorage.set('coins', coins);
    EventBus.send('REMOVED_COIN');
}

export function is_tutorial() {
    const current_level = get_current_level();
    const is_tutorial_level = GAME_CONFIG.tutorial_levels.includes(current_level + 1);
    const is_not_completed = !GameStorage.get('completed_tutorials').includes(current_level + 1);
    return (is_tutorial_level && is_not_completed);
}

export function is_tutorial_swap(swap_info: SwapInfo) {
    const current_level = get_current_level();
    const tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1];
    if(tutorial_data.step == undefined)
        return false;

    const is_from = swap_info.from.x == tutorial_data.step.from.x && swap_info.from.y == tutorial_data.step.from.y;
    const is_to = swap_info.to.x == tutorial_data.step.to.x && swap_info.to.y == tutorial_data.step.to.y;
    return (is_from && is_to);
}

export function is_tutorial_click(pos: Position) {
    const current_level = get_current_level();
    const tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1];
    if(tutorial_data.click == undefined)
        return false;

    return (tutorial_data.click.x == pos.x && tutorial_data.click.y == pos.y);
}

export function remove_ad(time: number) {
    const current_date = System.now();
    const data = GameStorage.get('noads');
    const delta = math.min(0, data.end_data - current_date);
    data.end_data += current_date + time + delta;
    GameStorage.set('noads', data);
    Log.log(`REMOVE AD FOR: ${parse_time(data.end_data)}`);
}