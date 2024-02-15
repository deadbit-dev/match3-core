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

import { MessageId, Messages } from '../modules/modules_const';

import { CellId, ElementId,
    GameStepEventBuffer,
    ActivationMessage,
    SwapedActivationMessage,
    HelicopterActivationMessage,
    SwapedHelicoptersActivationMessage,
    SwapedDiskosphereActivationMessage
} from '../main/game_config';

import {
    Field,
    Cell,
    Element,
    NullElement,
    NotActiveCell,
    DamagedInfo,
    CombinationType,
    CombinationInfo,
    ProcessMode,
    ItemInfo,
    GameState,
    CellType
} from './match3_core';

export function Game() {
    //#region CONFIG        

    const level_config = GAME_CONFIG.levels[GameStorage.get('current_level')];
    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const move_direction = level_config['field']['move_direction'];
    const busters = level_config['busters'];

    //#endregion CONFIGURATIONS
    //#region MAIN          

    const field = Field(field_width, field_height);

    let game_item_counter = 0;
    let previous_states: GameState[] = [];
    let activated_elements: number[] = [];
    let game_step_events: GameStepEventBuffer = [];
    
    function init() {
        field.init();

        field.set_callback_is_can_move(is_can_move);
        field.set_callback_on_move_element(on_move_element);
        field.set_callback_on_combinated(on_combined);
        field.set_callback_on_damaged_element(on_damaged_element);
        field.set_callback_on_request_element(on_request_element);
        field.set_callback_on_cell_activated(on_cell_activated);

        set_element_types();
        set_busters();
        set_events();   
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
        GameStorage.set('hammer_counts', 5);
        busters.hammer_active = (GameStorage.get('hammer_counts') <= 0);

        EventBus.send('UPDATED_HAMMER');
    }
    
    function set_events() {
        EventBus.on('LOAD_FIELD', load_field);

        EventBus.on('SWAP_ELEMENTS', (elements) => {
            if(elements == undefined) return;
            if(!try_swap_elements(elements.from_x, elements.from_y, elements.to_x, elements.to_y)) return;
            
            try_activate_swaped_busters(elements.to_x, elements.to_y, elements.from_x, elements.from_y);
            process_game_step();
        });

        EventBus.on('CLICK_ACTIVATION', (pos) => {
            if(pos == undefined) return;

            try_click_activation(pos.x, pos.y);
            process_game_step();
        });

        EventBus.on('REVERT_STEP', revert_step);
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

        EventBus.send('ON_SET_FIELD', state);
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

    function make_cell(x: number, y: number, cell_id: CellId | typeof NotActiveCell, data?: any, with_event = false): Cell | typeof NotActiveCell {
        if(cell_id == NotActiveCell) return NotActiveCell;
        
        const config = GAME_CONFIG.cell_database[cell_id];
        const cell = {
            id: game_item_counter++,
            type: config.type,
            cnt_acts: config.cnt_acts,
            cnt_near_acts: config.cnt_near_acts,
            data: Object.assign({ variety: cell_id}, data)
        };
        
        field.set_cell(x, y, cell);

        return cell;
    }

    function make_element(x: number, y: number, element_id: ElementId | typeof NullElement, data: any = null): Element | typeof NullElement {
        if(element_id == NullElement) return NullElement;
        
        const element: Element = {
            id: game_item_counter++,
            type: element_id,
            data: data
        };

        field.set_element(x, y, element);

        return element;
    }

    //#endregion SETUP
    //#region ACTIONS       
    
    function try_click_activation(x: number, y: number) {
        if(try_hammer_activation(x, y)) return true;
        if(field.try_click(x, y) && try_activate_buster_element(x, y)) return true;

        return false;
    }

    function try_activate_buster_element(x: number, y: number) {
        if(try_activate_vertical_rocket(x, y)) return true;
        if(try_activate_horizontal_rocket(x, y)) return true;
        if(try_activate_axis_rocket(x, y)) return true;
        if(try_activate_helicopter(x, y)) return true;
        if(try_activate_dynamite(x, y)) return true;
        if(try_activate_diskosphere(x, y)) return true;

        return false;
    }

    function try_activate_swaped_busters(x: number, y: number, other_x: number, other_y: number) {
        if(try_activate_swaped_buster_with_diskosphere(x, y, other_x, other_y)) return true;
        
        if(try_activate_swaped_diskospheres(x, y, other_x, other_y)) return true;
        if(try_activate_swaped_diskosphere_with_buster(x, y, other_x, other_y)) return true;
        if(try_activate_swaped_diskosphere_with_element(x, y, other_x, other_y)) return true;
        if(try_activate_swaped_diskosphere_with_element(other_x, other_y, x, y)) return true;
        
        if(try_activate_swaped_rockets(x, y, other_x, other_y)) return true;
        if(try_activate_swaped_rocket_with_element(x, y, other_x, other_y)) return true;
        if(try_activate_swaped_rocket_with_element(other_x, other_y, x, y)) return true;
        
        if(try_activate_swaped_helicopters(x, y, other_x, other_y)) return true;
        if(try_activate_swaped_helicopter_with_element(x, y, other_x, other_y)) return true;
        if(try_activate_swaped_helicopter_with_element(other_x, other_y, x, y)) return true;
        
        if(try_activate_swaped_dynamites(x, y, other_x, other_y)) return true;
        if(try_activate_swaped_dynamite_with_element(x, y, other_x, other_y)) return true;       
        if(try_activate_swaped_dynamite_with_element(other_x, other_y, x, y)) return true;

        if(try_activate_swaped_buster_with_buster(x, y, other_x, other_y)) return true;

        return false;
    }
    
    function try_activate_diskosphere(x: number, y: number) {
        const diskosphere = field.get_element(x, y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        const element_id = get_random_element_id();
        if(element_id == NullElement) return false;

        if(activated_elements.findIndex((element_id) => element_id == diskosphere.id) != -1) return false;
        activated_elements.push(diskosphere.id);

        const event_data = {} as ActivationMessage;
        write_game_step_event('DISKOSPHERE_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: diskosphere.id};

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
    
        if(activated_elements.findIndex((element_id) => element_id == diskosphere.id) != -1) return false;
        if(activated_elements.findIndex((element_id) => element_id == other_diskosphere.id) != -1) return false;
        
        activated_elements.push(diskosphere.id);
        activated_elements.push(other_diskosphere.id);

        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERES_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: diskosphere.id};
        event_data.other_element = {x: other_x, y: other_y, id: other_diskosphere.id};
        event_data.damaged_elements = [];
    
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
        if(other_buster == NullElement || ![ElementId.Dynamite, ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(other_buster.type)) return false;
    
        if(activated_elements.findIndex((element_id) => element_id == diskosphere.id) != -1) return false;
        if(activated_elements.findIndex((element_id) => element_id == other_buster.id) != -1) return false;
        
        activated_elements.push(diskosphere.id);
        activated_elements.push(other_buster.id);

        const event_data = {} as SwapedDiskosphereActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: diskosphere.id};
        event_data.other_element = {x: other_x, y: other_y, id: other_buster.id};
        event_data.damaged_elements = [];
        event_data.maked_elements = [];

        const element_id = get_random_element_id();
        if(element_id == NullElement) return false;

        const elements = field.get_all_elements_by_type(element_id);
        for(const element of elements) {
            field.remove_element(element.x, element.y, true, false);
            event_data.damaged_elements.push(element);

            const maked_element = make_element(element.x, element.y, other_buster.type, true);
            if(maked_element != NullElement) event_data.maked_elements.push({x: element.x, y: element.y, id: maked_element.id, type: maked_element.type});
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        print("DISKO");

        for(const element of elements) try_activate_buster_element(element.x, element.y);

        return true;
    }
    
    function try_activate_swaped_buster_with_diskosphere(x: number, y: number, other_x: number, other_y: number) {
        const buster = field.get_element(x, y);
        if(buster == NullElement || GAME_CONFIG.base_elements.includes(buster.type)) return false;
    
        const diskosphere = field.get_element(other_x, other_y);
        if(diskosphere == NullElement || diskosphere.type != ElementId.Diskosphere) return false;
    
        if(activated_elements.findIndex((element_id) => element_id == buster.id) != -1) return false;
        if(activated_elements.findIndex((element_id) => element_id == diskosphere.id) != -1) return false;
        
        activated_elements.push(buster.id);
        activated_elements.push(diskosphere.id);

        const event_data = {} as SwapedDiskosphereActivationMessage;
        event_data.element = {x: other_x, y: other_y, id: diskosphere.id};
        event_data.other_element = {x, y, id: buster.id};
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
            if(maked_element != NullElement) event_data.maked_elements.push({x: element.x, y: element.y, id: maked_element.id, type: maked_element.type});
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
    
        if(activated_elements.findIndex((element_id) => element_id == diskosphere.id) != -1) return false;
        activated_elements.push(diskosphere.id);

        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: diskosphere.id};
        event_data.other_element = {x: other_x, y: other_y, id: other_element.id};
        event_data.damaged_elements = [];

        const elements = field.get_all_elements_by_type(other_element.type);
        for(const element of elements) {
            field.remove_element(element.x, element.y, true, false);
            event_data.damaged_elements.push(element);
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }

    //TODO: refactoring - combine vertical and horizontal rocket with Direction

    function try_activate_vertical_rocket(x: number, y: number) { 
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || rocket.type != ElementId.VerticalRocket) return false;
    
        if(activated_elements.findIndex((element_id) => element_id == rocket.id) != -1) return false;
        activated_elements.push(rocket.id);

        print("ROCKET");
        
        const event_data = {} as ActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: rocket.id};
        event_data.damaged_elements = [];
        
        for(let i = 0; i < field_height; i++) {
            if(i != y) {
                if(is_buster(x, i)) try_activate_buster_element(x, i);
                else {
                    const removed_element = field.remove_element(x, i, true, false);
                    if(removed_element != undefined) event_data.damaged_elements.push({x, y: i, id: removed_element.id});
                }
            }
        }

        field.remove_element(x, y, true, false);

        return true;
    }
    
    function try_activate_horizontal_rocket(x: number, y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || rocket.type != ElementId.HorizontalRocket) return false;

        if(activated_elements.findIndex((element_id) => element_id == rocket.id) != -1) return false;
        activated_elements.push(rocket.id);

        const event_data = {} as ActivationMessage;
        write_game_step_event('ROCKET_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: rocket.id};
        event_data.damaged_elements = [];
        
        for(let i = 0; i < field_width; i++) {
            if(i != x) {
                if(is_buster(i, y)) try_activate_buster_element(i, y);
                else {
                    const removed_element = field.remove_element(i, y, true, false);
                    if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, id: removed_element.id});
                }
            }
        }

        field.remove_element(x, y, true, false);

        return true;
    }
    
    function try_activate_swaped_rocket_with_element(x: number, y: number, other_x: number, other_y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(rocket.type)) return false;

        const other_element = field.get_element(other_x, other_y);
        if(other_element == NullElement || !GAME_CONFIG.base_elements.includes(other_element.type)) return false;
        
        if(try_activate_vertical_rocket(x, y)) return true;
        if(try_activate_horizontal_rocket(x, y)) return true;

        return false;
    }
    
    function try_activate_swaped_rockets(x: number, y: number, other_x: number, other_y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(rocket.type)) return false;
        
        const other_rocket = field.get_element(other_x, other_y);
        if(other_rocket == NullElement || ![ElementId.HorizontalRocket, ElementId.VerticalRocket].includes(other_rocket.type)) return false;
        
        if(activated_elements.findIndex((element_id) => element_id == rocket.id) != -1) return false;
        if(activated_elements.findIndex((element_id) => element_id == other_rocket.id) != -1) return false;
        
        activated_elements.push(rocket.id);
        activated_elements.push(other_rocket.id);
        
        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_ROCKETS_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: rocket.id};
        event_data.other_element = {x: other_x, y: other_y, id: other_rocket.id};
        event_data.damaged_elements = [];
    
        for(let i = 0; i < field_height; i++) {
            if(i != y) {
                if(is_buster(x, i)) try_activate_buster_element(x, i);
                else {
                    const removed_element = field.remove_element(x, i, true, false);
                    if(removed_element != undefined) event_data.damaged_elements.push({x, y: i, id: removed_element.id});
                }
            }
        }
        
        for(let i = 0; i < field_width; i++) {
            if(i != x) {
                if(is_buster(i, y)) try_activate_buster_element(i, y);
                else {
                    const removed_element = field.remove_element(i, y, true, false);
                    if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, id: removed_element.id});
                }
            }
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }

   

    function try_activate_axis_rocket(x: number, y: number) {
        const rocket = field.get_element(x, y);
        if(rocket == NullElement || rocket.type != ElementId.AxisRocket) return false;

        if(activated_elements.findIndex((element_id) => element_id == rocket.id) != -1) return false;
        activated_elements.push(rocket.id);

        const event_data = {} as ActivationMessage;
        write_game_step_event('AXIS_ROCKET_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: rocket.id};
        event_data.damaged_elements = [];
        
        for(let i = 0; i < field_height; i++) {
            if(i != y) {
                if(is_buster(x, i)) try_activate_buster_element(x, i);
                else {
                    const removed_element = field.remove_element(x, i, true, false);
                    if(removed_element != undefined) event_data.damaged_elements.push({x, y: i, id: removed_element.id});
                }
            }
        }
        
        for(let i = 0; i < field_width; i++) {
            if(i != x) {
                if(is_buster(i, y)) try_activate_buster_element(i, y);
                else {
                    const removed_element = field.remove_element(i, y, true, false);
                    if(removed_element != undefined) event_data.damaged_elements.push({x: i, y, id: removed_element.id});
                }
            }
        }

        field.remove_element(x, y, true, false);

        return true;
    }

    function try_activate_helicopter(x: number, y: number) {
        const helicopter = field.get_element(x, y);
        if(helicopter == NullElement || helicopter.type != ElementId.Helicopter) return false;

        if(activated_elements.findIndex((element_id) => element_id == helicopter.id) != -1) return false;
        activated_elements.push(helicopter.id);
        
        const event_data = {} as HelicopterActivationMessage;
        write_game_step_event('HELICOPTER_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: helicopter.id};
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
    
        if(activated_elements.findIndex((element_id) => element_id == helicopter.id) != -1) return false;
        if(activated_elements.findIndex((element_id) => element_id == other_helicopter.id) != -1) return false;
        
        activated_elements.push(helicopter.id);
        activated_elements.push(other_helicopter.id);

        const event_data = {} as SwapedHelicoptersActivationMessage;
        event_data.target_elements = [];

        write_game_step_event('SWAPED_HELICOPTERS_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: helicopter.id};
        event_data.other_element = {x: other_x, y: other_y, id: other_helicopter.id};
        event_data.damaged_elements = remove_element_by_mask(x, y, [
            [0, 1, 0],
            [1, 0, 1],
            [0, 1, 0]
        ]);

        for(let i = 0; i < 3; i++) {
            event_data.target_elements.push(remove_random_element(event_data.damaged_elements));
        }

        field.remove_element(x, y, true, false);
        field.remove_element(other_x, other_y, true, false);

        return true;
    }

    function try_activate_swaped_helicopter_with_element(x: number, y: number, other_x: number, other_y: number) {
        const helicopter = field.get_element(x, y);
        if(helicopter == NullElement || helicopter.type != ElementId.Helicopter) return false;
        
        const other_element = field.get_element(other_x, other_y);
        if(other_element == NullElement || !GAME_CONFIG.base_elements.includes(other_element.type)) return false;

        try_activate_helicopter(x, y);

        return true;
    }

    function try_activate_dynamite(x: number, y: number) {
        const dynamite = field.get_element(x, y);
        if(dynamite == NullElement || dynamite.type != ElementId.Dynamite) return false;
        
        if(activated_elements.findIndex((element_id) => element_id == dynamite.id) != -1) return false;
        activated_elements.push(dynamite.id);

        const event_data = {} as ActivationMessage;
        write_game_step_event('DYNAMITE_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: dynamite.id};
        event_data.damaged_elements = remove_element_by_mask(x, y, [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ], true);

        field.remove_element(x, y, true, false);

        return true;
    }

    function try_activate_swaped_dynamites(x: number, y: number, other_x: number, other_y: number) {
        const dynamite = field.get_element(x, y);
        if(dynamite == NullElement || dynamite.type != ElementId.Dynamite) return false;
        
        const other_dynamite = field.get_element(other_x, other_y);
        if(other_dynamite == NullElement || other_dynamite.type != ElementId.Dynamite) return false;
    
        if(activated_elements.findIndex((element_id) => element_id == dynamite.id) != -1) return false;
        if(activated_elements.findIndex((element_id) => element_id == other_dynamite.id) != -1) return false;

        activated_elements.push(dynamite.id);
        activated_elements.push(other_dynamite.id);

        const event_data = {} as SwapedActivationMessage;
        write_game_step_event('SWAPED_DYNAMITES_ACTIVATED', event_data);
        
        event_data.element = {x, y, id: dynamite.id};
        event_data.other_element = {x: other_x, y: other_y, id: other_dynamite.id};
        event_data.damaged_elements = remove_element_by_mask(x, y, [
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1]
        ], true);
        
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
        
        try_activate_buster_element(x, y);
        try_activate_buster_element(other_x, other_y);
        
        return true;
    }
    
    function try_hammer_activation(x: number, y: number) {
        if(!busters.hammer_active || GameStorage.get('hammer_counts') <= 0) return false;
        
        // FIXME: for buster under wall
        if(is_buster(x, y)) try_activate_buster_element(x, y);
        else {
            const removed_element = field.remove_element(x, y, true, false);
            if(removed_element == undefined) return false;
            
            write_game_step_event('HAMMER_ACTIVATED', {x, y, id: removed_element.id});
        }
        
        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') - 1);
        busters.hammer_active = false;

        return true;
    }

    function try_swap_elements(from_x: number, from_y: number, to_x: number, to_y: number) {
        const cell_from = field.get_cell(from_x, from_y);
        const cell_to = field.get_cell(to_x, to_y);

        if(cell_from == NotActiveCell || cell_to == NotActiveCell) return false;
        if(!field.is_available_cell_type_for_move(cell_from) || !field.is_available_cell_type_for_move(cell_to)) return false;

        const element_from = field.get_element(from_x, from_y);
        const element_to = field.get_element(to_x, to_y);
        
        if((element_from == NullElement) || (element_to == NullElement)) return false;
        
        if(!field.try_move(from_x, from_y, to_x, to_y)) {
            EventBus.send('ON_WRONG_SWAP_ELEMENTS', {
                element_from: {x: from_x, y: from_y, id: element_from.id},
                element_to: {x: to_x, y: to_y, id: element_to.id}
            });

            return false;
        }
        
        write_game_step_event('ON_SWAP_ELEMENTS', {
            element_from: {x: to_x, y: to_y, id: element_to.id},
            element_to: {x: from_x, y: from_y, id: element_from.id}
        });

        return true;
    }

    function process_game_step() {
        write_game_step_event('MOVE_PHASE_BEGIN', {});
        
        if(field.process_state(ProcessMode.MoveElements)) write_game_step_event('MOVE_PHASE_END', {});
        while(field.process_state(ProcessMode.Combinate)){
            field.process_state(ProcessMode.MoveElements);
            write_game_step_event('MOVE_PHASE_END', {});
        }

        previous_states.push(field.save_state());

        send_game_step();
    }
    
    function revert_step(): boolean {
        const current_state = previous_states.pop();
        let previous_state = previous_states.pop();
        if(current_state == undefined || previous_state == undefined) return false;

        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = previous_state.cells[y][x];
                if(cell != NotActiveCell) make_cell(x, y, cell?.data?.variety, cell?.data);
                else field.set_cell(x, y, NotActiveCell);

                const element = previous_state.elements[y][x];
                if(element != NullElement) make_element(x, y, element.type, element.data);
                else field.set_element(x, y, NullElement);
            }
        }

        previous_state = field.save_state();
        previous_states.push(previous_state);

        EventBus.send('ON_REVERT_STEP', {current_state, previous_state});

        return true;
    }

    //#endregion ACTIONS
    //#region CALLBACKS     

    function is_can_move(from_x: number, from_y: number, to_x: number, to_y: number) {
        if(field.is_can_move_base(from_x, from_y, to_x, to_y)) return true;
        
        return (is_buster(from_x, from_y) || is_buster(to_x, to_y));
    }

    function try_combo(combined_element: ItemInfo, combination: CombinationInfo) {
        let element;
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

        if(element != undefined && element != NullElement) {
            write_game_step_event('ON_COMBO', {
                combined_element,
                combination,
                maked_element: {x: combined_element.x, y: combined_element.y, id: element.id, type: element.type}
            });

            return true;
        }

        return false;
    }

    function on_combined(combined_element: ItemInfo, combination: CombinationInfo) {
        field.on_combined_base(combined_element, combination);
        if(!try_combo(combined_element, combination)) write_game_step_event('ON_COMBINED', {combined_element, combination});
    }

    function on_move_element(from_x:number, from_y: number, to_x: number, to_y: number, element: Element) {
        write_game_step_event('ON_MOVE_ELEMENT', {from_x, from_y, to_x, to_y, element});
    }

    function on_damaged_element(damaged_info: DamagedInfo) {
        const index = activated_elements.findIndex((element_id) => element_id == damaged_info.element.id);
        if(index != -1) activated_elements.splice(index, 1);
    }

    // TODO: refactoring
    function on_cell_activated(item_info: ItemInfo) {
        const cell = field.get_cell(item_info.x, item_info.y);
        if(cell == NotActiveCell) return;

        switch(cell.type) {
            case CellType.ActionLocked:
                if(cell.cnt_acts == undefined) break;
                if(cell.cnt_acts > 0) {
                    if(cell.data != undefined && cell.data.under_cells != undefined) {
                        const cell_id = (cell.data.under_cells as CellId[]).pop();
                        if(cell_id != undefined) {
                            const new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data, true);
                            if(new_cell != NotActiveCell) {
                                write_game_step_event('ON_CELL_ACTIVATED', {
                                    x: item_info.x,
                                    y: item_info.y,
                                    id: new_cell.id,
                                    variety: cell_id,
                                    previous_id: item_info.id 
                                });
                            }

                            return;
                        }
                    } 
                    
                    const new_cell = make_cell(item_info.x, item_info.y, CellId.Base, null, true);
                    if(new_cell != NotActiveCell) {
                        write_game_step_event('ON_CELL_ACTIVATED', {
                            x: item_info.x,
                            y: item_info.y,
                            id: new_cell.id,
                            variety: CellId.Base,
                            previous_id: item_info.id 
                        });
                    }
                }
            break;
            case bit.bor(CellType.ActionLockedNear, CellType.Wall):
                if(cell.cnt_near_acts == undefined) break;
                if(cell.cnt_near_acts > 0) {
                    if(cell.data != undefined && cell.data.under_cells != undefined) {
                        const cell_id = (cell.data.under_cells as CellId[]).pop();
                        if(cell_id != undefined) {
                            const new_cell = make_cell(item_info.x, item_info.y, cell_id, cell.data, true);
                            if(new_cell != NotActiveCell) {
                                write_game_step_event('ON_CELL_ACTIVATED', {
                                    x: item_info.x,
                                    y: item_info.y,
                                    id: new_cell.id,
                                    variety: cell_id,
                                    previous_id: item_info.id 
                                });
                            }

                            return;
                        }
                    }
                    
                    const new_cell = make_cell(item_info.x, item_info.y, CellId.Base, null, true);
                    if(new_cell != NotActiveCell) {
                        write_game_step_event('ON_CELL_ACTIVATED', {
                            x: item_info.x,
                            y: item_info.y,
                            id: new_cell.id,
                            variety: CellId.Base,
                            previous_id: item_info.id 
                        });
                    }
                }
            break;
        }
    }

    function on_request_element(x: number, y: number): Element | typeof NullElement {
        const element = make_element(x, y, get_random_element_id());
        if(element == NullElement) return NullElement;

        write_game_step_event('ON_REQUEST_ELEMENT', {x, y, id: element.id, type: element.type});

        return element;
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
    
    function remove_random_element(exclude?: ItemInfo[]) {
        const available_elements = [];
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const element = field.get_element(x, y);
                if(element != NullElement && exclude != undefined && exclude.findIndex((item) => item.id == element.id) == -1) {
                    available_elements.push({x, y, id: element.id});
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
                    if(field.is_valid_element_pos(j, i)) {
                        if(is_buster(j, i)) try_activate_buster_element(j, i);
                        else {
                            const removed_element = field.remove_element(j, i, true, is_near_activation);
                            if(removed_element != undefined) removed_elements.push({x: j, y: i, id: removed_element.id});
                        }
                    }
                }
            }
        }

        return removed_elements;
    }

    function write_game_step_event<T extends MessageId>(message_id: T, message: Messages[T]) {
        game_step_events.push({key: message_id, value: message});
    }

    function send_game_step() {
        EventBus.send('GAME_STEP', game_step_events);
        game_step_events = {} as GameStepEventBuffer;
    }

    //#endregion HELPERS

    return init();
}