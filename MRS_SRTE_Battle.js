//=============================================================================
// Mythic Realms Studios - Event Breeding
// MRS_SRTE_Battle.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_SRTE_Battle = true;

var Mythic = Mythic || {};
Mythic.BattleCore = Mythic.BattleCore || {};
Mythic.BattleCore.version = '1.0.0';

Mythic.Core = Mythic.Core || {};
Mythic.Param = Mythic.Param || {};
Mythic.Command = Mythic.Command || {};
Mythic.Utils = Mythic.Utils || {};

//=============================================================================
/*: 
* @plugindesc This plugin overrides the games Scene_Battle and BattleManager classes to create a combat experience directly inspired by
* Super Robot Taisen Exceed
* 
* @author Richard Guilliams
*
* @help 
* MRS plugins use a very specific tag format for processing tags and using them to incorporate important parameters into the game.
* because of this, tags use a special syntax.
* 
* 
* Version 1.0.0:
* - Finished plugin!
*/
//=============================================================================

function actorSprite(){
    return SceneManager._scene.children[0]._actorSprites[0];
}

//=============================================================================
// Plugin Commands
//=============================================================================

Mythic.Command.MRS_SRTE_Battles = function(args){
    let troop = args[0].replace('-', ' ');
    let canLose = Mythic.Utils.stringToBoolean(args[1]);
    let canEscape = Mythic.Utils.stringToBoolean(args[2]);
    Mythic.Battle.createSRTEBattle(troop, canLose, canEscape);
}

//=============================================================================
// Scene SRTE Battle
//=============================================================================

function Scene_SRTE_Battle(){
    this.initialize.apply(this, arguments);
}

Scene_SRTE_Battle.prototype = Object.create(Scene_Battle.prototype);
Scene_SRTE_Battle.prototype.constructor = Scene_SRTE_Battle;

Scene_SRTE_Battle.prototype.initialize = function(){
    Scene_Battle.prototype.initialize.call(this, arguments);
}

Scene_SRTE_Battle.prototype.commandFight = function() {
    this.selectNextCommand();
};

Scene_SRTE_Battle.prototype.changeInputWindow = function() {
    if (BattleManager.isInputting()) {
        if (BattleManager.actor()) {
            this._actor = this._subject;
            this.startActorCommandSelection();
        } 
        else {
            this.startPartyCommandSelection();
        }
    } else {
        this.endCommandSelection();
    }
};

Scene_SRTE_Battle.prototype.onSelectAction = function() {
    var action = BattleManager.inputtingAction();
    this._skillWindow.hide();
    this._itemWindow.hide();
    if (!action.needsSelection()) {
        this.selectNextCommand();
    } else if (action.isForOpponent()) {
        this.selectEnemySelection();
    } else {
        this.selectActorSelection();
    }
};

// Scene_SRTE_Battle.prototype.createDisplayObjects = function(){
//     this.createSpriteset();
//     this.createWindowLayer();
//     this.createAllWindows();
//     SRTE_BattleManager.setLogWindow(this._logWindow);
//     SRTE_BattleManager.setStatusWindow(this._statusWindow);
//     SRTE_BattleManager.setSpriteset(this._spriteset);
//     this._logWindow.setSpriteset(this._spriteset);
// }

//=============================================================================
// Battle Core
//=============================================================================

Mythic.Battle = Mythic.Battle || {};

Mythic.Battle.buildParameters = function(...args){
    let params = [];
    args.forEach( arg => params.push(arg));
    return params;
}

Mythic.Battle.createSRTEBattle = function(troopName, canEscape, canLose){
    BattleManager.setup(Mythic.Core.DataTroopsMap.get(troopName),  canEscape, canLose);
    SceneManager.push(Scene_SRTE_Battle);
};

Mythic.Battle.getAllActorSprites = function(){
    return SceneManager._scene.children[0]._actorSprites;
};

Mythic.Battle.getActorSprite = function(index){
    return SceneManager._scene.children[0]._actorSprites[index];
};

Mythic.Battle.getActorSpriteX = function(index){
    return SceneManager._scene.children[0]._actorSprites[index]._homeX;
};

Mythic.Battle.getActorSpriteY = function(index){
    return SceneManager._scene.children[0]._actorSprites[index]._homeY;
};

