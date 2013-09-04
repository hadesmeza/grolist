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
            index[this.items[i].SectionName.trim().toLowerCase()] = this.items[i];
        }
        this.index = function () {
            return index;
        };
        return index;
    },
    addCategory: function (section) {
        var sec = { SectionName: section, Items: [] };
        this.items.splice(0, 0, sec);
        this.index()[section.toLowerCase()] = sec;
        this.save();
    },
    updateCategoryName: function (sectionName, newName) {
        sectionName = sectionName.toLowerCase();
        var original = newName;
        newName = newName.toLowerCase();
        //update index
        var section = this.getSectionByName(sectionName);
        delete this.index()[sectionName];
        section.SectionName = original;
        this.index()[newName] = section;

    },
    sectionExists: function (sectionName) {
        return !!this.index()[sectionName.toLowerCase()];
    },
    getSectionItemsByName: function (sectionName) {
        return this.index()[sectionName.toLowerCase()].Items;
    },
    getSectionByName: function (sectionName) {
        return this.index()[sectionName.toLowerCase()];
    },
    restoreHiddenSections: function () {
        for (var i = 0; i < this.items.length; i++) this.items[i].isHidden = false;

        this.hiddenSections = {};
        localStorage.setItem(GROLIAAS.keys.MASTERLIST, JSON.stringify(this.items));
    },

    //querables
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
    removeAll: function (collection, predicate) {
        var currStore = collection,
            l = currStore.length;
        for (var j = 0; j < l; j++) {
            if (predicate(currStore[j])) {
                currStore.splice(j, 1);
                j--;
                l--;
            }
        }
    },
    flattenStore: function () {
        var store = [];
        var table = this.index();
        for (var i in table) {
            if (table[i].isHidden) continue;
            for (var j = 0; j < table[i].Items.length; j++)
                store.push(table[i].Items[j]);
        }
        return store;
    },
    findBy: function (itemName) {
        var flattenStore = this.flattenStore();

        var pattern = new RegExp("^" + itemName, "i");
        for (var i = 0; i < flattenStore.length; i++) {
            if (pattern.test(flattenStore[i].ItemDescription)) return flattenStore[i];
        }
        return null;
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

GROLIAAS.define("GROLIAAS.Button", {
    title: "",
    type: "",
    cls: "",
    style: { color: "gray"},
    getMarkup: function () {

        var cls = this.cls.split(",");
        var styles = [];
        cls.push("menuitem");
        for (var i in this.style) {
            styles.push(i + " : " + this.style[i] + ";");
        }
        return ['<div class="' + cls.join(" ") + '"><div><span class="icon-',
                this.type,
                '" title="',
                this.title + '"',
               " style='" + styles.join("") + "'",
                '"></span></div></div>'
        ].join("");
    },
    content: undefined,
    constructor: function (config) {
        this.title = config.title;
        this.type = config.type;
        this.style = config.style || this.style;
        this.cls = config.cls || "";
        this.content = this.getMarkup();

    },
    statics: {
        getNew: function (title, type, style, cls) {
            return new GROLIAAS.Button({ title: title, type: type, style: style, cls: cls });
        }
    }
});

GROLIAAS.define("GROLIAAS.ToolBar", {
    buttons: [],
    render: function () {
        var mkp = [];
        for (var i = 0; i < this.buttons.length; i++) {
            mkp.push(this.buttons[i].content);
        }

        $("#gl-toolbar").html(mkp.join(""));
    },

    constructor: function (config) {
        this.buttons = config.buttons;
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
        var flatstore = self.store.flattenStore();
        var toggleItemSelection = function (elem, continuefunc) {
            var check = elem.find('input');

            if (!$(check).prop("checked")) {
                elem.addClass("check-down");
                $(check).prop("checked", true);
                if (continuefunc) continuefunc(true, elem);
            } else {
                elem.removeClass("check-down");
                $(check).prop("checked", false);
                if (continuefunc) continuefunc(false, elem);
            }
        };
        var updateItemStatus = function (isChecked, elem) {
            var name = elem.find("input").val();
            if (name) {
                var item = self.store.findBy(name.trim());
                if (item) {
                    item.IsChecked = isChecked;
                    //this is ugly change it
                    if (!isChecked) delete self.session.savedSession[name];
                }
            }

        };
        //delegate to items as they might be dynamically removed or added
        //< quick lookup >
        $(document).on("keyup", "#item-search", function () {
            var val = $(this).val().trim();
            var result = [];
            if (val) {
                var pattern = new RegExp("^" + val, "i");
                for (var i = 0; i < flatstore.length; i++) {

                    if (pattern.test(flatstore[i].ItemDescription)) {
                        result.push(flatstore[i]);
                    }

                }
            }

            $(".search-items-container").html(self.buildChecks(result));
        });
        //< dialogue chackable items [quick lookup, remove items]>
        $(document).on("click", "#r-settings-dialog .g-items .check-btn", function () {
            var elem = $(this);
            var action = undefined;
            //TODO: abstract the operation for when we are doin a quick look up
            if (elem.parentsUntil(".ui-dialog").find(".search-items-container").length) {
                action = updateItemStatus;
            }
            toggleItemSelection(elem, action);
        });
        //< accordion item setting buttons >
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
        //< accordion content checkable items >
        $(document).on("click", ".content-items .g-items .check-btn", function () {
            var elem = $(this);
            var header = $($("#accordion h3")[$("#accordion").accordion("option", "active")]);
            var continueFunc = function (isChecked,elem) {
                updateItemStatus(isChecked, elem);
                header.html(self.getHeaderContent(elem.parent().parent().find("input:checked").length, header));
                self.saveData();
            };
            toggleItemSelection(elem, continueFunc);

        });
        //< toolbar >
        $(".menuitem").on("click", function () {
            var el = $(this).find("span");
            if (el.hasClass("icon-search")) {
                self.searchItem();
            }
            if (el.hasClass("icon-plus")) {
                self.addCategory();
            } else if (el.hasClass("icon-info")) {
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
        //< footer >
        $(document).on("click", ".footer", function () { self.showAllCategories.call(self); });
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
                self.render();
                //init controllers
                self.initControllers();
                GROLIAAS.ContextUtils.sayWelcome();

            });
        } else {
            self.render();
            self.initControllers();
        }
    },

    // <view rendering>
    render: function () {
        this.renderAccordion();
        this.renderToolBar();
    },

    renderToolBar: function () {
        var buttons = [
            GROLIAAS.Button.getNew("about", "info"          /*, { color: "#4B8DF8" } */  ),
            GROLIAAS.Button.getNew("Build list", "hammer"   /*, { color: "orange" }  */  ),
            GROLIAAS.Button.getNew("Add Category", "plus"   /*, { color: "#3f980e" } */  ),
            GROLIAAS.Button.getNew("Quick search", "search"/*, { color: "red" }     */  )//,
           // GROLIAAS.Button.getNew("Quick search", "", {  },"item-search"),
        ];

        new GROLIAAS.ToolBar({ buttons: buttons }).render();
    },

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
            text = header.text(),
            replOps = replaceOps || { regex: /\+\d+/g, val: "" };
        if (text.match(/\+\d+/g)) {
            text = text.split('+')[0];
        }
        if (cnt > 0) {
            text = replOps.val || text;
            return "<a href='#'><span class='icon-basket'></span>&nbsp;" + text.trim() + "<span  style='color:#269ccb;'> +" + cnt + "</span></a>";
        } else {
            text = replOps.val || text;
            return "<a href='#'>" + text.trim() + "<div class='check-btn content-settings icon-redo' action='hideCategory' style=' background:white; border-color:#737373; color:#737373;float:right; font-size:10px; width:20px; font-weight:normal;'></div></a>";
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
            if (checked || items[i].IsChecked) {
                checked = true;
                chk = "checked = 'true'";
            }
            var content = ['<div class="check-btn ', checked ? " check-down " : "", '"><span class="status icon-check-alt"></span><input style ="display:none;" type="checkbox" name="item" value="', items[i].ItemDescription, '" ', chk, ' >', "&nbsp;", items[i].ItemDescription, "</div>"].join("");
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
        store.sort(function (a, b) {
            if (a.SectionName.trim() == b.SectionName.trim()) return 0;
            return a.SectionName.trim() > b.SectionName.trim() ? 1 : -1;
        });

        //store.sort(function (a, b) {
        //    if (a.Items.length == b.Items.length) return 0;
        //    return a.Items.length > b.Items.length ? 1 : -1;
        //});

        for (var i = 0; i < store.length; i++) {
            if (store[i].isHidden) continue;
            settings = this.sharedlink ? "" : "<br/><div style='width:100%; overflow:hidden;display:block;'><div class='check-btn content-settings' action='add' section='" + store[i].SectionName + "'> + </div><div class='check-btn content-settings' action='remove' section='" + store[i].SectionName + "'> - </div><div class='check-btn content-settings icon-pencil-2' style='font-size:12px; padding-top:10px; padding-bottom:9px; font-weight:normal;' action='editCategoryTitle' section='" + store[i].SectionName + "'></div></div>"; //<div class='check-btn content-settings' action='remove' > - </div>
            res.push("<h3 @section='" + store[i].SectionName + "'><a  'href='#'>&nbsp" + store[i].SectionName + "</a></h3>" + "<div  class='content-items'>" + this.buildChecks(store[i].Items) + settings + "</div>");
        }

        return res.join("");

    },

    refreshAccordion: function () {
        $('#accordion').accordion("refresh");
    },

    renderCatSettings: function () {
    },

    renderFooter: function (clear) {
        if (!clear) {
            $("footer").html('<div class="footer"><hr class="style-one"><span>show all</span></div>');
        } else {

            $("footer").html('');
        }

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
        } else this.renderFooter(true);
    },

    // </view rendering> 

    //<controller actions>
    searchItem: function () {
        var self = this;
        $("#r-settings-dialog").html("<input id='item-search' style='font-size:13px; height:25px; margin-left:15px; width:90%; margin-bottom:20px;'></input><span class='icon-search' style='margin-left:-20px;'></span><div class='search-items-container'></div>");
        $("#r-settings-dialog").dialog({
            modal: true,
            width: "100%",
            title: "Quick lookup",
            position: { my: "top", at: "top" },
            buttons: [{
                text: "ok",
                click: function () {
                    //TODO: check if dirty 
                    self.store.save();
                    self.renderAccordion();
                    $(this).dialog("close");
                }
            }]
        });
    },

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
                        self.store.removeAll(currStore, function (item) { return !!toDelete[item.ItemDescription.trim()]; });
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
        var content = head.next();
        var sectionName = head.attr("@section").trim();
        parent.add(head).fadeOut('slow', function () { $(this).remove(); });
        content.remove();
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
        var self = this;
        $("#a-settings-dialog").dialog({
            modal: true,
            title: "New Category",
            buttons: [{
                text: "ok",
                open: function () { $(this).find("input").val(""); },
                close: function () { $(".a-settings-error").hide(); },
                click: function () {
                    var newitem = $(this).find("input").val().trim();
                    if (newitem) {
                        if (self.store.sectionExists(newitem)) {
                            $(".a-settings-error").show();
                            return;
                        } else {
                            newitem = GROLIAAS.ContextUtils.formatPascalCase(newitem);
                            $(this).find("input").val("");
                            self.store.addCategory(newitem);
                            self.renderAccordion();
                        }
                    }

                    $(this).dialog("close");
                }
            }]
        });
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
                            header.html(self.getHeaderContent($(ops.scope).parent().parent().find("input:checked").length, header, { val: newitem }));
                            $(ops.scope).attr("section", newitem);
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


