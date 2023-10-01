//=============================================================================
// Mythic Realms Studios - Skill
// MRS_Skill.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_Skill = true;

var Mythic = Mythic || {};
Mythic.Skill = Mythic.Skill || {};
Mythic.Skill.version = '1.0.0';

Mythic.Core = Mythic.Core || {};
Mythic.Param = Mythic.Param || {};
Mythic.Command = Mythic.Command || {};
Mythic.Utils = Mythic.Utils || {};
Mythic.GameData = Mythic.GameData || {};

//=============================================================================
/*: 
 * @plugindesc Utilities to make custom skill creation in game an easier process.
 * @author Richard Guilliams
 *
 * @help This plugin does not provide plugin commands.
 * 
 * Version 1.0.0:
 * - Finished plugin!
*/
//=============================================================================
// we need to dynamically be able to create these Skill in the game with a mix of plugin commands and metadata. If possible

//=============================================================================
// Commands
//=============================================================================

Mythic.Command.MRS_CreateSkill = function(args){  
    let name = args[0];
    Mythic.Skill[`${name}`] = {};
}

//=============================================================================
// Commands
//=============================================================================

// Mythic.Skill.SkillMap = new Map([]);

Mythic.Skill.AddSkill = function(name, callback){
    let skill = Mythic.Skill.AddCode(callback);
    this.SkillCodes.set(skill.data.code, name);
    this.Skills.set(name, skill);
}

Mythic.Skill.getSkillByCode = function(code){
   return this.Skills.get(this.SkillCodes.get(code));
}

Mythic.Skill.UpdateCode = function(){
    this.CODE += 1;
    return this.CODE - 1;
}

Mythic.Skill.AddCode = function(callback){
    let skill = {
        data: {
            code: this.UpdateCode(),
            dataId: 1,
            value1: 1,
            value2: 0,
        },
        action: callback
    }
    return skill;
}

Mythic.Skill.applyItemEffect = Game_Action.prototype.applyItemEffect 
Game_Action.prototype.applyItemEffect = function(target, effect) {
    Mythic.Skill.applyItemEffect.call(this, target, effect);
    Mythic.Skill.getSkillByCode(effect.code).action();
};


// Game_Action.prototype.processSpecialSkill = function(){
//     let skill = $dataSkills[BattleManager._action._item._itemId].name;
//     if(skill === 'Steal') $dataSkills[BattleManager._action._item._itemId].effects[0] = Mythic.Skill.Steal;
// }

// Game_Action.prototype.Skills = new Switch();

// Game_Action.prototype.addSkill = function(name, callback){
//     this.Skills.addSkill(name, callback);
// }

Mythic.Skill.setup = function(){
    this.CODE = 101;
    this.Skills = new Map([]);
    this.SkillCodes = new Map([]);
}

Mythic.Skill.setup();

Mythic.Skill.processEnemyNoteTags = function(enemyId){
    let notes = $dataEnemies[enemyId].note.split('\n');
    notes.filter(function(note){
        if(note.contains('MRS_Property')) console.log(note);
    });
    notes.map((note, i, arr) => {
        this.notes[i] = note.split(' ');
        this[this.notes]
    });
}

Mythic.Skill.aliasGameEnemyInitialize = Game_Enemy.prototype.initialize 
Game_Enemy.prototype.initialize = function(enemyId, x, y) {
    Mythic.Skill.aliasGameEnemyInitialize.call(this, enemyId, x, y);
    Mythic.Skill.processEnemyNoteTags.call(this, enemyId);
};

Game_Enemy.prototype.addProperty = function(name, value){
    if(!this[name]) this[name] = value;
    else new Error('This property already exists');
}
