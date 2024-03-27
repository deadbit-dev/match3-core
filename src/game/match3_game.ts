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

import { MessageId, Messages } from '../modules/modules_const';

import { is_valid_pos } from '../utils/math_utils';

import { CellId, ElementId,
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
    let activated_elements: number[] = [];
    let game_step_events: GameStepEventBuffer = [];
    let selected_element: ItemInfo | null = null;
    let previous_helper_data: StepHelperMessage | null = null;
    let helper_data: StepHelperMessage | null = null;
    let helper_timer: hash;
    let randomseed: number;
    let coroutines: Coroutine[] = [];
    let is_simulating = false;
    let step_counter = 0;
    let is_step = false;
    let is_block_input = false;

    function init() {
        field.init();

        field.set_callback_is_can_move(is_can_move);
        field.set_callback_on_moved_elements(on_moved_elements);
        field.set_callback_on_combinated(on_combined);
        field.set_callback_on_damaged_element(on_damaged_element);
        field.set_callback_on_request_element(on_request_element);
        field.set_callback_on_cell_activated(on_cell_activated);

        set_element_types();
        set_busters();
        set_events();
        set_random();
        set_targets();
    }
    
    //#endregion MAIN
    //#region SETUP         

    function set_element_types() {
        for(const [key, value] of Object.entries(GAME_CONFIG.element_database)) {
            const element_id = tonumber(key) as ElementId;
            field.set_element_type(element_id, {
                index: element_id,
                is_clickable: value.type.is_clickable,
                is_movable: value.type.is_movable
            });
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
        EventBus.on('LOAD_FIELD', load_field);

        EventBus.on('SET_HELPER', set_helper);

        EventBus.on('SWAP_ELEMENTS', (elements) => {
            if(is_block_input || elements == undefined) return;

            stop_helper();
            
            if(!try_swap_elements(elements.from_x, elements.from_y, elements.to_x, elements.to_y)) return;

            const is_procesed = try_combinate_before_buster_activation(elements.from_x, elements.from_y, elements.to_x, elements.to_y);

            is_step = true;

            process_game_step(is_procesed);
        });

        // TODO: refactoring
        EventBus.on('CLICK_ACTIVATION', (pos) => {
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
        });

        EventBus.on('ACTIVATE_SPINNING', () => {
            if(is_block_input) return;
            stop_helper();
            try_spinning_activation();
        });
        
        EventBus.on('REVERT_STEP', revert_step);

        EventBus.on('ON_GAME_STEP_ANIMATION_END', () => {
            if(is_level_completed()) EventBus.send('ON_LEVEL_COMPLETED');
            else if(step_counter <= 0) EventBus.send('ON_GAME_OVER');

            is_block_input = true;
            search_all_available_steps((steps) => {
                if(steps.length != 0) {
                    is_block_input = false;
                    return;
                }
                
                stop_helper();
                shuffle_field();
            });
        });
    }

    function set_targets() {
        step_counter = level_config.steps;
        for(const target of level_config.targets)
            target.uids = [] as number[];
    }

    function load_field() {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                load_cell(x, y);
                load_element(x, y);
            }
        }

        const state = field.save_state();
        previous_states.push(state);
        
        EventBus.send('ON_LOAD_FIELD', state);
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
        make_element(x, y, level_config['field']['elements'][y][x]);
    }

    function make_cell(x: number, y: number, cell_id: CellId | typeof NotActiveCell, data?: any): Cell | typeof NotActiveCell {
        if(cell_id == NotActiveCell) return NotActiveCell;
        
        const config = GAME_CONFIG.cell_database[cell_id];
        const cell = {
            id: cell_id,
            uid: game_item_counter++,
            type: config.type,
            cnt_acts: config.cnt_acts,
            cnt_near_acts: config.cnt_near_acts,
            data: Object.assign({}, data)
        };

        cell.data.is_render_under_cell = config.is_render_under_cell;
        cell.data.z_index = config.z_index;
        
        field.set_cell(x, y, cell);

        return cell;
    }

    function make_element(x: number, y: number, element_id: ElementId | typeof NullElement, data: any = null): Element | typeof NullElement {
        if(element_id == NullElement) return NullElement;
        
        const element: Element = {
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
        search_helper_combination();
        
        helper_timer = timer.delay(5, false, () => {
            if(helper_data != null) {
                print("[GAME]: set helper");

                reset_helper();

                previous_helper_data = Object.assign({}, helper_data);
                EventBus.send('ON_SET_STEP_HELPER', Object.assign({}, helper_data));
            }
        });
    }
    
    function stop_helper() {
        if(helper_timer == undefined) return;

        print("[GAME]: stop helper");
    
        for(const coroutine of coroutines) {
            flow.stop(coroutine);
        }
        
        timer.cancel(helper_timer);
        reset_helper();
    }

    function reset_helper() {
        if(previous_helper_data == null) return;

        print("[GAME]: reset helper");
        
        EventBus.send('ON_RESET_STEP_HELPER', Object.assign({}, previous_helper_data));
        previous_helper_data = null;
    }

    function search_helper_combination() {
        print("[GAME]: search combination");

        search_all_available_steps((steps: StepInfo[]) => {
            search_best_step(steps, (best_step) => {
                const combination = get_step_combination(best_step);
                if(combination != undefined) {
                    for(const element of combination.elements) {
                        const is_from = (element.x == best_step.from_x && element.y == best_step.from_y);
                        const is_to = (element.x == best_step.to_x && element.y == best_step.to_y);
                        if(is_from || is_to) {
                            helper_data = {
                                step: best_step,
                                elements: combination.elements,
                                combined_element: element
                            };

                            print("[GAME]: set helper combination");

                            return;
                        }
                    }
                }
            });
        });
    }
    
    function search_all_available_steps(on_end: (steps: StepInfo[]) => void) {
        const coroutine = flow.start(() => {
            print("[GAME]: search available steps");

            const steps: StepInfo[] = [];
            for(let y = 0; y < field_height; y++) {
                for(let x = 0; x < field_width; x++) {
                    if(is_buster(x, y)) steps.push({from_x: x, from_y: y, to_x: x, to_y: y});
                    if(is_valid_pos(x + 1, y, field_width, field_height) && is_can_move(x, y, x + 1, y))
                        steps.push({from_x: x, from_y: y, to_x: x + 1, to_y: y});
                    if(is_valid_pos(x, y + 1, field_width, field_height) && is_can_move(x, y, x, y + 1))
                        steps.push({from_x: x, from_y: y, to_x: x, to_y: y + 1});

                    flow.frames(1);
                }
            }
            
            print("[GAME]: found ", steps.length, " steps");
            on_end(steps);
        });

        coroutines.push(coroutine);
    }

    function search_best_step(steps: StepInfo[], on_end: (step: StepInfo) => void) {
        const coroutine = flow.start(() => {
            let best_step = {} as StepInfo;
            let max_damaged_elements = 0;
            for(const step of steps) {
                const count_damaged_elements = get_count_damaged_elements_of_step(step);
                if(count_damaged_elements > max_damaged_elements) {
                    max_damaged_elements = count_damaged_elements;
                    best_step = step;
                }

                flow.frames(1);
            }

            print("[GAME]: found best step (", best_step.from_x, best_step.from_y, best_step.to_x, best_step.to_y, ")");
            on_end(best_step);
        });

        coroutines.push(coroutine);
    }

    function get_count_damaged_elements_of_step(step: StepInfo) {
        let count_damaged_elements = 0;
        field.set_callback_on_damaged_element((item: ItemInfo) => {
            on_damaged_element(item);
            count_damaged_elements++;
        });

        simulate_game_step(step);
        
        field.set_callback_on_damaged_element(on_damaged_element);

        return count_damaged_elements;
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
        const is_procesed = field.process_state(ProcessMode.Combinate);

        let is_activated = false;
        if((is_from_buster || is_to_buster)) {
            if(is_procesed) {
                write_game_step_event('ON_BUSTER_ACTIVATION', {});
                if(is_from_buster) is_activated = try_activate_buster_element(to_x, to_y);
                if(is_to_buster) is_activated = try_activate_buster_element(from_x, from_y);
            } else is_activated = try_activate_swaped_busters(to_x, to_y, from_x, from_y);
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

    function try_activate_rocket(x: number, y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket, ElementId.AxisRocket].includes(rocket.type)) return false;
        
        const event_data = {} as ActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data);

        event_data.element = {x, y, uid: rocket.uid};
        event_data.damaged_elements = [];
        event_data.activated_cells = [];
     
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
        search_all_available_steps((steps) => {
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
        
        const event_data = {} as ActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data);
        
        event_data.element = {} as ItemInfo;
        event_data.damaged_elements = [];
        event_data.activated_cells = [];
        
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
        
        const event_data = {} as ActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data);
        
        event_data.element = {} as ItemInfo;
        event_data.damaged_elements = [];
        event_data.activated_cells = [];
        
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
        
        if((element_from == NullElement) || (element_to == NullElement)) return false;

        EventBus.send('ON_ELEMENT_UNSELECTED', Object.assign({}, selected_element));
        selected_element = null;
        
        if(!field.try_move(from_x, from_y, to_x, to_y)) {
            EventBus.send('ON_WRONG_SWAP_ELEMENTS', {
                element_from: {x: from_x, y: from_y, uid: element_from.uid},
                element_to: {x: to_x, y: to_y, uid: element_to.uid}
            });

            return false;
        }
        
        write_game_step_event('ON_SWAP_ELEMENTS', {
            element_from: {x: to_x, y: to_y, uid: element_to.uid},
            element_to: {x: from_x, y: from_y, uid: element_from.uid}
        });

        return true;
    }

    function set_random(seed?: number) {
        randomseed = seed != undefined ? seed : os.time();
        previous_randomseeds.push(randomseed);
        print("set_random: ", randomseed);
        math.randomseed(randomseed);
    }

    function simulate_game_step(step: StepInfo) {
        const previous_state = field.save_state();

        is_simulating = true;
        
        let after_activation = false;

        if(step.from_x == step.to_x && step.from_y == step.to_y) {
            after_activation = try_click_activation(step.from_x, step.from_y);
            if(!after_activation) return;
        } else {
            if(!field.try_move(step.from_x, step.from_y, step.to_x, step.to_y)) return;
            after_activation = try_combinate_before_buster_activation(step.from_x, step.from_y, step.to_x, step.to_y);
        }
        
        if(after_activation) field.process_state(ProcessMode.MoveElements);

        while(field.process_state(ProcessMode.Combinate))
            field.process_state(ProcessMode.MoveElements);
        
        field.load_state(previous_state);

        is_simulating = false;

        math.randomseed(randomseed);
    }

    function process_game_step(after_activation = false) {
        if(after_activation) field.process_state(ProcessMode.MoveElements);

        while(field.process_state(ProcessMode.Combinate))
            field.process_state(ProcessMode.MoveElements);

        previous_states.push(field.save_state());

        if(is_step) step_counter--;
        is_step = false;
    
        EventBus.send('UPDATED_STEP_COUNTER', step_counter);

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
        print("previous_seed: ", previous_seed);
        set_random(previous_seed);

        EventBus.send('ON_REVERT_STEP', {current_state, previous_state});

        return true;
    }

    function is_level_completed() {
        for(const target of level_config.targets) {
            print(target.uids.length, target.count, target.type);
            if(target.uids.length < target.count) return false;
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
            if(target.type == element.type) {
                print('damage: ', target.type, element.uid);
                target.uids.push(element.uid);
            }
        }
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
        }
    }

    //#endregion CALLBACKS
    //#region HELPERS    

    function is_buster(x: number, y: number) {
        return field.try_click(x, y);
    }

    function get_random_element_id(): ElementId | typeof NullElement {
        let sum = 0;
        for(const [_, value] of Object.entries(GAME_CONFIG.element_database))
            sum += value.percentage;

        let bins: number[] = [];
        for(const [_, value] of Object.entries(GAME_CONFIG.element_database)) {
            const normalized_value = value.percentage / sum;
            if(bins.length == 0) bins.push(normalized_value);
            else bins.push(normalized_value + bins[bins.length - 1]);
        }

        const rand = math.random();
    
        for(let [index, value] of bins.entries()) {
            if(value >= rand) {
                for(const [key, _] of Object.entries(GAME_CONFIG.element_database))
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