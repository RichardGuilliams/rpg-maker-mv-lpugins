//=============================================================================
// Mythic Realms Studios- Party Member Clones
// MRS_PartyClones.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_PartyClones = true;

var Mythic = Mythic || {};
Mythic.Clone = Mythic.Clone || {};
Mythic.Clone.version = '1.0.0';

Mythic.Core = Mythic.Core || {};
Mythic.Utils = Mythic.Utils || {};
Mythic.Copy = Mythic.Copy || {};
Mythic.GameData = Mythic.GameData || {};

//=============================================================================
/*: 
* @plugindesc Allows users to clone actors so the can have multiple party members of the same actor type.
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

Mythic.Command.MRS_AddPartyMember = function(arguments){
    Mythic.Clone.NewPartyMember(arguments[0]);
}

//=============================================================================
// Create New Party Member
//=============================================================================

Mythic.Clone.NewPartyMember = function(actorName){
    let newActor = this.NewActor(actorName);
    this.NewClass($dataClasses[newActor.classId].name);
    newActor.classId = $dataClasses.length - 1;
    $gameParty._actors.push(newActor.id);
    this.UpdateActorData($dataActors);
}

Mythic.GameData.$data = {};

//========================================================================================================
// Create New Object
//========================================================================================================

Mythic.Clone.NewObject = function(dataArr, dataName){
    let newObj = Mythic.Copy.copyData(Mythic.Core.GetElementFromName(dataArr, dataName));
    newObj.id = dataArr.length;
    dataArr.push(newObj);
    return newObj;
};

Mythic.Clone.NewActor = function(actorName){
    return this.NewObject($dataActors, actorName);
}

Mythic.Clone.NewClass = function(className){
    return this.NewObject($dataClasses, className);
}

Mythic.Clone.NewSkill = function(skillName){
    return this.NewObject($dataSkills, skillName);
}

Mythic.Clone.NewItem = function(itemName){
    return this.NewObject($dataItems, itemName);
}

Mythic.Clone.NewWeapon = function(weaponName){
    return this.NewObject($dataWeapons, weaponName);
}

Mythic.Clone.NewArmor = function(armorName){
    return this.NewObject($dataArmors, armorName);
}

Mythic.Clone.NewEnemy = function(enemyName){
    return this.NewObject($dataEnemies, enemyName);
}

Mythic.Clone.NewTroop = function(troopName){
    return this.NewObject($dataTroops, troopName);
}

Mythic.Clone.NewState = function(stateName){
    return this.NewObject($dataStates, stateName);
}

//========================================================================================================
// Update Game Data
//========================================================================================================

Mythic.Clone.UpdateData = function(dataName, dataArr){
    Mythic.GameData.$data[dataName] = Mythic.Copy.copyData(dataArr);
}

Mythic.Clone.UpdateActorData = function(){
    this.UpdateData('Actors', $dataActors);
}

Mythic.Clone.UpdateClassData = function(){
    this.UpdateData('Classes', $dataClasses);
}

Mythic.Clone.UpdateSkillData = function(){
    this.UpdateData('Skills', $dataSkills);
}

Mythic.Clone.UpdateItemData = function(){
    this.UpdateData('Items', $dataItems);
}

Mythic.Clone.UpdateWeaponData = function(){
    this.UpdateData('Weapons', $dataWeapons);
}

Mythic.Clone.UpdateArmorData = function(){
    this.UpdateData('Armors', $dataArmors);
}

Mythic.Clone.UpdateEnemyData = function(){
    this.UpdateData('Enemies', $dataEnemies);
}

Mythic.Clone.UpdateTroopData = function(){
    this.UpdateData('Troops', $dataTroops);
}

Mythic.Clone.UpdateStateData = function(){
    this.UpdateData('States', $dataStates);
}

