//=============================================================================
// Merge Objects
// MRS_Fusion.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_Fusion = true;

var Mythic = Mythic || {};
Mythic.Fuse = Mythic.Fuse || {};
Mythic.Fuse.version = '1.0.0';

// Plugin Imports
Mythic.Command = 
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

var createExpParams = (class1Id, class2Id) =>{
    window['expParam1'] = $dataClasses[class1Id].expParams;
    window['expParam2'] = $dataClasses[class2Id].expParams;
}

//=============================================================================
// Plugin Commands
//=============================================================================

Mythic.Command.MRS_FuseClass = function(args){

}

//=============================================================================
// Fuse
//=============================================================================

//=============================================================================
// Game_Actor
//=============================================================================
Mythic.Fuse.Class = function(class1, class2){
    let newClass = Mythic.Copy.copyData(class1);
    newClass.id = $dataClasses.length;
    newClass.fusionInfo = {};
    newClass.fusionInfo.parents = { 1: class1, 2: class2};
    
    console.log(newClass);
    this.expParams(newClass, class1, class2);
    let fusedClass = {};
    $dataClasses.push(newClass);
}

Mythic.Fuse.expParams = function(newClass, class1, class2){
    let classes = [class1, class2];
    newClass.fusionInfo.expParamsInheritingParent = [];
    newClass.expParams.map((param, index, arr) => {
        let inheritingClass = Mythic.Random.number(classes.length);
        newClass.fusionInfo.expParamsInheritingParent.push(inheritingClass + 1);
        arr[index] = classes[inheritingClass].expParams[index];
        console.log(arr)
    });
}

// Weapons 
