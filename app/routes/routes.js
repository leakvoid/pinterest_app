'use strict';

var path = process.cwd();
var MainController = require(path + '/app/controllers/main_controller.js');
var default_route = '/';

module.exports = function(app, passport) {

    var main_controller = new MainController();

    app.route('/')
        .get(main_controller.home);

    app.route('/pins')
        .get(main_controller.get_all_pins);

    app.route('/users/:user_id/pins')
        .get(main_controller.get_user_pins);

    app.route('/pins')
        .post(main_controller.create_pin);

    app.route('/pins/:pin_id/delete')
        .post(main_controller.destroy_pin);

    /* utility */

    app.route('/logout')
        .get(function(req, res) {
            req.logout();
            res.redirect(default_route);
        });

    app.route('/auth/github')
        .get(passport.authenticate('github'));

    app.route('/auth/github/callback')
        .get(passport.authenticate('github', {
            successRedirect: default_route,
            failureRedirect: default_route
        }));
};
