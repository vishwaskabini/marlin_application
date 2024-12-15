import React, { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
// import ReCAPTCHA from 'react-google-recaptcha';
import './UserProfileScreen.css';

const UserProfileScreen = () => {
    const [otpNumberVisible, setOtpNumberVisible] = useState(false);
    const [otpEmailVisible, setOtpEmailVisible] = useState(false);
    const captchaRef = useRef();

    const initialValues = {
        name: '',
        address: '',
        number: '',
        email: '',
        otpForNumber: '',
        otpForEmail: '',
        captcha: '',
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        address: Yup.string().required('Address is required'),
        number: Yup.string()
            .matches(/^\d{10}$/, 'Please enter a valid 10-digit number')
            .required('Contact Number is required'),
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        otpForNumber: otpNumberVisible ? Yup.string().required('OTP for number is required') : Yup.string(),
        otpForEmail: otpEmailVisible ? Yup.string().required('OTP for email is required') : Yup.string(),
        captcha: Yup.string().required('Captcha is required'),
    });

    const sendOtp = (type, values) => {
        if (type === 'number' && /^\d{10}$/.test(values.number)) {
            setOtpNumberVisible(true);
            alert('Sending OTP to number');
        } else if (type === 'email' && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) {
            setOtpEmailVisible(true);
            alert('Sending OTP to email');
        }
    };

    const handleSubmit = (values) => {
        console.log('Form submitted with values:', values);
        alert('Profile updated successfully!');
    };

    const cancelUpdate = () => {
        alert('Update cancelled');
        if (captchaRef.current) {
            captchaRef.current.reset();
        }
        setOtpNumberVisible(false);
        setOtpEmailVisible(false);
    };

    return (
        <div className="user-profile-container">
            <h2 className="profile-title">User Profile Screen</h2>

            {/* <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched }) => (
                    <Form className="profile-form">
                        <div className="form-field">
                            <label htmlFor="name" className="form-label">Name</label>
                            <Field name="name" as={InputText} className="form-input" />
                            <ErrorMessage name="name" component="small" className="error-message" />
                        </div>

                        <div className="form-field">
                            <label htmlFor="address" className="form-label">Address</label>
                            <Field name="address" as="textarea" className="form-input" rows="4" />
                            <ErrorMessage name="address" component="small" className="error-message" />
                        </div>

                        <div className="form-field">
                            <label htmlFor="number" className="form-label">Contact Number</label>
                            <div className="input-group">
                                <Field name="number" as={InputText} className="form-input" />
                                {touched.number && !errors.number && (
                                    <Button label="Send OTP" onClick={() => sendOtp('number', values)} type="button" className="otp-button" />
                                )}
                            </div>
                            <ErrorMessage name="number" component="small" className="error-message" />
                        </div>

                        {otpNumberVisible && (
                            <div className="form-field">
                                <label htmlFor="otpForNumber" className="form-label">Enter OTP for Contact Number</label>
                                <Field name="otpForNumber" as={InputText} className="form-input" />
                                <ErrorMessage name="otpForNumber" component="small" className="error-message" />
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="email" className="form-label">Email</label>
                            <div className="input-group">
                                <Field name="email" as={InputText} className="form-input" />
                                {touched.email && !errors.email && (
                                    <Button label="Send OTP" onClick={() => sendOtp('email', values)} type="button" className="otp-button" />
                                )}
                            </div>
                            <ErrorMessage name="email" component="small" className="error-message" />
                        </div>

                        {otpEmailVisible && (
                            <div className="form-field">
                                <label htmlFor="otpForEmail" className="form-label">Enter OTP for Email</label>
                                <Field name="otpForEmail" as={InputText} className="form-input" />
                                <ErrorMessage name="otpForEmail" component="small" className="error-message" />
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="captcha" className="form-label">Enter Captcha</label>
                            <Field name="captcha" as={InputText} className="form-input" />
                            <ErrorMessage name="captcha" component="small" className="error-message" />
                        </div>

                        <div className="button-group">
                            <Button type="submit" label="Update" className="update-button" />
                            <Button label="Cancel" className="cancel-button" onClick={cancelUpdate} />
                        </div>
                    </Form>
                )}
            </Formik> */}
        </div>
    );
};

export default UserProfileScreen;