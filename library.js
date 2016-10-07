// declarations
var obj = {};

// prepare the data structure
function relationshipSet(){
	this.rules = {
		dependencies: {},
		exclusives: {},
	};

	this.addDependency = function(dependant, target){
		var $this = this;
		// prepare the items
		$this._prepareDependancyItem(dependant);
		$this._prepareDependancyItem(target);

		// does not make sense to add self as dependant - its always true
		if(dependant === target)
			return $this;

		// add target to dependant's item list, while avoiding duplicate rules
		if($this.rules.dependencies[dependant].indexOf(target) === -1){
			$this.rules.dependencies[dependant].push(target);

			// now add the child dependencies with its parent wherever the parent exists
			Object.keys($this.rules.dependencies).forEach(function(item){
				
				if(item == dependant) return; // if the item is self - ignore
				if(item == target) return; // no need to add child self dependencies
				if($this.rules.dependencies[item].indexOf(dependant) === -1) return; // no need to process parent is not present
				if($this.rules.dependencies[item].indexOf(target) > -1) return; // not need to add the child again
				$this.rules.dependencies[item].push(target);
			});
		}
		return $this;
	};

	this.addExclusivity = function(item1, item2){
		var $this = this;
		// prepare the items
		$this._prepareExclusivityItem(item1);
		$this._prepareExclusivityItem(item2);

		// does not make sense to add self as exclusive - it is not possible
		if(item1 === item2)
			return $this;

		// add the exclusive rules - nothing fancy here
		if($this.rules.exclusives[item1].indexOf(item2) === -1){
			$this.rules.exclusives[item1].push(item2);
		}

		if($this.rules.exclusives[item2].indexOf(item1) === -1){
			$this.rules.exclusives[item2].push(item1);
		}

		return $this;
	};

	this.checkRelationships = function(){
		// check if any dependant targets are also included in the exlusives rules
		var $this = this;
		var result = true;
		// loop over all items and check if any target element matches exclusive rules for an item
		Object.keys($this.rules.dependencies).forEach(function(item){
			// any target is also added in the exclusives list then the result is false
			$this.rules.dependencies[item].forEach(function(target){
				
				if($this.rules.exclusives[item] && $this.rules.exclusives[item].indexOf(target) > -1){
					result = false;
				}
				var targetExclusives = $this.rules.exclusives[target] || [];
				targetExclusives.forEach(function(te){
					if($this.rules.dependencies[item].indexOf(te) > -1){
						result = false;
					}
				});
			});
		});

		return result;
	};

	this._isExclusive = function(item1, item2){
		if(this.rules.exclusives[item1] && this.rules.exclusives[item1].indexOf(item2) > -1)
			return true;
		return false;
	};

	this._prepareDependancyItem = function(item){
		if(this.rules.dependencies[item] === undefined) this.rules.dependencies[item] = [];
	};

	this._prepareExclusivityItem = function(item){
		if(this.rules.exclusives[item] === undefined) this.rules.exclusives[item] = [];
	};
}

// functions to expose as wrapper for data structure 
obj.makeRelationshipSet = function(){
	return new relationshipSet();
};

obj.dependsOn = function(dependant, target, rs){
	return rs.addDependency(dependant, target);
};

obj.areExclusive = function(item1, item2, rs){
	return rs.addExclusivity(item1, item2);
};

obj.checkRelationships = function(rs){
	return rs.checkRelationships();
};

obj.toggle = function(selectedItems, item, rs){
	// lets first get all the dependants of the to-be-toggled item
	var dependants = rs.rules.dependencies[item] || [];
	var exclusives = rs.rules.exclusives[item] || [];

	// uncheck all the exclusives related targets and its child dependants
	var toRemoveItems = [];
	var recursiveRemoveval = function(i){
		toRemoveItems.push(i);
		Object.keys(rs.rules.dependencies).forEach(function(d){
			if(rs.rules.dependencies[d].indexOf(i) > -1 && toRemoveItems.indexOf(d) === -1){
				toRemoveItems.push(d);
				recursiveRemoveval(d);
			}
		});
	};

	// the item is not present currently - so toggle would mean add it
	if(selectedItems.indexOf(item) === -1){
		selectedItems.push(item); // toggle as enabled the item
		selectedItems = selectedItems.concat(dependants); // add the dependants to the selected items
		dependants.forEach(function(d){ // remove all exclusives for dependats as well
			exclusives = exclusives.concat(rs.rules.exclusives[d] || []);
		});
		
		exclusives.forEach(function(e){
			recursiveRemoveval(e);
		});

		toRemoveItems.forEach(function(r){
			var rIndex = selectedItems.indexOf(r);
			if(rIndex > -1)
				selectedItems.splice(rIndex, 1);
		});
	}
	// the item is already present currently - so toggle would mean remove it
	else{

		recursiveRemoveval(item);
		toRemoveItems.forEach(function(r){
			var rIndex = selectedItems.indexOf(r);
			if(rIndex > -1)
				selectedItems.splice(rIndex, 1);
		});

	}
	return selectedItems;
};




// expose the object upon require
module.exports = obj;