Mythic.Battle.getAllEnemySprites = function(){
    return SceneManager._scene.children[0]._enemySprites;
};

Mythic.Battle.getEnemySprite = function(index){
    return SceneManager._scene.children[0]._enemySprites[index];
};

Mythic.Battle.moveActorShadow = function(index, x, y){
    return SceneManager._scene.children[0]._enemySprites[index].children[0].move(x, y);
};



//=============================================================================
// Game_Actor
//=============================================================================

// Game_Actor.prototype.create = function 

//=============================================================================
// SRTE Battle Manager
//=============================================================================

Mythic.Battle.aliasBattleManagerSetup = BattleManager.setup;
BattleManager.setup = function(troopId, canEscape, canLose) {
    Mythic.Battle.aliasBattleManagerSetup.call(this, troopId, canEscape, canLose);
    AttackManager.initialize();
    this._currentTurnIndex = 0;
    this._actionPhase = 'undecided';
    this.createSRTETurnOrder();
};

BattleManager.updateActionPhase = function(){
    switch(this._actionPhase){
        case 'attack':
            this.updateAttack();
            break;
        case 'defend':
            this.updateSkill();
            break;
        case 'skill':
            this.updateSkill();
            break;
        default: break;
    }
}

BattleManager.updateAttack = function(){
    if(!AttackManager.started){
        AttackManager.setup();
    } 
    AttackManager.update();
}

BattleManager.updateDefend = function(){
    console.log('defending');
}

BattleManager.updateSkill = function(){
    console.log('skilling');
}

BattleManager.getActorIndex = function(){
    return $gameParty.allMembers().indexOf(this._battlers[this._turn]);
}

BattleManager.createSRTETurnOrder = function(){
    this._battlers = this.allBattleMembers();
    this._battlers.sort((a, b) => a.agi - b.agi );
    this._turn = 0;
    this._battlers.map((el, i) => {
        if(el instanceof Game_Actor){
            this._battlers[i]['_battleIndex'] = i;
        } 
        this._battlers[i]['_done'] = false;
            
    })
}

BattleManager.updateSRTETurnCount = function(){
    // if(this._subject && this._subject._hp <= 0) return this._turn += 2;
    if(this._turn == this._battlers.length - 1) return this._turn = 0;
    this._turn += 1;
}

BattleManager.processTurn = function() {
    var subject = this._subject;
    this.makeActionOrders();
    if(this._battlers[this._turn] instanceof Game_Enemy && this._battlers[this._turn]._actionState !== 'done') this._battlers[this._turn].makeActions(); 
    var action = subject.currentAction();
    if (action) {
        action.prepare();
        if (action.isValid()) {
            this.startAction();
        }
        subject.removeCurrentAction();
    } else {
        subject.onAllActionsEnd();
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(subject);
        this._logWindow.displayCurrentState(subject);
        this._logWindow.displayRegeneration(subject);
        // this._subject = this.getNextSubject();
    }
};

BattleManager.getNextSubject = function() {
    this.updateSRTETurnCount();
    var battler = this._battlers[this._turn];
    if(!battler) return null;
    this._phase = 'start';
    return battler
};

BattleManager.makeActionOrders = function() {
    this._actionBattlers = [this._battlers[this._turn]];
};

BattleManager.startAction = function() {
    var subject = this._subject;
    var action = subject.currentAction();
    var targets = action.makeTargets();
    this._phase = 'action';
    this._action = action;
    this._targets = targets;
    subject.useItem(action.item());
    this._action.applyGlobal();
    this.refreshStatus();
    this._logWindow.startAction(subject, action, targets);
};

BattleManager.updateAction = function() {
    if(this._subject instanceof Game_Enemy) this._subject.makeActions(); 
    let action = this._actionBattlers[0]._actions[0];
    if(action._item._itemId === 1) this._actionPhase = 'attack';
    this.updateActionPhase();
    // var target = this._targets.shift();
    // if (target) {
    //     this.invokeAction(this._subject, target);
    // } else {
    //     this.endAction();
    // }
};

BattleManager.endAction = function() {
    this._logWindow.endAction(this._subject);
    this._phase = 'turn';
};

