//=============================================================================
// Mythic Realms Studios- Proximity Manager
// MRS_PokeArk.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_PokeArk = true;

var Mythic = Mythic || {};
Mythic.PokeArk = Mythic.PokeArk || {};
Mythic.PokeArk.version = '1.0.0';

Mythic.Core = Mythic.Core || {};
Mythic.Param = Mythic.Param || {};
Mythic.Command = Mythic.Command || {};
Mythic.Utils = Mythic.Utils || {};
Mythic.GameData = Mythic.GameData || {};
Mythic.EventSpawner = Mythic.EventSpawner || {};

//=============================================================================
/*: 
* @plugindesc This plugin extends the game data and mechanics to allow units to behave in ways inspired by the popular games
* Ark - Survival Evolved and Pokemon.
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

//=============================================================================
// Commands
//=============================================================================


Mythic.Command.MRS_PokeArkStats = function(args){  
    let event = GetCurrentEvent();
}

Mythic.Command.MRS_PokeArkBreeding = function(args){
    let event = GetCurrentEvent();
    let distance = parseInt(args[0]);
    let duration = parseInt(args[1]);
    let cooldown = parseInt(args[2]);
    let eggGroups = args[3].split(',');
    if(!event.mrs_breedingManager) event.mrs_breedingManager = new BreedingManager(event, distance, duration, cooldown, eggGroups);
}

//=============================================================================
// EventSpawner
//=============================================================================

Mythic.EventSpawner.SpawnChildEvent = function(event1, event2, x, y){
    let parentX = $gameMap._events[event1.id];
    let parentY = $gameMap._events[event2.id];
    const bm = parentX.mrs_breedingManager;
    console.log($gameMap._events[event1.id], $gameMap._events[event2.id]);
    this.rebuildEventArrays();
    let newEvent = this.createEvent(event1.name);
    this.addEventToDataMap(newEvent, x, y);
    this.addEventToGameMap(newEvent);
    this.updateMap();
    this.addEventSprite(newEvent);
    $gameMap._events[newEvent.id].mrs_breedingManager = new BreedingManager($gameMap._events[newEvent.id], bm._distance, bm._maxDuration, bm._cooldown, bm._eggGroups);
    $gameMap._events[newEvent.id].mrs_breedingManager._parents.x = parentX;
    $gameMap._events[newEvent.id].mrs_breedingManager._parents.y = parentY;
}

Mythic.PokeArk.getAllEventsWithBreeding = function(){
    return $gameMap._events.filter( event => event.mrs_breedingManager);
}

Mythic.Utils.filterElementsWithProperty = function(arr, property){
    return arr.filter( event => event[property]);
}

Mythic.PokeArk.getAllEventsInBreedingGroup = function(group){
    return $gameMap._events.filter( event => {
        if(event.mrs_breedingManager) return event.mrs_breedingManager._eggGroups.contains(group);
    })
}


//=============================================================================
// Copy
//=============================================================================

// Mythic.PokeArk.aliasCopyData = Mythic.Copy.copyData;
// Mythic.Copy.copyData = function(data){
//     return JSON.parse(JSON.stringify(data, function(key, val){
//         if(key === '_event' && !data instanceof Game_Event) return undefined;
//         return val;
//     }));
// }

Mythic.PokeArk.aliasGameCharacterUpdate = Game_Character.prototype.update;
Game_Character.prototype.update = function(){
    Mythic.PokeArk.aliasGameCharacterUpdate.call(this);
    if(this.mrs_breedingManager) this.mrs_breedingManager.update();
}

//=============================================================================
// Breeding Manager
//=============================================================================

function BreedingManager(){
    this.initialize.apply(this, arguments);
}

// phases: searching breeding laying cooldown sterile 
BreedingManager.prototype.initialize = function(event, distance, duration, cooldown, eggGroups){
    this._gender = Mythic.Random.number(2) == 1  ? 'male' : 'female';
    this._eventId = event._eventId;
    this._distance = distance;
    this._duration = 0;
    this._maxDuration = duration;
    this._cooldown = cooldown;
    this._eggGroups = eggGroups;
    this._parents = {
        x: null,
        y: null
    };
    this._timesBred = 0;
    this._mutations = {

    };
    this._mate = {};
    this._neutered = false;
    this._phase = 'searching';
    this._breedingStage = 'start'
    this._matchingEvents = [];
    this.fertilized = false;
}

BreedingManager.prototype.checkPhase = function(){
    switch(this._phase){
        case 'searching':
            return this.search();
        case 'breeding':
            return this.checkBreedingStage();
        case 'laying':
            return this.updateEggLaying();
        case 'cooldown':
            return this.cooldown();
        case 'sterile':
            return
    }
}

BreedingManager.prototype.getEvent = function(){
    return $gameMap._events[this._eventId];
}

BreedingManager.prototype.updateEggLaying = function(){
    if(this.checkOpenSpot()) this.layEgg();
}

BreedingManager.prototype.layEgg = function(){
    
}

BreedingManager.prototype.checkOpenSpot = function(){

}


BreedingManager.prototype.setParents = function(parent1, parent2){
    this._parents.x = parent1;
    this._parents.y = parent2;
}

BreedingManager.prototype.checkBreedingStage = function(){
    switch(this._breedingStage){
        case 'start':
            return this.startBreeding();
        case 'breed':
            return this.breed();
    }
}

BreedingManager.prototype.setMate = function(){
    this._mate = this._matchingEvents[Mythic.Random.number(this._matchingEvents.length)];
    this.setMatePhase();
}

BreedingManager.prototype.setMatePhase = function(){
    this._mate._moveType = 0;
    this._mate.mrs_breedingManager._mate = this.getEvent();
    this._mate.mrs_breedingManager.setDuration();
    this._mate.mrs_breedingManager._phase = 'breeding';
    this._mate.mrs_breedingManager._breedingStage = 'breed';
}

BreedingManager.prototype.setDuration = function() {
    this._duration = this._maxDuration * Mythic.Core.SECONDS;
}

BreedingManager.prototype.startBreeding = function(){
    this.getEvent()._moveType = 0;
    this.setDuration();
    this._breedingStage = 'breed';
    this.setMate();
}

BreedingManager.prototype.breed = function(){
    if(this._duration > 0){
        console.log(this._duration);
        this._duration -= 1;
    }
    else this.completeBreeding();
}

BreedingManager.prototype.completeBreeding = function(){
    if(this._gender === 'female'){
        this._phase = 'laying';
        this._fertilized = true;
    } 
    else this._phase = 'searching';
}

BreedingManager.prototype.search = function(){
    this.checkProximityForBreeding();
}

BreedingManager.prototype.layEgg = function(){

}

BreedingManager.prototype.cooldown = function(){

}

BreedingManager.prototype.getEventsWithBreeding = function(){
    
}

BreedingManager.prototype.getBreedingEvents = function(){
    let matchingEvents = Mythic.Utils.filterElementsWithProperty(Mythic.Utils.getAllEventsInProximity(this._distance, this.getEvent()._x, this.getEvent()._y), 'mrs_breedingManager')
    matchingEvents.splice(matchingEvents.indexOf(this.getEvent()), 1);
    this. _matchingEvents = matchingEvents.filter( event => event.mrs_breedingManager._gender !== this.getEvent().mrs_breedingManager._gender);
    return this._matchingEvents;
}

BreedingManager.prototype.checkProximityForBreeding = function(){
    console.log('Searching');
    if(this.getBreedingEvents().length > 0) {
        this._phase = 'breeding';
    }
}

BreedingManager.prototype.update = function(){
    this.checkPhase();
}
