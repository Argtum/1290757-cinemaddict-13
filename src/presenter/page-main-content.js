import SortingView from "../view/sorting.js";
import FilmsContainerView from "../view/films-container.js";
import NoFilmView from "../view/no-film";
import LoadingView from "../view/loading.js";
import LoadMoreButtonView from "../view/button-load-more.js";
import StatisticsView from "../view/stats.js";
import FilmPresenter from "./film.js";
import {remove, render} from "../utils/render.js";
import {RenderPosition, SortType, UpdateType, UserAction, FilterType} from "../const.js";
import {sortFilmByDate, sortFilmByRating} from "../utils/film.js";
import {filter} from "../utils/filter.js";

const MOVIES_PER_STEP = 5;
const MAX_ADDITIONAL_FILMS = 2;
const FilmCategory = {
  COMMON: `common`,
  TOP_RATED: `topRated`,
  MOST_COMMENTED: `mostCommented`
};

export default class PageMainContent {
  constructor(bodyContainer, mainContainer, filmsModel, filterModel, api) {
    this._filmsModel = filmsModel;
    this._filterModel = filterModel;
    this._bodyContainer = bodyContainer;
    this._mainContainer = mainContainer;
    this._filmList = null;
    this._filmsContainer = null;
    this._filmListExtra = null;
    this._renderedFilmCount = MOVIES_PER_STEP;
    this._filmPresenter = new Map();
    this._setTypesForFilmPresenterCollection();
    this._currentSortType = SortType.DEFAULT;
    this._isLoading = true;
    this._api = api;

    this._sortingView = null;
    this._loadMoreButtonView = null;
    this._statisticsView = null;
    this._filmsContainerView = new FilmsContainerView();
    this._noFilmView = new NoFilmView();
    this._loadingView = new LoadingView();

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._showMoreFilmsHandler = this._showMoreFilmsHandler.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    this._filmsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
  }

