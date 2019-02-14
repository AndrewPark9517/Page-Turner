const googleBooksBaseURL = 'https://www.googleapis.com/books/v1/volumes';
const iDreamBooksBaseURL = 'https://idreambooks.com/api/books/reviews.json';
const iDreamBooksFeaturedURL = 'https://idreambooks.com/api/publications/recent_recos.json'
const googleKey = 'AIzaSyCf10M7NQ3hEvwUNu-4O4gxUwQFCyPAah0';
const iDreamBooksKey = 'cdea63065cace2724489b736b7714ddf78e909f1';
// number of books to return per fetch call
const maxResults = 20;
// start index to display books amongst the array of books returned by google api
let startIndex = 0;
// length of array returned by google books for search, arbitrarily set to 100
let bookArrayLimit = 100;
/* need an array to hold the book ID's due to the google api not returning
 * the same JSON file (for general volumes search) even with the same query. */
let bookIdList = [];


// form query string (which will be added to google base url) for initial volumes search
function getQueryString(params = {}) {
  const queryString = Object.keys(params).map(keys => {
    return `${encodeURIComponent(keys)}=${encodeURIComponent(params[keys])}`;
  })

  return queryString.join('&');
}


function displayBooksList(googleBooksJson = {}) {
  $('.book-choice-list').empty();
  $('.js-error-message').empty();

  for(let i = 0 ;i < googleBooksJson.items.length;i++) {
    // if thumbnail is available from API
    if (googleBooksJson.items[i].volumeInfo.imageLinks) {
      $('.book-choice-list').append(`
      <li data-book-index=${i} class = 'book-list-item'>
      <img class = 'book-list-item-thumbnail' 
      src = ${googleBooksJson.items[i].volumeInfo.imageLinks.smallThumbnail} alt = 'book image'>
      <h4>${googleBooksJson.items[i].volumeInfo.title}</h4></li>`);
    }

    // if thumbnail is not available, provide 'not availalbe' image
    else {
      $('.book-choice-list').append(`
      <li data-book-index=${i} class = 'book-list-item'>
      <img class = 'book-list-item-notavail' src = 'img/imgNotAvail.jpg' 
      alt = 'book image'>
      <h4>${googleBooksJson.items[i].volumeInfo.title}</h4></li>`);
    }
  }
}

// function to handle prev button in book list display
function handleListPrev() {
  $('.js-prev-button').click(event => {
    if(startIndex - maxResults >= 0) {
      startIndex -= maxResults; 
    }

    else {
      startIndex = 0;
    }

    const userSearchTitle = $('.initial-search-title').val();
    const params = {
      q: userSearchTitle,
      printType: 'books',
      key: googleKey,
      'maxResults': maxResults,
      'startIndex': startIndex
  };

    getBooksList(params);
  });
}

// function to handle more button in book list display
function handleListMore() {
  $('.js-next-button').click(event => {
    if(startIndex + maxResults <= bookArrayLimit) {
      startIndex += maxResults; 
    }

    else {
      startIndex = startIndex;
    }

    const userSearchTitle = $('.initial-search-title').val();
    const params = {
      q: userSearchTitle,
      printType: 'books',
      key: googleKey,
      'maxResults': maxResults,
      'startIndex': startIndex
  };

    getBooksList(params);
  });
}

function toggleNextButton (googleBooksJson = {}) {
  if(bookArrayLimit > startIndex + maxResults) {
      $('.js-next-button').show();
    }

  else $('.js-next-button').hide();
  // ideally the above code would be enough to determine when tohide the next button but the google api is not consistent
  if(googleBooksJson.items.length < maxResults) {
      $('.js-next-button').hide();
    }
}

function togglePrevButton () {
  if (startIndex == 0 || startIndex - maxResults < 0) {
    $('.js-prev-button').hide()
  }

  else {
    $('.js-prev-button').show();
  }

}

// for instantaneous scroll from next/prev button to top 
$('a').click(function() {
     window.scrollTo(0,0);
});

// for smooth scroll when a book is chosen to view
$('.book-choice-list').on('click', '.book-list-item', function() {
     $('html, body').animate( { scrollTop: 0 }, 'medium');
     return false;
});

// function to fill bookIdList
function fillBookIdList(googleBooksJson = {}) {
  bookIdList.length = 0;
  for(let i = 0;i < googleBooksJson.items.length;i++) {
    bookIdList.push(googleBooksJson.items[i].id);
  }
}

