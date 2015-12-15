Parse.Cloud.job("assigningTasks", function(request, status) {
                
    Parse.Cloud.useMasterKey();
    var now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(0,0,1,0);
                
    var TaskType = Parse.Object.extend("TaskType");
    var Task = Parse.Object.extend("Task");
    var User = Parse.Object.extend("User");
            
    var types = [];
                
    var typesCount = 0;
    var taskCount = 0;
                
    var queryTaskType = new Parse.Query(TaskType);
    queryTaskType.lessThan("readyUntil",now);
    queryTaskType.each(function(taskType) {
            types.push(taskType);
        }).then(function() {
                typesCount = types.length;
                if(typesCount == 0)status.success("Succes");
                for( k = 0; k<types.length; k++){
                
                    processTaskType(types[k], types.length -1 - k);
                
                }
                
                
        }, function(error) {
            status.error("Uh oh, something went wrong.");
        });
    
    function processTaskType(type ,finish){
                
                var user;
                var users = [];
                var tasks = [];
                
                
                var nowPlusFrequency = new Date();
                nowPlusFrequency.setDate(now.getDate() + type.get("frequency")-1);
                nowPlusFrequency.setHours(23,59,59,0);
                
                var queryUser = new Parse.Query(User);
                queryUser.equalTo("home", type.get("home"));
                queryTaskType.lessThan("unavalibleUntil",nowPlusFrequency);
                queryUser.each(function(u){
                               
                               users.push(u);
                               
                               }).then(function() {
                                       
                                       var queryTask = new Parse.Query(Task);
                                       queryTask.equalTo("home", type.get("home"));
                                       queryTask.equalTo("taskType", type);
                                       queryTask.equalTo("done", true);
                                       queryTaskType.lessThan("unavailableUntil",now);
                                       queryTask.each(function(t){
                                                      
                                                      tasks.push(t);
                                                      
                                                      }).then(function() {
                                                              
                                                              var usersTasks = [];
                                                              for ( i = 0; i < users.length; i++ ){
                                                              usersTasks.push(0);
                                                              }
                                                              for ( i = 0; i < tasks.length; i++ ){
                                                                var userId = tasks[i].get("user").id;
                                                                for ( j = 0; j < users.length; j++){
                                                              
                                                                    if(users[j].id == userId){
                                                                        usersTasks[j]++;
                                                                    }
                                                                }
                                                              
                                                              }
                                                              
                                                              
                                                              var min = 99999;
                                                              
                                                              for ( i = 0; i < usersTasks.length; i++ ){
                                                                if(usersTasks[i]<min){
                                                                    min = usersTasks[i];
                                                                }
                                                              }
                                                              
                                                              var readyUsers = [];
                                                              for ( i = 0; i < usersTasks.length; i++ ){
                                                                if(usersTasks[i]==min){
                                                                    readyUsers.push(users[i]);
                                                                }
                                                              }
                                                              
                                                              var task = new Task();
                                                              
                                                              task.set("title", type.get("title"));
                                                              task.set("taskType", type);
                                                              task.set("home",type.get("home"));
                                                              task.set("done", false);
                                                              task.set("startDate", now);
                                                              task.set("endDate", nowPlusFrequency);
                                                              task.set("user",readyUsers[Math.floor((Math.random() * readyUsers.length))]);
                                                              
                                                              task.save();
                                                              
                                                              type.set("readyUntil", nowPlusFrequency);
                                                              type.save();
                                                              
                                                              taskCount++;
                                                              if(typesCount == taskCount)status.success("Succes");
                                                              
                                                        });
                                       });
    }
                
});