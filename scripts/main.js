;(function(){
    'use strict';
    var React = require('react');
    //var client = require('./client');
    var ReactDOM = require('react-dom');

    var ReactRouter = require('react-router');
    var Router  = ReactRouter.Router;
    var Route = ReactRouter.Route;
    var History = ReactRouter.History;
    var createBrowserHistory = require('history/lib/createBrowserHistory');
    var $ = require('jquery');


    /*
     Books Form
     This will let us make <Book/>
     */
    var BookForm = React.createClass({
        mixins: [History],
        getInitialState: function() {
            return {
                editingBook: {
                    name:"",
                    author:"",
                    isbn:"",
                    price:"",
                    id:""
                },
                message:''
            };
        },
        handleReset: function(e) {
            e.preventDefault();
            this.setState({
                editingBook: {}
            });
        },
        onChange: function() {
            var book = this.refs;
            this.setState({
                editingBook: {
                    name: ReactDOM.findDOMNode(book.name).value,
                    author: ReactDOM.findDOMNode(book.author).value,
                    isbn: ReactDOM.findDOMNode(book.isbn).value,
                    price: ReactDOM.findDOMNode(book.price).value
                }
            });
        },
        handleSubmitClick: function(e){
            e.preventDefault();
            if(this.props.routeParams.id) {
                $.ajax({
                    url: 'http://localhost:3000/books/'+ this.props.routeParams.id,
                    method: 'PUT',
                    data: this.state.editingBook
                }).then(function(data) {
                    this.setState({
                        message: "Book updated successfully!"
                    });
                    this.history.pushState(null, '/App');
                }.bind(this));
            } else {
                $.ajax({
                    url: 'http://localhost:3000/books',
                    method: 'POST',
                    data: this.state.editingBook
                }).then(function(data) {
                    this.setState({
                        message: "Book added successfully!"
                    });
                    this.history.pushState(null, '/App');
                }.bind(this));
            }
            this.setState({
                editingBook: {}
            });

        },
        componentDidMount: function() {
            if (this.props.routeParams.id){
                $.ajax({
                    url: 'http://localhost:3000/books/'+ this.props.routeParams.id,
                    method: 'GET'
                }).done(function(data) {
                    this.setState({
                        editingBook: {
                            name:data.name,
                            author:data.author,
                            isbn:data.isbn,
                            price:data.price,
                            id: data.id
                        }
                    });
                    this.setValue();
                }.bind(this));

            }
        },
        setValue: function(){
            var bookRef = this.refs,
                editingBook = this.state.editingBook;
            ReactDOM.findDOMNode(bookRef.name).value = editingBook.name;
            ReactDOM.findDOMNode(bookRef.author).value = editingBook.author;
            ReactDOM.findDOMNode(bookRef.isbn).value = editingBook.isbn;
            ReactDOM.findDOMNode(bookRef.price).value = editingBook.price;
        },
        render: function() {
            //var book = this.state.editingBook;
            return(
                <div>
                    <div className="header">
                        <h1> {!this.props.routeParams.id? 'New Book': 'Edit Book' } </h1>
                    </div>
                    <div className="body">
                        <form onSubmit={this.handleSubmitClick}>
                            <div className="container">
                                <div className="pull-left label-container">
                                    <label>Name:</label><br/>
                                    <label>Author:</label><br/>
                                    <label>ISBN:</label><br/>
                                    <label>Price:</label><br/>
                                </div>
                                <div className="pull-right input-field-container">
                                    <input type="text" ref="name" placeholder="Name" onChange={this.onChange}/><br/>
                                    <input type="text" ref="author" placeholder="Author" onChange={this.onChange} /><br/>
                                    <input type="text" ref="isbn" placeholder="ISBN" onChange={this.onChange} /><br/>
                                    <input type="text" ref="price" placeholder="Price" onChange={this.onChange} /><br/>
                                    <input type='submit' value={!this.props.routeParams.id? 'Add': 'Save' } />
                                </div>
                            </div>

                        </form>
                    </div>

                </div>
            );
        }
    });

    var BookTableBody = React.createClass({
        mixins : [History],
        deleteClick: function(){
            this.props.handleDeleteClick(this.props.book.id);
        },
        onClick: function(event) {
            event.preventDefault();
            // get the data from the input
            localStorage.setItem(this.props.book.id, JSON.stringify(this.props.book));
            this.history.pushState(null, '/App/edit/' + this.props.book.id);
        },
        render: function() {
            var book = this.props.book;
            return (
                <tr>
                    <td>{book.name}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.price}</td>
                    <td>
                        <button onClick={this.onClick}>Edit</button>&nbsp;
                        <button onClick={this.deleteClick}>Delete</button>
                    </td>
                </tr>
            );
        }
    });

    var BookTable = React.createClass({
        renderBook: function(key){
            return <BookTableBody key={key} book={this.props.books[key]} handleEditClickPanel={this.props.handleEditClickPanel} handleDeleteClick = {this.props.handleDeleteClick} />
        },
        render: function() {
            var Books = Object.keys(this.props.books);
            return (
                <div>
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Author</th>
                            <th>Isbn</th>
                            <th>Price</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>{Books.map(this.renderBook)}</tbody>
                    </table>
                </div>
            );
        }
    });

    var App = React.createClass({
        mixins : [History],
        getInitialState: function() {
            return {
                books: [],
                message:''
            };
        },
        render: function() {
            return(
                <div className="books">
                    <div className="header">
                        <h1>
                            BOOKS
                            <span className="pull-right"><button onClick={this.goToNew}>New Book</button></span>
                        </h1>
                    </div>
                    <div className="body">
                        <div className="dashboard">
                            <BookTable
                                books={this.state.books}
                                handleDeleteClick = {this.handleDeleteClick}
                            />
                        </div>

                    </div>
                </div>

            );
        },
        goToNew: function(event) {
            event.preventDefault();
            // get the data from the input
            this.history.pushState(null, '/App/new');
        },
        componentDidMount: function() {
            this.reloadBooks('');
        },
        reloadBooks: function(query) {
            $.ajax({
                url: 'http://localhost:3000/books' + query
            }).then(function(data) {
                this.setState({
                    books: data
                });
            }.bind(this))
        },
        handleDeleteClick: function(id) {
            $.ajax({
                url: 'http://localhost:3000/books/'+ id,
                method: 'DELETE'
            }).then(function(data) {

                this.setState({
                    message: "Book Deleted successfully!",
                    editingBook: {}
                });
                this.reloadBooks('');
            }.bind(this));
        }
    });

    //Not Found

    var NotFound = React.createClass({
        render : function() {
            return <h1>Not Found!</h1>
        }
    });


    var Login = React.createClass({
        mixins : [History],
        goToApp: function(event) {
            event.preventDefault();
            // get the data from the input
            this.history.pushState(null, '/App');
        },
        render : function() {
            return (
                <div className ="login-form">
                    <form className="login" onSubmit={this.goToApp}>
                        <h2>Log In</h2>
                        <input type="text" ref="logIn" required placeholder="Email"/><br/>
                        <button type="Submit">Login </button>
                    </form>
                </div>
            )
        }

    });
//
    /*
     Routes
     */
    var routes = (
        <Router history={createBrowserHistory()}>
            <Route path="/" component={Login}/>
            <Route path="/App/new" component={BookForm}/>
            <Route path="/App/edit/:id" component={BookForm}/>
            <Route path="/App" component={App}>

            </Route>
            <Route path="*" component={NotFound}/>
        </Router>

    );

    ReactDOM.render(routes, document.querySelector('#main'));
})();
