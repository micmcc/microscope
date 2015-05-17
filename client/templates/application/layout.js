/**
 * Created by mccm on 29/04/15.
 */
Template.layout.helpers({

        pageTitle: function () {
            if(Session.get('pageTitle'))
            {
                return Session.get('pageTitle');
            }
            else {
                return 'Microscope';
            }
        } 
});
