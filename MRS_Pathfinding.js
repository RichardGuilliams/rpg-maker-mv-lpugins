//=============================================================================
// Mythic Realms Studios- Core
// MRS_MovementManager.js
//=============================================================================

var Imported = Imported || {};
Imported.MRS_MovementManager = true;

var Mythic = Mythic || {};
Mythic.Pathfinder = Mythic.Pathfinder || {};
Mythic.Pathfinder.version = '1.0.0';

Mythic.Command = Mythic.Command || {};
Mythic.Core = Mythic.Core || {};
Mythic.Param = Mythic.Param || {};
Mythic.Utils = Mythic.Utils || {};

//=============================================================================
/*: 
* @plugindesc Creates and Modifies important parameters of the games base objects as well as adds additional functianality for easier development..
* @author Richard Guilliams
*
* @help 
* MRS plugins use a very specific tag format for processing tags and using them to incorporate important parameters into the game.
* because of this, tags use a special syntax.
* To enable proximity chasing for event. place <Proximity Chase><Proximity Chase Radius: 8><Proximity Chase Speed: 4.25> 
* 
* Version 1.00:
* - Finished plugin!
*/
//=============================================================================

//=============================================================================
// Path Node

//=============================================================================
function PathNode(){
    this.initialize.apply(this, arguments);
}

PathNode.prototype.constructor = PathNode;

PathNode.prototype.initialize = function(x, y){
    this.parentNodeIndex = 0;
    this.parentNode = {};
    this.currentDistance = 0;
    this.baseNode = false;
    this.pathfinder = {};
    this.passable = false;
    this.x = x;
    this.y = y;
    this.leftNode = {};
    this.leftDistance = 0;
    this.leftPassable = false;
    this.leftActive = false;
    this.leftFailed = false;
    this.rightNode = {};
    this.rightDistance = 0;
    this.rightPassable = false;
    this.topNode = {};
    this.topDistance = 0;
    this.topPassable = false;
    this.bottomNode = {};
    this.bottomDistance = 0;
    this.bottomPassable = false;
    this.distances = [];
    this.openList = [];
    this.closedList = [];
    this.coordsList = [];
};

PathNode.prototype.CurrentDistance = function(){
    return Mythic.Utils.DistanceBetweenCoords([this.x, this.y], [this.parent.targetX, this.parent.targetY]);
};

PathNode.prototype.getSiblingNodesSorted = function(){
    var siblingNodes = [this.leftNode, this.rightNode, this.topNode, this.bottomNode];
    return siblingNodes.sort((a, b) => a.CurrentDistance - b.CurrentDistance);
}

PathNode.prototype.setLeftDistance = function(){
    if(this.leftNode){
        this.leftDistance = Mythic.Utils.DistanceBetweenCoords([this.leftNode.x, this.leftNode.y], [this.parent.targetX, this.parent.targetY]);
    }
}

PathNode.prototype.setRightDistance = function(){
    if(this.rightNode){
        this.rightDistance = Mythic.Utils.DistanceBetweenCoords([this.rightNode.x, this.rightNode.y], [this.parent.targetX, this.parent.targetY]);
    }
}

PathNode.prototype.setTopDistance = function(){
    if(this.topNode){
        this.topDistance = Mythic.Utils.DistanceBetweenCoords([this.topNode.x, this.topNode.y], [this.parent.targetX, this.parent.targetY]);
    }
}

PathNode.prototype.setBottomDistance = function(){
    if(this.bottomNode){
        this.bottomDistance = Mythic.Utils.DistanceBetweenCoords([this.bottomNode.x, this.bottomNode.y], [this.parent.targetX, this.parent.targetY]);
    }
}

PathNode.prototype.startSearch = function(){
    this.parent.startingNode = this;
    this.baseNode = true;
    this.openList.push(this);
    this.generateSearchList();
};

PathNode.prototype.targetNode = function(){
    return this.parent.nodes.find(node => node.x === this.parent.targetX && node.y === this.parent.targetY);
}

PathNode.prototype.removeFromOpenList = function(node) {
    const index = this.parent.startingNode.openList.indexOf(node);
    if (index !== -1) {
        this.parent.startingNode.openList.splice(index, 1);
        this.parent.startingNode.closedList.push(node);
    }
};


//TODO Incorporate while loop here to ensure that the entire search takes place in a single run.
PathNode.prototype.generateSearchList = function(){
    const closedList = this.parent.startingNode.closedList;
    const openList = this.parent.startingNode.openList;
    if(openList.length > 0 && closedList.indexOf(this.parent.startingNode.targetNode() == -1) && openList[0].constructor == PathNode){
        openList[0].getSiblingNodesSorted().forEach(node => {
            if (node && node.constructor == PathNode && closedList.indexOf(node) == -1 && openList.indexOf(node) == -1) {
                node.parentNode = this;
                node.parentNodeIndex = closedList.length;
                openList.push(node);
            }
        });
    }
    this.removeFromOpenList(openList[0]);
    if(closedList.indexOf(this.parent.startingNode.targetNode()) > -1) {
        this.findNodeChain();
        this.baseNode = false;
    }
};

