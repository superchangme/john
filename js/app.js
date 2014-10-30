/**
 * Created by tom.chang on 2014/10/30.
 */
    window._app=function(el){
        this.container=el;
        this.changeHash=false;
        this.slidePercent=0.3;
        this.cubicBezier="cubic-bezier(0.42,0,0.58,1)";
        this.recordState=function(){
            this.changeHash=true;
            setTimeout.call(this,function(){
                this.changeHash=false;
            },100);
        }
        this.animPrefix=""||(function(){
            var prefix = '',
                vendors = { Webkit: 'webkit', Moz: '', O: 'o' },
                document = window.document, testEl = document.createElement('div');
            $.each(vendors, function(vendor, event){
                if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
                    prefix = '-' + vendor.toLowerCase() + '-'
                    return false
                }
            });
            return prefix;
        })();
    };

    window.app=new _app($("#app"));

