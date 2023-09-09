//=============================================================================
// Mythic Realms Studios - EventSpawner
// MRS_EventSpawner.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_EventSpawner = true;

var Mythic = Mythic || {};
Mythic.EventSpawner = Mythic.EventSpawner || {};
Mythic.EventSpawner.version = '1.0.0';

Mythic.Core = Mythic.Core || {};
Mythic.Param = Mythic.Param || {};
Mythic.Utils = Mythic.Utils || {};

Mythic.GameData = Mythic.GameData || {};

//=============================================================================
/*: 
* @plugindesc This plugin allows events to be spawned into the current map from a template map
* @author Richard Guilliams
*
* @help This plugin does not provide plugin commands.
* To add a spawner to the map or to an event you must add plugin command MRS_Spawner to either
* the map or the events event page.
* 
* Version 1.00:
* - Finished plugin!
*/
//=============================================================================

//=============================================================================
// Commands
//=============================================================================

Mythic.Command.MRS_LoadMapData = function(arguments){
    var xhr = new XMLHttpRequest();
    var url = 'data/Map' + Mythic.Core.GetMapFromName(arguments[0]) + '.json';
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        if (xhr.status < 400) {
            let mapData = JSON.parse(xhr.responseText);
            Mythic.GameData.spawnEvents = mapData.events;
            Mythic.GameData.currentMapId = $gameMap._mapId;
        }
    };
    xhr.send();
}

Mythic.Core.GetMapFromName = function(name) {
    return Mythic.Utils.formatNumberWithLeadingZeros(Mythic.Core.GetElementFromName($dataMapInfos, name).id, 3); 
}

Mythic.Utils.formatNumberWithLeadingZeros = function(number, minLength) {
    const numberString = number.toString();
    const zerosToAdd = minLength - numberString.length;
    
    if (zerosToAdd <= 0) {
      return numberString; // No need to add leading zeros
    }
    
    const leadingZeros = '0'.repeat(zerosToAdd);
    return leadingZeros + numberString;
  }

Mythic.Command.MRS_SaveMap = function(arguments){
    Mythic.EventSpawner.updateMap();
}

Mythic.Command.MRS_Spawner = function(arguments){
    let event = Mythic.EventSpawner.MapOrEvent();
    // Prox Params = tiner limit minDistance, maxDistance
    // else Params = timer limit
    if(arguments[0] === 'Proximity') return event.MRS_Spawner = new ProximitySpawner(event, parseInt(arguments[1]), parseInt(arguments[2]), parseInt(arguments[3]), parseInt(arguments[4]),);
    event.MRS_Spawner = new Spawner(event, parseInt(arguments[0]), parseInt(arguments[1]));
}

Mythic.Command.MRS_SpawnTimer = function(arguments){
    let event = Mythic.EventSpawner.MapOrEvent();
    event.MRS_Spawner.countdownFrom = parseInt(arguments[0]);
    event.MRS_Spawner.setTimer(event.MRS_Spawner.countdownFrom);
}

Mythic.Command.MRS_SpawnLimit = function(arguments){
    let event = Mythic.EventSpawner.MapOrEvent();
    event.MRS_Spawner.limit = parseInt(arguments[0]);
}

Mythic.Command.MRS_AddSpawn = function(arguments){
    let name = arguments[0];
    let limit = parseInt(arguments[1]);
    let weight = parseInt(arguments[2]);
    let regions = arguments[3].split('-').map(el => parseInt(el));
    let event = Mythic.EventSpawner.MapOrEvent();
    let newSpawn = { name, limit, weight, regions, count: 0 };
    event.MRS_Spawner.spawns.push(newSpawn);
}

Mythic.Command.MRS_EraseSpawn = function(arguments){
    //TODO Sprite not being erased from the screen properly. Need to figure out how to re draw the tile over top of the sprite or something.
    Mythic.EventSpawner.eraseEvent($gameMap._events.indexOf(GetCurrentEvent()));
    SceneManager._scene.createSpriteset();
}

//=============================================================================
// GameData
//=============================================================================

Mythic.Core.AliasGameMapSetup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId){
    Mythic.Core.AliasGameMapSetup.call(this, mapId);
    if(!this.pluginsProcessed) Mythic.Core.ProcessNoteTagCommands($dataMap);
}

Mythic.Core.AliasGameMapUpdate = Game_Map.prototype.update;
Game_Map.prototype.update = function(mapId){
    Mythic.Core.AliasGameMapUpdate.call(this, mapId);
    if(this.MRS_Spawner) this.MRS_Spawner.update();
}

Mythic.Core.AliasGameEventUpdate = Game_Event.prototype.update;
Game_Event.prototype.update = function(eventId){
    Mythic.Core.AliasGameEventUpdate.call(this, eventId);
    if(this.MRS_Spawner) this.MRS_Spawner.update();
}

//=============================================================================
// GameData
//=============================================================================

Mythic.GameData._data.maps = [];


//=============================================================================
// DataManager
//=============================================================================

