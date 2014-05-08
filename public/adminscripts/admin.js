$(function(){

  var userSearch = {
    selected: null,
    names: [],
    userdata: null,
    getNames: function(){
      var self = this;
      return $.getJSON('/userlist', function(data){
        self.names = data.map(function(user){ return user.name });
      });
    },
    showUserData: function(){
      var self = this;
      var userdata;
      $.getJSON('/user/'+this.selected, function(data){
        self.userdata = data;
      }).done(function(){
        $('#editor-holder').jsonEditor(self.userdata, { change: function(data) {
          self.userdata = data;
        } });
      });
    },
    update: function(){
      var self = this;
      $.getJSON('/userlist', function(data){
        console.log(data);
        self.names = data.map(function(user){ return user.name });
      }).done( function(){
        $('#usersearch').autocomplete({
          source: self.names
        });
        $('#usersearch').val(self.selected);
      });
    },
    init: function(){
      var self = this;
      var search = $('#usersearch');
      var btn = $('#search-btn');
      var newBtn = $('#new-btn');
      var update = $('#update-btn');
      this.getNames().done(function(){
        search.autocomplete({
          source: self.names
        });
        btn.on('click', function(e){
          e.preventDefault();
          if ( self.names.indexOf(search.val()) < 0 ){
            alert('that user does not exist');
            search.val('');
          } else {
            self.selected = search.val();
            self.showUserData();
          }
        });
        newBtn.on('click', function(e){
          e.preventDefault();
          if ( self.names.indexOf(search.val()) < 0 ){
            self.selected = search.val();
            self.userdata = {name: self.selected, center: null};
            $('#editor-holder').jsonEditor(self.userdata, { change: function(data) {
              self.userdata = data;
            }});
          } else {
            alert('that user already exists');
            search.val('');
          }
        });
        update.on('click', function(e){
          e.preventDefault();
          $('#notification').empty();
          if (self.names.indexOf(search.val()) >= 0) {
            $.ajax({
              type: 'POST',
              url: 'user/'+self.selected,
              data: self.userdata,
              success: function(data){
                $('#notification').html('update successful');
                self.selected = data.name;
                self.update();
              },
              error: function(error){
                $('#notification').html(error);
              },
              dataType: 'json'
            });
          } else {
            $.ajax({
              type: 'POST',
              url: 'user/create',
              data: self.userdata,
              success: function(data){
                $('#notification').html('create successful');
                self.selected = data.name;
                self.update();
              },
              error: function(error){
                $('#notification').html(error);
              },
              dataType: 'json'
            });
          }
        });
      });
    }
  };


  userSearch.init();

});
