$(document).ready(function(){


	var defaultHash = 'dctech',
		instagramClientID = 'e9561311b628484a80a738312c222079',
		instagramURL = 'https://api.instagram.com/v1/tags/search';

	function getInstagramImages(hash){
		$.ajax({
			url: instagramURL,
			method: 'get',
			dataType: 'jsonp', // added to fix cors issue
			crossDomain: true, // added to fix cors issue
			data: {
				q: hash,
				client_id: instagramClientID
			},
			success: function(data){
				console.log(data);
			}
		});
	}

	getInstagramImages(defaultHash);

});


