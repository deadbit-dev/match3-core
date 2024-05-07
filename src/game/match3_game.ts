/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-case-declarations */


import * as flow from 'ludobits.m.flow';

import { MessageId, Messages, PosXYMessage } from '../modules/modules_const';

import { Axis, is_valid_pos } from '../utils/math_utils';

import {
    GameStepEventBuffer,
    ActivationMessage,
    SwapedActivationMessage,
    HelicopterActivationMessage,
    SwapedHelicoptersActivationMessage,
    SwapedDiskosphereActivationMessage,
    SwapedHelicopterWithElementMessage,
    SpinningActivationMessage,
    CombinedMessage,
    ActivatedCellMessage,
    ElementActivationMessage,
    StepHelperMessage,
    RocketActivationMessage,
} from '../main/game_config';

import {
    Field,
    Cell,
    Element,
    NullElement,
    NotActiveCell,
    CombinationType,
    CombinationInfo,
    ProcessMode,
    ItemInfo,
    GameState,
    CellType,
    MovedInfo,
    StepInfo
} from './match3_core';

export const RandomElement = -2;

// REFACTORING
export interface Target {
    is_cell: boolean,
    type: number,
    count: number,
    uids: number[]
}

export enum SubstrateId {
    OutsideArc,
    OutsideInsideAngle,
    OutsideAngle,
    LeftRightStrip,
    LeftStripTopBottomInsideAngle,
    LeftStripTopInsideAngle,
    LeftStripBottomInsideAngle,
    LeftStrip,
    TopBottomInsideAngle,
    InsideAngle,
    Full
}

export enum CellId {
    Base,
    Grass,
    Flowers,
    Web,
    Box,
    Stone0,
    Stone1,
    Stone2,
    Lock
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
    AxisRocket,
    Helicopter,
    Dynamite,
    Diskosphere
}

export interface ActivatedBusters {
    hammer_active: boolean,
    spinning_active: boolean,
    horizontal_rocket_active: boolean,
    vertical_rocket_active: boolean
}

export interface Level {
    field: { 
        width: number,
        height: number,
        max_width: number,
        max_height: number,
        cell_size: number,
        offset_border: number,

        cells: (typeof NotActiveCell | CellId)[][] | CellId[][][],
        elements: (typeof NullElement | typeof RandomElement | ElementId)[][]
    }

    additional_element: ElementId,
    exclude_element: ElementId,

    time: number,
    steps: number,
    targets: Target[],

    busters: ActivatedBusters
}

