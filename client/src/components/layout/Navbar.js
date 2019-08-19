/* eslint-disable no-console */
/* eslint-disable no-shadow */
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/auth';

const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
    // console.log('auth', auth);
    // console.log('logout', logout);

    const guestLink = (
        <ul>
            <li>
                <Link to="/profiles">Developers</Link>
            </li>
            <li>
                <Link to="/register">Register</Link>
            </li>
            <li>
                <Link to="/login">Login</Link>
            </li>
        </ul>
    );

    const authLink = (
        <ul>
            <li>
                <a onClick={logout} href="#!">
                    <i className="fas fa-sign-out-alt"></i> <span className="hide-sm">Logout</span>
                </a>
            </li>
        </ul>
    );
    return (
        <nav className="navbar bg-dark">
            <h1>
                <Link to="/">
                    <i className="fas fa-code"></i>DevConnector
                </Link>
            </h1>
            <Fragment>{!loading && isAuthenticated ? authLink : guestLink}</Fragment>
        </nav>
    );
};

Navbar.propTypes = {
    auth: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    auth: state.auth,
});

export default connect(
    mapStateToProps,
    { logout }
)(Navbar);
