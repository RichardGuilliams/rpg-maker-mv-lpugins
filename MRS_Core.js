//=============================================================================
// Mythic Realms Studios - Core
// MRS_Core.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_Core = true;

var Mythic = Mythic || {};
Mythic.Core = Mythic.Core || {};
Mythic.Core.version = '1.0.0';

Mythic.Param = Mythic.Param || {};

Mythic.SaveContents = Mythic.SaveContents || {};
Mythic.GameData = Mythic.GameData || {};

//=============================================================================
/*: 
* @plugindesc Creates and Modifies important parameters of the games base objects as well as adds additional functionality for easier development..
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
// Console Commands
//=============================================================================

var clear = () => console.clear();

var logDataAndMapEvents = () => {
    console.log($dataMap.events);
    console.log($gameMap._events);
}

var logGameEvents = () => {
    console.log($gameMap._events);
}

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
// Plugin Command Processing
//=============================================================================

Mythic.Core.PluginCommands = new Map([]);

/**
 *  @param {string} commandName - name of the plugin command being added to the Mythic.Core.PluginCommands map;
 * @param {function} commandAction - the name  of the function to be executed when the Mythic.Core.InvokePluginCommand is called.
 *  @return {boolean} returns true if the obj objects note property has any text
 */
Mythic.Core.AddPluginCommand = function(commandName, commandAction){
    Mythic.Core.PluginCommands.set(commandName, commandAction);
};

Mythic.Core.GetPluginCommand = function(commandName){
    return Mythic.Core.PluginCommands.get(commandName);
};


Mythic.Core.InvokePluginCommand = function(commandName){
    Mythic.Core.GetPluginCommand(commandName)();
};

//=============================================================================
// Meta Processing
//=============================================================================

Mythic.Meta = Mythic.Meta || {};

/**
 *  @param {object}
 *  @return {boolean} returns true if the obj objects note property has any text
 */
Mythic.Core.HasNote = function(obj){
    if(obj.note.trim() != '') return true;
    return false;
}

/**
 *  @param {object}
 *  @return {boolean} returns true if the obj objects meta property has any child properties
 */
Mythic.Core.HasMeta = function(obj){
    if(Object.keys(obj.meta).length > 0) return true;
    return false;
}

/**
 *  @param {object} obj
 *  @return {void} 
 * processes the meta tags of an object.
*/
Mythic.Core.ProcessMetaTags = function(obj){
    
};

/**
 *  @param {object} obj
 *  @return {void} 
 * processes the meta tags of the $dataMap.events array.
*/
Mythic.Core.ProcessDataMapEventTags = function(){
    
};

Mythic.Core.IsMRSTag = function(key){
    if(key.toLowerCase().contains('mrs_')) return true;
    return false;
};

/**
 *  @param {object} obj
 *  @return {void} 
 * processes the meta tags of the $dataMap itself.
*/
Mythic.Core.ProcessDataMapTags = function(){
    if(!Mythic.Core.HasMeta($dataMap)) return;
    Object.keys($dataMap.meta).forEach((metaProperty, propertyIndex) => {
        if(!Mythic.Core.IsMRSTag(metaProperty)) return console.log(`${metaProperty} is not an MRS tag`);
        console.log($dataMap.meta[metaProperty], metaProperty); 
    })
};

Mythic.Core.ProcessNoteTagCommands = function(map){
    $gameMap['pluginsProcessed'] = true;
    let notes = map.note.split('\n');
    notes.map((el) => {
        if(el.contains('MRS_')) this.ProcessCommandString(el);
    })
}

Mythic.Core.ProcessCommandString = function(command){
    let commands = command.split(' ');
    $gameMap._interpreter.pluginCommand(commands.splice(0, 1)[0], commands);
}

//=============================================================================
// Copy
//=============================================================================

Mythic.Copy = Mythic.Copy || {};

Mythic.Copy.copyData = function(data){
    return JSON.parse(JSON.stringify(data));
}

//=============================================================================
// Time
//=============================================================================


Mythic.Core.SECONDS = 60;
Mythic.Core.MINUTES = Mythic.Core.SECONDS * 60;
Mythic.Core.HOURS = Mythic.Core.MINUTES * 60;
Mythic.Core.DAYS = Mythic.Core.HOURS * 24;
Mythic.Core.WEEKS = Mythic.Core.DAYS * 7;
Mythic.Core.YEARS = Mythic.Core.WEEKS * 52;

