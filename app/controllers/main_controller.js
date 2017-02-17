'use strict';

var Users = require('../models/users.js');
var mongoose = require('mongoose');

function MainController() {

    /* auth utility methods */

    function is_owner(req, owner_id) {
        if(req.user)
            return (req.user._id.toString() == owner_id.toString());
        else
            return false;
    }

    /* db access methods */

    function find_user( user_id, callback ) {
        Users
            .findById( user_id )
            .exec( function(err, user) {
                if(err)
                    return callback(err);

                callback(null, { 'user': user });
            });
    }

    function find_all_users( callback ) {
        Users
            .find({})
            .exec( function(err, users) {
                if(err)
                    return callback(err);

                callback(null, { 'users': users });
            });
    }

    function find_pin( pin_id, callback ) {
        Users
            .findOne({ 'pins._id': pin_id })
            .exec( function(err, user) {
                if(err)
                    return callback(err);

                var pin = user.pins.find( function(p) {
                    return (p._id.toString() === pin_id);
                });

                callback(null, { 'user': user, 'pin': pin });
            });
    };

    function save_pin( relations, new_pin, callback ) {
        relations.user.pins.push( new_pin );
        relations.user.save( function(err, save_res) {
            if(err)
                callback(err);

            var last_insert_pin = save_res.pins[ save_res.pins.length - 1 ];
            callback(null, { 'user': save_res, 'pin': last_insert_pin });
        });
    };

    function delete_pin( pin_id, callback ) {
        find_pin( pin_id, function(err, fp_res) {
            if(err)
                return callback(err);

            fp_res.user.pins.pull( pin_id );
            fp_res.user.save( function(err) {
                if(err)
                    return callback(err);

                callback(null);
            });
        });
    };

    /* controller action methods */

    this.home = function(req, res) {
        res.redirect('/pins');
    };

    this.get_all_pins = function(req, res) {
        find_all_users( function(err, fau_res) {
            if(err) throw err;

            res.render('main/all_pins',
                       { 'title': 'All Pins',
                         'auth_status': req.isAuthenticated(),
                         'auth_data': req.user,
                         'all_users': fau_res.users });
        });
    };

    this.get_user_pins = function(req, res) {
        find_user( req.params.user_id, function(err, fu_res) {
            if(err) throw err;

            res.render('main/user_pins',
                       { 'title': 'User Pins',
                         'auth_status': req.isAuthenticated(),
                         'auth_data': req.user,
                         'owner_status': is_owner(req, fu_res.user._id),
                         'pins': fu_res.user.pins });
        });
    };

    this.create_pin = function(req, res) {
        find_user( req.user._id, function(err, fu_res) {
            if(err) throw err;

            save_pin( fu_res, { 'image_url': req.body.image_url, 'title': req.body.title }, function(err, sp_res) {
                if(err) throw err;

                res.redirect('/users/' + req.user._id + '/pins');
            });
        });
    };

    this.destroy_pin = function(req, res) {
        delete_pin( req.params.pin_id, function(err) {
            if(err) throw err;

            res.redirect('/users/' + req.user._id + '/pins');
        });
    };

}

module.exports = MainController;
