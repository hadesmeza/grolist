
GROLIAAS.define("GROLIAAS.ListDetailsView", {
    extends: "GROLIAAS.ListSetUpView",
    constructor: function (context) {
        this.sharedlink = true;
        this.sessionId = context.sessionId;
        this.savedSession = context.sharedSession;
        GROLIAAS.ListSetUpView.apply(this, [{ active: true }]);
    },
   
    builAccord : function (store) {
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
        res.push("<div  class='content-items'>" + this.buildChecks(list) +"</div>");
        res.push("</div>");
        return res.join("");

    },


});