//=============================================================================
// Game Data
//=============================================================================

Mythic.GameData._data = {};

//=============================================================================
// DataManager
//=============================================================================

DataManager.isDatabaseLoaded = function() {
    this.checkError();
    for (var i = 0; i < this._databaseFiles.length; i++) {
        if (!window[this._databaseFiles[i].name]) {
            return false;
        }
    }
    Mythic.Core.PopulateDataArrays();
    Mythic.Core.PopulateTraitMaps();
    return true;
};

//=============================================================================
// Eventing System
//=============================================================================

Mythic.Core.EventingSystemMap = new Map([
    ["Message", 101],
    ["Game Progression", 102],
    ["Flow Control", 103],
    ["Party", 104],
    ["Actor", 105],
    ["Movement", 201],
    ["Character", 202],
    ["Picture", 203],
    ["Timing", 204],
    ["Screen", 205],
    ["Audio & Video", 206],
    ["Scene Control", 301],
    ["System Settings", 302],
    ["Map", 302],
    ["Battle", 303],
    ["Advanced", 304]
]);

Mythic.Core.BattleProcessingMap = new Map([
    ["Troop", 1],
    ["Can Lose", 2],
    ["Can Escape", 3]
]);

Mythic.Core.BattleProcessingTroopMap = new Map([
    ["Direct Designation", 0],
    ["Designation With Variable", 1],
    ["Same As Random Encounter", 2],

]);

//=============================================================================
// Game Data Arrays
//=============================================================================

Mythic.Core.DataArrays = new Map([]);

Mythic.Core.PopulateDataArrays = function(){
    Mythic.Core.DataArrays.set("item", $dataItems);
    Mythic.Core.DataArrays.set("weapon", $dataWeapons);
    Mythic.Core.DataArrays.set("class", $dataClasses);
    Mythic.Core.DataArrays.set("actor", $dataActors);
    Mythic.Core.DataArrays.set("enemy", $dataEnemies);
    Mythic.Core.DataArrays.set("troop", $dataTroops);
    Mythic.Core.DataArrays.set("skill", $dataSkills);
    Mythic.Core.DataArrays.set("state", $dataStates);
}

Mythic.Core.GetDataArray = function(dataArrayType){
    return Mythic.Core.DataArrays.get(dataArrayType);
}


//=============================================================================
// Save Load
//=============================================================================
Mythic.Core.DataManagerMakeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    var contents = Mythic.Core.DataManagerMakeSaveContents.call(this);
    contents.MRS_Data = Mythic.GameData
    return contents;
};

DataManager.extractSaveContents = function(contents) {
    $gameSystem        = contents.system;
    $gameScreen        = contents.screen;
    $gameTimer         = contents.timer;
    $gameSwitches      = contents.switches;
    $gameVariables     = contents.variables;
    $gameSelfSwitches  = contents.selfSwitches;
    $gameActors        = contents.actors;
    $gameParty         = contents.party;
    $gameMap           = contents.map;
    $gamePlayer        = contents.player;
    Mythic.GameData = contents.MRS_Data;
};

//=============================================================================
// Game_Event
//=============================================================================

/**
 * 
 *  @return {object} return the current gameMap event that is triggering the game maps interpreter.
 *  @example
 *  function GetCurrentEvent(){
 *       return $gameMap._events[$gameMap._interpreter._eventId];
 *  }
*/
function GetCurrentEvent(){
    return $gameMap._events[$gameMap._interpreter._eventId];
}

/**
 *  @return {Game_Event} returns the index of the data event matching the name provided to it.
*/
function GetDataEventIndexByName(name){
    return $dataMap.events.findIndex(function(event){
        if(event)  return event.name == name
    })
}

function GetEventByName(name){
    let index = GetDataEventIndexByName(name);
    return $gameMap._events[index];
}

//================================================================
// Data Classes
//================================================================

Mythic.Core.GetClassName = function(id){
    return $dataClasses[id].name;
};

//================================================================

Mythic.Core.GetClassParams = function(id){
    return $dataClasses[id].params;
}

Mythic.Core.GetParamMaxHp = function(id){
    return Mythic.Core.GetClassParams(id)[0];
}

Mythic.Core.GetParamMaxHp = function(id){
    return Mythic.Core.GetClassParams(id)[0];
}

