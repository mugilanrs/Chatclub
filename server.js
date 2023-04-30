const path = require ('path');
const http =require('http');
const express =require ('express');
const socketio=require('socket.io');

const app =express();
const server =http.createServer(app);
const io=socketio(server);
const formatMessage = require('./utilis/message');
const {userJoin, getCurrentUser,userLeave,GetRoomUsers}= require('./utilis/users');

//Set static folder
app.use(express.static(path.join(__dirname,'public')));
const botName='Chatcord Bot';

// Run when client connects
io.on ('connection', socket =>{

socket.on('joinRoom', ({username, room})=>{

    const user=userJoin(socket.id,username,room);

   
    socket.join(user.room);


    //Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to Chatcords'));
    
    //Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} has joined the room `));

    //Send User and room info
    io.to(user.room).emit('roomUsers',{
        room : user.room,
        users: GetRoomUsers(user.room)
        
    });


});

    
   

    //Listen for chatMessage
    socket.on('chatMessage', (msg)=>{
       
        const user=getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });

     //Runs when a client disconnects
     socket.on('disconnect',()=> {

const user =userLeave(socket.id);
if (user){
    io.to(user.room).emit('message', formatMessage(botName,`a ${user.username} has left the chat `));


    //Send User and room info
    io.to(user.room).emit('roomUsers',{
        room : user.room,
        users: GetRoomUsers(user.room)
        
    });
}

        
    });

    
    
});

const port =3000|| process.env.port;



server.listen(port, () => console.log(`server running on port ${port}`));