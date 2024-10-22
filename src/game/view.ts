/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-constant-condition */

// import * as flow from 'ludobits.m.flow';
import { GoManager } from "../modules/GoManager";
import { IGameItem, ItemMessage, PosXYMessage } from '../modules/modules_const';
import { Axis, Direction, is_valid_pos, rotateMatrix } from "../utils/math_utils";
import { get_current_level, get_field_cell_size, get_field_height, get_field_max_height, get_field_max_width, get_field_offset_border, get_field_width, get_move_direction, is_animal_level, is_tutorial } from "./utils";
import { NotActiveCell, NullElement, Cell, Element, MoveInfo, Position, DamageInfo, CombinationInfo, is_available_cell_type_for_move, ElementInfo, ElementState } from "./core";
import { base_cell, CellId, ElementId, GameState, LockInfo, Target, TargetState, UnlockInfo } from "./game";
import { BusterActivatedMessage, CombinateBustersMessage, CombinedMessage, DiskosphereActivatedMessage, DynamiteActivatedMessage, HelicopterActionMessage, HelicopterActivatedMessage, HelperMessage, RequestElementMessage, RocketActivatedMessage, SwapElementsMessage, TargetMessage } from '../main/game_config';


const SubstrateMasks = [
    [
        [0, 1, 0],
        [1, 0, 1],
        [0, 0, 0]
    ],

    [
        [0, 1, 0],
        [1, 0, 0],
        [0, 0, 1]
    ],

    [
        [0, 1, 0],
        [1, 0, 0],
        [0, 0, 0]
    ],

    [
        [0, 0, 0],
        [1, 0, 1],
        [0, 0, 0]
    ],

    [
        [0, 0, 1],
        [1, 0, 0],
        [0, 0, 1]
    ],

    [
        [0, 0, 1],
        [1, 0, 0],
        [0, 0, 0]
    ],

    [
        [0, 0, 0],
        [1, 0, 0],
        [0, 0, 1]
    ],

    [
        [0, 0, 0],
        [1, 0, 0],
        [0, 0, 0]
    ],

    [
        [0, 0, 1],
        [0, 0, 0],
        [0, 0, 1]
    ],

    [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 1]
    ],

    [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ]
];

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

export const EMPTY_SUBSTRATE = -1;

export interface ViewState {
    game_id_to_view_index: { [key in string]: number[] },
    substrates: hash[][],
    targets: { [key in number]: TargetState }
}

export interface ViewResources {
    default_sprite_material: hash,
    tutorial_sprite_material: hash
}

export enum Action {
    Swap,
    Combination,
    Combo,
    HelicopterFly,
    DiskosphereActivation,
    DiskosphereTrace,
    DynamiteActivation,
    RocketActivation,
    Falling
}

export interface View {
    on_message: (this: any, message_id: hash, message: any, sender: hash) => void;
}

