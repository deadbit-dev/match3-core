/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-empty-function */

import * as druid from 'druid.druid';
import * as default_style from "druid.styles.default.style";
import { BannerPos } from '../modules/Ads';
import { register_manager } from '../modules/Manager';
import { load_levels_config } from '../game/level';
import { Product, Purchase } from '../modules/HtmlBridgeTypes';
import { add_coins, delete_mounts, remove_ad } from '../game/utils';


interface props {
}


export function init(this: props) {
    msg.post('.', 'acquire_input_focus');
    register_manager();

    Manager.init(() => {
        EventBus.on('ON_SCENE_LOADED', (message) => {
            const name = message.name;
            // window.set_dim_mode(name.includes('game') ? window.DIMMING_OFF : window.DIMMING_ON);
            if (message.name == 'game')
                Ads.show_banner(BannerPos.POS_BOTTOM_CENTER);
            else
                Ads.hide_banner();
        });

        // если это одноклассники
        if (System.platform == 'HTML5' && HtmlBridge.get_platform() == 'ok')
            HtmlBridge.start_resize_monitor();

        Scene.load_resource('main', 'shared_gui');

        if (System.platform == 'HTML5') {
            let is_debug = html5.run(`new URL(location).searchParams.get('debug')||'0'`) == '1';
            let is_clear = html5.run(`new URL(location).searchParams.has('delete_mounts')`) == '1';

            if (Ads.get_social_platform() == 'yandex') {
                const payload = HtmlBridge.get_payload();
                if (payload.indexOf('delete_mounts') > -1)
                    is_clear = true;
                if (payload.indexOf('debug') > -1)
                    is_debug = true;
            }
            if (is_clear) {
                log('delete mounts');
                delete_mounts();
            }
            if (is_debug)
                GAME_CONFIG.debug_levels = true;


            // yandex purchases
            // получаем список возможных покупок(иды, цены)
            if (HtmlBridge.get_platform() == 'yandex') {
                HtmlBridge.init_purchases((status, data) => {
                    if (!status) Log.error('Yandex init_purchases error');
                    else {
                        const products: Product[] = data as Product[];
                        GAME_CONFIG.products = products;
                        GAME_CONFIG.has_payments = true;

                        log('Yandex init_purchases success');

                        // необработанные покупки, такое бывает когда юзер покупает например в яндексе
                        // и тут же например обновит страницу, и нужно их обработать и начислить
                        HtmlBridge.get_purchases((status, data) => {
                            if (!status)
                                return;

                            const purchases: Purchase[] = data as Purchase[];
                            log('Yandex get_purchases success', purchases);

                            for (let i = 0; i < purchases.length; i++) {
                                const purchase = purchases[i];
                                const id_product = purchase.productID;
                                log('process buyed:', purchase);
                                if (id_product == 'maney150') {
                                    add_coins(150);
                                    GameStorage.set('was_purchased', true);
                                    HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
                                }
                                else if (id_product == 'maney300') {
                                    add_coins(300);
                                    GameStorage.set('was_purchased', true);
                                    HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
                                }
                                else if (id_product == 'maney800') {
                                    add_coins(800);
                                    GameStorage.set('was_purchased', true);
                                    HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
                                }
                                else if (id_product == 'noads1') {
                                    remove_ad(24 * 60 * 60); // 1 day
                                    HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
                                }
                                else if (id_product == 'noads7') {
                                    remove_ad(24 * 60 * 60 * 7); // 7 day's
                                    HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
                                }
                                else if (id_product == 'noads30') {
                                    remove_ad(24 * 60 * 60 * 30); // 30 day's
                                    HtmlBridge.consume_purchase(purchase.purchaseToken, () => { });
                                }
                            }
                        });

                        EventBus.send('PURCHASE_INITIALIZED');
                    }
                });
            }
        }

        default_style.scroll.WHEEL_SCROLL_SPEED = 10;
        default_style.button.DISABLED_COLOR = vmath.vector4(1);
        druid.set_default_style(default_style);
        Sound.attach_druid_click('btn');
        Camera.set_go_prjection(-1, 1, -3, 3);

        const is_shown = GameStorage.get('move_showed');
        if (System.platform == 'HTML5')
            HtmlBridge.game_ready();
        Metrica.report('data', { 'game_ready': { is_first: !is_shown } });
        timer.delay(0, false, () => {
            load_levels_config();
            if (System.platform == 'HTML5' && HtmlBridge.get_platform() == 'yandex') {
                HtmlBridge.get_flags({ defaultFlags: { movie_btn: '0', is_movie: '1' } }, (status, data) => {
                    if (status) {
                        if (data['movie_btn'] != null)
                            GAME_CONFIG.movie_btn = data['movie_btn'] == '1';
                        if (data['is_movie'] != null)
                            GAME_CONFIG.is_movie = data['is_movie'] == '1';
                        log('Yandex get_flags success', data, 'set:' + GAME_CONFIG.movie_btn + '/' + GAME_CONFIG.is_movie);
                    }
                    Scene.load(is_shown ? 'map' : (GAME_CONFIG.is_movie ? 'movie' : 'game'));
                    if (!is_shown && !GAME_CONFIG.is_movie)
                        Scene.try_load_async('map');
                });
            }
            else
                Scene.load(is_shown ? 'map' : 'movie');
            Scene.set_bg('#88dfeb');
        });


    }, true);
}

export function on_message(this: props, message_id: hash, _message: any, sender: hash): void {
    Manager.on_message_main(this, message_id, _message, sender);
}