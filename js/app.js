/**
 * Copyright (C) 2013 Liran Tal <liran.tal@gmail.com>
 * Mashkantal - Mortgage Calculator App 
 */


/**
 * html5_storage
 * checks if html5 storage capability is available
 */
function html5_storage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

/**
 * Bind to page init.
 * When working with JQM we don't bind on document .ready() but rather on pageinit.
 */
$(document).on('pageinit', '#home', function() {

	$("#home #refresh_dashboard").on('click', function() {

		// Show loading icon
		$.mobile.loading('show');

		var json_URL = 'http://mashkantal.enginx.com/rates.php';
		$.ajax({
			url: json_URL,
			dataType: 'json',
			cache: false,
			timeout: 5000,
			success: function(result) {

				var rates = {rPrime: {rate: 0, change: 0}, rTzarhan: {rate: 0, change: 0}, rBniya: {rate: 0, change: 0}};

				if (typeof result.rPrime.rate != 'undefined') {
					$("#rPrime_rate .ui-btn-text").text(result.rPrime.rate + '%');
					if (result.rPrime.change < 0) {
						$("#rPrime_rate").toggleClass('up', false);
						$("#rPrime_rate").toggleClass('down', true);
						$("#rPrime_change").toggleClass('up', false);
						$("#rPrime_change").toggleClass('down', true);
					} else {
						$("#rPrime_rate").toggleClass('down', false);
						$("#rPrime_rate").toggleClass('up', true);
						$("#rPrime_change").toggleClass('down', false);
						$("#rPrime_change").toggleClass('up', true);
					}
					$("#rPrime_change .ui-btn-text").text(result.rPrime.change + '%');

					rates.rPrime.rate = result.rPrime.rate;
					rates.rPrime.change = result.rPrime.change;

				}

				if (typeof result.rTzarhan.rate != 'undefined') {
					$("#rTzarhan_rate .ui-btn-text").text(result.rTzarhan.rate);
					if (result.rTzarhan.change < 0) {
						$("#rTzarhan_rate").toggleClass('up', false);
						$("#rTzarhan_rate").toggleClass('down', true);
						$("#rTzarhan_change").toggleClass('up', false);
						$("#rTzarhan_change").toggleClass('down', true);
					} else {
						$("#rTzarhan_rate").toggleClass('down', false);
						$("#rTzarhan_rate").toggleClass('up', true);
						$("#rTzarhan_change").toggleClass('down', false);
						$("#rTzarhan_change").toggleClass('up', true);
					}
					$("#rTzarhan_change .ui-btn-text").text(result.rTzarhan.change + '%');

					rates.rTzarhan.rate = result.rTzarhan.rate;
					rates.rTzarhan.change = result.rTzarhan.change;
				}

				if (typeof result.rBniya.rate != 'undefined') {
					$("#rBniya_rate .ui-btn-text").text(result.rBniya.rate);
					if (result.rBniya.change < 0) {
						$("#rBniya_rate").toggleClass('up', false);
						$("#rBniya_rate").toggleClass('down', true);
						$("#rBniya_change").toggleClass('up', false);
						$("#rBniya_change").toggleClass('down', true);
					} else {
						$("#rBniya_rate").toggleClass('down', false);
						$("#rBniya_rate").toggleClass('up', true);
						$("#rBniya_change").toggleClass('down', false);
						$("#rBniya_change").toggleClass('up', true);
					}
					$("#rBniya_change .ui-btn-text").text(result.rBniya.change + '%');

					rates.rBniya.rate = result.rBniya.rate;
					rates.rBniya.change = result.rBniya.change;
				}

				// We'll serialize the variable so we can save it in storage
				localStorage.setItem('rates', JSON.stringify(rates));

				// Hide loading icon
				$.mobile.loading('hide');

			},

			error: function(data) {
				// Show the popup dialog
				$('#popup_connection_error').popup("open");

				// Hide loading icon
				$.mobile.loading('hide');
				return false;
			}
		});

	});


	var interval = setInterval(function() {
		$.mobile.loading('show');
		$("#home #refresh_dashboard").click();
	    clearInterval(interval);
	}, 10); 

});
 



/**
 * Mortgage Calculator page
 *
 *
 */ 
$(document).on('pageinit', '#calc_mtg', function() {
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
		//var calc_mtg_interest_index = $('#calc_mtg #calc_mtg_interest_index').val();
		
		//var M = calc_mtg(calc_mtg_sum, calc_mtg_years, calc_mtg_interest, calc_mtg_interest_index);
		var M = calc_mtg(calc_mtg_sum, calc_mtg_years, calc_mtg_interest, 0);
		$('#calc_button').prop('value', 'החזר חודשי: ' + M);
		$('#calc_button').button('refresh');
	});

	// Trigger the change() method to load default settings
	// @TODO fix issues when this item isn't available
	$("#calc_mtg #calc_mtg_sum").change();

//});
});



/* 
 * Formula for calculating monthly payment return
 * P = Principal amount (monetary value)
 * i = yearly interest rate (monetary value)
 * n = number of payments to make
 * M = P[i(1+i)^n]/[(1+i)^n -1]
 * X = Yearly Consumer index (monetary value)
 *
 * @param sum
 * @param years
 * @param interest
 * @param consumer_index
 * @return M monthly payment
 */
function calc_mtg(sum, years, interest, consumer_index) {

	// We don't allow division by 0
	if (((1+interest)^n-1) == 0)
		return 0;

	// Monthly Payment
	var M = 0;
	// Total sum of mortgage
	var P = (parseInt(sum));
	// Total years of mortgage
	var Y = (parseInt(years));

	// interest rate is expressed as monetary value and not as precent so we divide by 100.
	// we further divide by 12 to make sure it's monthly based rate
	var i = ((parseFloat(interest) / 100) / 12);



	// number of payments to make are provided in years but we make monthly payments, so multiply by 12
	var n = (Y * 12);

	var term = Math.pow((1+i),n);


	M = P * ( (i*term)/(term-1) );

	// Use cir - consumer index rate
	var cir = parseFloat(consumer_index);
	if (cir != 0) {
		// Mm represents now the increase in monthly payment due to consumer index rate
		//var Mm = Math.pow((1+cir/100),(1/12));
		//M = ( Mm*Math.pow(Mm,parseInt(years)-1)/(Mm-1) );

		//M = ( P * ( 1 + Math.pow(((parseInt(interest)/100)/12),(12*n)-n) ) );
		i_effective = Math.pow(1+(cir/100),Y);
		M = (M * i_effective);
	}

	return Math.floor(M);
}