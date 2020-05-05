(function ($) {

    $.fn.meshop.datagrid = function () {
        var defaults = {
            colnum: '8',
            fields: ["id", "name", "price"],
            after: this.find(".meshoptemplate"),
            template: this.find(".meshoptemplate").removeClass("meshoptemplate").prop("outerHTML"),
            filters: {
                col1: {name: 'filter1', datatype: 'text'},
                col2: {name: 'filter2', datatype: 'number'},
                col3: {name: 'filter3', datatype: 'date'}
            },
        };
        var settings = $.extend({}, defaults, $.fn.meshop.settings);
        // Private getProducts List as JsonObject  
        $.post("/json/" + settings.data + "/load", {f: JSON.stringify(settings.fields)}).done(function (json) {
            json = eval(json);
            var keys = settings.fields;
            for (var j = json.length - 1; j >= 0; j--) { //loop through each item and add it to module parent
                var rendered = settings.template;
                for (var k = 0; k < keys.length; k++) {
                    var tempkey = "##" + keys[k] + "##";
                    var reg = new RegExp(tempkey, "g");
                    rendered = rendered.replace(reg, json[j][k]);
                }


                settings.after.after(rendered);
            }

            settings.after.remove();
            if (typeof settings.callback == "function") settings.callback.call(this);
        });


        /*        var _Render = null,
                _dataitems = null;

                     elem.addClass("col-md-" + settings.colnum + " box");
                    elem.append('<div class="box-title">' + settings.title + '</div>'); //title

                    //get filters list and loop on it
                    var filtercontent = "<div class='row'>";
                    var jsonx = settings.filters;
                    $.each(jsonx, function(i, item) {
                          filtercontent += "<div class='col-lg-6'>"
                          filtercontent += "	<div class='col-lg-3'>" + item.name + "</div>"; //filter label
                          if (item.datatype == 'text'){// combo
                             filtercontent +=   "    <div class='col-lg-4'>" +
                                                "	 	<select class='form-control'>" +
                                                "			<option>içerir</option>" +
                                                "			<option>başlar</option>" +
                                                "			<option>biter</option>" +
                                                "  			<option>eşittir</option>" +
                                                "	 	</select>" +
                                                "	</div>";
                          } else if(item.datatype == 'date')  { //date
                               filtercontent += "    <div class='col-lg-8'>" +
                                                 "		<div class='input-daterange input-group' >" +
                                                 "	 		<input type='text' class='input-sm form-control' name='start' />" +
                                                 "	 		<span class='input-group-addon'>to</span>" +
                                                 "	 		<input type='text' class='input-sm form-control' name='end' />" +
                                                 "		</div>" +
                                                 "	</div>";
                          } else { //number
                                  filtercontent += "    <div class='col-lg-4'>" +
                                                "	 	<select class='form-control'>" +
                                                "			<option>=</option>" +
                                                "			<option><pre><></pre></option>" +
                                                "  			<option><pre>></pre></option>" +
                                                "  			<option><pre><</pre></option>" +
                                                "	 	</select>" +
                                                "	</div>";
                         }
                          if(item.datatype != 'date')  { filtercontent += "<div class='col-lg-4'><input type='text' class='form-control' placeholder='" + item.name + "' /></div>"; } //textbox
                         filtercontent +=    "</div>";  //row close
                    });
                    filtercontent += "   <div class='row'> <div class='col-lg-4'>" +
                    "	 	<input type='button' class='form-control' value='Ara' />  " +
                    "	</div></div>";

                    filtercontent +=    "</div>";

                    var filter = 	"<table class='table table-responsive'>" +
                                    "	<tr><td>" + filtercontent + "</td><tr>" +
                                    "</table>";
                     */

        //fields titles
//            	var tdtitle ="<thead><th><strong>" + settings.fields.col1 + "</strong></th><th><strong>" + settings.fields.col2 + "</strong></th>";
//        		var trtitle = "<tr>" + tdtitle + "</tr></thead>";

        /*    	$(_dataitems).each(function(i,item){
                               var td ="<td>" + item.id + "</td><td>" + item.title + "</td>";
                              var tr = "<tr>" + td + "</tr>";
                              if (data != null){
                                   data = data + tr;
                              } else { data = tr; }


                          });
                           var table = "<table class='table table-striped table-responsive table-hover'><tbody>" + trtitle + data + "</tbody></table>";


                          //pagination
                          var paging;
                           var lis;
                          lis = '<li><a href="">«</a></li>';
                          for (i=1;i<=10;i++){
                              lis += '<li><a href="">' + i + '</a></li>';
                          }
                          lis += '<li><a href="">»</a></li>';
                          paging = '<ul class="pagination">' + lis + '</ul>';

                             elem.append('<div class="box-main">' + filter + table + paging + '</div>'); //content
                   /////////////////////////////////////////////////////////////
                             //datepicker
                             $('.input-daterange').datepicker({
                                 todayBtn: "linked",
                                     language: "tr",
                                     autoclose: true,
                                     todayHighlight: true
                             });



                // Private method - can only be called from within this object
                var privateMethod = function () {
                    console.log('private method called!');
                };*/

    };

})(jQuery);
