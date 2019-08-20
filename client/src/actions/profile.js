import axios from 'axios';
import { GET_PROFILE, GET_PROFILES, PROFILE_ERROR } from './types';
import { setAlert } from './alert';

// Get current user‘s profile
export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile/me');

        dispatch({
            type: GET_PROFILE,
            payload: res.data,
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
        });
    }
};

// Get all profiles
export const getProfiles = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile');

        dispatch({
            type: GET_PROFILES,
            payload: res.data,
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
        });
    }
};

// Create or Update user's profile
export const createProfile = (formData, history, edit = false) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const res = await axios.post('/api/profile', formData, config);

        dispatch({
            type: GET_PROFILES,
            payload: res.data,
        });

        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

        // if not edit, redirect to dashboard page
        if (!edit) {
            history.push('/dashboard');
        }
    } catch (err) {
        const { errors } = err.response.data;

        if (errors) {
            errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status },
        });
    }
};
