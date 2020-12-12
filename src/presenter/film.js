import FilmView from "../view/film.js";
import PopupView from "../view/popup.js";
import {render, remove, replace} from "../utils/render.js";
import {RenderPosition} from "../const.js";

export default class Film {
  constructor(filmContainer, bodyContainer, updateData) {
    this._filmContainer = filmContainer;
    this._bodyContainer = bodyContainer;
    this._updateData = updateData;

    this._filmView = null;
    this._popupView = null;

    this._onDetailFilmShow = this._onDetailFilmShow.bind(this);
    this._onPopupClose = this._onPopupClose.bind(this);
    this._handleWatchedClick = this._handleWatchedClick.bind(this);
    this._handleWatchlistClick = this._handleWatchlistClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
  }

  init(film) {
    this._film = film;

    const prevFilmView = this._filmView;
    const prevPopupView = this._popupView;

    this._filmView = new FilmView(film);
    this._popupView = new PopupView(film);

    this._filmView.setFilmHandler(this._onDetailFilmShow);
    this._filmView.setWatchedClickHandler(this._handleWatchedClick);
    this._filmView.setWatchlistClickHandler(this._handleWatchlistClick);
    this._filmView.setFavoriteClickHandler(this._handleFavoriteClick);
    this._popupView.setWatchedClickHandler(this._handleWatchedClick);
    this._popupView.setWatchlistClickHandler(this._handleWatchlistClick);
    this._popupView.setFavoriteClickHandler(this._handleFavoriteClick);

    if (prevFilmView === null || prevPopupView === null) {
      render(this._filmContainer, this._filmView, RenderPosition.BEFORE_END);
      return;
    }

    if (this._filmContainer.contains(prevFilmView.element)) {
      replace(this._filmView, prevFilmView);
    }

    if (this._bodyContainer.contains(prevPopupView.element)) {
      replace(this._popupView, prevPopupView);
      this._popupView.setPopupHandler(this._onPopupClose);
    }

    remove(prevFilmView);
    remove(prevPopupView);
  }

  _destroy() {
    remove(this._filmView);
    remove(this._popupView);
  }

  _handleWatchedClick() {
    this._updateData(Object.assign({}, this._film, {
      watched: !this._film.watched
    }));
  }

  _handleWatchlistClick() {
    this._updateData(Object.assign({}, this._film, {
      watchlist: !this._film.watchlist
    }));
  }

  _handleFavoriteClick() {
    this._updateData(Object.assign({}, this._film, {
      favorite: !this._film.favorite
    }));
  }

  _popupClose() {
    const filmDetails = this._bodyContainer.querySelector(`.film-details`);

    if (!filmDetails) {
      return;
    }

    this._popupView.removePopupHandler(this._onPopupClose);
    this._popupView.removeWatchedClickHandler(this._handleWatchedClick);
    this._popupView.removeWatchlistClickHandler(this._handleWatchlistClick);
    this._popupView.removeFavoriteClickHandler(this._handleFavoriteClick);
    this._bodyContainer.removeChild(filmDetails);
    this._bodyContainer.classList.remove(`hide-overflow`);
    this._popupView.removeElement();
  }

  _onPopupClose() {
    this._popupClose();
  }

  _showDetailFilm() {
    this._popupClose();

    render(this._bodyContainer, this._popupView.element, RenderPosition.BEFORE_END);
    this._popupView.setPopupHandler(this._onPopupClose);
    this._bodyContainer.classList.add(`hide-overflow`);
  }

  _onDetailFilmShow(evt) {
    this._showDetailFilm(evt);
  }
}
