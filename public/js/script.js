$(document).ready(function(){
  var btn = $('#btn');
  var inpbox = $('#inpbox');
  var list = $('#list');

  btn.click(function(){
    $.post("/notes",{task: inpbox.val(), done: false}, function(data, statusText, xhr) {
      if(xhr.status != 200) {
        alert('An error occured: '+data);
      }
    });
  });
  var source = new EventSource("/notes");
  source.onmessage = function (event) {
    list.html(list.html() + "<li>" + JSON.parse(event.data).task + "</li>");
  };
  window.onbeforeunload = function () {
    source.close();
  };
});
