//=============================================================================
// Mythic Realms Studios- Proximity Manager
// MRS_ProximityManager.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_ProximityManager = true;

var Mythic = Mythic || {};
Mythic.ProximityManager = Mythic.ProximityManager || {};
Mythic.ProximityManager.version = '1.0.0';

Mythic.Core = Mythic.Core || {};
Mythic.Param = Mythic.Param || {};
Mythic.Command = Mythic.Command || {};
Mythic.Utils = Mythic.Utils || {};

//=============================================================================
/*: 
* @plugindesc Create a proximity manager to handle events that occur at a specific distance from a target
* @author Richard Guilliams
*
* @help 
* MRS plugins use a very specific tag format for processing tags and using them to incorporate important parameters into the game.
* because of this, tags use a special syntax.
* 
* 
* Version 1.00:
* - Finished plugin!
*/
//=============================================================================

/*
Proximity Managers will store a list of commands the will be activated when various parameters are met.
We 
*/

//=============================================================================
// Commands
//=============================================================================

Mythic.Command.Proximity = function(arguments){  
    let event = GetCurrentEvent();
    event.proximityManager = new ProximityManager(parseInt(arguments[0]));
    console.log(event);
}

Mythic.Command.Proximity_AddCommand = function(arguments){
    let event = GetCurrentEvent();
    let command = {
        name: arguments[0]
    };
    event.proximityManager.commands.push(command);
}

Mythic.Command.Proximity_AddCommandParameter = function(arguments){
    arguments.map((arg, i) => {
        if(!isNaN(arg)) arguments[i] = parseInt(arg);
    })
    let event = GetCurrentEvent();
    let command = event.proximityManager.commands.find(command => command.name === arguments[0]);
    command[arguments[1]] = arguments[2];
}

//=============================================================================
// ProximityManager
//=============================================================================

function ProximityManager(){
    this.initialize.apply(this, arguments);
}

ProximityManager.prototype.initialize = function(distance){
    this.distance = distance;
    this.commands = [];
}

ProximityManager.prototype.Blink = function(parameters){
    console.log(parameters);
}

ProximityManager.prototype.checkCommands = function(){
    this.commands.forEach(command => {
        eval(`this.${command.name}(command);`)
    });
}