// fetches json response from google books API and calls displayBooksList function
function getBooksList(params = {}) {
  const queryString = getQueryString(params);
  const googleSearchURL = googleBooksBaseURL + '?' + queryString;
  $('.js-choose-book-section').show();

  fetch(googleSearchURL)
    .then(googleBooks => {
      if(googleBooks.ok) {
        return googleBooks.json();
      }

      throw new Error(googleBooks.statusText);
      })
    .then(googleBooksJson => {
      emptyBookOverview ();
      bookArrayLimit = googleBooksJson.totalItems;
      displayBooksList(googleBooksJson);
      fillBookIdList(googleBooksJson);
      toggleNextButton(googleBooksJson);
      togglePrevButton();
      $('.page-controls').show();
    })
    .catch(err => {
      $('.js-next-button').hide();
      $('.js-prev-button').hide();
      $('.js-choose-book-section').hide();
      $('.js-book-overview').hide();
      $('.page-controls').hide();
      $('.js-error-message').css('display','block');
      $('.js-error-message').empty();
      $('.js-error-message').append(`No Results Found: Please try again</p>`);
    });
  }

// watch for search input and call getBooksList to display search results
  function watchSearchForm() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    $('.welcome').css('display','none');
    $('.instruction').css('display','none');
    //to reset the startIndex value each time a new search is made
    startIndex = 0;
    $('.js-book-overview').hide();
    const userSearchTitle = $('.initial-search-title').val();
    const params = {
      q: userSearchTitle,
      printType: 'books',
      key: googleKey,
      'maxResults': maxResults,
      'startIndex': startIndex
    };

    getBooksList(params);

  });
}

function emptyBookOverview() {
  $('.js-book-overview').hide();
  $('.js-book-cover').empty();
  $('.book-description').empty();
  $('.book-caption').empty();
  $('.reader-rating').empty();
  $('.critic-rating').empty();
  $('.critic-review-section').empty();
  $('.js-error-message').css('display','none');
  $('.critic-review-section').css('display','none');
}

function displayBookCover(googleBooksJson = {}) {
  $('.js-book-cover').append(`<img src ='' class = 'book-cover' 
  alt = 'Cover of Chosen Book'><figcaption class = 'book-caption'></figcaption>`);
  if(googleBooksJson.volumeInfo.imageLinks) {
    const coverURL = googleBooksJson.volumeInfo.imageLinks.thumbnail;
    $('.book-cover').attr('src', coverURL); 
  }

  else {
    $('.book-cover').attr('src', 'img/imgNotAvail.jpg');
  }
}

function displayBookDesc(googleBooksJson = {}) {
  $('.book-description').prepend(`<h4>Synopsis</h4>`)
  if(googleBooksJson.volumeInfo.description) {
    const bookDesc = googleBooksJson.volumeInfo.description;
    $('.book-description').append(bookDesc);
  }

  else {
    $('.book-description').append(`<i>Summary not available<i>`);
  }
}

function displayBookCaption(googleBooksJson = {}) {
  if (googleBooksJson.volumeInfo.authors) {
    const authors = googleBooksJson.volumeInfo.authors.join(' & ');
    $('.book-caption').append(`<p>Author(s): ${authors}</p>`);
  } 

  else {
    $('.book-caption').append(`<p>Author(s): <i>Not Available</i></p>`);
  }

  if (googleBooksJson.volumeInfo.publishedDate) {
     const pubDate = googleBooksJson.volumeInfo.publishedDate;
     $('.book-caption').append(`<p>Published Date: ${pubDate}</p>`);
  }

  else {
    $('.book-caption').append(`<p>Published Date: <i>Not Available</i></p>`);
  }  
}

// displays rating/5.0 from readers
function displayReaderScore(googleBooksJson = {}) {
  $('.reader-rating').prepend(`<h3>Reader Rating</h3><p class = 'reader-score'> </p>`);
  if (googleBooksJson.volumeInfo.averageRating) {
    const readerScore = (googleBooksJson.volumeInfo.averageRating).toFixed(1);
    $('.reader-score').append(`${readerScore}/5.0`);
    const ratingsCount = googleBooksJson.volumeInfo.ratingsCount;
    $('.reader-rating').append(`<span class = 'ratings-count'>${ratingsCount} reviews</span>`);
  }

  else {
    $('.reader-score').append(`<i>No Ratings</i>`);
  }
}

