(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){"use strict";var Stringify=require("./stringify");var Parse=require("./parse");module.exports={stringify:Stringify,parse:Parse}},{"./parse":2,"./stringify":3}],2:[function(require,module,exports){"use strict";var Utils=require("./utils");var internals={delimiter:"&",depth:5,arrayLimit:20,parameterLimit:1e3,strictNullHandling:false,plainObjects:false,allowPrototypes:false,allowDots:false};internals.parseValues=function(str,options){var obj={};var parts=str.split(options.delimiter,options.parameterLimit===Infinity?undefined:options.parameterLimit);for(var i=0;i<parts.length;++i){var part=parts[i];var pos=part.indexOf("]=")===-1?part.indexOf("="):part.indexOf("]=")+1;if(pos===-1){obj[Utils.decode(part)]="";if(options.strictNullHandling){obj[Utils.decode(part)]=null}}else{var key=Utils.decode(part.slice(0,pos));var val=Utils.decode(part.slice(pos+1));if(Object.prototype.hasOwnProperty.call(obj,key)){obj[key]=[].concat(obj[key]).concat(val)}else{obj[key]=val}}}return obj};internals.parseObject=function(chain,val,options){if(!chain.length){return val}var root=chain.shift();var obj;if(root==="[]"){obj=[];obj=obj.concat(internals.parseObject(chain,val,options))}else{obj=options.plainObjects?Object.create(null):{};var cleanRoot=root[0]==="["&&root[root.length-1]==="]"?root.slice(1,root.length-1):root;var index=parseInt(cleanRoot,10);if(!isNaN(index)&&root!==cleanRoot&&String(index)===cleanRoot&&index>=0&&(options.parseArrays&&index<=options.arrayLimit)){obj=[];obj[index]=internals.parseObject(chain,val,options)}else{obj[cleanRoot]=internals.parseObject(chain,val,options)}}return obj};internals.parseKeys=function(givenKey,val,options){if(!givenKey){return}var key=options.allowDots?givenKey.replace(/\.([^\.\[]+)/g,"[$1]"):givenKey;var parent=/^([^\[\]]*)/;var child=/(\[[^\[\]]*\])/g;var segment=parent.exec(key);var keys=[];if(segment[1]){if(!options.plainObjects&&Object.prototype.hasOwnProperty(segment[1])){if(!options.allowPrototypes){return}}keys.push(segment[1])}var i=0;while((segment=child.exec(key))!==null&&i<options.depth){i+=1;if(!options.plainObjects&&Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g,""))){if(!options.allowPrototypes){continue}}keys.push(segment[1])}if(segment){keys.push("["+key.slice(segment.index)+"]")}return internals.parseObject(keys,val,options)};module.exports=function(str,opts){var options=opts||{};options.delimiter=typeof options.delimiter==="string"||Utils.isRegExp(options.delimiter)?options.delimiter:internals.delimiter;options.depth=typeof options.depth==="number"?options.depth:internals.depth;options.arrayLimit=typeof options.arrayLimit==="number"?options.arrayLimit:internals.arrayLimit;options.parseArrays=options.parseArrays!==false;options.allowDots=typeof options.allowDots==="boolean"?options.allowDots:internals.allowDots;options.plainObjects=typeof options.plainObjects==="boolean"?options.plainObjects:internals.plainObjects;options.allowPrototypes=typeof options.allowPrototypes==="boolean"?options.allowPrototypes:internals.allowPrototypes;options.parameterLimit=typeof options.parameterLimit==="number"?options.parameterLimit:internals.parameterLimit;options.strictNullHandling=typeof options.strictNullHandling==="boolean"?options.strictNullHandling:internals.strictNullHandling;if(str===""||str===null||typeof str==="undefined"){return options.plainObjects?Object.create(null):{}}var tempObj=typeof str==="string"?internals.parseValues(str,options):str;var obj=options.plainObjects?Object.create(null):{};var keys=Object.keys(tempObj);for(var i=0;i<keys.length;++i){var key=keys[i];var newObj=internals.parseKeys(key,tempObj[key],options);obj=Utils.merge(obj,newObj,options)}return Utils.compact(obj)}},{"./utils":4}],3:[function(require,module,exports){"use strict";var Utils=require("./utils");var internals={delimiter:"&",arrayPrefixGenerators:{brackets:function(prefix){return prefix+"[]"},indices:function(prefix,key){return prefix+"["+key+"]"},repeat:function(prefix){return prefix}},strictNullHandling:false,skipNulls:false,encode:true};internals.stringify=function(object,prefix,generateArrayPrefix,strictNullHandling,skipNulls,encode,filter,sort,allowDots){var obj=object;if(typeof filter==="function"){obj=filter(prefix,obj)}else if(Utils.isBuffer(obj)){obj=String(obj)}else if(obj instanceof Date){obj=obj.toISOString()}else if(obj===null){if(strictNullHandling){return encode?Utils.encode(prefix):prefix}obj=""}if(typeof obj==="string"||typeof obj==="number"||typeof obj==="boolean"){if(encode){return[Utils.encode(prefix)+"="+Utils.encode(obj)]}return[prefix+"="+obj]}var values=[];if(typeof obj==="undefined"){return values}var objKeys;if(Array.isArray(filter)){objKeys=filter}else{var keys=Object.keys(obj);objKeys=sort?keys.sort(sort):keys}for(var i=0;i<objKeys.length;++i){var key=objKeys[i];if(skipNulls&&obj[key]===null){continue}if(Array.isArray(obj)){values=values.concat(internals.stringify(obj[key],generateArrayPrefix(prefix,key),generateArrayPrefix,strictNullHandling,skipNulls,encode,filter,sort,allowDots))}else{values=values.concat(internals.stringify(obj[key],prefix+(allowDots?"."+key:"["+key+"]"),generateArrayPrefix,strictNullHandling,skipNulls,encode,filter,sort,allowDots))}}return values};module.exports=function(object,opts){var obj=object;var options=opts||{};var delimiter=typeof options.delimiter==="undefined"?internals.delimiter:options.delimiter;var strictNullHandling=typeof options.strictNullHandling==="boolean"?options.strictNullHandling:internals.strictNullHandling;var skipNulls=typeof options.skipNulls==="boolean"?options.skipNulls:internals.skipNulls;var encode=typeof options.encode==="boolean"?options.encode:internals.encode;var sort=typeof options.sort==="function"?options.sort:null;var allowDots=typeof options.allowDots==="undefined"?false:options.allowDots;var objKeys;var filter;if(typeof options.filter==="function"){filter=options.filter;obj=filter("",obj)}else if(Array.isArray(options.filter)){objKeys=filter=options.filter}var keys=[];if(typeof obj!=="object"||obj===null){return""}var arrayFormat;if(options.arrayFormat in internals.arrayPrefixGenerators){arrayFormat=options.arrayFormat}else if("indices"in options){arrayFormat=options.indices?"indices":"repeat"}else{arrayFormat="indices"}var generateArrayPrefix=internals.arrayPrefixGenerators[arrayFormat];if(!objKeys){objKeys=Object.keys(obj)}if(sort){objKeys.sort(sort)}for(var i=0;i<objKeys.length;++i){var key=objKeys[i];if(skipNulls&&obj[key]===null){continue}keys=keys.concat(internals.stringify(obj[key],key,generateArrayPrefix,strictNullHandling,skipNulls,encode,filter,sort,allowDots))}return keys.join(delimiter)}},{"./utils":4}],4:[function(require,module,exports){"use strict";var hexTable=function(){var array=new Array(256);for(var i=0;i<256;++i){array[i]="%"+((i<16?"0":"")+i.toString(16)).toUpperCase()}return array}();exports.arrayToObject=function(source,options){var obj=options.plainObjects?Object.create(null):{};for(var i=0;i<source.length;++i){if(typeof source[i]!=="undefined"){obj[i]=source[i]}}return obj};exports.merge=function(target,source,options){if(!source){return target}if(typeof source!=="object"){if(Array.isArray(target)){target.push(source)}else if(typeof target==="object"){target[source]=true}else{return[target,source]}return target}if(typeof target!=="object"){return[target].concat(source)}var mergeTarget=target;if(Array.isArray(target)&&!Array.isArray(source)){mergeTarget=exports.arrayToObject(target,options)}return Object.keys(source).reduce(function(acc,key){var value=source[key];if(Object.prototype.hasOwnProperty.call(acc,key)){acc[key]=exports.merge(acc[key],value,options)}else{acc[key]=value}return acc},mergeTarget)};exports.decode=function(str){try{return decodeURIComponent(str.replace(/\+/g," "))}catch(e){return str}};exports.encode=function(str){if(str.length===0){return str}var string=typeof str==="string"?str:String(str);var out="";for(var i=0;i<string.length;++i){var c=string.charCodeAt(i);if(c===45||c===46||c===95||c===126||c>=48&&c<=57||c>=65&&c<=90||c>=97&&c<=122){out+=string.charAt(i);continue}if(c<128){out=out+hexTable[c];continue}if(c<2048){out=out+(hexTable[192|c>>6]+hexTable[128|c&63]);continue}if(c<55296||c>=57344){out=out+(hexTable[224|c>>12]+hexTable[128|c>>6&63]+hexTable[128|c&63]);continue}i+=1;c=65536+((c&1023)<<10|string.charCodeAt(i)&1023);out+=hexTable[240|c>>18]+hexTable[128|c>>12&63]+hexTable[128|c>>6&63]+hexTable[128|c&63]}return out};exports.compact=function(obj,references){if(typeof obj!=="object"||obj===null){return obj}var refs=references||[];var lookup=refs.indexOf(obj);if(lookup!==-1){return refs[lookup]}refs.push(obj);if(Array.isArray(obj)){var compacted=[];for(var i=0;i<obj.length;++i){if(typeof obj[i]!=="undefined"){compacted.push(obj[i])}}return compacted}var keys=Object.keys(obj);for(var j=0;j<keys.length;++j){var key=keys[j];obj[key]=exports.compact(obj[key],refs)}return obj};exports.isRegExp=function(obj){return Object.prototype.toString.call(obj)==="[object RegExp]"};exports.isBuffer=function(obj){if(obj===null||typeof obj==="undefined"){return false}return!!(obj.constructor&&obj.constructor.isBuffer&&obj.constructor.isBuffer(obj))}},{}],5:[function(require,module,exports){var AnimatedSprite,arrayRemove,makeFrames;makeFrames=require("../helper/make-frames");arrayRemove=require("../helper/array/remove");module.exports=AnimatedSprite=function(){function AnimatedSprite(path,group){var animation,name,ref;this.path=path;this.sprite=group.create(0,0,"sprites");this.sprite.obj=this;this.animations=this.sprite.animations;this.scale=this.sprite.scale;this.sprite.anchor.setTo(.5,1);ref=makeFrames("actor",this.path);for(name in ref){animation=ref[name];this.animations.add(name,animation,8,true)}this.pos=this.sprite.position;this.animations.play("walk/s")}AnimatedSprite.prototype.destroy=function(){arrayRemove(globals.sprites,this);return this.sprite.destroy()};AnimatedSprite.prototype.replaceWith=function(other){this.destroy();other.pos.copyFrom(this.pos);other.scale.copyFrom(this.scale);room.sortEntities();return other};return AnimatedSprite}()},{"../helper/array/remove":13,"../helper/make-frames":17}],6:[function(require,module,exports){var LocalController,RemoteController,extend=function(child,parent){for(var key in parent){if(hasProp.call(parent,key))child[key]=parent[key]}function ctor(){this.constructor=child}ctor.prototype=parent.prototype;child.prototype=new ctor;child.__super__=parent.prototype;return child},hasProp={}.hasOwnProperty;RemoteController=require("./remote-controller");module.exports=LocalController=function(superClass){extend(LocalController,superClass);function LocalController(){LocalController.__super__.constructor.apply(this,arguments);this.send("player joined")}LocalController.prototype.send=function(type,data){return this.outbound.push(this.createMessage(type,data))};LocalController.prototype.update=function(){var dir;dir="";if(game.input.keyboard.isDown(Phaser.Keyboard.UP)){dir+="n"}if(game.input.keyboard.isDown(Phaser.Keyboard.DOWN)){dir+="s"}if(game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){dir+="w"}if(game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){dir+="e"}if(dir){return this.walk(dir)}else{return this.stop()}};LocalController.prototype.walk=function(dir){if(dir===this.obj.moveDir){return}this.send("walk",{dir:dir});return this.obj.walk(dir)};LocalController.prototype.stop=function(){if(!this.obj.moveDir){return}this.send("stop");this.prevDir=null;return this.obj.stop()};return LocalController}(RemoteController)},{"./remote-controller":7}],7:[function(require,module,exports){var RemoteController,arrayRemove;arrayRemove=require("../../helper/array/remove");module.exports=RemoteController=function(){function RemoteController(uid,obj,connectionId){this.uid=uid;this.obj=obj;this.connectionId=connectionId;this.inbound=[];this.outbound=[]}RemoteController.prototype.createMessage=function(type,data){return Object.assign({_type_:type,uid:this.uid},data,{x:this.obj.pos.x,y:this.obj.pos.y})};RemoteController.prototype.update=function(){var cmd,name,results;results=[];while(cmd=this.inbound.pop()){if(typeof this[name="exec_"+cmd._type_]==="function"){this[name](cmd)}results.push(this.obj.pos.setTo(cmd.x,cmd.y))}return results};RemoteController.prototype.destroy=function(){arrayRemove(globals.controllers,this);return this.obj.destroy()};RemoteController.prototype.exec_walk=function(cmd){return this.obj.walk(cmd.dir)};RemoteController.prototype.exec_stop=function(){return this.obj.stop()};return RemoteController}()},{"../../helper/array/remove":13}],8:[function(require,module,exports){var CatBurglar,Player,extend=function(child,parent){for(var key in parent){if(hasProp.call(parent,key))child[key]=parent[key]}function ctor(){this.constructor=child}ctor.prototype=parent.prototype;child.prototype=new ctor;child.__super__=parent.prototype;return child},hasProp={}.hasOwnProperty;Player=require("./index");module.exports=CatBurglar=function(superClass){extend(CatBurglar,superClass);function CatBurglar(group){CatBurglar.__super__.constructor.call(this,"cat",group);this.colorFilter.uniforms.colors.value=[1/2,1/4,1/8,0/1,1/1,0/1,1/8,1/6,1/3]}return CatBurglar}(Player)},{"./index":9}],9:[function(require,module,exports){var AnimatedSprite,ColorChange,Player,clamp,extend=function(child,parent){for(var key in parent){if(hasProp.call(parent,key))child[key]=parent[key]}function ctor(){this.constructor=child}ctor.prototype=parent.prototype;child.prototype=new ctor;child.__super__=parent.prototype;return child},hasProp={}.hasOwnProperty;AnimatedSprite=require("../animated-sprite");ColorChange=require("../../filters/color-change");clamp=require("../../helper/clamp");module.exports=Player=function(superClass){extend(Player,superClass);function Player(){Player.__super__.constructor.apply(this,arguments);this.colorFilter=new ColorChange;this.sprite.filters=[this.colorFilter];this.sprite.animations.play("walk/se");this.speed=1;this.moveDir=null}Player.prototype.update=function(){var x,y;if(this.moveDir){x=!!~this.moveDir.indexOf("e")-!!~this.moveDir.indexOf("w");y=!!~this.moveDir.indexOf("s")-!!~this.moveDir.indexOf("n");this.pos.add(x*this.speed,y*this.speed);this.pos.x=clamp(this.pos.x,32,WIDTH-32);return this.pos.y=clamp(this.pos.y,32,HEIGHT-32)}};Player.prototype.walk=function(dir){this.moveDir=dir;if(~dir.indexOf("e")){this.scale.x=1}if(~dir.indexOf("w")){this.scale.x=-1}return this.animations.play("walk/"+dir.replace("w","e"))};Player.prototype.stop=function(){return this.moveDir=null};return Player}(AnimatedSprite)},{"../../filters/color-change":11,"../../helper/clamp":14,"../animated-sprite":5}],10:[function(require,module,exports){var ScaleManager,resize,transformPosition;resize=require("./helper/resize");transformPosition=require("./helper/transform-position");ScaleManager=Phaser.ScaleManager;module.exports=function(){var stopper;globals.world=game.add.group();stopper=game.add.image();stopper.position.y=140;globals.world.add(stopper);globals.sprites=[];globals.controllers=[];globals.connections=[];globals.events=[];game.scale.fullScreenScaleMode=ScaleManager.SHOW_ALL;resize.call(this);window.addEventListener("resize",resize.bind(this));return this.stage.disableVisibilityChange=true}},{"./helper/resize":18,"./helper/transform-position":19}],11:[function(require,module,exports){var ColorChange,glsl,extend=function(child,parent){for(var key in parent){if(hasProp.call(parent,key))child[key]=parent[key]}function ctor(){this.constructor=child}ctor.prototype=parent.prototype;child.prototype=new ctor;child.__super__=parent.prototype;return child},hasProp={}.hasOwnProperty;glsl=require("./glsl/color-change");module.exports=ColorChange=function(superClass){extend(ColorChange,superClass);function ColorChange(){ColorChange.__super__.constructor.apply(this,arguments);this.uniforms.colors={type:"mat3",value:[1/2,1/4,1/8,0,1,0,1/8,1/6,1/3]};this.fragmentSrc=[glsl]}return ColorChange}(Phaser.Filter)},{"./glsl/color-change":12}],12:[function(require,module,exports){module.exports="precision mediump float;\r\nvarying vec2 vTextureCoord;\r\nuniform mat3 colors;\r\nuniform sampler2D uSampler;\r\n\r\nvoid main(void){\r\n  vec4 color = texture2D(uSampler, vTextureCoord);\r\n  gl_FragColor = vec4(\r\n    colors[0] * color.r +\r\n    colors[1] * color.g +\r\n    colors[2] * color.b,\r\n    color.a\r\n  );\r\n}\r\n\r\n"},{}],13:[function(require,module,exports){module.exports=function(arr,item){var index;index=arr.indexOf(item);if(index<0){return arr}arr[index]=arr[arr.length-1];arr.pop();return arr}},{}],14:[function(require,module,exports){module.exports=function(val,min,max){return Math.max(0,Math.min(val,max))}},{}],15:[function(require,module,exports){module.exports=function(){var hScale,vScale;hScale=window.innerWidth/WIDTH;vScale=window.innerHeight/HEIGHT;return window.SCALE=Math.max(1,Math.floor(Math.min(hScale,vScale)))}},{}],16:[function(require,module,exports){module.exports=function(arr,funcName){var a,i,len,ref;ref=arr.slice();for(i=0,len=ref.length;i<len;i++){a=ref[i];if(typeof a[funcName]==="function"){a[funcName]()}}return arr}},{}],17:[function(require,module,exports){module.exports=function(namespace,path){var components,i,key,len,name,names,ret,start;ret={};names=Object.keys(game.cache._cache.image.sprites.frameData._frameNames);start=namespace==="actor"?4:5;for(i=0,len=names.length;i<len;i++){name=names[i];components=name.split("/");if(!(namespace===components[2]&&path===components[3])){continue}key=components.slice(start,-1).join("/");key||(key=components[start]);if(!key){continue}(ret[key]||(ret[key]=[])).push(name)}return ret}},{}],18:[function(require,module,exports){var getScale;getScale=require("./get-scale");module.exports=function(scale){var height,width;window.SCALE=getScale();width=WIDTH*SCALE;height=HEIGHT*SCALE;this.world.scale.setTo(SCALE,SCALE);game.width=width;game.height=height;game.stage.width=width;game.stage.height=height;if(game.renderType===Phaser.WEBGL){return game.renderer.resize(width,height)}}},{"./get-scale":15}],19:[function(require,module,exports){module.exports=function(touch){touch.$transformed=true;return touch.position.setTo(touch.position.x/SCALE,touch.position.y/SCALE)}},{}],20:[function(require,module,exports){var AUTO,Game,getScale,hostjoin;window.puts=console.log.bind(console);window.globals={};getScale=require("./helper/get-scale");require("./mixins");hostjoin=require("./tmp/hostjoin");window.WIDTH=200;window.HEIGHT=120;window.SCALE=getScale();Game=Phaser.Game,AUTO=Phaser.AUTO;window.onload=function(){window.game=new Game(WIDTH*SCALE,HEIGHT*SCALE,Phaser.AUTO,null,{preload:require("./preload"),create:require("./create"),update:require("./update")},false,false);return setTimeout(hostjoin,500)}},{"./create":10,"./helper/get-scale":15,"./mixins":21,"./preload":27,"./tmp/hostjoin":28,"./update":29}],21:[function(require,module,exports){var slice=[].slice;Math.sign||(Math.sign=function(v){if(v<0){return-1}else{return 1}});Object.assign||(Object.assign=function(){var i,j,key,len,len1,ref,source,sources,target;target=arguments[0],sources=2<=arguments.length?slice.call(arguments,1):[];for(i=0,len=sources.length;i<len;i++){source=sources[i];ref=Object.keys(source||{});for(j=0,len1=ref.length;j<len1;j++){key=ref[j];target[key]=source[key]}}return target})},{}],22:[function(require,module,exports){var PeerConnectionController,arrayRemove,spawnLocalPlayer,spawnRemotePlayer;spawnLocalPlayer=require("./spawn-local-player");spawnRemotePlayer=require("./spawn-remote-player");arrayRemove=require("../helper/array/remove");module.exports=PeerConnectionController=function(){PeerConnectionController.prototype.tickBurstLimit=8;PeerConnectionController.prototype.packageId=1;PeerConnectionController.prototype.ticksSinceBurst=0;PeerConnectionController.prototype.lastAcknowledge=0;PeerConnectionController.prototype.timeout=0;PeerConnectionController.prototype.timeoutLimit=3e3;function PeerConnectionController(connection){this.connection=connection;this.connection.on("data",this.handleMessages.bind(this));this.connection.on("error",function(_this){return function(err){console.error(err);return _this.destroy()}}(this));this.connection.on("close",function(_this){return function(){return _this.destroy()}}(this));this.handler=this.handleMessage.bind(this);this.q=[];this.messageCallbacks=[];globals.connections.push(this)}PeerConnectionController.prototype.update=function(){this.ticksSinceBurst++;if(this.ticksSinceBurst>=this.tickBurstLimit){this.burst()}this.timeout++;if(this.q.length&&this.timeout>this.timeoutLimit){return this.destroy()}};PeerConnectionController.prototype.onData=function(cb){return this.messageCallbacks.push(cb)};PeerConnectionController.prototype.handleMessages=function(data){var cb,j,k,len,len1,msg,packageId,ref;if(data._type_==="acknowledge"){this.timeout=0;return this.acknowledge(data.id)}packageId=data[data.length-1]._packageId_;this.connection.send({_type_:"acknowledge",id:packageId});for(j=0,len=data.length;j<len;j++){msg=data[j];if(this.lastAcknowledge>=msg._packageId_){continue}this.handleMessage(msg)}ref=this.messageCallbacks;for(k=0,len1=ref.length;k<len1;k++){cb=ref[k];cb(data)}return this.lastAcknowledge=packageId};PeerConnectionController.prototype.handleMessage=function(data){var controller;switch(data._type_){case"acknowledge":this.acknowledge(data.id);break;case"issued uid":spawnLocalPlayer(data.uid,data,this.connection.id);break;case"player joined":spawnRemotePlayer(data.uid,data,this.connection.peer);break;default:controller=globals.controllers.find(function(ctrl){return ctrl.uid===data.uid});if(controller!=null){controller.inbound.push(data)}}};PeerConnectionController.prototype.send=function(message){message._packageId_=this.packageId++;this.q.push(message);if(this.q.length===1){this.timeout=0}return this.burst()};PeerConnectionController.prototype.burst=function(message){this.ticksSinceBurst=0;if(this.q.length){return this.connection.send(this.q)}};PeerConnectionController.prototype.acknowledge=function(id){var i,index,j,len,pkg,ref;index=-1;ref=this.q;for(i=j=0,len=ref.length;j<len;i=++j){pkg=ref[i];if(pkg._packageId_===id){index=i;break}}return this.q=this.q.slice(index+1)};PeerConnectionController.prototype.destroy=function(){var ctrl,index,j,ref;puts("Connection closed with "+this.connection.peer);index=globals.connections.indexOf(this);arrayRemove(globals.connections,this);ref=globals.controllers;for(j=ref.length-1;j>=0;j+=-1){ctrl=ref[j];if(ctrl.connectionId===this.connection.peer){ctrl.destroy()}}return this.connection.close()};return PeerConnectionController}()},{"../helper/array/remove":13,"./spawn-local-player":25,"./spawn-remote-player":26}],23:[function(require,module,exports){var PeerConnectionController,establish,host,join,makePeer,uid;PeerConnectionController=require("./connection");uid=0;makePeer=function(){globals.peer=new Peer({key:"sb544jx9pnj3jtt9"});globals.peer.on("error",function(err){return console.error(err)});window.addEventListener("unload",function(){var conn,i,len,ref;ref=globals.connections;for(i=0,len=ref.length;i<len;i++){conn=ref[i];conn.destroy()}return globals.peer.destroy()});return globals.peer};host=function(onopen){var peer;peer=makePeer();peer.on("open",onopen);return peer.on("connection",function(connection){puts("Joined by "+connection.id);return connection.on("open",function(){var controller,ctrl,i,len,ref;puts("Connection open");controller=establish(connection);controller.send({_type_:"issued uid",uid:++uid});ref=globals.controllers;for(i=0,len=ref.length;i<len;i++){ctrl=ref[i];controller.send(ctrl.createMessage("player joined"))}return controller.onData(function(data){var conn,j,len1,ref1,results;ref1=globals.connections;results=[];for(j=0,len1=ref1.length;j<len1;j++){conn=ref1[j];if(conn.connection!==connection){results.push(conn.send(data))}else{results.push(void 0)}}return results})})})};join=function(id){var connection,peer;peer=makePeer();connection=peer.connect(id);return connection.on("open",function(){var controller;puts("Connected to "+connection.id);return controller=establish(connection)})};establish=function(connection){return new PeerConnectionController(connection)};module.exports={host:host,join:join,establish:establish}},{"./connection":22}],24:[function(require,module,exports){module.exports=function(){var cmd,conn,ctrl,i,len,ref,results;ref=globals.controllers;results=[];for(i=0,len=ref.length;i<len;i++){ctrl=ref[i];results.push(function(){var results1;results1=[];while(cmd=ctrl.outbound.pop()){results1.push(function(){var j,len1,ref1,results2;ref1=globals.connections;results2=[];for(j=0,len1=ref1.length;j<len1;j++){conn=ref1[j];results2.push(conn.send(cmd))}return results2}())}return results1}())}return results}},{}],25:[function(require,module,exports){var Cat,LocalController;Cat=require("../actor/player/cat");LocalController=require("../actor/controller/local-controller");module.exports=function(uid,data,connectionId){globals.player=new Cat(globals.world);globals.player.pos.setTo(100,60);window.player=globals.player;globals.controller=new LocalController(uid,player,connectionId);globals.sprites.push(globals.player);return globals.controllers.push(globals.controller)}},{"../actor/controller/local-controller":6,"../actor/player/cat":8}],26:[function(require,module,exports){var Cat,RemoteController;Cat=require("../actor/player/cat");RemoteController=require("../actor/controller/remote-controller");module.exports=function(uid,data,connectionId){globals.player=new Cat(globals.world);globals.player.pos.setTo(data.x,data.y);window.player=globals.player;globals.controller=new RemoteController(uid,player,connectionId);globals.sprites.push(globals.player);return globals.controllers.push(globals.controller)}},{"../actor/controller/remote-controller":7,"../actor/player/cat":8}],27:[function(require,module,exports){module.exports=function(){this.stage.disableVisbilityChange=true;return this.load.atlasJSONHash("sprites","./build/image/sprites.png","./build/image/sprites.json")}},{}],28:[function(require,module,exports){var host,hostButton,join,qs,ref,spawnLocalPlayer;qs=require("qs");ref=require("../net/init"),host=ref.host,join=ref.join;spawnLocalPlayer=require("../net/spawn-local-player");module.exports=function(){var params;params=qs.parse(location.href.split("?")[1]||"");if(params.peer){return join(params.peer)}else{return hostButton()}};hostButton=function(){var btn;btn=document.createElement("button");btn.textContent="Host";document.body.appendChild(btn);document.body.removeChild(btn);spawnLocalPlayer(0);return host(function(id){var input,url;url=location.href.split("?")[0]+("?peer="+id);console.log(url);input=document.createElement("input");input.setAttribute("style","width: 100%;");input.disabled=true;input.value=url;return document.body.appendChild(input)})}},{"../net/init":23,"../net/spawn-local-player":25,qs:1}],29:[function(require,module,exports){var invoke,sendOutbound;invoke=require("./helper/invoke");sendOutbound=require("./net/send-outbound");module.exports=function(){invoke(globals.controllers,"update");invoke(globals.sprites,"update");sendOutbound();return invoke(globals.connections,"update")}},{"./helper/invoke":16,"./net/send-outbound":24}]},{},[20]);