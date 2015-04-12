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
						console.log('Last Month: ' + oneMonthAgo);
						console.log('Time Created: ' + this['created_time']);
						if((this['created_time']*1000) >= oneMonthAgo) { // compare instagram date in seconds to javascript date in miliseconds
							instagramImages.push({
								url: this['images']['low_resolution']['url'],
								caption: this['caption']['text'],
								link: this['link'],
								comments: this['comments']['count']
							});
						} else {
							alert('End of month found');
							return false;
						}
					});
					console.log('Images returned: ' + imageData.length);
					console.log('Images this Month: ' + instagramImages.length);
					addImagesToPage($instagramContainer, $instagramPagination, instagramImages);
				} else {
					$noInstagramImages.show();
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
		return x.valueOf();
	}

	getInstagramImages(defaultHash, 1);

});


