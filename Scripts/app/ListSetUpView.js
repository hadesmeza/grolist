GROLIAAS.define("GROLIAAS.ListSetUpView", {

    constructor: function (options) {
        options = options || {};
        this.savedSession = this.savedSession ? $.parseJSON(this.savedSession) : $.parseJSON(localStorage.getItem(GROLIAAS.keys.PRINCIPAL));
        this.store = $.parseJSON(localStorage.getItem(GROLIAAS.keys.MASTERLIST));
        this.lazyGet = !this.store;
        var self = this;

        var addIndicator = function (el) {
            var categories = $("#accordion").children();

            for (var i = 1; i < categories.length; i += 2) {
                var header = $(categories[i - 1]);
                var content = $(categories[i]);
                var cnt = content.find("input:checked").length;
                if (cnt > 0) {
                    var text = header.text();
                    header.html("<a href='#'><span class='icon-cart'></span>&nbsp;" + text.trim() + " ( " + cnt + " ) </a>");
                } else {
                    var text = header.text();
                    header.html("<a href='#'>" + text.trim() + "</a>");
                }

            }

        };

        this.addIndicator2 = function (cnt) {
            if (cnt > 0) {
                var header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);
                var text = header.text().replace(/\(\s\d+\s\)/g, "");
                header.html("<a href='#'><span class='icon-cart'></span>&nbsp;" + text.trim() + " ( " + cnt + " ) </a>");
            } else {
                var header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);
                var text = header.text().replace(/\(\s\d+\s\)/g, "");
                header.html("<a href='#'>" + text.trim() + "</a>");
            }
        };

        this.initComponent = function () {

            if (self.lazyGet) {
                $.ajax({
                    url: "/home/GetMasterList",
                    type: 'POST'
                }).done(function (response) {

                    self.store = response;
                    self.buildAccordion();
                    localStorage.setItem(GROLIAAS.keys.MASTERLIST, JSON.stringify(self.store));
                    setTimeout(function () {
                        addIndicator();
                    }, 0);
                    GROLIAAS.ContextUtils.sayWelcome();

                });
            } else {
                self.buildAccordion();
                setTimeout(function () {
                    addIndicator();
                }, 0);
            }

        };
    },


    buildChecks: function (items, noCheck) {
        var left = ["<div class='g-items' style='float:left; width:50%;'>"];
        var right = ["<div class= 'g-items' style='float:right; width:50%;'>"];
        items.sort(function (a, b) {
            if (a.ItemDescription.trim() == b.ItemDescription.trim()) return 0;
            return a.ItemDescription.trim() > b.ItemDescription.trim() ? 1 : -1;
        });
        var slice = items.length / 2;
        for (var i = 0; i < items.length; i++) {
            var checked = noCheck ? null : this.savedSession[items[i].ItemDescription];
            var chk = checked ? " checked='true' " : "";
            var content = ['<div class="check-btn ', checked ? " check-down " : "", '"><input style ="display:none;" type="checkbox" name="item" value="', items[i].ItemDescription, '" ', chk, ' >', "&nbsp;", items[i].ItemDescription, "</div>"].join("");
            if (i < slice) {
                left.push(content);
            } else
                right.push(content);

        }
        left.push("</div>");
        right.push("</div>");
        return "<div class='item-columns'>" + left.join("") + right.join("") + "</div>";
    },

    refreshAccordion: function () {
        $('#accordion').accordion("refresh");
    },
    buildAccordion: function (active) {
        var self = this;
        var markup = this.builAccord(this.store);
        $('#accordion').html(markup);
        $('#accordion').accordion({
            icons: false,
            autoHeight: false,
            clearStyle: true,
            collapsible: true
        });
        if (!active) {
            //delegate to items as they might be dynamically removed or added
            $(document).on("click", ".content-items .g-items .check-btn", function () {
                var elem = $(this);
                var check = elem.find('input');
                if (!$(check).prop("checked")) {
                    elem.addClass("check-down");
                    $(check).prop("checked", true);
                    self.addIndicator2.apply(this, [elem.parent().parent().find("input:checked").length]);
                } else {

                    elem.removeClass("check-down");
                    $(check).prop("checked", false);

                    self.addIndicator2.apply(this, [elem.parent().parent().find("input:checked").length]);
                }
            });
            $(document).on("click", "#r-settings-dialog .g-items .check-btn", function () {
                var elem = $(this);
                var check = elem.find('input');
                if (!$(check).prop("checked")) {
                    elem.addClass("check-down");
                    $(check).prop("checked", true);
                } else {

                    elem.removeClass("check-down");
                    $(check).prop("checked", false);

                }
            });
            $(".menuitem").on("click", function () {
                var el = $(this).find("span");

                if (el.hasClass("icon-info")) {
                    $("#dialog").dialog({ modal: true, width: "auto;" });
                } else if (el.hasClass("icon-play")) {
                    self.generateSharingLink();
                } else if (el.hasClass("icon-pencil")) {
                    //save context
                    if (self.sessionId) {
                        localStorage.setItem(GROLIAAS.keys.PRINCIPAL, JSON.stringify(self.savedSession));
                        localStorage.setItem(GROLIAAS.keys.SESSIONID, self.sessionId);
                    }
                    location.href = location.origin;
                }
            });

            $(".check-btn.content-settings").on("click", function () {
                var elem = $(this);
                var action = elem.attr("action");
                var section = elem.attr("section");
                if (action) {
                    self[action + "Item"]({ section: section, scope: this });
                }

            });
        }

    },


    addItem: function (options) {
        var self = this;
        var section = options.section.trim();
        var opts = options;
        $("#a-settings-dialog").dialog({
            modal: true,
            buttons: [{
                text: "ok", click: function () {
                    var newitem = $(this).find("input").val();
                    //add length validation
                    if (newitem) {
                        newitem = GROLIAAS.ContextUtils.formatPascalCase(newitem);
                        var markup;
                        var isNew = true;
                        for (var i = 0; i < self.store.length; i++) {
                            var temp = self.store[i].SectionName;
                            if (section === temp.trim()) {
                                //check if item already exists
                                for (var j = 0; j < self.store[i].Items.length; j++) {
                                    if (newitem.trim() === self.store[i].Items[j].ItemDescription.trim()) {
                                        isNew = false;
                                        //display item alredy exists in section
                                        break;
                                    }

                                }
                                if (isNew) {
                                    self.store[i].Items.push({ ItemDescription: newitem, IsChecked: false });
                                    markup = self.buildChecks(self.store[i].Items);
                                    $(opts.scope).parent().parent().find(".item-columns").html(markup);
                                    self.refreshAccordion();
                                    //persist changes
                                    localStorage.setItem(GROLIAAS.keys.MASTERLIST, JSON.stringify(self.store));
                                }
                                break;
                            }
                        }
                    }

                    $(this).dialog("close");
                }
            }]
        });

    },
    removeItem: function (options) {

        var self = this;
        var section = options.section.trim();
        var opts = options;
        var markup = "";
        var currStore = [];
        for (var i = 0; i < self.store.length; i++) {
            if (self.store[i].SectionName.trim() === section) {
                markup = self.buildChecks(self.store[i].Items, true);
                currStore = self.store[i].Items;
                break;

            }

        }
        $("#r-settings-dialog").html(markup);
        $("#r-settings-dialog").dialog({
            modal: true,
            buttons: [{
                text: "ok", click: function () {
                    var toDelete = GROLIAAS.ContextUtils.toObject($(this).find("input:checked"));
                    if (toDelete) {
                        var l = currStore.length;
                        for (var j = 0; j < l; j++) {
                            if (toDelete[currStore[j].ItemDescription.trim()]) {
                                currStore.splice(j, 1);
                                j--;
                                l--;
                            }

                        }
                        
                        markup = self.buildChecks(currStore);
                        $(opts.scope).parent().parent().find(".item-columns").html(markup);
                        self.refreshAccordion();
                        //persist changes
                        localStorage.setItem(GROLIAAS.keys.MASTERLIST, JSON.stringify(self.store));

                    }
                    $(this).dialog("close");
                }
            }]
        });
    },
    getSelections: function () {
        var sections = $('#accordion > div input:checked ');
        var map = {};
        for (var i = 0; i < sections.length; i++) {
            map[sections[i].value] = true;
        }

        return JSON.stringify(map);
    },


    generateSharingLink: function () {
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
    },


    saveData: function (silent) {
        var serData = this.getSelections();
        if (serData) {
            localStorage.setItem(GROLIAAS.keys.PRINCIPAL, serData);
            if (!silent) {
            }
        }
    },

    builAccord: function (store) {
        var res = [];
        this.savedSession = this.savedSession || {};

        var settings;
        for (var i = 0; i < store.length; i++) {
            settings = this.sharedlink ? "" : "<br/><div style='width:100%; overflow:hidden;display:block;'><div class='check-btn content-settings' action='add' section='" + store[i].SectionName + "'> + </div><div class='check-btn content-settings' action='remove' section='" + store[i].SectionName + "'> - </div></div>"; //<div class='check-btn content-settings' action='remove' > - </div>
            res.push("<h3><a  'href='#'>&nbsp" + store[i].SectionName + "</a></h3>" + "<div  class='content-items'>" + this.buildChecks(store[i].Items) + settings + "</div>");
        }

        return res.join("");

    }


});


