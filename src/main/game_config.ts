/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { CellType, NotActiveCell, NullElement, GameState, ItemInfo, StepInfo, CombinationInfo, MovedInfo, Element } from "../game/match3_core";
import { RandomElement, Target } from "../game/match3_game";
import { MessageId, Messages, NameMessage, PosXYMessage, VoidMessage } from "../modules/modules_const";
import { Axis } from "../utils/math_utils";

export const IS_DEBUG_MODE = true;

// параметры инициализации для ADS
export const ADS_CONFIG = {
    is_mediation: true,
    id_banners: [],
    id_inters: [],
    id_reward: [],
    banner_on_init: true,
    ads_interval: 4 * 60,
    ads_delay: 30,
};

// для вк
export const VK_SHARE_URL = '';
// для андроида метрика
export const ID_YANDEX_METRICA = "";
// через сколько показать первое окно оценки
export const RATE_FIRST_SHOW = 24 * 60 * 60;
// через сколько второй раз показать 
export const RATE_SECOND_SHOW = 3 * 24 * 60 * 60;

export const MAIN_BUNDLE_SCENES = ['game'];

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

export enum CellId {
    Base,
    Grass,
    Flowers,
    Web,
    WebUI,
    Box,
    Stone0,
    Stone1,
    Stone2
}

export enum ElementId {
    Dimonde,
    Gold,
    Topaz,
    Ruby,
    Emerald,
    Cheese,
    Cabbage,
    Acorn,
    RareMeat,
    MediumMeat,
    Chicken,
    SunFlower,
    Salad,
    Hay,
    VerticalRocket,
    HorizontalRocket,
    AxisRocket,
    Helicopter,
    Dynamite,
    Diskosphere
}

