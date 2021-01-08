import Observer from "../utils/observer.js";

export default class Films extends Observer {
  constructor() {
    super();
    this._films = [];
  }

  setFilms(updateType, films) {
    this._films = films.slice();

    this._notify(updateType);
  }

  get films() {
    return this._films;
  }

  updateFilm(updateType, update) {
    const index = this._films.findIndex((film) => film.id === update.id);

    if (index === -1) {
      throw new Error(`Can't update unexisting task`);
    }

    this._films = [
      ...this._films.slice(0, index),
      update,
      ...this._films.slice(index + 1)
    ];

    this._notify(updateType, update);
  }

  addComment(updateType, update) {
    const film = this._films.find((item) => item.id === update.id);
    film.comments.push(update.comment);

    this._notify(updateType, update);
  }

  deleteComment(updateType, update) {
    const film = this._films.find((item) => item.id === update.id);
    film.comments = [
      ...film.comments.slice(0, update.index),
      ...film.comments.slice(update.index + 1)
    ];

    this._notify(updateType, update);
  }

  static adaptCommentToClient(comment) {
    const adaptedComment = Object.assign({}, comment, {
      text: comment.comment,
      emotion: comment.emotion,
      author: comment.author,
      date: new Date(comment.date)
    });

    delete adaptedComment.comment;

    return adaptedComment;
  }

  static adaptCommentToServer(comment) {
    const adaptedComment = Object.assign({}, comment, {
      "comment": comment.text,
      "date": comment.date.toISOString(),
      "emotion": comment.emotion
    });

    return adaptedComment;
  }

  static adaptFilmToClient(film) {
    const adaptedFilm = Object.assign({}, film, {
      id: film.id,
      name: film.film_info.title,
      poster: film.film_info.poster,
      description: film.film_info.description,
      comments: film.comments,
      rating: film.film_info.total_rating,
      releaseDate: new Date(film.film_info.release.date),
      runtime: film.film_info.runtime,
      genres: film.film_info.genre,
      director: film.film_info.director,
      writers: film.film_info.writers,
      actors: film.film_info.actors,
      country: film.film_info.release.release_country,
      age: film.film_info.age_rating,
      watched: film.user_details.already_watched,
      watchlist: film.user_details.watchlist,
      favorite: film.user_details.favorite,
      watchingDate: film.user_details.watching_date
    });

    return adaptedFilm;
  }

  static adaptFilmToServer(film) {
    const adaptedTask = Object.assign({}, film, {
      "user_details": {
        "already_watched": film.watched,
        "watchlist": film.watchlist,
        "favorite": film.favorite,
        "watching_date": film.watchingDate
      },
    });

    delete adaptedTask.actors;
    delete adaptedTask.age;
    delete adaptedTask.country;
    delete adaptedTask.description;
    delete adaptedTask.director;
    delete adaptedTask.favorite;
    delete adaptedTask.genres;
    delete adaptedTask.name;
    delete adaptedTask.poster;
    delete adaptedTask.rating;
    delete adaptedTask.releaseDate;
    delete adaptedTask.runtime;
    delete adaptedTask.watched;
    delete adaptedTask.watchlist;
    delete adaptedTask.writers;
    delete adaptedTask.watchingDate;

    return adaptedTask;
  }
}
