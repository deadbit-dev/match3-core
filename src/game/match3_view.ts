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
/* eslint-disable no-case-declarations */


import * as flow from 'ludobits.m.flow';
import * as camera from '../utils/camera';

import { Direction } from '../utils/math_utils';
import { GoManager } from '../modules/GoManager';
import { IGameItem, Messages, PosXYMessage } from '../modules/modules_const';
import { ActivatedCellMessage, CellId, CombinedMessage, DamagedElementMessage, ElementId, ElementMessage, GameStepEventBuffer, MoveElementMessage, SwapElementsMessage } from "../main/game_config";

import { 
    Element,
    GameState,
    ItemInfo,
    NullElement,
    NotActiveCell,
    CombinationInfo,
    StepInfo
} from "./match3_core";


export function View() {
    //#region CONFIG        

    const game_width = 540;
    const game_height = 960;
 
    const swap_element_easing = GAME_CONFIG.swap_element_easing;
    const swap_element_time = GAME_CONFIG.swap_element_time;
    const move_elements_easing = GAME_CONFIG.move_elements_easing;
    const move_elements_time = GAME_CONFIG.move_elements_time;
    const squash_element_easing = GAME_CONFIG.squash_element_easing;
    const squash_element_time = GAME_CONFIG.squash_element_time;
    const spawn_element_easing = GAME_CONFIG.spawn_element_easing;
    const spawn_element_time = GAME_CONFIG.spawn_element_time;
    const damaged_element_easing = GAME_CONFIG.damaged_element_easing;
    const damaged_element_delay = GAME_CONFIG.damaged_element_delay;
    const damaged_element_time = GAME_CONFIG.damaged_element_time;
    const damaged_element_scale = GAME_CONFIG.damaged_element_scale;
    const min_swipe_distance = GAME_CONFIG.min_swipe_distance;
    const move_delay_after_combination = GAME_CONFIG.move_delay_after_combination;
    const wait_time_after_move = GAME_CONFIG.wait_time_after_move;
    const buster_delay = GAME_CONFIG.buster_delay;
    
    const level_config = GAME_CONFIG.levels[GameStorage.get('current_level')];
    const field_width = level_config['field']['width'];
    const field_height = level_config['field']['height'];
    const offset_border = level_config['field']['offset_border'];
    const origin_cell_size = level_config['field']['cell_size'];
    const move_direction = level_config['field']['move_direction'];

    const cell_size = math.min((game_width - offset_border * 2) / field_width, 100);
    const scale_ratio = cell_size / origin_cell_size;
    const cells_offset = vmath.vector3(game_width / 2 - (field_width / 2 * cell_size), -(game_height / 2 - (field_height / 2 * cell_size)), 0);

    //#endregion FIELDS
    //#region MAIN          

    const gm = GoManager();

    const game_id_to_view_index: {[key in number]: number} = {};
    let selected_element: IGameItem | null = null;
    let is_processing = false;

    function init() {
        set_events();
        EventBus.send('LOAD_FIELD');
        
        input_listener();
    }

    function on_game_step(events: GameStepEventBuffer) {
        is_processing = true;

        for(const event of events) {
            if(event.key == 'ON_SWAP_ELEMENTS') {
                const message = event.value as SwapElementsMessage;
                on_swap_element_animation(message.element_from, message.element_to);
                flow.delay(0.3);
            }
            else if(event.key == 'ON_WRONG_SWAP_ELEMENTS') {
                const message = event.value as SwapElementsMessage;
                on_wrong_swap_element_animation(message.element_from, message.element_to);
            }
            else if(event.key == 'ON_COMBINED') {
                flow.delay(0.3);
            }
            else if(event.key == 'ON_COMBO') {
                const message = event.value as CombinedMessage;
                on_combined_animation(message.combined_element, message.combination);
                flow.delay(0.5);
            }
            else if(event.key == 'BUSTER_ACTIVATED') {
                flow.delay(1);
            }
            else if(event.key == 'ON_DAMAGED_ELEMENT') {
                const message = event.value as DamagedElementMessage;
                on_damaged_element_animation(message.id);
            }
            else if(event.key == 'ON_CELL_ACTIVATED') {
                const message = event.value as ActivatedCellMessage;
                delete_view_item_by_game_id(message.previous_id);
                make_cell_view(message.x, message.y, message.id, message.variety);
            }
            else if(event.key == 'ON_MAKE_ELEMENT') {
                const message = event.value as ElementMessage;
                make_element_view(message.x, message.y, message.id, message.type, true);
            }
            else if(event.key == 'ON_MOVE_ELEMENT') {
                const message = event.value as MoveElementMessage;
                on_move_element_animation(message.from_x, message.from_y, message.to_x, message.to_y, message.element);
            }
            else if(event.key == 'ON_REQUEST_ELEMENT') {
                const message = event.value as ElementMessage;
                make_element_view(message.x, message.y, message.id, message.type);
                request_element_animation(message.x, message.y, message.id);
            }
            else if(event.key == 'END_MOVE_PHASE') {
                flow.delay(1);
            }
        }

        is_processing = false;
    }

    function set_events() {
        EventBus.on('ON_SET_FIELD', (state) => {
            if(state == undefined) return;
            on_set_field(state);
        });

        EventBus.on('GAME_STEP', (events) => {
            if(events == undefined) return;
            flow.start(() => on_game_step(events));
        });

        EventBus.on('TRY_REVERT_STEP', () => {
            if(is_processing) return;
            EventBus.send('REVERT_STEP');
        });

        EventBus.on('ON_REVERT_STEP', (states) => {
            if(states == undefined) return;
            flow.start(() => revert_step_animation(states.current_state, states.previous_state));
        });
    }

    //#endregion MAIN
    //#region INPUT         

    function input_listener() {
        while (true) {
            const [message_id, _message, sender] = flow.until_any_message();
            gm.do_message(message_id, _message, sender);
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
            }
        }
    }

    function on_down(item: IGameItem) {
        if(is_processing) return;

        selected_element = item;
    }
    
    function on_move(pos: PosXYMessage) {
        if(selected_element == null) return;
            
        const world_pos = camera.screen_to_world(pos.x, pos.y);
        const selected_element_world_pos = go.get_world_position(selected_element._hash);
        const delta = (world_pos - selected_element_world_pos) as vmath.vector3;
        
        if(vmath.length(delta) < min_swipe_distance) return;

        const selected_element_pos = get_field_pos(selected_element_world_pos);
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

        EventBus.send('SWAP_ELEMENTS', {
            from_x: selected_element_pos.x,
            from_y: selected_element_pos.y,
            to_x: element_to_pos.x,
            to_y: element_to_pos.y
        });
        
        selected_element = null;
    }

    function on_up(item: IGameItem) {
        if(selected_element == null) return;

        const item_world_pos = go.get_world_position(item._hash);
        const element_pos = get_field_pos(item_world_pos);

        EventBus.send('CLICK_ACTIVATION', {
            x: element_pos.x,
            y: element_pos.y
        });
    }

    //#endregion INPUT
    //#region LOGIC         

    function on_set_field(state: GameState) {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const cell = state.cells[y][x];
                if(cell != NotActiveCell) make_cell_view(x, y, cell.id, cell?.data?.variety);
                const element = state.elements[y][x];
                if(element != NullElement) make_element_view(x, y, element.id, element.type, true);
            }
        }
    }

    function make_cell_view(x: number, y: number, id: number, cell_id: CellId, z_index = -1) {
        const pos = get_world_pos(x, y, z_index);
        const _go = gm.make_go('cell_view', pos);

        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.cell_database[cell_id].view);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        
        game_id_to_view_index[id] = gm.add_game_item({ _hash: _go, is_clickable: true });
    }

    function make_element_view(x: number, y: number, id: number, type: ElementId, spawn_anim = false, z_index = 0) {
        const pos = get_world_pos(x, y, z_index);
        const _go = gm.make_go('element_view', pos);

        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.element_database[type].view);
        
        if(spawn_anim) {
            go.set_scale(vmath.vector3(0.01, 0.01, 1), _go);
            go.animate(_go, 'scale', go.PLAYBACK_ONCE_FORWARD, vmath.vector3(scale_ratio, scale_ratio, 1), spawn_element_easing, spawn_element_time);
        } else go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        
        game_id_to_view_index[id] = gm.add_game_item({ _hash: _go, is_clickable: true });
    }

    //#endregion LOGIC
    //#region ANIMATIONS
    
    function on_swap_element_animation(element_from: ItemInfo, element_to: ItemInfo) {
        const from_world_pos = get_world_pos(element_from.x, element_from.y);
        const to_world_pos = get_world_pos(element_to.x, element_to.y);

        const item_from = get_view_item_by_game_id(element_from.id);
        if(item_from == undefined) return;
        
        const item_to = get_view_item_by_game_id(element_to.id);
        if(item_to == undefined) return;

        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, swap_element_easing, swap_element_time);
        go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, swap_element_easing, swap_element_time);
    }
    
    function on_wrong_swap_element_animation(element_from: ItemInfo, element_to: ItemInfo) {
        const from_world_pos = get_world_pos(element_from.x, element_from.y);
        const to_world_pos = get_world_pos(element_to.x, element_to.y);
        
        const item_from = get_view_item_by_game_id(element_from.id);
        if(item_from == undefined) return;

        const item_to = get_view_item_by_game_id(element_to.id);
        if(item_to == undefined) return;

        // FORWARD
        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, swap_element_easing, swap_element_time);
        go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, swap_element_easing, swap_element_time);

        flow.delay(swap_element_time);

        // BACK
        go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, swap_element_easing, swap_element_time);
        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, swap_element_easing, swap_element_time);
    }

    function on_combined_animation(combination_element: ItemInfo, combination: CombinationInfo) {
        const target_element_world_pos = get_world_pos(combination_element.x, combination_element.y);
        for(let i = 0; i < combination.elements.length; i++) {
            const element = combination.elements[i];
            const item = gm.get_item_by_index(element.id);
            if(item != undefined) go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, target_element_world_pos,
                squash_element_easing, squash_element_time, 0);
        }
    }
    
    function on_damaged_element_animation(element_id: number) {
        const element_view_item = get_view_item_by_game_id(element_id);
        if(element_view_item != undefined) {
            go.animate(element_view_item._hash, 'scale', go.PLAYBACK_ONCE_FORWARD,
                damaged_element_scale, damaged_element_easing, damaged_element_time, damaged_element_delay, () => {
                    delete_view_item_by_game_id(element_id);
                }); 
        }
    }

    function on_move_element_animation(from_x: number, from_y: number, to_x: number, to_y: number, element: Element) {
        const to_world_pos = get_world_pos(to_x, to_y, 0);
        
        const item_from = get_view_item_by_game_id(element.id);
        if(item_from == undefined) return;

        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, move_elements_easing, move_elements_time);
    }

    function request_element_animation(x: number, y: number, id: number) {
        const item_from = get_view_item_by_game_id(id);
        if(item_from == undefined) return;

        const world_pos = get_world_pos(x, y);

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
                const current_cell = current_state.cells[y][x];
                if(current_cell != NotActiveCell) {
                    delete_view_item_by_game_id(current_cell.id);
                    
                    const previous_cell = previous_state.cells[y][x];
                    if(previous_cell != NotActiveCell) make_cell_view(x, y, previous_cell.id, previous_cell?.data?.variety);
                }

                const current_element = current_state.elements[y][x];
                if(current_element != NullElement) delete_view_item_by_game_id(current_element.id);

                const previous_element = previous_state.elements[y][x];
                if(previous_element != NullElement) make_element_view(x, y, previous_element.id, previous_element.type, true);
            }
        }
    }
    
    function remove_random_element_animation(element: Element, target_x: number, target_y: number, on_complite?: () => void) {
        const target_world_pos = get_world_pos(target_x, target_y);
        const item = gm.get_item_by_index(element.id);
        if(item == undefined) return;
        
        flow.go_animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, target_world_pos, go.EASING_INCUBIC, 1, 0.1);
        if(on_complite != undefined) on_complite();
    }

    //#endregion ANIMATIONS
    //#region HELPERS       

    function get_world_pos(x: number, y: number, z = 0) {
        return vmath.vector3(cells_offset.x + cell_size * x + cell_size * 0.5, cells_offset.y - cell_size * y - cell_size * 0.5, z);
    }
    
    function get_field_pos(world_pos: vmath.vector3): {x: number, y: number} {        
        return {x: (world_pos.x - cells_offset.x - cell_size * 0.5) / cell_size, y: (cells_offset.y - world_pos.y - cell_size * 0.5) / cell_size};
    }
    
    function get_move_direction(dir: vmath.vector3) {
        const cs45 = 0.7;
        if(dir.y > cs45) return Direction.Up;
        else if(dir.y < -cs45) return Direction.Down;
        else if(dir.x < -cs45) return Direction.Left;
        else if(dir.x > cs45) return Direction.Right;
        else return Direction.None;
    }

    function get_view_item_by_game_id(id: number) {
        const view_index = game_id_to_view_index[id];
        return gm.get_item_by_index(view_index);
    }

    function delete_view_item_by_game_id(id: number) {
        gm.delete_item(get_view_item_by_game_id(id), true);
        delete game_id_to_view_index[id];
    }

    //#endregion GET HELPERS

    return init();
}