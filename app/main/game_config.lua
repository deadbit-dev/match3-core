local ____exports = {}
____exports.IS_DEBUG_MODE = true
____exports.ADS_CONFIG = {
    is_mediation = true,
    id_banners = {},
    id_inters = {},
    id_reward = {},
    banner_on_init = true,
    ads_interval = 4 * 60,
    ads_delay = 30
}
____exports.VK_SHARE_URL = ""
____exports.ID_YANDEX_METRICA = ""
____exports.RATE_FIRST_SHOW = 24 * 60 * 60
____exports.RATE_SECOND_SHOW = 3 * 24 * 60 * 60
____exports.MAIN_BUNDLE_SCENES = {"game"}
____exports.SubstrateId = SubstrateId or ({})
____exports.SubstrateId.OutsideArc = 0
____exports.SubstrateId[____exports.SubstrateId.OutsideArc] = "OutsideArc"
____exports.SubstrateId.OutsideInsideAngle = 1
____exports.SubstrateId[____exports.SubstrateId.OutsideInsideAngle] = "OutsideInsideAngle"
____exports.SubstrateId.OutsideAngle = 2
____exports.SubstrateId[____exports.SubstrateId.OutsideAngle] = "OutsideAngle"
____exports.SubstrateId.LeftRightStrip = 3
____exports.SubstrateId[____exports.SubstrateId.LeftRightStrip] = "LeftRightStrip"
____exports.SubstrateId.LeftStripTopBottomInsideAngle = 4
____exports.SubstrateId[____exports.SubstrateId.LeftStripTopBottomInsideAngle] = "LeftStripTopBottomInsideAngle"
____exports.SubstrateId.LeftStripTopInsideAngle = 5
____exports.SubstrateId[____exports.SubstrateId.LeftStripTopInsideAngle] = "LeftStripTopInsideAngle"
____exports.SubstrateId.LeftStripBottomInsideAngle = 6
____exports.SubstrateId[____exports.SubstrateId.LeftStripBottomInsideAngle] = "LeftStripBottomInsideAngle"
____exports.SubstrateId.LeftStrip = 7
____exports.SubstrateId[____exports.SubstrateId.LeftStrip] = "LeftStrip"
____exports.SubstrateId.TopBottomInsideAngle = 8
____exports.SubstrateId[____exports.SubstrateId.TopBottomInsideAngle] = "TopBottomInsideAngle"
____exports.SubstrateId.InsideAngle = 9
____exports.SubstrateId[____exports.SubstrateId.InsideAngle] = "InsideAngle"
____exports.SubstrateId.Full = 10
____exports.SubstrateId[____exports.SubstrateId.Full] = "Full"
____exports.CellId = CellId or ({})
____exports.CellId.Base = 0
____exports.CellId[____exports.CellId.Base] = "Base"
____exports.CellId.Grass = 1
____exports.CellId[____exports.CellId.Grass] = "Grass"
____exports.CellId.Flowers = 2
____exports.CellId[____exports.CellId.Flowers] = "Flowers"
____exports.CellId.Web = 3
____exports.CellId[____exports.CellId.Web] = "Web"
____exports.CellId.Box = 4
____exports.CellId[____exports.CellId.Box] = "Box"
____exports.CellId.Stone0 = 5
____exports.CellId[____exports.CellId.Stone0] = "Stone0"
____exports.CellId.Stone1 = 6
____exports.CellId[____exports.CellId.Stone1] = "Stone1"
____exports.CellId.Stone2 = 7
____exports.CellId[____exports.CellId.Stone2] = "Stone2"
____exports.ElementId = ElementId or ({})
____exports.ElementId.Dimonde = 0
____exports.ElementId[____exports.ElementId.Dimonde] = "Dimonde"
____exports.ElementId.Gold = 1
____exports.ElementId[____exports.ElementId.Gold] = "Gold"
____exports.ElementId.Topaz = 2
____exports.ElementId[____exports.ElementId.Topaz] = "Topaz"
____exports.ElementId.Ruby = 3
____exports.ElementId[____exports.ElementId.Ruby] = "Ruby"
____exports.ElementId.Emerald = 4
____exports.ElementId[____exports.ElementId.Emerald] = "Emerald"
____exports.ElementId.Cheese = 5
____exports.ElementId[____exports.ElementId.Cheese] = "Cheese"
____exports.ElementId.Cabbage = 6
____exports.ElementId[____exports.ElementId.Cabbage] = "Cabbage"
____exports.ElementId.Acorn = 7
____exports.ElementId[____exports.ElementId.Acorn] = "Acorn"
____exports.ElementId.RareMeat = 8
____exports.ElementId[____exports.ElementId.RareMeat] = "RareMeat"
____exports.ElementId.MediumMeat = 9
____exports.ElementId[____exports.ElementId.MediumMeat] = "MediumMeat"
____exports.ElementId.Chicken = 10
____exports.ElementId[____exports.ElementId.Chicken] = "Chicken"
____exports.ElementId.SunFlower = 11
____exports.ElementId[____exports.ElementId.SunFlower] = "SunFlower"
____exports.ElementId.Salad = 12
____exports.ElementId[____exports.ElementId.Salad] = "Salad"
____exports.ElementId.Hay = 13
____exports.ElementId[____exports.ElementId.Hay] = "Hay"
____exports.ElementId.VerticalRocket = 14
____exports.ElementId[____exports.ElementId.VerticalRocket] = "VerticalRocket"
____exports.ElementId.HorizontalRocket = 15
____exports.ElementId[____exports.ElementId.HorizontalRocket] = "HorizontalRocket"
____exports.ElementId.AxisRocket = 16
____exports.ElementId[____exports.ElementId.AxisRocket] = "AxisRocket"
____exports.ElementId.Helicopter = 17
____exports.ElementId[____exports.ElementId.Helicopter] = "Helicopter"
____exports.ElementId.Dynamite = 18
____exports.ElementId[____exports.ElementId.Dynamite] = "Dynamite"
____exports.ElementId.Diskosphere = 19
____exports.ElementId[____exports.ElementId.Diskosphere] = "Diskosphere"
local ____go_EASING_LINEAR_1 = go.EASING_LINEAR
local ____go_EASING_INCUBIC_2 = go.EASING_INCUBIC
local ____go_EASING_INOUTBACK_3 = go.EASING_INOUTBACK
local ____temp_4 = sys.get_sys_info().system_name == "HTML5" and html5.run("new URL(location).searchParams.get('color')||'#c29754'") or "#c29754"
local ____temp_0
if sys.get_sys_info().system_name == "HTML5" then
    ____temp_0 = html5.run("new URL(location).searchParams.get('move')==null") == "true"
