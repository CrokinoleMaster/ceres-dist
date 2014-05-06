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
      var update = $('#update-btn');
      this.getNames().done(function(){
        search.autocomplete({
          source: self.names
        });
        btn.on('click', function(e){
          e.preventDefault();
          if ( self.names.indexOf(search.val()) < 0 ){
            search.val('');
          } else {
            self.selected = search.val();
            self.showUserData();
          }
        });
        update.on('click', function(e){
          e.preventDefault();
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
        });
      });
    }
  };


  userSearch.init();

});
