Parse.Cloud.job("assigningTasks", function(request, status) {
                
    Parse.Cloud.useMasterKey();
    var now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(0,0,0,1);
       
    var TaskType = Parse.Object.extend("TaskType");
    var query = new Parse.Query(TaskType);
    query.lessThan("readyUntil",now);
    query.find().then(function(types) {
                                  
        if(types.length == 0){
            status.success("Success! - No new tasks!");
        }else for (var i = 0; i < types.length; i++) {
                      processTaskType(types[i], now, i+1 == types.length ? true : false , status);
        }
                      
    }, function(error) {
        status.error("Could not retrieve TaskTypes, error " + error.code + ": " + error.message);
    });
                
});

function processTaskType(type, now, finish, status){
    
    var nowPlusFrequency = new Date();
    nowPlusFrequency.setDate(now.getDate() + type.get("frequency")-1);
    nowPlusFrequency.setHours(23,59,59,0);
    
    type.set("readyUntil", nowPlusFrequency);
    type.save();
    
    getUsers(now, nowPlusFrequency, type, finish, status);
    
}

function getUsers(now, nowPlusFrequency, type, finish, status){
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.equalTo("home", type.get("home"));
    query.find({
               success: function(results) {
                    getTasks(now, nowPlusFrequency, type, results, finish, status);
               },
               
               error: function(error) {
               }
    });

}

function getTasks(now, nowPlusFrequency, type, users, finish, status){
    var Task = Parse.Object.extend("Task");
    var query = new Parse.Query(Task);
    query.equalTo("home", type.get("home"));
    query.equalTo("taskType", type);
    query.descending("createdAt");
    query.find({
               success: function(results) {
               selectUser(now, nowPlusFrequency, type, users, results, finish, status);
               
               },
               
               error: function(error) {
               }
    });
}

function selectUser(now, nowPlusFrequency, type, users, tasks, finish, status){
    
    if(tasks.length == 0){
        var random = Math.floor(Math.random() * users.length);
        createNewTask(now, nowPlusFrequency, type, users[random], finish, status);
    }else{
        
        if(tasks[0].get("done") != true || (tasks[0].get("dislikes") == null ? 0 : tasks[0].get("dislikes").length) - (tasks[0].get("likes") == null ? 0 : tasks[0].get("likes").length) >= users.length/2){
            createNewTask(now, nowPlusFrequency, type, tasks[0].get("user"), finish, status);
        }else{
            var usersTasks = [];
            for ( var i = 0; i < users.length; i++ ){
                usersTasks.push(0);
            }
            
            for ( var i = 0; i < tasks.length; i++ ){
                if(tasks[i].get("done") == true  && (tasks[i].get("dislikes") == null ? 0 : tasks[i].get("dislikes").length) - (tasks[i].get("likes") == null ? 0 : tasks[i].get("likes").length) < users.length/2){
                    var userId = tasks[i].get("user").id;
                    for ( var j = 0; j < users.length; j++){
                        
                        if(users[j].id == userId){
                            usersTasks[j]++;
                        }
                    }
                }
            }
            
            var min = 99999;
            
            for ( var i = 0; i < usersTasks.length; i++ ){
                if(usersTasks[i]<min){
                    min = usersTasks[i];
                }
            }
            
            var readyUsers = [];
            for ( var i = 0; i < usersTasks.length; i++ ){
                if(usersTasks[i]==min){
                    readyUsers.push(users[i]);
                }
            }
            
            var random = Math.floor(Math.random() * readyUsers.length);
            createNewTask(now, nowPlusFrequency, type, readyUsers[random], finish, status);
            
        }
    }
}

function createNewTask(now, nowPlusFrequency, type, user, finish, status){
    console.log("Create new task of type: " + type.get("title") + " for user: " + user.id);
    var Task = Parse.Object.extend("Task");
    var task = new Task();
    task.set("title", type.get("title"));
    task.set("taskType", type);
    task.set("home",type.get("home"));
    task.set("done", false);
    task.set("startDate", now);
    task.set("endDate", nowPlusFrequency);
    task.set("user", user);
    
    task.save();
    
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo("user",user);
    
    Parse.Push.send({
                    where: pushQuery,
                    data: {
                    alert: "New task for you: " + type.get("title"),
                    sound: "default"
                    }
                    },{
                    success: function(){
                    },
                    error: function (error) {
                    }
                    });
    
    if(finish == true) status.success("Success!");
}
