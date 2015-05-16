/**
 * Created by mccm on 28/04/15.
 */

/// <reference path="/definitions/meteor.d.ts" /> 

Posts = new Mongo.Collection('posts');


/***
 * Allow for client side update/removal of posts
*/
Posts.allow({
   update: function(userId, post) {return ownsDocument(userId, post);},
   remove: function(userId, post) {return ownsDocument(userId, post);}
});
Posts.deny({
    update: function(userId, post, fieldNames) {
        //may only edit the following two fields
        return (_.without(fieldNames, 'url', 'title').length > 0);
    }
});

Meteor.methods({
   postInsert: function(postAttributes){
       check(Meteor.userId(), String);
       check(postAttributes, {
           title: String,
           url: String
       });
       var postWithSameLink = Posts.findOne({url:postAttributes.url});
       if (postWithSameLink){
           return{
               postExists:true,
               _id: postWithSameLink._id
           }
       }
       var user = Meteor.user();
       var post = _.extend(postAttributes, {
           userId: user._id,
           author: user.username,
           submitted: new Date()
       }) ;
       var postId = Posts.insert(post);
       return {
           _id: postId
       };
   },
    postUpdate: function(postId, postProperties){
        check(Meteor.userId(), String);
        check(postProperties , {
            title: String,
            url: String
        });

        /*****
         * TODO - try to remove allow deny logic since we check id here.
         * Note, still need to verify that the post belongs to the user
         *****/
        var postWithSameLink = Posts.findOne(
            { $and: [
                        {_id: {$ne: postId}},
                        {url: postProperties.url}
                    ]
            }
        );
        if (postWithSameLink){
               return{
                   postExists:true,
                   _id: postWithSameLink._id
               }
        }

        Posts.update(postId, {$set: postProperties}, function(error){
            if (error){
                return error;
            }else {
                return postId;
            }
        });
    }
});
