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
import { CellId, ElementId, MANAGER_ID, VIEW_ID } from '../main/game_config';
import { Messages } from '../modules/modules_const';

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

interface ActivationData {
    x: number;
    y: number;
    other_x?: number;
    other_y?: number;
}

type FncOnInteract = (item: ItemInfo, other_item: ItemInfo) => void;

export function Game() {
    //#region CONFIG        

    const level_config = GAME_CONFIG.levels[GameStorage.get('current_level')];
    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const move_direction = level_config['field']['move_direction'];
    const busters = level_config['busters'];

    //#endregion CONFIGURATIONS
    //#region MAIN          

    const field = Field(field_width, field_height, move_direction);

    let game_item_counter = 0;
    let previous_states: GameState[] = [];
    let activated_elements: number[] = [];
    
    function init() {
        field.init();

        field.set_callback_is_can_move(is_can_move);
        field.set_callback_on_move_element(on_move_element);
        field.set_callback_on_combinated(on_combined);
        field.set_callback_on_damaged_element(on_damaged_element);
        field.set_callback_on_request_element(on_request_element);
        field.set_callback_on_cell_activated(on_cell_activated);

        set_element_types();
        set_field();
        set_busters();

        process();
    }
    
    function process() {
        while (true) {
            const [message_id, _message, sender] = flow.until_any_message();
            switch(message_id) {
                case to_hash('SWAP_ELEMENTS'):
                    const info = _message as Messages['SWAP_ELEMENTS'];
                    swap_elements(info.from_x, info.from_y, info.to_x, info.to_y);
                break;

                case to_hash('CLICK_ACTIVATION'):
                    const pos = _message as Messages['CLICK_ACTIVATION'];
                    try_click_activation(pos.x, pos.y);
                break;

                case to_hash('REVERT_STEP'):
                    revert_step();
                break;
            }
        }
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

    function set_field() {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                init_cell(x, y);
                init_element(x, y);
            }
        }

        previous_states.push(field.save_state());
    }

    function set_busters() {
        GameStorage.set('hammer_counts', 5);
        busters.hammer_active = (GameStorage.get('hammer_counts') <= 0);
    }

    function init_cell(x: number, y: number) {
        // TODO: load save
        const cell_config = level_config['field']['cells'][y][x];
        if(Array.isArray(cell_config)) {
            const cells = Object.assign([], cell_config);
            const cell_id = cells.pop();
            if(cell_id != undefined) make_cell(x, y, cell_id, {under_cells: cells});
        } else make_cell(x, y, cell_config);
    }

    function init_element(x: number, y: number) {
        // TODO: load save
        make_element(x, y, level_config['field']['elements'][y][x]);
    }

    function make_cell(x: number, y: number, cell_id: CellId | typeof NotActiveCell, data?: any): Cell | typeof NotActiveCell {
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

        Manager.send_raw_view(to_hash('ON_MAKE_CELL'), {x, y, id: cell.id, variety: cell?.data?.variety});

        return cell;
    }

    function make_element(x: number, y: number, element_id: ElementId | typeof NullElement, spawn_anim = false, data: any = null): Element | typeof NullElement {
        if(element_id == NullElement) return NullElement;
        
        const element: Element = {
            id: game_item_counter++,
            type: element_id,
            data: data
        };

        field.set_element(x, y, element);

        Manager.send_raw_view(to_hash('ON_MAKE_ELEMENT'), {x, y, id: element.id, type: element.type});

        return element;
    }

    //#endregion SETUP
    //#region ACTIONS       
    
    function try_click_activation(x: number, y: number) {
        if(!is_click_activation(x, y)) return false;
        if(!try_activate_buster_element({x, y})) return false;
        if(!try_hammer_activation(x, y)) return false;

        process_game_step();

        return true;
    }

    function try_activate_buster_element(data: ActivationData) {
        const element = field.get_element(data.x, data.y);
        if(element == NullElement) return false;
        
        switch(element.type) {
            case ElementId.AxisRocket: try_activate_axis_rocket(data); break;
            case ElementId.VerticalRocket: try_activate_vertical_rocket(data); break;
            case ElementId.HorizontalRocket: try_activate_horizontal_rocket(data); break;
            case ElementId.Helicopter: try_activate_helicopter(data); break;
            case ElementId.Dynamite: try_activate_dynamite(data); break;
            case ElementId.Diskosphere: try_activate_diskosphere(data); break;
            default: return false;
        }

        return true;
    }

    function try_iteract_with_other_buster(data: ActivationData, types_for_check: number[], on_interact: FncOnInteract) {
        const element = field.get_element(data.x, data.y);
        if(element == NullElement) return false;

        if(data.other_x == undefined || data.other_y == undefined) return false;
        
        const other_element = field.get_element(data.other_x, data.other_y);
        if(other_element == NullElement) return false;

        if(!types_for_check.includes(other_element.type)) return false;
        
        on_interact({x: data.x, y: data.y, id: element.id}, {x: data.other_x, y: data.other_y, id: other_element.id});
        return true;
    }

    function try_activate_vertical_rocket(data: ActivationData) {
        if(try_iteract_with_other_buster(data, [ElementId.HorizontalRocket, ElementId.VerticalRocket], (item, other_item) => {
            field.remove_element(other_item.x, other_item.y, true, false);
            try_activate_axis_rocket({x: item.x, y: item.y});
        })) return;

        field.remove_element(data.x, data.y, true, false);
        
        for(let y = 0; y < field_height; y++) {
            if(y != data.y) {
                if(!try_activate_buster_element({x: data.x, y}))
                    field.remove_element(data.x, y, true, false);
            }
        }
    }

    function try_activate_horizontal_rocket(data: ActivationData) {
        if(try_iteract_with_other_buster(data, [ElementId.HorizontalRocket, ElementId.VerticalRocket], (item, other_item) => {
            field.remove_element(other_item.x, other_item.y, true, false);
            try_activate_axis_rocket({x: item.x, y: item.y});
        })) return;

        field.remove_element(data.x, data.y, true, false);
        
        for(let x = 0; x < field_width; x++) {
            if(x != data.x) {
                if(!try_activate_buster_element({x, y: data.y}))
                    field.remove_element(x, data.y, true, false);
            }
        }
    }

    function try_activate_axis_rocket(data: ActivationData) {
        field.remove_element(data.x, data.y, true, false);

        for(let y = 0; y < field_height; y++) {
            if(y != data.y) {
                if(!try_activate_buster_element({x: data.x, y}))
                    field.remove_element(data.x, y, true, false);
            }
        }
        
        for(let x = 0; x < field_width; x++) {
            if(x != data.x) {
                if(!try_activate_buster_element({x, y: data.y}))
                    field.remove_element(x, data.y, true, false);
            }
        }
    }

    function try_activate_helicopter(data: ActivationData) {
        let helicopter = field.get_element(data.x, data.y);
        if(helicopter == NullElement) return false;
        
        if(activated_elements.findIndex((element_id) => element_id == (helicopter as Element).id) != -1) return false;
        activated_elements.push(helicopter.id);

        const was_iteraction = try_iteract_with_other_buster(data, [ElementId.Helicopter], (item, other_item) => {
            field.remove_element(other_item.x, other_item.y, true, false);
        });

        if(field.is_valid_element_pos(data.x - 1, data.y) && !try_activate_buster_element({x: data.x - 1, y: data.y}))
            field.remove_element(data.x - 1, data.y, true, false);
        if(field.is_valid_element_pos(data.x, data.y - 1) && !try_activate_buster_element({x: data.x, y: data.y - 1}))
            field.remove_element(data.x, data.y - 1, true, false);
        if(field.is_valid_element_pos(data.x + 1, data.y) && !try_activate_buster_element({x: data.x + 1, y: data.y}))
            field.remove_element(data.x + 1, data.y, true, false);
        if(field.is_valid_element_pos(data.x, data.y + 1) && !try_activate_buster_element({x: data.x, y: data.y + 1}))
            field.remove_element(data.x, data.y + 1, true, false);
    
        remove_random_element(data.x, data.y, helicopter);
        
        for(let i = 0; i < 2 && was_iteraction; i++) {
            helicopter = make_element(data.x, data.y, ElementId.Helicopter, true);
            if(helicopter != NullElement) {
                activated_elements.push(helicopter.id);
                remove_random_element(data.x, data.y, helicopter);
            }
        }

        return true;
    }

    function try_activate_dynamite(data: ActivationData) {
        let range = 2;
       
        try_iteract_with_other_buster(data, [ElementId.Dynamite], (item, other_item) => {
            field.remove_element(other_item.x, other_item.y, true, false);
            range = 3;
        });

        field.remove_element(data.x, data.y, true, false);

        for(let y = data.y - range; y <= data.y + range; y++) {
            for(let x = data.x - range; x <= data.x + range; x++) {
                if(field.is_valid_element_pos(x, y)) {
                    if(!try_activate_buster_element({x, y}))
                        field.remove_element(x, y, true, false);
                }
            }
        }
    }

    function try_activate_diskosphere(data: ActivationData) {
        if(try_iteract_with_other_buster(data, [ElementId.Dynamite, ElementId.HorizontalRocket, ElementId.VerticalRocket], (item, other_item) => {
            const other_element = field.get_element(other_item.x, other_item.y);
            if(other_element == NullElement) return;
            
            const element_id = get_random_element_id();
            if(element_id == NullElement) return;

            const elements = field.get_all_elements_by_type(element_id);
            for(const element of elements) {
                field.remove_element(element.x, element.y, true, false);
                make_element(element.x, element.y, other_element.type, true);
            }

            field.remove_element(item.x, item.y, true, false);
            field.remove_element(other_item.x, other_item.y, true, false);

            for(const element of elements) try_activate_buster_element({x: element.x, y: element.y});
        })) return;

        if(try_iteract_with_other_buster(data, [ElementId.Diskosphere], (item, other_item) => {
            const other_element = field.get_element(other_item.x, other_item.y);
            if(other_element == NullElement) return;
            
            for(const element_id of GAME_CONFIG.base_elements) {
                const elements = field.get_all_elements_by_type(element_id);
                for(const element of elements) field.remove_element(element.x, element.y, true, false);
            }

            field.remove_element(item.x, item.y, true, false);
            field.remove_element(other_item.x, other_item.y, true, false);
        })) return;

        if(data.other_x != undefined && data.other_y != undefined) {
            const element = field.get_element(data.x, data.y);
            if(element == NullElement) return;

            const other_element = field.get_element(data.other_x, data.other_y);
            if(other_element == NullElement) return;

            field.remove_element(data.x, data.y, true, false);
            
            const elements = field.get_all_elements_by_type(other_element.type);
            for(const element of elements) field.remove_element(element.x, element.y, true, false);
            
            return;
        }
        
        const element_id = get_random_element_id();
        if(element_id == NullElement) return;

        field.remove_element(data.x, data.y, true, true);

        const elements = field.get_all_elements_by_type(element_id);
        for(const element of elements) field.remove_element(element.x, element.y, true, true);
    }
    
    function try_hammer_activation(x: number, y: number) {
        if(!busters.hammer_active || GameStorage.get('hammer_counts') <= 0) return false;
        
        field.remove_element(x, y, true, false);
        process_game_step();

        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') - 1);
        busters.hammer_active = false;

        return true;
    }

    function swap_elements(from_x: number, from_y: number, to_x: number, to_y: number) {
        const cell_from = field.get_cell(from_x, from_y);
        const cell_to = field.get_cell(to_x, to_y);

        if(cell_from == NotActiveCell || cell_to == NotActiveCell) return;
        if(!field.is_available_cell_type_for_move(cell_from) || !field.is_available_cell_type_for_move(cell_to)) return;

        const element_from = field.get_element(from_x, from_y);
        const element_to = field.get_element(to_x, to_y);
        
        if((element_from == NullElement) || (element_to == NullElement)) return;

        if(field.try_move(from_x, from_y, to_x, to_y)) {

            Manager.send_raw_view(to_hash('ON_SWAP_ELEMENTS'), {
                element_from: {x: to_x, y: to_y, id: element_to.id},
                element_to: {x: from_x, y: from_y, id: element_from.id}
            });

            const is_click_to = !is_click_activation(to_x, to_y) && is_click_activation(from_x, from_y);
            if(is_click_to) try_activate_buster_element({x: from_x, y: from_y, other_x: to_x, other_y: to_y });
            else try_activate_buster_element({x: to_x, y: to_y, other_x: from_x, other_y: from_y });
            
            process_game_step();
        }
    }

    function process_game_step() {
        field.process_state(ProcessMode.MoveElements);
        while(field.process_state(ProcessMode.Combinate)){
            field.process_state(ProcessMode.MoveElements);
        }

        previous_states.push(field.save_state());
    }
    
    function revert_step(): boolean {
        const current_state = previous_states.pop();
        let previous_state = previous_states.pop();
        if(current_state == undefined || previous_state == undefined) return false;

        field.load_state(previous_state);
        previous_states.push(previous_state);

        Manager.send_raw_view(to_hash('ON_REVERT_STEP'), {current_state, previous_state});

        return true;
    }

    //#endregion ACTIONS
    //#region CALLBACKS     

    function is_can_move(from_x: number, from_y: number, to_x: number, to_y: number) {
        if(field.is_can_move_base(from_x, from_y, to_x, to_y)) return true;
        
        return (is_click_activation(from_x, from_y) || is_click_activation(to_x, to_y));
    }

    function on_combined(combined_element: ItemInfo, combination: CombinationInfo) {

        Manager.send_raw_view(to_hash('ON_COMBINED'), {combined_element, combination});

        switch(combination.type) {
            case CombinationType.Comb4:
                make_element(combined_element.x, combined_element.y,
                    (combination.angle == 0) ? ElementId.HorizontalRocket : ElementId.VerticalRocket, true);
            break;
            case CombinationType.Comb5:
                make_element(combined_element.x, combined_element.y, ElementId.Diskosphere, true);
            break;
            case CombinationType.Comb2x2:
                make_element(combined_element.x, combined_element.y, ElementId.Helicopter, true);
            break;
            case CombinationType.Comb3x3a: case CombinationType.Comb3x3b:
                make_element(combined_element.x, combined_element.y, ElementId.Dynamite, true);
            break;
            case CombinationType.Comb3x4: case CombinationType.Comb3x5:
                make_element(combined_element.x, combined_element.y, ElementId.AxisRocket, true);
            break;
        }

        field.on_combined_base(combined_element, combination);
    }

    function on_move_element(from_x:number, from_y: number, to_x: number, to_y: number, element: Element) {
        Manager.send_raw_view(to_hash('ON_MOVE_ELEMENT'), {from_x, from_y, to_x, to_y, element});
    }

    function on_damaged_element(damaged_info: DamagedInfo) {
        activated_elements.splice(activated_elements.findIndex((element_id) => element_id == damaged_info.element.id), 1);
        Manager.send_raw_view(to_hash('ON_DAMAGED_ELEMENT'), {id: damaged_info.element.id});
    }

    function on_cell_activated(item_info: ItemInfo) {
        const cell = field.get_cell(item_info.x, item_info.y);
        if(cell == NotActiveCell) return;

        switch(cell.type) {
            case CellType.ActionLocked:
                if(cell.cnt_acts == undefined) break;
                if(cell.cnt_acts > 0) {
                    if(cell.data != undefined && cell.data.under_cells != undefined) {
                        const cell_id = (cell.data.under_cells as CellId[]).pop();
                        if(cell_id != undefined) make_cell(item_info.x, item_info.y, cell_id, cell.data);
                        else make_cell(item_info.x, item_info.y, CellId.Base);
                    } else make_cell(item_info.x, item_info.y, CellId.Base);
                }
            break;
            case bit.bor(CellType.ActionLockedNear, CellType.Wall):
                if(cell.cnt_near_acts == undefined) break;
                if(cell.cnt_near_acts > 0) {
                    if(cell.data != undefined && cell.data.under_cells != undefined) {
                        const cell_id = (cell.data.under_cells as CellId[]).pop();
                        if(cell_id != undefined) make_cell(item_info.x, item_info.y, cell_id, cell.data);
                        else make_cell(item_info.x, item_info.y, CellId.Base);
                    } else make_cell(item_info.x, item_info.y, CellId.Base);
                }
            break;
        }
    }

    function on_request_element(x: number, y: number): Element | typeof NullElement {
        const element = make_element(x, y, get_random_element_id());
        if(element == NullElement) return NullElement;

        Manager.send_raw_view(to_hash('ON_REQUEST_ELEMENT'), {x, y, id: element.id});

        return element;
    }

    //#endregion CALLBACKS
    //#region HELPERS       
    
    function is_click_activation(x: number, y: number) {
        const cell = field.get_cell(x, y);
        if(cell == NotActiveCell || !field.is_available_cell_type_for_move(cell)) return false;

        const element = field.get_element(x, y);
        if(element == NullElement) return false;
        if(!GAME_CONFIG.element_database[element.type as ElementId].type.is_clickable) return false;

        return true;
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
    
    function remove_random_element(x: number, y: number, element: Element) {
        const available_elements = [];
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const element = field.get_element(x, y);
                if(element != NullElement) {
                    available_elements.push({x, y});
                }
            }
        }

        if(available_elements.length == 0) {
            field.remove_element(x, y, true, false);
            return;
        }

        const target = available_elements[math.random(0, available_elements.length - 1)];
        field.remove_element(x, y, true, false);
        if(!try_activate_buster_element({x: target.x, y: target.y}))
            field.remove_element(target.x, target.y, true, false);
    }

    //#endregion HELPERS

    return init();
}