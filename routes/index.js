var express = require('express');
var router = express.Router();
var Poll = require('./voterdetail.js');
var passportTwitter = require('./twitter');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
	var sess = req.session
	var user = {};
	user = sess.user;
  	Poll.find({})
  		.exec(function(err,poll){
  			if(err){
  				res.send(err);
  			} else {
  				var polls = [];
  				polls = poll;
  				res.render('index',{ polls, user });
  			}
  		});
});

router.get('/newpoll',function(req,res){
	var sess = req.session
	var user = sess.user;
	if(!user){
		res.redirect('/');
	} else {
		res.render('newpoll', { user });
	}
});	

router.post('/newpoll',function(req,res){

	var title = req.body.title;
	var options = req.body.options;
	var sess = req.session;
	var userID = sess.user.someID;

	var tempArr = options.split(',');
	var optionArr = [];

	for(var i=0;i<tempArr.length;i++){
		optionArr.push([tempArr[i],0]);
	}

	var newPoll = new Poll();
	newPoll.title = title;
	newPoll.options = optionArr;

	newPoll.save(function(err,poll){
		if(err){
			console.log("DB Insertion error!!");
		} else {
			console.log(poll);
			User.findOneAndUpdate({ someID: userID },{ $push: { myPolls: poll._id }},function(err,votedPolls){
				console.log("Poll Created !!!");
				res.redirect('/');
			});
		}
	});
});

router.get('/polls/:id',function(req,res){
	var sess = req.session
	var user = sess.user;
	Poll.findOne({
		_id: req.params.id
	}).exec(function(err,poll){
		if(err){
			res.send(err);
		} else {
			res.render('poll',{ poll, user });
		}
	});
});

router.post('/vote',function(req,res){
	var sess = req.session
	var id = req.body.id;
	var userID = sess.user.someID;
	var candidate = req.body.candidate;
	User.findOne({
		someID: userID
	})
	.exec(function(err,data){
		var count = 0;
		var votedPolls = data.votedPolls;
		console.log(id);
		for(var i=0;i<votedPolls.length;i++){
			if( id == votedPolls[i] ){
				count++;
			}
		}
		if(count){
			console.log('You have already voted in this poll');
			res.redirect('/polls/' + id);
		} else {
			Poll.findOne({
					_id: id
				}).exec(function(err,poll){
					var options = poll.options;
					for(var i=0;i<options.length;i++){
						if(options[i][0] == candidate){
							options[i][1] += 1;
							break;
						}
					}
					Poll.findOneAndUpdate({ _id: id },{ $set: { options } },function(err,data){
						if(err){
							console.log(err);
						} else {
							User.findOneAndUpdate({ someID: userID },{ $push: { votedPolls: id }},function(err,votedPolls){
								console.log("Vote Updated !!!");
								res.location('/polls/' + id);
								res.redirect('/polls/' + id);
							});
						}
					});
				});
		}
	});
});

router.get('/login',function(req,res){
	res.send("Go back and register!!");
});

router.get('/auth/twitter', passportTwitter.authenticate('twitter'));

router.get('/auth/twitter/callback',
  passportTwitter.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication
    var sess = req.session
    sess.user = req.user;
    res.redirect('/');
});

router.get('/logout',function(req,res){
	var sess = req.session
	sess.user = "";
	res.redirect('/');
});

router.get('/mypolls',function(req,res){
	var sess = req.session
	var user = sess.user;
	var userID = user.someID;
	User.findOne({ someID: userID })
		.exec(function(err,data){
			var myPolls = data.myPolls;
			var pollsArr = [];
			console.log(pollsArr);
			if(myPolls.length === 0){
				res.render('mypolls', { user, pollsArr });
			} else {
				for(var i=0;i<myPolls.length;i++){
					Poll.findOne({ _id: myPolls[i] })
						.exec(function(err,mypoll){
							pollsArr.push(mypoll);
							if(err){ console.log(err); }
							if( pollsArr.length == myPolls.length ){
								console.log(pollsArr);
								res.render('mypolls', { user, pollsArr });
							}	
						});
				}
			}
		});
});

module.exports = router;
