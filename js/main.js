$(document).ready(function(){


	var defaultHash = 'dctech',
		numberPerPage = 4,
		searchCap = 200,
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
		flickrURL = 'https://api.flickr.com/services/rest/',
		flickrImagesMethod = 'flickr.photos.search',
		flickrCommentsMethod = 'flickr.photos.comments.getList',
		flickrImages = [];

	function getAllImages(hash){
		instagramImages = [];
		flickrImages = [];
		getInstagramImages(hash, null);
		getFlickrImages(hash);
	}

	function getInstagramImages(hash, max_tag_id){
		$instagramContainer.addClass('loading');
		$.ajax({
			url: instagramURL + hash + instagramURL2,
			method: 'get',
			dataType: 'jsonp', // added to fix cors issue
			crossDomain: true, // added to fix cors issue
			data: {
				client_id: instagramClientID,
				count: 20, //numberPerPage,
				max_tag_id: max_tag_id
			},
			success: function(data){
				var thisMonth = true;
				var imageData = data.data;
				$instagramContainer.find('.'+addedImageClass).remove();
				if(imageData.length > 0){
					$noInstagramImages.hide();
					$.each(imageData, function(){
						if(this['created_time'] >= oneMonthAgo && instagramImages.length < searchCap) {
							instagramImages.push({
								url: this['images']['low_resolution']['url'],
								caption: (this['caption'])? this['caption']['text']:'',
								link: this['link'],
								comments: this['comments']['count']
							});
						} else {
							thisMonth = false;
							return false;
						}
					});
					if(thisMonth){
						getInstagramImages(hash, data.pagination.next_max_tag_id);
					} else {
						$instagramContainer.removeClass('loading');
						console.log('Instagram Images Found for #' + hash + ': ' + instagramImages.length);
						addImagesToPage($instagramContainer, $instagramPagination, instagramImages);
					}
				} else {
					$instagramContainer.removeClass('loading');
					$instagramPagination.hide();
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
				method: flickrImagesMethod,
				api_key: FlickrApiKey,
				tags: hash,
				min_upload_date: oneMonthAgo,
				media: 'photos',
				per_page: searchCap,
				extras: 'url_n, count_comments'
			},
			success: function(data){
				console.log(data);
				var responseData = $(data).find('photos');
				var imageData = responseData.find('photo');
				$flickrContainer.find('.'+addedImageClass).remove();
				if(responseData.attr('total') != 0 && imageData.length > 0){
					console.log('Flickr Images Found for #' + hash + ': ' + responseData.attr('total'));
					$.each(imageData, function(){
						var farmID = $(this).attr('farm'),
							serverID = $(this).attr('server'),
							imageID = $(this).attr('id'),
							secretID = $(this).attr('secret'),
							userID = $(this).attr('owner'),
							imageTitle = $(this).attr('title'),
							numberOfComments = $(this).attr('count_comments'),
							imageURL = $(this).attr('url_n');

						flickrImages.push({
							url: imageURL, //getFlickrImage(farmID, serverID, imageID, secretID),
							caption: imageTitle,
							link: getFlickrLink(userID, imageID),
							comments: numberOfComments
						});
					});
					$noFlickrImages.hide();
					$flickrContainer.removeClass('loading');
					addImagesToPage($flickrContainer, $flickrPagination, flickrImages);
				} else {
					$flickrContainer.removeClass('loading');
					$flickrPagination.hide()
					$noFlickrImages.show();
				}
			}
		});
	}

	/*function getFlickrComments(imagesArray){
		var thisImage = imagesArray.first(),
			farmID = thisImage.attr('farm'),
			serverID = thisImage.attr('server'),
			imageID = thisImage.attr('id'),
			secretID = thisImage.attr('secret'),
			userID = thisImage.attr('owner'),
			imageTitle = thisImage.attr('title');
		
		imagesArray.slice(1); // attempting to remove element from jquery object

		$.ajax({
			url: flickrURL,
			method: 'get',
			dataType: 'xml',
			data: {
				method: flickrCommentsMethod,
				api_key: FlickrApiKey,
				photo_id: imageID
			},
			success: function(data){
				var responseData = $(data).find('comments');
				var numberOfComments = responseData.find('comment').length;

				flickrImages.push({
					url: getFlickrImage(farmID, serverID, imageID, secretID),
					caption: imageTitle,
					link: getFlickrLink(userID, imageID),
					comments: numberOfComments
				});
				if(imagesArray.length > 0){
					//getFlickrComments(imagesArray)
				} else {
					$noFlickrImages.hide();
					$flickrContainer.removeClass('loading');
					addImagesToPage($flickrContainer, $flickrPagination, flickrImages);
				}
			}
		});
	}

	function getFlickrImage(farmID, serverID, imageID, secretID){
		return 'https://farm' + farmID + 
			'.staticflickr.com/' + serverID +
			'/' + imageID + '_' + secretID + '.jpg';
	}*/

	function getFlickrLink(userID, imageID){
		return 'https://www.flickr.com/photos/' +
			userID + '/' + imageID;
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

	getAllImages(defaultHash);

	$('#hash-search-form').submit(function(){
		var hashtag = $(this).find('input[name="hashtag"]').val();
		getAllImages(hashtag);
		return false;
	});

});


