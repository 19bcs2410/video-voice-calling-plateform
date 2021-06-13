$(document).ready(function() {
    var my_peer_id;
    $('#room_id_header').text(`room id: ${room_id}`);

    let peer = new Peer();

    peer.on('open', (id) => {
        my_peer_id = id;
        socket.emit('broadcaster_peer_id', {
            'peer_id': id,
            'room_id': room_id
        });
    });

    navigator.mediaDevices.getUserMedia({
        'video': true,
        'audio': {
            sampleSize: 8,

            echoCancellation: true,
            noiseSuppression: true
        }
    }).then(function(stream) {
        //controlers start
        socket.on('screen_share_open', function(data) {


            let my_data = data['data'];
            if (my_data['room_id'] == room_id) {


            }

        });

        $('#screen_share_btn').click(function() {
            let enable_camera = stream.getVideoTracks()[0].enabled;
            let enable_audio = stream.getAudioTracks()[0].enabled;
            if (enable_camera || enable_audio) {
                $('#video_btn_i').attr('class', "fas fa-video-slash");
                $('#audio_btn_i').attr('class', "fas fa-microphone-slash")
                stream.getVideoTracks()[0].enabled = false;
                stream.getAudioTracks()[0].enabled = false;
                $('#video_btn').css('color', 'red');
                $('#audio_btn').css('color', 'red');
                $('#screen_share_btn').css('color', 'red');
                $('.screen_share').show();
                navigator.mediaDevices.getDisplayMedia({
                    'video': true,
                    'audio': true
                }).then(function(screen_stream) {

                    document.querySelector('#screen_player').srcObject = screen_stream;
                    peer.on('call', function(call) {
                        call.answer(screen_stream);
                    });



                });
                socket.emit('screen_share_enable', { 'peer_id': my_peer_id, 'room_id': room_id });

            } else {
                $('.screen_share').hide();
                $('#screen_share_btn').css('color', 'black');
                $('#video_btn_i').attr('class', "fas fa-video");
                $('#audio_btn_i').attr('class', "fas fa-microphone")
                stream.getVideoTracks()[0].enabled = true;
                stream.getAudioTracks()[0].enabled = true;
                $('#video_btn').css('color', 'black');
                $('#audio_btn').css('color', 'black');



            }
            $('#screen_cancel_btn').click(function() {

                $('.screen_share').hide();
            });

        })

        $('#video_btn').click(function() {
            let enable = stream.getVideoTracks()[0].enabled;
            if (enable) {
                $('#video_btn_i').attr('class', "fas fa-video-slash");
                stream.getVideoTracks()[0].enabled = false;
                $('#video_btn').css('color', 'red');

            } else {
                $('#video_btn_i').attr('class', "fas fa-video");
                stream.getVideoTracks()[0].enabled = true;
                $('#video_btn').css('color', 'black');

            }
        });

        $('#audio_btn').click(function() {

            let enable = stream.getAudioTracks()[0].enabled;
            if (enable) {
                $('#audio_btn_i').attr('class', "fas fa-microphone-slash")
                stream.getAudioTracks()[0].enabled = false;
                $('#audio_btn').css('color', 'red');

            } else {
                $('#audio_btn_i').attr('class', "fas fa-microphone")
                stream.getAudioTracks()[0].enabled = true;
                $('#audio_btn').css('color', 'black');

            }

        });

        $('#call_end_btn').click(function() {
            stream.getVideoTracks()[0].stop();
            stream.getAudioTracks()[0].stop();
            peer.disconnect();

            $('#video_call_div').hide();



        })



        //constrolers end


        document.querySelector('#video_player').srcObject = stream;
        socket.on('new_user', function(data) {

            if (data['new_user_roomid'] == room_id) {

                let v_e = $(`<div class='video_card'></div>`).html(`
                <h2></h2>
                <hr>
                <video id="video_player${my_count}" autoplay></video>
                `);
                $('.main_div').append(v_e);


                let call = peer.call(data['peer_id'], stream);
                call.on('stream', function(user_stream) {

                    document.querySelector(`#video_player${my_count}`).srcObject = user_stream;
                });
                setTimeout(function() {
                    my_count++;
                }, 1500);

            }



        });

        peer.on('call', function(call) {
            call.answer(stream);
        });






        socket.on('join_room', function(data) {

            let peers_list = data['peers'];
            let no_user = peers_list.length;
            console.log(no_user)
            for (let i = 0; i < no_user; i++) {


                let v_e = $(`<div class='video_card'></div>`).html(`
            <h2></h2>
            <hr>
            <video id="video_player${i}" autoplay></video>
            `);
                $('.main_div').append(v_e);


            };


            for (let i = 0; i < no_user; i++) {

                setTimeout(function() {
                    let call = peer.call(peers_list[i], stream);
                    call.on('stream', function(user_stream) {

                        document.querySelector(`#video_player${i}`).srcObject = user_stream;
                    });
                }, 1000);



            }




        })
    });


})