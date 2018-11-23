// ==UserScript==
// @name         SOBotics Report Optimizer
// @namespace    https://github.com/LunarWatcher/userscripts
// @version      1.0.0
// @description  Hides visited reports to make it easier to process them without opening all of them. This is especially useful for large house reports.
// @author       Olivia Zoe
// @include      /^https?:\/\/reports\.sobotics\.org\/r\/.*$/
// @require      http://ajax.googleapis.com/ajax/libs/jquery/3.0.0/jquery.min.js
// @downloadURL  https://github.com/LunarWatcher/userscripts/raw/master/SOBoticsReportOptimizer/SOBoticsReportOptimizer.user.js
// @updateURL    https://github.com/LunarWatcher/userscripts/raw/master/SOBoticsReportOptimizer/SOBoticsReportOptimizer.user.js
// ==/UserScript==

const visitedReportColor = "e01d30";

let reports = undefined;

class Report {

    constructor(baseElement, urlElement, url){
        this.baseElement = baseElement;
        this.urlElement = urlElement;
        this.url = url;

        this.listen();

    }

    listen(){
        console.log(this.urlElement);
        this.urlElement.click(this.hide.bind(this));
    }

    show(){
        this.baseElement.show();
    }

    hide(){
        this.baseElement.hide();
    }

}

/**
 * Injects CSS containing a noticeably different color for visited links.
 */
function injectCss(){
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".reportLink a:visited { color: #" + visitedReportColor + " !important; display: none;}\n" +
        ".injectedSpan { color: #5dabff; }\n" +
        ".injectedSpan:hover { cursor: pointer; color: #5e5bff; }";
    document.body.appendChild(css);
}

function loadReports(){
    var reports = $(".report");
    var reportList = [];

    for(var i = 0; i < reports.length; i++){
        var report = $(reports[i]); // TODO see if there's a better way than this xd
        var linkContainer = report.find(".FIDtitle.reportLink");
        var link = linkContainer.children(0);
        var rawLink = link[0];
        var url = rawLink.href;

        var supportedReport = new Report(report, link, url);
        reportList.push(supportedReport);
    }

    return reportList;
}

function injectButton(){
    $("<span id=\"resetHiding\" class=\"injectedSpan\">Show visited reports</span>").insertAfter("#openAllReports").click(function () {
        for(var i = 0; i < reports.length; i++){
            reports[i].show();
        }
    });

    $("#openAllReports").append(" (" + reports.length + ")");
}

(function() {
    'use strict';
    injectCss();
    reports = loadReports();
    injectButton(reports);


})();
