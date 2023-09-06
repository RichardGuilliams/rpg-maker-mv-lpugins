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
* @plugindesc Creates and Modifies important parameters of the games base objects as well as adds additional functionality for easier development..
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
// Plugin Command Processing
//=============================================================================
/**
 * 
 * @return 
 */

/**
 * 
 * @param {*} arguments - this command only has one element in its arguments. 
 * this element is the name parameter and will be used to either set the target as the player or another event on the map.
 */
Mythic.Command.Pathfinder = function(arguments){
    target = {};
    if(arguments[0] === 'Player') target = $gamePlayer;
    else target = GetEventByName(arguments[0]);
    if(Mythic.Utils.isObjectEmpty(target)) return console.log('this is not a target');

    GetCurrentEvent().createPathfinder();
    GetCurrentEvent().pathfinder.setTarget(target);
};

//=============================================================================
// Path Node
//=============================================================================
function PathNode(){
    this.initialize.apply(this, arguments);
}

PathNode.prototype.initialize = function(x, y){
    this.previousNodeIndex = 0;
    this.parentNode = {};
    this.currentDistance = 0;
    // this.baseNode = false;
    this.pathfinder = {};
    this.passable = false;
    this.x = x;
    this.y = y;
    this.leftNode = {};
    this.leftDistance = 0;
    this.leftActive = false;
    this.leftFailed = false;
    this.nodeOccupied = false;
    this.rightNode = {};
    this.rightDistance = 0;
    this.topNode = {};
    this.topDistance = 0;
    this.bottomNode = {};
    this.bottomDistance = 0;
    this.cost = 0;
    this.distances = [];
};

PathNode.prototype.CurrentDistance = function(){
    return Mythic.Utils.DistanceBetweenCoords([this.x, this.y], [this.parent.target._x, this.parent.target._y]);
};

PathNode.prototype.getSiblingNodesSorted = function(){
    var siblingNodes = [this.leftNode, this.rightNode, this.topNode, this.bottomNode];
    return siblingNodes.sort((a, b) => a.CurrentDistance - b.CurrentDistance);
}

PathNode.prototype.setLeftDistance = function(){
    if(this.leftNode){
        this.leftDistance = Mythic.Utils.DistanceBetweenCoords([this.leftNode.x, this.leftNode.y], [this.parent.target._x, this.parent.target._y]);
    }
}

PathNode.prototype.setRightDistance = function(){
    if(this.rightNode){
        this.rightDistance = Mythic.Utils.DistanceBetweenCoords([this.rightNode.x, this.rightNode.y], [this.parent.target._x, this.parent.target._y]);
    }
}

PathNode.prototype.setTopDistance = function(){
    if(this.topNode){
        this.topDistance = Mythic.Utils.DistanceBetweenCoords([this.topNode.x, this.topNode.y], [this.parent.target._x, this.parent.target._y]);
    }
}

PathNode.prototype.setBottomDistance = function(){
    if(this.bottomNode){
        this.bottomDistance = Mythic.Utils.DistanceBetweenCoords([this.bottomNode.x, this.bottomNode.y], [this.parent.target._x, this.parent.target._y]);
    }
}

PathNode.prototype.reset = function(){
    this.parentNode = {};
    this.previousNodeIndex = 0;
};

PathNode.prototype.isNodeOccupied = function(){
    // Need to account for if the events have _through set to true
    if($gameMap.eventsXy(this.x, this.y).length > 0) return true;
    if($gameMap.partyMemberXy(this.x, this.y).length > 0 && !this.partyMemberTarget()) return true;
    return false;
}

PathNode.prototype.partyMemberTarget = function(){
    return $gameMap.partyMemberXy(this.x, this.y).indexOf(this.parent.target) !== -1;
}

PathNode.prototype.update = function(){
    this.setBottomDistance();
    this.setTopDistance();
    this.setLeftDistance();
    this.setRightDistance();
    this.distances = [this.leftNode, this.rightNode, this.topNode, this.bottomNode];
};

//=============================================================================
// Pathfinder
//=============================================================================


function Pathfinder(){
    this.initialize.apply(this, arguments);
}