BattleManager.startTurn = function() {
    // this._phase = 'turn';
    this._phase = 'action';
    // this.clearActor();
    $gameTroop.increaseTurn();
    this.makeActionOrders();
    $gameParty.requestMotionRefresh();
    this._logWindow.startTurn();
};

BattleManager.startInput = function() {
    this._phase = 'input';
    this._battlers[this._turn].makeActions();
    // this.clearActor();
    if (this._surprise || !this._battlers[this._turn].canInput()) {
        this.startTurn();
        this.updateSRTETurnCount();
    }
};
    
BattleManager.selectNextCommand = function() {
    if(!this.actor()) {
        this.changeActor(this.getActorIndex(), 'waiting');
            // this._battlers[this._turn]._done = false;
    }
    if (this._battlers[this._turn]._done || this._battlers[this._turn] instanceof Game_Enemy) {
        this.startTurn();
    }
};
    
BattleManager.update = function() {
        if (!this.isBusy() && !this.updateEvent()) {
            switch (this._phase) {
        case 'start':
            this.startInput();
            break;
        case 'turn':
            this.updateTurn();
            break;
        case 'action':
            this.updateAction();
            break;
        case 'turnEnd':
            this.updateSRTETurnCount();
            this.updateTurnEnd();
            break;
        case 'battleEnd':
            this.updateBattleEnd();
            break;
        case 'input':
            if(this._subject instanceof Game_Enemy) this.updateEnemy();
        }
    }
};

BattleManager.updateEnemy = function(){
    this._phase = 'turn';
}

BattleManager.updateEvent = function() {
    switch (this._phase) {
        case 'start':
            case 'turn':
                case 'turnEnd':
                    if (this.isActionForced()) {
                        this.processForcedAction();
                        return true;
            } else {
                return this.updateEventMain();
            }
        }
        return this.checkAbort();
};

BattleManager.updateTurnEnd = function() {
    this.startInput();
};

BattleManager.updateTurn = function() {
    $gameParty.requestMotionRefresh();
    if (!this._subject) {
        this._subject = this.getNextSubject();
    }
    if (this._subject) {
        this.processTurn();
    } else {
        this.endTurn();
    }
};


BattleManager.inputtingAction = function() {
    if(this._subject && this.actor()._actorId !== this._subject._actorId && this._subject instanceof Game_Actor) return
    return this.actor() ? this.actor().inputtingAction() : null;
};


BattleManager.actor = function() {
    return this._actorIndex >= 0 ? $gameParty.members()[this._actorIndex] : null;
};

BattleManager.updateActor = function(){
    console.log(this._battlers, this._turn)
    if(this.actor() !== this._battlers[this._turn]) this._actorIndex = $gameParty.allMembers().indexOf(this._battlers[this._turn]);
}

//===============================================================================================
// Attack Manager
//===============================================================================================

function AttackManager() {
    throw new Error('This is a static class');
}

/*
    Start = handles the animation of the the inactiveSprites moving off of the screen and for the active sprites to center themselves on screen for the attack phase
    attack = this phase handles the five attacks from the attacking sprite
    the amount of attacks are determined by the number of items in the weapon slots
*/ 

AttackManager.initialize = function(){
    this._started = false;
    this._phase = 'start';
    this._activeActorSprite = {};
    this._activeEnemySprite = {};
    this._inactiveActorSprites = [];
    this._inactiveEnemySprites = [];
    this._delay = 0;
    this._delayTimer = 0;
}

AttackManager.setup = function() {
    this._started = true;
    this._activeActorSprite = this.getActiveActorSprite();
    this._activeEnemySprite = this.getActiveEnemySprite();
    this._inactiveActorSprites = this.getInactiveActorSprites();
    this._inactiveEnemySprites = this.getInactiveEnemySprites();
    this._delay = 3 * Mythic.Core.SECONDS;
    this.delayTimer = this._delay;
};

AttackManager.getInactiveActorSprites = function() {
    return Mythic.Core.getActorSprites().filter(el => el._actor !== this.getActiveActorSprite()._actor);
}

AttackManager.getInactiveEnemySprites = function() {
    return Mythic.Core.getEnemySprites().filter(el => el._battler !== this.getTargetEnemy());
}

