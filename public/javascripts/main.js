$(function(){
	$.fn.gameCreat = function(options) {
		var imgMaxTypes = 5;//最大图片种类数
		var IMG_PATH = "images/";//图片路径
		//默认参数设置
		var settings = {
			cols : 12,//列数
			rows : 12,//行数
			imgTypes : 5//图片种类数
		}
		
		//初始化参数
		if(options){
			jQuery.extend(settings,options);
		}
		
		if(!settings.imgTypes||settings.imgTypes>imgMaxTypes){
			settings.imgTypes = imgMaxTypes;
		}
		
		//初始化图片url地址数组
		var imgs = new Array(settings.imgTypes);
		for(var i=1; i<=settings.imgTypes; i++){
			imgs[i] = (i) + '.jpg';
		}
		
		$(this).each(function(){
			var $this=$(this);
			var cols = settings.cols,
				rows = settings.rows;
			//被选中图片信息缓存
			var holding={
					isHold:false,//是否有被选择的图片
					rowIndex:0,//被选择的图片纵坐标
					colIndex:0,//被选择的图片横坐标
					$object : null,//被选择的图片的jQuery对象
					clear:function(){//清空holding对象
						this.isHold = false;
						this.rowIndex = 0;
						this.colIndex = 0;
						this.$object = null;
					}
				}
			
			//初始化模型
			var model = new Array(rows);
			for(var i=0; i<rows; i++){
				model[i] = new Array(cols);
				for(var j=0; j<cols; j++){
					model[i][j] = 0;
				}
			}
			//图片表格生成器
			var imgTableCreat = function(){
				//初始化表格
				for(var i=0;i<rows-2;i++){	
					var $tr = $this.append($("<tr/>")).find("tr:last");
					for(var j=0;j<cols-2;j++) {
						var td=$tr.append($("<td/>"));
					}
				}
				//生成随机图片
				var tmp = randomImgList();
				
				var c = 0;
				for(var i=1; i<rows-1; i++){
					for(var j=1; j<cols-1; j++){
						model[i][j] = tmp[c++];
						$this.find('tr:eq('+(i-1)+') td:eq('+(j-1)+')').html("<img src='"+ IMG_PATH + imgs[model[i][j]] +"' />");
					}	
				}
			}
			//随机图片生成器
			var randomImgList = function(){
				var total = (cols-2)*(rows-2);
				var tmp = new Array(total);
				for(var i=0; i<total; i++){
					tmp[i] = 0;
				}
				for(var i=0; i<total; i++){
					if(tmp[i]==0){
						var t = Math.floor(Math.random()*settings.imgTypes) + 1;
						tmp[i] = t;
						while(true){
							var c = Math.floor(Math.random()*(total-i)) + i;
							if(tmp[c]==0){
								tmp[c] = t;
								break;
							}
						}
					}
				}
				return tmp;
			}
			//DOM事件初始化函数
			var domEventInit = function(){
				var $img = $('img');

				$img.click(function(e){
					var c = $(this).parent()[0].cellIndex+1;
					var r = $(this).parents('tr')[0].rowIndex+1;
					
					if(holding.isHold){
						var p1 = {
							c:c,
							r:r
						}
						var p2 = {
							c:holding.colIndex,
							r:holding.rowIndex
						}
					//第二次点击判断是否可以连接
						if(!(isSameNode(p1,p2))&&($(this).attr('src')==holding.$object.attr('src'))){
							//不是同一个点且图片相同
							var path = getPath(p1,p2);
							
							if(path!=null){
								model[c][r] = 0;
								model[holding.colIndex][holding.rowIndex] = 0;
								removeNode($(this));
								removeNode(holding.$object);
							}
						}else{
							holding.$object.css('border-color' ,'#fff');
						}
						holding.clear();
					}else{//第一次点击记录该点
						holding.isHold = true;
						holding.rowIndex = r;
						holding.colIndex = c;
						holding.$object = $(this);
						$(this).css('border-color' ,'#3399FF');
					}
				});
			}
			
			//消除节点
			var removeNode = function($obj){
				$obj.attr('src',IMG_PATH+'0.jpg');
				$obj.css('border-color' ,'#ccc');
			}
			
			//路径搜索函数
			var getPath = function(p1,p2){
				var result;
				if(hasLine(p1,p2)){//两点直接可连
					result = [p1,p2];
				}else if(onlineY(p1, p2)){//两点同列水平扫描
					result = horizontalScan(p1,p2);
				}else if(onlineX(p1, p2)){//两点同行垂直扫描
					result = verticalScan(p1,p2);
				}else{//两点在不同直线上进行垂直扫描和水平扫描
					result =  horizontalScan(p1,p2)||verticalScan(p1,p2);
				}
				return result;
			}
			
			//垂直扫描函数
			var verticalScan = function(p1,p2){
				var p3 = {
						r:0,
						c:p1.c
					},
					p4 = {
						r:0,
						c:p2.c
					};

				for(var i=0;i<rows;i++){
					p3.r = i;
					p4.r = i;
					var a = hasLine(p4,p2);
					if(hasLine(p1,p3)&&hasLine(p3,p4)&&hasLine(p4,p2)&&(isEmpty(p3)||isSameNode(p1,p3))&&(isEmpty(p4)||isSameNode(p2,p4))){
						return [p1,p3,p4,p2];
					}					
				}
			}
			
			//水平扫描函数
			var horizontalScan = function(p1,p2){
				var p3 = {
						r:p1.r,
						c:0
					},
					p4 = {
						r:p2.r,
						c:0
					};
					
				for(var i=0;i<rows;i++){
					p3.c = i;
					p4.c = i;
					if(hasLine(p1,p3)&&hasLine(p3,p4)&&hasLine(p4,p2)&&(isEmpty(p3)||isSameNode(p1,p3))&&(isEmpty(p4)||isSameNode(p2,p4))){
						return [p1,p3,p4,p2];
					}					
				}
			}
			
			/*扫描辅助函数*/
			var onlineX = function(p1, p2){
				return p1.r==p2.r;
			}

			var onlineY = function(p1, p2){
				return p1.c==p2.c;	
			}

			var isEmpty = function(p){
				return (model[p.c][p.r]==0);	
			}
			
			var isSameNode = function(p1,p2){
				if(p1.r==p2.r&&p1.c==p2.c){
					return true;
				}else{
					return false;
				}
			}
			//判断两点是否可直线连接
			var hasLine = function(p1, p2){
				if(isSameNode(p1,p2)){
					return true;
				}
				if(onlineY(p1, p2)){
					var minRow = Math.min(p1.r,p2.r);
						minRow = minRow+1;
					var maxRow = Math.max(p1.r,p2.r);
					var i=minRow
					for(var i=minRow;i<maxRow;i++){
						if(!isEmpty({c:p1.c,r:i})){
							break;
						}
					}
					if(i==maxRow){
						return true;
					}
					return false;
				}else if(onlineX(p1, p2)){
					var minCol = Math.min(p1.c,p2.c);
						minCol = minCol+1;
					var maxCol = Math.max(p1.c,p2.c);
					var i=minCol;
					for(;i<maxCol;i++){
						if(!isEmpty({c:i,r:p1.r})){
							break;
						}
					}
					if(i==maxCol){
						return true;
					}
					return false;
				}else{
					return false;
				}
			}
			
			//生成图片表格
			imgTableCreat();
			//初始化DOM事件
			domEventInit();
		});	
	}
});