else
    ____temp_0 = true
end
____exports._GAME_CONFIG = {
    min_swipe_distance = 32,
    swap_element_easing = ____go_EASING_LINEAR_1,
    swap_element_time = 0.25,
    squash_element_easing = ____go_EASING_INCUBIC_2,
    squash_element_time = 0.3,
    helicopter_fly_duration = 0.75,
    damaged_element_easing = ____go_EASING_INOUTBACK_3,
    damaged_element_time = 0.3,
    damaged_element_delay = 0.1,
    damaged_element_scale = 0.3,
    base_cell_color = ____temp_4,
    movement_to_point = ____temp_0,
    duration_of_movement_bettween_cells = sys.get_sys_info().system_name == "HTML5" and tonumber(html5.run("new URL(location).searchParams.get('time')||0.07")) or 0.07,
    complex_move = true,
    spawn_element_easing = go.EASING_INCUBIC,
    spawn_element_time = 0.5,
    buster_delay = 0.5,
    default_substrate_z_index = -2,
    default_cell_z_index = -1,
    default_element_z_index = 0,
    default_top_layer_cell_z_index = 2,
    substrate_database = {
        [____exports.SubstrateId.OutsideArc] = "outside_arc",
        [____exports.SubstrateId.OutsideInsideAngle] = "outside_inside_angle",
        [____exports.SubstrateId.OutsideAngle] = "outside_angle",
        [____exports.SubstrateId.LeftRightStrip] = "left_right_strip",
        [____exports.SubstrateId.LeftStripTopBottomInsideAngle] = "left_strip_top_inside_angle",
        [____exports.SubstrateId.LeftStripTopInsideAngle] = "left_strip_top_inside_angle",
        [____exports.SubstrateId.LeftStripBottomInsideAngle] = "left_strip_bottom_inside_angle",
        [____exports.SubstrateId.LeftStrip] = "left_strip",
        [____exports.SubstrateId.TopBottomInsideAngle] = "top_bottom_inside_angle",
        [____exports.SubstrateId.InsideAngle] = "inside_angle",
        [____exports.SubstrateId.Full] = "full"
    },
    cell_view = {
        [____exports.CellId.Base] = "cell_white",
        [____exports.CellId.Grass] = "cell_grass",
        [____exports.CellId.Flowers] = "cell_flowers",
        [____exports.CellId.Web] = "cell_web",
        [____exports.CellId.Box] = "cell_box",
        [____exports.CellId.Stone0] = "cell_stone_0",
        [____exports.CellId.Stone1] = "cell_stone_1",
        [____exports.CellId.Stone2] = "cell_stone_2"
    },
    activation_cells = {____exports.CellId.Grass, ____exports.CellId.Flowers},
    near_activated_cells = {
        ____exports.CellId.Box,
        ____exports.CellId.Stone0,
        ____exports.CellId.Stone1,
        ____exports.CellId.Stone2,
        ____exports.CellId.Web
    },
    disabled_cells = {____exports.CellId.Box, ____exports.CellId.Stone0, ____exports.CellId.Stone1, ____exports.CellId.Stone2},
    not_moved_cells = {
        ____exports.CellId.Box,
        ____exports.CellId.Stone0,
        ____exports.CellId.Stone1,
        ____exports.CellId.Stone2,
        ____exports.CellId.Web
    },
    top_layer_cells = {
        ____exports.CellId.Box,
        ____exports.CellId.Stone0,
        ____exports.CellId.Stone1,
        ____exports.CellId.Stone2,
        ____exports.CellId.Web
    },
    element_view = {
        [____exports.ElementId.Dimonde] = "element_diamond",
        [____exports.ElementId.Gold] = "element_gold",
        [____exports.ElementId.Topaz] = "element_topaz",
        [____exports.ElementId.Ruby] = "element_ruby",
        [____exports.ElementId.Emerald] = "element_emerald",
        [____exports.ElementId.VerticalRocket] = "vertical_rocket_buster",
        [____exports.ElementId.HorizontalRocket] = "horizontal_rocket_buster",
        [____exports.ElementId.AxisRocket] = "axis_rocket_buster",
        [____exports.ElementId.Helicopter] = "helicopter_buster",
        [____exports.ElementId.Dynamite] = "dynamite_buster",
        [____exports.ElementId.Diskosphere] = "diskosphere_buster",
        [____exports.ElementId.Cheese] = "element_cheese",
        [____exports.ElementId.Cabbage] = "element_cabbage",
        [____exports.ElementId.Acorn] = "element_acorn",
        [____exports.ElementId.RareMeat] = "element_rare_meat",
        [____exports.ElementId.MediumMeat] = "element_medium_meat",
        [____exports.ElementId.Chicken] = "element_chicken",
        [____exports.ElementId.SunFlower] = "element_sunflower",
        [____exports.ElementId.Salad] = "element_salad",
        [____exports.ElementId.Hay] = "element_hay"
    },
    element_colors = {
        [____exports.ElementId.Dimonde] = "#009de2",
        [____exports.ElementId.Gold] = "#e94165",
        [____exports.ElementId.Topaz] = "#f5d74d",
        [____exports.ElementId.Ruby] = "#9a4ee5",
        [____exports.ElementId.Emerald] = "#20af1b",
        [____exports.ElementId.VerticalRocket] = "#ffffff",
        [____exports.ElementId.HorizontalRocket] = "#ffffff",
        [____exports.ElementId.AxisRocket] = "#ffffff",
        [____exports.ElementId.Helicopter] = "#ffffff",
        [____exports.ElementId.Dynamite] = "#ffffff",
        [____exports.ElementId.Diskosphere] = "#ffffff",
        [____exports.ElementId.Cheese] = "#ffffff",
        [____exports.ElementId.Cabbage] = "#ffffff",
        [____exports.ElementId.Acorn] = "#ffffff",
        [____exports.ElementId.RareMeat] = "#ffffff",
        [____exports.ElementId.MediumMeat] = "#ffffff",
        [____exports.ElementId.Chicken] = "#ffffff",
        [____exports.ElementId.SunFlower] = "#ffffff",
        [____exports.ElementId.Salad] = "#ffffff",
        [____exports.ElementId.Hay] = "#ffffff"
    },
    base_elements = {
        ____exports.ElementId.Dimonde,
        ____exports.ElementId.Gold,
        ____exports.ElementId.Topaz,
        ____exports.ElementId.Ruby,
        ____exports.ElementId.Emerald
    },
    buster_elements = {
        ____exports.ElementId.VerticalRocket,
        ____exports.ElementId.HorizontalRocket,
        ____exports.ElementId.AxisRocket,
        ____exports.ElementId.Dynamite,
        ____exports.ElementId.Helicopter,
        ____exports.ElementId.Diskosphere
    },
    levels = {}
}
____exports._STORAGE_CONFIG = {
    current_level = 0,
    hammer_counts = 3,
    spinning_counts = 3,
    horizontal_rocket_counts = 3,
    vertical_rocket_counts = 3
}
return ____exports
