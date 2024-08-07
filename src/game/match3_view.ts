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
/* eslint-disable @typescript-eslint/no-unsafe-return */


import * as flow from 'ludobits.m.flow';
import { Axis, Direction, get_neighbors, is_neighbor, is_valid_pos, rotateMatrix } from '../utils/math_utils';
import { GoManager } from '../modules/GoManager';
import { IGameItem, MessageId, Messages, NameMessage, PosXYMessage } from '../modules/modules_const';
import { MovedElementsMessage, GameStepMessage, StepHelperMessage, ActivatedCellMessage, ActivationMessage, CombinedMessage, ElementActivationMessage, HelicopterActivationMessage, RocketActivationMessage, SwapedActivationMessage, SwapedDiskosphereActivationMessage, SwapedHelicoptersActivationMessage, SwapedHelicopterWithElementMessage, SwapElementsMessage } from "../main/game_config";

import {
    ItemInfo,
    NullElement,
    NotActiveCell,
    Cell,
    CellState,
    MoveType,
} from "./match3_core";

import { SubstrateId, GameState, CellId, ElementId, TargetType } from './match3_game';

import { 
    get_current_level,
    get_field_cell_size,
    get_field_height,
    get_field_max_height,
    get_field_max_width,
    get_field_offset_border,
    get_field_width,
    get_level_targets,
    get_move_direction,
    is_animal_level,
    is_element,
    is_tutorial_level
} from './match3_utils';

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

interface ViewState {
    is_processing: boolean,
    go_manager: GoManager,
    cell_size: number,
    scale_ratio: number,
    cells_offset: vmath.vector3,
    game_state: GameState,
    game_id_to_view_index: { [key in string]: number[] },
    substrates: hash[][],
    targets: { [key in number]: number }
}

interface ViewResources {
    default_sprite_material: hash,
    tutorial_sprite_material: hash
}

