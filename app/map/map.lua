local ____exports = {}
local flow = require("ludobits.m.flow")
function ____exports.Map()
    local input_listener, on_click, load_level
    function input_listener()
        while true do
            local message_id, _message, sender = flow.until_any_message()
            repeat
                local ____switch6 = message_id
                local ____cond6 = ____switch6 == ID_MESSAGES.MSG_TOUCH
                if ____cond6 then
                    on_click()
                    break
                end
            until true
        end
    end
    function on_click()
        load_level()
    end
    function load_level()
        Scene.load("game", true)
    end
    local function init()
        input_listener()
    end
    return init()
end
return ____exports
