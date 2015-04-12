$(document).ready(function(){


	var defaultHash = 'dctech',
		numberPerPage = 4,
		addedImageClass = 'image-found',
		oneMonthAgo = getDateForLastMonth(),
		$imageBlock = $('.no-images-found').first()
								.clone().attr('id','')
								.removeClass('no-images-found')
								.addClass(addedImageClass),
		$noInstagramImages = $('#no-instagram-images-found'),
		$instagramContainer = $('#instagram-images'),
		$instagramPagination = $('#instagram-pagination'),
		instagramClientID = 'e9561311b628484a80a738312c222079',
		instagramURL = 'https://api.instagram.com/v1/tags/',
		instagramURL2 = '/media/recent',
		instagramImages = [],
		$noFlickrImages = $('#no-flickr-images-found'),
		$flickrContainer = $('#flickr-images'),
		$flickrPagination = $('#flickr-pagination'),
		FlickrApiKey = '09b00df87e724b1d22f65aeb00f136e8',
		flickrURL = 'https://api.flickr.com/services/rest/'
		flickrMethod = 'flickr.photos.search',
		flickrImages = [];

	function getAllImages(hash){
		getInstagramImages(hash);
		getFlickrImages(hash);
	}

	function getInstagramImages(hash){
		$instagramContainer.addClass('loading');
		$.ajax({
			url: instagramURL + hash + instagramURL2,
			method: 'get',
			dataType: 'jsonp', // added to fix cors issue
			crossDomain: true, // added to fix cors issue
			data: {
				client_id: instagramClientID,
				count: 100, //numberPerPage,
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
						if(this['created_time'] >= oneMonthAgo) {
							instagramImages.push({
								url: this['images']['low_resolution']['url'],
								caption: this['caption']['text'],
								link: this['link'],
								comments: this['comments']['count']
							});
						} else {
							return false;
						}
					});
					console.log('Instagram Images Found for #' + hash + ': ' + instagramImages.length);
					addImagesToPage($instagramContainer, $instagramPagination, instagramImages);
				} else {
					$noInstagramImages.show();
				}
			}
		});
	}

	function getFlickrImages(hash){
		$flickrContainer.addClass('loading');
		$.ajax({
			url: flickrURL,
			method: 'get',
			dataType: 'xml',
			data: {
				method: flickrMethod,
				api_key: FlickrApiKey,
				tags: hash,
				min_upload_date: oneMonthAgo,
				media: 'photos'
			},
			success: function(data){
				flickrImages = [];
				var responseData = $(data).find('photos');
				var imageData = responseData.find('photo');
				$flickrContainer.find('.'+addedImageClass).remove();
				if(responseData.attr('total') != 0 && imageData.length > 0){
					console.log('Flickr Images Found for #' + hash + ': ' + responseData.attr('total'))
					$flickrContainer.removeClass('loading');
					$noFlickrImages.hide();
					/*$.each(imageData, function(){
						flickrImages.push({
							url: this['images']['low_resolution']['url'],
							caption: this['caption']['text'],
							link: this['link'],
							comments: this['comments']['count']
						});
					});
					addImagesToPage($flickrContainer, $flickrPagination, flickrImages);*/
				} else {
					$flickrContainer.removeClass('loading');
					$noFlickrImages.show();
				}
			}
		});
	}

	function addImagesToPage($section, $section_pagination, images){
		images.sort(sortByComments);
		$.each(images, function(){
			$thisImageBlock = $imageBlock.clone();
			$thisImageBlock
				.find('a.thumbnail')
				.attr('href',this.link)
				.find('img')
				.attr({
					'src': this.url,
					'alt': this.caption,
					'data-comments': this.comments
				});
			$section.append($thisImageBlock);
		});
		$imagesInSection = $section.find('.' + addedImageClass);
		$imagesInSection.slice(numberPerPage).hide();
		$section_pagination.pagination({
	        items: images.length,
	        itemsOnPage: numberPerPage,
	        onPageClick: function(pageNumber) {
	            // someone changed page
	            var showFrom = numberPerPage * (pageNumber - 1);
	            var showTo = showFrom + numberPerPage;

	            $imagesInSection.hide() // hide everything
	                 .slice(showFrom, showTo).show(); // show for the new page
	        }
	    }).show();
	}

	function sortByComments(a, b){
	  	if (a.comments < b.comments) {
	     	return 1;
	  	} else if (a.comments > b.comments) {
	    	return -1;
	  	} else {
	  		return 0;
	  	}
	}

	function getDateForLastMonth(){
		var x = new Date();
		x.setMonth(x.getMonth() - 1);
		return parseInt((x.valueOf()) / 1000);
	}

	getInstagramImages(defaultHash);
	getFlickrImages(defaultHash);

	$('#hash-search-form').submit(function(){
		var hashtag = $(this).find('input[name="hashtag"]').val();
		getAllImages(hashtag);
		return false;
	});

});