// игровой конфиг (сюда не пишем/не читаем если предполагается сохранение после выхода из игры)
// все обращения через глобальную переменную GAME_CONFIG
export const _GAME_CONFIG = {
    min_swipe_distance: 32,

    swap_element_easing: go.EASING_LINEAR,
    swap_element_time: 0.25,
    squash_element_easing: go.EASING_INCUBIC,
    squash_element_time: 0.3,

    helicopter_fly_duration: 0.75,

    damaged_element_easing: go.EASING_INOUTBACK,
    damaged_element_time: 0.3,
    damaged_element_delay: 0.1,
    damaged_element_scale: 0.3,

    base_cell_color: sys.get_sys_info().system_name == 'HTML5' ? html5.run(`new URL(location).searchParams.get('color')||'#c29754'`) : '#c29754',

    movement_to_point: sys.get_sys_info().system_name == 'HTML5' ? (html5.run(`new URL(location).searchParams.get('move')==null`) == 'true') : true,
    duration_of_movement_bettween_cells: sys.get_sys_info().system_name == 'HTML5' ? tonumber(html5.run(`new URL(location).searchParams.get('time')||0.07`))! : 0.07,

    complex_move: true,

    spawn_element_easing: go.EASING_INCUBIC,
    spawn_element_time: 0.5,

    buster_delay: 0.5,

    default_substrate_z_index: -2,
    default_cell_z_index: -1,
    default_element_z_index: 0,
    default_top_layer_cell_z_index: 2,

    substrate_database: {
        [SubstrateId.OutsideArc]: 'outside_arc',
        [SubstrateId.OutsideInsideAngle]: 'outside_inside_angle',
        [SubstrateId.OutsideAngle]: 'outside_angle',
        [SubstrateId.LeftRightStrip]: 'left_right_strip',
        [SubstrateId.LeftStripTopBottomInsideAngle]: 'left_strip_top_inside_angle',
        [SubstrateId.LeftStripTopInsideAngle]: 'left_strip_top_inside_angle',
        [SubstrateId.LeftStripBottomInsideAngle]: 'left_strip_bottom_inside_angle',
        [SubstrateId.LeftStrip]: 'left_strip',
        [SubstrateId.TopBottomInsideAngle]: 'top_bottom_inside_angle',
        [SubstrateId.InsideAngle]: 'inside_angle',
        [SubstrateId.Full]: 'full'
    } as { [key in SubstrateId]: string },

    cell_view: {
        [CellId.Base]: 'cell_white',
        [CellId.Grass]: 'cell_grass',
        [CellId.Flowers]: 'cell_flowers',
        [CellId.Web]: 'cell_web',
        [CellId.Box]: 'cell_box',
        [CellId.Stone0]: 'cell_stone_0',
        [CellId.Stone1]: 'cell_stone_1',
        [CellId.Stone2]: 'cell_stone_2'
    } as { [key in CellId]: string },
    
    activation_cells: [
        CellId.Grass,
        CellId.Flowers
    ],

    near_activated_cells: [
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Web,
    ],
    
    disabled_cells: [
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2
    ],

    not_moved_cells: [
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Web
    ],

    top_layer_cells: [
        CellId.Box,
        CellId.Stone0,
        CellId.Stone1,
        CellId.Stone2,
        CellId.Web
    ],

    element_view: {
        [ElementId.Dimonde]: 'element_diamond',
        [ElementId.Gold]: 'element_gold',
        [ElementId.Topaz]: 'element_topaz',
        [ElementId.Ruby]: 'element_ruby',
        [ElementId.Emerald]: 'element_emerald',
        [ElementId.VerticalRocket]: 'vertical_rocket_buster',
        [ElementId.HorizontalRocket]: 'horizontal_rocket_buster',
        [ElementId.AxisRocket]: 'axis_rocket_buster',
        [ElementId.Helicopter]: 'helicopter_buster',
        [ElementId.Dynamite]: 'dynamite_buster',
        [ElementId.Diskosphere]: 'diskosphere_buster',
        [ElementId.Cheese]: 'element_cheese',
        [ElementId.Cabbage]: 'element_cabbage',
        [ElementId.Acorn]: 'element_acorn',
        [ElementId.RareMeat]: 'element_rare_meat',
        [ElementId.MediumMeat]: 'element_medium_meat',
        [ElementId.Chicken]: 'element_chicken',
        [ElementId.SunFlower]: 'element_sunflower',
        [ElementId.Salad]: 'element_salad' ,
        [ElementId.Hay]: 'element_hay',
    } as { [key in ElementId]: string },

    element_colors: {
        [ElementId.Dimonde]: '#009de2',
        [ElementId.Gold]: '#e94165',
        [ElementId.Topaz]: '#f5d74d',
        [ElementId.Ruby]: '#9a4ee5',
        [ElementId.Emerald]: '#20af1b',
        [ElementId.VerticalRocket]: '#ffffff',
        [ElementId.HorizontalRocket]: '#ffffff',
        [ElementId.AxisRocket]: '#ffffff',
        [ElementId.Helicopter]: '#ffffff',
        [ElementId.Dynamite]: '#ffffff',
        [ElementId.Diskosphere]: '#ffffff',
        [ElementId.Cheese]: '#ffffff',
        [ElementId.Cabbage]: '#ffffff',
        [ElementId.Acorn]: '#ffffff',
        [ElementId.RareMeat]: '#ffffff',
        [ElementId.MediumMeat]: '#ffffff',
        [ElementId.Chicken]: '#ffffff',
        [ElementId.SunFlower]: '#ffffff',
        [ElementId.Salad]: '#ffffff' ,
        [ElementId.Hay]: '#ffffff'
    },

    base_elements: [
        ElementId.Dimonde,
        ElementId.Gold,
        ElementId.Topaz,
        ElementId.Ruby,
        ElementId.Emerald
    ],

    buster_elements: [
        ElementId.VerticalRocket,
        ElementId.HorizontalRocket,
        ElementId.AxisRocket,
        ElementId.Dynamite,
        ElementId.Helicopter,
        ElementId.Diskosphere
    ],

    red_levels: [4, 11, 18, 25, 32, 39, 47],

    levels: [] as {
        field: { 
            width: number,
            height: number,
            max_width: number,
            max_height: number,
            cell_size: number,
            offset_border: number,

            cells: (typeof NotActiveCell | CellId)[][] | CellId[][][],
            elements: (typeof NullElement | typeof RandomElement | ElementId)[][]
        }

        additional_element: ElementId,
        exclude_element: ElementId,

        time: number,
        steps: number,
        targets: Target[],

        busters: {
            hammer_active: boolean,
            spinning_active: boolean,
            horizontal_rocket_active: boolean,
            vertical_rocket_active: boolean
        }
    }[]
};


// конфиг с хранилищем  (отсюда не читаем/не пишем, все запрашивается/меняется через GameStorage)
export const _STORAGE_CONFIG = {
    current_level: 0,
    hammer_counts: 3,
    spinning_counts: 3,
    horizontal_rocket_counts: 3,
    vertical_rocket_counts: 3,
    completed_levels: [] as number[]
};

export type GameStepEventBuffer = { key: MessageId, value: Messages[MessageId] }[];
export type MovedElementsMessage = MovedInfo[];