Mythic.Core.GetParamMaxMp = function(id){
    return Mythic.Core.GetClassParams(id)[1];
}

Mythic.Core.GetParamAttack = function(id){
    return Mythic.Core.GetClassParams(id)[2];
}

Mythic.Core.GetParamDefense = function(id){
    return Mythic.Core.GetClassParams(id)[3];
}

Mythic.Core.GetParamMAttack = function(id){
    return Mythic.Core.GetClassParams(id)[4];
}

Mythic.Core.GetParamMDefense = function(id){
    return Mythic.Core.GetClassParams(id)[1];
}

Mythic.Core.GetParamAgility = function(id){
    return Mythic.Core.GetClassParams(id)[1];
}

Mythic.Core.GetParamMLuk = function(id){
    return Mythic.Core.GetClassParams(id)[1];
}

//================================================================

Mythic.Core.GetClassEXPParams = function(id){
    return $dataClasses[id].expParams;
}

Mythic.Core.GetEXPParamBase = function(id){
    return Mythic.Core.GetClassEXPParams(id)[0];
}

Mythic.Core.GetEXPParamExtra = function(id){
    return Mythic.Core.GetClassEXPParams(id)[1];
}

Mythic.Core.GetEXPParamAccA = function(id){
    return Mythic.Core.GetClassEXPParams(id)[2];
}

Mythic.Core.GetEXPParamAccB = function(id){
    return Mythic.Core.GetClassEXPParams(id)[3];
}

//================================================================

Mythic.Core.GetClassLearnings = function(id){
    return $dataClasses[id].learnings;
};

Mythic.Core.GetLearningLevel = function(id, index){
    return Mythic.Core.GetClassLearnings(id)[index].level;
};

Mythic.Core.GetLearningNote = function(id, index){
    return Mythic.Core.GetClassLearnings(id)[index].note;
};

Mythic.Core.GetLearningSkillId = function(id, index){
    return Mythic.Core.GetClassLearnings(id)[index].skillId;
};

//================================================================

Mythic.Core.PopulateMapFromArray = function(arr, map, propertyName){
    arr.forEach((el, i) => {
        if(i == 0) return;
        if(!propertyName) map.set(el, i)
        !propertyName ? map.set(el, i) : map.set(el[propertyName], i)
    })
}

Mythic.Core.MakeArrFromPropertyInObjectArr = function(arr, propertyName){
    function returnName(el, i){
        if(i == 0) 'return';
        return el[propertyName];
    };
    return arr.map((el, i) => returnName(el, i));
}

Mythic.Core.PopulateTraitMaps = function(){
    //Element Types
    Mythic.Core.PopulateMapFromArray($dataSystem.elements, Mythic.Core.ElementTypes);
    
    //Skill Types
    Mythic.Core.PopulateMapFromArray($dataSystem.skillTypes, Mythic.Core.SkillTypes);
    
    //Weapon Types
    Mythic.Core.PopulateMapFromArray($dataSystem.weaponTypes, Mythic.Core.WeaponTypes);
  
    //Armor Types
    Mythic.Core.PopulateMapFromArray($dataSystem.armorTypes, Mythic.Core.ArmorTypes);
    
    //Equipment Types
    Mythic.Core.PopulateMapFromArray($dataSystem.equipTypes, Mythic.Core.EquipmentTypes);
    
    //State Types
    Mythic.Core.PopulateMapFromArray($dataStates, Mythic.Core.StateTypes);

    //Data Troops
    Mythic.Core.PopulateMapFromArray($dataTroops, Mythic.Core.DataTroopsMap, 'name'); 
    
}

Mythic.Core.DataTroopsMap = new Map([]);


Mythic.Core.TraitTypes = new Map([
    ["element rate", 11],
    ["debuff rate", 12],
    ["state rate", 13],
    ["element resist", 11],
    ["parameter", 21],
    ["ex parameter", 22],
    ["sp parameter", 23],
    ["attack element", 31],
    ["attack state", 32],
    ["attack speed", 33],
    ["attack times", 34],
    ["add skill type", 41],
    ["seal skill type", 42],
    ["add skill", 43],
    ["seal skill", 44],
    ["equip weapon", 51],
    ["equip armor", 52],
    ["lock equip", 53],
    ["seal equip", 54],
    ["slot type", 55],
    ["action times", 61],
    ["special flag", 62],
    ["collapse effect", 63],
    ["party ability", 64],
]);

