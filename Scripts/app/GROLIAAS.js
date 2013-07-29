var GROLIAAS = {};
GROLIAAS.keys =
{
    MASTERLIST: "mlist",
    PRINCIPAL: "this",
    SESSIONID: "session"
}
;

GROLIAAS.ListSetUpView = function (options) {
    options = options || { active: false };
    this.savedSession = this.savedSession ? $.parseJSON(this.savedSession) : $.parseJSON(localStorage.getItem(GROLIAAS.keys.PRINCIPAL));
    this.data = $.parseJSON(localStorage.getItem(GROLIAAS.keys.MASTERLIST));
    this.lazyGet = !this.data;
    var self = this;

    var addIndicator = function (el) {
        var categories = $("#accordion").children();

        for (var i = 1; i < categories.length; i += 2) {
            var header = $(categories[i - 1]);
            var content = $(categories[i]);
            var cnt = content.find("input:checked").length;
            if (cnt > 0) {
                var text = header.text();
                header.html("<a href='#'><span class='icon-cart' style='color:#16a765;'></span>&nbsp;" + text.trim() + " ( " + cnt + " ) </a>");
            } else {
                var text = header.text();
                header.html("<a href='#'>" + text.trim() + "</a>");
            }

        }

    };

    var addIndicator2 = function (el) {
        var cnt = $(this).find("input:checked").length;
        if (cnt > 0) {
            var header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);
            var text = header.text().replace(/\(\s\d+\s\)/g, "");
            header.html("<a href='#'><span class='icon-cart' style='color:#16a765;'></span>&nbsp;" + text.trim() + " ( " + cnt + " ) </a>");
        } else {
            var header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);
            var text = header.text().replace(/\(\s\d+\s\)/g, "");
            header.html("<a href='#'>" + text.trim() + "</a>");
        }
    };

    this.realize = function () {

        $(".menuitem").on("click", function () {
            var el = $(this).find("span");

            if (el.hasClass("icon-info")) {
                $("#dialog").dialog({ modal: true, width: "auto;" });
            } else if (el.hasClass("icon-play")) {
                self.generateSharingLink();
            }
            else if (el.hasClass("icon-pencil")) {
                //save context
                if (self.sessionId) {
                    localStorage.setItem(GROLIAAS.keys.PRINCIPAL, JSON.stringify(self.savedSession));
                    localStorage.setItem(GROLIAAS.keys.SESSIONID, self.sessionId);
                }
                location.href = location.origin;
            }
        });

        if (self.lazyGet) {
            $.ajax({
                url: "/home/GetMasterList",
                type: 'POST'
            }).done(function(response) {

                self.data = response;
                self.buildAccordion(options.active);
                localStorage.setItem(GROLIAAS.keys.MASTERLIST, JSON.stringify(self.data));
                setTimeout(function () { addIndicator(); $(".ui-widget-content").on("click", addIndicator2); }, 0);

            });
        } else {
            self.buildAccordion(options.active);
            setTimeout(function() {
                addIndicator();
                $(".ui-widget-content").on("click", addIndicator2);
            }, 0);
        }

    };
};

//inherited memebers

GROLIAAS.ListSetUpView.prototype.buildChecks = function (items) {
    var left = ["<div style='float:left; width:50%;'>"];
    var right = ["<div style='float:right; width:50%;'>"];
    items.sort();
    var slice = items.length / 2;
    for (var i = 0; i < items.length; i++) {
        var chk = this.savedSession[items[i].ItemDescription] ? " checked " : "";
        var content = ['<input type="checkbox" name="item" value="', items[i].ItemDescription, '" ', chk, ' >', items[i].ItemDescription, "<br/>"].join("");
        if (i < slice) {
            left.push(content);
        } else
            right.push(content);

    }
    left.push("</div>");
    right.push("</div>");
    return left.join("") + right.join("");
};

GROLIAAS.ListSetUpView.prototype.buildAccordion = function (active) {
    var markup = this.builAccord(this.data);
    $('#accordion').html(markup);
    $('#accordion').accordion({
        icons: false,
        autoHeight: false,
        clearStyle: true,
        collapsible: true
    });
};




GROLIAAS.ListSetUpView.prototype.getSelections = function () {
    var sections = $('#accordion > div input:checked ');
    var map = {};
    for (var i = 0; i < sections.length; i++) {
        map[sections[i].value] = true;
    }

    return JSON.stringify(map);
};


GROLIAAS.ListSetUpView.prototype.generateSharingLink = function () {
    if (this.sharedlink) {
        $(".icon-signup").attr("title", "Link is already shareable");
        return;
    };
    this.saveData(true);
    var items = localStorage.getItem(GROLIAAS.keys.PRINCIPAL);
    var session = localStorage.getItem(GROLIAAS.keys.SESSIONID);
    $.ajax({
        url: "/home/SaveSession",
        type: 'POST',
        data: { selections: items, session: session },
    }).done(function (response) {
        localStorage.setItem(GROLIAAS.keys.SESSIONID, response.sessionid);
        location.href = location.href + response.sessionid;
    });
};


GROLIAAS.ListSetUpView.prototype.saveData = function (silent) {
    var serData = this.getSelections();
    if (serData) {
        localStorage.setItem(GROLIAAS.keys.PRINCIPAL, serData);
        if (!silent) {
            $("#info-section .icon-file-2").css("color", "orange");
            setTimeout(function () { $("#info-section .icon-file-2").css("color", "#16a765"); }, 200);
        }
    }
};

GROLIAAS.ListSetUpView.prototype.builAccord = function (store) {
    var res = [];
    this.savedSession = this.savedSession || {};

    var settings = this.sharedlink ? "" : "</span><span style='font-weigth:700; font-size:13px; color:#427fed; float: right; padding-left:3px;'>Settings</span><span class='icon-cog' style='float:right;padding-right:0;'>";
    for (var i = 0; i < store.length; i++) {
        res.push("<h3><a  'href='#'>&nbsp" + store[i].SectionName + "</a></h3>" + "<div >" + this.buildChecks(store[i].Items) + settings+"</div>");
    }

    return res.join("");

};


GROLIAAS.ListDetailsView = function (context) {
    this.sharedlink = true;
    this.sessionId = context.sessionId;
    this.savedSession = context.sharedSession;
    GROLIAAS.ListSetUpView.apply(this, [{ active: true }]);
};

GROLIAAS.ListDetailsView.prototype = new GROLIAAS.ListSetUpView();
GROLIAAS.ListDetailsView.prototype.constructor = GROLIAAS.ListDetailsView;

GROLIAAS.ListDetailsView.prototype.builAccord = function (store) {
    var res = [];
    this.savedSession = this.savedSession || {};
    var list = [];

    for (var i = 0; i < store.length; i++) {
        for (var j = 0; j < store[i].Items.length; j++) {
            if (this.savedSession[store[i].Items[j].ItemDescription]) {
                list.push(store[i].Items[j]);
            }
        }
    }
    res.push("<h3><a  href='#'>&nbsp Grocery List  </a></h3><div>");
    res.push(this.buildChecks(list));
    res.push("</div>");
    return res.join("");

};
