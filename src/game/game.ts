/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as flow from 'ludobits.m.flow';
import { get_field_width, get_field_height, get_current_level_config, get_busters, add_coins, is_tutorial, get_current_level, is_tutorial_swap, is_tutorial_click } from "./utils";
import { Cell, CellDamageInfo, CellInfo, CellState, CellType, CombinationInfo, CombinationType, CoreState, DamageInfo, Element, ElementInfo, ElementState, ElementType, Field, is_available_cell_type_for_move, NotActiveCell, NotDamage, NotFound, NullElement, Position, SwapInfo } from "./core";
import { BusterActivatedMessage, CombinateBustersMessage, CombinateMessage, DiskosphereDamageElementMessage, DynamiteActivatedMessage, HelicopterActionMessage, HelicopterActivatedMessage, HelperMessage, SwapElementsMessage } from "../main/game_config";
import { NameMessage } from "../modules/modules_const";
import { Axis, is_valid_pos } from "../utils/math_utils";
import { lang_data } from "../main/langs";
import { shuffle_array } from "../utils/utils";


export enum CellId {
    Base,
    Grass,
    Flowers,
    Web,
    Box,
    Stone
}

export enum ElementId {
    Dimonde,
    Gold,
    Topaz,
    Ruby,
    Emerald,
    Cheese,
    Cabbage,
    Acorn,
    RareMeat,
    MediumMeat,
    Chicken,
    SunFlower,
    Salad,
    Hay,
    VerticalRocket,
    HorizontalRocket,
    AllAxisRocket,
    Helicopter,
    Dynamite,
    Diskosphere
}

export const RandomElement = Infinity;

export enum TargetType {
    Cell,
    Element
}

export interface Target {
    id: number,
    type: TargetType,
    count: number
}

export interface TargetState extends Target {
    uids: number[]
}

export type TutorialData = {
    [key in number]: {
        cells?: Position[],
        bounds?: SwapInfo,
        step?: SwapInfo,
        click?: Position,
        busters?: string | string[],

        text: {
            data: keyof typeof lang_data,
            pos: vmath.vector3,
        },

        arrow_pos?: vmath.vector3,
        buster_icon?: { icon: string, pos: vmath.vector3 }
    }
};

export type LockInfo = {
    pos: Position,
    cell: Cell,
    element: Element | typeof NullElement,
    is_locked: boolean
}[];

export type UnlockInfo = {
    pos: Position,
    cell: Cell,
    element: Element | typeof NullElement
}[];

export interface Buster {
    name: string,
    counts: number,
    active: boolean,
    block: boolean
}

export interface Busters {
    hammer: Buster,
    spinning: Buster,
    horizontal_rocket: Buster,
    vertical_rocket: Buster
}

export interface GameState extends CoreState {
    randomseed: number,
    targets: TargetState[],
    steps: number,
    remaining_time: number
}

