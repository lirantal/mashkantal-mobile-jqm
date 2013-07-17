/**
 * Bind to page init.
 * When working with JQM we don't bind on document .ready() but rather on pageinit.
 */
$(document).bind('pageinit', function() {
	/**
	  * Bind to all the mortgage calculator change events
	  *
	  */
	// We can also bind to the slidestop event but it doesn't fire when updating the numeric field widget for the slider
	// $("#calc_mtg #calc_mtg_sum").on( 'slidestop', function(event) { 
	$("#calc_mtg #calc_mtg_sum, #calc_mtg #calc_mtg_years, #calc_mtg #calc_mtg_interest").on("change", function(event, ui) {  
		var calc_mtg_sum = $('#calc_mtg #calc_mtg_sum').val();
		var calc_mtg_years = $('#calc_mtg #calc_mtg_years').val();
		var calc_mtg_interest = $('#calc_mtg #calc_mtg_interest').val();
		
		var M = calc_mtg(calc_mtg_sum, calc_mtg_years, calc_mtg_interest);
		$('#calc_button').prop('value', 'Monthly Return: ' + M);
		$('#calc_button').button('refresh');
	});

	// Trigger the mortgage calculator change event so that we can show a monthly payment for the default values
	$("#calc_mtg #calc_mtg_sum").change();

});



/* 
 * Formula for calculating monthly payment return
 * P = Principal amount (monetary value)
 * i = interest rate (monetary value)
 * n = number of payments to make
 * M = P[i(1+i)^n]/[(1+i)^n -1]
 *
 * @param sum
 * @param years
 * @param interest
 * @return M monthly payment
 */
function calc_mtg(sum, years, interest) {

	// We don't allow division by 0
	if (((1+interest)^n-1) == 0)
		return 0;

	var M = 0;
	var P = (parseInt(sum));

	// interest rate is expressed as monetary value and not as precent so we divide by 100.
	// we further divide by 12 to make sure it's monthly based rate
	var i = ((parseInt(interest) / 100) / 12);

	// number of payments to make are provided in years but we make monthly payments, so multiply by 12
	var n = (parseInt(years) * 12);

	var term = Math.pow((1+i),n);

	M = P * ( (i*term)/(term-1) );
	return Math.floor(M);
}