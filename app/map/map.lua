local ____exports = {}
local flow = require("ludobits.m.flow")
function ____exports.Map()
    local set_completed_levels, input_listener, on_drag
    function set_completed_levels()
        for ____, level in ipairs(GameStorage.get("completed_levels")) do
            local url = msg.url(
                nil,
                hash("/level_" .. tostring(level + 1)),
                "sprite"
            )
            print(url)
            sprite.play_flipbook(url, "button_level_green")
        end
    end
    function input_listener()
        while true do
            local message_id, message, sender = flow.until_any_message()
            repeat
                local ____switch9 = message_id
                local ____cond9 = ____switch9 == ID_MESSAGES.MSG_TOUCH
                if ____cond9 then
                    do
                        local i = 1
                        while i <= #GAME_CONFIG.levels do
                            msg.post(
                                msg.url(
                                    nil,
                                    hash("/level_" .. tostring(i)),
                                    "level"
                                ),
                                message_id,
                                message
                            )
                            i = i + 1
                        end
                    end
                    if not message.pressed and not message.released then
                        on_drag(message)
                    end
                    break
                end
            until true
        end
    end
    function on_drag(action)
        local pos = go.get_world_position("map")
        pos.y = math.max(
            -2800,
            math.min(0, pos.y + action.dy)
        )
        go.set_position(pos, "map")
    end
    local function init()
        set_completed_levels()
        input_listener()
    end
    return init()
end
return ____exports