AttackManager.getSubjectActor = function(){
    return $gameActors._data[$gameParty._actors[BattleManager._action._subjectActorId]]
}

AttackManager.getActiveActorSprite = function() {
    if(BattleManager._action && BattleManager._subject instanceof Game_Enemy) return Mythic.Core.getActorSprites().find(el => el._actor === this.getSubjectActor()); 
    return Mythic.Core.getActorSprites().find(el => el._actor === BattleManager._actionBattlers[0]);
}

AttackManager.getActiveEnemySprite = function(){
    return Mythic.Core.getEnemySprites().find(el => el._battler === this.getTargetEnemy());
}

AttackManager.getTargetIndex = function(){
    if(BattleManager._actionBattlers[0]._actions[0]._targetIndex < 0) return BattleManager._actionBattlers[0]._actions[0]._subjectEnemyIndex;
    return BattleManager._actionBattlers[0]._actions[0]._targetIndex;
}

AttackManager.getTargetEnemy = function(){
    return $gameTroop._enemies[this.getTargetIndex()];
}

Mythic.Core.getActorSprites = function(){
    return SceneManager._scene.children[0]._actorSprites
}

Mythic.Core.getEnemySprites = function(){
    return SceneManager._scene.children[0]._enemySprites
}


AttackManager.updatePhase = function() {
    switch(this._phase) {
        case 'start': return this.start();
        case 'attack': return this.updateAttack();
        case 'end': return this.end();
        case 'none': return console.log('attack phase over')
    }
}


// Mythic.Battle.getAllActorSprites()[1]._actor
// BattleManager._actionBattlers[0]

AttackManager.moveSpritesToBattlePosition = function() {
    let actors = this._inactiveActorSprites.map(el => el.updateMoveOffScreen());    
    let enemies = this._inactiveEnemySprites.map(el => el.updateMoveOffScreen());
    let actor = this._activeActorSprite.updateMoveToAttackPosition();
    let enemy = this._activeEnemySprite.updateMoveToAttackPosition();
    let actorsFinished = actors.sort()[0];
    let enemiesFinished = enemies.sort()[0];
    return actorsFinished && enemiesFinished && actor && enemy;
}

AttackManager.moveAllSpritesToOrigin = function() {
    let actors = this._inactiveActorSprites.map(el => el.updateMoveToBase());    
    let enemies = this._inactiveEnemySprites.map(el => el.updateMoveToBase());
    let actor = this._activeActorSprite.updateMoveToBase();
    let enemy = this._activeEnemySprite.updateMoveToBase();
    let actorsFinished = actors.sort()[0];
    let enemiesFinished = enemies.sort()[0];
    return actorsFinished && enemiesFinished && actor && enemy;
}

AttackManager.start = function(){
    if(!this._started) {
        this.setup();
        this._started = true;
    }
    if(this.moveSpritesToBattlePosition()) this._phase = 'attack'
}

AttackManager.end = function(){
    // if(!this._started) this.setup();
    if(this.moveAllSpritesToOrigin()) {
        this._phase = 'start'
        this._started = false;
        BattleManager._actionBattlers[0].removeCurrentAction();
        BattleManager._subject = null;
        // BattleManager._subject._actions = [];
        BattleManager._phase = 'turn';
    }
}

AttackManager.updateAttack = function(){
    // increment the current attack number (starts at 0. is set to 1 at this point and then goes up to 5)
    // if the attack number is less than 6 run code;
    // bring up the button prompt for the attack
    // when the button is hit start the attack animation
    // 
    // update juggle 

    console.log('Attacking');
    this._phase = 'end';
}

AttackManager.update = function(){
    this.updatePhase();
}


Scene_SRTE_Battle.prototype.startActorCommandSelection = function() {
    BattleManager.updateActor();
    this._statusWindow.select(BattleManager.actor().index());
    this._partyCommandWindow.close();
    this._actorCommandWindow.setup(BattleManager.actor());
};

Scene_SRTE_Battle.prototype.updateBattleProcess = function() {
    if (!this.isAnyInputWindowActive() || BattleManager.isAborting() ||
    BattleManager.isBattleEnd()) {
        BattleManager.update();
        if(BattleManager._subject instanceof Game_Enemy === false ) this.changeInputWindow();
    }
};
    
