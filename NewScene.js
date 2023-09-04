//=============================================================================
// Mythic Realms Studios - New Scene
// NewScene.js
//=============================================================================

var Imported = Imported || {};
Imported.NewScene = true;

var Mythic = Mythic || {};
Mythic.Menu = Mythic.Menu || {};
Mythic.Menu.version = '1.0.0';

Mythic.Core = Mythic.Core || {};
Mythic.Utils = Mythic.Utils || {};
Mythic.Input = Mythic.Input || {};

//=============================================================================
/*: 
 * @plugindesc Creates The Menus for KnightFall
 * @author Richard Guilliams
 * 
 * @help This plugin does not provide plugin commands.
 * 
 * Version 1.0.0:
 * - Finished plugin!
*/
//=============================================================================

//=============================================================================
/*
This is a script meant to help make creating menus for rpg maker mv a much quicker and easier experience.
It provides users with the basic boilerplate needed to create any kind of custom menu needed.

how to use: 
Each Scene plus their corresponding windows each have a function invoked in their initialize functions called setParams.
in the setParams function the user should define all of the parameters that its corresponding object type will use.
We pass the new scene object into each windows creations function so that the window gains access to the parameters of its parent scene.
this is important to help make the alignment of windows easier as access to the width and height of the parent and the sibling windows
allows less hardcoding and allows a more dynamic approach.
*/
//=============================================================================


//=============================================================================
// Main Menu
//=============================================================================

// Input - creating a custom input trigger for the game
Input.keyMapper[Mythic.Input.Keys.get('p')] = "customMenu"

// Aliasing the update function of the Scene_Map.prototype to properly override its functionality.
Scene_New.aliasSceneMapUpdate = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    //calling the aliased update function before running the additional code.
    Scene_New.aliasSceneMapUpdate.call(this);
    // Checking if input is triggered and pushing the custom scene to the stack.
    if(Input.isTriggered('customMenu')) SceneManager.push(Scene_New); 
};

// Scene Character Select Menu
function Scene_New() {
    this.initialize.apply(this, arguments);
}

Scene_New.prototype = Object.create(Scene_MenuBase.prototype);
Scene_New.prototype.constructor = Scene_New;

Scene_New.prototype.initialize = function(parent, x, y) {
    Scene_MenuBase.prototype.initialize.call(this);
    this.setParams();
};

Scene_New.prototype.setParams = function() {
    this._screenWidth = Graphics.boxWidth;
    this._screenHeight = Graphics.boxHeight;
    this._padding = 10;
    this._margin = 10;
    this._height = 140; 
    this._width = 200;
};

Scene_New.prototype.create = function(){
    Scene_MenuBase.prototype.create.call(this);
    //Put all window initialization and other code here...
    this.createNewSelectableWindow();
}


//This is a command window so we must create commands for all window inputs here.
Scene_New.prototype.createNewSelectableWindow = function(){
    this._newSelectableWindow = new Window_NewSelectable(this, 0, 0, Window_NewSelectable.prototype.WIDTH, Window_NewSelectable.prototype.MAX_PAGE_ROWS + (this._padding * 2));
    this._newSelectableWindow.show();
    this._newSelectableWindow.select(0);
    this._newSelectableWindow.activate();
    this._newSelectableWindow.setHandler('ok', this.commandOk.bind(this));
    this._newSelectableWindow.setHandler('cancel', this.commandCancel.bind(this));
    // ImageManager.reserveFace('Actor2');
    this.addWindow(this._newSelectableWindow);
}

Scene_New.prototype.commandCancel = function(){
    if(this._newSelectableWindow.visible) {
        this._newSelectableWindow.hide();
        this._newSelectableWindow.deactivate();
    }
    else {
        this.popScene();
    }
}

Scene_New.prototype.commandOk = function(){
    if(!this._newSelectableWindow.visible) {
        this._newSelectableWindow.show();
        this._newSelectableWindow.activate();
    }
}

//=======================================================================
// Window_Base
//=======================================================================

/**
 * @example
 * Window_NewSelectable(parent, x, y, width, height);
*/
function Window_NewSelectable(){
    this.initialize.apply(this, arguments);
}

Window_NewSelectable.prototype = Object.create(Window_Selectable.prototype);
Window_NewSelectable.prototype.constructor = Window_NewSelectable;

Window_NewSelectable.prototype.WIDTH = 300;
Window_NewSelectable.prototype.MAX_PAGE_ROWS = 4;


Window_NewSelectable.prototype.initialize = function(parent, x, y, width, height){
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.changeFontSize(18);
    this.setParams(parent);
    this.refresh();
    this.hide();
}

Window_NewSelectable.prototype.setParams = function(parent){
    this._parent = parent;
}

//=======================================================================
// Window_Base
//=======================================================================

Window_Base.prototype.MAX_PAGE_ROWS = 4;
