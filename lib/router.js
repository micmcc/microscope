/**
 * Created by mccm on 28/04/15.
 */
 
/// <reference path="/definitions/meteor.d.ts" /> 
/// <reference path="/definitions/ironrouter.d.ts" />

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    waitOn: function(){return Meteor.subscribe('posts');}
});

/*********************************************
 * default - list of posts route
 ********************************************/
Router.route('/', {name: 'postsList'});

/*********************************************
 * view post route
 ********************************************/
Router.route('/posts/:_id', {
    name: 'postPage',
    data: function() {return Posts.findOne(this.params._id);}
});

/*********************************************
 * edit post route
 ********************************************/
Router.route('posts/:_id/edit', {
     name: 'postEdit',
    data: function() {return Posts.findOne(this.params._id);}
});

/*********************************************
 * add post post route
 ********************************************/
Router.route('/submit', {name: 'postSubmit'});

/*********************************************
 * Must be logged in to submit a post
 ********************************************/
var requireLogin = function(){
    if (!Meteor.user()){
        if (Meteor.LoggingIn()){
            this.render(this.loadingTemplate);
        }else {
            this.render('accessDenied');
        }
    }else{
        this.next();
    }
}

Router.onBeforeAction('dataNotFound', {only: 'postPage'});
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});