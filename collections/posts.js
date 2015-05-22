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



validatePost = function(post){
    var errors = {};
    if (!post.title)
        errors.title="Please fill in a title for this post.";
    if (!post.url)
        errors.url="Please in the URL for this post."
    return errors;
}

Meteor.methods({
   postInsert: function(postAttributes){
       check(Meteor.userId(), String);
       check(postAttributes, {
           title: String,
           url: String
       });

       var errors = validatePost(postAttributes);
       if (errors.title || errors.url)
           throw new Meteor.Error('invalid-post', "You must set a Title and Url for your post");

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
           submitted: new Date(),
           commentCount: 0,
           upvoters: [],
           votes: 0
       });
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
        var errors = validatePost(postProperties);
        if (errors.title || errors.url)
            throw new Meteor.Error('invalid-post', "You must set a Title and Url for your post");


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
                Errors.throw(error.reason);
            }else {
                return postId;
            }
        });
    },
    upvote: function(postId){
        check(this.userId, String);
        check(postId, String);

        var affected = Posts.update({
            _id: postId,
            upvoters: {$ne: this.userId}
        }, {
            $addToSet: {upvoters: this.userId},
            $inc: {votes: 1}
        });
        if (! affected )
            throw new Meteor.Error('invalid', "You are unable to up-vote that post");
    }
});
