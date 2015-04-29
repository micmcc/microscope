/**
 * Created by mccm on 26/04/15.
 */

Template.postsList.helpers({
    posts: function () {
        return Posts.find();
    }
});