Parse.Cloud.job("assigningTasks", function(request, status) {
                
                Parse.Cloud.useMasterKey();
                var now = new Date();
                var queryTaskType = new Parse.Query("TaskType");
                //queryTaskType.lessThan("readyUntil",now);
                queryTaskType.each(function(taskType) {
                           
                                   var user;
                                   
                                   var query = new Parse.Query(Parse.User);
                                   query.each(function(u) {
                                              user = u;
                                              }).then(function() {
                                                      
                                                      
                                                      var nowPlusFrequency = now;
                                                      nowPlusFrequency.setDate(now.getDate() + taskType.get("frequency"));
                                                      
                                                      var Task = Parse.Object.extend("Task");
                                                      var task = new Task();
                                                      
                                                      task.set("title", taskType.get("title"));
                                                      task.set("taskType", taskType);
                                                      task.set("home",taskType.get("home"));
                                                      task.set("done", false);
                                                      task.set("startDate", now);
                                                      task.set("endDate", nowPlusFrequency);
                                                      task.set("user",user);
                                                      
                                                      task.save();
                                                      
                                                      taskType.set("readyUntil", nowPlusFrequency);
                                                      
                                                      
                                                      }, function(error) {
                                                      });
                                   
                                   
                                   
                           
                           return taskType.save();
                           }).then(function() {
                                   status.success("New task are ready!");
                                   }, function(error) {
                                   status.error("Uh oh, something went wrong.");
                                   });
                
});