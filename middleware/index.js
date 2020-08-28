const passport = require("passport"),
	  mongoose = require("mongoose"),
	  Task = require("../models/Task"),
	  Step = require("../models/Step");

const middleware = {};

middleware.isLoggedIn = (req, res, next) => {
	if(!req.user) {
		return res.status(401).json({message: "You must be logged in to do that.", redirect: "/login"});
	};
	next();
};

middleware.taskAuthorized = async (req, res, next) => {
	if(!req.user) {
		return res.status(401).json({message: "You must be logged in to do that.", redirect: "/login"});
	};
	if(!mongoose.Types.ObjectId.isValid(req.params.taskId)) {
		return res.status(404).json({message: "Task does not exist."});
	};
	const foundTask = await Task.findById(req.params.taskId);
	if(!foundTask) {
		return res.status(404).json({message: "Task does not exist."});
	};
	if(!foundTask.creator.equals(req.user._id)) {
		return res.status(403).json({message: "You do not have permission to do that."});
	};
	next();
};

middleware.stepAuthorized = async(req, res, next) => {
	if(!mongoose.Types.ObjectId.isValid(req.params.stepId)) {
		return res.status(404).json({message: "Step does not exist.", redirect: `/tasks/${req.params.taskId}`});
	};
	const foundStep = await Step.findById(req.params.stepId)
	if(!foundStep) {
		return res.status(404).json({message: "Step does not exist.", redirect: `/tasks/${req.params.taskId}`});
	};
	next();
};

module.exports = middleware;