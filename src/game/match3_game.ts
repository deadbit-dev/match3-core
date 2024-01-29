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


import * as flow from 'ludobits.m.flow';
import * as camera from '../utils/camera';

import { IGameItem, Messages, PosXYMessage } from '../modules/modules_const';

import { Direction } from '../utils/math_utils';

import { CellId, ElementId } from '../main/game_config';

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
    GameState
} from './match3_core';

import { View } from './match3_view';


export function Game() {
    const min_swipe_distance = GAME_CONFIG.min_swipe_distance;

    const move_delay_after_combination = GAME_CONFIG.move_delay_after_combination;
    const wait_time_after_move = GAME_CONFIG.wait_time_after_move;
    
    const buster_delay = GAME_CONFIG.buster_delay;

    const level_config = GAME_CONFIG.levels[GameStorage.get('current_level')];

    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const move_direction = level_config['field']['move_direction'];

    const busters = level_config['busters'];
    
    const field = Field(8, 8, move_direction);
    const view = View();

    let previous_states: GameState[] = [];
    let selected_element: IGameItem | null = null;
    
    function init() {
        field.init();
        view.init();
        
        setup_element_types();

        field.set_callback_on_move_element(view.on_move_element_animation);
        field.set_callback_on_damaged_element(on_damaged_element);
        field.set_callback_on_combinated(on_combined);
        field.set_callback_on_request_element(on_request_element);
        field.set_callback_on_cell_activated(on_cell_activated);
        
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                make_cell(x, y, level_config['field']['cells'][y][x]);
                make_element(x, y, level_config['field']['elements'][y][x]);
            }
        }

        busters.hammer_active = (GameStorage.get('hammer_counts') <= 0);
        previous_states.push(field.save_state());
        
        wait_event();
    }

    function setup_element_types() {
        for(const [key, value] of Object.entries(GAME_CONFIG.element_database)) {
            field.set_element_type(tonumber(key) as number, value.type);
        }
    }

    function make_cell(x: number, y: number, cell_id: CellId | typeof NotActiveCell): Cell | typeof NotActiveCell {
        if(cell_id as number == NotActiveCell) return NotActiveCell;

        const data = GAME_CONFIG.cell_database[cell_id as CellId];
        const cell = {
            id: view.set_cell_view(x, y, cell_id),
            type: data.type,
            is_active: data.is_active
        };

        field.set_cell(x, y, cell);

        return cell;
    }

    function make_element(x: number, y: number, element_id: ElementId | typeof NullElement, spawn_anim = false, data: any = null): Element | typeof NullElement {
        if(element_id as number == NullElement) return NullElement;
        
        const element_data = GAME_CONFIG.element_database[element_id as ElementId];
        const element: Element = {
            id: view.set_element_view(x, y, element_id, spawn_anim),
            type: element_data.type.index,
            data: data
        };

        field.set_element(x, y, element);

        return element;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    
    function process_move() {
        field.process_state(ProcessMode.MoveElements);
        flow.delay(wait_time_after_move);
    }

    function process_game_step() {
        process_move();
        while(field.process_state(ProcessMode.Combinate)){
            flow.delay(move_delay_after_combination);
            process_move();
        }

        previous_states.push(field.save_state());
    }

    //-----------------------------------------------------------------------------------------------------------------------------------

    function get_move_direction(dir: vmath.vector3): Direction {
        const cs45 = 0.7;
        if(dir.y > cs45) return Direction.Up;
        else if(dir.y < -cs45) return Direction.Down;
        else if(dir.x < -cs45) return Direction.Left;
        else if(dir.x > cs45) return Direction.Right;
        else return Direction.None;
    }

    function swap_elements(from_pos_x: number, from_pos_y: number, to_pos_x: number, to_pos_y: number) {
        const element_from = field.get_element(from_pos_x, from_pos_y);
        const element_to = field.get_element(to_pos_x, to_pos_y);

        if((element_from as number == NullElement) || (element_to as number == NullElement)) return;

        const element_to_world_pos = view.get_cell_world_pos(to_pos_x, to_pos_y, 0);
        const element_from_world_pos = view.get_cell_world_pos(from_pos_x, from_pos_y, 0);
        
        view.swap_element_animation(element_from as Element, element_to as Element, element_from_world_pos, element_to_world_pos);
        
        if(!field.try_move(from_pos_x, from_pos_y, to_pos_x, to_pos_y)) {
            view.swap_element_animation(element_from as Element, element_to as Element, element_to_world_pos, element_from_world_pos);
        } else process_game_step();
    }

    //-----------------------------------------------------------------------------------------------------------------------------------

    function try_click_activation(x: number, y: number): boolean {
        const element = field.get_element(x, y);
        if(element as number == NullElement) return false;
        if(!GAME_CONFIG.element_database[(element as Element).type as ElementId].type.is_clickable) return false;
        
        field.remove_element(x, y, true, false);
        flow.delay(buster_delay);
        process_game_step();

        return true;
    }
    
    function try_hammer_activation(x: number, y: number): boolean {
        if(!busters.hammer_active || GameStorage.get('hammer_counts') <= 0) return false;
        
        field.remove_element(x, y, true, false);
        flow.delay(buster_delay);
        process_game_step();

        GameStorage.set('hammer_counts', GameStorage.get('hammer_counts') - 1);
        busters.hammer_active = false;

        return true;
    }
    
    function on_down(item: IGameItem) {
        selected_element = item;
    }
    
    function on_move(pos: PosXYMessage) {
        if(selected_element == null) return;
            
        const world_pos = camera.screen_to_world(pos.x, pos.y);
        const selected_element_world_pos = go.get_world_position(selected_element._hash);
        const delta = (world_pos - selected_element_world_pos) as vmath.vector3;
        
        if(math.abs(delta.x + delta.y) < min_swipe_distance) return;

        const selected_element_pos = view.get_element_pos(selected_element_world_pos);
        const element_to_pos = {x: selected_element_pos.x, y: selected_element_pos.y};

        const direction = vmath.normalize(delta);
        const move_direction = get_move_direction(direction);
        switch(move_direction) {
            case Direction.Up: element_to_pos.y -= 1; break;
            case Direction.Down: element_to_pos.y += 1; break;
            case Direction.Left: element_to_pos.x -= 1; break;
            case Direction.Right: element_to_pos.x += 1; break;
        }

        const is_valid_x = (element_to_pos.x >= 0) && (element_to_pos.x < field_width);
        const is_valid_y = (element_to_pos.y >= 0) && (element_to_pos.y < field_height);
        if(!is_valid_x || !is_valid_y) return;

        swap_elements(selected_element_pos.x, selected_element_pos.y, element_to_pos.x, element_to_pos.y);
        
        selected_element = null;
    }

    function on_up(item: IGameItem) {
        const item_world_pos = go.get_world_position(item._hash);
        const element_pos = view.get_element_pos(item_world_pos);

        if(try_click_activation(element_pos.x, element_pos.y)) return;
        if(try_hammer_activation(element_pos.x, element_pos.y)) return;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------
    
    function make_buster(combined_element: ItemInfo, combination: CombinationInfo, buster: ElementId) {
        const on_complite = () => {
            field.on_combined_base(combined_element, combination);
            make_element(combined_element.x, combined_element.y, buster, true);
        };

        view.squash_combo_animation(combined_element, combination, on_complite);
    }

    function on_combined(combined_element: ItemInfo, combination: CombinationInfo) {
        switch(combination.type) {
            case CombinationType.Comb4: case CombinationType.Comb5:
                make_buster(combined_element, combination, (combination.angle == 0) ? ElementId.HorizontalBuster : ElementId.VerticalBuster);
            break;
            case CombinationType.Comb2x2:
                make_buster(combined_element, combination, ElementId.Helicopter);
            break;
            case CombinationType.Comb3x3: case CombinationType.Comb3x4: case CombinationType.Comb3x5:   
                make_buster(combined_element, combination, ElementId.AxisBuster);
            break;
            default:
                field.on_combined_base(combined_element, combination);
            break;
        }
    }

    function try_activate_buster_element(damaged_info: DamagedInfo) {
        switch(damaged_info.element.type) {
            case ElementId.AxisBuster:
                for(let y = 0; y < field_height; y++) {
                    field.remove_element(damaged_info.x, y, true, true);
                }
                for(let x = 0; x < field_width; x++) {
                    field.remove_element(x, damaged_info.y, true, true);
                }
            break;
            case ElementId.VerticalBuster:
                for(let y = 0; y < field_height; y++) {
                    field.remove_element(damaged_info.x, y, true, true);
                }
            break;
            case ElementId.HorizontalBuster:
                for(let x = 0; x < field_width; x++) {
                    field.remove_element(x, damaged_info.y, true, true);
                }
            break;
            case ElementId.Helicopter:
                if(damaged_info.x - 1 > 0) field.remove_element(damaged_info.x - 1, damaged_info.y, true, true);
                if(damaged_info.y - 1 > 0) field.remove_element(damaged_info.x, damaged_info.y - 1, true, true);
                if(damaged_info.x + 1 < field_width) field.remove_element(damaged_info.x + 1, damaged_info.y, true, true);
                if(damaged_info.y + 1 < field_height) field.remove_element(damaged_info.x, damaged_info.y + 1, true, true);

                field.remove_element(math.random(0, field_width - 1), math.random(0, field_height - 1), true, true);
            break;
            default: return false;
        }

        return true;
    }

    function on_damaged_element(damaged_info: DamagedInfo) {
        try_activate_buster_element(damaged_info);
        view.damaged_element_animation(damaged_info.element.id);
        
    }

    function on_cell_activated(item_info: ItemInfo) {
        const item = view.get_item_by_index(item_info.id); 
        if(item == undefined) return;

        view.delete_item(item, true);
        make_cell(item_info.x, item_info.y, CellId.Base);
    }

    //-----------------------------------------------------------------------------------------------------------------------------------

    function get_random_element_id(): ElementId | typeof NullElement {
        let index = math.random(Object.keys(GAME_CONFIG.element_database).length - 1);
        for(const [key, value] of Object.entries(GAME_CONFIG.element_database)) {
            if(index-- == 0) return tonumber(key) as ElementId;
        }

        return -1;
    }

    function on_request_element(x: number, y: number): Element | typeof NullElement {
        const element = make_element(x, y, get_random_element_id());
        if(element as number == NullElement) return NullElement;

        view.request_element_animation(element as Element, x, y, 0);        

        return element;
    }

    //-----------------------------------------------------------------------------------------------------------------------------------

    function revert_step(): boolean {
        const current_state = previous_states.pop();
        let previous_state = previous_states.pop();
        if(current_state == undefined || previous_state == undefined) return false;

        previous_state = view.revert_step_animation(current_state, previous_state);
        if(previous_state != undefined) {
            field.load_state(previous_state);
            previous_states.push(previous_state);
        }

        return true;
    }

    function wait_event() {
        while (true) {
            const [message_id, _message, sender] = flow.until_any_message();
            view.do_message(message_id, _message, sender);
            switch(message_id) {
                case ID_MESSAGES.MSG_ON_DOWN_ITEM:
                    on_down((_message as Messages['MSG_ON_DOWN_ITEM']).item);
                break;

                case ID_MESSAGES.MSG_ON_UP_ITEM:
                    on_up((_message as Messages['MSG_ON_UP_ITEM']).item);
                break;
                
                case ID_MESSAGES.MSG_ON_MOVE:
                    on_move((_message as Messages['MSG_ON_MOVE']));
                break;
                case to_hash('REVERT_STEP'):
                    revert_step();
                break;
            }
        }
    }

    init();

    return {};
}