$(document).ready(function(){


	var defaultHash = 'dctech',
		numberPerPage = 4,
		addedImageClass = 'image-found',
		$imageBlock = $('.no-images-found').first()
								.clone().attr('id','')
								.removeClass('no-images-found')
								.addClass(addedImageClass),
		$noInstagramImages = $('#no-instagram-images-found'),
		$instagramContainer = $('#instagram-images'),
		instagramClientID = 'e9561311b628484a80a738312c222079',
		instagramURL = 'https://api.instagram.com/v1/tags/',
		instagramURL2 = '/media/recent',
		instagramImages = [];

	function getInstagramImages(hash, page){
		$instagramContainer.addClass('loading');
		$.ajax({
			url: instagramURL + hash + instagramURL2,
			method: 'get',
			dataType: 'jsonp', // added to fix cors issue
			crossDomain: true, // added to fix cors issue
			data: {
				client_id: instagramClientID,
				count: numberPerPage,
				//min_tag_id: first_id, <- should be used for "previous" button
				//max_tag_id: last_id  <- should be used for "next" button
			},
			success: function(data){
				instagramImages = [];
				var imageData = data.data;
				$instagramContainer.removeClass('loading');
				$instagramContainer.find('.'+addedImageClass).remove();
				if(imageData.length > 0){
					$noInstagramImages.hide();
					$.each(imageData, function(){
						instagramImages.push({
							url: this['images']['low_resolution']['url'],
							caption: this['caption']['text']
						});
					});
					addImagesToPage($instagramContainer, instagramImages);
				} else {
					$noInstagramImages.show();
				}
			}
		});
	}

	function addImagesToPage($section, images){
		$.each(images, function(){
			$thisImageBlock = $imageBlock.clone();
			$thisImageBlock.find('img')
				.attr('src',this.url)
				.attr('alt',this.caption);
			$section.append($thisImageBlock);
		});
	}

	getInstagramImages(defaultHash, 1);

});