export function Game() {
    const level_config = get_current_level_config();

    const field_width = get_field_width();
    const field_height = get_field_height();

    const busters = get_busters();

    const field = Field(field_width, field_height);

    const spawn_element_chances: { [key in number]: number } = {};

    let get_step_handle: Coroutine;

    let game_item_counter = 0;
    let states: GameState[] = [];
    let is_block_input = false;
    let is_first_step = true;
    let start_game_time = 0;

    let game_timer: hash;
    let helper_timer: hash | null = null;

    let previous_helper_data: HelperMessage | null = null;
    let helper_data: HelperMessage | null = null;

    let is_idle = false;
    let is_win = false;
    let is_win_action = false;

    let first_pass = false;

    function init() {
        Log.log("INIT GAME");

        field.init();

        field.set_callback_is_can_swap(is_can_swap);
        field.set_callback_is_combined_elements(is_combined_elements);
        field.set_callback_on_request_element(on_request_element);
        field.set_callback_on_element_damaged(on_element_damaged);
        field.set_callback_on_cell_damaged(on_cell_damaged);
        field.set_callback_on_near_cells_damaged(on_near_cells_damaged);

        set_busters();

        set_element_chances();
        set_events();
    }

    function set_events() {
        EventBus.on('REQUEST_LOAD_GAME', load);
        EventBus.on('ACTIVATE_BUSTER', on_activate_buster);
        EventBus.on('REVIVE', on_revive);
        EventBus.on('OPENED_DLG', () => { is_block_input = true; });
        EventBus.on('CLOSED_DLG', () => { is_block_input = false; });

        EventBus.on('REQUEST_CLICK', on_click, false);
        EventBus.on('REQUEST_TRY_SWAP_ELEMENTS', on_swap_elements, false);
        EventBus.on('REQUEST_SWAP_ELEMENTS_END', on_swap_elements_end, false);
        EventBus.on('REQUEST_TRY_ACTIVATE_BUSTER_AFTER_SWAP', on_buster_activate_after_swap, false);
        EventBus.on('REQUEST_COMBINED_BUSTERS', on_combined_busters, false);

        EventBus.on('REQUEST_COMBINATE', on_combinate, false);
        EventBus.on('REQUEST_COMBINATION', on_combination, false);
        EventBus.on('REQUEST_COMBINATION_END', on_combination_end, false);

        EventBus.on('REQUEST_FALLING', on_falling, false);
        EventBus.on('REQUEST_FALL_END', on_fall_end, false);

        EventBus.on('REQUEST_DYNAMITE_ACTION', on_dynamite_action, false);

        EventBus.on('REQUEST_ROCKET_END', on_rocket_end, false);

        EventBus.on('REQUEST_DISKOSPHERE_DAMAGE_ELEMENT_END', on_diskosphere_damage_element_end, false);

        EventBus.on('DISKOSPHERE_ACTIVATED_END', on_diskosphere_activated_end, false);

        EventBus.on('REQUEST_HELICOPTER_ACTION', on_helicopter_action, false);
        EventBus.on('REQUEST_HELICOPTER_END', on_helicopter_end, false);

        EventBus.on('SHUFFLE_END', on_shuffle_end, false);

        EventBus.on('REQUEST_IDLE', on_idle, false);

        EventBus.on('REQUEST_RELOAD_FIELD', () => {
            update_core_state();
            EventBus.send('RESPONSE_RELOAD_FIELD', copy_state());
        }, false);

        EventBus.on('MAKED_ELEMENT', on_maked_element, false);

        EventBus.on('REQUEST_REWIND', on_rewind, false);
    }

    function set_element_chances() {
        for (const [key] of Object.entries(GAME_CONFIG.element_view)) {
            const id = tonumber(key);
            if (id != undefined) {
                const is_base_element = GAME_CONFIG.base_elements.includes(id);
                const is_additional_element = id == level_config.additional_element;
                if (is_base_element || is_additional_element) spawn_element_chances[id] = 10;
                else spawn_element_chances[id] = 0;

                const is_excluded_element = id == level_config.exclude_element;
                if (is_excluded_element) spawn_element_chances[id] = 0;
            }
        }
    }

    function load() {
        Log.log("LOAD GAME");

        if (GAME_CONFIG.is_revive) revive();
        else {
            new_state();
            try_load_field();
            update_core_state();
            set_targets(level_config.targets);
            set_steps(level_config.steps);
            if(level_config.time != undefined) {
                get_state().remaining_time = level_config.time;
            }
            set_random();
        }

        EventBus.send('RESPONSE_LOAD_GAME', copy_state());

        if (!GAME_CONFIG.is_revive && is_tutorial()) {
            set_tutorial();
        }

        GAME_CONFIG.is_revive = false;
        game_timer = timer.delay(1, true, on_tick);

        on_idle();

        Metrica.report('data', {
            ['level_' + tostring(get_current_level() + 1)]: { type: 'start' }
        });
    }

    function set_tutorial() {
        const tutorial_data = GAME_CONFIG.tutorials_data[get_current_level() + 1];
        const except_cells = tutorial_data.cells != undefined ? tutorial_data.cells : [];
        const bounds = tutorial_data.bounds != undefined ? tutorial_data.bounds : { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
        const lock_info = [] as LockInfo;
        for (let y = bounds.from.y; y < bounds.to.y; y++) {
            for (let x = bounds.from.x; x < bounds.to.x; x++) {
                const cell = field.get_cell({ x, y });
                if (cell != NotActiveCell) {
                    const element = field.get_element({ x, y });
                    lock_info.push({
                        pos: { x, y },
                        cell,
                        element,
                        is_locked: !except_cells.find((cell) => (cell.x == x) && (cell.y == y))
                    });
                }
            }
        }

        if (tutorial_data.busters != undefined) {
            busters.spinning.block = true;
            busters.hammer.block = true;
            busters.horizontal_rocket.block = true;
            busters.vertical_rocket.block = true;

            if (Array.isArray(tutorial_data.busters)) {
                for (const buster of tutorial_data.busters) {
                    unlock_buster(buster);
                }
            } else unlock_buster(tutorial_data.busters);
        }

        if (tutorial_data.step != undefined) {
            const combined_element = field.get_element(tutorial_data.step.from);
            const elements = [];
            for (const info of lock_info) {
                if (!info.is_locked && info.element != NullElement)
                    elements.push(info.element);
            }
            if (combined_element != NullElement) {
                set_helper({
                    step: tutorial_data.step,
                    combined_element,
                    elements
                });
            }
        }

        EventBus.send('SET_TUTORIAL', lock_info);
    }

    function unlock_buster(name: string) {
        switch (name) {
            case "hammer": busters.hammer.block = false; break;
            case "spinning": busters.spinning.block = false; break;
            case "horizontal_rocket": busters.horizontal_rocket.block = false; break;
            case "vertical_rocket": busters.vertical_rocket.block = false; break;
        }
    }

    function is_gameover() {
        return level_config.time != undefined ? is_timeout() : !is_have_steps();
    }

    function on_tick() {
        if (level_config.time != undefined && !is_win) update_timer();

        if (is_level_completed()) {
            is_block_input = true;
            if (is_idle)
                return on_win();
        }

        if (is_gameover()) {
            is_block_input = true;
            if (is_idle)
                return on_gameover();
        }
    }

    function on_idle() {
        if (is_idle) {
            Log.log("RETURN");
            return;
        }

        Log.log("TRY IDLE");

        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const pos = { x, y };
                const cell = field.get_cell(pos);
                const element = field.get_element(pos);
                if (element != NullElement && element.state != ElementState.Idle || cell != NotActiveCell && cell.state != CellState.Idle)
                    return;
            }
        }

        if (is_win_action)
            return;

        Log.log("IDLE");

        is_idle = true;

        if (is_level_completed()) {
            return on_win();
        }

        if (is_gameover()) {
            return on_gameover();
        }

        if (!has_step()) {
            stop_helper();
            shuffle();
            return;
        }

        update_core_state();

        new_state();
        update_core_state();

        const last_state = get_state(1);
        set_targets(last_state.targets);
        set_steps(last_state.steps);
        if(level_config.time != undefined)
            get_state().remaining_time = last_state.remaining_time;
        set_random();

        if (!is_tutorial() && helper_timer == null) {
            set_helper_data();
            helper_timer = timer.delay(5, true, () => {
                reset_helper();
                set_helper();
            });
        }
    }

    function on_rewind() {
        if (!is_idle)
            return;

        is_idle = false;

        stop_helper();
        try_rewind();

        on_idle();
    }

    function try_rewind(): boolean {
        if (states.length < 3)
            return false;

        Log.log("REWIND: ", states.length);

        states.pop(); // new state
        states.pop(); // current state

        let previous_state = get_state();
        if (previous_state == undefined) return false;

        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = previous_state.cells[y][x];
                if (cell != NotActiveCell) {
                    cell.uid = generate_uid();
                    field.set_cell({ x, y }, cell);
                } else field.set_cell({ x, y }, NotActiveCell);

                const element = previous_state.elements[y][x];
                if (element != NullElement) {
                    element.uid = generate_uid();
                    field.set_element({ x, y }, element);
                } else field.set_element({ x, y }, NullElement);
            }
        }

        update_core_state();
        set_random(previous_state.randomseed);

        EventBus.send('RESPONSE_REWIND', previous_state);
        EventBus.send('UPDATED_STEP_COUNTER', previous_state.steps);

        return true;
    }

    function set_helper(message?: HelperMessage) {
        Log.log("SET_HELPER");

        if (message != undefined)
            helper_data = message;

        if (helper_data != null) {
            EventBus.send('SET_HELPER', helper_data);

            set_helper_data();
        }
    }

    function reset_helper() {
        Log.log("RESET_HELPER");
        if (helper_timer == null)
            return;

        if (previous_helper_data == null)
            return;

        EventBus.send('RESET_HELPER', previous_helper_data);
        previous_helper_data = null;
    }

    function stop_helper() {
        Log.log("STOP_HELPER");

        if(get_step_handle != null)
            flow.stop(get_step_handle);

        if (!is_tutorial()) {
            if (helper_timer == null)
                return;

            timer.cancel(helper_timer);
            helper_timer = null;
        }

        if (previous_helper_data == null) {
            helper_data = null;
            return;
        }

        EventBus.send('STOP_HELPER', previous_helper_data);
        previous_helper_data = null;
        helper_data = null;
    }

    function update_timer() {
        if (start_game_time == 0) {
            return;
        }

        const dt = System.now() - start_game_time;
        const remaining_time = math.max(0, level_config.time - dt);
        get_state().remaining_time = remaining_time;
        EventBus.send('GAME_TIMER', remaining_time);
    }

    function is_level_completed() {
        for (const target of get_state().targets) {
            if (target.uids.length < target.count) return false;
        }

        return true;
    }

    function is_timeout() {
        return get_state().remaining_time == 0;
    }

    function is_have_steps() {
        return get_state().steps > 0;
    }

    function on_win() {
        if (!is_win) {
            is_win = true;
            const completed_levels = GameStorage.get('completed_levels');
            const current_level = GameStorage.get('current_level');
            if (!completed_levels.includes(current_level)) {
                completed_levels.push(current_level);
                GameStorage.set('completed_levels', completed_levels);

                first_pass = true;

                const last_state = get_state();
                add_coins(level_config.coins);
                if (level_config.coins > 0) {
                    if (last_state.steps != undefined) add_coins(math.min(last_state.steps, GAME_CONFIG.max_coins_for_reward));
                    if (last_state.remaining_time != undefined) add_coins(math.min(math.floor(last_state.remaining_time), GAME_CONFIG.max_coins_for_reward));
                }

                Metrica.report('data', {
                    ['level_' + tostring(get_current_level() + 1)]: {
                        type: 'end',
                        time: last_state.remaining_time != undefined ? math.floor(last_state.remaining_time) : undefined,
                        steps: last_state.steps
                    }
                });
            }
            
            EventBus.send('ON_WIN');
            win_action();
            return;
        }

        timer.cancel(game_timer);

        update_core_state();

        EventBus.send('ON_WIN_END', {state: copy_state(), with_reward: first_pass});
    }

    function win_action() {
        is_idle = false;

        is_win_action = true;

        let counts = 0;
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const pos = { x, y };
                const cell = field.get_cell(pos);
                const element = field.get_element(pos);

                if (cell != NotActiveCell) {
                    timer.delay(0.05 * counts++, false, () => {
                        if (is_buster(pos)) {
                            if (element != NullElement && element.id == ElementId.Helicopter) {
                                EventBus.send('FORCE_REMOVE_ELEMENT', element.uid);

                                make_element(pos, ElementId.Dynamite);

                                return try_activate_dynamite(pos, true);
                            }
                            return try_activate_buster_element(pos);
                        }

                        for (let i = 0; i < 3; i++) {
                            const damage_info = field.try_damage(pos, false, false);
                            if (damage_info == NotDamage)
                                return;

                            EventBus.send("RESPONSE_HAMMER_DAMAGE", damage_info);
                        }
                    });
                }
            }
        }

        timer.delay(0.05 * counts * 1.5, false, () => {
            is_win_action = false;
            on_idle();
        });
    }

    function on_gameover() {
        if(game_timer != null)
            timer.cancel(game_timer);

        update_core_state();

        GAME_CONFIG.revive_states = json.decode(json.encode(states));

        EventBus.send('ON_GAME_OVER', copy_state());

        Metrica.report('data', {
            ['level_' + tostring(get_current_level() + 1)]: { type: 'fail' }
        });
    }

    function on_revive(data: {steps?: number, time?: number}) {
        if(data.steps != undefined) GAME_CONFIG.revive_states[GAME_CONFIG.revive_states.length - 1].steps += data.steps;
        if(data.time != undefined) GAME_CONFIG.revive_states[GAME_CONFIG.revive_states.length - 1].remaining_time += data.time;
        GAME_CONFIG.is_revive = true;
        GAME_CONFIG.is_restart = true;
        Scene.restart();
    }

    function shuffle() {
        Log.log("SHUFFLE");

        is_block_input = true;

        function on_end() {
            update_core_state();
            EventBus.send('SHUFFLE_ACTION', copy_state());

            if (helper_timer == null) {
                set_helper_data();
                helper_timer = timer.delay(5, true, () => {
                    reset_helper();
                    set_helper();
                });
            }
        }

        function on_error() {
            update_core_state();
            EventBus.send('SHUFFLE_ACTION', copy_state());
            timer.delay(0.5, false, () => on_gameover());
        }

        EventBus.send('SHUFFLE_START');

        timer.delay(1, false, () => {
            shuffle_field(on_end, on_error);
        });
    }

    function on_shuffle_end() {
        is_block_input = false;
    }

    function shuffle_field(on_end: () => void, on_error: () => void) {
        return flow.start(() => {
            Log.log("SHUFFLE FIELD");

            let major_attempt = 0;

            do {
                let attempt = 0;

                do {
                    Log.log(`SHUFFLE - ATTEMPT: ${attempt}`);

                    // collecting elements for shuffling
                    const positions = [];
                    const elements = [];
                    for (let y = 0; y < field_height; y++) {
                        for (let x = 0; x < field_width; x++) {
                            const cell = field.get_cell({ x, y });
                            if (cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                                const element = field.get_element({ x, y });
                                if (element != NullElement) {
                                    positions.push({ x, y });
                                    elements.push(element);
                                    field.set_element({ x, y }, NullElement);
                                }
                            }
                        }
                    }

                    shuffle_array(elements);

                    let counter = 0;
                    const optimize_count = 5;

                    // filling the field available elements by got positions
                    for (const position of positions) {
                        let element_assigned = false;

                        if (counter >= optimize_count) {
                            counter = 0;
                            flow.frames(1);
                        }

                        for (let i = elements.length - 1; i >= 0; i--) {
                            const element = elements[i];
                            field.set_element(position, element);
                            if (field.search_combination(position) == NotFound) {
                                elements.splice(i, 1);
                                element_assigned = true;
                                Log.log(`ASSIGNED FROM AVAILABLE IN POS: ${position.x}, ${position.y}`);
                                break;
                            }
                        }

                        // if not found right element from availables
                        if (!element_assigned) {
                            // maybe make this more randomize
                            for (const element_id of GAME_CONFIG.base_elements) {
                                if (elements.find((element) => element.id == element_id) == undefined) {
                                    make_element(position, element_id);
                                    if (field.search_combination(position) == NotFound) {
                                        Log.log(`ASSIGNED NEW ELEMENT IN POS: ${position.x}, ${position.y}`);
                                        element_assigned = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (!element_assigned) {
                            Log.log(`SHUFFLE - NOT FOUND RIGHT ELEMENT, SET EMPTY IN POS: ${position.x}, ${position.y}`);
                            field.set_element(position, NullElement);
                        }

                        counter++;
                    }

                    if (has_step()) {
                        for (const element of elements) {
                            EventBus.send('FORCE_REMOVE_ELEMENT', element.uid);
                        }
                        return on_end();
                    }
                } while (++attempt < GAME_CONFIG.shuffle_max_attempt);

                Log.log("SHUFFLE - FILLED EMPTY CELLS");
                for (let y = field_height - 1; y > 0; y--) {
                    for (let x = 0; x < field_width; x++) {
                        const pos = { x, y };
                        const cell = field.get_cell(pos);
                        if (cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                            const element = field.get_element(pos);
                            if (element == NullElement) {
                                const available_elements = json.decode(json.encode(GAME_CONFIG.base_elements));
                                shuffle_array(available_elements);
                                for (const element_id of available_elements) {
                                    make_element(pos, element_id);
                                    if (field.search_combination(pos) == NotFound)
                                        break;
                                }
                            }
                        }
                    }

                    flow.frames(1);
                }

                if (has_step()) return on_end();
            } while (++major_attempt < GAME_CONFIG.shuffle_max_attempt);

            // TODO: make a step
            Log.log("SHUFFLE FAILED");
            on_error();

        }, { parallel: true });
    }

    function try_load_field() {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                load_cell({ x, y });
                load_element({ x, y });
            }
        }

        if (has_combination()) {
            field.init();
            try_load_field();
            return;
        }
    }

    function has_combination() {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const result = field.search_combination({ x, y });
                if (result != NotFound)
                    return true;
            }
        }

        return false;
    }

    function has_step() {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = field.get_cell({ x, y });
                if (cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                    if (is_valid_pos(x + 1, y, field_width, field_height)) {
                        const cell = field.get_cell({ x: x + 1, y });
                        if (cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                            // swap element to right
                            field.swap_elements({ x, y }, { x: x + 1, y });

                            // chech for combinations
                            const resultA = field.search_combination({ x, y });
                            const resultB = field.search_combination({ x: x + 1, y });

                            // swap element back
                            field.swap_elements({ x, y }, { x: x + 1, y });

                            if (resultA != NotFound || resultB != NotFound)
                                return true;
                        }
                    }

                    if (is_valid_pos(x, y + 1, field_width, field_height)) {
                        const cell = field.get_cell({ x, y: y + 1 });
                        if (cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                            // swap element down
                            field.swap_elements({ x, y }, { x, y: y + 1 });

                            // check for combination
                            const resultC = field.search_combination({ x, y });
                            const resultD = field.search_combination({ x, y: y + 1 });

                            // swap element back
                            field.swap_elements({ x, y }, { x, y: y + 1 });

                            if (resultC != NotFound || resultD != NotFound)
                                return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    function set_helper_data() {
        previous_helper_data = helper_data;
        helper_data = null;
        get_step_handle = get_step((info) => {
            if(info == NotFound) {
                return;
            }
            
            const combined_element = field.get_element(info.step.from);
            const elements = [];
            for (const pos of info.combination.elementsInfo) {
                const element = field.get_element(pos);
                if (element != NullElement)
                    elements.push(element);
            }

            if (combined_element != NullElement) {
                helper_data = { step: info.step, combined_element, elements };
            }
        });
    }

    function get_step(on_end: (step: {step: SwapInfo, combination: CombinationInfo} | NotFound) => void) {
        return flow.start(() => {
            const steps = [];

            for (let y = 0; y < field_height; y++) {
                for (let x = 0; x < field_width; x++) {
                    const cell = field.get_cell({ x, y });
                    if (cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                        if (is_valid_pos(x + 1, y, field_width, field_height)) {
                            const cell = field.get_cell({ x: x + 1, y });
                            if (cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                                // swap element to right
                                field.swap_elements({ x, y }, { x: x + 1, y });

                                // chech for combinations
                                const resultA = field.search_combination({ x, y });
                                const resultB = field.search_combination({ x: x + 1, y });

                                // swap element back
                                field.swap_elements({ x, y }, { x: x + 1, y });

                                if (resultA != NotFound) {
                                    steps.push({
                                        step: { from: { x: x + 1, y }, to: { x, y } },
                                        combination: resultA
                                    });
                                }

                                if (resultB != NotFound) {
                                    steps.push({
                                        step: { from: { x, y }, to: { x: x + 1, y } },
                                        combination: resultB
                                    });
                                }
                            }
                        }

                        flow.frames(1);

                        if (is_valid_pos(x, y + 1, field_width, field_height)) {
                            const cell = field.get_cell({ x, y: y + 1 });
                            if (cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                                // swap element down
                                field.swap_elements({ x, y }, { x, y: y + 1 });

                                // check for combination
                                const resultC = field.search_combination({ x, y });
                                const resultD = field.search_combination({ x, y: y + 1 });

                                // swap element back
                                field.swap_elements({ x, y }, { x, y: y + 1 });

                                if (resultC != NotFound) {
                                    steps.push({
                                        step: { from: { x, y: y + 1 }, to: { x, y } },
                                        combination: resultC
                                    });
                                }

                                if (resultD != NotFound) {
                                    steps.push({
                                        step: { from: { x, y }, to: { x, y: y + 1 } },
                                        combination: resultD
                                    });
                                }
                            }
                        }
                    }
                }
            }

            if (steps.length == 0) on_end(NotFound);
            else on_end(steps[math.random(0, steps.length - 1)]);
        }, {parallel: true});
    }

    function revive() {
        states = json.decode(json.encode(GAME_CONFIG.revive_states));
        const last_state = get_state();
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = last_state.cells[y][x];
                if (cell != NotActiveCell) {
                    cell.uid = generate_uid();
                    field.set_cell({ x, y }, cell);
                } else field.set_cell({ x, y }, NotActiveCell);

                const element = last_state.elements[y][x];
                if (element != NullElement) {
                    element.uid = generate_uid();
                    field.set_element({ x, y }, element);
                } else field.set_element({ x, y }, NullElement);
            }
        }

        if(level_config.time != undefined) {
            timer.delay(0, false, () => {EventBus.send('GAME_TIMER', last_state.remaining_time);});
        }

        if (!has_step())
            shuffle();
    }

    function load_cell(pos: Position) {
        const cell_config = level_config['field']['cells'][pos.y][pos.x];
        if (Array.isArray(cell_config)) {
            const cells = json.decode(json.encode(cell_config)) as CellId[];
            const cell_id = cells.pop();
            if (cell_id != undefined) make_cell(pos, cell_id, cells);
        } else make_cell(pos, cell_config as CellId, []);
    }

    function load_element(pos: Position) {
        const element = level_config['field']['elements'][pos.y][pos.x];
        make_element(pos, (element == RandomElement) ? get_random_element_id() : element);
    }

    function set_timer() {
        if (level_config.time == undefined) return;
        start_game_time = (System.now() - level_config.time) + get_state().remaining_time;
    }

    function set_targets(targets: TargetState[]) {
        const last_state = get_state();
        last_state.targets = json.decode(json.encode(targets));
    }

    function set_steps(steps = 0) {
        if (level_config.steps == undefined) return;

        const last_state = get_state();
        last_state.steps = steps;
    }

    function set_random(seed?: number) {
        const randomseed = seed != undefined ? seed : os.time();
        math.randomseed(randomseed);
        const last_state = get_state();
        last_state.randomseed = randomseed;
    }

    function get_state(offset = 0) {
        assert(states.length - (1 + offset) >= 0);
        return states[states.length - (1 + offset)];
    }

    function new_state() {
        states.push({} as GameState);
    }

    function update_core_state() {
        const last_state = get_state();
        const field_state = field.save_state();
        last_state.cells = field_state.cells;
        last_state.elements = field_state.elements;

        return last_state;
    }

    function copy_state(offset = 0) {
        const from_state = get_state(offset);
        const to_state = json.decode(json.encode(from_state)) as GameState;
        return to_state;
    }

    function generate_uid() {
        return game_item_counter++;
    }

    function make_cell(pos: Position, id: CellId | typeof NotActiveCell, under_cells: CellId[]): Cell | typeof NotActiveCell {
        if (id == NotActiveCell) return NotActiveCell;

        const cell = {
            id: id,
            uid: generate_uid(),
            type: generate_cell_type_by_id(id),
            strength: GAME_CONFIG.cell_strength[id],
            under_cells: under_cells,
            state: CellState.Idle
        };

        field.set_cell(pos, cell);

        return cell;
    }

    function make_element(pos: Position, id: ElementId | typeof NullElement): Element | typeof NullElement {
        if (id == NullElement) return NullElement;

        const element: Element = {
            id: id,
            uid: generate_uid(),
            type: generate_element_type_by_id(id),
            state: ElementState.Idle
        };

        field.set_element(pos, element);

        return element;
    }

    function generate_cell_type_by_id(id: CellId): number {
        let type = 0;
        if (GAME_CONFIG.damage_cells.includes(id))
            type = bit.bor(type, CellType.ActionLocked);
        if (GAME_CONFIG.near_damage_cells.includes(id))
            type = bit.bor(type, CellType.ActionLockedNear);
        if (GAME_CONFIG.disabled_cells.includes(id))
            type = bit.bor(type, CellType.Disabled);
        if (GAME_CONFIG.not_moved_cells.includes(id))
            type = bit.bor(type, CellType.NotMoved);
        if (type == 0) type = CellType.Base;
        return type;
    }

    function generate_element_type_by_id(id: ElementId): number {
        return GAME_CONFIG.buster_elements.includes(id) ? bit.bor(ElementType.Clickable, ElementType.Movable) : ElementType.Movable;
    }

    function get_random_element_id(): ElementId | typeof NullElement {
        let sum = 0;
        for (const [key] of Object.entries(GAME_CONFIG.element_view)) {
            const id = tonumber(key);
            if (id != undefined) {
                sum += spawn_element_chances[id];
            }
        }

        const bins: number[] = [];
        for (const [key] of Object.entries(GAME_CONFIG.element_view)) {
            const id = tonumber(key);
            if (id != undefined) {
                const normalized_value = spawn_element_chances[id] / sum;
                if (bins.length == 0) bins.push(normalized_value);
                else bins.push(normalized_value + bins[bins.length - 1]);
            }
        }

        const rand = math.random();

        for (let [index, value] of bins.entries()) {
            if (value >= rand) {
                for (const [key, _] of Object.entries(GAME_CONFIG.element_view))
                    if (index-- == 0) return tonumber(key) as ElementId;
            }
        }

        return NullElement;
    }

    function is_buster(pos: Position) {
        const cell = field.get_cell(pos);
        if (cell == NotActiveCell || !field.is_available_cell_type_for_click(cell))
            return false;

        const element = field.get_element(pos);
        if (element == NullElement || !field.is_clickable_element(element))
            return false;

        return true;
    }

    function is_can_swap(from: Position, to: Position) {
        if (field.is_can_swap_base(from, to)) return true;
        return (is_buster(from) || is_buster(to));
    }

    function is_combined_elements(e1: Element, e2: Element) {
        if (field.is_clickable_element(e1) || field.is_clickable_element(e2))
            return false;

        return field.is_combined_elements_base(e1, e2);
    }

    function on_request_element(pos: Position): Element | typeof NullElement {
        if (is_win)
            return NullElement;
        return make_element(pos, get_random_element_id());
    }

    function on_element_damaged(pos: Position, element: Element) {
        const targets = get_state().targets;
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            if (target.type == TargetType.Element && target.id == element.id) {
                target.uids.push(element.uid);
                EventBus.send('UPDATED_TARGET', { idx: i, target });
            }
        }

        if (is_level_completed())
            is_block_input = true;
    }

    function on_cell_damaged(cell: Cell): CellDamageInfo | NotDamage {
        const cell_damage_info = field.on_cell_damaged_base(cell);
        if (cell_damage_info == NotDamage)
            return NotDamage;

        if (field.is_type_cell(cell, CellType.ActionLocked) || field.is_type_cell(cell, CellType.ActionLockedNear)) {
            if (cell_damage_info.cell.strength != undefined && cell_damage_info.cell.strength == 0) {
                const pos = field.get_cell_pos(cell);
                make_cell(pos, CellId.Base, []);
                update_cell_targets(cell_damage_info.cell);
            }
        }

        if (is_level_completed())
            is_block_input = true;

        return cell_damage_info;
    }

    function on_near_cells_damaged(cells: Cell[]): CellDamageInfo[] {
        const damaged_cells_info = field.on_near_cells_damaged_base(cells);
        for (const damaged_cell_info of damaged_cells_info) {
            if (field.is_type_cell(damaged_cell_info.cell, CellType.ActionLockedNear)) {
                if (damaged_cell_info.cell.strength != undefined && damaged_cell_info.cell.strength == 0) {
                    const pos = field.get_cell_pos(damaged_cell_info.cell);
                    make_cell(pos, CellId.Base, []);
                    update_cell_targets(damaged_cell_info.cell);
                }
            }
        }

        return damaged_cells_info;
    }

    function update_cell_targets(cell: Cell) {
        const targets = get_state().targets;
        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            if (target.type == TargetType.Cell && target.id == cell.id) {
                target.uids.push(cell.uid);
                EventBus.send('UPDATED_TARGET', { idx: i, target });
            }
        }
    }

    function set_busters() {
        if (!GameStorage.get('spinning_opened') && level_config.busters.spinning.counts != 0) GameStorage.set('spinning_opened', true);
        if (!GameStorage.get('hammer_opened') && level_config.busters.hammer.counts != 0) GameStorage.set('hammer_opened', true);
        if (!GameStorage.get('horizontal_rocket_opened') && level_config.busters.horizontal_rocket.counts != 0) GameStorage.set('horizontal_rocket_opened', true);
        if (!GameStorage.get('vertical_rocket_opened') && level_config.busters.vertical_rocket.counts != 0) GameStorage.set('vertical_rocket_opened', true);

        const spinning_counts = tonumber(level_config.busters.spinning.counts);
        if (GameStorage.get('spinning_counts') <= 0 && spinning_counts != undefined) GameStorage.set('spinning_counts', spinning_counts);

        const hammer_counts = tonumber(level_config.busters.hammer.counts);
        if (GameStorage.get('hammer_counts') <= 0 && hammer_counts != undefined) GameStorage.set('hammer_counts', hammer_counts);

        const horizontal_rocket_counts = tonumber(level_config.busters.horizontal_rocket.counts);
        if (GameStorage.get('horizontal_rocket_counts') <= 0 && horizontal_rocket_counts != undefined) GameStorage.set('horizontal_rocket_counts', horizontal_rocket_counts);

        const vertical_rocket_counts = tonumber(level_config.busters.vertical_rocket.counts);
        if (GameStorage.get('vertical_rocket_counts') <= 0 && vertical_rocket_counts != undefined) GameStorage.set('vertical_rocket_counts', vertical_rocket_counts);
    }

    function on_activate_buster(message: NameMessage) {
        if (is_block_input) return;

        switch (message.name) {
            case 'SPINNING': on_activate_spinning(); break;
            case 'HAMMER': on_activate_hammer(); break;
            case 'HORIZONTAL_ROCKET': on_activate_horizontal_rocket(); break;
            case 'VERTICAL_ROCKET': on_activate_vertical_rocket(); break;
        }
    }

    function on_activate_spinning() {
        if (busters.spinning.block) return;
        if (GameStorage.get('spinning_counts') <= 0 || !is_idle) return;

        GameStorage.set('spinning_counts', GameStorage.get('spinning_counts') - 1);

        if (is_tutorial())
            complete_tutorial();

        stop_helper();
        shuffle();

        Metrica.report('data', { ['use_' + tostring(get_current_level() + 1)]: { id: 'spinning' } });

        busters.hammer.active = false;
        busters.horizontal_rocket.active = false;
        busters.vertical_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');
    }

    function on_activate_hammer() {
        if (busters.hammer.block) return;
        if (GameStorage.get('hammer_counts') <= 0) return;

        busters.hammer.active = !busters.hammer.active;

        busters.spinning.active = false;
        busters.horizontal_rocket.active = false;
        busters.vertical_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');

        // if(is_tutorial())
        //     complete_tutorial();
    }

    function on_activate_horizontal_rocket() {
        if (busters.horizontal_rocket.block) return;
        if (GameStorage.get('horizontal_rocket_counts') <= 0) return;

        busters.horizontal_rocket.active = !busters.horizontal_rocket.active;

        busters.hammer.active = false;
        busters.spinning.active = false;
        busters.vertical_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');

        // if(is_tutorial())
        //     complete_tutorial();
    }

    function on_activate_vertical_rocket() {
        if (busters.vertical_rocket.block) return;
        if (GameStorage.get('vertical_rocket_counts') <= 0) return;

        busters.vertical_rocket.active = !busters.vertical_rocket.active;

        busters.hammer.active = false;
        busters.spinning.active = false;
        busters.horizontal_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');

        // if(is_tutorial())
        //     complete_tutorial();
    }


    function on_click(pos: Position) {
        if (is_block_input || (is_tutorial() && !is_tutorial_click(pos))) return;

        if (is_tutorial()) {
            const current_level = get_current_level();
            const tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1];
            if (tutorial_data.busters != undefined) {
                if (!Array.isArray(tutorial_data.busters))
                    tutorial_data.busters = [tutorial_data.busters];
                for (const buster of tutorial_data.busters) {
                    if (buster == 'hammer' && !busters.hammer.active)
                        return;
                    if (buster == 'horizontal_rocket' && !busters.horizontal_rocket.active && !busters.vertical_rocket.active)
                        return;
                }
            }
        }

        if (is_tutorial())
            complete_tutorial();

        stop_helper();

        if (busters.hammer.active) {
            Metrica.report('data', { ['use_' + tostring(get_current_level() + 1)]: { id: 'hammer' } });
            try_hammer_damage(pos);
            is_idle = false;
            return;
        }

        if (busters.horizontal_rocket.active) {
            Metrica.report('data', { ['use_' + tostring(get_current_level() + 1)]: { id: 'horizontal_rocket' } });
            try_horizontal_damage(pos);
            is_idle = false;
            return;
        }

        if (busters.vertical_rocket.active) {
            Metrica.report('data', { ['use_' + tostring(get_current_level() + 1)]: { id: 'vertical_rocket' } });
            try_vertical_damage(pos);
            is_idle = false;
            return;
        }

        if (field.try_click(pos)) {
            if (try_activate_buster_element(pos)) {
                is_idle = false;

                if (level_config.steps != undefined) {
                    const state = get_state();
                    state.steps--;
                    EventBus.send('UPDATED_STEP_COUNTER', state.steps);
                }

                if (is_gameover())
                    is_block_input = true;
                
                return;
            }
        }

        is_idle = false;
        on_idle();
    }

    function try_hammer_damage(pos: Position) {
        if (is_buster(pos)) return try_activate_buster_element(pos);

        const damage_info = field.try_damage(pos, false, true);
        if (damage_info == NotDamage)
            return;

        EventBus.send("RESPONSE_HAMMER_DAMAGE", damage_info);

        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') - 1);
        busters.hammer.active = false;

        EventBus.send('UPDATED_BUTTONS');
    }

    function try_horizontal_damage(pos: Position) {
        const damages = [];
        for (let x = 0; x < field_width; x++) {
            if (is_buster({ x, y: pos.y })) try_activate_buster_element({ x, y: pos.y });
            else {
                const damage_info = field.try_damage({ x, y: pos.y });
                if (damage_info != NotDamage)
                    damages.push(damage_info);
            }
        }

        EventBus.send("RESPONSE_ACTIVATED_ROCKET", { pos, uid: -1, damages, axis: Axis.Horizontal });

        GameStorage.set('horizontal_rocket_counts', GameStorage.get('horizontal_rocket_counts') - 1);
        busters.horizontal_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');
    }

    function try_vertical_damage(pos: Position) {
        const damages = [];
        for (let y = 0; y < field_height; y++) {
            if (is_buster({ x: pos.x, y })) try_activate_buster_element({ x: pos.x, y });
            else {
                const damage_info = field.try_damage({ x: pos.x, y });
                if (damage_info != NotDamage)
                    damages.push(damage_info);
            }
        }

        EventBus.send("RESPONSE_ACTIVATED_ROCKET", { pos, uid: -1, damages, axis: Axis.Vertical });

        GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') - 1);
        busters.vertical_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');
    }

    function try_activate_buster_element(pos: Position) {
        if (field.is_pos_empty(pos)) return false;

        if (try_activate_dynamite(pos)) return true;
        if (try_activate_rocket(pos)) return true;
        if (try_activate_diskosphere(pos)) return true;
        if (try_activate_helicopter(pos)) return true;

        return false;
    }

    function damage_element_by_mask(pos: Position, mask: number[][], is_near_activation = false): DamageInfo[] {
        const damages = [] as DamageInfo[];

        for (let i = pos.y - (mask.length - 1) / 2; i <= pos.y + (mask.length - 1) / 2; i++) {
            for (let j = pos.x - (mask[0].length - 1) / 2; j <= pos.x + (mask[0].length - 1) / 2; j++) {
                if (mask[i - (pos.y - (mask.length - 1) / 2)][j - (pos.x - (mask[0].length - 1) / 2)] == 1) {
                    if (is_valid_pos(j, i, field_width, field_height)) {
                        const cell = field.get_cell({ x: j, y: i });
                        const element = field.get_element({ x: j, y: i });
                        if (cell != NotActiveCell && cell.state == CellState.Idle && ((element != NullElement && element.state == ElementState.Idle) || element == NullElement)) {
                            if (is_buster({ x: j, y: i })) try_activate_buster_element({ x: j, y: i });
                            else {
                                const damage_info = field.try_damage({ x: j, y: i }, is_near_activation);
                                if (damage_info != NotDamage)
                                    damages.push(damage_info);
                            }
                        }
                    }
                }
            }
        }

        return damages;
    }

    function try_activate_dynamite(pos: Position, big_range = false) {
        const dynamite = field.get_element(pos);
        if (dynamite == NullElement || dynamite.id != ElementId.Dynamite)
            return false;

        field.set_element_state(pos, ElementState.Busy);

        EventBus.send('RESPONSE_DYNAMITE_ACTIVATED', { pos, uid: dynamite.uid, damages: [], big_range });

        return true;
    }

    function on_dynamite_action(message: DynamiteActivatedMessage) {
        const damage_mask = [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1]
        ];

        const big_damage_mask = [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ];

        // сначала удаляем бустер чтоб его потом уже нельзя было активровать повтороно и попасть в бесконечный цикл
        const damage = field.try_damage(message.pos, false, false, true);
        const damages = damage != NotDamage ? [damage] : [];
        const range_damages = damage_element_by_mask(message.pos, message.big_range ? big_damage_mask : damage_mask);

        for (const damage_info of range_damages) {
            if (damage_info != NotDamage)
                damages.push(damage_info);
        }

        EventBus.send('RESPONSE_DYNAMITE_ACTION', { pos: message.pos, uid: message.uid, damages, big_range: message.big_range });
    }

    function try_activate_rocket(pos: Position, all_axis = false) {
        const rocket = field.get_element(pos);
        if (rocket == NullElement || !GAME_CONFIG.rockets.includes(rocket.id))
            return false;

        const damage = field.try_damage(pos, false, false, true);
        const damages = damage != NotDamage ? [damage] : [];

        const busters = [];
        if (rocket.id == ElementId.VerticalRocket || rocket.id == ElementId.AllAxisRocket || all_axis) {
            for (let y = 0; y < field_height; y++) {
                if (y != pos.y) {
                    const cell = field.get_cell({ x: pos.x, y });
                    const element = field.get_element({ x: pos.x, y });
                    if (cell != NotActiveCell && cell.state == CellState.Idle && ((element != NullElement && element.state == ElementState.Idle) || element == NullElement)) {
                        if (is_buster({ x: pos.x, y })) busters.push({ x: pos.x, y }); //try_activate_buster_element({x: pos.x, y});
                        else {
                            const damage_info = field.try_damage({ x: pos.x, y });
                            if (damage_info != NotDamage) {
                                field.set_element_state(damage_info.pos, ElementState.Busy);
                                field.set_cell_state(damage_info.pos, CellState.Busy);
                                damages.push(damage_info);
                            }
                        }
                    }
                }
            }
        }

        if (rocket.id == ElementId.HorizontalRocket || rocket.id == ElementId.AllAxisRocket || all_axis) {
            for (let x = 0; x < field_width; x++) {
                if (x != pos.x) {
                    const cell = field.get_cell({ x, y: pos.y });
                    const element = field.get_element({ x, y: pos.y });
                    if (cell != NotActiveCell && cell.state == CellState.Idle && ((element != NullElement && element.state == ElementState.Idle) || element == NullElement)) {
                        if (is_buster({ x, y: pos.y })) busters.push({ x, y: pos.y }); //try_activate_buster_element({x, y: pos.y});
                        else {
                            const damage_info = field.try_damage({ x, y: pos.y });
                            if (damage_info != NotDamage) {
                                field.set_element_state(damage_info.pos, ElementState.Busy);
                                field.set_cell_state(damage_info.pos, CellState.Busy);
                                damages.push(damage_info);
                            }
                        }
                    }
                }
            }
        }

        for (const buster of busters) {
            try_activate_buster_element(buster);
        }

        const axis = rocket.id == ElementId.AllAxisRocket || all_axis ? Axis.All : rocket.id == ElementId.VerticalRocket ? Axis.Vertical : Axis.Horizontal;
        EventBus.send('RESPONSE_ACTIVATED_ROCKET', { pos, uid: rocket.uid, damages, axis });

        return true;
    }

    function on_rocket_end(damages: DamageInfo[]) {
        for (const damage_info of damages) {
            field.set_cell_state(damage_info.pos, CellState.Idle);
        }
    }

    function try_activate_diskosphere(pos: Position, ids = [get_random_element_id()], buster?: ElementId) {
        const diskosphere = field.get_element(pos);
        if (diskosphere == NullElement || diskosphere.id != ElementId.Diskosphere)
            return false;

        const damage = field.try_damage(pos, false, false, true);
        if (damage != NotDamage) {
            field.set_element_state(damage.pos, ElementState.Busy);
            field.set_cell_state(damage.pos, CellState.Busy);
        }

        const damages = damage != NotDamage ? [damage] : [];
        for (const element_id of ids) {
            const elements = field.get_all_elements_by_id(element_id);
            for (const element of elements) {
                const element_pos = field.get_element_pos(element);
                const damage_info = field.try_damage(element_pos, true, false);
                if (damage_info != NotDamage) {
                    field.set_element_state(damage_info.pos, ElementState.Busy);
                    field.set_cell_state(damage_info.pos, CellState.Busy);
                    damages.push(damage_info);
                }
            }
        }

        EventBus.send('RESPONSE_ACTIVATED_DISKOSPHERE', { pos, uid: diskosphere.uid, damages, buster });

        return true;
    }

    function on_diskosphere_damage_element_end(message: DiskosphereDamageElementMessage) {
        field.set_cell_state(message.damage_info.pos, CellState.Idle);
        if (message.buster == undefined) return;

        make_element(message.damage_info.pos, message.buster);
        try_activate_buster_element(message.damage_info.pos);
    }

    function on_diskosphere_activated_end(pos: Position) {
        field.set_cell_state(pos, CellState.Idle);
    }

    function try_activate_helicopter(pos: Position, triple = false, buster?: ElementId) {
        const helicopter = field.get_element(pos);
        if (helicopter == NullElement || helicopter.id != ElementId.Helicopter)
            return false;

        const under_damage = field.try_damage(pos, false, false, true);

        const damages = damage_element_by_mask(pos, [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
        ]);

        if (under_damage != NotDamage)
            damages.push(under_damage);

        EventBus.send('RESPONSE_ACTIVATED_HELICOPTER', { pos, uid: helicopter.uid, damages, triple, buster });

        return true;
    }

    function on_helicopter_action(message: HelicopterActivatedMessage) {
        const damages = [];
        for (let i = 0; i < (message.triple ? 3 : 1); i++) {
            const damage_info = remove_random_target([message.uid]);
            if (damage_info != NullElement) {
                field.set_cell_state(damage_info.pos, CellState.Busy);
                damages.push(damage_info);
            }
        }

        EventBus.send('RESPONSE_HELICOPTER_ACTION', { pos: message.pos, uid: message.uid, damages, buster: message.buster });
    }

    function on_helicopter_end(message: HelicopterActionMessage) {
        for (const damage_info of message.damages) {
            if (damage_info.element == undefined && is_buster(damage_info.pos))
                try_activate_buster_element(damage_info.pos);

            field.set_cell_state(damage_info.pos, CellState.Idle);
            if (message.buster != undefined) {
                make_element(damage_info.pos, message.buster);
                try_activate_buster_element(damage_info.pos);
            }
        }
    }

    function remove_random_target(exclude?: number[], only_base_elements = true) {
        const targets = get_state().targets;

        const available_targets = [] as (CellInfo | ElementInfo)[];

        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = field.get_cell({ x, y });
                const element = field.get_element({ x, y });

                const is_valid_cell = (cell != NotActiveCell) && (cell.state != CellState.Busy) && (exclude?.findIndex((uid) => uid == cell.uid) == -1) && (targets?.findIndex((target) => {
                    return (target.type == TargetType.Cell && target.id == cell.id && target.count > target.uids.length && cell.strength != undefined && cell.strength < GAME_CONFIG.cell_strength[cell.id as CellId]);
                }) != -1);

                if (is_valid_cell) {
                    if (element != NullElement) available_targets.push({ pos: { x, y }, element });
                    else available_targets.push({ pos: { x, y }, cell });
                }
            }
        }

        if (available_targets.length == 0) {
            for (let y = 0; y < field_height; y++) {
                for (let x = 0; x < field_width; x++) {
                    const cell = field.get_cell({ x, y });
                    const element = field.get_element({ x, y });

                    const is_valid_cell = (cell != NotActiveCell) && (cell.state != CellState.Busy) && (exclude?.findIndex((uid) => uid == cell.uid) == -1) && (targets?.findIndex((target) => {
                        return (target.type == TargetType.Cell && target.id == cell.id && target.count > target.uids.length);
                    }) != -1);

                    const is_valid_element = (element != NullElement) && (exclude?.findIndex((uid) => uid == element.uid) == -1) && (targets?.findIndex((target) => {
                        return (target.type == TargetType.Element && target.id == element.id && target.count > target.uids.length);
                    }) != -1);

                    if (is_valid_cell) {
                        if (element != NullElement) available_targets.push({ pos: { x, y }, element });
                        else available_targets.push({ pos: { x, y }, cell });
                    }
                    else if (is_valid_element) {
                        if (only_base_elements && GAME_CONFIG.base_elements.includes(element.type)) available_targets.push({ pos: { x, y }, element });
                        else available_targets.push({ pos: { x, y }, element });
                    }
                }
            }
        }

        if (available_targets.length == 0) {
            for (let y = 0; y < field_height; y++) {
                for (let x = 0; x < field_width; x++) {
                    const cell = field.get_cell({ x, y });
                    const element = field.get_element({ x, y });
                    const is_valid_cell = (cell != NotActiveCell && cell.id != CellId.Base);
                    const is_valid_element = (element != NullElement) && (exclude?.findIndex((uid) => uid == element.uid) == -1);

                    if (is_valid_cell) {
                        if (element != NullElement) available_targets.push({ pos: { x, y }, element });
                    }
                    else if (is_valid_element) {
                        if (only_base_elements && GAME_CONFIG.base_elements.includes(element.type)) available_targets.push({ pos: { x, y }, element });
                        else available_targets.push({ pos: { x, y }, element });
                    }
                }
            }
        }

        if (available_targets.length == 0) return NullElement;

        const target = available_targets[math.random(0, available_targets.length - 1)];

        const damage_info = field.try_damage(target.pos, false, false, false, ("cell" in target) ? true : false);
        return (damage_info != NotDamage) ? damage_info : NullElement;
    }

    function on_swap_elements(swap: SwapInfo) {
        if (is_block_input || (is_tutorial() && !is_tutorial_swap(swap))) return;

        busters.hammer.active = false;
        busters.spinning.active = false;
        busters.horizontal_rocket.active = false;
        busters.vertical_rocket.active = false;
        EventBus.send('UPDATED_BUTTONS');

        if (is_first_step) {
            is_first_step = false;
            set_timer();
        }

        const cell_from = field.get_cell(swap.from);
        const cell_to = field.get_cell(swap.to);

        if (cell_from == NotActiveCell || cell_to == NotActiveCell)
            return;

        if (!is_available_cell_type_for_move(cell_from) || !is_available_cell_type_for_move(cell_to))
            return;

        const element_from = field.get_element(swap.from);
        const element_to = field.get_element(swap.to);

        if (element_from == NullElement || element_from.state != ElementState.Idle) return;
        if (element_to != NullElement && element_to.state != ElementState.Idle) return;

        stop_helper();

        if (!field.try_swap(swap.from, swap.to)) {
            EventBus.send('RESPONSE_WRONG_SWAP_ELEMENTS', {
                from: swap.from,
                to: swap.to,
                element_from: element_from,
                element_to: element_to
            });

            is_idle = false;
            return on_idle();
        }

        is_idle = false;

        if (level_config.steps != undefined) {
            const state = get_state();
            state.steps--;
            EventBus.send('UPDATED_STEP_COUNTER', state.steps);
        }

        if (is_gameover())
            is_block_input = true;

        //TODO: don`t check again

        const comb1 = field.search_combination(swap.from);
        if (comb1 != NotFound) {
            for (const info of comb1.elementsInfo) {
                field.set_element_state(info, ElementState.Busy);
                field.set_cell_state(info, CellState.Busy);
            }
        }

        const comb2 = field.search_combination(swap.to);
        if (comb2 != NotFound) {
            for (const info of comb2.elementsInfo) {
                field.set_element_state(info, ElementState.Busy);
                field.set_cell_state(info, CellState.Busy);
            }
        }

        EventBus.send('RESPONSE_SWAP_ELEMENTS', {
            from: swap.from,
            to: swap.to,
            element_from: element_from,
            element_to: element_to
        });

        if (is_tutorial()) {
            complete_tutorial();
        }
    }

    function on_swap_elements_end(message: SwapElementsMessage) {
        field.set_element_state(message.from, ElementState.Idle);
        field.set_element_state(message.to, ElementState.Idle);
    }

    function on_buster_activate_after_swap(message: SwapElementsMessage) {
        if (!is_buster(message.from) && !is_buster(message.to)) return;

        // revers because this after swap
        const buster_from = message.element_to;
        const buster_to = message.element_from;

        const is_from_dynamite = buster_from != NullElement && buster_from.id == ElementId.Dynamite;
        const is_to_dynamite = buster_to.id == ElementId.Dynamite;
        const is_combinate_dynamites = is_from_dynamite && is_to_dynamite;

        const is_from_rocket = buster_from != NullElement && GAME_CONFIG.rockets.includes(buster_from.id);
        const is_to_rocket = GAME_CONFIG.rockets.includes(buster_to.id);
        const is_combinate_rockets = is_from_rocket && is_to_rocket;

        const is_from_helicopter = buster_from != NullElement && buster_from.id == ElementId.Helicopter;
        const is_to_helicopter = buster_to.id == ElementId.Helicopter;
        const is_combinate_helicopters = is_from_helicopter && is_to_helicopter;

        const is_from_other_element = buster_from != NullElement;
        const is_to_diskosphere = buster_to.id == ElementId.Diskosphere;
        const is_combinate_to_diskosphere = is_from_other_element && is_to_diskosphere;

        if (is_combinate_dynamites || is_combinate_rockets || is_combinate_helicopters || is_combinate_to_diskosphere) {
            field.set_element_state(message.to, ElementState.Busy);
            field.set_element(message.from, NullElement);
            EventBus.send('RESPONSE_COMBINATE_BUSTERS', {
                buster_from: { pos: message.from, element: buster_from },
                buster_to: { pos: message.to, element: buster_to }
            });
            return;
        }

        const is_from_diskosphere = buster_from != NullElement && buster_from.id == ElementId.Diskosphere;

        if (is_from_diskosphere) {
            field.set_element_state(message.from, ElementState.Busy);
            field.set_element(message.to, NullElement);
            EventBus.send('RESPONSE_COMBINATE_BUSTERS', {
                buster_from: { pos: message.to, element: buster_to },
                buster_to: { pos: message.from, element: buster_from }
            });
            return;
        }

        if (is_from_helicopter && GAME_CONFIG.buster_elements.includes(buster_to.id)) {
            field.set_element_state(message.from, ElementState.Busy);
            field.set_element(message.to, NullElement);
            EventBus.send('RESPONSE_COMBINATE_BUSTERS', {
                buster_from: { pos: message.to, element: buster_to },
                buster_to: { pos: message.from, element: buster_from }
            });
            return;
        }

        if (is_to_helicopter && buster_from != NullElement && GAME_CONFIG.buster_elements.includes(buster_from.id)) {
            field.set_element_state(message.to, ElementState.Busy);
            field.set_element(message.from, NullElement);
            EventBus.send('RESPONSE_COMBINATE_BUSTERS', {
                buster_from: { pos: message.from, element: buster_from },
                buster_to: { pos: message.to, element: buster_to }
            });
            return;
        }

        if (is_buster(message.from)) try_activate_buster_element(message.from);
        if (is_buster(message.to)) try_activate_buster_element(message.to);
    }

    function on_combined_busters(message: CombinateBustersMessage) {
        // Dynamite with Dynamite
        if (message.buster_from.element.id == ElementId.Dynamite && message.buster_to.element.id == ElementId.Dynamite)
            return try_activate_dynamite(message.buster_to.pos, true);

        // Rocket with Rocket
        if (GAME_CONFIG.rockets.includes(message.buster_from.element.id) && GAME_CONFIG.rockets.includes(message.buster_to.element.id))
            return try_activate_rocket(message.buster_to.pos, true);

        // Helicopter with Helicopter
        if (message.buster_from.element.id == ElementId.Helicopter && message.buster_to.element.id == ElementId.Helicopter)
            return try_activate_helicopter(message.buster_to.pos, true);

        // Diskosphere from
        if (message.buster_from.element.id == ElementId.Diskosphere) {
            if (message.buster_to.element.id == ElementId.Diskosphere) return try_activate_diskosphere(message.buster_to.pos, GAME_CONFIG.base_elements);
            else if (GAME_CONFIG.buster_elements.includes(message.buster_to.element.id)) return try_activate_diskosphere(message.buster_from.pos, [get_random_element_id()], message.buster_to.element.id);
            else return try_activate_diskosphere(message.buster_from.pos, [message.buster_to.element.id]);
        }

        // Diskosphere to
        if (message.buster_to.element.id == ElementId.Diskosphere) {
            if (message.buster_from.element.id == ElementId.Diskosphere) return try_activate_diskosphere(message.buster_to.pos, GAME_CONFIG.base_elements);
            else if (GAME_CONFIG.buster_elements.includes(message.buster_from.element.id)) return try_activate_diskosphere(message.buster_to.pos, [get_random_element_id()], message.buster_from.element.id);
            else return try_activate_diskosphere(message.buster_to.pos, [message.buster_from.element.id]);
        }

        // Buster with Helicopter
        if (message.buster_to.element.id == ElementId.Helicopter) {
            return try_activate_helicopter(message.buster_to.pos, false, message.buster_from.element.id);
        }

        // Helicopter with Buster
        if (message.buster_from.element.id == ElementId.Helicopter) {
            return try_activate_helicopter(message.buster_to.pos, false, message.buster_to.element.id);
        }
    }

    function on_combinate(message: CombinateMessage) {
        for (const pos of message.combined_positions) {
            const combination = field.search_combination(pos);
            if (combination != NotFound) {
                for (const info of combination.elementsInfo) {
                    field.set_element_state(info, ElementState.Busy);
                    field.set_cell_state(info, CellState.Busy);
                }
                EventBus.send('RESPONSE_COMBINATE', combination);
            } else EventBus.send('RESPONSE_COMBINATE_NOT_FOUND', pos);
        }
    }

    function on_combination(combination: CombinationInfo) {
        const damages_info = field.combinate(combination);
        const maked_element = try_combo(combination.combined_pos, combination);
        if (maked_element != undefined)
            field.set_element_state(combination.combined_pos, ElementState.Busy);
        EventBus.send('RESPONSE_COMBINATION', {
            pos: combination.combined_pos,
            damages: damages_info,
            maked_element
        });
    }

    function on_maked_element(pos: Position) {
        field.set_element_state(pos, ElementState.Idle);
    }

    function on_combination_end(damages: DamageInfo[]) {
        for (const damage_info of damages) {
            field.set_cell_state(damage_info.pos, CellState.Idle);
        }
    }

    function try_combo(pos: Position, combination: CombinationInfo) {
        let element: Element | typeof NullElement = NullElement;
        switch (combination.type) {
            case CombinationType.Comb4:
                element = make_element(pos,
                    (combination.angle == 0) ? ElementId.HorizontalRocket : ElementId.VerticalRocket);
                break;
            case CombinationType.Comb2x2:
                element = make_element(pos, ElementId.Helicopter);
                break;
            case CombinationType.Comb3x3a: case CombinationType.Comb3x3b:
                element = make_element(pos, ElementId.Dynamite);
                break;
            case CombinationType.Comb3x4a: case CombinationType.Comb3x4b: case CombinationType.Comb3x5:
                element = make_element(pos, ElementId.AllAxisRocket);
                break;
            case CombinationType.Comb5:
                element = make_element(pos, ElementId.Diskosphere);
                break;
        }

        if (element != NullElement)
            return element;
    }

    function on_falling(pos: Position) {
        Log.log(`FALL: ${pos.x}, ${pos.y}`);
        const result = search_fall_element(pos, pos);
        if (result != NotFound) {
            const move_info = field.fell_element(result);
            if (move_info != NotFound) {
                print("RESPONSE FALLING: ", move_info.start_pos.x, move_info.start_pos.y);
                return EventBus.send('RESPONSE_FALLING', move_info);
            }
        }

        EventBus.send('RESPONSE_FALLING_NOT_FOUND', pos);
    }

    function search_fall_element(start_pos: Position, pos: Position, decay = false): Element | NotFound {
        if (decay) {
            const neighbor_cells = field.get_neighbor_cells(pos, [
                [1, 0, 1],
                [0, 0, 0],
                [0, 0, 0]
            ]);

            for (const neighbor_cell of neighbor_cells) {
                if (is_available_cell_type_for_move(neighbor_cell)) {
                    const neighbor_cell_pos = field.get_cell_pos(neighbor_cell);
                    const element = field.get_element(neighbor_cell_pos);
                    if (element != NullElement && element.state == ElementState.Idle)
                        return element;
                }
            }
        }

        const top_pos = { x: pos.x, y: pos.y - 1 };
        if (top_pos.y < 0) return NotFound;

        const element = field.get_element(pos);
        if (element != NullElement && element.state == ElementState.Idle)
            return element;

        if (field.is_outside_pos_in_column(top_pos) && field.is_pos_empty(top_pos) && field.is_pos_empty(pos)) {
            Log.log("REQUEST ELEMENT IN: ", pos);
            const element = field.request_element(top_pos);
            if (element != NullElement) {
                EventBus.send('REQUESTED_ELEMENT', { pos: top_pos, element });
                return element;
            }
        }

        const top_cell = field.get_cell(top_pos);
        if (top_cell != NotActiveCell) {
            if (!is_available_cell_type_for_move(top_cell) || top_cell.state != CellState.Idle) {
                const neighbor_cells = field.get_neighbor_cells(pos, [
                    [1, 0, 1],
                    [0, 0, 0],
                    [0, 0, 0]
                ]);

                for (const neighbor_cell of neighbor_cells) {
                    if (is_available_cell_type_for_move(neighbor_cell)) {
                        const neighbor_cell_pos = field.get_cell_pos(neighbor_cell);
                        const result = search_fall_element(start_pos, neighbor_cell_pos, decay);
                        if (result != NotFound)
                            return result;
                    }
                }

                // FOR NOW PREVENT INFINITE LOOP
                if (decay)
                    return NotFound;

                return search_fall_element(start_pos, start_pos, true); //, ++depth);
            }
        }

        if (field.is_pos_empty(top_pos)) {
            return search_fall_element(start_pos, top_pos, decay); //, depth);
        }

        const top_element = field.get_element(top_pos);
        if (top_element != NullElement && top_element.state == ElementState.Idle)
            return top_element;

        return NotFound;
    }

    function on_fall_end(pos: Position) {
        const element = field.get_element(pos);
        if (element != NullElement) {
            const move_info = field.fell_element(element);
            if (move_info != NotFound) EventBus.send('RESPONSE_FALLING', move_info);
            else {
                field.set_element_state(pos, ElementState.Idle);
                EventBus.send('RESPONSE_FALL_END', { pos, element });
            }
        }
    }

    function complete_tutorial() {
        const completed_tutorials = GameStorage.get('completed_tutorials');
        completed_tutorials.push(get_current_level() + 1);
        GameStorage.set('completed_tutorials', completed_tutorials);

        remove_tutorial();
    }

    function remove_tutorial() {
        const tutorial_data = GAME_CONFIG.tutorials_data[get_current_level() + 1];
        const except_cells = tutorial_data.cells != undefined ? tutorial_data.cells : [];
        const bounds = tutorial_data.bounds != undefined ? tutorial_data.bounds : { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
        const unlock_info = [] as UnlockInfo;
        for (let y = bounds.from.y; y < bounds.to.y; y++) {
            for (let x = bounds.from.x; x < bounds.to.x; x++) {
                const cell = field.get_cell({ x, y });
                if (cell != NotActiveCell) {
                    const element = field.get_element({ x, y });
                    unlock_info.push({
                        pos: { x, y },
                        cell,
                        element
                    });
                }
            }
        }

        if (tutorial_data.busters != undefined) {
            busters.spinning.block = false;
            busters.hammer.block = false;
            busters.horizontal_rocket.block = false;
            busters.vertical_rocket.block = false;
        }



        EventBus.send('REMOVE_TUTORIAL', unlock_info);
    }

    return init();
}

export function base_cell(uid: number) {
    return {
        id: CellId.Base,
        uid: uid,
        type: CellType.Base,
        under_cells: [],
        state: CellState.Idle
    };
}