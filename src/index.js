import './sass/main.scss';
import getPhoto from './js/getPhoto';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const ref = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  load: document.querySelector('.load-more'),
  cardLink: document.querySelector('.gallery__link'),
  body: document.querySelector('body'),
};
let page = 1;
let value = null;
const per_page = 40;

ref.form.addEventListener('submit', onSearch);
// ref.load.addEventListener('click', onLoad);
window.addEventListener('scroll', throttle(onInfinityScroll, 500));

async function onSearch(e) {
  e.preventDefault();
  value = e.currentTarget.searchQuery.value;
  page = 1;
  const res = await await getPhoto(value, page, per_page);
  const picturesArr = res.data.hits;
  const totalHits = res.data.totalHits;

  if (picturesArr.length > 0) {
    ref.load.classList.remove('visually-hidden');
    Notify.success(`Hooray! We found ${totalHits} images.`);
  } else {
    ref.load.classList.add('visually-hidden');
    Notify.failure('"Sorry, there are no images matching your search query. Please try again."');
  }

  const allMarkup = picturesArr.map(createMarkup).join('');

  ref.gallery.innerHTML = '';
  ref.gallery.insertAdjacentHTML('beforeend', allMarkup);
  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}

async function onLoad() {
  page += 1;
  const res = await getPhoto(value, page, per_page);
  const picturesArr = res.data.hits;
  const sumPages = page * 40;

  if (res.data.totalHits <= sumPages) {
    Notify.failure("We're sorry, but you've reached the end of search results.");
    ref.load.classList.add('visually-hidden');
    return;
  }
  const allMarkup = picturesArr.map(createMarkup).join('');

  ref.gallery.insertAdjacentHTML('beforeend', allMarkup);
  lazyScroll();
  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}

function createMarkup(photo) {
  const webFormatURL = photo.webformatURL;
  const largeImageURL = photo.largeImageURL;
  const tags = photo.tags;
  const likes = photo.likes;
  const views = photo.views;
  const comments = photo.comments;
  const downloads = photo.downloads;
  const cartMarkup = `<li class="photo-card">
          <a class='gallery__link' href="${largeImageURL}">
            <img class="gallery__img" src="${webFormatURL}" alt="${tags}" loading="lazy" />
            </a>
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                <span class="info-item__value">${likes}</span>
              </p>
              <p class="info-item"><b>Views</b><span class="info-item__value">${views}</span></p>
              <p class="info-item"><b>Comments</b><span class="info-item__value">${comments}</span></p>
              <p class="info-item"><b>Downloads</b><span class="info-item__value">${downloads}</span></p>
            </div>
          </li>`;
  return cartMarkup;
}

function lazyScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onInfinityScroll() {
  const documentRect = ref.body.getBoundingClientRect();
  console.log(documentRect);
  if (documentRect.bottom < document.documentElement.clientHeight + 20) {
    console.log('load');
    onLoad();
  }
}
