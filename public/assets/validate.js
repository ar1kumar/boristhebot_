var myPlaceholder = "";

function validate(formID) {
	var errors = [];
	var messages = [];
	var form = (formID) ? formID + ' *' : 'form *';
	$(form).filter(':input[required], .choiceInput').css('border', '2px solid #dedede');
	$(form).filter('label span, .select span').css('border', '2px solid #dedede');
	$(form).filter('.error').empty();
	$(form).filter(':input[required]').each(function(){
		var $this = $(this),
			type = $this.attr('type'),
			tag = $this.prop('tagName'),
			name = $this.attr('name'),
			value = $this.val().trim(),
			isDate = $this.attr('date');
		if(tag == 'TEXTAREA'){ 
			if(!value.trim() || value === myPlaceholder){
				errors.push($this);
				messages.push('Field cannot be left empty');
			}
		}
		else if(tag == 'SELECT') {
			// Check if value == "0"
			if(value == false) {
				errors.push($this);
				messages.push('You must select an option');
			}
		}
		else if(/zip/.test(name)){
			if(!/^[0-9]*$/.test(value)){
				errors.push($this);
				messages.push('Incorrect zipcode format');
			}
			else if(value.length != 5){ //optional 
				errors.push($this);
				messages.push('Incorrect zipcode length (5 digits)');
			}
		}
		else if(/email/.test(name) || /email\b/.test(type)){
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(!re.test(value)){
				errors.push($this);
				messages.push('Incorrect email format');
			}
		}
		else if(/phone/.test(name) || /tel\b/.test(type)) {
			if(!/^[0-9]*$/.test(value)){
				errors.push($this);
				messages.push('Incorrect phone number format');
			}
			else if(value.length < 9){ //optional 
				errors.push($this);
				messages.push('Incorrect phone number length (10 digits)');
			}
		}
		else if(/radio\b/.test(type) || /checkbox\b/.test(type)){
			if(!$('input[name="'+name+'"]').is(':checked')){ 
				errors.push($this);
				messages.push('One option must be selected');
			}
		}
		else if(/number\b/.test(type)){
			if(!/^[0-9]*$/.test(value) || !value){
				errors.push($this);
				messages.push('Must be a number');
			}
		}
		else if(/date\b/.test(type) || isDate){
			var match = value.match(/^(\d{4})[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/);
			if(!match || match.length != 4) {
				errors.push($this);
				messages.push('Incorrect date format');
			}
		}
		else if(/text\b|password\b|hidden\b|time\b|file\b/.test(type)) {
			if(!value.trim()){
				errors.push($this);
				messages.push('Field cannot be left empty');
			}
		}
	});
	$.each(errors, function(index){
		if(this.attr('type') == 'checkbox'){
			$("label[for=" + this.attr("id") + "]").find('span').css('border', '2px solid rgb(196,59,29)');
		}
		else if(this.attr('type') == 'radio'){
			$("label[for=" + this.attr("id") + "]").find('span').css('border', '2px solid rgb(196,59,29)');
		}
		else if(this.prop('tagName') == "SELECT"){
			$(this).closest(".select").find("span").css('border', '2px solid rgb(196,59,29)');
		}
		else {
			this.css('border', '2px solid rgb(196,59,29)');
		}
		this.closest('.input').find('.error').html(messages[index]);
	});
	if(errors.length > 0){
		$(document.activeElement).blur();
		errors[0].focus();
	}
	return errors.length == 0;
}