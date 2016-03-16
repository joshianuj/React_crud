
var EventEmitter = require('events').EventEmitter;
var React = require('react/addons');

var AppDispatcher = require('../dispatcher/app-dispatcher');
var CHANGE_EVENT = "change";

var request = require("superagent");

function getBooks(){
    request
        .get('http://localhost:3000/books')
        .end(function(err, res){
            return res.text
        });
};

function postBooks(data){
    request
        .post('http://localhost:3000/books')
        .send(data)
        .end(function(err, res){
            return res.text
        });
};


var AppStore = React.addons.update(EventEmitter.prototype, {$merge: {
    emitChange:function(){
        this.emit(CHANGE_EVENT);
    },

    addChangeListener:function(callback){
        this.on(CHANGE_EVENT, callback)
    },

    removeChangeListener:function(callback){
        this.removeListener(CHANGE_EVENT, callback)
    },
    getBookList: function(){
        return getBooks();
    }
}});

AppDispatcher.register(function(payload){
    var action = payload.action; // this is our action from handleViewAction or handleRequestAction
    switch(action.actionType) {
        case 'CREATE_BOOK':
            postBooks(action.item);
            break;
        default:
            return true;
    }
    AppStore.emitChange();
});

module.exports = AppStore;