Mythic.Core.ParameterTypes = new Map([
    ["Max HP", 0],
    ["Max MP", 1],
    ["Attack", 2],
    ["Defense", 3],
    ["Magic Attack", 4],
    ["Magic Defense", 5],
    ["Agility", 6],
    ["Luck", 7]
]);

Mythic.Core.ExParameterTypes = new Map([
    ["Hit Rate", 0],
    ["Evasion Rate", 1],
    ["Critical Rate", 2],
    ["Critical Evasion", 3],
    ["Magic Evasion", 4],
    ["Magic Reflection", 5],
    ["Counter Attack", 6],
    ["HP Regeneration", 7],
    ["MP Regeneration", 8],
    ["TP Regeneration", 9]
]);

Mythic.Core.SpParameterTypes = new Map([
    ["Target Rate", 0],
    ["Guard Effect", 1],
    ["Recovery Effect", 2],
    ["Pharmacology", 3],
    ["MP Cost Rate", 4],
    ["TP Charge Rate", 5],
    ["Physical Damage", 6],
    ["Magical Damage", 7],
    ["Floor Damage", 8],
    ["Experience Rate", 9]
]);

Mythic.Core.SlotTypes = new Map([
    ["None", 0],
    ["Two-Handed", 1],
    ["One-Handed", 2]
]);

Mythic.Core.SpecialFlagTypes = new Map([
    ["Auto-Battle", 1],
    ["Guard", 2],
    ["Substitute", 3],
    ["Preserve TP", 4]
]);

Mythic.Core.CollapseEffectTypes = new Map([
    ["Normal", 0],
    ["Boss", 1],
    ["Instant", 2],
    ["No Collapse", 3]
]);

Mythic.Core.PartyAbilityTypes = new Map([
    ["Encounter Half", 1],
    ["Encounter None", 2],
    ["Cancel Surprise", 3],
    ["Raise Preemptive", 4],
    ["Double Gold", 5],
    ["Double Items", 6]
]);

// To be dynamically created with Mythic.Core.PopulateTraitMaps
Mythic.Core.ElementTypes = new Map([]);

Mythic.Core.SkillTypes = new Map([]);

Mythic.Core.WeaponTypes = new Map([]);

Mythic.Core.ArmorTypes = new Map([]);

Mythic.Core.StateTypes = new Map([]);

Mythic.Core.EquipmentTypes = new Map([]);

Mythic.Core.ClearMap = function(map){
    map = new Map();
};


Mythic.Core.GetClassTraits = function(id){
    return $dataClasses[id].traits;
}

Mythic.Core.GetTraitCode = function(id, index){
    return Mythic.Core.GetClassTraits(id)[index].code;
}

Mythic.Core.GetTraitDataId = function(id, index){
    return Mythic.Core.GetClassTraits(id)[index].dataId;
}

Mythic.Core.GetTraitValue = function(id, index){
    return Mythic.Core.GetClassTraits(id)[index].value;
}

Mythic.Core.GetCharacterSprites = function(){
    return SceneManager._scene.children[0]._characterSprites;
}

//================================================================
// Game_Map
//================================================================
Mythic.Core.GetElementFromName = function(arr, name){
    return arr.find(function(el){
        if(!el) return
        if(el.name === name) return el.id
    })
}

Mythic.Core.GetElementIdFromName = function(arr, name){
    return this.GetElementFromName(arr, name).id;
}

Mythic.Core.GetMapIdFromName = function(name){
    return parseInt(name.slice(3, 6))
}

Mythic.Core.GetAllCoordsFrom = function(startingX, endingX, startingY, endingY){
    let coords = [];
    for(var i = startingX; i < endingX; i++){
        for(var j = startingY; j < endingY; j++){
            coords.push([i, j]);
        }
    }
    return coords;
}

Game_Map.prototype.LEFT = 4;
Game_Map.prototype.RIGHT = 6;
Game_Map.prototype.UP = 8;
Game_Map.prototype.DOWN = 2;

Game_Map.prototype.playerTiles = function() {
    let t1 = $gameMap.tileId($gamePlayer.x, $gamePlayer.x, 0);
    let t2 = $gameMap.tileId($gamePlayer.x, $gamePlayer.x, 1);
    let t3 = $gameMap.tileId($gamePlayer.x, $gamePlayer.x, 2);
    let t4 = $gameMap.tileId($gamePlayer.x, $gamePlayer.x, 3); 
    return [t1, t2, t3, t4];
}

