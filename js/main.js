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
		instagramSection,
		flickrSection;

	function ImageSection(init) {
		this.nickname = init.nickname;
		this.container = init.container;
		this.pagination = init.pagination;
		this.noImages = init.noImages;
		this.foundImages = [];
		this.apiVariables = (init.apiVariables)? init.apiVariables : {};
		this.paginationFunction = function(){
			$imagesInSection = this.container.find('.' + addedImageClass);
			$imagesInSection.slice(numberPerPage).hide();
			this.pagination.pagination({
		        items: this.foundImages.length,
		        itemsOnPage: numberPerPage,
		        imageSection: this.container,
		        hrefTextSuffix: '-' + this.nickname,
		        onPageClick: function(pageNumber) {
		            // someone changed page
		            var showFrom = numberPerPage * (pageNumber - 1);
		            var showTo = showFrom + numberPerPage;

		            this.imageSection.find('.' + addedImageClass).hide() // hide everything
		                 .slice(showFrom, showTo).show(); // show for the new page
		        }
		    }).show();
		};
	}

	instagramSection = new ImageSection({
						nickname: 'instagram',
						container: $('#instagram-images'), 
						pagination: $('#instagram-pagination'), 
						noImages: $('#no-instagram-images-found'),
						apiVariables: {
							clientID: 'e9561311b628484a80a738312c222079',
							url: 'https://api.instagram.com/v1/tags/',
							url2: '/media/recent',
						}
					});

	flickrSection = new ImageSection({
						nickname: 'flickr',
						container: $('#flickr-images'), 
						pagination: $('#flickr-pagination'), 
						noImages: $('#no-flickr-images-found'),
						apiVariables: {
							apiKey: '09b00df87e724b1d22f65aeb00f136e8',
							url: 'https://api.flickr.com/services/rest/',
							imageMethod: 'flickr.photos.search'
						}
					});

	function getAllImages(hash){
		instagramSection.foundImages = [];
		flickrSection.foundImages = [];
		getInstagramImages(hash, null);
		getFlickrImages(hash);
	}

	function getInstagramImages(hash, max_tag_id){
		instagramSection.container.addClass('loading');
		apiVars = instagramSection.apiVariables;
		$.ajax({
			url: apiVars.url + hash + apiVars.url2,
			method: 'get',
			dataType: 'jsonp', // added to fix cors issue
			crossDomain: true, // added to fix cors issue
			data: {
				client_id: apiVars.clientID,
				count: 20, //numberPerPage,
				max_tag_id: max_tag_id
			},
			success: function(data){
				var thisMonth = true;
				var imageData = data.data;
				instagramSection.container.find('.'+addedImageClass).remove();
				if(imageData.length > 0){
					instagramSection.noImages.hide();
					$.each(imageData, function(){
						if(this['created_time'] >= oneMonthAgo && instagramSection.foundImages.length < searchCap) {
							instagramSection.foundImages.push({
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
						instagramSection.container.removeClass('loading');
						console.log('Instagram Images Found for #' + hash + ': ' + instagramSection.foundImages.length);
						addImagesToPage(instagramSection);
					}
				} else {
					instagramSection.container.removeClass('loading');
					instagramSection.pagination.hide();
					instagramSection.noImages.show();
				}
			}
		});
	}

	function getFlickrImages(hash){
		flickrSection.container.addClass('loading');
		apiVars = flickrSection.apiVariables;
		$.ajax({
			url: apiVars.url,
			method: 'get',
			dataType: 'xml',
			data: {
				method: apiVars.imageMethod,
				api_key: apiVars.apiKey,
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
				flickrSection.container.find('.'+addedImageClass).remove();
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

						flickrSection.foundImages.push({
							url: imageURL, //getFlickrImage(farmID, serverID, imageID, secretID),
							caption: imageTitle,
							link: getFlickrLink(userID, imageID),
							comments: numberOfComments
						});
					});
					flickrSection.noImages.hide();
					flickrSection.container.removeClass('loading');
					addImagesToPage(flickrSection);
				} else {
					flickrSection.container.removeClass('loading');
					flickrSection.pagination.hide()
					flickrSection.noImages.show();
				}
			}
		});
	}

	function getFlickrLink(userID, imageID){
		return 'https://www.flickr.com/photos/' +
			userID + '/' + imageID;
	}

	function addImagesToPage(sectionObject){
		sectionObject.foundImages.sort(sortByComments);
		$.each(sectionObject.foundImages, function(){
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
			sectionObject.container.append($thisImageBlock);
		});
		// initialize pagination
		sectionObject.paginationFunction();
		/*$imagesInSection = $sectionContainer.find('.' + addedImageClass);
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
	    }).show();*/
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


