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

import { IS_DEBUG_MODE, CellId, ElementId, ComboType } from '../main/game_config';

import {
    Field,
    Cell,
    Element,
    NullElement,
    NotActiveCell,
    MoveDirection,
    DamagedInfo,
    CombinationType,
    CombinationInfo,
    ProcessMode,
    ItemInfo
} from './match3';




export function Game() {
    const game_width = 540;
    const game_height = 960;

    const game_animation_speed_cof = GAME_CONFIG.game_animation_speed_cof;
    const min_swipe_distance = GAME_CONFIG.min_swipe_distance;
    const swap_element_easing = GAME_CONFIG.swap_element_easing;
    const swap_element_time = GAME_CONFIG.swap_element_time * game_animation_speed_cof;
    const move_delay_after_combination = GAME_CONFIG.move_delay_after_combination * game_animation_speed_cof;
    const move_elements_easing = GAME_CONFIG.move_elements_easing;
    const move_elements_time = GAME_CONFIG.move_elements_time * game_animation_speed_cof;
    const wait_time_after_move = GAME_CONFIG.wait_time_after_move * game_animation_speed_cof;
    const damaged_element_easing = GAME_CONFIG.damaged_element_easing;
    const damaged_element_delay = GAME_CONFIG.damaged_element_delay * game_animation_speed_cof;
    const damaged_element_time = GAME_CONFIG.damaged_element_time * game_animation_speed_cof;
    const damaged_element_scale = GAME_CONFIG.damaged_element_scale;
    const combined_element_easing = GAME_CONFIG.combined_element_easing;
    const combined_element_time = GAME_CONFIG.combined_element_time * game_animation_speed_cof;
    const spawn_element_easing = GAME_CONFIG.spawn_element_easing;
    const spawn_element_time = GAME_CONFIG.spawn_element_time * game_animation_speed_cof;
    const buster_delay = GAME_CONFIG.buster_delay * game_animation_speed_cof;

    const level_config = GAME_CONFIG.levels[GameStorage.get('current_level')];

    const origin_cell_size = level_config['field']['cell_size'];
    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const offset_border = level_config['field']['offset_border'];
    const move_direction = level_config['field']['move_direction'];

    const busters = level_config['busters'];
    
    const field = Field(8, 8, move_direction);
    const gm = GoManager();

    let cell_size: number;
    let scale_ratio: number;
    let cells_offset: vmath.vector3;

    let selected_element: IGameItem | null = null;
    
    function init() {
        field.init();
        
        setup_size();
        setup_element_types();

        field.set_callback_on_move_element(on_move_element);
        field.set_callback_on_damaged_element(on_damaged_element);
        field.set_callback_on_combinated(on_combined);
        field.set_callback_on_request_element(on_request_element);
        
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                make_cell(x, y, level_config['field']['cells'][y][x]);
                make_element(x, y, level_config['field']['elements'][y][x]);
            }
        }

        busters.hammer_active = (GameStorage.get('hammer_counts') <= 0);
        
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
        for(const [key, value] of Object.entries(GAME_CONFIG.element_database)) {
            field.set_element_type(tonumber(key) as number, value.type);
        }
    }

    function make_cell(x: number, y: number, cell_id: CellId | typeof NotActiveCell): Cell | typeof NotActiveCell {
        if(cell_id as number == NotActiveCell) return NotActiveCell;

        const data = GAME_CONFIG.cell_database[cell_id as CellId];
        const cell = {
            id: set_cell_view(x, y, cell_id),
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
            id: set_element_view(x, y, element_id, spawn_anim),
            type: element_data.type.index,
            data: data
        };

        field.set_element(x, y, element);

        return element;
    }

    function make_combo_element(x: number, y: number, element_id: ElementId, combo_type: ComboType, z_index = 1) {
        const pos = vmath.vector3(0, 0, z_index);
        const combo_view = gm.make_go('combo_view', pos);
        sprite.play_flipbook(msg.url(undefined, combo_view, 'sprite'), GAME_CONFIG.combo_graphics[combo_type]);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), combo_view);
        
        const element = make_element(x, y, element_id, true, {
            combo_type: combo_type
        });

        const item = gm.get_item_by_index((element as Element).id);
        if(item != undefined) {
            go.set_parent(combo_view, item._hash);
            go.set_position(pos, combo_view);
        }

        return element;
    }

    function get_cell_world_pos(x: number, y: number, z = 0) {
        return vmath.vector3(cells_offset.x + cell_size * x + cell_size * 0.5, cells_offset.y - cell_size * y - cell_size * 0.5, z);
    }
    
    function set_cell_view(x: number, y: number, cell_id: CellId, z_index = -1): number {
        const pos = get_cell_world_pos(x, y, z_index);
        const _go = gm.make_go('cell_view', pos);
        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.cell_database[cell_id].view);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        return gm.add_game_item({ _hash: _go });
    }

    function set_element_view(x: number, y: number, element_id: ElementId, spawn_anim = false, z_index = 0): number {
        const pos = get_cell_world_pos(x, y, z_index);
        const _go = gm.make_go('element_view', pos);
        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.element_database[element_id].view);
        
        if(spawn_anim) {
            go.set_scale(vmath.vector3(0.01, 0.01, 1), _go);
            go.animate(_go, 'scale', go.PLAYBACK_ONCE_FORWARD, vmath.vector3(scale_ratio, scale_ratio, 1), spawn_element_easing, spawn_element_time);
        } else go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        
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

        const element_to_world_pos = get_cell_world_pos(element_to_pos.x, element_to_pos.y, 0);
        
        const item_from = gm.get_item_by_index((element_from_data as Element).id);
        if(item_from == undefined) return;

        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, element_to_world_pos, swap_element_easing, swap_element_time);

        const element_from_world_pos = get_cell_world_pos(element_from_pos.x, element_from_pos.y, 0);

        const item_to = gm.get_item_by_index((element_to_data as Element).id);
        if(item_to == undefined) return;

        flow.go_animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, element_from_world_pos, swap_element_easing, swap_element_time);

        if(!field.try_move(element_from_pos.x, element_from_pos.y, element_to_pos.x, element_to_pos.y)) {
            go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, element_from_world_pos, swap_element_easing, swap_element_time);
            flow.go_animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, element_to_world_pos, swap_element_easing, swap_element_time);
        } else process_game_step();
    }

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
    }

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
    
    function on_up(item: IGameItem) {
        const item_world_pos = go.get_world_position(item._hash);
        const element_pos = get_element_pos(item_world_pos);
        
        if(selected_element != null) {
            const selected_item_world_pos = go.get_world_position(selected_element._hash);
            const selected_element_pos = get_element_pos(selected_item_world_pos);
            
            const dx = math.abs(selected_element_pos.x - element_pos.x);
            const dy = math.abs(selected_element_pos.y - element_pos.y);
            if((dx != 0 && dy != 0) || (dx > 1 || dy > 1)) {
                selected_element = item;
                return;
            }

            swap_elements(selected_element_pos, element_pos);
            
            selected_element = null;
            return;
        }

        if(try_click_activation(element_pos.x, element_pos.y)) return;
        if(try_hammer_activation(element_pos.x, element_pos.y)) return;

        selected_element = item;
    }
    
    function on_move(pos: PosXYMessage) {
        if(selected_element == null) return;
            
        const world_pos = camera.screen_to_world(pos.x, pos.y);
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

    function on_move_element(from_x: number, from_y: number, to_x: number, to_y: number, element: Element) {
        const to_world_pos = get_cell_world_pos(to_x, to_y, 0);
        
        const item_from = gm.get_item_by_index(element.id);
        if(item_from == undefined) return;

        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, move_elements_easing, move_elements_time);
    }

    function on_combined(combined_element: ItemInfo, combination: CombinationInfo) {
        if(combination.type == CombinationType.Comb3) field.on_combined_base(combined_element, combination);
        else {
            const on_complite = () => {
                const element_data = field.get_element(combined_element.x, combined_element.y) as Element;
                
                field.on_combined_base(combined_element, combination);
                
                let combo_type: ComboType;
                switch(combination.type) {
                    case CombinationType.Comb4: case CombinationType.Comb5:
                        if(combination.angle == 0) combo_type = ComboType.Horizontal;
                        else combo_type = ComboType.Vertical;
                    break;
                    default:
                        combo_type = ComboType.All;
                    break;
                }

                make_combo_element(combined_element.x, combined_element.y, element_data.type, combo_type);
            };

            const combined_element_world_pos = get_cell_world_pos(combined_element.x, combined_element.y);
            for(let i = 0; i < combination.elements.length; i++) {
                const element = combination.elements[i];
                const item = gm.get_item_by_index(element.id);
                if(item != undefined) {
                    const is_last = (i == combination.elements.length - 1); 
                    go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD,
                        combined_element_world_pos,
                        combined_element_easing,
                        combined_element_time, 0, is_last ? on_complite : null
                    );
                }
            }
        } 
    }

    function try_activate_combo(damaged_info: DamagedInfo) {
        if(damaged_info.element.data == null) return false;

        switch(damaged_info.element.data.combo_type) {
            case ComboType.All:
                for(let y = 0; y < field_height; y++) {
                    field.remove_element(damaged_info.x, y, true, true);
                }
                for(let x = 0; x < field_width; x++) {
                    field.remove_element(x, damaged_info.y, true, true);
                }
            break;
            case ComboType.Vertical:
                for(let y = 0; y < field_height; y++) {
                    field.remove_element(damaged_info.x, y, true, true);
                }
            break;
            case ComboType.Horizontal:
                for(let x = 0; x < field_width; x++) {
                    field.remove_element(x, damaged_info.y, true, true);
                }
            break;
        }

        return true;
    }

    function on_damaged_element(damaged_info: DamagedInfo) {
        const item = gm.get_item_by_index(damaged_info.element.id);
        if(item != undefined) {
            try_activate_combo(damaged_info);
            go.animate(item._hash, 'scale', go.PLAYBACK_ONCE_FORWARD, damaged_element_scale, damaged_element_easing, damaged_element_time, damaged_element_delay, () => {
                gm.delete_item(item, true, true);
            }); 
        }
    }

    function get_random_element_id(): ElementId | typeof NullElement {
        let index = math.random(Object.keys(GAME_CONFIG.element_database).length - 1);
        for(const [key, value] of Object.entries(GAME_CONFIG.element_database)) {
            if(index-- == 0) return tonumber(key) as ElementId;
        }

        return -1;
    }

    function on_request_element(x: number, y: number): Element | typeof NullElement {
        const to_world_pos = get_cell_world_pos(x, y, 0);

        const element = make_element(x, y, get_random_element_id());
        if(element as number == NullElement) return NullElement;

        const item_from = gm.get_item_by_index((element as Element).id);
        if(item_from == undefined) return NullElement;

        switch(move_direction) {
            case MoveDirection.Up:
                gm.set_position_xy(item_from, to_world_pos.x, to_world_pos.y + field_height * cell_size);
            break;
            case MoveDirection.Down:
                gm.set_position_xy(item_from, to_world_pos.x, to_world_pos.y - field_height * cell_size);
            break;
            case MoveDirection.Left:
                gm.set_position_xy(item_from, to_world_pos.x - field_width * cell_size, to_world_pos.y);
            break;
            case MoveDirection.Right:
                gm.set_position_xy(item_from, to_world_pos.x + field_width * cell_size, to_world_pos.y);
            break;
        }
        
        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, move_elements_easing, move_elements_time);

        return element;
    }

    function wait_event() {
        while (true) {
            const [message_id, _message, sender] = flow.until_any_message();
            gm.do_message(message_id, _message, sender);
            switch(message_id) {
                case ID_MESSAGES.MSG_ON_DOWN_ITEM:
                    on_up((_message as Messages['MSG_ON_UP_ITEM']).item);
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