Pathfinder.prototype.initialize = function(){
    this.event = GetCurrentEvent();
    this.startingNode = {};
    this.searchStarted = false;
    this.targetAcquired = false;
    this.target = {};
    this.target.x = 0;
    this.target.y = 0;
    this.targetNode = {};
    this.distanceToTarget = 0;
    this.mapWidth = $gameMap.width();;
    this.mapHeight = $gameMap.height();;
    this.nodes = [];
    this.nodeBranches = [];
    this.openList = [];
    this.closedList = [];
    this.coordList = [];
    this.currentNode = {};
    this.setup();
}

Pathfinder.prototype.setup = function(){
    this.parent = GetCurrentEvent();    
    this.createNodes();
    this.setupNodes();
}

//================================================================
// Pathfinder Target Setup
//================================================================

Pathfinder.prototype.setTarget = function(target){
    this.target = target;
    if(this.target) this.targetAcquired = true;
    this.setTargetNode();
}

Pathfinder.prototype.distanceToTarget = function(){
}

//================================================================
// Pathfinder Node Setup
//================================================================

Pathfinder.prototype.setupNodes = function(){
    this.nodes.map((node) => {
        this.setupConnectedNodes(node);
    });
}

Pathfinder.prototype.setTargetNode = function(){
    this.targetNode = this.nodes.find(node => node.x === this.target._x && node.y === this.target._y);
}

Pathfinder.prototype.setupConnectedNodes = function(node){
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.LEFT))    node.leftNode = this.nodes.find((el) => el.x === node.x - 1 && el.y === node.y);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.RIGHT))   node.rightNode = this.nodes.find((el) => el.x === node.x + 1 && el.y === node.y);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.UP))      node.topNode = this.nodes.find((el) => el.x === node.x && el.y === node.y - 1);
    if($gameMap.isPassable(node.x, node.y, Game_Map.prototype.DOWN))    node.bottomNode = this.nodes.find((el) => el.x === node.x && el.y === node.y + 1);
}

Pathfinder.prototype.createNodes = function(){
    this.nodes = [];
    for(i = 0; i < this.mapHeight; i++){
        for(j = 0; j < this.mapWidth; j++){
            if($gameMap.isTilePassable(j, i)){
                this.nodes.push(new PathNode(j, i));
                this.nodes[this.nodes.length - 1].parent = this;           
            }
        }
    }
}
PathNode.prototype.generateCoordList = function(){ 
    var coordList = [];
    this.createCoordList();
    this.coordList = coordList.reverse();
    console.log(this.coordList);
}

Pathfinder.prototype.setStartingNode = function(){
    this.startingNode = this.nodes.find(node => node.x == this.event._x && node.y == this.event._y);
    this.startingNode.cost = this.startingNode.CurrentDistance();
}

Pathfinder.prototype.resetNodes = function(){
    this.nodes.forEach( node => node.reset());
};

//================================================================
// Pathfinder Coords List
//================================================================

Pathfinder.prototype.createCoordList = function() {
    this.currentNode = this.closedList[this.closedList.length - 1];
    const visitedNodes = new Set(); // Keep track of visited nodes to avoid infinite loops

    while (this.currentNode && this.currentNode.previousNodeIndex >= 0 && !visitedNodes.has(this.currentNode.previousNodeIndex)) {
        this.coordList.push([this.currentNode.x, this.currentNode.y]);
        visitedNodes.add(this.currentNode.previousNodeIndex);
        this.currentNode = this.closedList[this.currentNode.previousNodeIndex];
    }

    this.coordList = this.coordList.reverse();
};

Pathfinder.prototype.findClosestPath = function(){

}

Pathfinder.prototype.removeFromOpenList = function(node) {
    const index = this.openList.indexOf(node);
    if (index !== -1) {
        this.openList.splice(index, 1);
        this.closedList.push(node);
    }
};

Pathfinder.prototype.startSearch = function(){
    this.openList.push(this.startingNode);
    this.generateSearchList();
};

Pathfinder.prototype.targetFound = function() {
    return this.closedList.indexOf(this.targetNode);
}



