/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { MessageId, Messages } from "./modules_const";

/*
    шина сообщений
*/

declare global {
    const EventBus: ReturnType<typeof EventBusModule>;
}

export function register_event_bus() {
    (_G as any).EventBus = EventBusModule();
}

type FncOnCallback<T> = (data?: T) => void;

interface ListenerInfo {
    url: hash;
    handler: FncOnCallback<any>;
    once: boolean;
}

function EventBusModule() {
    const bus_log = Log.get_with_prefix('Bus');
    const listeners: { [id_message: string]: { [url: string]: ListenerInfo } } = {};
    const send_messages: { [k: number]: { time: number, data: any } } = {};
    let id_counter_message_bus = 0;

    function ensure_hash(string_or_hash: string | hash) {
        return type(string_or_hash) == "string" ? hash(string_or_hash as string) : string_or_hash as hash;
    }

    function url_to_key(url: any) {
        return hash_to_hex(url.socket) + hash_to_hex(url.path) + hash_to_hex(url.fragment || hash(""));
    }

    function update_cache() {
        for (const k in send_messages) {
            const message = send_messages[k];
            if (message.time + 2 < System.now()) {
                delete send_messages[k];
            }
        }
    }

    function _on_message(_this: any, message_id: hash, _message: any, sender: hash) {
        const list = listeners[message_id as string];
        if (!list)
            return;
        const url_key = url_to_key(msg.url());
        for (const k in list) {
            if (k == url_key) {
                const listener = list[k];
                const message = send_messages[_message.id_counter_message_bus];
                if (listener.once)
                    delete list[k];
                listener.handler(message != null ? message.data : null);
                break;
            }
        }
        update_cache();
    }


    function _on<T extends MessageId>(message_id: T, callback: FncOnCallback<Messages[T]>, once: boolean) {
        const url = msg.url();
        const url_key = url_to_key(url);
        const message_key = ensure_hash(message_id) as string;
        if (!listeners[message_key])
            listeners[message_key] = {};
        if (listeners[message_key][url_key] != undefined)
            bus_log.warn('Слушатель уже зарегистрирован, переопределяем:', message_id, url);
        listeners[message_key][url_key] = { url, handler: callback, once };
        //bus_log.log('Слушатель зарегистрирован:', message_id, url,);
    }

    function on<T extends MessageId>(message_id: T, callback: FncOnCallback<Messages[T]>) {
        _on(message_id, callback, false);
    }

    function once<T extends MessageId>(message_id: T, callback: FncOnCallback<Messages[T]>) {
        _on(message_id, callback, true);
    }

    function _off<T extends MessageId>(message_id: T, all_listeners = false) {
        const url = msg.url();
        const url_key = url_to_key(url);
        const message_key = ensure_hash(message_id) as string;
        if (!listeners[message_key])
            return;
        // удаляем все слушатели с данным сообщением
        if (all_listeners) {
            delete listeners[message_key];
        }
        // удаляем слушатель для этого url(скрипта), который вызвал этот метод
        else {
            const list = listeners[message_key];
            for (const k in list) {
                if (k == url_key)
                    delete list[k];
            }
        }
    }

    function off<T extends MessageId>(message_id: T) {
        _off(message_id, false);
    }

    function off_all_id_message<T extends MessageId>(message_id: T) {
        _off(message_id, true);
    }

    function off_all_current_script() {
        const url = msg.url();
        const url_key = url_to_key(url);

        // удаляем все слушатели для этого url(скрипта), который вызвал этот метод
        for (const k in listeners) {
            const list = listeners[k];
            for (const k in list) {
                if (k == url_key)
                    delete list[k];
            }
        }
    }

    function send<T extends MessageId>(message_id: T, message_data?: Messages[T]) {
        const url = msg.url();
        const url_key = url_to_key(url);
        const message_key = ensure_hash(message_id) as string;
        if (!listeners[message_key])
            return bus_log.warn('Ни один слушатель не зарегистрирован:', message_id, url);

        const list = listeners[message_key];
        for (const k in list) {
            const listener = list[k];
            if (k == url_key) {
                if (listener.once)
                    delete list[k];
                listener.handler(message_data);
            }
            else {
                send_messages[id_counter_message_bus] = { time: System.now(), data: message_data };
                msg.post(listener.url, message_id, { id_counter_message_bus });
                id_counter_message_bus++;
            }
        }
    }

    return { _on_message, on, once, off, off_all_id_message, off_all_current_script, send };


}