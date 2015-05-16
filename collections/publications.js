/**
 * Created by mccm on 28/04/15.

 */
Meteor.publish('posts', function() {
    return Posts.find();
});

