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

import { GoManager } from '../modules/GoManager';
import { IGameItem, Messages, PosXYMessage } from '../modules/modules_const';

import { Match3, Cell, CellType, Element, NullElement,
    ElementType,NotActiveCell, MoveDirection, ProcessMode, DamagedInfo } from './match3';

export enum CellId {
    Base,
    Ice
}

export interface CellDatabaseValue {
    type: CellType;
    is_active: boolean;
    view: string;
}

export enum ElementId {
    Gold,
    Dimonde,
    Topaz
}

export interface ElementDatabaseValue {
    type: ElementType;
    view: string;
}


export function Game() {
    const game_width = 540;
    const game_height = 960;

    const min_swipe_distance = GAME_CONFIG.min_swipe_distance;
    const swap_element_easing = GAME_CONFIG.swap_element_easing;
    const swap_element_time = GAME_CONFIG.swap_element_time;

    const level_config = GAME_CONFIG.levels[GameStorage.get('current_level')];

    const origin_cell_size = level_config['field']['cell_size'];
    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const offset_border = level_config['field']['offset_border'];
    
    const field = Match3(8, 8);
    const gm = GoManager();

    let cell_size: number;
    let scale_ratio: number;
    let cells_offset: vmath.vector3;

    let selected_element: IGameItem | null = null;
    
    function init() {
        field.init();
        
        setup_size();
        setup_element_types();
        field.set_callback_on_damaged_element(on_damaged_element);
        
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                make_cell(x, y, level_config['field']['cells'][y][x]);
                make_element(x, y, level_config['field']['elements'][y][x]);
            }
        }
        
        wait_event();
    }

    function setup_size() {
        cell_size = math.min((game_width - offset_border * 2) / field_width, 100);
        scale_ratio = cell_size / origin_cell_size;
        cells_offset = vmath.vector3(
            game_width / 2 - (field_width / 2 * cell_size),
            -(game_height / 2 - (field_height / 2 * cell_size)),
            0
        );
    }

    function setup_element_types() {
        GAME_CONFIG.element_database.forEach((value: ElementDatabaseValue, key: ElementId) => {
            field.set_element_type(key, value.type);
        });
    }

    function make_cell(x: number, y: number, cell_id: CellId | typeof NotActiveCell) {
        if(cell_id as number == NotActiveCell) return;

        const data = GAME_CONFIG.cell_database.get(cell_id);
        if(data == undefined) return;

        const cell = {
            id: set_cell_view(x, y, cell_id),
            type: data.type,
            is_active: data.is_active
        };

        field.set_cell(x, y, cell);
    }

    function make_element(x: number, y: number, element_id: ElementId | typeof NullElement) {
        if(element_id as number == NullElement) return;
        
        const data = GAME_CONFIG.element_database.get(element_id);
        if(data == undefined) return;

        const element : Element = {
            id: set_element_view(x, y, element_id),
            type: data.type.index
        };

        field.set_element(x, y, element);
    }

    function get_cell_world_pos(x: number, y: number, z = 0) {
        return vmath.vector3(cells_offset.x + cell_size * x + cell_size * 0.5, cells_offset.y - cell_size * y - cell_size * 0.5, z);
    }
    
    function set_cell_view(x: number, y: number, cell_id: CellId, z_index: number = 0): number {
        const pos = get_cell_world_pos(x, y);
        pos.z = z_index;
        const _go = gm.make_go('cell_view', pos);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.cell_database.get(cell_id)?.view);
        return gm.add_game_item({ _hash: _go });
    }

    function set_element_view(x: number, y: number, element_id: ElementId, z_index: number = 1): number {
        const pos = get_cell_world_pos(x, y);
        pos.z = z_index;
        const _go = gm.make_go('element_view', pos);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.element_database.get(element_id)?.view);
        return gm.add_game_item({ _hash: _go, is_clickable: true });
    }

    function get_element_pos(world_pos: vmath.vector3): {x: number, y: number} {        
        return {x: (world_pos.x - cells_offset.x - cell_size * 0.5) / cell_size, y: (cells_offset.y - world_pos.y - cell_size * 0.5) / cell_size};
    }

    function get_move_direction(dir: vmath.vector3): MoveDirection {
        const cs45 = 0.7;
        if(dir.y > cs45) return MoveDirection.Up;
        else if(dir.y < -cs45) return MoveDirection.Down;
        else if(dir.x < -cs45) return MoveDirection.Left;
        else if(dir.x > cs45) return MoveDirection.Right;
        else return MoveDirection.None;
    }

    function swap_elements(element_from_pos: {x: number, y: number}, element_to_pos: {x: number, y: number}) {
        const element_from_data = field.get_element(element_from_pos.x, element_from_pos.y);
        const element_to_data = field.get_element(element_to_pos.x, element_to_pos.y);

        if((element_from_data as number == NullElement) || (element_to_data as number == NullElement)) return;

        const element_to_world_pos = get_cell_world_pos(element_to_pos.x, element_to_pos.y);
        element_to_world_pos.z = 1;
        
        const item_from = gm.get_item_by_index((element_from_data as Element).id);
        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, element_to_world_pos, swap_element_easing, swap_element_time);

        const element_from_world_pos = get_cell_world_pos(element_from_pos.x, element_from_pos.y);
        element_from_world_pos.z = 1;

        const item_to = gm.get_item_by_index((element_to_data as Element).id);
        flow.go_animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, element_from_world_pos, swap_element_easing, swap_element_time);

        if(!field.try_move(element_from_pos.x, element_from_pos.y, element_to_pos.x, element_to_pos.y)) {
            go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, element_from_world_pos, swap_element_easing, swap_element_time);
            flow.go_animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, element_to_world_pos, swap_element_easing, swap_element_time);
        } else while(field.process_state(ProcessMode.Combinate)) {
            field.process_state(ProcessMode.MoveElements);
        }
    }
    
    function on_down(item: IGameItem) {
        if(selected_element != null) {
            // TODO: rule of near click 
            const selected_element_world_pos = go.get_world_position(selected_element._hash);
            const element_to_world_pos = go.get_world_position(item._hash);
            const selected_element_pos = get_element_pos(selected_element_world_pos);
            const element_to_pos = get_element_pos(element_to_world_pos);
            
            swap_elements(selected_element_pos, element_to_pos);
            
            selected_element = null;
            return;
        }

        selected_element = item;
    }
    
    function on_move(pos: PosXYMessage) {
        if(selected_element == null) return;
            
        const world_pos = camera.screen_to_world(pos.x, pos.y) as vmath.vector3;
        const selected_element_world_pos = go.get_world_position(selected_element._hash);
        const delta = (world_pos - selected_element_world_pos) as vmath.vector3;
        
        if(math.abs(delta.x + delta.y) < min_swipe_distance) return;

        const selected_element_pos = get_element_pos(selected_element_world_pos);
        const element_to_pos = {x: selected_element_pos.x, y: selected_element_pos.y};

        const direction = vmath.normalize(delta);
        const move_direction = get_move_direction(direction);
        switch(move_direction) {
            case MoveDirection.Up: element_to_pos.y -= 1; break;
            case MoveDirection.Down: element_to_pos.y += 1; break;
            case MoveDirection.Left: element_to_pos.x -= 1; break;
            case MoveDirection.Right: element_to_pos.x += 1; break;
        }

        const is_valid_x = (element_to_pos.x >= 0) && (element_to_pos.x < field_width);
        const is_valid_y = (element_to_pos.y >= 0) && (element_to_pos.y < field_height);
        if(!is_valid_x || !is_valid_y) return;

        swap_elements(selected_element_pos, element_to_pos);
        
        selected_element = null;
    }

    function on_damaged_element(damage_info: DamagedInfo) {

    }

    function wait_event() {
        while (true) {
            const [message_id, _message, sender] = flow.until_any_message();
            gm.do_message(message_id, _message, sender);
            switch(message_id) {
                case ID_MESSAGES.MSG_ON_DOWN_ITEM:
                    on_down((_message as Messages['MSG_ON_UP_ITEM']).item);
                break;
                
                case ID_MESSAGES.MSG_ON_MOVE:
                    on_move((_message as Messages['MSG_ON_MOVE']));
                break;
            }
        }
    }

    init();

    return {};
}