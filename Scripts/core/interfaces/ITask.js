

/*INTERFACE*/
function IWork() {}	
IWork.Interface("ITask");

IWork.prototype.isCompleted = function() {};
IWork.prototype.completedevent = null;
IWork.prototype.setComplete = function() {};
IWork.prototype.then = function(handler_or_this,handler_or_nothing) {};
