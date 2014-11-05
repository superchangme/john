/**
 * Created by tom.chang on 2014/11/3.
 */


;(function($){

    var Eraser=function(element,options){
        for(var i in options){
            this[i] = options[i];
        }
        this.element = element;
        if(this.customCanvas){
            this.canvas = $(element).find("canvas.eraser")[0];
        }
    }
    Eraser._zIndex = 8888;
    Eraser.DEFAULTS = {
        container:document.body,
        customCanvas:false,
        bgImage:null,  //dom: image
        interval:100,
        radius:30,     //draw point
        density:30,    //check  gap
        percent:0.5,/*0-1*/
        success:function(){console.log("请添加回调函数")},
        clipMethod:"tapClip"//tapClip otherClip
    };

    Eraser.prototype.init=function(){
          if(this.canvas==undefined){
              this.canvas = document.createElement("canvas");
              this.container.appendChild(this.canvas);
              this.canvas.style.zIndex = Eraser._zIndex++;
              this.canvas.style.position = "absolute";
              this.canvas.style.top = "0";
              this.canvas.style.left = "0";
              this.canvas.className = "eraser";
          }

          this.canvas.width = this.container.clientWidth;
          this.canvas.height = this.container.clientHeight;
          if(this.canvas.tagName!="CANVAS"|| !typeof  this.canvas.getContext=="function"){
              console.log("浏览器不支持canvas或者传入了错误的canvas对象");
              return;
          }

          this.ctx=this.canvas.getContext("2d");
          var ratio= 1,start=0;
          if(this.bgImage.width/this.bgImage.height>this.canvas.width/this.canvas.height){
              ratio=this.bgImage.height/this.canvas.height;
              start=Math.abs((this.bgImage.width-this.canvas.width*ratio)/2);
              this.ctx.drawImage(this.bgImage,start,
                  0,this.bgImage.width-2*start,this.bgImage.height,0,0,this.canvas.width,this.canvas.height);
          }else if(this.bgImage.width/this.bgImage.height<this.canvas.width/this.canvas.height){
              ratio=this.bgImage.width/this.canvas.width;
              start=Math.abs((this.bgImage.height-this.canvas.height*ratio)/2);
              this.ctx.drawImage(this.bgImage,
                  0,start,this.bgImage.width,this.bgImage.height-2*start,0,0,this.canvas.width,this.canvas.height);
          }else{
              this.ctx.drawImage(this.bgImage,0,0,this.canvas.width,this.canvas.height);
          }





        //detach events
          $(this.canvas).off();
        
          this[this["clipMethod"]]();
    }


//通过修改globalCompositeOperation来达到擦除的效果
    Eraser.prototype.tapClip=function(){
        var hastouch = "ontouchstart" in window?true:false,
            tapstart = hastouch?"touchstart":"mousedown",
            tapmove = hastouch?"touchmove":"mousemove",
            tapend = hastouch?"touchend":"mouseup",
            _eraser = this,x1,y1,timeout,
            canvas=_eraser.canvas,
            ctx=_eraser.ctx,beginDraw=false;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = _eraser.radius*2;
        ctx.globalCompositeOperation = "destination-out";

        $(canvas).on(tapstart , function(e){
            clearTimeout(timeout)
            e.preventDefault();
            beginDraw=true;
            x1 = hastouch?e.targetTouches[0].pageX:e.clientX-canvas.offsetLeft;
            y1 = hastouch?e.targetTouches[0].pageY:e.clientY-canvas.offsetTop;

            ctx.beginPath()
            ctx.arc(x1,y1,_eraser.radius,0,2*Math.PI);
            ctx.fill();
        })
        $(canvas).on(tapmove , tapmoveHandler);
        $(canvas).on(tapend , function(){
            beginDraw =false;
            timeout = setTimeout(function(){
                var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
                var dd = 0;
                for(var x=0;x<imgData.width;x+=_eraser.density){
                    for(var y=0;y<imgData.height;y+=_eraser.density){
                        var i = (y*imgData.width + x)*4;
                        if(imgData.data[i+3] >0){
                            dd++
                        }
                    }
                }

                if(dd/(imgData.width*imgData.height/(_eraser.density*_eraser.density))<0.4){
                    /*  canvas.className = "noOp";*/
                    _eraser.success.call(_eraser,canvas);
                }
            },_eraser.interval)
        });
        function tapmoveHandler(e){
            if(!beginDraw){
                return;
            }
            clearTimeout(timeout)
            e.preventDefault()
            var x2 = hastouch?e.targetTouches[0].pageX:e.clientX-canvas.offsetLeft;
            var y2 = hastouch?e.targetTouches[0].pageY:e.clientY-canvas.offsetTop;

            ctx.beginPath();
            ctx.moveTo(x1,y1);
            ctx.lineTo(x2,y2);
            ctx.stroke();

            x1 = x2;
            y1 = y2;
        }
    }

//使用clip来达到擦除效果
    Eraser.prototype.otherClip=function(){
        var hastouch = "ontouchstart" in window?true:false,
            tapstart = hastouch?"touchstart":"mousedown",
            tapmove = hastouch?"touchmove":"mousemove",
            tapend = hastouch?"touchend":"mouseup",
            _eraser = this,x1,y1,timeout,
            canvas=_eraser.canvas,
            ctx=_eraser.ctx;;

        $(canvas).on(tapstart , function(e){
            clearTimeout(timeout)
            e.preventDefault();

            x1 = hastouch?e.targetTouches[0].pageX:e.clientX-canvas.offsetLeft;
            y1 = hastouch?e.targetTouches[0].pageY:e.clientY-canvas.offsetTop;

            ctx.save()
            ctx.beginPath()
            ctx.arc(x1,y1,_eraser.radius,0,2*Math.PI);
            ctx.clip()
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.restore();

            $(canvas).on(tapmove , tapmoveHandler);
            $(canvas).on(tapend , function(){
               // canvas.removeEventListener(tapmove , tapmoveHandler);

                setTimeout(function(){
                    var imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
                    var dd = 0;
                    for(var x=0;x<imgData.width;x+=_eraser.density){
                        for(var y=0;y<imgData.height;y+=_eraser.density){
                            var i = (y*imgData.width + x)*4;
                            if(imgData.data[i+3] >0){
                                dd++
                            }
                        }
                    }
                    if(dd/(imgData.width*imgData.height/(_eraser.density*_eraser.density))<_eraser.percent){
                        _eraser.success.call(_eraser,canvas);
                    }
                },_eraser.interval)

            });

            function tapmoveHandler(e){
                e.preventDefault()
                x2 = hastouch?e.targetTouches[0].pageX:e.clientX-canvas.offsetLeft;
                y2 = hastouch?e.targetTouches[0].pageY:e.clientY-canvas.offsetTop;

                var asin = a*Math.sin(Math.atan((y2-y1)/(x2-x1)));
                var acos = a*Math.cos(Math.atan((y2-y1)/(x2-x1)));
                var x3 = x1+asin;
                var y3 = y1-acos;
                var x4 = x1-asin;
                var y4 = y1+acos;
                var x5 = x2+asin;
                var y5 = y2-acos;
                var x6 = x2-asin;
                var y6 = y2+acos;

                ctx.save()
                ctx.beginPath()
                ctx.arc(x2,y2,_eraser.radius,0,2*Math.PI);
                ctx.clip()
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.restore();

                ctx.save()
                ctx.beginPath()
                ctx.moveTo(x3,y3);
                ctx.lineTo(x5,y5);
                ctx.lineTo(x6,y6);
                ctx.lineTo(x4,y4);
                ctx.closePath();
                ctx.clip()
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.restore();

                x1 = x2;
                y1 = y2;
            }
        })
    }


    var old = $.fn.eraser;
    $.fn.eraser = function (option, _relatedTarget) {
        return this.each(function () {
            var  options = $.extend({}, Eraser.DEFAULTS,typeof option == 'object' && option);

            return new Eraser(this,options).init();
        })
    }
    $.fn.eraser.Constructor = Eraser


    // MODAL NO CONFLICT
    // =================

    $.fn.eraser.noConflict = function () {
        $.fn.modal = old
        return this
    }

})(Zepto);
