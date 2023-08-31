//=============================================================================
// Mythic Realms Studios- Core
// MRS_MovementManager.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_MovementManager = true;

var Mythic = Mythic || {};
Mythic.MM = Mythic.MM || {};
Mythic.MM.version = '1.0.0';

Mythic.Command = Mythic.Command || {};
Mythic.Core = Mythic.Core || {};
Mythic.Pathfinder = Mythic.Pathfinder || {};
Mythic.Param = Mythic.Param || {};
Mythic.Utils = Mythic.Utils || {};
//=============================================================================
/*: 
* @plugindesc Creates and Modifies important parameters of the games base objects as well as adds additional functianality for easier development..
* @author Richard Guilliams
*
* @help 
* MRS plugins use a very specific tag format for processing tags and using them to incorporate important parameters into the game.
* because of this, tags use a special syntax.
* To enable proximity chasing for event. place <Proximity Chase><Proximity Chase Radius: 8><Proximity Chase Speed: 4.25> 
* 
* Version 1.00:
* - Finished plugin!
*/
//=============================================================================

//=============================================================================
// Plugin Commands Alias
//=============================================================================
var Mythic_PluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    if (Mythic.Command[command]) {
        Mythic.Command[command](args);
        return;
    };
    Mythic_PluginCommand.call(this, command, args);
};

//=============================================================================
// Commands
//=============================================================================

Mythic.Command.Chase = function(arguments){
    const [speed, triggerDistance, quitDistance] = arguments;
    const event = GetCurrentEvent();
    event.moveParams = {
        chase: true,
        chaseSpeed: Mythic.Utils.ConvertStringToNumber(speed),
        triggerDistance: Mythic.Utils.ConvertStringToNumber(triggerDistance),
        quitDistance: Mythic.Utils.ConvertStringToNumber(quitDistance),
        chaseStarted: false,
        chaseMoveType: 2,
        walkSpeed: event._moveSpeed,
        frequency: event._moveFrequency,
        moveType: event._moveType
    };
    console.log(event);
};

//=============================================================================
// Game_Event
//=============================================================================
Mythic.MM.UpdateGameEvent = Game_Event.prototype.update;
Game_Event.prototype.update = function() {
    this.updateChase();
    Mythic.MM.UpdateGameEvent.call(this);
};

Game_Event.prototype.updateChase = function() {
    if(this.hasOwnProperty('moveParams') && this.IsPlayerInRange(this.moveParams.triggerDistance) && !this.moveParams.chaseStarted) this.StartChase();
    if(this.hasOwnProperty('moveParams') && !this.IsPlayerInRange(this.moveParams.quitDistance) && this.moveParams.chaseStarted) this.EndChase();
};

Mythic.MM.GameEventMoveTowardPlayer = Game_Event.prototype.moveTypeTowardPlayer;
Game_Event.prototype.moveTypeTowardPlayer = function() {
    Mythic.MM.GameEventMoveTowardPlayer.call(this);
    this.moveOnPath();
};

Game_Event.prototype.moveOnPath = function(){
    // this.pathfinder.shortestPathToTarget();
    const coords = this.pathfinder.startingNode.coordsList
    var direction = this.coordsToMovementRoute(coords);
    if(coords.length != 0 && this._x === coords[0][0] && this._y === coords[0][1]){
        this.pathfinder.startingNode.coordsList = this.pathfinder.startingNode.coordsList.unshift();
    }
    this._moveRoute.list = [
        {code: direction, indent: 0}
    ]

}

Game_Character.prototype.updateRoutineMove = function() {
    if (this._waitCount > 0) {
        this._waitCount--;
    } else {
        this.setMovementSuccess(true);
        var command = this._moveRoute.list[this._moveRouteIndex];
        if (command) {
            this.processMoveCommand(command);
            this.advanceMoveRouteIndex();
        }
    }
};

Game_Event.prototype.coordsToMovementRoute = function(coords){
    debugger;
    if(coords.length == 0) return
    let directionList = [this.getDirectionCode(this._x, this._y, coords[0][0], coords[0][1])];
    coords.forEach((el, i, arr) => {
        if(i === arr.length - 1) return;
        directionList.push(this.getDirectionCode(el[0], el[1], arr[i + 1][0], arr[i + 1][1]));
    });
    console.log(directionList);
}

Game_Event.prototype.getDirectionCode = function(x1, y1, x2, y2){
    if(x1 == x2){
        if(y1 > y2){
            // up
            console.log('up')
            return 3
        }
        if(y1 < y2){
            console.log('down')
            return 1
        }
    }
    if(y1 == y2){
        if(x1 > x2){
            // up
            console.log('left')
            return 2
        }
        if(x1 < x2){
            return 4
        }
    }
}

Game_Event.prototype.checkValidMove = function(){
    if(this.Directions.get(this._direction) === 'up') return
    if(this.Directions.get(this._direction) === 'right') return
    if(this.Directions.get(this._direction) === 'down') return
    if(this.Directions.get(this._direction) === 'left') return
}

Game_Event.prototype.canPass = function(x, y, d) {
    var x2 = $gameMap.roundXWithDirection(x, d);
    var y2 = $gameMap.roundYWithDirection(y, d);
    if (!$gameMap.isValid(x2, y2)) {
        return false;
    }
    if (this.isThrough() || this.isDebugThrough()) {
        return true;
    }
    if (!this.isMapPassable(x, y, d)) {
        return false;
    }
    if (this.isCollidedWithCharacters(x2, y2)) {
        return false;
    }
    return true;
};

//1 down
//2 left
//3 up
//4 right

Game_Event.prototype.StartChase = function() {
    if(!this.moveParams.chaseStarted) this.moveParams.chaseStarted = true;
    if(this.pathfinder) this.pathfinder.shortestPathToTarget();
    this._moveSpeed = this.moveParams.chaseSpeed;
    this._moveType = this.MoveTypes.get('approach');
    console.log('chase Started')
    this._moveFrequency = 5;
}

Game_Event.prototype.EndChase = function() {
    this.moveParams.chaseStarted = false;
    this._moveSpeed = this.moveParams.walkSpeed;
    this._moveType = this.moveParams.moveType;
    this._moveFrequency = this.moveParams.frequency;
}

Game_Event.prototype.IsPlayerInRange = function(range){
    return this.DistanceToPlayer() - range <= 0;
}




