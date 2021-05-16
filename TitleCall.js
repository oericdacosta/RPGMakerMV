/*=============================================================================
 TitleCall.js
----------------------------------------------------------------------------
 (C)2021 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.2.0 2021/05/03 コールSEを複数指定してランダム再生できる機能を追加
 1.1.1 2021/05/03 オプション画面、ロード画面から戻ったときは演奏しないよう修正
 1.1.0 2021/05/03 MZ版を作成
 1.0.0 2021/05/03 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc タイトルコールプラグイン
 * @target MZ
 * @url https://github.com/triacontane/RPGMakerMV/tree/mz_master/TitleCall.js
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @author トリアコンタン
 *
 * @param name
 * @text SEファイル名
 * @desc 演奏するSEのファイル名です。
 * @default
 * @type file
 * @dir audio/se
 *
 * @param volume
 * @text SE音量
 * @desc 演奏するSEの音量です。
 * @default 90
 * @type number
 * @max 100
 *
 * @param pitch
 * @text SEピッチ
 * @desc 演奏するSEのピッチです。
 * @default 100
 * @type number
 * @min 50
 * @max 150
 *
 * @param pan
 * @text SE位相
 * @desc 演奏するSEの位相（定位）です。
 * @default 0
 * @type number
 * @min -100
 * @max 100
 *
 * @param delay
 * @text 遅延(ミリ秒)
 * @desc SE演奏を指定したミリ秒ぶんだけ遅らせます。
 * @default 0
 * @type number
 * @max 99999
 *
 * @param randomList
 * @text ランダムSEファイルリスト
 * @desc 設定しておくとリストの中からランダムで再生されます。
 * @default []
 * @type file[]
 * @dir audio/se
 *
 * @help TitleCall.js
 *
 * タイトル画面を表示したときに指定した効果音を演奏します。
 *　
 * このプラグインにはプラグインコマンドはありません。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(()=> {
    'use strict';
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);

    const _Scene_Title_playTitleMusic = Scene_Title.prototype.playTitleMusic;
    Scene_Title.prototype.playTitleMusic = function() {
        _Scene_Title_playTitleMusic.apply(this, arguments);
        this.playTitleCall();
    };

    Scene_Title.prototype.playTitleCall = function() {
        if (SceneManager.isPreviousScene(Scene_Options) ||
            SceneManager.isPreviousScene(Scene_Load)) {
            return;
        }
        const list = param.randomList;
        if (list && list.length > 0) {
            param.name = list[Math.randomInt(list.length)];
        }
        if (param.delay) {
            setTimeout(AudioManager.playSe.bind(AudioManager, param), param.delay);
        } else {
            AudioManager.playSe(param);
        }
    };
})();