const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
server.on('listening', () => true);

// Send the id with message and let python return it with the result
// and comapre the returned id with the list of ids that you have send,
// then send to the proper client :0
io.on('connection', socket => {
  console.log('New connection established with client ' + socket.id);
  socket.emit('news', 'successfully connected!');

  socket.on('img', data => {
    io.sockets.emit('user_input', data);
    console.log(data);
  });

  socket.on('result', data => {
    io.emit('minsta', data);
    console.log(data);
  });
});
