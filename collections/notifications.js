Notifications = new Mongo.Collection('notifications');

Notifications.allow ({
	update: function (userId, doc, fieldNames){
		//check that the user owns the notification being modified
		//			 the user is only trying to update a single filed
		//			 the single filed is the read property of out notifications
		return ownsDocument(userId, doc) &&
			fieldNames.length === 1 && fieldNames[0] === 'read';
	}
});

createCommentNotification = function (comment){
	var post = Posts.findOne(comment.postId);
	if (comment.userId !== post.userId){
		Notifications.insert({
			userId: post.userId,
			postId: post._id,
			commentId: comment._id,
			commenterName: comment.author,
			read: false
		});
	}
}