Mythic.Core.MapExists = function(src){
    if(Mythic.GameData._data.maps[Mythic.Core.GetMapIdFromName(src)] != undefined){
        return true;
    }
    else return false;
}

Mythic.EventSpawner.MapOrEvent = function(){
    let event = GetCurrentEvent();
    if(!event) return $gameMap;
    return event;
}

Mythic.EventSpawner.checkMapData = function(name, src, xhr){
    if(name == '$dataMap' && Mythic.Core.MapExists(src)){
        $dataMap = Mythic.GameData._data.maps[Mythic.Core.GetMapIdFromName(src)];
    }
    else if (xhr.status < 400) {
        window[name] = JSON.parse(xhr.responseText);
        if(name == '$dataMap' && !Mythic.Core.MapExists(src)){
            Mythic.GameData._data.maps[Mythic.Core.GetMapIdFromName(src)] = window[name];
        }
        DataManager.onLoad(window[name]);
    }
};

DataManager.loadDataFile = function(name, src) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        Mythic.EventSpawner.checkMapData(name, src, xhr);
    };
    xhr.onerror = this._mapLoader || function() {
        DataManager._errorUrl = DataManager._errorUrl || url;
    };
    window[name] = null;
    xhr.send();
};


//=============================================================================
// EventSpawner
//=============================================================================

Mythic.EventSpawner.isSpawn = function(object){
    if(object.meta.MRS_Spawn) return true;
}

Mythic.EventSpawner.eraseEvent = function(index){
    // Get the event object
    var event = $gameMap.event(index);
    
    // Check if the event exists
    if (event) {
        $dataMap.events.splice(index, 1);
        $gameMap._events.splice(index, 1);
    
            // Erase the event sprite
            event.erase();
        }
    this.equalizeEventIds();
    this.updateMap();
}

Mythic.EventSpawner.equalizeEventIds = function(){
    $dataMap.events.map((el, index) => {
        if(el) $dataMap.events[index].id = index;
    });
    $gameMap._events.map((el, index) => {
        if(el) $gameMap._events[index]._eventId = index;
    });
    
}

Mythic.EventSpawner.updateMap = function(){
    $dataMap.events.map((event, i) => {
        if(!event || i === 0) return
        if(this.isSpawn($dataMap.events[i]) && $gameMap._events[i]._erased){
            this.eraseEvent(i);
        } 
        event.x = $gameMap._events[event.id]._x;
        event.y = $gameMap._events[event.id]._y;
    })
    Mythic.GameData._data.maps[$gameMap._mapId] = Mythic.Copy.copyData($dataMap);
}

Mythic.EventSpawner.getSpawnEventByName = function(eventName){
    return Mythic.Core.GetElementFromName(Mythic.GameData.spawnEvents, eventName);
}

Mythic.EventSpawner.createEvent = function(eventName){
    return Mythic.Copy.copyData(Mythic.EventSpawner.getSpawnEventByName(eventName));
};

Mythic.EventSpawner.addEventSprite = function(event){
    SceneManager._scene.children[0].createCharacters();
}

Mythic.EventSpawner.addEventToDataMap = function(event, x, y){
    event.id = $dataMap.events.length;
    $dataMap.events.push(event);
    $dataMap.events[event.id].x = x;
    $dataMap.events[event.id].y = y;
    DataManager.extractMetadata(event);
};

Mythic.EventSpawner.addEventToGameMap = function(event){
    $gameMap._events.push(new Game_Event($gameMap._mapId, event.id));
}

Mythic.EventSpawner.rebuildEventArray = function(arr){
    if(arr[0] !== null) $gameMap._events[0] = null;
    const nonEmptyElements = arr.filter((el, i) => i === 0 || el);
    nonEmptyElements.forEach((el, i) => { if (i !== 0) el.id = i });
    arr.length = 0;
    arr.push(...nonEmptyElements);
}

Mythic.EventSpawner.rebuildEventArrays = function(arr){
    this.rebuildEventArray($dataMap.events);
    this.rebuildEventArray($gameMap._events);
    this.equalizeEventIds();
}

Mythic.EventSpawner.SpawnEvent = function(eventName, x, y){
    this.rebuildEventArrays();
    let newEvent = this.createEvent(eventName);
    this.addEventToDataMap(newEvent, x, y);
    this.addEventToGameMap(newEvent);
    this.updateMap();
    this.addEventSprite(newEvent);
}

Mythic.EventSpawner.getOnScreenTiles = function(){
    let startingX = $gamePlayer._x - 8;
    let startingY = $gamePlayer._y - 6;
    let endingX = startingX + Graphics.width / 48;
    let endingY = startingY + Graphics.height / 48;;
    if(startingX < 0) startingX = 0
    if(startingY < 0) startingY = 0
    if($gameMap.width < Graphics.width / 48)   endingX = $gameMap.width;
    if($gameMap.height < Graphics.height / 48) endingY = $gameMap.height;
    return Mythic.Core.GetAllCoordsFrom(startingX, endingX, startingY, endingY);
}

