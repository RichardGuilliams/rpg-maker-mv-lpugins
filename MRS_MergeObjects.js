//=============================================================================
// Merge Objects
// MRS_MergeObjects.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_MergeObjects = true;

var Mythic = Mythic || {};
Mythic.Merge = Mythic.Merge || {};
Mythic.Merge.version = '1.0.0';

// Plugin Imports
Mythic.Core = Mythic.Core || {};
Mythic.Utils = Mythic.Utils || {};
Mythic.GameData = Mythic.GameData || {};

//=============================================================================
/*: 
* @plugindesc This plugin allows users to merge objects together to create a new object with stats inherited or boosted by its merged objects stats
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
