//submission dates, top to bottom, multiline text, select keywords from keyword panel, submit

NonTerminals = new Meteor.Collection("nonTerminals");

if (Meteor.isClient) {
  root = {
    name : "root",
    productions : [
      { value : "this is a " },
      { name : "thing" }
    ]
  };
  productionMap = {};

  var updateProductionMap = function(node){
    if(!node._id) {
      node._id = '' + Math.random();
    }
    productionMap[node._id] = node;
    if(node.productions) node.productions.forEach(updateProductionMap);
  }
  updateProductionMap(root);
  
  var rootDep = new Deps.Dependency;

  Session.set("selectedNTID", root._id);

  Template.start.root = function () {
    rootDep.depend();
    return root;
  };

  Template.production.events({
    'click  .non-terminal': function (evt) {
      evt.stopPropagation();
      $(".selected").removeClass('selected');
      $(evt.currentTarget).addClass('selected');
      Session.set("selectedNTID", this._id);
    },
    'mouseover .non-terminal': function (evt) {
      evt.stopPropagation();
      $(".highlighted").removeClass('highlighted');
      $(evt.currentTarget).addClass('highlighted');
    }
  });

  Template.nonTerminal.nonTerminal = function () {
    selectedNonTerminal = productionMap[Session.get("selectedNTID")];
    return {
     name : selectedNonTerminal.name,
     options : NonTerminals.find({ name : selectedNonTerminal.name })
    }
  };

  Template.nonTerminal.events({
    'click .add-option': function (evt) {
      var v = document.getElementById("option-text").value; 
      NonTerminals.insert({
        name : selectedNonTerminal.name,
        components : parseComponents(v)
      });
    },
    'click .option': function (evt) {
      selectedNonTerminal.productions = this.components;
      productionMap = {};
      updateProductionMap(root);
      rootDep.changed();
    },
  });

function parseComponents(str) {
  var i = 0;
  var out = [];
  var curCompo = "";
  while(i < str.length) {
    if(str[i] === '<') {
      if(curCompo) out.push({ value : curCompo });
      curCompo = "";
    } else if(str[i] === '>') {
      if(curCompo) out.push({ name : curCompo });
      curCompo = "";
    } else {
      curCompo += str[i];
    }
    i++;
  }
  if(curCompo) out.push({ value : curCompo });
  return out;
}

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
