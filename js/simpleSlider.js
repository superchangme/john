/**
 * Created by johnyzhong on 14-10-30.
 */
//外容器整体滑动
;(function($){

    //干掉页面bounce效果
    $(document).on('touchmove',function(e){
        e.preventDefault();
    });
    var animPrefix=""||(function(){
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



    //directionLock 为了禁止未释放时反向滑和同时加载了横滑和竖滑的页面同时滑
    $.fn.simpleSlider = function(option){
        if(typeof option ==="string"){
            var opts = $.extend({}, $.fn.simpleSlider.defaults, option),
                $slider = this,
                $items = $slider.children($slider.data("itemSelector")),
                isDirectionV = $slider.data("isDirectionV"),
                distance = $slider.data("distance");
            return init();
        }
        var opts = $.extend({}, $.fn.simpleSlider.defaults, option), //配置选项
            $slider = this,
            router =$slider.data("router"),
            $items = $slider.children(opts.itemSelector).css("position","absolute"),    //获取子元素数组
            step = 0,
            offset= 0,
            offsetPer=100/*/$items.length*/,
            currentOffset= 0,
            effect =app.cubicBezier||"ease",
            isCircle=opts.isCircle,
            stopPropagation =opts.stopPropagation,
            slideDuration=250,
            curItemIndex = opts.startIndex,
            oldPosition = 0,
            throttleMove = throttleMovHandler,
            backMove = false,
            forwardMove = false,
            backFirst = false,
            itemLen=$items.length,
            currentItem= $items.eq(opts.startIndex),
            moveItemEl,
            currentDir = undefined,
            forwardLast = false,
            isAnimate = false,
            moveIndex=9999,
            homeLock =false,
            isFridge = $slider.hasClass("fridge-page"),
            isCabinet = $slider.hasClass("cabinet-page"),
            isDirectionV = (opts.direction == 'v'),
            distance = isDirectionV ? app.container.height() : app.container.width();
        $slider.data("itemSelector",opts.itemSelector);
        $slider.data("isDirectionV",isDirectionV)

        function init(){
            curItemIndex = opts.startIndex;
            var cssProp=isDirectionV?"height":"width";
            $items.each(function(i,o){
                $items.eq(i).css(cssProp,offsetPer+'%');
                if(i!=curItemIndex){
                }else{
                    $items.eq(i).addClass("current");
                }
            }); //遍历子元素设置样式
            opts.onMoveEnd(0);
            //设置container高度或宽度
        }//暴露出去以便初始化再调用
        init();

        //事件注册
        $slider.on('touchstart',function(e){
            if(stopPropagation==true){
                e.stopPropagation();
            }
            var touch = e.touches[0];
            oldPosition = isDirectionV ? touch.clientY : touch.clientX;
            step = 0;
            backMove = false;
            forwardMove = false;
            backFirst = false;
            forwardLast = false;
        }).on("touchmove",throttleMove).
            on('touchmove',function(e){
                var touch = e.touches[0];
                //更新坐标
                oldPosition = touch.clientY;
            }).on('touchend',function(e){
                if(!isAnimate){
                    if(forwardMove){
                        animateItem(-1);
                    }
                    if(backMove){
                        animateItem(1);
                    }
                }
            });

        function throttleMovHandler(e){
            if(isAnimate)
                return;
            var touch = e.touches[0],
                curPosition = isDirectionV ? touch.clientY : touch.clientX,
                gap = curPosition - oldPosition,
                moveItemIndex=0,
                newPosition = 0;
            step += gap;

            newPosition = 100*step/(distance/**$items.length*/);

            if(gap<0 ){
                forwardLast = !!(curItemIndex == itemLen-1 && !backMove);
                if(backMove){//先向下/右逆向滑，过程中不放手再向上/左正向滑
                    moveItemIndex = curItemIndex==0 ? curItemIndex : curItemIndex-1;
                    moveItem(moveItemIndex, newPosition);
                }else if((curItemIndex!==itemLen-1||isCircle) && !backFirst){
                    moveItemIndex = curItemIndex+1;
                    moveItem(moveItemIndex, newPosition);
                    forwardMove = true;
                }
            }
            //向下/右逆向滑
            if(gap>0 ){
                //go to home page
                backFirst = !!(curItemIndex == 0 && !forwardMove);
                if(forwardMove){//先向上/左正向滑，过程中不放手再向下/右逆向滑
                    moveItemIndex = curItemIndex==itemLen-1 ? curItemIndex : curItemIndex+1;
                    moveItem(moveItemIndex, newPosition);
                }else  if(curItemIndex!==0 && !forwardLast){
                    moveItemIndex = curItemIndex-1;
                    backMove = true;
                    moveItem(moveItemIndex, newPosition);
                }
            }
        }

        //history back
        if(router){
            window.addEventListener("popstate",function(e){
                if(app.changeHash==false){
                    if(curItemIndex>0){
                        animateItem(-1,true);
                    }
                }
            });
        }

        //放手后自动滑向目标位置， flag控制滑动方向
        function animateItem(flag,isClick){
            isAnimate = true;
            var percent = Math.abs(step)/distance,
                isEnd=curItemIndex==itemLen-1,
                canMove=percent>opts.slidePercent||isClick,
                animProperty,
                nextIndex =  isEnd&&isCircle&&flag==-1 ? 0 : curItemIndex- flag,
                duration=slideDuration;
            if(!isCircle&&isEnd&&flag==-1){
                return ;
            }

            if(canMove) {
                if(isEnd&&flag==-1){
                    offset=0;
                    duration*=$items.length*0.618;
                }else{
                    offset+=offsetPer*flag;
                }
            }
            moveItemEl.animate( {'translate3d': '0,0,0'},duration,effect,function(){
                isAnimate=false;
                currentOffset=offset;
                if(canMove)
                {
                    $items.eq(curItemIndex).removeClass("current");

                    curItemIndex = nextIndex;
                    currentItem = $items.eq(curItemIndex);
                    currentItem.addClass("current");
                    opts.onMoveEnd(curItemIndex);
                }
                if(router){
                    var hash=curItemIndex==0? "": curItemIndex;
                    app.recordState(router+hash);
                }
                moveItemEl=null;
            })

        }

        //设置随手被拖动的坐标
        function moveItem(moveItemIndex, newPosition){
            if(isAnimate){return}
            var isEnd=curItemIndex==itemLen-1&&isCircle&&newPosition< 0,moveOffset;
            var nextPosition=curItemIndex<moveItemIndex ? distance+newPosition:isEnd?newPosition+distance:newPosition-distance;
            if(!moveItemEl){
                var initPer=curItemIndex<moveItemIndex ? 100:isEnd?100:-100;
                var initTrans=isDirectionV?"translate3d("+'0,'+initPer+'%,0)':"translate3d("+initPer+'%,0,0)';
                currentOffset=initPer;
                moveItemEl=$items.eq(moveItemIndex).css(app.animPrefix+'transform',initTrans).css("z-index",moveIndex);
            }
            if(!isEnd){
                moveOffset=currentOffset+parseFloat(newPosition.toFixed(5));
                var trans=isDirectionV?"translate3d("+'0,'+moveOffset+'%,0)':"translate3d("+moveOffset+'%,0,0)';
                moveItemEl.css(app.animPrefix+'transform',trans);
            }
        }
        //链式返回
        return this;
    };
    $.fn.simpleSlider.defaults = {
        tapControls:{
            left:".left-control",
            right:".right-control"
        },
        filterChild:null,
        stopPropagation:false,
        direction: 'h', //'h' 纵向,'v' 横向
        slidePercent: app.slidePercent,  //拖动超过多少比例后才翻页
        itemSelector: 'div', //子元素选择器
        startIndex:0,//开始的页码
        isCircle:false,
        onMoveEnd: function(index){ //滑动结束后事件
            //console.log(index);
        }
    };
})(Zepto);