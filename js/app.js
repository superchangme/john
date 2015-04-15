/**
 * Created by johnyzhong on 14-10-30.
 */
/**
 * Created by tom.chang on 2014/10/30.
 */
window._app = function (el) {
    this.container = $("body");
    this.changeHash = false;
    this.slidePercent = 0.18;
    this.cubicBezier = "cubic-bezier(0.42,0,0.58,1)";
    this.recordState = function () {
        this.changeHash = true;
        setTimeout.call(this, function () {
            this.changeHash = false;
        }, 100);
    }
    this.animPrefix = "" || (function () {
        var prefix = '',
            vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
            document = window.document, testEl = document.createElement('div');
        $.each(vendors, function (vendor, event) {
            if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
                prefix = '-' + vendor.toLowerCase() + '-'
                return false
            }
        });
        return prefix;
    })();
};

////////////////////////////////////////////////////////////////////////////////////////分享
window.app = new _app($("#app"));
function changeShareUrl(shareUrl) {
    WeixinApi.ready(function (api) {
        var info = new WeixinShareInfo();
        info.title = "情有独“John”";
        info.desc = "他怀揣着梦想与热情，他憧憬着希望和未来，他是John！欢迎大家来到我的主页。";
        info.link = shareUrl; // info.imgUrl = "一张24*24图片";
        info.imgUrl = _web_site+"/img/wechat_icon.jpg";
        api.shareToFriend(info);
        api.shareToTimeline(info); } );
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();