var initialize_events = function(){

	//DRAFTS EDITOR
	
	//populate selector
	$("#drafts-selector").html(templateDraftsSelector({drafts: drafts, selectedDraft: selectedDraft}));
	
	//bind selector switch event
	$("#drafts-selector").on("change",function(){
		
		selectedDraft=$(this).val();
		var draft;
		for(var i=0; i<drafts.length; i++) if(drafts[i].ID == selectedDraft) draft=drafts[i];
		draft.categories=categories.slice();

		olddraft=$("#events-table > .events-new").serializeObject()

		draft.description=olddraft.description;
		draft.date=olddraft.date;
		draft.amount=olddraft.amount;
		draft.category=olddraft.category;

		$("#events-table > .events-new").html(templateEventsNew(draft));
		$(".date-input").datepicker({ dateFormat: "yy-mm-dd" });
		
	});
	
	//bind duplicate event
	$("#events-table > .drafts-editor").on("click",".duplicate-button",function(){
			
		var draft;
		for(var i=0; i<drafts.length; i++) if(drafts[i].ID == selectedDraft) draft=$.extend(true, {}, drafts[i]);
			
		for(var i=0; i<draft.expenditures.length; i++) draft['expenditure_'+draft.expenditures[i].person]=draft.expenditures[i].amount;
		delete draft.expenditures;
		
		for(var i=0; i<draft.ious.length; i++) draft['iou_'+draft.ious[i].borrower+'_'+draft.ious[i].creditor]=draft.ious[i].amount;
		delete draft.ious;
		
		var prompt=$.prompt({state:{
				title: 'Enter new description',
				html: '<label><input id="impromptu-input" type="text" name="draftDescription" value="'+draft.draftDescription+'"></label>',
				buttons: { OK: 1 },
				position: { container: '#drafts-selector', x: 0, y: 30, width: 200, arrow: 'tc' },
				focus: 1,
				submit:function(e,v,m,f){ 
					draft=jQuery.extend(draft, f);
					
					console.log(draft);
		
					var request = $.ajax({
							url: "php/drafts.php",
							data: $.param(draft),
							type: "POST",
							dataType: "json"
					});
	
					request.done(function(msg) {
							drafts=msg;
							$("#drafts-selector").html(templateDraftsSelector({drafts: drafts, selectedDraft: selectedDraft}));
					});
					
					request.fail(function(jqXHR, textStatus) {
							alert( "Request failed: " + textStatus );
					});
					
			}
			}
		});
		
		prompt.bind('promptloaded', function(e){$("#impromptu-input").select()});
			
	});
	
	//bind rename event
	$("#events-table > .drafts-editor").on("click",".rename-button",function(){
			
		var draft;
		for(var i=0; i<drafts.length; i++) if(drafts[i].ID == selectedDraft) draft=$.extend(true, {}, drafts[i]);
		draftDescription=draft.draftDescription;
		
		params={ID: draft.ID, draftDescription: draftDescription};
		
		var prompt=$.prompt({state:{
				title: 'Enter new description',
				html: '<label><input id="impromptu-input" type="text" name="draftDescription" value="'+draftDescription+'"></label>',
				buttons: { OK: 1 },
				position: { container: '#drafts-selector', x: 0, y: 30, width: 200, arrow: 'tc' },
				focus: 1,
				submit:function(e,v,m,f){ 
					params=jQuery.extend(params, f);
					
					console.log(params);
		
					var request = $.ajax({
							url: "php/drafts.php",
							data: $.param(params),
							type: "PUT",
							dataType: "json"
					});
	
					request.done(function(msg) {
							drafts=msg;
							$("#drafts-selector").html(templateDraftsSelector({drafts: drafts, selectedDraft: selectedDraft}));
					});
					
					request.fail(function(jqXHR, textStatus) {
							alert( "Request failed: " + textStatus );
					});
					
			}
			}
		});
		
		prompt.bind('promptloaded', function(e){$("#impromptu-input").select()});
			
	});
	
	//bind save event
	$("#events-table > .drafts-editor").on("click",".save-button",function(){
			
		var request = $.ajax({
				url: "php/drafts.php",
				data: "ID="+selectedDraft+"&"+$("#events-table > .events-new").serialize(),
				type: "PUT",
				dataType: "json"
		});

		request.done(function(msg) {
				drafts=msg;
		});

		request.fail(function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});
			
	});
	
	//bind make default event
	$("#events-table > .drafts-editor").on("click",".make-default-button",function(){
			
		for(var i=0; i<drafts.length; i++) if(drafts[i].default!=undefined && drafts[i].default!=false) currentDefault=drafts[i].ID;
			
		var request = $.ajax({
				url: "php/drafts.php",
				data: "ID="+currentDefault+"&default=0",
				type: "PUT",
				dataType: "json"
		});

		request.done(function(msg) {
				
				var request = $.ajax({
						url: "php/drafts.php",
						data: "ID="+selectedDraft+"&default=1",
						type: "PUT",
						dataType: "json"
				});
		
				request.done(function(msg) {
						drafts=msg;
				});
		
				request.fail(function(jqXHR, textStatus) {
						alert( "Request failed: " + textStatus );
				});
				
		});

		request.fail(function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});
			
	});
	
	//bind delete event
	$("#events-table > .drafts-editor").on("click",".delete-button",function(){
			
		var request = $.ajax({
				url: "php/drafts.php",
				data: "ID="+selectedDraft,
				type: "DELETE",
				dataType: "json"
		});

		request.done(function(msg) {
				drafts=msg;
				for(var i=0; i<drafts.length; i++) if(drafts[i].default!=undefined && drafts[i].default!=false) selectedDraft=drafts[i].ID;
				$("#drafts-selector").html(templateDraftsSelector({drafts: drafts, selectedDraft: selectedDraft}));
				var draft;
				for(var i=0; i<drafts.length; i++) if(drafts[i].ID == selectedDraft) draft=drafts[i];
				draft.categories=categories.slice();
				$("#events-table > .events-new").html(templateEventsNew(draft));
				$(".date-input").datepicker({ dateFormat: "yy-mm-dd" });
		});

		request.fail(function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});
			
	});
	
	//EVENT NEW FORM
	
	//populate
	var draft;
	for(var i=0; i<drafts.length; i++) if(drafts[i].ID == selectedDraft) draft=drafts[i];
	draft.categories=categories.slice();
	draft.date=$.datepicker.formatDate('yy-mm-dd', new Date());
	$("#events-table > .events-new").html(templateEventsNew(draft));
	$(".date-input").datepicker({ dateFormat: "yy-mm-dd" });
	
	//bind post event
	$("#events-table > .events-new").on("click",".post-button",function(){

		var request = $.ajax({
				url: "php/events.php",
				data: $("#events-table > .events-new").serialize(),
				type: "POST",
				dataType: "json"
		});

		request.done(function(msg) {
					events=msg;
					$("#events-table > .events-rows").html(templateEventsRows(({events: events})));
		});

		request.fail(function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});
			
	});
		

	//EVENTS TABLE	
	
	//populate
	$("#events-table > .events-head").html(templateEventsHead((events[0])));
	$("#events-table > .events-rows").html(templateEventsRows(({events: events})));
	
	//bind delete event
	$("#events-table").on("click",".events-row > .td > .delete-button",function(){
			
		//console.log($(this).parent().parent().attr("id").substr(6));
			
		var request = $.ajax({
				url: "php/events.php",
				data: "ID="+$(this).parent().parent().attr("id").substr(6),
				type: "DELETE",
				dataType: "json"
		});

		request.done(function(msg) {
				events=msg;
				$("#events-table > .events-rows").html(templateEventsRows(({events: events})));
		});

		request.fail(function(jqXHR, textStatus) {
				alert( "Request failed: " + textStatus );
		});
		
		
			
	});
	
	//bind inline update events
	$("#events-table > .events-rows").on("click",".editable",function(){
	
			var params={
				ID: $(this).parent().attr("id").substr(6),
				field: $(this).attr("field"),
				value: $(this).attr("value")
			};
			
			//console.log(params);
			
			$(this).attr("id","impromptu-pos");
			
			var html='<label><input id="impromptu-input" type="text" name="'+params.field+'" value="'+params.value+'"></label>';
			
			if(params.field=='category'){
				html='<label><select name="category">'
				for(var i=0; i<categories.length; i++){
				
					if(categories[i].name==params.value) html=html+'<option value="'+categories[i].name+'" selected="yes" >'+categories[i].longerName+'</option>';
					else html=html+'<option value="'+categories[i].name+'">'+categories[i].longerName+'</option>';
					 
				}
				html=html+'</select></label>';
			}
			
			if(params.field=='date') html='<label><input id="impromptu-input" class="date-input" type="text" name="'+params.field+'" value="'+params.value+'"></label>';
			
			var prompt=$.prompt({state:{
					title: 'Enter new value',
					html: html,
					buttons: { OK: 1 },
					position: { container: '#impromptu-pos', x: 0, y: 40, width: 200, arrow: 'tc' },
					focus: 1,
					overlayspeed: "fast",
					submit:function(e,v,m,f){ 
						
						delete params.field;
						delete params.value;
						
						params=jQuery.extend(params, f);
						
						console.log(params);
			
						var request = $.ajax({
								url: "php/events.php",
								data: $.param(params),
								type: "PUT",
								dataType: "json"
						});
		
						request.done(function(msg) {
								events=msg;
								$("#events-table > .events-rows").html(templateEventsRows(({events: events})));
						});
						
						request.fail(function(jqXHR, textStatus) {
								alert( "Request failed: " + textStatus );
						});
						
						
						$("#impromptu-pos").attr("id","");
						
				}
				}
			});
			
			if(params.field=='date') {
				prompt.bind('promptloaded', function(e){
						$(".date-input").datepicker({ dateFormat: "yy-mm-dd" });
						$("#impromptu-input").focus();
				});
			}else prompt.bind('promptloaded', function(e){$("#impromptu-input").select()});
			
			
	
	});




};
