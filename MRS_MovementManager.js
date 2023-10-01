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
* @plugindesc Creates and Modifies important parameters of the games base objects as well as adds additional functionality for easier development..
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
// Commands
//=============================================================================
Game_Event.prototype.MoveTypes.set('pathfinder', Game_Event.prototype.MoveTypes.size);

Mythic.Command.Chase = function(arguments){
    const [speed, triggerDistance, quitDistance] = arguments;
    const event = GetCurrentEvent();
    event.moveParams = {
        chase: true,
        chaseSpeed: Mythic.Utils.ConvertStringToNumber(speed),
        triggerDistance: Mythic.Utils.ConvertStringToNumber(triggerDistance),
        quitDistance: Mythic.Utils.ConvertStringToNumber(quitDistance),
        chaseStarted: false,
        chaseMoveType: 4,
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
    if(this.pathfinder) this.pathfinder.restart();
    this._moveSpeed = this.moveParams.chaseSpeed;
    this._moveType = this.MoveTypes.get('pathfinder');
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

Game_Map.prototype.partyMemberXy = function(x, y){
    const followers = $gamePlayer._followers._data;
    return followers.filter(function(member){
        if(member.pos(x, y) != $gamePlayer.pos(x, y)) return member.pos(x, y);
    })
}

// TODO: create a proximity movement prototype that will make the parent event move randomly in a certain proximity of a target distance.
//==================================================================================================================
// Movement
//==================================================================================================================

function Movement(){
    this.initialize.apply();
}

Movement.prototype.initialize = function(){

}

Movement.prototype.move = function(){
    
}

//==================================================================================================================
// Proximity Movement
//==================================================================================================================

function MovementProximity(){
    this.initialize.apply(this, arguments);
}

MovementProximity.prototype = Object.create(Movement.prototype);
MovementProximity.prototype.constructor = MovementProximity;

MovementProximity.prototype.initialize = function(target, minDistance, maxDistance){
    this.target = target;
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;
}

MovementProximity.prototype.move = function(){
    // we will need to no the current distance to the target as well as which direction that target lies in.
    // find out which directions are not available based on distance to the target and remove them from the options for random selection
    // if the target has moved out of range from the event, we will need to calculate the distance it will take to get withing the proximity range.
    // If we are in range proceed.
    // select a random index for the newly create direction array.
    //Implement switch and pass the chosen direction into the switch.
    // move the unit in the appropriate direction.
}

//==================================================================================================================
// Radial Movement
//==================================================================================================================

function MovementRadial(){
    this.initialize.apply(this, arguments);
}

MovementRadial.prototype = Object.create(Movement.prototype);
MovementRadial.prototype.constructor = MovementRadial;

MovementRadial.prototype.initialize = function(){
    
}


