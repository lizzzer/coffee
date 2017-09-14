$('.button-primary').click(function (){
  if (doubleClickPrevent==false) {
    doubleClickPrevent=true;
    if ($(this).attr('maintId')!=undefined) {
      io.socket.get('/event/'+$(this).attr('maintId'), function gotResponse(data, jwRes) {
        console.log('Server responded with status code ' + jwRes.statusCode + ' and data: ', data);
        doubleClickPrevent=false;
        if (data.showModal==1) {
          $.cookie("noBroadcast", 1);
          alert('Hyvä! \n'+data.message+' \n Sait '+data.points+' pistettä!');
          render();
        }
      });
    }
    if ($(this).attr('notifyId')!=undefined) {
      io.socket.get('/notify/'+$(this).attr('notifyId'), function gotResponse(data, jwRes) {
        console.log('Server responded with status code ' + jwRes.statusCode + ' and data: ', data);
        doubleClickPrevent=false;
        if (data.showModal==1) {
          $.cookie("noBroadcast", 1);
          alert('Hyvä! \n'+data.message+' \n Sait '+data.points+' pistettä!');
          render();
        } else {
          $.cookie("noBroadcast", 1);
          render();
        }
      });
    }
  }

});
