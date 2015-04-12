$(document).ready(function(){


	var defaultHash = 'dctech',
		numberPerPage = 4,
		instagramClientID = 'e9561311b628484a80a738312c222079',
		instagramURL = 'https://api.instagram.com/v1/tags/',
		instagramURL2 = '/media/recent',
		instagramImages = [];

	function getInstagramImages(hash, page){
		var first_id = (page * numberPerPage) - 1;
		var last_id = first_id + (numberPerPage - 1);
		$.ajax({
			url: instagramURL + hash + instagramURL2,
			method: 'get',
			dataType: 'jsonp', // added to fix cors issue
			crossDomain: true, // added to fix cors issue
			data: {
				client_id: instagramClientID,
				count: numberPerPage,
				min_tag_id: first_id,
				max_tag_id: last_id
			},
			success: function(data){
				instagramImages = [];
				$.each(data.data, function(){
					instagramImages.push(this['images']['low_resolution']['url']);
				}); console.log(instagramImages);
			}
		});
	}

	getInstagramImages(defaultHash, 1);

});


