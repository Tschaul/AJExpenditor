
// TEMPALTES
var templateEventNew;
var templateEventHead;
var templateEventRow;
var templateDraftsSelector;
var templatePlotSelector;
	
// COLLECTIONS
var people;
var categories;
var drafts;
var events;
var selectedDraft;

// INITIALIZATION VARBIABLES
var peopleLoaded=false;
var categoriesLoaded=false;
var draftsLoaded=false;
var eventsLoaded=false;
var initialized=false;

// HANDLEBARS HELPER

Handlebars.registerHelper('fullName', function(name) {
	for(var i=0; i<people.length; i++) if(people[i].name==name) return people[i].fullName;
});

Handlebars.registerHelper('longerName', function(name) {
	for(var i=0; i<categories.length; i++) if(categories[i].name==name) return categories[i].longerName;
});

Handlebars.registerHelper('dateNow', function() {
	return $.datepicker.formatDate('yy-mm-dd', new Date());
});

Handlebars.registerHelper('toFixed2', function(amount) {
	return (amount-0).toFixed(2);
});

Handlebars.registerHelper('ifCond', function(v1, v2, options) {
	if(v1 == v2) {
		return options.fn(this);
	}
	return options.inverse(this);
});

// OTHER HELPER

serializeObj = function(obj) {
  var str = [];
  for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
}

// INIZIALIZE

$(document).ready(function() {

	$('#editor-switch').on('click',function(){

		$('#editor').show();
		$('#plot').hide();

	});

	$('#plot-switch').on('click',function(){

		$('#editor').hide();
		$('#plot').show();

	});

	//alert($("#template-event-new").html());
	templateEventsNew = Handlebars.compile($("#template-events-new").html());
	templateEventsHead = Handlebars.compile($("#template-events-head").html());
	templateEventsRows = Handlebars.compile($("#template-events-rows").html());
	templateDraftsSelector = Handlebars.compile($("#template-drafts-selector").html());	
	templatePlotSelector = Handlebars.compile($("#template-plot-selector").html());
	
	
	$.getJSON("php/people.php?name=all",function(result){
	
		people=result.slice();
		peopleLoaded=true;
					
	});
	
	$.getJSON("php/categories.php?name=all",function(result){
	
		categories=result.slice();
		categoriesLoaded=true;
			
	});
	
	$.getJSON("php/events.php?ID=all",function(result){
	
		events=result.slice();
		eventsLoaded=true;
			
	});
	
	$.getJSON("php/drafts.php?ID=all",function(result){
	
		drafts=result.slice();
		for(var i=0; i<drafts.length; i++) if(drafts[i].default!=undefined && drafts[i].default!=false) selectedDraft=drafts[i].ID;
		draftsLoaded=true;
			
	});
	
	$.repeat("initializing",function(){
	
		if(peopleLoaded && categoriesLoaded && draftsLoaded && eventsLoaded){
			initialize();			
			initialized=true;
			//console.log("initializing...");
			$.unrepeat("initializing");
		}
			
	}).wait(10).until(false);
	
});

function initialize(){
	
	initialize_events();
	
	initialize_plot();


}




