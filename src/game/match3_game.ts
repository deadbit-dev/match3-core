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

import { MessageId, Messages, NameMessage, PosXYMessage } from '../modules/modules_const';

import { Axis, is_valid_pos } from '../utils/math_utils';

import {
    GameStepEventBuffer,
    ActivationMessage,
    SwapedActivationMessage,
    HelicopterActivationMessage,
    SwapedHelicoptersActivationMessage,
    SwapedDiskosphereActivationMessage,
    SwapedHelicopterWithElementMessage,
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
    CoreState,
    CellType,
    MovedInfo,
    StepInfo,
    CombinationMasks,
    is_available_cell_type_for_move,
    is_available_cell_type_for_activation
} from './match3_core';

import { lang_data } from '../main/langs';
import { copy_array_of_objects } from '../utils/utils';
import { add_coins } from './match3_utils';


export const RandomElement = -2;

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
    Stone,
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
    uids: string[]
}

export interface Buster {
    name: string,
    counts: number,
    active: boolean
}

export interface Busters {
    hammer: Buster,
    spinning: Buster,
    horizontal_rocket: Buster,
    vertical_rocket: Buster
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
    },

    coins: number,

    additional_element: ElementId,
    exclude_element: ElementId,

    time: number,
    steps: number,
    targets: TargetState[],

    busters: Busters
}

export type TutorialData = { 
    [key in number]: {
        cells?: {x: number, y: number}[],
        bounds?: StepInfo,
        step?: StepInfo,
        busters?: string | string[],

        text: {
            data: keyof typeof lang_data,
            pos: vmath.vector3,
        },

        arrow_pos?: vmath.vector3,
        buster_icon?: {icon: string, pos: vmath.vector3}
    }
};

// TODO: maybe add busters to the GameState
export interface GameState extends CoreState {
    randomseed: number,
    targets: TargetState[],
    steps: number,
    remaining_time: number
}

