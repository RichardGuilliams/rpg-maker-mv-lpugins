//=============================================================================
// Resource Node
// MRS_ResourceNode.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_ResourceNode = true;

var Mythic = Mythic || {};
Mythic.ResourceNode = Mythic.ResourceNode || {};
Mythic.ResourceNode.version = '1.0.0';

Mythic.Core = Mythic.Core || {};
Mythic.Utils = Mythic.Utils || {};
Mythic.GameData = Mythic.GameData || {};

//=============================================================================
/*: 
* @plugindesc This plugin allows events to be turned into resource nodes that can be harvested from. This allows farming simulators and survival gameresource harvests to be created with ease.
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
// Plugin Commands
//=============================================================================
