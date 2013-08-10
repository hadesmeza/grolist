GROLIAAS.define("GROLIAAS.Categories", {
    constructor: function () {
        this.items = $.parseJSON(localStorage.getItem(GROLIAAS.keys.MASTERLIST));
        this.isEmpty = !this.items;
        this.hiddenSections = {};// try get from storage
    },
    save: function () {
        //check if anything was hidden
        for (var hidden in this.hiddenSections) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.hiddenSections[this.items[i].SectionName.trim()]) {
                    this.items[i].isHidden = true;
                }
            }
            break;
        }
        localStorage.setItem(GROLIAAS.keys.MASTERLIST, JSON.stringify(this.items));
    },
    restoreHiddenSections: function () {
        for (var i = 0; i < this.items.length; i++) this.items[i].isHidden = false;

        this.hiddenSections = {};
        localStorage.setItem(GROLIAAS.keys.MASTERLIST, JSON.stringify(this.items));
    },
    any: function (predicate) {
        for (var i = 0; i < this.items.length; i++) {
            if (predicate(this.items[i])) return true;
        }
        return false;
    },
    statics: {
        getCategories: function () {
            return new GROLIAAS.Categories();
        }
    }
});

GROLIAAS.define("GROLIAAS.Session", {
    constructor: function (options) {
        options = options || {};
        this.savedSession = options.savedSession || $.parseJSON(localStorage.getItem(GROLIAAS.keys.PRINCIPAL));
        this.isEmpty = !this.savedSession;
        this.sessionId = options.sessionId || localStorage.getItem(GROLIAAS.keys.SESSIONID);
    },
    save: function () {
        localStorage.setItem(GROLIAAS.keys.PRINCIPAL, JSON.stringify(this.savedSession));
    },
    statics: {
        getSession: function () {
            return new GROLIAAS.Session();
        },
        getSessionId: function () {
            return localStorage.getItem(GROLIAAS.keys.SESSIONID);
        },
        setSessionId: function (id) {
            localStorage.setItem(GROLIAAS.keys.SESSIONID, id);
        }
    }
});

