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
import { GoManager } from '../modules/GoManager';

import { CombinationInfo, Element, GameState, ItemInfo, NullElement, Field } from "./match3_core";
import { CellId, ElementId } from "../main/game_config";
import { Direction } from '../utils/math_utils';
import { IGameItem } from '../modules/modules_const';


export function View() {
    const game_width = 540;
    const game_height = 960;
 
    const swap_element_easing = GAME_CONFIG.swap_element_easing;
    const swap_element_time = GAME_CONFIG.swap_element_time;
    const move_elements_easing = GAME_CONFIG.move_elements_easing;
    const move_elements_time = GAME_CONFIG.move_elements_time;
    const combined_element_easing = GAME_CONFIG.combined_element_easing;
    const combined_element_time = GAME_CONFIG.combined_element_time;
    const spawn_element_easing = GAME_CONFIG.spawn_element_easing;
    const spawn_element_time = GAME_CONFIG.spawn_element_time;
    const damaged_element_easing = GAME_CONFIG.damaged_element_easing;
    const damaged_element_delay = GAME_CONFIG.damaged_element_delay;
    const damaged_element_time = GAME_CONFIG.damaged_element_time;
    const damaged_element_scale = GAME_CONFIG.damaged_element_scale;
    
    const level_config = GAME_CONFIG.levels[GameStorage.get('current_level')];

    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const offset_border = level_config['field']['offset_border'];
    const origin_cell_size = level_config['field']['cell_size'];
    const move_direction = level_config['field']['move_direction'];
    
    const gm = GoManager();

    let cell_size: number;
    let scale_ratio: number;
    let cells_offset: vmath.vector3;

    function init() {
        cell_size = math.min((game_width - offset_border * 2) / field_width, 100);
        scale_ratio = cell_size / origin_cell_size;
        cells_offset = vmath.vector3(
            game_width / 2 - (field_width / 2 * cell_size),
            -(game_height / 2 - (field_height / 2 * cell_size)),
            0
        );
    }
    
    function get_cell_world_pos(x: number, y: number, z = 0) {
        return vmath.vector3(cells_offset.x + cell_size * x + cell_size * 0.5, cells_offset.y - cell_size * y - cell_size * 0.5, z);
    }
    
    function get_element_pos(world_pos: vmath.vector3): {x: number, y: number} {        
        return {x: (world_pos.x - cells_offset.x - cell_size * 0.5) / cell_size, y: (cells_offset.y - world_pos.y - cell_size * 0.5) / cell_size};
    }
    
    function get_item_by_index(index: number) {
        return gm.get_item_by_index(index);
    }

    function damaged_element_animation(element_id: number) {
        const item = get_item_by_index(element_id);
        if(item != undefined) {
            go.animate(item._hash, 'scale', go.PLAYBACK_ONCE_FORWARD, damaged_element_scale, damaged_element_easing, damaged_element_time, damaged_element_delay, () => {
                delete_item(item, true);
            }); 
        }
    }

    function delete_item(item: IGameItem, remove_from_scene = true, recursive = false) {
        return gm.delete_item(item, remove_from_scene, recursive);
    }

    function do_message(message_id: hash, message: any, sender: hash){
        gm.do_message(message_id, message, sender);
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

    function swap_element_animation(element_from: Element, element_to: Element, from_world_pos: vmath.vector3, to_world_pos: vmath.vector3) {
        const item_from = get_item_by_index(element_from.id);
        if(item_from == undefined) return;

        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, swap_element_easing, swap_element_time);

        const item_to = get_item_by_index(element_to.id);
        if(item_to == undefined) return;

        flow.go_animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, swap_element_easing, swap_element_time);
    }

    function on_move_element_animation(from_x: number, from_y: number, to_x: number, to_y: number, element: Element) {
        const to_world_pos = get_cell_world_pos(to_x, to_y, 0);
        
        const item_from = get_item_by_index(element.id);
        if(item_from == undefined) return;

        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, move_elements_easing, move_elements_time);
    }
    
    function squash_combo_animation(combined_element: ItemInfo, combination: CombinationInfo, on_complite: () => void) {
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

    function request_element_animation(element: Element, x: number, y: number, z: number) {
        const item_from = gm.get_item_by_index(element.id);
        if(item_from == undefined) return;

        const world_pos = get_cell_world_pos(x, y, z);

        switch(move_direction) {
            case Direction.Up:
                gm.set_position_xy(item_from, world_pos.x, world_pos.y + field_height * cell_size);
            break;
            case Direction.Down:
                gm.set_position_xy(item_from, world_pos.x, world_pos.y - field_height * cell_size);
            break;
            case Direction.Left:
                gm.set_position_xy(item_from, world_pos.x - field_width * cell_size, world_pos.y);
            break;
            case Direction.Right:
                gm.set_position_xy(item_from, world_pos.x + field_width * cell_size, world_pos.y);
            break;
        }
        
        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, world_pos, move_elements_easing, move_elements_time);
    }

    function revert_step_animation(current_state: GameState, previous_state: GameState) {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const current_element = current_state.elements[y][x];
                if(current_element as number != NullElement) {
                    const current_item = get_item_by_index((current_element as Element).id);
                    if(current_item != undefined) {
                        const pos = {x, y};
                        go.animate(current_item._hash, 'scale', go.PLAYBACK_ONCE_FORWARD, vmath.vector3(0.1, 0.1, 1), damaged_element_easing, damaged_element_time, damaged_element_delay, () => {
                            gm.delete_item(current_item);
                            const previous_element = previous_state.elements[pos.y][pos.x];
                            if(previous_element as number != NullElement) {
                                (previous_element as Element).id = set_element_view(pos.x, pos.y, (previous_element as Element).type, true);
                                previous_state.elements[pos.y][pos.x] = previous_element;
                            }
                        });
                    }
                }
            }
        }

        return previous_state;
    }

    function helicopter_animation(helicopter: Element, target_x: number, target_y: number, on_complite?: () => void) {
        const target_world_pos = get_cell_world_pos(target_x, target_y);
        const helicopter_item = gm.get_item_by_index(helicopter.id);
        if(helicopter_item == undefined) return;
        
        flow.go_animate(helicopter_item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, target_world_pos, go.EASING_INCUBIC, 1, 0.1);
        if(on_complite != undefined) on_complite();
    }

    return {
        init, set_cell_view, set_element_view, get_cell_world_pos, get_element_pos,
        swap_element_animation, squash_combo_animation, request_element_animation,
        damaged_element_animation, revert_step_animation, helicopter_animation,
        on_move_element_animation, get_item_by_index, delete_item, do_message
    };
}