export function View(animator: FluxGroup, resources: ViewResources) {
    const event_to_animation: { [key in string]: (data: Messages[MessageId]) => number } = {
        'ON_SWAP_ELEMENTS': on_swap_element_animation,
        'ON_WRONG_SWAP_ELEMENTS': on_wrong_swap_element_animation,
        'ON_COMBINED': on_combined_animation,

        'ON_ELEMENT_ACTIVATED': on_element_activated_animation,
        'ON_ROCKET_ACTIVATED': on_rocket_activated_animation,

        'ON_BUSTER_ACTIVATION': on_buster_activation_begin,

        // DISKOSPHERE
        'DISKOSPHERE_ACTIVATED': on_diskisphere_activated_animation,
        'SWAPED_DISKOSPHERES_ACTIVATED': on_swaped_diskospheres_animation,
        'SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED': on_swaped_diskosphere_with_buster_animation,
        'SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED': on_swaped_diskosphere_with_buster_animation,
        'SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED': on_swaped_diskosphere_with_element_animation,

        // ROCKET
        'ROCKET_ACTIVATED': on_rocket_activated_animation,
        'SWAPED_ROCKETS_ACTIVATED': on_swaped_rockets_animation,

        // HELICOPTER
        'HELICOPTER_ACTIVATED': on_helicopter_activated_animation,
        'SWAPED_HELICOPTERS_ACTIVATED': on_swaped_helicopters_animation,
        'SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED': on_swaped_helicopter_with_element_animation,

        // DYNAMITE
        'DYNAMITE_ACTIVATED': on_dynamite_activated_animation,
        'SWAPED_DYNAMITES_ACTIVATED': on_swaped_dynamites_animation,

        // MOVE
        'ON_MOVED_ELEMENTS': on_moved_elements_animation,

        'UPDATED_CELLS_STATE': update_cells_state,
        'REMOVE_TUTORIAL': remove_tutorial,

        'SHUFFLE': shuffle_animation
    };

    const original_game_width = 540;
    const original_game_height = 960;
    
    let prev_game_width = original_game_width;
    let prev_game_height = original_game_height;
    
    let view_state = {} as ViewState;

    view_state.is_processing = false;
    view_state.go_manager = GoManager();
    view_state.cell_size = calculate_cell_size();
    view_state.scale_ratio = calculate_scale_ratio();
    view_state.cells_offset = calculate_cell_offset();
    view_state.game_state = {} as GameState;
    view_state.game_id_to_view_index = {};
    view_state.substrates = [];
    view_state.targets = {};

    let down_item: IGameItem | null = null;
    let selected_element_position: vmath.vector3;
    let combinate_phase_duration = 0;
    let move_phase_duration = 0;

    function init() {
        Log.log("Init view");

        const scene_name = Scene.get_current_name();
        Scene.load_resource(scene_name, 'background');
        
        if(GAME_CONFIG.animal_levels.includes(get_current_level() + 1)) {
            Scene.load_resource(scene_name, 'cat');
            Scene.load_resource(scene_name, GAME_CONFIG.level_to_animal[get_current_level() + 1]);
        }

        for(let y = 0; y < get_field_height(); y++) {
            view_state.substrates[y] = [];
            for(let x = 0; x < get_field_width(); x++) {
                view_state.substrates[y][x] = 0;
            }
        }

        set_events();
        dispatch_messages();
    }

    function recalculate_sizes() {
        const ltrb = Camera.get_ltrb();
        if(ltrb.z == prev_game_width && ltrb.w == prev_game_height) return;

        Log.log("RESIZE VIEW");

        prev_game_width = ltrb.z;
        prev_game_height = ltrb.w;

        const width_ratio = math.abs(ltrb.z) / original_game_width;
        const height_ratio = math.abs(ltrb.w) / original_game_height;

        const changes_coff = math.min(width_ratio, height_ratio);
        const height_delta = math.abs(ltrb.w) - original_game_height;

        view_state.cell_size = calculate_cell_size() * changes_coff;
        view_state.scale_ratio = calculate_scale_ratio();
        view_state.cells_offset = calculate_cell_offset(height_delta, height_ratio);

        reload_field();
    }

    function copy_game_state() {
        const copy_state = Object.assign({}, view_state.game_state);

        copy_state.cells = [];
        copy_state.elements = [];

        for(let y = 0; y < get_field_height(); y++) {
            copy_state.cells[y] = [];
            copy_state.elements[y] = [];
            
            for(let x = 0; x < get_field_width(); x++) {
                copy_state.cells[y][x] = view_state.game_state.cells[y][x];
                copy_state.elements[y][x] = view_state.game_state.elements[y][x];
            }
        }
        
        copy_state.targets = Object.assign([], view_state.game_state.targets);
        return copy_state;
    }

    function calculate_cell_size() {
        return math.floor(math.min((original_game_width - get_field_offset_border() * 2) / get_field_max_width(), 100));
    }

    function calculate_scale_ratio() {
        return view_state.cell_size / get_field_cell_size();
    }

    function calculate_cell_offset(height_delta = 0, changes_coff = 1) {
        const offset_y = height_delta > 0 ? (-(original_game_height / 2 - (get_field_max_height() / 2 * calculate_cell_size())) - (height_delta / 2)) + 100 : (-(original_game_height / 2 - (get_field_max_height() / 2 * calculate_cell_size())) + 100) * changes_coff;
        return vmath.vector3(
            original_game_width / 2 - (get_field_width() / 2 * view_state.cell_size),
            offset_y,
            0
        );
    }

    function set_events() {
        EventBus.on('ON_LOAD_FIELD',  on_load_field, true);

        EventBus.on("SET_TUTORIAL", () => {
            if(is_animal_level() && is_tutorial_level()) {
                EventBus.send('SET_ANIMAL_TUTORIAL_TIP'); 
            } else set_tutorial();
        }, true);

        EventBus.on('HIDED_ANIMAL_TUTORIAL_TIP', set_tutorial, true);
        
        EventBus.on('ON_WRONG_SWAP_ELEMENTS', on_wrong_swap_element_animation, true);
        
        EventBus.on('ON_GAME_STEP', on_game_step, true);
        
        EventBus.on('ON_ELEMENT_SELECTED', on_element_selected, true);
        EventBus.on('ON_ELEMENT_UNSELECTED', on_element_unselected, true);

        EventBus.on('ON_SET_STEP_HELPER', on_set_step_helper, true);
        EventBus.on('ON_RESET_STEP_HELPER', on_reset_step_helper, true);
        
        EventBus.on('SHUFFLE', shuffle_animation, true);

        EventBus.on('UPDATED_STATE', update_state);

        EventBus.on('ON_WIN', set_win, true);
        EventBus.on('ON_GAME_OVER', set_gameover, true);
        
        EventBus.on('MSG_ON_DOWN_ITEM', (data) => on_down(data.item), true);
        EventBus.on('MSG_ON_UP_ITEM', (data) => on_up(data.item), true);
        EventBus.on('MSG_ON_MOVE', (data) => on_move(data), true);        
    }

    function on_load_field(game_state: GameState) {
        recalculate_cell_offset(game_state);

        load_field(game_state);

        EventBus.send('INIT_UI');

        EventBus.send('UPDATED_STEP_COUNTER', game_state.steps);
        
        for(let i = 0; i < game_state.targets.length; i++) {
            const target = game_state.targets[i];
            const amount = target.count - target.uids.length;
            view_state.targets[i] = amount;
            EventBus.send('UPDATED_TARGET', {idx: i, amount, id: target.id, type: target.type});
        }

        recalculate_sizes();
        timer.delay(0.1, true, recalculate_sizes);

        EventBus.send('SET_HELPER');
    }

    function set_tutorial() {
        const tutorial_data = GAME_CONFIG.tutorials_data[get_current_level() + 1];
        const bounds = tutorial_data.bounds != undefined ? tutorial_data.bounds : {from_x: 0, from_y: 0, to_x: 0, to_y: 0};

        for(let y = bounds.from_y; y < bounds.to_y; y++) {
            for(let x = bounds.from_x; x < bounds.to_x; x++) {
                const substrate = view_state.substrates[y][x];
                const substrate_view = msg.url(undefined, substrate, "sprite");
                go.set(substrate_view, "material", resources.tutorial_sprite_material);

                const cell = view_state.game_state.cells[y][x];
                if(cell != NotActiveCell) {
                    const cell_views = get_all_view_items_by_uid(cell.uid);
                    if(cell_views != undefined) {
                        for(const cell_view of cell_views) {
                            const cell_view_url = msg.url(undefined, cell_view._hash, "sprite");
                            go.set(cell_view_url, "material", resources.tutorial_sprite_material);
                        }
                    }
                }

                const element = view_state.game_state.elements[y][x];
                if(element != NullElement) {
                    const element_view = msg.url(undefined, get_view_item_by_uid(element.uid)?._hash, "sprite");
                    go.set(element_view, "material", resources.tutorial_sprite_material);
                }
            }
        }
    }

    function on_element_selected(element: ItemInfo) {
        if (element == undefined) return;

        const item = get_view_item_by_uid(element.uid);
        if (item == undefined) return;

        selected_element_position = go.get_position(item._hash);
        go.animate(item._hash, 'position.y', go.PLAYBACK_LOOP_PINGPONG, selected_element_position.y + 3, go.EASING_INCUBIC, 1);

        EventBus.send('SET_HELPER');
    }

    function on_element_unselected(element: ItemInfo) {
        if (element == undefined) return;

        const item = get_view_item_by_uid(element.uid);
        if (item == undefined) return;

        go.cancel_animations(item._hash);
        go.set_position(selected_element_position, item._hash);

        EventBus.send('SET_HELPER');
    }

    function on_set_step_helper(data: StepHelperMessage) {
        const combined_item = get_view_item_by_uid(data.combined_element.uid);
        if (combined_item != undefined) {
            let from_pos = get_world_pos(data.step.from_x, data.step.from_y, GAME_CONFIG.default_element_z_index);
            let to_pos = get_world_pos(data.step.to_x, data.step.to_y, GAME_CONFIG.default_element_z_index);
            
            if(data.combined_element.x == data.step.from_x && data.combined_element.y == data.step.from_y) {
                const buffer = from_pos;
                from_pos = to_pos;
                to_pos = buffer;
            }
                
            go.set_position(from_pos, combined_item._hash);
            go.animate(combined_item._hash, 'position.x', go.PLAYBACK_LOOP_PINGPONG, from_pos.x + (to_pos.x - from_pos.x) * 0.1, go.EASING_INCUBIC, 1.5);
            go.animate(combined_item._hash, 'position.y', go.PLAYBACK_LOOP_PINGPONG, from_pos.y + (to_pos.y - from_pos.y) * 0.1, go.EASING_INCUBIC, 1.5);
        }

        for (const element of data.elements) {
            const item = get_view_item_by_uid(element.uid);
            if (item != undefined) {
                go.animate(msg.url(undefined, item._hash, 'sprite'), 'tint', go.PLAYBACK_LOOP_PINGPONG, vmath.vector4(0.75, 0.75, 0.75, 1), go.EASING_INCUBIC, 1.5);
            }
        }
    }

    function on_reset_step_helper(data: StepHelperMessage) {
        const combined_item = get_view_item_by_uid(data.combined_element.uid);
        if (combined_item != undefined) {
            go.cancel_animations(combined_item._hash);
            const to_pos = get_world_pos(data.combined_element.x, data.combined_element.y, GAME_CONFIG.default_element_z_index);
            let from_pos = get_world_pos(data.step.from_x, data.step.from_y, GAME_CONFIG.default_element_z_index);
            if (from_pos.x == to_pos.x && from_pos.y == to_pos.y)
                from_pos = get_world_pos(data.step.to_x, data.step.to_y, GAME_CONFIG.default_element_z_index);
            go.animate(combined_item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_pos, go.EASING_INCUBIC, 0.25);
        }

        for (const element of data.elements) {
            const item = get_view_item_by_uid(element.uid);
            if (item != undefined) {
                go.cancel_animations(msg.url(undefined, item._hash, 'sprite'));
                go.set(msg.url(undefined, item._hash, 'sprite'), 'tint', vmath.vector4(1, 1, 1, 1));
            }
        }
    }

    function remove_tutorial() {
        EventBus.send('REMOVE_TUTORIAL');

        const tutorial_data = GAME_CONFIG.tutorials_data[get_current_level() + 1];
        const bounds = tutorial_data.bounds != undefined ? tutorial_data.bounds : {from_x: 0, from_y: 0, to_x: 0, to_y: 0};

        for(let y = bounds.from_y; y < bounds.to_y; y++) {
            for(let x = bounds.from_x; x < bounds.to_x; x++) {
                const substrate = view_state.substrates[y][x];
                const substrate_view = msg.url(undefined, substrate, "sprite");
                go.set(substrate_view, "material", resources.default_sprite_material);

                const cell = view_state.game_state.cells[y][x];
                if(cell != NotActiveCell) {
                    const cell_views = get_all_view_items_by_uid(cell.uid);
                    if(cell_views != undefined) {
                        for(const cell_view of cell_views) {
                            const cell_view_url = msg.url(undefined, cell_view._hash, "sprite");
                            go.set(cell_view_url, "material", resources.default_sprite_material);
                        }
                    }
                }

                const element = view_state.game_state.elements[y][x];
                if(element != NullElement) {
                    const element_view = msg.url(undefined, get_view_item_by_uid(element.uid)?._hash, "sprite");
                    go.set(element_view, "material", resources.default_sprite_material);
                }
            }
        }

        return 0;
    }

    function update_state(message: Messages[MessageId]) {
        Log.log("UPDATE STATE");
        const state = message as GameState;
        reset_field();
        load_field(state, false);

        for(let i = 0; i < state.targets.length; i++) {
            const target = state.targets[i];
            const amount = target.count - target.uids.length;
            view_state.targets[i] = amount;
            EventBus.send('UPDATED_TARGET', {idx: i, amount, id: target.id, type: target.type});
        }


        EventBus.send('SET_HELPER');
        return 0;
    }

    function update_cells_state(message: Messages[MessageId]) {
        const cells = message as CellState;
        for(let y = 0; y < get_field_height(); y++) {
            for(let x = 0; x < get_field_width(); x++) {
                const current_cell = view_state.game_state.cells[y][x];
                if (current_cell != NotActiveCell) {
                    // DELETE ALL CELLS
                    const items = get_all_view_items_by_uid(current_cell.uid);
                    if(items != undefined) {
                        for(const item of items) {
                            view_state.go_manager.delete_item(item, true);
                        }
                    }
                    // CREATE NEW CELLS
                    const cell = cells[y][x];
                    view_state.game_state.cells[y][x] = cell;
                    if(cell != NotActiveCell) {
                        try_make_under_cell(x, y, cell);
                        make_cell_view(x, y, cell);
                    }
                }
            }
        }

        return 0;
    }

    function set_win() {
        let is_feeded = false;
        for(let i = 0; i < view_state.game_state.targets.length; i++) {
            const target = view_state.game_state.targets[i];
            if(target.type == TargetType.Element && GAME_CONFIG.feed_elements.includes(target.id)) {
                is_feeded = true;
                EventBus.send('FEED_ANIMAL', target.id);
            }
        }

        if(is_feeded) {
            timer.delay(7.5, false, () => {
                reset_field();
                remove_animals();
                EventBus.send('SET_WIN_UI');
            });
        } else {
            reset_field();
            remove_animals();
            EventBus.send('SET_WIN_UI');
        }
    }

    function set_gameover() {
        reset_field();
        remove_animals();
    }

    function remove_animals() {
        if(!GAME_CONFIG.animal_levels.includes(get_current_level() + 1)) return;

        const scene_name = Scene.get_current_name();
        Scene.unload_resource(scene_name, 'cat');
        Scene.unload_resource(scene_name, GAME_CONFIG.level_to_animal[get_current_level() + 1]);
    }

    function on_game_step(data: GameStepMessage) {
        if(data.events == undefined) return;

        flow.start(() => {
            view_state.is_processing = true;

            const view = {
                state: view_state,
                get_world_pos: get_world_pos,
                get_view_item_by_uid: get_view_item_by_uid
            };

            for (const event of data.events) {
                switch (event.key) {
                    case 'ON_SWAP_ELEMENTS':
                        flow.delay(event_to_animation[event.key](event.value));
                        break;
                    case 'ON_SPINNING_ACTIVATED':
                        flow.delay(event_to_animation[event.key](event.value));
                        break;
                    case 'ON_MOVED_ELEMENTS':
                        on_move_phase_begin();
                        move_phase_duration = event_to_animation[event.key](event.value);
                        on_move_phase_end(event.value);
                        break;
                    default:
                        const event_duration = event_to_animation[event.key](event.value);
                        if (event_duration > combinate_phase_duration) combinate_phase_duration = event_duration;
                        break;
                }
            }

            view_state.game_state = data.state;
            view_state.is_processing = false;

            EventBus.send('SET_HELPER');
            EventBus.send('ON_GAME_STEP_ANIMATION_END');
        });
    }

    function dispatch_messages() {
        while (true) {
            const [message_id, _message, sender] = flow.until_any_message();
            view_state.go_manager.do_message(message_id, _message, sender);
        }
    }

    function on_down(item: IGameItem) {
        if (view_state.is_processing) return;
        down_item = item;
    }

    function on_move(pos: PosXYMessage) {
        if (down_item == null) return;

        const world_pos = Camera.screen_to_world(pos.x, pos.y);
        const selected_element_world_pos = go.get_position(down_item._hash);
        const delta = (world_pos - selected_element_world_pos) as vmath.vector3;

        if (vmath.length(delta) < GAME_CONFIG.min_swipe_distance) return;

        const selected_element_pos = get_field_pos(selected_element_world_pos);
        const element_to_pos = { x: selected_element_pos.x, y: selected_element_pos.y };

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

        EventBus.send('SWAP_ELEMENTS', {
            from_x: selected_element_pos.x,
            from_y: selected_element_pos.y,
            to_x: element_to_pos.x,
            to_y: element_to_pos.y
        });

        down_item = null;
    }

    function on_up(item: IGameItem) {
        if (down_item == null) return;

        const item_world_pos = go.get_position(item._hash);
        const element_pos = get_field_pos(item_world_pos);

        EventBus.send('CLICK_ACTIVATION', {
            x: element_pos.x,
            y: element_pos.y
        });

        down_item = null;
    }    
    
    function recalculate_cell_offset(game_state: GameState) {
        let min_y_active_cell = get_field_height();
        let max_y_active_cell = 0;
        for(let y = 0; y < get_field_height(); y++) {
            for(let x = 0; x < get_field_width(); x++) {
                if(game_state.cells[y][x] != NotActiveCell) {
                    if(y < min_y_active_cell) min_y_active_cell = y;
                    if(y > max_y_active_cell) max_y_active_cell = y;
                }
            }
        }

        view_state.cells_offset.y += min_y_active_cell * view_state.cell_size * 0.5;
        view_state.cells_offset.y -= math.abs(get_field_max_height() - max_y_active_cell) * view_state.cell_size * 0.5;
    }

    function load_field(game_state: GameState, with_anim = true) {
        Log.log("LOAD FIELD_VIEW");
        
        view_state.game_state = game_state;

        for (let y = 0; y < get_field_height(); y++) {
            for (let x = 0; x < get_field_width(); x++) {
                const cell = view_state.game_state.cells[y][x];
                if (cell != NotActiveCell) {
                    make_substrate_view(x, y, view_state.game_state.cells);
                    try_make_under_cell(x, y, cell);
                    make_cell_view(x, y, cell);
                }

                const element = view_state.game_state.elements[y][x];
                if (element != NullElement) make_element_view(x, y, element.type, element.uid, with_anim);
            }
        }
    }

    function reset_field() {
        Log.log("RESET FIELD VIEW");

        for(const [uid, index] of Object.entries(view_state.game_id_to_view_index)) {
            const items = get_all_view_items_by_uid(uid);
            if(items != undefined) for (const item of items) view_state.go_manager.delete_item(item, true);
        }

        for(let y = 0; y < get_field_height(); y++) {
            for(let x = 0; x < get_field_width(); x++) {
                const substrate = view_state.substrates[y][x];
                try { go.delete(substrate); } catch(any) {}
            }
        }

        view_state.game_id_to_view_index = {};
        view_state.substrates = [];

        for(let y = 0; y < get_field_height(); y++) {
            view_state.substrates[y] = [];
            for(let x = 0; x < get_field_width(); x++)
                view_state.substrates[y][x] = 0;
        }
    }

    function reload_field(with_anim = false) {
        if(view_state.game_state == null) return;

        const copy_state = copy_game_state();
        reset_field();
        load_field(copy_state, with_anim);
    }

    function make_substrate_view(x: number, y: number, cells: (Cell | typeof NotActiveCell)[][], z_index = GAME_CONFIG.default_substrate_z_index) {
        for (let mask_index = 0; mask_index < SubstrateMasks.length; mask_index++) {
            let mask = SubstrateMasks[mask_index];

            let is_90_mask = false;
            if (mask_index == SubstrateId.LeftRightStrip) is_90_mask = true;

            let angle = 0;
            const max_angle = is_90_mask ? 90 : 270;
            while (angle <= max_angle) {
                let is_valid = true;
                for (let i = y - (mask.length - 1) / 2; (i <= y + (mask.length - 1) / 2) && is_valid; i++) {
                    for (let j = x - (mask[0].length - 1) / 2; (j <= x + (mask[0].length - 1) / 2) && is_valid; j++) {
                        if (mask[i - (y - (mask.length - 1) / 2)][j - (x - (mask[0].length - 1) / 2)] == 1) {
                            if (is_valid_pos(j, i, cells[0].length, cells.length)) {
                                const cell = cells[i][j];
                                is_valid = (cell == NotActiveCell);
                            } else is_valid = true;
                        }
                    }
                }

                if (is_valid) {
                    const pos = get_world_pos(x, y, z_index);
                    const _go = view_state.go_manager.make_go('substrate_view', pos);
                    view_state.go_manager.set_rotation_hash(_go, -angle);
                    sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.substrate_view[mask_index as SubstrateId]);
                    go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), _go);
                    view_state.substrates[y][x] = _go;
                    
                    return;
                }

                mask = rotateMatrix(mask, 90);
                angle += 90;
            }
        }
    }

    function on_buster_activation_begin(message: Messages[MessageId]) {
        flow.delay(combinate_phase_duration + 0.2);
        combinate_phase_duration = 0;
        return 0;
    }

    function on_move_phase_begin() {
        flow.delay(combinate_phase_duration + 0.2);
        combinate_phase_duration = 0;
    }

    function on_move_phase_end(message: Messages[MessageId]) {
        const data = message as MovedElementsMessage;
        flow.delay(move_phase_duration + 0.3);
        view_state.game_state = data.state;
        move_phase_duration = 0;
    }

    function get_world_pos(x: number, y: number, z = 0) {
        return vmath.vector3(
            view_state.cells_offset.x + view_state.cell_size * x + view_state.cell_size * 0.5,
            view_state.cells_offset.y - view_state.cell_size * y - view_state.cell_size * 0.5,
            z
        );
    }

    function get_view_item_by_uid(uid: string) {
        const indices = view_state.game_id_to_view_index[uid];
        if (indices == undefined) return;
    
        return view_state.go_manager.get_item_by_index(indices[0]);
    }

    function try_make_under_cell(x: number, y: number, cell: Cell) {
        if (cell.data != undefined && cell.data.under_cells != undefined) {
            let depth = 0.1;
            for (let i = (cell.data.under_cells as CellId[]).length - 1; i >= 0; i--) {
                const cell_id = (cell.data.under_cells as CellId[])[i];
                if (cell_id != undefined) {
                    if (cell_id == CellId.Base) {
                        const z_index = (GAME_CONFIG.top_layer_cells.includes(cell_id) ?
                            GAME_CONFIG.default_top_layer_cell_z_index : GAME_CONFIG.default_cell_z_index) - depth;
                        make_cell_view(x, y, cell, cell_id, z_index);
                        depth += 0.1;
                        break;
                    }
                }
            }
        }
    }
    
    // TODO: remove cell_id from arguments
    function make_cell_view(x: number, y: number, cell: Cell, cell_id?: CellId, z_index?: number) {
        const pos = get_world_pos(x, y, z_index != undefined ? z_index : GAME_CONFIG.top_layer_cells.includes(cell.id) ?
            GAME_CONFIG.default_top_layer_cell_z_index : GAME_CONFIG.default_cell_z_index);
        
        const _go = view_state.go_manager.make_go('cell_view', pos);
        
        const id = (cell_id != undefined) ? cell_id : cell.id;

        print(x, y, cell_id, cell.id);
    
        let view = '';
        if(Array.isArray(GAME_CONFIG.cell_view[id as CellId])) {
            let index = (cell.activations != undefined) ? cell.activations : cell.near_activations != undefined ? cell.near_activations : 1;
            print(x, y, index);
            view = GAME_CONFIG.cell_view[id as CellId][index - 1];
        } else view = GAME_CONFIG.cell_view[id as CellId] as string;

        print(x, y, view);

        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), view);
        go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), _go);
    
        if (id == CellId.Base) view_state.go_manager.set_color_hash(_go, GAME_CONFIG.base_cell_color);
    
        const index = view_state.go_manager.add_game_item({ _hash: _go, is_clickable: true });
        if (view_state.game_id_to_view_index[cell.uid] == undefined) view_state.game_id_to_view_index[cell.uid] = [];
        view_state.game_id_to_view_index[cell.uid].push(index);
    
        return index;
    }
    
    function make_element_view(x: number, y: number, type: ElementId, uid: string, spawn_anim = false, z_index = GAME_CONFIG.default_element_z_index) {
        const pos = get_world_pos(x, y, z_index);
        const _go = view_state.go_manager.make_go('element_view', pos);
    
        sprite.play_flipbook(msg.url(undefined, _go, 'sprite'), GAME_CONFIG.element_view[type]);
    
        if (spawn_anim) {
            go.set_scale(vmath.vector3(0.01, 0.01, 1), _go);
            go.animate(_go, 'scale', go.PLAYBACK_ONCE_FORWARD, vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), GAME_CONFIG.spawn_element_easing, GAME_CONFIG.spawn_element_time);
        } else go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), _go);
    
        const index = view_state.go_manager.add_game_item({ _hash: _go, is_clickable: true });
        if (view_state.game_id_to_view_index[uid] == undefined) view_state.game_id_to_view_index[uid] = [];
        if (uid != undefined) view_state.game_id_to_view_index[uid].push(index);
    
        return index;
    }

    function get_cell(x: number, y: number) {
        return view_state.game_state.cells[y][x];
    }

    function get_element(x: number, y: number) {
        return view_state.game_state.elements[y][x];
    }
    
    function get_field_pos(world_pos: vmath.vector3): { x: number, y: number } {
        for (let y = 0; y < get_field_height(); y++) {
            for (let x = 0; x < get_field_width(); x++) {
                const original_world_pos = get_world_pos(x, y);
                const in_x = (world_pos.x >= original_world_pos.x - view_state.cell_size * 0.5) && (world_pos.x <= original_world_pos.x + view_state.cell_size * 0.5);
                const in_y = (world_pos.y >= original_world_pos.y - view_state.cell_size * 0.5) && (world_pos.y <= original_world_pos.y + view_state.cell_size * 0.5);
                if (in_x && in_y) {
                    return { x, y };
                }
            }
        }
    
        return { x: -1, y: -1 };
    }
    
    function get_view_item_by_uid_and_index(uid: string, index: number) {
        const indices = view_state.game_id_to_view_index[uid];
        if (indices == undefined) return;
    
        return view_state.go_manager.get_item_by_index(indices[index]);
    }
    
    function get_all_view_items_by_uid(uid: string) {
        const indices = view_state.game_id_to_view_index[uid];
        if (indices == undefined) return;
    
        const items = [];
        for (const index of indices)
            items.push(view_state.go_manager.get_item_by_index(index));
    
        return items;
    }
    
    function update_target_by_uid(uid: string) {
        for (let i = 0; i < view_state.game_state.targets.length; i++) {
            const target = view_state.game_state.targets[i];
            if (target.uids.indexOf(uid) != -1) {
                view_state.targets[i] = math.max(0, view_state.targets[i] - 1);
                EventBus.send('UPDATED_TARGET', {idx: i, amount: view_state.targets[i], id: target.id, type: target.type});
            }
        }
    }
    
    function delete_view_item_by_uid(uid: string) {
        const item = get_view_item_by_uid(uid);
        if (item == undefined) {
            delete view_state.game_id_to_view_index[uid];
            return false;
        }
    
        update_target_by_uid(uid);
    
        view_state.go_manager.delete_item(item, true);
        view_state.game_id_to_view_index[uid].splice(0, 1);
    
        return true;
    }
    
    function delete_all_view_items_by_uid(uid: string) {
        const items = get_all_view_items_by_uid(uid);
        if (items == undefined) return false;
    
        update_target_by_uid(uid);
        
        for (const item of items) {
            view_state.go_manager.delete_item(item, true);
        }
    
        delete view_state.game_id_to_view_index[uid];
    
        return true;
    }

    //#region ANIMATIONS

    function on_swap_element_animation(message: Messages[MessageId]) {
        const data = message as SwapElementsMessage;
    
        const from_world_pos = get_world_pos(data.from.x, data.from.y);
        const to_world_pos = get_world_pos(data.to.x, data.to.y);
    
        const element_from = data.element_from;
        const element_to = data.element_to;
    
        view_state.game_state = data.state;
    
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
    
        return GAME_CONFIG.swap_element_time + 0.1;
    }
    
    function on_wrong_swap_element_animation(message: Messages[MessageId]) {
        const data = message as SwapElementsMessage;

        flow.start(()=> {
            const from_world_pos = get_world_pos(data.from.x, data.from.y);
            const to_world_pos = get_world_pos(data.to.x, data.to.y);
    
            const element_from = data.element_from;
            const element_to = data.element_to;
    
            view_state.is_processing = true;
    
            const item_from = get_view_item_by_uid(element_from.uid);
            if (item_from != undefined) {
                go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, GAME_CONFIG.swap_element_easing, GAME_CONFIG.swap_element_time, 0, () => {
                    go.animate(item_from._hash, 'position', go.PLAYBACK_ONCE_FORWARD, from_world_pos, GAME_CONFIG.swap_element_easing, GAME_CONFIG.swap_element_time, 0, () => {
                        view_state.is_processing = false;
                    });
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
        });

        return GAME_CONFIG.spawn_element_time * 2;
    }
    
    function combo_animation(combo: CombinedMessage) {
        const target_element_world_pos = get_world_pos(combo.combined_element.x, combo.combined_element.y);
        for (let i = 0; i < combo.combination.elements.length; i++) {
            const element = combo.combination.elements[i];
            const item = get_view_item_by_uid(element.uid);
            if (item != undefined) {
                if (i == combo.combination.elements.length - 1) {
                    go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, target_element_world_pos,
                       GAME_CONFIG.squash_element_easing, GAME_CONFIG.squash_element_time, 0, () => {
                            delete_view_item_by_uid(element.uid);
                            if (combo.maked_element != undefined) {
                                make_element_view(
                                    combo.maked_element.x,
                                    combo.maked_element.y,
                                    combo.maked_element.type,
                                    combo.maked_element.uid
                                );
                            }
                        });
                } else {
                    go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, target_element_world_pos,
                        GAME_CONFIG.squash_element_easing, GAME_CONFIG.squash_element_time, 0, () => delete_view_item_by_uid(element.uid));
                }
            }
        }
    
        for (const cell of combo.activated_cells)
            activate_cell_animation(cell);
    
        return GAME_CONFIG.squash_element_time;
    }
    
    
    
    function on_diskisphere_activated_animation(message: Messages[MessageId]) {
        const activation = message as ActivationMessage;
        const activated_duration = activate_diskosphere_animation(activation);
    
        return activated_duration;
    }
    
    function on_swaped_diskosphere_with_buster_animation(message: Messages[MessageId]) {
        const activation = message as SwapedDiskosphereActivationMessage;
    
        damage_element_animation(message, activation.other_element.x, activation.other_element.y, activation.other_element.uid);
        const activated_duration = activate_diskosphere_animation(activation, () => {
            for (const element of activation.maked_elements)
                make_element_view(element.x, element.y, element.type, element.uid, true);
        });
    
        flow.delay(activated_duration + GAME_CONFIG.spawn_element_time);
        
        return 0;
    }
    
    function on_swaped_diskospheres_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        let activate_duration = 0;
        const squash_duration = squash_element_animation(activation.other_element, activation.element, () => {
            delete_view_item_by_uid(activation.other_element.uid);
            activate_duration = activate_diskosphere_animation(activation);
        });
    
        return squash_duration + 0.5;
    }
    
    function on_swaped_diskosphere_with_element_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        const activate_duration = activate_diskosphere_animation(activation);
    
        return activate_duration;
    }
    
    function activate_diskosphere_animation(activation: ActivationMessage, on_complete?: () => void) {
        delete_view_item_by_uid(activation.element.uid);
        
        const pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_element_z_index + 2.1);
        const _go = view_state.go_manager.make_go('effect_view', pos);
    
        go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), _go);
    
        msg.post(msg.url(undefined, _go, undefined), 'disable');
        msg.post(msg.url(undefined, _go, 'diskosphere'), 'enable');
        msg.post(msg.url(undefined, _go, 'diskosphere_light'), 'enable');
    
        const anim_props = { blend_duration: 0, playback_rate: 1.25 };
        spine.play_anim(msg.url(undefined, _go, 'diskosphere'), 'light_ball_intro', go.PLAYBACK_ONCE_FORWARD, anim_props, (self: any, message_id: any, message: any, sender: any) => {
            if (message_id == hash("spine_animation_done")) {
                const anim_props = { blend_duration: 0, playback_rate: 1.25 };
                if (message.animation_id == hash('light_ball_intro')) {
                    trace_animation(activation, _go, pos, activation.damaged_elements.length, () => {
                        spine.play_anim(msg.url(undefined, _go, 'diskosphere_light'), 'light_ball_explosion', go.PLAYBACK_ONCE_FORWARD, anim_props);
                        msg.post(msg.url(undefined, _go, 'diskosphere'), 'disable');
                        if(on_complete != undefined) on_complete();
                    });
                }
            }
        });
        
        return 1;
    }
    
    function trace_animation(activation: ActivationMessage, diskosphere: hash, pos: vmath.vector3, counter: number, on_complete: () => void) {
        const anim_props = { blend_duration: 0, playback_rate: 1 };
        spine.play_anim(msg.url(undefined, diskosphere, 'diskosphere'), 'light_ball_action', go.PLAYBACK_ONCE_FORWARD, anim_props);
        spine.play_anim(msg.url(undefined, diskosphere, 'diskosphere_light'), 'light_ball_action_light', go.PLAYBACK_ONCE_FORWARD, anim_props);
    
        if(activation.damaged_elements.length == 0) return on_complete();
    
        const projectile = view_state.go_manager.make_go('effect_view', pos);
    
        go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), projectile);
        
        msg.post(msg.url(undefined, projectile, undefined), 'disable');
        msg.post(msg.url(undefined, projectile, 'diskosphere_projectile'), 'enable');
    
        let element = activation.damaged_elements[counter];
        while(element == null || get_view_item_by_uid(element.uid)?._hash == diskosphere)
            element = activation.damaged_elements[--counter];
    
        const target_pos = get_world_pos(element.x, element.y, GAME_CONFIG.default_element_z_index + 0.1);
        spine.set_ik_target_position(msg.url(undefined, projectile, 'diskosphere_projectile'), 'ik_projectile_target', target_pos);
        spine.play_anim(msg.url(undefined, projectile, 'diskosphere_projectile'), "light_ball_projectile", go.PLAYBACK_ONCE_FORWARD, anim_props, (self: any, message_id: any, message: any, sender: any) => {
            if (message_id == hash("spine_animation_done")) {
                go.delete(projectile);
                explode_element_animation(element);
                const cell = activation.activated_cells[activation.activated_cells.findIndex((item) => {
                    return (item.x == element.x && item.y == element.y);
                })];
    
                if(cell != undefined) activate_cell_animation(cell);
            }
        });
    
        if(counter == 0) return on_complete();
        trace_animation(activation, diskosphere, pos, counter - 1, on_complete);
    }
    
    function explode_element_animation(item: ItemInfo) {
        delete_all_view_items_by_uid(item.uid);
    
        const element = view_state.game_state.elements[item.y][item.x];
        if(element == NullElement) return;
    
        const type = element.type as ElementId;
        if(GAME_CONFIG.buster_elements.includes(type)) return;
    
        const pos = get_world_pos(item.x, item.y, GAME_CONFIG.default_element_z_index + 0.1);
        const effect = view_state.go_manager.make_go('effect_view', pos);
        const effect_name = 'explode';
        
        go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), effect);
        
        msg.post(msg.url(undefined, effect, undefined), 'disable');
        msg.post(msg.url(undefined, effect, effect_name), 'enable');
        
        const color = GAME_CONFIG.element_colors[type];
    
        const anim_props = { blend_duration: 0, playback_rate: 1 };
        spine.play_anim(msg.url(undefined, effect, effect_name), color, go.PLAYBACK_ONCE_FORWARD, anim_props, () => {
            go.delete(effect);
        });
    }
    
    function on_rocket_activated_animation(message: Messages[MessageId]) {
        const activation = message as RocketActivationMessage;
        const activate_duration = activate_rocket_animation(activation, activation.axis, () => {
            for (const element of activation.damaged_elements)
                damage_element_animation(message, element.x, element.y, element.uid);
    
            for (const cell of activation.activated_cells) {
                let skip = false;
                for (const element of activation.damaged_elements)
                    if (cell.x == element.x && cell.y == element.y) skip = true;
                if (!skip) activate_cell_animation(cell);
            }
        });
    
        return activate_duration + GAME_CONFIG.damaged_element_time;
    }
    
    function on_swaped_rockets_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        let activate_duration = 0;
        const squash_duration = squash_element_animation(activation.other_element, activation.element, () => {
            delete_view_item_by_uid(activation.element.uid);
            delete_view_item_by_uid(activation.other_element.uid);
    
            make_element_view(activation.element.x, activation.element.y, ElementId.AxisRocket, activation.element.uid);
    
            activate_duration = activate_rocket_animation(activation, Axis.All, () => {
                for (const element of activation.damaged_elements)
                    damage_element_animation(message, element.x, element.y, element.uid);
    
                for (const cell of activation.activated_cells) {
                    let skip = false;
                    for (const element of activation.damaged_elements)
                        if (cell.x == element.x && cell.y == element.y) skip = true;
                    if (!skip) activate_cell_animation(cell);
                }
            });
        });
    
        return squash_duration + GAME_CONFIG.damaged_element_time;
    }
    
    function activate_rocket_animation(activation: ActivationMessage, dir: Axis, on_fly_end: () => void) {
        if(activation.element.uid != '') delete_view_item_by_uid(activation.element.uid);
    
        const pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_element_z_index + 2.1);
        rocket_effect(pos, dir);
        
        timer.delay(0.3, false, on_fly_end);
    
        return 0.3;
    }
    
    function on_combined_animation(message: Messages[MessageId]) {
        const combined = message as CombinedMessage;
    
        if (combined.maked_element == null) {
            for (const element of combined.combination.elements)
                damage_element_animation(message, element.x, element.y, element.uid);
    
            for (const cell of combined.activated_cells) {
                let skip = false;
                for (const element of combined.combination.elements)
                    if (cell.x == element.x && cell.y == element.y) skip = true;
                if (!skip) activate_cell_animation(cell);
            }
    
            return GAME_CONFIG.damaged_element_time;
        }
    
        return combo_animation(combined);
    }
    
    function squash_element_animation(element: ItemInfo, target_element: ItemInfo, on_complite?: () => void) {
        const to_world_pos = get_world_pos(target_element.x, target_element.y);
    
        const item = get_view_item_by_uid(element.uid);
        if (item == undefined) return 0;
    
        go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, GAME_CONFIG.swap_element_easing, GAME_CONFIG.swap_element_time, 0, () => {
            if (on_complite != undefined) on_complite();
        });
    
        return GAME_CONFIG.swap_element_time;
    }
    
    function rocket_effect(pos: vmath.vector3, dir: Axis) {
        if(dir == Axis.All) {
            rocket_effect(pos, Axis.Vertical);
            rocket_effect(pos, Axis.Horizontal);
            return;
        }
    
        const part0 = view_state.go_manager.make_go('effect_view', pos);
        const part1 = view_state.go_manager.make_go('effect_view', pos);
    
        go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), part0);
        go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), part1);
    
        switch (dir) {
            case Axis.Vertical:
                view_state.go_manager.set_rotation_hash(part1, 180);
                break;
            case Axis.Horizontal:
                view_state.go_manager.set_rotation_hash(part0, 90);
                view_state.go_manager.set_rotation_hash(part1, -90);
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
    
        if(dir == Axis.Vertical) {
            const distance = get_field_height() * view_state.cell_size;
            part0_to_world_pos.y += distance;
            part1_to_world_pos.y += -distance;
        }
    
        if(dir == Axis.Horizontal) {
            const distance = get_field_width() * view_state.cell_size;
            part0_to_world_pos.x += -distance;
            part1_to_world_pos.x += distance;
        }
    
        go.animate(part0, 'position', go.PLAYBACK_ONCE_FORWARD, part0_to_world_pos, go.EASING_INCUBIC, 0.3, 0, () => {
            go.delete(part0);
        });
        
        go.animate(part1, 'position', go.PLAYBACK_ONCE_FORWARD, part1_to_world_pos, go.EASING_INCUBIC, 0.3, 0, () => {
            go.delete(part1);
        });
    }
    
    function on_helicopter_activated_animation(message: Messages[MessageId]) {
        const activation = message as HelicopterActivationMessage;
        for (const element of activation.damaged_elements) {
            damage_element_animation(message, element.x, element.y, element.uid);
        }
        
        print("ACTIVATED: ", activation.element.x, activation.element.y, activation.element.uid, activation.activated_cells.length);

        const activated: number[] = [];
        for (const cell_info of activation.activated_cells) {
            const previous_cell = get_cell(cell_info.x, cell_info.y);
            if(previous_cell != NotActiveCell) {
                let skip = false;
                for (const item of activation.damaged_elements) {
                    const element = get_element(item.x, item.y);
                    if (element != NullElement && cell_info.x == item.x && cell_info.y == item.y) {
                        skip = true;
                    }
                }

                print(activation.element.uid, activation.target_item);
                
                if (activation.target_item != NullElement) {
                    const is_target_pos = (cell_info.x == activation.target_item.x) && (cell_info.y == activation.target_item.y);
                    const is_not_neighbour = !is_neighbor(cell_info.x, cell_info.y, activation.element.x, activation.element.y);
                    const was_activated = activated.includes(cell_info.y * get_field_width() + cell_info.x);
                    print(activation.element.uid, cell_info.x, cell_info.y, is_target_pos, is_not_neighbour, was_activated);
                    if(is_target_pos && (is_element(activation.target_item) || is_not_neighbour || was_activated)) {
                        skip = true;
                    }
                }
        
                if (!skip) {
                    activated.push(cell_info.y * get_field_width() + cell_info.x);
                    activate_cell_animation(cell_info);
                }
            }
        }
    
        if (activation.target_item != NullElement) {
            remove_random_element_animation(message, activation.element, activation.target_item);
            return GAME_CONFIG.damaged_element_time + (GAME_CONFIG.helicopter_spin_duration * 0.5) + GAME_CONFIG.helicopter_fly_duration;
        }
    
        return damage_element_animation(message, activation.element.x, activation.element.y, activation.element.uid);
    }
    
    function on_swaped_helicopters_animation(message: Messages[MessageId]) {
        const data = message as SwapedHelicoptersActivationMessage;
    
        const squash_duration = squash_element_animation(data.other_element, data.element, () => {
            for (const element of data.damaged_elements)
                damage_element_animation(message, element.x, element.y, element.uid);
    
            let target_element = data.target_items[0];
            if (target_element != undefined && target_element != NullElement)
                remove_random_element_animation(message, data.element, target_element);
            else
                delete_all_view_items_by_uid(data.element.uid);
    
            target_element = data.target_items[1];
            if (target_element != undefined && target_element != NullElement)
                remove_random_element_animation(message, data.other_element, target_element);
            else
                delete_all_view_items_by_uid(data.other_element.uid);
    
            target_element = data.target_items[2];
            if (target_element != undefined && target_element != NullElement) {
                make_element_view(data.element.x, data.element.y, ElementId.Helicopter, data.element.uid);
                remove_random_element_animation(message, data.element, target_element, 1);
            }
        });
    
        const activated: number[] = [];
        for (const cell_info of data.activated_cells) {
            const previous_cell = get_cell(cell_info.x, cell_info.y);
            if(previous_cell != NotActiveCell) {
                let skip = false;
                for (const item of data.damaged_elements) {
                    const element = get_element(item.x, item.y);
                    if (element != NullElement && cell_info.x == item.x && cell_info.y == item.y)
                        skip = true;
                }
                for (const item of data.target_items) {
                    if (item != NullElement) {
                        const is_target_pos = (cell_info.x == item.x) && (cell_info.y == item.y);
                        const is_not_neighbour = !is_neighbor(cell_info.x, cell_info.y, data.element.x, data.element.y);
                        const was_activated = activated.includes(cell_info.y * get_field_width() + cell_info.x);
                        if(is_target_pos && (is_element(item) || is_not_neighbour || was_activated)) {
                            skip = true;
                        }
                    }
                }
                if (!skip) {
                    activated.push(cell_info.y * get_field_width() + cell_info.x);
                    activate_cell_animation(cell_info);
                }
            }
        }
    
        return squash_duration + GAME_CONFIG.damaged_element_time + (GAME_CONFIG.helicopter_spin_duration * 0.5) + GAME_CONFIG.helicopter_fly_duration;
    }
    
    function on_swaped_helicopter_with_element_animation(message: Messages[MessageId]) {
        const activation = message as SwapedHelicopterWithElementMessage;
        const squash_duration = squash_element_animation(activation.element, activation.element, () => {
            for (const element of activation.damaged_elements)
                damage_element_animation(message, element.x, element.y, element.uid);
    
            if (activation.target_item != NullElement)
                remove_random_element_animation(message, activation.element, activation.target_item);
        });
    
        const activated: number[] = [];
        for (const cell_info of activation.activated_cells) {
            const previous_cell = get_cell(cell_info.x, cell_info.y);
            if(previous_cell != NotActiveCell) {
                let skip = false;
                for (const item of activation.damaged_elements) {
                    const element = get_element(item.x, item.y);
                    if (element != NullElement && cell_info.x == item.x && cell_info.y == item.y) {
                        skip = true;
                        break;
                    }
                }
                if (activation.target_item != NullElement) {
                    const is_target_pos = (cell_info.x == activation.target_item.x) && (cell_info.y == activation.target_item.y);
                    const is_not_neighbour = !is_neighbor(cell_info.x, cell_info.y, activation.element.x, activation.element.y);
                    const was_activated = activated.includes(cell_info.y * get_field_width() + cell_info.x);
                    if(is_target_pos && (is_element(activation.target_item) || is_not_neighbour || was_activated)) {
                        skip = true;
                    }
                }
                if (!skip) {
                    activated.push(cell_info.y * get_field_width() + cell_info.x);
                    activate_cell_animation(cell_info);
                }
            }
        }
    
        return squash_duration + GAME_CONFIG.damaged_element_time + (GAME_CONFIG.helicopter_spin_duration * 0.5) + GAME_CONFIG.helicopter_fly_duration;
    }
    
    function on_dynamite_activated_animation(message: Messages[MessageId]) {
        const activation = message as ActivationMessage;
        const activate_duration = activate_dynamite_animation(activation, 1, () => {
            for (const element of activation.damaged_elements) {
                damage_element_animation(message, element.x, element.y, element.uid);
            }
    
            dynamite_activate_cell_animation(activation.activated_cells, activation.damaged_elements);
        });
    
        return activate_duration + GAME_CONFIG.damaged_element_time;
    }
    
    function on_swaped_dynamites_animation(message: Messages[MessageId]) {
        const activation = message as SwapedActivationMessage;
        let activate_duration = 0;
        const squash_duration = squash_element_animation(activation.other_element, activation.element, () => {
            delete_view_item_by_uid(activation.other_element.uid);
            activate_duration = activate_dynamite_animation(activation, 1.5, () => {
                for (const element of activation.damaged_elements)
                    damage_element_animation(message, element.x, element.y, element.uid);
    
                dynamite_activate_cell_animation(activation.activated_cells, activation.damaged_elements);
            });
        });
    
        return squash_duration + activate_duration + GAME_CONFIG.damaged_element_time;
    }
    
    function activate_dynamite_animation(activation: ActivationMessage, range: number, on_explode: () => void) {
        const pos = get_world_pos(activation.element.x, activation.element.y, GAME_CONFIG.default_vfx_z_index + 0.1);
        const _go = view_state.go_manager.make_go('effect_view', pos);
    
        go.set_scale(vmath.vector3(view_state.scale_ratio * range, view_state.scale_ratio * range, 1), _go);
    
        msg.post(msg.url(undefined, _go, undefined), 'disable');
        msg.post(msg.url(undefined, _go, 'dynamite'), 'enable');
    
        delete_view_item_by_uid(activation.element.uid);
    
        const anim_props = { blend_duration: 0, playback_rate: 1.25 };
        spine.play_anim(msg.url(undefined, _go, 'dynamite'), 'action', go.PLAYBACK_ONCE_FORWARD, anim_props, (self: any, message_id: any) => {
            view_state.go_manager.delete_go(_go);
        });
    
        const delay = 0.3;
        timer.delay(delay, false, on_explode);
    
        return delay;
    }
    
    function dynamite_activate_cell_animation(cells: ActivatedCellMessage[], elements: ItemInfo[]) {
        for (const cell of cells) {
            let skip = false;
            for (const element of elements)
                if (cell.x == element.x && cell.y == element.y) skip = true;
            if (!skip) activate_cell_animation(cell);
        }
    }
    
    function on_element_activated_animation(message: Messages[MessageId]) {
        const activation = message as ElementActivationMessage;
        const time = damage_element_animation(message, activation.x, activation.y, activation.uid);
        if(time == 0) {
            for (const cell of activation.activated_cells) {
                if (cell.x == activation.x && cell.y == activation.y)
                    activate_cell_animation(cell);
            }
        }
    
        return GAME_CONFIG.damaged_element_time;
    }
    
    function activate_cell_animation(activation: ActivatedCellMessage) {
        const previous_cell = get_cell(activation.x, activation.y);
        if(previous_cell == NotActiveCell) return;

        delete_all_view_items_by_uid(previous_cell.uid);
        
        try_make_under_cell(activation.x, activation.y, activation.cell);
        make_cell_view(activation.x, activation.y, activation.cell);
    
        const type = previous_cell.id as CellId;
        if(!GAME_CONFIG.explodable_cells.includes(type))
            return 0;
        
        const pos = get_world_pos(activation.x, activation.y, (GAME_CONFIG.top_layer_cells.includes(type) ? GAME_CONFIG.default_top_layer_cell_z_index : GAME_CONFIG.default_cell_z_index) + 0.1);
        const effect = view_state.go_manager.make_go('effect_view', pos);
               
        let view = '';
        if(Array.isArray(GAME_CONFIG.cell_view[type])) view = GAME_CONFIG.cell_view[type][GAME_CONFIG.cell_view[type].length - 1];
        else view = GAME_CONFIG.cell_view[type] as string;

        const effect_name = view + '_explode';
    
        msg.post(msg.url(undefined, effect, undefined), 'disable');
        msg.post(msg.url(undefined, effect, effect_name), 'enable');
    
        go.set_scale(vmath.vector3(view_state.scale_ratio, view_state.scale_ratio, 1), effect);
    
        const anim_props = { blend_duration: 0, playback_rate: 1 };
    
        let anim_name = '';
        if(type == CellId.Grass) anim_name = '1'; // FIXME: remove after added second grass activation effect
        else anim_name = previous_cell.activations != undefined ? tostring(previous_cell.activations) : tostring(previous_cell.near_activations);
        spine.play_anim(msg.url(undefined, effect, effect_name), anim_name, go.PLAYBACK_ONCE_FORWARD, anim_props, () => {
            go.delete(effect);
        });
    
        return 0;
    }
    
    function on_moved_elements_animation(message: Messages[MessageId]) {
        const data = message as MovedElementsMessage;
        const elements = data.elements;
    
        const delayed_row_in_column: number[] = [];
    
        let max_delay = 0;
        let max_move_duration = 0;
    
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
    
            let delay = 0;
            let total_move_duration = 0;
            let animation = null;
            let anim_pos: { x: number, y: number } = {} as { x: number, y: number };
    
            for (let p = 0; p < element.points.length; p++) {
                const point = element.points[p];
                if (point.type != MoveType.Swaped) {
                    if (point.type == MoveType.Requested)
                        make_element_view(point.to_x, point.to_y, element.data.type, element.data.uid);
    
                    const item_from = get_view_item_by_uid(element.data.uid);
                    if (item_from != undefined) {
                        const to_world_pos = get_world_pos(point.to_x, point.to_y);
    
                        if (point.type == MoveType.Requested) {
                            const j = (delayed_row_in_column[element.points[0].to_x] != null) ? delayed_row_in_column[element.points[0].to_x] : 0;
                            view_state.go_manager.set_position_xy(item_from, to_world_pos.x, 0 + view_state.cell_size * j);
                        }
    
                        let move_duration = 0;
    
                        if (animation == null) {
                            anim_pos.x = go.get(item_from._hash, 'position.x');
                            anim_pos.y = go.get(item_from._hash, 'position.y');
    
                            if (delayed_row_in_column[element.points[0].to_x] == null) delayed_row_in_column[element.points[0].to_x] = 0;
                            const delay_factor = delayed_row_in_column[element.points[0].to_x]++;
    
                            delay = delay_factor * GAME_CONFIG.duration_of_movement_between_cells;
    
                            if (delay > max_delay) max_delay = delay;
    
                            if (GAME_CONFIG.movement_to_point) {
                                const diagonal = math.sqrt(math.pow(view_state.cell_size, 2) + math.pow(view_state.cell_size, 2));
                                const delta = diagonal / view_state.cell_size;
                                const distance_beetwen_cells = (point.type == MoveType.Filled) ? diagonal : view_state.cell_size;
                                const time = (point.type == MoveType.Filled) ? (GAME_CONFIG.duration_of_movement_between_cells * delta) : GAME_CONFIG.duration_of_movement_between_cells;
                                const v = (to_world_pos - vmath.vector3(anim_pos.x, anim_pos.y, 0)) as vmath.vector3;
                                const l = math.sqrt(math.pow(v.x, 2) + math.pow(v.y, 2));
                                move_duration = time * (l / distance_beetwen_cells);
                            } else {
                                const diagonal = math.sqrt(math.pow(view_state.cell_size, 2) + math.pow(view_state.cell_size, 2));
                                const delta = diagonal / view_state.cell_size;
                                const time = (point.type == MoveType.Filled) ? (GAME_CONFIG.duration_of_movement_between_cells * delta) : GAME_CONFIG.duration_of_movement_between_cells;
                                move_duration = time;
                            }
    
                            animation = animator.to(anim_pos, move_duration, { x: to_world_pos.x, y: to_world_pos.y })
                                .delay(delay)
                                .ease('linear')
                                .onupdate(() => {
                                    go.set(item_from._hash, 'position.x', anim_pos.x);
                                    go.set(item_from._hash, 'position.y', anim_pos.y);
                                });
                        } else {
                            if (GAME_CONFIG.movement_to_point) {
                                const previous_point = element.points[p - 1];
                                const current_world_pos = get_world_pos(previous_point.to_x, previous_point.to_y);
    
                                const diagonal = math.sqrt(math.pow(view_state.cell_size, 2) + math.pow(view_state.cell_size, 2));
                                const delta = diagonal / view_state.cell_size;
                                const distance_beetwen_cells = (point.type == MoveType.Filled) ? diagonal : view_state.cell_size;
                                const time = (point.type == MoveType.Filled) ? (GAME_CONFIG.duration_of_movement_between_cells * delta) : GAME_CONFIG.duration_of_movement_between_cells;
                                const v = (to_world_pos - current_world_pos) as vmath.vector3;
                                const l = math.sqrt(math.pow(v.x, 2) + math.pow(v.y, 2));
                                move_duration = time * (l / distance_beetwen_cells);
                            } else {
                                const diagonal = math.sqrt(math.pow(view_state.cell_size, 2) + math.pow(view_state.cell_size, 2));
                                const delta = diagonal / view_state.cell_size;
                                const time = (point.type == MoveType.Filled) ? (GAME_CONFIG.duration_of_movement_between_cells * delta) : GAME_CONFIG.duration_of_movement_between_cells;
                                move_duration = time;
                            }
    
                            animation = animation.after(anim_pos, move_duration, { x: to_world_pos.x, y: to_world_pos.y })
                                .onupdate(() => {
                                    go.set(item_from._hash, 'position.x', anim_pos.x);
                                    go.set(item_from._hash, 'position.y', anim_pos.y);
                                });
                        }
    
                        total_move_duration += move_duration;
                    }
                }
            }
    
            if (total_move_duration > max_move_duration) max_move_duration = total_move_duration;
        }
    
        return max_move_duration + max_delay;
    }
    
    function remove_random_element_animation(message: Messages[MessageId], element: ItemInfo, target_element: ItemInfo, view_index?: number, on_complited?: () => void) {
        const target_world_pos = get_world_pos(target_element.x, target_element.y, 3);
        const item = view_index != undefined ? get_view_item_by_uid_and_index(element.uid, view_index) : get_view_item_by_uid(element.uid);
        if (item == undefined) return 0;
    
        const current_world_pos = go.get_position(item._hash);
        current_world_pos.z = 3;
        go.set_position(current_world_pos, item._hash);
        go.animate(item._hash, 'euler.z', go.PLAYBACK_ONCE_FORWARD, 720, go.EASING_INCUBIC, GAME_CONFIG.helicopter_spin_duration);
        go.animate(item._hash, 'position', go.PLAYBACK_ONCE_FORWARD, target_world_pos, go.EASING_INCUBIC, GAME_CONFIG.helicopter_fly_duration, GAME_CONFIG.helicopter_spin_duration * 0.5, () => {
            damage_element_animation(message, target_element.x, target_element.y, target_element.uid);
            damage_element_animation(message, element.x, element.y, element.uid, () => {
                if (on_complited != undefined) on_complited();
            });
        });
        
    
        return GAME_CONFIG.helicopter_spin_duration + GAME_CONFIG.helicopter_fly_duration + GAME_CONFIG.damaged_element_time;
    }
    
    function damage_element_animation(message: Messages[MessageId], x: number, y: number, uid: string, on_complite?: () => void) {
        const element_view_item = get_view_item_by_uid(uid);
        if (element_view_item != undefined) {
            explode_element_animation({x, y, uid});
            for (const [key, value] of Object.entries(message)) {
                if (key == 'activated_cells') {
                    for (const cell of value as ActivatedCellMessage[]) {
                        if ((cell.x == x) && (cell.y == y)) {
                            activate_cell_animation(cell);
                        }
                    }
                }
            }
    
            if (on_complite != undefined)
                on_complite();
    
            return  0.5;
        }
    
        return 0;
    }
    
    function shuffle_animation(message: Messages[MessageId]) {
        const game_state = message as GameState;
        for(let y = 0; y < get_field_height(); y++) {
            for(let x = 0; x < get_field_width(); x++) {
                const element = game_state.elements[y][x];
                if(element != NullElement) {
                    const element_view = get_view_item_by_uid(element.uid);
                    if (element_view != undefined) {
                        const to_world_pos = get_world_pos(x, y, GAME_CONFIG.default_element_z_index);
                        go.animate(element_view._hash, 'position', go.PLAYBACK_ONCE_FORWARD, to_world_pos, GAME_CONFIG.swap_element_easing, 0.5);
                    } else make_element_view(x, y, element.type, element.uid, true);
                }
            }
        }

        return 0.5;
    }

    //#endregion ANIMATIONS

    return init();
}