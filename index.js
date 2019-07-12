var fuse; 
var sessiondetails;
var masterOptions;
var daySearch = '';
var tagCollect = [];
var activeTags = [];

function matchCardTagsWithActiveTags(){
  $('.card:visible').each(function(){
    var thisCardTagsPre = $(this).attr('data-tags').split(',');
    var thisCardTags = thisCardTagsPre.map(function (x) {
      return x.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    });
    if(arraysAreEqual(activeTags,thisCardTags) || activeTags.length === 0){
      $(this).show();
    } else {
      $(this).hide();
    }
  });

  $('.js-cat-descrip').each(function(){
    let thisCatId = $(this).attr('id');
    if(arraysAreEqual(activeTags,thisCatId)){
      $(this).slideDown();
    } else {
      $(this).slideUp();
    }    
  });

  if($('.card:visible').length === 0){
    $('#noResults').show();
  } else {
    $('#noResults').css('display','none');
  }

}

$( window ).resize(function() {
  if($(window).width() < 768) {
     $('.form-check').addClass('form-check-inline'); 
    }
  else {
     $('.form-check').removeClass('form-check-inline'); 
  }
});

$(document).ready(function() {
  
    //add manual CSS to make borders the correct color
    $('.stages-check + label:before').css('border-color','#a05'); 
    //$('<style>.agenda-new-module h3{color: ' + $('#colorPrimary').css('color') + '!important;}</style>').appendTo( "head" );
    //$('<style>.agenda-new-module .color-primary{color: ' + $('#colorPrimary').css('color') + '!important;}</style>').appendTo( "head" ); 
    //$('<style>.agenda-new-module .custom-control-label::before{border-color: ' + $('#colorPrimary').css('color') + '!important;}</style>').appendTo( "head" );
    //$('<style>.agenda-new-module .custom-checkbox .custom-control-input:checked~.custom-control-label::before{background: ' + $('#colorPrimary').css('color') + '!important;}</style>').appendTo( "head" );
    $('<style>.agenda-new-module .btn-primary:nth-child(odd) {background:' + $("#colorDays").css('color') + '; border:none;}</style>').appendTo( "head" );
    $('<style>.agenda-new-module .btn-primary:nth-child(even) {background: ' + $("#colorDays").css('color') + '; border:none;}</style>').appendTo( "head" );
    $('<style>.agenda-new-module .btn-primary.active {background: ' + $("#colorDaysActive").css('color') + '!important; border:none;}</style>').appendTo( "head" );
 
    //console.log($(window).width());
    if($(window).width() < 768) {
     $('.form-check').addClass('form-check-inline'); 
    }

    //prepopulate the sessions array
    sessionDetails = []; 
    
    $('.card').each(function(index) {
      sessionDetails.push(
        {
          'key': $(this).attr('data-id'),
          'title':  $(this).attr('data-title'),
          'description': $(this).attr('data-short-description') + " " + $(this).attr('data-long-description'),
          'stage': $(this).attr('data-stage'),
          'day': $(this).attr('data-day'),
          'tags': $(this).attr('data-tags').split(','),
          'room': $(this).attr('data-room'),
          'speakers': $(this).attr('data-speakers')
        });

      // split tags and add to main tag store
      var splitArr = $(this).attr('data-tags').split(',');
      if($(this).attr('data-tags')) {
         tagCollect.push(splitArr);
      }

    });

    // turn tags into buttons on front
    (function(){

      // split mini arrays and add each item into main array
      var tagCollectFull = [].concat.apply([],tagCollect);
      var tagCollectFullish = workshopFirst(tagCollectFull);
      var tagCollectFuller = deleteDupe(tagCollectFullish);

      // strip duplicate tags for main tag store
      function deleteDupe(arr){
        let newArr = [];
        for(let i=0;i<arr.length;i++){
          if(newArr.indexOf(arr[i]) == -1) {
            newArr.push(arr[i]);
          }
        }
        return newArr;
      }

      // workshop first
      function workshopFirst(tag){
        let newArr = tag;
          if (newArr.indexOf('Workshop') > 0) {
              var index = newArr.indexOf('Workshop');
              newArr.splice(index,1);
              newArr.unshift('Workshop');
          }

        return newArr;
      }

      // turn tags into buttons for main tag store
      function populateTags(tag){
        let newArr = '';
        for(let i=0;i<tag.length;i++){
          let tagStripped = tag[i].toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
          newArr += '<button class="tag-button m-1" data-tag="' + tagStripped + '">' + tag[i] + '</button>';
        }
        return newArr;
      }

      // add highlighted tag button's tags to active tag storage
      function pushToActiveTags(tag){
        let tagMatchesStoredTag = 0;
        for(let i=0;i<activeTags.length;i++){
          if(activeTags[i] === tag) {
            tagMatchesStoredTag++;
          }
        }
        if(tagMatchesStoredTag === 0){
          activeTags.push(tag);
        }
        //console.log(activeTags);
      }

      function removeFromActiveTags(tag){
        for(let i=0;i<activeTags.length;i++){
          if(activeTags[i] === tag) {
            activeTags.splice(i,1);
          }
        }
        //console.log(activeTags);
      }
      
      

      // HTML populate main tag store with tag buttons
      $('#js-tagarea').html(populateTags(tagCollectFuller));

      // make tag buttons clickable
      $('.tag-button').on('click',function(){
        let tagIdTemp = $(this).text().toLowerCase();
        let tagId = tagIdTemp.replace(/[^a-zA-Z0-9]/g, '');
        //alert(tagId);
        if($(this).hasClass('tag-checked')) {
          $(this).removeClass('tag-checked');
          removeFromActiveTags($(this).attr('data-tag'));
          $('.tag-id-' + tagId).removeClass('tag-highlighted');
          //console.log('TAG HTML ID: ' + tagIdTemp);
          //console.log('TAG ID: ' + tagId);
        } else {
          $(this).addClass('tag-checked');
          pushToActiveTags($(this).attr('data-tag'));
          $('.tag-id-' + tagId).addClass('tag-highlighted');
          //console.log('TAG HTML ID: ' + tagIdTemp);
          //console.log('TAG ID: ' + tagId);
        }
        doSearch();
        matchCardTagsWithActiveTags();
      });

        var forceActiveTags = urlParameterArray;
        //console.log("ACTIVE TAGS: " + forceActiveTags);
        for(let i=0;i<forceActiveTags.length;i++){
          activeTags.push(forceActiveTags[i]);

          let tagIdTemp = forceActiveTags[i].toLowerCase();
          let tagId = tagIdTemp.replace(/[^a-zA-Z0-9]/g, '');

          // $('*[data-tag="' + forceActiveTags[i] + '"]');
          //console.log('.tag-button[data-tag=\"' + forceActiveTags[i] + '\"]');
          //$('div[data-tag="' + forceActiveTags[i] + '"]').hide();
                $('.tag-button[data-tag="' + forceActiveTags[i] + '"]').addClass('tag-checked');
                pushToActiveTags(forceActiveTags[i]);
                $('.tag-id-' + tagId).addClass('tag-highlighted');
                //console.log('TAG HTML ID: ' + tagIdTemp);
                //console.log('TAG ID: ' + tagId);
        }
      

    })();
    
    //set up FuseJS for search
    masterOptions = { 
      threshold: 0.2,
      location: 0,
      distance: 1000,
      tokenize: true, //should this be set??
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['title', 'description', 'tags', 'speakers', 'stage', 'room']
    } 
    fuse = new Fuse(sessionDetails, masterOptions) 
  
  $('#day1').click();
  
  $('#status').fadeOut(); // will first fade out the loading animation 
  $('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website. 
  $('body').delay(350).css({'overflow':'visible'});
  
  

});



$('#search').on('keyup', function() {
  
  var t = $(this);
  
  delay(function(){
    
        //console.log("Yummy input");
        if(t.val() == "") {
          if(daySearch) {
            doSearch(daySearch);
          } else {
            $('.card').css('display','block');
            //$('.card').show();
            //$('#noResults').css('display','none');
          }
        } else {

          doSearch();

        }
    
    
    }, 500 );
  
matchCardTagsWithActiveTags();

});

var arraysAreEqual = function(arr1,arr2) {
  for(let i=0;i<arr1.length;i++){
    if(arr2.includes(arr1[i])){
      return true;
    }
  }
}

function processSearchResults(result) {
    $('.card').css('display','none');
    if(result.length == 0) {
      $('#noResults').show();
    } else {
      $('#noResults').css('display','none');
      result.forEach(function(element) {
        $('#'+element.key).show();
    });
    } 
  matchCardTagsWithActiveTags();
}


$('.card').hover(function() {
  $(this).find('.card-border').addClass('card-selected');
}, function() {
  $(this).find('.card-border').removeClass('card-selected');
});



$('.card').click(function() { 
  var t = $(this);
  if(t.hasClass('no-expand')) {
    //do nothing
  } else {
    if(t.hasClass('active-card')) {
      t.find('.description-long-intro').show();
      t.find('.show-more').removeClass('rotated');
      t.find('.description-long').hide(); 
      t.removeClass('active-card');
      t.removeClass('selected');
    } else
    {
      clearCards();
      t.find('.description-long-intro').hide();
      t.find('.show-more').addClass('rotated');
      t.find('.description-long').show();   
      t.addClass('selected');
      t.addClass('active-card');
    }
  }
}).children('.speaker-link-a').click(function(e) {
  return false;
});

function clearCards() {
  $('.card .description-long').hide();
  $('.description-long-intro').show();
  $('.card .show-more').removeClass('rotated');
  $('.card').removeClass('selected');
  $('.card').removeClass('active-card');
  matchCardTagsWithActiveTags();
}

function showCards() {
  $('.card').show();
  $('#noResults').css('display','none');
  matchCardTagsWithActiveTags();
}

$('#filterClear').click(function() {
  clearSearch();
  matchCardTagsWithActiveTags();
});

function clearSearch() {
  $('#search').val('').trigger('change');
  var $boxes = $('.stages-active');
  $boxes.each(function() {
    $(this).prop('checked',false); 
  });
  
$('#daySelect').find('.active').removeClass('active');
  daySearch = '';
  showCards();
  matchCardTagsWithActiveTags();
}

$('.stages-check').click(function() {
  if($(this).hasClass('stages-active')){
    $(this).removeClass('stages-active');
  } else {
    $(this).addClass('stages-active');
  }
  var $boxes = $('.stages-active');
  //var $boxes = $('[data-stage="0"]');
  if($boxes.length > 0 ) {
    doSearch();
    matchCardTagsWithActiveTags();
  }
  else {
    if(daySearch) {
      doSearch();
      matchCardTagsWithActiveTags();
    } else {
     clearSearch();
     matchCardTagsWithActiveTags();
    }
  }
});

 
 
$('#daySelect input[type=radio]').on('change', function() {
  if($(this).parent().hasClass('active')) { //this doesn't actually do anything right now, because 'change' doesn't fire without an actual value change
    //console.log("Removing active day..."); 
     $(this).parent().removeClass('active');
     doSearch();
     matchCardTagsWithActiveTags();
    } else {
      console.log('Manual day select: ' + this.id);
      daySearch = this.id;
      doSearch(this.id);
      matchCardTagsWithActiveTags();
    }
});


function doSearch(day) { 
  
  day = day || 0;
  if(daySearch) {
    day = daySearch;
  }
  
var stageOptions = {
    keys: ['stage'],
    includeScore: true,
    threshold:0.0,
    location:0,
    distance: 0
}
   
var dayOptions = {
    keys: ['day'],
    threshold:0.0
}

var tagOptions = {
keys: ['tags'],
threshold: 0.0
}

var result = [];


//if day is filtered
if(day) {
    var fuseDay = new Fuse(sessionDetails, dayOptions);
    var dayResult = fuseDay.search(day);
    result = dayResult;

    daySearch = day;  
}

//if stage is filtered
var $boxes = $('.stages-active');


if($boxes.length > 0) {
var stageTemp = [];
    $boxes.each(function() {
        if(day) {
            fuseStage = new Fuse(result, stageOptions); 
            console.log("Searching for... " + $(this).attr('id')); 
            var temp = fuseStage.search($(this).attr('id'));
        /* establish what stage 'id' is for cards without stages */ 
        var tempNoStage = fuseStage.search('0');
            temp2 = [];
            temp.forEach(function (record) {
                if (record.score == 0) {
                temp2.push(record.item);
                }
            });
        /* add the non-stages to the listing function */
       tempNoStage.forEach(function (record) {
                if (record.score == 0) {
                temp2.push(record.item);
                }
            });
        console.log(temp2);
        stageTemp = stageTemp.concat(temp2); 
        } else {
        fuseStage = new Fuse(sessionDetails, stageOptions); 
            var temp = fuseStage.search($(this).attr('id'));
            temp2 = [];
            temp.forEach(function (record) {
                if (record.score == 0) {
                temp2.push(record.item);
                }
            })
        stageTemp = stageTemp.concat(temp2); 
        }
    }); 
    result = stageTemp;
    } 
    if($('#search').val().length > 0) {
    if(result.length < 1) {
        result = sessionDetails;
    }
    var fuseSearch = new Fuse(result, masterOptions);
    result = fuseSearch.search($('#search').val());

    }

    processSearchResults(result);
    matchCardTagsWithActiveTags();
          

}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

// URL query string parameter puller 

function getAllUrlParams(url) {
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  var obj = {};
  if (queryString) {
    queryString = queryString.split('#')[0];
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      var a = arr[i].split('=');
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
      if (paramName.match(/\[(\d+)?\]$/)) {
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];
        if (paramName.match(/\[\d+\]$/)) {
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          obj[key].push(paramValue);
        }
      } else {
        if (!obj[paramName]) {
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          obj[paramName].push(paramValue);
        }
      }
    }
  }
  return obj;
}
var urlParameterArray = [];
if(getAllUrlParams().tag1){
  urlParameterArray.push(getAllUrlParams().tag1);
};
if(getAllUrlParams().tag2){
  urlParameterArray.push(getAllUrlParams().tag2);
};
if(getAllUrlParams().tag3){
  urlParameterArray.push(getAllUrlParams().tag3);
};
if(getAllUrlParams().tag4){
  urlParameterArray.push(getAllUrlParams().tag4);
};
if(getAllUrlParams().tag5){
  urlParameterArray.push(getAllUrlParams().tag5);
};
if(getAllUrlParams().tag6){
  urlParameterArray.push(getAllUrlParams().tag6);
};
if(getAllUrlParams().tag7){
  urlParameterArray.push(getAllUrlParams().tag7);
};
if(getAllUrlParams().tag8){
  urlParameterArray.push(getAllUrlParams().tag8);
};
/*
if(getAllUrlParams().searchtitle && getAllUrlParams().searchday){
  console.log('this is working!!');
  var title = getAllUrlParams().searchtitle;
  var urlDay = 'day' + getAllUrlParams().searchday;
  console.log(urlDay);
  doSearch(urlDay);
};
*/
// Order sessions by time and highlight sessions wth '0' as stage
$(document).ready(function(){
  $('.card-container .card').sort(function(a,b){
    return a.dataset.time - b.dataset.time;
  }).appendTo('.card-container');
  /* HIGHLIGHT CARDS WITHOUT TRACKS */
  $('[data-stage="0"]').addClass('highlighted--crosstrack');

  if(getAllUrlParams().searchtitle && getAllUrlParams().searchday){
    var urlTitle = 'Card' + getAllUrlParams().searchtitle;
    var urlDay = 'day' + getAllUrlParams().searchday;
    console.log('URL day select: ' + urlDay);
    daySearch = urlDay;
    doSearch(daySearch);
    $('#daySelect').find('.active').removeClass('active');
    $('#' + urlDay).parent().addClass('active');
    $('#' + urlTitle).addClass('selected active-card');
    $('#' + urlTitle).find('.description-long-intro').hide();
    $('#' + urlTitle).find('.show-more').addClass('rotated');
    $('#' + urlTitle).find('.description-long').show(); 
    $([document.documentElement, document.body]).animate({
      scrollTop: $('#' + urlTitle).offset().top - 85
    }, 0);
  };

});
