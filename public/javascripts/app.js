$(document).ready(function(){

	$("select").change(function(){
        if($(this).val() == "I'd like a custom option.")
            {
                $('#custom-div').show();
            }
    });

});