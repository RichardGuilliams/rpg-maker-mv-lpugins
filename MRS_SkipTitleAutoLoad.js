//=============================================================================
// Dev Plugins - Skip Title Screen And Auto Load Game 
// MRS_SkipTitleAutoLoad.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_SkipTitleAutoLoad = true;
var Mythic = Mythic || {};
Mythic.SkipTitleAutoLoad = Mythic.SkipTitleAutoLoad || {};
Mythic.SkipTitleAutoLoad.version = '1.0.0';

//=============================================================================
/*:
 *  @title Skip Title Screen And Auto Load Game
 *  @author Richard Guilliams
 *  @plugindesc This is a plugin
 * 
 *  @param Save File Id
 *  @desc Chooses which save file to load. choose 0 for none.
 *  @type Number
 *  @default 0
 * 
 * @help
 * This is the help section....
 */
//=============================================================================


(function() {
    var parameters = PluginManager.parameters('MRS_SkipTitleAutoLoad');
    var saveFileId = Number(parameters['Save File Id'] || 0); // Default index if not specified

    Scene_Title.prototype.start = function() {
        if (DataManager.isAnySavefileExists()) { // Get chosen index from parameters
            if (saveFileId === 0) {
                DataManager.setupNewGame();
            } else {
                DataManager.loadGame(saveFileId);
            }
        } else {
            DataManager.setupNewGame();
        }
        SceneManager.goto(Scene_Map);
    };
})();
