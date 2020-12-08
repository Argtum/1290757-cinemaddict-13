import Profile from "./view/profile.js";
import Filter from "./view/filter.js";
import Sorting from "./view/sorting.js";
import FilmsList from "./view/films-list.js";
import Film from "./view/film.js";
import LoadMoreButton from "./view/button-load-more.js";
import Popup from "./view/popup.js";
import FooterStatistics from "./view/footer-statistics.js";
import NoFilm from "./view/no-film";
import {generateFilm} from "./mock/film.js";
import {generateStats} from "./mock/stats.js";
import {generateFilterData} from "./mock/filter.js";
import {render, remove} from "./utils/render.js";
import {RenderPosition} from "./const.js";

const MOVIES_PER_STEP = 5;
const TOTAL_FILMS = 31;
const MAX_ADDITIONAL_FILMS = 2;

let renderedTaskCount = MOVIES_PER_STEP;
let popupElement;

const loadMoreButtonElement = new LoadMoreButton();

const body = document.querySelector(`body`);
const header = body.querySelector(`.header`);
const main = body.querySelector(`.main`);
const footerStatistics = body.querySelector(`.footer__statistics`);
const films = new Array(TOTAL_FILMS).fill().map(generateFilm);
const stats = generateStats(films);
const filterData = generateFilterData(films);

const renderFilm = (container, filmData) => {
  const filmElement = new Film(filmData);

  render(container, filmElement.element, RenderPosition.BEFORE_END);
  filmElement.setFilmHandler(onDetailFilmShow);
};

const renderFilmsBlock = (container, filmsList, limit) => {
  for (let i = 0; i < Math.min(filmsList.length, limit); i++) {
    renderFilm(container, filmsList[i]);
  }
};

const showMoreFilm = () => {
  films
    .slice(renderedTaskCount, renderedTaskCount + MOVIES_PER_STEP)
    .forEach((film) => {
      renderFilm(filmsContainer, film);
    });

  renderedTaskCount += MOVIES_PER_STEP;

  if (renderedTaskCount >= films.length) {
    loadMoreButtonElement.removeLoadMoreButtonHandler(onMoreFilmShow);
    remove(loadMoreButtonElement);
  }
};

const onMoreFilmShow = () => {
  showMoreFilm();
};

const popupClose = () => {
  const filmDetails = body.querySelector(`.film-details`);

  popupElement.removePopupHandler(onPopupClose);
  body.removeChild(filmDetails);
  body.classList.remove(`hide-overflow`);
  popupElement.removeElement();
};

const onPopupClose = () => {
  popupClose();
};

const getDetailData = (evt) => films.filter((film) => film.id === Number(evt.target.parentElement.id))[0];

const showDetailFilm = (evt) => {
  popupElement = new Popup(getDetailData(evt, body));

  render(body, popupElement.element, RenderPosition.BEFORE_END);
  popupElement.setPopupHandler(onPopupClose);
  body.classList.add(`hide-overflow`);
};

const onDetailFilmShow = (evt) => {
  showDetailFilm(evt);
};


render(header, new Profile(stats).element, RenderPosition.BEFORE_END);
render(main, new Filter(filterData).element, RenderPosition.BEFORE_END);

if (films.length) {
  render(main, new Sorting().element, RenderPosition.BEFORE_END);
  render(main, new FilmsList().element, RenderPosition.BEFORE_END);
} else {
  render(main, new NoFilm().element, RenderPosition.BEFORE_END);
}

render(footerStatistics, new FooterStatistics(TOTAL_FILMS).element, RenderPosition.BEFORE_END);

const filmList = main.querySelector(`.films-list`);
const filmsContainer = filmList.querySelector(`.films-list__container`);
const filmListExtra = main.querySelectorAll(`.films-list.films-list--extra`);

renderFilmsBlock(filmsContainer, films, MOVIES_PER_STEP);

if (TOTAL_FILMS > MOVIES_PER_STEP) {
  render(filmList, loadMoreButtonElement.element, RenderPosition.BEFORE_END);
  loadMoreButtonElement.setLoadMoreButtonHandler(onMoreFilmShow);
}

if (filmListExtra[0]) {
  const topRatedFilmsContainer = filmListExtra[0].querySelector(`.films-list__container`);
  const topRatedFilms = [...films];

  topRatedFilms.sort((a, b) => b.rating - a.rating);

  renderFilmsBlock(topRatedFilmsContainer, topRatedFilms, MAX_ADDITIONAL_FILMS);
}

if (filmListExtra[1]) {
  const mostCommentedFilmsContainer = filmListExtra[1].querySelector(`.films-list__container`);
  const mostCommentedFilms = [...films];

  mostCommentedFilms.sort((a, b) => b.comments.length - a.comments.length);

  renderFilmsBlock(mostCommentedFilmsContainer, mostCommentedFilms, MAX_ADDITIONAL_FILMS);
}