//TODO Incorporate while loop here to ensure that the entire search takes place in a single run.
Pathfinder.prototype.generateSearchList = function(){
    while(this.closedList.indexOf(this.targetNode) == -1 && this.openList.length > 0){
        this.openList[0].getSiblingNodesSorted().forEach(node => {
            if (node && node.constructor == PathNode && this.closedList.indexOf(node) == -1 && this.openList.indexOf(node) == -1 && !node.isNodeOccupied()) {
                node.parentNode = this.startingNode;
                node.previousNodeIndex = this.closedList.length;
                node.cost = this.nodes[node.previousNodeIndex].cost + 1 + node.CurrentDistance();
                this.openList.push(node);
            }
        });
        this.removeFromOpenList(this.openList[0]);

    }
    if(this.closedList.indexOf(this.targetNode) > -1) {
        this.createCoordList();
    }
    else{
        this.findClosestPath();
    } 
        
    // if the closedList does not contain the target node. we will have to generate a route to the closest node to the target node.
};

Pathfinder.prototype.selectNewTarget = function(){

};

Pathfinder.prototype.targetLastPartyMember = function(){
    let followers = $gamePlayer._followers._data;
    this.setTarget(followers[followers.length - 1]);
    this.restart();
}

Pathfinder.prototype.findClosestPath = function(){
    this.currentNode = this.closedList.sort(function(a, b){
        return (a.cost + a.CurrentDistance()) - (b.cost + b.CurrentDistance())
    })[0];
    const visitedNodes = new Set(); // Keep track of visited nodes to avoid infinite loops
    while (this.currentNode && this.currentNode.previousNodeIndex >= 0 && !visitedNodes.has(this.currentNode.previousNodeIndex)) {
        this.coordList.push([this.currentNode.x, this.currentNode.y]);
        visitedNodes.add(this.currentNode.previousNodeIndex);
        this.currentNode = this.closedList[this.currentNode.previousNodeIndex];
    }

    this.coordList = this.coordList.reverse();
}
    
Pathfinder.prototype.shortestPathToTarget = function(){
    this.resetNodes();
    this.setStartingNode();
    this.setTargetNode();
    this.startSearch();
}


Pathfinder.prototype.restart = function(){
    this.startingNode = {};
    this.coordList = [];
    this.openList = [];
    this.closedList = [];
    this.x = this.parent._x;
    this.y = this.parent._y;
    this.shortestPathToTarget();
};

Pathfinder.prototype.updateNodes = function(){
    this.nodes.forEach( node => {
        node.update();
    })
}


Pathfinder.prototype.update = function(){
    if(this.nodes.length == 0) return this.restart();
    this.updateNodes();
    if(!this.searchStarted && this.targetAcquired && this.coordList.length > 0) {
        this.searchStarted = true;
        this.restart();
    }
}
//=============================================================================
// Game Event
//=============================================================================

Game_Event.prototype.createPathfinder = function(){
    this.pathfinder = new Pathfinder();
    this.pathfinder.x = this._x;
    this.pathfinder.y = this._y;
    this.pathfinder.parent = this;
    this.directionList = [];
};



Mythic.Pathfinder.GameEventUpdate = Game_Event.prototype.update;
Game_Event.prototype.update = function(){
    Mythic.Pathfinder.GameEventUpdate.call(this, arguments);
    if(this.pathfinder) this.pathfinder.update();
}

Game_Event.prototype.setDirectionList = function(){
    this.directionList = this.coordsToMovementRoute(this.pathfinder.coordList);
}

Game_Event.prototype.moveOnPath = function(){
    if(!this.directionList) this.setDirectionList();
    this.updatePathfindingMovement();
}

Game_Event.prototype.updatePathfindingMovement = function(){
    //check if event is moving with this.isMoving();
    console.log(this, this.directionList)
    if(!this.directionList.length > 0) {
        this.refreshPath();
    }
    if(!this.isMoving()){
        if(!this.isColliding()){
            if(this.directionList[0]) this.moveTo(this.directionList[0]);
            this.directionList.shift();
            return;
        }
        else {
            this.refreshPath();
        }
    }
}

Game_Character.prototype.refreshPath = function(){
    this.pathfinder.restart();
    this.setDirectionList();
}

