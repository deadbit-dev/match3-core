local ____exports = {}
local flow = require("ludobits.m.flow")
function ____exports.Map()
    local set_completed_levels, input_listener, on_drag, was_drag
    function set_completed_levels()
        for ____, level in ipairs(GameStorage.get("completed_levels")) do
            local url = msg.url(
                nil,
                hash("/level_" .. tostring(level + 1)),
                "sprite"
            )
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
                    if not message.pressed and not message.released then
                        on_drag(message)
                    elseif message.released then
                        if was_drag then
                            was_drag = false
                            break
                        end
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
                    end
                    break
                end
            until true
        end
    end
    function on_drag(action)
        if math.abs(action.dy) == 0 then
            return
        end
        was_drag = true
        local pos = go.get_position("map")
        pos.y = math.max(
            -2800,
            math.min(0, pos.y + action.dy)
        )
        go.set_position(pos, "map")
        GameStorage.set("map_last_pos_y", pos.y)
    end
    was_drag = false
    local function init()
        set_completed_levels()
        local pos = go.get_position("map")
        pos.y = GameStorage.get("map_last_pos_y")
        go.set_position(pos, "map")
        input_listener()
    end
    return init()
end
return ____exports