GROLIAAS.define("GROLIAAS.ListSetUpView", {

    constructor: function () {
        this.session = GROLIAAS.Session.getSession();
        this.store = GROLIAAS.Categories.getCategories();
        this.lazyGet = this.store.isEmpty;
    },

    initControllers: function () {
        var self = this;
        //delegate to items as they might be dynamically removed or added
        $(document).on("click", ".content-items .g-items .check-btn", function () {
            var elem = $(this);
            var check = elem.find('input');
            if (!$(check).prop("checked")) {
                elem.addClass("check-down");
                $(check).prop("checked", true);
                self.addIndicator2.apply(this, [elem.parent().parent().find("input:checked").length]);
                self.saveData();
            } else {
                elem.removeClass("check-down");
                $(check).prop("checked", false);
                self.addIndicator2.apply(this, [elem.parent().parent().find("input:checked").length]);
                self.saveData();
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
        $(document).on("click", ".footer", function () { self.showAllCategories.call(self); });
        $(document).on("click", ".icon-eye-blocked", function (event) {
            event.stopPropagation(); // this is
            event.preventDefault(); // the magic
            var header = $(this).parent().parent();
            var contentItems = header.next();
            var sectionName = header.attr("@section").trim();
            self.store.hiddenSections[sectionName] = true;
            header.remove();
            contentItems.remove();
            self.saveData();
            self.renderFooter();
        });
        $(".menuitem").on("click", function () {
            var el = $(this).find("span"),
                fcolor = el.css("color"),
                showSuccess = function () {
                    $(el).effect("bounce", "slow");

                    $(el).css("color", "orange");

                    setTimeout(function () {
                        $(el).css("color", "green");
                        setTimeout(function () {
                            $(el).css("color", "#269ccb");
                            setTimeout(function () { $(el).css("color", fcolor); }, 500);
                        }, 500);
                    }, 1000);

                };

            if (el.hasClass("icon-info")) {
                $("#dialog").dialog({ modal: true, width: "auto;" });
            } else if (el.hasClass("icon-download")) {
                self.saveData();
                showSuccess();
            } else if (el.hasClass("icon-hammer")) {
                self.generateSharingLink();
            } else if (el.hasClass("icon-pencil-2")) {
                //save context
                if (self.sessionId) {
                    self.saveData();
                    GROLIAAS.Sesssion.setSessionId(self.sessionId);
                }
                location.href = location.origin;
            }
        });
        $(document).on("click", ".check-btn.content-settings", function () {
            var elem = $(this);
            var action = elem.attr("action");
            var section = elem.attr("section");
            if (action) {
                self[action + "Item"]({ section: section, scope: this });
            }

        });
    },

    initComponent: function () {

        var self = this;
        if (self.lazyGet) {
            $.ajax({
                url: "/home/GetMasterList",
                type: 'POST'
            }).done(function (response) {

                self.store.items = response;
                self.store.save();
                //render view
                self.renderAccordion();
                //init controllers
                self.initControllers();
                GROLIAAS.ContextUtils.sayWelcome();

            });
        } else {
            self.renderAccordion();
            self.initControllers();
        }
    },

    addIndicator: function (el) {
        var categories = $("#accordion").children();
        var text;
        for (var i = 1; i < categories.length; i += 2) {
            var header = $(categories[i - 1]);
            var content = $(categories[i]);
            var cnt = content.find("input:checked").length;
            if (cnt > 0) {
                text = header.text().replace(/\+\d+/g, "");
                header.html("<a href='#'><span class='icon-basket'></span>&nbsp;" + text.trim() + "<span style='color:#269ccb;'> +" + cnt + "</span></a>");
            } else {
                text = header.text().replace(/\+\d+/g, "");
                ;
                header.html("<a href='#'>" + text.trim() + "<span class='icon-eye-blocked' style='float:right; font-size:20px;'></span></a>");
            }

        }

    },

    addIndicator2: function (cnt) {
        if (cnt > 0) {
            var header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);
            var text = header.text().replace(/\+\d+/g, "");
            header.html("<a href='#'><span class='icon-basket'></span>&nbsp;" + text.trim() + "<span style='color:#269ccb;'> +" + cnt + "</span></a>");
        } else {
            var header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);
            var text = header.text().replace(/\+\d+/g, "");
            header.html("<a href='#'>" + text.trim() + "<span class='icon-eye-blocked' style='float:right; font-size:20px;'></span></a>");
        }
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
            var checked = noCheck ? null : this.session.savedSession[items[i].ItemDescription];
            var chk = "";
            if (checked) {
                chk = "checked = 'true'";
            }
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

    renderFooter: function () {
        $("footer").html('<div class="footer"><hr class="style-one"><span>show all</span></div>');
    },
    
    renderAccordion: function () {
        $("#accordion").accordion("destroy");
        var markup = this.builAccord(this.store.items);
        $('#accordion').html(markup);
        $('#accordion').accordion({
            icons: false,
            autoHeight: false,
            clearStyle: true,
            collapsible: true
        });
        this.addIndicator();
        if (!this.sharedlink && this.store.any(function (item) { return item.isHidden === true; })) {
            this.renderFooter();
        }
    },

    addItem: function (options) {
        var self = this;
        var section = options.section.trim();
        var opts = options;
        $("#a-settings-dialog").dialog({
            modal: true,
            buttons: [{
                text: "ok",
                click: function () {
                    var newitem = $(this).find("input").val().trim();
                    //clear old val
                    $(this).find("input").val("");
                    //add length validation
                    if (newitem) {
                        newitem = GROLIAAS.ContextUtils.formatPascalCase(newitem);
                        var markup;
                        var isNew = true;
                        for (var i = 0; i < self.store.items.length; i++) {
                            var temp = self.store.items[i].SectionName;
                            if (section === temp.trim()) {
                                //check if item already exists
                                for (var j = 0; j < self.store.items[i].Items.length; j++) {
                                    if (newitem.trim() === self.store.items[i].Items[j].ItemDescription.trim()) {
                                        isNew = false;
                                        //display item alredy exists in section
                                        break;
                                    }

                                }
                                if (isNew) {
                                    self.store.items[i].Items.push({ ItemDescription: newitem, IsChecked: false });
                                    markup = self.buildChecks(self.store.items[i].Items);
                                    $(opts.scope).parent().parent().find(".item-columns").html(markup);
                                    self.refreshAccordion();
                                    self.addIndicator();
                                    self.saveSession();
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
        for (var i = 0; i < self.store.items.length; i++) {
            if (self.store.items[i].SectionName.trim() === section) {
                markup = self.buildChecks(self.store.items[i].Items, true);
                currStore = self.store.items[i].Items;
                break;

            }

        }
        $("#r-settings-dialog").html(markup);
        $("#r-settings-dialog").dialog({
            modal: true,
            buttons: [{
                text: "ok",
                click: function () {
                    var selected = $(this).find("input:checked");
                    var toDelete = GROLIAAS.ContextUtils.toObject(selected);
                    if (toDelete) {
                        var l = currStore.length;
                        for (var j = 0; j < l; j++) {
                            if (toDelete[currStore[j].ItemDescription.trim()]) {
                                currStore.splice(j, 1);
                                j--;
                                l--;
                            }

                        }
                        self.saveSession();
                        markup = self.buildChecks(currStore);
                        $(opts.scope).parent().parent().find(".item-columns").html(markup);
                        self.refreshAccordion();
                        self.addIndicator();

                    }
                    $(this).dialog("close");
                }
            }]
        });
    },

    generateSharingLink: function () {
        if (this.sharedlink) {
            $(".icon-signup").attr("title", "Link is already shareable");
            return;
        }
        ;
        this.saveData();
        var session = this.session.sessionId;
        $.ajax({
            url: "/home/SaveSession",
            type: 'POST',
            data: { selections: JSON.stringify(this.session.savedSession), session: session },
        }).done(function (response) {
            GROLIAAS.Session.setSessionId(response.sessionid);
            location.href = location.href + response.sessionid;
        });
    },

    saveSession: function () {
        this.saveData();
    },

    saveData: function () {
        var sections = $('#accordion > div input:checked ');
        var map = {};
        for (var i = 0; i < sections.length; i++) {
            map[sections[i].value] = true;
        }
        this.session.savedSession = map;
        this.session.save();
        this.store.save();
    },

    builAccord: function (store) {
        var res = [];
        this.session.savedSession = this.session.savedSession || {};

        var settings;
        for (var i = 0; i < store.length; i++) {
            if (store[i].isHidden) continue;
            settings = this.sharedlink ? "" : "<br/><div style='width:100%; overflow:hidden;display:block;'><div class='check-btn content-settings' action='add' section='" + store[i].SectionName + "'> + </div><div class='check-btn content-settings' action='remove' section='" + store[i].SectionName + "'> - </div></div>"; //<div class='check-btn content-settings' action='remove' > - </div>
            res.push("<h3 @section='" + store[i].SectionName + "'><a  'href='#'>&nbsp" + store[i].SectionName + "</a></h3>" + "<div  class='content-items'>" + this.buildChecks(store[i].Items) + settings + "</div>");
        }

        return res.join("");

    },

    showAllCategories: function () {
        
        this.store.restoreHiddenSections();
        this.renderAccordion();
        //rebuild accordion
    }


});