PathNode.prototype.findNodeChain = function(){
    const startingNode = this.parent.startingNode;
    const closedList = startingNode.closedList;
    const index = closedList.indexOf(startingNode.targetNode()); 
    var coordsList = [];
    closedList[index].createCoordList(coordsList);
    this.coordsList = coordsList.reverse();;
    console.log(this.coordsList);
}

//TODO Remove 1st element of coordsList before entering while loop. it represents the tile the event occupies.

PathNode.prototype.createCoordList = function(coordsList) {
    const visitedNodes = new Set(); // Keep track of visited nodes to avoid infinite loops
    
    while (this && this.parentNodeIndex > 0 && !visitedNodes.has(this)) {
        coordsList.push([this.x, this.y]);
        visitedNodes.add(this);
        this = this.closedList[this.parentNodeIndex];
    }
};

PathNode.prototype.reset = function(){
    this.parentNode = {};
    this.parentNodeIndex = 0;
    this.baseNode = false;
    this.openList = [];
    this.closedList = [];
    this.coordsList = [];
};

PathNode.prototype.update = function(){
    this.setBottomDistance();
    this.setTopDistance();
    this.setLeftDistance();
    this.setRightDistance();
    this.distances = [this.leftNode, this.rightNode, this.topNode, this.bottomNode];
    if(this.baseNode) this.generateSearchList();
};

//=============================================================================
// Pathfinder
//=============================================================================


function Pathfinder(){
    this.initialize.apply(this, arguments);
}

Pathfinder.prototype.constructor = Pathfinder;

Pathfinder.prototype.initialize = function(){
    this.startingNode = {};
    this.searchStarted = false;
    this.parent = {};
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.distanceToTarget = 0;
    this.mapWidth = 0;
    this.mapHeight = 0;
    this.nodes = [];
    this.nodeBranches = [];
    this.setup();
}

Pathfinder.prototype.setup = function(){
    this.mapWidth = $gameMap.width();
    this.mapHeight = $gameMap.height();
    
    this.createNodes();
    this.setupNodes();
}

Pathfinder.prototype.setupNodes = function(){
    this.nodes.map((node) => {
        this.setupConnectedNodes(node);
    });
}

Pathfinder.prototype.setupConnectedNodes = function(node){
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.LEFT)) node.leftNode = this.nodes.find((el) => el.x === node.x - 1 && el.y === node.y);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.RIGHT))   node.rightNode = this.nodes.find((el) => el.x === node.x + 1 && el.y === node.y);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.UP))     node.topNode = this.nodes.find((el) => el.x === node.x && el.y === node.y - 1);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.DOWN))    node.bottomNode = this.nodes.find((el) => el.x === node.x && el.y === node.y + 1);
}

Pathfinder.prototype.createNodes = function(){
    this.nodes = [];
    for(i = 0; i < this.mapHeight; i++){
        for(j = 0; j < this.mapWidth; j++){
            if($gameMap.isTilePassable(j, i)){
                this.nodes.push(new PathNode(i, j));
                this.nodes[this.nodes.length - 1].parent = this;           
            }
        }
    }
}
    
Pathfinder.prototype.shortestPathToTarget = function(){
    this.setStartingNode();
    this.startingNode.startSearch();
}

Pathfinder.prototype.setStartingNode = function(){
    this.startingNode = this.nodes.find(node => node.x == this.parent._x && node.y == this.parent._y);
}

Pathfinder.prototype.restart = function(){
    this.startingNode = {};
    this.targetX = $gamePlayer._x;
    this.targetY = $gamePlayer._y;
    this.x = this.parent._x;
    this.y = this.parent._y;
    this.setStartingNode();
    this.nodes.forEach( node => node.reset());
    this.shortestPathToTarget();
};

Pathfinder.prototype.update = function(){
    if(this.nodes.length ==0) return this.restart();
    this.nodes.forEach( node => {
        node.update();
    })
    if(!this.searchStarted) {
        this.searchStarted = true;
        this.shortestPathToTarget();
    }
}
//=============================================================================
// Game Event
//=============================================================================

Game_Event.prototype.createPathfinder = function(){
    this.pathfinder = new Pathfinder();
    this.pathfinder.x = this._x;
    this.pathfinder.y = this._y;
    this.pathfinder.targetX = $gamePlayer._x;
    this.pathfinder.targetY = $gamePlayer._y;
    this.pathfinder.parent = this;
};

Mythic.Pathfinder.GameEventUpdate = Game_Event.prototype.update;
Game_Event.prototype.update = function(){
    Mythic.Pathfinder.GameEventUpdate.call(this, arguments);
    if(this.pathfinder) this.pathfinder.update();
}