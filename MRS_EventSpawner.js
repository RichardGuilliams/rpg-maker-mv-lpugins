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
Mythic.SaveContents = Mythic.SaveContents || {};

Mythic.GameData = Mythic.GameData || {};

//=============================================================================
/*: 
* @plugindesc This plugin allows events to be spawned into the current map from a template map
* @author Richard Guilliams
*
* @help This plugin does not provide plugin commands.
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
    var url = 'data/Map' + arguments[0] + '.json';
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

Mythic.Command.MRS_SaveMap = function(arguments){
    Mythic.EventSpawner.updateMap();
}


//=============================================================================
// GameData
//=============================================================================

Mythic.GameData._data.maps = [];

Mythic.EventSpawner.updateMap = function(){
    Mythic.GameData._data.maps[$gameMap._mapId] = Mythic.Copy.copyData($gameMap);
}

//=============================================================================
// DataManager
//=============================================================================

Mythic.Core.MapExists = function(src){
    if(Mythic.GameData._data.maps[Mythic.Core.GetMapIdFromName(src)] != undefined){
        return true;
    }
    else return false;
}

DataManager.prototype.checkMapData = function(name, src, xhr){
    if(name == '$dataMap' && Mythic.Core.MapExists(src)){
        $dataMap = Mythic.GameData._data.maps[Mythic.Core.GetMapIdFromName(src)];
    }
    else if (xhr.status < 400) {
        window[name] = JSON.parse(xhr.responseText);
        if(name == '$dataMap' && !Mythic.Core.MapExists(src)){
            Mythic.GameData._data.maps[Mythic.Core.GetIdFromName(src)] = window[name];
        }
        DataManager.onLoad(window[name]);
    }
};

DataManager.prototype.loadDataFile = function(name, src) {
    var xhr = new XMLHttpRequest();
    var url = 'data/' + src;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        DataManager.prototype.checkMapData(name, src, xhr);
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
Mythic.EventSpawner.getSpawnEventByName = function(eventName){
    return Mythic.Core.GetElementFromName(Mythic.GameData.spawnEvents, eventName);
}

Mythic.EventSpawner.createEvent = function(eventName){
    return Mythic.Copy.copyData(Mythic.EventSpawner.getSpawnEventByName(eventName));
};

Mythic.EventSpawner.addEventToDataMap = function(event, x, y){
    event.id = $dataMap.events.length;
    $dataMap.events.push(event);
    $dataMap.events[event.id].x = x;
    $dataMap.events[event.id].y = y;
    Mythic.Core.ExtractMetaDataNew(event);
};

Mythic.Core.ExtractMetaData = function(object){
    DataManager.extractMetadata(object);
}

Mythic.Core.ExtractMetaDataNew = function(object){
    // Regular expression to match tags starting with "MRS_"
    const tagRegex = /<MRS_([^>]+)>/g;

    // Initialize an empty metadata object
    const metaData = {};

    // Extract and store metadata tags in the metaData object
    let match;
    while ((match = tagRegex.exec(object.note))) {
        const tag = match[1]; // Get the content within <>
        const parts = tag.split(':'); // Split the tag by ':' if present
        const key = parts[0].trim(); // Trim any leading/trailing spaces
        let value = parts[1] ? parts[1].trim() : true; // Set value to true if not specified
        if(value !== true && !isNaN(value)) value = parseInt(value);

        metaData[key] = value;
    }
    object['MRS'] = metaData;
}

Mythic.EventSpawner.SpawnEvent = function(eventName, x, y){
    const newEvent = this.createEvent(eventName);
    this.addEventToDataMap(newEvent, x, y);
    console.log(newEvent);
}