export interface ElementMessage extends ItemInfo { type: number }
export interface ElementActivationMessage extends ItemInfo { activated_cells: ActivatedCellMessage[] }
export interface SwapElementsMessage { from: {x: number, y: number}, to: {x: number, y: number}, element_from: Element, element_to: Element | typeof NullElement }
export interface CombinedMessage { combined_element: ItemInfo, combination: CombinationInfo, activated_cells: ActivatedCellMessage[], maked_element?: ElementMessage }
export interface StepHelperMessage { step: StepInfo, combined_element: ItemInfo, elements: ItemInfo[] }

export interface ActivationMessage { element: ItemInfo, damaged_elements: ItemInfo[], activated_cells: ActivatedCellMessage[] }
export interface SwapedActivationMessage extends ActivationMessage { other_element: ItemInfo }

export interface RocketActivationMessage extends ActivationMessage { axis: Axis }

export interface HelicopterActivationMessage extends ActivationMessage { target_element: ItemInfo | typeof NullElement }
export interface SwapedHelicoptersActivationMessage extends SwapedActivationMessage { target_elements: (ItemInfo | typeof NullElement)[] }
export interface SwapedHelicopterWithElementMessage extends SwapedActivationMessage { target_element: ItemInfo | typeof NullElement }

export interface SwapedDiskosphereActivationMessage extends SwapedActivationMessage { maked_elements: ElementMessage[] }

export interface ActivatedCellMessage extends ItemInfo { id: number, previous_id: number }
export interface RevertStepMessage { current_state: GameState, previous_state: GameState }

export type SpinningActivationMessage = { element_from: ItemInfo, element_to: ItemInfo }[];

// пользовательские сообщения под конкретный проект, доступны типы через глобальную тип-переменную UserMessages
export type _UserMessages = {
    LOAD_RESOURCE: NameMessage,
    UNLOAD_RESOURCE: NameMessage,

    LOAD_FIELD: VoidMessage,
    ON_LOAD_FIELD: GameState,

    GAME_TIMER: number,

    SET_HELPER: VoidMessage,

    SWAP_ELEMENTS: StepInfo,
    ON_SWAP_ELEMENTS: SwapElementsMessage,
    ON_WRONG_SWAP_ELEMENTS: SwapElementsMessage,
    CLICK_ACTIVATION: PosXYMessage,

    TRY_ACTIVATE_SPINNING: VoidMessage,
    ACTIVATE_SPINNING: VoidMessage,
    ON_SPINNING_ACTIVATED: SpinningActivationMessage,

    ON_ELEMENT_SELECTED: ItemInfo,
    ON_ELEMENT_UNSELECTED: ItemInfo,

    ON_SET_STEP_HELPER: StepHelperMessage,
    ON_RESET_STEP_HELPER: StepHelperMessage,

    ON_BUSTER_ACTIVATION: VoidMessage,

    SWAPED_BUSTER_WITH_DISKOSPHERE_ACTIVATED: SwapedDiskosphereActivationMessage,

    DISKOSPHERE_ACTIVATED: ActivationMessage,
    SWAPED_DISKOSPHERES_ACTIVATED: SwapedActivationMessage,
    SWAPED_DISKOSPHERE_WITH_BUSTER_ACTIVATED: SwapedDiskosphereActivationMessage,
    SWAPED_DISKOSPHERE_WITH_ELEMENT_ACTIVATED: SwapedActivationMessage,

    ROCKET_ACTIVATED: RocketActivationMessage,
    SWAPED_ROCKETS_ACTIVATED: SwapedActivationMessage,

    HELICOPTER_ACTIVATED: HelicopterActivationMessage,
    SWAPED_HELICOPTERS_ACTIVATED: SwapedHelicoptersActivationMessage,
    SWAPED_HELICOPTER_WITH_ELEMENT_ACTIVATED: SwapedHelicopterWithElementMessage,

    DYNAMITE_ACTIVATED: ActivationMessage,
    SWAPED_DYNAMITES_ACTIVATED: SwapedActivationMessage,

    ON_COMBINED: CombinedMessage,

    ON_MOVED_ELEMENTS: MovedElementsMessage,
    ON_GAME_STEP: GameStepEventBuffer,
    ON_GAME_STEP_ANIMATION_END: VoidMessage,

    TRY_REVERT_STEP: VoidMessage,
    REVERT_STEP: VoidMessage,
    ON_REVERT_STEP: RevertStepMessage,

    ON_ELEMENT_ACTIVATED: ElementActivationMessage,

    UPDATED_BUTTONS: VoidMessage,
    UPDATED_STEP_COUNTER: number,
    UPDATED_TIMER: number,
    UPDATED_TARGET: { id: number, count: number },

    ON_LEVEL_COMPLETED: VoidMessage,
    ON_GAME_OVER: VoidMessage
};