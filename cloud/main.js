Parse.Cloud.job("assigningTasks", function(request, status) {
                
                Parse.Cloud.useMasterKey();
                var now = new Date();
                var queryTaskType = new Parse.Query("TaskType");
                //queryTaskType.lessThan("readyUntil",now);
                queryTaskType.each(function(taskType) {
                           
                                   var user;
                                   var users = [];
                                   var tasks = [];
                                   var usersTasks = []
                                   var User = Parse.Object.extend("User");
                                   var queryUser = new Parse.Query(User);
                                   queryUser.equalTo("home", taskType.get("home"));
                                   queryUser.each(function(u){
                                                       
                                                       users.push(u);
                                                       
                                                       
                                                       }).then(function() {
                                                               
                                                               var Task = Parse.Object.extend("Task");
                                                               var queryTask = new Parse.Query();
                                                               queryTask.equalTo("home", taskType.get("home"));
                                                               queryTask.each(function(t){
                                                                                   
                                                                                   tasks.push(t);
                                                                                   
                                                                                   
                                                                                   }).then(function() {
                                                                                           
                                                                                           //count tasks
                                                                                           for( i = 0; i < tasks.lenght; i++ ){
                                                                                           usersTasks[users.indexOf(tasks[i].get("user"))]++;
                                                                                           }
                                                                                           
                                                                                           
                                                                                           //find max
                                                                                           
                                                                                           //set user
                                                                                           
                                                                                           //add task
                                                                                           
                                                                                           
                                                                                           }, function(error) {
                                                                                           
                                                                                           });
                                                               
                                                               }, function(error) {
                                                               
                                                               });
                           
                           return taskType.save();
                           }).then(function() {
                                   status.success("New task are ready!");
                                   }, function(error) {
                                   status.error("Uh oh, something went wrong.");
                                   });
                
});