export function View(resources: ViewResources) {

    const go_manager = GoManager();
    const view_state = {} as ViewState;

    view_state.game_id_to_view_index = {};
    view_state.substrates = [];
    view_state.targets = {};

    const original_game_width = 540;
    const original_game_height = 960;
    
    const cell_size = calculate_cell_size();
    const scale_ratio = calculate_scale_ratio();
    const cells_offset = calculate_cell_offset();

    let down_item: IGameItem | null = null;
    let is_block_input = false;

    const locks: hash[] = [];

    const actions: Action[] = [];

    function init() {
        Log.log("INIT VIEW");

        Camera.set_dynamic_orientation(false);
        Camera.set_go_prjection(-1, 0, -3, 3);
        
        set_scene_art();
        set_events();

        Camera.update_window_size();

        if(!GAME_CONFIG.is_restart) Sound.play('game');
        GAME_CONFIG.is_restart = false;

        EventBus.send('REQUEST_LOAD_GAME');
    }

    function set_events() {
        EventBus.on("SYS_ON_RESIZED", on_resize);
        EventBus.on('RESPONSE_LOAD_GAME', on_load_game, false);
        EventBus.on('RESPONSE_RELOAD_FIELD', load_field, false);
        EventBus.on('MSG_ON_DOWN_ITEM', on_down);
        EventBus.on('MSG_ON_UP_ITEM', on_up);
        EventBus.on('MSG_ON_MOVE', on_move);
        EventBus.on('ON_WIN_END', on_win_end);
        EventBus.on('ON_GAME_OVER', on_gameover);
        EventBus.on('SET_TUTORIAL', (lock_info: LockInfo) => {
            if(is_animal_level() && is_tutorial()) {
                EventBus.send('SET_ANIMAL_TUTORIAL_TIP');
                EventBus.on('HIDED_ANIMAL_TUTORIAL_TIP', () => {
                    on_set_tutorial(lock_info);
                });
            } else on_set_tutorial(lock_info);
        });
        EventBus.on('SET_HELPER', on_set_helper, false);
        EventBus.on('RESET_HELPER', on_reset_helper, false);
        EventBus.on('STOP_HELPER', on_stop_helper, false);
        EventBus.on('REMOVE_TUTORIAL', on_remove_tutorial);
        EventBus.on('RESPONSE_SWAP_ELEMENTS', swap_elements_animation, false);
        EventBus.on('RESPONSE_WRONG_SWAP_ELEMENTS', wrong_swap_elements_animation, false);
        EventBus.on('RESPONSE_COMBINATE_BUSTERS', on_combinate_busters, false);
        EventBus.on('RESPONSE_COMBINATE', on_combinate_animation, false);
        EventBus.on('RESPONSE_COMBINATE_NOT_FOUND', on_combinate_not_found, false);
        EventBus.on('RESPONSE_COMBINATION', on_combined_animation, false);
        EventBus.on('RESPONSE_FALLING', on_falling_animation, false);
        EventBus.on('RESPONSE_FALLING_NOT_FOUND', on_falling_not_found, false);
        EventBus.on('RESPONSE_FALL_END', on_fall_end_animation, false);
        EventBus.on('REQUESTED_ELEMENT', on_requested_element_animation, false);
        EventBus.on('RESPONSE_HAMMER_DAMAGE', on_hammer_damage_animation, false);
        EventBus.on('RESPONSE_DYNAMITE_ACTIVATED', on_dynamite_activated_animation, false);
        EventBus.on('RESPONSE_DYNAMITE_ACTION', on_dynamite_action_animation, false);
        EventBus.on('RESPONSE_ACTIVATED_ROCKET', on_rocket_activated_animation, false);
        EventBus.on('RESPONSE_ACTIVATED_DISKOSPHERE', on_diskosphere_activated_animation, false);
        EventBus.on('RESPONSE_ACTIVATED_HELICOPTER', on_helicopter_activated_animation, false);
        EventBus.on('RESPONSE_HELICOPTER_ACTION', on_helicopter_action_animation, false);
        EventBus.on('SHUFFLE_ACTION', on_shuffle_animation, false);
        EventBus.on('UPDATED_TARGET', (message: {idx: number, target: TargetState}) => {
            view_state.targets[message.idx] = message.target;
        }, false);
        EventBus.on('RESPONSE_REWIND', on_rewind_animation, false);
    }

    function on_message(this: any, message_id: hash, message: any, sender: hash) {
        go_manager.do_message(message_id, message, sender);
    }

    function set_scene_art() {
        const scene_name = Scene.get_current_name();
        Scene.load_resource(scene_name, 'background');
        
        if(GAME_CONFIG.animal_levels.includes(get_current_level() + 1)) {
            Scene.load_resource(scene_name, 'cat');
            Scene.load_resource(scene_name, GAME_CONFIG.level_to_animal[get_current_level() + 1]);
        }
    }

    function set_substrates() {
        for(let y = 0; y < get_field_height(); y++) {
            view_state.substrates[y] = [];
            for(let x = 0; x < get_field_width(); x++) {
                view_state.substrates[y][x] = EMPTY_SUBSTRATE;
            }
        }
    }

    function calculate_cell_size() {
        return math.floor(math.min((original_game_width - get_field_offset_border() * 2) / get_field_max_width(), 100));
    }

    function calculate_scale_ratio() {
        return cell_size / get_field_cell_size();
    }

    function calculate_cell_offset(height_delta = 0, changes_coff = 1) {
        const offset_x = original_game_width / 2 - (get_field_width() / 2 * cell_size);
        const offset_y = -(original_game_height / 2 - (get_field_max_height() / 2 * cell_size)) + 600;
        return vmath.vector3(
            offset_x,
            offset_y,
            0
        );
    }

    function on_load_game(game_state: GameState) {
        load_field(game_state);

        EventBus.send('INIT_UI');
        EventBus.send('UPDATED_STEP_COUNTER', game_state.steps);
        
        for(let i = 0; i < game_state.targets.length; i++) {
            const target = game_state.targets[i];
            const amount = target.count - target.uids.length;
            view_state.targets[i] = target;

            EventBus.send('UPDATED_TARGET_UI', {idx: i, amount, id: target.id, type: target.type});
        }

        EventBus.send('REQUEST_IDLE');
    }

    function on_resize(data: { width: number, height: number }) {
        Log.log("RESIZE");
        const display_height = 960;
        const window_aspect = data.width / data.height;
        const display_width = tonumber(sys.get_config("display.width"));
        if (display_width) {
            const aspect = display_width / display_height;
            let zoom = 1;
            if (window_aspect >= aspect) {
                const height = display_width / window_aspect;
                zoom = height / display_height;
            }
            Log.log("ZOOM");
            Camera.set_zoom(zoom);
        }
    }

    function load_field(game_state: GameState, with_anim = true) {
        Log.log("LOAD FIELD_VIEW");

        set_substrates();

        for (let y = 0; y < get_field_height(); y++) {
            for (let x = 0; x < get_field_width(); x++) {
                const cell = game_state.cells[y][x];
                if (cell != NotActiveCell) {
                    make_substrate_view({x, y}, game_state.cells);
                    make_cell_view({x, y}, base_cell(cell.uid));
                    make_cell_view({x, y}, cell);
                }

                const element = game_state.elements[y][x];
                if (element != NullElement)
                    make_element_view(x, y, element, with_anim);
            }
        }
    }

    function reset_field() {
        Log.log("RESET FIELD VIEW");

        for(const [suid, index] of Object.entries(view_state.game_id_to_view_index)) {
            const uid = tonumber(suid);
            if(uid != undefined) {
                const items = get_all_view_items_by_uid(uid);
                if(items != undefined) {
                    for (const item of items)
                        go_manager.delete_item(item, true);
                }
            }
        }

        for(let y = 0; y < get_field_height(); y++) {
            for(let x = 0; x < get_field_width(); x++) {
                const substrate = view_state.substrates[y][x];
                if(substrate != EMPTY_SUBSTRATE) {
                    go.delete(substrate);
                }
            }
        }

        view_state.game_id_to_view_index = {};
        view_state.substrates = [];

        for(let y = 0; y < get_field_height(); y++) {
            view_state.substrates[y] = [];
            for(let x = 0; x < get_field_width(); x++)
                view_state.substrates[y][x] = EMPTY_SUBSTRATE;
        }
    }

    function on_rewind_animation(state: GameState) {
        reset_field();
        load_field(state);

        for(let i = 0; i < state.targets.length; i++) {
            const target = state.targets[i];
            const amount = target.count - target.uids.length;
            view_state.targets[i] = target;
            EventBus.send('UPDATED_TARGET_UI', {idx: i, amount, id: target.id, type: target.type});
        }
    }

    function get_view_item_by_uid(uid: number) {
        const indices = view_state.game_id_to_view_index[uid];
        if (indices == undefined) return;
    
        return go_manager.get_item_by_index(indices[0]);
    }

    function get_all_view_items_by_uid(uid: number) {
        const indices = view_state.game_id_to_view_index[uid];
        if (indices == undefined) return;
    
        const items = [];
        for (const index of indices)
            items.push(go_manager.get_item_by_index(index));
    
        return items;
    }

    function delete_view_item_by_uid(uid: number) {
        const item = get_view_item_by_uid(uid);
        if(item == undefined) {
            delete view_state.game_id_to_view_index[uid];
            return;
        }

        update_targets_by_uid(uid);

        go_manager.delete_item(item, true);
        view_state.game_id_to_view_index[uid].splice(0, 1);
    }

    function delete_all_view_items_by_uid(uid: number) {
        const items = get_all_view_items_by_uid(uid);
        if (items == undefined) return;
    
        for (const item of items) {
            go_manager.delete_item(item, true);
        }

        update_targets_by_uid(uid);

        delete view_state.game_id_to_view_index[uid];
    }

    function update_targets_by_uid(uid: number) {
        for(let i = 0; i < Object.entries(view_state.targets).length; i++) {
            const target = view_state.targets[i];
            if(target.uids.includes(uid)) {
                const amount = target.count - target.uids.length;
                EventBus.send('UPDATED_TARGET_UI', {idx: i, amount, id: target.id, type: target.type});
            }
        }
    }

    function get_world_pos(pos: Position, z = 0) {
        return vmath.vector3(
            cells_offset.x + cell_size * pos.x + cell_size * 0.5,
            cells_offset.y - cell_size * pos.y - cell_size * 0.5,
            z
        );
    }

    function get_field_pos(world_pos: vmath.vector3): Position {
        for (let y = 0; y < get_field_height(); y++) {
            for (let x = 0; x < get_field_width(); x++) {
                const original_world_pos = get_world_pos({x, y});
                const in_x = (world_pos.x >= original_world_pos.x - cell_size * 0.5) && (world_pos.x <= original_world_pos.x + cell_size * 0.5);
                const in_y = (world_pos.y >= original_world_pos.y - cell_size * 0.5) && (world_pos.y <= original_world_pos.y + cell_size * 0.5);
                if (in_x && in_y) {
                    return { x, y };
                }
            }
        }
    
        return { x: -1, y: -1 };
    }

    function make_substrate_view(pos: Position, cells: (Cell | typeof NotActiveCell)[][], z_index = GAME_CONFIG.default_substrate_z_index) {
        for (let mask_index = 0; mask_index < SubstrateMasks.length; mask_index++) {
            let mask = SubstrateMasks[mask_index];

            let is_90_mask = false;
            if (mask_index == SubstrateId.LeftRightStrip) is_90_mask = true;

            let angle = 0;
            const max_angle = is_90_mask ? 90 : 270;
            while (angle <= max_angle) {
                let is_valid = true;
                for (let i = pos.y - (mask.length - 1) / 2; (i <= pos.y + (mask.length - 1) / 2) && is_valid; i++) {
                    for (let j = pos.x - (mask[0].length - 1) / 2; (j <= pos.x + (mask[0].length - 1) / 2) && is_valid; j++) {
                        if (mask[i - (pos.y - (mask.length - 1) / 2)][j - (pos.x - (mask[0].length - 1) / 2)] == 1) {
                            if (is_valid_pos(j, i, cells[0].length, cells.length)) {
                                const cell = cells[i][j];
                                is_valid = (cell == NotActiveCell);
                            } else is_valid = true;
                        }
                    }
                }

                if (is_valid) {
                    const worldPos = get_world_pos(pos, z_index);
                    const _go = go_manager.make_go('substrate_view', worldPos);

                    // go.set_parent(_go, field_go);
                    
                    go_manager.set_rotation_hash(_go, -angle);
                    sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.substrate_view[mask_index as SubstrateId]);
                    go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
                    view_state.substrates[pos.y][pos.x] = _go;
                    return;
                }

                mask = rotateMatrix(mask, 90);
                angle += 90;
            }
        }
    }

    function make_cell_view(pos: Position, cell: Cell) {
        let z_index;
        const is_top_layer_cell = GAME_CONFIG.top_layer_cells.includes(cell.id as CellId);
        if(is_top_layer_cell) z_index = GAME_CONFIG.default_top_layer_cell_z_index;
        else z_index = GAME_CONFIG.default_cell_z_index;
        if(cell.id == CellId.Base) z_index -= 0.1;
        
        const worldPos = get_world_pos(pos, z_index);
        const _go = go_manager.make_go('cell_view', worldPos);
    
        let view;
        if(Array.isArray(GAME_CONFIG.cell_view[cell.id as CellId])) {
            const index = (cell.strength != undefined) ? cell.strength : 1;
            view = GAME_CONFIG.cell_view[cell.id as CellId][index - 1];
        } else view = GAME_CONFIG.cell_view[cell.id as CellId] as string;

        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), view);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
    
        if (cell.id == CellId.Base) go_manager.set_color_hash(_go, GAME_CONFIG.base_cell_color);
    
        const index = go_manager.add_game_item({ _hash: _go, is_clickable: true });
        if (view_state.game_id_to_view_index[cell.uid] == undefined) view_state.game_id_to_view_index[cell.uid] = [];
        view_state.game_id_to_view_index[cell.uid].push(index);
    
        return index;
    }
    
    function make_element_view(x: number, y: number, element: Element, spawn_anim = false) {
        const z_index = GAME_CONFIG.default_element_z_index;
        const pos = get_world_pos({x, y}, z_index);
        const _go = go_manager.make_go('element_view', pos);
    
        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.element_view[element.id as ElementId]);
    
        if (spawn_anim) {
            go.set_scale(vmath.vector3(0.01, 0.01, 1), _go);
            go.animate(_go, 'scale', go.PLAYBACK_ONCE_FORWARD, vmath.vector3(scale_ratio, scale_ratio, 1), GAME_CONFIG.spawn_element_easing, GAME_CONFIG.spawn_element_time);
        } else go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);

        const item = { _hash: _go, is_clickable: true };
        const index = go_manager.add_game_item(item);
        if (view_state.game_id_to_view_index[element.uid] == undefined) view_state.game_id_to_view_index[element.uid] = [];
        if (element.uid != undefined) view_state.game_id_to_view_index[element.uid].push(index);
    
        return item;
    }

    function on_down(message: ItemMessage) {
        down_item = message.item;
    }

    function on_move(pos: PosXYMessage) {
        if (down_item == null) return;

        const world_pos = Camera.screen_to_world(pos.x, pos.y);
        const selected_element_world_pos = go.get_position(down_item._hash);
        const delta = (world_pos - selected_element_world_pos) as vmath.vector3;

        if (vmath.length(delta) < GAME_CONFIG.min_swipe_distance) return;

        const selected_element_pos = get_field_pos(selected_element_world_pos);
        const element_to_pos = json.decode(json.encode(selected_element_pos));

        const direction = vmath.normalize(delta);
        const move_direction = get_move_direction(direction);

        switch (move_direction) {
            case Direction.Up: element_to_pos.y -= 1; break;
            case Direction.Down: element_to_pos.y += 1; break;
            case Direction.Left: element_to_pos.x -= 1; break;
            case Direction.Right: element_to_pos.x += 1; break;
        }

        const is_valid_x = (element_to_pos.x >= 0) && (element_to_pos.x < get_field_width());
        const is_valid_y = (element_to_pos.y >= 0) && (element_to_pos.y < get_field_height());
        if (!is_valid_x || !is_valid_y) return;

        EventBus.send('REQUEST_TRY_SWAP_ELEMENTS', {
            from: selected_element_pos,
            to: element_to_pos,
        });

        down_item = null;
    }

    function on_up(message: ItemMessage) {
        if (down_item == null) return;

        const item = message.item;
        if(item == null) return;

        const item_world_pos = go.get_position(item._hash);
        const element_pos = get_field_pos(item_world_pos);

        EventBus.send('REQUEST_CLICK', {
            x: element_pos.x,
            y: element_pos.y
        });

        down_item = null;
    }

    function on_set_helper(data: HelperMessage) {
        const combined_item = get_view_item_by_uid(data.combined_element.uid);
        if (combined_item != undefined) {
            const from_pos = get_world_pos(data.step.from, GAME_CONFIG.default_element_z_index);
            const to_pos = get_world_pos(data.step.to, GAME_CONFIG.default_element_z_index);

            go.set_position(from_pos, combined_item._hash);
            go.animate(combined_item._hash, 'position.x', go.PLAYBACK_LOOP_PINGPONG, from_pos.x + (to_pos.x - from_pos.x) * 0.1, go.EASING_INCUBIC, 2.5);
            go.animate(combined_item._hash, 'position.y', go.PLAYBACK_LOOP_PINGPONG, from_pos.y + (to_pos.y - from_pos.y) * 0.1, go.EASING_INCUBIC, 2.5);
        }

        for (const element of data.elements) {
            const item = get_view_item_by_uid(element.uid);
            if (item != undefined) {
                go.animate(msg.url(undefined, item._hash, 'sprite'), 'tint', go.PLAYBACK_LOOP_PINGPONG, vmath.vector4(0.75, 0.75, 0.75, 1), go.EASING_INCUBIC, 2.5);
            }
        }
    }

    function on_reset_helper(data: HelperMessage) {
        const combined_item = get_view_item_by_uid(data.combined_element.uid);
        if (combined_item != undefined) {
            go.cancel_animations(combined_item._hash);
            
            const from_pos = get_world_pos(data.step.from, GAME_CONFIG.default_element_z_index);
            go.set(combined_item._hash, 'position', from_pos);
        }

        for (const element of data.elements) {
            const item = get_view_item_by_uid(element.uid);
            if (item != undefined) {
                go.cancel_animations(msg.url(undefined, item._hash, 'sprite'));
                go.set(msg.url(undefined, item._hash, 'sprite'), 'tint', vmath.vector4(1, 1, 1, 1));
            }
        }
    }

    function on_stop_helper(data: HelperMessage) {
        const combined_item = get_view_item_by_uid(data.combined_element.uid);
        if (combined_item != undefined) {
            go.cancel_animations(combined_item._hash);
            
            const from_pos = get_world_pos(data.step.from, GAME_CONFIG.default_element_z_index);
            go.animate(combined_item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_pos, go.EASING_INCUBIC, 0.15);
        }

        for (const element of data.elements) {
            const item = get_view_item_by_uid(element.uid);
            if (item != undefined) {
                go.cancel_animations(msg.url(undefined, item._hash, 'sprite'));
                go.set(msg.url(undefined, item._hash, 'sprite'), 'tint', vmath.vector4(1, 1, 1, 1));
            }
        }
    }

    function swap_elements_animation(message: SwapElementsMessage) {
        const from_world_pos = get_world_pos(message.from);
        const to_world_pos = get_world_pos(message.to);
    
        const element_from = message.element_from;
        const element_to = message.element_to;
    
        const item_from = get_view_item_by_uid(element_from.uid);
        if (item_from != undefined) { 
            go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, GAME_CONFIG.spawn_element_easing, GAME_CONFIG.swap_element_time);
        }
    
        if (element_to != NullElement) {
            const item_to = get_view_item_by_uid(element_to.uid);
            if (item_to != undefined) {
                go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, GAME_CONFIG.spawn_element_easing, GAME_CONFIG.swap_element_time);
            }
        }

        Sound.play('swap');

        record_action(Action.Swap);
        timer.delay(GAME_CONFIG.swap_element_time, false, () => {
            remove_action(Action.Swap);
            EventBus.send('REQUEST_SWAP_ELEMENTS_END', message);

            if(element_to == NullElement) {
                print("REQUEST FALLING SWAP: ", message.from.x, message.from.y);
                request_falling(message.from);
            }

            EventBus.send('REQUEST_TRY_ACTIVATE_BUSTER_AFTER_SWAP', message);

            // maybe request separetly ?
            record_action(Action.Combination);
            record_action(Action.Combination);
            EventBus.send('REQUEST_COMBINATE', {
                combined_positions: [message.from, message.to]
            });
        });
    }

    function wrong_swap_elements_animation(message: SwapElementsMessage) {
        const from_world_pos = get_world_pos(message.from);
        const to_world_pos = get_world_pos(message.to);

        const element_from = message.element_from;
        const element_to = message.element_to;

        const item_from = get_view_item_by_uid(element_from.uid);
        if (item_from != undefined) {
            go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, GAME_CONFIG.swap_element_easing, GAME_CONFIG.swap_element_time, 0, () => {
                go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, GAME_CONFIG.swap_element_easing, GAME_CONFIG.swap_element_time);
            });
        }

        if (element_to != NullElement) {
            const item_to = get_view_item_by_uid(element_to.uid);
            if (item_to != undefined) {
                go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, GAME_CONFIG.swap_element_easing, GAME_CONFIG.swap_element_time, 0, () => {
                    go.animate(item_to._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, GAME_CONFIG.swap_element_easing, GAME_CONFIG.swap_element_time);
                });
            }
        }

        Sound.play('swap');
    }

    function record_action(action: Action) {
        actions.push(action);
    }

    function remove_action(action: Action) {
        actions.splice(actions.findIndex((a) => a == action), 1);
    }

    function has_actions() {
        return actions.length > 0;
    }

    function damage_element_animation(element: Element) {
        const element_view = get_view_item_by_uid(element.uid);
        if (element_view == undefined) return;

        delete_all_view_items_by_uid(element.uid);
    
        if(GAME_CONFIG.buster_elements.includes(element.id))
            return;
    
        const world_pos = go.get_position(element_view._hash);
        const effect = go_manager.make_go('effect_view', world_pos);
        const effect_name = 'explode';
        
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), effect);
        
        msg.post(msg.url(undefined, effect, undefined), 'disable');
        msg.post(msg.url(undefined, effect, effect_name), 'enable');
        
        const color = GAME_CONFIG.element_colors[element.id];
    
        const anim_props = { blend_duration: 0, playback_rate: 1 };
        spine.play_anim(msg.url(undefined, effect, effect_name), color, go.PLAYBACK_ONCE_FORWARD, anim_props, () => {
            go.delete(effect);
        });
    }

    function damage_cell_animation(cell: Cell) {
        const cell_view = get_view_item_by_uid(cell.uid);
        if(cell_view == undefined) return;

        delete_all_view_items_by_uid(cell.uid);

        const world_pos = go.get_position(cell_view._hash);
        const pos = get_field_pos(world_pos);

        make_cell_view(pos, base_cell(cell.uid));

        if(cell.strength != undefined && cell.strength > 0) make_cell_view(pos, cell);
        else if(GAME_CONFIG.not_moved_cells.includes(cell.id)) {
            print("REQUEST FALLING DAMAGE CELL: ", pos.x, pos.y);
            request_falling(pos);
        }
    
        const type = cell.id as CellId;
        if(!GAME_CONFIG.explodable_cells.includes(type))
            return;
        
        const effect_pos = get_world_pos(pos, (GAME_CONFIG.top_layer_cells.includes(type) ? GAME_CONFIG.default_top_layer_cell_z_index : GAME_CONFIG.default_cell_z_index) + 0.1);
        const effect = go_manager.make_go('effect_view', effect_pos);
               
        let view = '';
        if(Array.isArray(GAME_CONFIG.cell_view[type])) view = GAME_CONFIG.cell_view[type][GAME_CONFIG.cell_view[type].length - 1];
        else view = GAME_CONFIG.cell_view[type] as string;

        const effect_name = view + '_explode';
    
        msg.post(msg.url(undefined, effect, undefined), 'disable');
        msg.post(msg.url(undefined, effect, effect_name), 'enable');
    
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), effect);
    
        const anim_props = { blend_duration: 0, playback_rate: 1 };
    
        let anim_name = '';
        if(type == CellId.Grass) anim_name = '1'; // FIXME: remove after added second grass activation effect
        else anim_name = cell.strength != undefined ? tostring(cell.strength + 1) : '1';
        spine.play_anim(msg.url(undefined, effect, effect_name), anim_name, go.PLAYBACK_ONCE_FORWARD, anim_props, () => {
            go.delete(effect);
        });
    }

    function on_combinate_busters(message: CombinateBustersMessage) {
        const view_from_buster = get_view_item_by_uid(message.buster_from.element.uid);
        if(view_from_buster == undefined) return;

        const to_world_pos = get_world_pos(message.buster_to.pos);
        go.animate(view_from_buster._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, GAME_CONFIG.squash_easing, GAME_CONFIG.squash_time, 0, () => {
            delete_view_item_by_uid(message.buster_from.element.uid);
            print("REQUEST FALLING COMBINATE: ", message.buster_from.pos.x, message.buster_from.pos.y);
            request_falling(message.buster_from.pos);

            EventBus.send('REQUEST_COMBINED_BUSTERS', message);
        });
    }

    function on_combinate_animation(combination: CombinationInfo) {
        timer.delay(GAME_CONFIG.combination_delay, false, () => {
            EventBus.send('REQUEST_COMBINATION', combination);
        });
    }

    function on_combined_animation(message: CombinedMessage) {
        remove_action(Action.Combination);

        if(message.maked_element != undefined) return on_combo_animation(message);
        for (const damage_info of message.damages) {
            on_damage(damage_info);
            print("REQUEST FALLING COMBINED: ", damage_info.pos.x, damage_info.pos.y);
            request_falling(damage_info.pos);
        }

        EventBus.send('REQUEST_COMBINATION_END', message.damages);
    }

    function on_combo_animation(message: CombinedMessage) {
        const world_pos = get_world_pos(message.pos);
        for(const damage_info of message.damages) {
            if(damage_info.element != undefined) {
                const element = damage_info.element;
                const element_view = get_view_item_by_uid(element.uid);
                if(element_view != undefined) {
                    go.animate(element_view._hash, 'position', go.PLAYBACK_ONCE_FORWARD, world_pos, GAME_CONFIG.squash_easing, GAME_CONFIG.squash_time, 0, () => {
                        delete_view_item_by_uid(element.uid);
                        if(damage_info.damaged_cells != undefined) {
                            for(const damaged_cell_info of damage_info.damaged_cells) {
                                if(GAME_CONFIG.sounded_cells.includes(damaged_cell_info.cell.id))
                                    Sound.play(GAME_CONFIG.cell_sound[damaged_cell_info.cell.id]);
                                damage_cell_animation(damaged_cell_info.cell);
                            }
                        }
                    });

                    print("REQUEST FALLING COMBO: ", damage_info.pos.x, damage_info.pos.y);
                    request_falling(damage_info.pos, GAME_CONFIG.squash_time + 0.1);
                }
            }
        }

        Sound.play('combo');

        record_action(Action.Combo);
        timer.delay(GAME_CONFIG.squash_time, false, () => {
            remove_action(Action.Combo);
            if(message.maked_element != undefined) {
                print("MAKE ELEMENT: ", message.pos.x, message.pos.y);
                make_element_view(message.pos.x, message.pos.y, message.maked_element);
                EventBus.send("MAKED_ELEMENT", message.pos);
            }

            EventBus.send('REQUEST_COMBINATION_END', message.damages);
        });
    }

    function on_combinate_not_found(pos: Position) {
        remove_action(Action.Combination);
        print("REQUEST FALLING COMBINATE NOT FOUND: ", pos.x, pos.y);
        request_falling(pos);
    }

    function on_requested_element_animation(message: RequestElementMessage) {
        make_element_view(message.pos.x, message.pos.y, message.element);
    }

    function on_falling_animation(message: MoveInfo) {
        const element_view = get_view_item_by_uid(message.element.uid);
        if(element_view != undefined) {
            print("REQUEST FALLING ANIMATION: ", message.start_pos.x, message.start_pos.y);
            request_falling(message.start_pos);

            const to_world_pos = get_world_pos(message.next_pos);
            go.animate(element_view._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, go.EASING_LINEAR, GAME_CONFIG.falling_time, 0, () => {
                EventBus.send('REQUEST_FALL_END', message.next_pos);
            });
        } else print("FAIL FALL ANIMATION: ", message.start_pos.x, message.start_pos.y);
    }

    function on_falling_not_found(pos: Position) {
        remove_action(Action.Falling);

        if(!has_actions())
            EventBus.send('REQUEST_IDLE');
    }

    function on_fall_end_animation(info: ElementInfo) {
        const element_view = get_view_item_by_uid(info.element.uid);
        if(element_view == undefined) return;

        remove_action(Action.Falling);
        record_action(Action.Combination);
        
        const world_pos = go.get_position(element_view._hash);
        world_pos.y += 5;
        go.animate(element_view._hash, "position", go.PLAYBACK_ONCE_FORWARD, world_pos, go.EASING_OUTQUAD, 0.25, 0, () => {
            world_pos.y -= 5;
            go.animate(element_view._hash, "position", go.PLAYBACK_ONCE_FORWARD, world_pos, go.EASING_OUTBOUNCE, 0.25);
        });

        timer.delay(0.25, false, () => {
            EventBus.send('REQUEST_COMBINATE', {
                combined_positions: [info.pos]
            });
        });
    }

    function request_falling(pos: Position, delay = GAME_CONFIG.falling_dalay) {
        record_action(Action.Falling);
        timer.delay(delay, false, () => {
            Log.log("REQUEST FALLING: ", pos.x, pos.y);
            EventBus.send('REQUEST_FALLING', pos);
        });
    }

    function on_damage(damage_info: DamageInfo) {
        if(damage_info.element != undefined) {
            Sound.play('broke_element');

            if(damage_info.element.state == ElementState.Fall) {
                remove_action(Action.Falling);
            }

            damage_element_animation(damage_info.element);
        }

        if(damage_info.damaged_cells != undefined) {
            for(const damaged_cell_info of damage_info.damaged_cells) {
                if(GAME_CONFIG.sounded_cells.includes(damaged_cell_info.cell.id))
                    Sound.play(GAME_CONFIG.cell_sound[damaged_cell_info.cell.id]);
                damage_cell_animation(damaged_cell_info.cell);
            }
        }
    }

    function on_hammer_damage_animation(damage_info: DamageInfo) {
        on_damage(damage_info);
        request_falling(damage_info.pos);
    }

    function on_horizontal_damage_animation(damages: DamageInfo[]) {
        for(const damage_info of damages) {
            on_damage(damage_info);
            request_falling(damage_info.pos);
        }
    }

    function on_vertical_damage_animation(damages: DamageInfo[]) {
        for(const damage_info of damages) {
            on_damage(damage_info);
            request_falling(damage_info.pos);
        }
    }

    function on_dynamite_activated_animation(messages: DynamiteActivatedMessage) {
        Sound.play('dynamite');
        record_action(Action.DynamiteActivation);
        activate_dynamite_animation(messages.pos, messages.big_range ? 1.5 : 1, () => {
            remove_action(Action.DynamiteActivation);
            EventBus.send("REQUEST_DYNAMITE_ACTION", messages);
        });
    }

    function on_dynamite_action_animation(message: BusterActivatedMessage) {
        for(const damage_info of message.damages) {
            on_damage(damage_info);
            request_falling(damage_info.pos);
        }
    }

    function activate_dynamite_animation(pos: Position, range: number, on_explode: () => void) {
        const world_pos = get_world_pos(pos, GAME_CONFIG.default_vfx_z_index + 0.1);
        const _go = go_manager.make_go('effect_view', world_pos);
    
        go.set_scale(vmath.vector3(scale_ratio * range, scale_ratio * range, 1), _go);
    
        msg.post(msg.url(undefined, _go, undefined), 'disable');
        msg.post(msg.url(undefined, _go, 'dynamite'), 'enable');
    
        const anim_props = { blend_duration: 0, playback_rate: 1.25 };
        spine.play_anim(msg.url(undefined, _go, 'dynamite'), 'action', go.PLAYBACK_ONCE_FORWARD, anim_props, () => {
            go_manager.delete_go(_go);
        });
    
        timer.delay(0.5, false, on_explode);
    }

    function on_rocket_activated_animation(message: RocketActivatedMessage) {
        const world_pos = get_world_pos(message.pos, GAME_CONFIG.default_element_z_index + 2.1);
        record_action(Action.RocketActivation);
        rocket_effect(message, world_pos, message.axis, () => {
            remove_action(Action.RocketActivation);
            switch(message.axis) {
                case Axis.Horizontal: on_horizontal_damage_animation(message.damages); break;
                case Axis.Vertical: on_vertical_damage_animation(message.damages); break;
                case Axis.All:
                    on_horizontal_damage_animation(message.damages);
                    on_vertical_damage_animation(message.damages);
                break;
            }
            EventBus.send('REQUEST_ROCKET_END', message.damages);
        });

        delete_view_item_by_uid(message.uid);
    }

    function rocket_effect(message: RocketActivatedMessage, pos: vmath.vector3, axis: Axis, on_end: () => void) {
        Sound.play('rocket');
        if(axis == Axis.All) {
            rocket_effect(message, pos, Axis.Vertical, on_end);
            rocket_effect(message, pos, Axis.Horizontal, on_end);
            return;
        }
    
        const part0 = go_manager.make_go('effect_view', pos);
        const part1 = go_manager.make_go('effect_view', pos);
    
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), part0);
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), part1);
    
        switch (axis) {
            case Axis.Vertical:
                go_manager.set_rotation_hash(part1, 180);
            break;
            case Axis.Horizontal:
                go_manager.set_rotation_hash(part0, 90);
                go_manager.set_rotation_hash(part1, -90);
            break;
        }
    
        msg.post(msg.url(undefined, part0, undefined), 'disable');
        msg.post(msg.url(undefined, part1, undefined), 'disable');
    
        msg.post(msg.url(undefined, part0, 'rocket'), 'enable');
        msg.post(msg.url(undefined, part1, 'rocket'), 'enable');
    
        const anim_props = { blend_duration: 0, playback_rate: 1 };
        spine.play_anim(msg.url(undefined, part0, 'rocket'), 'action', go.PLAYBACK_ONCE_FORWARD, anim_props);
        spine.play_anim(msg.url(undefined, part1, 'rocket'), 'action', go.PLAYBACK_ONCE_FORWARD, anim_props);
    
        const part0_to_world_pos = vmath.vector3(pos);
        const part1_to_world_pos = vmath.vector3(pos);
    
        if(axis == Axis.Vertical) {
            const distance = get_field_height() * cell_size;
            part0_to_world_pos.y += distance;
            part1_to_world_pos.y += -distance;
        }
    
        if(axis == Axis.Horizontal) {
            const distance = get_field_width() * cell_size;
            part0_to_world_pos.x += -distance;
            part1_to_world_pos.x += distance;
        }
    
        go.animate(part0, 'position', go.PLAYBACK_ONCE_FORWARD, part0_to_world_pos, go.EASING_INCUBIC, 0.3, 0, () => {
            go.delete(part0);
        });
        
        go.animate(part1, 'position', go.PLAYBACK_ONCE_FORWARD, part1_to_world_pos, go.EASING_INCUBIC, 0.3, 0, () => {
            go.delete(part1);
        });

        timer.delay(0.3, false, on_end);
    }

    function on_diskosphere_activated_animation(message: DiskosphereActivatedMessage) {
        diskosphere_effect(message.pos, message.uid, message.damages, message.buster);
    }

    function diskosphere_effect(pos: Position, uid: number, damages: DamageInfo[], buster?: ElementId, on_complete?: () => void) {
        // находим дискошар в массиве урона
        const damage_info = damages.find((damage_info) => {
            if(damage_info.element == undefined)
                return false;

            return (damage_info.element.id == ElementId.Diskosphere);
        });
        
        // если нашли то удаляем визуал
        if(damage_info != undefined && damage_info.element) {
            delete_view_item_by_uid(damage_info.element.uid);
            damage_info.element = undefined;
            on_damage(damage_info);
        }
        
        const worldPos = get_world_pos(pos, GAME_CONFIG.default_element_z_index + 2.1);
        const _go = go_manager.make_go('effect_view', worldPos);
    
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
    
        msg.post(msg.url(undefined, _go, undefined), 'disable');
        msg.post(msg.url(undefined, _go, 'diskosphere'), 'enable');
        msg.post(msg.url(undefined, _go, 'diskosphere_light'), 'enable');
    
        record_action(Action.DiskosphereActivation);
        const anim_props = { blend_duration: 0, playback_rate: 1.25 };
        spine.play_anim(msg.url(undefined, _go, 'diskosphere'), 'light_ball_intro', go.PLAYBACK_ONCE_FORWARD, anim_props, (self: object, message_id: hash, message: {animation_id: hash}, sender: hash) => {
            if (message_id == hash("spine_animation_done")) {
                remove_action(Action.DiskosphereActivation);
                EventBus.send("DISKOSPHERE_ACTIVATED_END", pos);
                const anim_props = { blend_duration: 0, playback_rate: 1.25 };
                if (message.animation_id == hash('light_ball_intro')) {
                    record_action(Action.DiskosphereTrace);
                    trace_animation(worldPos, _go, damages, damages.length, (damage_info: DamageInfo) => {
                        remove_action(Action.DiskosphereTrace);
                        if(damage_info.element?.uid == uid) return request_falling(damage_info.pos);
                        on_damage(damage_info);
                        request_falling(damage_info.pos);
                        EventBus.send('REQUEST_DISKOSPHERE_DAMAGE_ELEMENT_END', { damage_info, buster});
                    }, () => {
                        spine.play_anim(msg.url(undefined, _go, 'diskosphere_light'), 'light_ball_explosion', go.PLAYBACK_ONCE_FORWARD, anim_props);
                        msg.post(msg.url(undefined, _go, 'diskosphere'), 'disable');
                        if(on_complete != undefined) on_complete();
                    });
                }
            }
        });
    }
    
    function trace_animation(world_pos: vmath.vector3, diskosphere: hash, damages: DamageInfo[], counter: number, on_trace_end: (damage_info: DamageInfo) => void, on_complete: () => void) {
        const anim_props = { blend_duration: 0, playback_rate: 1 };
        spine.play_anim(msg.url(undefined, diskosphere, 'diskosphere'), 'light_ball_action', go.PLAYBACK_ONCE_FORWARD, anim_props);
        spine.play_anim(msg.url(undefined, diskosphere, 'diskosphere_light'), 'light_ball_action_light', go.PLAYBACK_ONCE_FORWARD, anim_props);
    
        if(damages.length == 0) return on_complete();
    
        const projectile = go_manager.make_go('effect_view', world_pos);
    
        go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), projectile);
        
        msg.post(msg.url(undefined, projectile, undefined), 'disable');
        msg.post(msg.url(undefined, projectile, 'diskosphere_projectile'), 'enable');
    
        // исключаем из целей сам дискошар
        let damage_info = damages[counter];
        while(damage_info == undefined || damage_info.element != undefined && get_view_item_by_uid(damage_info.element.uid)?._hash == diskosphere)
            damage_info = damages[--counter];
    
        const target_pos = get_world_pos(damage_info.pos, GAME_CONFIG.default_element_z_index + 0.1);
        spine.set_ik_target_position(msg.url(undefined, projectile, 'diskosphere_projectile'), 'ik_projectile_target', target_pos);
        spine.play_anim(msg.url(undefined, projectile, 'diskosphere_projectile'), "light_ball_projectile", go.PLAYBACK_ONCE_FORWARD, anim_props, (self: object, message_id: hash, message: {animation_id: hash}, sender: hash) => {
            if (message_id == hash("spine_animation_done")) {
                go.delete(projectile);
                on_trace_end(damage_info);
            }
        });
    
        if(counter == 0) return on_complete();
        trace_animation(world_pos, diskosphere, damages, counter - 1, on_trace_end, on_complete);
    }

    function on_helicopter_activated_animation(message: HelicopterActivatedMessage) {
        for(const damage_info of message.damages) {
            on_damage(damage_info);
            request_falling(damage_info.pos);
        }

        EventBus.send('REQUEST_HELICOPTER_ACTION', message);
    }

    function on_helicopter_action_animation(message: HelicopterActionMessage) {
        Sound.play('helicopter');

        const helicopter_world_pos = get_world_pos(message.pos);
        helicopter_world_pos.z = 3;

        
        const helicopters: hash[] = [];
        for(let i = 0; i < message.damages.length; i++) {
            const _go = go_manager.make_go("element_view", helicopter_world_pos);
            sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.element_view[ElementId.Helicopter]);
            go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);
            helicopters.push(_go);
        }

        for(let i = 0; i < message.damages.length; i++) {
            const helicopter = helicopters[i];
            go.animate(helicopter, 'euler.z', go.PLAYBACK_LOOP_FORWARD, 360, go.EASING_LINEAR, 0.25);

            const damage_info = message.damages[i];
            const target_world_pos = get_world_pos(damage_info.pos, 3);

            record_action(Action.HelicopterFly);

            if(message.buster != undefined) {
                const pos = vmath.vector3(helicopter_world_pos.x, helicopter_world_pos.y, helicopter_world_pos.z - 0.1);
                const icon = go_manager.make_go("element_view", pos);
                sprite.play_flipbook(msg.url(undefined, icon, 'sprite'), GAME_CONFIG.element_view[message.buster]);
                go.set_scale(go.get_scale(helicopter), icon);
                go.animate(icon, 'position', go.PLAYBACK_ONCE_FORWARD, target_world_pos, go.EASING_INCUBIC, GAME_CONFIG.helicopter_fly_duration, 0.1, () => {
                    go.delete(icon, true);
                });

                go.animate(helicopter, 'position', go.PLAYBACK_ONCE_FORWARD, target_world_pos, go.EASING_INCUBIC, GAME_CONFIG.helicopter_fly_duration, 0, () => {
                    remove_action(Action.HelicopterFly);
                    go.delete(helicopter, true);
                    on_damage(damage_info);
                    
                    timer.delay(0.1, false, () => EventBus.send('REQUEST_HELICOPTER_END', message));
                });

                return;
            }

            go.animate(helicopter, 'position', go.PLAYBACK_ONCE_FORWARD, target_world_pos, go.EASING_INCUBIC, GAME_CONFIG.helicopter_fly_duration, 0, () => {
                remove_action(Action.HelicopterFly);
                go.delete(helicopter, true);
                on_damage(damage_info);
                request_falling(damage_info.pos);
                
                EventBus.send('REQUEST_HELICOPTER_END', message);
            });
        }

        request_falling(message.pos);
    }

    function on_shuffle_animation(game_state: GameState) {
        timer.delay(1, false, () => {
            Sound.play('shuffle');

            for(let y = 0; y < get_field_height(); y++) {
                for(let x = 0; x < get_field_width(); x++) {
                    const element = game_state.elements[y][x];
                    if(element != NullElement) {
                        const element_view = get_view_item_by_uid(element.uid);
                        if (element_view != undefined) {
                            const to_world_pos = get_world_pos({x, y}, GAME_CONFIG.default_element_z_index);
                            go.animate(element_view._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, GAME_CONFIG.swap_element_easing, 0.5);
                        } else make_element_view(x, y, element, true);
                    }
                }
            }
    
            timer.delay(0.5, false, () => {
                EventBus.send('SHUFFLE_END');
            });
        });
    }

    function on_win_end(state: GameState) {
        is_block_input = true;

        // let counts = 0;
        // for(let y = 0; y < get_field_height(); y++) {
        //     for(let x = 0; x < get_field_width(); x++) {
        //         const cell = state.cells[y][x];
        //         const element = state.elements[y][x];
                
        //         if(cell != NotActiveCell && is_available_cell_type_for_move(cell) && element != NullElement) {
        //             timer.delay(0.05 * counts++, false, () => {
        //                 Sound.play('broke_element');
        //                 damage_element_animation(element);
        //             });
        //         }
        //     }
        // }

        // timer.delay(0.05 * counts, false, reset_field);
        reset_field();
        timer.delay(is_animal_level() ? GAME_CONFIG.animal_level_delay_before_win : GAME_CONFIG.delay_before_win, false, () => {
            if(GAME_CONFIG.animal_levels.includes(get_current_level() + 1))
                remove_animals();
        });
    }

    function on_gameover() {
        is_block_input = true;
        timer.delay(GAME_CONFIG.delay_before_gameover, false, clear_field);
    }

    function clear_field() {
        reset_field();
        if(GAME_CONFIG.animal_levels.includes(get_current_level() + 1))
            remove_animals();
    }

    function remove_animals() {
        const scene_name = Scene.get_current_name();
        Scene.unload_resource(scene_name, 'cat');
        Scene.unload_resource(scene_name, GAME_CONFIG.level_to_animal[get_current_level() + 1]);
    }

    function on_set_tutorial(lock_info: LockInfo) {
        for(const info of lock_info) {
            const substrate_view = view_state.substrates[info.pos.y][info.pos.x];
            const substrate_view_url = msg.url(undefined, substrate_view, "sprite");
            go.set(substrate_view_url, "material", resources.tutorial_sprite_material);

            const cell_views = get_all_view_items_by_uid(info.cell.uid);
            if(cell_views != undefined) {
                for(const cell_view of cell_views) {
                    const cell_view_url = msg.url(undefined, cell_view._hash, "sprite");
                    go.set(cell_view_url, "material", resources.tutorial_sprite_material);
                }
            }

            if(info.element != NullElement) {
                const element_view = get_view_item_by_uid(info.element.uid);
                if(element_view != undefined) {
                    const element_view_url = msg.url(undefined, element_view._hash, "sprite");
                    go.set(element_view_url, "material", resources.tutorial_sprite_material);
                }
            }

            if(info.is_locked) {
                const world_pos = get_world_pos(info.pos, GAME_CONFIG.default_top_layer_cell_z_index);
                const _go = go_manager.make_go('cell_view', world_pos);

                sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), 'cell_lock');
                go.set_scale(vmath.vector3(scale_ratio, scale_ratio, 1), _go);

                const url = msg.url(undefined, _go, "sprite");
                go.set(url, "material", resources.tutorial_sprite_material);

                locks.push(_go);
            }
        }
    }

    function on_remove_tutorial(unlock_info: UnlockInfo) {
        for(const info of unlock_info) {
            const substrate_view = view_state.substrates[info.pos.y][info.pos.x];
            const substrate_view_url = msg.url(undefined, substrate_view, "sprite");
            go.set(substrate_view_url, "material", resources.default_sprite_material);

            const cell_views = get_all_view_items_by_uid(info.cell.uid);
            if(cell_views != undefined) {
                for(const cell_view of cell_views) {
                    const cell_view_url = msg.url(undefined, cell_view._hash, "sprite");
                    go.set(cell_view_url, "material", resources.default_sprite_material);
                }
            }

            if(info.element != NullElement) {
                const element_view = get_view_item_by_uid(info.element.uid);
                if(element_view != undefined) {
                    const element_view_url = msg.url(undefined, element_view._hash, "sprite");
                    go.set(element_view_url, "material", resources.default_sprite_material);
                }
            }
        }

        for(const lock of locks) {
            go.delete(lock);
        }
    }

    init();

    return { on_message };
}