export function Game() {
    //#region CONFIG        

    const current_level = GameStorage.get('current_level');
    const level_config = GAME_CONFIG.levels[current_level];
    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const busters = level_config['busters'];

    //#endregion CONFIGURATIONS
    //#region MAIN          

    const field = Field(field_width, field_height, GAME_CONFIG.complex_move);

    let game_timer: hash;

    let start_game_time = 0;
    let game_item_counter = 0;
    let states: GameState[] = [];
    
    let activated_elements: string[] = [];
    let game_step_events: GameStepEventBuffer = [];
    let current_game_step_event: number[] = [];

    let selected_element: ItemInfo | null = null;

    let spawn_element_chances: {[key in number]: number} = {};

    let available_steps: StepInfo[] = [];
    let coroutines: Coroutine[] = [];
    
    let previous_helper_data: StepHelperMessage | null = null;
    let helper_data: StepHelperMessage | null = null;
    let helper_timer: hash;
    
    let is_step = false;
    let is_wait_until_animation_done = false;
    
    let is_block_input = false;
    let is_dlg_active = false;
    let is_block_spinning = false;
    let is_block_hammer = false;
    let is_block_vertical_rocket = false;
    let is_block_horizontal_rocket = false;

    let is_shuffling = false;
    let is_searched = false;

    let is_gameover = false;

    let is_first_step = true;


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

        timer.delay(0.1, false, load_field);
    }
    
    //#endregion MAIN
    //#region SETUP
    
    function init_targets() {
        const last_state = get_state();
        last_state.targets = [];
        for(const target of level_config.targets) {
            const copy = Object.assign({}, target);
            copy.uids = Object.assign([], target.uids);
            last_state.targets.push(copy);
        }
    }
    
    function set_targets(targets: TargetState[]) {
        const last_state = get_state();
        last_state.targets = targets;
        for(let i = 0; i < last_state.targets.length; i++) {
            const target = last_state.targets[i];
            target.uids = Object.assign([], targets[i].uids);
        }
    }

    function set_timer() {
        if(level_config.time == undefined) return;
        
        start_game_time = System.now();
        game_timer = timer.delay(1, true, on_game_timer_tick);
    }

    function set_steps(steps = 0) {
        if(level_config.steps == undefined) return;
        
        const last_state = get_state();
        last_state.steps = steps;

        EventBus.send('UPDATED_STEP_COUNTER', last_state.steps);
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
        if(!GameStorage.get('spinning_opened') && level_config.busters.spinning.counts != 0) GameStorage.set('spinning_opened', true);
        if(!GameStorage.get('hammer_opened') && level_config.busters.hammer.counts != 0) GameStorage.set('hammer_opened', true);
        if(!GameStorage.get('horizontal_rocket_opened') && level_config.busters.horizontal_rocket.counts != 0) GameStorage.set('horizontal_rocket_opened', true);
        if(!GameStorage.get('vertical_rocket_opened') && level_config.busters.vertical_rocket.counts != 0) GameStorage.set('vertical_rocket_opened', true);

        const spinning_counts = tonumber(level_config.busters.spinning.counts);
        if(GameStorage.get('spinning_counts') <= 0 && spinning_counts != undefined) GameStorage.set('spinning_counts', spinning_counts);

        const hammer_counts = tonumber(level_config.busters.hammer.counts);
        if(GameStorage.get('hammer_counts') <= 0 && hammer_counts != undefined) GameStorage.set('hammer_counts', hammer_counts);

        const horizontal_rocket_counts = tonumber(level_config.busters.horizontal_rocket.counts);
        if(GameStorage.get('horizontal_rocket_counts') <= 0 && horizontal_rocket_counts != undefined) GameStorage.set('horizontal_rocket_counts', horizontal_rocket_counts);

        const vertical_rocket_counts = tonumber(level_config.busters.vertical_rocket.counts);
        if(GameStorage.get('vertical_rocket_counts') <= 0 && vertical_rocket_counts != undefined) GameStorage.set('vertical_rocket_counts', vertical_rocket_counts);

        EventBus.send('UPDATED_BUTTONS');
    }
    
    function set_events() {
        EventBus.on('SET_HELPER', set_helper);
        EventBus.on('SWAP_ELEMENTS', on_swap_elements);
        EventBus.on('CLICK_ACTIVATION', on_click_activation);
        EventBus.on('ACTIVATE_BUSTER', on_activate_buster);
        EventBus.on('REVERT_STEP', on_revert_step);
        EventBus.on('ON_GAME_STEP_ANIMATION_END', on_game_step_animation_end);
        EventBus.on('REVIVE', on_revive);
        EventBus.on('DLG_ACTIVE', (state) => {
            is_dlg_active = state;
        });
    }

    function load_field() {
        Log.log("LOAD FIELD");
        
        states.push({} as GameState);

        try_load_field();
        if(!GAME_CONFIG.is_revive) {
            if(is_tutorial()) set_tutorial();
            
            if(is_tutorial()) {
                const step = GAME_CONFIG.tutorials_data[current_level + 1].step;
                if(step != undefined) available_steps = [step];
            }
    
            init_targets();
            
            set_steps(level_config.steps);
            set_random();
        }
    
        const last_state = update_state();

        EventBus.send('ON_LOAD_FIELD', last_state);

        if(is_tutorial()) EventBus.send('SET_TUTORIAL');

        states.push({} as GameState);
    
        set_targets(last_state.targets);
        set_steps(last_state.steps);
        set_random();

        GAME_CONFIG.is_revive = false;
    }

    function is_tutorial() {
        const is_tutorial_level = GAME_CONFIG.tutorial_levels.includes(current_level + 1);
        const is_not_completed = !GameStorage.get('completed_tutorials').includes(current_level + 1);
        return (is_tutorial_level && is_not_completed);
    }

    function set_tutorial() {        
        const tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1];
        const except_cells = tutorial_data.cells != undefined ? tutorial_data.cells : [];
        lock_cells(except_cells, tutorial_data?.bounds);

        if(tutorial_data.busters != undefined) {
            if(Array.isArray(tutorial_data.busters)) lock_busters(tutorial_data.busters);
            else lock_busters([tutorial_data.busters]);
        } else lock_busters([]);
    }

    function lock_cells(except_cells: {x: number, y: number}[], bounds: StepInfo = {from_x: 0, from_y: 0, to_x: 0, to_y: 0}) {
        for (let y = bounds.from_y; y < bounds.to_y; y++) {
            for (let x = bounds.from_x; x < bounds.to_x; x++) {
                if(!except_cells.find((cell) => (cell.x == x) && (cell.y == y))) {
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

    function lock_busters(except_busters: string[]) {
        is_block_spinning = !except_busters.includes('spinning');
        is_block_hammer = !except_busters.includes('hammer');
        is_block_vertical_rocket = !except_busters.includes('vertical_rocket');
        is_block_horizontal_rocket = !except_busters.includes('horizontal_rocket');
    }

    function unlock_busters() {
        is_block_spinning = false;
        is_block_hammer = false;
        is_block_vertical_rocket = false;
        is_block_horizontal_rocket = false;
    }

    function try_load_field() {
        if(GAME_CONFIG.is_revive) {
            Log.log('REVIVE');

            available_steps = [];

            states.pop();

            for(let y = 0; y < field_height; y++) {
                for(let x = 0; x < field_width; x++) {
                    const cell = GAME_CONFIG.revive_state.cells[y][x];
                    if(cell != NotActiveCell) make_cell(x, y, cell.id, cell?.data);
                    else field.set_cell(x, y, NotActiveCell);

                    const element = GAME_CONFIG.revive_state.elements[y][x];
                    if(element != NullElement) make_element(x, y, element.type, element.data);
                    else field.set_element(x, y, NullElement);
                }
            }

            const state = field.save_state();
            GAME_CONFIG.revive_state.cells = state.cells;
            GAME_CONFIG.revive_state.elements = state.elements;
            states.push(GAME_CONFIG.revive_state);
        } else {
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

        if(!is_tutorial()) {
            is_block_input = true;
            search_available_steps(1, (steps) => {
                if(steps.length != 0) {
                    available_steps = copy_array_of_objects(steps);
                    is_block_input = false;
                    return;
                }
            });
        }
    }

    function complete_tutorial() {
        unlock_busters();
        unlock_cells();
        update_state();

        write_game_step_event('REMOVE_TUTORIAL', {});
        write_game_step_event('UPDATED_CELLS_STATE', get_state().cells);
                
        const completed_tutorials = GameStorage.get('completed_tutorials');
        completed_tutorials.push(current_level + 1);
        GameStorage.set('completed_tutorials', completed_tutorials);

        send_game_step();

        set_timer();
    }

    function on_swap_elements(elements: StepInfo | undefined) {    
        if(is_block_input || is_dlg_active || elements == undefined) return;
        
        if(is_first_step) {
            is_first_step = false;
            set_timer();
        }

        stop_helper();  
        
        if(!try_swap_elements(elements.from_x, elements.from_y, elements.to_x, elements.to_y)) {
            set_helper();
            return;
        }

        is_step = true;
        const is_procesed = try_combinate_before_buster_activation(elements.from_x, elements.from_y, elements.to_x, elements.to_y);
        process_game_step(is_procesed);
    }

    function on_click_activation(pos: PosXYMessage | undefined) {
        if(is_block_input || is_dlg_active || pos == undefined) return;
        
        if(is_first_step) {
            is_first_step = false;
            set_timer();
        }

        stop_helper();

        if(try_click_activation(pos.x, pos.y)) process_game_step(true);
        else {
            const element = field.get_element(pos.x, pos.y);
            if(element != NullElement) {
                if(selected_element != null && selected_element.uid == element.uid) {
                    EventBus.trigger('ON_ELEMENT_UNSELECTED', selected_element, true, true);
                    selected_element = null;
                } else {
                    let is_swap = false;
                    if(selected_element != null) {
                        EventBus.trigger('ON_ELEMENT_UNSELECTED', selected_element, true, true);
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
                        EventBus.trigger('ON_ELEMENT_SELECTED', selected_element, true, true);
                    }
                }
            }
        }
    }

    function on_activate_buster(message: NameMessage) {
        if(is_wait_until_animation_done)
            return;
        
        switch(message.name) {
            case 'SPINNING': on_activate_spinning(); break;
            case 'HAMMER': on_activate_hammer(); break;
            case 'VERTICAL_ROCKET': on_activate_vertical_rocket(); break;
            case 'HORIZONTAL_ROCKET': on_activate_horizontal_rocket(); break;
        }
    }

    function on_activate_spinning() {
        if(GameStorage.get('spinning_counts') <= 0 || is_block_input || is_dlg_active || is_block_spinning) return;
        
        busters.spinning.active = !busters.spinning.active;

        busters.hammer.active = false;
        busters.horizontal_rocket.active = false;
        busters.vertical_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');

        if(is_tutorial()) complete_tutorial();

        stop_helper();
        try_spinning_activation();
    }

    function on_activate_hammer() {
        if(GameStorage.get('hammer_counts') <= 0 || is_block_input || is_dlg_active || is_block_hammer) return;
        
        busters.hammer.active = !busters.hammer.active;

        busters.spinning.active = false;
        busters.horizontal_rocket.active = false;
        busters.vertical_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');

        if(is_tutorial()) complete_tutorial();
    }
    
    function on_activate_vertical_rocket() {
        if(GameStorage.get('vertical_rocket_counts') <= 0 || is_block_input || is_dlg_active || is_block_vertical_rocket) return;
        
        busters.vertical_rocket.active = !busters.vertical_rocket.active;

        busters.hammer.active = false;
        busters.spinning.active = false;
        busters.horizontal_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');
    
        if(is_tutorial()) complete_tutorial();
    }

    function on_activate_horizontal_rocket() {
        if(GameStorage.get('horizontal_rocket_counts') <= 0 || is_block_input || is_dlg_active || is_block_horizontal_rocket) return;
        
        busters.horizontal_rocket.active = !busters.horizontal_rocket.active;

        busters.hammer.active = false;
        busters.spinning.active = false;
        busters.vertical_rocket.active = false;

        EventBus.send('UPDATED_BUTTONS');
    
        if(is_tutorial()) complete_tutorial();
    }

    function on_revert_step() {
        if(is_wait_until_animation_done)
            return;
        stop_helper();
        revert_step();
    }

    // TODO: move in logic game step end
    function on_game_step_animation_end() {
        is_block_input = false;
        is_wait_until_animation_done = false;

        if(is_level_completed()) {
            Log.log('COMPLETED LEVEL: ', current_level + 1);
            is_block_input = true;
            const completed_levels = GameStorage.get('completed_levels');
            completed_levels.push(GameStorage.get('current_level'));
            GameStorage.set('completed_levels', completed_levels);
            add_coins(level_config.coins);
            timer.delay(1.5, false, () => EventBus.send('ON_WIN'));
        } else if(!is_have_steps() || is_gameover) {
            is_block_input = true;
            timer.delay(1.5, false, gameover);
        }

        if(is_searched && available_steps.length == 0) shuffle_field();
        
        Log.log("END STEP ANIMATION");
    }

    function on_game_timer_tick() {
        const dt = System.now() - start_game_time;
        // start_game_time++;
        const remaining_time = math.max(0, level_config.time - dt);
        get_state().remaining_time = remaining_time;
        EventBus.send('GAME_TIMER', remaining_time);
        if(remaining_time == 0) {
            timer.cancel(game_timer);
            is_block_input = true;
            if(!is_level_completed()) {
                is_gameover = true;
                if(!is_wait_until_animation_done)
                    timer.delay(3.5, false, gameover);
            }
        }
    }

    function gameover() {
        stop_helper();
        GAME_CONFIG.is_revive = false;
        GAME_CONFIG.revive_state = copy_state(1);
        EventBus.send('ON_GAME_OVER', get_state());
    }

    function load_cell(x: number, y: number) {
        const cell_config = level_config['field']['cells'][y][x];
        if(Array.isArray(cell_config)) {
            const cells = Object.assign([], cell_config);
            const cell_id = cells.pop();
            if(cell_id != undefined) make_cell(x, y, cell_id, {under_cells: cells});
        } else make_cell(x, y, cell_config);
    }

    function load_element(x: number, y: number) {
        const element = level_config['field']['elements'][y][x];
        make_element(x, y, element == RandomElement ? get_random_element_id() : element);
    }

    function get_cell_uid() {
        return "C" + game_item_counter++;
    }

    function make_cell(x: number, y: number, cell_id: CellId | typeof NotActiveCell, data?: any): Cell | typeof NotActiveCell {
        if(cell_id == NotActiveCell) return NotActiveCell;

        const activations_info = GAME_CONFIG.cell_activations[cell_id];
        
        const cell = {
            id: cell_id,
            uid: get_cell_uid(),
            type: generate_cell_type_by_cell_id(cell_id),
            activations: (activations_info != undefined) ? activations_info.activations : undefined,
            near_activations: (activations_info != undefined) ? activations_info.near_activations : undefined,
            data: Object.assign({}, data)
        };

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

    function get_element_uid() {
        return 'E' + game_item_counter++;
    }

    function make_element(x: number, y: number, element_id: ElementId | typeof NullElement, data: any = null): Element | typeof NullElement {
        if(element_id == NullElement) return NullElement;

        const element: Element = {
            uid: get_element_uid(),
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

        if(is_shuffling) return;

        const delay = is_tutorial() ? 1 : 5;
        helper_timer = timer.delay(delay, false, () => {
            set_helper_data(available_steps);

            if(helper_data != null) {
                Log.log("START HELPER");

                reset_previous_helper();

                timer.delay(1, false, () => {
                    if(helper_data == null) return;
                    
                    previous_helper_data = Object.assign({}, helper_data);
                    EventBus.trigger('ON_SET_STEP_HELPER', helper_data, true, true);

                    if(!is_tutorial()) set_helper();
                });
            }
        });
    }
    
    function stop_helper() {
        if(helper_timer == undefined) return;
        Log.log("STOP HELPER");
        
        timer.cancel(helper_timer);

        stop_all_coroutines();
        reset_current_helper();
        reset_previous_helper();
    }

    function stop_all_coroutines() {
        for(const coroutine of coroutines)
            flow.stop(coroutine);
        coroutines = [];
    }

    function reset_current_helper() {
        if(helper_data == null) return;
        Log.log("RESET CURRENT HELPER");
        helper_data = null;
    }

    function reset_previous_helper() {
        if(previous_helper_data == null) return;
        Log.log("RESET PREVIOUS HELPER");
        
        EventBus.trigger('ON_RESET_STEP_HELPER', previous_helper_data, true, true);
        previous_helper_data = null;
    }

    function set_helper_data(steps: StepInfo[]) {
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

                return Log.log("SETUP HELPER DATA: ",
                    helper_data.step.from_x,
                    helper_data.step.from_y,
                    helper_data.step.to_x,
                    helper_data.step.to_y
                );
            }
        }
    }
    
    function search_available_steps(count: number, on_end: (steps: StepInfo[]) => void) {
        is_searched = false;

        const coroutine = flow.start(() => {
            Log.log("SEARCH AVAILABLE STEPS");

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
            
            Log.log("FOUND " + steps.length + " STEPS");

            on_end(steps);
        }, {parallel: true});

        coroutines.push(coroutine);
    }

    function get_all_combinations(on_end: (combinations: CombinationInfo[]) => void) {
        // комбинации проверяются через сверку масок по всему игровому полю
        // чтобы получить что вся комбинация работает нам нужно все элементы маски взять и пройтись правилом
        // is_combined_elements, при этом допустим у нас комбинация Comb4, т.е. 4 подряд элемента должны удовлетворять правилу
        // мы можем не каждый с каждым чекать, а просто сверять 1x2, 2x3, 3x4 т.е. вызывать функцию is_combined_elements с такими вот парами, 
        // надо прикинуть вроде ведь не обязательно делать все переборы, если че потом будет несложно чуть изменить, но для оптимизации пока так
        const coroutine = flow.start(() => {
            const combinations: CombinationInfo[] = [];
            const combinations_elements: {[key in string]: boolean} = {};

            // проходимся по всем маскам с конца
            for(let mask_index = CombinationMasks.length - 1; mask_index >= 0; mask_index--) {
                
                // берем все варианты вращений маски
                let masks =  field.get_rotated_masks(mask_index);

                // проходимся по повернутым вариантам
                for(let i = 0; i < masks.length; i++) {
                    const mask = masks[i];
                    
                    // проходимся маской по полю
                    for(let y = 0; y + mask.length <= field_height; y++) {
                        for(let x = 0; x + mask[0].length <= field_width; x++) {
                            const combination = {} as CombinationInfo;
                            combination.elements = [];
                            combination.angle = i * 90;
                            
                            let is_combined = true;
                            let last_element: Element | typeof NullElement = NullElement;
                            
                            // проходимся маской по элементам в текущей позиции
                            for(let i = 0; i < mask.length && is_combined; i++) {
                                for(let j = 0; j < mask[0].length && is_combined; j++) {
                                    if(mask[i][j] == 1) {
                                        const cell = field.get_cell(x+j, y+i);
                                        const element = field.get_element(x+j, y+i);
                                        
                                        if(element == NullElement || cell == NotActiveCell || !is_available_cell_type_for_activation(cell)) {
                                            is_combined = false;
                                            break;
                                        }

                                        // проверка на участие элемента в предыдущих комбинациях
                                        if(combinations_elements[element.uid]) {
                                            is_combined = false;
                                            break;
                                        }
                                        
                                        combination.elements.push({
                                            x: x+j,
                                            y: y+i,
                                            uid: (element).uid
                                        });

                                        if(last_element != NullElement) {
                                            is_combined = is_combined_elements(last_element, element);
                                        }

                                        last_element = element;
                                    }
                                }
                            }

                            if(is_combined) {
                                combination.type = mask_index as CombinationType;
                                combinations.push(combination);

                                for(const element of combination.elements)
                                    combinations_elements[element.uid] = true;

                                return on_end(combinations);
                            }
                        }
                    }

                    flow.frames(1);
                }
            }

            return on_end(combinations);
        }, {parallel: true});
        
        coroutines.push(coroutine);
    }
    
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
            write_game_step_event('ON_BUSTER_ACTIVATION', {}, () => {
                if(is_from_buster) is_activated = try_activate_buster_element(to_x, to_y);
                if(is_to_buster) is_activated = try_activate_buster_element(from_x, from_y);
            });
        }

        return is_procesed || is_activated;
    }
    
    function try_click_activation(x: number, y: number) {
        if(try_hammer_activation(x, y)) return true;
        if(try_horizontal_rocket_activation(x, y)) return true;
        if(try_vertical_rocket_activation(x, y)) return true;

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

        if(selected_element != null) EventBus.trigger('ON_ELEMENT_UNSELECTED', selected_element, true, true);
        selected_element = null;

        let activated = false;
        if(try_activate_rocket(x, y)) activated = true;
        else if(try_activate_helicopter(x, y)) activated = true;
        else if(try_activate_dynamite(x, y)) activated = true;
        else if(try_activate_diskosphere(x, y)) activated = true;
        
        if(!activated && with_check) activated_elements.pop();

        return activated;
    }

    function try_activate_swaped_busters(x: number, y: number, other_x: number, other_y: number) {
        const element = field.get_element(x, y);
        const other_element = field.get_element(other_x, other_y);

        if(element == NullElement && other_element == NullElement) return false;
        if(element != NullElement && activated_elements.indexOf(element.uid) != -1) return false;
        if(other_element != NullElement && activated_elements.indexOf(other_element.uid) != -1) return false;

        if(element != NullElement) activated_elements.push(element.uid);
        if(other_element != NullElement) activated_elements.push(other_element.uid);

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

        if(activated) activated_elements.splice(activated_elements.length - 2, 2);

        return activated;
    }
    
    function try_activate_diskosphere(x: number, y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const element_id = get_random_element_id();
        if(element_id == NullElement) return false;

        const event_data = {} as ActivationMessage;
        write_game_step_event('DISKOSPHERE_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: diskosphere.uid};
            event_data.activated_cells = [];

            const elements = field.get_all_elements_by_type(element_id);
            for(const element of elements) field.remove_element(element.x, element.y, false, true);
            event_data.damaged_elements = elements;

            field.remove_element(x, y);
        });

        return true;
    }

    function try_activate_swaped_diskospheres(x: number, y: number, other_x: number, other_y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const other_diskosphere = field.get_element(other_x, other_y);
        if(other_diskosphere == NullElement || other_diskosphere.type != ElementId.Diskosphere) return false;
    
        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERES_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: diskosphere.uid};
            event_data.other_element = {x: other_x, y: other_y, uid: other_diskosphere.uid};
            event_data.damaged_elements = [];
            event_data.activated_cells = [];
        
            for(const element_id of GAME_CONFIG.base_elements) {
                const elements = field.get_all_elements_by_type(element_id);
                for(const element of elements) {
                    field.remove_element(element.x, element.y);
                    event_data.damaged_elements.push(element);
                }
            }

            field.remove_element(x, y);
            field.remove_element(other_x, other_y);
        });

        return true;
    }

    function try_activate_swaped_diskosphere_with_buster(x: number, y: number, other_x: number, other_y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const other_buster = field.get_element(other_x, other_y);
        if(other_buster == NullElement || ![ElementId.Helicopter, ElementId.Dynamite, ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(other_buster.type)) return false;
    
        const event_data = {} as SwapedDiskosphereActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: diskosphere.uid};
            event_data.other_element = {x: other_x, y: other_y, uid: other_buster.uid};
            event_data.activated_cells = [];
            event_data.damaged_elements = [];
            event_data.maked_elements = [];

            const element_id = get_random_element_id();
            if(element_id == NullElement) return false;

            const elements = field.get_all_elements_by_type(element_id);
            for(const element of elements) {
                field.remove_element(element.x, element.y);
                event_data.damaged_elements.push(element);

                const maked_element = make_element(element.x, element.y, other_buster.type, true);
                if(maked_element != NullElement) event_data.maked_elements.push({x: element.x, y: element.y, uid: maked_element.uid, type: maked_element.type});
            }

            field.remove_element(x, y);
            field.remove_element(other_x, other_y);

            for(const element of elements) try_activate_buster_element(element.x, element.y);
        });

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

        write_game_step_event('SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED', event_data, () => {
            const element_id = get_random_element_id();
            if(element_id == NullElement) return false;

            const elements = field.get_all_elements_by_type(element_id);
            for(const element of elements) {
                field.remove_element(element.x, element.y);
                event_data.damaged_elements.push(element);

                const maked_element = make_element(element.x, element.y, buster.type, true);
                if(maked_element != NullElement) event_data.maked_elements.push({x: element.x, y: element.y, uid: maked_element.uid, type: maked_element.type});
            }

            field.remove_element(x, y);
            field.remove_element(other_x, other_y);

            for(const element of elements) try_activate_buster_element(element.x, element.y);
        });

        return true;
    }

    function try_activate_swaped_diskosphere_with_element(x: number, y: number, other_x: number, other_y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const other_element = field.get_element(other_x, other_y);
        if(other_element == NullElement) return try_activate_diskosphere(x, y);
    
        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: diskosphere.uid};
            event_data.other_element = {x: other_x, y: other_y, uid: other_element.uid};
            event_data.damaged_elements = [];
            event_data.activated_cells = [];

            const elements = field.get_all_elements_by_type(other_element.type);
            for(const element of elements) {
                field.remove_element(element.x, element.y);
                event_data.damaged_elements.push(element);
            }

            field.remove_element(x, y);
            field.remove_element(other_x, other_y);
        });

        return true;
    }

    // WARNING: message for axis rocket need to be as for swaped
    function try_activate_rocket(x: number, y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket, ElementId.AxisRocket].includes(rocket.type)) return false;
        
        const event_data = {} as RocketActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: rocket.uid};
            event_data.damaged_elements = [];
            event_data.activated_cells = [];
            event_data.axis = rocket.type == ElementId.AxisRocket ? Axis.All : rocket.type == ElementId.VerticalRocket ? Axis.Vertical : Axis.Horizontal;
        
            if(rocket.type == ElementId.VerticalRocket || rocket.type == ElementId.AxisRocket) {
                for(let i = 0; i < field_height; i++) {
                    if(i != y) {
                        if(is_buster(x, i)) try_activate_buster_element(x, i);
                        else {
                            const removed_element = field.remove_element(x, i);
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
                            const removed_element = field.remove_element(i, y);
                            if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, uid: removed_element.uid});
                        }
                    }
                }
            }

            field.remove_element(x, y);
        });

        return true;
    }

    // TODO: refactoring
    function try_activate_swaped_rockets(x: number, y: number, other_x: number, other_y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(rocket.type)) return false;
        
        const other_rocket = field.get_element(other_x, other_y);
        if(other_rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(other_rocket.type)) return false;
        
        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_ROCKETS_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: rocket.uid};
            event_data.other_element = {x: other_x, y: other_y, uid: other_rocket.uid};
            event_data.damaged_elements = [];
            event_data.activated_cells = [];
        
            for(let i = 0; i < field_height; i++) {
                if(i != y) {
                    if(is_buster(x, i)) try_activate_buster_element(x, i);
                    else {
                        const removed_element = field.remove_element(x, i);
                        if(removed_element != undefined) event_data.damaged_elements.push({x, y: i, uid: removed_element.uid});
                    }
                }
            }
            
            for(let i = 0; i < field_width; i++) {
                if(i != x) {
                    if(is_buster(i, y)) try_activate_buster_element(i, y);
                    else {
                        const removed_element = field.remove_element(i, y);
                        if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, uid: removed_element.uid});
                    }
                }
            }

            field.remove_element(x, y);
            field.remove_element(other_x, other_y);
        });

        return true;
    }
    
    function try_activate_swaped_rocket_with_element(x: number, y: number, other_x: number, other_y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket, ElementId.AxisRocket].includes(rocket.type)) return false;

        const other_element = field.get_element(other_x, other_y);
        if(other_element != NullElement && GAME_CONFIG.buster_elements.includes(other_element.type)) return false;

        if(try_activate_rocket(x, y)) return true;

        return false;
    }

    function try_activate_helicopter(x: number, y: number) {
        const helicopter = field.get_element(x, y);
        if(helicopter == NullElement || helicopter.type != ElementId.Helicopter) return false;

        const event_data = {} as HelicopterActivationMessage;
        write_game_step_event('HELICOPTER_ACTIVATED', event_data, () => {
            event_data.activated_cells = [];
            
            event_data.element = {x, y, uid: helicopter.uid};
            event_data.damaged_elements = remove_element_by_mask(x, y, [
                [0, 1, 0],
                [1, 0, 1],
                [0, 1, 0]
            ]);

            event_data.target_item = remove_random_element(event_data.damaged_elements, get_state().targets);

            field.remove_element(x, y);
        });

        return true;
    }

    function try_activate_swaped_helicopters(x: number, y: number, other_x: number, other_y: number) {
        const helicopter = field.get_element(x, y);
        if(helicopter == NullElement || helicopter.type != ElementId.Helicopter) return false;
        
        const other_helicopter = field.get_element(other_x, other_y);
        if(other_helicopter == NullElement || other_helicopter.type != ElementId.Helicopter) return false;

        const event_data = {} as SwapedHelicoptersActivationMessage;
        event_data.target_items = [];
        event_data.activated_cells = [];

        write_game_step_event('SWAPED_HELICOPTERS_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: helicopter.uid};
            event_data.other_element = {x: other_x, y: other_y, uid: other_helicopter.uid};
            event_data.damaged_elements = remove_element_by_mask(x, y, [
                [0, 1, 0],
                [1, 0, 1],
                [0, 1, 0]
            ]);

            for(let i = 0; i < 3; i++) event_data.target_items.push(remove_random_element(event_data.damaged_elements, get_state().targets));

            field.remove_element(x, y);
            field.remove_element(other_x, other_y);
        });

        return true;
    }

    function try_activate_swaped_helicopter_with_element(x: number, y: number, other_x: number, other_y: number) {
        const helicopter = field.get_element(x, y);
        if(helicopter == NullElement || helicopter.type != ElementId.Helicopter) return false;
        
        const other_element = field.get_element(other_x, other_y);
        if(other_element == NullElement) return try_activate_helicopter(x, y);
        if(GAME_CONFIG.buster_elements.includes(other_element.type)) return false;

        const event_data = {} as SwapedHelicopterWithElementMessage;

        write_game_step_event('SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED', event_data, () => {
            event_data.activated_cells = [];
            
            event_data.element = {x, y, uid: helicopter.uid};
            event_data.other_element = {x: other_x, y: other_y, uid: other_element.uid};
            event_data.damaged_elements = remove_element_by_mask(x, y, [
                [0, 1, 0],
                [1, 0, 1],
                [0, 1, 0]
            ]);

            event_data.target_item = remove_random_element(event_data.damaged_elements, get_state().targets);

            field.remove_element(x, y);
            field.remove_element(other_x, other_y);
        });

        return true;
    }

    function try_activate_dynamite(x: number, y: number) {
        const dynamite = field.get_element(x, y);
        if(dynamite == NullElement || dynamite.type != ElementId.Dynamite) return false;
        
        const event_data = {} as ActivationMessage;
        write_game_step_event('DYNAMITE_ACTIVATED', event_data, () => {
            event_data.activated_cells = [];
            
            event_data.element = {x, y, uid: dynamite.uid};
            event_data.damaged_elements = remove_element_by_mask(x, y, [
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 1]
            ]);

            field.remove_element(x, y);
        });

        return true;
    }

    function try_activate_swaped_dynamites(x: number, y: number, other_x: number, other_y: number) {
        const dynamite = field.get_element(x, y);
        if(dynamite == NullElement || dynamite.type != ElementId.Dynamite) return false;
        
        const other_dynamite = field.get_element(other_x, other_y);
        if(other_dynamite == NullElement || other_dynamite.type != ElementId.Dynamite) return false;

        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DYNAMITES_ACTIVATED', event_data, () => {
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
            
            field.remove_element(x, y);
            field.remove_element(other_x, other_y);
        });

        return true;
    }

    function try_activate_swaped_dynamite_with_element(x: number, y: number, other_x: number, other_y: number) {
        const dynamite = field.get_element(x, y);
        if(dynamite == NullElement || dynamite.type != ElementId.Dynamite) return false;
        
        const other_element = field.get_element(other_x, other_y);
        if(other_element != NullElement && GAME_CONFIG.buster_elements.includes(other_element.type)) return false;

        try_activate_dynamite(x, y);

        return true;
    }

    function try_activate_swaped_buster_with_buster(x: number, y: number, other_x: number, other_y: number) {
        if(!is_buster(x, y) || !is_buster(other_x, other_y)) return false;
        return try_activate_buster_element(x, y, false) && try_activate_buster_element(other_x, other_y, false);
    }
    
    function try_spinning_activation() {
        if(!busters.spinning.active || GameStorage.get('spinning_counts') <= 0) return false;
        
        if(selected_element != null) {
            EventBus.trigger('ON_ELEMENT_UNSELECTED', selected_element, true, true);
            selected_element = null;
        }

        stop_helper();

        shuffle_field();
        
        GameStorage.set('spinning_counts', GameStorage.get('spinning_counts') - 1);
        busters.spinning.active = false;

        EventBus.send('UPDATED_BUTTONS');

        return true;
    }

    function is_available_for_placed(x: number, y: number) {
        const cell = field.get_cell(x, y);
        if(cell == NotActiveCell) return false;
        if(!is_available_cell_type_for_move(cell)) return false;
        const element = field.get_element(x, y);
        if(element == NullElement) return false;
        return true;
    }

    function shuffle_field() {
        Log.log("SHUFFLE FIELD");

        // collectiong elements for shuffling
        const elements = [];
        for(let y = 0; y < field_height; y++) {
            for(let x = 0; x < field_width; x++) {
                const cell = field.get_cell(x, y);
                if(cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                    const element = field.get_element(x, y);
                    if(element != NullElement)
                        elements.push(element);
                    field.set_element(x, y, NullElement);
                }
            }
        }

        // sorting elements by type
        const elements_by_type: {[key in number]: Element[]} = {};
        for(const element of elements) {
            if(elements_by_type[element.type] == undefined) {
                elements_by_type[element.type] = [];
                for(const other_element of elements) {
                    if(element.type == other_element.type) {
                        elements_by_type[element.type].push(other_element);
                    }
                }
            }
        }

        // sorting by counts for minimum combination 3x1
        const available_elements = [];
        for(const elements of Object.values(elements_by_type)) {
            if(elements.length >= 3) {
                const idx = available_elements.push([] as Element[]) - 1;
                for(let i = 0; i < 3; i++) {
                    available_elements[idx].push(elements.splice(math.random(0, elements.length - 1), 1)[0]);
                }
            }
        }

        // pick random elements if can
        const combo_elements = (available_elements.length > 0) ? available_elements[math.random(0, available_elements.length - 1)] : [];
        for(const combo_element of combo_elements) {
            elements.splice(elements.findIndex((elm) => elm.uid == combo_element.uid), 1);
        }

        // shuffling other elements
        for(let y = field_height - 1; y >= 0 && elements.length > 0; y--) {
            for(let x = 0; x < field_width && elements.length > 0; x++) {
                const cell = field.get_cell(x, y);
                if(cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                    const exclude_ids: number[] = [];
                    const neighbors = field.get_neighbor_elements(x, y);
                    for(const neighbor of neighbors) {
                        const neighbor_element = field.get_element(neighbor.x, neighbor.y);
                        if(neighbor_element != NullElement)
                            exclude_ids.push(neighbor_element.type);
                    }
                    
                    let element_idx = elements.findIndex((elm) => {
                        return (combo_elements.findIndex((combo_elm) => combo_elm.uid == elm.uid) == -1) && !exclude_ids.includes(elm.type);
                    });

                    if(element_idx == -1) element_idx = math.random(0, elements.length - 1);

                    const element = elements.splice(element_idx, 1)[0];
                    field.set_element(x, y, element);
                }
            }
        }

        // searching available place for 3x1 combo
        const available_combo_positions = [];
        for(let y = 1; y < field_height; y++) {
            for(let x = 0; x < field_width - 2; x++) {
                let available = true;
                for(let i = 0; i < 3 && available; i++) {
                    if(!is_available_for_placed(x + i, y) || (i == 2 && !is_available_for_placed(x + i, y - 1)))
                        available = false;
                }
                if(available)
                    available_combo_positions.push({x, y});
            }
        }

        for(let y = field_height - 1; y >= 0 && available_combo_positions.length == 0; y--) {
            for(let x = 0; x < field_width && available_combo_positions.length == 0; x++) {
                let available = true;
                for(let i = 0; i < 3 && available; i++) {
                    const cell = field.get_cell(x + i, y);
                    if(cell == NotActiveCell || !is_available_cell_type_for_move(cell))
                        available = false;
                    
                    if(i == 2) {
                        const top_cell = field.get_cell(x + i, y - 1);
                        if(top_cell == NotActiveCell || !is_available_cell_type_for_move(top_cell))
                            available = false;
                    }
                }
                if(available) {
                    available_combo_positions.push({x, y});
                    for(let i = x; i <= x+3; i++) {
                        for(let j = y - ((i == x+3) ? 0 : 1); j < field_height; j++) {
                            const cell = field.get_cell(i, j);
                            if(cell == NotActiveCell || !is_available_cell_type_for_move(cell))
                                break;
                            const element = field.get_element(i, j);
                            if(element != NullElement)
                                break;
                            make_element(i, j, GAME_CONFIG.base_elements[math.random(0, GAME_CONFIG.base_elements.length - 1)]);
                        }
                    }
                }
            }
        }

        // placed 3x1 combo
        const swaped_elements: (Element | typeof NullElement)[] = [];
        const combo_pos = available_combo_positions[math.random(0, available_combo_positions.length - 1)];
        const rand_id = GAME_CONFIG.base_elements[math.random(0, GAME_CONFIG.base_elements.length - 1)];
        for(let i = 0; i < 3; i++) {
            const element_to = Object.assign({}, field.get_element(combo_pos.x + i, i == 2 ? combo_pos.y - 1 : combo_pos.y));
            swaped_elements.push(element_to);
            if(combo_elements.length != 0) {
                const element_from = combo_elements.splice(math.random(0, combo_elements.length - 1), 1)[0];
                field.set_element(combo_pos.x + i, i == 2 ? combo_pos.y - 1 : combo_pos.y, element_from);
            } else make_element(combo_pos.x + i, i == 2 ? combo_pos.y - 1 : combo_pos.y, rand_id);
        }

        // fill empty cell
        for(let y = field_height - 1; y >= 0 && swaped_elements.length > 0; y--) {
            for(let x = 0; x < field_width && swaped_elements.length > 0; x++) {
                const cell = field.get_cell(x, y);
                if(cell != NotActiveCell && is_available_cell_type_for_move(cell)) {
                    const element = field.get_element(x, y);
                    if(element == NullElement)
                        field.set_element(x, y, swaped_elements.splice(math.random(0, swaped_elements.length - 1), 1)[0]);
                }
            }
        }

        const last_state = update_state();
        new_state(last_state);
        
        EventBus.send('SHUFFLE', copy_state(1));
        timer.delay(0.7, false, () => process_game_step(true));
    }
    
    function try_hammer_activation(x: number, y: number) {
        if(!busters.hammer.active || GameStorage.get('hammer_counts') <= 0) return false;

        if(selected_element != null) EventBus.trigger('ON_ELEMENT_UNSELECTED', selected_element, true, true);
        selected_element = null;       

        let is_activeted = false;
        if(is_buster(x, y)) is_activeted = try_activate_buster_element(x, y);
        else {
            const event_data = {} as ElementActivationMessage;
            event_data.x = x;
            event_data.y = y;
            event_data.activated_cells = [];
            write_game_step_event('ON_ELEMENT_ACTIVATED', event_data, () => {
                const removed_element = field.remove_element(x, y);
                if(removed_element != undefined) event_data.uid = removed_element.uid;
            });
        }

        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') - 1);
        busters.hammer.active = false;

        EventBus.send('UPDATED_BUTTONS');

        return true;
    }

    function try_horizontal_rocket_activation(x: number, y: number) {
        if(!busters.horizontal_rocket.active || GameStorage.get('horizontal_rocket_counts') <= 0) return false;

        if(selected_element != null) EventBus.trigger('ON_ELEMENT_UNSELECTED', selected_element, true, true);
        selected_element = null;
        
        const event_data = {} as RocketActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: ''};
            event_data.damaged_elements = [];
            event_data.activated_cells = [];
            event_data.axis = Axis.Horizontal;
            
            for(let i = 0; i < field_width; i++) {
                if(is_buster(i, y)) try_activate_buster_element(i, y);
                else {
                    const removed_element = field.remove_element(i, y);
                    if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, uid: removed_element.uid});
                }
            }

            GameStorage.set('horizontal_rocket_counts', GameStorage.get('horizontal_rocket_counts') - 1);
            busters.horizontal_rocket.active = false;

            EventBus.send('UPDATED_BUTTONS');
        });

        return true;
    }
    
    function try_vertical_rocket_activation(x: number, y: number) {
        if(!busters.vertical_rocket.active || GameStorage.get('vertical_rocket_counts') <= 0) return false;
    
        if(selected_element != null) EventBus.trigger('ON_ELEMENT_UNSELECTED', selected_element, true, true);
        selected_element = null;
        
        const event_data = {} as RocketActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data, () => {
            event_data.element = {x, y, uid: ''};
            event_data.damaged_elements = [];
            event_data.activated_cells = [];
            event_data.axis = Axis.Vertical;
            
            for(let i = 0; i < field_height; i++) {
                if(is_buster(x, i)) try_activate_buster_element(x, i);
                else {
                    const removed_element = field.remove_element(x, i);
                    if(removed_element != undefined) event_data.damaged_elements.push({x, y: i, uid: removed_element.uid});
                }
            }

            GameStorage.set('vertical_rocket_counts', GameStorage.get('vertical_rocket_counts') - 1);
            busters.vertical_rocket.active = false;

            EventBus.send('UPDATED_BUTTONS');
        });

        return true;
    }

    function try_swap_elements(from_x: number, from_y: number, to_x: number, to_y: number) {
        const cell_from = field.get_cell(from_x, from_y);
        const cell_to = field.get_cell(to_x, to_y);

        if(cell_from == NotActiveCell || cell_to == NotActiveCell) return false;

        // TODO: remove because this check will be in try_move below
        if(!is_available_cell_type_for_move(cell_from) || !is_available_cell_type_for_move(cell_to)) return false;

        const element_from = field.get_element(from_x, from_y);
        const element_to = field.get_element(to_x, to_y);
        
        if(element_from == NullElement) return false;

        if(selected_element != null) EventBus.trigger('ON_ELEMENT_UNSELECTED', selected_element, true, true);
        selected_element = null;

        if(is_tutorial()) {
            const tutorial_data = GAME_CONFIG.tutorials_data[current_level + 1];
            if(tutorial_data.busters != undefined) return false;
            if(tutorial_data.step != undefined) {
                const is_from = (tutorial_data.step.from_x == from_x) && (tutorial_data.step.from_y == from_y) && (tutorial_data.step.to_x == to_x) && (tutorial_data.step.to_y == to_y);
                const is_to = (tutorial_data.step.from_x == to_x) && (tutorial_data.step.from_y == to_y) && (tutorial_data.step.to_x == from_x) && (tutorial_data.step.to_y == from_y);

                if(!is_from && !is_to) return false;

                complete_tutorial();
            }
        }

        if(!field.try_move(from_x, from_y, to_x, to_y)) {
            update_state();
            EventBus.send('ON_WRONG_SWAP_ELEMENTS', {
                from: {x: from_x, y: from_y},
                to: {x: to_x, y: to_y},
                element_from: element_from,
                element_to: element_to,
                state: copy_state()
            });

            return false;
        }

        update_state();
        write_game_step_event('ON_SWAP_ELEMENTS', {
            from: {x: from_x, y: from_y},
            to: {x: to_x, y: to_y},
            element_from: element_from,
            element_to: element_to,
            state: copy_state()
        });

        return true;
    }

    function set_random(seed?: number) {
        const randomseed = seed != undefined ? seed : os.time();
        math.randomseed(randomseed);
        get_state().randomseed = randomseed;
    }

    function process_game_step(after_activation = false) {
        if(after_activation) field.process_state(ProcessMode.MoveElements);

        while(field.process_state(ProcessMode.Combinate)) {
            field.process_state(ProcessMode.MoveElements);
        }

        const last_state = update_state();

        available_steps = [];
        search_available_steps(5, (steps) => {
            is_searched = true;

            if(steps.length != 0) {
                available_steps = copy_array_of_objects(steps);
                return;
            }

            stop_helper();
            if(!is_wait_until_animation_done) shuffle_field();
        });

        if(level_config.steps != undefined && is_step) get_state().steps--;
        is_step = false;
    
        if(level_config.steps != undefined) EventBus.send('UPDATED_STEP_COUNTER', last_state.steps);

        send_game_step();
        is_wait_until_animation_done = true;

        new_state(last_state);
    }
    
    function revert_step(): boolean {
        if(states.length < 3) return false;

        states.pop(); // delete new state after game step
        states.pop(); // delete current state
        
        let previous_state = states.pop();
        if(previous_state == undefined) return false;

        Log.log("REVERT STEP");

        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = previous_state.cells[y][x];
                if(cell != NotActiveCell) {
                    if(cell.id == CellId.Lock) {
                        const cell_id = (cell.data.under_cells as CellId[]).pop();
                        if(cell_id != undefined) make_cell(x, y, cell_id, cell?.data);
                        else make_cell(x, y, CellId.Base);
                    } else field.set_cell(x, y, cell);
                } else field.set_cell(x, y, NotActiveCell);

                const element = previous_state.elements[y][x];
                if(element != NullElement) make_element(x, y, element.type, element.data);
                else field.set_element(x, y, NullElement);
            }
        }

        const state = field.save_state(); 
        previous_state.cells = state.cells;
        previous_state.elements = state.elements;
        states.push(previous_state);

        set_random(previous_state.randomseed);

        available_steps = [];
        search_available_steps(5, (steps) => {
            available_steps = copy_array_of_objects(steps);
        });

        EventBus.send('UPDATED_STATE', previous_state);

        states.push({} as GameState);
    
        set_targets(previous_state.targets);
        set_steps(previous_state.steps);
        set_random();

        return true;
    }

    function is_level_completed() {
        for(const target of get_state(1).targets) {
            if(target.uids.length < target.count) return false;
        }

        return true;
    }

    function is_have_steps() {
        if(level_config.steps != undefined) {
            return get_state().steps > 0;
        }
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

        if(element != NullElement) {
            (get_current_game_step_event().value as CombinedMessage).maked_element = {
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

        const element = field.get_element(item.x, item.y);
        if(element == NullElement) return;

        for(const target of get_state().targets) {
            if(target.type == TargetType.Element && target.id == element.type) {
                target.uids.push(element.uid);
            }
        }
    }

    function is_combined_elements(e1: Element, e2: Element) {
        if(field.get_element_type(e1.type).is_clickable || field.get_element_type(e2.type).is_clickable) return false;
        
        return field.is_combined_elements_base(e1, e2);
    }

    function on_combined(combined_element: ItemInfo, combination: CombinationInfo) {
        if(is_buster(combined_element.x, combined_element.y)) return;

        write_game_step_event('ON_COMBINED', {combined_element, combination, activated_cells: []}, () => {
            field.on_combined_base(combined_element, combination);
            try_combo(combined_element, combination);
        });
    }
    
    function on_request_element(x: number, y: number): Element | typeof NullElement {
        return make_element(x, y, get_random_element_id());
    }

    function on_moved_elements(elements: MovedInfo[]) {
        update_state();
        write_game_step_event('ON_MOVED_ELEMENTS', {elements, state: copy_state()});
    }

    function on_cell_activated(item_info: ItemInfo) {
        const cell = field.get_cell(item_info.x, item_info.y);
        if(cell == NotActiveCell) return;

        let new_cell: (Cell | typeof NotActiveCell) = NotActiveCell;

        if(bit.band(cell.type, CellType.ActionLockedNear) == CellType.ActionLockedNear) {
            if(cell.near_activations != undefined && cell.near_activations == 0) {
                if(cell.data != undefined && cell.data.under_cells != undefined && (cell.data.under_cells as CellId[]).length > 0) {
                    const cell_id = (cell.data.under_cells as CellId[]).pop();
                    if(cell_id != undefined) new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data);
                }
                
                if(new_cell == NotActiveCell) new_cell = make_cell(item_info.x, item_info.y, CellId.Base);
            }
        }

        if(bit.band(cell.type, CellType.ActionLocked) == CellType.ActionLocked) {
            if(cell.activations != undefined && cell.activations == 0) {
                if(cell.data != undefined && cell.data.under_cells != undefined && (cell.data.under_cells as CellId[]).length > 0) {
                    const cell_id = (cell.data.under_cells as CellId[]).pop();
                    if(cell_id != undefined) new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data);
                } 
                
                if(new_cell == NotActiveCell) {
                    new_cell = make_cell(item_info.x, item_info.y, CellId.Base);
                }
            }
        }

        // UPDATED CELL VIEW
        for(const [key, value] of Object.entries(get_current_game_step_event().value)) {
            if(key == 'activated_cells') {
                (value as ActivatedCellMessage[]).push({
                    x: item_info.x,
                    y: item_info.y,
                    cell: (new_cell != NotActiveCell) ? new_cell : Object.assign({}, cell)
                });
            }
        }

        // UPDATED TARGETS
        if(new_cell != NotActiveCell) {
            for(const target of get_state().targets) {
                const is_activated = cell?.activations == 0;
                const is_near_activated = cell?.near_activations == 0;
                if(target.type == TargetType.Cell && target.id == cell.id && (is_activated || is_near_activated))
                    target.uids.push(cell.uid);
            }
        }
    }

    function on_revive(steps: number) {
        GAME_CONFIG.revive_state.steps += steps;
        GAME_CONFIG.is_revive = true;
        Scene.restart();
    }

    //#endregion CALLBACKS
    //#region HELPERS
    
    function get_state(offset = 0) {
        assert(states.length - (1 + offset) >= 0);
        return states[states.length - (1 + offset)];
    }

    function new_state(last_state: GameState) {
        states.push({} as GameState);

        set_targets(last_state.targets);
        set_steps(last_state.steps);
        set_random();
    }

    function update_state() {
        const last_state = get_state();
        const field_state = field.save_state();
        last_state.cells = field_state.cells;
        last_state.element_types = field_state.element_types;
        last_state.elements = field_state.elements;

        return last_state;
    }

    function copy_state(offset = 0) {
        const from_state = get_state(offset);
        const to_state = Object.assign({}, from_state);

        to_state.cells = [];
        to_state.elements = [];

        for(let y = 0; y < field_height; y++) {
            to_state.cells[y] = [];
            to_state.elements[y] = [];
            
            for(let x = 0; x < field_width; x++) {
                to_state.cells[y][x] = from_state.cells[y][x];
                to_state.elements[y][x] = from_state.elements[y][x];
            }
        }
        
        to_state.targets = Object.assign([], from_state.targets);
        return to_state;
    }

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
    
    function remove_random_element(exclude?: ItemInfo[], targets?: TargetState[], only_base_elements = true) {
        const available_items = [];
        
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = field.get_cell(x, y);
                const element = field.get_element(x, y);

                const is_valid_cell = (cell != NotActiveCell) && (targets?.findIndex((target) => {
                    return (target.type == TargetType.Cell && target.id == cell.id && target.count > target.uids.length);
                }) != -1);
                
                const is_valid_element = (element != NullElement) && (exclude?.findIndex((item) => item.uid == element.uid) == -1) && (targets?.findIndex((target) => {
                    return (target.type == TargetType.Element && target.id == element.type && target.count > target.uids.length);
                }) != -1);
                
                if(is_valid_cell) available_items.push({x, y, uid: (element != NullElement) ? element.uid : cell.uid});
                else if(is_valid_element) {
                    if(only_base_elements && GAME_CONFIG.base_elements.includes(element.type)) available_items.push({x, y, uid: element.uid});
                    else available_items.push({x, y, uid: element.uid});
                }
            }
        }

        if(available_items.length == 0) {
            for (let y = 0; y < field_height; y++) {
                for (let x = 0; x < field_width; x++) {
                    const cell = field.get_cell(x, y);
                    const element = field.get_element(x, y);
                    const is_valid_cell = (cell != NotActiveCell && cell.id != CellId.Base);
                    const is_valid_element = (element != NullElement) && (exclude?.findIndex((item) => item.uid == element.uid) == -1);
                    
                    if(is_valid_cell) available_items.push({x, y, uid: (element != NullElement) ? element.uid : cell.uid});
                    else if(is_valid_element) {
                        if(only_base_elements && GAME_CONFIG.base_elements.includes(element.type)) available_items.push({x, y, uid: element.uid});
                        else available_items.push({x, y, uid: element.uid});
                    }
                }
            }
        }

        if(available_items.length == 0) return NullElement;

        const target = available_items[math.random(0, available_items.length - 1)];
        if(is_buster(target.x, target.y)) try_activate_buster_element(target.x, target.y);
        else field.remove_element(target.x, target.y, false, true);


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
                            const removed_element = field.remove_element(j, i, is_near_activation);
                            if(removed_element != undefined) removed_elements.push({x: j, y: i, uid: removed_element.uid});
                        }
                    }
                }
            }
        }

        return removed_elements;
    }

    function clear_game_step_events() {
        game_step_events = {} as GameStepEventBuffer;
    }

    function write_game_step_event<T extends MessageId>(message_id: T, message: Messages[T], inside_logic ?: () => void) {
        const index = game_step_events.push({key: message_id, value: message}) - 1;
        current_game_step_event.push(index);
        if(inside_logic != undefined) inside_logic();
        game_step_event_end();
    }
    
    function get_current_game_step_event() {
        return game_step_events[current_game_step_event[current_game_step_event.length - 1]];
    }

    function game_step_event_end() {
        current_game_step_event.pop();
    }

    function send_game_step() {
        EventBus.send('ON_GAME_STEP', { events: game_step_events, state: get_state()});
        clear_game_step_events();
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
        busters: {
            hammer: number,
            spinning: number,
            horizontal_rocket: number,
            vertical_rocket: number
        },
        coins: number,
        additional_element: ElementId,
        exclude_element: ElementId,
        field: (string | { cell: CellId | undefined, element: ElementId | undefined })[][]
    }[];
    
    for(const level_data of levels) {
        const level: Level = {
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

            coins: level_data.coins,

            additional_element: level_data.additional_element,
            exclude_element: level_data.exclude_element,

            time: level_data.time,
            steps: level_data.steps,
            targets: [] as TargetState[],

            busters: {
                hammer: {
                    name: 'hammer',
                    counts: level_data.busters.hammer,
                    active: false
                },
                spinning: {
                    name: 'spinning',
                    counts: level_data.busters.spinning,
                    active: false
                },
                horizontal_rocket: {
                    name: 'horizontal_rocket',
                    counts: level_data.busters.horizontal_rocket,
                    active: false
                },
                vertical_rocket: {
                    name: 'vertical_rocket',
                    counts: level_data. busters.vertical_rocket,
                    active: false
                }
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
                    if(data.element != undefined) {
                        level.field.elements[y][x] = data.element;
                    } else level.field.elements[y][x] = RandomElement;
                    
                    if(data.cell != undefined) {
                        level.field.cells[y][x] = [CellId.Base, data.cell];
                        if(level.field.elements[y][x] == RandomElement && (data.cell == CellId.Stone || data.cell == CellId.Box))
                            level.field.elements[y][x] = NullElement;
                    } else level.field.cells[y][x] = CellId.Base;
                }
            }
        }

        for(const target_data of level_data.targets) {
            let target;
            if(target_data.type.element != undefined) {
                target = {
                    id: target_data.type.element as number,
                    type: TargetType.Element,
                    count: 0,
                    uids: []
                };
            }

            if(target_data.type.cell != undefined) {
                target = {
                    id: target_data.type.cell as number,
                    type: TargetType.Cell,
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