import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profile';

const Profile = () => <div>Profile</div>;
Profile.propTypes = {};

const mapStateToProps = state => ({
    profile: state.profile,
});

export default connect(
    mapStateToProps,
    getCurrentProfile
)(Profile);
