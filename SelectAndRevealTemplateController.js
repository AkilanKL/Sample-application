var SelectAndRevealTemplateController = function(parentData){

    var _this = this;
	
	var mac = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;
	this.currentData;
	this.parentData = parentData;

    this.init = function(data){
		
		/* Initialized from loadExternalPageSuccessHandler with json file(data) of the page */

        _this.currentData = data;
        _this.loadUI(_this.currentData);
			
    }
	
    this.loadUI = function(data){

        var selectRevealContainer = $(".slct-rvl-container");

        for(var i = 0; i < data.pageContent.select_boxes.length; i++) {
            var tempCon = "";
            tempCon += '<div class="slct-box">';

                tempCon += '<div>';
                    tempCon += '<button class="slct-button" aria-expanded="false">Select To Reveal</button>';
                tempCon += '</div>';
                var bgUrl = _model.getAppDataObj().baseURL + "/assets/images/" + data.pageContent.select_boxes[i].image;
                tempCon += ' <div class="slct-txt-container" style="background-image:url('+ bgUrl +')">';
                    tempCon += '<div class="slct-txt" tabindex="0">';
                        tempCon += data.pageContent.select_boxes[i].text;
                    tempCon += '</div>';
                tempCon += ' </div>';

            tempCon += '</div>';
            selectRevealContainer.append(tempCon);
        }

        $(".slct-button").on("click", _this.revealHandler);
    }

    this.revealHandler = function () {
        $(this).attr("aria-expanded", "true");
        $(this).parent().parent().addClass("activated-box");
       
    }
		
		
	
}