// {
//     "_subjectActorId": 1,
//     "_subjectEnemyIndex": -1,
//     "_forcing": false,
//     "_item": {
//         "_dataClass": "skill",
//         "_itemId": 1
//     },
//     "_targetIndex": 0
// }

Scene_SRTE_Battle.prototype.onEnemyOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._enemyWindow.enemyIndex());
    this._enemyWindow.hide();
    this._skillWindow.hide();
    this._itemWindow.hide();
    BattleManager._battlers[BattleManager._turn]._done = true;
    this.selectNextCommand();
};

Game_Actor.prototype.inputtingAction = function() {
    return this.action(this._actionInputIndex);
};

Mythic.BattleCore.aliasSpriteBattlerInit = Sprite_Battler.prototype.initialize;
Sprite_Battler.prototype.initialize = function(battler) {
    Mythic.BattleCore.aliasSpriteBattlerInit.call(this, battler);
    this._baseX = 0;
    this._baseY = 0;
    this._moveSpeed = 20;
    this._offscreenDistance = 0;
    this._screenDirection = 0;
    this._centerX = 0;
    this._centerY = 0;
};

Sprite_Battler.prototype.direction = function() {};


Mythic.BattleCore.aliasSpritesetHome = Sprite_Battler.prototype.setHome;
Sprite_Battler.prototype.setHome = function(x, y) {
    this._homeX = x;
    this._homeY = y;
    this._baseX = x;
    this._baseY = y;
    this.updatePosition();
};

// Sprite_Battler.prototype.updateMoveOffScreen = function() {};

Mythic.BattleCore.aliasSpriteActorInit = Sprite_Actor.prototype.initialize;
Sprite_Actor.prototype.initialize = function(battler){
    Mythic.BattleCore.aliasSpriteActorInit.call(this, battler);
    this._offscreenDistance = Graphics.width + 200;
    this._centerX = (Graphics.width / 4) * 3 - 60;
    this._centerY = Graphics.height / 2;
}

Mythic.BattleCore.aliasSpriteEnemyInit = Sprite_Enemy.prototype.initialize;
Sprite_Enemy.prototype.initialize = function(battler){
    Mythic.BattleCore.aliasSpriteEnemyInit.call(this, battler);
    this._offscreenDistance = -200;
    this._centerX = Graphics.width / 4 + 60;
    this._centerY = Graphics.height / 2;
    this.setHome(this._homeX, this._homeY);
}

Sprite_Battler.prototype.moveToDestination = function(destination, axis){
    const distance = destination - this[axis];
    const sign = Math.sign(distance);
    let dx = sign * this._moveSpeed;
    if(dx > distance * sign) dx = distance;
    if(this[axis] !== destination) {
        this[axis] += dx;
        return false
    }
    return true
}

Sprite_Battler.prototype.updateMoveOffScreen = function() {
    return this.moveToDestination(this._offscreenDistance, '_homeX');
};

Sprite_Battler.prototype.updateMoveToCenterX = function() {
    return this.moveToDestination(Graphics.width / 2, '_homeX');
};

Sprite_Battler.prototype.updateMoveToCenterY = function() {
    return this.moveToDestination(Graphics.height / 2, '_homeY');
};

Sprite_Battler.prototype.updateMoveToBaseX = function() {
    return this.moveToDestination(this._baseX, '_homeX');
};

Sprite_Battler.prototype.updateMoveToBaseY = function() {
    return this.moveToDestination(this._baseY, '_homeY');
};

Sprite_Battler.prototype.updateMoveToBase = function() {
    let baseX = this.updateMoveToBaseX();
    let baseY = this.updateMoveToBaseY();
    return baseX && baseY;
};

Sprite_Battler.prototype.updateMoveToCenter = function() {
    let centerX = this.updateMoveToCenterX();
    let centerY = this.updateMoveToCenterY();
    return centerX && centerY;
}

Sprite_Battler.prototype.updateMoveToAttackPosition = function() {
    let posX = this.moveToDestination(this._centerX, '_homeX');
    let posY = this.moveToDestination(this._centerY, '_homeY');
    return posX && posY;
}