Game_CharacterBase.prototype.isCollidedWithCharacters = function(x, y) {
    return this.isCollidedWithEvents(x, y) || this.isCollidedWithVehicles(x, y);
};

Game_Event.prototype.isColliding = function(){
    if(this.directionList[0] == 2) return this.isCollidedWithCharacters(this._x, this._y + 1);
    if(this.directionList[0] == 8) return this.isCollidedWithCharacters(this._x, this._y - 1);
    if(this.directionList[0] == 4) return this.isCollidedWithCharacters(this._x - 1, this._y);
    if(this.directionList[0] == 6) return this.isCollidedWithCharacters(this._x + 1, this._y);
    return false;
}

Game_Event.prototype.moveTo = function(direction){
    if(this.pathfinder.target._x !== this.pathfinder.targetNode.x || this.pathfinder.target._y !== this.pathfinder.targetNode.y) this.refreshPath();
    switch(direction){
        //down 
        case 2:
            return this.moveStraight(direction);
        //up 
        case 8:
            return this.moveStraight(direction);
        //left 
        case 4:
            return this.moveStraight(direction);
        //right 
        case 6:
            return this.moveStraight(direction);
    }
}

Game_Event.prototype.coordsToMovementRoute = function(coords){
    if(!coords || coords.length == 0) return
    let directionList = [this.getDirectionCode(this._x, this._y, coords[0][0], coords[0][1])];
    coords.forEach((el, i, arr) => {
        if(i === arr.length - 1) return;
        directionList.push(this.getDirectionCode(el[0], el[1], arr[i + 1][0], arr[i + 1][1]));
    });
    return directionList;
}

Game_Event.prototype.getDirectionCode = function(x1, y1, x2, y2){
    if(x1 == x2){
        if(y1 > y2){
            // up
            return 8
        }
        if(y1 < y2){
            //down
            return 2
        }
    }
    if(y1 == y2){
        if(x1 > x2){
            // right
            return 4
        }
        if(x1 < x2){
            // left
            return 6
        }
    }
}

Game_Event.prototype.checkValidMove = function(){
    if(this.Directions.get(this._direction) === 'up') return
    if(this.Directions.get(this._direction) === 'right') return
    if(this.Directions.get(this._direction) === 'down') return
    if(this.Directions.get(this._direction) === 'left') return
}

Game_Event.prototype.updateSelfMovement = function() {
    if (!this._locked && this.isNearTheScreen() &&
            this.checkStop(this.stopCountThreshold())) {
        switch (this._moveType) {
        case 1:
            this.moveTypeRandom();
            break;
        case 2:
            this.moveTypeTowardPlayer();
            break;
        case 3:
            this.moveTypeCustom();
            break;
        case 4:
            this.checkEventTriggerTouch(this._x, this._y);
            this.moveOnPath();
            break;
        }
    }
};

Game_Event.prototype.gameCharacterPosWithDirection = function(direction, x, y){
    var followers = $gamePlayer._followers._data;
    var party = [$gamePlayer, followers[0], followers[1], followers[2]]
    // debugger;
    const partyMemberPos = function(partyMember, x, y){
        if(partyMember._x === x && partyMember._y === y) {
            return partyMember;
        }
    }
    // if(direction == 2) return $gamePlayer.pos(x, y + 1);
    if(direction == 2) return party.find(partyMember => partyMemberPos(partyMember, x, y + 1));
    if(direction == 8) return party.find(partyMember => partyMemberPos(partyMember, x, y - 1));
    if(direction == 4) return party.find(partyMember => partyMemberPos(partyMember, x - 1, y));
    if(direction == 6) return party.find(partyMember => partyMemberPos(partyMember, x + 1, y));;
}

Mythic.Core.gameEventCheckTriggerTouch = Game_Event.prototype.checkEventTriggerTouch;
Game_Event.prototype.checkEventTriggerTouch = function(x, y) {
    if (!$gameMap.isEventRunning()) {
        if (this._trigger === 2 && this.gameCharacterPosWithDirection(this._direction, x, y)) {
            if (!this.isJumping() && this.isNormalPriority()) {
                this.start();
            }
        }
    }
};