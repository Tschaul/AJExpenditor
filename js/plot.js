function showTooltip(x, y, contents) {
	$("<div id='tooltip'>" + contents + "</div>").css({
		position: "absolute",
		display: "none",
		top: y + 5,
		left: x + 5,
		border: "1px solid #fdd",
		padding: "2px",
		"background-color": "#fee",
		opacity: 0.80
	}).appendTo("body").fadeIn(200);
}



var plotdata;

var draw_plot = function(){

	formdata=$('#plot-selector').serializeObject();

	var t=-1;

	var tstrings=[];

	var oldtime=undefined;

	var expdata=[];
	var catindex={};
	var catnames={};
	
	var jmax=0;
	for(var j=0; j<categories.length; j++){
		if(formdata[categories[j].name]==1){
			catindex[categories[j].name]=jmax;
			catnames[jmax]=categories[j].name;
			expdata[jmax]=[];
			jmax++;
		}else{
			catindex[categories[j].name]=-1;
		}	

	}

	//console.log(formdata.interval);

	for(var i=events.length-1; i>=0; i--){

		datesplitted=events[i].date.split('-');

		date = new Date(datesplitted[0], parseInt(datesplitted[1])-1, datesplitted[2]);	

		if(formdata.interval=='monthly') newtime=date.getMonth();
		else if(formdata.interval=='weekly') newtime=date.getWeek(1);
		else newtime=date.getDay();

		if(formdata.interval=='monthly') thisBarWidth=30;
		else if(formdata.interval=='weekly') thisBarWidth=7;
		else thisBarWidth=1;

		//console.log(date);

		if(newtime!=oldtime){
			oldtime=newtime;
			t++;
			tstrings[t]=date.julianDate();
			for(var j=0; j<jmax; j++) expdata[j][t]=0;
			//console.log(date);
			//console.log(newtime);
			//console.log(t);
		}

		var amount=0;

		for(var k=0; k<events[i].expenditures.length; k++){
			if(formdata.person=='all' || formdata.person==events[i].expenditures[k].person) amount+=events[i].expenditures[k].delta;
		}

		if(catindex[events[i].category]>-1) expdata[catindex[events[i].category]][t]+=amount;

	}

	plotdata=[];
	for(var j=0; j<jmax; j++){
		plotdata[j]={};
		plotdata[j].data=[];
		plotdata[j].bars={ show: true, fill: true, barWidth : thisBarWidth };
		for(var k=0; k<categories.length; k++) if(categories[k].name==catnames[j]) plotdata[j].label=categories[k].longerName;
	}

	for(var i=0; i<expdata[0].length; i++){

		sum=0;

		for(var j=0; j<jmax; j++){

			sum+=expdata[j][i];
			plotdata[jmax-j-1].data.push([tstrings[i],sum]);

		}


	}

	console.log(expdata);
	console.log(catindex);

	$.plot("#plot-figure", plotdata, {
			
			grid: {
				hoverable: true,
				clickable: true
			},
			legend: {
				show: false
			}
		});

	
	var previousPoint = null;
	$("#plot-figure").bind("plothover", function (event, pos, item) {


		//console.log(event);
		//console.log(pos);
		//console.log(item);


		
		//for(var i=0; i<plotdata[0].data.length; i++) if(pos.x<parseInt(plotdata[0].data[i][0],10)) break;

		//console.log(i);
		
		if(item==null) $("#tooltip").remove();
		else{


			i=item.dataIndex;
			j=item.seriesIndex;


			//console.log(i);
			//console.log(j);

			if(j>-1){
				if(j<(plotdata.length-1)) amounthovering=plotdata[j].data[i][1]-plotdata[j+1].data[i][1];
				else amounthovering=plotdata[j].data[i][1];
				$("#tooltip").remove()
				showTooltip(pos.pageX, pos.pageY,plotdata[jmax-j-1].label+" "+(amounthovering-0).toFixed(2));
			}

		}

		/*

		if(i!=plotdata[0].data.length){

			var xf=parseInt(plotdata[0].data[i-1][0],10);
			var xc=parseInt(plotdata[0].data[i][0],10);

			var wf=(pos.x-xc)/(xf-xc);
			var wc=1-wf;
		
			//console.log(wf);

			for(var j=0; j<plotdata.length; j++){

				var y=plotdata[j].data[i-1][1]*wf+plotdata[j].data[i][1]*wc;
				//console.log(y);
				if(pos.y>y) break

			}

			j=j-1;

			//console.log(j);

			$("#tooltip").remove();

		
			

			if(j>0){
				if(j<(plotdata.length-1)) amounthovering=plotdata[j].data[i][1]-plotdata[j+1].data[i][1];
				else amounthovering=plotdata[j].data[i][1];
				showTooltip(pos.pageX, pos.pageY,plotdata[jmax-j-1].label+amounthovering.toString());
			}

		}else $("#tooltip").remove();
	
		

		if (item) {
			if (previousPoint != item.dataIndex) {

				previousPoint = item.dataIndex;

				$("#tooltip").remove();
				var x = item.datapoint[0].toFixed(2),
				y = item.datapoint[1].toFixed(2);

				showTooltip(item.pageX, item.pageY,
				    item.series.label + " " + y);
			}
		} else {
			$("#tooltip").remove();
			previousPoint = null;            
		}

		*/
	});



};

var initialize_plot = function(){

	$("#plot-selector").html(templatePlotSelector({people: people, categories: categories}));

	$("#plot-selector").on("click",".plot-button",function(){

		draw_plot();
	});

	draw_plot();

};

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

Date.prototype.julianDate=function(){
var j=parseInt((this.getTime()-new Date('Dec 30, 2012 23:00:00').getTime())/86400000).toString(),
i=3-j.length;
while(i-->0)j=0+j;
return j
};


/**
* Returns the week number for this date. dowOffset is the day of week the week
* "starts" on for your locale - it can be from 0 to 6. If dowOffset is 1 (Monday),
* the week returned is the ISO 8601 week number.
* @param int dowOffset
* @return int
*/
Date.prototype.getWeek = function (dowOffset) {
/*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.epoch-calendar.com */

dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
var newYear = new Date(this.getFullYear(),0,1);
var day = newYear.getDay() - dowOffset; //the day of week the year begins on
day = (day >= 0 ? day : day + 7);
var daynum = Math.floor((this.getTime() - newYear.getTime() -
(this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
var weeknum;
//if the year starts before the middle of a week
if(day < 4) {
weeknum = Math.floor((daynum+day-1)/7) + 1;
if(weeknum > 52) {
nYear = new Date(this.getFullYear() + 1,0,1);
nday = nYear.getDay() - dowOffset;
nday = nday >= 0 ? nday : nday + 7;
/*if the next year starts before the middle of
the week, it is week #1 of that year*/
weeknum = nday < 4 ? 1 : 53;
}
}
else {
weeknum = Math.floor((daynum+day-1)/7);
}
return weeknum;
};
