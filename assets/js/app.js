Date.prototype.addDays = function (num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
}

Date.prototype.addSeconds = function (num) {
    var value = this.valueOf();
    value += 1000 * num;
    return new Date(value);
}

Date.prototype.addMinutes = function (num) {
    var value = this.valueOf();
    value += 60000 * num;
    return new Date(value);
}

Date.prototype.addHours = function (num) {
    var value = this.valueOf();
    value += 3600000 * num;
    return new Date(value);
}

Date.prototype.addMonths = function (num) {
    var value = new Date(this.valueOf());

    var mo = this.getMonth();
    var yr = this.getYear();

    mo = (mo + num) % 12;
    if (0 > mo) {
        yr += (this.getMonth() + num - mo - 12) / 12;
        mo += 12;
    }
    else
        yr += ((this.getMonth() + num - mo) / 12);

    value.setMonth(mo);
    value.setYear(yr);
    return value;
}

!function ($) {
    $.extend($.fn, {
        busyIndicator: function (c) {
            b = $(this);
            var d = b.find(".k-loading-mask");

            //alert("Outer height: " + b.outerHeight() + ", Outer width: " + b.outerWidth());
            /*if (c) {
                if (d.length <= 0)
                {
                    var width = b.outerWidth() + "px";
                    var height = b.outerHeight() + "px";
                    //d = $("<div class='k-loading-mask' style='height:" + height + "width:" + width + "'><span class='k-loading-text'>Loading...</span><div class='k-loading-image'/><div class='k-loading-color'/></div>");
                    d = $("<div class='k-loading-mask'><span class='k-loading-text'>Loading...</span><div class='k-loading-image'/><div class='k-loading-color'/></div>")
                    .width(b.outerWidth()).height(b.outerHeight())                  
                }                
                b.append(d);
            }
            else
            {
                d.remove();
            }*/
            c
            ?
            d.length || (d = $("<div class='k-loading-mask'><span class='k-loading-text'>Loading...</span><div class='k-loading-image'/><div class='k-loading-color'/></div>")
                .width(b.outerWidth())
                .height(b.outerHeight())
                .appendTo(b)
                )
            :
            d && d.remove()
        }
    });
}(jQuery);

$(function () {
    // Initialize dialogs ...
    var dialogOptions = {
        autoOpen: false,
        draggable: false,
        modal: true,
        resizable: false,
        title: "Error",
        closeOnEscape: false,
        open: function () { $(".ui-dialog-titlebar-close").hide(); }, // Hide close button
        buttons: [{
            text: "Close",
            click: function () { $(this).dialog("close"); }
        }]
    };
    $("#InternalServerErrorDialog").dialog(dialogOptions);
    $("#NotFoundInfoDialog").dialog(dialogOptions);

    // Set up AJAX error handling ...
    $(document).ajaxError(function (event, jqXHR, ajaxSettings, thrownError) {
        if (jqXHR.status == 404) {
            $("#NotFoundInfoDialog").dialog("open");
        } else if (jqXHR.status == 500) {
            $("#InternalServerErrorDialog").dialog("open");
        } else {
            //alert("Something unexpected happend :( ...");
        }
    });
});

jQuery.fn.flash = function (color, duration) {
    var current = this.css('backgroundColor');
    this.animate({ backgroundColor: 'rgb(' + color + ')' }, duration / 2)
        .animate({ backgroundColor: current }, duration / 2);
}

$(document).ready(function () {
    //$("table.scrollbody").scrollTableBody({ rowsToDisplay: 10 });
    //$("div.jqstb-scroll").css("cssText", "height: 400px !important;");
    
});

//Creates a global object called templateLoader with a single method "loadExtTemplate"
var templateLoader = (function ($, host) {
    //Loads external templates from path and injects in to page DOM
    return {
        //Method: loadExtTemplate
        //Params: (string) path: the relative path to a file that contains template definition(s)
        loadExtTemplate: function (path) {
            //Use jQuery Ajax to fetch the template file
            var tmplLoader = $.get(path)
                .success(function (result) {
                    //On success, Add templates to DOM (assumes file only has template definitions)
                    $("body").prepend(result);
                })
                .error(function (result) {
                    alert("Error Loading Templates -- TODO: Better Error Handling");
                })

            tmplLoader.complete(function () {
                //Publish an event that indicates when a template is done loading
                $(host).trigger("TEMPLATE_LOADED", [path]);
            });
        }
    };
})(jQuery, document);