  init() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }

    const films = this._getFilms();

    if (!films.length) {
      this._renderNoFilms();
      return;
    }

    if (this._filterModel.filter === FilterType.STATISTICS) {
      this._renderStats(films);
      return;
    }

    this._renderSorting();
    this._renderFilmsContainer();
    this._filmList = this._mainContainer.querySelector(`.films-list`);
    this._filmsContainer = this._filmList.querySelector(`.films-list__container`);
    this._filmListExtra = this._mainContainer.querySelectorAll(`.films-list.films-list--extra`);
    this._renderFilmsList();

    if (this._getFilms().length > this._renderedFilmCount) {
      this._renderLoadMoreButton();
    }

    this._renderTopRatedFilms();
    this._renderMostCommentedFilms();
  }

  _getFilms() {
    let filterType = this._filterModel.filter;

    if (filterType === FilterType.STATISTICS) {
      filterType = FilterType.ALL;
    }

    const films = this._filmsModel.films;
    const filteredTasks = filter[filterType](films);

    switch (this._currentSortType) {
      case SortType.BY_DATE:
        return filteredTasks.sort(sortFilmByDate);
      case SortType.BY_RATING:
        return filteredTasks.sort(sortFilmByRating);
    }

    return filteredTasks;
  }

  _setTypesForFilmPresenterCollection() {
    const filmCategoryKeys = Object.keys(FilmCategory);

    filmCategoryKeys.forEach((category) => {
      this._filmPresenter.set(FilmCategory[category], {});
    });
  }

  _renderStats(films) {
    this._statisticsView = new StatisticsView(films);

    render(this._mainContainer, this._statisticsView.element, RenderPosition.BEFORE_END);
  }

  _renderSorting() {
    if (this._sortingView !== null) {
      this._sortingView = null;
    }

    this._sortingView = new SortingView(this._currentSortType);
    this._sortingView.setSortTypeChangeHandler(this._handleSortTypeChange);

    render(this._mainContainer, this._sortingView.element, RenderPosition.BEFORE_END);
  }

  _renderFilmsContainer() {
    render(this._mainContainer, this._filmsContainerView.element, RenderPosition.BEFORE_END);
  }

  _renderNoFilms() {
    render(this._mainContainer, this._noFilmView.element, RenderPosition.BEFORE_END);
  }

  _renderLoading() {
    render(this._mainContainer, this._loadingView, RenderPosition.BEFORE_END);
  }

  _renderFilmsList(container = this._filmsContainer, filmsList = this._getFilms(), limit = MOVIES_PER_STEP, type = FilmCategory.COMMON) {
    for (let i = 0; i < Math.min(filmsList.length, limit); i++) {
      this._renderFilm(container, filmsList[i], type);
    }
  }

  _renderFilm(container, film, type) {
    const filmPresenter = new FilmPresenter(container, this._bodyContainer, this._handleViewAction);
    filmPresenter.init(film);
    this._filmPresenter.get(type)[film.id] = filmPresenter;
  }

  _renderTopRatedFilms() {
    const container = this._filmListExtra[0].querySelector(`.films-list__container`);
    const films = [...this._getFilms()];

    films.sort((a, b) => b.rating - a.rating);

    this._renderFilmsList(container, films, MAX_ADDITIONAL_FILMS, FilmCategory.TOP_RATED);
  }

  _renderMostCommentedFilms() {
    const container = this._filmListExtra[1].querySelector(`.films-list__container`);
    const films = [...this._getFilms()];

    films.sort((a, b) => b.comments.length - a.comments.length);

    this._renderFilmsList(container, films, MAX_ADDITIONAL_FILMS, FilmCategory.MOST_COMMENTED);
  }

  _renderLoadMoreButton() {
    if (this._loadMoreButtonView !== null) {
      this._loadMoreButtonView = null;
    }

    this._loadMoreButtonView = new LoadMoreButtonView();
    this._loadMoreButtonView.setLoadMoreHandler(this._showMoreFilmsHandler);

    render(this._filmList, this._loadMoreButtonView.element, RenderPosition.BEFORE_END);
  }


  _clearFilmList({resetRenderedTaskCount = false, resetSortType = false} = {}) {
    const filmCount = this._getFilms().length;

    this._filmPresenter.forEach((value) => {
      Object
        .values(value)
        .forEach((presenter) => presenter.destroy());
    });

    this._filmPresenter = new Map();
    this._setTypesForFilmPresenterCollection();

    remove(this._sortingView);
    remove(this._noFilmView);
    remove(this._loadingView);
    remove(this._loadMoreButtonView);
    remove(this._statisticsView);
    remove(this._filmsContainerView);

    if (resetRenderedTaskCount) {
      this._renderedFilmCount = MOVIES_PER_STEP;
    } else {
      this._renderedFilmCount = Math.min(filmCount, this._renderedFilmCount);
    }

    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.CHANGE_STATUS:
        this._api.updateFilms(update).then((response) => {
          this._filmsModel.updateFilm(updateType, response);
        });
        break;
      case UserAction.ADD_COMMENT:
        this._filmsModel.addComment(updateType, update);
        break;
      case UserAction.DELETE_COMMENT:
        this._filmsModel.deleteComment(updateType, update);
        break;
    }
  }

  _handleModelEvent(updateType, data) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._filmPresenter.forEach((value) => {
          Object
            .values(value)
            .forEach((presenter) => {
              if (presenter._film.id === data.id) {
                presenter.init(presenter._film);
              }
            });
        });
        break;
      case UpdateType.MINOR:
        this._filmPresenter.forEach((value) => {
          Object
            .values(value)
            .forEach((presenter) => {
              if (presenter._film.id === data.id) {
                presenter.init(data);
              }
            });
        });
        break;
      case UpdateType.MAJOR:
        this._clearFilmList({resetRenderedTaskCount: true, resetSortType: true});
        this.init();
        break;
      case UpdateType.INIT:
        this._isLoading = false;
        remove(this._loadingView);
        this.init();
        break;
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;
    this._clearFilmList({resetRenderedTaskCount: true});
    this.init();
  }

  _showMoreFilms() {
    this._getFilms()
      .slice(this._renderedFilmCount, this._renderedFilmCount + MOVIES_PER_STEP)
      .forEach((film) => {
        this._renderFilm(this._filmsContainer, film, FilmCategory.COMMON);
      });

    this._renderedFilmCount += MOVIES_PER_STEP;

    if (this._renderedFilmCount >= this._getFilms().length) {
      this._loadMoreButtonView.removeLoadMoreHandler(this._showMoreFilmsHandler);
      remove(this._loadMoreButtonView);
    }
  }

  _showMoreFilmsHandler() {
    this._showMoreFilms();
  }
}
