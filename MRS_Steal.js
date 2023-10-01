Mythic.Skill.Steal = {
    code: 101,
    dataId: 1,
    value1: 1,
    value2: 0,
}

function StealManager(){
    this.initialize.apply(this, arguments);
}

StealManager.prototype.CODE = 101;

StealManager.prototype.initialize = function(){
    this.items = [];
}

StealManager.prototype.addItem = function(type, name, quantity, weight){
    if(this.items.find( item => { return item.name == name && item.type == type })) return;
    this.items.push({type, name, quantity, weight});
};


Game_Action.prototype.itemEffectSteal = function(target, effect) {
    target.steal();
    target.result();    
    this.makeSuccess(target);
};

Game_Enemy.prototype.steal = function(){
    if ($gameParty.inBattle()) {
        if(this._stealItems.length > 0){
            this.performSteal();
        }
        else BattleManager._logWindow.addText(`There is nothing to steal`); 
    }
    Game_Battler.prototype.performDamage.call(this);
};

Game_Enemy.prototype.performSteal = function(arr){
    let subject = $gameParty.targetActor();
    let item = this._stealItems[Mythic.Core.RandomNumber(this._stealItems.length)];
    let roll = subject.stealthRoll();
    console.log(roll); 
    if(roll > item.chance){
        let number = Mythic.Core.RandomNumber(item.quantity) + 1;
        let itemIndex = this._stealItems.indexOf(item)
        this._stealItems[itemIndex].quantity -= number;
        if(this._stealItems[itemIndex].quantity <= 0) this._stealItems.splice(itemIndex, 1); 
        $gameParty.gainItem(item.item, number, false);
        BattleManager._logWindow.addText(`You stole ${number} ${item.item.name}!`);
    }
    else BattleManager._logWindow.addText(`You failed to steal anything`);
    
}