import FilterView from "../view/filter.js";
import SortingView from "../view/sorting.js";
import FilmsContainerView from "../view/films-container.js";
import NoFilmView from "../view/no-film";
import LoadMoreButtonView from "../view/button-load-more.js";
import FilmPresenter from "./film.js";
import {remove, render} from "../utils/render.js";
import {RenderPosition, TOTAL_FILMS} from "../const.js";

const MOVIES_PER_STEP = 5;
const MAX_ADDITIONAL_FILMS = 2;

export default class PageMainContent {
  constructor(bodyContainer) {
    this._films = null;
    this._filterData = null;
    this._bodyContainer = bodyContainer;
    this._mainContainer = bodyContainer.querySelector(`.main`);
    this._filmList = null;
    this._filmsContainer = null;
    this._filmListExtra = null;
    this._renderedFilmCount = MOVIES_PER_STEP;
    this._filmPresenter = {};

    this._sortingView = new SortingView();
    this._filmsContainerView = new FilmsContainerView();
    this._noFilmView = new NoFilmView();
    this._loadMoreButtonView = new LoadMoreButtonView();

    this._handleFilmChange = this._handleFilmChange.bind(this);
  }

  init(films, filterData) {
    this._films = films;
    this._filterData = filterData;

    this._renderFilter();

    if (!this._films.length) {
      this._renderNoFilms();
      return;
    }

    this._renderSorting();
    this._renderFilmsContainer();
    this._filmList = this._mainContainer.querySelector(`.films-list`);
    this._filmsContainer = this._filmList.querySelector(`.films-list__container`);
    this._filmListExtra = this._mainContainer.querySelectorAll(`.films-list.films-list--extra`);
    this._renderFilmsList();

    if (TOTAL_FILMS > MOVIES_PER_STEP) {
      this._renderLoadMoreButton();
    }

    this._renderTopRatedFilms();
    this._renderMostCommentedFilms();
  }

  _renderFilter() {
    render(this._mainContainer, new FilterView(this._filterData).element, RenderPosition.BEFORE_END);
  }

  _renderSorting() {
    render(this._mainContainer, this._sortingView.element, RenderPosition.BEFORE_END);
  }

  _renderFilmsContainer() {
    render(this._mainContainer, this._filmsContainerView.element, RenderPosition.BEFORE_END);
  }

  _renderNoFilms() {
    render(this._mainContainer, this._noFilmView.element, RenderPosition.BEFORE_END);
  }

  _renderFilmsList(container = this._filmsContainer, filmsList = this._films, limit = MOVIES_PER_STEP) {
    for (let i = 0; i < Math.min(filmsList.length, limit); i++) {
      this._renderFilm(container, filmsList[i]);
    }
  }

  _renderFilm(container, film) {
    const filmPresenter = new FilmPresenter(container, this._bodyContainer, this._handleFilmChange);
    filmPresenter.init(film);
    this._filmPresenter[film.id] = filmPresenter;
  }

  _renderTopRatedFilms() {
    const topRatedFilmsContainer = this._filmListExtra[0].querySelector(`.films-list__container`);
    const topRatedFilms = [...this._films];

    topRatedFilms.sort((a, b) => b.rating - a.rating);

    this._renderFilmsList(topRatedFilmsContainer, topRatedFilms, MAX_ADDITIONAL_FILMS);
  }

  _renderMostCommentedFilms() {
    const mostCommentedFilmsContainer = this._filmListExtra[1].querySelector(`.films-list__container`);
    const mostCommentedFilms = [...this._films];

    mostCommentedFilms.sort((a, b) => b.comments.length - a.comments.length);

    this._renderFilmsList(mostCommentedFilmsContainer, mostCommentedFilms, MAX_ADDITIONAL_FILMS);
  }

  _clearFilmList() {
    Object
      .values(this._filmPresenter)
      .forEach((filmPresenter) => filmPresenter.destroy());
    this._filmPresenter = {};
    this._renderedFilmCount = MOVIES_PER_STEP;
    remove(this._loadMoreButtonView);
  }

  _updateFilm(items, updatedFilm) {
    const index = items.findIndex((item) => item.id === updatedFilm.id);

    if (index === -1) {
      return items;
    }

    return [
      ...items.slice(0, index),
      updatedFilm,
      ...items.slice(index + 1)
    ];
  }

  _handleFilmChange(updateFilm) {
    this._films = this._updateFilm(this._films, updateFilm);
    this._filmPresenter[updateFilm.id].init(updateFilm);
  }

  _renderLoadMoreButton() {
    const showMoreFilm = () => {
      this._films
        .slice(this._renderedFilmCount, this._renderedFilmCount + MOVIES_PER_STEP)
        .forEach((film) => {
          this._renderFilm(this._filmsContainer, film);
        });

      this._renderedFilmCount += MOVIES_PER_STEP;

      if (this._renderedFilmCount >= this._films.length) {
        this._loadMoreButtonView.removeLoadMoreButtonHandler(onMoreFilmShow);
        remove(this._loadMoreButtonView);
      }
    };

    const onMoreFilmShow = () => {
      showMoreFilm();
    };

    render(this._filmList, this._loadMoreButtonView.element, RenderPosition.BEFORE_END);
    this._loadMoreButtonView.setLoadMoreButtonHandler(onMoreFilmShow);
  }
}
