//=============================================================================
// AutoBattle.js
// ----------------------------------------------------------------------------
// (C) 2016 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2022/09/21 MZ向けに修正
//                  戦闘中一切の操作が不要になる放置バトルを可能にするスイッチを追加
// 1.0.1 2018/12/30 コマンド位置の指定のパラメータ設定が一部正常に機能していなかった問題を修正
// 1.0.0 2016/09/29 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 自動戦闘プラグイン
 * @target MZ
 * @url https://github.com/triacontane/RPGMakerMV/tree/mz_master/AutoBattle.js
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @author トリアコンタン
 *
 * @param PartyCommandName
 * @text パーティコマンド名称
 * @desc パーティコマンドに追加される一括オートコマンドの名称です。未入力にすると追加されません。
 * @default オート
 *
 * @param PartyCommandIndex
 * @text パーティコマンド位置
 * @desc パーティコマンドでオートコマンドが追加される位置です。-1の場合、末尾に追加されます。
 * @default -1
 *
 * @param ActorCommandName
 * @text アクターコマンド名称
 * @desc アクターコマンドに追加される個別オートコマンドの名称です。未入力にすると追加されません。
 * @default オート
 *
 * @param ActorCommandIndex
 * @text アクターコマンド位置
 * @desc アクターコマンドでオートコマンドが追加される位置です。-1の場合、末尾に追加されます。
 * @default -1
 *
 * @param AutoSwitch
 * @text オートスイッチ
 * @desc 指定したスイッチがONのとき常に全員がオートバトルになります。
 * @default 0
 * @type switch
 *
 * @help アクターの行動を自動選択するオートバトルを実装します。
 *
 * １．パーティコマンドからオートを選択すると、アクターコマンドの選択をスキップして全員
 * オートバトルになります。
 *
 * ２．アクターコマンドからオートを選択すると、対象アクターのみオートバトルになります。
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

    //=============================================================================
    // BattleManager
    //  オートバトルの実装を追加定義します。
    //=============================================================================
    BattleManager.processActorAuto = function() {
        this.actor().makeAutoBattleActions();
    };

    BattleManager.processPartyAuto = function() {
        $gameParty.members().forEach(function(member) {
            member.makeAutoBattleActions();
        });
        this.startTurn();
    };

    //=============================================================================
    // Scene_Battle
    //  オートバトルコマンドを選択した場合の処理を追加定義します。
    //=============================================================================
    const _Scene_Battle_createPartyCommandWindow      = Scene_Battle.prototype.createPartyCommandWindow;
    Scene_Battle.prototype.createPartyCommandWindow = function() {
        _Scene_Battle_createPartyCommandWindow.apply(this, arguments);
        if (param.PartyCommandName) {
            this._partyCommandWindow.setHandler('auto', this.commandPartyAutoBattle.bind(this));
        }
    };

    const _Scene_Battle_createActorCommandWindow      = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.apply(this, arguments);
        if (param.ActorCommandName) {
            this._actorCommandWindow.setHandler('auto', this.commandActorAutoBattle.bind(this));
        }
    };

    Scene_Battle.prototype.commandPartyAutoBattle = function() {
        BattleManager.processPartyAuto();
        this.changeInputWindow();
    };

    Scene_Battle.prototype.commandActorAutoBattle = function() {
        BattleManager.processActorAuto();
        this.selectNextCommand();
    };

    const _Scene_Battle_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection;
    Scene_Battle.prototype.startPartyCommandSelection = function() {
        _Scene_Battle_startPartyCommandSelection.apply(this, arguments);
        if (BattleManager.isValidAutoSwitch()) {
            this.commandPartyAutoBattle();
            this.endCommandSelection();
        }
    };

    const _BattleManager_displayStartMessages = BattleManager.displayStartMessages;
    BattleManager.displayStartMessages = function() {
        _BattleManager_displayStartMessages.apply(this, arguments);
        if (this.isValidAutoSwitch()) {
            $gameMessage.add('\\|\\^');
        }
    };

    BattleManager.isValidAutoSwitch = function() {
        return $gameSwitches.value(param.AutoSwitch);
    };

    //=============================================================================
    // Window_PartyCommand
    //  オートバトルコマンドを追加します。
    //=============================================================================
    const _Window_PartyCommand_makeCommandList      = Window_PartyCommand.prototype.makeCommandList;
    Window_PartyCommand.prototype.makeCommandList = function() {
        _Window_PartyCommand_makeCommandList.apply(this, arguments);
        if (param.PartyCommandName) {
            this.addAutoCommand();
        }
    };

    Window_PartyCommand.prototype.addAutoCommand = function() {
        this.addCommand(param.PartyCommandName, 'auto');
        if (this._list[param.PartyCommandIndex]) {
            const command = this._list.pop();
            this._list.splice(param.PartyCommandIndex, 0, command);
        }
    };

    //=============================================================================
    // Window_ActorCommand
    //  オートバトルコマンドを追加します。
    //=============================================================================
    const _Window_ActorCommand_makeCommandList      = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.apply(this, arguments);
        if (this._actor && param.ActorCommandName) {
            this.addAutoCommand();
        }
    };

    Window_ActorCommand.prototype.addAutoCommand = function() {
        this.addCommand(param.ActorCommandName, 'auto');
        if (this._list[param.ActorCommandIndex]) {
            const command = this._list.pop();
            this._list.splice(param.ActorCommandIndex, 0, command);
        }
    };
})();