export function Game() {
    //#region CONFIG        

    const level_config = GAME_CONFIG.levels[GameStorage.get('current_level')];
    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const busters = level_config['busters'];

    //#endregion CONFIGURATIONS
    //#region MAIN          

    const field = Field(field_width, field_height, GAME_CONFIG.complex_move);

    let game_item_counter = 0;
    let previous_states: GameState[] = [];
    
    let previous_randomseeds: number[] = [];
    let randomseed: number;
    
    let activated_elements: number[] = [];
    let game_step_events: GameStepEventBuffer = [];

    let selected_element: ItemInfo | null = null;

    let spawn_element_chances: {[key in number]: number} = {};

    let available_steps: StepInfo[] = [];
    let coroutines: Coroutine[] = [];
    
    let previous_helper_data: StepHelperMessage | null = null;
    let helper_data: StepHelperMessage | null = null;
    let helper_timer: hash;
    
    let is_simulating = false;
    let is_step = false;
    let is_block_input = false;

    let step_counter = 0;
    let start_game_time = 0;
    

    function init() {
        field.init();

        field.set_callback_is_can_move(is_can_move);
        field.set_callback_on_moved_elements(on_moved_elements);
        field.set_callback_is_combined_elements(is_combined_elements);
        field.set_callback_on_combinated(on_combined);
        field.set_callback_on_damaged_element(on_damaged_element);
        field.set_callback_on_request_element(on_request_element);
        field.set_callback_on_cell_activated(on_cell_activated);

        set_element_types();
        set_element_chances();
        set_busters();
        set_events();
        set_random();

        set_targets_uids();
    }
    
    //#endregion MAIN
    //#region SETUP

    function set_targets_uids() {
        for(const target of level_config.targets)
            target.uids = [];
    }

    function set_element_types() {
        for(const [key] of Object.entries(GAME_CONFIG.element_view)) {
            const element_id = tonumber(key) as ElementId;
            field.set_element_type(element_id, {
                index: element_id,
                is_movable: true,
                is_clickable: GAME_CONFIG.buster_elements.includes(element_id)
            });
        }
    }

    function set_element_chances() {
        for(const [key] of Object.entries(GAME_CONFIG.element_view)) {
            const id = tonumber(key);
            if(id != undefined) {
                if(GAME_CONFIG.base_elements.includes(id) || id == level_config.additional_element) spawn_element_chances[id] = 10;
                else spawn_element_chances[id] = 0;
                
                if(id == level_config.exclude_element) spawn_element_chances[id] = 0;
            }
        }
    }
    
    function set_busters() {
        GameStorage.set('spinning_counts', 5);
        busters.spinning_active = (GameStorage.get('spinning_counts') <= 0);
        
        GameStorage.set('hammer_counts', 5);
        busters.hammer_active = (GameStorage.get('hammer_counts') <= 0);
        
        GameStorage.set('horizontal_rocket_counts', 5);
        busters.horizontal_rocket_active = (GameStorage.get('horizontal_rocket_counts') <= 0);

        GameStorage.set('vertical_rocket_counts', 5);
        busters.vertical_rocket_active = (GameStorage.get('vertical_rocket_counts') <= 0);

        EventBus.send('UPDATED_BUTTONS');
    }
    
    function set_events() {
        EventBus.on('REQUEST_LOAD_FIELD', on_load_field);
        EventBus.on('SET_HELPER', set_helper);
        EventBus.on('SWAP_ELEMENTS', on_swap_elements);
        EventBus.on('CLICK_ACTIVATION', on_click_activation);
        EventBus.on('ACTIVATE_SPINNING', on_activate_spinning);
        EventBus.on('REVERT_STEP', on_revert_step);
        EventBus.on('ON_GAME_STEP_ANIMATION_END', on_game_step_animation_end);
    }

    function on_load_field() {
        Log.log("Загрузка поля");
        
        try_load_field();

        // TUTORIAL
        // lock_cells_except([{x: 3, y: 3}, {x: 4, y: 3}]);
        // timer.delay(5, false, () => {
        //     unlock_cells();
        //     EventBus.send('UPDATED_STATE', field.save_state());
        // });
        
        const state = field.save_state();
        previous_states.push(state);

        search_available_steps(5, (steps) => {
            available_steps = steps;
        });

        EventBus.send('ON_LOAD_FIELD', state);

        if(level_config.time != undefined) {
            start_game_time = System.now();
            timer.delay(1, true, on_game_timer_tick);
        }
    }

    function lock_cells_except(cells: {x: number, y: number}[]) {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                if(!cells.find((cell) => (cell.x == x) && (cell.y == y))) {
                    const cell = field.get_cell(x, y);
                    if(cell != NotActiveCell) {
                        if(cell.data == undefined || cell.data.under_cells == undefined) cell.data.under_cells = [];
                        (cell.data.under_cells as CellId[]).push(cell.id);
                        cell.id = CellId.Lock;
                        cell.type = CellId.Lock;
                        field.set_cell(x, y, cell);
                    }
                }
            }
        }
    }

    function unlock_cells() {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = field.get_cell(x, y);
                if(cell != NotActiveCell && cell.type == CellId.Lock) {
                    const id = (cell.data.under_cells as CellId[]).pop();
                    cell.id = (id == undefined) ? CellId.Base : id;
                    cell.type = generate_cell_type_by_cell_id(cell.id);
                    field.set_cell(x, y, cell);
                }
            }
        }
    }

    function try_load_field() {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                load_cell(x, y);
                load_element(x, y);
            }
        }

        if(field.get_all_combinations(true).length > 0) {
            field.init();
            try_load_field();
            return;
        }
    }

    function on_swap_elements(elements: StepInfo | undefined) {
        if(is_block_input || elements == undefined) return;

        stop_helper();

        if(!try_swap_elements(elements.from_x, elements.from_y, elements.to_x, elements.to_y)) return;

        is_step = true;
        const is_procesed = try_combinate_before_buster_activation(elements.from_x, elements.from_y, elements.to_x, elements.to_y);
        process_game_step(is_procesed);
    }

    // TODO: refactoring
    function on_click_activation(pos: PosXYMessage | undefined) {
        if(is_block_input || pos == undefined) return;

        stop_helper();

        if(try_click_activation(pos.x, pos.y)) process_game_step(true);
        else {
            const element = field.get_element(pos.x, pos.y);
            if(element != NullElement) {
                if(selected_element != null && selected_element.uid == element.uid) {
                    EventBus.send('ON_ELEMENT_UNSELECTED', Object.assign({}, selected_element));
                    selected_element = null;
                } else {
                    let is_swap = false;
                    if(selected_element != null) {
                        EventBus.send('ON_ELEMENT_UNSELECTED', Object.assign({}, selected_element));
                        const neighbors = field.get_neighbor_elements(selected_element.x, selected_element.y, [
                            [0, 1, 0],
                            [1, 0, 1],
                            [0, 1, 0]
                        ]);

                        for(const neighbor of neighbors) {
                            if(neighbor.uid == element.uid) {
                                is_swap = true;
                                break;
                            }
                        }
                    }

                    if(selected_element != null && is_swap) EventBus.send('SWAP_ELEMENTS', {from_x: selected_element.x, from_y: selected_element.y, to_x: pos.x, to_y: pos.y});
                    else {
                        selected_element = {x: pos.x, y: pos.y, uid: element.uid};
                        EventBus.send('ON_ELEMENT_SELECTED', Object.assign({}, selected_element));
                    }
                }
            }
        }
    }

    function on_activate_spinning() {
        if(is_block_input) return;
        
        stop_helper();
        try_spinning_activation();
    }

    function on_revert_step() {
        stop_helper();
        revert_step();
    }

    // TODO: move in logic game step end
    function on_game_step_animation_end() {
        if(is_level_completed()) {
            const completed_levels = GameStorage.get('completed_levels');
            completed_levels.push(GameStorage.get('current_level'));
            GameStorage.set('completed_levels', completed_levels);
            EventBus.send('ON_LEVEL_COMPLETED');
        } else if(!is_have_steps()) EventBus.send('ON_GAME_OVER');
        Log.log("Закончена анимация хода");
    }

    function on_game_timer_tick() {
        const dt = System.now() - start_game_time;
        const remaining_time = level_config.time - dt;
        if(level_config.time >= dt) EventBus.send('GAME_TIMER', remaining_time);
        else EventBus.send('ON_GAME_OVER');
    }

    function load_cell(x: number, y: number) {
        // TODO: load save
        const cell_config = level_config['field']['cells'][y][x];
        if(Array.isArray(cell_config)) {
            const cells = Object.assign([], cell_config);
            const cell_id = cells.pop();
            if(cell_id != undefined) make_cell(x, y, cell_id, {under_cells: cells});
        } else make_cell(x, y, cell_config);
    }

    function load_element(x: number, y: number) {
        // TODO: load save
        const element = level_config['field']['elements'][y][x];
        make_element(x, y, element == RandomElement ? get_random_element_id() : element);
    }

    function make_cell(x: number, y: number, cell_id: CellId | typeof NotActiveCell, data?: any): Cell | typeof NotActiveCell {
        if(cell_id == NotActiveCell) return NotActiveCell;
        
        const cell = {
            id: cell_id,
            uid: game_item_counter++,
            type: generate_cell_type_by_cell_id(cell_id),
            cnt_acts: 0,
            cnt_near_acts: 0,
            data: Object.assign({}, data)
        };

        cell.data.current_id = cell_id;
        cell.data.z_index = GAME_CONFIG.top_layer_cells.includes(cell_id) ? 2 : -1;
        
        field.set_cell(x, y, cell);

        return cell;
    }

    function generate_cell_type_by_cell_id(cell_id: CellId) {
        let type;
        if(GAME_CONFIG.activation_cells.includes(cell_id))
            type = (type == undefined) ? CellType.ActionLocked : bit.bor(type, CellType.ActionLocked);
        if(GAME_CONFIG.near_activated_cells.includes(cell_id))
            type = (type == undefined) ? CellType.ActionLockedNear : bit.bor(type, CellType.ActionLockedNear);
        if(GAME_CONFIG.disabled_cells.includes(cell_id))
            type = (type == undefined) ? CellType.Disabled : bit.bor(type, CellType.Disabled);
        if(GAME_CONFIG.not_moved_cells.includes(cell_id))
            type = (type == undefined) ? CellType.NotMoved : bit.bor(type, CellType.NotMoved);
        if(type == undefined) type = CellType.Base;

        return type;
    }

    function make_element(x: number, y: number, element_id: ElementId | typeof NullElement, data: any = null): Element | typeof NullElement {
        if(element_id == NullElement) return NullElement;
        
        const element: Element = {
            id: element_id,
            uid: game_item_counter++,
            type: element_id,
            data: data
        };

        field.set_element(x, y, element);

        return element;
    }

    //#endregion SETUP
    //#region ACTIONS
    
    function set_helper() {
        // search_helper_combination();
        
        helper_timer = timer.delay(5, false, () => {
            set_combination_for_helper(available_steps);

            if(helper_data != null) {
                Log.log("Запуск подсказки");

                reset_helper();

                previous_helper_data = Object.assign({}, helper_data);
                EventBus.send('ON_SET_STEP_HELPER', Object.assign({}, helper_data));

                set_helper();
            }
        });
    }
    
    function stop_helper() {
        if(helper_timer == undefined) return;
        Log.log("Остановка подсказки");

        stop_all_coroutines();

        helper_data = null;
        
        timer.cancel(helper_timer);
        reset_helper();
    }

    function stop_all_coroutines() {
        for(const coroutine of coroutines) {
            flow.stop(coroutine);
        }
    }

    function reset_helper() {
        if(previous_helper_data == null) return;
        Log.log("Перезапуск подсказки");
        
        EventBus.send('ON_RESET_STEP_HELPER', Object.assign({}, previous_helper_data));
        previous_helper_data = null;
    }

    // function search_helper_combination() {
    //     print("[GAME]: search combination");

    //     search_available_steps(Infinity, (steps: StepInfo[]) => {
    //         print("[GAME]: end search available steps in search helper combination");
    //         // search_best_step(steps, (best_step) => {
    //             // print("[GAME]: end search best step after search available steps");
    //             get_helper_combination(steps);
    //         // });
    //     });
    // }

    function set_combination_for_helper(steps: StepInfo[]) {
        if(steps.length == 0) return;

        const step = steps[math.random(0, steps.length - 1)];
        const combination = get_step_combination(step);
        if(combination == undefined) return;
        for(const element of combination.elements) {
            const is_from = (element.x == step.from_x && element.y == step.from_y);
            const is_to = (element.x == step.to_x && element.y == step.to_y);
            
            if(is_from || is_to) {
                helper_data = {
                    step: step,
                    elements: combination.elements,
                    combined_element: element
                };

                return Log.log("Установлены данные для подсказки");
            }
        }
    }
    
    function search_available_steps(count: number, on_end: (steps: StepInfo[]) => void) {
        const coroutine = flow.start(() => {
            Log.log("Поиск возможных ходов");

            const steps: StepInfo[] = [];
            for(let y = 0; y < field_height; y++) {
                for(let x = 0; x < field_width; x++) {
                    flow.frames(1);

                    // if(is_buster(x, y)) {
                    //     steps.push({from_x: x, from_y: y, to_x: x, to_y: y});
                    // }
                    
                    if(is_valid_pos(x + 1, y, field_width, field_height) && field.is_can_move_base(x, y, x + 1, y)) {
                        steps.push({from_x: x, from_y: y, to_x: x + 1, to_y: y});
                    }

                    if(steps.length > count) {
                        return on_end(steps);
                    }

                    flow.frames(1);

                    if(is_valid_pos(x, y + 1, field_width, field_height) && field.is_can_move_base(x, y, x, y + 1)) {
                        steps.push({from_x: x, from_y: y, to_x: x, to_y: y + 1});
                    }

                    if(steps.length > count) {
                        return on_end(steps);
                    }
                }
            }
            
            Log.log("Найдены " + steps.length + " ходов");

            on_end(steps);
        });

        coroutines.push(coroutine);
    }

    // function search_best_step(steps: StepInfo[], on_end: (step: StepInfo) => void) {
    //     const coroutine = flow.start(() => {
    //         print("[GAME]: search best step");

    //         let best_step = {} as StepInfo;
    //         let max_damaged_elements = 0;
    //         for(const step of steps) {

    //             print("[GAME]: call get_count_damaged_elements_of_step");

    //             const count_damaged_elements = get_count_damaged_elements_of_step(step);
    //             if(count_damaged_elements > max_damaged_elements) {
    //                 max_damaged_elements = count_damaged_elements;
    //                 best_step = step;
    //             }

    //             flow.frames(1);
    //         }

    //         print("[GAME]: found best step: ", best_step.from_x, best_step.from_y, best_step.to_x, best_step.to_y);
    //         on_end(best_step);
    //     });

    //     coroutines.push(coroutine);
    // }

    // function get_count_damaged_elements_of_step(step: StepInfo) {
    //     let count_damaged_elements = 0;
    //     field.set_callback_on_damaged_element((item: ItemInfo) => {
    //         on_damaged_element(item);
    //         count_damaged_elements++;
    //     });

    //     simulate_game_step(step);
        
    //     field.set_callback_on_damaged_element(on_damaged_element);

    //     print("[GAME]: damaged elements by step: ", count_damaged_elements);

    //     return count_damaged_elements;
    // }
    
    function get_step_combination(step: StepInfo): CombinationInfo | undefined {
        field.swap_elements(step.from_x, step.from_y, step.to_x, step.to_y);
        const combinations = field.get_all_combinations();
        field.swap_elements(step.from_x, step.from_y, step.to_x, step.to_y);
        
        for(const combination of combinations) {
            for(const element of combination.elements) {
                const is_x = element.x == step.from_x || element.x == step.to_x;
                const is_y = element.y == step.from_y || element.y == step.to_y;
                if(is_x && is_y) return combination;
            }
        }

        const element_from = field.get_element(step.from_x, step.from_y);
        const element_to = field.get_element(step.to_x, step.to_y);
        if(element_from != NullElement && element_to != NullElement) {
            const combination = {} as CombinationInfo;
            combination.elements = [{x: step.from_x, y: step.from_y, uid: element_to.uid}, {x: step.to_x, y: step.to_y, uid: element_from.uid}];
            return combination;
        }

        return undefined;
    }

    function try_combinate_before_buster_activation(from_x: number, from_y: number, to_x: number, to_y: number) {
        const is_from_buster = is_buster(to_x, to_y);
        const is_to_buster = is_buster(from_x, from_y);

        if(!is_from_buster && !is_to_buster) return false;

        let is_activated = false;
        
        const is_procesed = field.process_state(ProcessMode.Combinate);
        if(!is_procesed) is_activated = try_activate_swaped_busters(to_x, to_y, from_x, from_y);
        else { 
            write_game_step_event('ON_BUSTER_ACTIVATION', {});
            if(is_from_buster) is_activated = try_activate_buster_element(to_x, to_y);
            if(is_to_buster) is_activated = try_activate_buster_element(from_x, from_y);
        }

        return is_procesed || is_activated;
    }
    
    function try_click_activation(x: number, y: number) {
        if(!is_simulating) {
            if(try_hammer_activation(x, y)) return true;
            if(try_horizontal_rocket_activation(x, y)) return true;
            if(try_vertical_rocket_activation(x, y)) return true;
        }

        if(field.try_click(x, y) && try_activate_buster_element(x, y)) {
            is_step = true;
            return true;
        }
        return false;
    }

    function try_activate_buster_element(x: number, y: number, with_check = true) {
        const element = field.get_element(x, y);
        if(element == NullElement) return false;

        if(with_check) {
            if(activated_elements.indexOf(element.uid) != -1) return false;
            activated_elements.push(element.uid);
        }

        EventBus.send('ON_ELEMENT_UNSELECTED', Object.assign({}, selected_element));
        selected_element = null;

        let activated = false;
        if(try_activate_rocket(x, y)) activated = true;
        else if(try_activate_helicopter(x, y)) activated = true;
        else if(try_activate_dynamite(x, y)) activated = true;
        else if(try_activate_diskosphere(x, y)) activated = true;
        
        if(!activated && with_check) activated_elements.splice(activated_elements.length - 1, 1);

        return activated;
    }

    function try_activate_swaped_busters(x: number, y: number, other_x: number, other_y: number) {
        const element = field.get_element(x, y);
        const other_element = field.get_element(other_x, other_y);

        if(element == NullElement || other_element == NullElement) return false;
        if(activated_elements.indexOf(element.uid) != -1 || activated_elements.indexOf(other_element.uid) != -1) return false;

        activated_elements.push(element.uid, other_element.uid);

        let activated = false;
        if(try_activate_swaped_diskospheres(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_buster_with_diskosphere(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_diskosphere_with_buster(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_diskosphere_with_element(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_diskosphere_with_element(other_x, other_y, x, y)) activated = true;
        else if(try_activate_swaped_rockets(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_rocket_with_element(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_rocket_with_element(other_x, other_y, x, y)) activated = true;
        else if(try_activate_swaped_helicopters(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_helicopter_with_element(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_helicopter_with_element(other_x, other_y, x, y)) activated = true;
        else if(try_activate_swaped_dynamites(x, y, other_x, other_y)) activated = true;
        else if(try_activate_swaped_dynamite_with_element(x, y, other_x, other_y)) activated = true;       
        else if(try_activate_swaped_dynamite_with_element(other_x, other_y, x, y)) activated = true;
        else if(try_activate_swaped_buster_with_buster(x, y, other_x, other_y)) activated = true;

        if(!activated) activated_elements.splice(activated_elements.length - 2, 2);

        return activated;
    }
    
    function try_activate_diskosphere(x: number, y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const element_id = get_random_element_id();
        if(element_id == NullElement) return false;

        const event_data = {} as ActivationMessage;
        write_game_step_event('DISKOSPHERE_ACTIVATED', event_data);
        
        event_data.element = {x, y, uid: diskosphere.uid};
        event_data.activated_cells = [];

        const elements = field.get_all_elements_by_type(element_id);
        for(const element of elements) field.remove_element(element.x, element.y, true, true);
        event_data.damaged_elements = elements;

        field.remove_element(x, y, true, false);

        return true;
    }

    function try_activate_swaped_diskospheres(x: number, y: number, other_x: number, other_y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const other_diskosphere = field.get_element(other_x, other_y);
        if(other_diskosphere == NullElement || other_diskosphere.type != ElementId.Diskosphere) return false;
    
        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERES_ACTIVATED', event_data);
        
        event_data.element = {x, y, uid: diskosphere.uid};
        event_data.other_element = {x: other_x, y: other_y, uid: other_diskosphere.uid};
        event_data.damaged_elements = [];
        event_data.activated_cells = [];
    
        for(const element_id of GAME_CONFIG.base_elements) {
            const elements = field.get_all_elements_by_type(element_id);
            for(const element of elements) {
                field.remove_element(element.x, element.y, true, false);
                event_data.damaged_elements.push(element);
            }
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }

    function try_activate_swaped_diskosphere_with_buster(x: number, y: number, other_x: number, other_y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const other_buster = field.get_element(other_x, other_y);
        if(other_buster == NullElement || ![ElementId.Helicopter, ElementId.Dynamite, ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(other_buster.type)) return false;
    
        const event_data = {} as SwapedDiskosphereActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED', event_data);
        
        event_data.element = {x, y, uid: diskosphere.uid};
        event_data.other_element = {x: other_x, y: other_y, uid: other_buster.uid};
        event_data.activated_cells = [];
        event_data.damaged_elements = [];
        event_data.maked_elements = [];

        const element_id = get_random_element_id();
        if(element_id == NullElement) return false;

        const elements = field.get_all_elements_by_type(element_id);
        for(const element of elements) {
            field.remove_element(element.x, element.y, true, false);
            event_data.damaged_elements.push(element);

            const maked_element = make_element(element.x, element.y, other_buster.type, true);
            if(maked_element != NullElement) event_data.maked_elements.push({x: element.x, y: element.y, uid: maked_element.uid, type: maked_element.type});
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        for(const element of elements) try_activate_buster_element(element.x, element.y);

        return true;
    }
    
    function try_activate_swaped_buster_with_diskosphere(x: number, y: number, other_x: number, other_y: number) {
        const buster = field.get_element(x, y);
        if(buster == NullElement || GAME_CONFIG.base_elements.includes(buster.type)) return false;
    
        const diskosphere = field.get_element(other_x, other_y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;

        const event_data = {} as SwapedDiskosphereActivationMessage;
        event_data.element = {x: other_x, y: other_y, uid: diskosphere.uid};
        event_data.other_element = {x, y, uid: buster.uid};
        event_data.activated_cells = [];
        event_data.damaged_elements = [];
        event_data.maked_elements = [];

        write_game_step_event('SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED', event_data);

        const element_id = get_random_element_id();
        if(element_id == NullElement) return false;

        const elements = field.get_all_elements_by_type(element_id);
        for(const element of elements) {
            field.remove_element(element.x, element.y, true, false);
            event_data.damaged_elements.push(element);

            const maked_element = make_element(element.x, element.y, buster.type, true);
            if(maked_element != NullElement) event_data.maked_elements.push({x: element.x, y: element.y, uid: maked_element.uid, type: maked_element.type});
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        for(const element of elements) try_activate_buster_element(element.x, element.y);

        return true;
    }

    function try_activate_swaped_diskosphere_with_element(x: number, y: number, other_x: number, other_y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const other_element = field.get_element(other_x, other_y);
        if(other_element == NullElement) return false;
    
        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED', event_data);
        
        event_data.element = {x, y, uid: diskosphere.uid};
        event_data.other_element = {x: other_x, y: other_y, uid: other_element.uid};
        event_data.damaged_elements = [];
        event_data.activated_cells = [];

        const elements = field.get_all_elements_by_type(other_element.type);
        for(const element of elements) {
            field.remove_element(element.x, element.y, true, false);
            event_data.damaged_elements.push(element);
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }

    // WARNING: message for axis rocket need to be as for swaped
    function try_activate_rocket(x: number, y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket, ElementId.AxisRocket].includes(rocket.type)) return false;
        
        const event_data = {} as RocketActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data);

        event_data.element = {x, y, uid: rocket.uid};
        event_data.damaged_elements = [];
        event_data.activated_cells = [];
        event_data.axis = rocket.type == ElementId.VerticalRocket ? Axis.Vertical : Axis.Horizontal;
     
        if(rocket.type == ElementId.VerticalRocket || rocket.type == ElementId.AxisRocket) {
            for(let i = 0; i < field_height; i++) {
                if(i != y) {
                    if(is_buster(x, i)) try_activate_buster_element(x, i);
                    else {
                        const removed_element = field.remove_element(x, i, true, false);
                        if(removed_element != undefined) event_data.damaged_elements.push({x, y: i, uid: removed_element.uid});
                    }
                }
            }
        }
    
        if(rocket.type == ElementId.HorizontalRocket || rocket.type == ElementId.AxisRocket) {
            for(let i = 0; i < field_width; i++) {
                if(i != x) {
                    if(is_buster(i, y)) try_activate_buster_element(i, y);
                    else {
                        const removed_element = field.remove_element(i, y, true, false);
                        if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, uid: removed_element.uid});
                    }
                }
            }
        }

        field.remove_element(x, y, true, false);

        return true;
    }

    // TODO: refactoring
    function try_activate_swaped_rockets(x: number, y: number, other_x: number, other_y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(rocket.type)) return false;
        
        const other_rocket = field.get_element(other_x, other_y);
        if(other_rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(other_rocket.type)) return false;
        
        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_ROCKETS_ACTIVATED', event_data);
        
        event_data.element = {x, y, uid: rocket.uid};
        event_data.other_element = {x: other_x, y: other_y, uid: other_rocket.uid};
        event_data.damaged_elements = [];
        event_data.activated_cells = [];
    
        for(let i = 0; i < field_height; i++) {
            if(i != y) {
                if(is_buster(x, i)) try_activate_buster_element(x, i);
                else {
                    const removed_element = field.remove_element(x, i, true, false);
                    if(removed_element != undefined) event_data.damaged_elements.push({x, y: i, uid: removed_element.uid});
                }
            }
        }
        
        for(let i = 0; i < field_width; i++) {
            if(i != x) {
                if(is_buster(i, y)) try_activate_buster_element(i, y);
                else {
                    const removed_element = field.remove_element(i, y, true, false);
                    if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, uid: removed_element.uid});
                }
            }
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }
    
    function try_activate_swaped_rocket_with_element(x: number, y: number, other_x: number, other_y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket, ElementId.AxisRocket].includes(rocket.type)) return false;

        const other_element = field.get_element(other_x, other_y);
        if(other_element == NullElement || !GAME_CONFIG.base_elements.includes(other_element.type)) return false;

        if(try_activate_rocket(x, y)) return true;

        return false;
    }

    function try_activate_helicopter(x: number, y: number) {
        const helicopter = field.get_element(x, y);
        if(helicopter == NullElement || helicopter.type != ElementId.Helicopter) return false;

        const event_data = {} as HelicopterActivationMessage;
        write_game_step_event('HELICOPTER_ACTIVATED', event_data);
        event_data.activated_cells = [];
        
        event_data.element = {x, y, uid: helicopter.uid};
        event_data.damaged_elements = remove_element_by_mask(x, y, [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
        ]);

        event_data.target_element = remove_random_element(event_data.damaged_elements);

        field.remove_element(x, y, true, false);
        
        return true;
    }

    function try_activate_swaped_helicopters(x: number, y: number, other_x: number, other_y: number) {
        const helicopter = field.get_element(x, y);
        if(helicopter == NullElement || helicopter.type != ElementId.Helicopter) return false;
        
        const other_helicopter = field.get_element(other_x, other_y);
        if(other_helicopter == NullElement || other_helicopter.type != ElementId.Helicopter) return false;

        const event_data = {} as SwapedHelicoptersActivationMessage;
        event_data.target_elements = [];
        event_data.activated_cells = [];

        write_game_step_event('SWAPED_HELICOPTERS_ACTIVATED', event_data);
        
        event_data.element = {x, y, uid: helicopter.uid};
        event_data.other_element = {x: other_x, y: other_y, uid: other_helicopter.uid};
        event_data.damaged_elements = remove_element_by_mask(x, y, [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
        ]);

        for(let i = 0; i < 3; i++) event_data.target_elements.push(remove_random_element(event_data.damaged_elements));

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }

    function try_activate_swaped_helicopter_with_element(x: number, y: number, other_x: number, other_y: number) {
        const helicopter = field.get_element(x, y);
        if(helicopter == NullElement || helicopter.type != ElementId.Helicopter) return false;
        
        const other_element = field.get_element(other_x, other_y);
        if(other_element == NullElement || !GAME_CONFIG.base_elements.includes(other_element.type)) return false;

        const event_data = {} as SwapedHelicopterWithElementMessage;

        write_game_step_event('SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED', event_data);
        event_data.activated_cells = [];
        
        event_data.element = {x, y, uid: helicopter.uid};
        event_data.other_element = {x: other_x, y: other_y, uid: other_element.uid};
        event_data.damaged_elements = remove_element_by_mask(x, y, [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
        ]);

        event_data.target_element = remove_random_element(event_data.damaged_elements);

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }

    function try_activate_dynamite(x: number, y: number) {
        const dynamite = field.get_element(x, y);
        if(dynamite == NullElement || dynamite.type != ElementId.Dynamite) return false;
        
        const event_data = {} as ActivationMessage;
        write_game_step_event('DYNAMITE_ACTIVATED', event_data);
        event_data.activated_cells = [];
        
        event_data.element = {x, y, uid: dynamite.uid};
        event_data.damaged_elements = remove_element_by_mask(x, y, [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1]
        ]);

        field.remove_element(x, y, true, false);

        return true;
    }

    function try_activate_swaped_dynamites(x: number, y: number, other_x: number, other_y: number) {
        const dynamite = field.get_element(x, y);
        if(dynamite == NullElement || dynamite.type != ElementId.Dynamite) return false;
        
        const other_dynamite = field.get_element(other_x, other_y);
        if(other_dynamite == NullElement || other_dynamite.type != ElementId.Dynamite) return false;

        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DYNAMITES_ACTIVATED', event_data);
        event_data.activated_cells = [];
        
        event_data.element = {x, y, uid: dynamite.uid};
        event_data.other_element = {x: other_x, y: other_y, uid: other_dynamite.uid};
        event_data.damaged_elements = remove_element_by_mask(x, y, [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ]);
        
        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }

    function try_activate_swaped_dynamite_with_element(x: number, y: number, other_x: number, other_y: number) {
        const dynamite = field.get_element(x, y);
        if(dynamite == NullElement || dynamite.type != ElementId.Dynamite) return false;
        
        const other_element = field.get_element(other_x, other_y);
        if(other_element == NullElement || !GAME_CONFIG.base_elements.includes(other_element.type)) return false;

        try_activate_dynamite(x, y);

        return true;
    }

    function try_activate_swaped_buster_with_buster(x: number, y: number, other_x: number, other_y: number) {
        if(!is_buster(x, y) || !is_buster(other_x, other_y)) return false;
        return try_activate_buster_element(x, y, false) && try_activate_buster_element(other_x, other_y, false);
    }
    
    function try_spinning_activation() {
        if(!busters.spinning_active || GameStorage.get('spinning_counts') <= 0) return false;
        
        shuffle_field();
        
        GameStorage.set('spinning_counts', GameStorage.get('spinning_counts') - 1);
        busters.spinning_active = false;

        EventBus.send('UPDATED_BUTTONS');

        return true;
    }

    function shuffle_field() {
        Log.log("Перемешиваем поле");

        let state = field.save_state();
        
        const event_data: SpinningActivationMessage = [];
        write_game_step_event('ON_SPINNING_ACTIVATED', event_data);
        
        const base_elements = [];
        for(const element_id of GAME_CONFIG.base_elements) {
            for(const element of field.get_all_elements_by_type(element_id))
                base_elements.push(element);
        }

        while(base_elements.length > 0) {
            const element = base_elements.splice(math.random(0, base_elements.length - 1), 1).pop();
            if(base_elements.length > 0) {
                const other_element = base_elements.splice(math.random(0, base_elements.length - 1), 1).pop();
                if(element != undefined && other_element != undefined) {       
                    field.swap_elements(element.x, element.y, other_element.x, other_element.y);
                    event_data.push({element_from: element, element_to: other_element});
                }
            }
        }

        is_block_input = true;
        search_available_steps(1, (steps) => {
            if(steps.length != 0) process_game_step(false);
            else {
                game_step_events = {} as GameStepEventBuffer;
                field.load_state(state);
                shuffle_field();
            }
        });
    }
    
    function try_hammer_activation(x: number, y: number) {
        if(!busters.hammer_active || GameStorage.get('hammer_counts') <= 0) return false;

        EventBus.send('ON_ELEMENT_UNSELECTED', Object.assign({}, selected_element));
        selected_element = null;       

        // FIXME: for buster under wall
        if(is_buster(x, y)) try_activate_buster_element(x, y);
        else {
            const event_data = {} as ElementActivationMessage;
            event_data.x = x;
            event_data.y = y;
            event_data.activated_cells = [];
            write_game_step_event('ON_ELEMENT_ACTIVATED', event_data);
            const removed_element = field.remove_element(x, y, true, false);
            if(removed_element != undefined) event_data.uid = removed_element.uid;
        }

        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') - 1);
        busters.hammer_active = false;

        EventBus.send('UPDATED_BUTTONS');

        return true;
    }

    function try_horizontal_rocket_activation(x: number, y: number) {
        if(!busters.horizontal_rocket_active || GameStorage.get('horizontal_rocket_counts') <= 0) return false;

        EventBus.send('ON_ELEMENT_UNSELECTED', Object.assign({}, selected_element));
        selected_element = null;
        
        const event_data = {} as RocketActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data);
        
        event_data.element = {x, y, uid: -1};
        event_data.damaged_elements = [];
        event_data.activated_cells = [];
        event_data.axis = Axis.Horizontal;
        
        for(let i = 0; i < field_width; i++) {
            if(is_buster(i, y)) try_activate_buster_element(i, y);
            else {
                const removed_element = field.remove_element(i, y, true, false);
                if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, uid: removed_element.uid});
            }
        }

        GameStorage.set('horizontal_rocket_counts', GameStorage.get('horizontal_rocket_counts') - 1);
        busters.horizontal_rocket_active = false;

        EventBus.send('UPDATED_BUTTONS');

        return true;
    }
    
    function try_vertical_rocket_activation(x: number, y: number) {
        if(!busters.vertical_rocket_active || GameStorage.get('vertical_rocket_counts') <= 0) return false;
    
        EventBus.send('ON_ELEMENT_UNSELECTED', Object.assign({}, selected_element));
        selected_element = null;
        
        const event_data = {} as RocketActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data);
        
        event_data.element = {x, y, uid: -1};
        event_data.damaged_elements = [];
        event_data.activated_cells = [];
        event_data.axis = Axis.Vertical;
        
        for(let i = 0; i < field_height; i++) {
            if(is_buster(x, i)) try_activate_buster_element(x, i);
            else {
                const removed_element = field.remove_element(x, i, true, false);
                if(removed_element != undefined) event_data.damaged_elements.push({x, y: i, uid: removed_element.uid});
            }
        }

        GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') - 1);
        busters.vertical_rocket_active = false;

        EventBus.send('UPDATED_BUTTONS');

        return true;
    }

    function try_swap_elements(from_x: number, from_y: number, to_x: number, to_y: number) {
        const cell_from = field.get_cell(from_x, from_y);
        const cell_to = field.get_cell(to_x, to_y);

        if(cell_from == NotActiveCell || cell_to == NotActiveCell) return false;

        // TODO: remove because this check will be in try_move below
        if(!field.is_available_cell_type_for_move(cell_from) || !field.is_available_cell_type_for_move(cell_to)) return false;

        const element_from = field.get_element(from_x, from_y);
        const element_to = field.get_element(to_x, to_y);
        
        if(element_from == NullElement) return false;

        EventBus.send('ON_ELEMENT_UNSELECTED', Object.assign({}, selected_element));
        selected_element = null;
        
        if(!field.try_move(from_x, from_y, to_x, to_y)) {
            EventBus.send('ON_WRONG_SWAP_ELEMENTS', {
                from: {x: from_x, y: from_y},
                to: {x: to_x, y: to_y},
                element_from: element_from,
                element_to: element_to
            });

            return false;
        }

        write_game_step_event('ON_SWAP_ELEMENTS', {
            from: {x: from_x, y: from_y},
            to: {x: to_x, y: to_y},
            element_from: element_from,
            element_to: element_to
        });

        return true;
    }

    function set_random(seed?: number) {
        randomseed = seed != undefined ? seed : os.time();
        previous_randomseeds.push(randomseed);
        math.randomseed(randomseed);
    }

    // function simulate_game_step(step: StepInfo) {
    //     const previous_state = field.save_state();

    //     print("[GAME]: simulating game step: ", step.from_x, step.from_y, step.to_x, step.to_y);
        
    //     const element_from = field.get_element(step.from_x, step.from_y);
    //     const element_to = field.get_element(step.to_x, step.to_y);

    //     if(element_from != NullElement) print(element_from.type);
    //     if(element_to != NullElement) print(element_to.type);

    //     is_simulating = true;
        
    //     let after_activation = false;

    //     if(step.from_x == step.to_x && step.from_y == step.to_y) {
    //         after_activation = try_click_activation(step.from_x, step.from_y);
    //         if(!after_activation) return;
    //     } else {
    //         if(!field.try_move(step.from_x, step.from_y, step.to_x, step.to_y)) return;
    //         after_activation = try_combinate_before_buster_activation(step.from_x, step.from_y, step.to_x, step.to_y);
    //     }
        
    //     if(after_activation) field.process_state(ProcessMode.MoveElements);

    //     while(field.process_state(ProcessMode.Combinate)) {
    //         print("[GAME]: after combinate in simulating");
    //         field.process_state(ProcessMode.MoveElements);
    //         print("[GAME]: after movements in simulating");
    //     }

    //     field.load_state(previous_state);

    //     is_simulating = false;

    //     math.randomseed(randomseed);

    //     print("[GAME]: simulating game step end: ", step.from_x, step.from_y, step.to_x, step.to_y);
    // }

    function process_game_step(after_activation = false) {
        if(after_activation) field.process_state(ProcessMode.MoveElements);

        while(field.process_state(ProcessMode.Combinate)) {
            field.process_state(ProcessMode.MoveElements);
        }

        previous_states.push(field.save_state());

        is_block_input = true;
        search_available_steps(5, (steps) => {
            if(steps.length != 0) {
                available_steps = steps;
                is_block_input = false;
                return;
            }

            stop_helper();
            shuffle_field();
        });

        if(is_step) step_counter++;
        is_step = false;
    
        if(level_config.steps != undefined) EventBus.send('UPDATED_STEP_COUNTER', level_config.steps - step_counter);

        send_game_step();
        set_random();
    }
    
    function revert_step(): boolean {
        const current_state = previous_states.pop();
        let previous_state = previous_states.pop();
        if(current_state == undefined || previous_state == undefined) return false;

        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = previous_state.cells[y][x];
                if(cell != NotActiveCell) make_cell(x, y, cell.id, cell?.data);
                else field.set_cell(x, y, NotActiveCell);

                const element = previous_state.elements[y][x];
                if(element != NullElement) make_element(x, y, element.type, element.data);
                else field.set_element(x, y, NullElement);
            }
        }

        previous_state = field.save_state();
        previous_states.push(previous_state);


        previous_randomseeds.pop();
        const previous_seed = previous_randomseeds.pop();
        set_random(previous_seed);

        search_available_steps(5, (steps) => {
            available_steps = steps;
        });

        EventBus.send('ON_REVERT_STEP', {current_state, previous_state});

        return true;
    }

    function is_level_completed() {
        for(const target of level_config.targets) {
            if(target.uids.length < target.count) return false;
        }

        return true;
    }

    function is_have_steps() {
        if(level_config.steps != undefined)
            return step_counter <= level_config.steps;
        return true;
    }

    //#endregion ACTIONS
    //#region CALLBACKS     

    function is_can_move(from_x: number, from_y: number, to_x: number, to_y: number) {
        if(field.is_can_move_base(from_x, from_y, to_x, to_y)) return true;
        
        return (is_buster(from_x, from_y) || is_buster(to_x, to_y));
    }

    function try_combo(combined_element: ItemInfo, combination: CombinationInfo) {
        let element: Element | typeof NullElement = NullElement;
        
        switch(combination.type) {
            case CombinationType.Comb4:
                element = make_element(combined_element.x, combined_element.y,
                    (combination.angle == 0) ? ElementId.HorizontalRocket : ElementId.VerticalRocket);
            break;
            case CombinationType.Comb5:
                element = make_element(combined_element.x, combined_element.y, ElementId.Diskosphere);
            break;
            case CombinationType.Comb2x2:
                element = make_element(combined_element.x, combined_element.y, ElementId.Helicopter);
            break;
            case CombinationType.Comb3x3a: case CombinationType.Comb3x3b:
                element = make_element(combined_element.x, combined_element.y, ElementId.Dynamite);
            break;
            case CombinationType.Comb3x4: case CombinationType.Comb3x5:
                element = make_element(combined_element.x, combined_element.y, ElementId.AxisRocket);
            break;
        }

        if(element != NullElement && !is_simulating) {
            (game_step_events[game_step_events.length - 1].value as CombinedMessage).maked_element = {
                x: combined_element.x,
                y: combined_element.y,
                uid: element.uid,
                type: element.type
            };

            return true;
        }

        return false;
    }

    function on_damaged_element(item: ItemInfo) {
        const index = activated_elements.indexOf(item.uid);
        if(index != -1) activated_elements.splice(index, 1);

        if(is_simulating) return;

        const element = field.get_element(item.x, item.y);
        if(element == NullElement) return;

        for(const target of level_config.targets) {
            if(!target.is_cell && target.type == element.type) {
                target.uids.push(element.uid);
            }
        }
    }

    function is_combined_elements(e1: Element, e2: Element) {
        // const e1_pos = field.get_pos_by_uid(e1.uid);
        // const e2_pos = field.get_pos_by_uid(e2.uid);
        // if(is_buster(e1_pos.x, e1_pos.y) || is_buster(e2_pos.x, e2_pos.y)) return false;

        if(field.get_element_type(e1.type).is_clickable || field.get_element_type(e2.type).is_clickable) return false;
        
        return field.is_combined_elements_base(e1, e2);
    }

    function on_combined(combined_element: ItemInfo, combination: CombinationInfo) {
        if(is_buster(combined_element.x, combined_element.y)) return;

        write_game_step_event('ON_COMBINED', {combined_element, combination, activated_cells: []});

        field.on_combined_base(combined_element, combination);
        try_combo(combined_element, combination);
    }
    
    function on_request_element(x: number, y: number): Element | typeof NullElement {
        return make_element(x, y, get_random_element_id());
    }

    function on_moved_elements(elements: MovedInfo[]) {
        write_game_step_event('ON_MOVED_ELEMENTS', elements);
    }

    function on_cell_activated(item_info: ItemInfo) {
        const cell = field.get_cell(item_info.x, item_info.y);
        if(cell == NotActiveCell) return;

        let new_cell: (Cell | typeof NotActiveCell) = NotActiveCell;

        if(bit.band(cell.type, CellType.ActionLockedNear) == CellType.ActionLockedNear) {
            if(cell.cnt_near_acts != undefined) {
                if(cell.cnt_near_acts > 0) {
                    if(cell.data != undefined && cell.data.under_cells != undefined && (cell.data.under_cells as CellId[]).length > 0) {
                        const cell_id = (cell.data.under_cells as CellId[]).pop();
                        if(cell_id != undefined) new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data);
                    }
                    
                    if(new_cell == NotActiveCell) new_cell = make_cell(item_info.x, item_info.y, CellId.Base);
                }
            }
        }

        if(bit.band(cell.type, CellType.ActionLocked) == CellType.ActionLocked) {
            if(cell.cnt_acts != undefined) {
                if(cell.cnt_acts > 0) {
                    if(cell.data != undefined && cell.data.under_cells != undefined && (cell.data.under_cells as CellId[]).length > 0) {
                        const cell_id = (cell.data.under_cells as CellId[]).pop();
                        if(cell_id != undefined) new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data);
                    } 
                    
                    if(new_cell == NotActiveCell) new_cell = make_cell(item_info.x, item_info.y, CellId.Base);
                }
            }
        }

        if(new_cell != NotActiveCell && !is_simulating) {
            for(const [key, value] of Object.entries(game_step_events[game_step_events.length - 1].value)) {
                if(key == 'activated_cells') {
                    (value as ActivatedCellMessage[]).push({
                        x: item_info.x,
                        y: item_info.y,
                        uid: new_cell.uid,
                        id: new_cell.id,
                        previous_id: item_info.uid 
                    });
                }
            }

            for(const target of level_config.targets) {
                const check_for_not_stone = (target.type != CellId.Stone0 && target.type ==  cell.data.current_id);
                const check_stone_with_last_cell = (target.type == CellId.Stone0 && cell.data.current_id == CellId.Stone2);
                if(target.is_cell && (check_for_not_stone || check_stone_with_last_cell)) {
                    target.uids.push(cell.uid);
                }
            }
        }
    }

    //#endregion CALLBACKS
    //#region HELPERS    

    function is_buster(x: number, y: number) {
        return field.try_click(x, y);
    }

    function get_random_element_id(): ElementId | typeof NullElement {
        let sum = 0;
        for(const [key] of Object.entries(GAME_CONFIG.element_view)) {
            const id = tonumber(key);
            if(id != undefined) {
                sum += spawn_element_chances[id];
            }
        }

        let bins: number[] = [];
        for(const [key] of Object.entries(GAME_CONFIG.element_view)) {
            const id = tonumber(key);
            if(id != undefined) {
                const normalized_value = spawn_element_chances[id] / sum;
                if(bins.length == 0) bins.push(normalized_value);
                else bins.push(normalized_value + bins[bins.length - 1]);
            }
        }

        const rand = math.random();
    
        for(let [index, value] of bins.entries()) {
            if(value >= rand) {
                for(const [key, _] of Object.entries(GAME_CONFIG.element_view))
                    if(index-- == 0) return tonumber(key) as ElementId;
            }
        }

        return NullElement;
    }
    
    function remove_random_element(exclude?: ItemInfo[], only_base_elements = true) {
        const available_elements = [];
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const element = field.get_element(x, y);
                if(element != NullElement && exclude != undefined && exclude.findIndex((item) => item.uid == element.uid) == -1) {
                    if(only_base_elements) {
                        if(GAME_CONFIG.base_elements.includes(element.type)) available_elements.push({x, y, uid: element.uid});
                    } else available_elements.push({x, y, uid: element.uid});
                }
            }
        }

        if(available_elements.length == 0) return NullElement;

        const target = available_elements[math.random(0, available_elements.length - 1)];
        if(is_buster(target.x, target.y)) try_activate_buster_element(target.x, target.y);
        else field.remove_element(target.x, target.y, true, false);

        return target;
    }
    
    function remove_element_by_mask(x: number, y: number, mask: number[][], is_near_activation = false) {
        const removed_elements = [];
        
        for(let i = y - (mask.length - 1) / 2; i <= y + (mask.length - 1) / 2; i++) {
            for(let j = x - (mask[0].length - 1) / 2; j <= x + (mask[0].length - 1) / 2; j++) {
                if(mask[i - (y - (mask.length - 1) / 2)][j - (x - (mask[0].length - 1) / 2)] == 1) {
                    if(is_valid_pos(j, i, field_width, field_height)) {
                        if(is_buster(j, i)) try_activate_buster_element(j, i);
                        else {
                            const removed_element = field.remove_element(j, i, true, is_near_activation);
                            if(removed_element != undefined) removed_elements.push({x: j, y: i, uid: removed_element.uid});
                        }
                    }
                }
            }
        }

        return removed_elements;
    }

    function write_game_step_event<T extends MessageId>(message_id: T, message: Messages[T]) {
        if(is_simulating) return;

        game_step_events.push({key: message_id, value: message});
    }

    function send_game_step() {
        if(is_simulating) return;

        EventBus.send('ON_GAME_STEP', game_step_events);
        game_step_events = {} as GameStepEventBuffer;
    }

    //#endregion HELPERS

    return init();
}