Game_Map.prototype.allTilesInRegion = function(regionId){
    let regionTiles = [];
    for(let i = 0; i < this.width(); i++){
        for(let j = 0; j < this.height(); j++){
            if(this.regionId(i, j) == regionId) regionTiles.push([i, j])
        }   
    }
    return regionTiles;
}

Game_Map.prototype.emptyTilesInRegion = function(regionId){
    let emptyTiles = [];
    this.allTilesInRegion(regionId).forEach( tile => {
        if(this.eventIdXy(tile[0], tile[1]) == 0) emptyTiles.push(tile);
    });
    return emptyTiles;
}

Game_Map.prototype.eventId = function(){
    return $gameMap._interpreter._eventId;
}

Game_Map.prototype.event = function(){
    return $gameMap._events[this.eventId()];
}

Game_Map.prototype.GetAllMapEventCoords = function(){
    return $gameMap._events.map((el, i) => {
        if(el) return [el.x, el.y];
    })
}

Game_Map.prototype.GetAllEventDistancesToPlayer = function(){
    return this._events.map((el, i) => { if(el) return el.DistanceToPlayer()});
}

Game_Map.prototype.isTilePassable = function(x, y){
    const d1 = $gameMap.isPassable(x, y, 2);
    const d2 = $gameMap.isPassable(x, y, 4);
    const d3 = $gameMap.isPassable(x, y, 6);
    const d4 = $gameMap.isPassable(x, y, 8);
    if(d1 && d2 && d3 && d4) return true;
    return false;
}


//================================================================
// Game_Player
//================================================================

Game_Player.prototype.isPlayer = function(){
    return true;
};

//================================================================
// Game_Event
//================================================================
Game_Event.prototype.MoveTypes = new Map([
    ["fixed", 0],
    ["random", 1],
    ["approach", 2],
    ["custom", 3]
]);

Game_Event.prototype.MoveSpeeds = new Map([
    ["slowest", 0],
    ["slower", 1],
    ["slow", 2],
    ["normal", 3],
    ["fast", 4],
    ["faster", 5]
]);

Game_Event.prototype.MoveFrequencies = new Map([
    ["lowest", 0],
    ["lower", 1],
    ["low", 2],
    ["normal", 3],
    ["high", 4],
    ["highest", 5]
]);

Game_Event.prototype.Priorities = new Map([
    ["below", 0],
    ["same", 1],
    ["above", 2],
]);


Game_Event.prototype.isEvent = function(){
    return true;
};

Game_Event.prototype.DistanceToPlayer = function(){
    return this.DistanceToCoords($gamePlayer.coords());
};

Game_Event.prototype.DistanceToCoords = function(coords){
    const x = Mythic.Utils.MakePositive(coords[0] - this._x);
    const y = Mythic.Utils.MakePositive(coords[1] - this._y);
    return x + y;
}

Game_Event.prototype.ChangeMoveType = function(moveType){
    this._moveType = this.MoveTypes.get(moveType);
}

Game_Event.prototype.ChangeMoveSpeed = function(moveSpeed){
    this._moveSpeed = this.MoveSpeeds.get(moveSpeed);
}

//================================================================
// Battle 
//================================================================

Mythic.Battle = Mythic.Battle || {};

Mythic.Battle.actorSprites = function(){
    BattleManager._spriteSet._actorSprites;
}

Mythic.Battle.enemySprites = function(){
    BattleManager._spriteSet._enemySprites;
}



//================================================================
// Game_Actor
//================================================================



//================================================================
// Game_Player
//================================================================



//================================================================
// Game_CharacterBase
//================================================================



//================================================================
// Game_CharacterBase
//================================================================

Game_CharacterBase.prototype.isPlayer = function(){
    return false;
};

Game_CharacterBase.prototype.isEvent = function(){
    return false;
};

Game_CharacterBase.prototype.coords = function(){
    return [this._x, this._y];
}

Game_CharacterBase.prototype.Directions = new Map([
    [4, 'left'],
    [6, 'right'],
    [2, 'down'],
    [8, 'up']
]);

Game_Map.prototype.yWithDirection = function(y, d) {
    return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
};

