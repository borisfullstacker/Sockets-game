var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();



var allUsers=[];
var server = require('http').createServer(app);
var io = require('socket.io')(server);



io.on('connection', function (socket) {  
  var flag=true;
  socket.on('private', (data)=>
  {  
   for (let i=0; i<allUsers.length; i++){
        if(allUsers[i].key==data.key)
         {
            flag=false;
            allUsers.splice(i,1,data);
          }
    }
    if(flag){
      allUsers.push(data);
    }
    socket.on('disconnect',function(){
      // console.log(allUsers)
      // console.log(data.key)
      //when user disconnects sockets.io redirects last known obj.
      for (let i=0; i<allUsers.length; i++){
        if(allUsers[i].key==data.key){
          allUsers.splice(i,1)
        }
    }
    });
 
    io.emit("public",allUsers)
  }); 
  console.log("new client connected"); 
});

server.listen(3002)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