Mythic.EventSpawner.getOffScreenTiles = function(tiles){
    let screenTiles = this.getOnScreenTiles().map(el => el = JSON.stringify(el));
    let offScreenTiles = tiles.filter(function(el){
        el = JSON.stringify(el);
        return !screenTiles.includes(el);

    })
    return offScreenTiles;

}

//=============================================================================
// EventSpawner
//=============================================================================

function Spawner(){
    this.initialize.apply(this, arguments);
}

Spawner.prototype.initialize = function(event, timer, limit){
    this.parent = event
    this.name = '';
    this.active = false;
    this.timer = 0;
    this.countdownFrom = timer;
    this.limit = limit;
    this.initialCount = 0;
    this.count = 0;
    this.spawns = [];
}

Spawner.prototype.addSpawn = function(name, region, limit, chance){
    let newSpawn = { name, region, limit, chance, count: 0 };
    this.spawns.push(newSpawn);
}

Spawner.prototype.setTimer = function(time){
    this.timer = time * Mythic.Core.SECONDS;
}

Spawner.prototype.updateTimer = function(){
    if(this.timer > 0) return this.timer -= 1;
    this.setTimer(this.countdownFrom);
    this.spawn();
}

Spawner.prototype.spawn = function(){
    let spawns = this.spawns.filter((el, i) => el.count < el.limit);
    let event = Mythic.Random.getRandomElementByWeight(spawns);
    if(!event) return
    this.updateCount(event);
    let coords = this.getRandomCoordsFromRegions(event);
    if(coords){
        Mythic.EventSpawner.SpawnEvent(event.name, coords.x, coords.y);
        Mythic.Utils.getLastElement($gameMap._events).spawner = this;
        console.log(this.getSpawnsByName(event.name));
    }
    else console.log('No available tiles to spawn');
}

Spawner.prototype.updateCount = function(event){
    event.count += 1;
    this.count += 1;
};

Spawner.prototype.getCount = function(){
    return this.getChildren().length;
}

Spawner.prototype.getChildren = function(){
    return $gameMap._events.filter(el => { if(el) return el.spawner === this });
}

Spawner.prototype.getSpawnsByName = function(name){
    return $dataMap.events.filter(el => { if(el) return el.name === name });
};

Spawner.prototype.getRandomCoordsFromRegions = function (event) {
    let regionTiles = event.regions.map(el => $gameMap.allTilesInRegion(el));
    let tiles = [].concat(...regionTiles);
    let offScreenTiles = Mythic.EventSpawner.getOffScreenTiles(tiles);
    let coords = Mythic.Random.getRandomElementInArray(offScreenTiles);
    if(!coords) return undefined
    return { x: coords[0], y: coords[1] }; 
}

Spawner.prototype.update = function(){
    if(this.count < this.limit) this.updateTimer();
};

//==============================================================================================================
// Proximity Spawner
//==============================================================================================================

function ProximitySpawner(){
    this.initialize.apply(this, arguments);
}

ProximitySpawner.prototype = Object.create(Spawner.prototype);
ProximitySpawner.prototype.constructor = ProximitySpawner;

ProximitySpawner.prototype.initialize = function(event, timer, limit, minDistance, maxDistance){
    Spawner.prototype.initialize.call(this, event, timer, limit);
    this.maxDistance = maxDistance;
    this.minDistance = minDistance; 
}

ProximitySpawner.prototype.X = function(){
    return this.parent._x;
}

ProximitySpawner.prototype.Y = function(){
    return this.parent._y;
}


ProximitySpawner.prototype.getTilesInRadius = function(event){
    let startX = this.X() - this.maxDistance;
    let startY = this.Y() - this.maxDistance;
    let coords = [];
    for(let i = startX ; i < startX + this.maxDistance * 2 + 1; i++){
        for(let j = startY; j < startY + this.maxDistance * 2 + 1; j++){
            let coord = [i, j];
            if(!this.coordOffMap(i, j) && this.inDistance(coord) && this.inRegion(event, coord)) coords.push(coord);
        }
    }
    return coords;
}

ProximitySpawner.prototype.inDistance = function(coord){
    return Mythic.Utils.DistanceBetweenCoords(coord, [this.X(), this.Y()]) > this.maxDistance || Mythic.Utils.DistanceBetweenCoords(coord, [this.X(), this.Y()]) < this.minDistance
}
Spawner.prototype.coordOffMap = function(i, j){
    return i < 0 || i > $gameMap.width || j < 0 || j > $gameMap.height;
}

ProximitySpawner.prototype.inRegion = function(event, coord){
    return event.regions.includes($gameMap.regionId(coord[0], coord[1]));
}

ProximitySpawner.prototype.getRandomCoordsFromRegions = function (event) {
    let regionTiles = this.getTilesInRadius(event);
    let coords = Mythic.Random.getRandomElementInArray(regionTiles);
    if(!coords) return undefined
    return { x: coords[0], y: coords[1] }; 
}