Game_Map.prototype.roundXWithDirection = function(x, d) {
    return this.roundX(x + (d === 6 ? 1 : d === 4 ? -1 : 0));
};

Game_CharacterBase.prototype.tileBehind = function(){
    switch(this._direction){
        //down 
        case 2:
            return {x: this._x, y: this._y - 1}
        //up 
        case 8:
            return {x: this._x, y: this._y + 1}            
        //left 
        case 4:
            return {x: this._x + 1, y: this._y}
        //right 
        case 6:
            return {x: this._x - 0, y: this._y}
    }
};

Game_CharacterBase.prototype.tileInFront = function(){
    switch(this._direction){
        //down 
        case 2:
            return {x: this._x, y: this._y + 1}
        //up 
        case 8:
            return {x: this._x, y: this._y - 1}            
        //left 
        case 4:
            return {x: this._x - 1, y: this._y}
        //right 
        case 6:
            return {x: this._x + 0, y: this._y}
    }
};

Game_CharacterBase.prototype.tileLeft = function(){
    switch(this._direction){
        //down 
        case 2:
            return {x: this._x + 1, y: this._y}
        //up 
        case 8:
            return {x: this._x - 1, y: this._y}            
        //left 
        case 4:
            return {x: this._x, y: this._y + 1}
        //right 
        case 6:
            return {x: this._x, y: this._y - 1}
    }
};

Game_CharacterBase.prototype.tileRight = function(){
    switch(this._direction){
        //down 
        case 2:
            return {x: this._x - 1, y: this._y}
        //up 
        case 8:
            return {x: this._x + 1, y: this._y}            
        //left 
        case 4:
            return {x: this._x, y: this._y - 1}
        //right 
        case 6:
            return {x: this._x, y: this._y + 1}
    }
};

// //=============================================================================
// // Utils
// //=============================================================================

Mythic.Utils = Mythic.Utils || {};

Mythic.Utils.Error = function(message){
    throw new Error(message);
}

Mythic.Utils.MakePositive = function(number){
    if(number < 0) return number * -1;
    return number;
}

Mythic.Utils.ConvertStringToNumber = function(string){
    return parseInt(string);
}

Mythic.Utils.DistanceBetweenCoords = function(coords1, coords2){
    return this.MakePositive(coords1[0] - coords2[0]) + this.MakePositive(coords1[1] - coords2[1]);
}

// Value Processing

Mythic.Utils.isNumber = function(value){
    return typeof value === "number";
}

Mythic.Utils.isString = function(value){
    return typeof value === "string";
}

Mythic.Utils.stringToBoolean = function(value){
    return value === true || value === false
}

Mythic.Utils.isBoolean = function(value){
    return typeof value === "boolean";
}

Mythic.Utils.isUndefined = function(value){
    return typeof value === "undefined";
}

Mythic.Utils.isBigInt = function(value){
    return typeof value === "bigInt";
}

Mythic.Utils.isSymbol = function(value){
    return typeof value === "symbol";
}

Mythic.Utils.isFunction = function(value){
    return typeof value === "function";
}

Mythic.Utils.isObject = function(value){
    return typeof value === "object";
}

Mythic.Utils.isObjectEmpty = function(object){
    return Object.keys(object).length == 0;
}

Mythic.Utils.isArrayEmpty = function(array){
    return array.length == 0;
}

Mythic.Utils.isNumberEven = function(number){
    return number % 2 === 0;
}

Mythic.Utils.divisibleBy = function(number, divisor){
    return number % divisor === 0;
}

Mythic.Utils.getLastElement = function(arr){
    return arr[arr.length - 1];
}


Mythic.Utils.getAllEventsInProximity = function(proximity, x, y){
    let events = [];
    for (let j = x - proximity; j < x + proximity; j++){
        for (let i = y - proximity; i < y + proximity; i++){
            if($gameMap.eventsXy(j, i).length) $gameMap.eventsXy(j, i).forEach(el => events.push(el));
        }    
    }
    return events;
}

//==================================================================================
// Random
//==================================================================================

Mythic.Random = Mythic.Random || {};

Mythic.Random.random = function(number){
    return Math.floor(Math.random() * number);
}

Mythic.Random.number = function(number){
    return  this.random(number);
}

Mythic.Random.numberWithMin = function(number, min){
    return this.random(number) + min;
}

