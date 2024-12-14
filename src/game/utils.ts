/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { Direction } from "../utils/math_utils";
import { parse_time } from "../utils/utils";
import { Position, SwapInfo } from "./core";
import { Level } from "./level";

export function get_current_level() {
    return GameStorage.get('current_level');
}

export function is_last_level() {
    return GameStorage.get('current_level') == (GAME_CONFIG.levels.length - 1);
}

export function get_current_level_config() {
    if (GAME_CONFIG.is_revive)
        return GAME_CONFIG.revive_level;

    const current_level = get_current_level();
    if (current_level < 47)
        return GAME_CONFIG.levels[current_level];

    return generate_random_level();
}

function generate_random_level() {
    const exclude_levels = [3, 10, 17, 24, 31, 38, 46];
    const levels = [];
    for (let i = 0; i < 47; i++) {
        if (!exclude_levels.includes(i))
            levels.push(i);
    }
    const picked_level = levels[math.random(0, levels.length - 1)];
    // const level = GAME_CONFIG.levels[picked_level];
    print(picked_level);
    const random_level = GAME_CONFIG.levels[picked_level]; //json.decode(json.encode(level));
    print(random_level);
    random_level.coins = 0;
    random_level.steps += math.random(-5, 5);
    for (const target of random_level.targets) {
        // FIXME: TargetType enum give cycle dependens with game
        switch (target.type) {
            case 1: // ELEMENT
                target.count += math.random(-5, 5);
                break;
            case 0: // CELL
                target.count -= math.random(0, 5);
                break;
        }
    }

    print(random_level);

    return random_level;
}

export function is_animal_level() {
    return GAME_CONFIG.animal_levels.includes(get_current_level() + 1);
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

    Log.log("ADDED COINS: ", amount);
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
    if (tutorial_data.step == undefined)
        return false;

    const is_from = swap_info.from.x == tutorial_data.step.from.x && swap_info.from.y == tutorial_data.step.from.y;
    const is_to = swap_info.to.x == tutorial_data.step.to.x && swap_info.to.y == tutorial_data.step.to.y;
    const is_fromto = swap_info.to.x == tutorial_data.step.from.x && swap_info.to.y == tutorial_data.step.from.y;
    const is_tofrom = swap_info.from.x == tutorial_data.step.to.x && swap_info.from.y == tutorial_data.step.to.y;
    return (is_from && is_to) || (is_fromto && is_tofrom);
}

export function is_tutorial_click(pos: Position) {
    const current_level = get_current_level();
    const tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1];
    if (tutorial_data.click == undefined)
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

export function delete_mounts() {
    if (!liveupdate)
        return;

    const mounts = liveupdate.get_mounts();
    for (const mount of mounts) {
        if (mount.name.endsWith(".zip")) {
            liveupdate.remove_mount(mount.name);
        }
    }
}

export function get_last_completed_level() {
    let max_level = 0;
    for (let level of GameStorage.get('completed_levels')) {
        if (++level > max_level)
            max_level = level;
    }
    return max_level;
}