export function load_config() {
    const data = sys.load_resource('/resources/levels.json')[0];
    if(data == null) return;

    const levels = json.decode(data) as { 
        time: number,
        steps: number,
        targets: {
            count: number,
            type: { cell: CellId | undefined, element: ElementId | undefined }
        }[],
        coins: number,
        additional_element: ElementId,
        exclude_element: ElementId,
        field: (string | { cell: CellId | undefined, element: ElementId | undefined })[][]
    }[];
    
    for(const level_data of levels) {
        const level = {
            field: { 
                width: 10,
                height: 10,
                max_width: 8,
                max_height: 8,
                cell_size: 128,
                offset_border: 20,

                cells: [] as (typeof NotActiveCell | CellId)[][] | CellId[][][],
                elements: [] as (typeof NullElement | typeof RandomElement | ElementId)[][]
            },

            additional_element: level_data.additional_element,
            exclude_element: level_data.exclude_element,

            time: level_data.time,
            steps: level_data.steps,
            targets: [] as {
                is_cell: boolean,
                count: number,
                type: ElementId,
                uids: number[]
            }[],

            busters: {
                hammer_active: false,
                spinning_active: false,
                horizontal_rocket_active: false,
                vertical_rocket_active: false
            }
        };

        for(let y = 0; y < level_data.field.length; y++) {
            level.field.cells[y] = [];
            level.field.elements[y] = [];
            for(let x = 0; x < level_data.field[y].length; x++) {
                const data = level_data.field[y][x];
                if(typeof data === 'string') {
                    switch(data) {
                        case '-':
                            level.field.cells[y][x] = NotActiveCell;
                            level.field.elements[y][x] = NullElement;
                            break;
                        case '':
                            level.field.cells[y][x] = CellId.Base;
                            level.field.elements[y][x] = RandomElement;
                            break;
                    }   
                } else {
                    if(data.cell != undefined) {
                        if(data.cell == CellId.Stone0) {
                            level.field.cells[y][x] = [CellId.Base, CellId.Stone2, CellId.Stone1, CellId.Stone0];
                        } else level.field.cells[y][x] = [CellId.Base, data.cell];
                    } else level.field.cells[y][x] = CellId.Base;

                    if(data.element != undefined) {
                        level.field.elements[y][x] = data.element;
                    } else level.field.elements[y][x] = RandomElement;
                }
            }
        }

        for(const target_data of level_data.targets) {
            let target;
            if(target_data.type.element != undefined) {
                target = {
                    is_cell: false,
                    type: target_data.type.element as number,
                    count: 0,
                    uids: []
                };
            }

            if(target_data.type.cell != undefined) {
                target = {
                    is_cell: true,
                    type: target_data.type.cell as number,
                    count: 0,
                    uids: []
                };
            }

            if(target != undefined) {
                const count = tonumber(target_data.count);
                target.count = count != undefined ? count : target.count;
                level.targets.push(target);
            }
        }

        GAME_CONFIG.levels.push(level);
    }
}