Mythic.Random.getRandomElementByWeight = function(arr) {
    // Calculate the total weight
    const weightSum = arr.reduce((sum, element) => sum + element.weight, 0);
  
    // Generate a random number between 0 and weightSum
    const randomValue = this.random(weightSum);
  
    // Iterate through the array to find the element
    let currentWeight = 0;
    for (const element of arr) {
      currentWeight += element.weight;
      if (randomValue <= currentWeight) {
        return element;
      }
    }
  
    // This should never happen if the weights are properly defined
    return null;
}

Mythic.Random.getRandomElementInArray = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}


//==============================================================================
// Input
//==============================================================================

Mythic.Input = {};

Mythic.Input.Keys = new Map([
    ["backspace", 8],
    ["tab", 9],
    ["enter", 13],
    ["shift", 16],
    ["ctrl", 17],
    ["alt", 18],
    ["pause", 19],
    ["caps lock", 20],
    ["escape", 27],
    ["space", 32],
    ["page up", 33],
    ["page down", 34],
    ["end", 35],
    ["home", 36],
    ["left arrow", 37],
    ["up arrow", 38],
    ["right arrow", 39],
    ["down arrow", 40],
    ["insert", 45],
    ["delete", 46],
    ["0", 48],
    ["1", 49],
    ["2", 50],
    ["3", 51],
    ["4", 52],
    ["5", 53],
    ["6", 54],
    ["7", 55],
    ["8", 56],
    ["9", 57],
    ["a", 65],
    ["b", 66],
    ["c", 67],
    ["d", 68],
    ["e", 69],
    ["f", 70],
    ["g", 71],
    ["h", 72],
    ["i", 73],
    ["j", 74],
    ["k", 75],
    ["l", 76],
    ["m", 77],
    ["n", 78],
    ["o", 79],
    ["p", 80],
    ["q", 81],
    ["r", 82],
    ["s", 83],
    ["t", 84],
    ["u", 85],
    ["v", 86],
    ["w", 87],
    ["x", 88],
    ["y", 89],
    ["z", 90],
    ["left window key", 91],
    ["right window key", 92],
    ["select key", 93],
    ["numpad 0", 96],
    ["numpad 1", 97],
    ["numpad 2", 98],
    ["numpad 3", 99],
    ["numpad 4", 100],
    ["numpad 5", 101],
    ["numpad 6", 102],
    ["numpad 7", 103],
    ["numpad 8", 104],
    ["numpad 9", 105],
    ["multiply", 106],
    ["add", 107],
    ["subtract", 109],
    ["decimal point", 110],
    ["divide", 111],
    ["f1", 112],
    ["f2", 113],
    ["f3", 114],
    ["f4", 115],
    ["f5", 116],
    ["f6", 117],
    ["f7", 118],
    ["f8", 119],
    ["f9", 120],
    ["f10", 121],
    ["f11", 122],
    ["f12", 123],
    ["num lock", 144],
    ["scroll lock", 145],
    [";", 186],
    ["=", 187],
    [",", 188],
    ["-", 189],
    [".", 190],
    ["/", 191],
    ["`", 192],
    ["[", 219],
    ["\\", 220],
    ["]", 221],
    ["'", 222]
]);

//================================================================
// Window
//================================================================

Window_Base.prototype.changeFontSize = function(fontSize) {
    this.contents.fontSize = fontSize;
};

//================================================================
// Prototypes
//================================================================

function StateMachine(){
    this.initialize.apply(this, arguments);
}

StateMachine.prototype.States = new Map([]);

StateMachine.prototype.initialize = function(){
    this._states = [];
    this._currentState = '';
}

StateMachine.prototype.addState = function(newState){
    this._states.push(newState);
}

StateMachine.prototype.getState = function(){

}

StateMachine.prototype.update = function(){
    this._states.find(function(state, index, states){
        if(this._currentState === state.name) return state.update();
    });
}

function State(){
    this.initialize.apply(this, arguments);
}

State.prototype.initialize = function(){
    this._name = '';
    this._currentPhase = '';
    this._phases = '';
}

State.prototype.update = function(){};

//Switch
function Switch(){
    this._cases = new Map([]);
};

Switch.prototype.addCase = function(value, expression){
    this._cases.set(value, expression);
};

Switch.prototype.checkCase = function(value){
    return this._cases.get(value)();
}

