var express = require('express');
var fs = require('fs');

var readline = require('readline');
var socketio = require('socket.io')
var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));


var server = app.listen(process.env.PORT || 3030, function() {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});
var io = socketio(server);

var room_peer_id = {};

io.on('connection', (socket) => {

    socket.on('join_room_id', function(data) {
        socket.join(data['room_id']);


    });

    socket.on('broadcaster_peer_id', function(data) {

        if (!(data['room_id'] in room_peer_id)) {

            room_peer_id[data['room_id']] = [data['peer_id']];


        } else {
            let roomid = data['room_id'];
            socket.emit('join_room', { 'peers': room_peer_id[roomid] });
            socket.broadcast.emit('new_user', { 'peer_id': data['peer_id'], 'new_user_roomid': roomid });
            room_peer_id[roomid].push(data['peer_id']);


        }


    });

    socket.on('screen_share_enable', function(data) {

        socket.broadcast.emit('screen_share_open', { 'data': data });

    });

});


app.get('/', function(req, res) {
    res.render('client');
});
app.get('/room_id', function(req, res) {
    let roomid = req.query.room_id;


    res.render('client1', { roomid: roomid });
});