// calls iDreamBooks API for critic review/rating JSON file
function getCriticResponse(googleBooksJson = {}) {
  const bookTitle = googleBooksJson.volumeInfo.title;
  const params = {
    q: bookTitle,
    key: iDreamBooksKey
  };
  let rating = 0;
  let ratingsCount = 0;

  const queryString = getQueryString(params);
  const iDreamBooksSearchURL = iDreamBooksBaseURL + '?' + queryString;

  fetch(iDreamBooksSearchURL)
  .then(iDreamBooks => {
    if(iDreamBooks.ok) {
      return iDreamBooks.json();
    }

    throw new Error(iDreamBooks.statusText);
  })
  .then(iDreamBooksJson => {
    rating = (iDreamBooksJson.book.rating||0);
    ratingsCount = (iDreamBooksJson.book.review_count||0);
    displayCriticScore(rating, ratingsCount);
    displayCriticReview(iDreamBooksJson);
  })
  .catch(error => {
    $('.js-error-message').append(`<p>There seems to have been an error: Please try again</p>`);
  }); 
}

// displays the rating/5.0 for given book (from critics)
function displayCriticScore(rating = 0, ratingsCount = 0) {
  $('.critic-rating').prepend(`<h3>Critic Rating</h3><p class = 'critic-score'>`);
  if(rating > 0) {
    let ratingOfFive = (rating/20).toFixed(1); 
    $('.critic-score').append(`${ratingOfFive}/5.0`);
  }

  else {
    $('.critic-score').append(`<i>No Ratings</i>`);
  }

  if(ratingsCount > 0) {
    $('.critic-rating').append(`<span class = 'ratings-count'>${ratingsCount} reviews</span>`);
  }
}

function displayCriticReview(iDreamBooksJson = {}) {
  /* double condition since the critic_reviews key seems to exist even if there are no reviews. 
   * However, in case there are some books with no critic_reviews key, 
   * I'm adding the first condition to check if it exists first*/
  if (
    iDreamBooksJson.book.critic_reviews 
    && iDreamBooksJson.book.critic_reviews.length != 0) {
    $('.critic-review-section').css('display','block');
    $('.critic-review-section').prepend(`<h3>Reviews</h3>`);

    for(let i = 0;i < iDreamBooksJson.book.critic_reviews.length;i++) {
      $('.critic-review-section').append(`
      <article class = 'critic-review'>\u201C${iDreamBooksJson.book.critic_reviews[i].snippet}\u201D<br>
      <i><span class = 'critic-review-source'>-${iDreamBooksJson.book.critic_reviews[i].source}</span></i>
      </article>`);
    }
  }
}

// displays summary/review of chosen book from list
function displayBookOverview() {
  $('.js-book-overview').hide();
  $('.js-choose-book-section').hide();

  $('.book-choice-list').on('click', '.book-list-item', event => {
  const bookIndex  = parseInt($(event.currentTarget).attr('data-book-index'));
  
  const params = {
    key: googleKey,
  };

  const queryString = getQueryString(params);
  const googleSearchURL = googleBooksBaseURL + `/${bookIdList[bookIndex]}` + '?' + queryString;


  fetch(googleSearchURL)
    .then(googleBooks => {
      if(googleBooks.ok) {
        return googleBooks.json();
      }
      throw new Error(googleBooks.statusText);
      })
    .then(googleBooksJson => {
      emptyBookOverview ();
      displayBookCover(googleBooksJson);
      displayBookDesc(googleBooksJson);
      displayBookCaption(googleBooksJson);
      displayReaderScore(googleBooksJson);
      getCriticResponse (googleBooksJson);
      $('.js-book-overview').show(300);
    })
    .catch(err => {
      $('.js-error-message').append(`<p>There was an Error, Please try again</p>`);
    });
  })
}

function welcome() {
  $('.instruction').hide();
  $('.welcome').fadeIn(1000, function() {
    $('.instruction').fadeIn(1000);
  });
}

// this will restart the app
function restartPage() {
  $('body').on('click', '.restartButton', function (event) {
    location.reload();
  });
  
  $('body').on('click', '.favicon', function(event) {
    location.reload();
  });
}

function createApp() {
  welcome();
  displayBookOverview();
  handleListMore();
  handleListPrev();
  watchSearchForm();
  restartPage();
}

$(createApp);






