GROLIAAS.define("GROLIAAS.Categories", {
    constructor: function () {
        this.items = $.parseJSON(localStorage.getItem(GROLIAAS.keys.MASTERLIST));
        this.isEmpty = !this.items;
        this.hiddenSections = {}; // try get from storage
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
    index: function () {
        var index = {};
        for (var i = 0; i < this.items.length; i++) {
            index[this.items[i].SectionName.trim()] = this.items[i];
        }
        this.index = function () {
            return index;
        };
        return index;
    },
    updateCategoryName: function (sectionName, newName) {
        //update index
        var section = this.getSectionByName(sectionName);
        delete this.index()[sectionName];
        section.SectionName = newName;
        this.index()[newName] = section;

    },
    sectionExists: function (sectionName) {
        return !!this.index()[sectionName];
    },
    getSectionItemsByName: function (sectionName) {
        return this.index()[sectionName].Items;
    },
    getSectionByName: function (sectionName) {
        return this.index()[sectionName];
    },
    restoreHiddenSections: function () {
        for (var i = 0; i < this.items.length; i++) this.items[i].isHidden = false;

        this.hiddenSections = {};
        localStorage.setItem(GROLIAAS.keys.MASTERLIST, JSON.stringify(this.items));
    },
    any: function (collection, predicate) {
        var list = collection;
        if ($.isFunction(collection)) {
            list = this.items;
            predicate = collection;
        }

        for (var i = 0; i < list.length; i++) {
            if (predicate(list[i])) return true;
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
            var header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);
            if (!$(check).prop("checked")) {
                elem.addClass("check-down");
                $(check).prop("checked", true);
                header.html(self.getHeaderContent(elem.parent().parent().find("input:checked").length, header));
                self.saveData();
            } else {
                elem.removeClass("check-down");
                $(check).prop("checked", false);
                header.html(self.getHeaderContent(elem.parent().parent().find("input:checked").length, header));
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
        $(".menuitem").on("click", function () {
            var el = $(this).find("span");

            if (el.hasClass("icon-info")) {
                $("#dialog").dialog({ modal: true, width: "auto;" });
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
        $(document).on("click", ".check-btn.content-settings", function (event) {
            event.stopImmediatePropagation(); // this is
            event.preventDefault(); // the magic
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

    // <view rendering>

    addIndicator: function (el) {
        var categories = $("#accordion").children();
        var header;
        for (var i = 1; i < categories.length; i += 2) {
            header = $(categories[i - 1]);
            var content = $(categories[i]);
            var cnt = content.find("input:checked").length;
            header.html(this.getHeaderContent(cnt, header));
        }

    },

    getHeaderContent: function (cnt, headerel, replaceOps) {
        var header = headerel,
            text,
            replOps = replaceOps || { regex: /\+\d+/g, val: "" };
        if (cnt > 0) {
            text = header.text().replace(replOps.regex, replOps.val);
            return "<a href='#'><span class='icon-basket'></span>&nbsp;" + text.trim() + "<span style='color:#269ccb;'> +" + cnt + "</span></a>";
        } else {
            text = header.text().replace(replOps.regex, replOps.val);
            return "<a href='#'>" + text.trim() + "<div class='check-btn content-settings icon-redo' action='hideCategory' style=' background:white; border-color:#737373; color:#737373;float:right; font-size:15px; font-weight:normal;'></div></a>";
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

    builAccord: function (store) {
        var res = [];
        this.session.savedSession = this.session.savedSession || {};
        var settings;

        for (var i = 0; i < store.length; i++) {
            if (store[i].isHidden) continue;
            settings = this.sharedlink ? "" : "<br/><div style='width:100%; overflow:hidden;display:block;'><div class='check-btn content-settings' action='add' section='" + store[i].SectionName + "'> + </div><div class='check-btn content-settings' action='remove' section='" + store[i].SectionName + "'> - </div><div class='check-btn content-settings icon-pencil-2' style='font-size:12px; padding-top:10px; padding-bottom:8px; font-weight:normal;' action='editCategoryTitle' section='" + store[i].SectionName + "'></div></div>"; //<div class='check-btn content-settings' action='remove' > - </div>
            res.push("<h3 @section='" + store[i].SectionName + "'><a  'href='#'>&nbsp" + store[i].SectionName + "</a></h3>" + "<div  class='content-items'>" + this.buildChecks(store[i].Items) + settings + "</div>");
        }

        return res.join("");

    },

    refreshAccordion: function () {
        $('#accordion').accordion("refresh");
    },

    renderCatSettings: function () {
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

    // </view rendering> 

    //<controller actions>

    addItem: function (options) {
        var self = this;
        var section = options.section.trim();
        var opts = options;
        var currStore = self.store.getSectionItemsByName(section);
        $("#a-settings-dialog").dialog({
            modal: true,
            title: "New Item",
            buttons: [{
                text: "ok",
                close: function () { $(".a-settings-error").hide(); },
                click: function () {
                    var newitem = $(this).find("input").val().trim();
                    if (newitem) {
                        newitem = GROLIAAS.ContextUtils.formatPascalCase(newitem);
                        if (!self.store.any(currStore, function (item) { return newitem === item.ItemDescription.trim(); })) {
                            //clear old val
                            $(this).find("input").val("");
                            currStore.push({ ItemDescription: newitem, IsChecked: false });
                            $(opts.scope).parent().parent().find(".item-columns").html(self.buildChecks(currStore));
                            self.refreshAccordion();
                            self.addIndicator();
                            self.saveSession();
                        } else {
                            $(".a-settings-error").show();
                            return;
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
        var currStore = self.store.getSectionItemsByName(section);
        $("#r-settings-dialog").html(self.buildChecks(currStore, true));
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
                        $(opts.scope).parent().parent().find(".item-columns").html(self.buildChecks(currStore));
                        self.refreshAccordion();
                        self.addIndicator();

                    }
                    $(this).dialog("close");
                }
            }]
        });
    },
    
    hideCategoryItem: function (options) {
        var self = this;
        
        var parent = $(options.scope).closest('div');
        var head = parent.closest('h3');
        var sectionName = head.attr("@section").trim();
        parent.add(head).fadeOut('slow', function () { $(this).remove(); });
        self.store.hiddenSections[sectionName] = true;
        self.saveData();
        self.renderFooter();
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

    showAllCategories: function () {

        this.store.restoreHiddenSections();
        this.renderAccordion();
        //rebuild accordion
    },

    addCategory: function () {
    },

    editCategoryTitleItem: function (options) {
        var self = this,
            section = options.section.trim(),
            ops = options,
        header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);

        $("#a-settings-dialog").dialog({
            modal: true,
            title: "Edit Category Title",
            buttons: [{
                text: "ok",
                close: function () { $(".a-settings-error").hide(); },
                open: function (event, ui) {
                    $("#a-settings-dialog input").val(header.text().replace(/\+\d+/g, ""));
                },
                click: function () {
                    var newitem = $(this).find("input").val().trim();
                    if (newitem) {
                        if (self.store.sectionExists(newitem)) {
                            $(".a-settings-error").show();
                            return;
                        } else {
                            newitem = GROLIAAS.ContextUtils.formatPascalCase(newitem);
                            $(this).find("input").val("");
                            header.html(self.getHeaderContent($(ops.scope).closest("h3").find("input:checked").length, header, { regex: /\w+\s+\w+/g, val: newitem }));
                            self.store.updateCategoryName(section, newitem);
                            self.saveSession();
                        }
                    }

                    $(this).dialog("close");
                }
            }]
        });

    }

    //</controller actions>    
});


