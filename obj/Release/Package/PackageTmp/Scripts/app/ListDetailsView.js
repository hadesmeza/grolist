
GROLIAAS.define("GROLIAAS.ListDetailsView", {
    inherits: "GROLIAAS.ListSetUpView",
    constructor: function (context) {
        this.sharedlink = true;
        this.session = new GROLIAAS.Session({ savedSession: JSON.parse( context.sharedSession ), sessionId: context.sessionId });
    },

    builAccord: function (store) {
        var res = [];
        this.session.savedSession = this.session.savedSession || {};
        var list = [];

        for (var i = 0; i < store.length; i++) {
            for (var j = 0; j < store[i].Items.length; j++) {
                if (this.session.savedSession[store[i].Items[j].ItemDescription]) {
                    list.push(store[i].Items[j]);
                }
            }
        }
        res.push("<h3><a  href='#'>&nbsp Grocery List  </a></h3><div>");
        res.push("<div  class='content-items'>" + this.buildChecks(list) + "</div>");
        res.push("</div>");
        return res.join("");

    },
    
    buildChecks: function (items, noCheck) {
        var left = ["<div class='g-items' style='float:left; width:50%;'>"],
            right = ["<div class= 'g-items' style='float:right; width:50%;'>"],
            seen = {},
            i = 0;

        var slice = items.length / 2;
        for (; i < items.length; i++) {
            var checked = noCheck ? null : this.session.savedSession[items[i].ItemDescription];
            var chk = "";
            if (checked) {
                chk = "checked = 'true'";
                seen[items[i].ItemDescription] = true;
            }
            var content = ['<div class="check-btn ', checked ? " check-down " : "", '"><input style ="display:none;" type="checkbox" name="item" value="', items[i].ItemDescription, '" ', chk, ' >', "&nbsp;", items[i].ItemDescription, "</div>"].join("");
            if (i < slice) {
                left.push(content);
            } else
                right.push(content);

        }
        //add the newly added items 
        i = 0;
        for (var newitem in this.session.savedSession) {
            if (seen[newitem]) {
                i++;
                continue;
            }

            if (i % 2 === 0) {
                left.push(['<div class="check-btn  check-down " ><input style ="display:none;" type="checkbox" name="item" value="', newitem, '" checked=true >', "&nbsp;", newitem, "</div>"].join(""));
                i++;
            } else {
                i++;
                right.push(['<div class="check-btn  check-down " ><input style ="display:none;" type="checkbox" name="item" value="', newitem, '" checked=true >', "&nbsp;", newitem, "</div>"].join(""));
            }
        }


        left.push("</div>");
        right.push("</div>");
        return "<div class='item-columns'>" + left.join("") + right.join("") + "</div>";
    }


});

