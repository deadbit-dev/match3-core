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
import { IGameItem, MessageId, Messages, PosXYMessage } from '../modules/modules_const';
import { CellId, CombinedMessage, ComboMessage, DamagedElementMessage, ElementId, ElementMessage, GameStepEventBuffer, HelicopterActivationMessage, MoveElementMessage, ActivationMessage, SwapElementsMessage, SwapedActivationMessage, SwapedDiskosphereActivationMessage, ActivatedCellMessage, SwapedHelicoptersActivationMessage } from "../main/game_config";

import { 
    Element,
    GameState,
    ItemInfo,
    NullElement,
    NotActiveCell,
    CombinationInfo,
    StepInfo,
    Cell
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

    const cell_size = math.min((game_width - offset_border * 2) / field_width, 100);
    const scale_ratio = cell_size / origin_cell_size;
    const cells_offset = vmath.vector3(game_width / 2 - (field_width / 2 * cell_size), -(game_height / 2 - (field_height / 2 * cell_size)), 0);

    //#endregion FIELDS
    //#region MAIN          

    const gm = GoManager();

    const game_id_to_view_index: {[key in number]: number[]} = {};

    let selected_element: IGameItem | null = null;
    let is_processing = false;

    function init() {
        set_events();
        EventBus.send('LOAD_FIELD');
        
        input_listener();
    }
    
    function set_events() {
        EventBus.on('ON_SET_FIELD', (state) => {
            if(state == undefined) return;
            on_set_field(state);
        });

        EventBus.on('ON_WRONG_SWAP_ELEMENTS', (elements) => {
            if(elements == undefined) return;
            flow.start(() => on_wrong_swap_element_animation(elements.element_from, elements.element_to));
        });

        EventBus.on('ON_GAME_STEP', (events) => {
            if(events == undefined) return;
            flow.start(() => on_game_step(events));
        });

        EventBus.on('TRY_REVERT_STEP', () => {
            if(is_processing) return;
            EventBus.send('REVERT_STEP');
        });

        EventBus.on('ON_REVERT_STEP', (states) => {
            if(states == undefined) return;
            flow.start(() => on_revert_step_animation(states.current_state, states.previous_state));
        });
    }

    function on_game_step(events: GameStepEventBuffer) {
        is_processing = true;

        for(const event of events) {
            switch(event.key) {
                case 'ON_SWAP_ELEMENTS': on_swap_element_animation(event.value); break;
                case 'ON_COMBINED': on_combined_animation(event.value); break;
                case 'ON_COMBO': on_combo_animation(event.value); break;
                
                case 'SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED': on_swaped_buster_with_diskosphere_animation(event.value); break;
                
                case 'DISKOSPHERE_ACTIVATED': on_diskisphere_activated_animation(event.value); break;
                case 'SWAPED_DISKOSPHERES_ACTIVATED': on_swaped_diskospheres_animation(event.value); break;
                case 'SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED': on_swaped_diskosphere_with_buster_animation(event.value); break;
                case 'SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED': on_swaped_diskosphere_with_element_animation(event.value); break;

                case 'AXIS_ROCKET_ACTIVATED': on_axis_rocket_activated_animation(event.value); break;
                case 'ROCKET_ACTIVATED': on_rocket_activated_animation(event.value); break;
                case 'SWAPED_ROCKETS_ACTIVATED': on_swaped_rockets_animation(event.value); break;
                
                case 'HELICOPTER_ACTIVATED': on_helicopter_activated_animation(event.value); break;
                case 'SWAPED_HELICOPTERS_ACTIVATED': on_swaped_helicopters_animation(event.value); break;
                
                case 'DYNAMITE_ACTIVATED': on_dynamite_activated_animation(event.value); break;
                case 'SWAPED_DYNAMITES_ACTIVATED': on_swaped_dynamites_animation(event.value); break;

                case 'ACTIVATED_ELEMENT': on_activated_element_animation(event.value); break;
                
                case 'ON_CELL_ACTIVATED': on_cell_activated_animation(event.value); break;
                case 'MOVE_PHASE_BEGIN': flow.delay(0.1); break;
                case 'ON_MOVE_ELEMENT': on_move_element_animation(event.value); break;
                case 'ON_REQUEST_ELEMENT': on_request_element_animation(event.value); break;
                case 'MOVE_PHASE_END': flow.delay(1); break;
            }
        }

        is_processing = false;
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

        selected_element = null;
    }

    //#endregion INPUT
    //#region LOGIC         

    function on_set_field(state: GameState) {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {                
                const cell = state.cells[y][x];
                if(cell != NotActiveCell) {
                    try_make_under_cell(x, y, cell);
                    make_cell_view(x, y, cell.id, cell.uid, cell?.data?.z_index);
                }
                
                const element = state.elements[y][x];
                if(element != NullElement) make_element_view(x, y, element.type, element.uid, true);
            }
        }
    }

    function make_cell_view(x: number, y: number, cell_id: CellId, id: number, z_index = GAME_CONFIG.default_cell_z_index) {
        const pos = get_world_pos(x, y, z_index);
        const _go = gm.make_go('cell_view', pos);

        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.cell_database[cell_id].view);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        
        const index = gm.add_game_item({ _hash: _go, is_clickable: true });
        if(game_id_to_view_index[id] == undefined) game_id_to_view_index[id] = [];
        if(id != undefined) game_id_to_view_index[id].push(index);

        return index;
    }

    function make_element_view(x: number, y: number, type: ElementId, id: number, spawn_anim = false, z_index = GAME_CONFIG.default_element_z_index) {
        const pos = get_world_pos(x, y, z_index);
        const _go = gm.make_go('element_view', pos);

        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.element_database[type].view);
        
        if(spawn_anim) {
            go.set_scale(vmath.vector3(0.01, 0.01, 1), _go);
            go.animate(_go, 'scale', go.PLAYBACK_ONCE_FORWARD, vmath.vector3(scale_ratio, scale_ratio, 1), spawn_element_easing, spawn_element_time);
        } else go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
        
        const index = gm.add_game_item({ _hash: _go, is_clickable: true });
        if(game_id_to_view_index[id] == undefined) game_id_to_view_index[id] = [];
        if(id != undefined) game_id_to_view_index[id].push(index);

        return index;
    }

    //#endregion LOGIC
    //#region ANIMATIONS
    
    function on_swap_element_animation(message: Messages[MessageId]) {
        const elements = message as SwapElementsMessage;
        swap_elements_animation(elements.element_from, elements.element_to);
        flow.delay(swap_element_time + 0.1);
    }
    
    function on_wrong_swap_element_animation(element_from: ItemInfo, element_to: ItemInfo) {
        const from_world_pos = get_world_pos(element_from.x, element_from.y);
        const to_world_pos = get_world_pos(element_to.x, element_to.y);
        
        const item_from = get_first_view_item_by_game_id(element_from.uid);
        if(item_from == undefined) return;

        const item_to = get_first_view_item_by_game_id(element_to.uid);
        if(item_to == undefined) return;

        is_processing = true;

        // FORWARD
        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, swap_element_easing, swap_element_time);
        go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, swap_element_easing, swap_element_time);

        flow.delay(swap_element_time);

        // BACK
        go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, swap_element_easing, swap_element_time);
        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, swap_element_easing, swap_element_time);

        flow.delay(swap_element_time);

        is_processing = false;
    }

    function on_combined_animation(message: Messages[MessageId]) {
        const combined = message as CombinedMessage;
        for(const element of combined.combination.elements)
            damage_element_animation(element.uid);
    }

    function on_combo_animation(message: Messages[MessageId]) {
        const combo = message as ComboMessage;
        const target_element_world_pos = get_world_pos(combo.combined_element.x, combo.combined_element.y);
        for(let i = 0; i < combo.combination.elements.length; i++) {
            const element = combo.combination.elements[i];
            const item = get_first_view_item_by_game_id(element.uid);
            if(item != undefined) go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, target_element_world_pos,
                squash_element_easing, squash_element_time, 0);

            damage_element_animation(element.uid);
        }
        
        make_element_view(
            combo.maked_element.x,
            combo.maked_element.y,
            combo.maked_element.type,
            combo.maked_element.uid
        );
    }

    function on_diskisphere_activated_animation(message: Messages[MessageId]) {
        const activation = message as ActivationMessage;
        damage_element_animation(activation.element.uid);
        for(const element of activation.damaged_elements)
            damage_element_animation(element.uid);
    }

    function on_swaped_buster_with_diskosphere_animation(message: Messages[MessageId]) {
        const activation = message as SwapedDiskosphereActivationMessage;
        squash_element_animation(activation.other_element, activation.element, () => {
            damage_element_animation(activation.other_element.uid);
            damage_element_animation(activation.element.uid);
            for(const element of activation.damaged_elements)
                damage_element_animation(element.uid);
            for(const element of activation.maked_elements)
                make_element_view(element.x, element.y, element.type, element.uid);
        });

        flow.delay(swap_element_time + damaged_element_time);
    }
  
    function on_swaped_diskospheres_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        squash_element_animation(activation.other_element, activation.element, () => {
            damage_element_animation(activation.element.uid);
            damage_element_animation(activation.other_element.uid);
            for(const element of activation.damaged_elements)
                damage_element_animation(element.uid);
        });
        
    }
    
    function on_swaped_diskosphere_with_buster_animation(message: Messages[MessageId]) {
        const activation = message as SwapedDiskosphereActivationMessage;
        squash_element_animation(activation.other_element, activation.element, () => {
            damage_element_animation(activation.other_element.uid);
            damage_element_animation(activation.element.uid);
            for(const element of activation.damaged_elements)
                damage_element_animation(element.uid);
            for(const element of activation.maked_elements)
                make_element_view(element.x, element.y, element.type, element.uid);
        });

        flow.delay(swap_element_time + damaged_element_time);
    }

    function on_axis_rocket_activated_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        damage_element_animation(activation.element.uid);
        for(const element of activation.damaged_elements)
            damage_element_animation(element.uid);
    }

    function on_rocket_activated_animation(message: Messages[MessageId]) {
        const activation = message as ActivationMessage;
        damage_element_animation(activation.element.uid);
        for(const element of activation.damaged_elements)
            damage_element_animation(element.uid);
    }

    function on_swaped_rockets_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        squash_element_animation(activation.other_element, activation.element, () => {
            damage_element_animation(activation.other_element.uid);
            damage_element_animation(activation.element.uid);
            for(const element of activation.damaged_elements)
                damage_element_animation(element.uid);
        });
    }

    function on_helicopter_activated_animation(message: Messages[MessageId]) {
        const activation = message as HelicopterActivationMessage;
        for(const element of activation.damaged_elements)
            damage_element_animation(element.uid);
        if(activation.target_element != NullElement) remove_random_element_animation(activation.element, activation.target_element);
        else damage_element_animation(activation.element.uid);

        flow.delay(1.3);
    }

    function on_swaped_helicopters_animation(message: Messages[MessageId]) {
        const activation = message as SwapedHelicoptersActivationMessage;
        squash_element_animation(activation.other_element, activation.element, () => {
            for(const element of activation.damaged_elements)
                damage_element_animation(element.uid);
            
            let target_element = activation.target_elements.pop();
            if(target_element != undefined && target_element != NullElement)
                remove_random_element_animation(activation.element, target_element);
                
            target_element = activation.target_elements.pop();
            if(target_element != undefined && target_element != NullElement)
                remove_random_element_animation(activation.other_element, target_element);


            target_element = activation.target_elements.pop();
            if(target_element != undefined && target_element != NullElement) {
                make_element_view(activation.element.x, activation.element.y, ElementId.Helicopter, activation.element.uid);
                remove_random_element_animation(activation.element, target_element, 1);
            }
        });

        flow.delay(3);
    }

    function on_dynamite_activated_animation(message: Messages[MessageId]) {
        const activation = message as ActivationMessage;
        activate_buster_animation(activation.element.uid);
        for(const element of activation.damaged_elements)
            damage_element_animation(element.uid);
    }

    function on_swaped_dynamites_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        squash_element_animation(activation.other_element, activation.element, () => {
            delete_view_item_by_game_id(activation.other_element.uid);
            activate_buster_animation(activation.element.uid);
            for(const element of activation.damaged_elements)
                damage_element_animation(element.uid);
        });
    }

    function on_swaped_diskosphere_with_element_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        squash_element_animation(activation.other_element, activation.element, () => {
            damage_element_animation(activation.element.uid);
            for(const element of activation.damaged_elements)
                damage_element_animation(element.uid);
        });
    }

    function on_activated_element_animation(message: Messages[MessageId]) {
        const activation = message as ItemInfo;
        damage_element_animation(activation.uid);
    }

    function on_cell_activated_animation(message: Messages[MessageId]) {
        const activation = message as ActivatedCellMessage;
        delete_all_view_items_by_game_id(activation.previous_id);
        make_cell_view(activation.x, activation.y, activation.id, activation.uid);
    }

    function on_move_element_animation(message: Messages[MessageId]) {
        const move = message as MoveElementMessage;
        for(const pos of move.path) {
            const to_world_pos = get_world_pos(pos.x, pos.y, 0);
        
            const item_from = get_first_view_item_by_game_id(move.element.uid);
            if(item_from == undefined) return;

            go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, move_elements_easing, move_elements_time);
        }
    }

    function on_request_element_animation(message: Messages[MessageId]) {
        const request_element = message as ElementMessage;
        make_element_view(request_element.x, request_element.y, request_element.type, request_element.uid);
        
        const item_from = get_first_view_item_by_game_id(request_element.uid);
        if(item_from == undefined) return;

        const world_pos = get_world_pos(request_element.x, request_element.y);
        gm.set_position_xy(item_from, world_pos.x, world_pos.y + field_height * cell_size);
        
        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, world_pos, move_elements_easing, move_elements_time);
    }

    function on_revert_step_animation(current_state: GameState, previous_state: GameState) {
        for (let y = 0; y < field_height; y++) {
            for (let x = 0; x < field_width; x++) {
                const current_cell = current_state.cells[y][x];
                if(current_cell != NotActiveCell) {
                    delete_all_view_items_by_game_id(current_cell.uid);
                    
                    const previous_cell = previous_state.cells[y][x];
                    if(previous_cell != NotActiveCell) {
                        try_make_under_cell(x, y, previous_cell);
                        make_cell_view(x, y, previous_cell.id, previous_cell.uid, previous_cell?.data?.z_index);
                    }
                }

                const current_element = current_state.elements[y][x];
                if(current_element != NullElement) delete_view_item_by_game_id(current_element.uid);

                const previous_element = previous_state.elements[y][x];
                if(previous_element != NullElement) make_element_view(x, y, previous_element.type, previous_element.uid, true);
            }
        }
    }
    
    function remove_random_element_animation(element: ItemInfo, target_element: ItemInfo, view_index?: number, on_complited?: () => void) {
        const target_world_pos = get_world_pos(target_element.x, target_element.y);
        const item = view_index != undefined ? get_view_item_by_game_id_and_index(element.uid, view_index) : get_first_view_item_by_game_id(element.uid);
        if(item == undefined) return;
        
        go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, target_world_pos, go.EASING_INCUBIC, 1, 0.1, () => {
            damage_element_animation(target_element.uid);
            damage_element_animation(element.uid, () => {
                if(on_complited != undefined) on_complited();
            });
        });
    }
    
    function damage_element_animation(element_id: number, on_complite?: () => void) {
        const element_view_item = get_first_view_item_by_game_id(element_id);
        if(element_view_item != undefined) {
            go.animate(element_view_item._hash, 'scale', go.PLAYBACK_ONCE_FORWARD,
                damaged_element_scale, damaged_element_easing, damaged_element_time, damaged_element_delay, () => {
                    delete_view_item_by_game_id(element_id);
                    if(on_complite != undefined) on_complite();
                }); 
        }
    }

    function activate_buster_animation(element_id: number, on_complite?: () => void) {
        const element_view_item = get_first_view_item_by_game_id(element_id);
        if(element_view_item != undefined) {
            go.animate(element_view_item._hash, 'scale', go.PLAYBACK_ONCE_FORWARD,
                damaged_element_scale, go.EASING_INELASTIC, damaged_element_time, damaged_element_delay, () => {
                    delete_view_item_by_game_id(element_id);
                    if(on_complite != undefined) on_complite();
                }); 
        }
    }

    function swap_elements_animation(element_from: ItemInfo, element_to: ItemInfo) {
        const from_world_pos = get_world_pos(element_from.x, element_from.y);
        const to_world_pos = get_world_pos(element_to.x, element_to.y);

        const item_from = get_first_view_item_by_game_id(element_from.uid);
        if(item_from == undefined) return;
        
        const item_to = get_first_view_item_by_game_id(element_to.uid);
        if(item_to == undefined) return;

        go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, swap_element_easing, swap_element_time);
        go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, swap_element_easing, swap_element_time);
    }
    
    function squash_element_animation(element: ItemInfo, target_element: ItemInfo, on_complite?: () => void) {
        const to_world_pos = get_world_pos(target_element.x, target_element.y);
        
        const item = get_first_view_item_by_game_id(element.uid);
        if(item == undefined) return;
        
        go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, swap_element_easing, swap_element_time, 0, () => {
            if(on_complite != undefined) on_complite();
        });
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

    function get_first_view_item_by_game_id(id: number) {
        const indices = game_id_to_view_index[id];
        if(indices == undefined) return;

        return gm.get_item_by_index(indices[0]);
    }

    function get_view_item_by_game_id_and_index(id: number, index: number) {
        const indices = game_id_to_view_index[id];
        if(indices == undefined) return;

        return gm.get_item_by_index(indices[index]);
    }

    function get_all_view_items_by_game_id(id: number) {
        const indices = game_id_to_view_index[id];
        if(indices == undefined) return;

        const items = [];
        for(const index of indices)
            items.push(gm.get_item_by_index(index));

        return items;
    }

    function delete_view_item_by_game_id(id: number) {
        const item = get_first_view_item_by_game_id(id);
        if(item == undefined) {
            delete game_id_to_view_index[id];
            return false;
        }

        gm.delete_item(item, true);
        game_id_to_view_index[id].splice(0, 1);

        return true;
    }

    function delete_all_view_items_by_game_id(id: number) {
        const items = get_all_view_items_by_game_id(id);
        if(items == undefined) return false;

        for(const item of items) gm.delete_item(item, true);
        delete game_id_to_view_index[id];

        return true;
    }

    function try_make_under_cell(x: number, y: number, cell: Cell) {
        if(cell.data != undefined && cell.data.is_render_under_cell && cell.data.under_cells != undefined) {
            const cell_id = (cell.data.under_cells as CellId[])[(cell.data.under_cells as CellId[]).length - 1];
            if(cell_id != undefined) make_cell_view(x, y, cell_id, cell.uid, cell.data?.z_index - 1);
        }
    }

    //#endregion GET HELPERS

    return init();
}