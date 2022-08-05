const deilver = new EventTarget();

export const ModuleListener = {
    install: function () {
        ModuleManager.loadScript = function (t) {
            var e = this;
            return new Promise(function (n) {
                var r = "resource/app/" + t + "/" + t + ".js";
                RES.getResByUrl(
                    r,
                    function (t) {
                        var o = document.createElement("script");
                        o.type = "text/javascript";
                        while (t.startsWith("eval")) {
                            t = eval(t.match(/eval([^)].*)/)[1]);
                        }
                        t = "//@ sourceURL=" + location.href + r + "\n" + t;
                        o.text = t;
                        document.head.appendChild(o).parentNode.removeChild(o);
                        n();
                    },
                    e,
                    "text"
                );
            });
        };
    },
};
