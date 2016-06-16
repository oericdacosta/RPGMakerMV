//=============================================================================
// GeneralTrigger.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2016/06/14 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc トリガープラグイン
 * @author トリアコンタン
 *
 * @param ニューゲーム
 * @desc ニューゲーム時にONになるスイッチ番号
 * @default 0
 *
 * @param コンティニュー
 * @desc コンティニュー時にONになるスイッチ番号
 * @default 0
 *
 * @param オプション画面
 * @desc オプション画面を出た時にONになるスイッチ番号。ただしタイトル画面の場合は無効です。
 * @default 0
 *
 * @param メニュー画面
 * @desc メニュー画面を出た時にONになるスイッチ番号
 * @default 0
 *
 * @param セーブ画面
 * @desc セーブ画面を出た時にONになるスイッチ番号
 * @default 0
 *
 * @param 戦闘画面
 * @desc 戦闘画面を出た時にONになるスイッチ番号
 * @default 0
 *
 * @param ショップ画面
 * @desc ショップ画面を出た時にONになるスイッチ番号
 * @default 0
 *
 * @param 別マップ移動
 * @desc 別マップ移動時にONになるスイッチ番号
 * @default 0
 *
 * @param アイテム増減
 * @desc アイテム増減時にONになるスイッチ番号
 * @default 0
 *
 * @param 武器増減
 * @desc 武器増減時にONになるスイッチ番号
 * @default 0
 *
 * @param 防具増減
 * @desc 防具増減時にONになるスイッチ番号
 * @default 0
 *
 * @param アイテムID
 * @desc アイテム、武器、防具入手時に格納されるアイテムIDを格納する変数番号
 * @default 0
 *
 * @param アイテム個数
 * @desc アイテム、武器、防具入手時に格納されるアイテム増減数を格納する変数番号
 * @default 0
 *
 * @param メンバー加入
 * @desc メンバー加入時にONになるスイッチ番号
 * @default 0
 *
 * @param メンバー離脱
 * @desc メンバー離脱時にONになるスイッチ番号
 * @default 0
 *
 * @param アクターID
 * @desc 加入・離脱したアクターIDを格納する変数番号
 * @default 0
 *
 * @help ゲーム中、様々な局面でスイッチをONにします。
 * 主に並列処理、自動実行のコモンイベントと組み合わせて使用します。
 * スイッチをONにできるタイミングは各パラメータの説明を参照してください。
 * 
 * また、トリガーの種類によっては、スイッチがONになると同時に変数に
 * 所定の値が代入されます。
 * 
 * 例えば、アイテム入手のトリガーがONになったときに指定された変数に
 * アイテムIDが格納されます。
 * 専用の入手インフォメーション等が作成できます。
 *
 * このプラグインにはプラグインコマンドはありません。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function() {
    'use strict';
    var pluginName = 'GeneralTrigger';

    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramNewGame      = getParamNumber(['NewGame', 'ニューゲーム']);
    var paramContinue     = getParamNumber(['Continue', 'コンティニュー']);
    var paramOptions      = getParamNumber(['Options', 'オプション画面']);
    var paramSave         = getParamNumber(['Save', 'セーブ画面']);
    var paramMenu         = getParamNumber(['Menu', 'メニュー画面']);
    var paramBattle       = getParamNumber(['Battle', '戦闘画面']);
    var paramShop         = getParamNumber(['Shop', 'ショップ画面']);
    var paramMoveMap      = getParamNumber(['MoveMap', '別マップ移動']);
    var paramGainItem     = getParamNumber(['GainItem', 'アイテム増減']);
    var paramGainWeapon   = getParamNumber(['GainWeapon', '武器増減']);
    var paramGainArmor    = getParamNumber(['GainArmor', '防具増減']);
    var paramItemId       = getParamNumber(['ItemId', 'アイテムID']);
    var paramItemAmount   = getParamNumber(['ItemAmount', 'アイテム個数']);
    var paramAddMember    = getParamNumber(['AddMember', 'メンバー加入']);
    var paramRemoveMember = getParamNumber(['RemoveMember', 'メンバー離脱']);
    var paramActorId      = getParamNumber(['ActorId', 'アクターID']);

    //=============================================================================
    // SceneManager
    //  トリガースイッチを設定処理を追加定義します。
    //=============================================================================
    var _SceneManager_pop = SceneManager.pop;
    SceneManager.pop      = function() {
        if (this._stack.length > 0) {
            this._scene.setPopTrigger();
        }
        _SceneManager_pop.apply(this, arguments);
    };

    SceneManager.setTriggerSwitch = function(switchNumber) {
        if ($gameSwitches && switchNumber > 0) {
            $gameSwitches.setValue(switchNumber, true);
        }
    };

    SceneManager.setTriggerVariable = function(variableNumber, value) {
        if ($gameVariables && variableNumber > 0) {
            $gameVariables.setValue(variableNumber, value);
        }
    };

    //=============================================================================
    // DataManager
    //  ニューゲーム、コンティニューのトリガースイッチを設定します。
    //=============================================================================
    var _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame      = function() {
        _DataManager_setupNewGame.apply(this, arguments);
        SceneManager.setTriggerSwitch(paramNewGame);
    };

    var _DataManager_loadGame = DataManager.loadGame;
    DataManager.loadGame      = function(saveFileId) {
        _DataManager_loadGame.apply(this, arguments);
        SceneManager.setTriggerSwitch(paramContinue);
    };

    //=============================================================================
    // Game_Player
    //  場所移動時にトリガースイッチを設定します。
    //=============================================================================
    var _Game_Player_reserveTransfer      = Game_Player.prototype.reserveTransfer;
    Game_Player.prototype.reserveTransfer = function(mapId, x, y, d, fadeType) {
        _Game_Player_reserveTransfer.apply(this, arguments);
        SceneManager.setTriggerSwitch(paramMoveMap);
    };

    var _Game_Party_addActor      = Game_Party.prototype.addActor;
    Game_Party.prototype.addActor = function(actorId) {
        var length = this._actors.length;
        _Game_Party_addActor.apply(this, arguments);
        if (length !== this._actors.length) {
            SceneManager.setTriggerSwitch(paramAddMember);
            SceneManager.setTriggerVariable(paramActorId, actorId);
        }
    };

    var _Game_Party_removeActor      = Game_Party.prototype.removeActor;
    Game_Party.prototype.removeActor = function(actorId) {
        var length = this._actors.length;
        _Game_Party_removeActor.apply(this, arguments);
        if (length !== this._actors.length) {
            SceneManager.setTriggerSwitch(paramRemoveMember);
            SceneManager.setTriggerVariable(paramActorId, actorId);
        }
    };

    var _Game_Party_gainItem      = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        _Game_Party_gainItem.apply(this, arguments);
        switch (this.itemContainer(item)) {
            case this._items:
                SceneManager.setTriggerSwitch(paramGainItem);
                break;
            case this._weapons:
                SceneManager.setTriggerSwitch(paramGainWeapon);
                break;
            case this._armors:
                SceneManager.setTriggerSwitch(paramGainArmor);
                break;
        }
        SceneManager.setTriggerVariable(paramItemId, item.id);
        SceneManager.setTriggerVariable(paramItemAmount, amount);
    };

    //=============================================================================
    // Scene_Base
    //  各クラス用のトリガースイッチを設定します。
    //=============================================================================
    Scene_Base.prototype.setPopTrigger = function() {
    };

    Scene_Options.prototype.setPopTrigger = function() {
        SceneManager.setTriggerSwitch(paramOptions);
    };

    Scene_Menu.prototype.setPopTrigger = function() {
        SceneManager.setTriggerSwitch(paramMenu);
    };

    Scene_Save.prototype.setPopTrigger = function() {
        SceneManager.setTriggerSwitch(paramSave);
    };

    Scene_Shop.prototype.setPopTrigger = function() {
        SceneManager.setTriggerSwitch(paramShop);
    };

    Scene_Battle.prototype.setPopTrigger = function() {
        SceneManager.setTriggerSwitch(paramBattle);
    };
})();

